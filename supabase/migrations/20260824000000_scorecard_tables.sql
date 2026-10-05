-- Scorecard V1 — tables
--
-- Adds the data infrastructure for an automated weekly scorecard that
-- derives every metric from existing systems (Supabase CRM, GA4, Stripe,
-- partner referrals, content posts) with no manual entry.
--
-- Tables added:
--   deals                     — deal/revenue tracking linked to prospects + Stripe
--   paid_acquisition          — ad spend + attributed results (stubbed until Sept)
--   ga4_weekly_metrics        — cached GA4 Data API results per week
--   weekly_scorecard_snapshots— historical metric snapshots for trend comparison
--   scorecard_settings        — configurable targets and FY parameters
--
-- Column added:
--   prospects.mockup_created_at — when a mockup was manufactured (backfilled)
--
-- Rollback:
--   ALTER TABLE public.prospects DROP COLUMN IF EXISTS mockup_created_at;
--   DROP TABLE IF EXISTS public.scorecard_settings;
--   DROP TABLE IF EXISTS public.weekly_scorecard_snapshots;
--   DROP TABLE IF EXISTS public.ga4_weekly_metrics;
--   DROP TABLE IF EXISTS public.paid_acquisition;
--   DROP TABLE IF EXISTS public.deals;

-- ─── prospects.mockup_created_at ──────────────────────────────────────────────

ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS mockup_created_at TIMESTAMPTZ;

-- Backfill: approximate mockup creation time from the status transition
UPDATE public.prospects
SET mockup_created_at = status_updated_at
WHERE mockup_url IS NOT NULL
  AND mockup_created_at IS NULL
  AND crm_status IN ('mockup_revealed','build','quote','paid');

CREATE INDEX IF NOT EXISTS idx_prospects_mockup_created_at
  ON public.prospects(mockup_created_at)
  WHERE mockup_created_at IS NOT NULL;

-- ─── deals ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.deals (
  id BIGSERIAL PRIMARY KEY,
  prospect_id BIGINT REFERENCES public.prospects(id) ON DELETE SET NULL,
  referral_id BIGINT REFERENCES public.affiliate_referrals(id) ON DELETE SET NULL,
  deal_value_gbp NUMERIC(12,2) NOT NULL DEFAULT 0,
  deal_type TEXT NOT NULL DEFAULT 'website',      -- website | ops | retainer | other
  deal_status TEXT NOT NULL DEFAULT 'proposed',    -- proposed | accepted | invoiced | paid | lost
  proposal_sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  invoiced_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  cash_collected_gbp NUMERIC(12,2) NOT NULL DEFAULT 0,
  -- Stripe integration
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  stripe_payment_link_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deals_prospect_id ON public.deals(prospect_id);
CREATE INDEX IF NOT EXISTS idx_deals_deal_status ON public.deals(deal_status);
CREATE INDEX IF NOT EXISTS idx_deals_paid_at ON public.deals(paid_at) WHERE paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_stripe_payment_intent_id ON public.deals(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
-- No public policies — all access through operator_* RPCs.

-- ─── paid_acquisition ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.paid_acquisition (
  id BIGSERIAL PRIMARY KEY,
  period_date DATE NOT NULL,                       -- day the spend covers
  channel TEXT NOT NULL DEFAULT 'google_ads',      -- google_ads | meta_ads | tiktok_ads
  ad_spend_gbp NUMERIC(12,2) NOT NULL DEFAULT 0,
  leads INT NOT NULL DEFAULT 0,
  customers INT NOT NULL DEFAULT 0,
  revenue_attributed_gbp NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (period_date, channel)
);

CREATE INDEX IF NOT EXISTS idx_paid_acquisition_period_date ON public.paid_acquisition(period_date);

ALTER TABLE public.paid_acquisition ENABLE ROW LEVEL SECURITY;

-- ─── ga4_weekly_metrics ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ga4_weekly_metrics (
  id BIGSERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  website_sessions BIGINT NOT NULL DEFAULT 0,
  mockup_page_views BIGINT NOT NULL DEFAULT 0,
  unique_mockup_visitors BIGINT NOT NULL DEFAULT 0,
  cta_conversions BIGINT NOT NULL DEFAULT 0,
  leads_from_ga4 BIGINT NOT NULL DEFAULT 0,        -- form_submit / thank_you_view events
  raw_response JSONB,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (week_start)
);

ALTER TABLE public.ga4_weekly_metrics ENABLE ROW LEVEL SECURITY;

-- ─── weekly_scorecard_snapshots ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.weekly_scorecard_snapshots (
  id BIGSERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  section TEXT NOT NULL,                           -- headline | prospecting | organic | partners | website | paid | commercial | funnel
  metric_key TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  target_value NUMERIC,
  source TEXT NOT NULL DEFAULT 'supabase',         -- supabase | ga4 | stripe | paid | computed
  raw_json JSONB,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (week_start, section, metric_key)
);

CREATE INDEX IF NOT EXISTS idx_scorecard_snapshots_week ON public.weekly_scorecard_snapshots(week_start, section);

ALTER TABLE public.weekly_scorecard_snapshots ENABLE ROW LEVEL SECURITY;

-- ─── scorecard_settings ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.scorecard_settings (
  key TEXT PRIMARY KEY,
  value NUMERIC NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scorecard_settings ENABLE ROW LEVEL SECURITY;

-- Seed default targets
INSERT INTO public.scorecard_settings (key, value, description) VALUES
  ('fy27_target_gbp',       250000,  'FY27 revenue target in GBP'),
  ('fy27_start_date',       20260801, 'FY27 start as YYYYMMDD integer'),
  ('fy27_end_date',         20270731, 'FY27 end as YYYYMMDD integer'),
  ('mockup_target_per_day', 20,      'Target mockups created per day'),
  ('websites_target_per_day', 2,     'Target websites built per day'),
  ('content_target_per_day', 2,      'Target content posts per day'),
  ('paid_budget_monthly_gbp', 500,   'Monthly paid acquisition budget'),
  ('paid_target_cpl_gbp',   20,      'Target cost per lead in GBP')
ON CONFLICT (key) DO NOTHING;

-- ─── updated_at triggers ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.maintain_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_deals_updated_at ON public.deals;
CREATE TRIGGER trg_deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.maintain_updated_at();

DROP TRIGGER IF EXISTS trg_paid_acquisition_updated_at ON public.paid_acquisition;
CREATE TRIGGER trg_paid_acquisition_updated_at BEFORE UPDATE ON public.paid_acquisition
  FOR EACH ROW EXECUTE FUNCTION public.maintain_updated_at();
