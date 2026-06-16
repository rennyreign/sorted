"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import type { CrmStatus } from "@/lib/supabase"

type PipelineProspect = {
  id: number
  place_id: string
  name: string
  city: string | null
  category: string | null
  site_score: number | null
  review_slug: string | null
  website: string | null
  mockup_url: string | null
  mockup_urls: string[] | null
  crm_status: CrmStatus
  contacted_at: string | null
  mockup_revealed_at: string | null
  status_updated_at: string | null
}

const STAGES: { key: CrmStatus; label: string; color: string; dropColor: string; dot: string }[] = [
  { key: "new",             label: "New",             color: "bg-[#F5F5F5] border-black/[0.06]",  dropColor: "bg-black/[0.04] border-black/20",       dot: "bg-[#D4D4D4]" },
  { key: "outreached",      label: "Outreached",      color: "bg-blue-50 border-blue-100",         dropColor: "bg-blue-100 border-blue-300",            dot: "bg-blue-400" },
  { key: "responded",       label: "Responded",       color: "bg-violet-50 border-violet-100",     dropColor: "bg-violet-100 border-violet-300",        dot: "bg-violet-400" },
  { key: "mockup_revealed", label: "Mockup Revealed", color: "bg-amber-50 border-amber-100",       dropColor: "bg-amber-100 border-amber-300",          dot: "bg-amber-400" },
  { key: "build",           label: "Build",           color: "bg-orange-50 border-orange-100",     dropColor: "bg-orange-100 border-orange-300",        dot: "bg-orange-400" },
  { key: "quote",           label: "Quote",           color: "bg-emerald-50 border-emerald-100",   dropColor: "bg-emerald-100 border-emerald-300",      dot: "bg-emerald-400" },
  { key: "paid",            label: "Paid",            color: "bg-emerald-100 border-emerald-200",  dropColor: "bg-emerald-200 border-emerald-400",      dot: "bg-emerald-600" },
  { key: "lost",            label: "Lost",            color: "bg-red-50 border-red-100",           dropColor: "bg-red-100 border-red-300",              dot: "bg-red-300" },
]

const NEXT_STAGE: Partial<Record<CrmStatus, CrmStatus>> = {
  new:             "outreached",
  outreached:      "responded",
  responded:       "mockup_revealed",
  mockup_revealed: "build",
  build:           "quote",
  quote:           "paid",
}

const PREV_STAGE: Partial<Record<CrmStatus, CrmStatus>> = {
  outreached:      "new",
  responded:       "outreached",
  mockup_revealed: "responded",
  build:           "mockup_revealed",
  quote:           "build",
  paid:            "quote",
  lost:            "new",
}

function scoreColour(score: number | null) {
  if (score === null) return "text-[#A3A3A3]"
  if (score >= 7) return "text-emerald-600"
  if (score >= 4) return "text-amber-600"
  return "text-red-500"
}

function timeAgo(iso: string | null) {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "today"
  if (days === 1) return "yesterday"
  return `${days}d ago`
}

