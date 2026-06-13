# Sorted Operating Model

**Status:** Active doctrine  
**Parent:** ADX Engine — Digital Manufacturing  
**Dispatch unit:** Website manufacturing line

---

## What Sorted Is

Sorted is a website manufacturing line operating inside the ADX Engine digital manufacturing system.

It produces world-class websites. Repeatably. At speed. Without negotiation.

Not a web agency. Not a freelance service. A manufacturing line with a defined process, consistent output quality, and a client experience that converts at a rate traditional agencies cannot match.

---

## The Reversed Product Cycle

Traditional web agencies sell first, build second. The client buys a promise.

Sorted inverts this:

**Build → Show → Quote → Charge → Deliver**

The client sees the finished product before they are asked to spend a penny. They nod at every stage. They never buy a promise.

This is why conversion is high. Nobody is being asked to imagine. They are being asked to approve what they can already see.

---

## The Four Nods

Every Sorted engagement moves through four approval gates:

```
Mockup  →  Nod 1
Build   →  Nod 2
Quote   →  Nod 3
Payment →  Nod 4 → Deliver
```

**Nod 1 — Mockup approval**  
The client sees a high-fidelity mockup of their site. Design, layout, imagery, copy. They approve the vision before a line of code is written.

**Nod 2 — Build approval**  
The full working site is presented. Same design they approved. Live, navigable, real. They approve the execution. **SortedUpdates is applied after this nod — not before.** The client approves the static site first. CMS wiring begins once they have confirmed the build.

**Nod 3 — Quote approval**  
The price is presented now. Not before. The client is nodding to the actual product they have already seen and touched — not a proposal with mood boards and projections.

**Nod 4 — Payment and delivery**  
Payment unlocks delivery. The site goes live with SortedUpdates active. The client receives CMS access, the tutorial walkthrough, and the handoff message.

---

## Why This Converts

At every stage the client is approving something real, not committing to something hypothetical.

The psychological dynamic:
- Nod 1: "I love this design" — emotional commitment formed
- Nod 2: "This is exactly what I saw" — trust reinforced, no surprises
- Nod 3: "How do I not buy this, I've already approved it twice" — objection surface minimised
- Nod 4: payment is a formality

The pipeline conversion rate between stages is structurally high because no stage asks for a leap of faith.

---

## SortedUpdates — The CMS Layer

Every site delivered by Sorted ships with SortedUpdates.

SortedUpdates is applied **after Nod 2** — after the client has approved the build. It is a delivery-stage step, not a build-stage step.

The sequence:
1. Build the site (static, no CMS)
2. Present to client → Nod 2
3. Apply SortedUpdates (workflow: `.devin/workflows/add-decap-cms.md`)
4. Present quote → Nod 3
5. Payment → Nod 4 → hand off with CMS active

This matters because the client approves a clean, fast, design-led site — not a site with a CMS toolbar confusing the preview. The CMS is a delivery mechanism. It is not part of the product they are evaluating.

SortedUpdates is a Decap CMS installation configured to make every piece of visible content on the site editable by the client, without touching the design.

The client owns:
- All text, headings, copy, labels
- All images, backgrounds, thumbnails
- All video URLs and media assets
- All FAQs, service descriptions, value pillars

The client does not own:
- Layout and composition
- Typography scale and spacing
- Design system tokens
- Component structure

This is intentional. The design is the product they bought. The content is their material to fill it with.

The factory reset is always available — the fallback defaults in every loader match the original approved design content exactly. If a client breaks their own content, the design remains intact.

---

## The Complexity Escalation Model

SortedUpdates handles all swappable content. But some clients will want more.

When a client wants structural changes — new sections, new page types, new component behaviour — they email Sorted.

Sorted scopes and builds the addition. Once complete, it is added to SortedUpdates as a new editable area. The client's CMS grows with their site.

This creates a compounding relationship:
- Every structural addition is a chargeable engagement
- Every addition becomes a new independently editable area
- The client's autonomy increases over time
- Sorted's revenue per client compounds over time

---

## The Manufacturing Standard

Every Sorted site is built to the same standard:

- All content editable via CMS — no exceptions
- Playwright smoke tests confirm every page renders from JSON
- CMS preview templates registered for all collections
- Build passes clean with zero TypeScript errors
- Factory reset state preserved in loader fallbacks
- Decap CMS local proxy configured for client handoff

This is quality control by system, not by individual. The standard is enforced by the manufacturing process, not by remembering.

---

## The China-Phenomena Applied to Sorted

Sorted applies micro-scoping to website manufacturing:

**Design operator** — scoped to producing a single-page mockup given brand inputs  
**Build operator** — scoped to converting a mockup section to a Next.js component  
**Content operator** — scoped to populating JSON content files from a brief  
**CMS operator** — scoped to generating config.yml from a component field list  
**Test operator** — scoped to generating Playwright smoke tests from a page route list

Each operator produces one deterministic output. Chained together, they assemble a complete, tested, CMS-enabled website.

As each operator matures, the model requirement shrinks. A well-scoped content population task does not need a frontier model. It needs a tight prompt and a cheap model. This is how the manufacturing cost falls while the output quality holds.

---

## Dual Execution Modes

The manufacturing chain has two runtime modes. The doctrine, state shape, and output quality are identical in both. Only the runtime differs.

### Mode 1 — Orchestration Agent (default)

An orchestration agent runs the full chain in a single session. It loads the doctrine, executes each step using its native capabilities, and calls external APIs (vision models, image generation) only where needed. The state materialises as files on disk between steps.

```
mockup.jpg → [vision API] → deconstruction.json
           → [image gen API] → assets/ + manifest.json
           → [code, written directly] → site repo → npm run build
```

**When to use:** Any single-client build. Default mode. Fast, low overhead, human in the loop.

### Mode 2 — Operator Pipeline (scale)

Each chain step runs as a discrete stateless CLI process. Steps consume a defined input artifact and produce a defined output artifact. Orchestrated by a job queue.

```
job: mockup.jpg → mockup-deconstructor CLI → deconstruction.json
job: deconstruction.json → asset-generator CLI → manifest.json + assets/
job: deconstruction.json + manifest.json + assets/ → frontend-builder CLI → site repo
```

**When to use:** Multiple concurrent builds. Automated pipelines. No agent in the loop.

### Skills and Operators — the same doctrine, two runtimes

**Skills** (`operators/skills/`) are the canonical specification for each chain step, expressed as markdown doctrine loaded by the orchestration agent. The agent reads the skill and executes it directly.

**Operators** (`operators/<name>/implementation/`) are the same specification compiled into a stateless CLI process. The operator reads from disk, executes the step, writes to disk.

The skill is always written first. It is the specification. The operator implements the skill. The doctrine — `operator-chain.md`, the design standards, the quality gates — is the same in both.

Full state contract and artifact schemas: `doctrine/operator-chain.md`

---

## The Client Relationship

Sorted does not have a service relationship with clients. It has a product relationship.

The client buys a product they have already approved. They receive independence over their content through SortedUpdates. They engage Sorted for structural additions — not for day-to-day content changes.

This preserves:
- The design integrity of the product
- The client's operational independence
- Sorted's margin (no free content change requests)
- The quality of the site over time

The client is never helpless. They are never butchering. They are in control of their content layer and Sorted controls the design layer.
