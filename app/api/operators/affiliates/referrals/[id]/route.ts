// Operator API — advance a single referral's status
//
// PATCH /api/operators/affiliates/referrals/[id]
//   body: { status: ReferralStatus, mockup_url?, client_slug?, notes?, prospect_id? }
//
// When status transitions to 'purchased':
//   1. The DB trigger (set_referral_payout) computes payout_amount_gbp from
//      business_stage and sets payout_status='due', purchased_at=now().
//   2. This route inserts an affiliate_notifications row (portal bell).
//   3. This route sends a transactional email to the affiliate via Resend.
//   4. This route flips payout_status to 'notified' and records payout_notified_at.
//   5. An affiliate_events audit row is written.
//
// This builds everything up to (but not including) the bank transfer itself.

import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import { sendEmail, payoutDueEmailHtml } from "@/lib/resend"
import { BUSINESS_STAGE_META } from "@/lib/affiliateClient"

type ReferralStatus =
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

const VALID_STATUSES: ReferralStatus[] = [
  "mockup_requested",
  "mockup_in_progress",
  "mockup_delivered",
  "client_reviewing",
  "approved_for_build",
  "build_in_progress",
  "built",
  "purchased",
  "lost",
  "cancelled",
]

const PORTAL_BASE =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const referralId = Number(id)
  if (!Number.isFinite(referralId)) {
    return NextResponse.json({ error: "Invalid referral id" }, { status: 400 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    status?: ReferralStatus
    mockup_url?: string | null
    client_slug?: string | null
    notes?: string | null
    prospect_id?: number | null
  }

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid or missing status" }, { status: 400 })
  }

  const db = createServiceClient()

  // Read current state for the audit row + to detect the purchased transition
  const { data: current, error: readErr } = await db
    .from("affiliate_referrals")
    .select("id, affiliate_id, status, business_name, business_stage, payout_status")
    .eq("id", referralId)
    .maybeSingle()

  if (readErr || !current) {
    return NextResponse.json({ error: readErr?.message ?? "Referral not found" }, { status: 404 })
  }

  const previousStatus = current.status as ReferralStatus
  const isPurchasedTransition = body.status === "purchased" && previousStatus !== "purchased"

  // Apply the status update (the DB trigger computes payout on the purchased transition)
  const update: Record<string, unknown> = { status: body.status }
  if (body.mockup_url !== undefined) update.mockup_url = body.mockup_url
  if (body.client_slug !== undefined) update.client_slug = body.client_slug
  if (body.notes !== undefined) update.notes = body.notes
  if (body.prospect_id !== undefined) update.prospect_id = body.prospect_id

  const { data: updated, error: updateErr } = await db
    .from("affiliate_referrals")
    .update(update)
    .eq("id", referralId)
    .select("*")
    .single()

  if (updateErr || !updated) {
    return NextResponse.json({ error: updateErr?.message ?? "Update failed" }, { status: 500 })
  }

  // Audit row
  await db.from("affiliate_events").insert({
    referral_id: referralId,
    affiliate_id: current.affiliate_id,
    event_type: `status:${body.status}`,
    previous_status: previousStatus,
    new_status: body.status,
    actor: "operator",
    metadata: { mockup_url: body.mockup_url ?? null, client_slug: body.client_slug ?? null, prospect_id: body.prospect_id ?? null },
  })

  // Status-change notification (non-purchased transitions)
  if (!isPurchasedTransition && body.status !== previousStatus) {
    await db.from("affiliate_notifications").insert({
      affiliate_id: current.affiliate_id,
      referral_id: referralId,
      type: "status_change",
      title: `${updated.business_name}: ${labelFor(body.status)}`,
      body: descriptionFor(body.status),
    })
  }

  // Purchased transition → payout notification + email
  if (isPurchasedTransition) {
    const amount = updated.payout_amount_gbp as number
    const stage = BUSINESS_STAGE_META[updated.business_stage as keyof typeof BUSINESS_STAGE_META]

    // 1. Portal notification
    await db.from("affiliate_notifications").insert({
      affiliate_id: current.affiliate_id,
      referral_id: referralId,
      type: "payout_due",
      title: `Payout of £${amount} is due`,
      body: `${updated.business_name} just purchased a ${stage.label} website. Your payout of £${amount} is being arranged.`,
    })

    // 2. Email the affiliate
    const { data: aff } = await db
      .from("affiliates")
      .select("email, display_name")
      .eq("id", current.affiliate_id)
      .maybeSingle()

    if (aff?.email) {
      await sendEmail({
        to: aff.email,
        subject: `You've earned £${amount} — ${updated.business_name} just purchased`,
        html: payoutDueEmailHtml({
          affiliateName: aff.display_name,
          businessName: updated.business_name,
          stage: stage.label,
          amountGbp: amount,
          portalUrl: `${PORTAL_BASE}/partners/dashboard`,
        }),
      })
    }

    // 3. Flip payout_status due → notified (we've now notified them)
    const { data: notified, error: notifyErr } = await db
      .from("affiliate_referrals")
      .update({
        payout_status: "notified",
        payout_notified_at: new Date().toISOString(),
      })
      .eq("id", referralId)
      .select("id, payout_status, payout_notified_at")
      .single()

    if (notifyErr) {
      // Non-fatal — the payout is still 'due' and will be picked up on retry
      console.error("Failed to flip payout_status to notified:", notifyErr.message)
    } else {
      // Audit the notification
      await db.from("affiliate_events").insert({
        referral_id: referralId,
        affiliate_id: current.affiliate_id,
        event_type: "payout_notified",
        previous_status: null,
        new_status: body.status,
        actor: "system",
        metadata: { payout_amount_gbp: amount, payout_notified_at: notified.payout_notified_at },
      })
    }
  }

  return NextResponse.json({ referral: updated })
}

function labelFor(status: ReferralStatus): string {
  const labels: Record<ReferralStatus, string> = {
    mockup_requested: "Mockup requested",
    mockup_in_progress: "Mockup in progress",
    mockup_delivered: "Mockup delivered",
    client_reviewing: "Client reviewing",
    approved_for_build: "Approved for build",
    build_in_progress: "Build in progress",
    built: "Built",
    purchased: "Purchased",
    lost: "Lost",
    cancelled: "Cancelled",
  }
  return labels[status]
}

function descriptionFor(status: ReferralStatus): string {
  const descriptions: Record<ReferralStatus, string> = {
    mockup_requested: "We've received the request. A designer will pick it up shortly.",
    mockup_in_progress: "Your mockup is being designed.",
    mockup_delivered: "The mockup has been sent to the client for review.",
    client_reviewing: "The client is reviewing the mockup.",
    approved_for_build: "The client approved the mockup. Build scoping is underway.",
    build_in_progress: "The website is being built.",
    built: "Build complete. Awaiting client sign-off and payment.",
    purchased: "The client has paid. Your payout is being processed.",
    lost: "The client declined or the deal fell through.",
    cancelled: "This referral was cancelled.",
  }
  return descriptions[status]
}
