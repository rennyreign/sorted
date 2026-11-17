# Sorted — Business Handoff & Overview

Last updated: 17 November 2026. Sources: `AGENTS.md`, `doctrine/`, and the current codebase.

---

## What Sorted is

**Sorted is one business modernisation brand**, operated by ADX Engine. Public home: `sortmydigital.site`.

Core promise: *"We make good businesses more capable."* We modernise how local businesses win customers and get work done — better digital systems, less unnecessary work, more capacity to grow.

The front door is the **switchboard** at `/`: *"Where's your business getting stuck?"* — three cards route each visitor to the service that matches their problem:

1. **"We need more people finding us"** → `/websites` (the website service)
2. **"People look, but don't get in touch"** → `/what-else-we-do` (customer acquisition & conversion)
3. **"We get enquiries. Keeping up is the problem"** → `/automation` (AI automation services)

### The value model

Sorted makes a business **easier to trust, easier to contact, easier to buy from, and easier to run** — the four pillars: Trust, Enquiries, Customers, Operations. Every significant offer names its value, the gap it addresses, and how improvement is observed. Canonical doctrine: `doctrine/sorted-value-model.md`.

### The reversed product cycle (the commercial hook)

For websites, Sorted **builds first, shows the client the finished page, then quotes** — "We build your first page free. Decide whether to take it further." Client CTA everywhere: **"Get your free site."** Payment splits: 50% on approval, 50% at launch.

Current public pricing (`lib/market-pricing.ts` → `WEBSITE_MARKETING_PRICING`):

| Market | Total | Deposit | Balance |
|---|---|---|---|
| UK | £999 | £499.50 | £499.50 |
| US | $1,299 | $649.50 | $649.50 |

Prices are fixed commercial prices, not FX conversions. A market selector (`UK · £` / `US · $`) in the header drives all `{total}`/`{deposit}`/`{balance}` tokens via `MarketCopy`; auto-detects by country IP (`api.country.is`), persists via `localStorage`, and `?market=US` links work for outreach. Historic workspace default remains £3,000/$3,500 for pre-existing quotes; a US friend/referral landing (`us_free_website`) carries a $2,000 offer.

---

## Experience map — everything front-facing

### 1. Website service (`/websites`)

Black-on-paper design system with `#dfff00` lime accent (own font set in `app/sites/_components/SitesPrimitives.tsx`).

| Route | Purpose |
|---|---|
| `/websites` (alias `/sites`) | Service homepage: hero, proof, reviews (Google), portfolio, pricing block, CTA |
| `/howitworks` | The build-first process explained |
| `/pricing` | £999/$1,299 fixed package, what's included, FAQs |
| `/examples` + `/examples/[slug]` | Portfolio gallery of manufactured mockups |
| `/what-else-we-do` | Customer acquisition & conversion offer (offer, proof, discovery, contact, tracking) |
| `/website-updates` | Explains the included content editor (SortedUpdates) |
| `/about`, `/terms`, `/privacy` | Company pages |
| `/free-website` | US-specific landing ("before you spend a dollar"), feeds the referral offer |
| `/review`, `/review-next` | Prospect review flows |

The website CTA opens a mockup-request modal (`SitesMockupModal`) that writes a `prospects` row to Supabase with market/currency/landing_page context.

### 2. Automation service (`/automation`)

Separate visual system (v4 module CSS: ink/forest/lime, `V4Nav`), positioned as "AI automation services and the three operators". 

| Route | Purpose |
|---|---|
| `/automation` | Operators homepage ("Find Your Leaks" diagnostic CTA) |
| `/automation/how-it-works` | The diagnostic → operator model |
| `/automation/pricing` | Automation pricing page |
| `/automation/about` | About us (automation nav) |
| `/automation/demo` | **Unlisted/noindex** — operator demo not yet public |
| `/v4/*` | Legacy URL compat (redirects to `/automation` at Hostinger) |
| `/v2`, `/ops` | Older operations pages, preserved as compatibility routes |

Commercial model: scoped operational-improvement offer; no invented retainer — ongoing support only agreed for a defined need.

### 3. Partners hub (`/partners`)

Referral channel: **partners earn £75–£300 per website referred**.

| Route | Purpose |
|---|---|
| `/partners` | Public pitch: how referral works |
| `/partners/apply` | Partner application |
| `/partners/login` (+ forgot/reset) | Affiliate auth (`lib/affiliateAuth.ts`) |
| `/partners/dashboard` | Submit mockup requests, track referrals, view earnings |
| `/partners/what-you-earn` | Commission tiers |
| `/partners/selling-sorted` | Sales playbook ("show first") |
| `/partners/enterprise`, `/partners/enterprise-deck` | Enterprise partner briefing on the manufacturing infrastructure |

Backed by Supabase `affiliates` + `affiliate_payouts` tables.

### 4. Presentation decks

- `/outreach-deck` — "The Sorted Outreach System": how Sorted finds prospects, manufactures proof, and gets to a clear yes/no. Used in outreach.
- `/partners/enterprise-deck` — private enterprise briefing deck.

