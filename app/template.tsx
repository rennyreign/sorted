"use client"

import { useEffect } from "react"
import PageTransition from "@/components/PageTransition"

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: "instant" })
    }
  }, [])

  return <PageTransition>{children}</PageTransition>
}
