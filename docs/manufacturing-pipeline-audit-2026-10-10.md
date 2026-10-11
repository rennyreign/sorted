# Sorted Manufacturing Pipeline Audit

Date: 2026-10-10. Initial audit only; no operational changes approved or applied.

## Verdict

The working process has moved ahead of parts of its infrastructure. Recent sites are built from ChatGPT export packs containing reconstructed images and design JSON, while the main instructions still default to local deconstruction and local image generation. The existing full factory lifecycle remains relevant. Good websites are being produced through agent judgement and local corrections, rather than through a reliably enforced production contract.

The highest-return opportunity is to make the existing successful process explicit and dependable. Do not begin by adding more agents, trimming all skills, changing models, or implementing every operator in the older brief.

Five verified Stage 1 builds per working day is a useful experimental target, not a demonstrated current capability. Existing records cannot establish accepted output per day, labour per site, model cost per accepted site, or a reliable defect rate.

## Scope And Evidence Limits

- Reviewed the supplied chain diagram and subsequent user clarification, the manufacturing build brief, AGENTS, operator context, build doctrine, Sorted OS manufacturing/QA/metrics documents, skill entry points, build skills, factory source and compiled scheduling logic, the three older manufacturing implementations, client scaffold, CMS/tracking reuse mechanisms, workspace handoff configuration, and repository/artifact inventory.
- Examined all 18 immediate sibling projects containing `state/build-state.json`. Deep-read recent build/QA records for AC Electrical, Joshi, PSC, McColm Cardew, ABCD and SEEM; inspected additional state/artifact inventories.
- Performed isolated in-memory scheduler diagnostics against the existing compiled module. No real build state was changed. The unsupported `mark-skipped` command was tested and rejected without writes.
- This is a repo-wide manufacturing audit, not a line-by-line security or correctness review of every acquisition operator, platform screen, migration, or client website.
- No network/API requests, shared database queries, image generation, package installation, production deployments, live form submissions, or fresh client-site builds were run. Secrets and session-audit logs were not read.
- Historical browser/build results below are retained evidence and session reports, not freshly re-certified sites. Session logs can duplicate one event and contain inconsistent intermediate state; they are not an event ledger.
- The worktree already contains uncommitted client-hub changes and other artifacts. These were preserved. Audit outputs and a continuity summary are the only intended additions.

Evidence labels: **measured** = local census or executed diagnostic; **observed** = inspected code/artifact; **hypothesis** = predicted throughput/cost effect not yet tested.

## Alignment With The Updated Flow

The user clarified that `docs/operator-chain-update.png` updates the asset-production boundary and workspace protocol; it does not supersede the full manufacturing infrastructure. The 905-line build brief remains a relevant lifecycle specification. Its local reconstruction stages need conditional routing, not wholesale removal. Systemisation, design-system extraction, internal pages, CMS, CMS QA, analytics, launch QA and deployment remain relevant with their existing approval boundaries.

| Current-flow boundary | What exists | Gap |
| --- | --- | --- |
| ChatGPT creates mockup, reconstructs imagery, exports pack | Recent sibling `input/` folders contain mockups, assets and design/asset JSON | Build skills still default to repeating deconstruction and reconstruction locally |
| CLI receives pack and prepares repository | `start-build.sh`, client template, factory init | Script accepts only slug + mockup + one JSON; it does not ingest the complete pack |
| Agent builds homepage from supplied assets | Recent functioning static exports and local QA evidence | Source precedence, font availability and input schema vary by client |
| Independent agent assesses fidelity | Op 5b skill and several comparison reports | Vision review is skippable; skill assumes user model switching; diagnosis sometimes includes fixes |
| Corrections are made and re-checked | Real correction artifacts and screenshots | State machine does not reliably enforce loop/retry/evidence semantics |
| Human assesses homepage | Human approval remains explicitly separate in doctrine | Factory has no durable approval gate corresponding to this diagram boundary |
| Human supplies pricing/offer/creative details | Acquisition hub v2 guidance and `WORKSPACE_OVERRIDES` | Workspace task is mixed into start-build documentation but absent from factory state |
| Agent builds workspace | Shared screens and Sweeney's reference are implemented | No explicit approved workspace brief or completion artifact linking it to accepted website revision |

**Proposed scope distinction:** `STAGE1_VERIFIED` is a locally built, independently checked homepage plus advertised review routes. `HUMAN_APPROVED` is a separate recorded decision. `WORKSPACE_READY` requires the human-supplied commercial/creative brief. The full factory continues through systemisation/design grammar, real internal pages, CMS/CMS QA, analytics, launch QA and deployment when their approval conditions are satisfied. None of these milestones substitutes for another.

This avoids both premature delivery work and counting pending pages as completed websites.

## Measured Local Snapshot

Census rule: immediate directories under `/Users/renaldoedmondson/Projects/` containing `state/build-state.json`. Snapshot read on 10 October; no claim that this covers all Sorted clients.

