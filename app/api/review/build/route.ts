import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

// Called when a prospect continues from the review page to the build page.
// Updates crm_status to 'build' if the prospect is at an earlier stage.
export async function POST(req: NextRequest) {
  const { slug } = await req.json()
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 })
  }

  const db = createServiceClient()

  const { data, error } = await db
    .from("prospects")
    .update({ crm_status: "build" })
    .eq("review_slug", slug)
    .in("crm_status", ["new", "outreached", "responded", "mockup_revealed"])
    .select("crm_status, status_updated_at")
    .single()

  if (error) {
    // PGRST116 = no rows matched (already build/quote/paid/lost/na) — treat as success
    if (error.code === "PGRST116") {
      return NextResponse.json({ success: true, already: true })
    }
    console.error("review/build error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
