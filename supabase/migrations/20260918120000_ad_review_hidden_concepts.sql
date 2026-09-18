-- Non-destructive concept visibility. Hidden concepts stay in the package but
-- are excluded from client-facing review surfaces; survives agent re-ingests.
create table public.ad_review_hidden_concepts (
  tenant_slug text not null references public.ad_review_tenants(slug),
  campaign_id text not null,
  concept_id text not null,
  hidden_by text not null,
  created_at timestamptz not null default now(),
  primary key (tenant_slug, campaign_id, concept_id)
);
alter table public.ad_review_hidden_concepts enable row level security;
revoke all on public.ad_review_hidden_concepts from anon, authenticated;