| Measurement | Result | Interpretation |
| --- | ---: | --- |
| Factory-state files found | 18 | Census denominator, not completed-site count |
| Exported `out/index.html` exists | 15/18 | Export presence alone does not establish correctness |
| Every operator still pending | 4/18 | ABCD, Diligent, SEEM, Switched On; all four have exported homepages |
| Any operator has `started_at` | 0/18 | Cannot calculate operator service time from these states |
| Human vision QA recorded as passed | 6/18 | Recorded status, not fresh independent certification |
| Core QA / launch QA / deployment recorded passed | 0/18 each | Incomplete tracking/Stage 1 scope, not evidence of zero real launches |
| Frontend passed but declared `artifacts/frontend-build.json` absent | 5 projects | AC, AMP, Joshi, McColm, PSC |
| State contains an unsupported status value | 1 project | Sweeney's uses `completed` on three operators; enum accepts `passed`, not `completed` |
| Referenced per-operator skill files absent | 16/17 | Only `op-05b-human-vision-qa.md` exists among factory metadata targets |

Frozen census identities: ABCD, AC, Advocate Better Care, AMP, Chillika, Diligent, Edgbaston Tuition, Feroza, Joshi, Kelly, LRT, McColm Cardew, Murray Martin, Nexus, PSC, SEEM, Sweeney's, Switched On.

Frozen recorded vision passes: Edgbaston Tuition, Feroza, Joshi, LRT, Murray Martin, Nexus. These are not an acceptance-rate denominator.

Scheduler diagnostic evidence is retained at `/tmp/sorted-factory-audit-verification.txt`:

| Scenario | Required safe behaviour | Actual result |
| --- | --- | --- |
| Failed build initialisation | Retry relevant stage or block | Dispatches mockup regions |
| Mockup regions already running | Wait/resume same operation | Dispatches asset reconstruction |
| Frontend marked passed with prerequisites pending | Reconcile prerequisites or block | Dispatches visual QA |
| Failed vision QA at correction budget of three | Escalate/block | Dispatches human vision QA again |
| Accepted vision and completed systemisation | Continue to design-system stage | Correctly dispatches design system |

These are controlled synthetic states. They establish scheduler behaviour, not its historical incident frequency.

## Findings By Severity

### F1 - High: The scheduling layer does not enforce the claimed safety contract

`operators/factory-orchestrator/src/state.ts:363-418` chooses pending work after `last_completed_operator` with special QA branches; it does not generally block failed/escalated prerequisites or active work. The vision-success branch can also keep returning vision QA while `last_completed_operator` remains visual QA, regardless of the exhausted correction budget.

`src/cli.ts:160-181` marks any valid operator passed without checking predecessors, output presence, output contents, or the tested revision. `contracts.ts` contains TypeScript interfaces, not executable validators. `state-manager.ts:34-48` casts arbitrary JSON and writes directly to the state file; there is no runtime validation, atomic replacement, lock or event history.

Consequence: resumability means "some state survives", not "the next safe operation is guaranteed". Concurrent writers would create additional risk; no concurrent-write incident was measured.

### F2 - High: Default build routing has not incorporated the new upstream producer

`AGENTS.md:100-106`, `operators/skills/site-build.md:48-72` and `doctrine/operator-chain.md:160-335` describe local mockup deconstruction -> local image generation -> frontend. `start-build.md:88-127` describes the 17-step sequence. The supplied diagram and recent packs put image reconstruction before CLI intake.

The manufacturing entry point references missing `operators/skills/manufacturing-line.md`; factory metadata points to 16 other missing files. `op-05b-human-vision-qa.md:130-133` documents `mark-skipped`, which the CLI rejects.

The full 17-step lifecycle is not redundant. The conflict is that default intake does not recognise already completed upstream work, and different entry points use different sources/locations and missing execution references.

### F3 - High: Contradictory inputs and generic design defaults produce avoidable fidelity rework

AC's retained `artifacts/mockup-qa.md` explicitly identifies manifest/reference disagreements in review columns, CTA composition and footer. Earlier functional checks passed but did not prove fidelity or the rendered font. Subsequent local font supply and layout corrections were necessary.

ABCD's October 6 logs show that 159 passing functional assertions were followed by a separate visual review finding density, geometry and footer differences. This establishes that functional success is not visual acceptance; it does not establish a fleet-wide failure percentage.

`start-build.md:220` calls the manifest authoritative for everything; `frontend-builder.md:105` instead makes the mockup authoritative for layout. The standalone builder's `prompts.ts:479-497` hardcodes Sorted fonts, generous spacing, 1400px containers and a viewport-height hero. Those defaults can contradict a client's approved composition.

### F4 - High, fallback path: The old frontend CLI is unsafe to activate as the scale solution

