---
name: sorted-ad-review
description: Provision, configure, populate, upgrade, or QA Sorted Ad Review portals for client advertising approvals. Use when a client needs an /ads portal or an agent-created campaign must be prepared for client review; do not use for publishing ads to Meta or Google.
---

# Sorted Ad Review

Build and operate the approval layer, not an ad-platform publisher.

Before acting, read [the product doctrine](references/doctrine.md). When
creating or ingesting a campaign, also read
[the campaign contract](references/campaign-contract.md).

## Choose the mode

- **Provision:** install a one-time `/ads` proxy in a client repo after the central
  service has a production origin and a registered tenant.
- **Create or revise:** prepare a structured campaign package, validate it, then send it
  through the authenticated agent-ingestion interface. Never commit campaign data to the
  client site.
- **QA:** verify access, tenant isolation, campaign hierarchy, exact-revision approval,
  comments, persistence, responsive layout and `noindex` behaviour.
- **Upgrade:** update the central product once. Change client proxy configuration only
  when the route or central origin actually changes.

## Provisioning rules

Inspect the target repo and its deployment provider first. Work on a feature branch;
never push directly to `main`. For Netlify, use the canonical installer with an explicit
tenant slug and portal origin:

```bash
node scripts/install-sorted-ad-review.mjs \
  --target ../client-repo \
  --slug client-slug \
  --portal-origin https://ads.sortmydigital.site \
  --dry-run
```

Review the dry run, rerun without `--dry-run`, build the client site, and use a deploy
preview. Provisioning is the one client-site build expected by this product. Campaigns
and review decisions must not trigger later client-site builds.

Do not provision when the central service, tenant record or secure access path is
missing. Do not embed service credentials, shared database keys or campaign content in
the client repository.

## Campaign rules

The agent harness is the creation surface. Validate its output before ingestion. Keep
IDs stable, revisions immutable and creative object keys content-addressed or immutable.
Verify claims and destination URLs before requesting approval. Keep internal notes out
of the client response.

Concept approval and ad approval are separate. A changed fingerprint cannot inherit an
earlier approval. Ingestion must be idempotent by tenant, campaign ID and revision.

## Completion

Report the client route, central tenant slug, environment tested, migration or installer
version, authentication model and whether live ingestion is actually configured. Never
describe a static seed or unconfigured endpoint as a working shared portal.
