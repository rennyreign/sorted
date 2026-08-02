-- Public review-flow RPCs
--
-- The review pages (/review and /review-next) are served from the static
-- Hostinger export, so /api/review/reveal and /api/review/build 404 in
-- production (app/api is stripped before the static build). As a result,
-- clicking "Reveal your new website" or "Show me the full website" never
-- advanced crm_status on the live site.
--
-- These RPCs let the public pages call Supabase directly (anon key) to
-- advance the pipeline stage, scoped strictly to a known review_slug and a
-- narrow set of allowed status transitions.
--
-- Rollback:
--   DROP FUNCTION IF EXISTS public.review_reveal_mockup(text);
--   DROP FUNCTION IF EXISTS public.review_mark_build(text);

-- ─── Reveal mockup: new/outreached/responded → mockup_revealed ────────────────

CREATE OR REPLACE FUNCTION public.review_reveal_mockup(p_slug TEXT)
RETURNS TABLE (crm_status TEXT, mockup_revealed_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_slug IS NULL OR p_slug = '' THEN
    RAISE EXCEPTION 'slug required';
  END IF;

  UPDATE public.prospects p
  SET crm_status = 'mockup_revealed'
  WHERE p.review_slug = p_slug
    AND p.crm_status IN ('new', 'outreached', 'responded');

  RETURN QUERY
  SELECT p.crm_status, p.mockup_revealed_at
  FROM public.prospects p
  WHERE p.review_slug = p_slug;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.review_reveal_mockup(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_reveal_mockup(text) TO anon, authenticated;

-- ─── Continue to build: new/outreached/responded/mockup_revealed → build ──────

CREATE OR REPLACE FUNCTION public.review_mark_build(p_slug TEXT)
RETURNS TABLE (crm_status TEXT, status_updated_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_slug IS NULL OR p_slug = '' THEN
    RAISE EXCEPTION 'slug required';
  END IF;

  UPDATE public.prospects p
  SET crm_status = 'build'
  WHERE p.review_slug = p_slug
    AND p.crm_status IN ('new', 'outreached', 'responded', 'mockup_revealed');

  RETURN QUERY
  SELECT p.crm_status, p.status_updated_at
  FROM public.prospects p
  WHERE p.review_slug = p_slug;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.review_mark_build(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_mark_build(text) TO anon, authenticated;
