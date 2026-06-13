# Prospect Finder Operator — Build Brief

**For:** Sorted / ADX Engine  
**From:** Renaldo  
**Type:** Sorted Operator — Acquisition pipeline, fully autonomous

---

## 1. Operator Name

**Prospect Finder**

---

## 2. Business Outcome

This operator produces a qualified prospect database record for every UK small business found on Google Maps that has a website and/or email address, so that outreach no longer requires a human to manually search, qualify, and record prospects.

---

## 3. Workflow Being Deleted

**The role:** Business development researcher / Renaldo manually searching Google Maps

**Current process:**
1. Open Google Maps
2. Search a category (e.g. "barbers in Birmingham")
3. Click each result
4. Check if they have a website
5. Find their email (usually via website contact page)
6. Copy name, phone, address, website, email into a spreadsheet
7. Mark as "qualified" if website exists and/or email found
8. Repeat for next category / next location

**Tools currently used:** Google Maps (manual), spreadsheet, browser

**Time cost:** 1–2 hours per search session, for a handful of qualified prospects

---

## 4. Current State

Manual. Done by Renaldo when building pipeline. No system. No logging. No dedup. Prospect list lives in a spreadsheet with no consistent schema. Breaks constantly through inattention and context switching.

---

## 5. Trigger

- **Manual run:** `make run` with optional config override
- **Cron-ready:** can be scheduled via crontab once validated
- No human present during execution

---

## 6. Inputs

| Input | Source |
|---|---|
| `SEARCH_QUERIES` | `config.py` — list of `{category, location}` pairs |
| `APIFY_API_TOKEN` | `.env` |
| `SUPABASE_URL` | `.env` |
| `SUPABASE_SERVICE_KEY` | `.env` |
| `MAX_RESULTS_PER_QUERY` | `config.py` (default: 40) |

---

## 7. API / Data Requirements

### Apify — Google Maps Scraper
- **Actor:** `compass/crawler-google-places`
- **Auth:** Bearer token via `APIFY_API_TOKEN`
- **Method:** Synchronous run via Apify REST API (`/v2/acts/{actorId}/run-sync-get-dataset-items`)
- **Rate limits:** Depends on Apify plan; operator handles timeout and retry
- **Data returned:** Business name, address, phone, website, email, rating, review count, place ID, category, coordinates

### Supabase — Sorted project
- **URL:** `https://qweevancxedkkfxysnzq.supabase.co`
- **Auth:** Service role key (full write access)
- **Table:** `prospects`
- **Method:** Upsert on `place_id` — idempotent, safe to re-run

---

## 8. Decision Logic

A record is written to the database if:
- `place_id` is present (dedup key)
- `website` is present OR `email` is present
- Business is in a qualifying UK category (from config)

A record is **not written** if:
- No `place_id` (cannot dedup)
- No website AND no email (not yet contactable — logged as skipped)

`qualified` flag is set to `true` when both website and email are present.

---

## 9. Execution Steps

1. Load config — search queries, filters, API credentials
2. For each `{category, location}` pair in `SEARCH_QUERIES`:
   a. Call Apify Google Maps Scraper actor with `searchStringsArray` + `locationQuery`
   b. Receive list of raw business records
   c. Apply filters — require place_id, require website or email
   d. Map to `prospects` schema
   e. Upsert each record to Supabase (on conflict: update `updated_at`, preserve original `first_seen_at`)
3. Log summary: total found, total qualified, total skipped, total new, total updated
4. Exit cleanly

---

## 10. Outputs

| Output | Description |
|---|---|
| Supabase `prospects` table rows | One row per qualified prospect |
| Terminal log | Run summary — counts and any errors |
| No email sent | This operator sources. It does not outreach. |

---

## 11. Human Judgment Points

None during execution. The operator runs autonomously.

**Post-run human action:** Review the `prospects` table. Choose who to contact. Outreach is a separate operator (not built here).

---

## 12. Failure Modes

| Failure | Handling |
|---|---|
| Apify API down | Log error, skip query, continue with remaining queries |
| Apify returns empty results | Log as zero-result query, continue |
| Supabase connection failure | Log error, exit with non-zero status |
| Malformed record (missing place_id) | Skip record, log warning, continue |
| Auth failure (Apify or Supabase) | Log clearly, exit immediately |
| Rate limit hit | Respect `Retry-After` header, back off, retry once |

---

## 13. Observability

- Python `logging` module — structured logs to stdout
- Log level configurable via `LOG_LEVEL` env var (default: INFO)
- Each run logs: timestamp, query, results found, qualified, skipped, new inserts, updates
- Exit code 0 = success, 1 = fatal error

---

## 14. Acceptance Criteria

- [ ] Operator runs to completion without human input
- [ ] Each qualifying business is written to `prospects` table with correct schema
- [ ] Re-running with same queries does not create duplicates (upsert on `place_id`)
- [ ] Records with no website AND no email are not written
- [ ] Log output shows clear summary of run
- [ ] `.env.example` documents all required variables
- [ ] `make setup && make test && make run` works from a clean clone

---

## 15. Demo Proof

Run the operator against "barbers in Birmingham" and show:
1. Terminal log confirming N businesses found, M qualified
2. Supabase `prospects` table with rows populated
3. Re-run — no duplicates, `updated_at` refreshed

---

## 16. Experience Artifact

*(Fill after build — see `docs/experience-artifact.md`)*
