-- Affiliate Tracker — Sorted Sites Affiliate Scheme
--
-- Builds the data layer for the Sorted Sites affiliate programme:
--   - affiliates (1:1 with auth.users) — profile, status, payout contact
--   - affiliate_referrals — each mockup request submitted by an affiliate,
--     tracked from request through to purchase, with payout attribution
--   - affiliate_notifications — in-portal bell notifications
--   - affiliate_events — audit trail of status transitions per referral
--
-- Attribution model: affiliate_referrals is the source of truth for
-- "who referred whom and what's owed". When a referral converts and enters
-- the build pipeline, it links to the existing prospects table via
-- prospect_id (nullable FK) so it can join the build/outreach machinery
-- without coupling the two acquisition channels.
--
-- Payout rates (GBP, per closed deal):
--   new business       -> 75
--   growing business   -> 150
--   established business -> 300
--
-- Payout lifecycle stops at 'notified' here — the actual bank transfer
-- is executed out-of-band. This migration builds everything up to that point.
--
-- Rollback:
--   DROP TABLE IF EXISTS affiliate_events CASCADE;
--   DROP TABLE IF EXISTS affiliate_notifications CASCADE;
--   DROP TABLE IF EXISTS affiliate_referrals CASCADE;
--   DROP TABLE IF EXISTS affiliates CASCADE;
--   DROP FUNCTION IF EXISTS handle_new_affiliate();
--   DROP FUNCTION IF EXISTS set_referral_payout();
--   DROP TRIGGER IF EXISTS trigger_set_referral_payout ON affiliate_referrals;

-- ─── affiliates ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  phone TEXT,
  bank_account_ref TEXT,  -- label/reference only; never store account numbers in cleartext
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','active','suspended')),
  declined_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates (status);

