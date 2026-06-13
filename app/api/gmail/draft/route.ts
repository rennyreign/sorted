import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  let accessToken = cookieStore.get("gmail_access_token")?.value
  const refreshToken = cookieStore.get("gmail_refresh_token")?.value

  // Try to refresh if access token is missing
  if (!accessToken && refreshToken) {
    accessToken = (await refreshAccessToken(refreshToken, cookieStore)) ?? undefined
  }

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated with Gmail" }, { status: 401 })
  }

  const { to, subject, body } = await req.json()

  if (!subject || !body) {
    return NextResponse.json({ error: "subject and body are required" }, { status: 400 })
  }

  // Build RFC 2822 email message
  const toLine = to ? `To: ${to}\r\n` : ""
  const raw = `${toLine}Subject: ${subject}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${body}`
  const encoded = Buffer.from(raw).toString("base64url")

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: { raw: encoded } }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    console.error("Gmail draft creation failed:", errBody)

    // Token expired — try refresh once
    if (res.status === 401 && refreshToken) {
      const newToken = await refreshAccessToken(refreshToken, cookieStore)
      if (newToken) {
        const retry = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: { raw: encoded } }),
        })
        if (retry.ok) {
          const data = await retry.json()
          return NextResponse.json({ id: data.id, success: true })
        }
      }
      return NextResponse.json({ error: "Token expired — reconnect Gmail" }, { status: 401 })
    }

    return NextResponse.json({ error: "Gmail API error" }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json({ id: data.id, success: true })
}

async function refreshAccessToken(
  refreshToken: string,
  cookieStore: Awaited<ReturnType<typeof cookies>>
): Promise<string | null> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GMAIL_CLIENT_ID!,
        client_secret: process.env.GMAIL_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })

    if (!res.ok) return null

    const { access_token, expires_in } = await res.json()
    if (!access_token) return null

    cookieStore.set("gmail_access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expires_in ?? 3600,
      path: "/",
    })

    return access_token
  } catch {
    return null
  }
}
