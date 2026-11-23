-- Assistant demo lead capture.
--
-- A submission from /assistants/demo does three things:
--   1. Writes an assistant_job_requests row (the "give an assistant a job"
--      pipeline, same as /assistants).
--   2. Writes a prospects row (status='assistant_lead', source='manual',
--      crm_status='new') so the lead appears in the prospect finder.
--      NOTE: the send_website_lead_emails trigger only fires for
--      status='website_lead', so no mockup email goes to the prospect.
--   3. Fires notify_assistant_lead — a Resend email to the operator —
--      via the existing pg_net + vault pattern.
--
-- Called from the browser with the anon key; RLS stays closed and only the
-- SECURITY DEFINER function writes.
--
-- Rollback:
--   DROP TRIGGER IF EXISTS trigger_assistant_lead_notify ON prospects;
--   DROP FUNCTION IF EXISTS public.notify_assistant_lead();
--   REVOKE EXECUTE ON FUNCTION public.submit_assistant_demo_lead(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT) FROM anon, authenticated;
--   DROP FUNCTION IF EXISTS public.submit_assistant_demo_lead(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.submit_assistant_demo_lead(
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
AS $function$
DECLARE
  v_job TEXT := btrim(p_job);
  v_business TEXT := btrim(p_business);
  v_contact TEXT := btrim(p_contact);
  v_email TEXT;
  v_phone TEXT;
  v_prospect_id BIGINT;
BEGIN
  IF v_job = '' OR v_business = '' OR v_contact = '' THEN
    RAISE EXCEPTION 'job, business and contact are required';
  END IF;
  IF p_consent IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'consent is required';
  END IF;
  IF length(v_job) > 500 OR length(v_business) > 120 OR length(v_contact) > 160 THEN
    RAISE EXCEPTION 'input too long';
  END IF;

  -- Split contact into email or phone.
  IF v_contact ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    v_email := v_contact;
  ELSE
    v_phone := v_contact;
  END IF;

  -- 1. Same pipeline as /assistants.
  INSERT INTO public.assistant_job_requests
    (job, business_name, contact, consent, utm_source, utm_medium, utm_campaign)
  VALUES
    (v_job, v_business, v_contact, true, p_utm_source, p_utm_medium, p_utm_campaign);

  -- 2. Prospect finder row. status='assistant_lead' keeps it out of the
  --    website_lead email trigger and the outreach queues.
  INSERT INTO public.prospects
    (name, email, phone, status, source, crm_status,
     website_exists, email_exists, qualified,
     notes, utm_source, utm_medium, utm_campaign)
  VALUES
    (v_business, v_email, v_phone, 'assistant_lead', 'manual', 'new',
     false, v_email IS NOT NULL, false,
     'Assistant demo lead — wants an assistant to: ' || v_job,
     p_utm_source, p_utm_medium, p_utm_campaign)
  RETURNING id INTO v_prospect_id;

  RETURN v_prospect_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.submit_assistant_demo_lead(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_assistant_demo_lead(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Operator notification for assistant demo leads.
CREATE OR REPLACE FUNCTION public.notify_assistant_lead()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault
AS $function$
DECLARE
  v_api_key TEXT;
  v_operator_email TEXT;
  v_html TEXT;
  v_from TEXT := 'Sorted <hello@sortmydigital.site>';
BEGIN
  IF NEW.status <> 'assistant_lead' THEN
    RETURN NEW;
  END IF;

  SELECT secret INTO v_api_key FROM vault.decrypted_secrets WHERE name = 'resend_api_key';
  SELECT secret INTO v_operator_email FROM vault.decrypted_secrets WHERE name = 'operator_email';
  IF v_api_key IS NULL THEN
    RAISE LOG '[notify_assistant_lead] No resend_api_key in vault — skipping';
    RETURN NEW;
  END IF;
  v_operator_email := COALESCE(v_operator_email, 'hello@sortmydigital.site');

  v_html := '<!doctype html><html><body style="margin:0;padding:0;background:#fbfbfa;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#070707;">'
    || '<table width="100%" cellpadding="0" cellspacing="0" style="background:#fbfbfa;padding:32px 16px;"><tr><td align="center">'
    || '<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:18px;border:1px solid rgba(0,0,0,0.08);overflow:hidden;">'
    || '<tr><td style="background:#070707;padding:24px 28px;">'
    || '<span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.04em;">Sorted<span style="color:#dfff00;">.</span></span>'
    || '<span style="float:right;margin-top:5px;font-size:11px;font-weight:900;color:#dfff00;text-transform:uppercase;letter-spacing:0.08em;">Assistant lead</span>'
    || '</td></tr>'
    || '<tr><td style="padding:34px 28px 8px 28px;">'
    || '<p style="margin:0 0 10px 0;font-size:13px;font-weight:900;color:#9bb000;">Assistant demo lead</p>'
    || '<h1 style="margin:0;font-size:38px;font-weight:900;letter-spacing:-0.055em;line-height:0.98;">' || COALESCE(NEW.name, 'Unknown') || '</h1>'
    || '</td></tr>'
    || '<tr><td style="padding:24px 28px 8px 28px;">'
    || '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1e8;border-radius:14px;padding:18px;">'
    || '<tr><td style="font-size:13px;font-weight:800;line-height:1.55;color:rgba(0,0,0,0.7);">'
    || '<p style="margin:0 0 8px 0;"><strong>Email:</strong> ' || COALESCE(NEW.email, '—') || '</p>'
    || '<p style="margin:0 0 8px 0;"><strong>Phone:</strong> ' || COALESCE(NEW.phone, '—') || '</p>'
    || '<p style="margin:0;"><strong>Prospect:</strong> #' || NEW.id || ' · assistants/demo</p>'
    || '</td></tr></table></td></tr>'
    || '<tr><td style="padding:8px 28px 24px 28px;">'
    || '<p style="margin:0 0 12px 0;font-size:13px;font-weight:900;color:#9bb000;">What they asked for</p>'
    || '<p style="margin:0;font-size:13px;font-weight:600;line-height:1.55;color:rgba(0,0,0,0.66);">' || COALESCE(NEW.notes, '—') || '</p>'
    || '</td></tr>'
    || '<tr><td style="padding:18px 28px;background:#070707;border-top:1px solid rgba(0,0,0,0.06);">'
    || '<p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);font-weight:650;">Sorted — sortmydigital.site</p>'
    || '</td></tr></table></td></tr></table></body></html>';

  PERFORM net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', v_from,
      'to', jsonb_build_array(v_operator_email),
      'reply_to', COALESCE(NEW.email, 'hello@sortmydigital.site'),
      'subject', 'New assistant lead: ' || COALESCE(NEW.name, 'Unknown'),
      'html', v_html
    )
  );

  RETURN NEW;
END;
$function$;

CREATE TRIGGER trigger_assistant_lead_notify
  AFTER INSERT ON public.prospects
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_assistant_lead();
