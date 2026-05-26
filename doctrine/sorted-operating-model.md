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
The full working site is presented. Same design they approved. Live, navigable, real. They approve the execution.

**Nod 3 — Quote approval**  
The price is presented now. Not before. The client is nodding to the actual product they have already seen and touched — not a proposal with mood boards and projections.

**Nod 4 — Payment and delivery**  
Payment unlocks delivery. The site goes live. The client has the keys.

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

## The Client Relationship

Sorted does not have a service relationship with clients. It has a product relationship.

The client buys a product they have already approved. They receive independence over their content through SortedUpdates. They engage Sorted for structural additions — not for day-to-day content changes.

This preserves:
- The design integrity of the product
- The client's operational independence
- Sorted's margin (no free content change requests)
- The quality of the site over time

The client is never helpless. They are never butchering. They are in control of their content layer and Sorted controls the design layer.
