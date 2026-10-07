import type { Prospect, CrmStatus } from "./supabase"

// Pure derivation layer for the Finder workspace. No I/O except fetchAllProspects,
// which takes an injected page-fetch function so it can be tested without Supabase.

export const TERMINAL_CRM: CrmStatus[] = ["lost", "na", "paid"]

export function crmStatusOf(p: Prospect): CrmStatus {
  return p.crm_status ?? "new"
}

export function isTerminal(p: Prospect): boolean {
  return TERMINAL_CRM.includes(crmStatusOf(p))
}

// Explicit reply evidence only: a reply timestamp or the outreach operator's REPLIED status.
export function hasReply(p: Prospect): boolean {
  if (isTerminal(p)) return false
  return p.email_replied_at != null || p.outreach_status === "REPLIED"
}

export function isContactBlocked(p: Prospect): boolean {
  return (
    p.email_bounced_at != null ||
    p.email_opted_out_at != null ||
    p.outreach_status === "BOUNCED" ||
    p.outreach_status === "OPTED_OUT"
  )
}

export type ContactChannel = { kind: "email" | "phone"; value: string }

export function contactChannel(p: Prospect): ContactChannel | null {
  const email = p.email?.trim() || null
  const ownerEmail =
    p.owner_email?.trim() &&
    p.owner_email_status !== "invalid" &&
    p.owner_email_status !== "not_found"
      ? p.owner_email.trim()
      : null
  const phone = p.phone?.trim() || null
  if (email) return { kind: "email", value: email }
  if (ownerEmail) return { kind: "email", value: ownerEmail }
  if (phone) return { kind: "phone", value: phone }
  return null
}

export function hasWorkspaceAsset(p: Prospect): boolean {
  return p.mockup_url != null || p.review_slug != null
}

// Outreach already in motion or concluded — the finder shouldn't recommend re-touching.
export function hasPriorOutreach(p: Prospect): boolean {
  return (
    p.outreach_sent_at != null ||
    p.contacted_at != null ||
    (p.outreach_status != null && p.outreach_status !== "READY")
  )
}

/* ------------------------- Conditional qualification ------------------------- */

// Companies House is the primary machine signal: a lead is only real when CH
// has a confident match (high/medium) against a company that is still active.
export function isChVerified(p: Prospect): boolean {
  return (
    (p.ch_match_confidence === "high" || p.ch_match_confidence === "medium") &&
    p.ch_status === "active"
  )
}

// Website quality is a conditional opportunity flag, not a score. Scores are
// only meaningful when CH data is true; otherwise they're suppressed anyway.
export type WebsiteOpportunity =
  | "none"       // no website on record — pure greenfield lead
  | "down"       // site unreachable/parked at analysis time
  | "weak"       // dated build or template-builder platform
  | "modern"     // demonstrably modern build — weak prospect
  | "unreviewed" // analysed but no strong signal either way, or not analysed

const TEMPLATE_PLATFORMS = new Set([
  "wix", "weebly", "jimdo", "site123", "strikingly", "godaddy", "squarespace",
])
const MODERN_PLATFORMS = new Set(["nextjs", "framer"])

export function websiteOpportunity(p: Prospect): WebsiteOpportunity {
  if (!p.website || p.website_exists === false) return "none"
  if (p.opportunity_score === -1) return "down"
  const platform = p.site_platform?.toLowerCase() ?? null
  if (platform && MODERN_PLATFORMS.has(platform)) return "modern"
  const built = p.site_built_estimate?.toLowerCase() ?? null
  if (built && (built.startsWith("pre-") || built.endsWith("or earlier"))) return "weak"
  if (platform && (TEMPLATE_PLATFORMS.has(platform) || platform === "wordpress")) return "weak"
  return "unreviewed"
}

// Machine qualification = verified active company AND a real website
// opportunity. "Unreviewed" stays a candidate deliberately — a human eyeballs
// every site before shortlisting, so the flag sorts the list rather than gates it.
export function isMachineQualified(p: Prospect): boolean {
  if (!isChVerified(p)) return false
  return websiteOpportunity(p) !== "modern"
}

