-- Quote counter-offer responses table
-- Stores client counter-offers that fall below the auto-accept floor
-- Edge function `quote-counter-offer` inserts here and sends email to Renaldo

CREATE TABLE IF NOT EXISTS public.quote_responses (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_slug text NOT NULL,
  client_name text NOT NULL,
  original_amount integer NOT NULL,
  proposed_amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending_review',
  signer_ip inet,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text,
  review_notes text
);

-- RLS: allow public inserts (anon key), deny reads from anon
ALTER TABLE public.quote_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a quote response"
  ON public.quote_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only service role can read/update
CREATE POLICY "Service role can read all quote responses"
  ON public.quote_responses
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update quote responses"
  ON public.quote_responses
  FOR UPDATE
  TO service_role
  USING (true);

-- Index for lookup by client_slug
CREATE INDEX IF NOT EXISTS idx_quote_responses_client_slug ON public.quote_responses(client_slug);

-- Index for pending review lookup
CREATE INDEX IF NOT EXISTS idx_quote_responses_status ON public.quote_responses(status);
