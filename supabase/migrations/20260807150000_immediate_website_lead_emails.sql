-- Send prospect + operator emails immediately on website lead insert.
--
-- The previous flow relied on a GitHub Actions cron running every 10 minutes
-- to pick up new leads and email them. This trigger fires the moment a row
-- is inserted with status = 'website_lead', cutting delivery from ~10 min
-- to < 5 seconds. The GitHub Actions job remains as a fallback for any leads
-- the trigger misses (outreach_status != 'SENT').
--
-- Uses pg_net (async HTTP) + vault for the Resend API key.
--
-- Rollback:
--   DROP TRIGGER IF EXISTS trigger_website_lead_emails ON prospects;
--   DROP FUNCTION IF EXISTS send_website_lead_emails();

CREATE OR REPLACE FUNCTION public.send_website_lead_emails()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault
AS $function$
DECLARE
  v_api_key TEXT;
  v_operator_email TEXT;
  v_review_url TEXT;
  v_prospect_html TEXT;
  v_operator_html TEXT;
  v_prospect_text TEXT;
  v_notes_html TEXT;
  v_from TEXT := 'Sorted <hello@sortmydigital.site>';
BEGIN
  -- Only fire for website leads with the required fields.
  IF NEW.status <> 'website_lead' THEN
    RETURN NEW;
  END IF;

  IF NEW.email IS NULL OR NEW.review_slug IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip if already sent (e.g. re-imported row).
  IF NEW.outreach_status = 'SENT' THEN
    RETURN NEW;
  END IF;

  -- Fetch secrets from vault.
  SELECT secret INTO v_api_key FROM vault.decrypted_secrets WHERE name = 'resend_api_key';
  SELECT secret INTO v_operator_email FROM vault.decrypted_secrets WHERE name = 'operator_email';

  IF v_api_key IS NULL THEN
    RAISE LOG '[send_website_lead_emails] No resend_api_key in vault — skipping';
    RETURN NEW;
  END IF;

  v_operator_email := COALESCE(v_operator_email, 'hello@sortmydigital.site');
  v_review_url := 'https://sortmydigital.site/review/?slug=' || NEW.review_slug;

  -- Build prospect confirmation email HTML.
  v_prospect_html := '<!doctype html><html><body style="margin:0;padding:0;background:#fbfbfa;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#070707;">'
    || '<table width="100%" cellpadding="0" cellspacing="0" style="background:#fbfbfa;padding:32px 16px;"><tr><td align="center">'
    || '<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:18px;border:1px solid rgba(0,0,0,0.08);overflow:hidden;">'
    || '<tr><td style="background:#070707;padding:24px 28px;">'
    || '<span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.04em;">Sorted<span style="color:#dfff00;">.</span></span>'
    || '<span style="float:right;margin-top:5px;font-size:11px;font-weight:900;color:#dfff00;text-transform:uppercase;letter-spacing:0.08em;">Mockup request</span>'
    || '</td></tr>'
    || '<tr><td style="padding:34px 28px 8px 28px;">'
    || '<p style="margin:0 0 10px 0;font-size:13px;font-weight:900;color:#9bb000;">We''ve got your brief</p>'
    || '<h1 style="margin:0;font-size:38px;font-weight:900;letter-spacing:-0.055em;line-height:0.98;">Your private mockup page is being prepared.</h1>'
    || '<p style="margin:18px 0 0 0;font-size:15px;font-weight:650;color:rgba(0,0,0,0.66);line-height:1.5;">Hi ' || COALESCE(NEW.name, 'there') || ', this is where your Sorted website mockup will be shown once it is ready.</p>'
    || '</td></tr>'
    || '<tr><td style="padding:24px 28px 10px 28px;">'
    || '<a href="' || v_review_url || '" style="display:block;background:#dfff00;color:#070707;text-align:center;font-size:13px;font-weight:900;text-decoration:none;padding:17px 22px;border-radius:999px;">Open your review page →</a>'
    || '</td></tr>'
    || '<tr><td style="padding:12px 28px 34px 28px;">'
    || '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1e8;border-radius:14px;padding:18px;">'
    || '<tr><td style="font-size:13px;font-weight:800;line-height:1.55;color:rgba(0,0,0,0.7);">No obligation. No pressure. You see it first, then decide.</td></tr>'
    || '</table></td></tr>'
    || '<tr><td style="padding:18px 28px;background:#070707;border-top:1px solid rgba(0,0,0,0.06);">'
    || '<p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);font-weight:650;">Sorted — sortmydigital.site</p>'
    || '</td></tr></table></td></tr></table></body></html>';

  v_prospect_text := 'Hi ' || COALESCE(NEW.name, 'there') || E'\n\n'
    || 'Thanks for requesting a Sorted mockup.\n\n'
    || 'We''ve created your private review page here:\n'
    || v_review_url || E'\n\n'
    || 'This is where your website mockup will be shown once it is ready.\n\n'
    || 'No obligation. No pressure. You see it first, then decide.\n\n'
    || 'Sorted\nhttps://sortmydigital.site';

  -- Send prospect confirmation email (async via pg_net).
  PERFORM net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', v_from,
      'to', jsonb_build_array(NEW.email),
      'reply_to', 'hello@sortmydigital.site',
      'subject', 'Your Sorted mockup page',
      'html', v_prospect_html,
      'text', v_prospect_text
    )
  );

  -- Build operator notification email HTML.
  v_notes_html := REPLACE(COALESCE(NEW.notes, 'No notes'), E'\n', '<br/>');

  v_operator_html := '<!doctype html><html><body style="margin:0;padding:0;background:#fbfbfa;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#070707;">'
    || '<table width="100%" cellpadding="0" cellspacing="0" style="background:#fbfbfa;padding:32px 16px;"><tr><td align="center">'
    || '<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:18px;border:1px solid rgba(0,0,0,0.08);overflow:hidden;">'
    || '<tr><td style="background:#070707;padding:24px 28px;">'
    || '<span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.04em;">Sorted<span style="color:#dfff00;">.</span></span>'
    || '<span style="float:right;margin-top:5px;font-size:11px;font-weight:900;color:#dfff00;text-transform:uppercase;letter-spacing:0.08em;">New lead</span>'
    || '</td></tr>'
    || '<tr><td style="padding:34px 28px 8px 28px;">'
    || '<p style="margin:0 0 10px 0;font-size:13px;font-weight:900;color:#9bb000;">New website mockup brief</p>'
    || '<h1 style="margin:0;font-size:38px;font-weight:900;letter-spacing:-0.055em;line-height:0.98;">' || COALESCE(NEW.name, 'Unknown') || '</h1>'
    || '</td></tr>'
    || '<tr><td style="padding:24px 28px 10px 28px;">'
    || '<a href="' || v_review_url || '" style="display:block;background:#dfff00;color:#070707;text-align:center;font-size:13px;font-weight:900;text-decoration:none;padding:17px 22px;border-radius:999px;">Open review page →</a>'
    || '</td></tr>'
    || '<tr><td style="padding:24px 28px 8px 28px;">'
    || '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1e8;border-radius:14px;padding:18px;">'
    || '<tr><td style="font-size:13px;font-weight:800;line-height:1.55;color:rgba(0,0,0,0.7);">'
    || '<p style="margin:0 0 8px 0;"><strong>Business:</strong> ' || COALESCE(NEW.name, '—') || '</p>'
    || '<p style="margin:0 0 8px 0;"><strong>Email:</strong> ' || COALESCE(NEW.email, '—') || '</p>'
    || CASE WHEN NEW.website IS NOT NULL THEN '<p style="margin:0 0 8px 0;"><strong>Website:</strong> ' || NEW.website || '</p>' ELSE '' END
    || '<p style="margin:0;"><strong>Review slug:</strong> ' || NEW.review_slug || '</p>'
    || '</td></tr></table></td></tr>'
    || '<tr><td style="padding:8px 28px 24px 28px;">'
    || '<p style="margin:0 0 12px 0;font-size:13px;font-weight:900;color:#9bb000;">Brief details</p>'
    || '<p style="margin:0;font-size:13px;font-weight:600;line-height:1.55;color:rgba(0,0,0,0.66);">' || v_notes_html || '</p>'
    || '</td></tr>'
    || '<tr><td style="padding:18px 28px;background:#070707;border-top:1px solid rgba(0,0,0,0.06);">'
    || '<p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);font-weight:650;">Sorted — sortmydigital.site</p>'
    || '</td></tr></table></td></tr></table></body></html>';

  -- Send operator notification email (async via pg_net).
  PERFORM net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', v_from,
      'to', jsonb_build_array(v_operator_email),
      'reply_to', 'hello@sortmydigital.site',
      'subject', 'New Sorted mockup request: ' || COALESCE(NEW.name, 'Unknown'),
      'html', v_operator_html
    )
  );

  -- Mark as sent so the GitHub Actions fallback doesn't double-send.
  UPDATE prospects
  SET outreach_status = 'SENT',
      outreach_sent_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER trigger_website_lead_emails
  AFTER INSERT ON public.prospects
  FOR EACH ROW
  EXECUTE FUNCTION public.send_website_lead_emails();

-- Grant the function access to vault secrets.
GRANT SELECT ON vault.decrypted_secrets TO postgres;
