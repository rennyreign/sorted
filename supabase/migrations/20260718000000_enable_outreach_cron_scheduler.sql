-- Outreach Cron Scheduler — Reliable Deterministic Dispatch
--
-- Replaces reliance on GitHub Actions cron (which is best-effort and
-- silently drops runs) with a pg_cron job that calls the GitHub
-- workflow_dispatch API every 5 minutes during UK business hours.
--
-- The send.py script still enforces the actual sending window
-- (09:00-16:30 Europe/London), so extra triggers outside the window
-- just exit gracefully. This is belt-and-suspenders with the existing
-- GitHub Actions cron schedule.

-- ─── Extensions ───────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant pg_cron access
GRANT USAGE ON SCHEMA cron TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA cron TO postgres, service_role;

-- ─── Audit table for cron dispatch results ────────────────────────
CREATE TABLE IF NOT EXISTS outreach_cron_log (
  id bigserial PRIMARY KEY,
  triggered_at timestamptz NOT NULL DEFAULT NOW(),
  result text NOT NULL,
  pg_net_request_id bigint
);

ALTER TABLE outreach_cron_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Operators read cron log" ON outreach_cron_log
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role manages cron log" ON outreach_cron_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── Trigger function ─────────────────────────────────────────────
-- Calls GitHub's workflow_dispatch API to trigger the outreach-sender
-- workflow. The GitHub PAT is stored in Supabase Vault under the name
-- 'github_outreach_token'.

CREATE OR REPLACE FUNCTION public.trigger_outreach_sender()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault, cron, net
AS $$
DECLARE
  gh_token text;
  request_id bigint;
  result_text text;
  headers_json jsonb;
  body_json jsonb;
BEGIN
  -- Retrieve the GitHub PAT from Vault
  SELECT decrypted_secret
    INTO gh_token
    FROM vault.decrypted_secrets
    WHERE name = 'github_outreach_token'
    LIMIT 1;

  IF gh_token IS NULL THEN
    result_text := 'ERROR: GitHub token not found in Vault (name=github_outreach_token)';
    INSERT INTO outreach_cron_log (result) VALUES (result_text);
    RETURN result_text;
  END IF;

  -- Build headers and body as jsonb
  headers_json := jsonb_build_object(
    'Authorization', 'Bearer ' || gh_token,
    'Accept', 'application/vnd.github+json',
    'Content-Type', 'application/json',
    'X-GitHub-Api-Version', '2022-11-28',
    'User-Agent', 'supabase-pg-cron-outreach'
  );

  body_json := jsonb_build_object('ref', 'main');

  -- Fire the workflow_dispatch request asynchronously via pg_net
  -- Signature: http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds int)
  -- Returns bigint request ID directly
  request_id := net.http_post(
    'https://api.github.com/repos/rennyreign/sorted/actions/workflows/outreach-sender.yml/dispatches',
    body_json,
    '{}'::jsonb,
    headers_json,
    10000
  );

  result_text := 'OK: dispatched workflow trigger (pg_net request ' || request_id || ')';
  INSERT INTO outreach_cron_log (result, pg_net_request_id) VALUES (result_text, request_id);
  RETURN result_text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.trigger_outreach_sender() TO service_role;

-- ─── Schedule the cron job ────────────────────────────────────────
-- Every 5 minutes, 08:00-16:55 UTC, Mon-Fri.
-- This covers 09:00-16:30 Europe/London in both BST (UTC+1) and GMT (UTC+0).
-- send.py enforces the actual sending window, so out-of-window triggers
-- are harmless (they just log and exit).

SELECT cron.schedule(
  'trigger-outreach-sender',
  '*/5 8-16 * * 1-5',
  $$SELECT public.trigger_outreach_sender()$$
);