- `scaffold.ts:28-30` recursively removes an existing output directory without confirmation.
- `orchestrator.ts:159-176,212-218` reports build failure but returns no build-success field; `cli.ts:225-237` exits based on failed generated files, so a build failure alone can exit successfully.
- `--no-build` is parsed/displayed but not propagated into `BuildConfig`; dependency installation/build still run.
- Dry-run reaches the API-key check in `orchestrator.ts:59-60`, despite the CLI allowing dry-run without a key.
- Calls send text only (`claude.ts`); the implementation cannot directly compare the approved raster. Files generate sequentially without sharing the generated code contracts.

These are source-confirmed risks, not observed causes of recent export-pack builds. Do not run this CLI against existing client projects as a "quick acceleration" measure.

### F5 - Medium: Repeated environment and interaction work is not captured in the scaffold

The template has no lockfile, caret dependencies, Google font loading, `next start` despite static export, and `next lint` despite Next 16. It includes an unadvertised `/updates` chat simulator claiming changes are applied. Its mobile nav lacks the richer keyboard/focus behaviour repeatedly implemented in recent builds.

Recent logs document copied/symlinked dependencies between client repos, Webpack fallbacks, font fallback correction, transformed-ancestor modal positioning, sticky-header animation correction, lazy-image capture hangs and focus-visible test modality mistakes.

Examples: PSC's October 8 correction log, SEEM's Stage 1 report, ABCD's October 6 correction/nav logs, and the latest Sorted hub summary. These demonstrate repeated categories of work, not their total cost or incident rate.

### F6 - Medium: Verification and timing evidence are not durable enough for optimisation

Browser suites repeatedly live in `/tmp`, counts differ substantially by project, and screenshots/logs are not tied consistently to an immutable tested source revision. Factory states lack start times, and pass statuses can lack their declared artifacts. The old builder's token tracker prints aggregate estimated cost, while its persisted build log omits per-call token/model data.

`sorted-os/08-metrics/metric-definitions.md` says calculation rules and sources remain undefined; the scorecard is blank. Current records cannot answer error frequency, rework minutes, operator utilisation, API cost per accepted output, or the five/day objective.

### F7 - Medium: Workspace sequencing and public preview capability remain underspecified

The new acquisition hub is a strong reusable implementation. Its skill now describes complete ads, full follow-up previews, honest example tracking and booking-first next steps. But configuring this is mixed with site initialisation and it has no corresponding factory gate.

Several clients use development-only localhost preview URLs and production screenshots (`lib/workspace.ts`). A public screenshot is not an interactive website. Stage 1 local-only doctrine must not be silently bypassed to solve this; agree the review surface explicitly. Default payment-link inheritance is already documented as a risk in the workspace skill.

### F8 - Medium: Conflicting defaults and genuinely superseded instructions remain discoverable

`.devin/workflows/new-client-site.md` instructs pushing main and connecting Netlify before Stage 1, contrary to current local-only rules. `docs/ad-previewer.md` prescribes sibling `/_sorted/ads`, contrary to the current shared Sorted Ads portal. `sorted-os/03-sites/manufacturing.md` repeats the older local asset chain and needs its producer/default-route updated, not retirement of its downstream stages.

`operator-context.md` labels the chat maintenance operator as the CMS implementation, while current CMS installation uses Decap/Sorted Studio templates and workflow. These products should be distinguished, not deleted together.

## Recommendations Ranked By Expected Verified Output Impact

Ranking is a hypothesis about impact, not a measured return-on-investment table. Safety fixes in R3 are prerequisites before introducing concurrency or activating older CLIs. R5 instrumentation precedes performance experiments even though it creates little immediate output itself.

### R1 - Make export-pack intake the default and settle source authority

1. **Evidence:** F2/F3; recent packs already contain reconstructed imagery and design JSON, but active instructions repeat upstream work. AC shows actual manifest/mockup conflict.
2. **Root cause:** producer boundary changed without a versioned consumer contract or a single authoritative entry point.
3. **Change:** default intake: supplied complete pack -> validate/normalise -> register/optimise supplied assets -> build, then continue through existing lifecycle gates. Record reconstruction as externally satisfied with provenance, not locally executed. Keep the asset generator dormant; route missing/replacement assets to an explicitly requested fallback, never automatically regenerate supplied imagery. Region decomposition remains conditional when useful for comparison/cropping and not already supplied. Keep original inputs unchanged. Resolve intake into a versioned record with slug, business facts/unknowns, approved mockup/hash/reference dimensions, design tokens, exact copy, asset IDs/files/provenance/crop intent, font files/weights/licensing status, advertised routes/CTA behaviours, approved exceptions and input conflicts. Mockup governs composition; explicit human amendments govern departures; verified business facts govern claims; JSON supplies implementation detail unless it conflicts. Stop for material conflicts.
4. **Expected effect:** fewer duplicate calls and upstream repeats; better first-pass fidelity; no quantified saving yet. Extra validation may increase intake time but reduce later corrections.
5. **Confidence/assumptions:** high on mismatch, medium on throughput benefit; assumes reasonably complete export packs. Include ChatGPT preparation time so labour is not merely shifted upstream.
6. **Controlled test:** paired builds from frozen AC, Joshi and McColm packs; same builder/model/toolchain, current versus normalised intake. Compare first independent visual pass, material input conflicts found before coding, total correction time and total preparation+build time.
7. **Value:** Trust + Operations; closes source ambiguity; observe accepted fidelity and fewer preventable returns.

