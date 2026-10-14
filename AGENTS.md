# AGENTS.md — Sorted

Sorted is one business modernisation brand operated by ADX Engine. Websites and operational improvements are services under Sorted, not separate public sub-brands.

This file is the operating brief for any agent working in this repo or on a Sorted client site.

---

## Current Brand Architecture

**Sorted is one business modernisation brand.** Root URL: `sortmydigital.site`. Websites and operational improvements are services under Sorted, not separate public sub-brands.

Public routes:

1. **How we work** — `/howitworks` presents the website process. `/sites` is a compatibility alias.
2. **Operations** — `/ops` sits within the main site. `/v2` renders the same integrated operations homepage.
3. **Pricing** — `/pricing` combines the fixed website launch and one scoped operational-improvement offer. `/ops/pricing` and `/v2/pricing` render the unified page.

The previous standalone Sorted website positioning around "get picked, get enquiries, get bought" is deprecated and archived locally in `archive/deprecated-sorted-online/`.

Approved public positioning:

> Sorted is one business modernisation brand. Core promise: We make good businesses more capable. We modernise how local businesses win customers and get work done. Better digital systems. Less unnecessary work. More capacity to grow. Websites and operational improvements are services under Sorted, not separate public sub-brands. How we work presents the website process; Operations sits within the main site at /ops. Pricing combines the fixed £3,000 UK / $3,500 US website launch and one scoped operational-improvement offer. No invented retainer or starts-from price; ongoing support is agreed only for a defined need. Website CTA: Get your free site. Supporting disclosure: We build your first page free. Decide whether to take it further. Existing website manufacturing, approval, analytics and submission infrastructure is unchanged. Preserve legacy /sites /ops /v2 and pricing addresses as compatibility routes. Homepage headline stays fixed.

## What the Sorted Website Service Does

Sorted builds websites for small businesses using a reversed product cycle: build first, show the client the finished site, then quote. Client site deliveries usually ship with:

1. A Next.js static site
2. SortedUpdates — a Decap CMS giving the client control over all content
3. A walkthrough tutorial video embedded in the CMS
4. A factory reset capability held by Sorted
5. A client quote/delivery page at `sortmydigital.site/clients/[client-slug]`

The client owns the content layer. Sorted owns the design, code, and reset key.

## What Sorted Operations Does

Sorted's operations service removes repetitive work, recovers time, and improves operational performance for businesses with accumulated process drag. It is the route for established businesses and teams that need capacity returned through systems, automation, measurement, and operational redesign.

Full model: `doctrine/sorted-operating-model.md`

---

## The Sorted Value Model

**Sorted makes a business easier to trust, easier to contact, easier to buy from, and easier to run.** Four pillars — **Trust, Enquiries, Customers, Operations** — describe the customer value Sorted creates; the Four Engines describe how Sorted produces it. The website opens the relationship; the pillars guide how we improve the business.

Canonical doctrine: `doctrine/sorted-value-model.md` — twelve checks, scoring heuristic, outreach structure, objection handling, and the reusable assessment record.

**Agent rule:** every significant recommendation must name the value it creates, the gap it addresses, and how improvement will be observed.

---

## Repo Structure

```
sorted/
  app/
    clients/          ← Password-protected delivery/quote pages per client
    proposals/        ← Pre-delivery proposal pages (party-world pattern)
    sites/            ← Website offer compatibility alias for /howitworks
    ops/              ← Operations public offer alias
    v2/               ← Operations implementation route
    sorted-updates/   ← SortedUpdates portal (chat, history, preview, reset)
    operators/        ← Internal operator dashboards (prospect-finder)
  client/
    _template/        ← Brief, QA, handoff, and notes templates for new client work
  doctrine/           ← Sorted operating standards (read before building)
  operators/          ← Manufacturing chain operators + skills
    skills/           ← Skill files for orchestration agent execution
  templates/          ← Scaffolds for new client site repos
  mockups/            ← Working client mockup files (not web-served)
  archive/            ← Local archive of deprecated public site versions
  public/             ← Static assets served by the website
  .devin/
    rules/            ← Always-on context for Devin sessions
    workflows/        ← Step-by-step workflows for common tasks
```

