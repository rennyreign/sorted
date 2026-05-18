export type SortedPortalSession = {
  session_id: string
  client_id: string
  user_id?: string
  email?: string
  first_login: boolean
  intro_completed: boolean
}

export type SortedPortalMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
  attachments?: Array<{ filename?: string; type?: string; url?: string }>
}

export type SortedChangeRecord = {
  change_id: string
  request_id: string
  client_id: string
  status: string
  summary: string
  created_at: string
  updated_at: string
  target_route?: string
  preview_url?: string
  live_url?: string
  blocked_reasons: string[]
}

export const demoSession: SortedPortalSession = {
  session_id: "local-demo-session",
  client_id: "gbhalesowen",
  user_id: "local-owner",
  email: "owner@example.com",
  first_login: true,
  intro_completed: false,
}

export async function callSortedUpdatesBackend(path: string, init?: RequestInit) {
  const baseUrl = process.env.SORTED_UPDATES_API_URL
  if (!baseUrl) {
    return Response.json(
      {
        status: "backend_not_configured",
        message: "Set SORTED_UPDATES_API_URL to connect this portal route to the Python operator.",
      },
      { status: 202 }
    )
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  })
  const payload = await response.text()
  return new Response(payload, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" },
  })
}
