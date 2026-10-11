# Workspace Build - Approved Acquisition Handoff

Use for the existing shared Sorted acquisition hub, not a new sibling site or a second ads portal.

## Preconditions

For a new manufacturing job: independently verified homepage, core QA, explicit human assessment of the current revision, then the human's offer/pricing/creative direction.

For a workspace-only update: inspect the existing client configuration and supplied content. Do not require a new site scaffold or manufacture approval records for a job that is not part of this task.

Read `start-build.md` -> Client workspace standard: acquisition hub v2. Preserve its detailed layout, honest proposal states and approval boundaries. Sweeney's is the structural reference, not a source of reusable client claims or prices.

## Human Input Contract

For factory-tracked work, save the approved brief to `artifacts/workspace-brief.json`:

```json
{
  "client_slug": "<current job slug>",
  "website_revision": "<approved factory source fingerprint>",
  "approved_by": "<actual human>",
  "approved_at": "<actual ISO timestamp>",
  "offer": {
    "currency": "GBP",
    "total": 0,
    "deposit": 0,
    "balance": 0,
    "stripePaymentUrl": ""
  },
  "interests": [],
  "creatives": [],
  "follow_up": [],
  "tracking": { "mode": "illustrative" },
  "review_surface": "screenshot"
}
```

This is a shape example, not approved client data. Replace amounts only from human-supplied terms; they must be finite/nonnegative and reconcile.

**Standard offer (from 2026-10-10):** £3,000 total / £1,500 deposit / £1,500 balance in GBP, paid via the shared £1,500 Stripe deposit link in `WORKSPACE_DEFAULTS.offer.stripePaymentUrl`, tagged per-client via `client_reference_id`. Bank transfer enabled. Unless the human states different terms, use these. Next steps should still lead with booking a call — the offer is secondary. An explicit empty payment URL clears inheritance. A pending price remains visibly pending in the actual workspace; do not display example zero values as a free offer.

Include the human-supplied offer/benefits, creative files/copy/claims and follow-up bodies/timing/ownership as full records in the arrays. Missing assets/messages remain explicitly proposed. Never silently borrow another client's data.

The review surface is `local`, `screenshot` or `authorised-hosted`. A production screenshot is not an interactive site. Hosting requires its existing separate permission; never deploy just to populate an iframe.

## Implementation

Configure the existing `WORKSPACE_OVERRIDES` in `lib/workspace.ts`, matched to the client's actual workspace/review slug. The slug may differ from the site directory. No guessed CRM row, remote query or live write; author and approve any required shared-system query separately.

Preserve:

- Overview default; five prospect tabs plus separate Next steps; existing project/live and legacy review states.
- Actual built screenshot; full-viewport working site beneath the global navbar where a permitted preview exists, with fallback/recovery.
- Every creative as one complete standalone ad with visible copy, headline/CTA and native image proportions.
- Selectable full supplied emails, clear enquiry phases, stop rules and draft next-step tokens without unconfigured booking/CRM promises.
- Business-specific customer journey and ownership; disconnected illustrative figures clearly separate from actual connected values.
- Immediately visible Sorted call scheduling, approved headings, client-specific offer and explicitly set/cleared Stripe URL.

Use current workspace types; the brief's `offer` maps to the existing fields with the same names. Do not redesign the shared UI for each client. Actual advertising approvals remain in Sorted Ads. No publishing, outbound emails or payment/booking actions during normal QA.

## Completion Evidence

Record `workspace-build.json` with:

- `website_revision`: approved site's source fingerprint.
- `config_path` and `config_sha256`: actual shared Sorted `lib/workspace.ts` and its current hash.
- `preview_image_path`: an existing built-site screenshot, not a mockup.
- `source_revision` and `input_sha256`: factory evidence envelope.
- `checks`: nonempty named pass/fail checks; `overall_passed` derived from them.

Check client identity, approved terms, explicit payment link, asset/message provenance, proposed states, review surface, responsive/keyboard behaviour and preserved lifecycle compatibility. Stub external writes. Record missing connections as limitations, not passed live functionality.

Workspace completion does not authorise internal-page approval, CMS, advertising or deployment. Follow existing gates separately.
