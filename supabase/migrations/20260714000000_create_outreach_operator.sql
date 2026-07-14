-- Outreach Operator Migration
-- Adds automated outreach tracking, campaign versioning, audit logging,
-- suppression list, and configuration to support deterministic email sending.

-- ─── Outreach columns on prospects ──────────────────────────────────────────

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS outreach_status TEXT DEFAULT NULL
    CHECK (outreach_status IN ('NOT_READY','READY','QUEUED','SENDING','SENT','FAILED_TEMPORARY','FAILED_PERMANENT','BOUNCED','REPLIED','OPTED_OUT'));

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS outreach_campaign_id TEXT;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS outreach_queued_at TIMESTAMPTZ;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS outreach_sent_at TIMESTAMPTZ;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS outreach_provider_message_id TEXT;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS outreach_attempt_count INT NOT NULL DEFAULT 0;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS outreach_last_error TEXT;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS email_bounced_at TIMESTAMPTZ;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS email_replied_at TIMESTAMPTZ;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS email_opted_out_at TIMESTAMPTZ;

-- Index for finding READY prospects quickly
CREATE INDEX IF NOT EXISTS idx_prospects_outreach_status ON prospects (outreach_status);
CREATE INDEX IF NOT EXISTS idx_prospects_outreach_queued_at ON prospects (outreach_queued_at);

-- ─── Campaigns table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  body_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Audit log table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS outreach_log (
  id BIGSERIAL PRIMARY KEY,
  prospect_id BIGINT REFERENCES prospects(id) ON DELETE CASCADE,
  campaign_id TEXT,
  previous_state TEXT,
  new_state TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trigger_source TEXT,
  provider_response TEXT,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_outreach_log_prospect ON outreach_log (prospect_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_log_campaign ON outreach_log (campaign_id, timestamp DESC);

-- ─── Suppression list ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS outreach_suppression (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('hard_bounce','opt_out','manual_block','complaint')),
  prospect_id BIGINT REFERENCES prospects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_suppression_email ON outreach_suppression (email);

-- ─── Configuration table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS outreach_config (
  id INT PRIMARY KEY DEFAULT 1,
  mode TEXT NOT NULL DEFAULT 'AUTO_SEND'
    CHECK (mode IN ('AUTO_SEND','QUEUE_ONLY','PAUSED')),
  daily_send_limit INT NOT NULL DEFAULT 20,
  sending_window_start TEXT NOT NULL DEFAULT '09:00',
  sending_window_end TEXT NOT NULL DEFAULT '16:30',
  sending_window_days TEXT NOT NULL DEFAULT '1,2,3,4,5',  -- Mon-Fri (ISO day numbers)
  sending_window_tz TEXT NOT NULL DEFAULT 'Europe/London',
  send_spacing_minutes INT NOT NULL DEFAULT 5,
  max_retry_attempts INT NOT NULL DEFAULT 3,
  from_email TEXT NOT NULL DEFAULT 'renaldo@sortmydigital.site',
  from_name TEXT NOT NULL DEFAULT 'Renaldo',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure only one config row
INSERT INTO outreach_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ─── Seed initial campaign ───────────────────────────────────────────────────

INSERT INTO outreach_campaigns (id, subject, body_template, is_active, version)
VALUES (
  'sorted_initial_outreach_v1',
  'We built something for you',
  'Hi,

We reviewed your website and built a completely new version of it.

See your review and compare both versions here:

{{review_url}}

Interested to hear what you think,

Renaldo
Sorted',
  true,
  1
) ON CONFLICT (id) DO NOTHING;

-- ─── Enable RLS ──────────────────────────────────────────────────────────────

ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_suppression ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_config ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; allow authenticated operators to read/write
CREATE POLICY "Operators read campaigns" ON outreach_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators write campaigns" ON outreach_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Operators read log" ON outreach_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators write log" ON outreach_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Operators read suppression" ON outreach_suppression FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators write suppression" ON outreach_suppression FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Operators read config" ON outreach_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators write config" ON outreach_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── Trigger: auto-mark prospects as READY when outreach data is complete ────

CREATE OR REPLACE FUNCTION check_outreach_eligibility()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set to READY if currently NULL or NOT_READY
  IF (NEW.outreach_status IS NULL OR NEW.outreach_status = 'NOT_READY') THEN
    IF NEW.email IS NOT NULL
       AND NEW.review_slug IS NOT NULL
       AND (NEW.mockup_url IS NOT NULL OR (NEW.mockup_urls IS NOT NULL AND array_length(NEW.mockup_urls, 1) > 0))
    THEN
      NEW.outreach_status := 'READY';
      NEW.outreach_queued_at := NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_outreach_eligibility ON prospects;
CREATE TRIGGER trigger_outreach_eligibility
  BEFORE INSERT OR UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION check_outreach_eligibility();
