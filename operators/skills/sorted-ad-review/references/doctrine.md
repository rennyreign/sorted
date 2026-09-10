# Sorted Ad Review doctrine

**Status:** Product foundation  
**Applies to:** client advertising review portals and agent-created campaigns

## Product boundary

Sorted Ad Review is the client approval layer between campaign creation and eventual
platform publishing. It reviews strategy and executions; it does not publish ads.

Use this hierarchy:

`client → campaign → concept → ad → immutable revision → decision events`

Concept approval authorises the strategic direction. Ad approval authorises only the
exact copy, creative, CTA and destination represented by that revision. Any material
change creates a new fingerprint and requires fresh approval.

## Canonical architecture

Run one multi-tenant Sorted Ad Review application backed by a central database. Do not
copy campaign records into client repositories and do not rebuild a client website when
an agent creates or revises a campaign.

The customer-facing URL is `https://clientsitename/ads/`. Install that path once as a
reverse proxy to the central portal. A suggested canonical origin is
`https://ads.sortmydigital.site`, but provisioning must accept an explicit origin rather
than hard-code a hosting provider.

The proxy maps the public client route to a server-owned tenant path such as
`https://ads.sortmydigital.site/portal/client-slug/...`. The browser-visible URL stays
on the client's domain. The central application must use base-path-safe or absolute
assets and must not trust a browser-supplied client ID.

When the hosting provider's browser checks reject proxy traffic, a client `/ads/` page
may embed the same central tenant URL in an iframe. This is the current School of Skill
and Edgbaston configuration. Use installer `--mode iframe` to remove managed proxies,
retain privacy headers and avoid intercepting the static embedding page. The central
database, credentials and revision rules remain unchanged.

For a Netlify client site, installing the proxy requires one intentional deploy. After
that, campaign creation, revision and approval are database operations and consume no
client-site build credits. Changes to the central portal code deploy only the central
application.

Hostinger is suitable only when the selected plan provides the runtime, HTTPS, process
management and reverse-proxy controls required by the central application. Keep
application state in the central database, not on a server filesystem.

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

The agent harness creates strategy, copy, platform metadata, destinations and creative
references. It does not edit the client repository. Ingestion uses a service credential,
is idempotent, and records agent/run provenance. Draft creation never implies client
approval.

## Tenant and access rules

- Resolve the tenant from a server-owned route or signed invitation, never request JSON.
- Store only hashed invitation/access tokens; never expose service keys to the browser.
- Scope every campaign and decision query by tenant on the server.
- Use server timestamps and append-only decision events.
- Preserve earlier revision decisions for audit, but exclude them from current totals.
- Require a comment for `changes_requested`; retain reviewer and revision fingerprint.
- Add rate limiting, token expiry/revocation and an access audit before broad rollout.
- Keep internal notes in a separate server-only field or table.

## Data ownership

The central store owns clients, memberships/invitations, campaigns, concepts, ad
revisions and decision events. Creative files live in central object storage with
immutable keys. The client site owns only the one-time `/ads` route configuration.

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

Minimum campaign statuses are `draft`, `awaiting_review`, `in_review`, `approved`,
`changes_requested`, `rejected` and `archived`. Review decisions remain
`awaiting_review`, `approved`, `changes_requested` and `rejected`.

## Reusable product source

Canonical product code belongs in the Sorted repository under `apps/ad-review/`.
Provisioning and campaign validation belong in `scripts/`. This reusable skill belongs
in `operators/skills/sorted-ad-review/` and may be installed globally by symlink.

Do not make a client repository the canonical product source. The Edgbaston implementation
is the reference prototype to migrate, not the fleet template.

## Readiness gates

Do not issue a live client portal until all are true:

- central origin and database are deployed;
- tenant-scoped authentication is verified;
- agent ingestion is authenticated and idempotent;
- `/ads` proxy works on desktop and mobile without escaping the client URL;
- two independent reviewers see the same persisted state;
- changed copy or creative invalidates the previous approval;
- the portal is `noindex, nofollow` and absent from public navigation;
- no Meta or Google publishing permission is present in the approval MVP.