// Higher = better outreach opportunity. Conditional ordering, not a score.
export function opportunityRank(p: Prospect): number {
  switch (websiteOpportunity(p)) {
    case "none": return 4
    case "down": return 3
    case "weak": return 2
    case "unreviewed": return 1
    case "modern": return 0
  }
}

// "Ready to contact": machine-qualified, untouched, has something to show and a usable channel.
export function isReadyToContact(p: Prospect): boolean {
  if (!isMachineQualified(p)) return false
  if (crmStatusOf(p) !== "new") return false
  if (isContactBlocked(p)) return false
  if (hasPriorOutreach(p)) return false
  if (!contactChannel(p)) return false
  return hasWorkspaceAsset(p)
}

// A machine-qualified prospect still needs a human scouting decision before
// build work begins. Once an asset exists, the record belongs in outreach.
export function needsResearch(p: Prospect, w: ProspectWorkflow | undefined): boolean {
  if (!isMachineQualified(p)) return false
  if (crmStatusOf(p) !== "new") return false
  if (hasPriorOutreach(p) || hasWorkspaceAsset(p)) return false
  if (w?.research_status === "reviewed") return false
  return w?.scout_decision !== "pass"
}

export type NextActionType = "first_outreach" | "follow_up" | "review" | "mockup" | "other"
export type ResearchStatus = "unreviewed" | "researching" | "reviewed" | "stale"
export type ScoutDecision = "undecided" | "priority" | "watch" | "pass"

export const NEXT_ACTION_TYPES: NextActionType[] = ["first_outreach", "follow_up", "review", "mockup", "other"]

