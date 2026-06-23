import { createServiceClient, type Prospect } from "@/lib/supabase"
import { NextResponse } from "next/server"

// POST /api/examples/sync
// Syncs prospects with mockups into the examples table.
// Idempotent: safe to run repeatedly.
export async function POST() {
  try {
    const supabase = createServiceClient()

    const { data: prospects, error: fetchError } = await supabase
      .from("prospects")
      .select(
        "id, name, category, mockup_url, mockup_urls, crm_status"
      )
      .not("mockup_url", "is", null)

    if (fetchError) {
      return NextResponse.json(
        { error: "Failed to fetch prospects", details: fetchError.message },
        { status: 500 }
      )
    }

    const rows = (prospects as Prospect[]).map((p) => {
      const imageUrl =
        p.mockup_urls && p.mockup_urls.length > 0
          ? p.mockup_urls[0]
          : p.mockup_url

      const isLive = p.crm_status === "paid"

      return {
        prospect_id: p.id,
        business_name: p.name,
        image_url: imageUrl,
        type: isLive ? "live" : "mockup",
        live_url: isLive ? null : null, // set manually when the live URL is known
        category: p.category,
      }
    })

    const { error: upsertError } = await supabase
      .from("examples")
      .upsert(rows, {
        onConflict: "prospect_id",
        ignoreDuplicates: false,
      })

    if (upsertError) {
      return NextResponse.json(
        { error: "Failed to upsert examples", details: upsertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      synced: rows.length,
      mockups: rows.filter((r) => r.type === "mockup").length,
      live: rows.filter((r) => r.type === "live").length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
