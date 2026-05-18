"use client"

import { demoSession, type SortedPortalMessage } from "@/lib/sorted-updates"
import { Clock, Paperclip, Send, ShieldCheck } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function SortedChatPage() {
  const [messages, setMessages] = useState<SortedPortalMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "I can help update your site. Tell me what needs changing and I will either apply it safely, prepare a preview, or flag it for Sorted review.",
      created_at: new Date().toISOString(),
    },
  ])
  const [body, setBody] = useState("")
  const [requestedMode, setRequestedMode] = useState<"auto" | "preview">("auto")
  const [isSending, setIsSending] = useState(false)
  const [status, setStatus] = useState("Ready")
  const [showIntro, setShowIntro] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setShowIntro(window.localStorage.getItem("sorted-updates-intro-complete") !== "1")
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function completeIntro() {
    window.localStorage.setItem("sorted-updates-intro-complete", "1")
    setShowIntro(false)
  }

  async function sendMessage() {
    if (!body.trim() || isSending) return
    const messageId = `portal_${Date.now()}`
    const userMessage: SortedPortalMessage = {
      id: messageId,
      role: "user",
      content: body,
      created_at: new Date().toISOString(),
    }
    setMessages((current) => [...current, userMessage])
    setBody("")
    setIsSending(true)
    setStatus("Checking guardrails")

    const response = await fetch("/api/sorted-updates/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session: demoSession,
        message_id: messageId,
        body,
        attachments: [],
        requested_mode: requestedMode,
      }),
    })
    const payload = await response.json()
    const assistant = payload.assistant_message ?? {
      id: `assistant_${messageId}`,
      role: "assistant",
      content: payload.message ?? "The operator backend is not configured yet. Set SORTED_UPDATES_API_URL to enable live dry-runs.",
      created_at: new Date().toISOString(),
    }
    setMessages((current) => [...current, assistant])
    setStatus(payload.status ?? "Backend not configured")
    setIsSending(false)
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#171411]">
      <header className="border-b border-black/10 bg-[#fffaf0]/85 px-6 py-5 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#756c5f]">Sorted Updates</p>
            <h1 className="text-xl font-black tracking-tight">Client portal</h1>
          </div>
          <nav className="flex gap-4 text-sm font-semibold text-[#756c5f]">
            <a href="/sorted/history">History</a>
            <a href="/sorted/preview">Preview</a>
            <a href="/sorted/reset">Reset</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-[1fr_280px]">
        {showIntro ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6 backdrop-blur-sm">
            <div className="max-w-xl rounded-[2rem] bg-[#fffaf0] p-6 text-[#171411] shadow-[0_30px_120px_rgba(0,0,0,0.25)]">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#756c5f]">60 second tour</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">How Sorted Updates works</h2>
              <div className="mt-5 grid gap-3 text-sm leading-relaxed text-[#756c5f]">
                <p><strong className="text-[#171411]">Chat input:</strong> type the change you want and attach files when needed.</p>
                <p><strong className="text-[#171411]">Guardrails:</strong> safe edits can be queued, previews need approval, sensitive work is escalated.</p>
                <p><strong className="text-[#171411]">History and reset:</strong> every request is recorded and the handoff reset point stays protected.</p>
              </div>
              <button onClick={completeIntro} className="mt-6 rounded-full bg-[#171411] px-5 py-3 text-sm font-black text-white">
                Start updating
              </button>
            </div>
          </div>
        ) : null}
        <div className="flex min-h-[70vh] flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_80px_rgba(28,22,14,0.08)]">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-3xl px-5 py-3 text-sm leading-relaxed ${message.role === "user" ? "bg-[#171411] text-white" : "bg-[#f7f4ee] text-[#171411]"}`}>
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="border-t border-black/10 p-4">
            <div className="mb-3 flex gap-2">
              <button onClick={() => setRequestedMode("auto")} className={`rounded-full px-4 py-2 text-xs font-bold ${requestedMode === "auto" ? "bg-[#171411] text-white" : "bg-[#f7f4ee] text-[#756c5f]"}`}>
                Auto-safe
              </button>
              <button onClick={() => setRequestedMode("preview")} className={`rounded-full px-4 py-2 text-xs font-bold ${requestedMode === "preview" ? "bg-[#171411] text-white" : "bg-[#f7f4ee] text-[#756c5f]"}`}>
                Preview first
              </button>
            </div>
            <div className="flex gap-2">
              <button className="rounded-2xl border border-black/10 p-3 text-[#756c5f]">
                <Paperclip className="h-5 w-5" />
              </button>
              <textarea value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  sendMessage()
                }
              }} placeholder="What do you need changed?" className="min-h-12 flex-1 resize-none rounded-2xl border border-black/10 bg-[#fffaf0] px-4 py-3 text-sm outline-none focus:border-black/30" />
              <button onClick={sendMessage} disabled={isSending || !body.trim()} className="rounded-2xl bg-[#171411] p-3 text-white disabled:opacity-40">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-black/10 bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-black">
              <ShieldCheck className="h-4 w-4 text-[#1d7f4f]" />
              Guardrails
            </div>
            <p className="text-sm leading-relaxed text-[#756c5f]">Safe content edits can be queued automatically. Pricing, legal, payment, integrations, brand changes, and deletions are escalated.</p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-[#171411] p-5 text-white">
            <div className="mb-3 flex items-center gap-2 text-sm font-black">
              <Clock className="h-4 w-4" />
              Status
            </div>
            <p className="text-sm text-white/70">{status}</p>
          </div>
        </aside>
      </section>
    </main>
  )
}
