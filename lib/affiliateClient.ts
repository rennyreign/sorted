// Affiliate Tracker — typed Supabase client + domain types
//
// The affiliate portal is a public, statically-exported surface. All
// affiliate-facing reads/writes go through the anon-key client + RLS.
// Operator actions (advancing referral status, marking payouts) run via
// the local operator API routes using the service key.

import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qweevancxedkkfxysnzq.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_WU1XpYbqZqud_nckYqTotg_JR14Nxzg"

// Dedicated client for the affiliate portal. We persist the session in
// localStorage so the static export can restore it across navigations.
export const affiliateDb = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: "sorted_affiliate_auth",
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// ─── Domain types (mirror the SQL schema) ─────────────────────────────────────

export type AffiliateStatus = "pending" | "active" | "suspended"

export type BusinessStage = "new" | "growing" | "established"

export type ReferralStatus =
  | "mockup_requested"
  | "mockup_in_progress"
  | "mockup_delivered"
  | "client_reviewing"
  | "approved_for_build"
  | "build_in_progress"
  | "built"
  | "purchased"
  | "lost"
  | "cancelled"

export type PayoutStatus = "none" | "due" | "notified" | "paid"

export type NotificationType =
  | "welcome"
  | "payout_due"
  | "payout_notified"
  | "status_change"
  | "mockup_ready"
  | "account_approved"
  | "account_declined"

export type MockupBrief = {
  business?: string
  currentSite?: string
  goal?: string
  style?: string
  timeline?: string
  description?: string
}

export type Affiliate = {
  id: string
  email: string
  display_name: string
  phone: string | null
  program: "referral" | "factory" | null
  bank_account_ref: string | null
  status: AffiliateStatus
  declined_reason: string | null
  created_at: string
  updated_at: string
}

export type AffiliateReferral = {
  id: number
  affiliate_id: string
  prospect_id: number | null
  business_name: string
  business_contact_name: string | null
  business_email: string | null
  business_phone: string | null
  current_website: string | null
  business_stage: BusinessStage
  mockup_brief: MockupBrief
  status: ReferralStatus
  mockup_url: string | null
  client_slug: string | null
  payout_amount_gbp: number
  payout_status: PayoutStatus
  payout_notified_at: string | null
  payout_paid_at: string | null
  purchased_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type AffiliateNotification = {
  id: number
  affiliate_id: string
  referral_id: number | null
  type: NotificationType
  title: string
  body: string | null
  read_at: string | null
  created_at: string
}

export type AffiliateEvent = {
  id: number
  referral_id: number
  affiliate_id: string
  event_type: string
  previous_status: ReferralStatus | null
  new_status: ReferralStatus | null
  actor: "affiliate" | "operator" | "system"
  metadata: Record<string, unknown>
  created_at: string
}

export type DashboardStats = {
  total_referrals: number
  purchased_count: number
  active_count: number
  lost_count: number
  total_earned_gbp: number
  total_paid_out_gbp: number
  pending_payout_gbp: number
  pending_payout_count: number
}

export const EMPTY_STATS: DashboardStats = {
  total_referrals: 0,
  purchased_count: 0,
  active_count: 0,
  lost_count: 0,
  total_earned_gbp: 0,
  total_paid_out_gbp: 0,
  pending_payout_gbp: 0,
  pending_payout_count: 0,
}

// ─── Referral status display metadata ─────────────────────────────────────────

export type StatusMeta = {
  label: string
  /** tailwind classes for the badge pill */
  badge: string
  /** short description shown in the portal */
  description: string
  /** ordering for pipeline display (lower = earlier) */
  order: number
}

export const REFERRAL_STATUS_META: Record<ReferralStatus, StatusMeta> = {
  mockup_requested: {
    label: "Mockup requested",
    badge: "bg-[#f7f1e8] text-black border-black/10",
    description: "We've received the request. A designer will pick it up shortly.",
    order: 1,
  },
  mockup_in_progress: {
    label: "Mockup in progress",
    badge: "bg-[#fff3d6] text-black border-black/10",
    description: "Your mockup is being designed.",
    order: 2,
  },
  mockup_delivered: {
    label: "Mockup delivered",
    badge: "bg-[#e7ff1e] text-black border-black/10",
    description: "The mockup has been sent to the client for review.",
    order: 3,
  },
  client_reviewing: {
    label: "Client reviewing",
    badge: "bg-[#e7ff1e] text-black border-black/10",
    description: "The client is reviewing the mockup.",
    order: 4,
  },
  approved_for_build: {
    label: "Approved for build",
    badge: "bg-[#dfff00] text-black border-black/10",
    description: "The client approved the mockup. Build scoping is underway.",
    order: 5,
  },
  build_in_progress: {
    label: "Build in progress",
    badge: "bg-[#070707] text-white border-black/10",
    description: "The website is being built.",
    order: 6,
  },
  built: {
    label: "Built",
    badge: "bg-[#070707] text-white border-black/10",
    description: "Build complete. Awaiting client sign-off and payment.",
    order: 7,
  },
  purchased: {
    label: "Purchased",
    badge: "bg-[#070707] text-[#dfff00] border-black/10",
    description: "The client has paid. Your payout is being processed.",
    order: 8,
  },
  lost: {
    label: "Lost",
    badge: "bg-black/5 text-black/50 border-black/10",
    description: "The client declined or the deal fell through.",
    order: 9,
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-black/5 text-black/50 border-black/10",
    description: "This referral was cancelled.",
    order: 10,
  },
}

export const PAYOUT_STATUS_META: Record<PayoutStatus, { label: string; badge: string }> = {
  none: { label: "No payout", badge: "bg-black/5 text-black/50 border-black/10" },
  due: { label: "Due", badge: "bg-[#dfff00] text-black border-black/10" },
  notified: { label: "Notified", badge: "bg-[#070707] text-[#dfff00] border-black/10" },
  paid: { label: "Paid", badge: "bg-[#070707] text-white border-black/10" },
}

export const BUSINESS_STAGE_META: Record<BusinessStage, { label: string; payoutGbp: number; description: string }> = {
  new: { label: "New business", payoutGbp: 75, description: "Less than 1 year trading" },
  growing: { label: "Growing business", payoutGbp: 150, description: "1 to 3 years trading" },
  established: { label: "Established business", payoutGbp: 300, description: "3+ years trading" },
}
