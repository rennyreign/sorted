"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase, type CrmStatus } from "@/lib/supabase"
import costConfig from "@/accounting/cost-config.json"
import {
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Zap,
  BarChart3,
  PieChart,
  RefreshCw,
  Info,
} from "lucide-react"

type BalanceStatus = "live" | "configured" | "unknown" | "no-key"

interface Supplier {
  id: string
  name: string
  category: "subscription" | "usage"
  monthlyCost: number | null
  unitCost: number | null
  unitLabel: string | null
  resultsPerUnit: number | null
  costPerResult: number | null
  currency: string
  balance: number | null
  balanceStatus: BalanceStatus
  topUpThreshold: number | null
  apiKeyEnv: string | null
  notes: string
}

interface PipelineStage {
  key: CrmStatus
  label: string
  description: string
  count: number
  costPerNod: number | null
  costPerNodDisplay: string
  conversionFromPrevious: number | null
}

interface SuppliersPayload {
  meta: { currency: string; version: string }
  monthlyBurn: number
  suppliers: Supplier[]
}

interface PipelinePayload {
  meta: { generatedAt: string; currency: string }
  summary: {
    fixedMonthlyCost: number
    estimatedVariableCost: number
    variableBreakdown: Record<string, number>
    totalMonthlyCost: number
    totalProspects: number
    activePipelineCount: number
  }
  counts: Record<string, number>
  pipelineStages: PipelineStage[]
}

const BALANCES_KEY = "sorted_supplier_balances"

const NOD_STAGES: { key: CrmStatus; label: string; description: string }[] =
  (costConfig as unknown as { nodStages: typeof NOD_STAGES }).nodStages

function loadStoredBalances(): Record<string, number | null> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(BALANCES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, number | null>
    return parsed
  } catch {
    return {}
  }
}

function saveStoredBalances(balances: Record<string, number | null>) {
  if (typeof window === "undefined") return
  localStorage.setItem(BALANCES_KEY, JSON.stringify(balances))
}