---

## Agent Rules

### You may proceed without approval
- Build or modify client pages in `app/clients/`
- Build or modify proposal pages in `app/proposals/`
- Update doctrine documents in `doctrine/`
- Update or improve workflow files in `.devin/workflows/`
- Update operator skills in `operators/skills/`
- Scaffold and customise a requested sibling client-site Stage 1 build, including its root layout and advertised routes; the build request authorises this normal local work

### You must stop and request approval before
- Modifying the Sorted platform's `app/` routing structure or root layout files (this does not apply to normal scaffolding/customisation of a requested sibling client site)
- Installing new dependencies (using pnpm)
- Modifying deployment config or GitHub Actions workflows
- Pushing to `main` directly — use feature branches (see Deployment Discipline below)

---

## Skill Triggers

Every skill in this repo has natural-language trigger phrases. To see the full list at any time, say "what skills do I have" or "show me the skill triggers" — or read `.devin/skills/skill-triggers/SKILL.md` directly.

## Manufacturing Chain

The Sorted site-build chain runs in two modes. See `doctrine/operator-chain.md` for the full state contract.

**Orchestration agent (default):** Load `operators/skills/factory-operators.md`. ChatGPT supplies mockup, reconstructed imagery and design-IR export; CLI validates intake, optimises/registers assets, builds and independently verifies the site. Human assessment and the new workspace brief are explicit handoffs. The full downstream lifecycle remains relevant.

**Operator pipeline (scale):** Each step runs as a discrete CLI process. Same doctrine, same artifact shapes, different runtime.

### Acquisition Chain (runs before build)

| Step | Skill / Operator | Status |
|---|---|---|
| Prospect Finder | `operators/prospect-finder/` | Active |
| Website Analyser | `operators/skills/website-analyser.md` | Active |
| [Cherry-pick] | Manual — Renaldo reviews scored list | Always manual |
| Mockup generation | Custom GPT (manual) | Always manual |
| Outreach email draft | `operators/skills/outreach-drafter.md` | Active |

**Prospect Finder default:** Use **Scenario 2, Tier A — High-Value Project Buyers** from `doctrine/priority-manufacturing-categories.md`. This is the standard acquisition focus unless Renaldo explicitly selects a different prioritisation scenario.

### Build Chain (after nod from prospect)

| Step | Skill | Status |
|---|---|---|
| Mockup Deconstructor | `operators/skills/mockup-deconstructor.md` | Conditional fallback when supplied design detail is missing |
| Asset Generator | `operators/skills/asset-generator.md` | Dormant for complete supplied export packs |
| Intake / Asset Registry / Safe Resume | `operators/skills/factory-operators.md` | Default local manufacturing path |
| Frontend Builder | `operators/skills/frontend-builder.md` | Active |
| Independent Visual QA | `operators/skills/op-05b-human-vision-qa.md` | Required; distinct from human approval |
| Workspace Handoff | `operators/skills/workspace-build.md` | After human assessment and approved commercial/creative brief |
| Image Optimization | `.devin/workflows/image-optimization.md` | Active |
| SortedUpdates CMS | `.devin/workflows/add-decap-cms.md` | Active |
| Launch QA | `operators/skills/launch-qa.md` | Active |

---

## Deployment Discipline (Credit Protection)

**Never push directly to `main` on Sorted client sites.**

Every push to `main` on client-site repos can trigger a Netlify build that consumes credits. During active development, this burns 20–50 credits per session.

The Sorted platform site itself deploys to Hostinger from GitHub Actions. Keep the same branch discipline: develop on a feature branch, validate, then merge intentionally.

1. **Work in feature branches**: `feat/description`
2. **Netlify Deploy Previews build automatically** for all branches (free)
3. **Review on preview URL**, not production
4. **Merge to `main` only** when work is complete and tested

