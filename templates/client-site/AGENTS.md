# AGENTS.md — Sorted Client Site

This repo was scaffolded from the Sorted client-site template. It is a Stage 1 build task.

**Your job:** Build the static site from the mockup and brief in `client/`. No CMS. No JSON content wiring. Just a clean, fast, well-built site the client can approve.

The CMS (SortedUpdates) is applied in Stage 2 — after the client approves this build. Do not wire content to JSON files or configure Decap CMS during this task.

---

## What's already in place

- Next.js static export configured (`output: 'export'`)
- TailwindCSS v4 with `@theme` variables
- `app/layout.tsx` — root layout with fonts (Plus Jakarta Sans + DM Mono)
- `app/globals.css` — animation system: `page-enter`, `fade-in`, `scroll-progress`
- `components/Nav.tsx` — sticky header, desktop pill nav, mobile hamburger
- `components/Footer.tsx` — footer with privacy/terms links
- `components/PageTransition.tsx` — page load animation wrapper
- `client/brief.md` — fill this in with client details before building
- `client/assets/` — place mockup, logo, and reference images here

**Do not rebuild any of the above.** Customise them for the client. Replace placeholder values. Do not start from scratch.

---

## Your inputs

Before starting, read:
1. `client/brief.md` — business type, brand colours, copy, CTAs, pages needed
2. `client/assets/` — mockup image(s), logo, any reference material

If `brief.md` is incomplete, use the mockup as the source of truth and make practical local-business decisions for anything unclear.

---

## Skill cascade — apply in this order

### Level 1 — taste-skills (always active)
These govern the mechanics of good design. Apply them to every decision.

| Skill | Key rule |
|---|---|
| `visual-hierarchy` | Section spacing 5–8rem. Max-width 1400px. Grid gap 2rem. |
| `color-system` | Accessible contrast. Semantic palette. Max 3–4 colours. |
| `typography-scale` | Fluid sizing with `clamp()`. Max 3 weights per page. |
| `feedback-patterns` | Hover transitions 200ms. Visible focus states. |
| `micro-interaction-spec` | Page enter 0.55s `cubic-bezier(0.32, 0.72, 0, 1)`. |

### Level 2 — sorted-local-site-refresh (centerpiece)
Full skill: `https://github.com/rennyreign/taste-skill/tree/main/skills/sorted-local-site-refresh`

#### Step 1 — Classify the business before designing
- local service / trade / fitness / beauty / food / professional service / ecommerce / booking-led / trust-led

#### Step 2 — Define the primary conversion action
call now / book intro / request quote / visit shop / join class / WhatsApp

#### Step 3 — Choose Standard or Premium
**Standard (default):** faithful to mockup, clean hover states, simple transitions, no heavy animation.
**Premium (only if brief specifies):** richer hero, scroll-triggered reveals, subtle parallax, refined type hierarchy.

If unsure, build Standard. Note Premium upgrade opportunities at the end.

#### Step 4 — Use a proven page pattern, don't invent

Standard service-site:
1. header/navigation
2. hero + primary CTA + clear value
3. trust bar or quick proof
4. services / programmes / products
5. why choose us / benefits
6. featured audience or service section
7. about / location credibility block
8. testimonials / reviews
9. contact / location / booking CTA
10. footer

Booking-led variation: hero → service cards → how it works → proof → pricing/FAQ → contact → footer

#### Step 5 — Design standards: every site must feel
Obvious. Useful. Trustworthy. Frictionless. Local. Human. Competent. Polished.

**Avoid:**
- startup / AI / agency language
- abstract SaaS visuals or fake dashboards
- excessive purple/blue AI gradients
- unreadable text overlays
- generic three-card rows when a better layout fits
- visual cleverness that hides business information

#### Step 6 — Copy rules
Plain English. Real draft copy tailored to the business. No lorem ipsum.

**Prefer:** "Book a free intro" / "Call us now" / "Request a quote" / "Clear prices. Quick turnaround. No fuss."

**Avoid:** elevate / unleash / transform / next-gen / seamless / revolutionary / empower / cutting-edge solutions

#### Step 7 — Motion rules
Standard: button hover, card hover lift, smooth scroll, simple staggered reveals.
Premium: hero entrance, scroll-triggered reveals, subtle parallax, richer hover transitions.

Never animate `top`, `left`, `width`, `height`. Use `transform` and `opacity` only. Never make the business feel gimmicky.

### Level 3 — client customisation
Customise freely within the above. Brand colours, fonts, section order, imagery style — these are yours to decide based on the brief.

---

## Implementation checklist

Every build must include:
- [ ] Responsive desktop / tablet / mobile
- [ ] Semantic HTML landmarks (`<header>`, `<main>`, `<section>`, `<footer>`)
- [ ] Accessible buttons and links with visible focus states
- [ ] Useful alt text on all images
- [ ] Real draft copy — no placeholder text
- [ ] Phone / email / location placed correctly
- [ ] Footer with privacy and terms links
- [ ] `<title>` and `<meta name="description">` updated for the client
- [ ] No dead placeholder links
- [ ] No commented-out dead code
- [ ] All images optimized (run `node scripts/optimize-images.mjs` — see `sorted/doctrine/image-optimization.md`)
- [ ] `npm run build` passes clean with zero TypeScript errors

---

## Quality check before finishing

- Is the primary CTA obvious within 5 seconds?
- Does the hero explain what the business does and who it's for?
- Are phone / booking / purchase paths easy to find?
- Does the design match the mockup enough to feel familiar?
- Is the page mobile-safe with no horizontal scroll?
- Are all sections useful — not decorative filler?
- Is the copy plain, local, and believable?
- Does it feel like something a real business owner would proudly approve?

Stage 1 completion is not launch approval. Final launch readiness is handled later by Sorted's Launch QA Operator after CMS, domain, analytics, forms, and production hygiene are configured.

---

## Deployment Discipline (Credit Protection)

**Never push directly to `main`.**

Every push to `main` triggers a Netlify build that consumes credits. During active development, this burns 20-50 credits per session.

### The Rule

1. **Work in feature branches**: `feat/description`
2. **Netlify Deploy Previews build automatically** for all branches (free)
3. **Review on preview URL**, not production
4. **Merge to `main` only** when work is complete and tested
5. **`main` deploys are production releases** — make them count

### Workflow

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

Full doctrine: `sorted/doctrine/cascade-deployment-discipline.md`

---

## What you must not do

- Do not apply the CMS (that is Stage 2 — a separate task)
- Do not create `lib/content.ts` or `content/` JSON files
- Do not configure Decap CMS or Netlify Identity
- Do not install new npm packages without approval
- **Do not push to `main` directly — use a feature branch**

---

## When done

1. Run `npm run build` — confirm it passes clean
2. Commit on a feature branch: `feat/stage-1-build`
3. Report: Standard or Premium tier, any notable decisions made, any Premium upgrade opportunities spotted

Do not tag a launch baseline during Stage 1. Baseline tags are created only after the Launch QA Operator passes the production candidate.
