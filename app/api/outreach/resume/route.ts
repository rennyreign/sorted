import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export async function POST() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from("outreach_config")
    .update({ mode: "AUTO_SEND", updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, mode: data.mode })
}
