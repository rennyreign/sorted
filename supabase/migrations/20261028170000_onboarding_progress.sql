-- Onboarding progress table
-- Persists project-stage completion ticks from the client onboarding
-- workspace (/clients/<slug>). One row per completed timeline node so the
-- "current stage" marker is durable across devices and sessions instead of
-- living in browser storage.

CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL,               -- client workspace slug, e.g. 'derma-botanica'
  node_id text NOT NULL,            -- timeline node id, e.g. 'demo'
  completed_by text NOT NULL DEFAULT 'workspace',
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slug, node_id)
);

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Ticking happens on static pages with the anon key — anyone can record a
-- stage completion (same exposure level as agreements).
CREATE POLICY "Anyone can record onboarding progress"
  ON public.onboarding_progress
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anon can read onboarding progress"
  ON public.onboarding_progress
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Forward-only in the app; service role retains full access for corrections
CREATE POLICY "Service role can update onboarding progress"
  ON public.onboarding_progress
  FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete onboarding progress"
  ON public.onboarding_progress
  FOR DELETE
  TO service_role
  USING (true);

CREATE INDEX IF NOT EXISTS idx_onboarding_progress_slug ON public.onboarding_progress(slug);
