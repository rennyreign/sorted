---
name: app-overview
description: Build or refresh a client application's orientation page explaining what it does, who it serves, its business role, the players' goals and incentives, decision boundaries, workflow and video walkthrough slot. Use for "add an app overview", "explain how this hub fits the business", "show who the players are", "add role-based orientation", or application handoff/onboarding work. Apply to every Sorted-built client app after its core workflow exists; this is not a marketing landing page or a metrics dashboard.
argument-hint: "<client-repo-path>"
---

# Application Overview — Operator Skill

Give people enough context to think for themselves, not just follow a click script.
Explain why the application exists, which player they are, what they can decide,
and how their actions help the business.

Run inline in the current harness. This is a bounded build-and-verify capability,
not an autonomous agent, live application service or user-permission system.

## Contract

| Field | Rule |
| --- | --- |
| Stable ID | `op-app-overview` |
| Trigger | Core workflow evidenced, new client-app handoff, or material change to roles/business process |
| Inputs | Target repo, actual workflow and routes, client brief/business model, role decisions/logs, current UI conventions, optional video + captions |
| Preconditions | Repo identified; existing work inspected; purpose, workflow and decision owners supported by evidence |
| Outputs | Working overview route, desktop/mobile entry point, regression checks, `.devin/app-overview.json`, breadcrumb evidence |
| Validator | `scripts/validate.mjs` beside this skill; structural/readiness checks plus implementation hashes and evidence-file existence |
| Transition | `draft` → `verified` only after all gates pass; never implies client approval or launch approval |
| Idempotency | Reuse the existing overview route and record; update in place, never create a second orientation page on rerun |
| Retry | At most two targeted correction/verification rounds per failed gate; then record the blocker |
| Exception route | Missing/contradictory role authority or core workflow → ask a focused question; verification failure → retain draft and report the evidence |
| Forbidden effects | No business-record writes, new credentials/integrations, sends, permission changes, package installation or deployment without separate authorisation |

## 1. Establish the facts

Read target `AGENTS.md`, recent permitted session logs, current breadcrumb, brief,
business-model diagrams, workflow rules and relevant screens. Read Sorted's
`doctrine/client-operator-lines.md` and `doctrine/sorted-value-model.md` for context.
Use actual source paths, not assumed sibling locations.

- Identify the process being replaced and one primary end-to-end workflow.
- Distinguish external business audiences from application operating roles.
- Identify decision authority from current rules, not from a historic label.
- Name the value created, the gap addressed and how improvement can be observed.
- Separate direct application outputs from hoped-for business outcomes.
- Mark unknowns and provisional policies explicitly. Do not invent results,
  account types, permissions, integrations, customer quotes or measured revenue.

If roles cannot be established, stop before writing that part of the page.
A visual business model alone does not prove who can approve a consequential action.

## 2. Map the players using simple game theory

For every role, establish:

1. **Goal** — what they are trying to achieve.
2. **Contribution** — what useful input or work they supply.
3. **Authority** — what they can decide, and what they cannot.
4. **Incentive** — why participation is worthwhile.
5. **Tension** — where a locally sensible action could damage the shared outcome.
6. **Safeguard** — how the workflow prevents or exposes that conflict.
7. **Entry point** — a real route, or no login when participation is external.

Derive the number of players from the business; do not force four everywhere.
People may occupy several roles. Roles are an explanatory model, not newly
enforced access-control claims. A system role has a **delegated objective**, not
human self-interest; explain who remains accountable.

Use plain English rather than payoff matrices, invented scores or equilibrium
jargon. Explain one or two useful exchanges and tensions concretely.
Keep honest refusals, adverse feedback and uncertainty legitimate outcomes.

**Reference case: Creator Hub**

- Leader: dependable network and less involvement; sets direction and approves offers.
- Creator: worthwhile experience and potential content income; supplies honest feedback and evidence, chooses participation and permission.
- Team member/manual worker: a clear worklist; coordinates, verifies and escalates.
- Automation: memory and timing under delegated rules; proposes and queues, never supplies human consent or commercial judgement.

The business diagram's creators, dermatologists and consumers are external
audiences, not a substitute for those four operating roles.

## 3. Build the orientation inside the existing app

Use its framework, shell, typography and components. Do not redesign the app,
add dependencies or make a separate marketing microsite.

Include these sections, with useful headings and jump links for longer pages:

- **Purpose and audience:** what the app does, for whom, why it exists.
- **Business picture:** inputs → app contribution → downstream use → intended value.
  State the app's lane and what remains outside it. Do not claim it measures
  ROAS/revenue just because those appear in a business model.
