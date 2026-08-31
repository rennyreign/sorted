# Skill: op-13-analytics

**Operator:** 13 — Analytics
**Execution:** harness
**Trigger:** `analytics` is the next pending operator (after cms-qa passes)
**Input:** the site repo (CMS-enabled)
**Output:** `artifacts/analytics.json`

---

## What you do

Apply the required measurement infrastructure. Follow the existing `website-tracking-profile` skill — it defines exactly which events to implement and how.

## How to execute

### Step 1: Load the tracking profile skill

Read the `website-tracking-profile` skill. It specifies:
- Standard dataLayer events
- CTA tracking
- Form submit tracking
- Phone/email/WhatsApp click tracking
- Scroll tracking
- Key page views
- Thank-you page tracking
- GoHighLevel/GHL calendar or iframe tracking (if applicable)

### Step 2: Add GTM/GA4 container

If not already present:
- Add GTM container snippet to `layout.tsx`
- Configure GA4 measurement ID
- Add the dataLayer initialization

The user provides the measurement ID and GTM container ID. Do not guess them.

### Step 3: Implement event tracking

For each event in the tracking profile:

**CTA clicks:**
- Add click handlers to all CTA buttons
- Push `cta_click` event to dataLayer with CTA label and location

**Phone clicks:**
- Add click handlers to `tel:` links
- Push `phone_click` event

**Email clicks:**
- Add click handlers to `mailto:` links
- Push `email_click` event

**WhatsApp clicks:**
- Add click handlers to WhatsApp links
- Push `whatsapp_click` event

**Form submits:**
- Add submit handlers to all forms
- Push `form_submit` event with form name

**Scroll tracking:**
- Implement scroll depth tracking (25%, 50%, 75%, 100%)
- Push `scroll_depth` event

**Key page views:**
- Push `page_view` events for key pages

**Thank-you page:**
- If a thank-you page exists, push `conversion` event

### Step 4: Handle embedded forms/calendars

If the site uses GoHighLevel embedded forms or calendars:
- Add mutation observers to detect form loads
- Track form submissions within iframes where possible
- Follow the tracking profile skill's GHL guidance

### Step 5: Build verification

```bash
cd <build-dir>/site
npm run build
```

### Step 6: Verify event firing

Start the dev server. Use Playwright or manual browser testing:
- Click a CTA → verify dataLayer event
- Click a phone link → verify event
- Submit a form → verify event
- Scroll → verify scroll events

### Step 7: Write analytics.json

```json
{
  "measurement_id": "G-XXXXXXX",
  "gtm_container_id": "GTM-XXXXXX",
  "events": [
    { "event_name": "cta_click", "trigger": "CTA button click", "verified": true },
    { "event_name": "phone_click", "trigger": "tel: link click", "verified": true },
    { "event_name": "email_click", "trigger": "mailto: link click", "verified": true },
    { "event_name": "form_submit", "trigger": "Form submission", "verified": true },
    { "event_name": "scroll_depth", "trigger": "Scroll depth milestones", "verified": true },
    { "event_name": "page_view", "trigger": "Key page views", "verified": true }
  ],
  "all_events_verified": true,
  "applied_at": "<ISO timestamp>"
}
```

### Step 8: Mark passed

Mark `analytics` as passed in build state.

## Validation

- `analytics.json` exists and is valid JSON
- All events listed have `verified: true`
- `npm run build` passes
- GTM/GA4 snippets are present in the site code

## Failure states

- Build fails after adding tracking → check for syntax errors in event handlers
- Events don't fire → check dataLayer initialization, check event handlers are attached
- GTM container ID missing → ask the user, do not guess

## Notes

- Follow the `website-tracking-profile` skill exactly — it is the canonical specification
- Measurement IDs and GTM container IDs are provided by the user — never guess them
- GTM publishing is the user's responsibility — you implement the tracking code, the user publishes the container
