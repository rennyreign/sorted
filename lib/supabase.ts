import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qweevancxedkkfxysnzq.supabase.co"
// Anon key is public — safe to hardcode as fallback for static build in CI
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_WU1XpYbqZqud_nckYqTotg_JR14Nxzg"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client using the service key — for API routes only, never in client components
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_KEY not set")
  return createClient(supabaseUrl, serviceKey)
}

export type CrmStatus = "new" | "outreached" | "responded" | "mockup_revealed" | "build" | "quote" | "paid" | "lost" | "na"

export type OutreachStatus = "NOT_READY" | "READY" | "QUEUED" | "SENDING" | "SENT" | "FAILED_TEMPORARY" | "FAILED_PERMANENT" | "BOUNCED" | "REPLIED" | "OPTED_OUT"

export type OutreachMode = "AUTO_SEND" | "QUEUE_ONLY" | "PAUSED"

export type OutreachConfig = {
  id: number
  mode: OutreachMode
  daily_send_limit: number
  sending_window_start: string
  sending_window_end: string
  sending_window_days: string
  sending_window_tz: string
  send_spacing_minutes: number
  max_retry_attempts: number
  from_email: string
  from_name: string
  updated_at: string
}

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
  budget_indicated: number | null
  notes: string | null
  mockup_urls: string[] | null
  // Outreach operator fields
  outreach_status: OutreachStatus | null
  outreach_campaign_id: string | null
  outreach_queued_at: string | null
  outreach_sent_at: string | null
  outreach_provider_message_id: string | null
  outreach_attempt_count: number | null
  outreach_last_error: string | null
  email_bounced_at: string | null
  email_replied_at: string | null
  email_opted_out_at: string | null
  email_delivered_at: string | null
  email_opened_at: string | null
  email_clicked_at: string | null
  email_open_count: number
  email_click_count: number
  // Owner / Companies House enrichment
  owner_name: string | null
  owner_role: string | null
  owner_linkedin_url: string | null
  owner_source: string | null          // companies_house | website | etc
  owner_identified_at: string | null
  owner_email: string | null
  owner_email_source: string | null    // hunter_email_finder | hunter_domain_search
  owner_email_confidence: number | null
  owner_enriched_at: string | null
  owner_email_status: string | null    // valid | risky | invalid | unverified | not_found
  owner_email_verified_at: string | null
}
