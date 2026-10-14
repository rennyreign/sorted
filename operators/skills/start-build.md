# Skill: start-build

## Stage 1 Internal-Page Links

Before building or resuming a pre-approval client site, read `operators/skills/stage-1-direction-confirmation.md` (from the Sorted repo root). Implement its shared direction-confirmation pages and consistent internal routes during Op 4, before Op 5/5b. This is an intentional review state, not a finished internal page or client approval.


**Type:** Entry point skill — read this first before any website build
**Trigger:** User asks to build a website, start a new site, manufacture a site, run the manufacturing line, or create/update a client acquisition workspace
**Output:** A scaffolded project folder with factory job initialised

---

## What this skill is

This is the **single entry point** for starting a new Sorted website build. If you're asking "how do I begin a new site?" — you're in the right place.

It creates a sibling project folder (not inside sorted), scaffolds the Next.js site from the client-site template, preserves the complete ChatGPT export pack, and initialises the factory job. Canonical phase/evidence instructions live in `operators/skills/factory-operators.md`; do not run a competing three-step generation chain.

Use pnpm for setup, development, verification and handoffs. Follow `operators/skills/factory-operators.md` -> Package Manager And Handoffs before any dependency work; package/network permissions remain separate.

## Build Request Is Local Build Approval

A request to build a new client website authorises the normal local Stage 1 work: scaffold its sibling project, customise the template root layout and components, add advertised routes, optimise supplied assets, and run local checks and a preview. Do not ask for a separate `/approve` for these steps.

Inspect the supplied folder first. ChatGPT supplies the approved mockup, reconstructed images and design-IR/asset manifests. Read them together; local image generation is dormant by default. Ask only for genuinely missing or conflicting inputs. Do not interpret unsupported business facts as verified claims.

Keep the separate safety gates: do not overwrite an existing build, install packages, access the network, modify deployment configuration, deploy to production, or treat a build request as client design approval. Ask for the specific permission when one of these actions is needed. CMS remains a separate step after Nod 2.

## Prerequisites

Before scaffolding a new client website, resolve:

1. **An approved mockup image** (`.png`, `.jpg`, or `.webp`)
2. **The complete export folder** - design-IR, asset manifests and reconstructed image/font originals; referenced required files must exist
3. **A client slug** — lowercase, hyphenated (e.g., `lrt-plumbing`, `chillika`)

Ask for genuinely missing or conflicting build inputs. For workspace-only updates, inspect the existing client configuration and supplied content instead; do not require a new mockup/manifest or scaffold a sibling site.

## How to start a build

### Single command

```bash
/Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/scripts/start-build.sh \
  <client-slug> \
  <export-pack-directory>
```

**Example:**

```bash
/Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/scripts/start-build.sh \
  lrt-plumbing \
  ~/Downloads/lrt-export
```

This will:
1. Create `/Users/renaldoedmondson/Projects/<client-slug>/` (sibling to sorted)
2. Scaffold the Next.js site from `sorted/templates/client-site/`
3. Preserve the whole export pack in `input/`, including all originals and manifests
4. Initialise versioned state and `input-contract.json`; supplied reconstruction does not trigger local model calls
5. Print the next steps

### What gets created

```
/Users/renaldoedmondson/Projects/<client-slug>/
  app/              ← Next.js app directory (from template)
  components/       ← React components (from template)
  public/           ← Static assets (from template)
  client/           ← Client brief + assets (from template)
  scripts/          ← Build scripts (from template)
  input/
    approved-mockup.png    ← Approved reference, with original media type preserved
    design-ir.json        ← Supplied design detail, not a replacement for visual authority
    assets/               ← Supplied originals (their original paths are preserved)
  state/
    build-state.json       ← Factory job state (tracks operator progress)
  artifacts/        ← Input contract, registry, QA and attempt evidence
  package.json
  next.config.mjs
  tsconfig.json
  ...
```

The project folder is its own git repo — not part of sorted. This is intentional for deployment, feature branching, and clean separation.

## After starting: the operator sequence

Once the build is initialised, run operators in sequence. The factory orchestrator tells you what's next:

```bash
node /Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/dist/cli.js resume <build-dir>
```

### Full lifecycle

