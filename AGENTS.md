# AGENTS.md — Sorted

Sorted is a website manufacturing line operated by ADX Engine. Every site Sorted ships follows the same stack, the same CMS pattern, and the same delivery standard.

This file is the operating brief for any agent (Cascade, Codex, or otherwise) working in this repo or on a Sorted client site.

---

## What Sorted Does

Sorted builds websites for small businesses. Every site ships with:

1. A Next.js static site hosted on Netlify
2. SortedUpdates — a Decap CMS giving the client control over all content
3. A walkthrough tutorial video embedded in the CMS
4. A factory reset capability held by Sorted
5. A client quote/delivery page at `sortmydigital.com/clients/[client-slug]`

The client owns the content layer. Sorted owns the design, code, and reset key.

---

## Repo Structure

```
sorted/
  app/
    clients/          ← Password-protected delivery/quote pages per client
    proposals/        ← Pre-delivery proposal pages (party-world pattern)
  doctrine/           ← Sorted operating standards (read before building)
  templates/          ← Scaffolds for new client sites
  .windsurf/
    workflows/        ← Step-by-step workflows for common tasks
```

---

## Agent Rules

### You may proceed without approval
- Build or modify client pages in `app/clients/`
- Build or modify proposal pages in `app/proposals/`
- Update doctrine documents in `doctrine/`
- Update or improve workflow files in `.windsurf/workflows/`

### You must stop and request approval before
- Modifying `app/` routing structure or layout files
- Installing new npm packages
- Modifying deployment config or GitHub Actions workflows
- Pushing to `main` directly — use feature branches (see Deployment Discipline below)

---

## Deployment Discipline (Credit Protection)

**Never push directly to `main` on Sorted client sites.**

Every push to `main` triggers a Netlify build that consumes credits. During active development, this burns 20-50 credits per session.

### The Rule

1. **Work in feature branches**: `feat/description`
2. **Netlify Deploy Previews build automatically** for all branches (free)
3. **Review on preview URL**, not production
4. **Merge to `main` only** when work is complete and tested
5. **`main` deploys are production releases** — make them count

### Workflow for Client Sites

```bash
# Start work
git checkout -b feat/stage-1-build

# Iterate freely — commit as often as needed
git add .
git commit -m "feat: add hero section"
git push origin feat/stage-1-build
```

Netlify creates a Deploy Preview URL automatically. Share this for review.

```bash
# When ready for production
git checkout main
git merge --no-ff feat/stage-1-build
git push origin main
```

Full doctrine: `doctrine/cascade-deployment-discipline.md`

---

## Stage 1 Build — Skills Required

Every client site build (Stage 1) uses a two-level skill cascade. This is what ensures sites vary in aesthetic while staying structurally sound and consistent in quality.

**Level 1 — taste-skills (foundational principles)**
These are always active. They govern spacing, type, colour, motion, and feedback mechanics.
- `visual-hierarchy` — section spacing, max-width, grid gaps
- `color-system` — palette structure, contrast, semantic mapping
- `typography-scale` — fluid sizing, weight relationships
- `feedback-patterns` — hover states, transitions (200ms standard)
- `micro-interaction-spec` — page enter timing, animation curves

**Level 2 — `sorted-local-site-refresh` (pattern library)**
This is the centerpiece. Full skill: `https://github.com/rennyreign/taste-skill/tree/main/skills/sorted-local-site-refresh`

Key rules extracted below — apply all of them to every Stage 1 build:

### Business classification — do this first
Classify before designing:
- local service / trade / fitness / beauty / food / professional service / ecommerce / booking-led / trust-led

Define the primary conversion action: call now / book intro / request quote / visit shop / join class / WhatsApp

### Page pattern — use proven structure, don't invent
Standard service-site order:
1. header/navigation
2. hero with primary CTA and clear value
3. trust bar or quick proof
4. services / programmes / products
5. why choose us / benefits
6. featured audience or service section
7. about / location credibility block
8. testimonials / reviews
9. contact / location / booking CTA
10. footer

Booking-led variation: hero → service cards → how it works → proof → pricing/FAQ → contact → footer

### Design standards — every site must feel
Obvious. Useful. Trustworthy. Frictionless. Local. Human. Competent. Polished.

**Avoid:**
- startup / AI / agency / consultant language
- abstract SaaS visuals or fake dashboards
- excessive purple/blue AI gradients
- unreadable text overlays
- generic three-card rows when a better layout fits
- visual cleverness that hides business information

### Copy rules
Plain English. No lorem ipsum — use real draft copy tailored to the business.

**Prefer:** "Book a free intro" / "Call us now" / "Request a quote" / "Clear prices. Quick turnaround. No fuss."

**Avoid:** elevate / unleash / transform / next-gen / seamless / revolutionary / empower / cutting-edge solutions

### Motion — Standard vs Premium
**Standard (default):** button hover states, card hover lift, smooth scroll, simple staggered reveals, subtle image zoom.

**Premium (if brief calls for it):** refined hero entrance, staggered scroll-triggered reveals, subtle parallax, richer hover transitions.

Never animate layout properties (`top`, `left`, `width`, `height`). Motion uses `transform` and `opacity` only. Never make the business feel gimmicky.

