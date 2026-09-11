import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qweevancxedkkfxysnzq.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_WU1XpYbqZqud_nckYqTotg_JR14Nxzg"

export const adsDb = createClient(supabaseUrl, supabaseAnonKey)

export type AdStatus = "draft" | "in_review" | "approved" | "ready" | "active" | "learning"

export type CopyVariant = {
  id: string
  type: "short" | "medium" | "long"
  primary_text: string
  headline: string
  description: string
  cta: string
  approval_status: AdStatus
  comment_count: number
}

export type Angle = {
  id: string
  index: number
  name: string
  proposition: string
  tags: string[]
  status: AdStatus
  shared_creative_id: string
  shared_creative_url: string
  shared_creative_alt: string
  variants: CopyVariant[]
}

export type Campaign = {
  id: string
  name: string
  status: AdStatus
  goal: string
  audience: string
  channel: string
  start_date: string | null
  end_date: string | null
  approval_progress: number
  comment_count: number
  angles: Angle[]
  cover_image: string
  updated_at: string
}

export type Workspace = {
  slug: string
  name: string
}

// ---- Queries ----

export async function getWorkspaces(): Promise<Workspace[]> {
  const { data, error } = await adsDb
    .from("ad_review_tenants")
    .select("slug,name")
    .order("name")
  if (error) throw error
  return data || []
}

export async function getCampaigns(workspace: string): Promise<Campaign[]> {
  const { data, error } = await adsDb
    .from("ad_review_campaigns")
    .select("campaign_id,revision,package,created_at")
    .eq("tenant_slug", workspace)
    .order("revision", { ascending: false })
  if (error) throw error
  if (!data || data.length === 0) return []
  const seen = new Set<string>()
  const campaigns: Campaign[] = []
  for (const row of data) {
    const cid = row.campaign_id
    if (seen.has(cid)) continue
    seen.add(cid)
    const pkg = row.package
    const c = pkg?.campaign
    if (!c) continue
    campaigns.push({
      id: cid,
      name: c.name || cid,
      status: c.status || "draft",
      goal: c.objective || c.goal || "",
      audience: c.audience || "",
      channel: c.platform || c.channel || "facebook",
      start_date: c.start_date || null,
      end_date: c.end_date || null,
      approval_progress: 0,
      comment_count: 0,
      angles: [],
      cover_image: "",
      updated_at: row.created_at,
    })
  }
  return campaigns
}

export async function getCampaign(workspace: string, campaignId: string): Promise<Campaign | null> {
  const { data, error } = await adsDb
    .from("ad_review_campaigns")
    .select("revision,package,created_at")
    .eq("tenant_slug", workspace)
    .eq("campaign_id", campaignId)
    .order("revision", { ascending: false })
    .limit(1)
  if (error) throw error
  if (!data || data.length === 0) return null
  const pkg = data[0].package
  const c = pkg?.campaign
  if (!c) return null
  // Map concepts → angles, ads → variants
  const angles: Angle[] = (c.concepts || []).map((concept: any, i: number) => {
    const ads = concept.ads || []
    const firstAd = ads[0] || {}
    const variants: CopyVariant[] = ads.map((ad: any, vi: number) => ({
      id: ad.id || `${concept.id}-v${vi}`,
      type: vi === 0 ? "short" : vi === 1 ? "medium" : "long",
      primary_text: ad.primary_text || "",
      headline: ad.headline || "",
      description: ad.description || "",
      cta: ad.cta || "learn_more",
      approval_status: ad.approval_status || "draft",
      comment_count: 0,
    }))
    return {
      id: concept.id || `angle-${i}`,
      index: i + 1,
      name: concept.name || `Angle ${i + 1}`,
      proposition: concept.proposition || concept.strategy || "",
      tags: [],
      status: "draft",
      shared_creative_id: firstAd.creative_key || "",
      shared_creative_url: "",
      shared_creative_alt: firstAd.creative_alt || "",
      variants: variants.length === 3 ? variants : padVariants(variants),
    }
  })
  return {
    id: campaignId,
    name: c.name || campaignId,
    status: c.status || "draft",
    goal: c.objective || c.goal || "",
    audience: c.audience || "",
    channel: c.platform || c.channel || "facebook",
    start_date: c.start_date || null,
    end_date: c.end_date || null,
    approval_progress: 0,
    comment_count: 0,
    angles,
    cover_image: "",
    updated_at: data[0].created_at,
  }
}

function padVariants(variants: CopyVariant[]): CopyVariant[] {
  const types: ("short" | "medium" | "long")[] = ["short", "medium", "long"]
  const result = [...variants]
  for (const t of types) {
    if (!result.find(v => v.type === t)) {
      result.push({
        id: `placeholder-${t}`,
        type: t,
        primary_text: "",
        headline: "",
        description: "",
        cta: "learn_more",
        approval_status: "draft",
        comment_count: 0,
      })
    }
  }
  return result
}

export function statusLabel(status: AdStatus): string {
  const labels: Record<AdStatus, string> = {
    draft: "Draft",
    in_review: "In review",
    approved: "Approved",
    ready: "Ready",
    active: "Active",
    learning: "Learning",
  }
  return labels[status] || status
}

export function statusClass(status: AdStatus): string {
  const classes: Record<AdStatus, string> = {
    draft: "ads-status-draft",
    in_review: "ads-status-in-review",
    approved: "ads-status-approved",
    ready: "ads-status-approved",
    active: "ads-status-active",
    learning: "ads-status-learning",
  }
  return classes[status] || "ads-status-draft"
}
