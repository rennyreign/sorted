# Skill: Website Analyser

**When to use:** When asked to score, analyse, or assess a prospect's existing website — either from a URL or a screenshot — as part of the Sorted acquisition pipeline.

**Canonical implementation:** `operators/website-analyser/implementation/`. This skill describes the same pipeline for orchestration-agent (manual) execution. **Scoring doctrine:** `doctrine/scoring-for-modernization.md`.

---

## What this skill does

Analyses an existing business website and produces:

1. Dimension scores → `opportunity_score` (0–10; HIGH = bad site = good prospect)
2. `business_quality_score` (1–10) and `service_price_point` (typical job value, GBP)
3. A technology profile — platform + build-age estimate
4. `site_analysis`, `site_weaknesses`, `review_summary`, `outreach_angle`

All arithmetic is then computed deterministically:

```
site_score        = sum(5 dimensions, each 0–2)   # site QUALITY (prospect-facing)
opportunity_score = 10 − site_score                # modernity gap
prospect_score    = opportunity × 0.6 + business × 0.4
payback_jobs      = ceil(3000 / service_price_point)
```

Never let the model compute final scores — it proposes dimensions, you compute.

## The qualification gate

`qualified_lead = true` when ALL hold:

- `opportunity_score ≥ 7`
- Companies House verified (active + confident name match) OR Maps signals (rating ≥ 4.0, ≥ 20 reviews)
- `payback_jobs ≤ 25`
- Not a modern custom build (Next.js/Framer/Tailwind site = already invested)

---

## Steps

### 1. Technology profile

Fetch the homepage HTML + headers. Identify:

- **Platform** from signatures: `wixstatic.com` → Wix, `wp-content/` → WordPress, `squarespace.com` → Squarespace, `cdn.shopify.com` → Shopify, `data-wf-` → Webflow, `__NEXT_DATA__` → Next.js, `wsimg.com` → GoDaddy, `weebly.com`, `dudamobile.com`, `jimdo.com`, `site123.com`
- **Age signals**: `<meta name="generator">`, footer copyright year, jQuery version (1.x/2.x = pre-2016)
- `site_built_estimate`: label like "pre-2016", "2019 or earlier", or null

### 2. Screenshots

Capture above-the-fold at **1280px desktop AND 390px mobile** (ScreenshotOne or Playwright). The mobile shot is required — `mobile_experience` is scored on evidence.

### 3. Dimension scores (0–2 each)

**visual_modernity** — 0: pre-2016 look | 1: functional but generic template | 2: genuinely modern, designed
**mobile_experience** — 0: broken on the 390px shot | 1: usable but awkward | 2: clearly designed for mobile
**desire_creation** — 0: purely informational | 1: default local-business site | 2: rare, real emotional pull
**content_structure** — 0: one long brochure | 1: sections exist but key content buried | 2: conversion-optimised journey
**trust_and_credibility** — 0: nothing proves it's real | 1: weak signals | 2: real photos, reviews, team

### 4. Business signals

- `business_quality_score` 1–10: established, high-value work or recurring revenue, visible demand, clear commercial model. Never above 7 for new/failing/franchise-locked businesses.
- `service_price_point`: typical GBP value of ONE job for this category (extension builder ~£40k, kitchen fitter ~£8k, salon ~£60). Never 0 — estimate from category if the site lacks pricing.

### 5. Copy

- `site_analysis`: 2–3 sentences, internal. Name the actual problems, not "looks dated".
- `site_weaknesses[]`: specific, actionable strings.
- `review_summary`: prospect-facing. Second person, plain English, advisory, no jargon, no em-dashes. Make them feel the cost.
- `outreach_angle`: one sentence, references something visible and specific. Forbidden: elevate, seamless, transform, next-gen, digital presence, online visibility, leverage.
- `business_type`: inferred type, e.g. "extension builder".

### 6. Companies House check

Search `/search/companies?q={name}`, match by name similarity (≥0.65) + postcode boost, then `/company/{n}` + `/filing-history?category=accounts`. Store status, incorporation date, accounts type, last filing date, match confidence. If no confident match, fall back to Maps signals in the gate. Turnover stays manual — micro-entity accounts don't disclose it; the dashboard links to filing history.

### 7. Qualify and output

Apply the gate, emit the full record:

```json
{
  "opportunity_dimensions": { "visual_modernity": 1, "mobile_experience": 0, "desire_creation": 1, "content_structure": 1, "trust_and_credibility": 0 },
  "site_score": 3,
  "opportunity_score": 7,
  "business_quality_score": 7,
  "service_price_point": 40000,
  "payback_jobs": 1,
  "prospect_score": 7.0,
  "site_platform": "wix",
  "site_built_estimate": "2018 or earlier",
  "ch_status": "active",
  "ch_accounts_type": "micro",
  "ch_match_confidence": "high",
  "qualified_lead": true,
  "qualification_reasons": ["opportunity_score 7/10 ≥ 7 threshold", "Companies House verified (high confidence)", "payback ~1 job (≤ 25 threshold)"],
  "site_analysis": "...",
  "site_weaknesses": ["..."],
  "review_summary": "...",
  "outreach_angle": "...",
  "business_type": "extension builder"
}
```

## Rules

- Score the opportunity, not functional completeness.
- Default dimensions to 1 when evidence is thin — charitable assumptions are not allowed.
- A parked domain or error page: all dimensions -1, note it in `site_analysis`.
- `review_summary` is written for the business owner, not for Sorted.
