"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import ReviewPageClient, { type ReviewProspect } from "./ReviewPageClient"

// This is a single static page served at /review/
// The web server (Hostinger .htaccess) rewrites /review/* → /review/index.html
// The slug is read from window.location.pathname at runtime.

export default function ReviewPage() {
  const [slug, setSlug] = useState<string | null>(null)
  const [prospect, setProspect] = useState<ReviewProspect | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // Production: /review/abc-plumbing → read from pathname (via .htaccess rewrite)
    // Dev: /review?slug=abc-plumbing → read from query param
    const parts = window.location.pathname.replace(/\/$/, "").split("/")
    const fromPath = parts[parts.length - 1]
    const fromQuery = new URLSearchParams(window.location.search).get("slug")
    const s = (fromPath && fromPath !== "review") ? fromPath : fromQuery
    if (s) {
      setSlug(s)
    } else {
      setLoading(false)
      setNotFound(true)
    }
  }, [])

  useEffect(() => {
    if (!slug) return
    supabase
      .from("prospects")
      .select(`
        place_id, name, category, website, address, city,
        site_score, business_quality_score, opportunity_score,
        site_analysis, review_summary, site_weaknesses, outreach_angle,
        recommendation, revshare_potential, modernity_gap,
        screenshot_url, analysed_at, crm_status, review_slug, mockup_url, mockup_urls
      `)
      .eq("review_slug", slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true)
        else setProspect(data as ReviewProspect)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.12em]">Loading review…</p>
        </div>
      </div>
    )
  }

  if (notFound || !prospect || !slug) {
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

  return <ReviewPageClient prospect={prospect} slug={slug} />
}
