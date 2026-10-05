"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { CrmStatus, Prospect } from "@/lib/supabase"
import { fetchWorkflows, finderAction, type FinderAction } from "@/lib/operatorDb"
import ProspectResearch from "./ProspectResearch"
import ProspectActivity from "./ProspectActivity"
import AddProspectForm from "./AddProspectForm"
import {
  applyDiscoverFilters,
  buildTodayQueue,
  contactChannel,
  discoverSort,
  findDuplicateIds,
  EMPTY_DISCOVER_FILTERS,
  fetchAllProspects,
  hasWorkspaceAsset,
  isAnalysed,
  isCandidate,
  isLegacyScore,
  isShortlisted,
  isTerminal,
  isValidScore,
  NEXT_ACTION_TYPES,
  scoreLabelFor,
  TODAY_LIMIT,
  type DiscoverFilters,
  type NextActionType,
  type ProspectWorkflow,
  type TodayItem,
} from "@/lib/finderModel"

type Mode = "today" | "discover" | "candidates"

const MODES: { key: Mode; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "discover", label: "Discover" },
  { key: "candidates", label: "Candidates" },
]

const PAGE_SIZE = 500
const FETCH_CAP = 5000
const PAGE = 50 // incremental display batch for Discover/Candidates lists

export default function Finder({ onOpenPipeline }: { onOpenPipeline: () => void }) {
  const [mode, setMode] = useState<Mode>("today")
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [truncated, setTruncated] = useState(false)
  const [selected, setSelected] = useState<Prospect | null>(null)
  // null = loading, false = workflow layer unavailable (migration not applied)
  const [workflowReady, setWorkflowReady] = useState<boolean | null>(null)
  const [workflowError, setWorkflowError] = useState<string | null>(null)
  const [workflows, setWorkflows] = useState<Map<number, ProspectWorkflow>>(new Map())

  const [activityRevision, setActivityRevision] = useState(0)
  const [showAddRecord, setShowAddRecord] = useState(false)

  useEffect(() => {
    let mounted = true
    fetchWorkflows()
      .then((map) => {
        if (!mounted) return
        setWorkflows(map)
        setWorkflowReady(true)
      })
      .catch((e) => {
        if (!mounted) return
        setWorkflowReady(false)
        setWorkflowError(e instanceof Error ? e.message : "Could not load workflow data")
      })
    return () => { mounted = false }
  }, [])

  const onWorkflowChange = useCallback((w: ProspectWorkflow) => {
    setWorkflows((prev) => new Map(prev).set(w.prospect_id, w))
    setActivityRevision((r) => r + 1)
  }, [])

  const onStatusChange = useCallback((id: number, crm: CrmStatus) => {
    setProspects((prev) => prev.map((x) => (x.id === id ? { ...x, crm_status: crm } : x)))
    setSelected((s) => (s && s.id === id ? { ...s, crm_status: crm } : s))
  }, [])

  const refreshWorkflows = useCallback(async () => {
    try {
      setWorkflows(await fetchWorkflows())
    } catch {
      // keep last known map; next action attempt will surface errors itself
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAllProspects(
        (from, to) =>
          supabase
            .from("prospects")
            .select("*")
            .order("id", { ascending: true })
            .range(from, to),
        { pageSize: PAGE_SIZE, cap: FETCH_CAP }
      )
      setProspects(result.prospects)
      setTruncated(result.truncated)
    } catch (e) {
      setProspects([])
      setError(e instanceof Error ? e.message : "Failed to load prospects")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const todayFullQueue = useMemo(
    () => buildTodayQueue(prospects, { workflows, limit: Infinity }),
    [prospects, workflows]
  )
  const todayQueue = useMemo(() => todayFullQueue.slice(0, TODAY_LIMIT), [todayFullQueue])
  const candidates = useMemo(() => prospects.filter(isCandidate), [prospects])
  const shortlisted = useMemo(
    () => prospects.filter((p) => isShortlisted(workflows.get(p.id))),
    [prospects, workflows]
  )

  const showDetail = selected != null

  return (
    <div className="flex h-[calc(100dvh-3.5rem)]">
      <main className={`flex-1 overflow-y-auto ${showDetail ? "hidden sm:block" : ""}`}>
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 pt-10 pb-24">

          {/* Header */}
          <div className="mb-8">
            <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-3">
              Prospect Finder — acquisition workspace
            </p>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h2 className="font-sans font-extrabold text-[#0A0A0A] text-3xl tracking-tight">
                Finder
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddRecord((v) => !v)}
                  className="bg-white border border-black/[0.12] text-[#0A0A0A] font-semibold text-xs rounded-lg px-4 py-2.5 hover:bg-black/[0.04] transition-colors"
                >
                  + Add record
                </button>
                <button
                  onClick={onOpenPipeline}
                  className="bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-xs rounded-lg px-4 py-2.5 hover:bg-[#2a2a2a] transition-colors"
                >
                  Open Pipeline →
                </button>
              </div>
            </div>
          </div>

          {/* Add CRM record form */}
          {showAddRecord && (
            <div className="mb-8 bg-white border border-black/[0.08] rounded-xl px-5 py-4">
              <AddProspectForm
                onAdded={(record, workflow) => {
                  setProspects((prev) => [record as Prospect, ...prev])
                  if (workflow) onWorkflowChange(workflow)
                }}
                onClose={() => setShowAddRecord(false)}
              />
            </div>
          )}

          {/* Workflow availability strip — shown only when the layer can't be read */}
          {workflowReady === false && (
            <div className="mb-6 bg-white border border-black/[0.08] rounded-xl px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3]">
                Workflow layer unavailable — apply migration 20261001121500_finder_workflow.sql
              </p>
              {workflowError && (
                <p className="mt-1 font-mono text-[10px] text-[#C4C4C4]">{workflowError}</p>
              )}
            </div>
          )}

          {/* Mode tabs */}
          <ModeTabs
            mode={mode}
            onChange={(m) => { setMode(m); setSelected(null) }}
            todayCount={loading || error ? null : todayFullQueue.length}
            candidateCount={loading || error ? null : candidates.length}
          />

          {/* Fetch states */}
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="border border-black/[0.08] rounded-xl bg-white px-6 py-10 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-3">
                Could not load prospects
              </p>
              <p className="text-sm text-[#525252] mb-6">{error}</p>
              <button
                onClick={load}
                className="bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-xs rounded-lg px-5 py-2.5 hover:bg-[#2a2a2a] transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {truncated && (
                <div className="mb-6 border border-black/[0.08] rounded-lg bg-white px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#737373]">
                    Showing first {prospects.length.toLocaleString()} records — safety cap reached
                  </p>
                </div>
              )}

              {mode === "today" && (
                <TodayView
                  queue={todayQueue}
                  total={todayFullQueue.length}
                  signedIn={workflowReady === true}
                  onSelect={setSelected}
                  selectedId={selected?.id ?? null}
                  onBrowse={(m) => { setMode(m); setSelected(null) }}
                />
              )}
              {mode === "discover" && (
                <DiscoverView prospects={prospects} onSelect={setSelected} selectedId={selected?.id ?? null} />
              )}
              {mode === "candidates" && (
                <CandidatesView
                  candidates={candidates}
                  shortlisted={shortlisted}
                  onSelect={setSelected}
                  selectedId={selected?.id ?? null}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Detail panel */}
      {showDetail && (
        <RecordPanel
          prospect={selected}
          workflow={workflows.get(selected.id)}
          canWrite={workflowReady === true}
          activityRevision={activityRevision}
          onWorkflowChange={onWorkflowChange}
          onActivityChange={() => setActivityRevision((revision) => revision + 1)}
          onRefreshWorkflows={refreshWorkflows}
          onStatusChange={onStatusChange}
          onClose={() => setSelected(null)}
        />
      )}

    </div>
  )
}

function ModeTabs({
  mode,
  onChange,
  todayCount,
  candidateCount,
}: {
  mode: Mode
  onChange: (m: Mode) => void
  todayCount: number | null
  candidateCount: number | null
}) {
  return (
    <div className="flex items-center gap-1 mb-0 border-b border-black/[0.06] pb-px overflow-x-auto">
      {MODES.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={`text-xs font-medium px-3 py-2 rounded-t-md transition-colors border-b-2 -mb-px whitespace-nowrap ${
            mode === m.key
              ? "border-[#0A0A0A] text-[#0A0A0A]"
              : "border-transparent text-[#A3A3A3] hover:text-[#525252]"
          }`}
        >
          {m.label}
          {m.key === "today" && todayCount != null && todayCount > 0 && (
            <span className="ml-1.5 font-mono text-[10px] text-[#A3A3A3]">{todayCount}</span>
          )}
          {m.key === "candidates" && candidateCount != null && candidateCount > 0 && (
            <span className="ml-1.5 font-mono text-[10px] text-[#A3A3A3]">{candidateCount}</span>
          )}
        </button>
      ))}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 bg-black/[0.04] rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

/* ---------------------------------- Today ---------------------------------- */

function TodayView({
  queue,
  total,
  signedIn,
  onSelect,
  selectedId,
  onBrowse,
}: {
  queue: TodayItem[]
  total: number
  signedIn: boolean
  onSelect: (p: Prospect) => void
  selectedId: number | null
  onBrowse: (m: Mode) => void
}) {
  const replies = queue.filter((i) => i.kind === "reply")
  const due = queue.filter((i) => i.kind === "due")
  const research = queue.filter((i) => i.kind === "research")
  const ready = queue.filter((i) => i.kind === "ready")

  if (queue.length === 0) {
    return (
      <div className="border border-dashed border-black/[0.12] rounded-xl px-6 py-12 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-3">
          Nothing recommended right now
        </p>
        <p className="text-sm text-[#737373] max-w-md mx-auto leading-relaxed">
          {signedIn
            ? "No replies, scheduled actions, research candidates, or qualified contacts to recommend yet."
            : "No replies or machine-qualified contacts to recommend yet."}{" "}
          Browse Discover to review records.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <p className="text-xs text-[#737373] leading-relaxed">
        Replies and scheduled actions come first, followed by candidates needing a scouting decision.
        Showing up to {TODAY_LIMIT} of {total.toLocaleString()}.
      </p>

      {/* Replies */}
      {replies.length > 0 && (
        <section>
          <SectionLabel count={replies.length}>Replies — respond first</SectionLabel>
          <div className="bg-[#0A0A0A] rounded-2xl p-2 sm:p-3 space-y-1">
            {replies.map(({ prospect: p, workflow }) => (
              <QueueRow key={p.id} prospect={p} workflow={workflow} dark selected={selectedId === p.id} onSelect={() => onSelect(p)} />
            ))}
          </div>
        </section>
      )}

      {/* Due scheduled actions */}
      {due.length > 0 && (
        <section>
          <SectionLabel count={due.length}>Due — scheduled actions</SectionLabel>
          <div className="bg-white border-2 border-[#0A0A0A] rounded-2xl p-2 sm:p-3 space-y-1">
            {due.map(({ prospect: p, workflow }) => (
              <QueueRow key={p.id} prospect={p} workflow={workflow} due selected={selectedId === p.id} onSelect={() => onSelect(p)} />
            ))}
          </div>
        </section>
      )}

      {/* Qualified candidates awaiting a human scouting decision */}
      {research.length > 0 && (
        <section>
          <SectionLabel count={research.length}>Research — make a scouting decision</SectionLabel>
          <div className="bg-white border border-black/[0.08] rounded-2xl p-2 sm:p-3 space-y-1">
            {research.map(({ prospect: p, workflow }) => (
              <QueueRow key={p.id} prospect={p} workflow={workflow} research selected={selectedId === p.id} onSelect={() => onSelect(p)} />
            ))}
          </div>
        </section>
      )}

      {/* Ready to contact */}
      {ready.length > 0 && (
        <section>
          <SectionLabel count={ready.length}>Qualified — ready to contact</SectionLabel>
          <div className="bg-white border border-black/[0.08] rounded-2xl p-2 sm:p-3 space-y-1">
            {ready.map(({ prospect: p, workflow }) => (
              <QueueRow key={p.id} prospect={p} workflow={workflow} selected={selectedId === p.id} onSelect={() => onSelect(p)} />
            ))}
          </div>
        </section>
      )}

      {total > queue.length && (
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3]">
          {total - queue.length} more — see{" "}
          <button onClick={() => onBrowse("candidates")} className="underline underline-offset-2 hover:text-[#0A0A0A] transition-colors">Candidates</button>
          {" "}or{" "}
          <button onClick={() => onBrowse("discover")} className="underline underline-offset-2 hover:text-[#0A0A0A] transition-colors">Discover</button>
        </p>
      )}

      {replies.length === 0 && (
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#C4C4C4]">
          No replies yet — outreach responses will appear here first.
        </p>
      )}
    </div>
  )
}

function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-3">
      {children}
      {count != null && <span className="ml-2 text-[#C4C4C4] tabular-nums">{count}</span>}
    </p>
  )
}