### R2 - Make independent visual QA a required Stage 1 gate, not an optional confidence check

1. **Evidence:** F3; many functional passes did not establish visual accuracy. Op 5b permits skipping based on structural QA and sometimes conflates vision capability with human involvement.
2. **Root cause:** functional tests, agent fidelity assessment and client approval share ambiguous names and pass criteria.
3. **Change:** deterministic browser capture/functional checks -> independent vision diagnosis -> builder correction -> fresh re-test -> human assessment. QA must not edit code or design its own acceptance exceptions. Supply mockup, screenshots, source/revision identifier, reference dimensions, fonts and explicit exceptions. Do not demand a user model switch when the active reviewer can already inspect images. Record capability/tool identity instead. Structural checks cannot waive visual review.
4. **Expected effect:** fewer defects escaping to human review; possibly more pre-review QA time, but fewer return trips. No claim that adding a reviewer inherently reduces cost.
5. **Confidence/assumptions:** high on need for separate fidelity evidence; medium on net throughput. Requires a reviewer genuinely independent of implementation decisions and bounded correction scope.
6. **Controlled test:** seed distinct typography, crop, section-density, alignment and mobile interaction regressions into disposable fixture copies; compare functional-only versus functional+visual detection. Then run paired real-pack builds and measure missed material defects and total correction time.
7. **Value:** Trust + Enquiries; closes mismatch between promised visual proof and usable delivery; observe fidelity acceptance and working CTA/mobile paths.

### R3 - Enforce state, evidence and approval gates before relying on automation

1. **Evidence:** F1/F4 plus the measured state census. Failed/running prerequisites can be bypassed, output validation is absent, and the old frontend CLI can delete prior work or report a failed build successfully.
2. **Root cause:** scheduling is a status display layer presented as a validated state machine; manual mutation and prose contracts stand in for executable checks.
3. **Change:** preserve existing lifecycle responsibilities while adding explicit phase/dependency gates, runtime schemas, atomic state writes and one writer per job. Support upstream-satisfied work with producer/input provenance and explicit human-approval/workspace gates. Pass requires validated output linked to input/source hash and tested revision. Record start/end, attempts, stop/escalation reasons and human approval separately. Invalidate affected downstream evidence after corrections. Existing state migrates by reconciliation, never by mass-setting passed. Make fallback scaffold non-destructive and build failure nonzero; implement or remove misleading flags before exposing it.
4. **Expected effect:** prevents false completion and unsafe resumes; lowers interruption/recovery work. Throughput gains unmeasured; small validation overhead expected.
5. **Confidence/assumptions:** high on defects and safety benefit; medium on daily-output impact. Do not retrofit a full distributed queue for five/day without a demonstrated need.
6. **Controlled test:** run the five recorded scheduler scenarios plus rejected out-of-order passes, missing/malformed artifacts, invalid legacy status, interruption during state write, concurrent attempts, changed source after QA, correction-budget exhaustion, human approval absent, existing output and failed-build CLI cases. All must preserve prior work and block unsafe progression.
7. **Value:** Operations + Trust; closes false-state/recovery gaps; observe safe resumptions and evidence-valid completions.

### R4 - Productise the recurring scaffold/environment/interaction work

1. **Evidence:** F5; dependency borrowing, font problems, modal/focus/sticky corrections and repeated `/updates` removal.
2. **Root cause:** generic scaffold lacks the behaviours required by the current Stage 1 flow; environment provenance is implicit.
3. **Change:** a tested Stage 1 scaffold with a chosen package manager/lockfile, explicit runtime version, verified static-preview/typecheck/lint commands, reproducible dependency setup, local font capability, PendingPage, accessible menu and dialog primitives, reduced-motion behaviour and no simulated Updates portal. Keep client styling custom. Choose Webpack versus Turbopack from a controlled environment test, not blanket folklore.
4. **Expected effect:** fewer repeated safety fixes and setup interruptions; reduced variance. Maintenance and regression-test cost increases initially.
5. **Confidence/assumptions:** high on repeated categories; medium on saving magnitude. Shared primitives must preserve rather than homogenise approved designs.
6. **Controlled test:** fresh disposable projects from current and candidate scaffolds, same dependency snapshot. Test cold setup, static export/preview, offline font availability, keyboard nav/dialog behaviour, motion on/off, 320px overflow and viewport-fixed overlays. Follow with a three-pack build pilot.
7. **Value:** Enquiries + Operations; closes interaction/environment reliability gaps; observe usable paths and fewer repeat repairs.

### R5 - Measure verified throughput and rework before optimising model spend

