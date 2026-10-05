# Sorted Website Manufacturing Line — Build Brief

## Objective

Build the first automated production pipeline for the **Sorted website factory**.

The pipeline begins **after mockup creation**.

For the current version, Renaldo + ChatGPT remain responsible for producing and approving:

1. **Website Mockup Image** — the visual source of truth for the website.
2. **Image Reconstruction Manifest** — structured instructions describing the imagery contained within that mockup and how those images should be recreated.

These two artifacts are the **input contract for the automated factory**.

Do **not** attempt to automate mockup generation in this version.

The architecture should, however, preserve this boundary so that an automated Mockup Generation Operator can later replace the human/ChatGPT step without requiring the downstream factory to be redesigned.

---

# 1. Core Operating Principle

Sorted follows a manufacturing model rather than a monolithic website-building agent.

Do not create one large agent that:

> receives mockup → builds website → adds CMS → deploys.

Instead, decompose production into **small, bounded operators with explicit contracts**.

Each operator should ideally have:

* defined trigger
* defined inputs
* narrow responsibility
* defined tools/models
* deterministic output artifact where possible
* output schema
* validation criteria
* known failure states
* retry/escalation behaviour
* state transition

Operators should communicate primarily through **durable artifacts and shared build state**, not conversational memory.

The orchestration system should always be capable of determining:

> What state is this build currently in, what artifact exists, what operator should execute next, and whether its output passed validation?

---

# 2. Factory Boundary

The current system begins here:

```text
HUMAN + CHATGPT
        │
        ├── approved-mockup.png
        │
        └── image-manifest.json
                    │
                    ▼
          AUTOMATED FACTORY STARTS
```

The mockup and manifest serve different purposes.

### Mockup

The mockup is the **visual source of truth**.

It defines things such as:

* layout
* hierarchy
* typography
* spacing
* positioning
* colours
* component relationships
* image placement
* overall visual composition

### Image Manifest

The manifest is specifically an **image reconstruction specification**.

It provides information useful for recreating imagery, including:

* subject
* scene
* environment
* composition
* camera
* lighting
* styling
* action
* aspect ratio
* exclusions
* reconstruction intent

Do not unnecessarily attempt to encode the entire website into the image manifest.

The two artifacts are complementary:

> **Mockup = what the website must look like.**

> **Manifest = what its imagery means and how that imagery should be reconstructed.**

---

# 3. Build Orchestrator

Create a lightweight **Build Orchestrator** responsible for controlling the production line.

The orchestrator should contain as little creative intelligence as possible.

Its responsibility is:

```text
READ BUILD STATE
      ↓
DETERMINE NEXT VALID OPERATION
      ↓
INVOKE OPERATOR
      ↓
VALIDATE OUTPUT
      ↓
STORE ARTIFACT
      ↓
UPDATE STATE
      ↓
CONTINUE
```

Operators should not need to know the complete production process.

The orchestrator knows the sequence.

Individual operators know their specific job.

A failed operator should not corrupt downstream production.

Failed validation should stop, retry or escalate the relevant stage.

---

# 4. Build State

Establish a durable build-state representation.

Exact implementation is open to engineering judgement, but conceptually each website should have something equivalent to:

```text
build_id
client_id

input_status

mockup_reference
manifest_reference

region_status
asset_status
asset_registry_status

frontend_status
visual_qa_status
pixel_correction_status

ui_system_status
design_system_status
core_build_qa_status

internal_pages_status

cms_status
cms_qa_status

analytics_status
launch_qa_status
deployment_status

current_operator
last_completed_operator
failure_state
retry_count
created_at
updated_at
```

Prefer explicit enums/states rather than ambiguous free-text status descriptions.

The factory should be restartable from state after interruption.

---

# 5. Operator Chain

## Operator 0 — Build Initialisation Operator

**Job:** Turn the supplied mockup + image manifest into a valid factory job.

Responsibilities:

* receive the two input artifacts
* validate their presence and basic integrity
* create build ID/project state
* establish working directories/artifact locations
* register source artifacts
* initialise production state
* trigger the next valid stage

This operator marks the transition from:

> **creative artifact → manufacturing job**

