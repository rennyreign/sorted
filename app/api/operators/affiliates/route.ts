// Operator API — Affiliate programme management
//
// GET  /api/operators/affiliates          → list all affiliates + their referrals
// PATCH /api/operators/affiliates/[id]    → approve / suspend / decline an affiliate
//
// These routes run locally only (operator dashboard tooling). They use the
// Supabase service key and bypass RLS. See next.config.ts.

import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function GET() {
  const db = createServiceClient()

  // Affiliates with a referral count + pending payout sum
  const { data: affiliates, error } = await db
    .from("affiliates")
    .select("id, email, display_name, phone, status, created_at, updated_at")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Aggregate referral stats per affiliate in one query
  const { data: agg } = await db
    .from("affiliate_referrals")
    .select("affiliate_id, status, payout_status, payout_amount_gbp")

  const byAffiliate: Record<string, { total: number; purchased: number; pending_payout_gbp: number }> = {}
  for (const row of (agg ?? []) as Array<{ affiliate_id: string; status: string; payout_status: string; payout_amount_gbp: number }>) {
    const a = byAffiliate[row.affiliate_id] ?? { total: 0, purchased: 0, pending_payout_gbp: 0 }
    a.total += 1
    if (row.status === "purchased") a.purchased += 1
    if (row.payout_status === "due" || row.payout_status === "notified") a.pending_payout_gbp += row.payout_amount_gbp
    byAffiliate[row.affiliate_id] = a
  }

  const payload = (affiliates ?? []).map((a) => ({
    ...a,
    referrals_total: byAffiliate[a.id]?.total ?? 0,
    referrals_purchased: byAffiliate[a.id]?.purchased ?? 0,
    pending_payout_gbp: byAffiliate[a.id]?.pending_payout_gbp ?? 0,
  }))

  return NextResponse.json({ affiliates: payload })
}

export async function PATCH(req: Request) {
  const db = createServiceClient()
  const body = (await req.json().catch(() => ({}))) as {
    affiliate_id?: string
    status?: "active" | "pending" | "suspended"
    declined_reason?: string
  }

  if (!body.affiliate_id || !body.status) {
    return NextResponse.json({ error: "affiliate_id and status are required" }, { status: 400 })
  }

  const { data, error } = await db
    .from("affiliates")
    .update({
      status: body.status,
      declined_reason: body.status === "suspended" ? body.declined_reason ?? null : null,
    })
    .eq("id", body.affiliate_id)
    .select("id, email, display_name, status")
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Affiliate not found" }, { status: 500 })
  }

  // Notify the affiliate of the decision
  if (body.status === "active") {
    await db.from("affiliate_notifications").insert({
      affiliate_id: data.id,
      type: "account_approved",
      title: "Your affiliate account is approved",
      body: "You can now sign in and submit your first mockup request.",
    })
  } else if (body.status === "suspended") {
    await db.from("affiliate_notifications").insert({
      affiliate_id: data.id,
      type: "account_declined",
      title: "Affiliate account suspended",
      body: body.declined_reason ?? "Contact hello@sortmydigital.site for details.",
    })
  }

  return NextResponse.json({ affiliate: data })
}
