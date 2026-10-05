# Skill: start-build

## Stage 1 Internal-Page Links

Before building or resuming a pre-approval client site, read `operators/skills/stage-1-direction-confirmation.md` (from the Sorted repo root). Implement its shared direction-confirmation pages and consistent internal routes during Op 4, before Op 5/5b. This is an intentional review state, not a finished internal page or client approval.


**Type:** Entry point skill — read this first before any website build
**Trigger:** User asks to build a website, start a new site, manufacture a site, or run the manufacturing line
**Output:** A scaffolded project folder with factory job initialised

---

## What this skill is

This is the **single entry point** for starting a new Sorted website build. If you're asking "how do I begin a new site?" — you're in the right place.

It creates a sibling project folder (not inside sorted), scaffolds the Next.js site from the client-site template, copies the mockup and manifest, and initialises the factory job.

## Prerequisites

Before starting, you need:

1. **An approved mockup image** (`.png`, `.jpg`, or `.webp`)
2. **An image manifest JSON** — the combined deconstruction + asset manifest that describes every section, asset, copy element, and design token
3. **A client slug** — lowercase, hyphenated (e.g., `lrt-plumbing`, `chillika`)

If any are missing, stop and ask.

## How to start a build

### Single command

```bash
/Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/scripts/start-build.sh \
  <client-slug> \
  <mockup-path> \
  <manifest-path>
```

**Example:**

```bash
/Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/scripts/start-build.sh \
  lrt-plumbing \
  ~/Downloads/lrt-mockup.png \
  ~/Downloads/lrt-manifest.json
```

This will:
1. Create `/Users/renaldoedmondson/Projects/<client-slug>/` (sibling to sorted)
2. Scaffold the Next.js site from `sorted/templates/client-site/`
3. Copy mockup + manifest into `input/`
4. Initialise the factory job (creates `state/build-state.json`)
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
    approved-mockup.png    ← Your mockup
    image-manifest.json    ← Your manifest
  state/
    build-state.json       ← Factory job state (tracks operator progress)
  artifacts/        ← (created as operators run)
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

### The 17 operators

| # | Operator | Execution | Vision model? |
|---|---|---|---|
| 0 | Build Init | harness | No |
| 1 | Mockup Regions | harness | No |
| 2 | Asset Reconstruction | standalone | No |
| 3 | Asset Registry | standalone | No |
| 4 | Frontend Build | harness | No |
| 5 | Visual QA (automated) | harness | No |
| **5b** | **Human Vision QA** | **harness** | **YES — switch model** |
| 6 | Pixel Correction | harness | No |
| 7 | UI Systemisation | harness | No |
| 8 | Design System | harness | No |
| 9 | Core Build QA | harness | No |
| 10+ | Internal pages, CMS, etc. | harness | No |

### The vision QA gate (Op 5b)

After the automated visual QA (Op 5) passes structural checks, there is a **human vision QA gate** (Op 5b). This step requires actually looking at the rendered site and comparing it to the mockup — something a text-only model cannot do.

**When you reach Op 5b:**

1. **Switch to a vision-capable model** (the user initiates this switch)
2. Start the dev server: `cd <build-dir> && npx serve out -p 3999`
3. Open http://localhost:3999 in a browser
4. Compare the rendered site to the mockup at `input/approved-mockup.png`
5. Check screenshots at `artifacts/regions/screenshots/`
6. If the site is accurate → mark as `passed` or `skipped`
7. If issues are found → mark as `failed` with notes, then run Op 6 (pixel correction)

**Skip if:** the automated visual QA found zero issues and you're confident the build is accurate. Mark as `skipped` and proceed to Op 7.

### Resuming a build

If a session is interrupted, any future session can resume:

```bash
node /Users/renaldoedmondson/Projects/sorted/operators/factory-orchestrator/dist/cli.js resume <build-dir>
```

This reads `build-state.json` and tells you which operator to run next. All artifacts are durable on disk — nothing is lost between sessions.

## Workspace review screen

The workspace review page (`/workspace?slug=<client-slug>&route=review`) is where the client first sees the build. Two non-negotiables:

1. **The black "We rebuilt your site." reveal card must always carry a real screenshot snapshot** of the built homepage — `workspace.website.previewImageUrl`, generated at the build/preview step (screenshot the live preview at desktop width, save an optimised webp to `sorted/public/`). Never ship the reveal with an empty right side.
2. **The editorial hero copy (eyebrow / headline / summary) runs full container width** — no narrower max-width clamps on the section, h1, or summary paragraph.
3. **Say "site", not "homepage", in workspace copy.** The reveal card reads "We rebuilt your site." and the button "Explore your new site" — the client discovers the homepage is the only live portion when they open the preview.

## Workspace website preview screen

The "Your new site" page (`/workspace?slug=<client-slug>&route=website`) shows the built site inside the workspace. Standards:

