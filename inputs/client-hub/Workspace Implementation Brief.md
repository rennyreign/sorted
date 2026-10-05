# Sorted Workspace — Implementation Brief

## Read This First

This brief explains the product and commercial intent behind the accompanying Design-IR files:

1. `01-prospect-review.design-ir.json`
2. `02-working-homepage.design-ir.json`
3. `03-next-steps.design-ir.json`
4. `04-live-client-hub.design-ir.json`

Treat those manifests as the screen-level source of truth and this document as the system-level source of truth.

If an implementation detail conflicts with the product intent described here, pause and resolve the conflict rather than silently changing the commercial model.

---

## 1. Product Summary

Sorted manufactures a high-quality working homepage for a carefully selected business before that business agrees to buy anything.

The business is not asked to imagine what Sorted could produce. It receives tangible proof first.

> We don't sell. We show.

The Sorted Workspace is the persistent digital environment through which that proof is delivered, evaluated, purchased and eventually managed.

It begins as a private prospect experience:

```text
Your Review
→ Your New Site
→ Next Steps
```

After commercial commitment, the same workspace becomes a delivery environment and then the customer's permanent website hub.

```text
Project
→ Website
→ Details
→ Documents
→ Help
```

After launch, it becomes:

```text
Overview
→ Website
→ Updates
→ Tracking
→ Documents
→ Help
```

The prospect should feel as though they have entered their own Sorted workspace before becoming a customer. Paying the deposit should not send them into an unrelated system; it should unlock the next state of the same environment.

---

## 2. The Commercial Model for This Build

The current offer represented by this workspace is:

- Sorted creates a **working homepage** before purchase.
- The prospect explores that homepage without being required to attend a sales call.
- Completing the full website costs **£3,000 fixed**.
- The client pays a **£1,500 deposit** to begin.
- The remaining **£1,500 is due on launch**.
- The price is visible before a call and throughout the decision experience.
- A call is optional support, not a mandatory sales gate.
- There is no automated counter-offer or automatic discount mechanism.

Do not reintroduce older pricing, “from £495,” low-cost starter positioning, or historical commitment-fee mechanics into this implementation.

Do not say that a full website has already been completed during prospecting. The pre-purchase artifact is a working homepage.

---

## 3. Strategic Purpose

The workspace must achieve four things:

### 3.1 Make the proof easy to consume

The working homepage is the centre of gravity. Diagnosis supports the artifact; it must not delay or overshadow it.

### 3.2 Remove obligation from the buying process

The owner should be able to:

- inspect the work privately
- understand why it was created
- see the fixed price
- ask a question
- book a call if desired
- pay the deposit without a call

### 3.3 Preserve continuity after purchase

The workspace should mature rather than disappear. Its routes, identity and business context should persist across the customer lifecycle.

### 3.4 Become durable relationship infrastructure

After launch, the workspace is the customer's permanent route to:

- the live website
- Sorted Updates / CMS
- Sorted Tracking
- documents and invoices
- support
- future useful interventions

The website is the first intervention, not necessarily the boundary of the relationship.

---

## 4. Experience Model

Think of the prospect experience as:

```text
INVITATION → SHOWROOM → CHECKOUT
```

### Your Review — Invitation and context

Purpose:

- confirm that the page was prepared specifically for this business
- explain the gap between business substance and digital signal
- identify three or four concrete opportunities
- reveal the working homepage quickly
- establish the £3,000 completion price

The language must be respectful. Sorted is not telling the business it is poor; it is showing that the business is stronger than its current website communicates.

### Your New Site — Showroom

Purpose:

- let the owner experience the real homepage
- allow desktop and mobile inspection
- keep questions and the completion action available
- avoid turning the website into a small static image

The homepage must live in an isolated preview environment so its styles, scripts and routes cannot conflict with the Sorted workspace shell.

### Next Steps — Checkout

Purpose:

- formalise the fixed offer
- explain what completion includes
- explain the short delivery sequence
- accept the £1,500 deposit
- offer questions, bank transfer and calls as secondary paths

This is not a conventional long proposal. The prospect has already seen the direction. Keep the page concise and decisive.

### Live Client Hub — Ownership

Purpose:

- give the client a permanent home for their website
- reduce dependence on finding old emails and links
- expose the correct tools without technical clutter
- make help easy to obtain

The hub is an operational product surface, not another marketing page.

---

## 5. Shared Workspace Shell

All stages must use one consistent shell.

### Persistent identity

```text
Sorted.  FOR {BUSINESS NAME}
```

This communicates that Sorted operates the environment on behalf of a specific business.

### Prospect navigation

```text
Your Review | Your New Site | Next Steps
```

### Project navigation

```text
Project | Website | Details | Documents | Help
```

### Live navigation

```text
Overview | Website | Updates | Tracking | Documents | Help
```

The navigation should be driven by workspace lifecycle state, not hard-coded into unrelated page templates.

On mobile, preserve the brand row and render navigation as a clear horizontally scrollable tab row. Do not hide essential destinations inside an ambiguous hamburger menu unless the final number of routes makes that unavoidable.

