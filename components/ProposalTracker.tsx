"use client"

import { useEffect, useRef } from "react"
import { trackProposalView } from "@/lib/proposal-tracking"

/**
 * Tracks a proposal view once per authenticated session.
 *
 * Place inside the authenticated proposal content. Returns null.
 */
export function ProposalTracker({ slug }: { slug: string }) {
  const trackedRef = useRef(false)

  useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true
    trackProposalView(slug)
  }, [slug])

  return null
}
