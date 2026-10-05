import { supabase } from "./supabase"
import type { NextActionType, ProspectActivity, ProspectWorkflow } from "./finderModel"
import type { ResearchStatus, ScoutDecision } from "./finderModel"
import { OPERATOR_API_TOKEN } from "./operatorAuth"

export type ProspectFinancialReview = {
  id: number
  prospect_id: number
  company_number: string | null
  filing_date: string | null
  period_end: string | null
  accounts_type: string | null
  turnover: number | null
  net_assets: number | null
  cash_or_reserves: number | null
  liabilities: number | null
  currency: string
  financial_strength: "strong" | "adequate" | "weak" | "unclear"
  trajectory: "improving" | "stable" | "declining" | "unknown"
  confidence: "high" | "medium" | "low"
  summary: string
  source_url: string
  created_at: string
}

export type ProspectContact = {
  id: number
  prospect_id: number
  name: string
  role: string | null
  email: string | null
  phone: string | null
  linkedin_url: string | null
  source: string | null
  verification_status: "verified" | "likely" | "unverified" | "invalid"
  is_primary: boolean
  created_at: string
  updated_at: string
}

// Finder workflow data access. Uses the same anon-key Supabase client as the
// rest of the operator dashboard — the Auth/operator_members gate was removed
// deliberately on 2026-10-04; revisit security as the team grows.

export async function fetchWorkflows(): Promise<Map<number, ProspectWorkflow>> {
  const map = new Map<number, ProspectWorkflow>()
  let from = 0
  const page = 1000
  for (;;) {
    const { data, error } = await supabase
      .from("prospect_workflow")
      .select("*")
      .order("prospect_id", { ascending: true })
      .range(from, from + page - 1)
    if (error) throw new Error(error.message)
    const rows = (data ?? []) as ProspectWorkflow[]
    for (const r of rows) map.set(r.prospect_id, r)
    if (rows.length < page) break
    from += page
  }
  return map
}

export async function fetchActivity(prospectId: number): Promise<ProspectActivity[]> {
  const { data, error } = await supabase
    .from("prospect_activity")
    .select("*")
    .eq("prospect_id", prospectId)
    .order("created_at", { ascending: false })
    .limit(200)
  if (error) throw new Error(error.message)
  return (data ?? []) as ProspectActivity[]
}

export type FinderAction = "shortlist" | "unshortlist" | "schedule" | "complete" | "note" | "call"

// All workflow writes go through this RPC — it writes the state change and the
// audit event atomically server-side. Throws on any error; callers must not
// update local state until this resolves successfully.
export async function finderAction(
  prospectId: number,
  action: FinderAction,
  opts: { nextActionType?: NextActionType; nextActionAt?: string; note?: string } = {}
): Promise<ProspectWorkflow> {
  const { data, error } = await supabase.rpc("finder_action", {
    p_prospect_id: prospectId,
    p_action: action,
    p_next_action_type: opts.nextActionType ?? null,
    p_next_action_at: opts.nextActionAt ?? null,
    p_note: opts.note ?? null,
  })
  if (error) throw new Error(error.message)
  return data as ProspectWorkflow
}

export async function fetchFinancialReviews(prospectId: number): Promise<ProspectFinancialReview[]> {
  const { data, error } = await supabase
    .from("prospect_financial_reviews")
    .select("*")
    .eq("prospect_id", prospectId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as ProspectFinancialReview[]
}

export async function fetchProspectContacts(prospectId: number): Promise<ProspectContact[]> {
  const { data, error } = await supabase
    .from("prospect_contacts")
    .select("*")
    .eq("prospect_id", prospectId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as ProspectContact[]
}

export async function saveProspectResearch(
  prospectId: number,
  input: {
    researchStatus: ResearchStatus
    scoutDecision: ScoutDecision
    scoutPriority: number | null
    decisionReason: string
  }
): Promise<ProspectWorkflow> {
  const { data, error } = await supabase.rpc("save_prospect_research", {
    p_operator_token: OPERATOR_API_TOKEN,
    p_prospect_id: prospectId,
    p_research_status: input.researchStatus,
    p_scout_decision: input.scoutDecision,
    p_scout_priority: input.scoutPriority,
    p_decision_reason: input.decisionReason || null,
  })
  if (error) throw new Error(error.message)
  return data as ProspectWorkflow
}

export async function logFinancialReview(
  prospectId: number,
  input: Omit<ProspectFinancialReview, "id" | "prospect_id" | "created_at">
): Promise<ProspectFinancialReview> {
  const { data, error } = await supabase.rpc("log_prospect_financial_review", {
    p_operator_token: OPERATOR_API_TOKEN,
    p_prospect_id: prospectId,
    p_company_number: input.company_number,
    p_filing_date: input.filing_date,
    p_period_end: input.period_end,
    p_accounts_type: input.accounts_type,
    p_turnover: input.turnover,
    p_net_assets: input.net_assets,
    p_cash_or_reserves: input.cash_or_reserves,
    p_liabilities: input.liabilities,
    p_currency: input.currency,
    p_financial_strength: input.financial_strength,
    p_trajectory: input.trajectory,
    p_confidence: input.confidence,
    p_summary: input.summary,
    p_source_url: input.source_url,
  })
  if (error) throw new Error(error.message)
  return data as ProspectFinancialReview
}

export async function saveProspectContact(
  prospectId: number,
  input: Omit<ProspectContact, "id" | "prospect_id" | "created_at" | "updated_at"> & { id: number | null }
): Promise<ProspectContact> {
  const { data, error } = await supabase.rpc("save_prospect_contact", {
    p_operator_token: OPERATOR_API_TOKEN,
    p_prospect_id: prospectId,
    p_id: input.id,
    p_name: input.name,
    p_role: input.role,
    p_email: input.email,
    p_phone: input.phone,
    p_linkedin_url: input.linkedin_url,
    p_source: input.source,
    p_verification_status: input.verification_status,
    p_is_primary: input.is_primary,
  })
  if (error) throw new Error(error.message)
  return data as ProspectContact
}