function QueueRow({
  prospect: p,
  workflow,
  dark = false,
  due = false,
  research = false,
  selected,
  onSelect,
}: {
  prospect: Prospect
  workflow?: ProspectWorkflow
  dark?: boolean
  due?: boolean
  research?: boolean
  selected: boolean
  onSelect: () => void
}) {
  const channel = contactChannel(p)
  const text = dark ? "text-[#FAFAFA]" : "text-[#0A0A0A]"
  const sub = dark ? "text-[#A3A3A3]" : "text-[#737373]"
  const hover = dark ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.03]"
  const overdue = due && workflow?.next_action_at && new Date(workflow.next_action_at) < new Date()

  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-3 sm:px-4 py-3 transition-colors ${hover} ${
        selected ? (dark ? "bg-white/[0.08]" : "bg-black/[0.04]") : ""
      }`}
    >
      <button onClick={onSelect} className="flex-1 min-w-[140px] text-left">
        <p className={`text-sm font-semibold truncate ${text}`}>{p.name}</p>
        <p className={`font-mono text-[10px] uppercase tracking-[0.12em] truncate ${sub}`}>
          {[p.category, p.city].filter(Boolean).join(" · ") || "—"}
          {!isLegacyScore(p) && isValidScore(p.prospect_score) && ` · score ${p.prospect_score}/10`}
          {isLegacyScore(p) && ` · legacy score`}
          {due && workflow?.next_action_at && (
            <span className={overdue ? "text-[#0A0A0A] font-bold" : "text-[#525252]"}>
              {` · ${workflow.next_action_type?.replace(/_/g, " ")} — ${overdue ? "overdue " : "due "}${fmtDateTime(workflow.next_action_at)}`}
            </span>
          )}
          {research && ` · ${workflow?.research_status?.replace(/_/g, " ") ?? "unreviewed"}${workflow?.scout_priority ? ` · priority ${workflow.scout_priority}/5` : ""}`}
        </p>
      </button>

      <div className="flex flex-wrap items-center gap-1.5">
        {channel?.kind === "email" && (
          <a
            href={`mailto:${channel.value}`}
            onClick={(e) => e.stopPropagation()}
            className={actionClass(dark)}
            title={`Opens your email app — not logged as outreach (${channel.value})`}
          >
            Email
          </a>
        )}
        {channel?.kind === "phone" && (
          <a
            href={`tel:${channel.value}`}
            onClick={(e) => e.stopPropagation()}
            className={actionClass(dark)}
            title={`Opens your phone app — not logged as outreach (${channel.value})`}
          >
            Call
          </a>
        )}
        {p.website && (
          <a
            href={websiteHref(p.website)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={actionClass(dark)}
            title={`Open website in a new window — ${p.website}`}
          >
            Website ↗
          </a>
        )}
        {p.review_slug && (
          <a
            href={`/workspace/?slug=${p.review_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={actionClass(dark)}
          >
            Open workspace
          </a>
        )}
        <button onClick={onSelect} className={actionClass(dark, true)}>
          Review record
        </button>
      </div>
    </div>
  )
}