```bash
git checkout -b feat/stage-1-build
git add . && git commit -m "feat: add hero section"
git push origin feat/stage-1-build
# → Netlify creates a Deploy Preview URL automatically

# When ready for production:
git checkout main
git merge --no-ff feat/stage-1-build
git push origin main
```

Full doctrine: `doctrine/cascade-deployment-discipline.md`

---

## Stage 1 Build — Skills Required

Every client site build (Stage 1) uses a three-level skill cascade.

**Level 1 — taste-skills (always active)**
- `visual-hierarchy` — section spacing, max-width, grid gaps
- `color-system` — palette structure, contrast, semantic mapping
- `typography-scale` — fluid sizing, weight relationships
- `feedback-patterns` — hover states, transitions (200ms standard)
- `micro-interaction-spec` — page enter timing, animation curves

**Level 2 — `sorted-local-site-refresh` (centerpiece)**
Full skill: `https://github.com/rennyreign/taste-skill/tree/main/skills/sorted-local-site-refresh`

Key rules — apply to every Stage 1 build:

- **Classify the business first:** local service / trade / fitness / beauty / food / professional service / ecommerce / booking-led / trust-led
- **Define the primary CTA:** call now / book intro / request quote / visit shop / join class / WhatsApp
- **Use the proven page pattern:** nav → hero + CTA → trust bar → services → why us → about → testimonials → contact → footer
- **Design standards:** Obvious. Useful. Trustworthy. Frictionless. Local. Human. Competent. Polished.
- **Avoid:** startup language, AI gradients, generic three-card rows, visual cleverness that hides information
- **Copy:** Plain English. Real draft copy. No lorem ipsum. No "elevate / unleash / transform / seamless". Canonical voice: `doctrine/sorted-brand-voice.md` (constructive confrontation — honest but fair, challenge the gap not the person)
- **Motion — Standard (default):** hover states, card lift, smooth scroll, staggered reveals. Premium only if brief specifies.

**Level 3 — client customisation**
Brand colours, fonts, section order, imagery style — varies per client. Constrained by Levels 1 and 2.

Full scaffold: `templates/client-site/README.md`

Approved client mockup/design-IR takes precedence over generic spacing, type and section-order defaults. Use taste skills to improve reliability/accessibility without redesigning the approved composition. Record current-revision evidence and attempts; unknown billed costs/human time remain unknown. Two-build pilot protocol: `docs/manufacturing-two-build-pilot.md`.

---

## Two-Stage Delivery Model

**Stage 1 — Build (→ Nod 2)**
Static site only. No CMS. Client evaluates and approves the design.

**Stage 2 — CMS (after Nod 2 only)**
Apply SortedUpdates. Wire content to JSON, configure Decap CMS, add tutorial panel, set factory reset.

> Do not apply the CMS before the client approves the build. The CMS is a delivery mechanism, not part of the product evaluation.

---

## Applying SortedUpdates CMS

**Primary workflow:** `.devin/workflows/add-decap-cms.md`
**Mandatory doctrine:** `doctrine/sorted-studio-cms.md`
**Operator skill:** `operators/skills/sorted-studio-cms.md`

Key points:
1. Follow the workflow step by step — it is self-contained
2. **Reference implementation:** `warwickshire-str` — the most complete and current example. Study `public/cms/`, `lib/content.ts`, `content/` before writing any code
3. Every image field must use the `imgSrc()` helper from `lib/image.ts`
4. One JSON file per page section — not one per page
5. JSON content files are the factory reset state — keep them matching the approved build exactly
6. `/cms/` must be the Sorted Studio client-facing UI (three-column workspace); stock Decap lives at `/cms/decap.html` as a Sorted fallback only
7. Studio UI must expose only real client workflows: existing pages, existing sections, editable content fields, save state, and live preview
8. Do not link clients from Studio to stock Decap, and do not expose add/reorder/publish/design controls unless fully implemented and tested
9. Studio operates in dual-mode: local mode saves drafts via `decap-server` (no deploys); production mode publishes via Git Gateway with Netlify Identity JWT (triggers Netlify deploy)
10. Sorted favicon (`s.` on black) goes in `public/cms/`, referenced in `config.yml` as `logo_url`
11. Factory reset: record handoff SHA in `content/site/general.json`, create `scripts/reset.sh`, tag `handoff/[client-slug]`

