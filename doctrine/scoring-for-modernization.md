# Scoring for Modernization

**Status:** Active doctrine — rebuilt 28.09.2026
**Parent:** Operator Chain
**Purpose:** Define how the Website Analyser scores and qualifies prospects.

---

## The Qualification Gate

A prospect becomes a `qualified_lead` when ALL of these are true:

1. **Poor website** — `opportunity_score ≥ 7` (the modernity gap is the primary signal)
2. **Viable business** — Companies House verified (active, confident name match) OR strong Maps signals (rating ≥ 4.0 AND review count ≥ 20)
3. **Reasonable payback** — `payback_jobs ≤ 25` (jobs needed to recover the £3,000 price)
4. **Not a modern custom build** — a recent Next.js/Framer/Tailwind custom site means someone already invested; disqualify

The gate is computed in `analyser/qualify.py`. The vision model never calculates final scores — it proposes dimensions and signals, Python does the arithmetic. Thresholds are env-tunable (`QUALIFY_*` in `.env`).

Every verdict is stored with `qualification_reasons[]` — a plain-English audit trail of why the prospect passed or failed each gate.

---

## The Scores

### opportunity_score (0–10, primary)

How much improvement is available — the modernity gap. High = bad site = good prospect.

Five dimensions, each 0–2, scored by the vision model from **desktop (1280px) and mobile (390px)** screenshots plus the technology profile:

| Dimension | Measures |
|---|---|
| `visual_modernity` | Does it look built in the last 2–3 years? |
| `mobile_experience` | The actual mobile screenshot — evidence, not inference |
| `desire_creation` | Does it make you want to buy, not just understand? |
| `content_structure` | Does information guide a visitor to conversion? |
| `trust_and_credibility` | Does the presentation prove the business is real? |

The dimensions measure quality (0 = worst). Opportunity is the inverse:

`opportunity_score = 10 − sum(dimensions)` — high = big gap = good prospect.

### site_score (0–10)

`site_score = sum(dimensions) = 10 − opportunity_score` — the site's **quality** as shown to the prospect on their review page. A low displayed score is the diagnosis; the mockup is the fix.

### business_quality_score (1–10)

Would this business plausibly pay £3,000 and earn it back? Established trading history, high-value jobs or recurring revenue, visible demand, clear commercial model raise it. New/dead/hobby-scale or locked-franchise lower it.

### prospect_score (0–10, blended)

```
prospect_score = opportunity_score × 0.6 + business_quality_score × 0.4
```

The website gap is the primary signal. Business quality filters out businesses not worth approaching even with a terrible site.

---

## Price Point and Payback

The model estimates `service_price_point` — the typical GBP value of one job/booking/project for that business, from category plus any pricing visible on the site.

```
payback_jobs = ceil(3000 / service_price_point)
```

An extension builder (~£40k jobs) pays back a £3,000 site with one job. A barber (~£30/cut) needs ~100 cuts. This makes affordability legible without needing Companies House turnover figures.

---

## Technology Profile

Every prospect's homepage HTML + headers are fingerprinted:

- **`site_platform`** — wix / wordpress / squarespace / shopify / webflow / nextjs / etc. Signature rules cover ~95% of UK local business sites; `python-Wappalyzer` (free, open-source fingerprint DB) enriches with frameworks, analytics and libraries.
- **`site_age_signal`** — copyright year, generator meta, jQuery version → `site_built_estimate` (e.g. "pre-2016", "2019 or earlier").
- A modern custom build (`is_modern_custom`) disqualifies the lead regardless of visual score.

"Your site is a Wix template with a 2017 copyright footer" is a stronger outreach line than any visual judgement.

---

## Companies House Viability

For each prospect the analyser searches Companies House by name (+ postcode boost), then pulls the company profile and filing-history metadata:

- `ch_status` — active / dissolved / dormant
- `ch_incorporated_date` — years trading
- `ch_accounts_type` — micro / small / abridged / full / dormant
- `ch_accounts_last_date` — most recent accounts filing
- `ch_match_confidence` — high / medium / low (name-similarity + postcode)

Verified = `active` status AND `high`/`medium` match confidence. Prospects sourced from `new-business-finder` already carry `source_company_number` — verification skips straight to the profile.

**Deliberately manual:** actual turnover. Most targets file micro-entity accounts that hide revenue. The dashboard links directly to the CH filing-history page — eyeballing revenue on a pre-filtered shortlist is ~30 seconds per lead.

---

## Outputs

### Internal (prospects table)

Scores, dimensions, `site_analysis`, `site_weaknesses[]`, `outreach_angle`, `business_type`, `service_price_point`, `payback_jobs`, tech profile, CH fields, `qualified_lead`, `qualification_reasons[]`.

### Prospect-facing (`review_summary`)

Written for the business owner — second person, plain English, advisory tone, no jargon, no em-dashes. Rendered on `sortmydigital.site/workspace/[slug]` which exists automatically via the `review_slug` trigger once analysis is written.

---

## The Modernisation Gap

The score is the diagnosis, not the product. A poor score surfaces opportunity leakage: visitors who left, enquiries that never came, competitors who looked more credible. The review page makes the gap visible; the mockup makes the fix tangible.