function formatCurrency(n: number | null): string {
  if (n === null || Number.isNaN(n)) return "—"
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatShortCurrency(n: number | null): string {
  if (n === null || Number.isNaN(n)) return "—"
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

export default function CostDashboard() {
  const [suppliersData, setSuppliersData] = useState<SuppliersPayload | null>(null)
  const [pipelineData, setPipelineData] = useState<PipelinePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [storedBalances, setStoredBalances] = useState<Record<string, number | null>>({})

  useEffect(() => {
    setStoredBalances(loadStoredBalances())
  }, [])

  async function fetchSuppliers(): Promise<SuppliersPayload> {
    try {
      const res = await fetch("/api/costs/suppliers", { cache: "no-store" })
      if (!res.ok) throw new Error("Supplier API failed")
      return (await res.json()) as SuppliersPayload
    } catch {
      // Fall back to local config when API routes are unavailable (static export).
      const baseSuppliers = (costConfig as unknown as { suppliers: Supplier[] }).suppliers
      return {
        meta: costConfig.meta,
        monthlyBurn: baseSuppliers.reduce((sum, s) => (s.monthlyCost ? sum + s.monthlyCost : sum), 0),
        suppliers: baseSuppliers.map((s) => ({ ...s, balanceStatus: "configured" as BalanceStatus })),
      }
    }
  }

  async function fetchPipeline(): Promise<PipelinePayload> {
    try {
      const res = await fetch("/api/costs/pipeline", { cache: "no-store" })
      if (!res.ok) throw new Error("Pipeline API failed")
      return (await res.json()) as PipelinePayload
    } catch {
      // Fallback: query Supabase directly and combine with local config.
      const { data: rows, error: supabaseError } = await supabase.from("prospects").select("crm_status")
      if (supabaseError) throw supabaseError

      const counts: Record<string, number> = {}
      for (const row of rows || []) {
        counts[row.crm_status] = (counts[row.crm_status] ?? 0) + 1
      }

      const baseSuppliers = (costConfig as unknown as { suppliers: Supplier[] }).suppliers
      const fixedMonthlyCost = baseSuppliers.reduce(
        (sum, s) => (typeof s.monthlyCost === "number" ? sum + s.monthlyCost : sum),
        0
      )

      const totalProspects = rows?.length ?? 0
      const variableBreakdown: Record<string, number> = {}
      let estimatedVariableCost = 0
      for (const s of baseSuppliers) {
        if (s.category !== "usage") continue

        if (typeof s.costPerResult === "number") {
          const cost = totalProspects * s.costPerResult
          variableBreakdown[s.id] = cost
          estimatedVariableCost += cost
          continue
        }

        if (typeof s.unitCost === "number" && typeof s.resultsPerUnit === "number" && s.resultsPerUnit > 0) {
          const runs = Math.ceil(totalProspects / s.resultsPerUnit)
          const cost = runs * s.unitCost
          variableBreakdown[s.id] = cost
          estimatedVariableCost += cost
        }
      }
      const totalMonthlyCost = fixedMonthlyCost + estimatedVariableCost

      const pipelineStages = NOD_STAGES.map((stage) => {
        const count = counts[stage.key] ?? 0
        const costPerNod = count > 0 ? totalMonthlyCost / count : null
        return {
          ...stage,
          count,
          costPerNod,
          costPerNodDisplay: costPerNod !== null ? `~${formatCurrency(costPerNod)}` : "—",
          conversionFromPrevious: null as number | null,
        }
      })

      for (let i = 1; i < pipelineStages.length; i++) {
        const prev = pipelineStages[i - 1]
        const curr = pipelineStages[i]
        curr.conversionFromPrevious = prev.count > 0 ? Math.round((curr.count / prev.count) * 1000) / 10 : null
      }

      return {
        meta: { generatedAt: new Date().toISOString(), currency: "USD" },
        summary: {
          fixedMonthlyCost,
          estimatedVariableCost,
          variableBreakdown,
          totalMonthlyCost,
          totalProspects,
          activePipelineCount: totalProspects - (counts.new ?? 0),
        },
        counts,
        pipelineStages,
      }
    }
  }

  function applyStoredBalances(data: SuppliersPayload): SuppliersPayload {
    const balances = loadStoredBalances()
    const suppliers: Supplier[] = data.suppliers.map((s) => {
      const stored = balances[s.id]
      if (stored === undefined) return s
      const nextStatus: BalanceStatus = s.balanceStatus === "live" ? "live" : "configured"
      return { ...s, balance: stored, balanceStatus: nextStatus }
    })
    return { ...data, suppliers }
  }

  function updateBalance(id: string, balance: number | null) {
    const balances = loadStoredBalances()
    if (balance === null) {
      delete balances[id]
    } else {
      balances[id] = balance
    }
    saveStoredBalances(balances)
    setStoredBalances(balances)
    setSuppliersData((prev) => (prev ? applyStoredBalances(prev) : prev))
  }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [suppliers, pipeline] = await Promise.all([fetchSuppliers(), fetchPipeline()])
      setSuppliersData(applyStoredBalances(suppliers))
      setPipelineData(pipeline)
      setLastRefreshed(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cost dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const totalMonthlyCost = pipelineData?.summary.totalMonthlyCost ?? 0
  const fixedMonthlyCost = pipelineData?.summary.fixedMonthlyCost ?? 0
  const estimatedVariableCost = pipelineData?.summary.estimatedVariableCost ?? 0
  const activePipelineCount = pipelineData?.summary.activePipelineCount ?? 0
  const averageCostPerProspect = activePipelineCount > 0 ? totalMonthlyCost / activePipelineCount : 0
  const variableBreakdown = pipelineData?.summary.variableBreakdown ?? {}

  const counts = pipelineData?.counts ?? {}
  const visitCount = counts.outreached || 0
  const performanceRates = {
    visitToReveal: visitCount > 0 ? ((counts.mockup_revealed || 0) / visitCount) * 100 : null,
    revealToBuild: (counts.mockup_revealed || 0) > 0 ? ((counts.build || 0) / counts.mockup_revealed) * 100 : null,
    buildToQuote: (counts.build || 0) > 0 ? ((counts.quote || 0) / counts.build) * 100 : null,
    quoteToSale: (counts.quote || 0) > 0 ? ((counts.paid || 0) / counts.quote) * 100 : null,
  }

  const maxCostPerNod = useMemo(() => {
    if (!pipelineData?.pipelineStages.length) return 0
    return Math.max(...pipelineData.pipelineStages.map((s) => s.costPerNod ?? 0), 1)
  }, [pipelineData])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
        <p className="text-sm text-red-600 max-w-md mb-4">{error}</p>
        <button
          onClick={load}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#0A0A0A] text-white hover:bg-[#1A1A1A] transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-8 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-1">
              Accounting
            </p>
            <h1 className="font-sans font-extrabold text-[#0A0A0A] text-3xl sm:text-4xl tracking-tight">
              Cost Dashboard
            </h1>
            <p className="text-[#525252] text-sm mt-2 max-w-xl">
              Track supplier spend, remaining balances, and the cost to advance prospects through each nod of the pipeline.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastRefreshed && (
              <p className="text-[11px] text-[#A3A3A3] font-mono">
                Updated {lastRefreshed.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
            <button
              onClick={load}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-black/[0.08] hover:bg-black/[0.03] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <SummaryCard
            icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
            label="Monthly burn"
            value={formatCurrency(totalMonthlyCost)}
            sub={
              estimatedVariableCost > 0
                ? `${formatCurrency(fixedMonthlyCost)} fixed + ${formatCurrency(estimatedVariableCost)} est. usage`
                : "Fixed subscriptions"
            }
          />
          <SummaryCard
            icon={<BarChart3 className="w-4 h-4 text-blue-600" />}
            label="Active prospects"
            value={activePipelineCount.toLocaleString()}
            sub="Excluding new / unworked"
          />
          <SummaryCard
            icon={<PieChart className="w-4 h-4 text-violet-600" />}
            label="Cost per active prospect"
            value={formatCurrency(averageCostPerProspect)}
            sub="Total burn ÷ active pipeline"
          />
          <SummaryCard
            icon={<TrendingDown className="w-4 h-4 text-amber-600" />}
            label="Suppliers needing top-up"
            value={suppliersData?.suppliers.filter((s) => needsTopUp(s)).length.toString() ?? "0"}
            sub="Balance below threshold"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
          {/* Supplier balances */}
          <section className="bg-white border border-black/[0.08] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-sans font-bold text-[#0A0A0A] text-lg tracking-tight">
                Supplier balances
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#A3A3A3]">
                USD
              </span>
            </div>
            <div className="space-y-3">
              {suppliersData?.suppliers.map((supplier) => (
                <SupplierRow
                  key={supplier.id}
                  supplier={supplier}
                  onBalanceChange={(balance) => updateBalance(supplier.id, balance)}
                />
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-black/[0.06] flex items-start gap-2 text-[11px] text-[#A3A3A3]">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Balances marked “live” are pulled from the supplier API. “Configured” values come from{" "}
                <code className="font-mono text-[10px] bg-black/[0.04] px-1 py-0.5 rounded">accounting/cost-config.json</code>. Add API keys to enable live reads.
              </span>
            </div>
          </section>

          {/* Cost per nod */}
          <section className="bg-white border border-black/[0.08] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-sans font-bold text-[#0A0A0A] text-lg tracking-tight">
                Cost per nod
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#A3A3A3]">
                {formatCurrency(totalMonthlyCost)} burn
              </span>
            </div>
            <div className="space-y-5">
              {pipelineData?.pipelineStages.map((stage) => (
                <StageBar
                  key={stage.key}
                  stage={stage}
                  maxCost={maxCostPerNod}
                  totalCost={totalMonthlyCost}
                />
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] text-[11px] text-[#A3A3A3]">
              Cost per nod = total monthly burn ÷ prospects at that stage. Fewer prospects at later stages means each successful nod is more expensive in isolation.
            </div>
          </section>
        </div>

        {/* Pipeline funnel visualization */}
        <section className="bg-white border border-black/[0.08] rounded-2xl p-6 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-sans font-bold text-[#0A0A0A] text-lg tracking-tight">
              Pipeline funnel
            </h2>
            <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#A3A3A3]">
              Counts + conversion
            </span>
          </div>

          {/* Performance rates */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <RateCard
              label="Visit → reveal"
              value={performanceRates.visitToReveal}
              numerator={counts.mockup_revealed || 0}
              denominator={visitCount}
            />
            <RateCard
              label="Reveal → build"
              value={performanceRates.revealToBuild}
              numerator={counts.build || 0}
              denominator={counts.mockup_revealed || 0}
            />
            <RateCard
              label="Build → quote"
              value={performanceRates.buildToQuote}
              numerator={counts.quote || 0}
              denominator={counts.build || 0}
            />
            <RateCard
              label="Quote → sale"
              value={performanceRates.quoteToSale}
              numerator={counts.paid || 0}
              denominator={counts.quote || 0}
            />
          </div>

          <FunnelChart stages={pipelineData?.pipelineStages ?? []} />
        </section>

        {/* Cost ledger */}
        <section className="bg-white border border-black/[0.08] rounded-2xl p-6">
          <h2 className="font-sans font-bold text-[#0A0A0A] text-lg tracking-tight mb-5">
            Cost ledger
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06]">
                  <th className="text-left font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] py-3 pr-4">Supplier</th>
                  <th className="text-left font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] py-3 pr-4">Type</th>
                  <th className="text-right font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] py-3 pr-4">Monthly / unit</th>
                  <th className="text-right font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] py-3 pr-4">Balance</th>
                  <th className="text-left font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {suppliersData?.suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b border-black/[0.04] last:border-b-0">
                    <td className="py-3 pr-4 font-medium text-[#0A0A0A]">{supplier.name}</td>
                    <td className="py-3 pr-4 text-[#525252]">
                      {supplier.category === "subscription" ? "Subscription" : "Usage"}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-[#525252]">
                      {supplier.monthlyCost ? formatCurrency(supplier.monthlyCost) + "/mo" : null}
                      {supplier.unitCost ? `$${supplier.unitCost}/${supplier.unitLabel}` : null}
                      {supplier.costPerResult ? ` · $${supplier.costPerResult.toFixed(3)}/result` : null}
                      {!supplier.monthlyCost && !supplier.unitCost && !supplier.costPerResult ? "—" : null}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums">
                      <span className={supplier.balance === null ? "text-[#A3A3A3]" : "text-[#0A0A0A] font-semibold"}>
                        {supplier.balance !== null ? formatCurrency(supplier.balance) : "—"}
                      </span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={supplier.balanceStatus} topUp={needsTopUp(supplier)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string | React.ReactNode
}) {
  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3]">{label}</span>
      </div>
      <p className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight mb-1">{value}</p>
      <p className="text-[11px] text-[#A3A3A3]">{sub}</p>
    </div>
  )
}

function RateCard({
  label,
  value,
  numerator,
  denominator,
}: {
  label: string
  value: number | null
  numerator: number
  denominator: number
}) {
  const display = value !== null ? `${value.toFixed(1)}%` : "—"
  const sub = denominator > 0 ? `${numerator} / ${denominator}` : "No data"
  const color =
    value === null ? "text-[#A3A3A3]" :
    value >= 50 ? "text-emerald-600" :
    value >= 20 ? "text-blue-600" :
    value > 0 ? "text-amber-600" :
    "text-[#A3A3A3]"

  return (
    <div className="bg-black/[0.02] border border-black/[0.06] rounded-xl p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-2">{label}</p>
      <p className={`font-sans font-bold text-xl tracking-tight mb-1 ${color}`}>{display}</p>
      <p className="text-[11px] text-[#A3A3A3]">{sub}</p>
    </div>
  )
}

function SupplierRow({
  supplier,
  onBalanceChange,
}: {
  supplier: Supplier
  onBalanceChange: (balance: number | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(supplier.balance?.toString() ?? "")
  const topUp = needsTopUp(supplier)

  function commit() {
    const value = input.trim()
    if (value === "" || value === "—") {
      onBalanceChange(null)
    } else {
      const num = Number(value)
      if (!Number.isNaN(num)) onBalanceChange(num)
    }
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-black/[0.06] px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-sans font-semibold text-[#0A0A0A] text-sm truncate">{supplier.name}</p>
          {topUp && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
              <AlertTriangle className="w-3 h-3" />
              Top up
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#A3A3A3] truncate mt-0.5">
          {supplier.monthlyCost ? `${formatCurrency(supplier.monthlyCost)}/mo` : null}
          {supplier.unitCost ? ` $${supplier.unitCost}/${supplier.unitLabel}` : null}
          {supplier.resultsPerUnit ? ` · ${supplier.resultsPerUnit} results` : null}
          {supplier.costPerResult ? ` · $${supplier.costPerResult.toFixed(3)} per result` : null}
          {supplier.notes ? ` · ${supplier.notes}` : ""}
        </p>
      </div>
      <div className="text-right shrink-0 ml-4">
        {editing ? (
          <div className="flex items-center gap-2">
            <span className="text-[#A3A3A3] text-sm">$</span>
            <input
              type="number"
              step="0.01"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit()
                if (e.key === "Escape") setEditing(false)
              }}
              onBlur={commit}
              autoFocus
              className="w-20 px-2 py-1 text-sm font-mono border border-black/[0.12] rounded-md focus:outline-none focus:border-black/30"
            />
          </div>
        ) : (
          <button
            onClick={() => {
              setInput(supplier.balance?.toString() ?? "")
              setEditing(true)
            }}
            className="text-right"
            title="Click to set balance"
          >
            <p className={`font-mono text-sm font-bold tabular-nums ${supplier.balance === null ? "text-[#A3A3A3]" : "text-[#0A0A0A]"}`}>
              {supplier.balance !== null ? formatCurrency(supplier.balance) : "—"}
            </p>
            <StatusBadge status={supplier.balanceStatus} compact />
          </button>
        )}
      </div>
    </div>
  )
}

function StatusBadge({
  status,
  topUp,
  compact,
}: {
  status: BalanceStatus
  topUp?: boolean
  compact?: boolean
}) {
  const styles: Record<BalanceStatus, string> = {
    live: "bg-emerald-50 text-emerald-700 border-emerald-100",
    configured: "bg-blue-50 text-blue-700 border-blue-100",
    unknown: "bg-[#F5F5F5] text-[#737373] border-black/[0.08]",
    "no-key": "bg-[#F5F5F5] text-[#A3A3A3] border-black/[0.08]",
  }
  const labels: Record<BalanceStatus, string> = {
    live: "Live",
    configured: "Configured",
    unknown: "Unknown",
    "no-key": "No key",
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${styles[status]} ${
        compact ? "text-[10px] px-2 py-0.5" : "text-[11px] px-2.5 py-1"
      }`}
    >
      {topUp && <Zap className="w-3 h-3 text-amber-600" />}
      {labels[status]}
    </span>
  )
}

function needsTopUp(supplier: Supplier): boolean {
  if (supplier.balance === null || supplier.topUpThreshold === null) return false
  return supplier.balance <= supplier.topUpThreshold
}

function StageBar({
  stage,
  maxCost,
  totalCost,
}: {
  stage: PipelineStage
  maxCost: number
  totalCost: number
}) {
  const width = maxCost > 0 && stage.costPerNod !== null ? `${(stage.costPerNod / maxCost) * 100}%` : "0%"
  const pctOfTotal = totalCost > 0 && stage.costPerNod !== null ? Math.round((stage.costPerNod / totalCost) * 1000) / 10 : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-[#0A0A0A]">{stage.label}</span>
          <span className="text-[11px] text-[#A3A3A3]">
            {stage.count} prospect{stage.count === 1 ? "" : "s"}
          </span>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-bold tabular-nums text-[#0A0A0A]">{stage.costPerNodDisplay}</p>
          {stage.conversionFromPrevious !== null && (
            <p className="text-[10px] text-[#A3A3A3]">
              {stage.conversionFromPrevious}% from previous
            </p>
          )}
        </div>
      </div>
      <div className="h-2.5 bg-black/[0.04] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0A0A0A] rounded-full transition-all duration-500"
          style={{ width }}
        />
      </div>
      {pctOfTotal > 0 && (
        <p className="text-[10px] text-[#A3A3A3] mt-1">
          {stage.label} cost is {pctOfTotal}% of one month’s total burn per prospect
        </p>
      )}
    </div>
  )
}

function FunnelChart({ stages }: { stages: PipelineStage[] }) {
  const maxCount = Math.max(...stages.map((s) => s.count), 1)

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-2">
      {stages.map((stage, index) => {
        const widthPct = (stage.count / maxCount) * 100
        const color =
          index === 0 ? "bg-amber-100 border-amber-200 text-amber-900" :
          index === 1 ? "bg-orange-100 border-orange-200 text-orange-900" :
          index === 2 ? "bg-emerald-100 border-emerald-200 text-emerald-900" :
          "bg-[#0A0A0A] border-black text-white"

        return (
          <div key={stage.key} className="flex-1 flex flex-col items-center">
            <div
              className={`relative w-full rounded-xl border p-4 transition-all duration-500 ${color}`}
              style={{ minHeight: "120px" }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-sans font-bold text-lg leading-none">{stage.count}</span>
                {stage.conversionFromPrevious !== null && (
                  <span className="text-[10px] font-mono opacity-70">{stage.conversionFromPrevious}%</span>
                )}
              </div>
              <p className="text-xs font-medium leading-snug">{stage.label}</p>
              <p className="text-[10px] opacity-60 mt-1">{stage.description}</p>
              <div className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-xl" style={{ width: `${widthPct}%` }} />
            </div>
            {index < stages.length - 1 && (
              <div className="hidden sm:flex items-center justify-center h-8 text-[#C4C4C4]">→</div>
              // Mobile arrow handled by flex-col gap only
            )}
          </div>
        )
      })}
    </div>
  )
}
