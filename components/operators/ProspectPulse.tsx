"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { CrmStatus, Prospect } from "@/lib/supabase"
import ChannelPerformance from "./ChannelPerformance"

const STAGES: { key: CrmStatus; label: string; colour: string }[] = [
  { key: "new", label: "New", colour: "bg-[#D4D4D4]" },
  { key: "outreached", label: "Outreached", colour: "bg-blue-400" },
  { key: "mockup_revealed", label: "Mockup Revealed", colour: "bg-amber-400" },
  { key: "build", label: "Build", colour: "bg-orange-400" },
  { key: "quote", label: "Quote", colour: "bg-emerald-400" },
  { key: "paid", label: "Paid", colour: "bg-emerald-600" },
]

const CRM_ORDER: CrmStatus[] = ["new", "outreached", "mockup_revealed", "build", "quote", "paid", "lost", "na"]

function toDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function formatPercent(n: number | null): string {
  if (n === null || isNaN(n)) return "—"
  return `${Math.round(n)}%`
}

function safeRate(num: number, den: number): number | null {
  if (den === 0) return null
  return (num / den) * 100
}

function lastNDays(n: number): string[] {
  const days: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export default function ProspectPulse() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [windowDays, setWindowDays] = useState<7 | 14 | 30>(14)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { data } = await supabase
        .from("prospects")
        .select("*")
        .order("first_seen_at", { ascending: false })
        .limit(10000)
      if (data) setProspects(data as Prospect[])
      setLoading(false)
    }
    fetch()
  }, [])

  const days = useMemo(() => lastNDays(windowDays), [windowDays])

  const byStage = useMemo(() => {
    const map = new Map<CrmStatus | "null", number>()
    CRM_ORDER.forEach((k) => map.set(k, 0))
    map.set("null", 0)
    prospects.forEach((p) => {
      const key = (p.crm_status ?? "null") as CrmStatus | "null"
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return map
  }, [prospects])

  const stageCount = (stage: CrmStatus) => byStage.get(stage) ?? 0
  const activePipeline = CRM_ORDER.filter((k) => k !== "lost" && k !== "na").reduce((sum, k) => sum + stageCount(k), 0)

  const conversionRates = useMemo(() => {
    const newPlus = stageCount("new") + stageCount("outreached") + stageCount("mockup_revealed") + stageCount("build") + stageCount("quote") + stageCount("paid")
    const outreachedPlus = stageCount("outreached") + stageCount("mockup_revealed") + stageCount("build") + stageCount("quote") + stageCount("paid")
    const revealedPlus = stageCount("mockup_revealed") + stageCount("build") + stageCount("quote") + stageCount("paid")
    const buildPlus = stageCount("build") + stageCount("quote") + stageCount("paid")
    const quotePlus = stageCount("quote") + stageCount("paid")

    return {
      newToOutreached: safeRate(outreachedPlus, newPlus),
      outreachedToRevealed: safeRate(revealedPlus, outreachedPlus),
      revealedToBuild: safeRate(buildPlus, revealedPlus),
      buildToQuote: safeRate(quotePlus, buildPlus),
      quoteToPaid: safeRate(stageCount("paid"), quotePlus),
    }
  }, [byStage])

  const emailStats = useMemo(() => {
    let sent = 0
    let delivered = 0
    let openedUnique = 0
    let clickedUnique = 0
    let bounced = 0
    let optedOut = 0
    let openCount = 0
    let clickCount = 0
    let replied = 0

    prospects.forEach((p) => {
      const hasSent = !!p.outreach_sent_at || !!p.contacted_at
      if (hasSent) sent++
      if (p.email_delivered_at) delivered++
      if (p.email_opened_at) openedUnique++
      if (p.email_clicked_at) clickedUnique++
      if (p.email_bounced_at) bounced++
      if (p.email_opted_out_at) optedOut++
      if (p.email_replied_at) replied++
      openCount += p.email_open_count ?? 0
      clickCount += p.email_click_count ?? 0
    })

    return {
      sent,
      delivered,
      openedUnique,
      clickedUnique,
      bounced,
      optedOut,
      openCount,
      clickCount,
      replied,
      openRate: safeRate(openedUnique, delivered),
      clickRate: safeRate(clickedUnique, delivered),
      bounceRate: safeRate(bounced, sent),
      replyRate: safeRate(replied, sent),
    }
  }, [prospects])

  const daily = useMemo(() => {
    const counts: Record<string, {
      new: number
      sent: number
      delivered: number
      opened: number
      clicked: number
      revealed: number
    }> = {}

    days.forEach((d) => {
      counts[d] = { new: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, revealed: 0 }
    })

    prospects.forEach((p) => {
      const newDate = toDate(p.first_seen_at)
      if (newDate && counts[newDate]) counts[newDate].new++

      const sentDate = toDate(p.outreach_sent_at ?? p.contacted_at)
      if (sentDate && counts[sentDate]) counts[sentDate].sent++

      const deliveredDate = toDate(p.email_delivered_at)
      if (deliveredDate && counts[deliveredDate]) counts[deliveredDate].delivered++

      const openedDate = toDate(p.email_opened_at)
      if (openedDate && counts[openedDate]) counts[openedDate].opened++

      const clickedDate = toDate(p.email_clicked_at)
      if (clickedDate && counts[clickedDate]) counts[clickedDate].clicked++

      const revealedDate = toDate(p.mockup_revealed_at)
      if (revealedDate && counts[revealedDate]) counts[revealedDate].revealed++
    })

    return days.map((d) => ({ date: d, ...counts[d] }))
  }, [prospects, days])

  const today = useMemo(() => {
    const todayDate = toDate(new Date().toISOString())
    return daily.find((d) => d.date === todayDate) ?? { date: todayDate ?? "", new: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, revealed: 0 }
  }, [daily])

  const maxSingle = useMemo(() => {
    return Math.max(
      1,
      ...daily.map((d) => Math.max(d.new, d.sent, d.delivered, d.opened, d.clicked, d.revealed))
    )
  }, [daily])

  const topCities = useMemo(() => {
    const map = new Map<string, number>()
    prospects.forEach((p) => {
      if (p.city) map.set(p.city, (map.get(p.city) ?? 0) + 1)
    })
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [prospects])

  const enrichedCount = useMemo(() => prospects.filter((p) => !!p.owner_name).length, [prospects])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 pt-10 pb-24">
        {/* Header */}
        <div className="mb-8">
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-3">
            Prospect Finder — Daily pulse
          </p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className="font-sans font-extrabold text-[#0A0A0A] text-3xl tracking-tight">
              Pulse
            </h2>
            <div className="flex items-center gap-2">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setWindowDays(d as 7 | 14 | 30)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    windowDays === d
                      ? "bg-[#0A0A0A] text-[#FAFAFA]"
                      : "text-[#525252] border border-black/[0.08] hover:bg-black/[0.04]"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Today cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-10">
          <Kpi label="New today" value={today.new} />
          <Kpi label="Sent today" value={today.sent} />
          <Kpi label="Delivered today" value={today.delivered} />
          <Kpi label="Opened today" value={today.opened} />
          <Kpi label="Revealed today" value={today.revealed} />
          <Kpi label="Clicked today" value={today.clicked} />
        </div>

        {/* Channel + content performance */}
        <div className="mb-10">
          <ChannelPerformance />
        </div>

        {/* Pipeline funnel */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans font-bold text-[#0A0A0A] text-lg tracking-tight">Pipeline funnel</h3>
            <p className="font-mono text-[10px] text-[#A3A3A3] uppercase tracking-[0.12em]">
              {formatNumber(activePipeline)} active
            </p>
          </div>
          <div className="bg-white border border-black/[0.08] rounded-2xl p-6">
            <div className="space-y-4">
              {STAGES.map((stage, i) => {
                const count = stageCount(stage.key)
                const max = Math.max(stageCount("new"), 1)
                const rate = i === 0 ? null : conversionRates[conversionKey(i) as keyof typeof conversionRates]
                return (
                  <div key={stage.key} className="flex items-center gap-4">
                    <div className="w-32 sm:w-40 shrink-0">
                      <p className="text-xs font-medium text-[#0A0A0A]">{stage.label}</p>
                      <p className="font-mono text-[10px] text-[#A3A3A3] uppercase tracking-[0.1em]">
                        {formatNumber(count)} records
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-3 bg-black/[0.04] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${stage.colour} transition-all duration-500`}
                          style={{ width: `${(count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right shrink-0">
                      {rate !== undefined && rate !== null ? (
                        <p className="font-mono text-xs font-bold tabular-nums text-[#0A0A0A]">{formatPercent(rate)}</p>
                      ) : (
                        <p className="font-mono text-xs text-[#C4C4C4]">—</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 pt-5 border-t border-black/[0.06] grid grid-cols-2 sm:grid-cols-3 gap-4">
              <MiniMetric label="New → outreached" value={formatPercent(conversionRates.newToOutreached)} />
              <MiniMetric label="Outreached → revealed" value={formatPercent(conversionRates.outreachedToRevealed)} />
              <MiniMetric label="Revealed → build" value={formatPercent(conversionRates.revealedToBuild)} />
              <MiniMetric label="Build → quote" value={formatPercent(conversionRates.buildToQuote)} />
              <MiniMetric label="Quote → paid" value={formatPercent(conversionRates.quoteToPaid)} />
            </div>
          </div>
        </section>

        {/* Daily activity chart */}
        <section className="mb-10">
          <h3 className="font-sans font-bold text-[#0A0A0A] text-lg tracking-tight mb-4">
            Daily activity ({windowDays} days)
          </h3>
          <div className="bg-white border border-black/[0.08] rounded-2xl p-6 overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="flex items-end gap-1.5 h-48 mb-3">
                {daily.map((d) => (
                  <div
                    key={d.date}
                    className="flex-1 h-full flex items-end gap-px group relative"
                    title={`${d.date} — New: ${d.new} · Sent: ${d.sent} · Opened: ${d.opened} · Revealed: ${d.revealed}`}
                  >
                    <DayBar value={d.new} max={maxSingle} colour="bg-black/[0.08]" />
                    <DayBar value={d.sent} max={maxSingle} colour="bg-blue-400" />
                    <DayBar value={d.opened} max={maxSingle} colour="bg-emerald-400" />
                    <DayBar value={d.revealed} max={maxSingle} colour="bg-amber-400" />
                    <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="bg-[#0A0A0A] text-[#FAFAFA] text-[10px] font-mono whitespace-pre rounded-lg px-2.5 py-1.5 shadow-lg">
                        {d.date}
                        <br />
                        New: {d.new} · Sent: {d.sent}
                        <br />
                        Opened: {d.opened} · Revealed: {d.revealed}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#A3A3A3] uppercase tracking-[0.1em]">
                <span>{daily[0]?.date.slice(5)}</span>
                <span>{daily[daily.length - 1]?.date.slice(5)}</span>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <Legend colour="bg-black/[0.08]" label="New prospects" />
                <Legend colour="bg-blue-400" label="Sent" />
                <Legend colour="bg-emerald-400" label="Opened" />
                <Legend colour="bg-amber-400" label="Mockup revealed" />
              </div>
            </div>
          </div>
        </section>

        {/* Email performance */}
        <section className="mb-10">
          <h3 className="font-sans font-bold text-[#0A0A0A] text-lg tracking-tight mb-4">Email performance</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Kpi label="Total sent" value={emailStats.sent} />
            <Kpi label="Delivered" value={emailStats.delivered} />
            <Kpi label="Unique opens" value={emailStats.openedUnique} />
            <Kpi label="Unique clicks" value={emailStats.clickedUnique} />
            <Kpi label="Open rate" value={formatPercent(emailStats.openRate)} />
            <Kpi label="Click rate" value={formatPercent(emailStats.clickRate)} />
            <Kpi label="Bounce rate" value={formatPercent(emailStats.bounceRate)} />
            <Kpi label="Reply rate" value={formatPercent(emailStats.replyRate)} />
          </div>
        </section>

        {/* Outcome + enrichment */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white border border-black/[0.08] rounded-2xl p-6">
            <h3 className="font-sans font-bold text-[#0A0A0A] text-base tracking-tight mb-4">Pipeline outcomes</h3>
            <div className="space-y-3">
              <OutcomeRow label="Paid" value={stageCount("paid")} total={prospects.length} colour="bg-emerald-600" />
              <OutcomeRow label="Lost" value={stageCount("lost")} total={prospects.length} colour="bg-red-400" />
              <OutcomeRow label="N/A" value={stageCount("na")} total={prospects.length} colour="bg-[#A3A3A3]" />
              <OutcomeRow label="Still active" value={activePipeline} total={prospects.length} colour="bg-blue-400" />
            </div>
          </div>

          <div className="bg-white border border-black/[0.08] rounded-2xl p-6">
            <h3 className="font-sans font-bold text-[#0A0A0A] text-base tracking-tight mb-4">Enrichment</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#525252]">Records with owner name</span>
                <span className="font-mono text-sm font-bold tabular-nums text-[#0A0A0A]">
                  {formatNumber(enrichedCount)} / {formatNumber(prospects.length)}
                </span>
              </div>
              <div className="h-2 bg-black/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${safeRate(enrichedCount, prospects.length) ?? 0}%` }}
                />
              </div>
              <div className="pt-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-2">Top cities</p>
                <div className="flex flex-wrap gap-2">
                  {topCities.map(([city, count]) => (
                    <span
                      key={city}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/[0.04] text-[#0A0A0A] text-xs"
                    >
                      {city}
                      <span className="font-mono text-[10px] text-[#737373] tabular-nums">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function conversionKey(index: number): string {
  const keys = [
    "newToOutreached",
    "outreachedToRevealed",
    "revealedToBuild",
    "buildToQuote",
    "quoteToPaid",
  ]
  return keys[index - 1] ?? ""
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-black/[0.08] rounded-xl p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-1">{label}</p>
      <p className="font-sans font-bold text-2xl text-[#0A0A0A] tabular-nums">{value}</p>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#A3A3A3] mb-1">{label}</p>
      <p className="font-sans font-bold text-lg text-[#0A0A0A] tabular-nums">{value}</p>
    </div>
  )
}

function DayBar({ value, max, colour }: { value: number; max: number; colour: string }) {
  const h = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <div
      className={`flex-1 ${colour} rounded-[1px] ${h < 1 ? "h-px" : ""}`}
      style={{ height: h < 1 ? undefined : `${h}%` }}
    />
  )
}

function Legend({ colour, label }: { colour: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${colour}`} />
      <span className="text-xs text-[#525252]">{label}</span>
    </div>
  )
}

function OutcomeRow({ label, value, total, colour }: { label: string; value: number; total: number; colour: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[#525252]">{label}</span>
        <span className="font-mono text-xs font-bold tabular-nums text-[#0A0A0A]">
          {formatNumber(value)} {total > 0 && <span className="text-[#A3A3A3] font-normal">({formatPercent(safeRate(value, total))})</span>}
        </span>
      </div>
      <div className="h-2 bg-black/[0.04] rounded-full overflow-hidden">
        <div className={`h-full ${colour} rounded-full`} style={{ width: `${safeRate(value, total) ?? 0}%` }} />
      </div>
    </div>
  )
}

