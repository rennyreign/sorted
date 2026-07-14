import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

// Retry: reset FAILED_TEMPORARY records back to READY
export async function POST(req: NextRequest) {
  const supabase = createServiceClient()

  // Optionally retry a single prospect by place_id
  const body = await req.json().catch(() => ({}))
  const placeId = body.place_id

  let query = supabase
    .from("prospects")
    .update({
      outreach_status: "READY",
      outreach_last_error: null,
    })

  if (placeId) {
    query = query.eq("place_id", placeId)
  } else {
    query = query.eq("outreach_status", "FAILED_TEMPORARY")
  }

  const { data, error } = await query.select("id")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, reset: data?.length ?? 0 })
}
