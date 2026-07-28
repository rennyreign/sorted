# Prospect Finder Operator

Sorted's acquisition operator. Searches Google Maps for UK small businesses, qualifies them by website and email presence, and writes structured prospect records to Supabase — without a human in the loop.

## What It Removes

Manual Google Maps research: searching categories, clicking listings, copying name/website/email/phone into a spreadsheet. That workflow is gone.

## What It Produces

A `prospects` table in Supabase — one row per qualified business, deduped by Google place ID, with website, email, phone, address, category, and qualification status.

## Status

Production-ready. Python 3.x. Apify Google Maps Scraper. Supabase storage.

## Targeting Standard

Prospect Finder defaults to **Scenario 2, Tier A — High-Value Project Buyers** from [`doctrine/priority-manufacturing-categories.md`](../../doctrine/priority-manufacturing-categories.md). The active categories are builders, general contractors, extension specialists, loft conversion companies, kitchen and bathroom fitters, roofers, window and door installers, landscapers, and driveway companies.

Use this as the default acquisition focus. Change category priorities only when the commercial goal changes and record the corresponding doctrine scenario in `implementation/config.py`.

---

## Setup

```bash
cd implementation
cp .env.example .env
# Fill in APIFY_API_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_KEY
make setup
make test
```

## Run

```bash
make run
```

Runs all configured search queries from `config.py` and writes results to Supabase.
Safe to re-run — upserts on `place_id`, no duplicates.

## Configure

Edit `config.py` to change:
- `SEARCH_QUERIES` — list of `{category, location}` pairs to search
- `MAX_RESULTS_PER_QUERY` — how many results to request per query (default: 40)
- `QUALIFYING_CATEGORIES` — business types to include

## Docs

- `brief.md` — original operator build brief
- `docs/experience-artifact.md` — what this build taught us

---

## The Operator Test

> If the human must be present during execution, it is not an operator.

Renaldo is not present when this runs. The output arrives in Supabase. That is the point.
