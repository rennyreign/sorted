import { NextRequest, NextResponse } from "next/server"

const REPO = "rennyreign/sorted"

export async function GET(req: NextRequest) {
  const token = process.env.GH_PAT || process.env.GITHUB_TOKEN
  if (!token) return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 })

  const workflow = req.nextUrl.searchParams.get("workflow") || "prospect-finder.yml"

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${workflow}/runs?per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    }
  )

  if (!res.ok) return NextResponse.json({ error: "GitHub API error" }, { status: res.status })

  const data = await res.json()
  const run = data.workflow_runs?.[0]
  if (!run) return NextResponse.json({ status: "none" })

  return NextResponse.json({
    status: run.status,           // queued | in_progress | completed
    conclusion: run.conclusion,   // success | failure | cancelled | null
    started_at: run.run_started_at,
    updated_at: run.updated_at,
    url: run.html_url,
    run_number: run.run_number,
  })
}
