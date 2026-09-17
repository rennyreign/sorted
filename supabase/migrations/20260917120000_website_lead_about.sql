-- Surface the free mockup wizard's free-text answer in lead notes.
--
-- The wizard now asks for one or two lines about the business or idea
-- (answers.about). Add it to the notes block so inbound lead notifications
-- include what the business actually is, not just the structured answers.
--
-- Rollback:
--   Restore the CREATE OR REPLACE FUNCTION body from
--   20260803010000_lead_attribution.sql.

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

REVOKE ALL ON FUNCTION public.submit_website_lead(TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_website_lead(TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
