---
name: client-operator-line
description: Build a client operator production line — turn a client's spreadsheet-and-inbox process into a working system with bounded operator contracts, persisted state and a private preview. Use when asked to "build an operator for a client", "build an operator production line", "turn this spreadsheet into a system", "build a client dashboard/workspace", "start a new operator line", or when a new client brings an operational brief rather than a website brief.
---

# Client Operator Line — Operator Skill

**Doctrine:** `doctrine/client-operator-lines.md`
**Template:** `templates/client-operator-line/`
**Runtime now:** harness skills and local jobs. Not autonomous agents.

## Triggers

- "build an operator for a client"
- "build an operator production line"
- "turn this spreadsheet into a system"
- "start a new operator line"
- "build the client dashboard / workspace / hub"
- "productise this process for <client>"

## Inputs required before starting

| Input | Required | If missing |
| --- | --- | --- |
| Client brief or problem statement | Yes | Stop. Ask for the process and the outcome. |
| Source data (workbook, export, screenshots) | Yes | Build the model from the brief, mark fields provisional. |
| Client brand or "use Sorted for now" | Yes | Default to Sorted shell, client name configurable. |
| Line slug and repo name | Derived | `<client-slug>-<line-slug>`, kebab case, no legal names. |
| Hosting/persistence constraint | No | Local durable store + documented deploy path. |
| Integration credentials | No | Demo adapters. Never block on keys. |

## Step 0 — Classify the line

Write one sentence each:

- **The process being replaced:** what a person does today, in order.
- **The observable improvement:** what gets faster, clearer or recoverable.
- **The primary workflow:** the single path the client must be able to complete unaided.
- **The independent statuses:** relationship, trial/progress, response, evidence. If two statuses are being collapsed into one, split them now.

If the primary workflow cannot be named, the brief is not ready.

## Step 1 — Design the contract before the interface

Produce `docs/operator-contracts.md` first. Each operator:

```yaml
id: op-04-next-action-planner
trigger: state change | due sweep | manual
preconditions: []
input_schema: {}
output_schema: {}
validator: rules/<file>.ts
permitted_transitions: []
idempotency_key: "<trial_id>:<checkpoint_id>:<kind>"
retry: { max_attempts: 2, backoff: fixed }
exception_route: review_task | none
```

Rules:

- Operators are bounded jobs, not personalities. No operator writes outside its validator.
- Handoffs are persisted state, never in-memory conversation.
- Every write that can repeat must carry an idempotency key.
- Model output is a *proposal*. Deterministic validation owns the write.
- Unknown stays unknown. Never convert unknown to false, zero or complete.

## Step 2 — Scaffold the repo

Copy `templates/client-operator-line/` into `Projects/<repo-name>/`.

1. Fill `AGENTS.md`, keeping the **Sorted tether** block intact.
2. Create `SYSTEM-BREADCRUMB.md` from the template with cycle number `1`.
3. Choose the stack from what the brief needs, not from preference. Prefer the smallest stack that gives durable state, server-side validation and an access-controlled preview.
4. One repo per line. Do not put the line inside the Sorted platform `app/`.

## Step 3 — Build the vertical slice

Order is not negotiable:

1. Schema, migrations, seed
2. Pure rules: transitions, eligibility, scoring, duplicate matching
3. Shared ingest/validation service used by every intake path
4. Primary screen, driven by queries over the same records
5. Intake paths (quick add, file import, paste)
6. Core loop: state change -> planned action -> simulated inbound -> extraction proposal -> accepted facts -> evidence checklist
7. Research and reporting with denominators
8. Demo controls, reset, guided path
9. Verification

Interface standards: Sorted shell (monochrome `#FAFAFA`/`#0A0A0A`, restrained semantic colour only where it carries meaning), business language in client screens, technical detail behind diagnostics.

### Step 3a — Orient the people using it

After the core workflow is evidenced, apply `.devin/skills/app-overview/SKILL.md`.
Build the overview in the client app's existing shell, not the Sorted platform:
purpose, audience, business contribution, operating players with goals/incentives
and authority, real workflow, independent decision boundaries, and a video
walkthrough slot. Derive roles from evidence; four players is the Creator Hub
example, not a universal schema. Preserve the daily-work landing. Include the
operator record and actual verification evidence before handoff.

## Step 4 — Verify

Minimum evidence before presenting:

- unit tests for transitions, duplicate matching, reminder eligibility, idempotency, reporting maths
- browser walk of the primary workflow, start to finish
- a browser walk of one failure path (ambiguous reply, duplicate import or invalid row)
- every dashboard count reconciled against a filtered list
- simulated actions visibly labelled "Simulated"

Record what was run and what it returned in the breadcrumb. "Tested" without output is not evidence.

## Step 5 — Hand off

Deliver:

- private preview URL and access method
- branch and PR (never straight to production)
- setup instructions
- demo script (`docs/demo-script.md`)
- field-mapping reference (`docs/field-mapping.md`)
- known limitations and simulated-vs-live table (`docs/limitations.md`)
- operator contracts
- completed `SYSTEM-BREADCRUMB.md` including section 8: what the template should inherit

## Step 6 — Close the cycle

For every item in breadcrumb section 8, either promote it into `templates/client-operator-line/` or record why not. Then increment the template's cycle note.

A line that produced no template improvement is a signal the line was not generalised — say so in the breadcrumb rather than inventing a lesson.

## Anti-patterns

- Ten "agents" wrapping ten functions with no schemas
- Hardcoded headline metrics that do not reconcile
- A status field that means relationship *and* progress
- Import that silently reinterprets "Completed" as a completed trial
- Reminders that fire while a reply is pending
- Claiming delivered when the transport is simulated
- A client-specific UI that cannot be reused for the next client
- A repo with no tether and no breadcrumb