- **Players:** each role's goals, contributions, authority and incentive tensions;
  safe, truthful links into their work.
- **Workflow:** real stages and handoffs, who acts next and when a human decides.
- **Decision boundaries:** independent statuses, fact review, consent, approval,
  simulation and commercial gates relevant to this app.
- **Walkthrough slot:** responsive video area close to the introduction.
- **Next action:** obvious links to existing working destinations.

Make Overview discoverable on desktop and mobile with an active-page state.
Preserve the existing home route, query contracts and daily-work landing unless
the user explicitly requests a landing change. Do not invent role-filter query
parameters that the destination ignores.

For Creator Hub specifically: trial participation ≠ paid partnership; photo
usability ≠ publication permission; suggested fact ≠ accepted fact. Explain the
current trial-first policy as provisional rather than universal.

## 4. Handle the walkthrough truthfully

No video supplied is a valid state: reserve the slot, label it "Walkthrough
coming soon" (or equivalent), and show no fake play button, empty iframe,
autoplay or request to a nonexistent asset.

When media is supplied, use a real player with controls, an accessible name,
captions and a responsive aspect ratio. Prefer the app's existing approved
media path/provider. Do not add an embed provider or tracking integration
without authorisation. Document the configuration point in the handoff.
Check actual playback/captions if configured; a passing empty-state test is
not proof that an eventual video plays.

## 5. Verify before declaring the page ready

Run the target project's existing tests and build/type checks. Browser-check:

- all required sections, correct role count and honest capability/policy copy;
- real destination links and jump links;
- desktop/mobile navigation, active state and the existing home redirect;
- keyboard access, visible focus and mobile drawer behaviour;
- responsive reading and no overflow at desktop, tablet and narrow mobile;
- no unexpected console errors;
- empty walkthrough state, or actual playback and captions when configured.

Review desktop/mobile screenshots. Use isolated demo data if the shell initialises
or writes on read; do not mutate client records or trigger outbound actions for QA.
Record command output and screenshots as evidence. Report inherited warnings
without silently broadening this task into unrelated repairs.

## 6. Persist the handoff and run the gate

Write `.devin/app-overview.json` in the target app, not runtime content. It is an
operator record, not a CMS, business-data source or alternative permission ledger.

The record contract is enforced by `scripts/validate.mjs`:

- `operator_id`: `op-app-overview`; `schema_version`: `1`;
  `status`: `draft` or `verified`.
- `app`: nonempty `name` and local `route`.
- `sources`: array of `{path, reason}` with existing files, relative to target
  repo or absolute. Keep source content and personal data out of the record.
- `business`: `value`, `gap`, `observable_improvement`, and nonempty arrays
  `in_scope`, `out_of_scope`, `not_claimed`.
- `players`: at least two `{id, name, kind, goal, contribution, authority,
  incentive, tension, safeguard, entry_point}` objects. Unique IDs;
  `kind` is `human` or `system`; `entry_point` is a local route or `null`.
- `sections`: nonempty `purpose`, `business`, `players`, `workflow`,
  `boundaries`, `walkthrough` values naming actual page headings/anchors.
- `video`: `{state: "not_supplied", source: null, captions: null}`, or
  `{state: "configured", source: "...", captions: "..."}` for real media.
- `implementation`: `{path, sha256}` array covering the overview, navigation,
  walkthrough and any supporting style/config files changed for this task.
- `verification`: array of `{check, status, evidence: [{path, summary}]}`.
  Required checks: `content`, `tests`, `build`, `browser`, `links`, `responsive`,
  `keyboard`, `visual`, `video`. Status is `passed`, `blocked` or `not_run`.
- `open_questions`: array; retain genuine client questions rather than turning
  them into assumed facts. Nonblocking policy questions may remain on verified pages.

Set `verified` only when every required check passed on the hashed implementation.
From the Sorted repo, run:

```bash
node .devin/skills/app-overview/scripts/validate.mjs /path/to/client/.devin/app-overview.json --repo /path/to/client
node --test .devin/skills/app-overview/scripts/validate.test.mjs
```

The validator is read-only. It checks shape, readiness, file existence and code
freshness, **not the truth of business claims or the quality of visual design**.
Those require the recorded content review and browser/visual evidence. Do not
fabricate a pass to satisfy the gate.

Append the actual results to the line's breadcrumb, including inherited/template
improvements. Deliver the route, files, verification results, video configuration
point and remaining questions. Client acceptance and production release are
separate decisions.

## Regression prompts

`evals/evals.json` covers the reference app, a different role model, and missing
authority/media inputs. Use these for future skill evaluation; do not claim
independent agent benchmarks unless they were actually run.
