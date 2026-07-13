import { NextResponse } from "next/server"
import costConfig from "@/accounting/cost-config.json"

export const runtime = "nodejs"

interface Supplier {
  id: string
  name: string
  category: "subscription" | "usage"
  monthlyCost: number | null
  unitCost: number | null
  unitLabel: string | null
  resultsPerUnit: number | null
  currency: string
  balance: number | null
  balanceStatus: "live" | "configured" | "unknown" | "no-key"
  topUpThreshold: number | null
  apiKeyEnv: string | null
  notes: string
}

interface CostConfig {
  meta: { currency: string; version: string }
  suppliers: Supplier[]
}

const { suppliers: baseSuppliers } = costConfig as unknown as CostConfig

async function fetchApifyBalance(token: string): Promise<{ balance: number | null; status: Supplier["balanceStatus"] }> {
  try {
    const res = await fetch("https://api.apify.com/v2/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      if (res.status === 401) return { balance: null, status: "no-key" }
      return { balance: null, status: "unknown" }
    }
    const data = await res.json()
    const current = data?.data?.currentBillingPeriod?.usage?.totalPriceUsd ?? data?.data?.usageTotalUsd ?? null
    const balance = typeof current === "number" ? current : null
    return { balance, status: "live" }
  } catch {
    return { balance: null, status: "unknown" }
  }
}

async function fetchOpenAIBalance(_key: string): Promise<{ balance: number | null; status: Supplier["balanceStatus"] }> {
  // OpenAI does not expose a secret-key balance endpoint. v1/usage exists but is scoped and
  // usually empty or permission-denied for project keys. Key is present; balance is unreadable.
  return { balance: null, status: "unknown" }
}

async function fetchAnthropicBalance(_key: string): Promise<{ balance: number | null; status: Supplier["balanceStatus"] }> {
  // Anthropic does not publish a billing/usage endpoint for API keys. Key is present; balance is unreadable.
  return { balance: null, status: "unknown" }
}

export async function GET() {
  const suppliers = structuredClone(baseSuppliers) as Supplier[]

  for (const supplier of suppliers) {
    const envKey = supplier.apiKeyEnv ? process.env[supplier.apiKeyEnv] : null

    if (!envKey) {
      supplier.balanceStatus = supplier.balance === null ? "unknown" : "configured"
      continue
    }

    let result: { balance: number | null; status: Supplier["balanceStatus"] }
    switch (supplier.id) {
      case "apify":
        result = await fetchApifyBalance(envKey)
        break
      case "openai":
        result = await fetchOpenAIBalance(envKey)
        break
      case "anthropic":
        result = await fetchAnthropicBalance(envKey)
        break
      default:
        result = { balance: null, status: "unknown" }
    }

    if (result.status === "live" && result.balance !== null) {
      supplier.balance = result.balance
    }
    supplier.balanceStatus = result.status
  }

  // Compute monthly burn from fixed subscriptions only. Usage-based suppliers
  // deplete balances over time; their current balance is shown separately so the
  // operator knows when to top up, not blended into the burn rate.
  const monthlyBurn = suppliers.reduce((sum, s) => {
    if (s.category === "subscription" && typeof s.monthlyCost === "number") {
      return sum + s.monthlyCost
    }
    return sum
  }, 0)

  return NextResponse.json({
    meta: costConfig.meta,
    monthlyBurn,
    suppliers,
  })
}
