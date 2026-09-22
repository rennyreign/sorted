---
name: website-tracking-profile
description: Apply Sorted's standard analytics/dataLayer tracking profile to marketing websites. Always use for GTM, GA4, conversion tracking, page/scroll/CTA/form/phone/email/WhatsApp/download/outbound tracking, thank-you pages, booking completion, or embedded calendar tracking. Generates an import-safe GTM variables-and-triggers container and gives the manual tag setup required by GTM.
---

# Website Tracking Profile

Apply the website-side analytics layer for GTM/GA4. Website code pushes standard events to `window.dataLayer`; GTM listens for those events and forwards them to GA4.

## Non-negotiable architecture

1. Website code pushes events to `window.dataLayer`.
2. GTM catches the standard event names.
3. GA4 receives events and marks selected ones as key events.
4. The website contains the GTM container ID only. The GA4 Measurement ID belongs in GTM.
5. Never send names, emails, phone numbers, messages, health details, form answers, or other PII to GA4.

## Standard events

| Event | Trigger |
|---|---|
| `page_view` | Initial load and client-side route changes |
| `scroll_50` | Once per page at 50% depth |
| `key_page_view` | Contact, booking, quote, pricing, checkout, success, thank-you, or download page |
| `cta_click` | Important conversion CTA |
| `phone_click` | `tel:` link |
| `email_click` | `mailto:` link |
| `whatsapp_click` | WhatsApp link |
| `download_click` | File download link |
| `outbound_click` | External non-WhatsApp link |
| `form_submit` | Successful native/custom form submission when confirmation is observable |
| `form_error` | Failed form submission |
| `thank_you_view` | Thank-you page or confirmed inline success state |
| `booking_completed` | Confirmed booking success callback/page |
| `ghl_embed_view` | GHL embed loaded |
| `ghl_embed_interaction` | First interaction with GHL embed |

Common parameters:

```ts
{
  page_path: window.location.pathname,
  page_title: document.title,
  event_source: "website",
}
```

Event parameters: `key_page_type`, `cta_text`, `cta_location`, `destination`, `link_url`, `link_text`, `file_url`, `file_name`, `form_name`, `form_type`, `conversion_name`, `conversion_type`, `coach_name`, `embed_name`, `embed_type`, `embed_url`, `scroll_threshold`.

## Website implementation

Create a small helper:

```ts
export type TrackingValue = string | number | boolean | null | undefined
export type TrackingPayload = Record<string, TrackingValue>
type DataLayerEvent = TrackingPayload & { event: string }

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[]
  }
}

export function trackEvent(event: string, payload: TrackingPayload = {}) {
  if (typeof window === "undefined") return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event,
    page_path: window.location.pathname,
    page_title: document.title,
    event_source: "website",
    ...payload,
  })
}
```

Add one client tracker that:

- sends `page_view` on initial load and SPA route changes
- sends `key_page_view` for actual high-intent routes
- sends `scroll_50` once per path
- delegates clicks for explicit `data-track` CTAs, `tel:`, `mailto:`, WhatsApp, downloads, and outbound links
- captures UTMs without sending PII

Push `form_submit` only after backend/API acceptance where observable. For native Netlify redirects, treat `thank_you_view` on the success page as the confirmed conversion and `form_submit` as submit intent.

For cross-origin booking/calendar embeds, use the provider's success callback or redirect page. Track embed view/interaction only as intent; do not treat iframe clicks as completed leads.

## GTM container import — canonical protocol

GTM's GA4/Google tag JSON schema changes between versions. Generated tag objects have repeatedly failed with errors such as:

- `Custom-event trigger must have exactly one custom-event filter`
- `Parameter key is unknown`
- missing `measurementIdOverride`

Therefore the canonical import deliberately contains **no tags**. It imports only stable entities:

- 0 tags
- 2 triggers (`All Pages`, `Custom Event - Sorted standard website events`)
- 21 variables (`GA4 Measurement ID` + 20 Data Layer Variables)

Do not hand-author the JSON and do not add `gaawe`, `gaawc`, or Google tag objects to it.

Generate it from the bundled script. Resolve the script from the actual skill source directory reported by the skill loader; when running from the Sorted source repo, the command is:

```bash
node .devin/skills/website-tracking-profile/scripts/generate-gtm-import.mjs \
  --project="Client Name" \
  --gtm=GTM-XXXXXXXX \
  --ga4=G-XXXXXXXXXX \
  --output=/absolute/path/to/client-site/tracking/gtm-container-import.json
```

When invoked while working in a client repo, do not assume `.devin/skills/` exists in that client repo. Use the skill's reported source path.

Validate before delivery:

