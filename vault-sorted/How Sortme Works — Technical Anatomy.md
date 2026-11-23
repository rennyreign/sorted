
A full walkthrough of the messaging-first assistant, written for understanding rather than reference. By the end you should be able to explain, at each stage, exactly what happens to a text message from the moment it leaves a phone to the moment a reply comes back — and why each piece exists.

---

## 1. The whole journey in one picture

```
Owner's phone
   │  "Prepare a quote for Sam's boiler service"
   ▼
Mobile network → Twilio (the SMS provider)
   │  Twilio POSTs the message to our webhook
   ▼
Supabase Edge Function: assistant-inbound
   │  1. Normalise        → { channel, from, body }
   │  2. Identify sender  → owner / customer / stranger (by phone number)
   │  3. Persist          → conversations + messages rows
   │  4. Understand       → rules first, Haiku if needed → typed JSON
   │  5. Decide + act     → deterministic layer: operators, state machine
   │  6. Compose reply    → template (artifacts) or Haiku voice (chit-chat)
   │  7. Send reply       → Twilio REST API (or dry-run log)
   ▼
Twilio → mobile network → Owner's phone
   │
   ▼
Supabase Postgres keeps the full record → /assistants/demo displays it
```

Two HTTP calls matter: **Twilio → us** (the webhook, inbound) and **us → Twilio** (the REST API, outbound). Everything between them is our code.

---

## 2. The cast of technologies

| Piece                     | Technology                                           | What it actually is                                               |
| ------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| SMS transport             | **Twilio**                                           | A phone number that can send/receive texts, plus APIs             |
| The "server"              | **Supabase Edge Function** (`assistant-inbound`)     | A Deno TypeScript function with a public URL — our entire backend |
| The brain (ears)          | **Claude Haiku** (`claude-haiku-4-5`)                | Turns messy English into typed data. Never decides anything       |
| The brain (hands)         | **TypeScript + Zod operators**                       | Deterministic code that decides what happens                      |
| Memory                    | **Supabase Postgres**                                | Six tables holding every conversation, job and draft              |
| Watch window              | **`/assistants/demo`**                               | A Next.js page that reads state via an RPC                        |
| Voice notes (later)       | Twilio media URL → transcription → same pipeline     |                                                                   |
| WhatsApp (later)          | Same webhook — the `From` arrives as `whatsapp:+44…` |                                                                   |
| Live calling (much later) | LiveKit — completely separate, reuses operators      |                                                                   |

The key architectural fact: **the site on Hostinger is a static export — it cannot receive webhooks.** A static site is just files; there's no server running when Twilio calls. The Edge Function is our always-on endpoint. That's why the backend lives in Supabase, not in Next.js API routes.

---

## 3. Inbound: what Twilio sends us

When a text arrives at the Twilio number, Twilio makes an HTTP `POST` to our URL:

```
POST https://qweevancxedkkfxysnzq.supabase.co/functions/v1/assistant-inbound?key=sorted-assistant-demo-2026
Content-Type: application/x-www-form-urlencoded

From=%2B447000000001&Body=Prepare+a+quote+for+Sam%27s+boiler+service&MessageSid=SMxxx&NumMedia=0
```

Two things to notice:

- **It's form-encoded, not JSON.** Phone infrastructure is old; Twilio speaks `application/x-www-form-urlencoded`. We parse it with `new URLSearchParams(await req.text())`.
- **The `?key=` in the URL is the gate.** Anyone who finds this URL could fake an inbound text. The function checks `key` against `assistant_config.webhook_key` and returns 403 otherwise. When we go live, Twilio's request signature (HMAC) is the stronger version of this — worth adding then.

`normaliseTwilio()` converts the payload into our internal shape:

```ts
{
  channel: "sms" | "whatsapp",   // "whatsapp:+44…" From → whatsapp
  from: "+447000000001",
  body: "Prepare a quote for Sam's boiler service",
  media: [],                      // voice notes arrive here as MediaUrl0
  providerId: "SMxxx"
}
```

This normalisation is why WhatsApp and voice notes plug in later without touching the pipeline — they all end up as the same `InboundMessage`.

---

## 4. Step 1: Who is texting? (the security foundation)

Before anything is understood, the function resolves the sender's **role** — and it does it **by phone number, never by message content**:

```ts
function roleFor(from, cfg) {
  if (from === cfg.get("owner_number"))          return "owner";
  if (from === cfg.get("test_customer_number"))  return "customer";
  return "unknown";
}
```

