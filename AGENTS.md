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
- Pushing to `main` directly — use feature branches

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