---

## Client Quote Pages

Pattern: `app/clients/[client-slug]/page.tsx`

Reference: `app/clients/savannah-villegas/page.tsx` — this is the template.

Each quote page:
- Password-protected (hardcoded — intentional). Convention: `[firstname][year]` e.g. `savannah2026`
- AUTH_KEY named `[clientname]_auth`, expires in 30 days via localStorage
- Shows a "You've Been Sorted" delivery summary — what was built, pricing, what they own
- Review & Accept flow with service agreement modal
- Design reference: `app/proposals/party-world/page.tsx`

---

## Proposal Pages

Pattern: `app/proposals/[client-slug]/page.tsx`

Pre-delivery pages shown to prospects before Nod 1. Same password-protected pattern as client pages. Used to present the mockup and brief before any payment commitment.

---

## Client Workspace

Pattern: `/workspace?slug=<client-slug>` (dev) → `sortmydigital.site/workspace/<client-slug>` (prod). Backed by a `prospects` row + `WORKSPACE_OVERRIDES` in `lib/workspace.ts`.

Full standards live in `operators/skills/start-build.md` → **Client workspace standard: acquisition hub v2**. This is the default infrastructure for new client work; Sweeney’s is the implementation reference.

- **Prospect navigation:** Overview (default) / Your New Site / Your Ads / Follow-up / Tracking, plus a separate Next steps action. Preserve the global navbar and existing project/live states; `review` is a compatibility route.
- **Overview:** website, one customer offer, ads, follow-up and tracking presented as a connected service. Benefit-led copy names the value, gap and observable improvement. The reveal carries a real built-site screenshot (`website.previewImageUrl`, optimised WebP in `public/`).
- **Website:** full browser width and remaining viewport height beneath the global navbar and compact controls, so clients can experience the site. No outer pitch sections, device frame or old black review action bar.
- **Ads:** every workspace includes ad creative, copy and campaign structure as part of the fixed setup; every creative is a standalone complete ad with visible copy, artwork at native proportions, headline and CTA. No variant tabs or letterboxing. Ad spend, publishing approvals and ongoing management remain in Sorted Ads / separately agreed service.
- **Follow-up:** every workspace includes an agreed enquiry follow-up sequence as part of the fixed setup. Show selectable full email previews with clear timing/ownership; proposed sequences do not send emails until connected and approved.
- **Tracking:** business-specific outcome cards, customer journey and costs. Disconnected previews use clearly labelled illustrative figures, with costs calculated from example spend/counts; samples never masquerade as live results. Do not market Booking & CRM as part of the standard proposition.
- **Next Steps:** “Interested? Book your call.” with interests and immediately visible calendar; “What's the cost?” is secondary. Prices render from `workspace.offer`; set `stripePaymentUrl` explicitly per client to avoid inheriting the wrong charge.
- **Not interested:** quiet red link → confirmation → `mark_workspace_not_interested` RPC, preserving paid/build/quote guards.
- **Honest proposal states:** unbuilt offer pages and unconnected campaigns/reporting remain visibly proposed. Stage 1 does not authorise CMS, deployment, ad publishing or outbound emails.

## Client Directory & Agreements

**Convention:** `/proposals/[slug]` = pre-sale documents (proposal, mockup reveal). `/clients/[slug]` = post-sale documents (quote, agreement, delivery summary, invoice). Keep this split when adding new pages.

**Directory:** Every client-facing page is registered in `lib/clientDirectory.ts` — add an entry there whenever you create a proposal, quote, agreement, delivery, or invoice page. The operator dashboard (`/operators/prospect-finder` → **Clients** tab) renders the registry with copy-able URLs, page passwords, live signature status, and CRM status.

