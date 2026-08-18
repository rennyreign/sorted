-- Fix partner approval: auto-confirm email + send approval email
--
-- ROOT CAUSE: Supabase Auth has email confirmation enabled (default). When a
-- partner signs up, Supabase creates an auth.users row with
-- email_confirmed_at = NULL and sends a confirmation email. The partner must
-- click that link before they can sign in. But the partner only knows about
-- the operator approval gate (the apply page says "within 48 hours"). The
-- Resend "application received" email does NOT mention email confirmation.
--
-- Result: operator approves the affiliate (status = 'active') but the partner
-- still cannot log in because email_confirmed_at is still NULL. The partner
-- sees a raw "Email not confirmed" error and gets stuck in a reset loop.
--
-- FIX:
--   1. When the operator approves an affiliate (status = 'active'), also
--      confirm their email in auth.users. The operator's manual review IS
--      the verification — email confirmation is redundant when a human has
--      already reviewed the application.
--   2. Send an approval email to the partner via Resend so they know they
--      can now log in. Previously only an in-portal notification was created
--      (which the partner cannot see because they cannot log in).
--   3. Backfill: confirm emails for any already-approved affiliates whose
--      email is still unconfirmed.
--
-- Rollback:
--   CREATE OR REPLACE the previous operator_set_affiliate_status() from
--   migration 20260801170000_operator_rpc.sql (without the email confirmation
--   and approval email logic).
--   DROP FUNCTION IF EXISTS public.notify_partner_approved(TEXT, TEXT);

-- ─── 1. Approval email helper ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.notify_partner_approved(
  p_email TEXT,
  p_display_name TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault
AS $$
DECLARE
  resend_key TEXT;
  from_email TEXT := 'Sorted Partners <hello@sortmydigital.site>';
  subject TEXT := 'Your Sorted partner account is approved';
  html TEXT;
  headers JSONB;
  req_id BIGINT;
BEGIN
  SELECT decrypted_secret INTO resend_key
  FROM vault.decrypted_secrets
  WHERE name = 'resend_api_key'
  LIMIT 1;

  IF resend_key IS NULL THEN
    RAISE LOG 'partner approval notify: resend_api_key not found in vault (skipping email)';
    RETURN;
  END IF;

  headers := jsonb_build_object(
    'Authorization', 'Bearer ' || resend_key,
    'Content-Type', 'application/json'
  );

  html := format($HTML$
<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#fbfbfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#070707;">
    <table width="100%%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <table width="560" style="background:#ffffff;border-radius:18px;border:1px solid rgba(0,0,0,0.08);padding:28px;">
        <tr><td>
          <span style="font-size:22px;font-weight:900;letter-spacing:-0.04em;">Sorted<span style="color:#dfff00;">.</span></span>
          <h1 style="font-size:32px;font-weight:900;letter-spacing:-0.04em;line-height:1.05;margin-top:28px;">You're approved.</h1>
          <p style="margin-top:18px;font-size:15px;line-height:1.55;color:rgba(0,0,0,0.66);">
            Hi %s, your Sorted partner account has been approved. You can now sign in and start submitting mockup requests.
          </p>
          <table style="margin-top:24px;" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <a href="https://sortmydigital.site/partners/login" style="display:inline-block;background:#070707;color:#fff;font-size:14px;font-weight:900;padding:14px 32px;border-radius:999px;text-decoration:none;letter-spacing:-0.01em;">
                  Sign in to your portal
                </a>
              </td>
            </tr>
          </table>
          <p style="margin-top:24px;font-size:15px;line-height:1.55;color:rgba(0,0,0,0.66);">
            Use the email and password you set when you applied. If you've forgotten your password, you can reset it from the login page.
          </p>
          <p style="margin-top:24px;font-size:12px;color:rgba(0,0,0,0.45);">
            Sorted — sortmydigital.site
          </p>
        </td></tr>
      </table>
    </td></tr></table>
  </body>
</html>
$HTML$, p_display_name);

  req_id := net.http_post(
    'https://api.resend.com/emails',
    jsonb_build_object(
      'from', from_email,
      'to', jsonb_build_array(p_email),
      'subject', subject,
      'html', html
    ),
    '{}'::jsonb,
    headers,
    5000
  );
  RAISE LOG 'partner approval notify request_id: %', req_id;
END;
$$;

-- ─── 2. Update operator_set_affiliate_status to confirm email + send email ────

CREATE OR REPLACE FUNCTION public.operator_set_affiliate_status(
  p_operator_token TEXT,
  p_affiliate_id UUID,
  p_status TEXT,
  p_declined_reason TEXT DEFAULT NULL
)
RETURNS TABLE (id UUID, email TEXT, display_name TEXT, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email TEXT;
  v_display_name TEXT;
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);

  -- Capture email + name before update for the approval email
  SELECT a.email, a.display_name INTO v_email, v_display_name
  FROM public.affiliates a
  WHERE a.id = p_affiliate_id;

  UPDATE public.affiliates
  SET
    status = p_status,
    declined_reason = CASE WHEN p_status = 'suspended' THEN p_declined_reason ELSE NULL END
  WHERE id = p_affiliate_id;

  IF p_status = 'active' THEN
    -- Auto-confirm the partner's email in auth.users. The operator's manual
    -- review IS the verification — the Supabase email confirmation gate is
    -- redundant here and was trapping approved partners out of their accounts.
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = p_affiliate_id AND email_confirmed_at IS NULL;

    INSERT INTO public.affiliate_notifications (affiliate_id, type, title, body)
    VALUES (
      p_affiliate_id,
      'account_approved',
      'Your affiliate account is approved',
      'You can now sign in and submit your first mockup request.'
    );

    -- Send approval email so the partner knows they can log in
    PERFORM public.notify_partner_approved(v_email, v_display_name);

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

-- ─── 3. Backfill: confirm emails for already-approved affiliates ──────────────

UPDATE auth.users u
SET email_confirmed_at = COALESCE(u.email_confirmed_at, u.created_at)
FROM public.affiliates a
WHERE a.id = u.id
  AND a.status = 'active'
  AND u.email_confirmed_at IS NULL;
