"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import type { Prospect, CrmStatus } from "@/lib/supabase"

type FilterState = {
  search: string
  category: string
  city: string
  qualification: "all" | "website" | "email" | "both"
  analysed: "all" | "scored" | "unscored"
  mockup: "all" | "ready" | "none"
  reviewPage: "all" | "ready" | "none"
  crmStatus: "all" | CrmStatus
  enriched: "all" | "owner" | "owner_email" | "not_enriched"
}

export default function ProspectFeed() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Prospect | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "All",
    city: "All",
    qualification: "all",
    analysed: "all",
    mockup: "all",
    reviewPage: "all",
    crmStatus: "all",
    enriched: "all",
  })

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { data } = await supabase
        .from("prospects")
        .select("*")
        .order("first_seen_at", { ascending: false })
        .limit(500)
      if (data) setProspects(data as Prospect[])
      setLoading(false)
    }
    fetch()
  }, [])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(prospects.map((p) => p.category).filter(Boolean))) as string[]
    return ["All", ...cats.sort()]
  }, [prospects])

  const cities = useMemo(() => {
    const cs = Array.from(new Set(prospects.map((p) => p.city).filter(Boolean))) as string[]
    return ["All", ...cs.sort()]
  }, [prospects])

  const filtered = useMemo(() => {
    return prospects.filter((p) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const match =
          p.name?.toLowerCase().includes(q) ||
          p.address?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.website?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q)
        if (!match) return false
      }
      if (filters.category !== "All" && p.category !== filters.category) return false
      if (filters.city !== "All" && p.city !== filters.city) return false
      if (filters.qualification === "website" && !p.website_exists) return false
      if (filters.qualification === "email" && !p.email_exists) return false
      if (filters.qualification === "both" && !p.qualified) return false
      if (filters.analysed === "scored" && p.site_score == null) return false
      if (filters.analysed === "unscored" && p.site_score != null) return false
      const hasMockupImage = !!p.mockup_url
      const hasReviewPage = !!p.review_slug
      if (filters.mockup === "ready" && !hasMockupImage) return false
      if (filters.mockup === "none" && hasMockupImage) return false
      if (filters.reviewPage === "ready" && !hasReviewPage) return false
      if (filters.reviewPage === "none" && hasReviewPage) return false
      if (filters.crmStatus !== "all") {
        const isOutreachedFilter = filters.crmStatus === "outreached"
        const matches = isOutreachedFilter
          ? p.crm_status === "outreached" || p.crm_status === "responded"
          : p.crm_status === filters.crmStatus
        if (!matches) return false
      }
      if (filters.enriched === "owner" && !p.owner_name) return false
      if (filters.enriched === "owner_email" && !p.owner_email) return false
      if (filters.enriched === "not_enriched" && p.owner_name) return false
      return true
    })
  }, [prospects, filters])

  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setFilters((f) => ({ ...f, [key]: value }))

  const selectClass =
    "bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-xs px-3 py-2 outline-none focus:border-black/[0.3] transition-colors appearance-none cursor-pointer"

  return (
    <div className="flex h-[calc(100dvh-3.5rem)]">
      {/* Main list */}
      <main className={`flex-1 overflow-y-auto transition-all ${selected ? "hidden sm:block" : ""}`}>
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 pt-10 pb-24">

          {/* Header */}
          <div className="mb-8">
            <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-3">
              Prospect Finder — Live records
            </p>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h2 className="font-sans font-extrabold text-[#0A0A0A] text-3xl tracking-tight">
                Prospects
              </h2>
              {!loading && (
                <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.12em]">
                  {filtered.length.toLocaleString()} of {prospects.length.toLocaleString()} records
                </p>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-black/[0.06]">
            <input
              type="text"
              placeholder="Search name, address, website, email…"
              value={filters.search}
              onChange={(e) => update("search", e.target.value)}
              className="flex-1 min-w-[220px] bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-xs px-3 py-2 outline-none focus:border-black/[0.3] transition-colors placeholder:text-[#A3A3A3]"
            />
            <select value={filters.analysed} onChange={(e) => update("analysed", e.target.value as FilterState["analysed"])} className={selectClass}>
              <option value="all">All prospects</option>
              <option value="scored">Scored only</option>
              <option value="unscored">Unscored only</option>
            </select>
            <select value={filters.qualification} onChange={(e) => update("qualification", e.target.value as FilterState["qualification"])} className={selectClass}>
              <option value="all">Any contact</option>
              <option value="website">Has website</option>
              <option value="email">Has email</option>
              <option value="both">Both (qualified)</option>
            </select>
            <select value={filters.category} onChange={(e) => update("category", e.target.value)} className={selectClass}>
              {categories.map((c) => <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>)}
            </select>
            <select value={filters.city} onChange={(e) => update("city", e.target.value)} className={selectClass}>
              {cities.map((c) => <option key={c} value={c}>{c === "All" ? "All cities" : c}</option>)}
            </select>
            <select value={filters.mockup} onChange={(e) => update("mockup", e.target.value as FilterState["mockup"])} className={selectClass}>
              <option value="all">Any mockup image</option>
              <option value="ready">Has mockup image</option>
              <option value="none">No mockup image</option>
            </select>
            <select value={filters.reviewPage} onChange={(e) => update("reviewPage", e.target.value as FilterState["reviewPage"])} className={selectClass}>
              <option value="all">Any review page</option>
              <option value="ready">Has review page</option>
              <option value="none">No review page</option>
            </select>
            <select value={filters.crmStatus} onChange={(e) => update("crmStatus", e.target.value as FilterState["crmStatus"])} className={selectClass}>
              <option value="all">Any CRM stage</option>
              <option value="new">New</option>
              <option value="outreached">Outreached</option>
              <option value="mockup_revealed">Mockup Revealed</option>
              <option value="build">Build</option>
              <option value="quote">Quote</option>
              <option value="paid">Paid</option>
              <option value="lost">Lost</option>
              <option value="na">N/A</option>
            </select>
            <select value={filters.enriched} onChange={(e) => update("enriched", e.target.value as FilterState["enriched"])} className={selectClass}>
              <option value="all">Any enrichment</option>
              <option value="owner">CH owner identified</option>
              <option value="owner_email">Has owner email</option>
              <option value="not_enriched">Not enriched</option>
            </select>
            {(filters.category !== "All" || filters.city !== "All" || filters.qualification !== "all" || filters.analysed !== "all" || filters.mockup !== "all" || filters.reviewPage !== "all" || filters.crmStatus !== "all" || filters.enriched !== "all") && (
              <button
                onClick={() => setFilters({ search: filters.search, category: "All", city: "All", qualification: "all", analysed: "all", mockup: "all", reviewPage: "all", crmStatus: "all", enriched: "all" })}
                className="text-xs text-[#A3A3A3] hover:text-[#525252] transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-black/[0.04] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-3">No results</p>
              <p className="text-[#737373] text-sm">Try adjusting your filters, or run the operator to populate the database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.06]">
                    {["Business", "Category", "Location", "Score", "Website", "Email", "Phone", "Owner", "Mockup", "Review", "CRM", "Status", "Maps"].map((h) => (
                      <th key={h} className="text-left font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] px-3 py-2.5 whitespace-nowrap font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <ProspectRow
                      key={p.place_id}
                      prospect={p}
                      isSelected={selected?.place_id === p.place_id}
                      onSelect={() => setSelected(selected?.place_id === p.place_id ? null : p)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#C4C4C4] text-center mt-8">
              {filtered.length.toLocaleString()} prospects shown
            </p>
          )}
        </div>
      </main>

      {/* Analysis panel */}
      {selected && (
        <AnalysisPanel
          prospect={selected}
          onClose={() => setSelected(null)}
          onCrmChange={(place_id, status) =>
            setProspects(prev => prev.map(p =>
              p.place_id === place_id ? { ...p, crm_status: status as CrmStatus } : p
            ))
          }
        />
      )}
    </div>
  )
}

function ProspectRow({
  prospect: p,
  isSelected,
  onSelect,
}: {
  prospect: Prospect
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <tr
      onClick={onSelect}
      className={`border-b border-black/[0.04] transition-colors cursor-pointer ${
        isSelected ? "bg-black/[0.04]" : p.owner_name ? "hover:bg-black/[0.02] bg-[#F0FDF4]/40" : "hover:bg-black/[0.02]"
      }`}
    >
      {/* Name */}
      <td className="px-3 py-3 max-w-[200px]">
        <div className="flex items-center gap-2">
          {p.qualified && (
            <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A] shrink-0" />
          )}
          {p.owner_name && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Companies House enriched" />
          )}
          <span className="text-sm font-semibold text-[#0A0A0A] truncate">{p.name}</span>
        </div>
      </td>

      {/* Category */}
      <td className="px-3 py-3 whitespace-nowrap">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#525252]">
          {p.category ?? "—"}
        </span>
      </td>

      {/* Location */}
      <td className="px-3 py-3 max-w-[180px]">
        <span className="text-xs text-[#737373] truncate block">
          {[p.city, p.postcode].filter(Boolean).join(" · ") || p.address || "—"}
        </span>
      </td>

      {/* Score */}
      <td className="px-3 py-3 whitespace-nowrap">
        <ScoreBadge score={p.site_score} />
      </td>

      {/* Website */}
      <td className="px-3 py-3 max-w-[160px]">
        {p.website ? (
          <a
            href={p.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-[#0A0A0A] underline underline-offset-2 decoration-black/[0.2] hover:decoration-black/[0.6] transition-colors truncate block max-w-[140px]"
          >
            {p.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
          </a>
        ) : (
          <span className="text-xs text-[#C4C4C4]">—</span>
        )}
      </td>

      {/* Email */}
      <td className="px-3 py-3">
        {p.email ? (
          <CopyCell value={p.email} />
        ) : (
          <span className="text-xs text-[#C4C4C4]">—</span>
        )}
      </td>

      {/* Phone */}
      <td className="px-3 py-3 whitespace-nowrap">
        {p.phone ? (
          <CopyCell value={p.phone} />
        ) : (
          <span className="text-xs text-[#C4C4C4]">—</span>
        )}
      </td>

      {/* Owner (Companies House enrichment) */}
      <td className="px-3 py-3 max-w-[140px]">
        {p.owner_name ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-[#0A0A0A] truncate font-medium" title={p.owner_name}>{p.owner_name}</span>
            {p.owner_email ? (
              <span className="text-[10px] text-emerald-600 font-mono truncate" title={p.owner_email}>{p.owner_email}</span>
            ) : p.owner_enriched_at ? (
              <span className="text-[10px] text-[#C4C4C4] font-mono">no email</span>
            ) : (
              <span className="text-[10px] text-[#A3A3A3] font-mono">pending</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-[#C4C4C4]">—</span>
        )}
      </td>

      {/* Mockup */}
      <td className="px-3 py-3">
        {p.mockup_url ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-emerald-600 font-semibold">Ready</span>
        ) : (
          <span className="text-xs text-[#C4C4C4]">—</span>
        )}
      </td>

      {/* Review page */}
      <td className="px-3 py-3">
        {p.review_slug ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-blue-600 font-semibold">Ready</span>
        ) : (
          <span className="text-xs text-[#C4C4C4]">—</span>
        )}
      </td>

      {/* CRM status */}
      <td className="px-3 py-3">
        <CrmStatusBadge status={p.crm_status} />
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <StatusBadge status={p.status} />
      </td>

      {/* Maps */}
      <td className="px-3 py-3">
        {p.google_maps_url ? (
          <a
            href={p.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-[#525252] underline underline-offset-2 decoration-black/[0.2] hover:text-[#0A0A0A] hover:decoration-black/[0.5] transition-colors"
          >
            View ↗
          </a>
        ) : (
          <span className="text-xs text-[#C4C4C4]">—</span>
        )}
      </td>
    </tr>
  )
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) {
    return <span className="text-xs text-[#C4C4C4]">—</span>
  }
  if (score === -1) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#C4C4C4] border border-black/[0.06] rounded px-1.5 py-0.5">
        err
      </span>
    )
  }

  // Low score = high opportunity. Green for low, amber for mid, grey for high.
  const color =
    score <= 3 ? "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]" :
    score <= 6 ? "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]" :
    "bg-black/[0.03] text-[#737373] border-black/[0.08]"

  return (
    <span className={`inline-flex items-center gap-1 border rounded px-2 py-0.5 font-mono text-[11px] font-semibold ${color}`}>
      {score}
      <span className="font-normal opacity-60 text-[9px]">/10</span>
    </span>
  )
}

function AnalysisPanel({ prospect: p, onClose, onCrmChange }: {
  prospect: Prospect
  onClose: () => void
  onCrmChange: (place_id: string, status: string) => void
}) {
  const hasAnalysis = p.site_score != null
  const [crmStatus, setCrmStatus] = useState<CrmStatus>(p.crm_status ?? "new")
  const [crmSaving, setCrmSaving] = useState(false)

  async function setCrm(status: CrmStatus) {
    setCrmSaving(true)
    setCrmStatus(status)
    onCrmChange(p.place_id, status)
    await supabase.from("prospects").update({ crm_status: status }).eq("place_id", p.place_id)
    setCrmSaving(false)
  }

  return (
    <aside className="w-full sm:w-[380px] lg:w-[420px] shrink-0 border-l border-black/[0.08] bg-[#FAFAFA] overflow-y-auto flex flex-col">
      {/* Panel header */}
      <div className="sticky top-0 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-black/[0.06] px-6 py-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-sans font-bold text-[#0A0A0A] text-base leading-snug truncate">{p.name}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] mt-0.5">
            {p.category} {p.city ? `· ${p.city}` : ""}
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

      {/* Pipeline action bar */}
      <div className="px-6 py-3 border-b border-black/[0.06]">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3]">
            Pipeline stage
          </span>
          <select
            value={crmStatus}
            onChange={(e) => setCrm(e.target.value as CrmStatus)}
            disabled={crmSaving}
            className="bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-xs px-2 py-1.5 outline-none focus:border-black/[0.3] transition-colors cursor-pointer disabled:opacity-40"
          >
            <option value="new">New</option>
            <option value="outreached">Outreached</option>
            <option value="mockup_revealed">Mockup Revealed</option>
            <option value="build">Build</option>
            <option value="quote">Quote</option>
            <option value="paid">Paid</option>
            <option value="lost">Lost</option>
            <option value="na">N/A</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {crmStatus === "new" && (
            <button
              onClick={() => setCrm("outreached")}
              disabled={crmSaving}
              className="bg-[#0A0A0A] text-white text-xs font-medium rounded-lg px-3 py-2 hover:bg-[#1A1A1A] transition-colors disabled:opacity-40"
            >
              + Add to outreach
            </button>
          )}
          {crmStatus === "new" && p.mockup_url && (
            <button
              onClick={() => setCrm("mockup_revealed")}
              disabled={crmSaving}
              className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium rounded-lg px-3 py-2 hover:bg-amber-100 transition-colors disabled:opacity-40"
            >
              Reveal mockup
            </button>
          )}
          {crmStatus === "outreached" && p.mockup_url && (
            <button
              onClick={() => setCrm("mockup_revealed")}
              disabled={crmSaving}
              className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium rounded-lg px-3 py-2 hover:bg-amber-100 transition-colors disabled:opacity-40"
            >
              Skip to mockup reveal
            </button>
          )}
          {crmStatus !== "new" && crmStatus !== "lost" && crmStatus !== "paid" && crmStatus !== "na" && (
            <button
              onClick={() => setCrm("lost")}
              disabled={crmSaving}
              className="text-[11px] text-[#A3A3A3] hover:text-red-500 transition-colors disabled:opacity-40 px-2 py-2"
            >
              Mark lost
            </button>
          )}
          {crmStatus !== "na" && crmStatus !== "paid" && crmStatus !== "lost" && (
            <button
              onClick={() => setCrm("na")}
              disabled={crmSaving}
              className="text-[11px] text-[#A3A3A3] hover:text-[#525252] transition-colors disabled:opacity-40 px-2 py-2"
            >
              Mark N/A
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6">

        {/* Scores */}
        {hasAnalysis && p.site_score != null && p.site_score !== -1 && (
          <div>
            {/* Recommendation badge */}
            {p.recommendation && (
              <div className="mb-4">
                <span className={`inline-block border rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] font-semibold ${
                  p.recommendation === "pursue"
                    ? "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]"
                    : p.recommendation === "consider"
                    ? "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
                    : "bg-black/[0.03] text-[#737373] border-black/[0.08]"
                }`}>
                  {p.recommendation === "pursue" ? "Generate mockup" : p.recommendation === "consider" ? "Worth a look" : "Deprioritise"}
                </span>
              </div>
            )}

            {/* Prospect score */}
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">Prospect Score</p>
            <div className="flex items-end gap-2 mb-4">
              <span className={`font-sans font-extrabold text-5xl tracking-tight ${
                p.site_score >= 8 ? "text-[#059669]" :
                p.site_score >= 6 ? "text-[#D97706]" :
                "text-[#737373]"
              }`}>
                {p.site_score}
              </span>
              <span className="text-[#A3A3A3] text-lg mb-1">/10</span>
            </div>

            {/* Sub-scores */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white border border-black/[0.08] rounded-lg px-3 py-2.5">
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-1">Business Quality</p>
                <p className="font-sans font-bold text-[#0A0A0A] text-xl">{p.business_quality_score}<span className="text-[#C4C4C4] text-sm font-normal">/10</span></p>
              </div>
              <div className="bg-white border border-black/[0.08] rounded-lg px-3 py-2.5">
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-1">Opportunity</p>
                <p className="font-sans font-bold text-[#0A0A0A] text-xl">{p.opportunity_score}<span className="text-[#C4C4C4] text-sm font-normal">/10</span></p>
              </div>
            </div>

            {/* Rev-share potential */}
            {p.revshare_potential && (
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3]">Rev-share potential</span>
                <span className={`font-mono text-[10px] uppercase tracking-[0.1em] font-semibold ${
                  p.revshare_potential === "high" ? "text-[#059669]" :
                  p.revshare_potential === "medium" ? "text-[#D97706]" :
                  "text-[#A3A3A3]"
                }`}>{p.revshare_potential}</span>
              </div>
            )}
          </div>
        )}

        {/* Review page link */}
        {p.review_slug && (
          <div className="flex items-center justify-between bg-white border border-black/[0.08] rounded-xl px-4 py-3">
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-0.5">Review page</p>
              <p className="font-mono text-[11px] text-[#525252] truncate">sortmydigital.site/review/{p.review_slug}</p>
            </div>
            <a
              href={`/review?slug=${p.review_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 ml-3 text-[11px] font-medium text-blue-600 hover:underline"
            >
              Preview ↗
            </a>
          </div>
        )}

        {/* Analysis */}
        {p.site_analysis && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">Analysis</p>
            <p className="text-sm text-[#525252] leading-relaxed">{p.site_analysis}</p>
          </div>
        )}

        {/* Modernity gap */}
        {p.modernity_gap && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">Modernity Gap</p>
            <p className="text-sm text-[#525252] leading-relaxed italic">{p.modernity_gap}</p>
          </div>
        )}

        {/* Outreach angle */}
        {p.outreach_angle && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">Outreach angle</p>
            <div className="bg-[#0A0A0A] rounded-xl px-4 py-3">
              <p className="text-[#FAFAFA] text-sm leading-relaxed italic">"{p.outreach_angle}"</p>
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {p.site_weaknesses && p.site_weaknesses.length > 0 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">
              Weaknesses ({p.site_weaknesses.length})
            </p>
            <ul className="space-y-1.5">
              {p.site_weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#525252]">
                  <span className="text-[#D97706] shrink-0 mt-0.5">·</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact details */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-3">Contact</p>
          <div className="space-y-2">
            {/* Owner (Companies House enrichment) */}
            {p.owner_name && (
              <div className="bg-[#F0FDF4] border border-emerald-100 rounded-lg px-3 py-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-emerald-700">
                    Companies House — {p.owner_source || "enriched"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3]">Owner</span>
                  <span className="text-xs text-[#0A0A0A] font-medium">{p.owner_name}</span>
                </div>
                {p.owner_email && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3]">Owner email</span>
                    <div className="flex items-center gap-2">
                      {p.owner_email_confidence != null && (
                        <span className="font-mono text-[10px] text-[#A3A3A3]">{p.owner_email_confidence}%</span>
                      )}
                      <CopyCell value={p.owner_email} />
                    </div>
                  </div>
                )}
                {p.owner_email_status && p.owner_email_status !== "not_found" && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3]">Email status</span>
                    <span className={`font-mono text-[10px] uppercase tracking-[0.1em] font-semibold ${
                      p.owner_email_status === "valid" ? "text-emerald-600" :
                      p.owner_email_status === "risky" ? "text-amber-600" :
                      p.owner_email_status === "invalid" ? "text-red-500" :
                      "text-[#A3A3A3]"
                    }`}>{p.owner_email_status}</span>
                  </div>
                )}
                {p.owner_enriched_at && !p.owner_email && (
                  <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#C4C4C4] pt-1">
                    Enrichment attempted {new Date(p.owner_enriched_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
                {p.owner_identified_at && (
                  <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#C4C4C4] pt-1">
                    Identified {new Date(p.owner_identified_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </div>
            )}
            {p.website && (
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3]">Web</span>
                <a
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#0A0A0A] underline underline-offset-2 decoration-black/[0.2] hover:decoration-black/[0.6] transition-colors truncate max-w-[260px]"
                >
                  {p.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </a>
              </div>
            )}
            {p.email && (
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3]">Email</span>
                <CopyCell value={p.email} />
              </div>
            )}
            {p.phone && (
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3]">Phone</span>
                <CopyCell value={p.phone} />
              </div>
            )}
            {p.address && (
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3] shrink-0">Address</span>
                <span className="text-xs text-[#525252] text-right">{p.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Not yet analysed state */}
        {!hasAnalysis && (
          <div className="border border-dashed border-black/[0.12] rounded-xl px-5 py-6 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">Not yet analysed</p>
            <p className="text-xs text-[#737373] leading-relaxed">
              Run the Website Analyser operator to score this prospect.
            </p>
            {p.website && (
              <code className="block mt-3 font-mono text-[10px] text-[#525252] bg-black/[0.04] rounded px-3 py-2">
                make analyse URL={p.website}
              </code>
            )}
          </div>
        )}

        {/* Analysed at */}
        {p.analysed_at && (
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#C4C4C4]">
            Analysed {new Date(p.analysed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}

        {/* Google Maps link */}
        {p.google_maps_url && (
          <a
            href={p.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-[#525252] underline underline-offset-2 decoration-black/[0.2] hover:text-[#0A0A0A] transition-colors"
          >
            View on Google Maps ↗
          </a>
        )}
      </div>
    </aside>
  )
}

function CopyCell({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  function copy(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      onClick={copy}
      title={`Copy: ${value}`}
      className="text-xs text-[#525252] hover:text-[#0A0A0A] transition-colors text-left truncate max-w-[160px] block"
    >
      {copied ? (
        <span className="text-[#0A0A0A] font-medium">Copied</span>
      ) : (
        value
      )}
    </button>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    prospect:     "bg-black/[0.04] text-[#525252] border-black/[0.08]",
    website_lead: "bg-[#dfff00]/35 text-[#4b5f00] border-[#dfff00]",
    partner_lead: "bg-[#070707] text-[#dfff00] border-[#070707]",
    contacted:    "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
    converted:    "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]",
    disqualified: "bg-black/[0.02] text-[#C4C4C4] border-black/[0.04]",
  }
  const s = styles[status] ?? styles.prospect
  return (
    <span className={`inline-block border rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${s}`}>
      {status}
    </span>
  )
}

function CrmStatusBadge({ status }: { status: CrmStatus | null }) {
  const styles: Record<string, string> = {
    new:             "bg-black/[0.04] text-[#525252] border-black/[0.08]",
    outreached:      "bg-blue-50 text-blue-600 border-blue-100",
    responded:       "bg-violet-50 text-violet-600 border-violet-100",
    mockup_revealed: "bg-amber-50 text-amber-600 border-amber-100",
    build:           "bg-orange-50 text-orange-600 border-orange-100",
    quote:           "bg-emerald-50 text-emerald-600 border-emerald-100",
    paid:            "bg-emerald-100 text-emerald-700 border-emerald-200",
    lost:            "bg-red-50 text-red-500 border-red-100",
    na:              "bg-[#F5F5F5] text-[#A3A3A3] border-black/[0.08]",
  }
  const key = status ?? "new"
  const s = styles[key] ?? styles.new
  const labels: Record<string, string> = { na: "N/A" }
  const label = labels[key] ?? key.replace(/_/g, " ")
  return (
    <span className={`inline-block border rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${s}`}>
      {label}
    </span>
  )
}
