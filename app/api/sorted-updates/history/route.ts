import { callSortedUpdatesBackend } from "@/lib/sorted-updates"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("client_id")
  if (!clientId) {
    return NextResponse.json({ error: "missing client_id" }, { status: 400 })
  }
  return callSortedUpdatesBackend(`/portal/history?client_id=${encodeURIComponent(clientId)}`)
}
