// Resend Webhook Edge Function
//
// Receives email event webhooks from Resend (delivered, opened, clicked,
// bounced, complained) and updates the corresponding prospect record in
// Supabase.
//
// Webhook payload format:
//   {
//     "type": "email.opened",
//     "created_at": "2026-02-22T23:41:12.126Z",
//     "data": {
//       "email_id": "56761188-7520-42d8-8898-ff6fc54ce618",
//       "to": ["delivered@resend.dev"],
//       "subject": "...",
//       ...
//     }
//   }
//
// Signature verification uses Svix (same as Resend's official SDK).
// The signing secret is stored in the RESEND_WEBHOOK_SECRET env var.
//
// Deploy:
//   supabase functions deploy resend-webhook --no-verify-jwt
//
// Configure in Resend dashboard:
//   URL: https://qweevancxedkkfxysnzq.supabase.co/functions/v1/resend-webhook
//   Events: email.delivered, email.opened, email.clicked, email.bounced, email.complained

// @ts-nocheck — Deno runtime, not Node

const RESEND_WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET") ?? ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

// ─── Svix signature verification ──────────────────────────────────────────────
// Resend uses Svix for webhook signing. We implement the verification
// manually to avoid importing the svix npm package (which may not be
// available in the Deno runtime without import_map configuration).
//
// Reference: https://docs.svix.com/receiving/verifying-payloads/how-manual

async function verifySvixSignature(
  payload: string,
  headers: Record<string, string>,
  secret: string,
): Promise<boolean> {
  const msgId = headers["svix-id"]
  const msgTimestamp = headers["svix-timestamp"]
  const msgSignature = headers["svix-signature"]

  if (!msgId || !msgTimestamp || !msgSignature) {
    return false
  }

  // Check timestamp freshness (within 5 minutes)
  const now = Math.floor(Date.now() / 1000)
  const timestamp = parseInt(msgTimestamp, 10)
  if (isNaN(timestamp)) return false
  if (Math.abs(now - timestamp) > 300) return false

  // The signing secret from Resend starts with "whsec_"
  // Svix expects the base64-encoded key after the prefix
  const rawSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret

  // Construct the signed content: "{id}.{timestamp}.{payload}"
  const signedContent = `${msgId}.${msgTimestamp}.${payload}`

  // Decode the base64 secret
  const keyBytes = base64Decode(rawSecret)

  // The signature header can contain multiple signatures: "v1,sig1,v1,sig2"
  // We need to check if any of them match
  const signatures = msgSignature
    .split(" ")
    .filter((s) => s.startsWith("v1,"))
    .map((s) => s.slice(3))

  if (signatures.length === 0) return false

  // Compute HMAC-SHA256
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )

  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedContent),
  )

  const computedSig = base64Encode(new Uint8Array(sig))

  // Compare against any of the provided signatures (constant-time-ish)
  for (const providedSig of signatures) {
    if (timingSafeEqual(computedSig, providedSig)) {
      return true
    }
  }

  return false
}

function base64Decode(s: string): Uint8Array {
  // Deno has atob
  const binary = atob(s)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function base64Encode(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function supabasePatch(path: string, body: Record<string, unknown>, params: Record<string, string>) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  const resp = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const text = await resp.text()
    console.error(`Supabase PATCH ${path} failed: ${resp.status} ${text}`)
  }
  return resp.ok
}

async function supabasePost(path: string, body: Record<string, unknown>) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const text = await resp.text()
    console.error(`Supabase POST ${path} failed: ${resp.status} ${text}`)
  }
  return resp
}

// ─── Event handler ────────────────────────────────────────────────────────────

interface WebhookEvent {
  type: string
  created_at: string
  data: {
    email_id?: string
    to?: string[]
    subject?: string
    from?: string
    tags?: Record<string, string>
    [key: string]: unknown
  }
}

