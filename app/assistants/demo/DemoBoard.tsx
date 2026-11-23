"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { getAttribution } from "../../../lib/attribution";

type Message = {
  direction: "in" | "out";
  body: string;
  dry_run: boolean;
  created_at: string;
};

type Convo = {
  id: number;
  role: string;
  channel: string;
  phone_mask: string;
  last_at: string | null;
  messages: Message[];
};

type Job = {
  id: number;
  kind: string;
  status: string;
  created_at: string;
  details?: {
    state?: string;
    name?: string;
    job?: string;
  } | null;
};

const WEBHOOK_URL =
  "https://qweevancxedkkfxysnzq.supabase.co/functions/v1/assistant-inbound?key=sorted-assistant-demo-2026";

const PHONES = {
  customer: "+447000000002",
  owner: "+447000000001",
};

const STEPS = ["Enquiry", "Owner's decision", "Customer's reply"];

// Canned auto-demo: plays the whole loop locally, zero API calls.
const SCRIPT: Array<{
  view: "customer" | "owner";
  direction: "in" | "out";
  body: string;
  delay: number;
  action?: "enquiry" | "switch_owner" | "reply_ready" | "done";
}> = [
  { view: "customer", direction: "in", body: "Hi, can I book a boiler service?", delay: 600 },
  { view: "customer", direction: "out", body: "Of course — what's your name and postcode?", delay: 1400 },
  { view: "customer", direction: "in", body: "Sam. CV32 7RR.", delay: 1600 },
  { view: "customer", direction: "out", body: "Thanks Sam — got you down for a boiler service. Someone'll be in touch shortly.", delay: 1400, action: "enquiry" },
  { view: "owner", direction: "out", body: "New enquiry — Sam · boiler service · CV32 7RR · ···0002", delay: 900 },
  { view: "owner", direction: "in", body: "ask when they're free this week", delay: 2000 },
  { view: "owner", direction: "out", body: "Done — asked Sam when works. You'll hear when they reply.", delay: 1400 },
  { view: "customer", direction: "out", body: "Which day suits you this week for us to call round?", delay: 400, action: "reply_ready" },
];

