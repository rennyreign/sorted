import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qweevancxedkkfxysnzq.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client using the service key — for API routes only, never in client components
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_KEY not set")
  return createClient(supabaseUrl, serviceKey)
}

export type CrmStatus = "new" | "outreached" | "responded" | "mockup_revealed" | "build" | "quote" | "paid" | "lost"

export type Prospect = {
  id: number
  place_id: string
  name: string
  category: string | null
  address: string | null
  city: string | null
  postcode: string | null
  phone: string | null
  website: string | null
  email: string | null
  website_exists: boolean
  email_exists: boolean
  qualified: boolean
  rating: number | null
  review_count: number | null
  google_maps_url: string | null
  latitude: number | null
  longitude: number | null
  search_query: string | null
  search_location: string | null
  run_id: string | null
  status: string
  first_seen_at: string
  updated_at: string
  // Website Analyser columns
  site_score: number | null           // combined prospect score (0–10)
  business_quality_score: number | null
  opportunity_score: number | null
  site_analysis: string | null
  site_weaknesses: string[] | null
  outreach_angle: string | null
  recommendation: string | null       // pursue | consider | deprioritise
  revshare_potential: string | null   // high | medium | low
  modernity_gap: string | null
  screenshot_url: string | null
  analysed_at: string | null
  // CRM columns
  crm_status: CrmStatus
  review_slug: string | null
  mockup_url: string | null
  contacted_at: string | null
  mockup_revealed_at: string | null
  status_updated_at: string | null
}
