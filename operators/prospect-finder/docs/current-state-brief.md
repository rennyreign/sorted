# Prospect Finder — Current State Brief

**Purpose of this document:** give a reviewing agent an accurate picture of what the prospect-finder does today — its real behaviour, not its aspirations — so a re-imagined version can be evaluated against it.

**Date:** 2026-10-01 · **Version:** 1.0.0 · **Implementation:** `operators/prospect-finder/implementation/` (Python 3, CLI)

---

## What it does

Prospect Finder is step 1 of the Sorted acquisition chain. It finds local businesses on Google Maps, filters them lightly, and upserts them into the `prospects` table in Supabase. Everything downstream (website analysis, scoring, Companies House, outreach) consumes those rows.

```
Apify Google Maps scrape → light filter → Supabase upsert
                    ↓ (separate operator)
     website-analyser picks up rows where website_exists AND analysed_at IS NULL
```

## Operating structure

- **Runtime:** Python CLI (`main.py`), designed for cron/manual runs. No human presence required.
- **Scraper:** Apify actor `compass~crawler-google-places`, called synchronously (`run-sync-get-dataset-items`), one call per category×location pair. `MAX_RESULTS_PER_QUERY = 40`.
- **Search matrix:** `config.py` holds `CATEGORIES` (10 trade/builder categories — Scenario 2 Tier A "High-Value Project Buyers") × `CITIES`. `ACTIVE_QUERIES` = London only for the nightly run; Dublin, NYC, Toronto, Singapore defined but manual.
- **Filter (`scraper/filters.py`):** a record qualifies if it has a `place_id` AND (a real website OR an email). Google Maps placeholder URLs are correctly rejected as "no website". UK postcode regex-extracted from address.
- **Storage (`storage/supabase.py`):** PostgREST upsert `on_conflict=place_id`, batches of 50. On conflict, only mutable fields update — `first_seen_at`/`place_id`/`run_id` preserved.
- **Record written:** name, category, address, city, postcode, phone, website, email, website_exists, email_exists, qualified flag, rating, review_count, google_maps_url, lat/lon, search_query, search_location, run_id, status='prospect'.
- **Failure semantics:** 0 raw results across all queries = systemic failure → exit 1 (deliberate, so silent scraper outages don't report green). Per-record/per-batch errors tolerated and logged.

## Strengths

- **Simple and honest.** ~500 lines, three modules, config-driven. Adding a category or city is a one-line edit.
- **Idempotent.** Re-runs are safe; upsert semantics are correct and preserve first-seen provenance.
- **Phone capture is already there** — `phone` comes free from the Maps listing.
- **Good failure posture** — distinguishes systemic scraper failure from partial errors; fails loudly.
- **Clean handoff.** The `prospects` table is the single source of truth; downstream operators read it via status flags (`analysed_at IS NULL`), never call the finder directly. True to the state-not-dependency doctrine.
- **Real-website detection** — Maps fallback URLs filtered out, so `website_exists` is trustworthy.

## Weaknesses

- **"Qualified" is meaningless at this stage.** `qualified` just means "has website AND email" — not a quality judgement. The real gate lives downstream in website-analyser (`qualified_lead`). Two different "qualified" concepts with the same word is a naming smell.
- **No dedup beyond place_id.** Same business surfacing under different categories/locations with a different place_id = duplicate rows. No fuzzy name+postcode dedup at intake.
- **No reachability check.** `website_exists` means "Maps listed a URL", not "URL resolves". Dead domains are only discovered downstream (costs a screenshot attempt each — now handled as site-down leads, but the finder doesn't pre-filter).
- **Category taxonomy is thin.** The `category` written is whatever Maps returns (`categoryName`), not the search category — inconsistent values downstream (e.g. payback fallback map keys won't match "General contractor" vs "contractor").
- **No enrichment at intake.** CH matching, social links, employee/size signals all happen later or not at all. The finder writes a skeletal record.
- **Single-source dependency.** Apify only. If the actor changes shape or account lapses, acquisition stops (mitigated only by the systemic-failure alarm).
- **London-hardwired default.** `SEARCH_QUERIES = ACTIVE_QUERIES` = London only; multi-city is config-manual, not a first-class concept.
- **Email-only prospects are write-only.** Rows with email but no website are stored but can never be analysed (`website_exists` filter) — they just sit there.
- **No scoring signal captured at intake.** Rating/review_count are stored but not used to prioritise; every prospect costs a full analysis cycle regardless of obvious disqualifiers.
- **No cost accounting.** No record of Apify credits spent per run.

## Downstream context (state as of 2026-10-01)

- **website-analyser** (merged to main, commit `2c2aba3d`): tech profiling, desktop+mobile screenshots, vision scoring, Companies House match (incl. **officers/PSCs → `owner_name` + `associated_names`**), `qualified_lead` gate.
- **Schema:** `prospects` table has ~87 columns; viability columns + `associated_names` all live. Owner columns (`owner_name`, `owner_email`, etc.) exist; email-enricher consumes `owner_name` to guess emails via Hunter.
- **Backlog:** ~1,169 prospects awaiting (re)analysis — deliberately parked pending this revamp.
- **Dashboard:** `/operators/prospect-finder` renders the table with qualified-lead filter, viability panel, owner display.

## Questions a re-imagined finder should answer

1. Should intake do more? (dedup, reachability, CH pre-match, dedupe against existing rows by name+postcode)
2. Should "qualified" mean something real at intake — or should all viability live in the analyser?
3. Single Apify dependency vs. multi-source (CH new-incorporations feed already exists via `new-business-finder`)?
4. Should categories be normalised to a controlled taxonomy at intake?
5. What does a "clean record" mean — minimal + enriched downstream, or rich at intake?
