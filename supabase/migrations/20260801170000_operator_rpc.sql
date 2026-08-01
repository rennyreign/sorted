-- Operator dashboard RPCs
--
-- Replaces the local-only /api/operators/affiliates routes with Supabase
-- RPCs so the operator dashboard works on the static export.
--
-- All functions read an `operator_api_token` from Supabase Vault and run as
-- SECURITY DEFINER so they can bypass RLS and operate on affiliates /
-- affiliate_referrals as an operator.
--
-- Required setup:
--   SELECT vault.create_secret('<random-token>', 'operator_api_token', 'Token for operator dashboard RPC calls');
--
-- Rollback:
--   DROP FUNCTION IF EXISTS public.operator_get_affiliates(text);
--   DROP FUNCTION IF EXISTS public.operator_get_referrals(text);
--   DROP FUNCTION IF EXISTS public.operator_set_affiliate_status(text, uuid, text, text);
--   DROP FUNCTION IF EXISTS public.operator_set_referral_status(text, bigint, text);

-- ─── Seed / rotate the operator API token (service role only) ─────────────────

CREATE OR REPLACE FUNCTION public.create_operator_secret(p_new_secret TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
BEGIN
  RETURN vault.create_secret(p_new_secret, 'operator_api_token', 'Token for operator dashboard RPC calls');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_operator_secret(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_operator_secret(text) TO service_role;

-- ─── Helper: verify operator token from Vault ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.verify_operator_token(p_operator_token TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_token TEXT;
BEGIN
  SELECT decrypted_secret INTO v_token
  FROM vault.decrypted_secrets
  WHERE name = 'operator_api_token'
  LIMIT 1;

  IF v_token IS NULL OR v_token != p_operator_token THEN
    RAISE EXCEPTION 'invalid operator token';
  END IF;
END;
$$;

-- ─── List affiliates with referral aggregates ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.operator_get_affiliates(p_operator_token TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  phone TEXT,
  program TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  referrals_total BIGINT,
  referrals_purchased BIGINT,
  pending_payout_gbp BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);

  RETURN QUERY
  SELECT
    a.id,
    a.email,
    a.display_name,
    a.phone,
    a.program,
    a.status,
    a.created_at,
    a.updated_at,
    COALESCE(COUNT(r.id), 0)::BIGINT AS referrals_total,
    COALESCE(COUNT(r.id) FILTER (WHERE r.status = 'purchased'), 0)::BIGINT AS referrals_purchased,
    COALESCE(SUM(r.payout_amount_gbp) FILTER (WHERE r.payout_status IN ('due','notified')), 0)::BIGINT AS pending_payout_gbp
  FROM public.affiliates a
  LEFT JOIN public.affiliate_referrals r ON r.affiliate_id = a.id
  GROUP BY a.id, a.email, a.display_name, a.phone, a.program, a.status, a.created_at, a.updated_at
  ORDER BY a.created_at DESC;
END;
$$;

-- ─── List referrals with affiliate info ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.operator_get_referrals(p_operator_token TEXT)
RETURNS TABLE (
  id BIGINT,
  affiliate_id UUID,
  prospect_id BIGINT,
  business_name TEXT,
  business_contact_name TEXT,
  business_email TEXT,
  business_phone TEXT,
  current_website TEXT,
  business_stage TEXT,
  mockup_brief JSONB,
  status TEXT,
  mockup_url TEXT,
  client_slug TEXT,
  payout_amount_gbp INT,
  payout_status TEXT,
  payout_notified_at TIMESTAMPTZ,
  payout_paid_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  affiliates JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);

  RETURN QUERY
  SELECT
    r.id,
    r.affiliate_id,
    r.prospect_id,
    r.business_name,
    r.business_contact_name,
    r.business_email,
    r.business_phone,
    r.current_website,
    r.business_stage,
    r.mockup_brief,
    r.status,
    r.mockup_url,
    r.client_slug,
    r.payout_amount_gbp,
    r.payout_status,
    r.payout_notified_at,
    r.payout_paid_at,
    r.purchased_at,
    r.notes,
    r.created_at,
    r.updated_at,
    jsonb_build_object('display_name', a.display_name, 'email', a.email) AS affiliates
  FROM public.affiliate_referrals r
  JOIN public.affiliates a ON a.id = r.affiliate_id
  ORDER BY r.created_at DESC;
END;
$$;

-- ─── Approve / suspend an affiliate and notify them ───────────────────────────

CREATE OR REPLACE FUNCTION public.operator_set_affiliate_status(
  p_operator_token TEXT,
  p_affiliate_id UUID,
  p_status TEXT,
  p_declined_reason TEXT DEFAULT NULL
)
RETURNS TABLE (id UUID, email TEXT, display_name TEXT, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);

  UPDATE public.affiliates
  SET
    status = p_status,
    declined_reason = CASE WHEN p_status = 'suspended' THEN p_declined_reason ELSE NULL END
  WHERE id = p_affiliate_id;

  IF p_status = 'active' THEN
    INSERT INTO public.affiliate_notifications (affiliate_id, type, title, body)
    VALUES (
      p_affiliate_id,
      'account_approved',
      'Your affiliate account is approved',
      'You can now sign in and submit your first mockup request.'
    );
  ELSIF p_status = 'suspended' THEN
    INSERT INTO public.affiliate_notifications (affiliate_id, type, title, body)
    VALUES (
      p_affiliate_id,
      'account_declined',
      'Affiliate account suspended',
      COALESCE(p_declined_reason, 'Contact hello@sortmydigital.site for details.')
    );
  END IF;

  RETURN QUERY
  SELECT a.id, a.email, a.display_name, a.status
  FROM public.affiliates a
  WHERE a.id = p_affiliate_id;
END;
$$;

-- ─── Advance a referral status ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.operator_set_referral_status(
  p_operator_token TEXT,
  p_referral_id BIGINT,
  p_status TEXT
)
RETURNS TABLE (id BIGINT, status TEXT, payout_amount_gbp INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);

  UPDATE public.affiliate_referrals
  SET status = p_status
  WHERE id = p_referral_id;

  RETURN QUERY
  SELECT r.id, r.status, r.payout_amount_gbp
  FROM public.affiliate_referrals r
  WHERE r.id = p_referral_id;
END;
$$;