// Mirrors public.prospect_workflow — see supabase/migrations/20261001121500_finder_workflow.sql
export type ProspectWorkflow = {
  prospect_id: number
  shortlisted_at: string | null
  next_action_type: NextActionType | null
  next_action_at: string | null
  next_action_note: string | null
  research_status: ResearchStatus
  scout_decision: ScoutDecision
  scout_priority: number | null
  decision_reason: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

// Mirrors public.prospect_activity
export type ProspectActivityEvent =
  | "shortlisted" | "unshortlisted" | "action_scheduled" | "action_completed" | "note" | "call"
  | "research_updated" | "financial_reviewed" | "contact_saved"

export type ProspectActivity = {
  id: number
  prospect_id: number
  event_type: ProspectActivityEvent
  note: string | null
  created_at: string
}

export function endOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

// A scheduled action counts for Today only when it is a persisted, shortlisted,
// non-terminal workflow row due by end of the current local day. No derived dates.
export function isDueToday(p: Prospect, w: ProspectWorkflow | undefined, now: Date): boolean {
  if (!w || w.shortlisted_at == null || w.next_action_at == null) return false
  if (isTerminal(p)) return false
  return new Date(w.next_action_at) <= endOfLocalDay(now)
}

export type TodayItem = {
  prospect: Prospect
  kind: "reply" | "due" | "research" | "ready"
  workflow?: ProspectWorkflow
}

export const TODAY_LIMIT = 20

// Priority: replies > due scheduled actions > research > ready to contact.
// Deduped by prospect id. Due comes only from persisted next_action_at — never computed.
export function buildTodayQueue(
  prospects: Prospect[],
  opts: { workflows?: Map<number, ProspectWorkflow>; limit?: number; now?: Date } = {}
): TodayItem[] {
  const { workflows = new Map(), limit = TODAY_LIMIT, now = new Date() } = opts
  const seen = new Set<number>()
  const replies: TodayItem[] = []
  const due: TodayItem[] = []
  const research: TodayItem[] = []
  const ready: TodayItem[] = []
  for (const p of prospects) {
    if (seen.has(p.id)) continue
    const w = workflows.get(p.id)
    if (hasReply(p)) {
      seen.add(p.id)
      replies.push({ prospect: p, kind: "reply", workflow: w })
    } else if (isDueToday(p, w, now)) {
      seen.add(p.id)
      due.push({ prospect: p, kind: "due", workflow: w })
    } else if (needsResearch(p, w)) {
      seen.add(p.id)
      research.push({ prospect: p, kind: "research", workflow: w })
    } else if (isReadyToContact(p)) {
      seen.add(p.id)
      ready.push({ prospect: p, kind: "ready", workflow: w })
    }
  }
  // Most overdue first
  due.sort(
    (a, b) =>
      new Date(a.workflow!.next_action_at!).getTime() - new Date(b.workflow!.next_action_at!).getTime()
  )
  research.sort(
    (a, b) =>
      (b.workflow?.scout_priority ?? 0) - (a.workflow?.scout_priority ?? 0) ||
      opportunityRank(b.prospect) - opportunityRank(a.prospect)
  )
  ready.sort(
    (a, b) => opportunityRank(b.prospect) - opportunityRank(a.prospect)
  )
  return [...replies, ...due, ...research, ...ready].slice(0, limit)
}

export function isShortlisted(w: ProspectWorkflow | undefined): boolean {
  return w?.shortlisted_at != null
}

/* ------------------------------ Activity feed ------------------------------ */

export type TimelineEvent = {
  at: string
  label: string
  detail: string | null
  // 'recorded' = human-entered prospect_activity row; 'record' = factual column on prospects
  source: "recorded" | "record"
}

const ACTIVITY_LABELS: Record<ProspectActivityEvent, string> = {
  shortlisted: "Shortlisted",
  unshortlisted: "Removed from shortlist",
  action_scheduled: "Action scheduled",
  action_completed: "Action completed",
  note: "Note",
  call: "Call logged",
  research_updated: "Research updated",
  financial_reviewed: "Filing reviewed",
  contact_saved: "Contact saved",
}

export const ACTIVITY_CAP = 50

// Structural subset so callers (Finder record, Pipeline drawer) can pass either
// a full Prospect or a narrower record type carrying just the milestone columns.
export type ActivityMilestones = {
  first_seen_at?: string | null
  outreach_sent_at?: string | null
  email_opened_at?: string | null
  email_replied_at?: string | null
  mockup_revealed_at?: string | null
  mockup_created_at?: string | null
}

// Merges persisted human activity with factual prospect milestones. Nothing fabricated —
// every event is backed by a real column or row.
export function mergeActivity(
  p: ActivityMilestones,
  rows: ProspectActivity[],
  cap = ACTIVITY_CAP
): TimelineEvent[] {
  const events: TimelineEvent[] = rows.map((r) => ({
    at: r.created_at,
    label: ACTIVITY_LABELS[r.event_type] ?? r.event_type,
    detail: r.note,
    source: "recorded" as const,
  }))
  const recordMilestones: [string | null | undefined, string][] = [
    [p.first_seen_at, "Added to finder"],
    [p.mockup_created_at ?? null, "Mockup created"],
    [p.outreach_sent_at, "Outreach email sent"],
    [p.email_opened_at, "Outreach email opened"],
    [p.email_replied_at, "Reply received"],
    [p.mockup_revealed_at, "Mockup revealed"],
  ]
  for (const [at, label] of recordMilestones) {
    if (at) events.push({ at, label, detail: null, source: "record" })
  }
  events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  return events.slice(0, cap)
}

export function isCandidate(p: Prospect): boolean {
  if (isTerminal(p)) return false
  return isMachineQualified(p)
}

export function isAnalysed(p: Prospect): boolean {
  return p.analysed_at != null || p.site_score != null || p.prospect_score != null
}

// Scores are 0–10. Null means the analyser hasn't run — not zero.
// Out-of-range values (e.g. negative legacy backfills) are not valid scores.
export function isValidScore(score: number | null): boolean {
  return score != null && score >= 0 && score <= 10
}

export function scoreLabel(score: number | null): string {
  if (score == null) return "Pending analysis"
  if (!isValidScore(score)) return "Legacy score"
  return `${score}`
}

// Legacy rows: the qualification gate never ran (qualified_lead null) but old-model
// scores were backfilled. Any numeric score on these rows is old-model output and
// must not be presented as a current 0–10 assessment.
export function isLegacyScore(p: Prospect): boolean {
  return (
    p.qualified_lead == null &&
    (p.prospect_score != null || p.site_score != null || p.opportunity_score != null)
  )
}

// Display label for a numeric score on a row — suppresses legacy numbers entirely.
export function scoreLabelFor(p: Prospect, score: number | null): string {
  if (isLegacyScore(p)) return "Legacy"
  return scoreLabel(score)
}

export type DiscoverFilters = {
  search: string
  location: string
  category: string
  contactable: "all" | "yes" | "no"
  analysis: "all" | "analysed" | "pending"
  candidate: "all" | "candidates" | "not"
  archived: "hide" | "show"
}

export const EMPTY_DISCOVER_FILTERS: DiscoverFilters = {
  search: "",
  location: "All",
  category: "All",
  contactable: "all",
  analysis: "all",
  candidate: "all",
  archived: "hide",
}

export function applyDiscoverFilters(prospects: Prospect[], f: DiscoverFilters): Prospect[] {
  return prospects.filter((p) => {
    if (f.search) {
      const q = f.search.toLowerCase()
      const match =
        p.name?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.website?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q)
      if (!match) return false
    }
    if (f.location !== "All" && p.city !== f.location) return false
    if (f.category !== "All" && p.category !== f.category) return false
    if (f.contactable === "yes" && !contactChannel(p)) return false
    if (f.contactable === "no" && contactChannel(p)) return false
    if (f.analysis === "analysed" && !isAnalysed(p)) return false
    if (f.analysis === "pending" && isAnalysed(p)) return false
    if (f.candidate === "candidates" && !isCandidate(p)) return false
    if (f.candidate === "not" && isCandidate(p)) return false
    if (f.archived === "hide" && isTerminal(p)) return false
    return true
  })
}

