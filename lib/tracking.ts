// Website tracking helper — pushes clean dataLayer events for GTM/GA4.
//
// GTM listens for these event names via Custom Event triggers and forwards
// them to GA4. The only client-specific ID in the website is the GTM
// container ID (already in app/layout.tsx). The GA4 Measurement ID lives
// inside GTM, not in website code.

export type TrackingValue = string | number | boolean | null | undefined
export type TrackingPayload = Record<string, TrackingValue>

type DataLayerEvent = TrackingPayload & { event: string }

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[]
  }
}

/**
 * Push a dataLayer event with standard parameters.
 * No PII is ever sent — only anonymous context and metadata.
 */
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

/**
 * Standard event names used across the site.
 * GTM Custom Event trigger regex should match these exactly.
 */
export const TRACKING_EVENTS = {
  PAGE_VIEW: "page_view",
  SCROLL_50: "scroll_50",
  KEY_PAGE_VIEW: "key_page_view",
  CTA_CLICK: "cta_click",
  PHONE_CLICK: "phone_click",
  EMAIL_CLICK: "email_click",
  WHATSAPP_CLICK: "whatsapp_click",
  DOWNLOAD_CLICK: "download_click",
  OUTBOUND_CLICK: "outbound_click",
  FORM_SUBMIT: "form_submit",
  FORM_ERROR: "form_error",
  THANK_YOU_VIEW: "thank_you_view",
  BOOKING_COMPLETED: "booking_completed",
} as const

/**
 * High-intent pages that get a key_page_view event.
 * Maps path prefixes to key_page_type values.
 */
export const KEY_PAGES: { match: string; type: string }[] = [
  { match: "/pricing", type: "pricing" },
  { match: "/partners", type: "partners" },
  { match: "/partners/apply", type: "apply" },
  { match: "/review", type: "review" },
  { match: "/howitworks", type: "how_it_works" },
  { match: "/contact", type: "contact" },
  { match: "/thank-you", type: "thank_you" },
  { match: "/success", type: "thank_you" },
]

/**
 * Check if a path is a key page and return its type.
 */
export function getKeyPageType(pathname: string): string | null {
  // Exact match first
  for (const page of KEY_PAGES) {
    if (pathname === page.match) return page.type
  }
  // Path ending in /thank-you
  if (pathname.endsWith("/thank-you") || pathname.endsWith("/thank-you/")) {
    return "thank_you"
  }
  // Prefix match for nested routes (e.g. /partners/apply)
  for (const page of KEY_PAGES) {
    if (pathname.startsWith(page.match + "/")) return page.type
  }
  return null
}
