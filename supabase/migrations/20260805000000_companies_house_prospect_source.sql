-- Add Companies House as a source alongside Google Maps for the Prospect Finder.
-- No new CRM/table is introduced; existing `prospects` table is extended.

-- Source metadata. All existing rows default to the original Google Maps source.
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'google_maps',
  ADD COLUMN IF NOT EXISTS source_company_number TEXT,
  ADD COLUMN IF NOT EXISTS source_incorporation_date DATE,
  ADD COLUMN IF NOT EXISTS source_sic_codes TEXT[],
  ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Companies House records do not have a Google place_id.
ALTER TABLE prospects ALTER COLUMN place_id DROP NOT NULL;

-- Definitive deduplication key for Companies House sourced prospects.
CREATE UNIQUE INDEX IF NOT EXISTS idx_prospects_company_number
  ON prospects(source_company_number)
  WHERE source_company_number IS NOT NULL;

-- Filter helper for the UI/API.
CREATE INDEX IF NOT EXISTS idx_prospects_source ON prospects(source);

-- Run history so the operator page can display summary statistics.
CREATE TABLE IF NOT EXISTS prospect_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT,
  operator TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  requested_date_from DATE,
  requested_date_to DATE,
  requested_location TEXT,
  records_returned INTEGER DEFAULT 0,
  records_rejected INTEGER DEFAULT 0,
  duplicates_found INTEGER DEFAULT 0,
  prospects_created INTEGER DEFAULT 0,
  prospects_updated INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  error_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospect_runs_operator_started
  ON prospect_runs(operator, started_at DESC);

-- Update the review_slug trigger so it can also use the Companies House
-- company number as a uniqueness suffix when no Google place_id exists.
CREATE OR REPLACE FUNCTION set_review_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    id_suffix TEXT;
BEGIN
    IF NEW.review_slug IS NULL AND NEW.name IS NOT NULL THEN
        base_slug := LOWER(
            REGEXP_REPLACE(
                REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s]', '', 'g'),
                '\s+', '-', 'g'
            )
        );

        id_suffix := SUBSTRING(COALESCE(NEW.place_id, NEW.source_company_number, ''), 1, 6);

        -- If the base slug already belongs to a different prospect, append
        -- a short identifier suffix to guarantee uniqueness.
        IF EXISTS (
            SELECT 1 FROM prospects
            WHERE review_slug = base_slug
              AND COALESCE(place_id, source_company_number, '') IS DISTINCT FROM COALESCE(NEW.place_id, NEW.source_company_number, '')
        ) THEN
            base_slug := base_slug || '-' || id_suffix;
        END IF;

        NEW.review_slug := base_slug;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_review_slug ON prospects;
CREATE TRIGGER trigger_set_review_slug
    BEFORE INSERT ON prospects
    FOR EACH ROW EXECUTE FUNCTION set_review_slug();
