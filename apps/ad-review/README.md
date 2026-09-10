# Ad previewer

Ad previewer is Sorted's central, multi-tenant advertising approval product. The client-facing name is exactly **Ad previewer**.

Production origin: `https://sortmydigital.site/ad-previewer`

Client sites install one reverse proxy from `/ads/` to `/ad-previewer/portal/<tenant>/`. Campaign creation, revisions and decisions then use the central database and do not rebuild client sites.

On the current Hostinger setup, School of Skill and Edgbaston instead embed that tenant
URL in their `/ads/` page: the host's browser checks reject proxy traffic. Use installer
`--mode iframe` for this configuration. Both approaches use the same central product.

## Runtime

- Static interface and PHP API on Hostinger
- Supabase as the central campaign and decision store
- Hashed, expiring and revocable client access codes
- Hashed tenant-scoped agent ingestion keys
- Append-only review decisions tied to immutable fingerprints
- Immutable creative filenames

The Hostinger config lives outside `public_html` at `domains/sortmydigital.site/ad-previewer-config.php`. It is created during deployment from GitHub secrets and is never committed.

## Checks

```bash
npm test
npm run build
npm run check:php
```

## Agent ingestion

```text
POST https://sortmydigital.site/ad-previewer/api/?action=ingest
Authorization: Bearer <tenant-scoped ingestion key>
Content-Type: application/json
```

The campaign package contract is maintained in `operators/skills/sorted-ad-review/references/campaign-contract.md`.

## Manual image editing

Editors see **Change image** on every ad. Choose from the tenant's library, search or
filter collections, upload JPG/PNG/WebP, preview the crop, and save a protected selection.
Uploads are converted to WebP in the browser, validated on the server, and stored under
immutable tenant/hash keys in the private `ad-review-media` Supabase bucket. The API
returns signed image URLs valid for one hour; refresh the board to renew them.

Photographs support horizontal/vertical crop positioning per ad. Finished artwork must
match the ad ratio and is not cropped. Crop coordinates use CSS `object-position`
percentages, not source-image coordinates. A later publisher must reproduce this crop
when producing the platform creative; this product does not publish advertisements.

Saving creates an immutable ad/campaign revision and requires fresh ad approval.
Unchanged ads and concepts keep their fingerprints. History can restore an earlier
image/crop as a new revision. **Allow agent changes** explicitly releases protection.
Protection covers the creative key, crop, ratio and removal of that ad. Edits, agent
ingestion and reviewer decisions serialize through database transactions; stale writes
return HTTP 409 and do not overwrite newer work.

Reviewer access codes cannot edit, upload, unlock or browse unused library assets.
Named editor codes are separately hashed, expiring and revocable. To issue one:

```sh
node --env-file=../../.env.local scripts/create-editor.mjs \
  --slug school-of-skill --name "Renaldo" \
  --expires 2026-12-31T23:59:59Z --output ../../.ad-review/school-of-skill
```

Enter the editor code in the usual access form (use **Switch access** if already signed
in). Editor identity is recorded from the credential, not the editable reviewer name.
Never share the editor code as a client review code.

## Rollout order

1. Apply `supabase/migrations/20260910180000_ad_previewer_editor.sql` after the base
   migration. Existing campaign images seed each tenant's initial library.
2. Deploy the central application with `image-editor.js`, `image-editor.css` and
   `api/editor.php`. No client rebuild is needed for existing central embeds/proxies.
3. Issue editor credentials and check editor/reviewer access separately.
4. Migrate prototype client campaigns and register their tenants before changing routes.

Portal entry points use a content-derived release query on JS/CSS. Imported editor
assets inherit it, so returning reviewers receive updates despite host/CDN caching.

The new agent contract requires **base_revision**: fetch
`GET api/?action=ingest&campaign_id=<id>` using the tenant's ingestion credential,
preserve the returned protected selections, and submit `base_revision` plus a campaign
revision exactly one greater. New campaigns use base 0. Old submissions without a base
are rejected. The endpoint also returns library metadata and image locks.

Database regression tests require a disposable PostgreSQL database with both migrations
applied (and Supabase roles/storage schema). Run with `AD_REVIEW_TEST_DATABASE` and,
optionally, `PSQL_PATH`; `npm test` reports that test as skipped when no database is set.
