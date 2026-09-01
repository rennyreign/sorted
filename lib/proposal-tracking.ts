import { trackEvent } from "./tracking"

const SESSION_KEY = "sorted_proposal_session_id"
const trackedSlugs = new Set<string>()

/**
 * Get or create a stable anonymous session ID for proposal view tracking.
 */
export function getProposalSessionId(): string {
  if (typeof window === "undefined") return ""

  const existing = localStorage.getItem(SESSION_KEY)
  if (existing) return existing

  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  localStorage.setItem(SESSION_KEY, id)
  return id
}

/**
 * Track a proposal view.
 *
 * Sends a view record to the API and pushes a dataLayer event for GTM/GA4.
 * Safe to call multiple times — debounced in components if needed.
 */
export async function trackProposalView(slug: string) {
  if (typeof window === "undefined") return
  if (trackedSlugs.has(slug)) return
  trackedSlugs.add(slug)

  const sessionId = getProposalSessionId()
  if (!sessionId) return

  trackEvent("proposal_view", { proposal_slug: slug })

  try {
    await fetch("/api/proposals/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposal_slug: slug, session_id: sessionId }),
    })
  } catch (err) {
    // Non-critical: don't block the proposal experience if tracking fails.
    console.error("trackProposalView failed:", err)
  }
}