This is the single most important line in the system. **The rule "a customer saying 'yes' never approves a quote" is enforced here, before any AI is involved.** If the role isn't `owner`, the code path that touches jobs and drafts is unreachable — not filtered, not warned, *unreachable*. Customers and strangers get a polite acknowledgement and that's it.

Config lives in the `assistant_config` table (readable only by the service role — anonymous users can't even see it exists). Edge function environment variables take precedence over table values, so secrets can move to `supabase secrets` later without code changes.

---

## 5. Step 2: Persist everything

The function finds-or-creates a `conversation` for that `(phone, channel)` pair, then writes the inbound `message` row. From this point on, nothing the assistant sees or says exists only in memory — it's all in Postgres. This gives us:

- the audit trail shown on `/assistants/demo`
- the ability to reconstruct any job's history
- the data later Inngest jobs (chase-ups, retries) will read

---

## 6. Step 3: Understanding — the two-pass classifier

`parseIntent()` is the "ear". Its only job: turn free text into this typed JSON:

```ts
{ intent: "prepare_quote" | "approve" | "reject" | "other",
  customer_name?: string, work?: string }
```

It runs **rules first, model second** — the ordering you specified:

**Pass 1 — regex rules (free, ~0ms).** Handles the obvious:
- `^(yes|send it|approve|go ahead|ok…)` → `approve`
- `^(no|stop|cancel|change…)` → `reject`
- contains "quot" → `prepare_quote`, with a `for X's Y` pattern extracting customer + work

If the rules produce a complete result, the function returns immediately — **no model call, no cost, no latency.** "send it" is the most common text in the system and it never touches an AI.

**Pass 2 — Claude Haiku (only when rules fail).** Triggered when the result is `other`, or a quote request is missing slots. The call uses Anthropic's **tool-use** feature rather than asking for JSON text:

```ts
tools: [{ name: "classify", input_schema: { intent: enum, customer_name, work } }],
tool_choice: { type: "tool", name: "classify" }   // forced — Haiku MUST call the tool
```

Forcing the tool call means the model can't wander off and write prose; it must emit structured arguments. The result is then **Zod-validated** (`IntentSchema.safeParse`) — if the model returns anything malformed, we fall back to the rules result rather than trusting it.

This is the pattern that matters conceptually: **the model's output is a *proposal*, the deterministic schema decides whether to accept it.** "can u sort a quote for mick, urgent boiler service" → `{prepare_quote, customer_name: "Mick", work: "urgent boiler service"}` — the model even normalises the lowercase name.

Cost: Haiku is ~$0.80/1M input tokens. Each call is ~200 tokens — a fraction of a penny, and only spent on texts rules can't handle.

---

## 7. Step 4: The decision layer (no AI allowed)

With a typed intent in hand, plain code decides what happens. For `prepare_quote`:

1. **Slot check** — missing customer or work? Reply asking for it (`"Almost — who's the customer?"`).
2. **Price lookup** — `runQuoteOperator()` reads `assistant_price_book` and maps work keywords to line items: "boiler/service" → Boiler service £95; anything else → Call-out £60 + Labour £55/hr; "urgent/asap/emergency" → +£40.
3. **Persist state** — insert `assistant_jobs` row + `assistant_quote_drafts` row with status `awaiting_owner`.
4. **Compose the draft** — from a fixed template: greeting, line items, total, sign-off "— Sortme".

For `approve`: find the latest draft in `awaiting_owner`, mark it `approved` (recording *which* phone approved), build the customer-facing text, send it to the configured test customer number, mark `sent`. The state machine is deliberately simple:

```
awaiting_owner → approved → sent
               → rejected
```

Notice what the model is *not* doing here: it doesn't pick prices, doesn't write the quote, doesn't decide whether approval is valid. Haiku says "this text means approve"; **the code alone decides whether approving is allowed right now** (owner role + a draft in the right state).

---

## 8. Step 5: The reply — templated vs. voiced

Two kinds of outbound text:

- **Artifacts & state changes** (the quote, "Sent to Sam", "Nothing waiting to send") — **strictly templated**. These carry prices, names and commitments; a model improvising here is a liability. Fixed scaffold, variable slots.
- **Conversational replies** (the `other` branch — chit-chat, unclear texts) — **Haiku-voiced** via `voiceReply()`: the templated intent is rewritten naturally under the shared `ASSISTANT_PERSONA` system prompt ("You are Sortme…"), with the template kept as fallback if the call fails. This is how "morning, how's it looking today" gets "Morning! All good here, cheers for asking — what can I help with?" instead of a canned line.

The persona is a single constant — the seam where per-client personalities will plug in later.

---

## 9. Step 6: Getting the reply onto a phone

`sendSms()` calls Twilio's REST API:

```
POST https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json
Authorization: Basic {SID}:{auth token}
Body: To=+44…&From={twilio number}&Body={reply}
```

Right now `live_sms=false`, so it takes the **dry-run** path: the reply is written to `assistant_messages` with `dry_run=true` instead of calling Twilio. That's why the demo works fully without a number — the only difference between "demo" and "live" is whether `sendSms` performs that one fetch.

Meanwhile the function returns an empty TwiML `<Response></Response>` to Twilio. TwiML is Twilio's XML instruction language; an empty response means "don't send anything in reply to this webhook" — we send replies via REST instead because it lets us text *other* numbers too (the customer), not just reply to the sender.

---

## 10. The data model

| Table | Holds | Notes |
|---|---|---|
| `assistant_conversations` | One row per (phone, channel) | `role` stamped at creation |
| `assistant_messages` | Every text in/out | `direction`, `dry_run`, `meta` (provider ID, media) |
| `assistant_jobs` | A piece of work | e.g. "Mick — urgent boiler service" |
| `assistant_quote_drafts` | Draft quotes | status machine, `approved_by_phone`, `sent_to_phone` |
| `assistant_price_book` | Configured prices | service-role editable |
| `assistant_config` | Numbers, keys, flags | RLS-locked, invisible to the public |

**Security:** every table has Row Level Security enabled with *no policies* — meaning anonymous/API users get nothing at all. The only public windows are two `SECURITY DEFINER` functions:

- `assistant_demo_overview()` — returns jobs + conversations with **masked phone numbers** (`···0001`), which is all the demo page needs
- `assistant_demo_reset(key)` — wipes demo tables, but only if you pass the webhook key

The edge function talks to Postgres with the **service role key**, which bypasses RLS — that's why it can write while nobody else can read.

---

## 11. The demo page without a phone

`/assistants/demo` is a client component that does two things:

1. **Reads** — calls `assistant_demo_overview` every 8s with the public anon key (safe: masked phones, no write access).
2. **Writes** — the "Text the assistant" simulator POSTs the exact same form-encoded shape Twilio sends, to the exact same URL. The function can't tell the difference between a curl, the browser, and real Twilio — which is the point: the demo exercises production code, not a mock.

---

## 12. What's missing and where each piece slots in

| Gap | Where it goes |
|---|---|
| **Real SMS** | `live_sms=true` + Twilio creds in config + webhook URL on the number. Zero code changes |
| **Twilio signature verification** | Replace/strengthen the `?key=` check with Twilio's HMAC header validation |
| **Per-owner scoping** | The pending-draft query takes "latest awaiting_owner" globally — fine for one owner; multi-owner needs `WHERE job.owner_conversation_id = convo` |
| **WhatsApp** | Already normalised; enable in Twilio, same URL |
| **Voice notes** | `NumMedia > 0` → fetch `MediaUrl0`, transcribe (Whisper/etc.), feed text into the same `parseIntent` |
| **Follow-ups & retries** | Inngest: schedule "if draft awaiting_owner > 24h, nudge owner" etc. Operator functions don't change shape |
| **Per-client persona** | `ASSISTANT_PERSONA` becomes a config row keyed by business |
| **Live calling** | LiveKit handles audio; transcribed utterances enter at `parseIntent` |

---

## 13. The mental model to keep

```
PHONE ──(Twilio webhook)──▶ EAR ──▶ DECIDE ──▶ VOICE ──(Twilio REST)──▶ PHONE
         normalise+role    rules/    operators    template or
         (security)        Haiku     + state      Haiku persona
                              │
                         everything persisted to Postgres
```

- **Ear** may be AI. It only produces typed suggestions.
- **Decide** is never AI. It checks identity, state and rules.
- **Voice** may be AI for conversation, never for commitments.
- **Everything is recorded** — the system is auditable by construction.

That separation is the whole design. The AI makes the assistant pleasant to text; the deterministic layer makes it safe to trust.
