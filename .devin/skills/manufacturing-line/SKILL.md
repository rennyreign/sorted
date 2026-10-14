---
name: manufacturing-line
description: Safely resume the Sorted manufacturing lifecycle using validated state, current evidence and approval gates. Use for "run operators", "continue the build", "resume the build", "run the manufacturing line", "next operator", or progressing a website through factory QA and delivery.
---

# Manufacturing Line - Safe Resume

## Stage 1 Internal-Page Links

Before building or resuming a pre-approval client site, read `operators/skills/stage-1-direction-confirmation.md` (from the Sorted repo root). Implement its shared direction-confirmation pages and consistent internal routes during Op 4, before Op 5/5b. This is an intentional review state, not a finished internal page or client approval.


This skill drives a website build through the Sorted factory operator chain. It is used after `start-build` has initialised the build directory.

Use pnpm for setup, development, verification and handoffs. Follow `operators/skills/factory-operators.md` -> Package Manager And Handoffs before any dependency work; package/network permissions remain separate.

## What to load first

Load the execution contract for the requested boundary:

1. `/Users/renaldoedmondson/Projects/sorted/operators/skills/factory-operators.md` - maintained phase contracts, evidence and safety gates.
2. `/Users/renaldoedmondson/Projects/sorted/operators/skills/op-05b-human-vision-qa.md` - independent visual review when that stage is next.
3. For workspace work, `operators/skills/workspace-build.md` and the acquisition hub standard in `operators/skills/start-build.md`.

## How to run the next operator

```bash
node /Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/dist/cli.js resume <build-dir>
```

This reads `state/build-state.json` and tells you which operator to run next. Follow the instructions for that specific operator from its skill doc.

## Full Lifecycle

| # | Operator | Execution | Vision model? |
|---|---|---|---|
| 0 | Build Init | harness | No |
| 1 | Mockup Regions | harness | No |
| 2 | Asset Reconstruction | supplied by ChatGPT; local fallback dormant | Only if explicitly requested |
| 3 | Asset Registry | standalone | No |
| 4 | Frontend Build | harness | No |
| 5 | Visual QA (automated) | harness | No |
| **5b** | **Independent Vision QA** | **read-only reviewer** | **Yes; use existing capability when available** |
| 6 | Pixel Correction | harness | No |
| 7 | UI Systemisation | harness | No |
| 8 | Design System | harness | No |
| 9 | Core Build QA | harness | No |
| Gate | Human assessment | explicit human decision | Separate from agent QA |
| Gate | Workspace manufacture | harness after approved brief | As needed |
| 10 | Internal Pages | harness | No |
| 11 | CMS Integration | harness | No |
| 12 | CMS QA | harness | No |
| 13 | Analytics | harness | No |
| 14 | Launch QA | harness | No |
| 15 | Deployment | harness | No |

## Key rules

1. Complete export packs already contain reconstructed images and design-IR. Do not repeat upstream work; validation/optimisation/registration remain active.
2. Blocked is not complete. Resume reports failures, active work, missing evidence and approval gates; resolve the named boundary rather than bypassing it.
3. Vision QA is required and independent; functional checks or confidence cannot waive it. Human/client approval is another gate.
4. Legacy states require explicit reconciliation; it does not certify historic work or authorise downstream tasks.
5. Preserve the full lifecycle. CMS, analytics, launch and deployment retain their approval boundaries despite being omitted from the update diagram.
6. Record attempts using `scripts/manufacturing-ledger.mjs`; evidence belongs in the job and must match the current revision.
