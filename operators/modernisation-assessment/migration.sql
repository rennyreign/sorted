-- Modernisation Assessment — Supabase Migration
-- Adds columns for the Business Modernisation Score and full assessment report.
-- Run in the Supabase SQL Editor before using --write mode.

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS business_modernisation_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS assessment_report            jsonb,
  ADD COLUMN IF NOT EXISTS assessed_at                  timestamptz;

CREATE INDEX IF NOT EXISTS prospects_business_modernisation_score_idx ON prospects (business_modernisation_score);
CREATE INDEX IF NOT EXISTS prospects_assessed_at_idx ON prospects (assessed_at);
