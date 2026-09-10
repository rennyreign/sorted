# Sorted Ad Review interface standard

## Acceptance benchmark

Use `https://edgbaston-tuition-centre.netlify.app/ads/` as the mandatory visual and interaction reference. Compare at 1440 × 900, 768 × 1024 and 375 × 812.

The canonical maintained files are:

- `apps/ad-review/public/app.js`
- `apps/ad-review/public/styles.css`
- `apps/ad-review/public/shell.php`

A client route must display this central view layer without a duplicate wrapper.

## Product language

- Product: `Ad Review`
- Privacy label: `Private workspace`
- Access headline: `Your next campaign, ready for your eyes.`
- Access CTA: `Open review board`
- Detail title: `Behind this ad`
- Footer line: `Clear feedback. Better creative.`

Do not substitute `Ad previewer`, `workspace`, or tenant-specific product names.

## Immutable design tokens

```css
--ink:#070707;
--paper:#fbfbfa;
--acid:#dfff00;
--card:#fff;
--warm-board:#f7efe3;
--line:#e8e5dd;
--deep-green:#08241f;
--action-green:#16785f;
--soft-green:#e4f2e9;
--powder-blue:#dcecf6;
--blue-ink:#32677d;
```

Use `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`, a 14px base size and 1.5 line height. The desktop wordmark is 40px/900; the mobile wordmark is 33px/900. Heading and component values must remain aligned with the canonical stylesheet rather than being recreated approximately.

## Required structure

### Access

- 76px top bar on desktop, 66px on mobile
- Sorted wordmark, left divider, `Ad Review`, lock icon and privacy label
- 450px access column
- powder-blue lock tile
- two labeled inputs and full-width deep-green CTA
- no footer until authentication succeeds

### Campaign index

- breadcrumb: `Ad Review / Client / Campaigns`
- large `Campaigns` heading
- one full-width campaign row per campaign
- objective, approval count and arrow icon
- powder-blue row hover with 2px lift

### Campaign detail

- four-part breadcrumb ending in campaign name
- platform pill and `Draft campaign`
- large campaign heading and fixed explanatory copy
- powder-blue approval panel
- four-column status summary with colored dots
- 01/02/03 guide
- sticky status tabs and concept select
- reviewer sync row with refresh action
- concept number, strategy, audience/proposition disclosure, status, approval/reopen action
- three-column desktop, two-column tablet and one-column mobile ad grid
- ad identity, copy, creative, destination, CTA and social affordances
- status badge, details action, approve/change/reject controls
- deep-green footer

### Detail dialog

- native modal with dark backdrop
- exact execution metadata and destination
- complete decision history in reverse chronological order
- earlier-revision label when fingerprints differ
- close button, Escape support, backdrop close and focus restoration

## Interaction contract

- Buttons transition `transform`, `background` and `border-color` over 200ms.
- Default hover uses powder blue and `#bfd8e7` border.
- Primary hover uses action green.
- Reject hover uses pale red.
- Focus uses a 3px blue-ink outline with 3px offset.
- Summary buttons toggle a status filter; tabs set it directly.
- Concept approval and ad approval remain separate.
- Reopening a concept appends `awaiting_review` rather than deleting history.
- Change requests require a comment.
- Refresh reloads shared persisted state.
- Sign out clears tenant-scoped session data.

## Responsive contract

- Above 1050px: three ad columns.
- 641–1050px: two ad columns.
- 640px and below: one ad column, 16px main gutter, compact top bar, hidden privacy label, horizontally scrollable breadcrumb and status tabs, full-width select, 42px minimum action height.
- No horizontal page overflow at any tested width.

## QA checklist

- Compare screenshots against Edgbaston at all three viewports.
- Verify computed tokens, font family, font weights, radii, gutters and top-bar height.
- Exercise campaign row hover, primary hover, reject hover, pressed and keyboard focus states.
- Authenticate, navigate campaigns, filter status and concept, open details, inspect history, submit a required change, refresh and sign out.
- Confirm `noindex, nofollow` and that approval never publishes an ad.
