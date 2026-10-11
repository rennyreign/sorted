# Factory Operators - Execution Contract

Use this contract when starting or resuming a Sorted manufacturing job. It preserves the full lifecycle; the default producer is now a ChatGPT export pack, not local image generation.

## Source And Safety

- Human-approved amendments override the original design. The approved mockup governs composition; verified business facts govern claims; design-IR supplies implementation detail and exact copy unless it conflicts. Stop for material conflicts rather than silently choosing.
- Supplied images are production inputs. Local reconstruction is dormant unless missing/replacement imagery is explicitly requested. Never regenerate a supplied asset to satisfy an old sequence.
- Stage 1 stays local. No CMS before Nod 2, no package/network access without its permission, no deployment without separate authorisation. A local permission record does not create permission.
- Use the active client's fonts, geometry, colours and section order. Taste skills are quality guardrails, not instructions to replace the approved design with generic Sorted styling.
- QA diagnoses; the builder corrects. Agent visual acceptance is not human/client approval.

## Commands

From the Sorted root, compile the factory with existing dependencies before using a changed CLI:

```bash
./node_modules/.bin/tsc -p operators/factory-orchestrator/tsconfig.json
```

New supplied-pack job:

```bash
operators/factory-orchestrator/scripts/start-build.sh <client-slug> <export-pack-directory>
```

Read-only intake check:

```bash
node operators/factory-orchestrator/dist/cli.js init-pack <pack-dir> <slug> --build-dir <new-sibling-dir> --dry-run
```

Use `--mockup`, `--design-ir` and `--manifest` relative paths when the pack is ambiguous. Preserve all supplied masters and manifests. Do not overwrite an existing job.

```bash
node operators/factory-orchestrator/dist/cli.js resume <build-dir>
node operators/factory-orchestrator/dist/cli.js start <operator-id> <build-dir>
node operators/factory-orchestrator/dist/cli.js mark-passed <operator-id> <build-dir> --artifact <relative-artifact-path>
node operators/factory-orchestrator/dist/cli.js mark-failed <operator-id> <build-dir> "<reason>"
node operators/factory-orchestrator/dist/cli.js fingerprint <build-dir>
```

Start the job's attempt record before execution using `scripts/manufacturing-ledger.mjs`; finish it with the actual outcome and explicitly known time/cost fields. Unknown human time or billed cost stays unknown. See `docs/manufacturing-two-build-pilot.md`.

Blocked is not complete. Read the reason and fix that boundary. Do not bypass predecessors, fabricate artifacts or set every stage passed to repair tracking.

Legacy jobs require explicit reconciliation:

```bash
node operators/factory-orchestrator/dist/cli.js reconcile <build-dir>
```

Reconciliation preserves the old state, creates pending new gates and resets unsupported or evidence-less results. It does not certify old work. Review its result before resuming.

## Evidence Envelope

Read `artifacts/input-contract.json` and the original mockup/design-IR before building. It records file hashes, supplied asset provenance and unresolved information without replacing the original design.

Mutable-site artifacts include:

```json
{
  "source_revision": "<factory fingerprint of actual site source>",
  "input_sha256": "<SHA256 of artifacts/input-contract.json>"
}
```

Use actual calculated values, not a Git SHA substituted for a source fingerprint. QA additionally records existing local screenshots/logs, the tested environment, explicit checks and discrepancies. A passing boolean without evidence is not acceptance.

After an external source change, invalidate affected evidence:

```bash
node operators/factory-orchestrator/dist/cli.js invalidate <build-dir> --from visual-qa --reason "<change>"
```

Keep old artifacts for diagnosis. Rebuild the export, regenerate structural/visual evidence, and re-test the current source. Editing stages that change the appearance require fresh QA too.

## 0 - Build Initialisation

Input: complete export folder with approved mockup, design-IR/manifest and supplied imagery.

Action: validate intake, safe paths, slug, image files and asset references; scaffold a new sibling project; preserve originals in `input/`.

Output: `input-contract.json`, `build-init.json`, versioned `state/build-state.json`.

Gate: no missing required assets, path escapes, symlinks, conflicting IDs or material unresolved inputs. Dry-run writes nothing. Template copying must not install or fetch dependencies.

## 1 - Mockup Regions

This stage is conditional. A supplied design-IR and approved mockup can be consumed directly; the new intake records that choice with an explicit skip reason. If crops/coordinates are needed, derive only the missing comparison references.

Output when executed: `regions.json` and useful crops; follow the existing region/deconstruction contract. Do not regenerate images or re-interpret supplied copy.

## 2 - Asset Reconstruction

Default disposition: externally supplied by ChatGPT, recorded with input provenance.

Do not run Flux/OpenAI or the asset-generator CLI during a complete-pack build. Keep `operators/skills/asset-generator.md` as a dormant fallback. Missing/replacement images require a specific brief and API/network approval. Externally supplied work is not local generation time.

## 3 - Asset Registry

```bash
node operators/factory-orchestrator/dist/cli.js register-assets <build-dir>
```

Validate/decode supplied assets, preserve masters, optimise raster production files to WebP without upscaling, retain SVG proportions, and map asset IDs to actual production paths. Consume `asset-registry.json` in code; do not guess filenames. Do not overwrite unrelated existing files.

## 4 - Frontend Reconstruction

Read approved image and design-IR together. Build the homepage and advertised routes using the client template and existing dependencies.

Before coding, list material conflicts, font availability/weights, required sections, asset placements/crops and actual CTA behaviours. Record missing business facts as unknown. Do not invent review counts, accreditations, addresses, working submissions or approval backends.

Apply `stage-1-direction-confirmation.md` to unbuilt advertised pages. Keep genuine phone/email/booking actions functional where supplied. A disabled or draft integration must explain its actual state.

