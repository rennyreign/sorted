"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import type { CrmStatus, OutreachStatus, OutreachMode } from "@/lib/supabase"

type PipelineProspect = {
  id: number
  place_id: string
  name: string
  city: string | null
  category: string | null
  site_score: number | null
  review_slug: string | null
  website: string | null
  email: string | null
  phone: string | null
  mockup_url: string | null
  mockup_urls: string[] | null
  crm_status: CrmStatus
  status: string | null
  contacted_at: string | null
  mockup_revealed_at: string | null
  status_updated_at: string | null
  notes: string | null
  site_weaknesses: string[] | null
  outreach_status: OutreachStatus | null
  outreach_sent_at: string | null
  outreach_attempt_count: number | null
  outreach_last_error: string | null
  // Owner / Companies House enrichment
  owner_name: string | null
  owner_email: string | null
  owner_email_source: string | null
  owner_email_confidence: number | null
  owner_source: string | null
  owner_identified_at: string | null
  owner_enriched_at: string | null
}

const STAGES: { key: CrmStatus; label: string; color: string; dropColor: string; dot: string }[] = [
  { key: "new",             label: "New",             color: "bg-[#F5F5F5] border-black/[0.06]",  dropColor: "bg-black/[0.04] border-black/20",       dot: "bg-[#D4D4D4]" },
  { key: "outreached",      label: "Outreached",      color: "bg-blue-50 border-blue-100",         dropColor: "bg-blue-100 border-blue-300",            dot: "bg-blue-400" },
  { key: "mockup_revealed", label: "Mockup Revealed", color: "bg-amber-50 border-amber-100",       dropColor: "bg-amber-100 border-amber-300",          dot: "bg-amber-400" },
  { key: "build",           label: "Build",           color: "bg-orange-50 border-orange-100",     dropColor: "bg-orange-100 border-orange-300",        dot: "bg-orange-400" },
  { key: "quote",           label: "Quote",           color: "bg-emerald-50 border-emerald-100",   dropColor: "bg-emerald-100 border-emerald-300",      dot: "bg-emerald-400" },
  { key: "paid",            label: "Paid",            color: "bg-emerald-100 border-emerald-200",  dropColor: "bg-emerald-200 border-emerald-400",      dot: "bg-emerald-600" },
  { key: "lost",            label: "Lost",            color: "bg-red-50 border-red-100",           dropColor: "bg-red-100 border-red-300",              dot: "bg-red-300" },
]

const NEXT_STAGE: Partial<Record<CrmStatus, CrmStatus>> = {
  new:             "outreached",
  outreached:      "mockup_revealed",
  mockup_revealed: "build",
  build:           "quote",
  quote:           "paid",
}

