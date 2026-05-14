import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, mode, attachments, clientId } = body

    // Validate required fields
    if (!message || !clientId) {
      return NextResponse.json(
        { error: "Missing required fields: message, clientId" },
        { status: 400 }
      )
    }

    // TODO: Connect to Sorted Updates operator
    // This will:
    // 1. Load client operator config
    // 2. Parse the update request
    // 3. Run safety policies
    // 4. Return dry-run plan
    // 5. If mode === "instant" and safe, auto-execute
    // 6. If mode === "preview" or complex, return preview URL

    // Mock response for now
    const isSafeChange = message.length < 100 && 
      !message.toLowerCase().includes("pricing") && 
      !message.toLowerCase().includes("legal")
    const autoApply = mode === "instant" && isSafeChange

    const response = {
      id: `upd_${Date.now()}`,
      status: autoApply ? "applying" : "preview_ready",
      message: autoApply
        ? "Sorted — safe change detected. Applying now. Live in ~30s."
        : mode === "instant"
        ? "This looks like it needs a preview first. Preparing now — you'll have a link in ~30s."
        : "Preview ready. Review and click apply when ready.",
      previewUrl: autoApply ? null : `https://preview-${Date.now()}.netlify.app`,
      estimatedTime: autoApply ? 30 : 60,
      mode: autoApply ? "instant_applied" : mode,
      clientId,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Updates API error:", error)
    return NextResponse.json(
      { error: "Failed to process update request" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const updateId = searchParams.get("id")

  if (!updateId) {
    return NextResponse.json(
      { error: "Missing update ID" },
      { status: 400 }
    )
  }

  // TODO: Check actual update status from operator
  // Mock status check
  const status = {
    id: updateId,
    status: "completed",
    liveUrl: "https://gbhalesowen.site",
    completedAt: new Date().toISOString(),
  }

  return NextResponse.json(status, { status: 200 })
}