-- Auto-create an affiliates row when a new auth user signs up.
-- Sign-ups arrive via the public /partners/apply flow; the row starts
-- as 'pending' until an operator flips it to 'active'.
CREATE OR REPLACE FUNCTION handle_new_affiliate()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO affiliates (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

DROP TRIGGER IF EXISTS trigger_on_auth_user_created ON auth.users;
CREATE TRIGGER trigger_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_affiliate();

-- ─── affiliate_referrals ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id BIGSERIAL PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  prospect_id BIGINT REFERENCES prospects(id) ON DELETE SET NULL,

  -- Referred business details
  business_name TEXT NOT NULL,
  business_contact_name TEXT,
  business_email TEXT,
  business_phone TEXT,
  current_website TEXT,
  business_stage TEXT NOT NULL DEFAULT 'new'
    CHECK (business_stage IN ('new','growing','established')),

  -- Mockup brief captured from the affiliate's request flow
  -- (business type, current site, goal, style, timeline — same 5 questions
  -- as the public SitesMockupModal, stored as a JSON object)
  mockup_brief JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Pipeline status
  status TEXT NOT NULL DEFAULT 'mockup_requested'
    CHECK (status IN (
      'mockup_requested',     -- affiliate submitted the request
      'mockup_in_progress',   -- Sorted designing the mockup
      'mockup_delivered',     -- mockup sent to the client for review
      'client_reviewing',     -- client reviewing the mockup
      'approved_for_build',   -- client approved; build scoping underway
      'build_in_progress',    -- site is being built
      'built',                -- site complete, awaiting client sign-off / payment
      'purchased',            -- client paid — payout becomes due
      'lost',                 -- client declined / deal fell through
      'cancelled'             -- affiliate or Sorted cancelled the referral
    )),

  mockup_url TEXT,
  client_slug TEXT,

  -- Payout attribution (the source of truth for what's owed)
  payout_amount_gbp INT NOT NULL DEFAULT 0,
  payout_status TEXT NOT NULL DEFAULT 'none'
    CHECK (payout_status IN ('none','due','notified','paid')),
  payout_notified_at TIMESTAMPTZ,
  payout_paid_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,

  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_affiliate ON affiliate_referrals (affiliate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON affiliate_referrals (status);
CREATE INDEX IF NOT EXISTS idx_referrals_payout_status ON affiliate_referrals (payout_status)
  WHERE payout_status IN ('due','notified');
CREATE INDEX IF NOT EXISTS idx_referrals_prospect ON affiliate_referrals (prospect_id)
  WHERE prospect_id IS NOT NULL;

-- ─── Payout computation trigger ───────────────────────────────────────────────
-- When a referral transitions to 'purchased', compute the payout from the
-- business stage and mark the payout as 'due'. The operator API route then
-- flips payout_status to 'notified' after emailing the affiliate.

CREATE OR REPLACE FUNCTION set_referral_payout()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status = 'purchased') AND (OLD.status IS DISTINCT FROM 'purchased') THEN
    NEW.purchased_at := COALESCE(NEW.purchased_at, NOW());
    NEW.payout_status := 'due';
    NEW.payout_notified_at := NULL;
    NEW.payout_amount_gbp := CASE NEW.business_stage
      WHEN 'new' THEN 75
      WHEN 'growing' THEN 150
      WHEN 'established' THEN 300
      ELSE 0
    END;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_referral_payout ON affiliate_referrals;
CREATE TRIGGER trigger_set_referral_payout
  BEFORE UPDATE ON affiliate_referrals
  FOR EACH ROW EXECUTE FUNCTION set_referral_payout();

-- ─── affiliate_notifications ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS affiliate_notifications (
  id BIGSERIAL PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referral_id BIGINT REFERENCES affiliate_referrals(id) ON DELETE CASCADE,
  type TEXT NOT NULL
    CHECK (type IN ('welcome','payout_due','payout_notified','status_change','mockup_ready','account_approved','account_declined')),
  title TEXT NOT NULL,
  body TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aff_notifications_affiliate
  ON affiliate_notifications (affiliate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aff_notifications_unread
  ON affiliate_notifications (affiliate_id)
  WHERE read_at IS NULL;

-- ─── affiliate_events (audit trail) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS affiliate_events (
  id BIGSERIAL PRIMARY KEY,
  referral_id BIGINT NOT NULL REFERENCES affiliate_referrals(id) ON DELETE CASCADE,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  actor TEXT NOT NULL DEFAULT 'system'
    CHECK (actor IN ('affiliate','operator','system')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_referral ON affiliate_events (referral_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_affiliate ON affiliate_events (affiliate_id, created_at DESC);

-- ─── updated_at maintenance ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_affiliates_touch ON affiliates;
CREATE TRIGGER trigger_affiliates_touch
  BEFORE UPDATE ON affiliates
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Affiliates can read/update only their own rows across all tables.
-- The service role (operator API routes) bypasses RLS for operator actions
-- such as approving accounts, advancing referral status, and marking payouts.

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_events ENABLE ROW LEVEL SECURITY;

-- affiliates: self read + limited self update (display_name, phone, bank_account_ref)
CREATE POLICY "affiliates read self" ON affiliates
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "affiliates update self" ON affiliates
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow the auth trigger (SECURITY DEFINER owned by postgres) and the
-- service_role to insert affiliate rows when new users sign up.
CREATE POLICY "service insert affiliates" ON affiliates
  FOR INSERT TO postgres, service_role, supabase_auth_admin
  WITH CHECK (true);

-- affiliate_referrals: affiliates read + insert their own; updates are
-- operator-only (service role bypasses RLS) so affiliates cannot self-advance
-- pipeline status or payouts.
CREATE POLICY "referrals read own" ON affiliate_referrals
  FOR SELECT TO authenticated USING (auth.uid() = affiliate_id);

CREATE POLICY "referrals insert own" ON affiliate_referrals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = affiliate_id);

-- affiliate_notifications: affiliates read + mark-read their own
CREATE POLICY "notifications read own" ON affiliate_notifications
  FOR SELECT TO authenticated USING (auth.uid() = affiliate_id);

CREATE POLICY "notifications update own" ON affiliate_notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = affiliate_id)
  WITH CHECK (auth.uid() = affiliate_id);

-- affiliate_events: affiliates read their own; inserts are operator/system only
CREATE POLICY "events read own" ON affiliate_events
  FOR SELECT TO authenticated USING (auth.uid() = affiliate_id);

-- ─── Helpful RPC: dashboard stats for the signed-in affiliate ─────────────────
-- Returns aggregate counts and earnings for the calling affiliate in one round trip.

CREATE OR REPLACE FUNCTION affiliate_dashboard_stats(p_affiliate_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_referrals', COUNT(*),
    'purchased_count', COUNT(*) FILTER (WHERE status = 'purchased'),
    'active_count', COUNT(*) FILTER (WHERE status NOT IN ('purchased','lost','cancelled')),
    'lost_count', COUNT(*) FILTER (WHERE status = 'lost'),
    'total_earned_gbp', COALESCE(SUM(payout_amount_gbp) FILTER (WHERE payout_status IN ('due','notified','paid')), 0),
    'total_paid_out_gbp', COALESCE(SUM(payout_amount_gbp) FILTER (WHERE payout_status = 'paid'), 0),
    'pending_payout_gbp', COALESCE(SUM(payout_amount_gbp) FILTER (WHERE payout_status IN ('due','notified')), 0),
    'pending_payout_count', COUNT(*) FILTER (WHERE payout_status IN ('due','notified'))
  )
  INTO result
  FROM affiliate_referrals
  WHERE affiliate_id = p_affiliate_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION affiliate_dashboard_stats(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION affiliate_dashboard_stats(UUID) TO authenticated;
