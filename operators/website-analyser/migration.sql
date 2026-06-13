-- Website Analyser — Supabase Migration
-- Run this once in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qweevancxedkkfxysnzq/sql/new

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS site_score          numeric(4,1),
  ADD COLUMN IF NOT EXISTS business_quality_score integer,
  ADD COLUMN IF NOT EXISTS opportunity_score   integer,
  ADD COLUMN IF NOT EXISTS site_analysis       text,
  ADD COLUMN IF NOT EXISTS site_weaknesses     jsonb,
  ADD COLUMN IF NOT EXISTS outreach_angle      text,
  ADD COLUMN IF NOT EXISTS recommendation      text,
  ADD COLUMN IF NOT EXISTS revshare_potential  text,
  ADD COLUMN IF NOT EXISTS modernity_gap       text,
  ADD COLUMN IF NOT EXISTS screenshot_url      text,
  ADD COLUMN IF NOT EXISTS analysed_at         timestamptz;

CREATE INDEX IF NOT EXISTS prospects_site_score_idx      ON prospects (site_score);
CREATE INDEX IF NOT EXISTS prospects_recommendation_idx  ON prospects (recommendation);
CREATE INDEX IF NOT EXISTS prospects_analysed_at_idx     ON prospects (analysed_at);
