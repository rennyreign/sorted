-- Private media and named editor credentials. Reviewer codes never grant editing.
create table public.ad_review_editors (
  token_hash text primary key,
  tenant_slug text not null references public.ad_review_tenants(slug),
  name text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create table public.ad_review_assets (
  tenant_slug text not null references public.ad_review_tenants(slug),
  creative_key text not null,
  name text not null,
  collection text not null default '',
  kind text not null default 'photo' check (kind in ('photo','artwork')),
  width integer not null default 0,
  height integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (tenant_slug, creative_key)
);
create table public.ad_review_image_locks (
  tenant_slug text not null references public.ad_review_tenants(slug),
  campaign_id text not null,
  ad_id text not null,
  selection jsonb not null,
  editor text not null,
  primary key (tenant_slug, campaign_id, ad_id)
);
alter table public.ad_review_editors enable row level security;
alter table public.ad_review_assets enable row level security;
alter table public.ad_review_image_locks enable row level security;
revoke all on public.ad_review_editors, public.ad_review_assets, public.ad_review_image_locks from anon, authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('ad-review-media','ad-review-media',false,8388608,array['image/webp'])
on conflict(id) do nothing;

-- Existing published creative references become this tenant's initial library.
insert into public.ad_review_assets(tenant_slug,creative_key,name,collection)
select distinct on (c.tenant_slug,a->>'creative_key') c.tenant_slug,a->>'creative_key',
  a->>'creative_alt',c.name
from public.ad_review_campaigns c,
  lateral jsonb_array_elements(c.package->'campaign'->'concepts') co,
  lateral jsonb_array_elements(co->'ads') a
order by c.tenant_slug,a->>'creative_key',c.revision desc
on conflict do nothing;

-- A single transaction serializes editors, agents and reviewer decisions.
create function public.ad_review_write_revision(
  p_tenant text, p_package jsonb, p_base_revision integer, p_actor text,
  p_mode text, p_target text default null, p_protect boolean default true,
  p_idempotency_key text default null, p_hash text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  campaign jsonb := p_package->'campaign';
  previous public.ad_review_campaigns;
  receipt public.ad_review_ingestions;
  protected public.ad_review_image_locks;
  candidate jsonb;
  selection jsonb;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_tenant || '/' || (campaign->>'id'),0));
  if p_mode not in ('agent','edit','unlock') then raise exception 'Invalid write mode'; end if;
  if p_mode = 'agent' then
    -- Serialize reuse of ingestion keys across campaigns too.
    perform pg_advisory_xact_lock(hashtextextended(p_tenant || '/ingest/' || p_idempotency_key,0));
    select * into receipt from ad_review_ingestions where tenant_slug=p_tenant and idempotency_key=p_idempotency_key;
    if found then
      if receipt.payload_hash <> p_hash then return jsonb_build_object('error','Submission key already used.','status',409); end if;
      return jsonb_build_object('ok',true,'idempotent',true,'revision',receipt.campaign_revision);
    end if;
  end if;
  select * into previous from ad_review_campaigns where tenant_slug=p_tenant and campaign_id=campaign->>'id' order by revision desc limit 1;
  if coalesce(previous.revision,0) <> p_base_revision or (campaign->>'revision')::integer <> p_base_revision+1 then
    return jsonb_build_object('error','This campaign has changed. Refresh and review the latest version before saving.','status',409);
  end if;
  for protected in select * from ad_review_image_locks where tenant_slug=p_tenant and campaign_id=campaign->>'id' loop
    select a into candidate from jsonb_array_elements(campaign->'concepts') co, lateral jsonb_array_elements(co->'ads') a where a->>'id'=protected.ad_id;
    selection := jsonb_build_object('creative_key',candidate->'creative_key','crop',coalesce(candidate->'crop','{"x":50,"y":50}'::jsonb),'ratio',candidate->'ratio');
    if (p_mode='agent' or protected.ad_id is distinct from p_target) and (candidate is null or selection <> protected.selection) then
      return jsonb_build_object('error','A manually selected image is protected: ' || protected.ad_id || '. Keep its image, crop and ratio, or ask an editor to release it.','status',409);
    end if;
  end loop;
  insert into ad_review_campaigns(tenant_slug,campaign_id,revision,name,objective,platform,status,package,provenance)
  values(p_tenant,campaign->>'id',(campaign->>'revision')::integer,campaign->>'name',campaign->>'objective',campaign->>'platform',campaign->>'status',p_package,
    jsonb_build_object('actor',p_actor,'mode',p_mode,'target',p_target));
  if p_mode='agent' then
    insert into ad_review_ingestions(tenant_slug,idempotency_key,payload_hash,campaign_id,campaign_revision)
    values(p_tenant,p_idempotency_key,p_hash,campaign->>'id',(campaign->>'revision')::integer);
  else
    if p_mode='unlock' then
      delete from ad_review_image_locks where tenant_slug=p_tenant and campaign_id=campaign->>'id' and ad_id=p_target;
    else
      select a into candidate from jsonb_array_elements(campaign->'concepts') co, lateral jsonb_array_elements(co->'ads') a where a->>'id'=p_target;
      if candidate is null then raise exception 'Ad not found'; end if;
      insert into ad_review_image_locks(tenant_slug,campaign_id,ad_id,selection,editor)
      values(p_tenant,campaign->>'id',p_target,jsonb_build_object('creative_key',candidate->'creative_key','crop',coalesce(candidate->'crop','{"x":50,"y":50}'::jsonb),'ratio',candidate->'ratio'),p_actor)
      on conflict(tenant_slug,campaign_id,ad_id) do update set selection=excluded.selection,editor=excluded.editor;
    end if;
  end if;
  return jsonb_build_object('ok',true,'revision',(campaign->>'revision')::integer);
