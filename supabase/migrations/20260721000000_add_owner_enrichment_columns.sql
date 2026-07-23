-- Owner Identification & Email Enrichment — Direct Owner Contact Pipeline
--
-- Adds columns to track business owner identification, direct email enrichment,
-- and email validation. This shifts outreach from sending to generic info@ addresses
-- to sending directly to the business owner.
--
-- Pipeline: Companies House + website scrape → owner name → Hunter.io → owner email → verify → send
--
-- Rollback:
--   ALTER TABLE prospects
--     DROP COLUMN IF EXISTS owner_name,
--     DROP COLUMN IF EXISTS owner_role,
--     DROP COLUMN IF EXISTS owner_linkedin_url,
--     DROP COLUMN IF EXISTS owner_source,
--     DROP COLUMN IF EXISTS owner_identified_at,
--     DROP COLUMN IF EXISTS owner_email,
--     DROP COLUMN IF EXISTS owner_email_source,
--     DROP COLUMN IF EXISTS owner_email_confidence,
--     DROP COLUMN IF EXISTS owner_enriched_at,
--     DROP COLUMN IF EXISTS owner_email_status,
--     DROP COLUMN IF EXISTS owner_email_verified_at;

-- ─── Owner identification columns ────────────────────────────────────────────

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS owner_name TEXT;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS owner_role TEXT;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS owner_linkedin_url TEXT;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS owner_source TEXT
    CHECK (owner_source IN ('companies_house','website','hunter','combined','manual'));

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS owner_identified_at TIMESTAMPTZ;

-- ─── Owner email enrichment columns ──────────────────────────────────────────

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS owner_email TEXT;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS owner_email_source TEXT
    CHECK (owner_email_source IN ('hunter_domain_search','hunter_email_finder','website_fallback','manual'));

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS owner_email_confidence INT;  -- 0-100, Hunter confidence score

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS owner_enriched_at TIMESTAMPTZ;

-- ─── Email validation columns ────────────────────────────────────────────────

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS owner_email_status TEXT
    CHECK (owner_email_status IN ('valid','risky','invalid','unverified'));

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS owner_email_verified_at TIMESTAMPTZ;

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_prospects_owner_email_status
  ON prospects (owner_email_status)
  WHERE owner_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_prospects_owner_source
  ON prospects (owner_source)
  WHERE owner_name IS NOT NULL;

-- ─── Update outreach eligibility trigger ──────────────────────────────────────
-- Modify the eligibility check to also consider owner_email as a valid contact path.
-- A prospect is READY if they have either:
--   - owner_email (preferred), OR
--   - email (fallback from website scrape)
-- Plus review_slug and mockup_url.

CREATE OR REPLACE FUNCTION check_outreach_eligibility()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set to READY if currently NULL or NOT_READY
  IF (NEW.outreach_status IS NULL OR NEW.outreach_status = 'NOT_READY') THEN
    IF (NEW.email IS NOT NULL OR NEW.owner_email IS NOT NULL)
       AND NEW.review_slug IS NOT NULL
       AND (NEW.mockup_url IS NOT NULL OR (NEW.mockup_urls IS NOT NULL AND array_length(NEW.mockup_urls, 1) > 0))
    THEN
      NEW.outreach_status := 'READY';
      NEW.outreach_queued_at := NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