---

## Operator 1 — Mockup Region Operator

**Job:** Decompose the mockup into useful reconstruction regions.

Responsibilities:

* identify logical page regions
* record their coordinates/dimensions
* create cropped region references where useful
* associate image regions with manifest asset IDs
* prepare deterministic references for downstream operators

Examples:

```text
header
hero
hero_image
trust_strip
services
service_image_01
story
story_image
cta
footer
```

Do not regenerate anything.

This operator performs decomposition only.

---

## Operator 2 — Asset Reconstruction Operator

**Job:** Recreate the clean production imagery required by the website.

Inputs include:

* original mockup
* relevant mockup crop
* corresponding image-manifest entry
* required dimensions/aspect ratio

Responsibilities:

* invoke appropriate image-generation/reconstruction model
* reconstruct image without website UI contamination
* remove embedded text/buttons/overlays unless explicitly part of the asset
* preserve scene intent
* preserve composition
* preserve camera characteristics
* preserve lighting/style
* output at appropriate production quality

One manifest asset should produce one identifiable production artifact.

---

## Operator 3 — Asset Registry Operator

**Job:** Turn generated images into deterministic website assets.

Responsibilities:

* validate generated files
* apply naming convention
* optimise images
* establish correct formats
* store them in project asset locations
* map manifest IDs → production paths
* create/update asset registry

Example:

```text
hero_primary
→ /public/images/home/hero-primary.webp

story_restaurant
→ /public/images/home/story-restaurant.webp
```

Frontend operators should consume the registry rather than guessing filenames.

---

# 6. Core Website Reconstruction

## Operator 4 — Frontend Reconstruction Operator

**Job:** Recreate the approved mockup as functioning frontend code.

Primary source of truth:

> **approved mockup image**

Use registered reconstructed assets where appropriate.

Reproduce:

* structure
* typography
* spacing
* proportions
* colours
* borders
* radius
* imagery
* hierarchy
* responsive behaviour
* relevant interactions

Follow existing Sorted repository doctrine and technical conventions.

The objective at this stage is **visual reconstruction**, not creative reinterpretation.

Do not casually redesign the mockup.

---

## Operator 5 — Visual QA Operator

**Job:** Independently compare the rendered website against the approved mockup.

This operator diagnoses.

It does **not** fix.

Compare areas such as:

* overall geometry
* section dimensions
* spacing
* alignment
* typography
* line wrapping
* image crop
* colours
* component dimensions
* visual hierarchy
* positioning

Produce a structured discrepancy artifact.

Where practical, discrepancies should include:

```text
location
expected
observed
severity
confidence
recommended correction
```

---

## Operator 6 — Pixel Correction Operator

**Job:** Correct discrepancies identified by Visual QA.

Consume the QA artifact rather than independently deciding what needs improvement.

Iteratively correct:

* spacing
* typography
* dimensions
* alignment
* image placement
* positioning
* responsive behaviour
* visual inconsistencies

Then return the build to Visual QA.

Expected loop:

```text
FRONTEND BUILD
      ↓
VISUAL QA
      ↓
DISCREPANCIES?
   ↙       ↘
 YES       NO
  ↓         ↓
CORRECT    PASS
  ↓
VISUAL QA
  ↺
```

Establish a configurable pass threshold rather than assuming subjective perfection.

---

# 7. Systemisation

## Operator 7 — UI Systemisation Operator

**Job:** Convert the visually correct implementation into robust production architecture.

The visual appearance should already be approved before substantial systemisation.

Responsibilities may include:

* replace fragile implementation
* introduce approved reusable components
* remove unnecessary duplication
* normalise component patterns
* apply Sorted UI/library conventions
* improve maintainability
* preserve visual fidelity

Systemisation must not accidentally redesign the approved page.

---

## Operator 8 — Design System Extraction Operator

**Job:** Convert the approved homepage into a reusable client-specific design grammar.

This is a strategically important operator.

Extract/document elements such as:

* colour tokens
* typography
* type scale
* spacing
* containers
* grid behaviour
* button families
* cards
* image treatments
* borders
* radius
* shadows
* navigation patterns
* section patterns
* CTA treatments
* interaction behaviour
* responsive rules

