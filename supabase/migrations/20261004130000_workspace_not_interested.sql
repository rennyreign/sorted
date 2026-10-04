-- Workspace "Not interested" self-service opt-out.
--
-- The workspace is a static export, so the browser cannot use Next API routes.
-- This SECURITY DEFINER function exposes one narrow write — marking a prospect
-- lost — without granting anon update access to the prospects table.
-- Guard: prospects already in paid/build/quote are never demoted by this call.

CREATE OR REPLACE FUNCTION public.mark_workspace_not_interested(p_slug TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slug TEXT := NULLIF(BTRIM(p_slug), '');
  v_rows INT;
BEGIN
  IF v_slug IS NULL THEN
    RAISE EXCEPTION 'Workspace slug is required' USING ERRCODE = '22023';
  END IF;

  UPDATE public.prospects
  SET crm_status = 'lost',
      status_updated_at = NOW()
  WHERE review_slug = v_slug
    AND crm_status NOT IN ('paid', 'build', 'quote', 'lost');

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_workspace_not_interested(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_workspace_not_interested(TEXT) TO anon, authenticated;
