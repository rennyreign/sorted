import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

// Updates a prospect's mockup_url from the dashboard
// Also accepts crm_status update (e.g. outreached)
export async function POST(req: NextRequest) {
  const { slug, mockup_url, crm_status } = await req.json()
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })
  if (!mockup_url) return NextResponse.json({ error: "mockup_url required" }, { status: 400 })

  const db = createServiceClient()

  const update: Record<string, string> = { mockup_url }
  if (crm_status) update.crm_status = crm_status

  const { data, error } = await db
    .from("prospects")
    .update(update)
    .eq("review_slug", slug)
    .select("place_id, name, review_slug, mockup_url, crm_status")
    .single()

  if (error) {
    console.error("upload-mockup error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
