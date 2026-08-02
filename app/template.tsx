"use client"

import { useEffect } from "react"
import PageTransition from "@/components/PageTransition"
import { captureAttribution } from "@/lib/attribution"

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: "instant" })
    }
    captureAttribution()
  }, [])

  return <PageTransition>{children}</PageTransition>
}