**Signatures:** Client "Review & Accept" signatures are persisted to the Supabase `agreements` table via `lib/agreements.ts` (`recordAgreement` on sign, `getLatestAgreement` to rehydrate on load). Any new signable page must wire both calls — see `app/clients/savannah-villegas/page.tsx` for the pattern.

---

## Delivery Checklist

Before closing any client delivery:

- [ ] CMS live and accessible at `[site-url]/cms/`
- [ ] Tutorial video URL added to `public/cms/tutorial.json`
- [ ] Netlify Identity set to Invite Only
- [ ] Client invited via Netlify Identity
- [ ] Factory reset script created (`scripts/reset.sh`)
- [ ] Handoff SHA tagged (`git tag handoff/[client-slug]`)
- [ ] Client quote page live at `sortmydigital.site/clients/[client-slug]`
- [ ] Quote page password sent to client separately

---

## Public Marketing Design & Voice (V3)

Scoped to Sorted's own public marketing pages only:

- **Palette:** black / white / warm-neutral with lime `#D7FF00` accents (and the blue iceberg graphic on `/what-else-we-do`). Internal dashboards, operator tools and client workspaces remain on the monochrome design system — do not carry the marketing palette into them.
- **Voice:** Sorted's canonical brand voice (constructive confrontation — honest but fair) applies to Sorted's own public communications. Client-brand copy always respects the approved client tone.
- **Structure:** the homepage leads with the parent promise ("We make good businesses more capable.") and routes into the two services; `/what-else-we-do` (labelled "What we improve") explains the systems Sorted improves. The fixed website launch includes the website, agreed ad creative/campaign setup, tracking and follow-up setup; ad spend, ongoing management and future optimisation are always presented as separate and optional. Operations work is scoped case by case — no fixed fees or ready-made catalogue. Never claim false inclusions, performance or timing — no guaranteed results, no hard delivery promises, and do not market Booking & CRM as part of the standard proposition.

---

## Key Doctrine

- `doctrine/sorted-value-model.md` — four-pillar value model (Trust, Enquiries, Customers, Operations), scoring heuristic, outreach discipline
- `doctrine/sorted-operating-model.md` — Four Nods, manufacturing model, dual execution modes
- `doctrine/operator-chain.md` — chain state contract, artifact schemas, skill vs operator
- `doctrine/all-content-is-editable.md` — every visible element must be CMS-editable
- `doctrine/sorted-studio-cms.md` — Sorted Studio client CMS standard
- `doctrine/factory-reset.md` — reset standard, script, tagging
- `doctrine/client-onboarding.md` — Netlify Identity setup, handoff message template
- `doctrine/cascade-deployment-discipline.md` — branch-based workflow, credit protection
- `doctrine/image-optimization.md` — image format, compression, and orphan removal standard

---

## Tech Stack

- **Framework:** Next.js (static export — `output: 'export'`)
- **Styling:** TailwindCSS v4
- **CMS:** Decap CMS v3 + Netlify Identity + Git Gateway
- **Hosting:** Hostinger via GitHub Actions for `sortmydigital.site`; Netlify remains available for client-site CMS deliveries where required
- **IMPORTANT:** The Sorted platform domain is `sortmydigital.site` — NOT `.com`. Never use `.com`.
- **Hostinger SSH:** IP `82.29.157.61`, port `65002`, username `u212019412` — deploy via SCP using `SSH_PRIVATE_KEY` secret
- **Images:** Netlify Image CDN via `lib/image.ts` `imgSrc()` helper
- **Icons:** Lucide React — string keys in JSON, component map in page file

---

## Build Commands

Use pnpm for setup, development, verification and handoffs. Follow `operators/skills/factory-operators.md` -> Package Manager And Handoffs before any dependency work; package/network permissions remain separate.

```bash
pnpm run dev       # Next.js dev server
pnpm run build     # Production build
pnpm run cms       # Decap local proxy (run alongside dev for CMS editing)
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
