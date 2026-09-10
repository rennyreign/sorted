# Sorted Ad Review doctrine

**Status:** Canonical product standard  
**Applies to:** client advertising review portals and agent-created campaigns

## Product boundary

Sorted Ad Review is the client approval layer between campaign creation and eventual platform publishing. It reviews strategy and executions; it does not publish ads.

Use this hierarchy:

`client → campaign → concept → ad → immutable revision → decision events`

Concept approval authorises the strategic direction. Ad approval authorises only the exact copy, creative, CTA and destination represented by that revision. Any material change creates a new fingerprint and requires fresh approval.

## One product, one interface

There is one Sorted Ad Review product. Tenants differ in client identity, campaign data, creative, destinations and decisions. They do not differ in interface design.

The Edgbaston Tuition Centre portal at `https://edgbaston-tuition-centre.netlify.app/ads/` is the visual and interaction acceptance benchmark. The reusable implementation maintained in `apps/ad-review/` must reproduce that benchmark. Edgbaston is not permission to maintain a second implementation indefinitely; it defines the standard the central product must preserve.

Every tenant must share:

- the `Ad Review` product name;
- the same system font stack, weights, type scale and line heights;
- the same paper, deep-green, powder-blue, status and border colors;
- the same top bar, breadcrumbs, campaign rows, progress panel, summary, guide, toolbar, concept sections, ad cards, review controls, footer and details dialog;
- the same hover, pressed, disabled, focus and responsive states;
- the same review history, revision warning, refresh and sign-out behavior.

Do not add client-local styling, duplicate shells, alternate names, per-tenant layouts or visual forks.

## Canonical architecture

Run one multi-tenant Sorted Ad Review application backed by a central database. Do not copy campaign records or portal components into client repositories and do not rebuild a client website when an agent creates or revises a campaign.

The customer-facing URL is `https://clientsitename/ads/`. Install that path once as a reverse proxy or visually transparent full-viewport iframe to the central tenant portal at `https://sortmydigital.site/ad-previewer/portal/client-slug/`. The client route is transport, not a separate product surface.

For a Netlify client site, installing the route requires one intentional deploy. After that, campaign creation, revision, approval and central UI upgrades consume no client-site build credits. Hostinger deployments update the shared application for every tenant.

Keep application state in the central database, not on a server filesystem.

## Creation flow

```text
agent harness
  → structured campaign package
  → deterministic schema and policy validation
  → authenticated server-to-server ingestion
  → central campaign store
  → client campaign index
  → approval event log
```

The agent harness creates strategy, copy, platform metadata, destinations and creative references. It does not edit the client repository. Ingestion uses a service credential, is idempotent, and records agent/run provenance. Draft creation never implies client approval.

## Tenant and access rules

- Resolve the tenant from a server-owned route or signed invitation, never request JSON.
- Store only hashed invitation/access tokens; never expose service keys to the browser.
- Scope every campaign and decision query by tenant on the server.
- Use server timestamps and append-only decision events.
- Preserve earlier revision decisions for audit, but exclude them from current totals.
- Require a comment for `changes_requested`; retain reviewer and revision fingerprint.
- Record `awaiting_review` when an approved concept is reopened.
- Add rate limiting, token expiry/revocation and an access audit before broad rollout.
- Keep internal notes in a separate server-only field or table.

## Data ownership

The central store owns clients, memberships/invitations, campaigns, concepts, ad revisions and decision events. Creative files live in central object storage with immutable keys. The client site owns only the one-time `/ads` route configuration.

Minimum campaign statuses are `draft`, `awaiting_review`, `in_review`, `approved`, `changes_requested`, `rejected` and `archived`. Review decisions are `awaiting_review`, `approved`, `changes_requested` and `rejected`.

## Reusable product source

Canonical product code belongs in the Sorted repository under `apps/ad-review/`. Provisioning and campaign validation belong in `scripts/`. The model-invocable entry point belongs in `.devin/skills/sorted-ad-review/`; the detailed reusable specification belongs in `operators/skills/sorted-ad-review/`.

The Edgbaston implementation is the interface benchmark. Once behavior or styling is accepted there, encode it in the central product and this skill. Never begin another local implementation from scratch.

## Readiness gates

Do not issue or update a live client portal until all are true:

- central origin and database are deployed;
- tenant-scoped authentication is verified;
- agent ingestion is authenticated and idempotent;
- the portal passes the interface contract in `references/interface-standard.md`;
- `/ads` works on desktop and mobile without a duplicate shell;
- two independent reviewers see the same persisted state;
- changed copy or creative invalidates the previous approval;
- the portal is `noindex, nofollow` and absent from public navigation;
- no Meta or Google publishing permission is present in the approval product.
## Human image correction

The harness creates campaigns; named human editors can correct images in the portal.
Use a client-specific media library as the primary selection surface and uploads as a
secondary path. Keep image selection, crop preview and the ad copy visible together.
Photograph crops belong to the ad, not the reusable source asset. Finished artwork
requires a matching aspect ratio; changing text or a photograph inside it requires a
revised source design.

Manual image choices are automatically protected against agent replacement, recropping,
ratio changes and removal. Editors explicitly release protection. Enforce this in the
server/database, not solely in harness instructions. Require a current base revision
and serialize editor, ingestion and decision writes. Retain history, and treat restoring
an old selection as a new revision requiring fresh approval.

Editor credentials are distinct from client reviewer codes and carry a server-owned
name, expiry and revocation state. Client reviewers keep approval/feedback access.
Uploads are private, immutable tenant/hash objects; only authorized library queries
return temporary signed URLs. Never expose service credentials to the browser.
