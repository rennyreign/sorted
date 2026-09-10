---
name: sorted-ad-review
description: Provision, configure, populate, upgrade, or QA Sorted Ad Review portals for client advertising approvals. Always use this skill when a client needs an /ads portal, campaign approval board, ad review link, or visual changes to the review experience. The Edgbaston Tuition Centre portal is the mandatory interface standard. Never create a separate client-specific portal UI and never use this workflow to publish ads to Meta or Google.
---

# Sorted Ad Review

Build and operate one uniform approval product, not a collection of client-specific portals and not an ad-platform publisher.

Before acting, read [the product doctrine](references/doctrine.md) and [the interface standard](references/interface-standard.md). When creating or ingesting a campaign, also read [the campaign contract](references/campaign-contract.md).

## Canonical rule

Treat the live Edgbaston Tuition Centre `/ads/` portal as the visual and interaction acceptance benchmark. The maintained reusable implementation is `apps/ad-review/` in the Sorted repository.

Do not redesign, reinterpret, simplify, reskin, or locally recreate the portal in a client repository. A client site may own only the thin `/ads/` transport required to display the central tenant workspace. All tenants use the same view layer, design tokens, typography, component geometry, hover states, responsive behavior, terminology, icons, and review interactions.

## Choose the mode

- **Provision:** install the one-time `/ads` route after the central service has a production origin and a registered tenant.
- **Create or revise:** prepare a structured campaign package, validate it, then send it through the authenticated ingestion interface. Never commit campaign data to the client site.
- **QA:** compare the tenant portal against the Edgbaston standard and verify access, tenant isolation, campaign hierarchy, exact-revision approval, comments, persistence, responsive layout, hover/focus states, and `noindex` behavior.
- **Upgrade:** change `apps/ad-review/` once. Do not create tenant-specific UI forks. Change client route configuration only when the central route or origin changes.

## Provisioning rules

Inspect the target repo and deployment provider first. Work on a feature branch and never push directly to `main`. Use the canonical installer with the production Hostinger origin:

```bash
node scripts/install-sorted-ad-review.mjs \
  --target ../client-repo \
  --slug client-slug \
  --portal-origin https://sortmydigital.site/ad-previewer \
  --dry-run
```

Review the dry run, rerun without `--dry-run`, build the client site once, and use a deploy preview. Later campaign changes and central interface upgrades must not trigger client-site builds. Hostinger owns the shared application; Netlify serves only the existing client route.

If a framework adapter rewrites an external proxy incorrectly, use a full-viewport iframe route to the tenant URL instead. The iframe must have no decorative wrapper, no duplicate header, no client-local styling, `width:100%`, `min-height:100dvh`, and `border:0`. This is transport only; the central portal remains the sole interface.

Do not provision when the central service, tenant record, or secure access path is missing. Do not embed service credentials, database keys, campaign content, or a copied portal component in the client repository.

## Interface rules

Before changing portal UI:

1. Open the Edgbaston reference at desktop and mobile widths.
2. Read `references/interface-standard.md`.
3. Change the central app only.
4. Run the static contract tests and browser QA.
5. Compare both portals at matching viewports before deployment.

Reject changes that introduce a second design system, different product name, alternate font stack, tenant-specific card treatment, inconsistent hover state, missing review-history dialog, or divergent responsive behavior.

## Campaign rules

The agent harness is the creation surface. Validate its output before ingestion. Keep IDs stable, revisions immutable, and creative object keys content-addressed or immutable. Verify claims and destination URLs before requesting approval. Keep internal notes out of the client response.

Concept approval and ad approval are separate. Reopening a concept appends an `awaiting_review` event. A changed fingerprint cannot inherit an earlier approval. Ingestion must be idempotent by tenant, campaign ID, and revision.

## Completion

Report the client route, central tenant slug, central application version, environment tested, authentication model, and whether ingestion is configured. Include desktop and mobile parity results against Edgbaston. Never describe a static seed or unconfigured endpoint as a working shared portal.
