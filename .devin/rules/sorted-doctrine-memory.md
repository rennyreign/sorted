---
trigger: always_on
---

# Sorted Doctrine — Memory Snapshot

This file captures the core strategic and operational doctrine of Sorted so it remains available across sessions. Source documents live in `doctrine/` and `plan/`.

---

## Strategic Identity (Updated 22.06.2026)

Sorted is a **small-business modernization company**, not a website company.

- **Mission:** Help small businesses build more trust, generate more enquiries, and win more customers through digital modernization.
- **The website is the doorway, not the destination.** It is the first and most visible capability gap that Sorted solves, but future solutions include reviews, follow-up systems, CRM, AI receptionists, booking systems, reporting, and automation.
- **Homepage positioning has shifted from:**
  - "Your new website. Sorted." (old, website-first)
  - **to:** "More trust. More enquiries. More customers." (modernization-first)

The website should make visitors feel they are improving their business, not simply buying a website.

---

## Core Philosophy

> **"We don't sell. We show."**

Before asking for commitment, Sorted demonstrates value:

- Website mockup
- Website score / review audit
- Follow-up audit
- AI receptionist demo
- Lost revenue report

These are **acquisition artifacts**, not products. Their purpose is to earn trust before a sales conversation begins.

---

## The Three Outcome Frameworks

Every Sorted solution maps to one of three business outcomes:

| Trust | Enquiries | Customers |
|---|---|---|
| Websites | Forms | Offers |
| Branding | CRM | Referrals |
| Photography | Booking systems | Reactivation |
| Reviews | Follow-up | Retention |
| Social proof | AI reception | Marketing automation |

The homepage introduces this framework as "what modern businesses need to compete online," not as a services upsell.

---

## The Reversed Product Cycle

Traditional agencies sell first, build second. Sorted inverts this:

```
Build → Show → Quote → Charge → Deliver
```

The client sees the finished product before spending a penny. Approvals happen through progressive nods.

## The Four Nods

```
Mockup  →  Nod 1
Build   →  Nod 2
Quote   →  Nod 3
Payment →  Nod 4 → Deliver
```

- **Nod 1:** Mockup approved — visual proof before code is written.
- **Nod 2:** Build approved — live static site presented, no CMS yet.
- **Nod 3:** Quote approved — price is shown after the product is already approved.
- **Nod 4:** Payment and delivery — SortedUpdates (CMS) is applied and handoff occurs.

**Critical:** SortedUpdates / Decap CMS is applied **after Nod 2**, not before. The CMS is a delivery mechanism, not part of the product evaluation.

---

## The China-Phenomena Operating Doctrine

Sorted runs as a digital manufacturing line:

- **Task specialization over monolithic prompts.**
- **Isolated operational units** (operators) with deterministic inputs and outputs.
- **System intelligence over individual genius.** Intelligence lives in infrastructure, protocols, and schemas.
- **Automation test:** If a human must be present during a sub-task, it is not an operator.

Operators communicate through **state**, not direct dependency. The chain advances via status changes on a single source of truth.

---

## The Two Chains

1. **Acquisition chain** — find prospects, analyze websites, score them, move into outreach and CRM.
2. **Build chain** — convert a nodding prospect into a delivered, CMS-enabled website.

### Acquisition Chain

```
Prospect Finder → Website Analyser → Operator Review (manual) → Cold Outreach (manual) → Review Page → Mockup Reveal → CRM Pipeline
```

- Review page: `sortmydigital.site/review/[slug]`
- Scoring formula: `prospect_score = (opportunity_score × 0.6) + (business_quality_score × 0.4)`
- Displayed score on review page: `prospect_score × 10 / 100`
- `mockup_revealed` CRM stage is set automatically when the prospect clicks "Reveal your new website."

### Build Chain

```
mockup.jpg → Mockup Deconstructor → deconstruction.json
  → Asset Generator → assets/ + manifest.json
  → Frontend Builder → Next.js site repo → npm run build → Nod 2
  → SortedUpdates CMS (after Nod 2) → Nod 3 → Payment → Handoff
```

---

## Dual Execution Modes

The same doctrine runs in two modes:

- **Orchestration agent (default):** A single agent session runs the full chain using skills.
- **Operator pipeline (scale):** Each step runs as a stateless CLI process via a job queue.

Skills are the fast path. Operators are the scale path. Same doctrine, same artifacts, different runtime.

---

## CMS and Content Doctrine

- **All content is editable.** Every visible text, image, and media asset on a client site must be editable through the CMS. No exceptions.
- **The client owns the content layer.** Sorted owns the design layer, the code, and the reset key.
- **Factory reset:** Every site ships with `scripts/reset.sh` and a recorded `handoffSha`. The reset restores editable content back to the approved handoff state without touching design or structure.
- **Loader fallbacks** must match the approved design content exactly — they are the factory reset state.

---

## Design and Delivery Standards

- **Tech stack:** Next.js static export, TailwindCSS v4, Decap CMS v3 + Netlify Identity + Git Gateway, Netlify hosting (client sites) / Hostinger (sortmydigital.site).
- **Domain:** `sortmydigital.site` — never `.com`.
- **Deployment discipline:** Never push directly to `main`. Work in `feat/description` branches, review on Netlify Deploy Preview, merge only when client-ready. `main` deploys consume credits.
- **Design system:** Monochrome Sorted design system (`#FAFAFA` background, `#0A0A0A` text, no accent color). See `.devin/rules/operator-context.md` for exact tokens.
- **Client onboarding:** Netlify Identity set to Invite Only, Git Gateway enabled, tutorial video in `public/cms/tutorial.json`, handoff tag `handoff/<client-slug>`.

---

## Key Reminders

- The website is a **validation asset**, not the primary acquisition channel for high-value clients. Most future customers will encounter Sorted through mockups, scores, outreach, reviews, and referrals.
- The website must answer four questions: Who is Sorted? Why trust them? How does the process work? What happens next?
- Avoid locking Sorted into "website design agency" language. Support future expansion into reviews, AI, CRM, automation, and business modernization.
- The relationship is the asset. Every successful engagement increases trust and creates permission for future modernization opportunities.
- The goal is to become the first place a small business thinks to ask whenever a digital problem appears.

---

## Source Documents

- `doctrine/Sorted-doctrine-update 22.06.2026.md` — latest overview and 13 operating principles (refreshed, concise)
- `plan/Sorted Website Repositioning Brief.md` — homepage and strategic repositioning brief
- `doctrine/sorted-operating-model.md` — Four Nods, manufacturing model, CMS timing
- `doctrine/sorted-overview.md` — vision, China-Phenomena, acquisition pipeline, long arc
- `doctrine/operator-chain.md` — state contract, artifact schemas, chain map
- `doctrine/scoring-for-modernization.md` — scoring formula and review copy rules
- `doctrine/cascade-deployment-discipline.md` — branch-based workflow and credit protection
- `doctrine/all-content-is-editable.md` — CMS editability standard
- `doctrine/factory-reset.md` — reset capability and handoff tagging
- `doctrine/client-onboarding.md` — Netlify Identity setup and handoff process
- `AGENTS.md` — agent rules, tech stack, deployment discipline, build standards