| # | Operator | Execution | Vision model? |
|---|---|---|---|
| 0 | Build Init | harness | No |
| 1 | Mockup Regions | harness | No |
| 2 | Asset Reconstruction | supplied; local fallback dormant | No local call by default |
| 3 | Asset Registry | standalone | No |
| 4 | Frontend Build | harness | No |
| 5 | Visual QA (automated) | harness | No |
| **5b** | **Independent Vision QA** | **read-only reviewer** | **Yes; use available image capability** |
| 6 | Pixel Correction | harness | No |
| 7 | UI Systemisation | harness | No |
| 8 | Design System | harness | No |
| 9 | Core Build QA | harness | No |
| Gate | Human assessment | explicit decision on current revision | Separate approval |
| Gate | Workspace build | approved commercial/creative brief | As needed |
| 10+ | Internal pages, CMS, etc. | harness | No |

### Independent visual and human gates

After structural QA, a separate vision-capable reviewer diagnoses mockup discrepancies without modifying code. Read `op-05b-human-vision-qa.md`. This gate is not skippable; use the current image-capable tool/model rather than requiring an unnecessary user switch.

Corrections return to fresh structural and vision checks. Human assessment approves the tested revision separately. Workspace manufacture then requires the human-approved offer/pricing/creative brief in `workspace-build.md`. Systemisation, design extraction, internal pages, CMS, analytics, launch QA and deployment remain relevant.

### Resuming a build

If a session is interrupted, any future session can resume:

```bash
node /Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/dist/cli.js resume <build-dir>
```

This reads validated state and reports next work or the specific blocking reason. Legacy jobs need explicit reconciliation, which cannot certify historical work. Keep artifacts/attempts on disk and revalidate after source changes; do not claim every interruption is recoverable without checking evidence.

## Client workspace standard: acquisition hub v2

This is the default prospect workspace for new clients. Use `/workspace?slug=<client-slug>&route=overview` locally and `https://sortmydigital.site/workspace/<client-slug>/overview` publicly. The workspace connects the website, one customer offer, advertising, follow-up and reporting; it leads with a conversation rather than a deposit.

**Implementation reference:** `sweeneys-martial-arts` in `lib/workspace.ts`, plus `app/workspace/_components/{WorkspaceShell,WebsiteScreen,AcquisitionScreens,NextStepsScreen}.tsx`. Read the current implementation before configuring a client. `inputs/client-hub v2/` supplies visual references; the subsequent approved full-screen website, seven standalone ads and example tracking figures supersede the original framed website and grouped variants.

### Data and lifecycle

- Use the existing `prospects` row and client-specific `WORKSPACE_OVERRIDES` in `lib/workspace.ts`. Keep one shared workspace implementation; configure client data rather than creating a separate hub in a sibling site.
- Prospect default is `overview`. Header tabs: **Overview / Your New Site / Your Ads / Follow-up / Tracking**, with a separate **Next steps** action. Preserve the global navbar on every screen, active navigation, back/forward behavior and mobile scrollable tabs.
- Keep the existing project and live states and their navigation. The legacy `review` route still resolves but is not the default entry or a prospect tab. Do not reintroduce it as the new-client flow.
- Populate `acquisition.offerCard`, `interests`, `ads`, `followUp` and `tracking` for the client's real offer. Use a trial for an academy, a check-in for an accountant, a quote request for a trade, or the relevant customer action. Sweeney’s trial wording, audience, price and example values are client configuration, not universal business facts.
- Stage 1 is a static proposal. Showing an offer page, campaign, sequence or reporting preview does not deploy a site, publish ads, send emails, connect integrations or install a CMS. Apply the existing approval and deployment discipline separately.
- The standard fixed service includes the website plus agreed ad creative, campaign structure and enquiry follow-up setup. Ad spend, publishing, ongoing management and future optimisation remain separate and optional. Do not market Booking & CRM as part of the standard proposition unless a configured service is explicitly approved.

### Overview

Lead with **“A clearer path to your next customer.”** and explain how the site, ads and follow-up connect around one useful offer. Use the dark **“Built around your business.”** reveal with a real screenshot of the built site (`website.previewImageUrl`, optimised WebP in `sorted/public/`) and a supplied creative where available. Screenshot the working site; do not substitute a mockup for the built preview.

