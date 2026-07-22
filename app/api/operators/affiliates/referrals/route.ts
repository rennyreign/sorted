// Operator API — list all affiliate referrals across all affiliates
//
// GET /api/operators/affiliates/referrals?status=purchased
//
// Returns referrals joined with their affiliate's display info so the
// operator dashboard can show who referred whom. Service role bypasses RLS.

import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function GET(req: Request) {
  const db = createServiceClient()
  const url = new URL(req.url)
  const status = url.searchParams.get("status")

  let query = db
    .from("affiliate_referrals")
    .select(
      "id, affiliate_id, business_name, business_contact_name, business_email, business_phone, current_website, business_stage, status, mockup_url, client_slug, payout_amount_gbp, payout_status, payout_notified_at, purchased_at, notes, created_at, updated_at, affiliates:affiliate_id (display_name, email)",
    )
    .order("created_at", { ascending: false })

  if (status) query = query.eq("status", status)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ referrals: data ?? [] })
}