### 5. Sorted OS (`/sorted-os`)

"The operating handbook for Sorted Global" — strategy, doctrine, offers, operators, and the factory system rendered as a browsable page. The single source for how the whole machine fits together.

### 6. Prospect Finder (`/operators/prospect-finder`)

Internal operator dashboard sourcing UK small-business prospects (Google Maps data). Part of the **acquisition chain**: `prospect-finder → website-analyser → [human cherry-picks] → mockup → build chain`. Default targeting: high-value project buyers (`doctrine/priority-manufacturing-categories.md`). Related operator dashboards: `/operators/costs`, `/operators/scorecard`.

Supporting operators (in `operators/`): `contact-enricher`, `email-enricher`, `owner-identifier`, `outreach-sender`, `website-lead-sender`, `new-business-finder`, `ga4-sync`, `example-uploader`, `modernisation-assessment`.

### 7. SortedUpdates — the client's CMS

Every delivered website ships with **SortedUpdates**: a Decap-based CMS (`templates/sorted-studio`) giving the client control of all content, a walkthrough video, and a factory-reset key held by Sorted. Client owns content; Sorted owns design/code/reset.

Portal routes: `/sorted` (chat/history/preview/reset), `/sorted-updates` (public explainer), `/updates`. Stage 2 only — applied *after* the client approves the build ("Nod 2").

### 8. Ads workspace (`/ads`, `/ad-review`)

Client-facing ad approval portal — one portal, account selector per client; campaign boards where clients review/approve ad creative. For review only — never publishes to Meta/Google. Skill: `.devin/skills/sorted-ad-review`.

### 9. Client delivery surfaces

| Route | Purpose |
|---|---|
| `/workspace?slug=<client>` | Live client workspace: next steps, proofs, acquisition tracking, payments |
| `/clients/[slug]` | Password-protected "You've Been Sorted" delivery/quote page + service agreement |
| `/proposals/[slug]` | Pre-delivery proposal (mockup + brief before payment) |
| `/api/*` | routes for costs, operators, gmail, outreach, price, review, sorted-updates, updates |

### 10. The manufacturing chain (the back office)

`operators/skills/` holds the skill contracts; `doctrine/operator-chain.md` is the state contract:

- **Intake → asset registry → frontend-builder → visual QA → workspace handoff → CMS → launch QA**
- Runs as an orchestration agent (default) or discrete CLI pipeline (scale). Same artifacts either way.
- ChatGPT supplies mockups/design-IR/imagery; mockup-deconstructor and asset-generator are dormant fallbacks.
- Scaffold for new client sites: `templates/client-site`, `client-operator-line`, `gym-site`, `property-site`, `client-agreement`, `sorted-tracking`, `sorted-studio`, `sorted-ad-review`.

---

## Tech & operations

- **Stack**: Next.js 16 (static export, `out/`), React 19, Tailwind, `lucide-react` icons, `next/font/local` custom fonts. Minimal deps: `@supabase/supabase-js`, `lucide-react`, `next`, `react`, `react-dom`.
- **Backend**: Supabase project `qweevancxedkkfxysnzq` — `prospects`, `affiliates`, `agreements`, `prospect_*`, `workspace_events`, `sorted_changes`, `sorted_messages`, `client_progress`, `onboarding_progress`.
- **Deploys**: `sortmydigital.site` deploys via GitHub Actions → FTP (Hostinger), plus a daily 06:00 UTC rebuild keeping the examples gallery fresh (`.github/workflows/deploy.yml`). Client sites deploy to **Netlify** (static `out/`) — feature branches get free Deploy Previews; **never push client work straight to `main`** (credit protection, see `doctrine/cascade-deployment-discipline.md`).
- **Scheduled jobs** (`.github/workflows`): prospect-finder, website-analyser, new-business-finder, contact/email-enricher, outreach-sender, website-lead-sender, ga4-sync, ad-previewer builds.
- **Design systems per surface**: website service = paper/lime editorial; automation = v4 ink/forest module CSS; internal/client surfaces = strict monochrome Sorted design system (see `AGENTS.md`). Market pricing is localised, not converted.
- **Tests**: `node --test lib/*.test.mjs` (market pricing, finder model); `npm run lint`, `tsc --noEmit`.

## Excluded per request

Agency campaign production (`/agencies`) — public but a secondary audience.

## Still true / worth knowing for a handover

- The brand is deliberately plain-spoken: "constructive confrontation — honest but fair; we don't sell, we show" (`doctrine/sorted-brand-voice.md`).
- Everything content-related is editable post-launch via SortedUpdates (`doctrine/all-content-is-editable.md`).
- `docs/` contains deeper references: `sorted-overview.md`, `sorted-operating-model.md`, `sorted-platform-suite.md`, `us-market-pricing.md`, `2026-11-sorted-entry-and-offers.md` (current offer doctrine).
- The `.devin/` directory carries session rules, workflows (e.g. `add-decap-cms`), and skills; `.devin/session-logs/` is rolling 21-day session memory.
