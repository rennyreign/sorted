-- Create examples table for the public marketing grid
-- Populated from mockups and live sites. Readable anonymously.

create table if not exists examples (
  id uuid primary key default gen_random_uuid(),
  prospect_id bigint references prospects(id) on delete set null,
  storage_path text,
  business_name text not null,
  image_url text not null,
  type text not null check (type in ('mockup', 'live')),
  live_url text,
  category text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Prevent duplicate mockups per prospect or storage path
alter table examples add constraint examples_prospect_id_unique unique (prospect_id);
alter table examples add constraint examples_storage_path_unique unique (storage_path);

-- Useful for ordering and category filters
create index if not exists examples_type_created_idx on examples(type, created_at desc);
create index if not exists examples_created_at_idx on examples(created_at desc);

-- Enable RLS
alter table examples enable row level security;

-- Public read access for the marketing site
CREATE POLICY "Allow public read" on examples
  for select to anon, authenticated using (true);

-- Service/operator writes (service role bypasses RLS, but keep for authenticated users)
CREATE POLICY "Allow authenticated writes" on examples
  for all to authenticated using (true) with check (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_examples_updated_at
  before update on examples
  for each row execute function update_updated_at_column();
