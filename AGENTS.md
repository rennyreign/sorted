# AGENTS.md — Sorted

Sorted is a website manufacturing line operated by ADX Engine. Every site Sorted ships follows the same stack, the same CMS pattern, and the same delivery standard.

This file is the operating brief for any agent working in this repo or on a Sorted client site.

---

## What Sorted Does

Sorted builds websites for small businesses using a reversed product cycle: build first, show the client the finished site, then quote. Every site ships with:

1. A Next.js static site hosted on Netlify
2. SortedUpdates — a Decap CMS giving the client control over all content
3. A walkthrough tutorial video embedded in the CMS
4. A factory reset capability held by Sorted
5. A client quote/delivery page at `sortmydigital.site/clients/[client-slug]`

The client owns the content layer. Sorted owns the design, code, and reset key.

Full model: `doctrine/sorted-operating-model.md`

---

## Repo Structure

```
sorted/
  app/
    clients/          ← Password-protected delivery/quote pages per client
    proposals/        ← Pre-delivery proposal pages (party-world pattern)
    sorted/           ← SortedUpdates portal (chat, history, preview, reset)
    operators/        ← Internal operator dashboards (prospect-finder)
  client/
    _template/        ← Brief, QA, handoff, and notes templates for new client work
  doctrine/           ← Sorted operating standards (read before building)
  operators/          ← Manufacturing chain operators + skills
    skills/           ← Skill files for orchestration agent execution
  templates/          ← Scaffolds for new client site repos
  mockups/            ← Working client mockup files (not web-served)
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

### You must stop and request approval before
- Modifying `app/` routing structure or root layout files
- Installing new npm packages
- Modifying deployment config or GitHub Actions workflows
- Pushing to `main` directly — use feature branches (see Deployment Discipline below)

---

## Manufacturing Chain

The Sorted site-build chain runs in two modes. See `doctrine/operator-chain.md` for the full state contract.

**Orchestration agent (default):** Load `operators/skills/site-build.md` and run the chain in a single session — mockup → deconstruction → assets → site repo → build pass.

**Operator pipeline (scale):** Each step runs as a discrete CLI process. Same doctrine, same artifact shapes, different runtime.

### Acquisition Chain (runs before build)

| Step | Skill / Operator | Status |
|---|---|---|
| Prospect Finder | `operators/prospect-finder/` | Active |
| Website Analyser | `operators/skills/website-analyser.md` | Active |
| [Cherry-pick] | Manual — Renaldo reviews scored list | Always manual |
| Mockup generation | Custom GPT (manual) | Always manual |
| Outreach email draft | `operators/skills/outreach-drafter.md` | Active |

### Build Chain (after nod from prospect)

| Step | Skill | Status |
|---|---|---|
| Mockup Deconstructor | `operators/skills/mockup-deconstructor.md` | Active |
| Asset Generator | `operators/skills/asset-generator.md` | Active |
| Frontend Builder | `operators/skills/frontend-builder.md` | Active |
| SortedUpdates CMS | `.devin/workflows/add-decap-cms.md` | Active |

---

## Deployment Discipline (Credit Protection)

**Never push directly to `main` on Sorted client sites.**

Every push to `main` triggers a Netlify build that consumes credits. During active development, this burns 20–50 credits per session.

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
- **Copy:** Plain English. Real draft copy. No lorem ipsum. No "elevate / unleash / transform / seamless"
- **Motion — Standard (default):** hover states, card lift, smooth scroll, staggered reveals. Premium only if brief specifies.

**Level 3 — client customisation**
Brand colours, fonts, section order, imagery style — varies per client. Constrained by Levels 1 and 2.

Full scaffold: `templates/client-site/README.md`

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

Key points:
1. Follow the workflow step by step — it is self-contained
2. **Reference implementation:** `rennyreign/savannah-villegas` on GitHub — study `public/cms/`, `lib/content.ts`, `content/` before writing any code
3. Every image field must use the `imgSrc()` helper from `lib/image.ts`
4. One JSON file per page section — not one per page
5. Loader fallback defaults must match the original approved content exactly — these are the factory reset state
6. Sorted favicon (`s.` on black) goes in `public/cms/`, referenced in `config.yml` as `logo_url`
7. Tutorial panel injected via JavaScript in `index.html`, reads from `public/cms/tutorial.json`
8. Factory reset: record handoff SHA in `content/site/general.json`, create `scripts/reset.sh`, tag `handoff/[client-slug]`

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

## Key Doctrine

- `doctrine/sorted-operating-model.md` — Four Nods, manufacturing model, dual execution modes
- `doctrine/operator-chain.md` — chain state contract, artifact schemas, skill vs operator
- `doctrine/all-content-is-editable.md` — every visible element must be CMS-editable
- `doctrine/factory-reset.md` — reset standard, script, tagging
- `doctrine/client-onboarding.md` — Netlify Identity setup, handoff message template
- `doctrine/cascade-deployment-discipline.md` — branch-based workflow, credit protection

---

## Tech Stack

- **Framework:** Next.js (static export — `output: 'export'`)
- **Styling:** TailwindCSS v4
- **CMS:** Decap CMS v3 + Netlify Identity + Git Gateway
- **Hosting:** Netlify (client sites) / Hostinger via GitHub Actions (sortmydigital.site)
- **IMPORTANT:** The Sorted platform domain is `sortmydigital.site` — NOT `.com`. Never use `.com`.
- **Hostinger SSH:** IP `82.29.157.61`, port `65002`, username `u212019412` — deploy via SCP using `SSH_PRIVATE_KEY` secret
- **Images:** Netlify Image CDN via `lib/image.ts` `imgSrc()` helper
- **Icons:** Lucide React — string keys in JSON, component map in page file

---

## Build Commands

```bash
npm run dev       # Next.js dev server
npm run build     # Production build
npm run cms       # Decap local proxy (run alongside dev for CMS editing)
```
