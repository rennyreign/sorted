"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { OPERATOR_API_TOKEN } from "@/lib/operatorAuth"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Metric {
  value: number | null
  target?: number | null
  prev?: number | null
  source?: string
  lower_is_better?: boolean
}

interface ScorecardData {
  meta: {
    week_start: string
    week_end: string
    fy_start: string
    fy_end: string
    generated_at: string
  }
  headline: Record<string, Metric>
  fy27: Record<string, Metric>
  prospecting: Record<string, Metric>
  organic: Record<string, Metric>
  partners: Record<string, Metric>
  website: Record<string, Metric>
  paid: Record<string, Metric>
  commercial: Record<string, Metric>
  funnel: Record<string, Metric>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatGbp(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "—"
  if (n >= 1000) return `£${(n / 1000).toFixed(1)}k`
  return `£${Math.round(n).toLocaleString()}`
}

function formatNum(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "—"
  return Math.round(n).toLocaleString()
}

function formatPct(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "—"
  return `${n.toFixed(1)}%`
}

function paceStatus(value: number | null, target: number | null | undefined, lowerIsBetter?: boolean): "on" | "behind" | "ahead" | null {
  if (value === null || value === undefined || !target || target <= 0) return null
  const ratio = value / target
  if (lowerIsBetter) {
    // For cost metrics: under target = ahead, over target = behind
    if (ratio <= 0.9) return "ahead"
    if (ratio <= 1.1) return "on"
    return "behind"
  }
  if (ratio >= 1.1) return "ahead"
  if (ratio >= 0.9) return "on"
  return "behind"
}

function trendIcon(value: number | null, prev: number | null | undefined) {
  if (value === null || value === undefined || prev === null || prev === undefined) return null
  if (value > prev) return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
  if (value < prev) return <TrendingDown className="w-3.5 h-3.5 text-red-500" />
  return <Minus className="w-3.5 h-3.5 text-neutral-400" />
}

function variance(value: number | null, target: number | null | undefined): string {
  if (value === null || value === undefined || !target) return "—"
  const v = value - target
  if (v > 0) return `+${formatNum(v)}`
  return formatNum(v)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeadlineCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 rounded-xl bg-white border border-black/[0.06]">
      <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-bold text-[#0A0A0A] tabular-nums leading-tight">{value}</span>
      {sub && <span className="text-xs text-neutral-500">{sub}</span>}
    </div>
  )
}

function PaceBadge({ status }: { status: "on" | "behind" | "ahead" | null }) {
  if (!status) return null
  const config = {
    on: { label: "On", cls: "bg-emerald-50 text-emerald-700" },
    behind: { label: "Behind", cls: "bg-red-50 text-red-600" },
    ahead: { label: "Ahead", cls: "bg-blue-50 text-blue-600" },
  }
  const c = config[status]
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.cls}`}>{c.label}</span>
}

function MetricRow({
  label,
  metric,
  format = "num",
}: {
  label: string
  metric: Metric
  format?: "num" | "gbp" | "pct"
}) {
  const fmt = format === "gbp" ? formatGbp : format === "pct" ? formatPct : formatNum
  const lowerIsBetter = metric.lower_is_better === true
  const status = paceStatus(metric.value, metric.target ?? null, lowerIsBetter)

  // For cost metrics (lowerIsBetter), being under target is good (green);
  // for normal metrics, being over target is good (green).
  const isOverTarget = Number(metric.value) > Number(metric.target ?? 0)
  const isGood = lowerIsBetter ? !isOverTarget : isOverTarget
  const varianceColour = metric.value === null || !metric.target ? "text-neutral-400" : isGood ? "text-emerald-600" : "text-red-500"

  return (
    <tr className="border-b border-black/[0.04] last:border-0">
      <td className="py-2.5 pr-4 text-sm text-neutral-700">{label}</td>
      <td className="py-2.5 pr-4 text-sm font-semibold text-[#0A0A0A] tabular-nums text-right">
        {fmt(metric.value)}
      </td>
      <td className="py-2.5 pr-4 text-sm text-neutral-400 tabular-nums text-right">
        {metric.prev !== undefined ? fmt(metric.prev) : "—"}
      </td>
      <td className="py-2.5 pr-4 text-sm text-neutral-500 tabular-nums text-right">
        {metric.target ? fmt(metric.target) : "—"}
      </td>
      <td className="py-2.5 pr-4 text-sm tabular-nums text-right">
        <span className={varianceColour}>
          {variance(metric.value, metric.target ?? null)}
        </span>
      </td>
      <td className="py-2.5 pr-4 text-sm text-center">{trendIcon(metric.value, metric.prev)}</td>
      <td className="py-2.5 text-sm"><PaceBadge status={status} /></td>
    </tr>
  )
}

function SectionCard({
  title,
  children,
  empty,
}: {
  title: string
  children: React.ReactNode
  empty?: boolean
}) {
  return (
    <div className="rounded-xl bg-white border border-black/[0.06] overflow-hidden">
      <div className="px-5 py-3 border-b border-black/[0.06]">
        <h3 className="text-sm font-semibold text-[#0A0A0A]">{title}</h3>
      </div>
      {empty ? (
        <div className="px-5 py-8 text-center text-sm text-neutral-400">No data yet</div>
      ) : (
        <div className="overflow-x-auto px-5 pb-1">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                <th className="text-left py-2.5 pr-4 font-medium">Metric</th>
                <th className="text-right py-2.5 pr-4 font-medium">This Week</th>
                <th className="text-right py-2.5 pr-4 font-medium">Prev Week</th>
                <th className="text-right py-2.5 pr-4 font-medium">Target</th>
                <th className="text-right py-2.5 pr-4 font-medium">Variance</th>
                <th className="text-center py-2.5 pr-4 font-medium">Trend</th>
                <th className="text-left py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FunnelStep({
  label,
  value,
  format = "num",
  showArrow = true,
  accent = false,
}: {
  label: string
  value: number | null
  format?: "num" | "gbp"
  showArrow?: boolean
  accent?: boolean
}) {
  const fmt = format === "gbp" ? formatGbp : formatNum
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
        <span className="text-[11px] text-neutral-400 uppercase tracking-wider truncate">{label}</span>
        <span className={`text-lg font-bold tabular-nums ${accent ? "text-emerald-600" : "text-[#0A0A0A]"}`}>
          {fmt(value)}
        </span>
      </div>
      {showArrow && <ArrowRight className="w-4 h-4 text-neutral-300 shrink-0" />}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Scorecard() {
  const [data, setData] = useState<ScorecardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchScorecard = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data: result, error: rpcError } = await supabase.rpc("operator_get_scorecard", {
      p_operator_token: OPERATOR_API_TOKEN,
    })
    if (rpcError) {
      setError(rpcError.message)
    } else {
      setData(result as ScorecardData)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchScorecard()
  }, [fetchScorecard])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black/[0.1] border-t-[#0A0A0A] rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <AlertTriangle className="w-8 h-8 text-red-400" />
        <p className="text-sm text-neutral-600 text-center max-w-md">
          Could not load scorecard. The migration may not be applied yet, or the operator token is invalid.
        </p>
        <p className="text-xs text-neutral-400 font-mono">{error}</p>
        <button
          onClick={fetchScorecard}
          className="text-xs text-[#0A0A0A] underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  const h = data.headline
  const fy = data.fy27

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0A0A0A]">Weekly Scorecard</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Week of {data.meta.week_start} — FY27 ends {data.meta.fy_end}
            </p>
          </div>
          <button
            onClick={fetchScorecard}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#0A0A0A] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Headline numbers */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <HeadlineCard
            label="FY27 Revenue"
            value={formatGbp(h.fy27_revenue?.value)}
            sub={`Target ${formatGbp(h.fy27_revenue?.target)}`}
          />
          <HeadlineCard
            label="Revenue Pace"
            value={formatGbp(h.revenue_pace?.value)}
            sub={`Req'd ${formatGbp(h.revenue_pace?.target)}/wk`}
          />
          <HeadlineCard
            label="Customers Won"
            value={formatNum(h.customers_won?.value)}
            sub={`Prev ${formatNum(h.customers_won?.prev)}`}
          />
          <HeadlineCard
            label="Leads"
            value={formatNum(h.leads?.value)}
            sub={`Prev ${formatNum(h.leads?.prev)}`}
          />
          <HeadlineCard
            label="Pipeline Value"
            value={formatGbp(h.pipeline_value?.value)}
          />
        </div>

