import { NextRequest, NextResponse } from "next/server"
import { createHash } from "node:crypto"
import { createServiceClient } from "@/lib/supabase"

/**
 * Track a proposal page view.
 *
 * Expects JSON body: { proposal_slug: string, session_id: string }
 * Records the view in Supabase with hashed IP and user agent.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { proposal_slug, session_id } = body

    if (!proposal_slug || typeof proposal_slug !== "string") {
      return NextResponse.json({ error: "proposal_slug is required" }, { status: 400 })
    }

    if (!session_id || typeof session_id !== "string") {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 })
    }

    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown"
    const userAgent = req.headers.get("user-agent") ?? "unknown"
    const referrer = req.headers.get("referer") ?? null

    const ipHash = sha256(String(ip))
    const userAgentHash = sha256(String(userAgent))

    const db = createServiceClient()

    const { error } = await db.from("proposal_views").insert({
      proposal_slug,
      session_id,
      ip_hash: ipHash,
      user_agent_hash: userAgentHash,
      referrer,
    })

    if (error) {
      console.error("proposal_views insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("track-view error:", err)
    return NextResponse.json({ error: "invalid request" }, { status: 400 })
  }
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex")
}
