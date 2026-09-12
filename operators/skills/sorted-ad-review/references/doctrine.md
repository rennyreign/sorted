# Sorted Ads doctrine

**Status:** Canonical product standard  
**Applies to:** the Sorted Ads workspace and agent-created campaigns

## Product boundary

Sorted Ads is the campaign creation, collaboration, approval, and preview layer between campaign creation and eventual platform publishing. It reviews strategy and executions; it does not publish ads.

Use this hierarchy:

`account → campaign → concept → ad → immutable revision → decision events`

Concept approval authorises the strategic direction. Ad approval authorises only the exact copy, creative, CTA and destination represented by that revision. Any material change creates a new fingerprint and requires fresh approval.

## One product, one portal

There is one Sorted Ads product. All client accounts live under a single portal at `sortmydigital.site/ads/`. An account selector dropdown in the top navigation switches between tenant workspaces.

Accounts differ in client identity, campaign data, creative, destinations and decisions. They do not differ in interface design. Every account shares:

- the `Sorted Ads` product name;
- the same system font stack, weights, type scale and line heights;
- the same paper, deep-green, powder-blue, status and border colors;
- the same top nav, account selector, campaign rows, progress panel, summary, guide, toolbar, concept sections, ad cards, review controls, footer and details dialog;
- the same hover, pressed, disabled, focus and responsive states;
- the same review history, revision warning, refresh and sign-out behavior.

Do not add client-local styling, duplicate shells, alternate names, per-account layouts or visual forks.

## Canonical architecture

Run one multi-tenant Sorted Ads application backed by a central database. All accounts are tenants within the single portal. No client-site deployments are needed for the ads workspace.

The internal workspace URL is `sortmydigital.site/ads/`. Sorted operators use this to manage campaigns, edit images, adjust crops, upload assets, and share preview links.

The client review URL is `sortmydigital.site/review?campaign=<campaign-id>`. Clients receive this link with a simple password gate — no login, no account, no friction. The password is tenant-specific and shared out-of-band by Sorted.

Keep application state in the central database, not on a server filesystem.

## Account selector

The top navigation includes an account selector dropdown that lists all available tenant workspaces. Selecting an account switches the entire workspace context — campaigns, assets, and settings all scope to the selected tenant.

The selected account persists in the URL and/or local storage so operators can bookmark or return to a specific account. The dropdown shows:

- Account name (e.g., "School of Skill", "Edgbaston Tuition")
- Tenant slug as a subtle subtitle
- Current selection highlighted

## Creation flow

```text
agent harness
  → structured campaign package
  → deterministic schema and policy validation
  → authenticated server-to-server ingestion
  → central campaign store
  → campaign index (scoped to selected account)
  → approval event log
```

The agent harness creates strategy, copy, platform metadata, destinations and creative references. Ingestion uses a service credential, is idempotent, and records agent/run provenance. Draft creation never implies client approval.

## Tenant and access rules

- Resolve the tenant from the selected account in the workspace, never from a client-site route
- Store only hashed access tokens; never expose service keys to the browser
- Scope every campaign and decision query by tenant on the server
- Use server timestamps and append-only decision events
- Preserve earlier revision decisions for audit, but exclude them from current totals
- Require a comment for `changes_requested`; retain reviewer and revision fingerprint
- Record `awaiting_review` when an approved concept is reopened
- Add rate limiting, token expiry/revocation and an access audit before broad rollout
- Keep internal notes in a separate server-only field or table

## Client review access

Clients do not log into the ads workspace. They receive a shared preview link with a simple password gate:

- The link is `sortmydigital.site/review?campaign=<campaign-id>`
- The password is tenant-specific (e.g., "schoolofskill" for School of Skill)
- The password is stored in `sessionStorage` so it persists during the review session
- No account creation, no email, no Netlify Identity, no friction
- The review page shows the campaign's ads with approve/request-change/reject controls
- Decisions persist to the central database via the same API

## Data ownership

The central store owns accounts, campaigns, concepts, ad revisions and decision events. Creative files live in central object storage with immutable keys. The workspace owns all routing and presentation.

Minimum campaign statuses are `draft`, `awaiting_review`, `in_review`, `approved`, `changes_requested`, `rejected` and `archived`. Review decisions are `awaiting_review`, `approved`, `changes_requested` and `rejected`.

## Reusable product source

Canonical product code belongs in the Sorted repository under `apps/ad-review/`. The Next.js workspace lives in `app/ads/`. The data layer is `lib/ads.ts`. Provisioning and campaign validation belong in `scripts/`. The model-invocable entry point belongs in `.devin/skills/sorted-ad-review/`; the detailed reusable specification belongs in `operators/skills/sorted-ad-review/`.

## Readiness gates

Do not issue or update a live account until all are true:

- central origin and database are deployed;
- tenant-scoped authentication is verified;
- agent ingestion is authenticated and idempotent;
- the workspace passes the interface contract in `references/interface-standard.md`;
- the account selector works on desktop and mobile;
- two independent reviewers see the same persisted state;
- changed copy or creative invalidates the previous approval;
- the workspace is `noindex, nofollow` and absent from public navigation;
- no Meta or Google publishing permission is present in the ads product.

## Human image correction

The harness creates campaigns; named human editors can correct images in the workspace.
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

Editor credentials are distinct from client reviewer passwords and carry a server-owned
name, expiry and revocation state. Client reviewers keep approval/feedback access only.
Uploads are private, immutable tenant/hash objects; only authorized library queries
return temporary signed URLs. Never expose service credentials to the browser.
