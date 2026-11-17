# Client Operator Line — Scaffold

Copy this directory into `Projects/<client-slug>-<line-slug>/` when starting a client operator line.

**Read first:** `doctrine/client-operator-lines.md` and `operators/skills/client-operator-line.md` in the Sorted repo.

## What to do with these files

| File | Action |
| --- | --- |
| `AGENTS.md` | Fill the `{{...}}` placeholders. Keep the Sorted tether block intact. |
| `SYSTEM-BREADCRUMB.md` | Fill Identity and Problem before writing code; complete the rest as the build progresses. |
| `docs/operator-contracts.md` | Fill before building the interface. This is the build spec. |
| `docs/field-mapping.md` | Fill from the real source data, including legacy labels. |
| `docs/demo-script.md` | Write before demo polish; it exposes gaps. |
| `docs/limitations.md` | Fill continuously; do not leave it to handoff. |
| `tests/browser/happy-path.template.js` | Copy to `tests/browser/happy-path.js` and replace the steps with the client's primary workflow. |

Delete this README once copied. Nothing else in the scaffold is optional.

## Placeholders

`{{CLIENT_NAME}}` · `{{LINE_NAME}}` · `{{REPO_NAME}}` · `{{LINE_SLUG}}` · `{{DATE}}` · `{{SORTED_REPO_PATH}}`

## Cycle note

- **Cycle 1** (24 Oct 2026) — scaffold created. Stack-neutral. Contracts, breadcrumb and tether are the stable parts; the stack is chosen per line.
- **Cycle 2** (24 Oct 2026, from the DB Creator Feedback Hub build) — promoted: mutation confirmation that survives revalidation, idempotency that survives state changes, ambiguity checks before keyword matching, backdated seed activity, a `?filter=` contract for every dashboard count, one identity+contact table column, and an in-repo browser happy path.
- **Cycle 3** (28 Oct 2026, from the Creator Hub overview) — promoted: application orientation after the core workflow is evidenced, using `.devin/skills/app-overview/SKILL.md` in Sorted. Explain business context, evidenced player goals/incentives/authority, handoffs and decision boundaries; reserve a truthful video slot; preserve the work landing; retain a hashed verification record.
