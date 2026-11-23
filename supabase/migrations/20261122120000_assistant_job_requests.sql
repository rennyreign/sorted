-- Capture "give an assistant a job" submissions from /assistants into their own
-- table, kept deliberately separate from public.prospects so assistant interest
-- never enters the website or outreach pipelines.
--
-- The page calls public.submit_assistant_job straight from the browser with the
-- anon key (production is a static export, so there is no API route). The
-- function validates and trims its inputs; the table itself has RLS enabled
-- with no policies, so it is fully closed to anon/authenticated and only the
-- SECURITY DEFINER function can write to it.
--
-- Rollback:
--   REVOKE EXECUTE ON FUNCTION public.submit_assistant_job(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT) FROM anon, authenticated;
--   DROP FUNCTION IF EXISTS public.submit_assistant_job(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT);
--   DROP TABLE IF EXISTS public.assistant_job_requests;

CREATE TABLE public.assistant_job_requests (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  job TEXT NOT NULL,
  business_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  consent BOOLEAN NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT NOT NULL DEFAULT 'new'
);

ALTER TABLE public.assistant_job_requests ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.submit_assistant_job(
  p_job TEXT,
  p_business TEXT,
  p_contact TEXT,
  p_consent BOOLEAN,
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job TEXT := NULLIF(BTRIM(p_job), '');
  v_business TEXT := NULLIF(BTRIM(p_business), '');
  v_contact TEXT := NULLIF(BTRIM(p_contact), '');
  v_id BIGINT;
BEGIN
  IF v_job IS NULL OR LENGTH(v_job) > 280 THEN
    RAISE EXCEPTION 'Job is required and must be 280 characters or fewer' USING ERRCODE = '22023';
  END IF;

  IF v_business IS NULL OR LENGTH(v_business) > 120 THEN
    RAISE EXCEPTION 'Business name is required and must be 120 characters or fewer' USING ERRCODE = '22023';
  END IF;

  IF v_contact IS NULL OR LENGTH(v_contact) > 160 THEN
    RAISE EXCEPTION 'Contact is required and must be 160 characters or fewer' USING ERRCODE = '22023';
  END IF;

  IF p_consent IS NOT TRUE THEN
    RAISE EXCEPTION 'Consent is required' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.assistant_job_requests (
    job,
    business_name,
    contact,
    consent,
    utm_source,
    utm_medium,
    utm_campaign
  )
  VALUES (
    v_job,
    v_business,
    v_contact,
    TRUE,
    NULLIF(BTRIM(p_utm_source), ''),
    NULLIF(BTRIM(p_utm_medium), ''),
    NULLIF(BTRIM(p_utm_campaign), '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_assistant_job(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_assistant_job(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT) TO anon, authenticated;
