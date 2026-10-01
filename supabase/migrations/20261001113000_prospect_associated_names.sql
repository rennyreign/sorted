-- Prospect associated names — companies/people linked to the business owner
-- via Companies House officers + persons with significant control.
-- Written by website-analyser's companies_house.check() alongside owner_name.

ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS associated_names jsonb;
