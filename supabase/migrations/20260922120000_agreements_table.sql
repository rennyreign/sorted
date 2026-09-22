-- Agreements table
-- Persists client signatures from proposal / quote / delivery accept flows.
-- Previously signatures lived only in React state and were lost on reload —
-- this table is the durable record used by the operator Clients directory.

CREATE TABLE IF NOT EXISTS public.agreements (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL,               -- page slug, e.g. 'savannah-villegas'
  doc_type text NOT NULL,           -- proposal | agreement | delivery | quote
  page_path text NOT NULL,          -- e.g. '/clients/savannah-villegas'
  client_name text NOT NULL,
  signer_name text NOT NULL,
  signed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;

-- Signing happens on static pages with the anon key — anyone can record a signature.
CREATE POLICY "Anyone can record an agreement signature"
  ON public.agreements
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Client pages rehydrate "Signed by X on Y" on load, and the operator
-- Clients directory lists signatures — both use the anon key.
-- (Same exposure level as the prospects table, which is already anon-readable.)
CREATE POLICY "Anon can read agreements"
  ON public.agreements
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Service role retains full access for corrections
CREATE POLICY "Service role can update agreements"
  ON public.agreements
  FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete agreements"
  ON public.agreements
  FOR DELETE
  TO service_role
  USING (true);

CREATE INDEX IF NOT EXISTS idx_agreements_slug ON public.agreements(slug);
CREATE INDEX IF NOT EXISTS idx_agreements_signed_at ON public.agreements(signed_at DESC);
