// Stripe Webhook Edge Function
//
// Receives Stripe webhook events and updates the deals table so that
// revenue, cash collected, and customer-won metrics flow automatically
// into the weekly scorecard with no manual entry.
//
// Events handled:
//   payment_intent.succeeded      → mark deal as paid, set cash_collected_gbp
//   payment_intent.payment_failed → log (no deal update)
//   checkout.session.completed    → link checkout session to deal if metadata present
//
// The deal is matched by:
//   1. stripe_payment_intent_id (exact match), or
//   2. metadata.deal_id (if the Payment Link / Checkout Session includes it)
//
// Deploy:
//   supabase functions deploy stripe-webhook --no-verify-jwt
//
// Configure in Stripe dashboard:
//   URL: https://qweevancxedkkfxysnzq.supabase.co/functions/v1/stripe-webhook
//   Events: payment_intent.succeeded, payment_intent.payment_failed, checkout.session.completed
//
// Secrets (set via Supabase dashboard or CLI):
//   STRIPE_WEBHOOK_SECRET  — whsec_... from Stripe webhook settings
//   SUPABASE_URL           — https://qweevancxedkkfxysnzq.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY — service role key

// @ts-nocheck — Deno runtime, not Node

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_SERVICE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

// ─── Stripe signature verification ────────────────────────────────────────────
// Stripe signs webhooks with HMAC-SHA256 using the webhook signing secret.
// Header: Stripe-Signature: t=1234567890,v1=abc123...
// Reference: https://stripe.com/docs/webhooks/signatures

async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader) return false

  const parts = signatureHeader.split(",")
  let timestamp = ""
  let signature = ""
  for (const part of parts) {
    const [key, value] = part.split("=")
    if (key === "t") timestamp = value
    if (key === "v1") signature = value
  }

  if (!timestamp || !signature) return false

  // Check timestamp freshness (within 5 minutes)
  const now = Math.floor(Date.now() / 1000)
  const ts = parseInt(timestamp, 10)
  if (isNaN(ts)) return false
  if (Math.abs(now - ts) > 300) return false

  // Compute HMAC-SHA256
  const signedPayload = `${timestamp}.${payload}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload))
  const computedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  // Constant-time comparison
  if (computedSig.length !== signature.length) return false
  let result = 0
  for (let i = 0; i < computedSig.length; i++) {
    result |= computedSig.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return result === 0
}

// ─── Supabase REST helpers ────────────────────────────────────────────────────

async function supabasePatch(
  path: string,
  body: Record<string, unknown>,
  params: Record<string, string>,
): Promise<{ ok: boolean; status: number; rowsUpdated: number; error?: string }> {
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
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    const text = await resp.text()
    console.error(`Supabase PATCH ${path} failed: ${resp.status} ${text}`)
    return { ok: false, status: resp.status, rowsUpdated: 0, error: text }
  }
  // PostgREST returns the updated rows as JSON array when return=representation
  const data = await resp.json()
  const rows = Array.isArray(data) ? data.length : 0
  return { ok: rows > 0, status: resp.status, rowsUpdated: rows }
}

async function supabaseRpc(
  fn: string,
  body: Record<string, unknown>,
): Promise<boolean> {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    const text = await resp.text()
    console.error(`Supabase RPC ${fn} failed: ${resp.status} ${text}`)
  }
  return resp.ok
}

// ─── Event handlers ───────────────────────────────────────────────────────────

interface StripeEvent {
  type: string
  data: {
    object: {
      id: string
      amount?: number
      currency?: string
      metadata?: Record<string, string>
      payment_intent?: string
      [key: string]: unknown
    }
  }
}

async function handlePaymentIntentSucceeded(event: StripeEvent): Promise<void> {
  const pi = event.data.object
  const amountGbp = pi.amount ? pi.amount / 100 : 0
  const dealId = pi.metadata?.deal_id

  console.log(`payment_intent.succeeded: ${pi.id} amount=${amountGbp} deal_id=${dealId}`)

  // Try to match by stripe_payment_intent_id first
  let result = await supabasePatch(
    "deals",
    {
      deal_status: "paid",
      paid_at: new Date().toISOString(),
      cash_collected_gbp: amountGbp,
      stripe_payment_intent_id: pi.id,
    },
    { stripe_payment_intent_id: `eq.${pi.id}` },
  )
  // If no match by payment_intent_id, try metadata.deal_id
  if (result.rowsUpdated === 0 && dealId) {
    result = await supabasePatch(
      "deals",
      {
        deal_status: "paid",
        paid_at: new Date().toISOString(),
        cash_collected_gbp: amountGbp,
        stripe_payment_intent_id: pi.id,
      },
      { id: `eq.${dealId}` },
    )
  }

  if (result.ok) {
    console.log(`Deal updated for payment ${pi.id}`)
  } else {
    console.warn(`No deal matched for payment ${pi.id} (deal_id=${dealId})`)
  }
}

async function handleCheckoutSessionCompleted(event: StripeEvent): Promise<void> {
  const session = event.data.object
  const dealId = session.metadata?.deal_id
  const piId = session.payment_intent

  console.log(`checkout.session.completed: ${session.id} deal_id=${dealId} pi=${piId}`)

  if (dealId) {
    await supabasePatch(
      "deals",
      {
        stripe_checkout_session_id: session.id,
        ...(piId ? { stripe_payment_intent_id: piId } : {}),
      },
      { id: `eq.${dealId}` },
    )
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const rawBody = await req.text()
  const signatureHeader = req.headers.get("stripe-signature") ?? ""

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not set — rejecting webhook")
    return new Response("Webhook secret not configured", { status: 500 })
  }

  const isValid = await verifyStripeSignature(rawBody, signatureHeader, STRIPE_WEBHOOK_SECRET)
  if (!isValid) {
    console.error("Stripe webhook signature verification failed")
    return new Response("Invalid signature", { status: 401 })
  }

  let event: StripeEvent
  try {
    event = JSON.parse(rawBody)
  } catch {
    console.error("Failed to parse Stripe webhook payload")
    return new Response("Invalid JSON", { status: 400 })
  }

  const debug: string[] = []
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event)
        break
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event)
        break
      case "payment_intent.payment_failed":
        console.log(`Payment failed: ${event.data.object.id}`)
        break
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`Error processing Stripe event ${event.type}:`, err)
    debug.push(`ERROR: ${err}`)
  }

  return new Response("OK", { status: 200 })
})