async function handleEvent(event: WebhookEvent): Promise<void> {
  const emailId = event.data?.email_id
  if (!emailId) {
    console.warn("No email_id in webhook event", event.type)
    return
  }

  const eventType = event.type
  const eventTimestamp = event.created_at

  console.log(`Processing ${eventType} for email ${emailId}`)

  // Dedup: insert into resend_webhook_events, skip if already processed
  const dedupResp = await supabasePost("resend_webhook_events", {
    event_id: `${emailId}:${eventType}`,
    event_type: eventType,
    email_id: emailId,
    payload: JSON.stringify(event),
  })

  if (!dedupResp.ok) {
    // If it's a unique constraint violation, we already processed this event
    const text = await dedupResp.text()
    if (text.includes("duplicate") || text.includes("unique") || dedupResp.status === 409) {
      console.log(`Event ${eventType} for ${emailId} already processed — skipping`)
      return
    }
    console.error(`Failed to insert dedup record: ${text}`)
    // Continue anyway — better to process twice than miss an event
  }

  // Map event type to prospect fields
  const updates: Record<string, unknown> = {}

  switch (eventType) {
    case "email.delivered":
      updates.email_delivered_at = eventTimestamp
      break

    case "email.opened":
      updates.email_opened_at = eventTimestamp
      // Increment open count (will be set via RPC below)
      break

    case "email.clicked":
      updates.email_clicked_at = eventTimestamp
      break

    case "email.bounced":
      updates.email_bounced_at = eventTimestamp
      updates.outreach_status = "BOUNCED"
      // Add to suppression list
      const bouncedEmail = event.data?.to?.[0]
      if (bouncedEmail) {
        await supabasePost("outreach_suppression", {
          email: bouncedEmail,
          reason: "hard_bounce",
        }).catch(() => {}) // ignore if already suppressed
      }
      break

    case "email.complained":
      const complainedEmail = event.data?.to?.[0]
      if (complainedEmail) {
        await supabasePost("outreach_suppression", {
          email: complainedEmail,
          reason: "complaint",
        }).catch(() => {})
      }
      updates.outreach_status = "OPTED_OUT"
      updates.email_opted_out_at = eventTimestamp
      break

    default:
      console.log(`Unhandled event type: ${eventType}`)
      return
  }

  if (Object.keys(updates).length === 0) return

  // Update the prospect record by matching outreach_provider_message_id
  const success = await supabasePatch(
    "prospects",
    updates,
    { "outreach_provider_message_id": `eq.${emailId}` },
  )

  if (success) {
    console.log(`✓ Updated prospect for ${eventType} (email ${emailId})`)
  } else {
    console.error(`✗ Failed to update prospect for ${eventType} (email ${emailId})`)
  }

  // For open/click counts, use a separate RPC call to increment
  if (eventType === "email.opened" || eventType === "email.clicked") {
    const countField = eventType === "email.opened" ? "email_open_count" : "email_click_count"
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_email_count`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_email_id: emailId,
        p_field: countField,
      }),
    }).catch((e) => console.error(`Failed to increment ${countField}:`, e))
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  // Get raw body for signature verification
  const rawBody = await req.text()

  // Collect Svix headers (Deno normalizes to lowercase)
  const headers: Record<string, string> = {}
  for (const [key, value] of req.headers.entries()) {
    if (key.startsWith("svix-")) {
      headers[key] = value
    }
  }

  // Verify signature
  if (!RESEND_WEBHOOK_SECRET) {
    console.error("RESEND_WEBHOOK_SECRET not set — rejecting webhook")
    return new Response("Webhook secret not configured", { status: 500 })
  }

  const isValid = await verifySvixSignature(rawBody, headers, RESEND_WEBHOOK_SECRET)
  if (!isValid) {
    console.error("Webhook signature verification failed")
    return new Response("Invalid signature", { status: 401 })
  }

  // Parse the verified payload
  let event: WebhookEvent
  try {
    event = JSON.parse(rawBody)
  } catch {
    console.error("Failed to parse webhook payload")
    return new Response("Invalid JSON", { status: 400 })
  }

  // Process the event
  try {
    await handleEvent(event)
  } catch (err) {
    console.error(`Error processing event ${event.type}:`, err)
    // Return 200 anyway so Resend doesn't retry — we've logged the error
    // and the dedup record will prevent reprocessing
  }

  return new Response("OK", { status: 200 })
})