The resulting artifact becomes the **manufacturing specification for subsequent pages**.

Conceptually:

```text
PAGE 1
  ↓
VISUALLY APPROVED
  ↓
SYSTEMISED
  ↓
DESIGN GRAMMAR EXTRACTED
  ↓
PAGES 2–N CAN NOW INHERIT THE SYSTEM
```

The design-system artifact should be machine-readable where practical and human-readable where useful.

---

## Operator 9 — Core Build QA Operator

**Job:** Verify the systemised core build.

Confirm:

* visual fidelity remains intact
* responsive behaviour works
* component architecture works
* assets resolve correctly
* interactions function
* technical build succeeds
* no systemisation regressions were introduced

Only after this gate passes should the core build be considered signed off.

---

# 8. Internal Pages

## Operator 10 — Internal Page Builder Operator

**Job:** Manufacture the remaining website pages from their supplied mockups using the established design system.

Reuse the same principles:

```text
MOCKUP
↓
REGIONS
↓
ASSETS
↓
BUILD
↓
VISUAL QA
↓
CORRECTION
↓
PASS
```

However, internal pages should inherit the established client design system rather than independently inventing visual rules.

The objective is:

> **visual diversity with structural consistency.**

Where appropriate, reuse the existing operators rather than duplicating their logic specifically for internal pages.

---

# 9. Ownership Infrastructure

## Operator 11 — CMS Integration Operator

**Job:** Apply SortedUpdates / current Decap CMS infrastructure to the approved website.

This occurs **after the underlying website has passed its core build gate**.

Responsibilities:

* identify customer-editable content
* map content to CMS fields
* preserve design constraints
* wire image fields correctly
* establish approved baseline/reset state
* configure required authentication/infrastructure
* maintain compatibility with current Sorted CMS doctrine

The CMS is ownership infrastructure.

It must not become a reason to destabilise the approved website.

---

## Operator 12 — CMS QA Operator

**Job:** Test the actual customer editing workflows.

Use Playwright/browser automation where appropriate.

Test:

* CMS access
* authentication
* text editing
* image replacement
* saving
* publishing
* persistence
* generated build
* frontend rendering
* reset behaviour
* required customer workflows

Produce a structured pass/fail report.

---

# 10. Measurement

## Operator 13 — Analytics Operator

**Job:** Apply the required measurement infrastructure.

Responsibilities may include:

* analytics configuration
* required tags
* event instrumentation
* CTA tracking
* form tracking
* attribution parameters
* conversion events
* validation of event firing

Follow current Sorted analytics conventions rather than inventing a new analytics architecture inside this operator.

---

# 11. Production Release

## Operator 14 — Launch QA Operator

**Job:** Perform final production-readiness validation.

Check as appropriate:

* routes
* navigation
* links
* forms
* responsive behaviour
* images
* metadata
* titles/descriptions
* favicons
* analytics
* CMS
* performance
* obvious accessibility issues
* build errors
* console errors
* production configuration
* deployment readiness

This is the final quality gate.

A failure prevents deployment.

---

## Operator 15 — Deployment Operator

**Job:** Ship the validated website.

Responsibilities:

* prepare production release
* follow Sorted deployment discipline
* deploy
* verify production availability
* record commit/release
* record deployment URL/state
* mark manufacturing job complete

Do not bypass existing branch/review/deployment doctrine.

---

# 12. Important Architectural Rule: QA ≠ Correction

Keep diagnosis and execution separated.

For example:

```text
Visual QA Operator
        ↓
"This heading is 18px too low."

Pixel Correction Operator
        ↓
changes implementation

Visual QA Operator
        ↓
confirms correction
```

Do not allow the builder to simply declare its own work acceptable.

Quality gates should independently determine whether downstream execution can continue.

---

# 13. Artifact-Driven Architecture

Every meaningful operator should produce an artifact that can survive the operator itself.

Examples:

```text
input/
    approved-mockup.png
    image-manifest.json

artifacts/
    regions.json
    regions/

    assets/
    asset-registry.json

    visual-qa.json
    design-system.json
    core-build-qa.json
    cms-qa.json
    launch-qa.json

state/
    build-state.json
```

