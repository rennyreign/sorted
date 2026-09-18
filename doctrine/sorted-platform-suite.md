# Sorted Platform Suite

**Status:** Planned — not yet built. This document captures the strategic shape and sequence so it can be picked up deliberately.
**Parent:** `doctrine/sorted-operating-model.md`
**Last reviewed:** 2026-08-10

---

## Purpose

Sorted's website offer is a trojan horse. The site builds trust, generates enquiries, and creates an ongoing relationship with the client. That relationship is the entry point into a wider platform suite that turns a one-time website delivery into a long-term operational partnership.

This document defines the suite, the sequence, and the architectural direction. It is a plan, not a build spec. Individual components get their own doctrine docs when they enter active development.

---

## The Suite

```
Sorted Sites (website)
    ↓ embedded
Sorted CMS (content updates)
    ↓ linked
Sorted CRM (lead records, performance data)
    ↓ layered
Sorted Data (analytics, multi-source insights)
    ↓ extended
Sorted Follow + future modules (efficiency tools)
```

Each layer is a natural upsell from the one before. The client never feels sold to — they feel like they're getting more of something that already works.

### Sorted Sites

The website itself. Static, fast, trust-building. Built first, shown before any payment. This is the trojan horse — it gets Sorted embedded into the client's business naturally.

**Status:** Active. This is the current core offer.

### Sorted CMS

The content layer. Lets the client update their own site without touching code. Currently delivered as SortedUpdates (Decap CMS + Sorted Studio UI).

**Status:** Active as SortedUpdates. See `doctrine/sorted-studio-cms.md`.

The CMS is the first thing the client touches after the site launches. It establishes the pattern: "Sorted gives me tools that work, in one place, without technical friction." Every subsequent layer inherits that trust.

### Sorted CRM

The operational core. Captures every lead that comes through the website, tracks them through a pipeline, and holds the performance data that tells the client (and Sorted) whether the site is actually working.

**Status:** Not built. This is the next major build.

**Evolves from:** `operators/prospect-finder/` — the existing prospect-finding tool becomes the foundation. The prospect finder is currently Sorted-internal (finding businesses to sell websites to). The CRM generalizes this: the same pipeline mechanics, applied to the client's own leads.

**What it holds:**
- Lead records (from website form submissions, calls, enquiries)
- Pipeline stages (new → contacted → qualified → won/lost)
- Communication history
- Performance metrics per lead source
- Client account structure (multi-user, permissions)

**Why it's the centerpiece, not Sorted Data:**
The CRM is where the client's actual business value lives — their leads, their pipeline, their revenue trail. Analytics without a CRM is decoration. A CRM with analytics layered on is a business operating system. Build the CRM first because it captures the data that makes analytics meaningful.

