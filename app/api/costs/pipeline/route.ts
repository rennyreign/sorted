import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import costConfig from "@/accounting/cost-config.json"
import type { CrmStatus } from "@/lib/supabase"

export const runtime = "nodejs"

type Stage = { key: CrmStatus; label: string; description: string }

interface CostConfigShape {
  suppliers: {
    id: string
    category: "subscription" | "usage"
    monthlyCost: number | null
    unitCost: number | null
    resultsPerUnit: number | null
    costPerResult: number | null
    balance: number | null
    balanceStatus?: string
  }[]
  nodStages: Stage[]
}

const { suppliers: baseSuppliers, nodStages } = costConfig as unknown as CostConfigShape

function getFixedMonthlyCost(suppliers: CostConfigShape["suppliers"]): number {
  return suppliers.reduce((sum, s) => {
    if (typeof s.monthlyCost === "number") return sum + s.monthlyCost
    return sum
  }, 0)
}

function getEstimatedVariableCost(
  suppliers: CostConfigShape["suppliers"],
  totalProspects: number
): { total: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {}
  let total = 0
  for (const s of suppliers) {
    if (s.category !== "usage") continue

    // Prefer per-result pricing when available (e.g. Apify map results).
    if (typeof s.costPerResult === "number") {
      const cost = totalProspects * s.costPerResult
      breakdown[s.id] = cost
      total += cost
      continue
    }

    // Fall back to per-unit pricing with results-per-unit.
    if (typeof s.unitCost === "number" && typeof s.resultsPerUnit === "number" && s.resultsPerUnit > 0) {
      const units = Math.ceil(totalProspects / s.resultsPerUnit)
      const cost = units * s.unitCost
      breakdown[s.id] = cost
      total += cost
    }
  }
  return { total, breakdown }
}

export async function GET() {
  const supabase = createServiceClient()

  // Count prospects per CRM status
  const { data: rows, error } = await supabase
    .from("prospects")
    .select("crm_status")

  if (error) {
    return NextResponse.json(
      { error: "Failed to read CRM pipeline", details: error.message },
      { status: 500 }
    )
  }

  const counts: Record<string, number> = {}
  for (const row of rows || []) {
    const status = row.crm_status
    counts[status] = (counts[status] ?? 0) + 1
  }

  const totalProspects = rows?.length ?? 0
  const fixedMonthlyCost = getFixedMonthlyCost(baseSuppliers)
  const { total: estimatedVariableCost, breakdown: variableBreakdown } =
    getEstimatedVariableCost(baseSuppliers, totalProspects)
  const totalMonthlyCost = fixedMonthlyCost + estimatedVariableCost

  // Cost per nod is the total monthly cost divided by the number of prospects at each stage.
  // Stages later in the funnel are more expensive because fewer prospects reach them.
  const pipelineStages = nodStages.map((stage) => {
    const count = counts[stage.key] ?? 0
    const costPerNod = count > 0 ? totalMonthlyCost / count : null
    return {
      ...stage,
      count,
      costPerNod,
      costPerNodDisplay: costPerNod !== null ? `~$${costPerNod.toFixed(2)}` : "—",
      conversionFromPrevious: null as number | null,
    }
  })

  // Compute conversion rates between consecutive nod stages.
  for (let i = 1; i < pipelineStages.length; i++) {
    const prev = pipelineStages[i - 1]
    const curr = pipelineStages[i]
    curr.conversionFromPrevious = prev.count > 0 ? Math.round((curr.count / prev.count) * 1000) / 10 : null
  }

  return NextResponse.json({
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
  })
}
