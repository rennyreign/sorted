# Website Analyser Operator

Sorted's acquisition analysis + qualification operator. Takes unanalysed prospects from Supabase and runs the full viability pipeline — no human in the loop:

1. **Tech profile** — fetches homepage HTML/headers, fingerprints the platform (Wix/WordPress/Squarespace/custom) via signature rules + `python-Wappalyzer`, and estimates build age from copyright year, generator meta and library versions
2. **Screenshots** — desktop (1280px) + mobile (390px) via ScreenshotOne (Playwright fallback)
3. **Vision analysis** — dimension scores, business signals, price-point estimate, `review_summary`, `outreach_angle`
4. **Companies House** — name+postcode match → profile, officers/PSCs, filing state and conservative iXBRL fact extraction
5. **Qualification gate** — all arithmetic in `analyser/qualify.py` → `qualified_lead` boolean + `qualification_reasons[]`

## What It Removes

Manual screenshot → custom GPT → score → Companies House lookup → decide. That loop is gone. Open the dashboard, filter **Qualified leads**, and copy the workspace link.

## What It Produces

Per prospect row (full list in `supabase/migrations/20260928180000_prospect_viability.sql`):

- `site_score` — site **quality** 0–10 (low = bad site = good prospect; shown on review page)
- `opportunity_score` — modernity gap 0–10 (high = big gap)
- `prospect_score` — blended `opportunity×0.6 + business×0.4`
- `service_price_point` + `payback_jobs` — affordability vs the £3,000 price
- `site_platform`, `site_built_estimate`, `tech_stack` — what it was built on and roughly when
- `ch_status`, accounts/confirmation dates and overdue flags, SIC codes, officers, filing links and match confidence
- explicit iXBRL facts when disclosed: turnover, net assets, current assets, cash, liabilities and employee count, including prior-period values in `ch_financial_facts`
- `qualified_lead` + `qualification_reasons` — the gate verdict with audit trail
- `site_analysis`, `site_weaknesses`, `review_summary`, `outreach_angle` — copy for the review page and outreach

The review page at `sortmydigital.site/workspace/[slug]` exists automatically — `review_slug` is generated on insert.

## Status

Production-ready. Python 3.x. Vision model via `ANALYSER_MODEL` (default `claude-haiku-4-5-20251001`). ScreenshotOne API. Companies House API (free key).

## Scoring doctrine

`doctrine/scoring-for-modernization.md` is the source of truth. The model proposes; Python computes.

## Setup

```bash
cd implementation
cp .env.example .env
# ANTHROPIC_API_KEY or OPENAI_API_KEY — required
# SUPABASE_URL, SUPABASE_SERVICE_KEY — required
# SCREENSHOT_API_KEY — optional (playwright fallback)
# COMPANIES_HOUSE_API_KEY — optional but recommended (free at developer.company-information.service.gov.uk)
make setup
make dry-run
```

## Run

```bash
make run                                   # Analyse all prospects where analysed_at IS NULL
make analyse URL=https://example.com       # Single URL, prints full record JSON, no DB write
make dry-run                               # No DB writes
./venv/bin/python main.py --no-ch          # Skip the Companies House step
./venv/bin/python main.py --ch-only --id 1826 --dry-run  # Preview one CH refresh
./venv/bin/python main.py --ch-only --limit 25            # Refresh qualified matches, no model calls
```

Safe to re-run — only unanalysed prospects are processed.

## Cost

~$0.004/analysis (Claude Haiku vision, two screenshots). ScreenshotOne $17/mo covers ~1,000 prospects at 2 captures each. Companies House API is free.

## Disclosure boundary

The analyser extracts only numeric facts explicitly present in Companies House iXBRL. Most current micro-entity filings omit turnover and profit-and-loss information, so those values remain “not publicly disclosed.” It never infers revenue from assets, cash, reserves, company-size thresholds or narrative accounting policies.

---

## The Operator Test

> If the human must be present during execution, it is not an operator.

Renaldo is not present when this runs. Qualified leads arrive in Supabase. That is the point.
