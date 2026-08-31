# Skill: manufacturing-line

**Type:** Master orchestration skill
**Trigger:** User provides an approved mockup + image manifest and asks to build a website, run the manufacturing line, or start a factory job
**Output:** A deployed, CMS-enabled, analytics-tracked website

---

## What this skill is

This is the master skill for the Sorted website manufacturing line. It orchestrates 16 operators that progressively transform an approved mockup into a deployed website.

At current volume (≤2 sites/day), **you (the harness) are the orchestrator and 14 of the 16 operators**. Two operators (Asset Reconstruction and Asset Registry) run as standalone CLIs because they require external image generation API calls.

You do not delegate to external agents. You execute each step directly, write the artifact to disk, validate it, update build state, and proceed.

---

## Before starting

Confirm you have:

- [ ] Approved mockup image (`.png`, `.jpg`, or `.webp`)
- [ ] Image manifest JSON (image reconstruction specification) — or a combined manifest that includes both deconstruction and asset specs
- [ ] Client slug (lowercase, hyphenated)

If any are missing, stop and ask.

---

## Auto-trigger: full flow from manifest

When a manifest is provided (either a standalone image manifest or a combined deconstruction+asset manifest), the full manufacturing line should trigger automatically:

1. **`factory init`** — creates the build job from the mockup + manifest
2. **Op 0 → Op 1** — build-init validates inputs; mockup-regions transforms the manifest into `deconstruction.json` (the asset-generator's expected format)
3. **Op 2** — asset-reconstruction runs the asset-generator CLI with the default model (flux-2-flex), generating all assets fresh from the manifest descriptions — no mockup extraction
4. **Op 3** — asset-registry creates the production path mapping
5. **Op 4** — frontend-build scaffolds and builds the Next.js site
6. Continue through QA operators (5–9), CMS (10–12), analytics (13), launch QA (14), deployment (15)

The key principle: **once the manifest is initiated, the line runs to completion without manual intervention between operators.** Each operator reads its input artifact from the previous operator's output, executes, writes its artifact, and marks itself passed.

---

## Build state

Every manufacturing job has a `build-state.json` that tracks progress. This is the source of truth.

**Starting a new job:**

```bash
cd operators/factory-orchestrator
node dist/cli.js init <mockup-path> <manifest-path> <client-slug> --build-dir <path>
```

This creates the build directory structure and `build-state.json`.

**Resuming an existing job:**

```bash
node dist/cli.js resume <build-dir>
```

This reads `build-state.json` and tells you which operator to run next.

**Checking status:**

```bash
node dist/cli.js status <build-dir>
```

**After completing each operator:**

```bash
node dist/cli.js mark-passed <operator-id> <build-dir>
```

Or if it failed:

```bash
node dist/cli.js mark-failed <operator-id> <build-dir> "<reason>"
```

---

## The 16 operators

For each operator, load its individual skill file before executing:

| # | Operator | Skill file | Execution |
|---|---|---|---|
| 0 | Build Init | `op-00-build-init.md` | harness |
| 1 | Mockup Regions | `op-01-mockup-regions.md` | harness |
| 2 | Asset Reconstruction | `op-02-asset-reconstruction.md` | **standalone** |
| 3 | Asset Registry | `op-03-asset-registry.md` | **standalone** |
| 4 | Frontend Build | `op-04-frontend-build.md` | harness |
| 5 | Visual QA | `op-05-visual-qa.md` | harness |
| 6 | Pixel Correction | `op-06-pixel-correction.md` | harness |
| 7 | UI Systemisation | `op-07-ui-systemisation.md` | harness |
| 8 | Design System | `op-08-design-system.md` | harness |
| 9 | Core Build QA | `op-09-core-build-qa.md` | harness |
| 10 | Internal Pages | `op-10-internal-pages.md` | harness |
| 11 | CMS Integration | `op-11-cms-integration.md` | harness |
| 12 | CMS QA | `op-12-cms-qa.md` | harness |
| 13 | Analytics | `op-13-analytics.md` | harness |
| 14 | Launch QA | `op-14-launch-qa.md` | harness |
| 15 | Deployment | `op-15-deployment.md` | harness |

---

## Execution sequence

```
1. Read build-state.json (or init a new job)
2. Determine the next pending operator
3. Load that operator's skill file
4. Execute the operator per its skill
5. Validate the output artifact
6. Update build-state.json (mark passed/failed)
7. Repeat until all operators complete
```

### Visual QA loop

Operators 5 and 6 form a loop:

```
FRONTEND BUILD (Op 4)
      ↓
VISUAL QA (Op 5)
      ↓
DISCREPANCIES?
   ↙       ↘
 YES       NO
  ↓         ↓
CORRECT    → continue to Op 7
(Op 6)
  ↓
VISUAL QA (Op 5)
  ↺  (max 3 iterations)
```

If Visual QA passes with zero blockers, skip Pixel Correction and proceed to UI Systemisation.

If Visual QA fails after 3 correction iterations, escalate.

### Internal pages

Operator 10 runs the 1→6 sub-chain per internal page, inheriting the design system from Operator 8.

---

## Operating principles

1. **The mockup is the visual source of truth.** Do not redesign it. Recreate it.
2. **QA ≠ correction.** Visual QA diagnoses. Pixel Correction fixes. They do not do each other's jobs.
3. **Artifacts survive operators.** Every operator writes a durable artifact to disk. The next operator reads it.
4. **State is resumable.** If a session is interrupted, the next session reads `build-state.json` and resumes.
5. **Failed validation stops the line.** Do not blindly continue after a failure. Diagnose, retry, or escalate.
6. **The contract matters more than the intelligence.** If deterministic code can do the job, use it. Use model intelligence only where interpretation is genuinely needed.
7. **Do not use external model credits where the harness can do the work.** You have vision, you write code, you run Playwright, you deploy. The only external calls are image generation (Op 2).

---

## Standalone operator handoff

For Operator 2 (Asset Reconstruction) and Operator 3 (Asset Registry):

1. Prepare the input artifacts (deconstruction.json from Op 1)
2. Run the standalone operator CLI:

```bash
cd operators/asset-generator/implementation
node dist/cli.js \
  --mockup <build-dir>/input/approved-mockup.png \
  --deconstruction <build-dir>/artifacts/deconstruction.json \
  --output <build-dir>/artifacts/assets-raw \
  --format webp \
  --verbose
```

The default model is **flux-2-flex** — no `--model` flag needed. All assets are generated fresh via AI image generation. No mockup extraction.

3. Verify the output (check that expected assets were generated)
4. Mark the operator as passed in build state
5. Continue to the next operator

---

## Doctrine references

- `doctrine/operator-chain.md` — full state contract, artifact schemas, chain map
- `docs/Sorted Website Manufacturing Line — Build Brief.md` — the original build brief
- `doctrine/sorted-studio-cms.md` — CMS doctrine (Op 11)
- `doctrine/image-reconstruction-operator.md` — reconstruction prompt standard (Op 2)
- `operators/skills/launch-qa.md` — launch QA gates (Op 14)
- `operators/skills/frontend-builder.md` — frontend build conventions (Op 4)

---

## Definition of done

The manufacturing job is complete when:

- All 16 operators have passed (or intentionally skipped)
- `build-state.json` shows no pending operators
- The website is deployed and verified in production
- `deployment.json` records the deployment URL and commit
