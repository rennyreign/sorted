---
name: manufacturing-line
description: Run the Sorted website manufacturing line operator sequence. Use when the user says "run operators", "continue the build", "resume the build", "run the manufacturing line", "next operator", or asks to progress a website build through the factory pipeline.
---

# Manufacturing Line — Operator Sequence

## Stage 1 Internal-Page Links

Before building or resuming a pre-approval client site, read `operators/skills/stage-1-direction-confirmation.md` (from the Sorted repo root). Implement its shared direction-confirmation pages and consistent internal routes during Op 4, before Op 5/5b. This is an intentional review state, not a finished internal page or client approval.


This skill drives a website build through the Sorted factory operator chain. It is used after `start-build` has initialised the build directory.

## What to load first

Read the full operator chain documentation:

1. **Full overview:** `/Users/renaldoedmondson/Projects/sorted/operators/skills/manufacturing-line.md`
2. **Individual operator skills:** `/Users/renaldoedmondson/Projects/sorted/operators/skills/op-XX-*.md` — each operator has its own skill doc with exact execution steps

## How to run the next operator

```bash
node /Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/dist/cli.js resume <build-dir>
```

This reads `state/build-state.json` and tells you which operator to run next. Follow the instructions for that specific operator from its skill doc.

## The 17 operators

| # | Operator | Execution | Vision model? |
|---|---|---|---|
| 0 | Build Init | harness | No |
| 1 | Mockup Regions | harness | No |
| 2 | Asset Reconstruction (Flux) | standalone CLI | No |
| 3 | Asset Registry | standalone | No |
| 4 | Frontend Build | harness | No |
| 5 | Visual QA (automated) | harness | No |
| **5b** | **Human Vision QA** | **harness** | **YES — ask user to switch model** |
| 6 | Pixel Correction | harness | No |
| 7 | UI Systemisation | harness | No |
| 8 | Design System | harness | No |
| 9 | Core Build QA | harness | No |
| 10 | Internal Pages | harness | No |
| 11 | CMS Integration | harness | No |
| 12 | CMS QA | harness | No |
| 13 | Analytics | harness | No |
| 14 | Launch QA | harness | No |
| 15 | Deployment | harness | No |

## Key rules

1. **Run operators in order.** Do not skip ahead unless the orchestrator says a step is already complete.
2. **Op 2 does NOT need vision.** It runs a CLI that calls Flux-2-Flex. The agent just shells out.
3. **Op 5b DOES need vision.** Tell the user to switch to a vision-capable model before this step.
4. **State is resumable.** Any session can resume via the CLI. Nothing is lost between sessions.
5. **Read each operator's skill doc before executing.** Each operator has specific inputs, outputs, and validation steps documented in `operators/skills/op-XX-*.md`.