export default function DemoBoard() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [view, setView] = useState<"customer" | "owner">("customer");
  const [step, setStep] = useState(0);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [leadJob, setLeadJob] = useState("");
  const [leadBiz, setLeadBiz] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [leadConsent, setLeadConsent] = useState(false);
  const [leadStatus, setLeadStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [optimistic, setOptimistic] = useState<Message | null>(null);
  const ownerSwitchAt = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scripted demo state (local, no API).
  const [scripted, setScripted] = useState(false);
  const [scriptedMsgs, setScriptedMsgs] = useState<Record<"customer" | "owner", Message[]>>({
    customer: [],
    owner: [],
  });
  const [scriptedEnquiry, setScriptedEnquiry] = useState(false);
  const [scriptedReply, setScriptedReply] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const load = async () => {
    const { data } = await supabase.rpc("assistant_demo_overview");
    setJobs(data?.jobs ?? []);
    setConvos(data?.conversations ?? []);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const enquiry =
    jobs.find((j) => j.kind === "enquiry" && j.status === "open") ??
    (scriptedEnquiry
      ? { id: -1, kind: "enquiry", status: "open", created_at: "", details: { name: "Sam", job: "boiler service" } }
      : undefined);
  const customerConvo = convos.find((c) => c.role !== "owner");
  const ownerConvo = convos.find((c) => c.role === "owner");
  const activeConvo = view === "customer" ? customerConvo : ownerConvo;
  const messages: Message[] = scripted
    ? scriptedMsgs[view]
    : [...(activeConvo?.messages ?? []), ...(optimistic ? [optimistic] : [])];

  // Step 3 ready: the customer received an outbound message after the owner
  // took over (a relayed question or a sent quote).
  const customerReplied =
    scriptedReply ||
    (!!ownerSwitchAt.current &&
      (customerConvo?.messages ?? []).some(
        (m) => m.direction === "out" && m.created_at > ownerSwitchAt.current!
      ));

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, sending]);

  const sendText = async () => {
    const body = text.trim();
    if (!body || sending || scripted) return;
    // Optimistic: the sent bubble lands immediately; dots hold for the reply.
    setOptimistic({
      direction: "in",
      body,
      dry_run: false,
      created_at: new Date().toISOString(),
    });
    setText("");
    setSending(true);
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          From: PHONES[view],
          Body: body,
          MessageSid: `SMdemo${Date.now()}`,
        }).toString(),
      });
      await load();
    } finally {
      setOptimistic(null);
      setSending(false);
    }
  };

  // Scripted walkthrough: canned messages, paced like a real text exchange,
  // zero API calls.
  const runScript = () => {
    setScripted(true);
    setScriptedMsgs({ customer: [], owner: [] });
    setScriptedEnquiry(false);
    setScriptedReply(false);
    setView("customer");
    setStep(0);
    let t = 0;
    for (const s of SCRIPT) {
      t += s.delay;
      timers.current.push(
        setTimeout(() => {
          setScriptedMsgs((prev) => ({
            ...prev,
            [s.view]: [
              ...prev[s.view],
              { direction: s.direction, body: s.body, dry_run: false, created_at: new Date().toISOString() },
            ],
          }));
          if (s.action === "enquiry") setScriptedEnquiry(true);
          if (s.action === "reply_ready") setScriptedReply(true);
        }, t)
      );
    }
  };

  const resetDemo = async () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setScripted(false);
    setScriptedMsgs({ customer: [], owner: [] });
    setScriptedEnquiry(false);
    setScriptedReply(false);
    setOptimistic(null);
    await supabase.rpc("assistant_demo_reset", {
      p_key: "sorted-assistant-demo-2026",
    });
    setView("customer");
    setStep(0);
    ownerSwitchAt.current = null;
    await load();
  };

  const continueAsOwner = () => {
    ownerSwitchAt.current = new Date().toISOString();
    setView("owner");
    setStep(1);
  };

  const seeCustomerReply = () => {
    setView("customer");
    setStep(2);
  };

  const submitLead = async () => {
    const business = leadBiz.trim() || businessName.trim() || nameDraft.trim();
    if (!leadJob.trim() || !business || !leadContact.trim() || !leadConsent) return;
    const valid =
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(leadContact.trim()) ||
      (leadContact.match(/\d/g) ?? []).length >= 7;
    if (!valid) return;
    setLeadStatus("sending");
    const attribution = getAttribution();
    const { error } = await supabase.rpc("submit_assistant_demo_lead", {
      p_job: leadJob.trim(),
      p_business: business,
      p_contact: leadContact.trim(),
      p_consent: true,
      p_utm_source: attribution.utm_source,
      p_utm_medium: attribution.utm_medium,
      p_utm_campaign: attribution.utm_campaign,
    });
    setLeadStatus(error ? "error" : "done");
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-5 py-12 text-[#0A0A0A]">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Text it.
          <br />
          Watch it <span className="bg-[#D9F24F] px-1">work.</span>
        </h1>
        <p className="mt-4 text-base text-[#525252]">
          Be the customer. See what your assistant handles.
        </p>

        {/* Step indicator */}
        <div className="mt-8 flex items-center justify-center gap-4">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    i === step
                      ? "bg-[#0A0A0A] text-white"
                      : i < step
                        ? "bg-neutral-300 text-white"
                        : "bg-neutral-200 text-[#A3A3A3]"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`text-sm ${i === step ? "font-semibold" : "text-[#A3A3A3]"}`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="h-px w-8 bg-neutral-300" />
              )}
            </div>
          ))}
        </div>

        {/* Business name — their assistant, not ours */}
        {!businessName && step === 0 && !scripted && messages.length === 0 && (
          <div className="mx-auto mt-10 flex max-w-xs items-center gap-2">
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && nameDraft.trim()) {
                  setBusinessName(nameDraft.trim());
                }
              }}
              placeholder="What business is this for?"
              className="min-w-0 flex-1 rounded-lg border border-black/[0.12] bg-white px-4 py-2.5 text-left text-sm outline-none focus:border-black/[0.3]"
            />
            <button
              onClick={() => nameDraft.trim() && setBusinessName(nameDraft.trim())}
              disabled={!nameDraft.trim()}
              className="rounded-lg bg-[#0A0A0A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] disabled:opacity-40"
            >
              Set
            </button>
          </div>
        )}
        {businessName && (
          <p className="mt-8 text-xs text-[#A3A3A3]">
            {businessName}'s assistant{" "}
            <button
              onClick={() => {
                setBusinessName("");
                setNameDraft("");
              }}
              className="underline underline-offset-2 hover:text-[#0A0A0A]"
            >
              change
            </button>
          </p>
        )}

        {/* Phone label */}
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-[#A3A3A3]">
          {view === "customer" ? "Customer's phone" : "Owner's phone"}
        </p>

        {/* Phone frame */}
        <div className="mx-auto mt-3 w-[340px] overflow-hidden rounded-[2.75rem] border-[5px] border-[#111] bg-white text-left shadow-xl">
          {/* Status bar + notch */}
          <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold">
            <span>9:41</span>
            <span className="h-5 w-20 rounded-full bg-[#111]" />
            <span className="flex gap-1">
              <span className="h-2.5 w-3 rounded-sm bg-[#111]" />
            </span>
          </div>
          {/* Contact header */}
          <div className="border-b border-black/[0.08] px-4 pb-3 pt-2 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#0A0A0A] text-sm font-bold text-white">
              S
            </div>
            <p className="mt-1 text-sm font-semibold">
              {businessName || "Your Business"}
            </p>
            <p className="text-[11px] text-[#A3A3A3]">AI assistant</p>
          </div>
          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex h-[380px] flex-col gap-2 overflow-y-auto px-4 py-4"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.direction === "in" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-snug ${
                    m.direction === "in"
                      ? "bg-[#0A84FF] text-white"
                      : "bg-[#E9E9EB] text-[#0A0A0A]"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl bg-[#E9E9EB] px-4 py-3">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-2 w-2 animate-bounce rounded-full bg-[#8E8E93]"
                      style={{ animationDelay: `${d * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            {!messages.length && (
              <p className="mt-16 text-center text-xs text-[#A3A3A3]">
                {view === "customer"
                  ? "No messages yet — ask about a job to start."
                  : "Nothing here yet."}
              </p>
            )}
          </div>
          {/* Input */}
          <div className="flex items-center gap-2 border-t border-black/[0.06] px-3 py-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendText()}
              placeholder={
                scripted
                  ? "Watching it run…"
                  : view === "customer"
                    ? "Text the business…"
                    : "Instruct your assistant…"
              }
              disabled={sending || scripted}
              className="min-w-0 flex-1 rounded-full border border-black/[0.12] px-4 py-2.5 text-sm outline-none focus:border-black/[0.3] disabled:bg-neutral-100"
            />
            <button
              onClick={sendText}
              disabled={!text.trim() || sending || scripted}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D9F24F] text-[#0A0A0A] transition hover:bg-[#cbe33f] disabled:opacity-40"
              aria-label="Send"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Not sure? scripted walkthrough */}
        {step === 0 && !enquiry && !scripted && messages.length === 0 && (
          <button
            onClick={runScript}
            className="mt-6 text-sm text-[#525252] underline underline-offset-4 hover:text-[#0A0A0A]"
          >
            Not sure what to say? Watch it run.
          </button>
        )}

        {/* Handover prompts */}
        {step === 0 && enquiry && (
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-black/[0.08] bg-white p-5 text-left">
            <p className="text-sm font-semibold">Now you're the owner.</p>
            <p className="mt-1 text-sm text-[#737373]">
              Sortme has captured{" "}
              {enquiry.details?.name ? `${enquiry.details.name}'s` : "a"}{" "}
              enquiry
              {enquiry.details?.job ? ` — ${enquiry.details.job}` : ""}.
              Continue to the owner's phone to follow the conversation and
              decide what happens next.
            </p>
            <button
              onClick={continueAsOwner}
              className="mt-4 w-full rounded-lg bg-[#0A0A0A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]"
            >
              Continue as the owner →
            </button>
          </div>
        )}

        {step === 1 && customerReplied && (
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-black/[0.08] bg-white p-5 text-left">
            <p className="text-sm font-semibold">
              Your customer heard from you.
            </p>
            <p className="mt-1 text-sm text-[#737373]">
              Sortme passed your instruction on — continue back to the
              customer's phone to see what landed.
            </p>
            <button
              onClick={seeCustomerReply}
              className="mt-4 w-full rounded-lg bg-[#0A0A0A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]"
            >
              See what your customer received →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto mt-8 max-w-md">
            <h2 className="text-3xl font-extrabold tracking-tight">
              That's the loop.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#525252]">
              The customer asks. Sortme captures it and puts it on the owner's
              phone. The owner decides. The customer hears back. No apps, no
              accounts, no AI vocabulary — just texts.
            </p>
            <button
              onClick={resetDemo}
              className="mt-5 rounded-lg bg-[#0A0A0A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]"
            >
              Run it again
            </button>
          </div>
        )}

        <p className="mt-8 text-xs text-[#A3A3A3]">
          A practice conversation on the real assistant. Messages show as dry
          run until the SMS line is connected.
        </p>
        <button
          onClick={resetDemo}
          className="mt-3 text-sm text-[#525252] underline underline-offset-4 hover:text-[#0A0A0A]"
        >
          Start again
        </button>

        {/* CTA */}
        <div className="mt-16 border-t border-black/[0.08] pt-14">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Let's discuss and build
            <br />
            your <span className="bg-[#D9F24F] px-1">first assistant.</span>
          </h2>
          <ul className="mx-auto mt-8 max-w-sm space-y-3 text-left">
            {[
              "We learn the job you need filled",
              "We learn how your business runs",
              "You get a working demo — like this one",
              "You approve it",
              "We put it to work",
            ].map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-[#C4C4C4] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold text-[#0A0A0A]">{s}</span>
              </li>
            ))}
          </ul>
          {/* Lead capture */}
          {leadStatus === "done" ? (
            <div className="mx-auto mt-10 max-w-sm rounded-xl border border-black/[0.08] bg-white p-6">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-black/45">
                Got it.
              </p>
              <p className="mt-3 text-base font-semibold leading-snug">
                &ldquo;{leadJob.trim()}&rdquo;
              </p>
              <p className="mt-2 text-sm text-[#737373]">
                We'll be in touch to set up an assistant for it.
              </p>
            </div>
          ) : (
            <div className="mx-auto mt-10 max-w-sm rounded-xl border border-black/[0.08] bg-white p-6 text-left">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-black/45">
                Tell us the job — we'll build your demo
              </p>
              <input
                value={leadJob}
                onChange={(e) => setLeadJob(e.target.value)}
                placeholder="e.g. answer new enquiries"
                maxLength={280}
                className="mt-4 w-full rounded-lg border border-black/[0.12] px-4 py-2.5 text-sm outline-none focus:border-black/[0.3]"
              />
              <input
                value={leadBiz || businessName}
                onChange={(e) => setLeadBiz(e.target.value)}
                placeholder="Business name"
                maxLength={120}
                className="mt-2.5 w-full rounded-lg border border-black/[0.12] px-4 py-2.5 text-sm outline-none focus:border-black/[0.3]"
              />
              <input
                value={leadContact}
                onChange={(e) => setLeadContact(e.target.value)}
                placeholder="Mobile number or email"
                maxLength={160}
                className="mt-2.5 w-full rounded-lg border border-black/[0.12] px-4 py-2.5 text-sm outline-none focus:border-black/[0.3]"
              />
              <label className="mt-4 flex cursor-pointer items-start gap-3 text-left text-[13px] font-semibold leading-snug text-black/70">
                <input
                  type="checkbox"
                  checked={leadConsent}
                  onChange={(e) => setLeadConsent(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-black"
                />
                Sorted can contact me about this.
              </label>
              {leadStatus === "error" && (
                <p className="mt-3 text-xs font-semibold text-[#b00020]">
                  Something went wrong — try again or book a call below.
                </p>
              )}
              <button
                onClick={submitLead}
                disabled={
                  leadStatus === "sending" ||
                  !leadJob.trim() ||
                  !(leadBiz.trim() || businessName.trim()) ||
                  !leadContact.trim() ||
                  !leadConsent
                }
                className="mt-5 w-full rounded-lg bg-[#0A0A0A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] disabled:opacity-40"
              >
                {leadStatus === "sending" ? "Sending…" : "Send my job"}
              </button>
            </div>
          )}

          <p className="mt-8 font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3]">
            or
          </p>
          <a
            href="https://cal.com/sortmydigital/15min"
            data-track="cta_click"
            data-cta-text="Book a 15-minute call"
            data-cta-location="demo_closing"
            className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#e4ff29] px-8 py-4 text-base font-black text-black transition-colors hover:bg-[#0A0A0A] hover:text-[#e4ff29]"
          >
            Book a 15-minute call →
          </a>
          <p className="mt-4 text-xs text-[#A3A3A3]">
            Fifteen minutes, no commitment — we'll tell you honestly if an
            assistant fits.
          </p>
        </div>
      </div>
    </main>
  );
}
