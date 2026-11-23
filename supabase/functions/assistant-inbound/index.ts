import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

// assistant-inbound: Twilio SMS/WhatsApp webhook -> shared operator backend.
//
// Flow (v0, synchronous):
//   inbound -> normalise -> resolve role by phone -> persist message
//   -> parse intent (OpenAI if configured, else rules) -> run operator
//   -> persist job/draft state -> reply via Twilio REST (or dry-run log)
//   -> 200 TwiML ack
//
// Security invariant: an approval only counts when the sender's phone number
// is the configured owner_number AND there is a draft in 'awaiting_owner'.
// A customer (or anyone else) saying "yes" can never approve a quote.

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const db = createClient(supabaseUrl, serviceKey);

// Shared persona — prepend to every model call that produces owner-facing
// voice. Classifier stays cold; this only applies where tone matters.
const ASSISTANT_PERSONA =
  "You are Sortme, a practical, quietly capable assistant for a UK local " +
  "business. You write texts, not essays: 1–2 short sentences, plain words a " +
  "busy tradesperson would use, no stacked pleasantries, no emojis. Confident, " +
  "warm, never salesy. Always say exactly what happens next.";

type Channel = "sms" | "whatsapp";
type Role = "owner" | "customer" | "unknown";

type InboundMessage = {
  channel: Channel;
  from: string;
  body: string;
  media: Array<{ url: string; contentType: string }>;
  providerId: string | null;
};

const IntentSchema = z.object({
  intent: z.enum(["prepare_quote", "approve", "reject", "customer_action", "other"]),
  customer_name: z.string().optional(),
  work: z.string().optional(),
});
type Intent = z.infer<typeof IntentSchema>;

const CustomerReplySchema = z.object({
  reply_text: z.string(),
  complete: z.boolean(),
  name: z.string().optional(),
  postcode: z.string().optional(),
  job: z.string().optional(),
});
type CustomerReply = z.infer<typeof CustomerReplySchema>;

async function getConfig(): Promise<Map<string, string>> {
  const { data } = await db.from("assistant_config").select("key, value");
  const map = new Map<string, string>();
  for (const row of data ?? []) map.set(row.key, row.value);
  // Env vars (Supabase secrets) take precedence over the config table.
  for (const key of [
    "OWNER_NUMBER",
    "TEST_CUSTOMER_NUMBER",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_FROM_NUMBER",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "LIVE_SMS",
    "WEBHOOK_KEY",
  ]) {
    const v = Deno.env.get(key);
    if (v) map.set(key.toLowerCase(), v);
  }
  return map;
}

function normaliseTwilio(params: URLSearchParams): InboundMessage {
  const from = params.get("From") ?? "";
  const channel: Channel = from.startsWith("whatsapp:") ? "whatsapp" : "sms";
  const numMedia = Number(params.get("NumMedia") ?? "0");
  const media = [];
  for (let i = 0; i < numMedia; i++) {
    media.push({
      url: params.get(`MediaUrl${i}`) ?? "",
      contentType: params.get(`MediaContentType${i}`) ?? "",
    });
  }
  return {
    channel,
    from: from.replace(/^whatsapp:/, ""),
    body: (params.get("Body") ?? "").trim(),
    media,
    providerId: params.get("MessageSid"),
  };
}

function roleFor(from: string, cfg: Map<string, string>): Role {
  if (from === cfg.get("owner_number")) return "owner";
  if (from === cfg.get("test_customer_number")) return "customer";
  return "unknown";
}

// ---------------------------------------------------------------------------
// Intent parsing
// ---------------------------------------------------------------------------

