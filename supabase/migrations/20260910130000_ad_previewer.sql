create table if not exists public.ad_review_tenants (
  slug text primary key check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  allowed_origin text not null,
  allowed_destination_hosts text[] not null default '{}',
  access_token_hash text not null,
  access_expires_at timestamptz,
  access_revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_review_agent_keys (
  token_hash text primary key,
  tenant_slug text not null references public.ad_review_tenants(slug) on delete cascade,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_review_campaigns (
  tenant_slug text not null references public.ad_review_tenants(slug) on delete cascade,
  campaign_id text not null,
  revision integer not null check (revision > 0),
  name text not null,
  objective text not null,
  platform text not null,
  status text not null check (status in ('draft','awaiting_review','in_review','approved','changes_requested','rejected','archived')),
  package jsonb not null,
  provenance jsonb not null default '{}',
  created_at timestamptz not null default now(),
  primary key (tenant_slug, campaign_id, revision)
);

create table if not exists public.ad_review_ingestions (
  tenant_slug text not null references public.ad_review_tenants(slug) on delete cascade,
  idempotency_key text not null,
  payload_hash text not null,
  campaign_id text not null,
  campaign_revision integer not null,
  created_at timestamptz not null default now(),
  primary key (tenant_slug, idempotency_key),
  foreign key (tenant_slug, campaign_id, campaign_revision) references public.ad_review_campaigns(tenant_slug, campaign_id, revision)
);

create table if not exists public.ad_review_decisions (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.ad_review_tenants(slug) on delete cascade,
  campaign_id text not null,
  campaign_revision integer not null,
  target_type text not null check (target_type in ('concept','ad')),
  target_id text not null,
  fingerprint text not null,
  status text not null check (status in ('approved','changes_requested','rejected')),
  comment text not null default '',
  reviewer text not null,
  created_at timestamptz not null default now(),
  foreign key (tenant_slug, campaign_id, campaign_revision) references public.ad_review_campaigns(tenant_slug, campaign_id, revision)
);

create index if not exists ad_review_decisions_lookup on public.ad_review_decisions(tenant_slug, campaign_id, target_id, created_at desc);

create table if not exists public.ad_review_access_audit (
  id bigint generated always as identity primary key,
  tenant_slug text not null references public.ad_review_tenants(slug) on delete cascade,
  ip_hash text not null,
  success boolean not null,
  user_agent text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists ad_review_access_rate_limit on public.ad_review_access_audit(tenant_slug, ip_hash, success, created_at desc);

alter table public.ad_review_tenants enable row level security;
alter table public.ad_review_agent_keys enable row level security;
alter table public.ad_review_campaigns enable row level security;
alter table public.ad_review_ingestions enable row level security;
alter table public.ad_review_decisions enable row level security;
alter table public.ad_review_access_audit enable row level security;

revoke all on public.ad_review_tenants, public.ad_review_agent_keys, public.ad_review_campaigns, public.ad_review_ingestions, public.ad_review_decisions, public.ad_review_access_audit from anon, authenticated;
