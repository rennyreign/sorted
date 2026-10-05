-- Machine-populated Companies House facts. Human judgement stays in prospect_workflow.

ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS ch_accounts_period_end date,
  ADD COLUMN IF NOT EXISTS ch_accounts_due_date date,
  ADD COLUMN IF NOT EXISTS ch_accounts_overdue boolean,
  ADD COLUMN IF NOT EXISTS ch_confirmation_due_date date,
  ADD COLUMN IF NOT EXISTS ch_confirmation_overdue boolean,
  ADD COLUMN IF NOT EXISTS ch_filing_url text,
  ADD COLUMN IF NOT EXISTS ch_filing_document_url text,
  ADD COLUMN IF NOT EXISTS ch_turnover numeric(14,2),
  ADD COLUMN IF NOT EXISTS ch_net_assets numeric(14,2),
  ADD COLUMN IF NOT EXISTS ch_cash numeric(14,2),
  ADD COLUMN IF NOT EXISTS ch_current_assets numeric(14,2),
  ADD COLUMN IF NOT EXISTS ch_liabilities numeric(14,2),
  ADD COLUMN IF NOT EXISTS ch_employees integer,
  ADD COLUMN IF NOT EXISTS ch_financial_facts jsonb,
  ADD COLUMN IF NOT EXISTS ch_data_updated_at timestamptz;

COMMENT ON COLUMN public.prospects.ch_turnover IS
  'Turnover explicitly disclosed in the latest Companies House filing; NULL means not disclosed or not parsed.';
COMMENT ON COLUMN public.prospects.ch_financial_facts IS
  'Machine-extracted iXBRL facts with current/prior values, source tags and filing period.';
