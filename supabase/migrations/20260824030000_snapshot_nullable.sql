-- Scorecard V1.2 — snapshot NULL fix
--
-- Bug A from docs/scorecard-bug-report.md (verification pass):
--   operator_save_scorecard_snapshot crashes with NOT NULL violation because
--   many metrics legitimately return NULL (cpl, cac, roas, avg_customer_value,
--   mockup_response_rate, visitor_to_lead, mockup_to_lead, actual_pace,
--   forecast_revenue, pct_achieved, lead_to_customer).
--
-- Fix: make weekly_scorecard_snapshots.metric_value nullable, matching the
-- already-nullable target_value column. This preserves the distinction between
-- "metric exists but no data yet" (NULL) and "metric is zero" (0).

ALTER TABLE public.weekly_scorecard_snapshots
  ALTER COLUMN metric_value DROP NOT NULL;