export default function PipelineBoard() {
  const [prospects, setProspects] = useState<PipelineProspect[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<PipelineProspect | null>(null)
  const [mockupInput, setMockupInput] = useState("")
  const [saving, setSaving] = useState(false)

  function getMockupUrls(p: PipelineProspect): string[] {
    if (p.mockup_urls && p.mockup_urls.length > 0) return p.mockup_urls
    if (p.mockup_url) return [p.mockup_url]
    return []
  }

  async function addMockupUrl(prospect: PipelineProspect) {
    const url = mockupInput.trim()
    if (!url) return
    setSaving(true)
    const current = getMockupUrls(prospect)
    const updated = [...current, url]
    await supabase.from("prospects").update({ mockup_urls: updated, mockup_url: updated[0] }).eq("place_id", prospect.place_id)
    setProspects(prev => prev.map(p => p.place_id === prospect.place_id ? { ...p, mockup_urls: updated, mockup_url: updated[0] } : p))
    if (selected?.place_id === prospect.place_id) setSelected(s => s ? { ...s, mockup_urls: updated, mockup_url: updated[0] } : s)
    setMockupInput("")
    setSaving(false)
  }

  async function removeMockupUrl(prospect: PipelineProspect, index: number) {
    setSaving(true)
    const current = getMockupUrls(prospect)
    const updated = current.filter((_, i) => i !== index)
    await supabase.from("prospects").update({ mockup_urls: updated, mockup_url: updated[0] ?? null }).eq("place_id", prospect.place_id)
    setProspects(prev => prev.map(p => p.place_id === prospect.place_id ? { ...p, mockup_urls: updated, mockup_url: updated[0] ?? null } : p))
    if (selected?.place_id === prospect.place_id) setSelected(s => s ? { ...s, mockup_urls: updated, mockup_url: updated[0] ?? null } : s)
    setSaving(false)
  }

  // Drag state
  const draggingId = useRef<string | null>(null)
  const [dragOver, setDragOver] = useState<CrmStatus | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from("prospects")
      .select("id, place_id, name, city, category, site_score, review_slug, website, mockup_url, mockup_urls, crm_status, contacted_at, mockup_revealed_at, status_updated_at")
      .neq("crm_status", "new")
      .order("status_updated_at", { ascending: false })
      .limit(500)

    const { data: newData } = await supabase
      .from("prospects")
      .select("id, place_id, name, city, category, site_score, review_slug, website, mockup_url, mockup_urls, crm_status, contacted_at, mockup_revealed_at, status_updated_at")
      .eq("crm_status", "new")
      .not("site_score", "is", null)
      .order("site_score", { ascending: false })
      .limit(100)

    setProspects([...(data || []), ...(newData || [])] as PipelineProspect[])
    setLoading(false)
  }

  async function updateStatus(prospect: PipelineProspect, newStatus: CrmStatus) {
    // Optimistic update
    setProspects(prev => prev.map(p =>
      p.place_id === prospect.place_id ? { ...p, crm_status: newStatus } : p
    ))
    if (selected?.place_id === prospect.place_id) setSelected(s => s ? { ...s, crm_status: newStatus } : s)

    setSaving(true)
    await supabase
      .from("prospects")
      .update({ crm_status: newStatus })
      .eq("place_id", prospect.place_id)
    setSaving(false)
  }

  // ── Drag handlers ──────────────────────────────────────────────
  function onDragStart(e: React.DragEvent, prospect: PipelineProspect) {
    draggingId.current = prospect.place_id
    e.dataTransfer.effectAllowed = "move"
    // Slight delay so the ghost image captures the card before opacity changes
    setTimeout(() => {
      const el = document.getElementById(`card-${prospect.place_id}`)
      if (el) el.style.opacity = "0.4"
    }, 0)
  }

  function onDragEnd(e: React.DragEvent) {
    const el = document.getElementById(`card-${draggingId.current}`)
    if (el) el.style.opacity = "1"
    draggingId.current = null
    setDragOver(null)
  }

  function onDragOver(e: React.DragEvent, stage: CrmStatus) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOver(stage)
  }

  function onDragLeave() {
    setDragOver(null)
  }

  async function onDrop(e: React.DragEvent, stage: CrmStatus) {
    e.preventDefault()
    setDragOver(null)
    const id = draggingId.current
    if (!id) return
    const prospect = prospects.find(p => p.place_id === id)
    if (!prospect || prospect.crm_status === stage) return
    await updateStatus(prospect, stage)
  }
  // ───────────────────────────────────────────────────────────────

  const byStage = (stage: CrmStatus) => prospects.filter(p => p.crm_status === stage)
  const counts = Object.fromEntries(STAGES.map(s => [s.key, byStage(s.key).length])) as Record<CrmStatus, number>
  const totalActive = STAGES.filter(s => s.key !== "lost").reduce((sum, s) => sum + counts[s.key], 0)
  const responseRate = counts.outreached > 0 ? Math.round((counts.responded / counts.outreached) * 100) : null
  const revealRate = counts.responded > 0 ? Math.round((counts.mockup_revealed / counts.responded) * 100) : null
  const convertRate = counts.mockup_revealed > 0 ? Math.round((counts.build / counts.mockup_revealed) * 100) : null

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 3.5rem)" }}>

      {/* Metrics bar */}
      <div className="border-b border-black/[0.06] bg-white px-6 sm:px-10 py-4 flex items-center gap-8 overflow-x-auto shrink-0">
        <Metric label="Active" value={totalActive} />
        <MetricDivider />
        <Metric label="Response rate" value={responseRate !== null ? `${responseRate}%` : "—"} />
        <Metric label="Reveal rate" value={revealRate !== null ? `${revealRate}%` : "—"} />
        <Metric label="Convert rate" value={convertRate !== null ? `${convertRate}%` : "—"} />
        <MetricDivider />
        <Metric label="Paid" value={counts.paid} highlight />
        <Metric label="Lost" value={counts.lost} muted />
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
        <div className="flex gap-4 px-6 sm:px-10 py-6 min-w-max min-h-full">
          {STAGES.map(stage => {
            const isOver = dragOver === stage.key
            return (
              <div
                key={stage.key}
                className="w-64 flex flex-col gap-2 flex-shrink-0"
                onDragOver={e => onDragOver(e, stage.key)}
                onDragLeave={onDragLeave}
                onDrop={e => onDrop(e, stage.key)}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#737373]">
                    {stage.label}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-[#A3A3A3]">
                    {byStage(stage.key).length}
                  </span>
                </div>

                {/* Drop zone wrapper */}
                <div className={`flex flex-col gap-2 flex-1 rounded-xl border-2 border-dashed p-1 transition-colors duration-150 ${
                  isOver ? `${stage.dropColor}` : "border-transparent"
                }`}>
                  {byStage(stage.key).map(p => (
                    <div
                      id={`card-${p.place_id}`}
                      key={p.place_id}
                      draggable
                      onDragStart={e => onDragStart(e, p)}
                      onDragEnd={onDragEnd}
                      onClick={() => { setSelected(p); setMockupInput("") }}
                      className={`cursor-grab active:cursor-grabbing text-left rounded-xl border p-3 transition-all hover:shadow-sm select-none ${stage.color} ${
                        selected?.place_id === p.place_id ? "ring-2 ring-[#0A0A0A]/20" : ""
                      }`}
                    >
                      <p className="font-sans font-semibold text-[#0A0A0A] text-sm leading-snug mb-1 truncate pointer-events-none">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2 pointer-events-none">
                        {p.city && <span className="text-[11px] text-[#A3A3A3] truncate">{p.city}</span>}
                        {p.site_score !== null && (
                          <span className={`ml-auto font-mono text-[11px] font-bold tabular-nums ${scoreColour(p.site_score)}`}>
                            {Math.round(p.site_score * 10)}
                          </span>
                        )}
                      </div>
                      {p.mockup_url && (
                        <span className="mt-1 inline-block font-mono text-[9px] text-emerald-600 uppercase tracking-wide pointer-events-none">
                          mockup ready
                        </span>
                      )}
                      {p.status_updated_at && (
                        <p className="mt-1 font-mono text-[9px] text-[#C4C4C4] pointer-events-none">
                          {timeAgo(p.status_updated_at)}
                        </p>
                      )}
                    </div>
                  ))}

                  {byStage(stage.key).length === 0 && (
                    <div className={`rounded-xl border border-dashed p-4 text-center transition-colors ${
                      isOver ? "border-current opacity-60" : "border-black/[0.08]"
                    }`}>
                      <p className="text-[11px] text-[#C4C4C4]">{isOver ? "Drop here" : "Empty"}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="shrink-0 border-t border-black/[0.06] bg-white px-6 sm:px-10 py-5 flex flex-col sm:flex-row gap-6">

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <p className="font-sans font-bold text-[#0A0A0A] text-base leading-tight truncate">{selected.name}</p>
            <p className="text-sm text-[#737373] mt-0.5">{selected.city}{selected.category ? ` · ${selected.category}` : ""}</p>
            {selected.website && (
              <a
                href={selected.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block font-mono text-[11px] text-[#737373] hover:text-[#0A0A0A] transition-colors"
              >
                {selected.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")} ↗
              </a>
            )}
            {selected.review_slug && (
              <a
                href={`/review?slug=${selected.review_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block font-mono text-[11px] text-blue-600 hover:underline"
              >
                /review/{selected.review_slug} ↗
              </a>
            )}
            {selected.mockup_revealed_at && (
              <p className="mt-1 text-[11px] text-amber-600 font-mono">Mockup revealed {timeAgo(selected.mockup_revealed_at)}</p>
            )}
          </div>

          {/* Mockup URLs */}
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-2">
              Mockup screens ({getMockupUrls(selected).length})
            </p>
            {/* Existing URLs */}
            {getMockupUrls(selected).length > 0 && (
              <ul className="space-y-1 mb-2">
                {getMockupUrls(selected).map((url, i) => (
                  <li key={i} className="flex items-center gap-2 bg-[#FAFAFA] border border-black/[0.06] rounded-lg px-3 py-1.5">
                    <span className="font-mono text-[10px] text-[#A3A3A3] shrink-0">#{i + 1}</span>
                    <span className="flex-1 text-xs font-mono text-[#525252] truncate">{url.replace(/^https?:\/\//, "").slice(0, 48)}…</span>
                    <button
                      onClick={() => removeMockupUrl(selected, i)}
                      disabled={saving}
                      className="shrink-0 text-[#C4C4C4] hover:text-red-500 transition-colors text-xs leading-none"
                      title="Remove"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {/* Add URL */}
            <div className="flex gap-2">
              <input
                value={mockupInput}
                onChange={e => setMockupInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addMockupUrl(selected) }}
                placeholder="https://… paste and press Enter"
                className="flex-1 bg-[#FAFAFA] border border-black/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-[#0A0A0A] placeholder:text-[#C4C4C4] focus:outline-none focus:ring-1 focus:ring-black/20 min-w-0"
              />
              <button
                onClick={() => addMockupUrl(selected)}
                disabled={saving || !mockupInput.trim()}
                className="px-3 py-2 bg-[#0A0A0A] text-white text-xs font-medium rounded-lg disabled:opacity-40 transition-opacity hover:bg-[#1A1A1A]"
              >
                Add
              </button>
            </div>
          </div>

          {/* Stage controls */}
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-2">Move stage</p>
            <div className="flex flex-wrap gap-2">
              {NEXT_STAGE[selected.crm_status] && (
                <button
                  onClick={() => updateStatus(selected, NEXT_STAGE[selected.crm_status]!)}
                  disabled={saving}
                  className="px-3 py-1.5 bg-[#0A0A0A] text-white text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-[#1A1A1A] transition-colors"
                >
                  → {STAGES.find(s => s.key === NEXT_STAGE[selected.crm_status])?.label}
                </button>
              )}
              {PREV_STAGE[selected.crm_status] && (
                <button
                  onClick={() => updateStatus(selected, PREV_STAGE[selected.crm_status]!)}
                  disabled={saving}
                  className="px-3 py-1.5 bg-[#F5F5F5] text-[#525252] border border-black/[0.08] text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-black/[0.06] transition-colors"
                >
                  ← {STAGES.find(s => s.key === PREV_STAGE[selected.crm_status])?.label}
                </button>
              )}
              {selected.crm_status !== "lost" && selected.crm_status !== "paid" && (
                <button
                  onClick={() => updateStatus(selected, "lost")}
                  disabled={saving}
                  className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-red-100 transition-colors"
                >
                  Mark lost
                </button>
              )}
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1.5 text-[#A3A3A3] text-xs hover:text-[#525252] transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

function Metric({ label, value, highlight, muted }: { label: string; value: string | number; highlight?: boolean; muted?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 shrink-0">
      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3]">{label}</p>
      <p className={`font-mono text-base font-bold tabular-nums leading-none ${highlight ? "text-emerald-600" : muted ? "text-[#C4C4C4]" : "text-[#0A0A0A]"}`}>
        {value}
      </p>
    </div>
  )
}

function MetricDivider() {
  return <div className="w-px h-8 bg-black/[0.06] shrink-0" />
}
