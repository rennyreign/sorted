import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const redirectUri = process.env.GMAIL_REDIRECT_URI || `${baseUrl}/api/gmail/callback`

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/operators/prospect-finder?gmail_error=1`)
  }

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GMAIL_CLIENT_ID!,
        client_secret: process.env.GMAIL_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error("Gmail token exchange failed:", body)
      return NextResponse.redirect(`${baseUrl}/operators/prospect-finder?gmail_error=1`)
    }

    const { access_token, refresh_token, expires_in } = await res.json()

    const cookieStore = await cookies()

    cookieStore.set("gmail_access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expires_in ?? 3600,
      path: "/",
    })

    if (refresh_token) {
      cookieStore.set("gmail_refresh_token", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 90, // 90 days
        path: "/",
      })
    }

    return NextResponse.redirect(`${baseUrl}/operators/prospect-finder?gmail_connected=1`)
  } catch (err) {
    console.error("Gmail callback error:", err)
    return NextResponse.redirect(`${baseUrl}/operators/prospect-finder?gmail_error=1`)
  }
}
