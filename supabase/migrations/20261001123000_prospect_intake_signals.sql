-- Cheap Google Maps intake evidence is not the website score.
-- Values remain null on older records until a Finder run refreshes them.
ALTER TABLE public.prospects
  ADD COLUMN IF NOT EXISTS intake_category text,
  ADD COLUMN IF NOT EXISTS intake_priority smallint CHECK (intake_priority BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS intake_signals jsonb;

CREATE INDEX IF NOT EXISTS prospects_intake_priority_idx
  ON public.prospects(intake_priority DESC)
  WHERE intake_priority IS NOT NULL;

-- Rollback: DROP INDEX public.prospects_intake_priority_idx;
-- ALTER TABLE public.prospects DROP COLUMN intake_signals, DROP COLUMN intake_priority, DROP COLUMN intake_category;
