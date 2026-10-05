-- Scorecard V1.3 — snapshot skip non-numeric metrics
--
-- Remaining bug from docs/scorecard-bug-report.md (re-verification pass 3):
--   operator_save_scorecard_snapshot crashes on `pipeline_distribution`
--   because its `value` is a JSONB object (e.g. {"new": 1, "responded": 1}),
--   not a number. The function casts every `value->>'value'` to ::NUMERIC,
--   which raises "invalid input syntax for type numeric".
--
-- Fix: add a filter clause to skip metrics whose `value` is not a JSON number.
-- `pipeline_distribution` has no meaningful scalar metric_value anyway —
-- the frontend reads it specially via data.prospecting.pipeline_distribution?.value.

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
        AND jsonb_typeof(value->'value') = 'number'
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

REVOKE EXECUTE ON FUNCTION public.operator_save_scorecard_snapshot(text, date, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.operator_save_scorecard_snapshot(text, date, jsonb) TO anon, authenticated;