Follow with the proposed customer offer, **How it works together** (Get noticed → Build trust → Start a conversation → See what works), four linked service cards, and the inclusion/optional management banner. Use **“Explore your new site”** and **“See next steps”** for navigation. Keep pricing on Next Steps, not on navigation buttons.

Copy is benefit-led, grounded in the client's strengths and actual starting point. Name the Trust, Enquiries, Customers or Operations value, the gap addressed and how improvement can be observed. Explain potential benefits without promising enquiries or revenue. Use plain English and “site” for the whole experience; avoid jargon and em-dashes in client-facing copy.

### Website: a full experience

- Full browser width and all remaining viewport height beneath the global navbar and compact preview controls. The client should scroll and interact with the actual site. No outer gutters, rounded device frame, large pitch heading, benefits cards or workspace footer around the website view.
- Keep the workspace navbar at the top. Do not restore the old black “Back to Review” action bar. Desktop/mobile preview controls and any version/page selector live in the compact light toolbar.
- Use `website.previewUrl` for the working iframe, with `previewImageUrl` as a fallback when the preview cannot load. Do not leave a blank skeleton indefinitely. Offer a recovery/question action when neither is available.
- Preview hosting convention: client repos deploy their static export to `sortmydigital.site/preview/<repo-name>/` via `deploy-preview.yml` (Hostinger, free). Set `website.previewUrl` to that URL for new workspaces — not a `*.netlify.app` URL. Client repos must not be linked to Netlify before commitment.
- Only expose a page as a working preview when its URL/image exists. An unbuilt `website.offerPage` must explicitly say **“Proposed destination · Not yet built”**; never send a “trial” or “book” action to an unrelated page as if it were complete.
- Existing version controls remain supported: approved direction defaults to Version 1; never label a version “Original”. Development URLs must not become public production URLs.

### Ads: complete standalone executions

Show every supplied creative as its own ad. No variant tabs, carousel or copy disclosure hiding the executions. Each card presents proposed primary text, full artwork, headline and CTA. Preserve native image proportions (`width: 100%; height: auto`); no cropping or black/white letterboxing to force matching heights. Responsive columns can accommodate different proportions.

Use supplied assets from the sibling client's `input/`, optimise photographic artwork to WebP, and reference central `public/` assets in `acquisition.ads.creatives`. Create client-specific draft primary text where it is missing, and label campaigns as proposed/not running. Do not invent “free” offers, review counts or other claims. If assets are missing, show an honest draft state rather than another client's artwork.

Explain that campaign setup is included while ad spend, publishing approvals, ongoing management and future optimisation are agreed separately. This hub demonstrates the proposed acquisition service. Actual campaign ingestion, approval decisions and publishing workflows remain in the existing Sorted Ads product; do not add a second approval portal or publish from the hub.

### Follow-up: selectable full email previews

Present a numbered sequence with timing, name and purpose beside a full selected-email preview (sender, subject, branded header and message body). On narrow screens, selection should bring the preview into view. Preserve supplied messages; draft and identify missing subject/timing metadata rather than claiming it was supplied.

Keep enquiry follow-up focused on the agreed next step. Enquiry chasing pauses on reply, resolution or opt-out. Explain that Sorted connects the agreed sequence and the client handles the personal conversation. Personalisation tokens and missing next-step links stay visibly marked in a draft; do not make placeholder links actionable, describe an unwired sequence as sending, or add booking/CRM promises that have not been configured.

### Tracking: a proposed journey with labelled examples

Use four outcome cards, a numbered journey with **Stage / What you will see / Who updates it**, and a dark **“Measure more than clicks.”** cost section. Adapt downstream outcomes to the business: quotes/customers for services; membership offers/new members for an academy. Specify ownership for enquiry capture, the confirmed next step, attendance and subsequent customer outcomes. Never infer attendance or conversion from elapsed time or an unverified signal alone.

