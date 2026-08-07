import { supabase } from "@/lib/supabase"

export type ExampleStatus = "Mockup" | "Approved" | "Building"

export type ExampleMockup = {
  id: string
  title: string
  location: string
  category: string
  status: ExampleStatus
  createdAt: string
  image: string
}

export type ExampleMetrics = {
  total: number
  today: number
  lastCreatedAgo: string
}

const categoryMap: Record<string, string> = {
  fitness: "Health & fitness",
  healthcare: "Health & fitness",
  "beauty-wellness": "Health & fitness",
  hospitality: "Hospitality",
  "retail-fashion": "Retail",
  "professional-services": "Professional",
  "ai services": "Professional",
  trade: "Home services",
  property: "Other",
}

function mapCategory(category: string | null): string {
  if (!category) return "Other"
  const key = category.toLowerCase().trim()
  return categoryMap[key] || "Other"
}

function mapStatus(type: string): ExampleStatus {
  if (type === "live") return "Approved"
  if (type === "build") return "Building"
  return "Mockup"
}

function relativeTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 2) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export async function fetchExamples(): Promise<{ mockups: ExampleMockup[]; metrics: ExampleMetrics }> {
  const { data, error } = await supabase
    .from("examples")
    .select("id, business_name, image_url, type, category, created_at, prospect_id, prospects(city)")
    .order("created_at", { ascending: false })
    .limit(1000)

  if (error) {
    console.error("Failed to fetch examples from Supabase:", error.message)
    return { mockups: [], metrics: { total: 0, today: 0, lastCreatedAgo: "—" } }
  }

  const rows = (data ?? []) as Array<{
    id: string
    business_name: string
    image_url: string
    type: string
    category: string | null
    created_at: string
    prospect_id: number | null
    prospects: { city: string | null }[]
  }>

  const mockups: ExampleMockup[] = rows.map((row) => ({
    id: row.id,
    title: row.business_name,
    location: row.prospects?.[0]?.city || "",
    category: mapCategory(row.category),
    status: mapStatus(row.type),
    createdAt: row.created_at,
    image: row.image_url,
  }))

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayCount = rows.filter((row) => new Date(row.created_at) >= startOfToday).length
  const lastCreatedAgo = rows.length > 0 ? relativeTimeAgo(rows[0].created_at) : "—"

  const metrics: ExampleMetrics = {
    total: rows.length,
    today: todayCount,
    lastCreatedAgo,
  }

  return { mockups, metrics }
}