// Discover default ordering: machine-qualified candidates first, ordered by
// the conditional website-opportunity flag (no site > down > weak > unreviewed).
// Everything else falls back to the Maps-only intake priority (0–10, early
// estimate — never compared numerically to the opportunity flag).
export function discoverSort(list: Prospect[]): Prospect[] {
  return [...list].sort((a, b) => {
    const aQ = isMachineQualified(a)
    const bQ = isMachineQualified(b)
    if (aQ && bQ) return opportunityRank(b) - opportunityRank(a)
    if (aQ) return -1
    if (bQ) return 1
    return (b.intake_priority ?? -1) - (a.intake_priority ?? -1)
  })
}

// Exact normalized name + postcode match across different place_ids → possible
// duplicate listing (branch/concession). Flag only — never merge or hide.
export function findDuplicateIds(prospects: Prospect[]): Set<number> {
  const groups = new Map<string, Prospect[]>()
  for (const p of prospects) {
    if (!p.name || !p.postcode) continue
    const key = `${p.name.trim().toLowerCase()}|${p.postcode.trim().toUpperCase()}`
    const g = groups.get(key) ?? []
    g.push(p)
    groups.set(key, g)
  }
  const ids = new Set<number>()
  for (const g of groups.values()) {
    if (new Set(g.map((p) => p.place_id)).size > 1) {
      for (const p of g) ids.add(p.id)
    }
  }
  return ids
}

export type FetchPage = (
  from: number,
  to: number
) => PromiseLike<{ data: Prospect[] | null; error: { message: string } | null }>

export type FetchAllResult = {
  prospects: Prospect[]
  count: number
  truncated: boolean
}

export async function fetchAllProspects(
  fetchPage: FetchPage,
  opts: { pageSize?: number; cap?: number } = {}
): Promise<FetchAllResult> {
  const pageSize = opts.pageSize ?? 500
  const cap = opts.cap ?? 5000
  const prospects: Prospect[] = []
  let from = 0
  for (;;) {
    const { data, error } = await fetchPage(from, from + pageSize - 1)
    if (error) throw new Error(error.message)
    const rows = data ?? []
    prospects.push(...rows)
    if (rows.length < pageSize) break
    from += pageSize
    if (from >= cap) return { prospects, count: prospects.length, truncated: true }
  }
  return { prospects, count: prospects.length, truncated: false }
}
