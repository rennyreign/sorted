-- Allow N/A as a valid CRM pipeline status
-- N/A is used for businesses that are not a fit for the website/mockup offer
-- but may be revisited later for Sorted Ops.

ALTER TABLE prospects
  DROP CONSTRAINT IF EXISTS prospects_crm_status_check;

ALTER TABLE prospects
  ADD CONSTRAINT prospects_crm_status_check
  CHECK (crm_status IN ('new','outreached','responded','mockup_revealed','build','quote','paid','lost','na'));
