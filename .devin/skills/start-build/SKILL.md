---
name: start-build
description: Start a Sorted client website from a ChatGPT export pack, approved mockup, design-IR and supplied images, or configure its acquisition workspace. Use for new client builds, export-pack intake, manufacturing starts and client hubs with website, ads, follow-up, tracking and booking.
---

# Start a Client Build or Configure Its Workspace

## Stage 1 Internal-Page Links

Before building or resuming a pre-approval client site, read `operators/skills/stage-1-direction-confirmation.md` (from the Sorted repo root). Implement its shared direction-confirmation pages and consistent internal routes during Op 4, before Op 5/5b. This is an intentional review state, not a finished internal page or client approval.


Use this entry point for new Sorted website builds and their client acquisition hubs. A new site build scaffolds a sibling project and initialises the factory job; an existing workspace update uses the shared hub and client configuration.

Use pnpm for setup, development, verification and handoffs. Follow `operators/skills/factory-operators.md` -> Package Manager And Handoffs before any dependency work; package/network permissions remain separate.

## What to load first

Before running anything, read the full operator skill:

1. **Website task:** `/Users/renaldoedmondson/Projects/sorted/operators/skills/factory-operators.md` - complete-pack intake, phase contracts, safe resume and evidence.
2. **Workspace task:** `operators/skills/workspace-build.md` and `operators/skills/start-build.md` -> Client workspace standard. Load these instead of scaffolding another site.
3. **Lifecycle reference when needed:** `doctrine/operator-chain.md`. The full downstream lifecycle remains active.

## Build Request Is Local Build Approval

A request to build a new client website authorises the normal local Stage 1 work: scaffold its sibling project, customise the template root layout and components, add advertised routes, optimise supplied assets, and run local checks and a preview. Do not ask for a separate `/approve` for these steps.

Inspect the supplied export folder first. ChatGPT now supplies approved mockup, reconstructed images and design-IR/asset manifests. Read these together; do not run local deconstruction or image generation by default. Resolve slug from supplied information/user, and ask only for genuinely missing or conflicting inputs.

Keep the separate safety gates: do not overwrite an existing build, install packages, access the network, modify deployment configuration, deploy to production, or treat a build request as client design approval. Ask for the specific permission when one of these actions is needed. CMS remains a separate step after Nod 2.

## Client workspace: acquisition hub v2

The default prospect experience is now Overview / Your New Site / Your Ads / Follow-up / Tracking, with a separate Next steps action. Read `operators/skills/start-build.md` → **Client workspace standard: acquisition hub v2** when preparing or updating a client hub. The approved implementation is `sweeneys-martial-arts` in `lib/workspace.ts` and the shared `app/workspace/_components/` screens.

Configure the existing shared hub through `WORKSPACE_OVERRIDES`: one customer offer, client-specific interests, complete standalone ads, selectable full email previews, a customer journey with labelled illustrative tracking, and immediate booking. The website fills the viewport beneath the global navbar. Next Steps leads with “Interested? Book your call.” and keeps “What's the cost?” secondary. Use supplied client assets/messages; mark unbuilt pages and unconnected services honestly. A proposal preview does not authorise deployment, advertising, email sending or CMS installation.

For workspace-only work, inspect the existing client row/configuration and supplied inputs; do not scaffold a new sibling site or require a mockup/manifest unless a new website build is also requested. The `review` route remains compatibility support, not the default client entry point. Preserve project/live states and client-specific payment links and prices.

## Prerequisites

Before scaffolding a new client website, resolve these three inputs from the supplied files or user. Ask for genuinely missing or conflicting inputs. Workspace-only updates do not require them:

1. **Client slug** — lowercase, hyphenated (e.g., `nexus-accounting`, `lrt-plumbing`)
2. **Mockup image path** — absolute path to an approved mockup (`.png`, `.jpg`, or `.webp`)
3. **Export-pack directory** - design-IR, asset manifests and supplied image/font files. Preserve every original; intake validates file references before creating the project.

## How to start the build

Run the start-build script with absolute paths:

```bash
/Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/scripts/start-build.sh \
  <client-slug> \
  <export-pack-directory>
```

**Example:**

```bash
/Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/scripts/start-build.sh \
  nexus-accounting \
  /Users/renaldoedmondson/Downloads/nexus-accounting-export
```

This will:
1. Create `/Users/renaldoedmondson/Projects/<client-slug>/` (sibling to sorted)
2. Scaffold the Next.js site from `sorted/templates/client-site/`
3. Preserve the complete supplied pack in `input/`, with hashes and provenance in `artifacts/input-contract.json`
4. Initialise the versioned factory job; reconstruction is externally supplied, registry/QA remain active
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
2. Start the dev server: `cd <build-dir> && python3 -m http.server 3999 --bind 127.0.0.1 --directory out`
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
