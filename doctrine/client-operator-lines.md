# Client Operator Lines

**Status:** Active doctrine (v1.0, 24 Oct 2026)
**Parent:** `doctrine/operator-chain.md`
**Skill:** `operators/skills/client-operator-line.md`
**Template:** `templates/client-operator-line/`

## What this is

A **client operator line** is the Sorted manufacturing model applied to a client's operational problem instead of their website. The client arrives with a process held together by a spreadsheet, an inbox and memory. Sorted turns that process into a working system with bounded operators, explicit state and a private preview the client can use.

This is the third productised line:

| Line | Problem | Primary artifact |
| --- | --- | --- |
| Website line | "Nobody can find or trust us online" | Static site + SortedUpdates |
| Operations line | "The work itself is dragging" | Scoped operational improvement |
| **Client operator line** | "This process only exists in someone's head and a spreadsheet" | Working operator system + contracts |

Client operator lines are built more often than websites are rebuilt. Every line must make the next one cheaper, so the line is **productised as it is built**, not afterwards.

## The one distinction that matters

An **operator** is a durable operational capability: inputs, preconditions, decision rules, outputs, validator, permitted transitions, exception route.

A **skill** is the current harness execution form of that operator.

Until a line is deployed outside the harness, operators run as skills and local jobs. Do not describe them as autonomous agents. Do not build ten agents where ten validated functions will do. The runtime changes later; the contract must not.

```
Client problem
  -> entity + state model
  -> operator contracts (stable IDs, schemas, validators)
  -> harness implementation (skills / functions / jobs)
  -> working client interface
  -> evidence of the outcome
  -> breadcrumb (what the next line inherits)
```

## Three layers

1. **Platform layer (Sorted).** Brand, design system, doctrine, shared patterns, hosting conventions. Owned by Sorted, shared across clients.
2. **Line layer (client repo).** The client's entities, operators, interface and data. One repo per line. The client owns their content and data; Sorted owns the system.
3. **Runtime layer (later).** Email transport, social enrichment, model extraction, scheduling. Behind narrow adapters. Demo adapters by default.

A line repo must not fork Sorted doctrine. It references it.

## Repo convention

```
Projects/<client-slug>-<line-slug>/     e.g. derma-botanica
  AGENTS.md                 — operating brief, with tether block to Sorted
  SYSTEM-BREADCRUMB.md      — the inherited state of this line
  docs/operator-contracts.md
  docs/field-mapping.md
  docs/demo-script.md
  docs/limitations.md
  src/ (or app/)            — interface
  lib/operators/            — one module per operator
  lib/rules/                — pure rules: transitions, eligibility, scoring
  tests/                    — unit + browser evidence
```

The repo name is the client-facing working title in kebab case. Never encode a real client's full legal name, a person's name, or a commercial figure in a repo name.

## The tether rule

Every line repo's `AGENTS.md` must contain a **Sorted tether** block that states:

- the sibling path to the Sorted repo (`../sorted` by default)
- which Sorted doctrine files govern the build
- which Sorted design reference applies
- the deployment and approval rules inherited from Sorted
- what the line may change without asking, and what it may not

The tether is not decoration. It is how a future session in the line repo can find the broader operator infrastructure without being handed context. If the tether is missing, the line is not deliverable.

## The system-breadcrumb

The **system-breadcrumb** is the fixed artifact that makes each cycle better. It is written during the build, not after it, and it has one job: let the next line start from the last line's evidence.

Required sections, in order:

1. **Identity** — client, line, repo, date, cycle number, build owner.
2. **Problem and outcome** — the process being replaced, the observable improvement.
3. **Entities and states** — the data model, including which statuses are independent.
4. **Operator contracts** — table of operator ID, trigger, input, output, validator, exception route.
5. **Decisions** — decision, alternative rejected, reason. These are the expensive knowledge.
6. **Evidence** — what was tested, how, and what it showed.
7. **Known limitations** — simulated vs live, explicitly.
8. **Inherited by the template** — what should change in `templates/client-operator-line/` next cycle.
9. **Open questions** — for the client, not for the agent.

Rules:

- The breadcrumb is versioned in the repo and updated at the end of every cycle.
- Items in section 8 must be either promoted into the template or explicitly rejected with a reason.
- A line with no breadcrumb is not finished, regardless of whether the interface works.
- Do not rewrite history in the breadcrumb. Append a new cycle section instead.

## Build order

Follow the same discipline as the website line: a coherent vertical slice before breadth.

1. Entities, states and pure rules
2. Shared intake/validation service
3. Primary interface screen
4. All intake paths
5. The core loop (state change -> action -> reply -> evidence)
6. Research/reporting
7. Demo, verification, handoff

Do not build settings, integrations or polish before the core loop is evidenced.

## Gates

A client operator line is presentable when:

- the client can complete the primary workflow without developer tools
- every displayed count derives from persisted records
- state transitions and reminder eligibility are tested in code
- simulated actions are labelled as simulated everywhere they appear
- the preview is private and access-controlled
- the breadcrumb and tether are complete
- an application overview explains purpose, business contribution, evidenced players and incentives, workflow and decision boundaries, with a truthful video walkthrough slot
- the overview has current verification evidence and a valid `.devin/app-overview.json` record, using `.devin/skills/app-overview/SKILL.md`

A line is deployable outside the harness only when the adapter contracts are implemented, secrets are server-side, and the operator validators are unchanged from the harness version.
