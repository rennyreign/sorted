---
name: start-build
description: Start a new Sorted website build (manufacture a site). Use when the user says "build a website", "start a new site", "manufacture a site", "start a build", "run the manufacturing line", or provides a client slug + mockup + manifest to begin a website build.
---

# Start a New Website Build

## Stage 1 Internal-Page Links

Before building or resuming a pre-approval client site, read `operators/skills/stage-1-direction-confirmation.md` (from the Sorted repo root). Implement its shared direction-confirmation pages and consistent internal routes during Op 4, before Op 5/5b. This is an intentional review state, not a finished internal page or client approval.


This is the **single entry point** for starting a new Sorted website build. It creates a sibling project folder, scaffolds the Next.js site from the client-site template, copies the mockup and manifest, and initialises the factory job.

## What to load first

Before running anything, read the full operator skill:

1. **Full skill doc:** `/Users/renaldoedmondson/Projects/sorted/operators/skills/start-build.md` — complete instructions, prerequisites, and the operator sequence
2. **Manufacturing line overview:** `/Users/renaldoedmondson/Projects/sorted/operators/skills/manufacturing-line.md` — the 17-operator chain

## Prerequisites

Before starting, you need three things from the user. If any are missing, **stop and ask** — do not guess:

1. **Client slug** — lowercase, hyphenated (e.g., `nexus-accounting`, `lrt-plumbing`)
2. **Mockup image path** — absolute path to an approved mockup (`.png`, `.jpg`, or `.webp`)
3. **Manifest path** — absolute path to the image manifest JSON (deconstruction + asset manifest)

## How to start the build

Run the start-build script with absolute paths:

```bash
/Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/scripts/start-build.sh \
  <client-slug> \
  <mockup-path> \
  <manifest-path>
```

**Example:**

```bash
/Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/scripts/start-build.sh \
  nexus-accounting \
  /Users/renaldoedmondson/Downloads/nexus-accounting.png \
  /Users/renaldoedmondson/Downloads/nexus-accounting-manifest.json
```

This will:
1. Create `/Users/renaldoedmondson/Projects/<client-slug>/` (sibling to sorted)
2. Scaffold the Next.js site from `sorted/templates/client-site/`
3. Copy mockup + manifest into `input/`
4. Initialise the factory job (creates `state/build-state.json`)
5. Print the next steps

## If the build directory already exists

**Stop and ask the user.** Do not delete or overwrite an existing build directory. The script will refuse to run if the directory exists — this is intentional. Ask the user whether they want to:
- Resume the existing build: `node /Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/dist/cli.js resume <build-dir>`
- Start fresh (after explicit confirmation to delete the old directory)

## After starting: the operator sequence

Once the build is initialised, run operators in sequence using the factory orchestrator:

```bash
node /Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/dist/cli.js resume <build-dir>
```

### The operator chain

| # | Operator | Execution | Vision model? |
|---|---|---|---|
| 0 | Build Init | harness | No |
| 1 | Mockup Regions | harness | No |
| 2 | Asset Reconstruction (Flux) | standalone CLI | No — just runs the asset generator CLI |
| 3 | Asset Registry | standalone | No |
| 4 | Frontend Build | harness | No |
| 5 | Visual QA (automated) | harness | No |
| **5b** | **Human Vision QA** | **harness** | **YES — ask user to switch to a vision-capable model** |
| 6 | Pixel Correction | harness | No |
| 7 | UI Systemisation | harness | No |
| 8 | Design System | harness | No |
| 9 | Core Build QA | harness | No |
| 10+ | Internal pages, CMS, etc. | harness | No |

### Op 2 (Asset Reconstruction) does NOT need a vision model

This is a common point of confusion. Op 2 runs a standalone CLI that calls external image generation APIs (Flux-2-Flex by default). It does not require the agent to have vision capability. The agent just runs:

```bash
cd /Users/renaldoedmondson/Projects/sorted/operators/asset-generator/implementation
node dist/cli.js \
  --mockup <build-dir>/input/approved-mockup.png \
  --deconstruction <build-dir>/artifacts/deconstruction.json \
  --output <build-dir>/artifacts/assets-raw \
  --format webp \
  --verbose
```

It needs `FLUX_API_KEY` in the environment, not a vision model.

### Op 5b (Human Vision QA) DOES need a vision model

This is the only step where the agent itself needs vision capability. When you reach Op 5b:
1. Tell the user to switch to a vision-capable model
2. Start the dev server: `cd <build-dir> && npx serve out -p 3999`
3. Compare the rendered site to the mockup at `input/approved-mockup.png`
4. Mark as `passed`, `skipped`, or `failed` with notes

## Resuming a build

Any session can resume at any time:

```bash
node /Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/dist/cli.js resume <build-dir>
```

State is durable on disk in `state/build-state.json`. Nothing is lost between sessions.

## Key principles

1. **Sibling folder, not inside sorted.** Each site is its own project at `/Users/renaldoedmondson/Projects/<client-slug>/`.
2. **The manifest is the source of truth.** Every section, asset, colour, and copy element comes from the manifest.
3. **Assets are generated, not extracted.** Flux-2-Flex is the default image generation model. No mockup extraction.
4. **The vision QA gate is human-in-the-loop.** The harness can't auto-switch to a vision model. The user initiates that switch.
5. **State is resumable.** `build-state.json` tracks everything. Any session can pick up where the last one left off.