### Implementation always includes
- Responsive desktop / tablet / mobile
- Semantic HTML landmarks
- Accessible buttons, links, focus states
- Useful alt text
- Real draft copy
- Correct contact / location placement
- Footer with privacy and terms links
- Metadata: title and description
- No dead placeholder links
- No commented-out dead code

### Quality check before output
- Is the primary CTA obvious within 5 seconds?
- Does the hero explain what the business does and who it's for?
- Are phone / booking / purchase paths easy to find?
- Does the design match the mockup enough to feel familiar?
- Is the page mobile-safe with no horizontal scroll?
- Are all sections useful, not decorative filler?
- Is the copy plain, local, and believable?
- Does it feel like something a real business owner would proudly approve?

**Level 3 — client customisation (your call)**
Within the guardrails above, customise freely. Brand colours, typography choices, section order, imagery style, copy tone — these vary per client and are what makes each site feel distinct.

**The rule:** taste-skills constrain the *how*. `sorted-local-site-refresh` provides the *what*. Client brief drives the *feel*. All three together is a Sorted site.

Full scaffold detail: `templates/client-site/README.md`

---

## Two-Stage Delivery Model

Every Sorted site is built and delivered in two distinct stages:

**Stage 1 — Build**
Build the static site. No CMS. The client sees a clean, fast, design-led site with no admin toolbar or CMS artefacts. This is what they evaluate and approve (Nod 2).

**Stage 2 — CMS (after Nod 2 only)**
Once the client confirms they are happy with the build, apply SortedUpdates. Wire all content to JSON files, configure Decap CMS, add the tutorial panel, set up factory reset. This is what gets handed off after payment (Nod 4).

> Do not apply the CMS before the client approves the build. The CMS is a delivery mechanism, not part of the product evaluation.

---

## Applying SortedUpdates CMS to a Client Site

**Primary workflow:** `.windsurf/workflows/add-decap-cms.md`

Read the full workflow before starting. Key points for Codex:

1. The workflow is self-contained — follow it step by step
2. **Primary reference implementation:** `rennyreign/savannah-villegas` on GitHub — clone and study `public/cms/`, `lib/content.ts`, and `content/` before writing any code
3. Every image field must use the `imgSrc()` helper from `lib/image.ts`
4. Content is split by section — one JSON file per page section, not one per page
5. Every loader in `lib/content.ts` must have fallback defaults that match the original approved content exactly — these ARE the factory reset state
6. The Sorted favicon (`s.` on black) goes in `public/cms/` and is referenced in `config.yml` as `logo_url`
7. A tutorial panel is injected into the CMS via JavaScript in `index.html` — it reads from `public/cms/tutorial.json`
8. Factory reset: record handoff SHA in `content/site/general.json`, create `scripts/reset.sh`, tag the commit `handoff/[client-slug]`

---

## Client Quote Pages

Pattern: `app/clients/[client-slug]/page.tsx`

Reference: `app/clients/savannah-villegas/page.tsx` — use this as the template.

Each quote page:
- Is password-protected (client-specific password, hardcoded — this is intentional)
- Shows a "You've Been Sorted" delivery summary
- Lists what was delivered, pricing, what they can/can't do
- Has a Review & Accept flow with a service agreement modal
- Uses the Sorted design system (see `app/proposals/party-world/page.tsx` for design reference)
- Password stored in `AUTH_KEY` named `[clientname]_auth`, expires in 30 days

Password naming convention: `[firstname][year]` e.g. `savannah2026`

---

## Delivery Checklist

Before closing any client delivery:

- [ ] CMS live and accessible at `[site-url]/cms/`
- [ ] Tutorial video URL added to `public/cms/tutorial.json`
- [ ] Netlify Identity set to Invite Only
- [ ] Client invited via Netlify Identity
- [ ] Factory reset script created (`scripts/reset.sh`)
- [ ] Handoff SHA tagged (`git tag handoff/[client-slug]`)
- [ ] Client quote page live at `sortmydigital.com/clients/[client-slug]`
- [ ] Quote page password sent to client separately

---

## Key Doctrine

- `doctrine/sorted-operating-model.md` — overall model, Four Nods, SortedUpdates
- `doctrine/all-content-is-editable.md` — every visible element must be CMS-editable
- `doctrine/factory-reset.md` — reset standard, script, tagging
- `doctrine/client-onboarding.md` — Netlify Identity setup, handoff message template
- `doctrine/cascade-deployment-discipline.md` — branch-based workflow, credit protection

---

## Tech Stack

- **Framework:** Next.js (static export — `output: 'export'`)
- **Styling:** TailwindCSS
- **CMS:** Decap CMS v3 + Netlify Identity + Git Gateway
- **Hosting:** Netlify (client sites) / Hostinger via GitHub Actions (sortmydigital.com)
- **Images:** Netlify Image CDN via `lib/image.ts` `imgSrc()` helper
- **Icons:** Lucide React — string keys in JSON, component map in page file

---

## Build Commands

```bash
npm run dev       # Next.js dev server
npm run build     # Production build
npm run cms       # Decap local proxy (run alongside dev for CMS editing)
```