This structure is illustrative rather than mandatory.

Inspect the existing repository and use existing conventions where superior ones already exist.

Do not create parallel architecture unnecessarily.

---

# 14. Failure Philosophy

When an operator fails:

**Do not blindly continue.**

Prefer:

```text
OPERATOR
   ↓
OUTPUT
   ↓
VALIDATOR
 ↙       ↘
PASS     FAIL
 ↓        ↓
NEXT    RETRY / ESCALATE
```

Record enough information to understand:

* which operator failed
* what input it received
* what it produced
* why validation failed
* retry count
* model/tool used
* relevant error
* next permitted action

A failed website should be resumable rather than requiring the entire production chain to restart.

---

# 15. Build Against Existing Sorted Infrastructure

Before implementation:

1. Read `AGENTS.md`.
2. Inspect existing doctrine.
3. Inspect current operators and skills.
4. Inspect current client/template architecture.
5. Inspect existing image reconstruction work.
6. Inspect existing CMS workflows.
7. Inspect existing QA/deployment workflows.

The repository already contains implementation for parts of this chain.

Do **not** rebuild working capabilities merely to satisfy the terminology in this brief.

Instead:

> **reuse → formalise → adapt → connect → build missing pieces**

Existing Sorted doctrine already identifies the broader production chain as approved proof → mockup deconstruction → asset preparation → frontend build → visual QA → ownership infrastructure → launch QA → delivery. This project should make that production architecture substantially more explicit and executable rather than creating a competing system.

---

# 16. Implementation Strategy

Do not attempt to make all 16 operators sophisticated autonomous agents immediately.

Prefer the simplest reliable implementation for each boundary.

An operator may initially be:

* deterministic TypeScript
* Python/script
* CLI command
* existing workflow
* model call
* Devin task
* Playwright routine
* validator
* wrapper around an existing skill

The **contract matters more than the intelligence mechanism**.

If deterministic code can perform the job reliably, prefer it over an LLM.

Use model intelligence where interpretation genuinely requires it.

---

# 17. First Engineering Pass

For the first pass, prioritise getting the **factory skeleton operational**.

Build:

```text
INPUT CONTRACT
      ↓
BUILD INITIALISATION
      ↓
STATE
      ↓
REGION DECOMPOSITION
      ↓
ASSET RECONSTRUCTION
      ↓
ASSET REGISTRY
      ↓
FRONTEND BUILD
      ↓
VISUAL QA
      ↓
CORRECTION LOOP
      ↓
SYSTEMISATION
      ↓
DESIGN SYSTEM
      ↓
CORE QA
      ↓
INTERNAL PAGES
      ↓
CMS
      ↓
CMS QA
      ↓
ANALYTICS
      ↓
LAUNCH QA
      ↓
DEPLOY
```

It is acceptable for early operators to invoke existing workflows manually or semi-automatically internally.

The first milestone is **a coherent, observable production line**, not maximum autonomy.

---

# 18. Future Boundary

Do not build this now, but preserve the interface required for:

```text
BUSINESS CONTEXT
       ↓
MOCKUP GENERATION OPERATOR
       ↓
approved-mockup.png
image-manifest.json
       ↓
EXISTING FACTORY
```

When mockup generation is eventually automated, it should simply become another producer of the existing factory input contract.

The downstream manufacturing line should not care whether its mockup came from:

* Renaldo + ChatGPT
* another image model
* an automated design system
* a future Sorted Mockup Operator

It should only care:

> **Are the required input artifacts valid?**

---

# Definition of Done

This project is complete when a developer can place a valid:

```text
approved-mockup.png
image-manifest.json
```

into the defined intake pathway and initiate a **stateful, observable, restartable Sorted website manufacturing job** whose operators progressively produce and validate the artifacts necessary to reach deployment.

Do not optimise prematurely for complete autonomy.

Optimise first for:

**clear boundaries → reliable artifacts → explicit state → independent validation → resumability → replaceable operators.**

The objective is not to build an impressive website agent.

The objective is to establish the infrastructure from which the **Sorted website factory can progressively become autonomous.**
