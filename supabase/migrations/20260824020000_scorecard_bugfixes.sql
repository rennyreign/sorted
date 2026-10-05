-- Scorecard V1.1 — bugfixes
--
-- Addresses issues identified in docs/scorecard-bug-report.md:
--   1. HIGH: operator_save_scorecard_snapshot references non-existent columns
--   2. HIGH: website.leads substitutes organic CRM leads for GA4 leads
--   3. MEDIUM: FY27 week math floors partial weeks (integer division)
--   4. MEDIUM: prospects_added target reuses mockup target
--   5. LOW: mockups_sent has no prev value
--   6. LOW: operator_upsert_deal UPDATE branch cannot zero-out numeric fields
--   7. LOW: v_mockup_sent_total is a redundant duplicate of v_mockups_sent
--
-- Frontend fixes (cost-metric inversion, funnel label, £0-spend empty state)
-- are applied directly in Scorecard.tsx — no SQL needed.
--
-- Rollback:
--   (functions are CREATE OR REPLACE — re-run the original migration to revert)

-- ─── Fix 5: Add prospects_target_per_day setting ──────────────────────────────

INSERT INTO public.scorecard_settings (key, value, description) VALUES
  ('prospects_target_per_day', 40, 'Target prospects added per day (higher than mockup target)')
ON CONFLICT (key) DO NOTHING;

-- ─── Fix 1 + Fix 6 + Fix 9: operator_save_scorecard_snapshot column fix ───────

CREATE OR REPLACE FUNCTION public.operator_save_scorecard_snapshot(
  p_operator_token TEXT,
  p_week_start DATE,
  p_snapshot JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_section TEXT;
  v_metric RECORD;
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);

  -- p_snapshot is expected to be the full scorecard JSONB.
  -- We iterate the sections and metrics and upsert into weekly_scorecard_snapshots.
  FOR v_section IN SELECT * FROM jsonb_object_keys(p_snapshot) LOOP
    FOR v_metric IN
      SELECT
        key AS metric_key,
        (value->>'value')::NUMERIC AS metric_value,
        NULLIF(value->>'target', '')::NUMERIC AS target_value,
        COALESCE(value->>'source', 'computed') AS source
      FROM jsonb_each(p_snapshot -> v_section)
      WHERE jsonb_typeof(value) = 'object'
        AND value ? 'value'
    LOOP
      INSERT INTO public.weekly_scorecard_snapshots (week_start, section, metric_key, metric_value, target_value, source)
      VALUES (p_week_start, v_section, v_metric.metric_key, v_metric.metric_value, v_metric.target_value, v_metric.source)
      ON CONFLICT (week_start, section, metric_key) DO UPDATE SET
        metric_value = EXCLUDED.metric_value,
        target_value = EXCLUDED.target_value,
        source = EXCLUDED.source,
        captured_at = now();
    END LOOP;
  END LOOP;
END;
$$;

-- ─── Fix 9: operator_upsert_deal — allow zeroing out numeric fields ───────────
--
-- Changed: p_deal_value_gbp and p_cash_collected_gbp defaults from 0 to NULL.
-- NULL now means "leave unchanged"; 0 means "set to zero".
-- The Stripe webhook does NOT use this RPC (it updates deals directly),
-- so this change is safe.

