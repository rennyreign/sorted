-- Fix localhost URL in partner application operator notification email
--
-- The operator notification email body referenced http://localhost:3000/operators/costs
-- (a local dev URL). Recreate notify_operator_and_partner() with the production URL
-- https://sortmydigital.site/operators/costs so live emails point operators to the
-- real dashboard.
--
-- Rollback: re-apply the previous function body from
-- 20260801160000_affiliate_signup_notifications.sql.

CREATE OR REPLACE FUNCTION public.notify_operator_and_partner(
  p_email TEXT,
  p_display_name TEXT,
  p_phone TEXT,
  p_program TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault
AS $$
DECLARE
  resend_key TEXT;
  operator_email TEXT := 'hello@sortmydigital.site';
  from_email TEXT := 'Sorted Partners <hello@sortmydigital.site>';
  partner_subject TEXT := 'Your Sorted partner application has been received';
  operator_subject TEXT := 'New Sorted partner application';
  partner_html TEXT;
  operator_html TEXT;
  headers JSONB;
  req_id BIGINT;
  program_label TEXT := COALESCE(p_program, 'partner');
  phone_label TEXT := COALESCE(p_phone, '—');
BEGIN
  -- Load Resend key from Vault
  SELECT decrypted_secret INTO resend_key
  FROM vault.decrypted_secrets
  WHERE name = 'resend_api_key'
  LIMIT 1;

  IF resend_key IS NULL THEN
    RAISE LOG 'affiliate signup notify: resend_api_key not found in vault (skipping emails)';
    RETURN;
  END IF;

  -- Load optional operator email override from Vault
  SELECT decrypted_secret INTO operator_email
  FROM vault.decrypted_secrets
  WHERE name = 'operator_email'
  LIMIT 1;

  IF operator_email IS NULL THEN
    operator_email := 'hello@sortmydigital.site';
  END IF;

  headers := jsonb_build_object(
    'Authorization', 'Bearer ' || resend_key,
    'Content-Type', 'application/json'
  );

  -- Partner confirmation email
  partner_html := format($PARTNER$
<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#fbfbfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#070707;">
    <table width="100%%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <table width="560" style="background:#ffffff;border-radius:18px;border:1px solid rgba(0,0,0,0.08);padding:28px;">
        <tr><td>
          <span style="font-size:22px;font-weight:900;letter-spacing:-0.04em;">Sorted<span style="color:#dfff00;">.</span></span>
          <h1 style="font-size:32px;font-weight:900;letter-spacing:-0.04em;line-height:1.05;margin-top:28px;">Application received</h1>
          <p style="margin-top:18px;font-size:15px;line-height:1.55;color:rgba(0,0,0,0.66);">
            Hi %s, thanks for applying to the Sorted partner programme.
          </p>
          <p style="margin-top:14px;font-size:15px;line-height:1.55;color:rgba(0,0,0,0.66);">
            We have received your application as a <strong>%s</strong> partner and will review it within 48 hours. You will receive another email once your account is approved.
          </p>
          <p style="margin-top:14px;font-size:15px;line-height:1.55;color:rgba(0,0,0,0.66);">
            If you have any questions, reply to this email or WhatsApp us.
          </p>
          <p style="margin-top:24px;font-size:12px;color:rgba(0,0,0,0.45);">
            Sorted — sortmydigital.site
          </p>
        </td></tr>
      </table>
    </td></tr></table>
  </body>
</html>
$PARTNER$, p_display_name, program_label);

  req_id := net.http_post(
    'https://api.resend.com/emails',
    jsonb_build_object(
      'from', from_email,
      'to', jsonb_build_array(p_email),
      'subject', partner_subject,
      'html', partner_html
    ),
    '{}'::jsonb,
    headers,
    5000
  );
  RAISE LOG 'affiliate signup partner notify request_id: %', req_id;

  -- Operator notification email
  operator_html := format($OPERATOR$
<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#fbfbfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#070707;">
    <table width="100%%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <table width="560" style="background:#ffffff;border-radius:18px;border:1px solid rgba(0,0,0,0.08);padding:28px;">
        <tr><td>
          <span style="font-size:22px;font-weight:900;letter-spacing:-0.04em;">Sorted<span style="color:#dfff00;">.</span></span>
          <h1 style="font-size:32px;font-weight:900;letter-spacing:-0.04em;line-height:1.05;margin-top:28px;">New partner application</h1>
          <p style="margin-top:18px;font-size:15px;line-height:1.55;color:rgba(0,0,0,0.66);">
            A new partner has applied through the public <strong>/partners/apply</strong> form.
          </p>
          <table style="margin-top:18px;font-size:14px;line-height:1.6;color:rgba(0,0,0,0.72);" cellpadding="0" cellspacing="0">
            <tr><td style="padding-right:12px;"><strong>Name</strong></td><td>%s</td></tr>
            <tr><td style="padding-right:12px;"><strong>Email</strong></td><td>%s</td></tr>
            <tr><td style="padding-right:12px;"><strong>Phone</strong></td><td>%s</td></tr>
            <tr><td style="padding-right:12px;"><strong>Program</strong></td><td>%s</td></tr>
          </table>
          <p style="margin-top:24px;font-size:15px;line-height:1.55;color:rgba(0,0,0,0.66);">
            Approve or decline the application in the Sorted operator dashboard at <a href="https://sortmydigital.site/operators/costs">https://sortmydigital.site/operators/costs</a> or via the Supabase dashboard.
          </p>
          <p style="margin-top:24px;font-size:12px;color:rgba(0,0,0,0.45);">
            Sorted — sortmydigital.site
          </p>
        </td></tr>
      </table>
    </td></tr></table>
  </body>
</html>
$OPERATOR$, p_display_name, p_email, phone_label, program_label);

  req_id := net.http_post(
    'https://api.resend.com/emails',
    jsonb_build_object(
      'from', from_email,
      'to', jsonb_build_array(operator_email),
      'subject', operator_subject,
      'html', operator_html
    ),
    '{}'::jsonb,
    headers,
    5000
  );
  RAISE LOG 'affiliate signup operator notify request_id: %', req_id;
END;
$$;
