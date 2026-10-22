"use client"

import { useEffect, useRef } from "react"
import { trackEvent } from "@/lib/tracking"

/**
 * Fires the IR-specified engagement events:
 * - booking_section_viewed: #book enters the viewport
 * - letter_scrolled_75_percent: 75% of #letter has been scrolled through
 */
export function AgencyObservers() {
  const fired = useRef({ booking: false, letter: false })

  useEffect(() => {
    const book = document.getElementById("book")
    if (book) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && !fired.current.booking) {
            fired.current.booking = true
            trackEvent("booking_section_viewed")
            io.disconnect()
          }
        },
        { threshold: 0.25 }
      )
      io.observe(book)
    }

    const letter = document.getElementById("letter")
    if (!letter) return

    function onScroll() {
      if (fired.current.letter || !letter) return
      const rect = letter.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      if (total <= 0) return
      const progress = Math.min(Math.max(-rect.top / total, 0), 1)
      if (progress >= 0.75) {
        fired.current.letter = true
        trackEvent("letter_scrolled_75_percent", { scroll_threshold: 75 })
        window.removeEventListener("scroll", onScroll)
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return null
}
