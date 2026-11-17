# AGENTS.md — {{CLIENT_NAME}} · {{LINE_NAME}}

This repository is a **client operator line**: a Sorted-built working system for a client process that previously lived in a spreadsheet, an inbox and memory. It is not a website build and not a Sorted platform surface.

**Working title:** {{CLIENT_NAME}} — {{LINE_NAME}}
**Repo:** `{{REPO_NAME}}`
**Started:** {{DATE}}
**Cycle:** 1

---

## Sorted tether

This repo is one line in the Sorted operator infrastructure. The broader system lives in the sibling repo.

| | |
| --- | --- |
| Sorted repo | `{{SORTED_REPO_PATH}}` (default sibling: `../sorted`) |
| Client operator lines doctrine | `../sorted/doctrine/client-operator-lines.md` |
| Operator chain state contract | `../sorted/doctrine/operator-chain.md` |
| Build skill | `../sorted/operators/skills/client-operator-line.md` |
| Scaffold source | `../sorted/templates/client-operator-line/` |
| Brand voice | `../sorted/doctrine/sorted-brand-voice.md` |
| Value model | `../sorted/doctrine/sorted-value-model.md` |
| Deployment discipline | `../sorted/doctrine/cascade-deployment-discipline.md` |

If the sibling path does not exist in a fresh clone, treat the Sorted repo as the source of truth for doctrine and ask for the path rather than inventing rules.

### Inherited rules

1. **Operators are skills until proven.** A bounded job with a schema and validator is an operator. Do not build autonomous agents.
2. **Deterministic validation owns writes.** Model output is a proposal; a validator applies it.
3. **Unknown is not false.** Never convert an unknown into zero, no, complete or rejected.
4. **Simulated is labelled simulated.** Never "Delivered" when no transport ran.
5. **Client language in client screens.** Operator names, prompts, job IDs and logs live behind diagnostics.
6. **Branch discipline.** Work on `feat/...`; merge intentionally. Never push unfinished work to a production branch.
7. **Every count links to its filtered list.** If a KPI cannot open the records behind it, it is decoration.
8. **Every mutation confirms itself.** A save, acceptance or upload must leave visible evidence that it happened, even after the route revalidates.
9. **Brand.** Use the Sorted shell (monochrome `#FAFAFA` / `#0A0A0A`) unless a client brand is approved. Restrained semantic colour only where it carries meaning.
10. **Orient the people.** After the core workflow is evidenced, apply `../sorted/.devin/skills/app-overview/SKILL.md`: purpose, audience, business role, players' goals/incentives/authority, workflow, decision boundaries and an honest walkthrough slot. Derive roles from evidence, preserve the daily-work landing, and record actual verification in `.devin/app-overview.json` and the breadcrumb.

### What this repo may change without asking

- Its own entities, rules, operators, interface and tests
- Its own seed data, demo controls and documentation

### What requires approval

- Installing dependencies that change the deployment story
- Adding a live integration, real credentials or a real outbound transport
- Changing the client-facing brand beyond the approved shell
- Publishing beyond a private preview
- Any change to the operator contracts that alters an existing client record

---

## The line

### Process being replaced
{{PROCESS_BEING_REPLACED}}

### Observable improvement
{{OBSERVABLE_IMPROVEMENT}}

### Primary workflow
{{PRIMARY_WORKFLOW}}

### Entities and independent statuses
{{ENTITIES_AND_STATUSES}}

---

## Build order

1. Schema, migrations, seed
2. Pure rules: transitions, eligibility, duplicate matching, scoring
3. Shared ingest/validation service
4. Primary screen
5. Intake paths
6. Core loop
7. Research and reporting
8. Demo controls and reset
9. Verification

Do not build settings, integrations or visual polish before the core loop is evidenced.

## Operators

Canonical list and schemas: `docs/operator-contracts.md`. One module per operator under `lib/operators/`. Pure rules under `lib/rules/`.

## Verification

```bash
{{INSTALL_COMMAND}}
{{TEST_COMMAND}}
{{BUILD_COMMAND}}
```

Record actual output in `SYSTEM-BREADCRUMB.md` §6. "Tested" without output is not evidence.

## Handoff

`SYSTEM-BREADCRUMB.md` is the inherited state of this line. Update it at the end of every cycle, including §8 (what the scaffold should inherit next). A line without a completed breadcrumb is not finished.
