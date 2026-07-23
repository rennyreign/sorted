// Resend Webhook Handler — Sorted Outreach Engagement Tracking
//
// Receives Resend webhook events (delivered, opened, clicked, bounced, complained)
// and records them in the outreach_events table. A database trigger automatically
// updates the prospect's outreach_status and engagement timestamps.
//
// Verification: Svix HMAC-SHA256 signature (same scheme used by Resend/webhooks)
// Required env vars (set via: supabase functions secrets set):
//   RESEND_WEBHOOK_SECRET  — signing secret from Resend dashboard (whsec_...)
//   SUPABASE_URL           — Supabase project URL
//   SUPABASE_SERVICE_ROLE_KEY — service role key for DB writes
//
// Deploy:
//   supabase functions deploy resend-webhook
//
// Resend webhook payload example:
//   {
//     "type": "email.opened",
//     "created_at": "2024-01-15T12:00:00.000Z",
//     "data": {
//       "email_id": "ae2014de-c168-4c61-8267-70d2662a1ce1",
//       "from": "Renaldo <renaldo@sortmydigital.site>",
//       "to": ["owner@business.com"],
//       "subject": "We redesigned your website"
//     }
//   }

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET") ?? "";

// ─── Svix signature verification ──────────────────────────────────────────────

async function verifySvixSignature(
  rawBody: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string,
): Promise<boolean> {
  // Check timestamp is within 5 minutes
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(svixTimestamp, 10);
  if (isNaN(ts) || Math.abs(now - ts) > 300) {
    return false;
  }

  // Build the signed content
  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;

  // The secret starts with "whsec_" — decode the base64 part
  const secretBase64 = secret.startsWith("whsec_") ? secret.slice(6) : secret;

  // Import the secret as a CryptoKey for HMAC-SHA256
  const keyBytes = base64Decode(secretBase64);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  // Compute HMAC
  const dataBytes = new TextEncoder().encode(signedContent);
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, dataBytes);

  // Convert to base64
  const expectedSignature = base64Encode(new Uint8Array(signatureBuffer));

  // The svix-signature header may contain multiple signatures: "v1,sig1 v1,sig2"
  // Check if our computed signature matches any of them
  const signatures = svixSignature.split(" ").map((s) => {
    const parts = s.split(",");
    return parts.length >= 2 ? parts[1] : parts[0];
  });

  return signatures.some((sig) => constantTimeEqual(sig, expectedSignature));
}

function base64Decode(str: string): Uint8Array {
  const binaryString = atob(str);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function base64Encode(bytes: Uint8Array): string {
  let binaryString = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ─── Supabase REST helpers ────────────────────────────────────────────────────

async function insertEvent(event: {
  prospect_id?: number;
  provider_message_id?: string;
  event_type: string;
  occurred_at: string;
  raw_payload: object;
}): Promise<void> {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/outreach_events`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(event),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error(`Failed to insert event: ${resp.status} ${text}`);
  }
}

async function suppressEmail(email: string, reason: string, prospectId?: number): Promise<void> {
  const body: Record<string, unknown> = { email, reason };
  if (prospectId) body.prospect_id = prospectId;

  const resp = await fetch(`${SUPABASE_URL}/rest/v1/outreach_suppression`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal,resolution=ignore-duplicates",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error(`Failed to suppress email ${email}: ${resp.status} ${text}`);
  }
}

async function findProspectByMessageId(messageId: string): Promise<{ id: number; email: string } | null> {
  const resp = await fetch(
    `${SUPABASE_URL}/rest/v1/prospects?outreach_provider_message_id=eq.${encodeURIComponent(messageId)}&select=id,email&limit=1`,
    {
      headers: {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      },
    },
  );

  if (!resp.ok) return null;
  const data = await resp.json();
  return data.length > 0 ? data[0] : null;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Get raw body — signature verification requires the exact raw bytes
  const rawBody = await req.text();

  const svixId = req.headers.get("svix-id") ?? "";
  const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
  const svixSignature = req.headers.get("svix-signature") ?? "";

  // Verify signature
  if (!WEBHOOK_SECRET || !svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing webhook secret or svix headers");
    return new Response("Unauthorized", { status: 401 });
  }

  const isValid = await verifySvixSignature(
    rawBody,
    svixId,
    svixTimestamp,
    svixSignature,
    WEBHOOK_SECRET,
  );

  if (!isValid) {
    console.error("Invalid webhook signature");
    return new Response("Invalid signature", { status: 401 });
  }

  // Parse the verified payload
  let payload: {
    type: string;
    created_at: string;
    data: {
      email_id?: string;
      from?: string;
      to?: string[];
      subject?: string;
      bounce?: { subtype?: string };
      click?: { url?: string };
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("Failed to parse webhook payload");
    return new Response("Bad request", { status: 400 });
  }

  const eventType = payload.type;
  const emailId = payload.data?.email_id;
  const occurredAt = payload.created_at ?? new Date().toISOString();

  console.log(`Webhook received: ${eventType} for email ${emailId}`);

  // Look up the prospect by provider message ID
  let prospectId: number | undefined;
  let prospectEmail: string | undefined;

  if (emailId) {
    const prospect = await findProspectByMessageId(emailId);
    if (prospect) {
      prospectId = prospect.id;
      prospectEmail = prospect.email;
    }
  }

  // Insert the event — the DB trigger will update the prospect's status
  await insertEvent({
    prospect_id: prospectId,
    provider_message_id: emailId,
    event_type: eventType,
    occurred_at: occurredAt,
    raw_payload: payload,
  });

  // Handle suppression for bounces and complaints
  if (eventType === "email.bounced" && prospectEmail) {
    await suppressEmail(prospectEmail, "hard_bounce", prospectId);
  } else if (eventType === "email.complained" && prospectEmail) {
    await suppressEmail(prospectEmail, "complaint", prospectId);
  }

  return new Response("OK", { status: 200 });
});
