-- Prospect Viability — Website Analyser rebuild
-- Adds tech profiling, Companies House viability, price-point/payback
-- estimation, and the qualified_lead gate to the prospects table.
--
-- Semantics change:
--   site_score      = site QUALITY score 0-10 (higher = better site)
--   opportunity_score = modernity gap 0-10 (higher = worse site = better prospect)
--   prospect_score  = blended score (higher = better prospect)
-- Previously site_score stored the blended prospect score and
-- opportunity_score stored the raw dimension sum (i.e. site quality).
-- Backfill: prospect_score <- old site_score; site_score <- old dimension
-- sum; opportunity_score <- 10 - site_score.

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS prospect_score        numeric(4,1),
  ADD COLUMN IF NOT EXISTS mobile_screenshot_url text,
  ADD COLUMN IF NOT EXISTS tech_stack            jsonb,
  ADD COLUMN IF NOT EXISTS site_platform         text,
  ADD COLUMN IF NOT EXISTS site_age_signal       text,
  ADD COLUMN IF NOT EXISTS site_built_estimate   text,
  ADD COLUMN IF NOT EXISTS service_price_point   numeric,
  ADD COLUMN IF NOT EXISTS payback_jobs          integer,
  ADD COLUMN IF NOT EXISTS ch_status             text,
  ADD COLUMN IF NOT EXISTS ch_incorporated_date  date,
  ADD COLUMN IF NOT EXISTS ch_accounts_type      text,
  ADD COLUMN IF NOT EXISTS ch_accounts_last_date date,
  ADD COLUMN IF NOT EXISTS ch_match_confidence   text,
  ADD COLUMN IF NOT EXISTS qualified_lead        boolean,
  ADD COLUMN IF NOT EXISTS qualification_reasons jsonb;

-- Backfill: old site_score values were actually the blended prospect score.
UPDATE prospects
SET prospect_score = site_score
WHERE prospect_score IS NULL AND site_score IS NOT NULL;

-- Re-derive: old opportunity_score was the dimension sum = site quality.
-- SET expressions see pre-update values, so this swap is safe.
UPDATE prospects
SET site_score = opportunity_score,
    opportunity_score = 10 - opportunity_score
WHERE opportunity_score IS NOT NULL AND opportunity_score >= 0;

CREATE INDEX IF NOT EXISTS prospects_qualified_lead_idx   ON prospects (qualified_lead);
CREATE INDEX IF NOT EXISTS prospects_prospect_score_idx   ON prospects (prospect_score);
CREATE INDEX IF NOT EXISTS prospects_site_platform_idx    ON prospects (site_platform);
