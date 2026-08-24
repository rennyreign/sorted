"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { getKeyPageType, trackEvent, TRACKING_EVENTS } from "@/lib/tracking"

/**
 * AnalyticsTracker — client-side tracking layer.
 *
 * Mounts once in the root layout and handles:
 * - page_view on route changes
 * - key_page_view for high-intent pages
 * - scroll_50 once per page
 * - Delegated click tracking: tel:, mailto:, WhatsApp, downloads, outbound, data-track CTAs
 *
 * No PII is collected. Only anonymous metadata.
 */
export function AnalyticsTracker() {
  const pathname = usePathname()
  const scrolledRef = useRef(false)

  // Page view + key page view on route change
  useEffect(() => {
    scrolledRef.current = false

    trackEvent(TRACKING_EVENTS.PAGE_VIEW)

    const keyType = getKeyPageType(pathname)
    if (keyType) {
      trackEvent(TRACKING_EVENTS.KEY_PAGE_VIEW, { key_page_type: keyType })
    }
  }, [pathname])

  // Scroll tracking — fire scroll_50 once per page
  useEffect(() => {
    function onScroll() {
      if (scrolledRef.current) return

      const scrollHeight = document.documentElement.scrollHeight
      const innerHeight = window.innerHeight
      const scrollY = window.scrollY

      if (scrollHeight <= innerHeight) return

      const scrollPercent = (scrollY + innerHeight) / scrollHeight
      if (scrollPercent >= 0.5) {
        scrolledRef.current = true
        trackEvent(TRACKING_EVENTS.SCROLL_50, { scroll_threshold: 50 })
        window.removeEventListener("scroll", onScroll, { passive: true } as EventListenerOptions)
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll, { passive: true } as EventListenerOptions)
  }, [pathname])

  // Delegated click tracking
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement)?.closest("a, button") as HTMLAnchorElement | HTMLButtonElement | null
      if (!target) return

      const href = target.getAttribute("href") || ""
      const linkText = (target.textContent || "").trim().slice(0, 100)

      // data-track explicit CTA tracking
      const trackType = target.getAttribute("data-track")
      if (trackType) {
        trackEvent(trackType, {
          cta_text: target.getAttribute("data-cta-text") || linkText,
          cta_location: target.getAttribute("data-cta-location") || undefined,
          destination: href || undefined,
        })
        return
      }

      // tel: links
      if (href.startsWith("tel:")) {
        trackEvent(TRACKING_EVENTS.PHONE_CLICK, {
          link_url: href,
          link_text: linkText,
        })
        return
      }

      // mailto: links
      if (href.startsWith("mailto:")) {
        trackEvent(TRACKING_EVENTS.EMAIL_CLICK, {
          link_url: href,
          link_text: linkText,
        })
        return
      }

      // WhatsApp links
      if (href.includes("wa.me") || href.includes("whatsapp.com") || href.includes("api.whatsapp.com")) {
        trackEvent(TRACKING_EVENTS.WHATSAPP_CLICK, {
          link_url: href,
          link_text: linkText,
          destination: href,
        })
        return
      }

      // Download links (common file extensions)
      const downloadExt = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|dmg|exe|apk|csv|txt|rtf)(\?|#|$)/i
      if (downloadExt.test(href)) {
        trackEvent(TRACKING_EVENTS.DOWNLOAD_CLICK, {
          file_url: href,
          file_name: href.split("/").pop() || undefined,
          link_text: linkText,
        })
        return
      }

      // Outbound links (different origin, not WhatsApp/download)
      if (href.startsWith("http") || href.startsWith("//")) {
        try {
          const url = new URL(href, window.location.origin)
          if (url.origin !== window.location.origin) {
            trackEvent(TRACKING_EVENTS.OUTBOUND_CLICK, {
              destination: href,
              link_text: linkText,
            })
          }
        } catch {
          // Invalid URL — skip
        }
      }
    }

    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [])

  return null
}
