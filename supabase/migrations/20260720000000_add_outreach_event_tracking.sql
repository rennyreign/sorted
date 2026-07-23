-- Outreach Event Tracking — Open/Click/Delivery/Bounce Engagement
--
-- Adds engagement tracking infrastructure for outreach emails:
--   1. outreach_events table — raw event log for every Resend webhook event
--   2. New prospect states: DELIVERED, OPENED, CLICKED
--   3. Engagement timestamp columns on prospects
--   4. Index on provider_message_id for fast webhook lookups
--
-- Webhook events are received by the Supabase Edge Function at:
--   supabase/functions/resend-webhook/index.ts
--
-- Rollback:
--   DROP TABLE IF EXISTS outreach_events;
--   ALTER TABLE prospects DROP COLUMN IF EXISTS email_delivered_at;
--   ALTER TABLE prospects DROP COLUMN IF EXISTS email_opened_at;
--   ALTER TABLE prospects DROP COLUMN IF EXISTS email_clicked_at;
--   DROP INDEX IF EXISTS idx_prospects_outreach_provider_message_id;
--   (Recreate original CHECK constraint without DELIVERED/OPENED/CLICKED)

-- ─── New prospect states ──────────────────────────────────────────────────────

ALTER TABLE prospects
  DROP CONSTRAINT IF EXISTS prospects_outreach_status_check;

ALTER TABLE prospects
  ADD CONSTRAINT prospects_outreach_status_check
  CHECK (outreach_status IN (
    'NOT_READY','READY','QUEUED','SENDING','SENT',
    'DELIVERED','OPENED','CLICKED',
    'FAILED_TEMPORARY','FAILED_PERMANENT','BOUNCED','REPLIED','OPTED_OUT'
  ));

-- ─── Engagement timestamp columns ────────────────────────────────────────────

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS email_delivered_at TIMESTAMPTZ;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMPTZ;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS email_clicked_at TIMESTAMPTZ;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS email_open_count INT NOT NULL DEFAULT 0;

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS email_click_count INT NOT NULL DEFAULT 0;

-- ─── Index for webhook lookups ────────────────────────────────────────────────
-- The edge function matches incoming webhook events to prospects via
-- outreach_provider_message_id. This index makes that lookup fast.

CREATE INDEX IF NOT EXISTS idx_prospects_outreach_provider_message_id
  ON prospects (outreach_provider_message_id)
  WHERE outreach_provider_message_id IS NOT NULL;

-- ─── Outreach events table ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS outreach_events (
  id BIGSERIAL PRIMARY KEY,
  prospect_id BIGINT REFERENCES prospects(id) ON DELETE SET NULL,
  provider_message_id TEXT,
  event_type TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_events_prospect
  ON outreach_events (prospect_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_outreach_events_message_id
  ON outreach_events (provider_message_id);

CREATE INDEX IF NOT EXISTS idx_outreach_events_type
  ON outreach_events (event_type, occurred_at DESC);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE outreach_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators read events" ON outreach_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role manages events" ON outreach_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── Trigger: auto-update prospect status on event insert ─────────────────────
-- When an outreach_event is inserted, update the prospect's engagement
-- timestamps and outreach_status. This keeps the prospect state machine
-- in sync without requiring the edge function to do multiple writes.

CREATE OR REPLACE FUNCTION update_prospect_engagement()
RETURNS TRIGGER AS $$
DECLARE
  pid BIGINT;
  current_status TEXT;
BEGIN
  -- Resolve prospect_id: use the one provided, or look up by message_id
  IF NEW.prospect_id IS NOT NULL THEN
    pid := NEW.prospect_id;
  ELSIF NEW.provider_message_id IS NOT NULL THEN
    SELECT id, outreach_status INTO pid, current_status
      FROM prospects
      WHERE outreach_provider_message_id = NEW.provider_message_id
      LIMIT 1;
  END IF;

  IF pid IS NULL THEN
    -- Can't resolve prospect — event is still stored for auditing
    RETURN NEW;
  END IF;

  IF current_status IS NULL THEN
    SELECT outreach_status INTO current_status FROM prospects WHERE id = pid;
  END IF;

  -- Update based on event type (only progress forward, don't regress)
  CASE NEW.event_type
    -- Delivery confirmation
    WHEN 'email.delivered' THEN
      IF current_status IN ('SENT', 'DELIVERED', 'OPENED', 'CLICKED') THEN
        UPDATE prospects
          SET email_delivered_at = NEW.occurred_at,
              outreach_status = CASE WHEN current_status = 'SENT' THEN 'DELIVERED' ELSE current_status END
          WHERE id = pid;
      END IF;

    -- Open tracking
    WHEN 'email.opened' THEN
      IF current_status IN ('SENT', 'DELIVERED', 'OPENED', 'CLICKED') THEN
        UPDATE prospects
          SET email_opened_at = NEW.occurred_at,
              email_open_count = email_open_count + 1,
              outreach_status = CASE WHEN current_status IN ('SENT', 'DELIVERED') THEN 'OPENED' ELSE current_status END
          WHERE id = pid;
      END IF;

    -- Click tracking
    WHEN 'email.clicked' THEN
      IF current_status IN ('SENT', 'DELIVERED', 'OPENED', 'CLICKED') THEN
        UPDATE prospects
          SET email_clicked_at = NEW.occurred_at,
              email_click_count = email_click_count + 1,
              outreach_status = 'CLICKED'
          WHERE id = pid;
      END IF;

    -- Hard bounce — suppress and mark
    WHEN 'email.bounced' THEN
      UPDATE prospects
        SET outreach_status = 'BOUNCED',
            email_bounced_at = NEW.occurred_at,
            outreach_last_error = 'HARD_BOUNCE'
        WHERE id = pid
          AND outreach_status NOT IN ('OPTED_OUT', 'REPLIED');

    -- Spam complaint — opt out and suppress
    WHEN 'email.complained' THEN
      UPDATE prospects
        SET outreach_status = 'OPTED_OUT',
            email_opted_out_at = NEW.occurred_at
        WHERE id = pid
          AND outreach_status NOT IN ('REPLIED');

    -- No action for other event types
    ELSE
      NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_outreach_event_engagement ON outreach_events;
CREATE TRIGGER trigger_outreach_event_engagement
  AFTER INSERT ON outreach_events
  FOR EACH ROW EXECUTE FUNCTION update_prospect_engagement();