Output: client source plus `frontend-build.json` containing successful build evidence, generated sections and resolved/total assets. Build logs must exist. No CMS content wiring in Stage 1.

## 5 - Structural And Functional QA

Capture the current static export at 1440, 768, 375 and 320px, plus the mockup's native width where relevant. Test every advertised route, image, anchor, phone/email action, mobile menu and any dialog/form interaction. Exercise keyboard controls and reduced motion.

Use `scripts/manufacturing-browser-qa.mjs` for the reusable checks and add focused client-specific interaction checks where needed. Save screenshots/logs in the job, not only `/tmp`.

```bash
node scripts/manufacturing-browser-qa.mjs <build-dir> --url http://127.0.0.1:<job-port> --playwright <existing-playwright-module-path>
```

The job's `client/qa-profile.json` explicitly lists local routes with `built`/`pending` states, optional exact headings/reference width and local interaction expectations. The runner blocks external/unsafe requests, records actual rendered H1 fonts, and prints the saved artifact path. Pass that relative path to factory `mark-passed`; it does not automatically approve the vision gate. Headless mode is an explicit `--headless` option.

Wait for fonts and visible images to settle with bounded waits; do not wait forever for hidden lazy images. Structural pass is not proof of visual parity.

Output: `visual-qa.json`, screenshot paths, checks and any structural discrepancies. Fail before vision review if the site is broken.

## 5b - Independent Visual QA

Read `op-05b-human-vision-qa.md`. Use a reviewer that can inspect images; do not demand a user model switch when that capability is already available.

Compare reference and rendered screenshots by section: geometry, hierarchy, font actually rendered, wrapping, image crop, spacing, colour and component structure. Distinguish reference-width fidelity from responsive adaptation when mobile mockups are absent.

Output: `human-vision-qa.json`, discrepancy IDs, expected/observed/evidence and approved exceptions. This stage cannot be skipped based on confidence or functional tests.

## 6 - Pixel Correction

Consume discrepancy IDs rather than redesigning independently. Fix material discrepancies in a consolidated pass, preserving approved accessibility/safety departures. Record addressed IDs, modified files and the current revision in `pixel-correction.json`.

Rebuild and return to structural and visual QA. The correction budget is three attempts; exhaustion blocks/escalates rather than continuing indefinitely. No correction needed after a valid vision pass is an explicit conditional skip.

## 7 - UI Systemisation

Stabilise components and interactions without changing the approved appearance. Reuse tested primitives; do not introduce a component library/package merely to satisfy terminology.

Output: `ui-systemisation.json` listing actual changes, components and fidelity-preservation evidence. A justified no-op must say why the existing architecture already satisfies the requirement. Source changes invalidate affected visual evidence.

## 8 - Design-System Extraction

Extract client colours, fonts/weights, type scale, spacing, containers, grids, navigation, buttons, cards, image treatments, responsive rules and interaction behaviour from the actual approved implementation.

Output: `design-system.json`. Use it for internal pages; do not replace client grammar with universal 1400px/oversized-type defaults.

## 9 - Core Build QA

Rebuild after systemisation. Confirm current-revision build/browser checks, assets, interactions, responsiveness and preserved fidelity.

Output: `core-build-qa.json` with actual checks and overall pass. Historic build results do not establish that the current revision is working.

## Human Assessment

Present current reference/build evidence and recorded exceptions. Wait for explicit Renaldo/client approval or rejection of that revision.

Output: approval artifact with reviewer, decision, timestamp and current evidence envelope. Pass requires the explicit human-approval command flag; agents must not infer consent from a preview visit, call booking, payment link or their own QA.

## Workspace Build

Read `workspace-build.md` and `start-build.md` -> Client workspace standard. Require the human-approved commercial/creative brief before configuring the existing acquisition hub.

The shared screens already exist. Do not build a second portal, publish ads, send follow-up messages, test live payments or install CMS. Record the approved website revision, actual shared config hash, built screenshot and workspace checks.

## 10 - Internal Pages

After direction approval, use supplied page content/mockups and the client design system. Reuse assets/QA/correction boundaries. PendingPage is not a completed internal page.

Output: `internal-pages.json` with per-page paths, statuses and QA iterations. Skip only with explicit evidence that no internal pages are required.

## 11 - CMS Integration

After Nod 2 and the relevant permission, follow the existing `add-cms` entry point, `sorted-studio-cms.md` and `add-decap-cms.md`. Reuse canonical Studio templates. Preserve all-content-editable, image-helper and reset rules.

Local factory authorisation records the permission; it does not grant it. Output: `cms-integration.json` with field mapping, auth/config state and approved baseline.

## 12 - CMS QA

Test actual auth/edit/image/save/persistence/preview workflows in a safe environment. Restore test content. Follow existing Studio QA, not a mock save notification.

Output: `cms-qa.json` with nonempty actual tests and overall pass.

## 13 - Analytics

Use the existing website-tracking-profile and canonical tracking bundle. Verify meaningful event firing; do not invent IDs or claim proposed reporting is connected.

Output: `analytics.json` with actual verified events. Publishing tags/connecting services requires separate permission.

## 14 - Launch QA

Read `launch-qa.md`. Preserve its full visual/functional/performance/SEO/accessibility/security/ownership/recovery gates.

Any remaining advertised PendingPage, staged contact detail, unconnected required submission or missing required ownership workflow blocks launch.

Output: actual launch report plus factory artifact/evidence envelope. A Stage 1/workspace pass is not a launch pass.

## 15 - Deployment

Require launch pass, explicit deployment request and separately recorded authorisation. Follow existing feature-branch/review/CICD discipline.

Output: `deployment.json` with deployment URL, actual release commit and production verification. Do not trigger a deploy while simply advancing local state.
