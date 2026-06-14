import { createServiceClient } from "@/lib/supabase"
import { notFound } from "next/navigation"
import ReviewPageClient from "./ReviewPageClient"

export const revalidate = 60 // refresh every 60s

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ReviewPage({ params }: Props) {
  const { slug } = await params
  const db = createServiceClient()

  const { data: prospect, error } = await db
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

  if (error || !prospect) notFound()

  return <ReviewPageClient prospect={prospect} slug={slug} />
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const db = createServiceClient()
  const { data } = await db
    .from("prospects")
    .select("name, city")
    .eq("review_slug", slug)
    .single()

  return {
    title: data ? `Digital Excellence Review — ${data.name}` : "Digital Excellence Review",
    description: data
      ? `Your personalised website modernisation review for ${data.name}, ${data.city ?? "UK"}.`
      : "Your personalised website modernisation review.",
    robots: "noindex", // private review pages — not for search engines
  }
}