1. **Evidence:** F6 and 0/18 recorded operator starts. No reliable acceptance/cost/time denominator.
2. **Root cause:** snapshot states and narrative logs are being asked to serve as production telemetry.
3. **Change:** append-only attempt records: job/pack/revision, phase, tool/model/version, start/end, active human minutes, machine wait, input/output tokens where available, billed versus estimated cost, result/evidence, defect origin, correction reason, scope-change flag and acceptance time. Retain per-attempt evidence; derive dashboards from this ledger. Unknown usage/cost remains unknown.
4. **Expected effect:** no immediate speed guarantee; enables trustworthy prioritisation and avoids optimising inexpensive steps while missing rework/human bottlenecks.
5. **Confidence/assumptions:** high that current data is insufficient. Requires low-friction logging and explicit human-time capture.
6. **Controlled test:** shadow-log the next five jobs without changing their workflow. Reconcile attempt records to saved build/browser evidence and human acceptance. Confirm a changed revision, interrupted attempt and unknown model cost cannot be counted as accepted, completed or free.
7. **Value:** Operations; closes the measurement gap; observe accepted outputs, labour and cost per accepted output.

### R6 - Give workspace preparation its own human-input contract and completion gate

1. **Evidence:** F7; reusable hub exists, but commercial decisions and website work are mixed in the start-build specification and absent from state.
2. **Root cause:** the acquisition service evolved without a corresponding production handoff.
3. **Change:** split workspace task from homepage build. Require human-approved offer/pricing/payment-link choice, creative/copy sources, proposed versus connected states, follow-up messages/timing/ownership and review-surface decision. Link workspace to the accepted website revision and built screenshot. Validate configuration against existing shared types; explicitly clear absent payment links. Reuse Sweeney's structure, never its facts.
4. **Expected effect:** fewer questions/context reloads and wrong-client data risks; makes website acceptance and workspace readiness separately schedulable.
5. **Confidence/assumptions:** high on missing boundary; medium on time saved. Human input remains necessary and waiting time is not agent failure.
6. **Controlled test:** fixture workspaces for a trade, accountant and academy; verify complete ads, supplied emails, pending offer pages, disconnected tracking, screenshot provenance and correct/cleared payment link. Stub every external write; test no inherited cross-client claims, prices or payments.
7. **Value:** Trust + Customers + Operations; closes disconnected offer/handoff gaps; observe a complete, accurate acquisition hub and human decisions recorded once.

### R7 - Introduce bounded concurrency across sites, not uncontrolled writers within a site

1. **Evidence:** older asset and frontend implementations process work sequentially; independent client projects exist. No measured machine utilisation or concurrent-capacity benchmark.
2. **Root cause:** sequential runtime and untracked resource/ownership boundaries.
3. **Change:** start with two independent site jobs, isolated repos/artifacts/ports, one state writer each, and resource-aware build scheduling. QA can assess site A while site B builds. Optimise independent supplied assets concurrently within bounded limits. Do not parallelise shared `lib/workspace.ts` edits or have multiple agents write client globals/nav at once. Internal pages wait for approved design system/direction.
4. **Expected effect:** shorter batch wall time if model or machine waiting is dominant; can worsen throughput through RAM/build contention or overloaded human review.
5. **Confidence/assumptions:** medium-low on net gain until telemetry exists; high that shared writes need serialisation.
6. **Controlled test:** same frozen six-pack batch at one then two concurrent jobs, balanced order; compare verified completions, human active time, peak memory, failures, correction time and oldest-job delay. Increase beyond two only after passing.
7. **Value:** Operations; closes avoidable idle time without introducing collisions; observe accepted batch output rather than started-job count.

### R8 - Select models and context by measured task outcomes

1. **Evidence:** old builder uses text-only Sonnet 4.5; deconstructor defaults vary by provider; asset code has multiple generation paths. Similarity judge receives candidate+description, not a reference crop, so its score is semantic suitability, not mockup fidelity. Comments make unbenchmarked quality/cost claims.
2. **Root cause:** model defaults and broad design prompts accumulated independently of the changed producer boundary and acceptance evidence.
3. **Change:** default supplied-pack jobs need no reconstruction API. Use deterministic code for intake, registry, resize, route checks, screenshot capture and state validation. Use capable coding/vision reasoning for actual reconstruction and diagnosis. Task-load the relevant contract/examples, not the entire company history. Keep fallback image generation opt-in. Preserve all correctness-critical instructions; do not shorten context merely to save tokens.
4. **Expected effect:** avoid unnecessary API work; potentially improve fidelity from image-aware context. Model substitution may reduce raw call cost while increasing rework; net effect unknown.
5. **Confidence/assumptions:** high on mismatched capabilities; low on the best alternative model or token saving. Local availability/pricing was not live-verified.
6. **Controlled test:** hold skill/input/toolchain fixed and compare two available model configurations on frozen fixtures; separately test current versus task-scoped context with the same model. Track blind visual/functional acceptance, retries, total billed cost and total time. For fallback imagery compare candidate against actual crop+manifest, not text alone.
7. **Value:** Trust + Operations; closes inappropriate reasoning/capability use; observe cost and time per accepted artifact without fidelity loss.

