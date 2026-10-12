"use client"

import { useState, useEffect } from "react"
import { getWorkspace, type Workspace } from "@/lib/workspace"
import NextPageClient from "./NextPageClient"

// Static SPA shell served at /review-next/
// Production: /review/[slug]/next → .htaccess rewrites to /review-next/index.html
// The slug is read from window.location.pathname at runtime.
// Dev: /review-next?slug=lrt-plumbing-services

export default function ReviewNextPage() {
  const [slug, setSlug] = useState<string | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // Production path: /review/lrt-plumbing-services/next
    // Split on "/" → ["", "review", "lrt-plumbing-services", "next"]
    // Slug is the segment before "next"
    const parts = window.location.pathname.replace(/\/$/, "").split("/")
    const nextIdx = parts.indexOf("next")
    const fromPath = nextIdx > 0 ? parts[nextIdx - 1] : null
    const fromQuery = new URLSearchParams(window.location.search).get("slug")
    const s = (fromPath && fromPath !== "review" && fromPath !== "review-next") ? fromPath : fromQuery
    if (s) {
      setSlug(s)
    } else {
      setLoading(false)
      setNotFound(true)
    }
  }, [])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    getWorkspace(slug).then((data) => {
      if (cancelled) return
      if (!data) setNotFound(true)
      else setWorkspace(data)
      setLoading(false)
    }).catch(() => {
      if (!cancelled) { setNotFound(true); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.12em]">Loading…</p>
        </div>
      </div>
    )
  }

  if (notFound || !slug || !workspace) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-3">Sorted</p>
          <h1 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-3">Review not found</h1>
          <p className="text-[#737373] text-sm">This review link may have expired or the URL is incorrect.</p>
        </div>
      </div>
    )
  }

  return <NextPageClient slug={slug} prospectName={workspace.business.name} offer={workspace.offer} />
}
