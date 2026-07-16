# Owner Identifier Operator

Identifies the business owner for each prospect using Companies House (UK public registry) and website scraping. Writes `owner_name`, `owner_role`, and `owner_source` back to the CRM.

## What It Does

Takes prospects that have a website but no identified owner, and determines who owns or runs the business using two data sources:

1. **Companies House API** (free) — searches by business name, retrieves registered directors/officers
2. **Website scrape** — visits About/Team/Staff pages and extracts names + roles

Companies House is preferred (authoritative registry). Website scraping fills the gap for sole traders and unregistered businesses.

## Pipeline Position

```
Prospect Finder → Website Analyser → Contact Enricher → Owner Identifier → Email Enricher → Outreach
```

## Setup

```bash
cd implementation
cp .env.example .env
# Fill in COMPANIES_HOUSE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
pip install -r requirements.txt
```

### Companies House API Key

Register at https://developer-specs.company-information.service.gov.uk — free, no credit card required.

## Run

```bash
# Identify owners for up to 50 prospects (default)
python main.py

# Dry run (scrape but don't write to DB)
python main.py --dry-run

# Limit to 20 prospects
python main.py --limit 20

# Ad-hoc: search for a single business by name
python main.py --name "Forrest Coffee House"
```

## Output

Writes to `prospects` table:
- `owner_name` — identified owner's full name
- `owner_role` — e.g. "Director", "Founder", "Owner"
- `owner_source` — "companies_house", "website", or "combined"
- `owner_identified_at` — timestamp

## Expected Hit Rate

- UK limited companies: ~70-80% (Companies House covers these well)
- Sole traders / unregistered: ~30-40% (depends on website having an About/Team page)
- Overall: ~50-65% for UK small businesses
