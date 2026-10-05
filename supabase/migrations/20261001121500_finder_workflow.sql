-- Finder's human-decision layer. Keep this separate from the acquisition
-- operator's prospects table and the autonomous outreach sender's READY flag.
-- Writes are open to anyone holding the public anon key (same posture as the
-- rest of the operator dashboard). Auth/membership gating was removed
-- deliberately on 2026-10-04 and should be revisited as the team grows.
--
-- Rollback (only after exporting any human-entered history):
-- DROP FUNCTION IF EXISTS public.finder_action(bigint, text, text, timestamptz, text);
-- DROP TABLE IF EXISTS public.prospect_activity;
-- DROP TABLE IF EXISTS public.prospect_workflow;

CREATE TABLE IF NOT EXISTS public.prospect_workflow (
  prospect_id bigint PRIMARY KEY REFERENCES public.prospects(id) ON DELETE RESTRICT,
  shortlisted_at timestamptz,
  next_action_type text CHECK (next_action_type IN ('first_outreach', 'follow_up', 'review', 'mockup', 'other')),
  next_action_at timestamptz,
  next_action_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT next_action_complete_pair CHECK (
    (next_action_type IS NULL AND next_action_at IS NULL)
    OR (next_action_type IS NOT NULL AND next_action_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS prospect_workflow_due_idx
  ON public.prospect_workflow(next_action_at)
  WHERE next_action_at IS NOT NULL;

ALTER TABLE public.prospect_workflow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Finder workflow readable" ON public.prospect_workflow
  FOR SELECT TO anon, authenticated USING (true);
-- Browser clients may read workflow, but all mutations go through finder_action.
REVOKE INSERT, UPDATE, DELETE ON public.prospect_workflow FROM anon, authenticated;
GRANT SELECT ON public.prospect_workflow TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.prospect_activity (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  prospect_id bigint NOT NULL REFERENCES public.prospects(id) ON DELETE RESTRICT,
  event_type text NOT NULL CHECK (event_type IN (
    'shortlisted', 'unshortlisted', 'action_scheduled', 'action_completed',
    'note', 'call'
  )),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prospect_activity_prospect_time_idx
  ON public.prospect_activity(prospect_id, created_at DESC);

ALTER TABLE public.prospect_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Finder activity readable" ON public.prospect_activity
  FOR SELECT TO anon, authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.prospect_activity FROM anon, authenticated;
GRANT SELECT ON public.prospect_activity TO anon, authenticated;

-- Atomic state change + audit event. No prospect CRM or outreach flag changes;
-- a human shortlist must never implicitly queue or send a message.
CREATE OR REPLACE FUNCTION public.finder_action(
  p_prospect_id bigint,
  p_action text,
  p_next_action_type text DEFAULT NULL,
  p_next_action_at timestamptz DEFAULT NULL,
  p_note text DEFAULT NULL
)
RETURNS public.prospect_workflow
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row public.prospect_workflow;
  v_event text;
  v_note text := NULLIF(btrim(p_note), '');
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.prospects WHERE id = p_prospect_id) THEN
    RAISE EXCEPTION 'prospect not found';
  END IF;

  IF p_action = 'shortlist' THEN
    INSERT INTO public.prospect_workflow(prospect_id, shortlisted_at)
    VALUES (p_prospect_id, now())
    ON CONFLICT (prospect_id) DO UPDATE
      SET shortlisted_at = COALESCE(prospect_workflow.shortlisted_at, now()),
          updated_at = now()
    WHERE prospect_workflow.shortlisted_at IS NULL
    RETURNING * INTO v_row;
    IF NOT FOUND THEN RAISE EXCEPTION 'prospect already shortlisted'; END IF;
    v_event := 'shortlisted';
  ELSIF p_action = 'unshortlist' THEN
    UPDATE public.prospect_workflow
      SET shortlisted_at = NULL, next_action_type = NULL,
          next_action_at = NULL, next_action_note = NULL, updated_at = now()
    WHERE prospect_id = p_prospect_id AND shortlisted_at IS NOT NULL
    RETURNING * INTO v_row;
    IF NOT FOUND THEN RAISE EXCEPTION 'prospect is not shortlisted'; END IF;
    v_event := 'unshortlisted';
  ELSIF p_action = 'schedule' THEN
    IF p_next_action_type NOT IN ('first_outreach', 'follow_up', 'review', 'mockup', 'other')
       OR p_next_action_at IS NULL THEN
      RAISE EXCEPTION 'valid action type and date required';
    END IF;
    UPDATE public.prospect_workflow
      SET next_action_type = p_next_action_type, next_action_at = p_next_action_at,
          next_action_note = v_note, updated_at = now()
    WHERE prospect_id = p_prospect_id AND shortlisted_at IS NOT NULL
    RETURNING * INTO v_row;
    IF NOT FOUND THEN RAISE EXCEPTION 'shortlist prospect before scheduling'; END IF;
    v_note := concat_ws(
      ' — ',
      p_next_action_type || ' at ' || to_char(p_next_action_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') || ' UTC',
      v_note
    );
    v_event := 'action_scheduled';
  ELSIF p_action = 'complete' THEN
    SELECT next_action_type INTO v_note
    FROM public.prospect_workflow
    WHERE prospect_id = p_prospect_id AND next_action_at IS NOT NULL;
    UPDATE public.prospect_workflow
      SET next_action_type = NULL, next_action_at = NULL,
          next_action_note = NULL, updated_at = now()
    WHERE prospect_id = p_prospect_id AND next_action_at IS NOT NULL
    RETURNING * INTO v_row;
    IF NOT FOUND THEN RAISE EXCEPTION 'no scheduled action'; END IF;
    v_note := concat_ws(' — ', 'Completed ' || v_note, NULLIF(btrim(p_note), ''));
    v_event := 'action_completed';
  ELSIF p_action IN ('note', 'call') THEN
    IF v_note IS NULL THEN RAISE EXCEPTION 'note required'; END IF;
    INSERT INTO public.prospect_workflow(prospect_id)
    VALUES (p_prospect_id)
    ON CONFLICT (prospect_id) DO NOTHING;
    SELECT * INTO v_row FROM public.prospect_workflow WHERE prospect_id = p_prospect_id;
    v_event := p_action;
  ELSE
    RAISE EXCEPTION 'unsupported finder action';
  END IF;

  INSERT INTO public.prospect_activity(prospect_id, event_type, note)
  VALUES (p_prospect_id, v_event, v_note);
  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.finder_action(bigint, text, text, timestamptz, text) TO anon, authenticated;
