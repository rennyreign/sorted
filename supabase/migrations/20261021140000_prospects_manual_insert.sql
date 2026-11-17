-- Allow the operator dashboard (anon key) to insert manual CRM records.
-- Scoped to hand-entered records only: place_id must use the manual_ prefix
-- assigned by AddProspectForm, and the row must land as a fresh new prospect.

CREATE POLICY "Dashboard can insert manual prospects"
  ON public.prospects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    place_id LIKE 'manual\_%'
    AND status = 'prospect'
    AND crm_status = 'new'
  );