1. **Full-bleed immersive layout.** The preview fills the browser width edge-to-edge — no outer gutters, no rounded device frame.
2. **Single black action bar pinned to the top** — one uninterrupted horizontal row containing: "Back to Review" (returns to the review route), the version selector, the question action, desktop/mobile viewport toggle, and the next-steps action.
3. **No pricing on navigation buttons.** Any button that moves the client forward reads "See next steps" (desktop) / "Next steps" (mobile) — a price on a button reads as "this charges my card". Prices live only on the Next Steps/quote screen and its payment dialog.
4. **Version picker (dev builds).** When multiple site versions exist, expose a compact selector in the action bar labelled "Version 1" / "Version 2" — the current approved direction is always "Version 1" and the default selection. Never label a version "Original". Local-preview version URLs must not ship to production.
5. **Responsive without horizontal overflow** at 1440px, 768px, 375px and 320px — the action bar compresses (compact select, icon-only controls with accessible labels) rather than wrapping or overflowing.

## Workspace Next Steps / offer screen

1. **Offer amounts are parameterised, never hardcoded.** Deposit, balance and total always render from `workspace.offer` (`total`, `deposit`, `balance`) — a hardcoded price leaks the wrong number to other clients.
2. **Never inherit the shared Stripe link.** `WORKSPACE_OVERRIDES` merge spread-copies nested defaults, so an omitted `stripePaymentUrl` silently picks up the default link — which charges the wrong amount. Always set it explicitly: the client's own Stripe Payment Link, or cleared/empty so the card option shows "coming soon" and bank transfer is the only live path.
3. **"Not interested" affordance** — a quiet red link under the action buttons opens a confirmation dialog: "Selecting this will remove you from our records and any further engagement." Confirming calls the `mark_workspace_not_interested` SECURITY DEFINER RPC (`crm_status='lost'`, guarded so paid/build/quote prospects can't self-demote), logs a `not_interested_confirmed` workspace event, and replaces the offer screen with a farewell state. Migration: `supabase/migrations/20261004130000_workspace_not_interested.sql`.

### Review copy is benefit-led, never technical

The review write-up (`review.headline`, `review.summary`, `review.observations[]` in `WORKSPACE_OVERRIDES`) sells the business outcome, not the build. Rules:

1. **Lead with business benefit, never technical/design analysis.** The client is reading why this earns them money, not what changed on the page.
2. **Frame everything through the chain: trust (reputation, brand, proof) → enquiries → customers.** Each observation should map to a step in that chain — roughly: reputation made visible → proof where buyers look → trust converting into enquiries.
3. **Ground each review in that client's real fundamentals** — trading history, longevity, reserves, standing. The message is "your business is stronger than its current digital presence lets it show." Use real figures as framing, not published numbers (write "three decades of trading" or "a strong balance sheet", never a literal reserves figure).
4. **Ban web-design vocabulary in client-facing copy.** No "homepage redesign", "layout", "CTA", "mockup", "design direction". Plain English, second person, respectful and direct. Headline ~6-9 words; summary 1-2 sentences; each observation a short title + 1-2 sentence explanation.
5. **Keep observations honest to what's actually built** — name the real proof on the site (credentials, testimonials, ways to get in touch), not aspirations.

### Workspace review checklist

- [ ] Real screenshot snapshot generated from the built site and saved to `sorted/public/` as optimised webp (`previewImageUrl`)
- [ ] Hero copy (eyebrow / headline / summary) renders full container width — no max-width clamps
- [ ] Review copy is benefit-led: trust → enquiries → customers, grounded in the client's real fundamentals
- [ ] No web-design jargon anywhere in the client-facing copy; "site" not "homepage"
- [ ] Website preview is full-bleed with a single black action bar; CTA reads "See next steps" (no price)
- [ ] Offer amounts render from `workspace.offer`; `stripePaymentUrl` explicitly set per client (never inherited)
- [ ] "Not interested" red link + confirm dialog wired to `mark_workspace_not_interested`
- [ ] Page verified at desktop and mobile widths with Supabase stubbed — no real DB writes, snapshots saved to `sorted/artifacts/`

## Key principles

1. **Sibling folder, not inside sorted.** Each site is its own project at `/Users/renaldoedmondson/Projects/<client-slug>/`.
2. **The manifest is the source of truth.** Every section, asset, colour, and copy element comes from the manifest.
3. **Assets are generated, not extracted.** Flux-2-Flex is the default image generation model. No mockup extraction.
4. **The vision QA gate is human-in-the-loop.** The harness can't auto-switch to a vision model. The user initiates that switch.
5. **State is resumable.** `build-state.json` tracks everything. Any session can pick up where the last one left off.

## Doctrine references

- `operators/skills/manufacturing-line.md` — full operator chain documentation
- `operators/skills/op-02-asset-reconstruction.md` — asset generation details
- `templates/client-site/AGENTS.md` — site template conventions