### R9 - Deprecate conflicting artifacts selectively; do not purge history blindly

1. **Evidence:** F8, missing skill links, tracked `tmp-nexus-*` utilities, ignored prototype outputs and skeletal operator directories.
2. **Root cause:** historical specs, experiments and current execution guidance lack lifecycle/ownership labels.
3. **Change:** inventory each artifact as active, dormant fallback, historical, generated or unknown; assign owner/canonical replacement. Keep the full lifecycle brief and downstream capabilities active. Update upstream defaults and remove genuinely deprecated instructions from active routing before proposing relocation/deletion. Preserve QA provenance and operational routes.
4. **Expected effect:** fewer wrong-path executions and less search/context noise; disk reclamation is secondary, not a demonstrated five/day bottleneck.
5. **Confidence/assumptions:** high on conflicting instructions; low on whether unreferenced experiments have no remaining use.
6. **Controlled test:** offline reference/skill-link validation plus representative start/resume/workspace/CMS/launch task routing before/after deprecation. Require unchanged safety gates and no references to removed artifacts. Actual deletion requires an explicit reviewed list and approval.
7. **Value:** Operations + Trust; closes misleading execution guidance; observe correct task routing and zero broken active references.

## Operator Responsibility And Skills Design

Do not implement 17 autonomous agents merely because the older brief lists 17 boundaries.

| Responsibility | Recommended execution | Independence and contract |
| --- | --- | --- |
| Pack intake, validation and scaffold | Deterministic tooling | Consume full pack; preserve source; produce validated job/registry, never redesign |
| Supplied asset preparation | Deterministic resize/registration | Asset IDs, provenance, dimensions, paths and crop intent; no generation unless requested |
| Homepage reconstruction | Coding agent | Mockup + resolved design/asset/font/copy contract; own site files, not approvals |
| Browser checks and capture | Deterministic browser runner | Reusable checks + client route/CTA expectations; save evidence and tested revision |
| Visual diagnosis | Independent vision-capable reviewer | Read-only discrepancy artifact; mockup comparison and approved exception list |
| Corrections | Builder | Consume discrepancy IDs; preserve safety departures; return to QA |
| Human assessment | Renaldo/client | Record decision and reference revision; not a model pass |
| Workspace manufacture | Coding/config agent after human brief | Shared platform configuration; no sending/publishing/payment actions |
| UI systemisation / design grammar | Existing lifecycle capabilities | Preserve approved appearance; extract reusable rules for remaining pages; re-test regressions |
| Internal pages / CMS / CMS QA / analytics / launch / deployment | Existing lifecycle under approval gates | Reuse existing doctrine and product templates; retain scope and gates despite omission from diagram |

Skill structure: one thin task router; one canonical contract per boundary; optional task-specific reference material; bundled deterministic scripts for repetition. Fix missing references by mapping lifecycle phases to real maintained capabilities and providing the missing execution contracts where needed. A relevant stage without an implementation should be visibly manual/harness-operated or unavailable, never silently retired or claimed executable.

Split `start-build` into clear website and workspace branches without duplicate canonical instructions. Keep `manufacturing-line` focused on resume/safety and `site-build` as a compatible router, not a second competing chain. Distinguish agent visual QA from human approval. Load CMS/launch context only for those tasks.

The five taste skills are not inherently excessive. Their quality constraints can be useful; rigid generic sizing/font rules must yield to the approved client's mockup. Rich context is justified when it prevents expensive ambiguity. Measure context changes independently from model changes.

## Exact Lifecycle Impact Of The Two Updates

This is a proposed mapping, not an applied state migration.

| Existing stage | Disposition | Change required |
| --- | --- | --- |
| 0 Build initialisation | Active | Ingest whole export pack, including design-IR, original images and font/asset references; validate before scaffolding |
| 1 Mockup regions | Conditional | Reuse supplied region/layout information; derive missing references only when needed for build/QA, without repeating full creative interpretation |
| 2 Asset reconstruction | Dormant local fallback | ChatGPT now supplies this work; record producer provenance and validate delivered files; local model calls require explicit need/permission |
| 3 Asset registry | Active | Register supplied originals, optimise production variants and resolve IDs/paths; generated imagery is no longer a prerequisite |
| 4 Frontend build | Active | Consume approved mockup + design-IR + resolved supplied assets/fonts; preserve existing static-site conventions |
| 5 Visual/structural QA | Active | Keep functional/browser evidence; do not treat it as independent visual or human approval |
| 5b Vision QA | Active | Capability-aware independent diagnosis; keep human assessment as a separate decision |
| 6 Pixel correction | Active | Use discrepancy artifact, re-capture/re-test changed revision |
| 7 UI systemisation | Active | Preserve fidelity while stabilising architecture; evidence must follow modifications |
| 8 Design-system extraction | Active | Carry approved client grammar into subsequent pages; do not substitute universal Sorted styling |
| 9 Core build QA | Active | Continue checking architecture, interactions and fidelity after systemisation |
| Human homepage assessment | Explicit gate | Record approved/rejected revision and feedback; do not infer from agent checks |
| Workspace brief + manufacture | New explicit handoff | Human supplies offer/pricing/creative direction; agent configures acquisition hub v2 and verifies it |
| 10 Internal pages | Active, approval-gated | Continue supplied-page/design-system process; PendingPage is not a passed internal-page build |
| 11 CMS integration | Active, after Nod 2 | Retain Sorted Studio/Decap doctrine and canonical templates |
| 12 CMS QA | Active | Test actual editing/persistence/auth workflows and restore fixture content |
| 13 Analytics | Active | Retain current tracking profile and verified event behaviour |
| 14 Launch QA | Active | Full production-readiness gate; no Stage 1/workspace shortcut |
| 15 Deployment | Active, separately authorised | Retain branch/release discipline and production verification |