**Productization shape:**
- Base CRM (lead capture, pipeline, basic reporting) — included with every site delivery
- Prospect finder (Sorted's acquisition tool, adapted for client use) — payable feature
- Follow-up automation — payable feature
- Advanced pipeline / team features — payable feature

The free tier gets the client using it. The paid tiers unlock the operational tools that make the website more effective.

### Sorted Data

The analytics layer. Pulls from multiple sources (GA4, Search Console, Meta, TikTok, etc.) into a unified view. Either embedded in the CRM or accessible from it.

**Status:** Not built. Depends on Sorted CRM existing first.

**Architecture direction (when built):**
- Connector pattern — each platform implements a shared interface
- Normalized metrics — platform-native names map to canonical keys
- Supabase for storage (credentials, snapshots, raw payloads)
- GitHub Actions cron for collection
- Multi-account from day one (per-client credentials, not just Sorted's own)

**See:** The connector architecture discussion that produced this doctrine (2026-08-10). Key decisions deferred until CRM exists:
- Whether Sorted Data is a CRM section or a standalone dashboard
- Whether to use Looker Studio for Sorted-internal reporting while building custom for clients
- Which platforms beyond Google to prioritize (Meta/TikTok require app review — long lead time)

**Honest constraint:** Small business clients won't look at raw analytics. Sorted Data's value is in consolidation and interpretation — turning multiple data sources into a single "here's what's working, here's what to do" view. If it doesn't drive an action, it's noise. Build it last, build it opinionated.

### Sorted Follow + Future Modules

Efficiency tools that extend the CRM. Automated follow-up sequences, enquiry response systems, reminder chains, reactivation campaigns.

**Status:** Not built. Conceptual only.

These are the deepest layer of the trojan horse — the point where the client is operating their business through Sorted tooling. Each module is a payable feature that grows out of the CRM foundation.

---

## Build Sequence

| Phase | Component | Trigger | Status |
|---|---|---|---|
| 1 | Sorted Sites | Active | Done |
| 2 | Sorted CMS | After Nod 2 | Done (SortedUpdates) |
| 3 | Sorted CRM | Next major build | Not started |
| 4 | Sorted Data | After CRM holds lead records | Not started |
| 5 | Sorted Follow + modules | After CRM + Data proven | Not started |

**Do not build out of sequence.** Each layer depends on the one before it — not just technically, but commercially. The client adopts the CMS because they already have the site. They adopt the CRM because they already trust the CMS. They adopt Data because the CRM is showing them leads they want to understand. Skipping ahead builds tools no one uses.

---

## Architectural Principles

1. **One suite, one login.** The client should never feel like they're using separate products. CMS, CRM, Data, Follow — one interface, one auth, one place.

2. **The CRM is the spine.** Every other module connects to it, not to each other. Data feeds into CRM records. Follow triggers from CRM events. CMS links to CRM for lead capture. This keeps the architecture linear, not a web.

3. **Free base, paid depth.** Every client gets the base layer free (CMS, basic CRM). Depth features (prospect finder, follow-up, advanced analytics, team pipelines) are payable. The free layer creates dependency; the paid layers monetize it.

4. **Multi-client from day one.** The CRM must support multiple clients with isolated data from the start. Even if Sorted is the only user initially, the schema assumes per-client accounts, per-client credentials, per-client pipelines. Retrofitting multi-tenancy is expensive.

5. **Sorted uses its own tools.** The prospect finder that Sorted uses to find website clients is the same prospect finder that clients can pay to use for their own business. The CRM Sorted uses internally is the same CRM clients get. Build once, use twice.

---

## What Exists Today (Foundation for the CRM)

These are the pieces the CRM build will draw from:

- `operators/prospect-finder/` — pipeline mechanics, scoring, lead management. The CRM generalizes this.
- `operators/contact-enricher/` — lead data enrichment. Reusable in CRM.
- `operators/email-enricher/` — email finding/verification. Reusable in CRM.
- `operators/outreach-sender/` — outbound communication. Becomes Sorted Follow.
- `operators/quote-agent/` — quote generation. CRM-adjacent.
- Supabase integration — already in the stack (`@supabase/supabase-js`). Storage layer for CRM data.
- `.github/workflows/website-lead-sender.yml` — existing lead capture flow from website to notification. Becomes the CRM's lead ingestion pipeline.

**Gap:** No unified lead record storage, no pipeline UI, no client-facing dashboard. These are what the CRM build creates.

---

## Open Decisions (Resolve When Picking Up)

1. **CRM hosting** — Supabase + Next.js route under `app/crm/`, or standalone app under `apps/crm/`? Depends on whether it's client-facing only or also operator-facing.

2. **Auth model** — extend Netlify Identity (current CMS auth) or move to Supabase Auth for unified login across CMS + CRM + Data? Supabase Auth is the likely answer for a unified suite.

3. **Lead ingestion** — does every client site post leads to a shared Sorted Supabase instance (multi-tenant), or does each client get their own Supabase project? Multi-tenant is simpler to maintain; per-client is cleaner for data isolation.

4. **Sorted Data scope at launch** — Google sources only (GA4 + Search Console, service account, fast) or include Meta from day one (OAuth, app review, slow)?

5. **Pricing model** — per-feature pricing (prospect finder X/mo, follow-up Y/mo) or tiered plans (Starter/Pro/Enterprise)? Decide before building payable features.

---

## When to Pick This Up

The CRM build should start when:
- The CMS (SortedUpdates) is stable and consistently delivered across client sites
- There's a concrete client need for lead tracking beyond email notifications
- Sorted has enough recurring client relationships to justify the build investment

Until then, this document holds the shape. No speculative building.
