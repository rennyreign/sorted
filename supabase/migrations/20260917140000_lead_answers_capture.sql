-- Capture mockup wizard answers as structured data on the prospect, and let
-- no-website leads add their "about the business" line from the review page.
--
-- Until now p_answers was only rendered into the notes text blob. A proper
-- lead_answers JSONB column lets the review page re-state the insight the
-- lead gave us (business type, goal, style, timeline, about) when they have
-- no existing website to analyse.
--
-- Rollback:
--   DROP FUNCTION IF EXISTS public.submit_lead_about(TEXT, TEXT);
--   ALTER TABLE public.prospects DROP COLUMN IF EXISTS lead_answers;
--   Restore submit_website_lead from 20260917120000_website_lead_about.sql.

ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS lead_answers JSONB;

-- Backfill existing website leads by parsing the answers out of the notes
-- blob, so review pages for earlier leads can still show the recap.
UPDATE public.prospects
SET lead_answers = jsonb_strip_nulls(jsonb_build_object(
  'business',    (regexp_match(notes, 'Business type: ([^\n]+)'))[1],
  'currentSite', (regexp_match(notes, 'Current website state: ([^\n]+)'))[1],
  'goal',        (regexp_match(notes, 'Goal: ([^\n]+)'))[1],
  'style',       (regexp_match(notes, 'Style: ([^\n]+)'))[1],
  'timeline',    (regexp_match(notes, 'Timeline: ([^\n]+)'))[1],
  'about',       (regexp_match(notes, 'About the business: ([^\n]+)'))[1]
))
WHERE search_query = 'website_lead'
  AND notes IS NOT NULL
  AND lead_answers IS NULL;

-- submit_website_lead now persists the raw answers alongside the notes render.
CREATE OR REPLACE FUNCTION public.submit_website_lead(
  p_business_name TEXT,
  p_website_url TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_answers JSONB DEFAULT '{}'::jsonb,
  p_summary TEXT DEFAULT NULL,
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL,
  p_utm_content TEXT DEFAULT NULL,
  p_utm_term TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT := NULLIF(BTRIM(p_business_name), '');
  v_email TEXT := LOWER(NULLIF(BTRIM(p_email), ''));
  v_website TEXT := NULLIF(BTRIM(p_website_url), '');
  v_stamp TEXT := FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT::TEXT;
  v_slug TEXT;
  v_id BIGINT;
  v_utm_source TEXT := NULLIF(BTRIM(p_utm_source), '');
  v_channel TEXT;
BEGIN
  IF v_name IS NULL THEN
    RAISE EXCEPTION 'Business name is required' USING ERRCODE = '22023';
  END IF;

  IF v_email IS NULL OR v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'A valid email address is required' USING ERRCODE = '22023';
  END IF;

  IF v_website IS NOT NULL AND v_website !~* '^https?://' THEN
    v_website := 'https://' || v_website;
  END IF;

  v_slug := TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(v_name), '[^a-z0-9]+', '-', 'g'));
  IF v_slug = '' THEN
    v_slug := 'website-lead';
  END IF;

  -- Normalise channel from utm_source; default to 'organic' for direct site visits.
  v_channel := COALESCE(LOWER(v_utm_source), 'organic');

  INSERT INTO prospects (
    place_id,
    name,
    website,
    email,
    website_exists,
    email_exists,
    qualified,
    status,
    crm_status,
    search_query,
    search_location,
    category,
    review_slug,
    notes,
    lead_answers,
    channel,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term
  )
  VALUES (
    'website_lead_' || v_stamp || '_' || LEFT(v_slug, 36),
    v_name,
    v_website,
    v_email,
    v_website IS NOT NULL,
    TRUE,
    TRUE,
    'website_lead',
    'new',
    'website_lead',
    'sortmydigital.site',
    COALESCE(NULLIF(p_answers->>'business', ''), 'Website lead'),
    v_slug || '-' || TO_HEX(v_stamp::BIGINT),
    CONCAT_WS(
      E'\n',
      'Source: Sorted website free mockup modal',
      CASE WHEN NULLIF(BTRIM(p_summary), '') IS NOT NULL THEN 'Mockup direction: ' || BTRIM(p_summary) END,
      CASE WHEN NULLIF(p_answers->>'business', '') IS NOT NULL THEN 'Business type: ' || (p_answers->>'business') END,
      CASE WHEN NULLIF(p_answers->>'about', '') IS NOT NULL THEN 'About the business: ' || LEFT(p_answers->>'about', 500) END,
      CASE WHEN NULLIF(p_answers->>'currentSite', '') IS NOT NULL THEN 'Current website state: ' || (p_answers->>'currentSite') END,
      CASE WHEN NULLIF(p_answers->>'goal', '') IS NOT NULL THEN 'Goal: ' || (p_answers->>'goal') END,
      CASE WHEN NULLIF(p_answers->>'style', '') IS NOT NULL THEN 'Style: ' || (p_answers->>'style') END,
      CASE WHEN NULLIF(p_answers->>'timeline', '') IS NOT NULL THEN 'Timeline: ' || (p_answers->>'timeline') END
    ),
    COALESCE(p_answers, '{}'::jsonb),
    v_channel,
    v_utm_source,
    NULLIF(BTRIM(p_utm_medium), ''),
    NULLIF(BTRIM(p_utm_campaign), ''),
    NULLIF(BTRIM(p_utm_content), ''),
    NULLIF(BTRIM(p_utm_term), '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Lets a no-website lead add (or update) their "about the business" line
-- from the review page. Scoped to website_exists = false: this is the
-- scenario where there is nothing else for the review page to work with.
CREATE OR REPLACE FUNCTION public.submit_lead_about(
  p_slug TEXT,
  p_about TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_about TEXT := NULLIF(BTRIM(p_about), '');
BEGIN
  IF v_about IS NULL OR LENGTH(v_about) < 3 THEN
    RAISE EXCEPTION 'Please tell us a little about the business' USING ERRCODE = '22023';
  END IF;

  UPDATE public.prospects
  SET
    lead_answers = jsonb_set(
      COALESCE(lead_answers, '{}'::jsonb),
      '{about}',
      to_jsonb(LEFT(v_about, 500))
    ),
    notes = CASE
      WHEN notes NOT LIKE '%About the business:%'
        THEN COALESCE(notes, '') || E'\nAbout the business: ' || LEFT(v_about, 500)
      ELSE notes
    END,
    updated_at = now()
  WHERE review_slug = p_slug
    AND website_exists = false;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_website_lead(TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_lead_about(TEXT, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_website_lead(TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_lead_about(TEXT, TEXT) TO anon, authenticated;
