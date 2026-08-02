-- Extend lead submission RPCs with channel attribution.
--
-- submit_website_lead now accepts UTM params from the public site (captured
-- via lib/attribution.ts) and derives a normalised `channel` from
-- utm_source. submit_partner_referral now automatically tags the resulting
-- prospect as channel = 'partner' with partner_id set, so both roll into
-- the same funnel view (operator_get_channel_funnel).
--
-- Rollback:
--   Restore the previous CREATE OR REPLACE FUNCTION bodies from
--   20260723000000_create_lead_submission_functions.sql, and re-run:
--   DROP FUNCTION IF EXISTS public.submit_website_lead(TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- submit_website_lead gains 5 new optional UTM params. Drop the old 5-arg
-- overload first so callers can't accidentally resolve to the stale version.
DROP FUNCTION IF EXISTS public.submit_website_lead(TEXT, TEXT, TEXT, JSONB, TEXT);

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

CREATE OR REPLACE FUNCTION public.submit_partner_referral(
  p_affiliate_id UUID,
  p_business_name TEXT,
  p_contact_name TEXT DEFAULT NULL,
  p_business_email TEXT DEFAULT NULL,
  p_business_phone TEXT DEFAULT NULL,
  p_current_website TEXT DEFAULT NULL,
  p_business_stage TEXT DEFAULT 'new',
  p_mockup_brief JSONB DEFAULT '{}'::jsonb
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT := NULLIF(BTRIM(p_business_name), '');
  v_contact TEXT := NULLIF(BTRIM(p_contact_name), '');
  v_email TEXT := LOWER(NULLIF(BTRIM(p_business_email), ''));
  v_phone TEXT := NULLIF(BTRIM(p_business_phone), '');
  v_website TEXT := NULLIF(BTRIM(p_current_website), '');
  v_stage TEXT := COALESCE(NULLIF(BTRIM(p_business_stage), ''), 'new');
  v_stamp TEXT := FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT::TEXT;
  v_slug TEXT;
  v_prospect_id BIGINT;
  v_referral_id BIGINT;
  v_affiliate_name TEXT;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_affiliate_id THEN
    RAISE EXCEPTION 'Not authorised to submit this referral' USING ERRCODE = '42501';
  END IF;

  SELECT display_name INTO v_affiliate_name
  FROM affiliates
  WHERE id = p_affiliate_id
    AND status = 'active';

  IF v_affiliate_name IS NULL THEN
    RAISE EXCEPTION 'Affiliate account is not active' USING ERRCODE = '42501';
  END IF;

  IF v_name IS NULL THEN
    RAISE EXCEPTION 'Business name is required' USING ERRCODE = '22023';
  END IF;

  IF v_email IS NULL AND v_phone IS NULL THEN
    RAISE EXCEPTION 'Business email or phone is required' USING ERRCODE = '22023';
  END IF;

  IF v_stage NOT IN ('new', 'growing', 'established') THEN
    RAISE EXCEPTION 'Invalid business stage' USING ERRCODE = '22023';
  END IF;

  IF v_website IS NOT NULL AND v_website !~* '^https?://' THEN
    v_website := 'https://' || v_website;
  END IF;

  v_slug := TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(v_name), '[^a-z0-9]+', '-', 'g'));
  IF v_slug = '' THEN
    v_slug := 'partner-lead';
  END IF;

  INSERT INTO prospects (
    place_id,
    name,
    website,
    email,
    phone,
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
    partner_id
  )
  VALUES (
    'partner_lead_' || v_stamp || '_' || LEFT(v_slug, 36),
    v_name,
    v_website,
    v_email,
    v_phone,
    v_website IS NOT NULL,
    v_email IS NOT NULL,
    TRUE,
    'partner_lead',
    'new',
    'partner_lead',
    'Sorted Partners Portal',
    COALESCE(NULLIF(p_mockup_brief->>'business', ''), 'Partner referral'),
    v_slug || '-' || TO_HEX(v_stamp::BIGINT),
    CONCAT_WS(
      E'\n',
      'Source: Sorted Partners Portal referral',
      'Affiliate ID: ' || p_affiliate_id::TEXT,
      CASE WHEN v_contact IS NOT NULL THEN 'Business contact: ' || v_contact END,
      CASE WHEN v_phone IS NOT NULL THEN 'Business phone: ' || v_phone END,
      CASE WHEN NULLIF(p_mockup_brief->>'business', '') IS NOT NULL THEN 'Business type: ' || (p_mockup_brief->>'business') END,
      CASE WHEN NULLIF(p_mockup_brief->>'currentSite', '') IS NOT NULL THEN 'Current website state: ' || (p_mockup_brief->>'currentSite') END,
      CASE WHEN NULLIF(p_mockup_brief->>'goal', '') IS NOT NULL THEN 'Goal: ' || (p_mockup_brief->>'goal') END,
      CASE WHEN NULLIF(p_mockup_brief->>'style', '') IS NOT NULL THEN 'Style: ' || (p_mockup_brief->>'style') END,
      CASE WHEN NULLIF(p_mockup_brief->>'timeline', '') IS NOT NULL THEN 'Timeline: ' || (p_mockup_brief->>'timeline') END,
      CASE WHEN NULLIF(p_mockup_brief->>'description', '') IS NOT NULL THEN 'Description: ' || (p_mockup_brief->>'description') END
    ),
    'partner',
    v_affiliate_name,
    p_affiliate_id
  )
  RETURNING id INTO v_prospect_id;

  INSERT INTO affiliate_referrals (
    affiliate_id,
    prospect_id,
    business_name,
    business_contact_name,
    business_email,
    business_phone,
    current_website,
    business_stage,
    mockup_brief,
    status
  )
  VALUES (
    p_affiliate_id,
    v_prospect_id,
    v_name,
    v_contact,
    v_email,
    v_phone,
    v_website,
    v_stage,
    COALESCE(p_mockup_brief, '{}'::jsonb),
    'mockup_requested'
  )
  RETURNING id INTO v_referral_id;

  INSERT INTO affiliate_events (
    referral_id,
    affiliate_id,
    event_type,
    previous_status,
    new_status,
    actor,
    metadata
  )
  VALUES (
    v_referral_id,
    p_affiliate_id,
    'referral_submitted',
    NULL,
    'mockup_requested',
    'affiliate',
    jsonb_build_object('prospect_id', v_prospect_id)
  );

  RETURN v_referral_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_website_lead(TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_partner_referral(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_website_lead(TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_partner_referral(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;