---

## 6. Lifecycle State Model

Use explicit state rather than inferring lifecycle from which files happen to exist.

Recommended high-level states:

```text
PROSPECT_REVIEW_READY
PROSPECT_PREVIEW_VIEWED
PROSPECT_DECIDING
DEPOSIT_PENDING
DEPOSIT_PAID
PROJECT_IN_PROGRESS
CLIENT_REVIEW_REQUIRED
APPROVED_FOR_LAUNCH
LIVE
ARCHIVED
```

State should control:

- available routes
- navigation labels
- primary action
- authentication requirement
- visible documents
- project messaging
- event tracking

Example transition:

```text
PROSPECT_REVIEW_READY
  → homepage opened
PROSPECT_PREVIEW_VIEWED
  → next steps opened
PROSPECT_DECIDING
  → Stripe payment succeeds
DEPOSIT_PAID
  → project workspace unlocked
PROJECT_IN_PROGRESS
```

Do not mark a deposit paid from a client-side redirect alone. Confirm payment server-side using the payment provider's verified event mechanism.

---

## 7. Suggested Route Architecture

Use one workspace namespace:

```text
/workspace/[workspaceSlug]/review
/workspace/[workspaceSlug]/website
/workspace/[workspaceSlug]/next-steps
/workspace/[workspaceSlug]/project
/workspace/[workspaceSlug]/details
/workspace/[workspaceSlug]/updates
/workspace/[workspaceSlug]/tracking
/workspace/[workspaceSlug]/documents
/workspace/[workspaceSlug]/help
```

The specific framework route structure may differ, but the conceptual separation should remain.

Legacy proposal and client routes may redirect into the appropriate workspace route once migration is safe.

Do not duplicate prospect, project and live business data into separate page-specific records. They are views over one workspace record.

---

## 8. Suggested Workspace Data Model

The exact persistence layer is implementation-specific, but the interface should approximately support:

```ts
type Workspace = {
  id: string
  slug: string
  lifecycleState: WorkspaceState

  business: {
    name: string
    domain?: string
    ownerName?: string
    logoUrl?: string
  }

  review: {
    headline: string
    summary: string
    observations: Array<{
      title: string
      explanation: string
    }>
  }

  website: {
    previewUrl: string
    previewImageUrl?: string
    liveUrl?: string
    cmsUrl?: string
    trackingUrl?: string
    status: "preview" | "building" | "review" | "live"
  }

  offer: {
    currency: "GBP"
    total: 3000
    deposit: 1500
    balance: 1500
    stripePaymentUrl?: string
    bankTransferEnabled: boolean
  }

  links: {
    bookingUrl?: string
    questionUrl?: string
    documentsUrl?: string
    googleReviewUrl?: string
  }

  access: {
    prospectToken?: string
    clientUserIds?: string[]
  }
}
```

Use validation at every state transition. Do not allow malformed workspace data to cascade across prospect, project and live experiences.

---

## 9. Access and Security

### Prospect state

The prospect workspace may use an unlisted, signed URL or expiring token because it contains no sensitive analytics, CMS access or private documents.

Avoid guessable public slugs as the only protection.

### Client state

Once the workspace exposes any of the following, require authenticated access or a secure passwordless magic link:

- invoices or agreements
- analytics
- CMS access
- customer data
- private project details

Never expose raw credentials inside the workspace.

External tools should use secure links and appropriate provider authentication.

---

## 10. Required Integrations

### Working homepage

- Render the real deployed homepage, not a screenshot.
- Use an isolated origin, sandboxed frame or other robust preview boundary.
- Support desktop and mobile viewport presentation.
- Provide a graceful loading and unavailable state.

### Stripe

- Primary payment method for the £1,500 deposit.
- Use hosted Checkout or a secure provider-supported payment component.
- Confirm success server-side.
- Prevent duplicate payment attempts while processing.
- On confirmed payment, transition the workspace into the project state.

### Bank transfer

- Secondary option.
- Reveal instructions only after the user selects bank transfer.
- Generate or display a traceable payment reference.
- Do not mark payment complete until manually or programmatically verified.

### Booking

- Use the configured booking link, currently expected to be Cal.com-compatible.
- Calls remain optional.

### Questions

Phase 1 can use a direct message action or simple contextual question form.

Do not block the launch of outreach while building a sophisticated AI assistant. A future assistant may answer questions about price, inclusion, timing, revisions and payment using workspace context, but it is not required for the initial build.

### Sorted Updates and Tracking

- Link into the current CMS and tracking environments.
- Do not rebuild those systems inside the workspace during this phase.
- The workspace is initially the control surface that routes clients correctly.

---

## 11. Brand and Design Direction

Use the existing Sorted design system as the authority.

Key traits:

- `#070707` ink
- `#F7F7F3` paper
- `#FFFFFF` cards
- `#DFFF00` acid
- `#F7F2E8` warm board
- `#E8E5DD` lines
- bold, tightly set grotesk headlines
- small uppercase operational labels
- black decision panels
- acid used sparingly for active states, progress and primary actions
- generous whitespace
- rounded black buttons
- thin dividers and restrained cards

