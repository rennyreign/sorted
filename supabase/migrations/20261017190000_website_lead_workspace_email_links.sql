-- Route both prospect confirmations and operator notifications to the workspace.
-- Replace only the link and button labels in the current function, preserving
-- its deployed email templates, Vault settings, and delivery behavior.
DO $migration$
DECLARE
  definition TEXT;
BEGIN
  SELECT pg_get_functiondef('public.send_website_lead_emails()'::regprocedure)
    INTO definition;
  definition := replace(definition,
    'https://sortmydigital.site/review/?slug=',
    'https://sortmydigital.site/workspace/?slug=');
  definition := replace(definition, 'Open your review page', 'Open your workspace');
  definition := replace(definition, 'Open review page', 'Open workspace');
  EXECUTE definition;
END;
$migration$;
