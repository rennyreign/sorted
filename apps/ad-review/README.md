# Ad previewer

Ad previewer is Sorted's central, multi-tenant advertising approval product. The client-facing name is exactly **Ad previewer**.

Production origin: `https://sortmydigital.site/ad-previewer`

Client sites install one reverse proxy from `/ads/` to `/ad-previewer/portal/<tenant>/`. Campaign creation, revisions and decisions then use the central database and do not rebuild client sites.

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
