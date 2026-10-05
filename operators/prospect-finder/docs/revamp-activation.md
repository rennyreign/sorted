# Finder Revamp — Activation Runbook

The reworked Finder workspace depends on the following additive database
migrations. The two October 5 CRM/enrichment migrations have been applied to
the linked project; this remains the canonical ordering and verification note.

## 1. Apply migrations, in this order

Four lead-authored migrations must be reviewed and applied by an authorized
human against the production Supabase project, **in this order**:

1. `supabase/migrations/20261001121500_finder_workflow.sql`
   — prospect_workflow / prospect_activity tables + `finder_action` RPC.
2. `supabase/migrations/20261001123000_prospect_intake_signals.sql`
   — `intake_category`, `intake_priority`, `intake_signals` columns + index.
3. `supabase/migrations/20261005120000_prospect_crm_dossier.sql`
   — research decisions, structured filing reviews, contacts, and token-gated
   dossier write RPCs.
4. `supabase/migrations/20261005150000_prospect_ch_enrichment.sql`
   — machine-populated Companies House filing, due-date and iXBRL fact fields.

Do not run the finder/analyser CLI or exercise workflow writes until all are
applied. Until then: intake columns read as null (UI shows "Not ranked"),
workflow writes fail closed with a "Workflow layer unavailable" notice, and
read-only browsing keeps working.

## 2. Security posture

Workflow reads and the legacy `finder_action` write RPC remain open to the
public anon key. The new dossier write RPCs require the existing operator API
token, but that token is delivered to the browser and is not a substitute for
real user authentication. The Supabase Auth / `operator_members` gate was
removed deliberately on 2026-10-04 ("we'll revisit security as we grow").

Reinstating it would involve: Supabase Auth users + a membership table, an
`is_operator_member()`-style check inside `finder_action` (and/or RLS
policies), and re-adding a member sign-in control in the Finder UI.

## 3. What was NOT run

- No backfill, scrape, or re-analysis was executed during the revamp.
- The initial revamp made no Apify or analyser calls. On 2026-10-05 the
  CH-only local path populated the seven qualified, already-matched records;
  it made no model calls and did not change scores or CRM stages.
- Existing rows carry legacy scores until the next real finder/analyser run;
  `qualified_lead = null` rows are treated as legacy in the UI and their
  numeric score claims are suppressed.

## 4. Safety notes

- New Finder workflow writes go through the `finder_action` RPC and never
  touch `prospects.outreach_status`, `crm_status`, or outreach columns.
- The existing `check_outreach_eligibility` trigger can autonomously mark a
  prospect READY on any update once email + review_slug + mockup are present.
  Do **not** describe human shortlisting as gating the sender — it does not.
- Rollback: the migrations are additive (new tables/columns), so reverting the
  code deploy alone restores the old UI without touching data. To fully
  remove, drop the new tables/columns via reviewed admin SQL — note that
  dropping `prospect_activity`/`prospect_workflow` deletes logged activity
  history, so export it first if it matters.

## 5. Quick verify after activation

1. Open the Finder tab and perform one shortlist action on a record.
2. Run `prospect-finder` in `--dry-run` first, then a real run; confirm
   `intake_*` columns populate.
3. Run `website-analyser`; confirm unanalysed fetch orders by
   `intake_priority DESC NULLS LAST`.
4. Run `main.py --ch-only --id <id> --dry-run`, then without `--dry-run`;
   confirm populated company/account facts appear in the Research tab.
5. Save Scout, Watch or Pass with one reason and confirm the research activity
   event appears. No filing transcription should be required.
6. Run `research_harness.py prepare --id <id>` and confirm `dossier.json` and
   `build-brief.md` contain the same CRM evidence without changing the record.