end $$;
revoke all on function public.ad_review_write_revision(text,jsonb,integer,text,text,text,boolean,text,text) from public,anon,authenticated;
grant execute on function public.ad_review_write_revision(text,jsonb,integer,text,text,text,boolean,text,text) to service_role;

create function public.ad_review_save_decision(p_tenant text,p_decision jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare current_campaign jsonb; target jsonb; saved ad_review_decisions;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_tenant || '/' || (p_decision->>'campaign_id'),0));
  select package->'campaign' into current_campaign from ad_review_campaigns
    where tenant_slug=p_tenant and campaign_id=p_decision->>'campaign_id' order by revision desc limit 1;
  if (current_campaign->>'revision')::integer is distinct from (p_decision->>'campaign_revision')::integer then
    return jsonb_build_object('error','This campaign has changed. Refresh before reviewing it.','status',409);
  end if;
  if p_decision->>'target_type'='concept' then
    select co into target from jsonb_array_elements(current_campaign->'concepts') co where co->>'id'=p_decision->>'target_id';
  else
    select a into target from jsonb_array_elements(current_campaign->'concepts') co,lateral jsonb_array_elements(co->'ads') a where a->>'id'=p_decision->>'target_id';
  end if;
  if target is null or target->>'fingerprint' is distinct from p_decision->>'fingerprint' then
    return jsonb_build_object('error','This ad has changed. Refresh before reviewing it.','status',409);
  end if;
  insert into ad_review_decisions(tenant_slug,campaign_id,campaign_revision,target_type,target_id,fingerprint,status,comment,reviewer)
  values(p_tenant,p_decision->>'campaign_id',(p_decision->>'campaign_revision')::integer,p_decision->>'target_type',p_decision->>'target_id',p_decision->>'fingerprint',p_decision->>'status',p_decision->>'comment',p_decision->>'reviewer') returning * into saved;
  return jsonb_build_object('decision',to_jsonb(saved));
end $$;
revoke all on function public.ad_review_save_decision(text,jsonb) from public,anon,authenticated;
grant execute on function public.ad_review_save_decision(text,jsonb) to service_role;
