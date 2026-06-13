import { NextResponse } from "next/server"

const SCOPES = "https://www.googleapis.com/auth/gmail.compose"

export async function GET() {
  const clientId = process.env.GMAIL_CLIENT_ID
  const redirectUri = process.env.GMAIL_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/callback`

  if (!clientId) {
    return NextResponse.json({ error: "GMAIL_CLIENT_ID not configured" }, { status: 500 })
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