function websiteHref(url: string): string {
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`
}

function actionClass(dark: boolean, primary = false) {
  if (dark) {
    return primary
      ? "text-[11px] font-semibold text-[#0A0A0A] bg-[#FAFAFA] rounded-md px-2.5 py-1.5 hover:bg-white transition-colors whitespace-nowrap"
      : "text-[11px] font-medium text-[#D4D4D4] border border-white/[0.15] rounded-md px-2.5 py-1.5 hover:bg-white/[0.08] transition-colors whitespace-nowrap"
  }
  return primary
    ? "text-[11px] font-semibold text-[#FAFAFA] bg-[#0A0A0A] rounded-md px-2.5 py-1.5 hover:bg-[#2a2a2a] transition-colors whitespace-nowrap"
    : "text-[11px] font-medium text-[#525252] border border-black/[0.12] rounded-md px-2.5 py-1.5 hover:bg-black/[0.04] transition-colors whitespace-nowrap"
}

/* --------------------------------- Discover --------------------------------- */

function DiscoverView({
  prospects,
  onSelect,
  selectedId,
}: {
  prospects: Prospect[]
  onSelect: (p: Prospect) => void
  selectedId: number | null
}) {
  const [filters, setFilters] = useState<DiscoverFilters>(EMPTY_DISCOVER_FILTERS)

  const locations = useMemo(
    () => ["All", ...Array.from(new Set(prospects.map((p) => p.city).filter(Boolean) as string[])).sort()],
    [prospects]
  )
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(prospects.map((p) => p.category).filter(Boolean) as string[])).sort()],
    [prospects]
  )

  const filtered = useMemo(() => discoverSort(applyDiscoverFilters(prospects, filters)), [prospects, filters])
  const dupIds = useMemo(() => findDuplicateIds(prospects), [prospects])
  const [shown, setShown] = useState(PAGE)
  useEffect(() => setShown(PAGE), [filters])

  const update = <K extends keyof DiscoverFilters>(key: K, value: DiscoverFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }))

  const selectClass =
    "bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-xs px-3 py-2 outline-none focus:border-black/[0.3] transition-colors appearance-none cursor-pointer"

  const dirty =
    filters.search !== "" ||
    filters.location !== "All" ||
    filters.category !== "All" ||
    filters.contactable !== "all" ||
    filters.analysis !== "all" ||
    filters.candidate !== "all" ||
    filters.archived !== "hide"

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search name, city, website, email…"
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="flex-1 min-w-[200px] bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-xs px-3 py-2 outline-none focus:border-black/[0.3] transition-colors placeholder:text-[#A3A3A3]"
        />
        <select value={filters.location} onChange={(e) => update("location", e.target.value)} className={selectClass}>
          {locations.map((c) => <option key={c} value={c}>{c === "All" ? "All locations" : c}</option>)}
        </select>
        <select value={filters.category} onChange={(e) => update("category", e.target.value)} className={selectClass}>
          {categories.map((c) => <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>)}
        </select>
        <select value={filters.contactable} onChange={(e) => update("contactable", e.target.value as DiscoverFilters["contactable"])} className={selectClass}>
          <option value="all">Any contactability</option>
          <option value="yes">Contactable</option>
          <option value="no">No channel</option>
        </select>
        <select value={filters.analysis} onChange={(e) => update("analysis", e.target.value as DiscoverFilters["analysis"])} className={selectClass}>
          <option value="all">Any analysis</option>
          <option value="analysed">Analysed</option>
          <option value="pending">Pending analysis</option>
        </select>
        <select value={filters.candidate} onChange={(e) => update("candidate", e.target.value as DiscoverFilters["candidate"])} className={selectClass}>
          <option value="all">Any qualification</option>
          <option value="candidates">Machine candidates</option>
          <option value="not">Not candidates</option>
        </select>
        <label className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.archived === "show"}
            onChange={(e) => update("archived", e.target.checked ? "show" : "hide")}
            className="accent-[#0A0A0A]"
          />
          Show archived
        </label>
        {dirty && (
          <button
            onClick={() => setFilters(EMPTY_DISCOVER_FILTERS)}
            className="text-xs text-[#A3A3A3] hover:text-[#525252] transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-4">
        {filtered.length.toLocaleString()} of {prospects.length.toLocaleString()} records
      </p>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-black/[0.12] rounded-xl px-6 py-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-3">No matches</p>
          <p className="text-sm text-[#737373]">Adjust the filters, or run the finder to collect more records.</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-black/[0.08] rounded-2xl divide-y divide-black/[0.05]">
            {filtered.slice(0, shown).map((p) => (
              <DiscoverRow key={p.id} prospect={p} selected={selectedId === p.id} onSelect={() => onSelect(p)} tag={dupIds.has(p.id) ? "possible duplicate" : undefined} />
            ))}
          </div>
          {filtered.length > shown && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShown((s) => s + PAGE)}
                className="bg-white border border-black/[0.12] text-[#0A0A0A] font-semibold text-xs rounded-lg px-5 py-2.5 hover:bg-black/[0.04] transition-colors"
              >
                Load more ({(filtered.length - shown).toLocaleString()} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function DiscoverRow({ prospect: p, dark = false, tag, selected, onSelect }: { prospect: Prospect; dark?: boolean; tag?: string; selected: boolean; onSelect: () => void }) {
  const name = dark ? "text-[#FAFAFA]" : "text-[#0A0A0A]"
  const scoreText = dark ? "text-[#FAFAFA]" : "text-[#0A0A0A]"
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 sm:px-5 py-4 flex items-center gap-5 transition-colors ${
        dark
          ? selected ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"
          : selected ? "bg-black/[0.04]" : "hover:bg-black/[0.02]"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${name}`}>{p.name}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] truncate mt-0.5">
          {[p.category, p.city].filter(Boolean).join(" · ") || "—"}
          {tag && <span className={dark ? "text-[#D4D4D4]" : "text-[#737373]"}>{` · ${tag}`}</span>}
        </p>
      </div>
      <div className="hidden md:block w-24 shrink-0">
        <MiniStat label="Rating" value={p.rating != null ? `${p.rating}★` : "—"} sub={p.review_count != null ? `${p.review_count}` : undefined} />
      </div>
      <div className="hidden lg:block w-16 shrink-0">
        <MiniStat
          label="Intake"
          value={p.intake_priority != null ? `${p.intake_priority}/10` : "Not ranked"}
          hint="Maps-only early estimate — not a site score"
        />
      </div>
      <div className="hidden sm:block w-16 shrink-0">
        <MiniStat label="Quality" value={scoreLabelFor(p, p.site_score)} hint="low = weak site" />
      </div>
      <div className="hidden sm:block w-16 shrink-0">
        <MiniStat label="Gap" value={scoreLabelFor(p, p.opportunity_score)} hint="high = big gap" />
      </div>
      <div className="w-20 shrink-0 text-right">
        {isLegacyScore(p) ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#C4C4C4]">Legacy</span>
        ) : isValidScore(p.prospect_score) ? (
          <span className={`font-mono text-sm font-bold tabular-nums ${scoreText}`}>{p.prospect_score}<span className="text-[#A3A3A3] font-normal text-[10px]">/10</span></span>
        ) : p.prospect_score != null ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#C4C4C4]">Legacy</span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#C4C4C4]">Pending</span>
        )}
      </div>
      <span className="text-[#C4C4C4] shrink-0">→</span>
    </button>
  )
}

