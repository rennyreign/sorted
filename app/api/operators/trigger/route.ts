import { NextRequest, NextResponse } from "next/server"

const REPO = "rennyreign/sorted"

export async function POST(req: NextRequest) {
  const token = process.env.GH_PAT || process.env.GITHUB_TOKEN
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 })
  }

  const { workflow, category, location } = await req.json()

  if (!workflow) {
    return NextResponse.json({ error: "workflow is required" }, { status: 400 })
  }

  // Build inputs for the workflow_dispatch event
  const inputs: Record<string, string> = {}
  if (category) inputs.category = category
  if (location) inputs.location = location

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${workflow}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: "main",
        inputs,
      }),
    }
  )

  // 204 = success (GitHub returns no body)
  if (res.status === 204) {
    return NextResponse.json({ success: true })
  }

  const body = await res.text()
  console.error("GitHub Actions trigger failed:", res.status, body)
  return NextResponse.json({ error: "Failed to trigger workflow", detail: body }, { status: res.status })
}
