-- Resend webhook tracking — dedup table, increment function, and indexes
--
-- Supports the resend-webhook edge function which receives email events
-- (delivered, opened, clicked, bounced, complained) from Resend and
-- updates the corresponding prospect record.

-- ─── Dedup table for webhook events ───────────────────────────────────────────
-- Prevents processing the same event twice (Resend retries on failure)

CREATE TABLE IF NOT EXISTS resend_webhook_events (
  id BIGSERIAL PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,  -- "{email_id}:{event_type}" — dedup key
  event_type TEXT NOT NULL,
  email_id TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resend_webhook_email_id ON resend_webhook_events (email_id);
CREATE INDEX IF NOT EXISTS idx_resend_webhook_event_type ON resend_webhook_events (event_type);

-- Enable RLS (service role bypasses)
ALTER TABLE resend_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON resend_webhook_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── Increment function for open/click counts ────────────────────────────────
-- Atomically increments email_open_count or email_click_count on the
-- prospect matching the given Resend email_id.

CREATE OR REPLACE FUNCTION increment_email_count(p_email_id TEXT, p_field TEXT)
RETURNS VOID AS $$
BEGIN
  IF p_field = 'email_open_count' THEN
    UPDATE prospects
      SET email_open_count = COALESCE(email_open_count, 0) + 1
      WHERE outreach_provider_message_id = p_email_id;
  ELSIF p_field = 'email_click_count' THEN
    UPDATE prospects
      SET email_click_count = COALESCE(email_click_count, 0) + 1
      WHERE outreach_provider_message_id = p_email_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Index for fast webhook lookups ───────────────────────────────────────────
-- The edge function looks up prospects by outreach_provider_message_id

CREATE INDEX IF NOT EXISTS idx_prospects_outreach_provider_message_id
  ON prospects (outreach_provider_message_id)
  WHERE outreach_provider_message_id IS NOT NULL;
