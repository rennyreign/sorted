"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import type { Prospect } from "@/lib/supabase"

type DraftState = "idle" | "generating" | "ready" | "sending" | "sent" | "error"
type NoteState = "idle" | "saving" | "saved"

type EmailDraft = {
  subject: string
  body: string
}

function generateDraft(p: Prospect): EmailDraft {
  const score = p.site_score ?? null
  const reviewUrl = p.review_slug
    ? `https://sortmydigital.site/review/${p.review_slug}`
    : null

  const subject = score !== null
    ? `${p.name}: your website scored ${score}/10`
    : `${p.name}: your website review`

  const body = [
    "Hello!",
    "",
    `We review and modernise small business websites. Your website scored ${score !== null ? score + "/10" : "below average"}.`,
    "",
    "We've put together a review and redesigned it to show where we think it could go next.",
    "",
    reviewUrl
      ? `Both are here: ${reviewUrl}`
      : "Reply and I will send your results over.",
    "",
    "Renaldo",
    "Sorted",
  ].join("\n")

  return { subject, body }
}

export default function OutreachPanel() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Prospect | null>(null)
  const [draft, setDraft] = useState<EmailDraft | null>(null)
  const [draftState, setDraftState] = useState<DraftState>("idle")
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null)
  const [filter, setFilter] = useState<"ready" | "queued" | "all">("ready")
  const [editedSubject, setEditedSubject] = useState("")
  const [editedBody, setEditedBody] = useState("")
  const [noteText, setNoteText] = useState("")
  const [noteState, setNoteState] = useState<NoteState>("idle")

  // API routes only exist on the local dev server
  const apiBase = typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "http://localhost:3000"
    : ""

  // Check Gmail connection status
  useEffect(() => {
    fetch(`${apiBase}/api/gmail/status`)
      .then((r) => r.json())
      .then((d) => setGmailConnected(d.connected))
      .catch(() => setGmailConnected(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load analysed prospects
  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from("prospects")
        .select("*")
        .not("site_score", "is", null)
        .neq("crm_status", "lost")
        .order("site_score", { ascending: false })
        .limit(200)
      if (data) setProspects(data as Prospect[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (filter === "all") return prospects
    if (filter === "ready") return prospects.filter((p) => !!p.review_slug)
    if (filter === "queued") return prospects.filter((p) => !p.review_slug)
    return prospects
  }, [prospects, filter])

  function selectProspect(p: Prospect) {
    setSelected(p)
    setDraft(null)
    setDraftState("idle")
    setEditedSubject("")
    setEditedBody("")
    setNoteText(p.notes ?? "")
    setNoteState("idle")
  }

  async function handleNoteSave() {
    if (!selected) return
    setNoteState("saving")
    await supabase
      .from("prospects")
      .update({ notes: noteText || null })
      .eq("place_id", selected.place_id)
    setProspects(prev =>
      prev.map(p => p.place_id === selected.place_id ? { ...p, notes: noteText || null } : p)
    )
    setNoteState("saved")
    setTimeout(() => setNoteState("idle"), 2000)
  }

  async function handleDismiss(p: Prospect, e: React.MouseEvent) {
    e.stopPropagation()
    // Remove from local state immediately
    setProspects(prev => prev.filter(x => x.place_id !== p.place_id))
    if (selected?.place_id === p.place_id) setSelected(null)
    // Mark as lost in DB so it stays out of the queue
    await supabase
      .from("prospects")
      .update({ crm_status: "lost" })
      .eq("place_id", p.place_id)
  }

  function handleGenerate() {
    if (!selected) return
    setDraftState("generating")
    setTimeout(() => {
      const d = generateDraft(selected)
      setDraft(d)
      setEditedSubject(d.subject)
      setEditedBody(d.body)
      setDraftState("ready")
    }, 600)
  }

  async function handleSendToGmail() {
    if (!draft || !selected) return
    setDraftState("sending")
    try {
      const res = await fetch(`${apiBase}/api/gmail/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selected.email || "",
          subject: editedSubject,
          body: editedBody,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      setDraftState("sent")

      // Mark as contacted in Supabase
      await supabase
        .from("prospects")
        .update({ status: "contacted" })
        .eq("place_id", selected.place_id)

      // Update local state
      setProspects((prev) =>
        prev.map((p) =>
          p.place_id === selected.place_id ? { ...p, status: "contacted" } : p
        )
      )
    } catch (err) {
      console.error(err)
      setDraftState("error")
    }
  }

  function handleConnectGmail() {
    window.location.href = `${apiBase}/api/gmail/auth`
  }

  const counts = useMemo(() => ({
    ready: prospects.filter((p) => !!p.review_slug).length,
    queued: prospects.filter((p) => !p.review_slug).length,
    all: prospects.length,
  }), [prospects])

  return (
    <div className="flex h-[calc(100dvh-3.5rem)]">

      {/* Left — prospect list */}
      <aside className="w-[320px] shrink-0 border-r border-black/[0.06] overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-black/[0.06] px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-3">
            Outreach Queue
          </p>

          {/* Filter tabs */}
          <div className="flex gap-1">
            {(["ready", "queued", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 text-[10px] font-mono uppercase tracking-[0.1em] px-2 py-1.5 rounded-md transition-colors ${
                  filter === f
                    ? "bg-[#0A0A0A] text-[#FAFAFA]"
                    : "text-[#737373] hover:text-[#0A0A0A] hover:bg-black/[0.05]"
                }`}
              >
                {f === "ready" ? `Ready (${counts.ready})` : f === "queued" ? `Queued (${counts.queued})` : `All (${counts.all})`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-5 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-black/[0.04] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">No prospects</p>
              <p className="text-xs text-[#737373]">Run the Website Analyser to score prospects first.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 py-2">
            {filtered.map((p) => (
              <ProspectListItem
                key={p.place_id}
                prospect={p}
                isSelected={selected?.place_id === p.place_id}
                onSelect={() => selectProspect(p)}
                onDismiss={(e) => handleDismiss(p, e)}
              />
            ))}
          </div>
        )}
      </aside>

      {/* Right — email draft */}
      <main className="flex-1 overflow-y-auto">
        {!selected ? (
          <EmptyState />
        ) : (
          <div className="max-w-[720px] mx-auto px-8 pt-10 pb-24">

            {/* Prospect header */}
            <div className="mb-8 pb-8 border-b border-black/[0.06]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-block border rounded-lg px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] font-semibold ${
                      selected.review_slug
                        ? "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]"
                        : "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
                    }`}>
                      {selected.review_slug ? "Ready to send" : "No mockup yet"}
                    </span>
                  </div>
                  <h2 className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight">{selected.name}</h2>
                  <p className="text-[#737373] text-sm mt-1">
                    {[selected.category, selected.city].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-sans font-extrabold text-4xl tracking-tight ${
                    (selected.site_score ?? 0) >= 8 ? "text-[#059669]" :
                    (selected.site_score ?? 0) >= 6 ? "text-[#D97706]" : "text-[#737373]"
                  }`}>
                    {selected.site_score}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3]">prospect score</p>
                </div>
              </div>

              {/* Site weaknesses — pre-send brief */}
              {selected.site_weaknesses && selected.site_weaknesses.length > 0 && (
                <div className="mt-4 bg-[#0A0A0A] rounded-xl px-4 py-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#525252] mb-2">What their review covers</p>
                  <ul className="space-y-1.5">
                    {selected.site_weaknesses.slice(0, 3).map((w, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#525252] mt-0.5 shrink-0">·</span>
                        <span className="text-[#A3A3A3] text-xs leading-relaxed">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact */}
              <div className="mt-4 flex items-center gap-4 flex-wrap">
                {selected.email && (
                  <a href={`mailto:${selected.email}`}
                    className="flex items-center gap-1.5 font-mono text-[11px] text-[#0A0A0A] bg-black/[0.04] border border-black/[0.08] rounded-lg px-3 py-1.5 hover:bg-black/[0.08] transition-colors">
                    <span className="text-[#A3A3A3]">✉</span> {selected.email}
                  </a>
                )}
                {selected.phone && (
                  <a href={`tel:${selected.phone}`}
                    className="flex items-center gap-1.5 font-mono text-[11px] text-[#0A0A0A] bg-black/[0.04] border border-black/[0.08] rounded-lg px-3 py-1.5 hover:bg-black/[0.08] transition-colors">
                    <span className="text-[#A3A3A3]">✆</span> {selected.phone}
                  </a>
                )}
                {selected.website && (
                  <a href={selected.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-mono text-[11px] text-[#737373] hover:text-[#0A0A0A] transition-colors">
                    {selected.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")} ↗
                  </a>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-8 pb-8 border-b border-black/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#A3A3A3]">Notes</label>
                {noteState === "saving" && (
                  <span className="font-mono text-[9px] text-[#A3A3A3]">Saving…</span>
                )}
                {noteState === "saved" && (
                  <span className="font-mono text-[9px] text-[#059669]">Saved</span>
                )}
              </div>
              <textarea
                value={noteText}
                onChange={(e) => { setNoteText(e.target.value); setNoteState("idle") }}
                onBlur={handleNoteSave}
                placeholder="Add a note about this prospect…"
                rows={3}
                className="w-full bg-white border border-black/[0.08] rounded-xl text-[#0A0A0A] text-sm px-4 py-3 outline-none focus:border-black/[0.2] transition-colors resize-none leading-relaxed placeholder:text-[#C4C4C4]"
              />
            </div>

            {/* No email warning */}
            {!selected.email && (
              <div className="mb-6 border border-[#FDE68A] bg-[#FEF3C7] rounded-xl px-4 py-3">
                <p className="text-sm text-[#92400E]">No email address on record for this prospect. You can still draft the email and send manually.</p>
              </div>
            )}

            {/* Gmail connection banner */}
            {gmailConnected === false && draftState === "ready" && (
              <div className="mb-6 border border-black/[0.08] rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#0A0A0A]">Connect Gmail to send drafts</p>
                  <p className="text-xs text-[#737373] mt-0.5">One-time OAuth setup. Drafts go straight to your Gmail inbox.</p>
                </div>
                <button
                  onClick={handleConnectGmail}
                  className="shrink-0 bg-[#0A0A0A] text-[#FAFAFA] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#333] transition-colors"
                >
                  Connect Gmail
                </button>
              </div>
            )}

            {/* Draft area */}
            {draftState === "idle" && (
              <div className="text-center py-12">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">Ready to draft</p>
                <button
                  onClick={handleGenerate}
                  className="bg-[#0A0A0A] text-[#FAFAFA] text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#333] transition-colors"
                >
                  Generate email draft
                </button>
              </div>
            )}

            {draftState === "generating" && (
              <div className="text-center py-12">
                <div className="w-5 h-5 border-2 border-black/[0.1] border-t-[#0A0A0A] rounded-full animate-spin mx-auto mb-4" />
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">Drafting email…</p>
              </div>
            )}

            {(draftState === "ready" || draftState === "sending" || draftState === "error") && draft && (
              <div className="space-y-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">Email draft — edit before sending</p>

                {/* Subject */}
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] block mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    className="w-full bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-sm px-4 py-3 outline-none focus:border-black/[0.3] transition-colors font-medium"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] block mb-1.5">Body</label>
                  <textarea
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    rows={12}
                    className="w-full bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-sm px-4 py-3 outline-none focus:border-black/[0.3] transition-colors resize-none leading-relaxed font-mono"
                  />
                </div>

                {draftState === "error" && (
                  <p className="text-sm text-red-600">Failed to create Gmail draft. Check your connection and try again.</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  {gmailConnected ? (
                    <button
                      onClick={handleSendToGmail}
                      disabled={draftState === "sending"}
                      className="bg-[#0A0A0A] text-[#FAFAFA] text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {draftState === "sending" ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating draft…
                        </>
                      ) : (
                        "Save to Gmail drafts"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectGmail}
                      className="bg-[#0A0A0A] text-[#FAFAFA] text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#333] transition-colors"
                    >
                      Connect Gmail to send
                    </button>
                  )}

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Subject: ${editedSubject}\n\n${editedBody}`)
                    }}
                    className="text-sm text-[#525252] hover:text-[#0A0A0A] transition-colors border border-black/[0.1] px-4 py-3 rounded-xl hover:border-black/[0.2]"
                  >
                    Copy to clipboard
                  </button>

                  <button
                    onClick={() => {
                      setDraft(null)
                      setDraftState("idle")
                    }}
                    className="text-sm text-[#A3A3A3] hover:text-[#525252] transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {draftState === "sent" && (
              <div className="text-center py-12">
                <div className="w-10 h-10 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#059669] text-lg">✓</span>
                </div>
                <p className="font-sans font-bold text-[#0A0A0A] text-lg mb-1">Draft saved to Gmail</p>
                <p className="text-sm text-[#737373] mb-6">Open Gmail, review, and send when ready.</p>
                <button
                  onClick={() => {
                    setDraft(null)
                    setDraftState("idle")
                    setSelected(null)
                  }}
                  className="text-sm text-[#525252] hover:text-[#0A0A0A] transition-colors"
                >
                  Pick another prospect
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function ProspectListItem({
  prospect: p,
  isSelected,
  onSelect,
  onDismiss,
}: {
  prospect: Prospect
  isSelected: boolean
  onSelect: () => void
  onDismiss: (e: React.MouseEvent) => void
}) {
  return (
    <div
      className={`group relative border-b border-black/[0.04] last:border-0 ${
        isSelected ? "bg-[#0A0A0A]" : "hover:bg-black/[0.03]"
      }`}
    >
      <button
        onClick={onSelect}
        className="w-full text-left px-5 py-3.5 pr-10"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-sm font-semibold truncate ${isSelected ? "text-[#FAFAFA]" : "text-[#0A0A0A]"}`}>
              {p.name}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] mt-0.5 truncate text-[#A3A3A3]">
              {p.category}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className={`font-sans font-bold text-lg leading-none ${
              isSelected ? "text-[#FAFAFA]" :
              (p.site_score ?? 0) >= 8 ? "text-[#059669]" :
              (p.site_score ?? 0) >= 6 ? "text-[#D97706]" : "text-[#737373]"
            }`}>
              {p.site_score}
            </p>
            {p.status === "contacted" && (
              <p className="font-mono text-[8px] uppercase tracking-[0.1em] mt-0.5 text-[#A3A3A3]">
                contacted
              </p>
            )}
            {p.notes && (
              <p className="font-mono text-[8px] mt-0.5 text-[#A3A3A3]">·</p>
            )}
          </div>
        </div>
      </button>

      {/* Dismiss button — visible on hover */}
      <button
        onClick={onDismiss}
        title="Remove from queue"
        className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
          isSelected
            ? "text-[#737373] hover:text-[#FAFAFA] hover:bg-white/10"
            : "text-[#A3A3A3] hover:text-[#0A0A0A] hover:bg-black/[0.08]"
        }`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}



function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="text-center max-w-sm">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-3">
          Select a prospect
        </p>
        <p className="text-[#737373] text-sm leading-relaxed">
          Pick a prospect from the queue to generate an outreach email. Start with the green ones — those are your best opportunities.
        </p>
      </div>
    </div>
  )
}
