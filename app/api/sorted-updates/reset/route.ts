import { callSortedUpdatesBackend } from "@/lib/sorted-updates"
import { NextRequest } from "next/server"

export const dynamic = "force-static"

export async function POST(request: NextRequest) {
  const body = await request.text()
  return callSortedUpdatesBackend("/portal/reset", { method: "POST", body })
}