For disconnected prospect previews, include an **Example month** with realistic, internally consistent counts and illustrative ad spend. Label the screen **“Illustrative example · Not live data”** and state that figures are neither client results, a forecast nor a performance promise. Store samples separately in `tracking.example`; keep `metrics[].connected` false. Calculate cost per outcome from that example's spend and denominator, handle zero denominators, and never fabricate live values. The reference month is £420 spend, 42 enquiries, 23 attended trials, 17 offers and 9 members; adapt examples when useful, do not present these as target results.

Once integrations are connected, use verified `metrics[].value` and suppress the illustrative dataset; show an empty state for unavailable real measurements. Do not mix example costs with live outcomes. The journey and recording responsibilities remain visible.

### Next Steps: booking first

- Headings: **“Interested? Book your call.”**, **“What would you like to improve?”**, **“What's the cost?”**, and **“What you get”**.
- Show the interests checklist and Cal.com calendar immediately. No “Continue to booking” gate and no requirement to select an interest first. Pass selected interests into booking notes and existing workspace events; provide an external booking fallback if embedding fails.
- Give the calendar enough desktop width for details/month/time slots side by side (the current implementation uses a 980px page column); allow its responsive mobile stacking.
- Render total/deposit/balance only from `workspace.offer`. Preserve client-specific commercial terms. When price is pending, explain it will be agreed on the call. Keep the deposit path secondary; a conversation needs no payment.
- Explicitly set each client's `stripePaymentUrl` to their link or clear it. Omitting it inherits a shared link and can charge the wrong amount. Never copy Sweeney’s amount/link to another client.
- Preserve the quiet red “Not interested” link, confirmation and `mark_workspace_not_interested` RPC (`crm_status='lost'` with paid/build/quote guards), event and farewell state. Do not test payments, opt-outs, bookings or outbound messages against live services during routine QA.

### Legacy review compatibility

For an explicitly requested legacy review edit, retain grounded strengths, a client-specific screenshot reveal, one three-point comparison section (`review.changes`: current → preview → advantage), and `review.comparisonPrompt`. Avoid separate reasons and improvements sections; `rebuildReasons` and `observations` are legacy rendering support. This comparison guidance does not require rewriting those fields for the new overview or clearing data used elsewhere. Do not invent an old website when the starting point is a listing or social page.

### Workspace completion checks

- [ ] Client-specific offer, interests, artwork, messages, journey labels and ownership configured; missing work visibly marked proposed/unbuilt.
- [ ] Overview is the default; five tabs plus separate Next steps action; project/live and legacy URLs still work.
- [ ] Real built-site screenshot and full-screen working website beneath the global navbar; fallback/recovery state available.
- [ ] Every ad visible individually, including full copy and original image proportions; no variant tabs or letterboxing.
- [ ] All supplied emails inspectable; enquiry phases, stop rules and draft next-step tokens clear without unconfigured booking/CRM promises.
- [ ] Example tracking explicitly labelled, costs reconcile to spend/counts, samples kept separate from connected results.
- [ ] Calendar visible without a gate; approved conversation/cost headings; correct offer amounts and explicit client Stripe link.
- [ ] Responsive at 1440, 768, 375 and 320px with no page overflow; keyboard focus, navigation and selection work.
- [ ] Run appropriate TypeScript/build and browser checks; stub external writes for opt-out/payment tests. Record the environment and any unconnected services in `.devin/session-logs/`.


## Key principles

1. **Sibling folder, not inside sorted.** Each site is its own project at `/Users/renaldoedmondson/Projects/<client-slug>/`.
2. **Resolve authority explicitly.** Approved human amendments, mockup composition, verified business facts and design-IR detail have distinct roles; stop for material conflicts.
3. **Assets arrive reconstructed.** Validate, optimise and register supplied files; local generation stays dormant unless specifically needed.
4. **Independent vision QA is not human approval.** Use actual image capability; do not skip fidelity review based on structural checks.
5. **Resume is evidence-backed.** Record starts/results and current-revision artifacts; blocked does not mean complete.

## Doctrine references

- `doctrine/operator-chain.md` — maintained chain state and artifact contract
- `operators/skills/factory-operators.md` - maintained execution/evidence contracts
- `operators/skills/asset-generator.md` - explicitly requested dormant fallback only
- `operators/skills/workspace-build.md` - approved commercial/creative handoff
- `templates/client-site/AGENTS.md` — site template conventions
