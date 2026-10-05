# Skill: Prospect Research

**When to use:** After the Website Analyser qualifies a prospect and before mockup/build work begins. Use it to decide whether the business is genuinely worth scouting, record the evidence, identify a real contact, and prepare the build handoff.

**Local harness:** `operators/prospect-finder/implementation/research_harness.py`
**CRM surface:** Finder record panel or Pipeline → Research

This skill is the current harness-driven runtime of the Prospect Research operator. “Operator” names the durable capability and contract; “skill” describes how the local harness executes it today. A future autonomous runtime must preserve the same inputs, evidence rules, decisions, and dossier output.

## Flow

1. Open the prospect in Finder and inspect its machine evidence: website analysis, scores, weaknesses, Companies House match, and source link.
2. Review the Companies House facts already populated by the analyser: company status, filing type and dates, overdue state, officers, SIC codes, and any supported iXBRL account figures. Never describe cash, reserves, assets, thresholds, or balance-sheet totals as revenue.
3. Open the source filing only when the populated evidence needs clarification. Missing turnover on micro accounts normally means it was not publicly disclosed; it is not a form field to complete.
4. Set the scouting decision:
   - `priority`: strong underlying business with a meaningful site/conversion gap; build next.
   - `watch`: credible prospect, but timing or evidence is not strong enough yet.
   - `pass`: not a responsible target; record why.
   - `undecided`: research is incomplete.
5. Add one concise reason that explains the judgement the populated facts do not make for you.
6. Saving Scout, Watch or Pass marks the research reviewed.

Contact provenance must remain visible: `phone` is the business number from Google Maps, Companies House supplies officer/PSC names and roles, and `owner_email` comes from the separate email-enrichment path. Do not imply that Companies House supplies telephone numbers or email addresses.

## Local dossier artifact

Prepare the same record for local build work with:

```bash
cd operators/prospect-finder/implementation
./venv/bin/python research_harness.py prepare --id 1826
```

This writes:

- `dossiers/<id>-<business>/dossier.json` — lossless machine-readable state.
- `dossiers/<id>-<business>/build-brief.md` — human-readable scouting and build context.

The harness is intentionally read-only and makes no external model calls. Companies House enrichment is performed by the Website Analyser; CRM judgement happens in the Finder/Pipeline interface so evidence and activity remain auditable.

## Build gate

Start mockup or website work only when:

- scouting decision is `priority`;
- the reason names a specific, observed gap;
- financial claims have a source and do not overstate abbreviated accounts;
- the primary conversion action is clear;
- the dossier carries the context the build skill needs.

This is a judgment gate, not an automated score threshold. The purpose is to handpick businesses Sorted can genuinely amplify.
