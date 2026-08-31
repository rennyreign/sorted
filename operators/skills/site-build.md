# Skill: site-build

**Type:** Orchestration skill (legacy — superseded by manufacturing-line)
**Trigger:** User provides a mockup image and asks to build a client site
**Output:** Ready-to-review Next.js site repo, `npm run build` passing clean

---

## This skill has been superseded

The 3-operator chain (mockup-deconstructor → asset-generator → frontend-builder) has been replaced by the 16-operator manufacturing line.

**Load `operators/skills/manufacturing-line.md` instead.**

The new manufacturing line:
- Uses `build-state.json` for resumable state management
- Decomposes the build into 16 bounded operators with explicit contracts
- Runs 14 of 16 operators directly in the harness (Devin)
- Only Asset Reconstruction and Asset Registry remain as standalone CLIs
- Adds Visual QA, Pixel Correction, UI Systemisation, Design System Extraction, Core Build QA, Internal Pages, CMS Integration, CMS QA, Analytics, Launch QA, and Deployment as first-class operators

The old sub-skills remain useful for running individual steps in isolation:
- `operators/skills/mockup-deconstructor.md` — now folded into Operator 1 (Mockup Region Decomposition)
- `operators/skills/asset-generator.md` — now Operator 2 (Asset Reconstruction) + Operator 3 (Asset Registry)
- `operators/skills/frontend-builder.md` — now Operator 4 (Frontend Reconstruction)

---

## Quick start (new manufacturing line)

```bash
# 1. Initialise a build job
cd operators/factory-orchestrator
node dist/cli.js init <mockup.png> <manifest.json> <client-slug> --build-dir <path>

# 2. Load the manufacturing-line skill and follow it
# It will guide you through all 16 operators
```

See: `operators/skills/manufacturing-line.md`

---

## Doctrine references

- `doctrine/operator-chain.md` — full state contract, 16-operator chain map
- `operators/skills/manufacturing-line.md` — the new master orchestration skill
- `docs/Sorted Website Manufacturing Line — Build Brief.md` — the original build brief
