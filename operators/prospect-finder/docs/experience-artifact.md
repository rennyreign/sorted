# Experience Artifact — Prospect Finder

**Operator:** prospect-finder  
**Status:** *(fill after first production run)*  
**Completed:** *(date)*

---

## What This Build Taught Us

*(Fill after running in production)*

---

## What Worked Well

- 
- 

---

## What Was Harder Than Expected

- 
- 

---

## API Notes

### Apify — compass/crawler-google-places

- Actor ID: `compass~crawler-google-places`
- Synchronous run endpoint: `/v2/acts/{actorId}/run-sync-get-dataset-items`
- Email is returned inconsistently — check `email`, `emails[]`, and `contactInfo.email`
- `placeId` is the reliable dedup key
- `totalScore` is the rating field (not `rating`)
- `reviewsCount` is the review count field
- Typical runtime: 30–90s for 40 results

### Supabase — PostgREST upsert

- Upsert via POST with `Prefer: resolution=merge-duplicates`
- On conflict column: `place_id`
- `updated_at` auto-maintained by database trigger

---

## Reusable Patterns

The following patterns from this build are worth extracting to `adxEngine/patterns/`:

1. **Apify synchronous run pattern** — `run-sync-get-dataset-items` endpoint + timeout handling
2. **Supabase PostgREST upsert batch pattern** — 50-record batches, conflict resolution
3. **UK postcode extraction from address string** — regex pattern in `filters.py`

---

## What the Next Operator in This Chain Needs

The Prospect Finder produces records with `status = 'prospect'`.

The next operator (Outreach Operator — not yet built) should:
- Query prospects where `status = 'prospect'` and `qualified = true`
- Generate a personalised outreach email or WhatsApp message
- Update `status` to `'contacted'` after sending
- Log the outreach in a separate `outreach_log` table

---

## Cost Notes

*(Fill after first run)*

- Apify credits consumed per run: 
- Supabase write ops per run: 
- Estimated monthly cost at N runs/week: 
