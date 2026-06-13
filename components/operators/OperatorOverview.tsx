"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Prospect } from "@/lib/supabase"
import ProspectFinderRun from "./ProspectFinderRun"

interface OverviewPageProps {
  onViewProspects: () => void
}

type Stats = {
  total: number
  withWebsite: number
  withEmail: number
  qualified: number
  lastRunId: string | null
  lastRunAt: string | null
  categories: Record<string, number>
}

export default function OperatorOverview({ onViewProspects }: OverviewPageProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase
        .from("prospects")
        .select("website_exists, email_exists, qualified, run_id, first_seen_at, category")
        .order("first_seen_at", { ascending: false })

      if (!data) { setLoading(false); return }

      const prospects = data as Pick<Prospect, "website_exists" | "email_exists" | "qualified" | "run_id" | "first_seen_at" | "category">[]

      const categories: Record<string, number> = {}
      for (const p of prospects) {
        if (p.category) categories[p.category] = (categories[p.category] ?? 0) + 1
      }

      setStats({
        total: prospects.length,
        withWebsite: prospects.filter((p) => p.website_exists).length,
        withEmail: prospects.filter((p) => p.email_exists).length,
        qualified: prospects.filter((p) => p.qualified).length,
        lastRunId: prospects[0]?.run_id ?? null,
        lastRunAt: prospects[0]?.first_seen_at ?? null,
        categories,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <main className="max-w-[680px] mx-auto px-6 sm:px-10 pt-16 pb-32">

      {/* Meta label */}
      <div className="mb-14">
        <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-1">
          {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </p>
        <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em]">
          Prospect Finder — Internal Operator
        </p>
      </div>

      {/* Hero */}
      <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl leading-tight tracking-tight mb-4">
        Prospects, found.
      </h1>
      <div className="space-y-5 text-[#525252] text-lg leading-relaxed mb-10">
        <p>
          The Prospect Finder searches Google Maps for UK local service businesses, qualifies them by website and email presence, and writes clean records to the database. No manual searching. No copy-paste.
        </p>
        <p className="text-[#0A0A0A] font-semibold">
          Run it. Review the list. Work the leads.
        </p>
      </div>

      <button
        onClick={onViewProspects}
        className="bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-6 py-3 hover:bg-[#2a2a2a] transition-colors mb-16"
      >
        View prospects →
      </button>

      <div className="border-t border-black/[0.08] mb-16" />

      {/* Stats */}
      <div className="mb-16">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
          Database
        </span>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-12 bg-black/[0.04] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="bg-[#0A0A0A] rounded-2xl p-8 mb-6">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/50 mb-2">Total prospects</p>
              <p className="font-sans font-extrabold text-white text-5xl tracking-tight">{stats.total.toLocaleString()}</p>
              {stats.lastRunAt && (
                <p className="text-white/30 text-xs mt-3 font-mono uppercase tracking-[0.12em]">
                  Last run {new Date(stats.lastRunAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  {stats.lastRunId && <span className="ml-2 opacity-50">#{stats.lastRunId.slice(0, 8)}</span>}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-black/[0.08] rounded-xl p-5">
                <p className="font-sans font-bold text-[#0A0A0A] text-2xl tracking-tight">{stats.withWebsite.toLocaleString()}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mt-1.5">Have website</p>
              </div>
              <div className="bg-white border border-black/[0.08] rounded-xl p-5">
                <p className="font-sans font-bold text-[#0A0A0A] text-2xl tracking-tight">{stats.withEmail.toLocaleString()}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mt-1.5">Have email</p>
              </div>
              <div className="bg-white border border-black/[0.08] rounded-xl p-5">
                <p className="font-sans font-bold text-[#0A0A0A] text-2xl tracking-tight">{stats.qualified.toLocaleString()}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mt-1.5">Both</p>
              </div>
            </div>

            {/* Category breakdown */}
            {Object.keys(stats.categories).length > 0 && (
              <div className="bg-black/[0.02] border border-black/[0.06] rounded-xl p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">By category</p>
                <div className="space-y-2">
                  {Object.entries(stats.categories)
                    .sort(([,a],[,b]) => b - a)
                    .map(([cat, count]) => (
                      <div key={cat} className="flex items-center justify-between">
                        <span className="text-sm text-[#525252]">{cat}</span>
                        <span className="font-mono text-xs text-[#A3A3A3]">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      <div className="border-t border-black/[0.08] mb-16" />

      {/* How it works */}
      <div className="mb-16">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
          How the operator works
        </span>
        <div className="space-y-10">
          {[
            {
              num: "01",
              title: "Search",
              body: "Queries the Apify Google Maps Scraper across 16 configured UK business categories and locations. Up to 40 results per query.",
            },
            {
              num: "02",
              title: "Filter",
              body: "Discards listings with no real website and no email. Google Maps placeholder URLs and social-only profiles are handled — anything that can't be contacted is skipped.",
            },
            {
              num: "03",
              title: "Enrich",
              body: "Maps each result to a structured record — name, address, postcode, phone, rating, coordinates, category, and search context.",
            },
            {
              num: "04",
              title: "Store",
              body: "Upserts each record to Supabase by Google place_id. Safe to re-run at any time — no duplicates, updated_at refreshed on each pass.",
            },
            {
              num: "05",
              title: "Analyse (Website Analyser)",
              body: "Run the Website Analyser operator to score each prospect's site. GPT-4o mini vision captures a screenshot and scores six dimensions — design, CTA, mobile, content, trust signals, contact clarity. Low score = high opportunity. The outreach angle is written for you.",
            },
          ].map((step) => (
            <div key={step.num} className="flex gap-8">
              <span className="font-mono text-[11px] text-[#C4C4C4] tabular-nums pt-1 shrink-0">{step.num}</span>
              <div>
                <h3 className="font-sans font-bold text-[#0A0A0A] text-lg leading-snug tracking-tight mb-2">{step.title}</h3>
                <p className="text-[#737373] text-base leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-black/[0.08] mb-16" />

      {/* Run UI */}
      <div className="mb-16">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
          Run operators
        </span>
        <div className="space-y-4">
          <ProspectFinderRun />
          <WebsiteAnalyserRun />
        </div>
      </div>

    </main>
  )
}

function WebsiteAnalyserRun() {
  const [state, setState] = useState<"idle" | "triggering" | "triggered" | "error">("idle")
  const [error, setError] = useState("")

  async function handleRun() {
    setState("triggering")
    setError("")
    try {
      const res = await fetch("/api/operators/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow: "website-analyser.yml" }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Failed")
      }
      setState("triggered")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setState("error")
    }
  }

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-black/[0.06]">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-0.5">Operator</p>
        <p className="font-sans font-bold text-[#0A0A0A] text-sm">Website Analyser</p>
      </div>
      <div className="px-6 py-5 space-y-4">
        <div className="bg-black/[0.02] rounded-xl px-4 py-3.5">
          <p className="text-sm text-[#525252] leading-relaxed">
            Scores all <span className="font-semibold text-[#0A0A0A]">unanalysed prospects</span> in the database. Screenshots each site, sends to Claude Haiku, writes back scores and outreach angles. ~$0.004 per prospect.
          </p>
        </div>

        {state === "triggered" && (
          <div className="flex items-center gap-2 text-sm text-[#059669]">
            <span>✓</span>
            <span>Running — check the Prospects tab in a few minutes.</span>
            <a href="https://github.com/rennyreign/sorted/actions/workflows/website-analyser.yml" target="_blank" rel="noopener noreferrer" className="text-xs underline underline-offset-2 ml-1">View run →</a>
          </div>
        )}
        {state === "error" && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error || "Failed to trigger."}</p>
        )}

        <button
          onClick={handleRun}
          disabled={state === "triggering" || state === "triggered"}
          className="w-full bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm py-3 rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {state === "triggering" ? (
            <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Triggering…</>
          ) : state === "triggered" ? "Running" : "Score unanalysed prospects"}
        </button>
        <p className="text-[10px] text-[#C4C4C4] font-mono text-center">Runs via GitHub Actions · ~30 min for 100 prospects</p>
      </div>
    </div>
  )
}
