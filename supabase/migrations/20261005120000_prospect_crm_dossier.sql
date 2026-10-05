-- Prospect CRM dossier: human research layered over machine enrichment.

ALTER TABLE public.prospect_workflow
  ADD COLUMN IF NOT EXISTS research_status text NOT NULL DEFAULT 'unreviewed'
    CHECK (research_status IN ('unreviewed', 'researching', 'reviewed', 'stale')),
  ADD COLUMN IF NOT EXISTS scout_decision text NOT NULL DEFAULT 'undecided'
    CHECK (scout_decision IN ('undecided', 'priority', 'watch', 'pass')),
  ADD COLUMN IF NOT EXISTS scout_priority smallint CHECK (scout_priority BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS decision_reason text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

CREATE INDEX IF NOT EXISTS prospect_workflow_research_idx
  ON public.prospect_workflow(research_status, scout_decision, scout_priority);

CREATE TABLE IF NOT EXISTS public.prospect_financial_reviews (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  prospect_id bigint NOT NULL REFERENCES public.prospects(id) ON DELETE RESTRICT,
  company_number text,
  filing_date date,
  period_end date,
  accounts_type text,
  turnover numeric(14,2),
  net_assets numeric(14,2),
  cash_or_reserves numeric(14,2),
  liabilities numeric(14,2),
  currency text NOT NULL DEFAULT 'GBP' CHECK (currency IN ('GBP', 'EUR', 'USD', 'CAD', 'SGD', 'OTHER')),
  financial_strength text NOT NULL CHECK (financial_strength IN ('strong', 'adequate', 'weak', 'unclear')),
  trajectory text NOT NULL DEFAULT 'unknown' CHECK (trajectory IN ('improving', 'stable', 'declining', 'unknown')),
  confidence text NOT NULL DEFAULT 'medium' CHECK (confidence IN ('high', 'medium', 'low')),
  summary text NOT NULL,
  source_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prospect_financial_reviews_prospect_idx
  ON public.prospect_financial_reviews(prospect_id, created_at DESC);

ALTER TABLE public.prospect_financial_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prospect financial reviews readable" ON public.prospect_financial_reviews
  FOR SELECT TO anon, authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.prospect_financial_reviews FROM anon, authenticated;
GRANT SELECT ON public.prospect_financial_reviews TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.prospect_contacts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  prospect_id bigint NOT NULL REFERENCES public.prospects(id) ON DELETE RESTRICT,
  name text NOT NULL,
  role text,
  email text,
  phone text,
  linkedin_url text,
  source text,
  verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('verified', 'likely', 'unverified', 'invalid')),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prospect_contacts_prospect_idx
  ON public.prospect_contacts(prospect_id, is_primary DESC, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS prospect_contacts_one_primary_idx
  ON public.prospect_contacts(prospect_id) WHERE is_primary;

ALTER TABLE public.prospect_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prospect contacts readable" ON public.prospect_contacts
  FOR SELECT TO anon, authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.prospect_contacts FROM anon, authenticated;
GRANT SELECT ON public.prospect_contacts TO anon, authenticated;

ALTER TABLE public.prospect_activity DROP CONSTRAINT IF EXISTS prospect_activity_event_type_check;
ALTER TABLE public.prospect_activity ADD CONSTRAINT prospect_activity_event_type_check CHECK (event_type IN (
  'shortlisted', 'unshortlisted', 'action_scheduled', 'action_completed',
  'note', 'call', 'research_updated', 'financial_reviewed', 'contact_saved'
));

CREATE OR REPLACE FUNCTION public.save_prospect_research(
  p_operator_token text,
  p_prospect_id bigint,
  p_research_status text,
  p_scout_decision text,
  p_scout_priority smallint DEFAULT NULL,
  p_decision_reason text DEFAULT NULL
)
RETURNS public.prospect_workflow
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_row public.prospect_workflow;
  v_reason text := NULLIF(btrim(p_decision_reason), '');
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);
  IF p_research_status NOT IN ('unreviewed', 'researching', 'reviewed', 'stale') THEN
    RAISE EXCEPTION 'invalid research status';
  END IF;
  IF p_scout_decision NOT IN ('undecided', 'priority', 'watch', 'pass') THEN
    RAISE EXCEPTION 'invalid scout decision';
  END IF;
  IF p_scout_priority IS NOT NULL AND (p_scout_priority < 1 OR p_scout_priority > 5) THEN
    RAISE EXCEPTION 'scout priority must be between 1 and 5';
  END IF;
  IF p_scout_decision IN ('priority', 'watch', 'pass') AND v_reason IS NULL THEN
    RAISE EXCEPTION 'decision reason required';
  END IF;

  INSERT INTO public.prospect_workflow(
    prospect_id, research_status, scout_decision, scout_priority, decision_reason, reviewed_at
  ) VALUES (
    p_prospect_id, p_research_status, p_scout_decision, p_scout_priority, v_reason,
    CASE WHEN p_research_status = 'reviewed' THEN now() ELSE NULL END
  )
  ON CONFLICT (prospect_id) DO UPDATE SET
    research_status = EXCLUDED.research_status,
    scout_decision = EXCLUDED.scout_decision,
    scout_priority = EXCLUDED.scout_priority,
    decision_reason = EXCLUDED.decision_reason,
    reviewed_at = CASE WHEN EXCLUDED.research_status = 'reviewed'
      THEN COALESCE(public.prospect_workflow.reviewed_at, now())
      ELSE public.prospect_workflow.reviewed_at END,
    updated_at = now()
  RETURNING * INTO v_row;

  INSERT INTO public.prospect_activity(prospect_id, event_type, note)
  VALUES (p_prospect_id, 'research_updated', concat_ws(' — ', p_research_status || ' / ' || p_scout_decision, v_reason));
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_prospect_financial_review(
  p_operator_token text, p_prospect_id bigint, p_company_number text,
  p_filing_date date, p_period_end date, p_accounts_type text,
  p_turnover numeric, p_net_assets numeric, p_cash_or_reserves numeric, p_liabilities numeric,
  p_currency text, p_financial_strength text, p_trajectory text, p_confidence text,
  p_summary text, p_source_url text
)
RETURNS public.prospect_financial_reviews
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_row public.prospect_financial_reviews;
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);
  IF NULLIF(btrim(p_summary), '') IS NULL OR NULLIF(btrim(p_source_url), '') IS NULL THEN
    RAISE EXCEPTION 'summary and source URL required';
  END IF;
  INSERT INTO public.prospect_financial_reviews(
    prospect_id, company_number, filing_date, period_end, accounts_type,
    turnover, net_assets, cash_or_reserves, liabilities, currency,
    financial_strength, trajectory, confidence, summary, source_url
  ) VALUES (
    p_prospect_id, NULLIF(btrim(p_company_number), ''), p_filing_date, p_period_end,
    NULLIF(btrim(p_accounts_type), ''), p_turnover, p_net_assets, p_cash_or_reserves,
    p_liabilities, COALESCE(NULLIF(p_currency, ''), 'GBP'), p_financial_strength,
    p_trajectory, p_confidence, btrim(p_summary), btrim(p_source_url)
  ) RETURNING * INTO v_row;
  INSERT INTO public.prospect_activity(prospect_id, event_type, note)
  VALUES (p_prospect_id, 'financial_reviewed', p_financial_strength || ' — ' || btrim(p_summary));
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_prospect_contact(
  p_operator_token text, p_prospect_id bigint, p_id bigint DEFAULT NULL,
  p_name text DEFAULT NULL, p_role text DEFAULT NULL, p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL, p_linkedin_url text DEFAULT NULL, p_source text DEFAULT NULL,
  p_verification_status text DEFAULT 'unverified', p_is_primary boolean DEFAULT false
)
RETURNS public.prospect_contacts
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_row public.prospect_contacts;
BEGIN
  PERFORM public.verify_operator_token(p_operator_token);
  IF NULLIF(btrim(p_name), '') IS NULL THEN RAISE EXCEPTION 'contact name required'; END IF;
  IF p_is_primary THEN
    UPDATE public.prospect_contacts SET is_primary = false, updated_at = now()
    WHERE prospect_id = p_prospect_id AND is_primary;
  END IF;
  IF p_id IS NULL THEN
    INSERT INTO public.prospect_contacts(
      prospect_id, name, role, email, phone, linkedin_url, source, verification_status, is_primary
    ) VALUES (
      p_prospect_id, btrim(p_name), NULLIF(btrim(p_role), ''), NULLIF(btrim(p_email), ''),
      NULLIF(btrim(p_phone), ''), NULLIF(btrim(p_linkedin_url), ''), NULLIF(btrim(p_source), ''),
      p_verification_status, p_is_primary
    ) RETURNING * INTO v_row;
  ELSE
    UPDATE public.prospect_contacts SET
      name = btrim(p_name), role = NULLIF(btrim(p_role), ''), email = NULLIF(btrim(p_email), ''),
      phone = NULLIF(btrim(p_phone), ''), linkedin_url = NULLIF(btrim(p_linkedin_url), ''),
      source = NULLIF(btrim(p_source), ''), verification_status = p_verification_status,
      is_primary = p_is_primary, updated_at = now()
    WHERE id = p_id AND prospect_id = p_prospect_id RETURNING * INTO v_row;
    IF NOT FOUND THEN RAISE EXCEPTION 'contact not found'; END IF;
  END IF;
  INSERT INTO public.prospect_activity(prospect_id, event_type, note)
  VALUES (p_prospect_id, 'contact_saved', btrim(p_name));
  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.save_prospect_research(text, bigint, text, text, smallint, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_prospect_financial_review(text, bigint, text, date, date, text, numeric, numeric, numeric, numeric, text, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_prospect_contact(text, bigint, bigint, text, text, text, text, text, text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_prospect_research(text, bigint, text, text, smallint, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_prospect_financial_review(text, bigint, text, date, date, text, numeric, numeric, numeric, numeric, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_prospect_contact(text, bigint, bigint, text, text, text, text, text, text, text, boolean) TO anon, authenticated;
