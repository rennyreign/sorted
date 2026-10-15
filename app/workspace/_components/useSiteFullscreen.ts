"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Fullscreen preview control for workspace site previews.
 * Returns a ref to attach to the preview container, the fullscreen state,
 * and a toggle that falls back to opening the site in a new tab when the
 * Fullscreen API is unavailable (e.g. iPhone Safari).
 */
export function useSiteFullscreen(fallbackUrl?: string | null) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === ref.current)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
      return
    }
    const el = ref.current
    if (!el) return
    el.requestFullscreen().catch(() => {
      if (fallbackUrl) window.open(fallbackUrl, "_blank", "noopener,noreferrer")
    })
  }, [fallbackUrl])

  return { ref, isFullscreen, toggle }
}
