// Last-touch UTM attribution for public lead capture.
//
// Captures utm_source/medium/campaign/content/term from the URL on landing
// and persists them in localStorage so attribution survives across pages if
// someone browses before submitting the mockup request form. Last UTM-tagged
// visit wins; a plain revisit with no UTM params does not clear a stored tag.

export type UtmParams = {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
}

const STORAGE_KEY = "sorted_attribution"
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

const EMPTY: UtmParams = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
}

function readUrlUtm(): UtmParams | null {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  const utm_source = params.get("utm_source")
  if (!utm_source) return null
  return {
    utm_source,
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
  }
}

function readStoredUtm(): UtmParams | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UtmParams & { capturedAt: number }
    if (Date.now() - parsed.capturedAt > MAX_AGE_MS) return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Call once on app/page mount (e.g. in a top-level client component or the
 * mockup modal on open) to capture and persist any UTM params present in
 * the URL. Safe to call repeatedly — a fresh tagged visit overwrites the
 * stored value.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return
  const fromUrl = readUrlUtm()
  if (!fromUrl) return
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...fromUrl, capturedAt: Date.now() })
  )
}

/**
 * Returns the best-known UTM attribution for the current visitor: a fresh
 * URL tag takes priority, falling back to whatever was last stored within
 * the attribution window, falling back to all-null (organic/direct).
 */
export function getAttribution(): UtmParams {
  return readUrlUtm() ?? readStoredUtm() ?? EMPTY
}
