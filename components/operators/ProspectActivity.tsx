"use client"

import { useEffect, useState } from "react"
import type { ProspectActivity as ActivityRow, ProspectWorkflow, TimelineEvent } from "@/lib/finderModel"
import { mergeActivity } from "@/lib/finderModel"
import { fetchActivity, finderAction } from "@/lib/operatorDb"

// Shared prospect activity timeline — recorded events (notes, calls, scout
// decisions) merged with factual record milestones (first seen, outreach sent,
// reply, mockup revealed). Used by the Finder record panel and the Pipeline
// drawer.
export default function ProspectActivity({
  prospect: p,
  canWrite,
  refreshKey,
  onWorkflowChange,
}: {
  prospect: {
    id: number
    first_seen_at?: string | null
    outreach_sent_at?: string | null
    email_opened_at?: string | null
    email_replied_at?: string | null
    mockup_revealed_at?: string | null
    mockup_created_at?: string | null
  }
  canWrite: boolean
  refreshKey?: number
  onWorkflowChange?: (workflow: ProspectWorkflow) => void
}) {
  const [rows, setRows] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [kind, setKind] = useState<"note" | "call">("note")
  const [text, setText] = useState("")
  const [saving, setSaving] = useState(false)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!canWrite) { setRows([]); return }
    let cancelled = false
    setLoading(true)
    setErr(null)
    fetchActivity(p.id)
      .then((r) => { if (!cancelled) setRows(r) })
      .catch((e) => { if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load activity") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [p.id, canWrite, refreshKey, revision])

  async function log() {
    if (!text.trim()) return
    setSaving(true)
    setErr(null)
    try {
      const workflow = await finderAction(p.id, kind, { note: text.trim() })
      onWorkflowChange?.(workflow)
      setText("")
      setRevision((n) => n + 1)
    } catch (caught) {
      setErr(caught instanceof Error ? caught.message : "Could not save")
    } finally {
      setSaving(false)
    }
  }

  const events: TimelineEvent[] = mergeActivity(p, rows)

  return (
    <section>
      <PanelLabel>Activity</PanelLabel>

      {canWrite && (
        <div className="mb-3 rounded-lg border border-black/[0.08] bg-white px-3 py-2.5">
          <div className="mb-2 flex gap-1">
            {(["note", "call"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${kind === k ? "bg-[#0A0A0A] text-white" : "text-[#525252] hover:bg-black/[0.05]"}`}
              >
                {k === "note" ? "Note" : "Call"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") log() }}
              placeholder={kind === "call" ? "Log a call — outcome, who you spoke to…" : "Add a note…"}
              className="min-w-0 flex-1 rounded-md border border-black/[0.1] bg-[#FAFAFA] px-2.5 py-1.5 text-xs text-[#0A0A0A] outline-none focus:border-black/30 placeholder:text-[#C4C4C4]"
            />
            <button
              type="button"
              onClick={log}
              disabled={saving || !text.trim()}
              className="shrink-0 rounded-md bg-[#0A0A0A] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2A2A2A] disabled:opacity-35"
            >
              {saving ? "Saving…" : kind === "call" ? "Log call" : "Save note"}
            </button>
          </div>
        </div>
      )}

      {loading && rows.length === 0 ? (
        <div className="h-8 bg-black/[0.04] rounded-lg animate-pulse" />
      ) : events.length === 0 ? (
        <>
          {err && <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#C4C4C4] mb-2">{err}</p>}
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#C4C4C4]">No recorded activity</p>
        </>
      ) : (
        <>
          {err && (
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#C4C4C4] mb-2">
              Logged activity unavailable — {err}
            </p>
          )}
          <ul className="bg-white border border-black/[0.08] rounded-lg px-4 py-3 space-y-2">
            {events.map((e, i) => (
              <li key={i} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[#0A0A0A] font-medium">{e.label}</p>
                  {e.detail && <p className="text-[11px] text-[#525252] leading-snug mt-0.5">{e.detail}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#A3A3A3]">{fmtDate(e.at)}</p>
                  <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#C4C4C4]">
                    {e.source === "recorded" ? "logged" : "record"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">{children}</p>
  )
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}