CREATE OR REPLACE FUNCTION public.operator_upsert_deal(
  p_operator_token TEXT,
  p_id BIGINT DEFAULT NULL,
  p_prospect_id BIGINT DEFAULT NULL,
  p_referral_id BIGINT DEFAULT NULL,
  p_deal_value_gbp NUMERIC DEFAULT NULL,
  p_deal_type TEXT DEFAULT 'website',
  p_deal_status TEXT DEFAULT 'proposed',
  p_proposal_sent_at TIMESTAMPTZ DEFAULT NULL,
  p_accepted_at TIMESTAMPTZ DEFAULT NULL,
  p_invoiced_at TIMESTAMPTZ DEFAULT NULL,
  p_paid_at TIMESTAMPTZ DEFAULT NULL,
  p_cash_collected_gbp NUMERIC DEFAULT NULL,
  p_stripe_payment_intent_id TEXT DEFAULT NULL,
  p_stripe_checkout_session_id TEXT DEFAULT NULL,
  p_stripe_payment_link_id TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (id BIGINT, deal_status TEXT, deal_value_gbp NUMERIC, cash_collected_gbp NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id BIGINT;
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);

  IF p_id IS NOT NULL THEN
    UPDATE public.deals SET
      prospect_id = COALESCE(p_prospect_id, prospect_id),
      referral_id = COALESCE(p_referral_id, referral_id),
      deal_value_gbp = COALESCE(p_deal_value_gbp, deal_value_gbp),
      deal_type = COALESCE(NULLIF(p_deal_type, ''), deal_type),
      deal_status = COALESCE(NULLIF(p_deal_status, ''), deal_status),
      proposal_sent_at = COALESCE(p_proposal_sent_at, proposal_sent_at),
      accepted_at = COALESCE(p_accepted_at, accepted_at),
      invoiced_at = COALESCE(p_invoiced_at, invoiced_at),
      paid_at = COALESCE(p_paid_at, paid_at),
      cash_collected_gbp = COALESCE(p_cash_collected_gbp, cash_collected_gbp),
      stripe_payment_intent_id = COALESCE(p_stripe_payment_intent_id, stripe_payment_intent_id),
      stripe_checkout_session_id = COALESCE(p_stripe_checkout_session_id, stripe_checkout_session_id),
      stripe_payment_link_id = COALESCE(p_stripe_payment_link_id, stripe_payment_link_id),
      notes = COALESCE(p_notes, notes)
    WHERE id = p_id
    RETURNING id INTO v_id;
  ELSE
    INSERT INTO public.deals (
      prospect_id, referral_id, deal_value_gbp, deal_type, deal_status,
      proposal_sent_at, accepted_at, invoiced_at, paid_at, cash_collected_gbp,
      stripe_payment_intent_id, stripe_checkout_session_id, stripe_payment_link_id, notes
    ) VALUES (
      p_prospect_id, p_referral_id, COALESCE(p_deal_value_gbp, 0), p_deal_type, p_deal_status,
      p_proposal_sent_at, p_accepted_at, p_invoiced_at, p_paid_at, COALESCE(p_cash_collected_gbp, 0),
      p_stripe_payment_intent_id, p_stripe_checkout_session_id, p_stripe_payment_link_id, p_notes
    )
    RETURNING id INTO v_id;
  END IF;

  RETURN QUERY SELECT v_id, d.deal_status, d.deal_value_gbp, d.cash_collected_gbp
  FROM public.deals d WHERE d.id = v_id;
END;
$$;

-- ─── Fix 2 + Fix 3 + Fix 4 + Fix 5 + Fix 7 + Fix 10: operator_get_scorecard ──

CREATE OR REPLACE FUNCTION public.operator_get_scorecard(
  p_operator_token TEXT,
  p_week_start DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week_start DATE;
  v_week_end   DATE;
  v_prev_start DATE;
  v_prev_end   DATE;
  v_fy_start   DATE;
  v_fy_end     DATE;
  v_fy_target  NUMERIC;
  v_mockup_target_day NUMERIC;
  v_prospects_target_day NUMERIC;
  v_websites_target_day NUMERIC;
  v_content_target_day NUMERIC;
  v_paid_budget_month NUMERIC;
  v_paid_target_cpl NUMERIC;

  -- This week counts
  v_prospects_added      BIGINT;
  v_mockups_created      BIGINT;
  v_mockups_sent         BIGINT;
  v_mockup_responses     BIGINT;
  v_content_posts        BIGINT;
  v_content_tiktok       BIGINT;
  v_content_instagram    BIGINT;
  v_content_facebook     BIGINT;
  v_organic_leads        BIGINT;
  v_active_partners      BIGINT;
  v_new_partners         BIGINT;
  v_partner_mockups      BIGINT;
  v_partner_leads        BIGINT;
  v_partner_customers    BIGINT;
  v_partner_revenue      NUMERIC;
  v_leads_total          BIGINT;
  v_nods                 BIGINT;
  v_proposals            BIGINT;
  v_customers_won        BIGINT;
  v_revenue_won          NUMERIC;
  v_cash_collected       NUMERIC;
  v_avg_customer_value   NUMERIC;

  -- Previous week
  v_prev_prospects       BIGINT;
  v_prev_mockups         BIGINT;
  v_prev_mockups_sent    BIGINT;
  v_prev_content         BIGINT;
  v_prev_leads           BIGINT;
  v_prev_customers       BIGINT;
  v_prev_revenue         NUMERIC;

  -- FY27
  v_fy_revenue           NUMERIC;
  v_fy_customers         BIGINT;
  v_fy_weeks_elapsed     NUMERIC;
  v_fy_weeks_total       NUMERIC;
  v_fy_pct               NUMERIC;
  v_required_pace        NUMERIC;
  v_actual_pace          NUMERIC;
  v_forecast_revenue     NUMERIC;

  -- Pipeline value
  v_pipeline_value       NUMERIC;

  -- GA4
  v_ga_sessions          BIGINT;
  v_ga_mockup_views      BIGINT;
  v_ga_unique_mockup     BIGINT;
  v_ga_cta_conversions   BIGINT;
  v_ga_leads             BIGINT;

  -- Paid
  v_paid_spend           NUMERIC;
  v_paid_leads           BIGINT;
  v_paid_customers       BIGINT;
  v_paid_revenue         NUMERIC;
  v_cpl                  NUMERIC;
  v_cac                  NUMERIC;
  v_roas                 NUMERIC;

  -- Pipeline distribution
  v_pipeline_dist        JSONB;
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);

  -- ── Resolve dates ──────────────────────────────────────────────────────────
  v_week_start := COALESCE(p_week_start, CURRENT_DATE - (EXTRACT(ISODOW FROM CURRENT_DATE)::INT - 1));
  v_week_end   := v_week_start + 6;
  v_prev_start := v_week_start - 7;
  v_prev_end   := v_week_start - 1;

  v_fy_start := to_date(public.get_scorecard_setting('fy27_start_date')::TEXT, 'YYYYMMDD');
  v_fy_end   := to_date(public.get_scorecard_setting('fy27_end_date')::TEXT, 'YYYYMMDD');
  v_fy_target := public.get_scorecard_setting('fy27_target_gbp');
  v_mockup_target_day := public.get_scorecard_setting('mockup_target_per_day');
  v_prospects_target_day := public.get_scorecard_setting('prospects_target_per_day');
  v_websites_target_day := public.get_scorecard_setting('websites_target_per_day');
  v_content_target_day := public.get_scorecard_setting('content_target_per_day');
  v_paid_budget_month := public.get_scorecard_setting('paid_budget_monthly_gbp');
  v_paid_target_cpl := public.get_scorecard_setting('paid_target_cpl_gbp');

  -- ── Prospecting (this week) ────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_prospects_added
  FROM public.prospects
  WHERE first_seen_at >= v_week_start AND first_seen_at < v_week_end + 1;

  SELECT COUNT(*) INTO v_mockups_created
  FROM public.prospects
  WHERE mockup_created_at >= v_week_start AND mockup_created_at < v_week_end + 1;

  SELECT COUNT(*) INTO v_mockups_sent
  FROM public.prospects
  WHERE outreach_sent_at >= v_week_start AND outreach_sent_at < v_week_end + 1;

  -- Mockup → response rate (replies this week / mockups sent this week)
  SELECT COUNT(*) INTO v_mockup_responses
  FROM public.prospects
  WHERE email_replied_at >= v_week_start AND email_replied_at < v_week_end + 1;

  -- ── Organic marketing ──────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_content_posts
  FROM public.content_posts
  WHERE posted_at >= v_week_start AND posted_at < v_week_end + 1;

  SELECT
    COUNT(*) FILTER (WHERE channel = 'tiktok') INTO v_content_tiktok
  FROM public.content_posts
  WHERE posted_at >= v_week_start AND posted_at < v_week_end + 1;

  -- Instagram and Facebook are not yet in the channel enum; count as 0 for now
  v_content_instagram := 0;
  v_content_facebook := 0;

  SELECT COUNT(*) INTO v_organic_leads
  FROM public.prospects
  WHERE channel = 'organic'
    AND first_seen_at >= v_week_start AND first_seen_at < v_week_end + 1;

  -- ── Partners ───────────────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_active_partners
  FROM public.affiliates WHERE status = 'active';

  SELECT COUNT(*) INTO v_new_partners
  FROM public.affiliates
  WHERE created_at >= v_week_start AND created_at < v_week_end + 1;

  SELECT COUNT(*) INTO v_partner_mockups
  FROM public.affiliate_referrals
  WHERE created_at >= v_week_start AND created_at < v_week_end + 1;

  SELECT COUNT(*) INTO v_partner_leads
  FROM public.prospects
  WHERE channel = 'partner'
    AND first_seen_at >= v_week_start AND first_seen_at < v_week_end + 1;

  SELECT COUNT(*) INTO v_partner_customers
  FROM public.affiliate_referrals
  WHERE status = 'purchased'
    AND purchased_at >= v_week_start AND purchased_at < v_week_end + 1;

  SELECT COALESCE(SUM(d.cash_collected_gbp), 0) INTO v_partner_revenue
  FROM public.deals d
  JOIN public.prospects p ON p.id = d.prospect_id
  WHERE p.channel = 'partner'
    AND d.paid_at >= v_week_start AND d.paid_at < v_week_end + 1;

  -- ── Website / mockups (GA4 cache) ──────────────────────────────────────────
  SELECT
    COALESCE(website_sessions, 0),
    COALESCE(mockup_page_views, 0),
    COALESCE(unique_mockup_visitors, 0),
    COALESCE(cta_conversions, 0),
    COALESCE(leads_from_ga4, 0)
  INTO v_ga_sessions, v_ga_mockup_views, v_ga_unique_mockup, v_ga_cta_conversions, v_ga_leads
  FROM public.ga4_weekly_metrics
  WHERE week_start = v_week_start;

  -- ── Paid acquisition ───────────────────────────────────────────────────────
  SELECT
    COALESCE(SUM(ad_spend_gbp), 0),
    COALESCE(SUM(leads), 0),
    COALESCE(SUM(customers), 0),
    COALESCE(SUM(revenue_attributed_gbp), 0)
  INTO v_paid_spend, v_paid_leads, v_paid_customers, v_paid_revenue
  FROM public.paid_acquisition
  WHERE period_date >= v_week_start AND period_date <= v_week_end;

  v_cpl := CASE WHEN v_paid_leads > 0 THEN v_paid_spend / v_paid_leads ELSE NULL END;
  v_cac := CASE WHEN v_paid_customers > 0 THEN v_paid_spend / v_paid_customers ELSE NULL END;
  v_roas := CASE WHEN v_paid_spend > 0 THEN v_paid_revenue / v_paid_spend ELSE NULL END;

  -- ── Commercial ─────────────────────────────────────────────────────────────
  -- Leads = inbound (organic + partner) + website form submissions
  SELECT COUNT(*) INTO v_leads_total
  FROM public.prospects
  WHERE first_seen_at >= v_week_start AND first_seen_at < v_week_end + 1
    AND COALESCE(channel, '') IN ('organic', 'partner', 'tiktok', 'linkedin', 'youtube');

  -- NODs = prospects who showed interest this week (responded or further)
  SELECT COUNT(*) INTO v_nods
  FROM public.prospects
  WHERE status_updated_at >= v_week_start AND status_updated_at < v_week_end + 1
    AND crm_status IN ('responded','mockup_revealed','build','quote','paid');

  -- Proposals = deals with proposal_sent this week
  SELECT COUNT(*) INTO v_proposals
  FROM public.deals
  WHERE proposal_sent_at >= v_week_start AND proposal_sent_at < v_week_end + 1;

  -- Customers won = deals paid this week
  SELECT COUNT(*), COALESCE(SUM(deal_value_gbp), 0), COALESCE(SUM(cash_collected_gbp), 0)
  INTO v_customers_won, v_revenue_won, v_cash_collected
  FROM public.deals
  WHERE deal_status = 'paid'
    AND paid_at >= v_week_start AND paid_at < v_week_end + 1;

  v_avg_customer_value := CASE WHEN v_customers_won > 0 THEN v_revenue_won / v_customers_won ELSE NULL END;

  -- Pipeline value = open deals (proposed + accepted + invoiced)
  SELECT COALESCE(SUM(deal_value_gbp), 0) INTO v_pipeline_value
  FROM public.deals
  WHERE deal_status IN ('proposed','accepted','invoiced');

  -- ── FY27 headline ──────────────────────────────────────────────────────────
  SELECT COALESCE(SUM(cash_collected_gbp), 0), COUNT(*)
  INTO v_fy_revenue, v_fy_customers
  FROM public.deals
  WHERE deal_status = 'paid'
    AND paid_at >= v_fy_start AND paid_at <= v_fy_end + 1;

  -- Fix 4: use numeric division for fractional weeks (no floor in week 1)
  v_fy_weeks_total := (v_fy_end - v_fy_start)::NUMERIC / 7;
  v_fy_weeks_elapsed := GREATEST((CURRENT_DATE - v_fy_start)::NUMERIC / 7, 0);
  v_fy_pct := CASE WHEN v_fy_target > 0 THEN (v_fy_revenue / v_fy_target) * 100 ELSE NULL END;
  v_required_pace := CASE WHEN v_fy_weeks_total > 0 THEN v_fy_target / v_fy_weeks_total ELSE NULL END;
  v_actual_pace := CASE WHEN v_fy_weeks_elapsed > 0 THEN v_fy_revenue / v_fy_weeks_elapsed ELSE NULL END;
  v_forecast_revenue := CASE WHEN v_fy_weeks_elapsed > 0 THEN v_actual_pace * v_fy_weeks_total ELSE NULL END;

  -- ── Previous week (for variance) ───────────────────────────────────────────
  SELECT COUNT(*) INTO v_prev_prospects
  FROM public.prospects
  WHERE first_seen_at >= v_prev_start AND first_seen_at < v_week_start;

  SELECT COUNT(*) INTO v_prev_mockups
  FROM public.prospects
  WHERE mockup_created_at >= v_prev_start AND mockup_created_at < v_week_start;

  -- Fix 7: add prev week mockups_sent
  SELECT COUNT(*) INTO v_prev_mockups_sent
  FROM public.prospects
  WHERE outreach_sent_at >= v_prev_start AND outreach_sent_at < v_week_start;

  SELECT COUNT(*) INTO v_prev_content
  FROM public.content_posts
  WHERE posted_at >= v_prev_start AND posted_at < v_week_start;

  SELECT COUNT(*) INTO v_prev_leads
  FROM public.prospects
  WHERE first_seen_at >= v_prev_start AND first_seen_at < v_week_start
    AND COALESCE(channel, '') IN ('organic', 'partner', 'tiktok', 'linkedin', 'youtube');

  SELECT COUNT(*), COALESCE(SUM(deal_value_gbp), 0)
  INTO v_prev_customers, v_prev_revenue
  FROM public.deals
  WHERE deal_status = 'paid'
    AND paid_at >= v_prev_start AND paid_at < v_week_start;

  -- ── Pipeline status distribution ───────────────────────────────────────────
  SELECT jsonb_object_agg(COALESCE(crm_status, 'unknown'), cnt) INTO v_pipeline_dist
  FROM (
    SELECT crm_status, COUNT(*)::BIGINT AS cnt
    FROM public.prospects
    WHERE crm_status NOT IN ('lost', 'na') OR crm_status IS NULL
    GROUP BY crm_status
  ) t;

  -- ── Assemble JSONB response ────────────────────────────────────────────────
  RETURN jsonb_build_object(
    'meta', jsonb_build_object(
      'week_start', v_week_start,
      'week_end', v_week_end,
      'fy_start', v_fy_start,
      'fy_end', v_fy_end,
      'generated_at', now()
    ),
    'headline', jsonb_build_object(
      'fy27_revenue',      jsonb_build_object('value', v_fy_revenue, 'target', v_fy_target, 'source', 'stripe'),
      'revenue_pace',      jsonb_build_object('value', v_actual_pace, 'target', v_required_pace, 'source', 'computed'),
      'customers_won',     jsonb_build_object('value', v_customers_won, 'prev', v_prev_customers, 'source', 'supabase'),
      'leads',             jsonb_build_object('value', v_leads_total, 'prev', v_prev_leads, 'source', 'supabase'),
      'pipeline_value',    jsonb_build_object('value', v_pipeline_value, 'source', 'supabase')
    ),
    'fy27', jsonb_build_object(
      'revenue',           jsonb_build_object('value', v_fy_revenue, 'target', v_fy_target, 'source', 'stripe'),
      'pct_achieved',      jsonb_build_object('value', v_fy_pct, 'source', 'computed'),
      'required_pace',     jsonb_build_object('value', v_required_pace, 'source', 'computed'),
      'actual_pace',       jsonb_build_object('value', v_actual_pace, 'source', 'computed'),
      'forecast_revenue',  jsonb_build_object('value', v_forecast_revenue, 'source', 'computed'),
      'weeks_elapsed',     jsonb_build_object('value', v_fy_weeks_elapsed, 'source', 'computed'),
      'weeks_total',       jsonb_build_object('value', v_fy_weeks_total, 'source', 'computed')
    ),
    'prospecting', jsonb_build_object(
      'prospects_added',   jsonb_build_object('value', v_prospects_added, 'prev', v_prev_prospects, 'target', v_prospects_target_day * 7, 'source', 'supabase'),
      'mockups_created',   jsonb_build_object('value', v_mockups_created, 'prev', v_prev_mockups, 'target', v_mockup_target_day * 7, 'source', 'supabase'),
      'mockups_sent',      jsonb_build_object('value', v_mockups_sent, 'prev', v_prev_mockups_sent, 'target', v_mockup_target_day * 7, 'source', 'supabase'),
      'mockup_response_rate', jsonb_build_object('value', CASE WHEN v_mockups_sent > 0 THEN (v_mockup_responses::NUMERIC / v_mockups_sent) * 100 ELSE NULL END, 'source', 'computed'),
      'pipeline_distribution', jsonb_build_object('value', v_pipeline_dist, 'source', 'supabase')
    ),
    'organic', jsonb_build_object(
      'websites_built',    jsonb_build_object('value', v_mockups_created, 'prev', v_prev_mockups, 'target', v_websites_target_day * 7, 'source', 'supabase'),
      'content_posts',     jsonb_build_object('value', v_content_posts, 'prev', v_prev_content, 'target', v_content_target_day * 7, 'source', 'supabase'),
      'posts_tiktok',      jsonb_build_object('value', v_content_tiktok, 'source', 'supabase'),
      'posts_instagram',   jsonb_build_object('value', v_content_instagram, 'source', 'supabase'),
      'posts_facebook',    jsonb_build_object('value', v_content_facebook, 'source', 'supabase'),
      'organic_leads',     jsonb_build_object('value', v_organic_leads, 'source', 'supabase')
    ),
    'partners', jsonb_build_object(
      'active_partners',   jsonb_build_object('value', v_active_partners, 'source', 'supabase'),
      'new_partners',      jsonb_build_object('value', v_new_partners, 'source', 'supabase'),
      'partner_mockups',   jsonb_build_object('value', v_partner_mockups, 'source', 'supabase'),
      'partner_leads',     jsonb_build_object('value', v_partner_leads, 'source', 'supabase'),
      'partner_customers', jsonb_build_object('value', v_partner_customers, 'source', 'supabase'),
      'partner_revenue',   jsonb_build_object('value', v_partner_revenue, 'source', 'stripe')
    ),
    'website', jsonb_build_object(
      'sessions',          jsonb_build_object('value', v_ga_sessions, 'source', 'ga4'),
      'mockup_page_views', jsonb_build_object('value', v_ga_mockup_views, 'source', 'ga4'),
      'unique_mockup_visitors', jsonb_build_object('value', v_ga_unique_mockup, 'source', 'ga4'),
      'cta_conversions',   jsonb_build_object('value', v_ga_cta_conversions, 'source', 'ga4'),
      'leads',             jsonb_build_object('value', v_ga_leads, 'source', 'ga4'),
      'visitor_to_lead',   jsonb_build_object('value', CASE WHEN v_ga_sessions > 0 THEN (v_ga_leads::NUMERIC / v_ga_sessions) * 100 ELSE NULL END, 'source', 'computed'),
      'mockup_to_lead',    jsonb_build_object('value', CASE WHEN v_ga_mockup_views > 0 THEN (v_ga_leads::NUMERIC / v_ga_mockup_views) * 100 ELSE NULL END, 'source', 'computed')
    ),
    'paid', jsonb_build_object(
      'ad_spend',          jsonb_build_object('value', v_paid_spend, 'target', v_paid_budget_month / 4.33, 'source', 'paid'),
      'leads',             jsonb_build_object('value', v_paid_leads, 'source', 'paid'),
      'cpl',               jsonb_build_object('value', v_cpl, 'target', v_paid_target_cpl, 'source', 'computed', 'lower_is_better', true),
      'customers',         jsonb_build_object('value', v_paid_customers, 'source', 'paid'),
      'cac',               jsonb_build_object('value', v_cac, 'source', 'computed', 'lower_is_better', true),
      'revenue_attributed',jsonb_build_object('value', v_paid_revenue, 'source', 'paid'),
      'roas',              jsonb_build_object('value', v_roas, 'source', 'computed')
    ),
    'commercial', jsonb_build_object(
      'leads',             jsonb_build_object('value', v_leads_total, 'prev', v_prev_leads, 'source', 'supabase'),
      'nods',              jsonb_build_object('value', v_nods, 'source', 'supabase'),
      'proposals',         jsonb_build_object('value', v_proposals, 'source', 'supabase'),
      'customers_won',     jsonb_build_object('value', v_customers_won, 'prev', v_prev_customers, 'source', 'supabase'),
      'revenue_won',       jsonb_build_object('value', v_revenue_won, 'prev', v_prev_revenue, 'source', 'stripe'),
      'cash_collected',    jsonb_build_object('value', v_cash_collected, 'source', 'stripe'),
      'avg_customer_value',jsonb_build_object('value', v_avg_customer_value, 'source', 'computed'),
      'lead_to_customer',  jsonb_build_object('value', CASE WHEN v_leads_total > 0 THEN (v_customers_won::NUMERIC / v_leads_total) * 100 ELSE NULL END, 'source', 'computed')
    ),
    'funnel', jsonb_build_object(
      'prospects',         jsonb_build_object('value', v_prospects_added, 'source', 'supabase'),
      'mockups',           jsonb_build_object('value', v_mockups_created, 'source', 'supabase'),
      'views_responses',   jsonb_build_object('value', v_mockup_responses, 'source', 'supabase'),
      'leads_nods',        jsonb_build_object('value', v_nods, 'source', 'supabase'),
      'customers',         jsonb_build_object('value', v_customers_won, 'source', 'supabase'),
      'revenue',           jsonb_build_object('value', v_revenue_won, 'source', 'stripe')
    )
  );
END;
$$;

-- ─── Revoke / grant (signatures unchanged for snapshot + get_scorecard) ──────

REVOKE EXECUTE ON FUNCTION public.operator_save_scorecard_snapshot(text, date, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.operator_save_scorecard_snapshot(text, date, jsonb) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.operator_get_scorecard(text, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.operator_get_scorecard(text, date) TO anon, authenticated;

-- operator_upsert_deal signature unchanged (defaults changed from 0 to NULL, but types are the same)
REVOKE EXECUTE ON FUNCTION public.operator_upsert_deal(text, bigint, bigint, bigint, numeric, text, text, timestamptz, timestamptz, timestamptz, timestamptz, numeric, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.operator_upsert_deal(text, bigint, bigint, bigint, numeric, text, text, timestamptz, timestamptz, timestamptz, timestamptz, numeric, text, text, text, text) TO anon, authenticated;
