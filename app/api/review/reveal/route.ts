import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

// Called by the review page when the prospect clicks "Reveal your new website"
// Updates crm_status to mockup_revealed (triggers DB timestamp automatically)
export async function POST(req: NextRequest) {
  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })

  const db = createServiceClient()

  const { data, error } = await db
    .from("prospects")
    .update({ crm_status: "mockup_revealed" })
    .eq("review_slug", slug)
    .neq("crm_status", "mockup_revealed") // idempotent — don't re-fire if already revealed
    .select("crm_status, mockup_revealed_at")
    .single()

  if (error) {
    // PGRST116 = no rows matched (already revealed) — treat as success
    if (error.code === "PGRST116") return NextResponse.json({ success: true, already: true })
    console.error("reveal error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