async function parseIntent(body: string, cfg: Map<string, string>): Promise<Intent> {
  // Cheap pass first: rules handle the obvious cases (approvals, rejects,
  // clear quote commands) at zero cost and zero latency.
  const ruled = parseIntentRules(body);
  const needsModel =
    ruled.intent === "other" ||
    (ruled.intent === "prepare_quote" && (!ruled.customer_name || !ruled.work));
  if (!needsModel) return ruled;

  const anthropicKey = cfg.get("anthropic_api_key");
  if (anthropicKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 256,
          system:
            "Classify a trades-business owner's text to their assistant. " +
            "prepare_quote = they want a quote drafted for a customer. " +
            "approve = they OK the pending draft. reject = stop/change the draft. " +
            "customer_action = they want something asked/said/done with the customer. " +
            "other = anything else. Always respond via the classify tool.",
          tools: [
            {
              name: "classify",
              description: "Report the classified intent and extracted slots.",
              input_schema: {
                type: "object",
                properties: {
                  intent: {
                    type: "string",
                    enum: [
                      "prepare_quote",
                      "approve",
                      "reject",
                      "customer_action",
                      "other",
                    ],
                  },
                  customer_name: { type: "string" },
                  work: { type: "string" },
                },
                required: ["intent"],
              },
            },
          ],
          tool_choice: { type: "tool", name: "classify" },
          messages: [{ role: "user", content: body }],
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const toolUse = (json.content ?? []).find(
          (c: { type: string }) => c.type === "tool_use"
        );
        const parsed = IntentSchema.safeParse(toolUse?.input ?? {});
        if (parsed.success) return parsed.data;
      }
    } catch (_) {
      // Fall through to OpenAI / rules
    }
  }

  const apiKey = cfg.get("openai_api_key");
  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                'Classify a trades-business owner\'s text to their assistant. ' +
                'Return JSON {"intent":"prepare_quote|approve|reject|other",' +
                '"customer_name":string|null,"work":string|null}. ' +
                "prepare_quote = they want a quote drafted for a customer. " +
                "approve = they OK the pending draft. reject = stop/change the draft. " +
                "other = anything else.",
            },
            { role: "user", content: body },
          ],
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const parsed = IntentSchema.safeParse(
          JSON.parse(json.choices?.[0]?.message?.content ?? "{}")
        );
        if (parsed.success) return parsed.data;
      }
    } catch (_) {
      // Fall through to rules result
    }
  }
  return ruled;
}

function parseIntentRules(body: string): Intent {
  const t = body.trim();
  if (/^(yes+|y|send|send it|approve|approved|looks good|go ahead|ok|okay|do it)\b/i.test(t)) {
    return { intent: "approve" };
  }
  if (/^(no|n|don't|do not|stop|hold|wait|cancel|change)\b/i.test(t)) {
    return { intent: "reject" };
  }
  const q = t.match(/quot/i);
  if (q) {
    let customer: string | undefined;
    let work: string | undefined;
    const forMatch = t.match(/for\s+([A-Z][a-z]+(?:'s)?)\s*(.*)$/);
    if (forMatch) {
      customer = forMatch[1].replace(/'s$/, "");
      work = forMatch[2].replace(/^(a|an|the|new|their)\s+/i, "").trim();
      if (!work) work = "job";
    }
    return { intent: "prepare_quote", customer_name: customer, work };
  }
  return { intent: "other" };
}

// Voice a templated reply through Haiku for conversational (non-artifact)
// replies only. Quotes and state confirmations stay strictly templated.
// client_brief (config) injects per-client ground truth — who travels,
// services, tone — as authoritative facts.
async function voiceReply(instruction: string, cfg: Map<string, string>): Promise<string> {
  const key = cfg.get("anthropic_api_key");
  if (!key) return instruction;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 120,
        system:
          ASSISTANT_PERSONA +
          (cfg.get("client_brief")
            ? ` Business facts (authoritative): ${cfg.get("client_brief")}`
            : "") +
          " The message describes what to say — reply naturally, never " +
          "robotically or identically twice. Keep every fact identical to the " +
          "instruction. Never invent prices, names or promises. Output only " +
          "the reply text.",
        messages: [{ role: "user", content: instruction }],
      }),
    });
    if (res.ok) {
      const json = await res.json();
      const text = (json.content ?? [])
        .filter((c: { type: string }) => c.type === "text")
        .map((c: { text: string }) => c.text)
        .join("")
        .trim();
      if (text) return text;
    }
  } catch (_) {
    // fallback
  }
  return instruction;
}