function MiniStat({ label, value, sub, hint }: { label: string; value: string; sub?: string; hint?: string }) {
  return (
    <div title={hint}>
      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#C4C4C4]">{label}</p>
      <p className="font-mono text-xs text-[#525252] tabular-nums">
        {value}
        {sub && <span className="text-[#C4C4C4]"> ({sub})</span>}
      </p>
    </div>
  )
}

/* -------------------------------- Candidates -------------------------------- */

function CandidatesView({
  candidates,
  shortlisted,
  onSelect,
  selectedId,
}: {
  candidates: Prospect[]
  shortlisted: Prospect[]
  onSelect: (p: Prospect) => void
  selectedId: number | null
}) {
  const [shown, setShown] = useState(PAGE)
  return (
    <div className="space-y-8">
      {shortlisted.length > 0 && (
        <section>
          <SectionLabel count={shortlisted.length}>Shortlisted — human picks</SectionLabel>
          <div className="bg-[#0A0A0A] rounded-2xl divide-y divide-white/[0.08]">
            {shortlisted.map((p) => (
              <DiscoverRow
                key={p.id}
                prospect={p}
                dark
                tag={isTerminal(p) ? `crm: ${p.crm_status}` : undefined}
                selected={selectedId === p.id}
                onSelect={() => onSelect(p)}
              />
            ))}
          </div>
        </section>
      )}
      <div className="mb-6 bg-white border border-black/[0.08] rounded-xl px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-1">
          Machine candidates — human review required
        </p>
        <p className="text-xs text-[#737373] leading-relaxed">
          Flagged by the qualification gate as viable prospects with a weak site and fast payback.
          Nothing here is shortlisted or committed — review each record before acting.
        </p>
      </div>

      {candidates.length === 0 ? (
        <div className="border border-dashed border-black/[0.12] rounded-xl px-6 py-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-3">No candidates yet</p>
          <p className="text-sm text-[#737373]">The qualification gate has not flagged any records. Run the analyser over pending prospects.</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-black/[0.08] rounded-2xl divide-y divide-black/[0.05]">
            {candidates.slice(0, shown).map((p) => (
              <DiscoverRow key={p.id} prospect={p} selected={selectedId === p.id} onSelect={() => onSelect(p)} />
            ))}
          </div>
          {candidates.length > shown && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShown((s) => s + PAGE)}
                className="bg-white border border-black/[0.12] text-[#0A0A0A] font-semibold text-xs rounded-lg px-5 py-2.5 hover:bg-black/[0.04] transition-colors"
              >
                Load more ({(candidates.length - shown).toLocaleString()} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ------------------------------- Record panel ------------------------------- */

function RecordPanel({
  prospect: p,
  workflow,
  canWrite,
  activityRevision,
  onWorkflowChange,
  onActivityChange,
  onRefreshWorkflows,
  onStatusChange,
  onClose,
}: {
  prospect: Prospect
  workflow: ProspectWorkflow | undefined
  canWrite: boolean
  activityRevision: number
  onWorkflowChange: (w: ProspectWorkflow) => void
  onActivityChange: () => void
  onRefreshWorkflows: () => Promise<void>
  onStatusChange: (id: number, crm: CrmStatus) => void
  onClose: () => void
}) {
  const channel = contactChannel(p)
  const ownerLabel =
    p.owner_role === "director" ? "Companies House director" : "Contact"
  const ownerSource =
    p.owner_source === "companies_house"
      ? "Companies House"
      : p.owner_source ?? "enrichment"

  return (
    <aside className="w-full sm:w-[380px] lg:w-[420px] shrink-0 border-l border-black/[0.08] bg-[#FAFAFA] overflow-y-auto flex flex-col">
      <div className="sticky top-0 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-black/[0.06] px-6 py-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-sans font-bold text-[#0A0A0A] text-base leading-snug truncate">{p.name}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] mt-0.5">
            {[p.category, p.city].filter(Boolean).join(" · ") || "record detail"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors text-lg leading-none mt-0.5"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Action bar — read-only real actions */}
      <div className="px-6 py-3 border-b border-black/[0.06] flex flex-wrap items-center gap-2">
        {channel?.kind === "email" && (
          <a
            href={`mailto:${channel.value}`}
            title="Opens your email app — not logged as outreach"
            className="bg-[#0A0A0A] text-[#FAFAFA] text-xs font-semibold rounded-lg px-3 py-2 hover:bg-[#2a2a2a] transition-colors"
          >
            Email
          </a>
        )}
        {channel?.kind === "phone" && (
          <a
            href={`tel:${channel.value}`}
            title="Opens your phone app — not logged as outreach"
            className="bg-[#0A0A0A] text-[#FAFAFA] text-xs font-semibold rounded-lg px-3 py-2 hover:bg-[#2a2a2a] transition-colors"
          >
            Call
          </a>
        )}
        {p.website && (
          <a
            href={websiteHref(p.website)}
            target="_blank"
            rel="noopener noreferrer"
            title="Open website in a new window"
            className="bg-white border border-black/[0.12] text-[#0A0A0A] text-xs font-semibold rounded-lg px-3 py-2 hover:bg-black/[0.04] transition-colors"
          >
            Website ↗
          </a>
        )}
        {p.review_slug && (
          <a
            href={`/workspace/?slug=${p.review_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-black/[0.12] text-[#0A0A0A] text-xs font-semibold rounded-lg px-3 py-2 hover:bg-black/[0.04] transition-colors"
          >
            Open workspace ↗
          </a>
        )}
        {!channel && (
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#C4C4C4]">No usable contact channel</p>
        )}
        <ArchiveRestoreButton key={p.id} prospect={p} onStatusChange={onStatusChange} />
      </div>

      <div className="flex-1 px-6 py-6 space-y-6">

        {/* Workflow controls */}
        <WorkflowSection
          key={p.id}
          prospect={p}
          workflow={workflow}
          canWrite={canWrite}
          onWorkflowChange={onWorkflowChange}
          onRefreshWorkflows={onRefreshWorkflows}
        />

        <ProspectResearch
          prospect={p}
          workflow={workflow}
          canWrite={canWrite}
          onWorkflowChange={onWorkflowChange}
          onActivityChange={onActivityChange}
        />

        {/* Business signals */}
        <section>
          <PanelLabel>Business signals</PanelLabel>
          <div className="bg-white border border-black/[0.08] rounded-lg px-4 py-3 space-y-2">
            <PanelRow label="Maps rating" value={p.rating != null ? `${p.rating}★` : null} missing="No rating data" />
            <PanelRow label="Reviews" value={p.review_count != null ? String(p.review_count) : null} />
            <PanelRow
              label="Prospect score"
              value={
                isLegacyScore(p)
                  ? "Legacy — re-analysis pending"
                  : isValidScore(p.prospect_score)
                  ? `${p.prospect_score}/10`
                  : p.prospect_score != null
                  ? "Legacy — re-analysis pending"
                  : null
              }
              missing="Pending analysis"
            />
            <PanelRow
              label="Site quality"
              value={isLegacyScore(p) ? "Legacy" : p.site_score != null ? `${p.site_score}/10` : null}
              hint="low = weak site"
            />
            <PanelRow
              label="Signal gap"
              value={isLegacyScore(p) ? "Legacy" : p.opportunity_score != null ? `${p.opportunity_score}/10` : null}
              hint="high = opportunity"
            />
            <PanelRow
              label="Business quality"
              value={isLegacyScore(p) ? "Legacy" : p.business_quality_score != null ? `${p.business_quality_score}/10` : null}
              hint="evidence"
            />
            {p.payback_jobs != null && <PanelRow label="Payback" value={`~${p.payback_jobs} jobs`} />}
          </div>
          {!isAnalysed(p) && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#C4C4C4]">
              Not yet analysed — run the Website Analyser to score this record.
            </p>
          )}
        </section>

        {/* Contact & Companies House */}
        <section>
          <PanelLabel>Contact & Companies House</PanelLabel>
          <div className="bg-white border border-black/[0.08] rounded-lg px-4 py-3 space-y-2">
            {p.owner_name ? (
              <PanelRow
                label={ownerLabel}
                value={`${p.owner_name} · ${ownerSource}`}
              />
            ) : (
              <PanelRow label="Contact" value={null} missing="No named contact on file" />
            )}
            <PanelRow
              label="CH match"
              value={p.ch_status ? `${p.ch_status}${p.ch_match_confidence ? ` · ${p.ch_match_confidence} confidence` : ""}` : null}
              missing="Not matched"
            />
            {p.source_url && (
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3] shrink-0">CH profile</span>
                <a
                  href={p.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#0A0A0A] font-medium text-right truncate underline decoration-black/[0.2] underline-offset-2 hover:decoration-black/[0.6]"
                  title={p.source_company_number ? `Companies House ${p.source_company_number}` : "Companies House profile"}
                >
                  View ↗
                </a>
              </div>
            )}
            <PanelRow label="Email" value={p.email} missing="No email" />
            {p.owner_email && (
              <PanelRow
                label="Owner email"
                value={`${p.owner_email}${p.owner_email_status ? ` · ${p.owner_email_status}` : ""}`}
              />
            )}
            <PanelRow label="Phone" value={p.phone} missing="No phone" />
            {p.website && (
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3] shrink-0">Website</span>
                <a
                  href={websiteHref(p.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#0A0A0A] font-medium text-right truncate underline decoration-black/[0.2] underline-offset-2 hover:decoration-black/[0.6]"
                >
                  {p.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")} ↗
                </a>
              </div>
            )}
          </div>
        </section>

        <TechnologySection prospect={p} />

        {/* Outreach status */}
        <section>
          <PanelLabel>Outreach</PanelLabel>
          <div className="bg-white border border-black/[0.08] rounded-lg px-4 py-3 space-y-2">
            <PanelRow label="CRM stage" value={p.crm_status ?? "new"} />
            <PanelRow label="Outreach status" value={p.outreach_status ?? null} missing="Not in outreach" />
            {p.outreach_sent_at && <PanelRow label="Sent" value={fmtDate(p.outreach_sent_at)} />}
            {p.email_replied_at && <PanelRow label="Replied" value={fmtDate(p.email_replied_at)} />}
            {p.email_bounced_at && <PanelRow label="Bounced" value={fmtDate(p.email_bounced_at)} />}
            {p.email_opted_out_at && <PanelRow label="Opted out" value={fmtDate(p.email_opted_out_at)} />}
          </div>
        </section>

        {/* Evidence */}
        {p.qualification_reasons && p.qualification_reasons.length > 0 && (
          <section>
            <PanelLabel>Qualification evidence</PanelLabel>
            <ul className="bg-white border border-black/[0.08] rounded-lg px-4 py-3 space-y-1">
              {p.qualification_reasons.map((r, i) => (
                <li key={i} className="text-xs text-[#525252] leading-snug">· {r}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Workspace */}
        {hasWorkspaceAsset(p) && (
          <section>
            <PanelLabel>Assets</PanelLabel>
            <div className="bg-white border border-black/[0.08] rounded-lg px-4 py-3 space-y-2">
              {p.review_slug && <PanelRow label="Workspace" value={`/workspace/?slug=${p.review_slug}`} />}
              {p.mockup_url && <PanelRow label="Mockup" value="ready" />}
            </div>
          </section>
        )}

        {/* Activity timeline */}
        <ProspectActivity prospect={p} canWrite={canWrite} refreshKey={activityRevision} onWorkflowChange={onWorkflowChange} />
      </div>
    </aside>
  )
}

// Archive (crm_status='na') / restore. No hard delete — reversible status change only.
function ArchiveRestoreButton({
  prospect: p,
  onStatusChange,
}: {
  prospect: Prospect
  onStatusChange: (id: number, crm: CrmStatus) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const terminal = isTerminal(p)

  async function execute(target: CrmStatus, auditNote: string) {
    setBusy(true)
    setErr(null)
    const { error } = await supabase.from("prospects").update({ crm_status: target }).eq("id", p.id)
    if (error) {
      setErr(error.message)
      setBusy(false)
      return
    }
    onStatusChange(p.id, target)
    setBusy(false)
    setConfirming(false)
    // Best-effort audit note — never blocks the UI
    try {
      await finderAction(p.id, "note", { note: auditNote })
    } catch {
      /* ignore */
    }
  }

  const btnClass = terminal
    ? "text-[#525252] hover:text-[#0A0A0A] border border-black/[0.12] rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-40"
    : "text-[#A3A3A3] hover:text-red-600 border border-black/[0.12] rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-40"

  if (terminal) {
    return (
      <>
        <button
          onClick={() => execute("new", "Restored to new in Finder")}
          disabled={busy}
          className={btnClass}
        >
          {busy ? "Restoring…" : "Restore"}
        </button>
        {err && <p className="w-full text-xs text-red-600">{err}</p>}
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => {
          if (!confirming) { setConfirming(true); setErr(null); return }
          execute("na", "Marked N/A in Finder")
        }}
        disabled={busy}
        className={`${btnClass} ${confirming ? "text-red-600 border-red-600/[0.4]" : ""}`}
      >
        {busy ? "Removing…" : confirming ? "Confirm remove" : "Remove"}
      </button>
      {confirming && !busy && (
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-[#A3A3A3] hover:text-[#525252] transition-colors"
        >
          Cancel
        </button>
      )}
      {err && <p className="w-full text-xs text-red-600">{err}</p>}
    </>
  )
}

/* ---------------------------- Workflow controls ---------------------------- */

function WorkflowSection({
  prospect: p,
  workflow: w,
  canWrite,
  onWorkflowChange,
  onRefreshWorkflows,
}: {
  prospect: Prospect
  workflow: ProspectWorkflow | undefined
  canWrite: boolean
  onWorkflowChange: (w: ProspectWorkflow) => void
  onRefreshWorkflows: () => Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [scheduling, setScheduling] = useState(false)
  const [actionType, setActionType] = useState<NextActionType>("follow_up")
  const [actionAt, setActionAt] = useState("")
  const [actionNote, setActionNote] = useState("")
  const [noteText, setNoteText] = useState("")

  const shortlisted = isShortlisted(w)
  const scheduled = w?.next_action_at != null && w.next_action_type != null
  const terminal = isTerminal(p)

  async function run(action: FinderAction, opts: Parameters<typeof finderAction>[2] = {}) {
    setBusy(true)
    setErr(null)
    try {
      const row = await finderAction(p.id, action, opts)
      onWorkflowChange(row)
      onRefreshWorkflows()
      return true
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Action failed")
      return false
    } finally {
      setBusy(false)
    }
  }

  async function unshortlist() {
    if (scheduled && !window.confirm("This prospect has a scheduled action — unshortlisting clears it. Continue?")) return
    await run("unshortlist")
  }

  async function schedule() {
    if (!actionAt) { setErr("Pick a date and time for the action"); return }
    const at = new Date(actionAt)
    if (isNaN(at.getTime())) { setErr("Invalid date/time"); return }
    const ok = await run("schedule", {
      nextActionType: actionType,
      nextActionAt: at.toISOString(),
      note: actionNote || undefined,
    })
    if (ok) { setScheduling(false); setActionNote("") }
  }

  return (
    <section>
      <PanelLabel>Workflow</PanelLabel>
      <div className="bg-white border border-black/[0.08] rounded-lg px-4 py-3 space-y-3">
        {!canWrite || terminal ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#C4C4C4]">
            {terminal && canWrite
              ? "Archived — restore to manage"
              : "Workflow layer unavailable — see notice above"}
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3]">Shortlist</span>
              {shortlisted ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] font-semibold text-[#0A0A0A]">
                  Shortlisted{w?.shortlisted_at ? ` · ${fmtDate(w.shortlisted_at)}` : ""}
                </span>
              ) : (
                <span className="font-mono text-[10px] text-[#C4C4C4]">Not shortlisted</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {shortlisted ? (
                <button
                  onClick={unshortlist}
                  disabled={busy}
                  className="text-[11px] font-medium text-[#525252] border border-black/[0.12] rounded-md px-2.5 py-1.5 hover:bg-black/[0.04] transition-colors disabled:opacity-40"
                >
                  Unshortlist{scheduled ? " (clears scheduled action)" : ""}
                </button>
              ) : (
                <button
                  onClick={() => run("shortlist")}
                  disabled={busy}
                  className="text-[11px] font-semibold text-[#FAFAFA] bg-[#0A0A0A] rounded-md px-2.5 py-1.5 hover:bg-[#2a2a2a] transition-colors disabled:opacity-40"
                >
                  Shortlist
                </button>
              )}
            </div>

            {/* Scheduled action */}
            {shortlisted && scheduled && (
              <div className="border-t border-black/[0.06] pt-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3]">Next action</span>
                  <span className="text-xs text-[#0A0A0A] font-medium text-right">
                    {w!.next_action_type!.replace(/_/g, " ")} · {fmtDateTime(w!.next_action_at!)}
                  </span>
                </div>
                {w!.next_action_note && (
                  <p className="text-xs text-[#525252] leading-snug">{w!.next_action_note}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => run("complete")}
                    disabled={busy}
                    className="text-[11px] font-semibold text-[#FAFAFA] bg-[#0A0A0A] rounded-md px-2.5 py-1.5 hover:bg-[#2a2a2a] transition-colors disabled:opacity-40"
                  >
                    Complete action
                  </button>
                  <button
                    onClick={() => setScheduling(true)}
                    disabled={busy}
                    className="text-[11px] font-medium text-[#525252] border border-black/[0.12] rounded-md px-2.5 py-1.5 hover:bg-black/[0.04] transition-colors disabled:opacity-40"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            )}

            {/* Schedule / reschedule form */}
            {shortlisted && (scheduling || !scheduled) && (
              <div className="border-t border-black/[0.06] pt-2.5 space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3]">
                  {scheduled ? "Reschedule action" : "Schedule next action"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as NextActionType)}
                    className="bg-white border border-black/[0.12] rounded-lg text-xs px-2 py-1.5 outline-none focus:border-black/[0.3] cursor-pointer"
                  >
                    {NEXT_ACTION_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                  <input
                    type="datetime-local"
                    value={actionAt}
                    onChange={(e) => setActionAt(e.target.value)}
                    className="bg-white border border-black/[0.12] rounded-lg text-xs px-2 py-1.5 outline-none focus:border-black/[0.3]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full bg-white border border-black/[0.12] rounded-lg text-xs px-2.5 py-1.5 outline-none focus:border-black/[0.3] placeholder:text-[#C4C4C4]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={schedule}
                    disabled={busy}
                    className="text-[11px] font-semibold text-[#FAFAFA] bg-[#0A0A0A] rounded-md px-2.5 py-1.5 hover:bg-[#2a2a2a] transition-colors disabled:opacity-40"
                  >
                    {scheduled ? "Reschedule" : "Schedule"}
                  </button>
                  {scheduling && (
                    <button
                      onClick={() => setScheduling(false)}
                      disabled={busy}
                      className="text-[11px] text-[#A3A3A3] hover:text-[#525252] transition-colors px-2"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Note / call log */}
            <div className="border-t border-black/[0.06] pt-2.5 space-y-2">
              <textarea
                rows={2}
                placeholder="Note or call summary…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-white border border-black/[0.12] rounded-lg text-xs px-2.5 py-1.5 outline-none focus:border-black/[0.3] placeholder:text-[#C4C4C4] resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => { if (await run("note", { note: noteText })) setNoteText("") }}
                  disabled={busy || !noteText.trim()}
                  className="text-[11px] font-medium text-[#525252] border border-black/[0.12] rounded-md px-2.5 py-1.5 hover:bg-black/[0.04] transition-colors disabled:opacity-40"
                >
                  Save note
                </button>
                <button
                  onClick={async () => { if (await run("call", { note: noteText })) setNoteText("") }}
                  disabled={busy || !noteText.trim()}
                  className="text-[11px] font-medium text-[#525252] border border-black/[0.12] rounded-md px-2.5 py-1.5 hover:bg-black/[0.04] transition-colors disabled:opacity-40"
                >
                  Log call
                </button>
              </div>
            </div>
          </>
        )}
        {err && <p className="text-xs text-red-600">{err}</p>}
      </div>
    </section>
  )
}

/* ------------------------------ Activity feed ------------------------------ */

function TechnologySection({ prospect: p }: { prospect: Prospect }) {
  const raw = p.tech_stack ?? {}
  const signatures = stringList(raw.signatures)
  const wappalyzer = recordOfStringArrays(raw.wappalyzer)
  const server = typeof raw.server === "string" ? raw.server : null
  const poweredBy = typeof raw.powered_by === "string" ? raw.powered_by : null
  const sslIssue = typeof raw.ssl_issue === "string" ? raw.ssl_issue : null
  const generator = typeof p.site_age_signal?.generator === "string" ? p.site_age_signal.generator : null
  const copyrightYear = typeof p.site_age_signal?.copyright_year === "number" ? String(p.site_age_signal.copyright_year) : null
  const jqueryVersion = typeof p.site_age_signal?.jquery_version === "string" ? p.site_age_signal.jquery_version : null

  if (!p.site_platform && !p.site_built_estimate && !signatures.length && !wappalyzer.length && !server && !poweredBy) return null

  return (
    <section>
      <PanelLabel>Technology</PanelLabel>
      <div className="bg-white border border-black/[0.08] rounded-lg px-4 py-3 space-y-2">
        <PanelRow
          label="Platform"
          value={`${p.site_platform ?? "custom-or-unknown"}${p.site_built_estimate ? ` · ${p.site_built_estimate}` : ""}`}
        />
        {signatures.length > 0 && <PanelRow label="Signatures" value={signatures.join(", ")} />}
        {wappalyzer.slice(0, 8).map(([name, categories]) => (
          <PanelRow
            key={name}
            label="Wappalyzer"
            value={`${name}${categories.length ? ` · ${categories.slice(0, 2).join(", ")}` : ""}`}
          />
        ))}
        {generator && <PanelRow label="Generator" value={generator} />}
        {copyrightYear && <PanelRow label="Copyright" value={copyrightYear} />}
        {jqueryVersion && <PanelRow label="jQuery" value={jqueryVersion} />}
        {server && <PanelRow label="Server" value={server} />}
        {poweredBy && <PanelRow label="Powered by" value={poweredBy} />}
        {sslIssue && <PanelRow label="SSL issue" value="Detected" hint={sslIssue} />}
      </div>
    </section>
  )
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function recordOfStringArrays(value: unknown): [string, string[]][] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return []
  return Object.entries(value as Record<string, unknown>).map(([name, categories]) => [name, stringList(categories)])
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">{children}</p>
  )
}

function PanelRow({ label, value, missing, hint }: { label: string; value: string | null; missing?: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3" title={hint}>
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3] shrink-0">{label}</span>
      {value != null ? (
        <span className="text-xs text-[#0A0A0A] font-medium text-right truncate">{value}</span>
      ) : (
        <span className="font-mono text-[10px] text-[#C4C4C4] text-right">{missing ?? "—"}</span>
      )}
    </div>
  )
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
}
