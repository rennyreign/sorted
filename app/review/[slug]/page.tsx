"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ReviewPageClient from "./ReviewPageClient"

type Prospect = {
  place_id: string
  name: string
  category: string | null
  website: string | null
  address: string | null
  city: string | null
  site_score: number | null
  business_quality_score: number | null
  opportunity_score: number | null
  site_analysis: string | null
  site_weaknesses: string[] | null
  outreach_angle: string | null
  recommendation: string | null
  revshare_potential: string | null
  modernity_gap: string | null
  screenshot_url: string | null
  analysed_at: string | null
  crm_status: string
  review_slug: string | null
  mockup_url: string | null
}

export default function ReviewPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [prospect, setProspect] = useState<Prospect | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    supabase
      .from("prospects")
      .select(`
        place_id, name, category, website, address, city,
        site_score, business_quality_score, opportunity_score,
        site_analysis, site_weaknesses, outreach_angle,
        recommendation, revshare_potential, modernity_gap,
        screenshot_url, analysed_at,
        crm_status, review_slug, mockup_url
      `)
      .eq("review_slug", slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true)
        else setProspect(data)
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

  if (notFound || !prospect) {
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
