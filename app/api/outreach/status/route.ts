import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function GET() {
  const supabase = createServiceClient()

  // Load config
  const { data: config } = await supabase
    .from("outreach_config")
    .select("*")
    .eq("id", 1)
    .single()

  if (!config) {
    return NextResponse.json({ error: "Outreach config not found" }, { status: 404 })
  }

  // Count prospects by outreach status
  const { data: counts } = await supabase
    .from("prospects")
    .select("outreach_status")
    .not("outreach_status", "is", null)

  const statusCounts: Record<string, number> = {}
  let sentToday = 0
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  for (const row of counts || []) {
    const s = row.outreach_status as string
    statusCounts[s] = (statusCounts[s] ?? 0) + 1
  }

  // Sent today
  const { count } = await supabase
    .from("prospects")
    .select("*", { count: "exact", head: true })
    .eq("outreach_status", "SENT")
    .gte("outreach_sent_at", todayStart.toISOString())

  sentToday = count ?? 0

  return NextResponse.json({
    config,
    counts: {
      ready: statusCounts.READY ?? 0,
      queued: statusCounts.QUEUED ?? 0,
      sent: statusCounts.SENT ?? 0,
      sentToday,
      failedTemporary: statusCounts.FAILED_TEMPORARY ?? 0,
      failedPermanent: statusCounts.FAILED_PERMANENT ?? 0,
      bounced: statusCounts.BOUNCED ?? 0,
      replied: statusCounts.REPLIED ?? 0,
      optedOut: statusCounts.OPTED_OUT ?? 0,
    },
  })
}