        {/* FY27 progress bar */}
        <div className="rounded-xl bg-white border border-black/[0.06] px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#0A0A0A]">FY27 Progress</span>
            <span className="text-sm text-neutral-500 tabular-nums">
              {formatGbp(fy.revenue?.value)} of {formatGbp(fy.revenue?.target)}
            </span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0A0A0A] rounded-full transition-all"
              style={{ width: `${Math.min(fy.pct_achieved?.value ?? 0, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-neutral-400">
            <span>
              {formatPct(fy.pct_achieved?.value)} achieved — {formatNum(fy.weeks_elapsed?.value)} of {formatNum(fy.weeks_total?.value)} weeks elapsed
            </span>
            <span>
              Forecast: {formatGbp(fy.forecast_revenue?.value)}
            </span>
          </div>
        </div>

        {/* Acquisition funnel */}
        <div className="rounded-xl bg-white border border-black/[0.06] px-5 py-4">
          <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Acquisition Funnel</h3>
          <div className="flex items-center gap-1">
            <FunnelStep label="Prospects" value={data.funnel.prospects?.value} />
            <FunnelStep label="Mockups" value={data.funnel.mockups?.value} />
            <FunnelStep label="Responses" value={data.funnel.views_responses?.value} />
            <FunnelStep label="Leads/NODs" value={data.funnel.leads_nods?.value} />
            <FunnelStep label="Customers" value={data.funnel.customers?.value} />
            <FunnelStep label="Revenue" value={data.funnel.revenue?.value} format="gbp" showArrow={false} accent />
          </div>
        </div>

        {/* Section tables */}
        <div className="grid md:grid-cols-2 gap-4">
          <SectionCard title="Prospecting">
            <MetricRow label="Prospects added" metric={data.prospecting.prospects_added} />
            <MetricRow label="Mockups created" metric={data.prospecting.mockups_created} />
            <MetricRow label="Mockups sent" metric={data.prospecting.mockups_sent} />
            <MetricRow label="Mockup → response rate" metric={data.prospecting.mockup_response_rate} format="pct" />
          </SectionCard>

          <SectionCard title="Organic Marketing">
            <MetricRow label="Websites built" metric={data.organic.websites_built} />
            <MetricRow label="Content posts" metric={data.organic.content_posts} />
            <MetricRow label="Posts (TikTok)" metric={data.organic.posts_tiktok} />
            <MetricRow label="Organic leads" metric={data.organic.organic_leads} />
          </SectionCard>

          <SectionCard title="Partners">
            <MetricRow label="Active partners" metric={data.partners.active_partners} />
            <MetricRow label="New partners" metric={data.partners.new_partners} />
            <MetricRow label="Partner mockups" metric={data.partners.partner_mockups} />
            <MetricRow label="Partner leads" metric={data.partners.partner_leads} />
            <MetricRow label="Partner customers" metric={data.partners.partner_customers} />
            <MetricRow label="Partner revenue" metric={data.partners.partner_revenue} format="gbp" />
          </SectionCard>

          <SectionCard title="Website / Mockups (GA4)">
            <MetricRow label="Sessions" metric={data.website.sessions} />
            <MetricRow label="Mockup page views" metric={data.website.mockup_page_views} />
            <MetricRow label="Unique mockup visitors" metric={data.website.unique_mockup_visitors} />
            <MetricRow label="CTA conversions" metric={data.website.cta_conversions} />
            <MetricRow label="Leads" metric={data.website.leads} />
            <MetricRow label="Visitor → lead" metric={data.website.visitor_to_lead} format="pct" />
            <MetricRow label="Mockup → lead" metric={data.website.mockup_to_lead} format="pct" />
          </SectionCard>

          <SectionCard title="Paid Acquisition" empty={data.paid.ad_spend?.value === null || data.paid.ad_spend?.value === undefined}>
            {data.paid.ad_spend?.value !== null && data.paid.ad_spend?.value !== undefined ? (
              <>
                <MetricRow label="Ad spend" metric={data.paid.ad_spend} format="gbp" />
                <MetricRow label="Leads" metric={data.paid.leads} />
                <MetricRow label="CPL" metric={data.paid.cpl} format="gbp" />
                <MetricRow label="Customers" metric={data.paid.customers} />
                <MetricRow label="CAC" metric={data.paid.cac} format="gbp" />
                <MetricRow label="Revenue attributed" metric={data.paid.revenue_attributed} format="gbp" />
                <MetricRow label="ROAS" metric={data.paid.roas} format="pct" />
              </>
            ) : null}
          </SectionCard>

          <SectionCard title="Commercial">
            <MetricRow label="Leads" metric={data.commercial.leads} />
            <MetricRow label="NODs / qualified opps" metric={data.commercial.nods} />
            <MetricRow label="Proposals" metric={data.commercial.proposals} />
            <MetricRow label="Customers won" metric={data.commercial.customers_won} />
            <MetricRow label="Revenue won" metric={data.commercial.revenue_won} format="gbp" />
            <MetricRow label="Cash collected" metric={data.commercial.cash_collected} format="gbp" />
            <MetricRow label="Avg customer value" metric={data.commercial.avg_customer_value} format="gbp" />
            <MetricRow label="Lead → customer" metric={data.commercial.lead_to_customer} format="pct" />
          </SectionCard>
        </div>

        {/* Pipeline distribution */}
        {data.prospecting.pipeline_distribution?.value && (
          <div className="rounded-xl bg-white border border-black/[0.06] px-5 py-4">
            <h3 className="text-sm font-semibold text-[#0A0A0A] mb-3">Pipeline Status Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.prospecting.pipeline_distribution.value as unknown as Record<string, number>).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-50 border border-black/[0.04]"
                >
                  <span className="text-xs text-neutral-500 capitalize">{status}</span>
                  <span className="text-sm font-semibold text-[#0A0A0A] tabular-nums">{formatNum(count)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-neutral-400 text-center pt-2">
          Auto-generated from Supabase CRM, GA4 Data API, and Stripe. No manual entry.
        </p>
      </div>
    </div>
  )
}
