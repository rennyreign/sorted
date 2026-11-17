---
name: client-operator-line
description: Build a client operator production line — turn a client's spreadsheet-and-inbox process into a working system with bounded operator contracts, persisted state and a private preview. Use when asked to "build an operator for a client", "build an operator production line", "turn this spreadsheet into a system", "build a client dashboard/workspace", "start a new operator line", or when a new client brings an operational brief rather than a website brief.
---

# Client Operator Line

Use this entry point when a client brings an **operational process** rather than a website: a spreadsheet, an inbox, a status column that means four different things, and a person holding the rest in their head.

## What to load first

1. `doctrine/client-operator-lines.md` — what a line is, the tether rule, the system-breadcrumb contract, build order and gates.
2. `operators/skills/client-operator-line.md` — the full build procedure: classify, contract, scaffold, build, verify, hand off, close the cycle.
3. `templates/client-operator-line/` — the scaffold to copy into the new repo.
4. `../db-creator-feedback-hub` — the reference build (cycle 1). Read its `SYSTEM-BREADCRUMB.md` §5 and §8 before starting a new line.

## Non-negotiables

- **Operators are skills until proven.** Bounded jobs with schemas and validators. No autonomous agents.
- **One repo per line**, outside the Sorted platform `app/`. Named `<client-slug>-<line-slug>`.
- **Tether.** The new repo's `AGENTS.md` must link back to the Sorted doctrine, the operator chain and the scaffold.
- **Breadcrumb.** `SYSTEM-BREADCRUMB.md` is written during the build and completed at handoff. Its §8 either promotes an improvement into the scaffold or records why not.
- **Independent statuses.** If the client's spreadsheet collapses relationship, progress, response and evidence into one column, split it before building anything.
- **Simulated is labelled simulated.** No “Delivered” without a real transport.
- **Counts link to their lists.** Every KPI opens the filtered view it was derived from.

## Before writing code

Produce `docs/operator-contracts.md` and fill `SYSTEM-BREADCRUMB.md` §1–§3. If the primary workflow cannot be named in one sentence, the brief is not ready — ask for the process and the outcome.
