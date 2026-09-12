---
name: sorted-ad-review
description: Provision, configure, populate, upgrade, or QA the Sorted Ads workspace for client advertising approvals. Always use this skill when a client needs an ad campaign board, campaign approval workflow, ad review link, or visual changes to the ads experience. All clients live under one portal at sortmydigital.site/ads/ with an account selector. Never create a separate client-specific portal UI and never use this workflow to publish ads to Meta or Google.
---

# Sorted Ads

Build and operate one uniform ads product under a single portal. Not a collection of client-specific portals and not an ad-platform publisher.

Before acting, read [the product doctrine](references/doctrine.md) and [the interface standard](references/interface-standard.md). When creating or ingesting a campaign, also read [the campaign contract](references/campaign-contract.md).

## Canonical rule

The Sorted Ads workspace at `sortmydigital.site/ads/` is the sole interface. All client accounts (School of Skill, Edgbaston Tuition, etc.) live as tenants within this single portal. An account selector dropdown in the top navigation switches between accounts.

Do not redesign, reinterpret, simplify, reskin, or locally recreate the portal in a client repository. Client accounts are tenants in the central database, not separate deployments. All accounts share the same view layer, design tokens, typography, component geometry, hover states, responsive behavior, terminology, icons, and review interactions.

## Architecture

- **Single portal:** `sortmydigital.site/ads/` serves all accounts
- **Account selector:** dropdown in the top nav switches between tenant workspaces
- **Internal workspace:** Sorted operators use the full `/ads/` interface with campaign management, image editing, crop controls, and asset uploads
- **Client review:** clients receive shared preview links (e.g., `sortmydigital.site/review?tenant=school-of-skill&campaign=...`) with a simple password gate — no login or account required
- **No client portals:** clients never log into the ads workspace; they only receive shared preview links

## Onboarding a new account

To add a new client account to the Sorted Ads workspace, update exactly two files:

1. **Account selector** — `app/ads/components/TenantContext.tsx`
   - Add the new tenant to the `KNOWN_TENANTS` array:
     ```ts
     { slug: "client-slug", name: "Client Name" },
     ```
   - The slug must match the tenant slug registered in the central database.

2. **Review password** — `app/review/page.tsx`
   - Add the new tenant to the `TENANT_PASSWORDS` map:
     ```ts
     const TENANT_PASSWORDS: Record<string, string> = {
       "school-of-skill": "schoolofskill",
       "edgbaston-tuition": "edgbastontuition",
       "client-slug": "clientpassword",
     }
     ```
   - This is the password clients enter to access their shared review link.
   - Share it out-of-band with the client (email, phone, etc.).

No other files need to change. The account selector, campaign loading, asset loading, and review page all read the tenant from context or URL and scope automatically.

## Choose the mode

- **Provision:** add a new tenant account to the central database, then update the two files above
- **Create or revise:** prepare a structured campaign package, validate it, then send it through the authenticated ingestion interface
- **QA:** compare the workspace against the interface standard and verify access, tenant isolation, campaign hierarchy, exact-revision approval, comments, persistence, responsive layout, hover/focus states, and `noindex` behavior
- **Upgrade:** change `apps/ad-review/` once. All accounts inherit the update. No client-site builds required.

## Interface rules

Before changing the workspace UI:

1. Open the Sorted Ads workspace at desktop and mobile widths
2. Read `references/interface-standard.md`
3. Change the central app only
4. Run the static contract tests and browser QA
5. Verify the account selector works across all tenants

Reject changes that introduce a second design system, different product name, alternate font stack, tenant-specific card treatment, inconsistent hover state, missing review-history dialog, or divergent responsive behavior.

## Campaign rules

The agent harness is the creation surface. Validate its output before ingestion. Keep IDs stable, revisions immutable, and creative object keys content-addressed or immutable. Verify claims and destination URLs before requesting approval. Keep internal notes out of the client response.

Named portal editors can select/upload images, adjust photo crops, restore earlier selections and explicitly release protection. Reviewer codes cannot edit. Before each agent revision, GET `api/?action=ingest&campaign_id=<id>` with its ingestion credential. Preserve returned image locks (key, crop, ratio and ad identity), submit `base_revision` and use campaign revision exactly one greater. New campaigns use base 0. Re-read and reconcile HTTP 409 conflicts; never overwrite or recreate a protected ad to bypass them.

Concept approval and ad approval are separate. Reopening a concept appends an `awaiting_review` event. A changed fingerprint cannot inherit an earlier approval. Ingestion must be idempotent by tenant, campaign ID, and revision.

## Client review flow

Clients receive a shared preview link with a simple password gate. They do not log into the ads workspace. The review page shows:

- Campaign name and angle/variant labels
- Ad preview with primary text, headline, description, CTA, and creative image
- Approve / Request change / Reject buttons
- Comment field for change requests
- Status badges showing review progress

The password is tenant-specific and shared out-of-band by Sorted. No account creation, no email, no friction.

## Completion

Report the tenant slug, account selector configuration, central application version, environment tested, authentication model, and whether ingestion is configured. Include desktop and mobile parity results. Never describe a static seed or unconfigured endpoint as a working portal.