// Customer intake: one Haiku call returns the reply AND the captured enquiry
// state. `complete` flips true once name + postcode + job are all present —
// that event is what notifies the owner.
async function customerReply(
  transcript: string,
  cfg: Map<string, string>
): Promise<CustomerReply> {
  const key = cfg.get("anthropic_api_key");
  const fallback =
    "Thanks for your message — this is Sortme, the Sorted assistant. We'll pass this on to the team.";
  if (!key) return { reply_text: fallback, complete: false };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 300,
        system:
          ASSISTANT_PERSONA +
          " You are handling a customer enquiry for a trades business by text. " +
          "Reply like a person texting, not a call centre. Collect name, " +
          "postcode and what they need — never re-ask for anything already in " +
          "the transcript, and don't echo details back each turn. Confirm once " +
          "when complete. Never give prices, timescales or promises. " +
          "Always respond via the respond tool.",
        tools: [
          {
            name: "respond",
            description: "Send the reply and report captured enquiry state.",
            input_schema: {
              type: "object",
              properties: {
                reply_text: { type: "string" },
                complete: { type: "boolean" },
                name: { type: "string" },
                postcode: { type: "string" },
                job: { type: "string" },
              },
              required: ["reply_text", "complete"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "respond" },
        messages: [
          {
            role: "user",
            content: `Conversation so far:\n${transcript}\n\nReply to the latest message.`,
          },
        ],
      }),
    });
    if (res.ok) {
      const json = await res.json();
      const toolUse = (json.content ?? []).find(
        (c: { type: string }) => c.type === "tool_use"
      );
      const parsed = CustomerReplySchema.safeParse(toolUse?.input ?? {});
      if (parsed.success) return parsed.data;
    }
  } catch (_) {
    // fallback below
  }
  return { reply_text: fallback, complete: false };
}

// ---------------------------------------------------------------------------
// Operators (pure-ish; the shape stays identical when we move to Inngest)
// ---------------------------------------------------------------------------

async function runQuoteOperator(
  intent: Intent,
  customerPhone: string | undefined
): Promise<{ draftText: string; lineItems: unknown[]; totalPence: number; missing: string[] }> {
  const { data: prices } = await db.from("assistant_price_book").select("*");
  const book = new Map((prices ?? []).map((p) => [p.item, p]));

  const missing: string[] = [];
  if (!intent.customer_name) missing.push("customer_name");
  if (!intent.work) missing.push("work");
  if (missing.length) return { draftText: "", lineItems: [], totalPence: 0, missing };

  const work = (intent.work ?? "").toLowerCase();
  const items: Array<{ label: string; price_pence: number }> = [];
  if (/boiler|service/.test(work)) items.push(book.get("boiler_service")!);
  else items.push(book.get("call_out")!, book.get("hourly")!);
  if (/urgent|asap|emergency/.test(work)) items.push(book.get("urgent")!);
  const cleaned = items.filter(Boolean);
  const total = cleaned.reduce((s, i) => s + i.price_pence, 0);

  const lines = cleaned.map((i) => `${i.label} — £${(i.price_pence / 100).toFixed(2)}`);
  const draftText =
    `Hi ${intent.customer_name}, thanks for your enquiry.\n` +
    `${lines.join("\n")}\n` +
    `Total: £${(total / 100).toFixed(2)} (incl. VAT)\n` +
    `Let me know if you'd like to go ahead — Sortme`;
  void customerPhone;
  return { draftText, lineItems: cleaned, totalPence: total, missing };
}

// ---------------------------------------------------------------------------
// Messaging
// ---------------------------------------------------------------------------

async function sendSms(
  to: string,
  body: string,
  cfg: Map<string, string>
): Promise<{ dryRun: boolean; detail: string }> {
  const live = cfg.get("live_sms") === "true";
  const sid = cfg.get("twilio_account_sid");
  const token = cfg.get("twilio_auth_token");
  const from = cfg.get("twilio_from_number");
  if (!live || !sid || !token || !from) {
    return { dryRun: true, detail: "dry_run" };
  }
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(`${sid}:${token}`),
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  });
  return res.ok
    ? { dryRun: false, detail: `twilio_ok` }
    : { dryRun: false, detail: `twilio_error:${res.status}` };
}

