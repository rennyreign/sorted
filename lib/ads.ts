// Sorted Ads — data layer
// Fetches campaign data from the existing ad-review PHP API.

const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "https://sortmydigital.site/ad-previewer/api"
    : "/ad-previewer/api"

const DEFAULT_TENANT = "school-of-skill"
const ACCESS_CODE_KEY = "ads-access-code"

export function getAccessCode(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(ACCESS_CODE_KEY) || ""
}

export function setAccessCode(code: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(ACCESS_CODE_KEY, code)
}

export function clearAccessCode() {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_CODE_KEY)
}

export type AdStatus = "draft" | "in_review" | "approved" | "ready" | "active" | "learning"

export type ReviewStatus = "awaiting_review" | "approved" | "changes_requested" | "rejected"

export type CopyVariant = {
  id: string
  type: "short" | "medium" | "long"
  primary_text: string
  headline: string
  description: string
  cta: string
  approval_status: AdStatus
  review_status: ReviewStatus
  review_comment: string
  reviewer: string
  reviewed_at: string
  comment_count: number
  fingerprint: string
  creative_key: string
  creative_url: string
  creative_alt: string
  destination_url: string
  placement: string
  ratio: string
  crop: { x: number; y: number }
}

export type Angle = {
  id: string
  index: number
  name: string
  proposition: string
  strategy: string
  audience: string
  tags: string[]
  status: AdStatus
  shared_creative_id: string
  shared_creative_url: string
  shared_creative_alt: string
  variants: CopyVariant[]
  fingerprint: string
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
  revision: number
  updated_at: string
}

export type Workspace = {
  slug: string
  name: string
}

export type ReviewDecision = {
  id: number
  campaign_id: string
  campaign_revision: number
  target_type: "concept" | "ad"
  target_id: string
  fingerprint: string
  status: "awaiting_review" | "approved" | "changes_requested" | "rejected"
  comment: string
  reviewer: string
  created_at: string
}

export type Asset = {
  id: string
  name: string
  media_type: "image" | "video"
  url: string
  thumbnail: string
  width: number
  height: number
  aspect_ratio: string
  file_size: string
  usage: string[]
  created_at: string
}

type ApiCampaign = {
  id: string
  revision: number
  name: string
  platform: string
  objective: string
  audience?: string
  start_date?: string
  end_date?: string
  concepts: ApiConcept[]
}

type ApiConcept = {
  id: string
  revision: number
  name: string
  strategy: string
  audience: string
  proposition: string
  fingerprint: string
  ads: ApiAd[]
}

type ApiAd = {
  id: string
  revision: number
  placement: string
  ratio: string
  cta: string
  primary_text: string
  headline: string
  description: string
  creative_key: string
  creative_alt: string
  destination_url: string
  fingerprint: string
  crop?: { x: number; y: number }
}

type ApiAsset = {
  creative_key: string
  name: string
  collection: string
  kind: string
  url: string
  media_type: string
  width: number
  height: number
  file_size: number
  created_at?: string
}

type ApiResponse = {
  tenant: { slug: string; name: string }
  role: string
  editor_name: string
  assets: ApiAsset[]
  image_locks: { campaign_id: string; ad_id: string; editor: string }[]
  campaigns: ApiCampaign[]
  decisions: ReviewDecision[]
}

// ---- API fetch ----