```bash
node -e 'const d=require("./tracking/gtm-container-import.json"); const c=d.containerVersion; if(d.exportFormatVersion!==2||c.tag.length!==0||c.trigger.length!==2||c.variable.length!==21||c.trigger.filter(t=>t.type==="CUSTOM_EVENT"&&t.customEventFilter?.length===1).length!==1) process.exit(1); console.log("GTM portable import valid")'
```

### Import instructions

1. GTM → **Admin → Import Container**.
2. Select `tracking/gtm-container-import.json`.
3. Select the current workspace.
4. Choose **Merge**, never Overwrite unless the user explicitly intends to replace the container.
5. Confirm the preview says **0 tags, 2 triggers, 21 variables**.
6. Confirm the import.

## Manual GTM tags after import

Create tags in the GTM UI because tag JSON is version-sensitive.

### 1. Google tag

- Tag type: **Google tag**
- Tag ID: `{{GA4 Measurement ID}}`
- Configuration parameter: `send_page_view` = `false`
- Trigger: **Initialization - All Pages** only. Do not also attach "All Pages" — the Google tag must load before the event tag fires, and dual triggers are redundant.

Disabling `send_page_view` matters because the website sends its own `page_view` events — including on SPA route changes, which a native Google-tag pageview would miss.

### 2. GA4 Event tag

- Tag type: **Google Analytics: GA4 Event**
- Measurement ID / Google tag: use `{{GA4 Measurement ID}}` or the Google tag created above, according to the current UI
- Event name: `{{Event}}`
- Trigger: **Custom Event - Sorted standard website events**
- Event parameters: map each parameter name to its matching `{{DLV - ...}}` variable

Map all 20 parameters. GTM omits values not present on a particular event.

A "Cannot detect if the Google tag is in your container" warning on the Measurement ID field is cosmetic — GTM cannot statically resolve `{{variables}}`. It resolves at runtime; verify the constant's value instead.

Preview with Tag Assistant before publishing. Verify at minimum: `page_view`, `cta_click`, `phone_click`, `scroll_50`, and one confirmed conversion event.

## Post-import verification — learned from four production containers

1. **Check the constant value.** Open `GA4 Measurement ID` under Variables and confirm it equals the target property's `G-` ID. A stale/mistyped value silently routes every event to the wrong property (observed in production — reports look dead while hits flow elsewhere).
2. **Check the published version for legacy tags.** Importing merges; it does not clean. Old tags can keep firing bad event names (observed: a tag sending `page view` with a space — GA4 never counts it as a pageview, so Pages and screens shows Views = 0 while other events still record). Inspect the latest published version and remove/repair legacy tags.
3. **Publish.** Saved is not live. The most common fleet failure was a fully configured workspace left unpublished (24–25 pending changes). After **Submit → Publish**, confirm `Workspace Changes: 0`.
4. **Verify on the wire.** Load the live site (devtools Network, or a headless browser). Confirm `/g/collect` requests carry `en=page_view` — and `en=scroll_50` after scrolling — with `tid=` equal to the correct measurement ID. `en=gtm.js`/`gtm.init_consent` reaching GA4 means the event tag is on a load-type trigger (All Pages/Initialization) instead of the custom event trigger — fix the trigger.
5. **GA4-side lag.** The Admin → Events list can take 24–48h to show new event names. DebugView/Realtime is the live check.

## GA4 setup

After GTM is verified and published:

1. Check Realtime and DebugView.
2. Mark key events as appropriate: `booking_completed`, `thank_you_view`, `form_submit`, `phone_click`, `whatsapp_click`; optionally `email_click`.
3. Register useful event-scoped custom dimensions: `conversion_name`, `conversion_type`, `coach_name`, `form_name`, `form_type`, `cta_text`, `cta_location`, `key_page_type`, `embed_name`, `embed_type`, `destination`.
4. Disable overlapping Enhanced Measurement features only after custom tracking is live: Page views, Form interactions, Scrolls, Outbound clicks, and File downloads.

## Quality checks

- Build/typecheck passes.
- Events contain no PII.
- `page_view` fires once per initial load/route change.
- `scroll_50` fires once per path.
- Form completion signals success, not merely a button click.
- Booking completion uses a real success callback/page.
- GTM script and noscript iframe use the correct container ID.
- Import JSON passes the canonical validator and imports as **0 tags, 2 triggers, 21 variables**.
- `GA4 Measurement ID` constant holds the correct `G-` ID for the target property.
- Manual Google tag has `send_page_view=false` and fires on Initialization - All Pages only.
- Tag Assistant confirms events before GTM publication.
- Workspace is published (`Workspace Changes: 0`); saved-but-unpublished tags do not fire for live traffic.
- Wire check: `en=page_view` reaches the correct `tid`; no `gtm.*` event names are forwarded to GA4.
