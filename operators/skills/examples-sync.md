# Examples Sync Operator

Keeps the public examples grid on `sortmydigital.site/examples` in sync with mockups generated in the Sorted pipeline.

## Purpose

The examples grid is a marketing asset. It shows two things:

1. **Live websites** — Sorted deliveries that have gone live.
2. **Recent mockups** — mockups sent to prospects, demonstrating how active Sorted is at connecting with small businesses.

Every mockup is an artifact. This operator turns those artifacts into public proof of work.

## When to run

Run this operator whenever:

- A new batch of mockups has been generated.
- A prospect moves to `paid` in the CRM and their site goes live.
- You want to refresh the marketing grid with the latest pipeline output.

## How to run

Sync from the CRM pipeline (prospects with mockups):

```bash
curl -X POST https://sortmydigital.site/api/examples/sync \
  -H "Authorization: Bearer $SORTED_API_TOKEN"
```

Sync from the Supabase Storage `mockups` bucket:

```bash
curl -X POST https://sortmydigital.site/api/examples/sync-storage \
  -H "Authorization: Bearer $SORTED_API_TOKEN"
```

Or trigger from the operator dashboard.

## What it does

### Pipeline sync (`/api/examples/sync`)

1. Queries the `prospects` table for records where `mockup_url` is not null.
2. Maps each prospect to an `examples` row:
   - `business_name` → `prospects.name`
   - `image_url` → first `mockup_urls` value, or `mockup_url`
   - `category` → `prospects.category`
   - `type` → `live` if `crm_status = 'paid'`, otherwise `mockup`
   - `live_url` → null unless manually set
3. Upserts into `examples` on `prospect_id`.

### Storage sync (`/api/examples/sync-storage`)

1. Lists all image files in the Supabase Storage `mockups` bucket.
2. Generates a public URL for each file.
3. Derives a business name from the filename.
4. Inserts each image into `examples` as a `mockup`, keyed by `storage_path`.

## Manual live URL updates

When a paid site goes live, update the example row:

```sql
update examples
set type = 'live', live_url = 'https://gbhalesowen.com'
where prospect_id = 123;
```

This links the example card directly to the live site.

## Schema

See migration:
`supabase/migrations/20260623000000_create_examples_table.sql`

## Source of truth

- `prospects` table: the pipeline source.
- `examples` table: the marketing destination.

This operator is a one-way sync: prospects → examples.