The precise placement of workspace work relative to stages 7-9 should follow the current human-assessment checkpoint, with any later architecture changes invalidating affected QA/screenshot evidence. No need to move an existing gate solely to match drawing geometry.

## Cleanup Disposition - No Deletions Authorised

| Artifact/capability | Recommendation | Reason and safety condition |
| --- | --- | --- |
| `docs/Sorted Website Manufacturing Line -- Build Brief.md` (actual filename uses an em dash) | Keep lifecycle specification; add/update producer/workspace boundary in a later approved pass | Omitted diagram stages remain relevant |
| Factory source/contracts and missing `op-*` targets | Repair/reference-map, not archive | Relevant responsibilities, incomplete execution infrastructure |
| Mockup-deconstructor and asset-generator implementations/skills | Dormant fallback for complete export packs | Preserve ability to handle genuinely missing/replacement inputs; remove from default invocation |
| Older frontend-builder API CLI | Quarantine from active scale routing until repaired | Destructive scaffold and false-success risks; do not remove without dependency review |
| `site-build`, `start-build`, `manufacturing-line`, doctrine, operator-context, Sorted OS summaries | Align routing and canonical references | Keep useful detail, remove contradictions rather than indiscriminately shorten |
| `.devin/workflows/new-client-site.md` | Replace obsolete preapproval push/deploy steps; mark old procedure superseded | Conflicts with current branch/local-only discipline |
| `docs/ad-previewer.md` | Mark location guidance superseded by shared Sorted Ads workflow | Preserve historical product requirements where still relevant |
| Template `app/updates/page.tsx` | Exclude from Stage 1 scaffold in candidate change | Simulated apply claims; does not justify deleting live maintenance product |
| `operators/sorted-updates/` | Keep distinct maintenance capability, clarify relationship to CMS | Not equivalent to current Studio installation |
| `tmp-nexus-{crop,regions,registry,screenshots}.mjs`, `tmp-screenshot.js` | Candidate for experiment archive after reference/ownership check | Tracked one-client utilities; useful logic may become shared tools |
| `operators/site-composer-operator/output/` | Candidate historical prototype archive | Local output exists, zero tracked files in that subtree; deleting it is not a git cleanup |
| `operators/mockup-fidelity/`, `operators/owner-identifier/` | Unknown; inspect owners/references before touching | Sparse local directories can contain credentials/state, not necessarily disposable code |
| `sorted-skills/` empty scaffolding | Low-priority ownership review | Empty directories are not a throughput issue |
| `archive/`, historical mockups, input originals, client QA artifacts/session logs | Preserve provenance; retention policy later | Needed to reconstruct approval and defect history |
| Local dependency trees, build caches and ignored generated output | Optional cache/retention maintenance, not indiscriminate purge | Can be active preview dependencies; environment reuse is already fragile |
| `app/v2`, `app/ops`, legacy URL aliases and public assets | Keep unless route/reference audit proves safe removal | `/ops` imports V2; legacy compatibility is not redundant just because a newer name exists |
| Acquisition/enrichment/outreach/quote/GA4 operators | Keep outside this asset/workspace refactor | Diagram changes do not establish these capabilities are obsolete |
| Duplicate global/repo skill names | Compare content and establish source ownership | Both add-cms copies are discoverable; duplication alone does not prove excess model execution |

Initial size inventory found roughly 100 MB of mockups and 26 MB of inputs, while individual local dependency environments are also substantial. These are filesystem sizes, not API-token costs or repository clone measurements; no claim that clearing them increases website throughput.

## Controlled Experiment Plan

No experiments below have been run except the isolated scheduling diagnostics. Package/network access, paid model calls, candidate code changes and any protected configuration changes require the corresponding approval before execution.

### 0. Agree the counted output and preserve a baseline

Confirm whether five/day means verified Stage 1 websites, human-approved website+workspace packages, or launched full-lifecycle sites. Until clarified, use Stage 1 verification as a provisional build-capacity measure and report the other two counters separately. Never present five homepages with pending internal pages as five launched websites.

Record pack hashes, source revisions, current skills, runtime/dependency versions and available model identities. Freeze input packs and evidence so later comparisons do not silently use newly supplied fonts, changed mockups or revised prices.