async function recordOutbound(
  conversationId: number,
  to: string,
  body: string,
  sent: { dryRun: boolean; detail: string }
) {
  await db.from("assistant_messages").insert({
    conversation_id: conversationId,
    direction: "out",
    body,
    sender_phone: to,
    dry_run: sent.dryRun,
    meta: { delivery: sent.detail },
  });
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const cfg = await getConfig();
  const key = new URL(req.url).searchParams.get("key");
  if (cfg.get("webhook_key") && key !== cfg.get("webhook_key")) {
    return new Response("Forbidden", { status: 403 });
  }

  const params = new URLSearchParams(await req.text());
  const msg = normaliseTwilio(params);
  if (!msg.from || (!msg.body && !msg.media.length)) {
    return twiml();
  }

  const role = roleFor(msg.from, cfg);
  let { data: convo } = await db
    .from("assistant_conversations")
    .select("id")
    .eq("phone", msg.from)
    .eq("channel", msg.channel)
    .maybeSingle();
  if (!convo) {
    const ins = await db
      .from("assistant_conversations")
      .insert({ phone: msg.from, role, channel: msg.channel })
      .select("id")
      .single();
    convo = ins.data;
  }
  if (!convo) return twiml();

  await db.from("assistant_messages").insert({
    conversation_id: convo.id,
    direction: "in",
    body: msg.body || "[media message]",
    sender_phone: msg.from,
    channel: msg.channel,
    meta: { provider_id: msg.providerId, media: msg.media },
  });

  const intent = await parseIntent(msg.body, cfg);
  let reply = "";
  const customerPhone = cfg.get("test_customer_number");

  if (role !== "owner") {
    // Customers and unknown numbers never touch job state — but they do get
    // a contextual reply. Pass the thread so Sortme knows what it already
    // collected and never re-asks for name/postcode.
    const { data: history } = await db
      .from("assistant_messages")
      .select("direction, body")
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: true })
      .limit(20);
    const transcript = (history ?? [])
      .map((m) => `${m.direction === "in" ? "Customer" : "You"}: ${m.body}`)
      .join("\n");
    const cr = await customerReply(transcript, cfg);
    reply = cr.reply_text;

    // Enquiry complete → record the job and notify the owner. One open
    // enquiry per conversation so follow-up texts don't re-fire the alert.
    if (cr.complete) {
      const { data: openEnquiries } = await db
        .from("assistant_jobs")
        .select("id")
        .eq("owner_conversation_id", convo.id)
        .eq("kind", "enquiry")
        .eq("status", "open");
      if (!openEnquiries?.length) {
        await db.from("assistant_jobs").insert({
          owner_conversation_id: convo.id,
          kind: "enquiry",
          status: "open",
          title: `${cr.name ?? "Customer"} — ${cr.job ?? "enquiry"}`,
          details: {
            state: "captured",
            name: cr.name,
            postcode: cr.postcode,
            job: cr.job,
            phone: msg.from,
          },
        });
        const ownerNumber = cfg.get("owner_number");
        if (ownerNumber) {
          let { data: ownerConvo } = await db
            .from("assistant_conversations")
            .select("id")
            .eq("phone", ownerNumber)
            .eq("channel", msg.channel)
            .maybeSingle();
          if (!ownerConvo) {
            const ins = await db
              .from("assistant_conversations")
              .insert({ phone: ownerNumber, role: "owner", channel: msg.channel })
              .select("id")
              .single();
            ownerConvo = ins.data;
          }
          if (ownerConvo) {
            const note =
              `New enquiry — ${cr.name ?? "unknown"} · ` +
              `${cr.job ?? "job"} · ${cr.postcode ?? "no postcode"} · ${msg.from}`;
            const noteSent = await sendSms(ownerNumber, note, cfg);
            await recordOutbound(ownerConvo.id, ownerNumber, note, noteSent);
          }
        }
      }
    }

    // Pending-question link: if this customer has an enquiry in
    // awaiting_customer, this inbound is the answer — forward it to the
    // owner and flip the state so it only fires once.
    const { data: awaiting } = await db
      .from("assistant_jobs")
      .select("id, details")
      .eq("owner_conversation_id", convo.id)
      .eq("kind", "enquiry")
      .eq("status", "open")
      .filter("details->>state", "eq", "awaiting_customer")
      .order("created_at", { ascending: false })
      .limit(1);
    const pendingEnquiry = awaiting?.[0];
    if (pendingEnquiry) {
      const d = pendingEnquiry.details as {
        name?: string;
        awaiting?: string;
        asked?: string;
      };
      const ownerNumber = cfg.get("owner_number");
      if (ownerNumber) {
        let { data: ownerConvo } = await db
          .from("assistant_conversations")
          .select("id")
          .eq("phone", ownerNumber)
          .eq("channel", msg.channel)
          .maybeSingle();
        if (!ownerConvo) {
          const ins = await db
            .from("assistant_conversations")
            .insert({ phone: ownerNumber, role: "owner", channel: msg.channel })
            .select("id")
            .single();
          ownerConvo = ins.data;
        }
        if (ownerConvo) {
          const note =
            `${d.name ?? "Customer"} replied to your question ` +
            `("${d.awaiting ?? "their availability"}"): "${msg.body}"`;
          const noteSent = await sendSms(ownerNumber, note, cfg);
          await recordOutbound(ownerConvo.id, ownerNumber, note, noteSent);
        }
      }
      await db
        .from("assistant_jobs")
        .update({
          details: {
            ...(pendingEnquiry.details as object),
            state: "answered",
            answer: msg.body,
          },
        })
        .eq("id", pendingEnquiry.id);
    }
  } else if (intent.intent === "prepare_quote") {
    const op = await runQuoteOperator(intent, customerPhone);
    if (op.missing.length) {
      const wants = op.missing.includes("customer_name")
        ? "which customer the quote is for"
        : "what work the quote covers";
      reply = await voiceReply(
        `The owner asked for a quote but didn't say ${wants}. ` +
          `Ask for it briefly. Their message was: "${msg.body}"`,
        cfg
      );
    } else {
      const { data: job } = await db
        .from("assistant_jobs")
        .insert({
          owner_conversation_id: convo.id,
          kind: "quote",
          status: "open",
          title: `${intent.customer_name} — ${intent.work}`,
        })
        .select("id")
        .single();
      if (job) {
        await db.from("assistant_quote_drafts").insert({
          job_id: job.id,
          customer_name: intent.customer_name,
          customer_phone: customerPhone,
          line_items: op.lineItems,
          total_pence: op.totalPence,
          status: "awaiting_owner",
        });
      }
      reply =
        `Draft for ${intent.customer_name}:\n${op.draftText}\n` +
        `Reply 'send it' to send to the customer, or tell me what to change.`;
    }
  } else if (intent.intent === "approve") {
    // Sender is confirmed owner above; find the pending draft.
    const { data: pending } = await db
      .from("assistant_quote_drafts")
      .select("id, customer_name, customer_phone")
      .eq("status", "awaiting_owner")
      .order("created_at", { ascending: false })
      .limit(1);
    const draft = pending?.[0];
    if (!draft) {
      reply = await voiceReply(
        "Tell the owner there's nothing waiting to send — no open drafts.",
        cfg
      );
    } else {
      await db
        .from("assistant_quote_drafts")
        .update({ status: "approved", approved_by_phone: msg.from, updated_at: new Date().toISOString() })
        .eq("id", draft.id);
      const to = draft.customer_phone ?? customerPhone ?? msg.from;
      const { data: fullDraft } = await db
        .from("assistant_quote_drafts")
        .select("line_items, total_pence, customer_name")
        .eq("id", draft.id)
        .single();
      const lines = (fullDraft?.line_items ?? []).map(
        (i: { label: string; price_pence: number }) =>
          `${i.label} — £${(i.price_pence / 100).toFixed(2)}`
      );
      const customerText =
        `Hi ${draft.customer_name}, thanks for your enquiry.\n` +
        `${lines.join("\n")}\n` +
        `Total: £${((fullDraft?.total_pence ?? 0) / 100).toFixed(2)} (incl. VAT)\n` +
        `Let me know if you'd like to go ahead.`;
      const sent = await sendSms(to, customerText, cfg);
      await db
        .from("assistant_quote_drafts")
        .update({ status: "sent", sent_to_phone: to, updated_at: new Date().toISOString() })
        .eq("id", draft.id);
      // Record the customer-facing send on the customer's conversation too.
      const { data: custConvo } = await db
        .from("assistant_conversations")
        .select("id")
        .eq("phone", to)
        .eq("channel", msg.channel)
        .maybeSingle();
      if (custConvo) {
        await recordOutbound(custConvo.id, to, customerText, sent);
      }
      reply = await voiceReply(
        `Tell the owner the quote for ${draft.customer_name} has been sent ` +
          `to the customer. Delivery detail: ${sent.detail}.`,
        cfg
      );
    }
  } else if (intent.intent === "customer_action") {
    // Owner wants something relayed to the customer: ask a question, pass a
    // message, nudge them. Route to the most recent open enquiry.
    const { data: openEnquiries } = await db
      .from("assistant_jobs")
      .select("id, title, details")
      .eq("kind", "enquiry")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(1);
    const enquiry = openEnquiries?.[0];
    const targetPhone = enquiry?.details?.phone ?? customerPhone;
    if (!enquiry || !targetPhone) {
      reply = await voiceReply(
        `The owner wants to do this: "${msg.body}" — but there's no open ` +
          "enquiry to act on yet. Tell them briefly there's no customer waiting.",
        cfg
      );
    } else {
      const name = (enquiry.details as { name?: string })?.name ?? "the customer";
      const customerText = await voiceReply(
        `Relay the owner's instruction to ${name} as Sortme. ` +
          `Their instruction: "${msg.body}". Keep it as a question or request ` +
          "to the customer — natural, brief, no prices or promises. " +
          "Perspective: we travel to the customer; they never come to us. " +
          "If the owner's wording implies the customer moves (\"can you get " +
          "round to them\", \"come over\"), rewrite it as us going to them: " +
          "\"we'll get someone round to you\".",
        cfg
      );
      const sentToCustomer = await sendSms(targetPhone, customerText, cfg);
      const { data: custConvo } = await db
        .from("assistant_conversations")
        .select("id")
        .eq("phone", targetPhone)
        .eq("channel", msg.channel)
        .maybeSingle();
      if (custConvo) {
        await recordOutbound(custConvo.id, targetPhone, customerText, sentToCustomer);
      }
      // Pending-question link: the customer's next inbound answers this.
      await db
        .from("assistant_jobs")
        .update({
          details: {
            ...(enquiry.details as object),
            state: "awaiting_customer",
            awaiting: msg.body,
            asked: customerText,
          },
        })
        .eq("id", enquiry.id);
      reply = await voiceReply(
        `Tell the owner you've sent this to ${name}: "${customerText}" ` +
          "(confirm briefly, don't repeat the whole thing word for word).",
        cfg
      );
    }
  } else if (intent.intent === "reject") {
    const { data: pending } = await db
      .from("assistant_quote_drafts")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("status", "awaiting_owner")
      .select("id");
    reply = await voiceReply(
      pending?.length
        ? "Tell the owner you've scrapped that draft and they can text a new job whenever."
        : "Tell the owner there's nothing waiting to send.",
      cfg
    );
  } else {
    reply = await voiceReply(
      `The owner texted: "${msg.body}". They haven't given a job yet. ` +
        "Ask them, warmly and briefly, what they'd like handled — e.g. preparing a quote for a customer.",
      cfg
    );
  }

  const sent = await sendSms(msg.from, reply, cfg);
  await recordOutbound(convo.id, msg.from, reply, sent);
  return twiml();
});

function twiml() {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