const PREV_STAGE: Partial<Record<CrmStatus, CrmStatus>> = {
  outreached:      "new",
  mockup_revealed: "outreached",
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

const EMPTY_FORM = { name: "", website: "", email: "", category: "", city: "" }

type DraftState = "idle" | "generating" | "ready" | "sending" | "sent" | "error"
type NoteState = "idle" | "saving" | "saved"
type EmailDraft = { subject: string; body: string }

function generateDraft(p: PipelineProspect): EmailDraft {
  const reviewUrl = p.review_slug
    ? `https://sortmydigital.site/review/${p.review_slug}`
    : null

  const subject = `We built something for you`

  const body = [
    "Hi,",
    "",
    "We reviewed your website and built a completely new version of it.",
    "",
    "See your review and compare both versions here:",
    "",
    reviewUrl ?? "Reply and I will send your results over.",
    "",
    "Interested to hear what you think,",
    "",
    "Renaldo Edmondson",
    "Founder, Sorted",
    "+44 7386 468085",
    "sortmydigital.site",
  ].join("\n")

  return { subject, body }
}

const PROSPECT_FIELDS = "id, place_id, name, city, category, site_score, review_slug, website, email, phone, mockup_url, mockup_urls, crm_status, status, contacted_at, mockup_revealed_at, status_updated_at, notes, site_weaknesses, outreach_status, outreach_sent_at, outreach_attempt_count, outreach_last_error, owner_name, owner_email, owner_email_source, owner_email_confidence, owner_source, owner_identified_at, owner_enriched_at"

export default function PipelineBoard() {
  const [prospects, setProspects] = useState<PipelineProspect[]>([])
  const [naProspects, setNaProspects] = useState<PipelineProspect[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<PipelineProspect | null>(null)
  const [mockupInput, setMockupInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState(EMPTY_FORM)
  const [addSaving, setAddSaving] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [cityFilter, setCityFilter] = useState<string>("All")
  const [mockupFilter, setMockupFilter] = useState<"all" | "ready" | "none">("all")
  const [reviewPageFilter, setReviewPageFilter] = useState<"all" | "ready" | "none">("all")
  const [stageFilter, setStageFilter] = useState<CrmStatus | "all">("all")
  const [enrichedFilter, setEnrichedFilter] = useState<"all" | "owner" | "owner_email" | "not_enriched">("all")

  // Outreach state (merged from OutreachPanel)
  const [drawerTab, setDrawerTab] = useState<"details" | "outreach">("details")
  const [draft, setDraft] = useState<EmailDraft | null>(null)
  const [draftState, setDraftState] = useState<DraftState>("idle")
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null)
  const [editedSubject, setEditedSubject] = useState("")
  const [editedBody, setEditedBody] = useState("")
  const [noteText, setNoteText] = useState("")
  const [noteState, setNoteState] = useState<NoteState>("idle")

  // Outreach operator state
  const [outreachMode, setOutreachMode] = useState<OutreachMode>("AUTO_SEND")
  const [outreachCounts, setOutreachCounts] = useState<{ ready: number; sentToday: number; failed: number; replied: number } | null>(null)

  // Mockup preview state — view-only lightbox, does NOT touch crm_status
  const [previewProspect, setPreviewProspect] = useState<PipelineProspect | null>(null)
  const [previewIndex, setPreviewIndex] = useState(0)

  // API routes only exist on the local dev server
  const apiBase = typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "http://localhost:3000"
    : ""

  function getMockupUrls(p: PipelineProspect): string[] {
    if (p.mockup_urls && p.mockup_urls.length > 0) return p.mockup_urls
    if (p.mockup_url) return [p.mockup_url]
    return []
  }

  function openPreview(p: PipelineProspect, index = 0) {
    setPreviewProspect(p)
    setPreviewIndex(index)
  }

  function closePreview() {
    setPreviewProspect(null)
    setPreviewIndex(0)
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

  useEffect(() => {
    load()
    // Check Gmail connection status
    fetch(`${apiBase}/api/gmail/status`)
      .then((r) => r.json())
      .then((d) => setGmailConnected(d.connected))
      .catch(() => setGmailConnected(false))
    // Load outreach operator status
    loadOutreachStatus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadOutreachStatus() {
    try {
      const res = await fetch("/api/outreach/status")
      if (!res.ok) return
      const data = await res.json()
      setOutreachMode(data.config.mode)
      setOutreachCounts(data.counts)
    } catch { /* ignore — API routes not available on static export */ }
  }

  async function toggleOutreachPause() {
    const endpoint = outreachMode === "PAUSED" ? "/api/outreach/resume" : "/api/outreach/pause"
    try {
      const res = await fetch(endpoint, { method: "POST" })
      if (!res.ok) return
      const data = await res.json()
      setOutreachMode(data.mode)
    } catch { /* ignore */ }
  }

  async function retryFailedOutreach() {
    try {
      await fetch("/api/outreach/retry", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
      loadOutreachStatus()
    } catch { /* ignore */ }
  }

  async function load() {
    setLoading(true)
    // Active pipeline: any stage except new/lost/na. NULL crm_status is treated as "new" and fetched separately.
    const { data } = await supabase
      .from("prospects")
      .select(PROSPECT_FIELDS)
      .neq("crm_status", "new")
      .neq("crm_status", "lost")
      .neq("crm_status", "na")
      .order("status_updated_at", { ascending: false })
      .limit(500)

    // New/incoming: include NULL crm_status and unscored prospects so mockups never disappear.
    const { data: newData } = await supabase
      .from("prospects")
      .select(PROSPECT_FIELDS)
      .or("crm_status.eq.new,crm_status.is.null")
      .order("site_score", { ascending: false, nullsFirst: false })
      .limit(1000)

    // Lost: still shown on the board for reference.
    const { data: lostData } = await supabase
      .from("prospects")
      .select(PROSPECT_FIELDS)
      .eq("crm_status", "lost")
      .order("status_updated_at", { ascending: false })
      .limit(500)

    // N/A: not a pipeline stage — kept separately for a future Sorted Ops list.
    const { data: naData } = await supabase
      .from("prospects")
      .select(PROSPECT_FIELDS)
      .eq("crm_status", "na")
      .order("status_updated_at", { ascending: false })
      .limit(500)

    const normalize = (p: any) => ({
      ...p,
      crm_status: (p.crm_status ?? "new") as CrmStatus,
    }) as PipelineProspect

    const active = (data || []).map(normalize)
    const incoming = (newData || []).map(normalize)
    const lost = (lostData || []).map(normalize)
    const na = (naData || []).map(normalize)

    // Deduplicate in case a record matches both queries
    const seen = new Set<string>()
    setProspects([...active, ...incoming, ...lost].filter((p) => {
      if (seen.has(p.place_id)) return false
      seen.add(p.place_id)
      return true
    }))
    setNaProspects(na)
    setLoading(false)
  }

  async function updateStatus(prospect: PipelineProspect, newStatus: CrmStatus) {
    const updated = { ...prospect, crm_status: newStatus }

    if (newStatus === "na") {
      // Move out of the active pipeline board into the N/A list
      setProspects(prev => prev.filter(p => p.place_id !== prospect.place_id))
      setNaProspects(prev => [updated, ...prev.filter(p => p.place_id !== prospect.place_id)])
      if (selected?.place_id === prospect.place_id) setSelected(null)
    } else if (prospect.crm_status === "na") {
      // Moving back from N/A to the board
      setNaProspects(prev => prev.filter(p => p.place_id !== prospect.place_id))
      setProspects(prev => [updated, ...prev])
      if (selected?.place_id === prospect.place_id) setSelected(s => s ? { ...s, crm_status: newStatus } : s)
    } else {
      // Standard stage change inside the board
      setProspects(prev => prev.map(p => p.place_id === prospect.place_id ? updated : p))
      if (selected?.place_id === prospect.place_id) setSelected(s => s ? { ...s, crm_status: newStatus } : s)
    }

    setSaving(true)
    const { error } = await supabase
      .from("prospects")
      .update({ crm_status: newStatus })
      .eq("place_id", prospect.place_id)
    setSaving(false)

    if (error) {
      console.error("[PipelineBoard] Failed to update crm_status:", error.message)
      load()
    }
  }

  async function addProspect() {
    if (!addForm.name.trim()) { setAddError("Name is required."); return }
    setAddSaving(true)
    setAddError(null)
    // Use a timestamp-based place_id for manual entries
    const place_id = `manual_${Date.now()}`
    const { data, error } = await supabase
      .from("prospects")
      .insert({
        place_id,
        name: addForm.name.trim(),
        website: addForm.website.trim() || null,
        email: addForm.email.trim() || null,
        category: addForm.category.trim() || null,
        city: addForm.city.trim() || null,
        website_exists: !!addForm.website.trim(),
        email_exists: !!addForm.email.trim(),
        crm_status: "new",
      })
      .select(PROSPECT_FIELDS)
      .single()
    if (error) {
      setAddError("Failed to add prospect. Try again.")
      setAddSaving(false)
      return
    }
    setProspects(prev => [data as PipelineProspect, ...prev])
    setAddForm(EMPTY_FORM)
    setShowAddForm(false)
    setAddSaving(false)
  }

  // ── Outreach handlers (merged from OutreachPanel) ──────────────
  function selectProspect(p: PipelineProspect) {
    setSelected(p)
    setMockupInput("")
    setDrawerTab("details")
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
    setSelected(s => s ? { ...s, notes: noteText || null } : s)
    setNoteState("saved")
    setTimeout(() => setNoteState("idle"), 2000)
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

      // Mark as contacted/outreached in Supabase
      const contactedAt = new Date().toISOString()
      await supabase
        .from("prospects")
        .update({
          status: "contacted",
          crm_status: "outreached",
          contacted_at: contactedAt,
        })
        .eq("place_id", selected.place_id)

      // Update local state
      setProspects((prev) =>
        prev.map((p) =>
          p.place_id === selected.place_id
            ? { ...p, status: "contacted", crm_status: "outreached", contacted_at: contactedAt }
            : p
        )
      )
      setSelected(s => s ? { ...s, status: "contacted", crm_status: "outreached", contacted_at: contactedAt } : s)
    } catch (err) {
      console.error(err)
      setDraftState("error")
    }
  }

  function handleConnectGmail() {
    window.location.href = `${apiBase}/api/gmail/auth`
  }
  // ───────────────────────────────────────────────────────────────

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

  const cities = useMemo(() => {
    const cs = Array.from(new Set(prospects.map((p) => p.city).filter(Boolean))) as string[]
    return ["All", ...cs.sort()]
  }, [prospects])

  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
      if (stageFilter !== "all" && p.crm_status !== stageFilter) return false
      if (cityFilter !== "All" && p.city !== cityFilter) return false
      const hasMockupImage = !!p.mockup_url
      const hasReviewPage = !!p.review_slug
      if (mockupFilter === "ready" && !hasMockupImage) return false
      if (mockupFilter === "none" && hasMockupImage) return false
      if (reviewPageFilter === "ready" && !hasReviewPage) return false
      if (reviewPageFilter === "none" && hasReviewPage) return false
      if (enrichedFilter === "owner" && !p.owner_name) return false
      if (enrichedFilter === "owner_email" && !p.owner_email) return false
      if (enrichedFilter === "not_enriched" && p.owner_name) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const match =
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.owner_name?.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [prospects, search, cityFilter, mockupFilter, reviewPageFilter, stageFilter, enrichedFilter])

  const allByStage = (stage: CrmStatus) => prospects.filter(p => p.crm_status === stage || (stage === "outreached" && p.crm_status === "responded"))
  const allCounts = Object.fromEntries(STAGES.map(s => [s.key, allByStage(s.key).length])) as Record<CrmStatus, number>
  const totalActive = STAGES.filter(s => s.key !== "lost" && s.key !== "na").reduce((sum, s) => sum + allCounts[s.key], 0)
  const revealRate = allCounts.outreached > 0 ? Math.round((allCounts.mockup_revealed / allCounts.outreached) * 100) : null
  const convertRate = allCounts.mockup_revealed > 0 ? Math.round((allCounts.build / allCounts.mockup_revealed) * 100) : null

  const byStage = (stage: CrmStatus) => filteredProspects.filter(p => p.crm_status === stage || (stage === "outreached" && p.crm_status === "responded"))

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
        <Metric label="Reveal rate" value={revealRate !== null ? `${revealRate}%` : "—"} />
        <Metric label="Convert rate" value={convertRate !== null ? `${convertRate}%` : "—"} />
        <MetricDivider />
        <Metric label="Paid" value={allCounts.paid} highlight />
        <Metric label="Lost" value={allCounts.lost} muted />
        <Metric label="N/A" value={naProspects.length} muted />
        {outreachCounts && (
          <>
            <MetricDivider />
            <Metric label="Outreach ready" value={outreachCounts.ready} />
            <Metric label="Sent today" value={outreachCounts.sentToday} />
            <Metric label="Replies" value={outreachCounts.replied} highlight={outreachCounts.replied > 0} />
            {(outreachCounts.failed > 0 || outreachMode === "PAUSED") && (
              <Metric label="Failed" value={outreachCounts.failed} muted />
            )}
          </>
        )}
        <div className="ml-auto shrink-0 flex items-center gap-2">
          {outreachCounts && outreachCounts.failed > 0 && (
            <button
              onClick={retryFailedOutreach}
              className="text-xs font-medium px-3 py-1.5 rounded-lg text-[#525252] border border-black/[0.08] hover:bg-black/[0.04] transition-colors"
            >
              ↻ Retry failed
            </button>
          )}
          <button
            onClick={toggleOutreachPause}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              outreachMode === "PAUSED"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "text-[#525252] border border-black/[0.08] hover:bg-black/[0.04]"
            }`}
          >
            {outreachMode === "PAUSED" ? "▶ Resume outreach" : "⏸ Pause outreach"}
          </button>
          <button
            onClick={() => { setShowAddForm(v => !v); setAddForm(EMPTY_FORM); setAddError(null) }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#0A0A0A] text-white hover:bg-[#1A1A1A] transition-colors"
          >
            + Add prospect
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="border-b border-black/[0.06] bg-[#FAFAFA] px-6 sm:px-10 py-3 flex flex-wrap items-center gap-3 shrink-0">
        <input
          type="text"
          placeholder="Search pipeline…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] max-w-xs bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-xs px-3 py-2 outline-none focus:border-black/[0.3] transition-colors placeholder:text-[#A3A3A3]"
        />
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-xs px-3 py-2 outline-none focus:border-black/[0.3] transition-colors appearance-none cursor-pointer"
        >
          {cities.map((c) => <option key={c} value={c}>{c === "All" ? "All cities" : c}</option>)}
        </select>
        <select
          value={mockupFilter}
          onChange={(e) => setMockupFilter(e.target.value as "all" | "ready" | "none")}
          className="bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-xs px-3 py-2 outline-none focus:border-black/[0.3] transition-colors appearance-none cursor-pointer"
        >
          <option value="all">Any mockup image</option>
          <option value="ready">Has mockup image</option>
          <option value="none">No mockup image</option>
        </select>
        <select
          value={reviewPageFilter}
          onChange={(e) => setReviewPageFilter(e.target.value as "all" | "ready" | "none")}
          className="bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-xs px-3 py-2 outline-none focus:border-black/[0.3] transition-colors appearance-none cursor-pointer"
        >
          <option value="all">Any review page</option>
          <option value="ready">Has review page</option>
          <option value="none">No review page</option>
        </select>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as CrmStatus | "all")}
          className="bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-xs px-3 py-2 outline-none focus:border-black/[0.3] transition-colors appearance-none cursor-pointer"
        >
          <option value="all">All stages</option>
          <option value="new">New</option>
          <option value="outreached">Outreached</option>
          <option value="mockup_revealed">Mockup Revealed</option>
          <option value="build">Build</option>
          <option value="quote">Quote</option>
          <option value="paid">Paid</option>
          <option value="lost">Lost</option>
        </select>
        <select
          value={enrichedFilter}
          onChange={(e) => setEnrichedFilter(e.target.value as "all" | "owner" | "owner_email" | "not_enriched")}
          className="bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-xs px-3 py-2 outline-none focus:border-black/[0.3] transition-colors appearance-none cursor-pointer"
        >
          <option value="all">Any enrichment</option>
          <option value="owner">CH owner identified</option>
          <option value="owner_email">Has owner email</option>
          <option value="not_enriched">Not enriched</option>
        </select>
        {(search || cityFilter !== "All" || mockupFilter !== "all" || reviewPageFilter !== "all" || stageFilter !== "all" || enrichedFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setCityFilter("All"); setMockupFilter("all"); setReviewPageFilter("all"); setStageFilter("all"); setEnrichedFilter("all") }}
            className="text-xs text-[#A3A3A3] hover:text-[#525252] transition-colors"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto font-mono text-[10px] text-[#A3A3A3]">
          {filteredProspects.length} shown
        </span>
      </div>

      {/* Add prospect form */}
      {showAddForm && (
        <div className="border-b border-black/[0.06] bg-[#FAFAFA] px-6 sm:px-10 py-5 shrink-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-3">New prospect</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#A3A3A3]">Name *</label>
              <input
                value={addForm.name}
                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && addProspect()}
                placeholder="Business name"
                className="bg-white border border-black/[0.1] rounded-lg px-3 py-2 text-sm text-[#0A0A0A] placeholder:text-[#C4C4C4] focus:outline-none focus:ring-1 focus:ring-black/20 w-48"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#A3A3A3]">Website</label>
              <input
                value={addForm.website}
                onChange={e => setAddForm(f => ({ ...f, website: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && addProspect()}
                placeholder="https://..."
                className="bg-white border border-black/[0.1] rounded-lg px-3 py-2 text-sm text-[#0A0A0A] placeholder:text-[#C4C4C4] focus:outline-none focus:ring-1 focus:ring-black/20 w-48"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#A3A3A3]">Email</label>
              <input
                value={addForm.email}
                onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && addProspect()}
                placeholder="contact@..."
                className="bg-white border border-black/[0.1] rounded-lg px-3 py-2 text-sm text-[#0A0A0A] placeholder:text-[#C4C4C4] focus:outline-none focus:ring-1 focus:ring-black/20 w-44"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#A3A3A3]">Category</label>
              <input
                value={addForm.category}
                onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && addProspect()}
                placeholder="e.g. Plumber"
                className="bg-white border border-black/[0.1] rounded-lg px-3 py-2 text-sm text-[#0A0A0A] placeholder:text-[#C4C4C4] focus:outline-none focus:ring-1 focus:ring-black/20 w-36"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#A3A3A3]">City</label>
              <input
                value={addForm.city}
                onChange={e => setAddForm(f => ({ ...f, city: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && addProspect()}
                placeholder="e.g. Birmingham"
                className="bg-white border border-black/[0.1] rounded-lg px-3 py-2 text-sm text-[#0A0A0A] placeholder:text-[#C4C4C4] focus:outline-none focus:ring-1 focus:ring-black/20 w-36"
              />
            </div>
            <button
              onClick={addProspect}
              disabled={addSaving || !addForm.name.trim()}
              className="px-4 py-2 bg-[#0A0A0A] text-white text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-[#1A1A1A] transition-colors"
            >
              {addSaving ? "Adding…" : "Add"}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 text-[#A3A3A3] text-xs hover:text-[#525252] transition-colors"
            >
              Cancel
            </button>
          </div>
          {addError && <p className="mt-2 text-xs text-red-600">{addError}</p>}
        </div>
      )}

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
                      onClick={() => selectProspect(p)}
                      className={`cursor-grab active:cursor-grabbing text-left rounded-xl border p-3 transition-all hover:shadow-sm select-none ${stage.color} ${
                        selected?.place_id === p.place_id ? "ring-2 ring-[#0A0A0A]/20" : ""
                      } ${p.owner_name ? "ring-1 ring-emerald-200/60" : ""}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 pointer-events-none">
                        {p.owner_name && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Companies House enriched" />
                        )}
                        <p className="font-sans font-semibold text-[#0A0A0A] text-sm leading-snug truncate flex-1">
                          {p.name}
                        </p>
                        {p.site_score !== null && (
                          <span className={`font-mono text-[11px] font-bold tabular-nums shrink-0 ${scoreColour(p.site_score)}`}>
                            {Math.round(p.site_score * 10)}
                          </span>
                        )}
                      </div>
                      {p.city && <p className="text-[11px] text-[#A3A3A3] truncate pointer-events-none mb-1">{p.city}</p>}
                      <div className="flex flex-wrap items-center gap-x-2 pointer-events-none">
                        {p.owner_name && (
                          <span className="font-mono text-[9px] text-emerald-600 uppercase tracking-wide" title={p.owner_name}>
                            CH owner
                          </span>
                        )}
                        {p.owner_email && (
                          <span className="font-mono text-[9px] text-emerald-700 uppercase tracking-wide" title={p.owner_email}>
                            owner email
                          </span>
                        )}
                        {p.mockup_url && (
                          <span className="font-mono text-[9px] text-emerald-600 uppercase tracking-wide">
                            mockup ready
                          </span>
                        )}
                        {p.review_slug && !p.mockup_url && (
                          <span className="font-mono text-[9px] text-blue-600 uppercase tracking-wide">
                            review page
                          </span>
                        )}
                        {p.contacted_at && (
                          <span className="font-mono text-[9px] text-blue-500 uppercase tracking-wide">
                            contacted
                          </span>
                        )}
                        {p.outreach_status && p.outreach_status !== "NOT_READY" && p.outreach_status !== "READY" && (
                          <span className={`font-mono text-[9px] uppercase tracking-wide ${
                            p.outreach_status === "SENT" ? "text-emerald-600" :
                            p.outreach_status === "FAILED_TEMPORARY" || p.outreach_status === "FAILED_PERMANENT" ? "text-red-500" :
                            p.outreach_status === "BOUNCED" ? "text-red-500" :
                            p.outreach_status === "REPLIED" ? "text-violet-600" :
                            p.outreach_status === "OPTED_OUT" ? "text-[#A3A3A3]" :
                            "text-[#737373]"
                          }`}>
                            {p.outreach_status.replace(/_/g, " ").toLowerCase()}
                          </span>
                        )}
                        {p.crm_status === "responded" && (
                          <span className="font-mono text-[9px] text-violet-600 uppercase tracking-wide">
                            responded
                          </span>
                        )}
                      </div>
                      {p.mockup_url && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openPreview(p) }}
                          className="mt-1.5 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide text-[#525252] hover:text-[#0A0A0A] bg-white/60 border border-black/[0.08] rounded-md px-2 py-1 transition-colors hover:bg-white pointer-events-auto"
                          title="Preview mockup (does not advance pipeline)"
                        >
                          <span>👁</span> Preview mockup
                        </button>
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

      {/* Detail drawer — tabbed (Details + Outreach) */}
      {selected && (() => {
        const s = selected!
        return (
          <div className="shrink-0 border-t border-black/[0.06] bg-white flex flex-col max-h-[52dvh] overflow-y-auto">
            {/* Drawer header — prospect name + tab toggle + dismiss */}
            <div className="px-6 sm:px-10 pt-4 pb-2 flex items-center gap-4 shrink-0 sticky top-0 bg-white z-10">
              <p className="font-sans font-bold text-[#0A0A0A] text-base leading-tight truncate flex-1">{s.name}</p>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setDrawerTab("details")}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors ${
                    drawerTab === "details" ? "bg-[#0A0A0A] text-[#FAFAFA]" : "text-[#525252] hover:text-[#0A0A0A] hover:bg-black/[0.05]"
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setDrawerTab("outreach")}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors ${
                    drawerTab === "outreach" ? "bg-[#0A0A0A] text-[#FAFAFA]" : "text-[#525252] hover:text-[#0A0A0A] hover:bg-black/[0.05]"
                  }`}
                >
                  Outreach
                </button>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="shrink-0 text-[#A3A3A3] hover:text-[#525252] transition-colors text-xs px-2 py-1.5"
              >
                Dismiss
              </button>
            </div>

            {/* Details tab */}
            {drawerTab === "details" && (
              <div className="px-6 sm:px-10 pb-5 flex flex-col sm:flex-row gap-6">
                {/* Identity + contact + weaknesses */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#737373] mt-0.5">{s.city}{s.category ? ` · ${s.category}` : ""}</p>
                  {s.website && (
                    <a
                      href={s.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block font-mono text-[11px] text-[#737373] hover:text-[#0A0A0A] transition-colors"
                    >
                      {s.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")} ↗
                    </a>
                  )}
                  {s.review_slug && (
                    <a
                      href={`/review?slug=${s.review_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 ml-2 inline-block font-mono text-[11px] text-blue-600 hover:underline"
                    >
                      /review/{s.review_slug} ↗
                    </a>
                  )}
                  {s.mockup_revealed_at && (
                    <p className="mt-1 text-[11px] text-amber-600 font-mono">Mockup revealed {timeAgo(s.mockup_revealed_at)}</p>
                  )}

                  {/* Contact info */}
                  {(s.email || s.phone) && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {s.email && (
                        <a href={`mailto:${s.email}`}
                          className="flex items-center gap-1.5 font-mono text-[11px] text-[#0A0A0A] bg-black/[0.04] border border-black/[0.08] rounded-lg px-3 py-1.5 hover:bg-black/[0.08] transition-colors">
                          <span className="text-[#A3A3A3]">✉</span> {s.email}
                        </a>
                      )}
                      {s.phone && (
                        <a href={`tel:${s.phone}`}
                          className="flex items-center gap-1.5 font-mono text-[11px] text-[#0A0A0A] bg-black/[0.04] border border-black/[0.08] rounded-lg px-3 py-1.5 hover:bg-black/[0.08] transition-colors">
                          <span className="text-[#A3A3A3]">✆</span> {s.phone}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Owner (Companies House enrichment) */}
                  {s.owner_name && (
                    <div className="mt-3 bg-[#F0FDF4] border border-emerald-100 rounded-lg px-3 py-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-emerald-700">
                          Companies House — {s.owner_source || "enriched"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3]">Owner</span>
                        <span className="text-xs text-[#0A0A0A] font-medium">{s.owner_name}</span>
                      </div>
                      {s.owner_email && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3]">Owner email</span>
                          <div className="flex items-center gap-2">
                            {s.owner_email_confidence != null && (
                              <span className="font-mono text-[10px] text-[#A3A3A3]">{s.owner_email_confidence}%</span>
                            )}
                            <a href={`mailto:${s.owner_email}`}
                              className="font-mono text-[11px] text-emerald-700 hover:underline">
                              {s.owner_email}
                            </a>
                          </div>
                        </div>
                      )}
                      {s.owner_enriched_at && !s.owner_email && (
                        <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#C4C4C4] pt-0.5">
                          Email enrichment attempted — no email found
                        </p>
                      )}
                      {!s.owner_enriched_at && !s.owner_email && (
                        <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#A3A3A3] pt-0.5">
                          Owner email pending enrichment
                        </p>
                      )}
                    </div>
                  )}

                  {/* Site weaknesses */}
                  {s.site_weaknesses && s.site_weaknesses.length > 0 && (
                    <div className="mt-3 border border-black/[0.08] rounded-lg overflow-hidden">
                      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] bg-[#FAFAFA] px-3 py-2 border-b border-black/[0.06]">What their review covers</p>
                      <ul className="divide-y divide-black/[0.04]">
                        {s.site_weaknesses.slice(0, 3).map((w, i) => (
                          <li key={i} className="flex items-start gap-2 px-3 py-2">
                            <span className="text-[#C4C4C4] mt-0.5 shrink-0 text-xs">·</span>
                            <span className="text-[#525252] text-xs leading-relaxed">{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Mockup URLs */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3]">
                      Mockup screens ({getMockupUrls(s).length})
                    </p>
                    {getMockupUrls(s).length > 0 && (
                      <button
                        onClick={() => openPreview(s)}
                        className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide text-[#525252] hover:text-[#0A0A0A] bg-[#FAFAFA] border border-black/[0.08] rounded-md px-2 py-1 transition-colors hover:bg-white"
                        title="Preview all mockup screens (does not advance pipeline)"
                      >
                        <span>👁</span> Preview
                      </button>
                    )}
                  </div>
                  {/* Existing URLs */}
                  {getMockupUrls(s).length > 0 && (
                    <ul className="space-y-1 mb-2">
                      {getMockupUrls(s).map((url, i) => (
                        <li key={i} className="flex items-center gap-2 bg-[#FAFAFA] border border-black/[0.06] rounded-lg px-3 py-1.5">
                          <span className="font-mono text-[10px] text-[#A3A3A3] shrink-0">#{i + 1}</span>
                          <button
                            onClick={() => openPreview(s, i)}
                            className="flex-1 text-left text-xs font-mono text-[#525252] truncate hover:text-[#0A0A0A] transition-colors"
                            title="Click to preview this screen"
                          >
                            {url.replace(/^https?:\/\//, "").slice(0, 48)}…
                          </button>
                          <button
                            onClick={() => removeMockupUrl(s, i)}
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
                      onKeyDown={e => { if (e.key === "Enter") addMockupUrl(s) }}
                      placeholder="https://… paste and press enter"
                      className="flex-1 bg-[#FAFAFA] border border-black/[0.08] rounded-lg px-3 py-2 text-sm font-mono text-[#0A0A0A] placeholder:text-[#C4C4C4] focus:outline-none focus:ring-1 focus:ring-black/20 min-w-0"
                    />
                    <button
                      onClick={() => addMockupUrl(s)}
                      disabled={saving || !mockupInput.trim()}
                      className="px-3 py-2 bg-[#0A0A0A] text-white text-xs font-medium rounded-lg disabled:opacity-40 transition-opacity hover:bg-[#1A1A1A]"
                    >
                      Add
                    </button>
                  </div>

                  {/* Notes */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3]">Notes</label>
                      {noteState === "saving" && <span className="font-mono text-[9px] text-[#A3A3A3]">Saving…</span>}
                      {noteState === "saved" && <span className="font-mono text-[9px] text-[#059669]">Saved</span>}
                    </div>
                    <textarea
                      value={noteText}
                      onChange={(e) => { setNoteText(e.target.value); setNoteState("idle") }}
                      onBlur={handleNoteSave}
                      placeholder="Add a note about this prospect…"
                      rows={2}
                      className="w-full bg-[#FAFAFA] border border-black/[0.08] rounded-lg text-[#0A0A0A] text-sm px-3 py-2 outline-none focus:border-black/[0.2] transition-colors resize-none leading-relaxed placeholder:text-[#C4C4C4]"
                    />
                  </div>
                </div>

                {/* Stage controls */}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-2">Move stage</p>
                  <div className="flex flex-wrap gap-2">
                    {NEXT_STAGE[s.crm_status] && (
                      <button
                        onClick={() => updateStatus(s, NEXT_STAGE[s.crm_status]!)}
                        disabled={saving}
                        className="px-3 py-1.5 bg-[#0A0A0A] text-white text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-[#1A1A1A] transition-colors"
                      >
                        → {STAGES.find(st => st.key === NEXT_STAGE[s.crm_status])?.label}
                      </button>
                    )}
                    {PREV_STAGE[s.crm_status] && (
                      <button
                        onClick={() => updateStatus(s, PREV_STAGE[s.crm_status]!)}
                        disabled={saving}
                        className="px-3 py-1.5 bg-[#F5F5F5] text-[#525252] border border-black/[0.08] text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-black/[0.06] transition-colors"
                      >
                        ← {STAGES.find(st => st.key === PREV_STAGE[s.crm_status])?.label}
                      </button>
                    )}
                    {s.crm_status !== "lost" && s.crm_status !== "paid" && s.crm_status !== "na" && (
                      <button
                        onClick={() => updateStatus(s, "lost")}
                        disabled={saving}
                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-red-100 transition-colors"
                      >
                        Mark lost
                      </button>
                    )}
                    {s.crm_status !== "na" && s.crm_status !== "paid" && s.crm_status !== "lost" && (
                      <button
                        onClick={() => updateStatus(s, "na")}
                        disabled={saving}
                        className="px-3 py-1.5 bg-[#F5F5F5] text-[#737373] border border-black/[0.08] text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-black/[0.06] transition-colors"
                      >
                        Mark N/A
                      </button>
                    )}
                  </div>
                </div>

                {/* Outreach operator status */}
                {s.outreach_status && s.outreach_status !== "NOT_READY" && (
                  <div className="mt-4 border border-black/[0.08] rounded-lg overflow-hidden">
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] bg-[#FAFAFA] px-3 py-2 border-b border-black/[0.06]">Outreach operator</p>
                    <div className="px-3 py-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#A3A3A3] uppercase tracking-[0.1em]">Status</span>
                        <span className={`font-mono text-[10px] uppercase tracking-[0.1em] font-semibold ${
                          s.outreach_status === "SENT" ? "text-emerald-600" :
                          s.outreach_status === "FAILED_TEMPORARY" || s.outreach_status === "FAILED_PERMANENT" || s.outreach_status === "BOUNCED" ? "text-red-500" :
                          s.outreach_status === "REPLIED" ? "text-violet-600" :
                          s.outreach_status === "OPTED_OUT" ? "text-[#A3A3A3]" :
                          "text-[#525252]"
                        }`}>
                          {s.outreach_status.replace(/_/g, " ")}
                        </span>
                      </div>
                      {s.outreach_sent_at && (
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-[#A3A3A3] uppercase tracking-[0.1em]">Sent</span>
                          <span className="text-xs text-[#525252]">{timeAgo(s.outreach_sent_at)}</span>
                        </div>
                      )}
                      {s.outreach_attempt_count && s.outreach_attempt_count > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-[#A3A3A3] uppercase tracking-[0.1em]">Attempts</span>
                          <span className="font-mono text-xs text-[#525252]">{s.outreach_attempt_count}</span>
                        </div>
                      )}
                      {s.outreach_last_error && (
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-mono text-[10px] text-[#A3A3A3] uppercase tracking-[0.1em] shrink-0">Last error</span>
                          <span className="text-xs text-red-500 text-right">{s.outreach_last_error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Outreach tab */}
            {drawerTab === "outreach" && (
              <div className="px-6 sm:px-10 pb-6">
                <div className="max-w-[680px]">
                  {/* Readiness badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`inline-block border rounded-lg px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] font-semibold ${
                      s.mockup_url || s.review_slug
                        ? "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]"
                        : "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
                    }`}>
                      {s.mockup_url || s.review_slug ? "Ready to send" : "No mockup yet"}
                    </span>
                    {s.contacted_at && (
                      <span className="font-mono text-[10px] text-blue-500 uppercase tracking-[0.12em]">
                        Contacted {timeAgo(s.contacted_at)}
                      </span>
                    )}
                  </div>

                  {/* No email warning */}
                  {!s.email && !s.owner_email && (
                    <div className="mb-4 border border-[#FDE68A] bg-[#FEF3C7] rounded-xl px-4 py-3">
                      <p className="text-sm text-[#92400E]">No email address on record for this prospect. You can still draft the email and send manually.</p>
                    </div>
                  )}
                  {!s.email && s.owner_email && (
                    <div className="mb-4 border border-emerald-200 bg-[#F0FDF4] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-emerald-800">Owner email available</p>
                        <p className="text-xs text-emerald-700 mt-0.5 font-mono">{s.owner_email}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(s.owner_email!)
                        }}
                        className="text-xs font-medium text-emerald-700 border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-50 transition-colors shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  )}

                  {/* Gmail connection banner */}
                  {gmailConnected === false && draftState === "ready" && (
                    <div className="mb-4 border border-black/[0.08] rounded-xl px-5 py-4 flex items-center justify-between gap-4">
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

                  {/* Draft area — idle */}
                  {draftState === "idle" && (
                    <div className="py-6">
                      <button
                        onClick={handleGenerate}
                        className="bg-[#0A0A0A] text-[#FAFAFA] text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#333] transition-colors"
                      >
                        Generate email draft
                      </button>
                    </div>
                  )}

                  {/* Draft area — generating */}
                  {draftState === "generating" && (
                    <div className="py-6 flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-black/[0.1] border-t-[#0A0A0A] rounded-full animate-spin" />
                      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">Drafting email…</p>
                    </div>
                  )}

                  {/* Draft area — ready / sending / error */}
                  {(draftState === "ready" || draftState === "sending" || draftState === "error") && draft && (
                    <div className="space-y-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">Email draft — edit before sending</p>

                      {/* Subject */}
                      <div>
                        <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] block mb-1">Subject</label>
                        <input
                          type="text"
                          value={editedSubject}
                          onChange={(e) => setEditedSubject(e.target.value)}
                          className="w-full bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-sm px-3 py-2.5 outline-none focus:border-black/[0.3] transition-colors font-medium"
                        />
                      </div>

                      {/* Body */}
                      <div>
                        <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] block mb-1">Body</label>
                        <textarea
                          value={editedBody}
                          onChange={(e) => setEditedBody(e.target.value)}
                          rows={10}
                          className="w-full bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-sm px-3 py-3 outline-none focus:border-black/[0.3] transition-colors resize-none leading-relaxed font-mono"
                        />
                      </div>

                      {draftState === "error" && (
                        <p className="text-sm text-red-600">Failed to create Gmail draft. Check your connection and try again.</p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-1">
                        {gmailConnected ? (
                          <button
                            onClick={handleSendToGmail}
                            disabled={draftState === "sending"}
                            className="bg-[#0A0A0A] text-[#FAFAFA] text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                            className="bg-[#0A0A0A] text-[#FAFAFA] text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#333] transition-colors"
                          >
                            Connect Gmail to send
                          </button>
                        )}

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`Subject: ${editedSubject}\n\n${editedBody}`)
                          }}
                          className="text-sm text-[#525252] hover:text-[#0A0A0A] transition-colors border border-black/[0.1] px-4 py-2.5 rounded-xl hover:border-black/[0.2]"
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

                  {/* Draft area — sent */}
                  {draftState === "sent" && (
                    <div className="py-8 flex items-center gap-4">
                      <div className="w-9 h-9 bg-[#D1FAE5] rounded-full flex items-center justify-center shrink-0">
                        <span className="text-[#059669] text-lg">✓</span>
                      </div>
                      <div>
                        <p className="font-sans font-bold text-[#0A0A0A] text-base">Draft saved to Gmail</p>
                        <p className="text-sm text-[#737373]">Open Gmail, review, and send when ready.</p>
                      </div>
                      <button
                        onClick={() => {
                          setDraft(null)
                          setDraftState("idle")
                        }}
                        className="ml-auto text-sm text-[#525252] hover:text-[#0A0A0A] transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Mockup preview lightbox — view-only, does NOT advance pipeline */}
      {previewProspect && (
        <MockupPreviewModal
          prospect={previewProspect}
          urls={getMockupUrls(previewProspect)}
          index={previewIndex}
          onIndexChange={setPreviewIndex}
          onClose={closePreview}
        />
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

function MockupPreviewModal({
  prospect,
  urls,
  index,
  onIndexChange,
  onClose,
}: {
  prospect: PipelineProspect
  urls: string[]
  index: number
  onIndexChange: (i: number) => void
  onClose: () => void
}) {
  const hasMultiple = urls.length > 1

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight" && hasMultiple) onIndexChange(Math.min(index + 1, urls.length - 1))
      if (e.key === "ArrowLeft" && hasMultiple) onIndexChange(Math.max(index - 1, 0))
    }
    window.addEventListener("keydown", onKey)
    // Lock body scroll while modal is open
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, urls.length, hasMultiple])

  if (urls.length === 0) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Header bar */}
      <div
        className="flex items-center gap-4 px-6 py-4 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-sans font-semibold text-white text-sm truncate flex-1">
          {prospect.name}
        </p>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
          Internal preview — does not advance pipeline
        </span>
        <button
          onClick={onClose}
          className="shrink-0 text-white/60 hover:text-white transition-colors text-lg leading-none px-2"
          title="Close (Esc)"
        >
          ✕
        </button>
      </div>

      {/* Image area */}
      <div
        className="flex-1 flex items-center justify-center px-6 pb-6 min-h-0 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {hasMultiple && index > 0 && (
          <button
            onClick={() => onIndexChange(index - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-xl"
            title="Previous (←)"
          >
            ‹
          </button>
        )}

        <img
          src={urls[index]}
          alt={`${prospect.name} mockup screen ${index + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />

        {hasMultiple && index < urls.length - 1 && (
          <button
            onClick={() => onIndexChange(index + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-xl"
            title="Next (→)"
          >
            ›
          </button>
        )}
      </div>

      {/* Footer — thumbnail strip + counter */}
      {hasMultiple && (
        <div
          className="shrink-0 px-6 pb-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center gap-2">
            {urls.map((url, i) => (
              <button
                key={i}
                onClick={() => onIndexChange(i)}
                className={`shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                  i === index
                    ? "border-white opacity-100"
                    : "border-transparent opacity-40 hover:opacity-70"
                }`}
                title={`Screen ${i + 1}`}
              >
                <img
                  src={url}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-16 h-12 object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Counter */}
      {hasMultiple && (
        <div
          className="shrink-0 pb-4 flex justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-mono text-[10px] text-white/40 tabular-nums">
            {index + 1} / {urls.length}
          </span>
        </div>
      )}
    </div>
  )
}