### 1. Establish observability and safety before performance tuning

Shadow-log five upcoming jobs using R5; do not change their work order. Record every correction, including whether it fixes a defect or implements a new user preference. Replay R3 safety cases in disposable fixtures. Repair the operational contract on a feature branch only after approval.

Do not calculate job duration as `updated_at - created_at`: the snapshots are incomplete and timestamps include waiting/re-entry. Do not count duplicated session summaries as separate corrections.

### 2. Test producer/intake alignment first

Pilot R1 on frozen AC Electrical, Joshi and McColm Cardew packs. Their geometry/fonts/provenance differ and AC includes a known manifest/reference conflict. Compare current instructions versus candidate intake routing with identical tools/models, budgets and approved exception lists.

Change only intake/source-precedence guidance in this experiment. Do not simultaneously introduce new models, components or concurrency. A conflict surfaced early is a successful intake result, not a failed website; resolve it once for both build arms and include that human time.

### 3. Test independent QA and scaffold improvements separately

Use R2's seeded regressions to confirm detection before spending on website comparisons. QA reviewer receives reference, rendered output and exceptions, but not the arm identity or builder's self-assessment.

Then test R4 with identical packs on disposable scaffold copies. Preserve visual freedom; adoption requires evidence that shared safety behaviours save rework without changing approved appearance.

### 4. Expand and measure one versus two concurrent jobs

Add ABCD, PSC and Sweeney's to make six frozen fixtures spanning trades, professional services and fitness, including multi-page input, dialog-heavy interactions and varied image packs. Run the same batch serially and with two concurrent isolated jobs, with balanced execution order and identical tools.

This is a small directional pilot, not statistical proof. If variance matters, repeat each six-pack arm twice: 24 job runs total for that comparison. Confirm cost/time budget before launching repetitions. Use new prospective holdout jobs before changing defaults broadly.

### 5. Only then compare models/context and workspace automation

Run R8 model and context experiments independently, not as a combined change. Use recorded billed costs where available; fixed legacy pricing constants are estimates, not invoices. Test workspace generation with frozen human-approved briefs and stubbed external actions. Keep full CMS/launch capability and its gates intact.

### Acceptance And Measurement Rules

- **Verified Stage 1 output:** build/typecheck success, expected exported routes/assets, functional/mobile/keyboard checks, independent visual acceptance and evidence linked to the tested revision. Pending internal pages must be honestly identified. Human/client approval remains a separate counter.
- **Material visual defect:** wrong section/component structure, substantial proportions/alignment/font/crop mismatch against the approved reference, missing required copy/asset, or unusable responsive behaviour. Approved accessibility/safety departures are not defects. Record observed/expected/evidence per issue; do not use an uncalibrated pixel-similarity score as the gate.
- **Functional blocker:** broken advertised destination, failed image, unusable navigation/modal/CTA, overflow hiding content, fabricated working submission/approval, wrong-client payment destination or unintended external side effect. Stage 1 draft/disabled integration states must be tested as the intended states.
- **Primary outcome:** unique accepted jobs per predeclared working day, with exact milestone and available staffing stated. Count each job once, after acceptance; WIP does not count.
- **Supporting outcomes:** first independent QA pass rate, active human minutes, machine service/wait time, elapsed lead time, correction minutes/iterations by cause, total billed cost per accepted job, human-review returns and accepted workspace packages/launches separately.
- **Pilot adoption:** no safety violations, no newly missed material visual/functional defects, no decline in paired acceptance, and lower median total time per accepted job. Report each fixture result and variability, not just the median. Small-pilot results remain hypotheses until holdout evidence supports them.
- **Day boundary:** select the working window/timezone before the run, include carry-over/WIP and input readiness, and do not cherry-pick the fastest five.

### Capacity Interpretation

For an illustrative eight-hour day and one person's active labour, five accepted outputs require an average of at most 96 active minutes per accepted output across intake, supervision, corrections, human assessment and relevant workspace work. This is arithmetic, not a measured current rate. Upstream ChatGPT work must also be counted for end-to-end manufacturing capacity.

Parallel model work can reduce elapsed batch time without reducing human labour. Daily capacity is constrained by the slowest required resource: complete input packs, agent/machine service, human review, commercial decisions, or downstream delivery. Measure queue lengths and accepted output at each gate before increasing WIP.

## Decisions Needed Before Implementation

1. Confirm the target milestone and working-day/staffing definition.
2. Approve a candidate branch for intake/state/skill-reference alignment; keep asset generation dormant by default, not deleted.
3. Approve a limited fixture/test budget before model experiments; no production writes, publishing or deployments during tests.
4. Review a specific cleanup manifest separately before any relocation/deletion.

The immediate recommendation is R5 measurement plus R3 safety checks, followed by R1 input/skill alignment and R2 independent QA. Preserve the full manufacturing lifecycle and integrate the workspace handoff; only then expand concurrency or optimise models.
