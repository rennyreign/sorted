-- Close anon-key exposure flagged by Supabase security advisor (rls_disabled_in_public).
--
-- sorted_messages / sorted_changes: written only by the sorted-updates Python
-- backend via SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS. No anon access
-- needed; RLS enabled with no policies = fully closed to anon/authenticated.
-- (This applies the intent of unapplied migration 20260803020000.)
--
-- prospect_runs: written by new-business-finder operator via SUPABASE_SERVICE_KEY
-- (bypasses RLS); read by the operator dashboard (NewBusinessFinderRun.tsx) via
-- the publishable anon key. SELECT-only policy keeps the dashboard working while
-- removing anon insert/update/delete.

ALTER TABLE public.sorted_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sorted_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prospect_runs_anon_read"
  ON public.prospect_runs
  FOR SELECT
  TO anon, authenticated
  USING (true);
