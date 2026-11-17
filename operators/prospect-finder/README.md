# Prospect Finder Operator

Sorted's acquisition operator. It discovers UK small businesses, qualifies them by website and email presence, and writes structured prospect records to Supabase. Machine enrichment supplies the external evidence; human scouting adds only a decision and its reason before build work begins.

## What It Removes

Manual Google Maps research: searching categories, clicking listings, copying name/website/email/phone into a spreadsheet. That workflow is gone.

## What It Produces

A `prospects` table in Supabase — one row per qualified business, deduped by Google place ID, with Maps contact data, website analysis, Companies House profile/filing facts, people, and qualification status. The CRM layer adds the scouting decision and activity trail.

## Status

Production-ready. Python 3.x. Apify Google Maps Scraper. Supabase storage.

## Targeting Standard

Prospect Finder's core focus is **Scenario 2, Tier A — High-Value Project Buyers** from [`doctrine/priority-manufacturing-categories.md`](../../doctrine/priority-manufacturing-categories.md), widened at Renaldo's request (2026-10-19) to include non-trades categories for outreach variety. The active categories are the Tier A trades (builders, general contractors, extension specialists, loft conversion companies, kitchen and bathroom fitters, roofers, window and door installers, landscapers, driveway companies) plus urgent-intent trades (plumbers, electricians), fitness and wellness (gyms, personal trainers, yoga studios, beauty/hair/nail salons, barbers), food and hospitality (restaurants, cafes, takeaways, boutique hotels), and professional services (dentists, accountants, solicitors, estate agents, cleaning services).

Change category priorities only when the commercial goal changes and record the corresponding doctrine scenario in `implementation/config.py`.

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

## Research a candidate locally

The Prospect Research skill is the local execution form of the research operator. It is intentionally human-guided and avoids external model calls.

```bash
cd implementation
./venv/bin/python research_harness.py prepare --id 1826
```

See `operators/skills/prospect-research.md` for the evidence and decision contract.

## Configure

Edit `config.py` to change:
- `SEARCH_QUERIES` — list of `{category, location}` pairs to search
- `MAX_RESULTS_PER_QUERY` — how many results to request per query (default: 40)
- `QUALIFYING_CATEGORIES` — business types to include

## Docs

- `brief.md` — original operator build brief
- `docs/experience-artifact.md` — what this build taught us

---

## Runtime model

An operator is the durable capability: defined inputs, evidence rules, decisions, outputs, and audit state. Today, skills and local harnesses execute that capability with human judgment where it matters. At scale, the same contract can be run by an autonomous service or external model without redesigning the operating model.

Discovery is safely automated. Scouting remains human-guided because the decision to invest build effort is commercially consequential.