async function fetchPortal(tenant: string = DEFAULT_TENANT): Promise<ApiResponse> {
  const code = getAccessCode()
  if (!code) throw new Error("Access code required")
  const res = await fetch(`${API_BASE}/index.php?tenant=${encodeURIComponent(tenant)}`, {
    headers: { Authorization: `Bearer ${code}` },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to load campaigns")
  }
  return res.json()
}

// ---- Asset URL resolver ----

function resolveAssetUrl(creativeKey: string, assets: ApiAsset[]): string {
  if (!creativeKey) return ""
  const match = assets.find((a) => a.creative_key === creativeKey)
  if (match) return match.url
  const filename = creativeKey.split("/").pop()
  const fallback = assets.find((a) => a.creative_key.split("/").pop() === filename)
  return fallback?.url || ""
}

// ---- Decision lookup ----

function decisionForAd(decisions: ReviewDecision[], campaignId: string, adId: string): ReviewDecision | null {
  return decisions.find((d) => d.campaign_id === campaignId && d.target_type === "ad" && d.target_id === adId) || null
}

function decisionForConcept(decisions: ReviewDecision[], campaignId: string, conceptId: string): ReviewDecision | null {
  return decisions.find((d) => d.campaign_id === campaignId && d.target_type === "concept" && d.target_id === conceptId) || null
}

// ---- Mappers ----

function mapAdStatus(decision: ReviewDecision | null): AdStatus {
  if (!decision) return "draft"
  if (decision.status === "approved") return "approved"
  if (decision.status === "changes_requested") return "in_review"
  if (decision.status === "rejected") return "draft"
  return "draft"
}

function mapReviewStatus(decision: ReviewDecision | null): ReviewStatus {
  if (!decision) return "awaiting_review"
  return decision.status
}

function mapConceptStatus(decision: ReviewDecision | null): AdStatus {
  if (!decision) return "draft"
  if (decision.status === "approved") return "approved"
  if (decision.status === "awaiting_review") return "in_review"
  if (decision.status === "changes_requested") return "in_review"
  if (decision.status === "rejected") return "draft"
  return "draft"
}

function mapCampaignStatus(campaign: ApiCampaign, decisions: ReviewDecision[]): AdStatus {
  const concepts = campaign.concepts || []
  if (concepts.length === 0) return "draft"
  const campaignDecisions = (decisions || []).filter((d) => d.campaign_id === campaign.id)
  if (campaignDecisions.length === 0) return "draft"
  const allApproved = concepts.every((concept) => {
    const dec = decisionForConcept(decisions, campaign.id, concept.id)
    return dec?.status === "approved"
  })
  if (allApproved) return "approved"
  const anyReview = campaignDecisions.some((d) => d.status === "changes_requested" || d.status === "awaiting_review")
  if (anyReview) return "in_review"
  return "draft"
}

function mapApiToCampaign(apiCampaign: ApiCampaign, data: ApiResponse): Campaign {
  const decisions = data.decisions || []
  const assets = data.assets || []
  const angles: Angle[] = (apiCampaign.concepts || []).map((concept, i) => {
    const conceptDecision = decisionForConcept(decisions, apiCampaign.id, concept.id)
    const ads = concept.ads || []
    const firstAd = ads[0] || ({} as ApiAd)
    const creativeUrl = resolveAssetUrl(firstAd.creative_key || "", assets)

    const variants: CopyVariant[] = ads.map((ad, vi) => {
      const adDecision = decisionForAd(decisions, apiCampaign.id, ad.id)
      return {
        id: ad.id,
        type: vi === 0 ? "short" : vi === 1 ? "medium" : "long",
        primary_text: ad.primary_text || "",
        headline: ad.headline || "",
        description: ad.description || "",
        cta: ad.cta || "LEARN_MORE",
        approval_status: mapAdStatus(adDecision),
        review_status: mapReviewStatus(adDecision),
        review_comment: adDecision?.comment || "",
        reviewer: adDecision?.reviewer || "",
        reviewed_at: adDecision?.created_at || "",
        comment_count: adDecision?.comment ? 1 : 0,
        fingerprint: ad.fingerprint || "",
        creative_key: ad.creative_key || "",
        creative_url: resolveAssetUrl(ad.creative_key || "", assets),
        creative_alt: ad.creative_alt || "",
        destination_url: ad.destination_url || "",
        placement: ad.placement || "facebook_feed",
        ratio: ad.ratio || "1:1",
        crop: ad.crop || { x: 50, y: 50 },
      }
    })

    return {
      id: concept.id,
      index: i + 1,
      name: concept.name,
      proposition: concept.proposition || "",
      strategy: concept.strategy || "",
      audience: concept.audience || "",
      tags: [],
      status: mapConceptStatus(conceptDecision),
      shared_creative_id: firstAd.creative_key || "",
      shared_creative_url: creativeUrl,
      shared_creative_alt: firstAd.creative_alt || "",
      variants: variants.length === 3 ? variants : padVariants(variants),
      fingerprint: concept.fingerprint || "",
    }
  })

  const approvedAngles = angles.filter((a) => a.status === "approved").length
  const totalAngles = angles.length

  return {
    id: apiCampaign.id,
    name: apiCampaign.name,
    status: mapCampaignStatus(apiCampaign, decisions),
    goal: apiCampaign.objective || "",
    audience: apiCampaign.audience || angles[0]?.audience || "",
    channel: apiCampaign.platform || "meta",
    start_date: apiCampaign.start_date || null,
    end_date: apiCampaign.end_date || null,
    approval_progress: totalAngles > 0 ? Math.round((approvedAngles / totalAngles) * 100) : 0,
    comment_count: decisions.filter((d) => d.campaign_id === apiCampaign.id && d.comment).length,
    angles,
    cover_image: angles[0]?.shared_creative_url || "",
    revision: apiCampaign.revision,
    updated_at: "",
  }
}

function padVariants(variants: CopyVariant[]): CopyVariant[] {
  const types: ("short" | "medium" | "long")[] = ["short", "medium", "long"]
  const result = [...variants]
  for (const t of types) {
    if (!result.find((v) => v.type === t)) {
      result.push({
        id: `placeholder-${t}`,
        type: t,
        primary_text: "",
        headline: "",
        description: "",
        cta: "LEARN_MORE",
        approval_status: "draft",
        comment_count: 0,
        fingerprint: "",
        creative_key: "",
        creative_url: "",
        creative_alt: "",
        destination_url: "",
        placement: "facebook_feed",
        ratio: "1:1",
        review_status: "awaiting_review",
        review_comment: "",
        reviewer: "",
        reviewed_at: "",
        crop: { x: 50, y: 50 },
      })
    }
  }
  return result
}

// ---- Public queries ----

export async function getWorkspaces(): Promise<Workspace[]> {
  const data = await fetchPortal()
  return [{ slug: data.tenant.slug, name: data.tenant.name }]
}

export async function getCampaigns(workspace: string = DEFAULT_TENANT): Promise<Campaign[]> {
  const data = await fetchPortal(workspace)
  const campaigns = data.campaigns || []
  return campaigns.map((c) => {
    try {
      return mapApiToCampaign(c, data)
    } catch (e) {
      console.error("Failed to map campaign", c?.id, e)
      return {
        id: c.id || "unknown",
        name: c.name || "Unknown campaign",
        status: "draft" as AdStatus,
        goal: c.objective || "",
        audience: "",
        channel: c.platform || "meta",
        start_date: null,
        end_date: null,
        approval_progress: 0,
        comment_count: 0,
        angles: [],
        cover_image: "",
        revision: c.revision || 0,
        updated_at: "",
      }
    }
  })
}

export async function getCampaign(workspace: string, campaignId: string): Promise<Campaign | null> {
  const data = await fetchPortal(workspace)
  const apiCampaign = (data.campaigns || []).find((c) => c.id === campaignId)
  if (!apiCampaign) return null
  return mapApiToCampaign(apiCampaign, data)
}

export async function getAssets(workspace: string = DEFAULT_TENANT): Promise<Asset[]> {
  const data = await fetchPortal(workspace)
  return (data.assets || []).map((item) => {
    const isVideo = item.kind === "video"
    const filename = item.creative_key.split("/").pop() || item.name
    return {
      id: item.creative_key,
      name: item.name || filename,
      media_type: isVideo ? "video" : "image",
      url: item.url,
      thumbnail: item.url,
      width: item.width || 0,
      height: item.height || 0,
      aspect_ratio: item.width && item.height ? `${item.width}:${item.height}` : "1:1",
      file_size: item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(1)} MB` : "—",
      usage: item.collection ? [item.collection] : [],
      created_at: item.created_at || "",
    }
  })
}

// ---- Helpers ----

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

export function reviewStatusLabel(status: ReviewStatus): string {
  const labels: Record<ReviewStatus, string> = {
    awaiting_review: "Awaiting feedback",
    approved: "Approved",
    changes_requested: "Changes requested",
    rejected: "Rejected",
  }
  return labels[status] || status
}

export function reviewStatusClass(status: ReviewStatus): string {
  const classes: Record<ReviewStatus, string> = {
    awaiting_review: "ads-status-awaiting",
    approved: "ads-status-approved",
    changes_requested: "ads-status-changes",
    rejected: "ads-status-rejected",
  }
  return classes[status] || "ads-status-awaiting"
}

export async function uploadAsset(
  workspace: string,
  file: File,
  name: string,
  collection: string = "",
  kind: "photo" | "artwork" = "photo"
): Promise<Asset> {
  const code = getAccessCode()
  if (!code) throw new Error("Access code required")
  const form = new FormData()
  form.append("image", file)
  form.append("name", name)
  form.append("collection", collection)
  form.append("kind", kind)
  const res = await fetch(`${API_BASE}/index.php?tenant=${encodeURIComponent(workspace)}&action=upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${code}` },
    body: form,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Failed to upload image")
  const a = data.asset
  return {
    id: a.creative_key || a.url?.split("/").pop() || `asset-${Date.now()}`,
    name: a.name || file.name,
    media_type: "image",
    url: a.url,
    thumbnail: a.url,
    width: a.width || 0,
    height: a.height || 0,
    aspect_ratio: a.width && a.height ? `${a.width}:${a.height}` : "1:1",
    file_size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    usage: [],
    created_at: a.created_at || new Date().toISOString(),
  }
}

export async function editImage(
  workspace: string,
  campaignId: string,
  campaignRevision: number,
  adId: string,
  fingerprint: string,
  creativeKey: string,
  crop: { x: number; y: number } = { x: 50, y: 50 }
): Promise<{ revision: number }> {
  const code = getAccessCode()
  if (!code) throw new Error("Access code required")
  const res = await fetch(`${API_BASE}/index.php?tenant=${encodeURIComponent(workspace)}&action=edit-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${code}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      base_revision: campaignRevision,
      campaign_id: campaignId,
      ad_id: adId,
      fingerprint,
      creative_key: creativeKey,
      crop,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Failed to update image")
  return { revision: data.campaign_revision ?? data.revision ?? campaignRevision + 1 }
}

export async function submitDecision(
  workspace: string,
  campaignId: string,
  campaignRevision: number,
  targetType: "concept" | "ad",
  targetId: string,
  fingerprint: string,
  status: ReviewStatus,
  comment: string = "",
  reviewer: string = "Reviewer"
): Promise<ReviewDecision> {
  const code = getAccessCode()
  if (!code) throw new Error("Access code required")
  const res = await fetch(`${API_BASE}/index.php?tenant=${encodeURIComponent(workspace)}&action=portal`, {
    method: "POST",
    headers: { Authorization: `Bearer ${code}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      campaign_id: campaignId,
      campaign_revision: campaignRevision,
      target_type: targetType,
      target_id: targetId,
      fingerprint,
      status,
      comment,
      reviewer,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Failed to save decision")
  return data.decision || data
}