Avoid:

- generic SaaS dashboards
- unnecessary sidebars
- excessive status badges
- glassmorphism
- gradients used as decoration
- dense metric cards
- neon overload
- generic AI aesthetics
- startup language

The workspace should feel like a beautifully organised business document that has become interactive.

---

## 12. Copy Rules

### Use

- working homepage
- your new homepage
- complete website
- fixed price
- ask a question
- no sales meeting required
- ready when you are

### Avoid

- full website is ready, before the full website exists
- free mockup
- AI-generated
- cheap or affordable
- prices from
- limited-time urgency
- congratulations-heavy checkout language
- invented performance claims

The tone is calm, useful and commercially confident.

The work should create urgency through relevance, not artificial pressure.

---

## 13. Analytics Events

At minimum, instrument:

```text
workspace_review_viewed
homepage_preview_opened
homepage_preview_viewed
homepage_viewport_changed
next_steps_opened
question_started
call_booking_opened
deposit_started
deposit_paid
bank_transfer_requested
project_workspace_opened
live_site_opened
cms_opened
tracking_opened
documents_opened
support_started
review_opened
```

Attach `workspaceId`, `businessName`, lifecycle state and timestamp where appropriate. Do not put sensitive customer information into analytics payloads.

The commercial funnel should be measurable as:

```text
Review opened
→ Homepage opened
→ Next Steps opened
→ Deposit started
→ Deposit paid
```

---

## 14. Build Priorities

### Phase 1 — Prospect conversion loop

Build first:

1. shared workspace shell
2. workspace configuration/data contract
3. Your Review
4. working homepage preview
5. Next Steps
6. Stripe deposit flow
7. core event tracking

This phase must be usable for live outreach before deeper portal features are added.

### Phase 2 — Project state

Add:

1. payment-confirmed state transition
2. project overview
3. onboarding/details capture
4. review and approval state
5. documents
6. help

### Phase 3 — Permanent live hub

Add:

1. live Overview
2. website link
3. Sorted Updates link
4. Sorted Tracking link
5. authenticated documents
6. support entry points
7. quiet review request

Do not delay Phase 1 by attempting to perfect Phase 3.

---

## 15. Implementation Boundaries

This work is authorised to:

- create the shared workspace shell
- create the routes and lifecycle-driven navigation
- create reusable workspace components
- integrate existing preview, payment, booking, CMS and tracking endpoints
- add validation and analytics required for the workspace
- migrate existing proposal/client-page behaviour where safe

Request approval before:

- materially changing the public Sorted brand architecture
- changing the £3,000 / £1,500 commercial model
- changing root domain or deployment architecture
- installing significant new infrastructure
- replacing the current CMS or tracking systems
- deleting legacy proposal/client routes before redirects and migration are verified
- pushing unfinished work directly to production

Use a feature branch and preview deployment. Merge intentionally after validation.

---

## 16. Quality Gates

Before considering the workspace complete, verify:

### Commercial

- The exact £3,000 price is visible before any call.
- The deposit is £1,500 and the launch balance is £1,500.
- There is no counter-offer or automatic discount path.
- Calls are optional.
- The pre-purchase artifact is consistently described as a homepage.

### Experience

- The prospect reaches the homepage in one click.
- The homepage is live, responsive and scrollable.
- Mobile and desktop views are usable.
- Navigation clearly reflects lifecycle state.
- The workspace remains recognisably the same product after purchase.

### Technical

- Workspace data is schema-validated.
- Preview isolation prevents style and script collision.
- Payment success is verified server-side.
- Sensitive client routes require authentication.
- Loading, empty, expired and failure states exist.
- Events are recorded once without obvious duplication.
- Accessibility and keyboard navigation are tested.
- Responsive behaviour works from 320px upward.

### Brand

- The build follows the provided Design-IR tokens.
- Acid is used selectively.
- No generic dashboard styling has been introduced.
- Copy is plain, confident and free of unnecessary jargon.

---

## 17. Definition of Done for the Initial Handoff

The first meaningful handoff should include:

- a reusable workspace shell
- a seeded example workspace for Imperial Nail Studio or equivalent fixture data
- functional Review, Website and Next Steps routes
- a real preview URL rendered in isolation
- configurable offer and action links
- working Stripe test-mode deposit flow
- lifecycle transition after verified test payment
- responsive layouts matching the manifests
- tracked funnel events
- automated validation/tests appropriate to the repository
- a preview deployment for review
- no direct push of unfinished work to production

---

## Final Product Principle

The workspace is not a collection of proposal pages.

It is the relationship container.

It begins by helping the prospect understand and inspect the proof. It then lets them commit without unnecessary friction. Finally, it becomes the permanent place from which they manage the website and continue the relationship with Sorted.

> Put substance upfront. Make commitment easy. Preserve the relationship after the sale.
