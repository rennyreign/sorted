"use client"

import { useEffect } from "react"

// Legacy duplicate of /clients/gb-halesowen — kept so old links still resolve.
// Canonical URL: /clients/gb-halesowen (same password: gracie2026)
export default function GBHalesowenRedirect() {
  useEffect(() => {
    window.location.replace("/clients/gb-halesowen/")
  }, [])

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/50 text-sm">
          Moved — <a href="/clients/gb-halesowen/" className="underline">continue to the delivery page</a>
        </p>
      </div>
    </main>
  )
}
