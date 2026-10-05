"use client"

import { useEffect, useState } from "react"
import type { ProspectWorkflow, ScoutDecision } from "@/lib/finderModel"
import {
  saveProspectResearch,
  fetchProspectContacts,
  saveProspectContact,
  fetchFinancialReviews,
  logFinancialReview,
  type ProspectContact,
  type ProspectFinancialReview,
} from "@/lib/operatorDb"

type Fact = {
  current: number
  previous: number | null
  period_end: string | null
  unit: string | null
  source_tag: string
}

export type ResearchProspect = {
  id: number
  name: string
  phone?: string | null
  source_company_number?: string | null
  source_sic_codes?: string[] | null
  source_url?: string | null
  ch_status?: string | null
  ch_incorporated_date?: string | null
  ch_accounts_type?: string | null
  ch_accounts_last_date?: string | null
  ch_accounts_period_end?: string | null
  ch_accounts_due_date?: string | null
  ch_accounts_overdue?: boolean | null
  ch_confirmation_due_date?: string | null
  ch_confirmation_overdue?: boolean | null
  ch_match_confidence?: string | null
  ch_filing_url?: string | null
  ch_turnover?: number | null
  ch_net_assets?: number | null
  ch_cash?: number | null
  ch_current_assets?: number | null
  ch_liabilities?: number | null
  ch_employees?: number | null
  ch_financial_facts?: Record<string, Fact> | null
  ch_data_updated_at?: string | null
  owner_name?: string | null
  owner_role?: string | null
  owner_email?: string | null
  owner_email_status?: string | null
  associated_names?: Array<{ name: string; role?: string }> | null
}

type Props = {
  prospect: ResearchProspect
  workflow?: ProspectWorkflow
  canWrite?: boolean
  onWorkflowChange?: (workflow: ProspectWorkflow) => void
  onActivityChange?: () => void
}

const DECISIONS: Array<{ value: Exclude<ScoutDecision, "undecided">; label: string; copy: string }> = [
  { value: "priority", label: "Scout", copy: "Strong business, meaningful gap" },
  { value: "watch", label: "Watch", copy: "Promising, but not ready yet" },
  { value: "pass", label: "Pass", copy: "Not a responsible fit" },
]

function money(value: number | null | undefined) {
  if (value == null) return null
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value)
}

function date(value: string | null | undefined) {
  if (!value) return null
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
}

function factLine(value: number | null | undefined, fact?: Fact) {
  const current = money(value)
  if (!current) return null
  const previous = money(fact?.previous)
  return previous ? `${current} · prior ${previous}` : current
}

export default function ProspectResearch({
  prospect,
  workflow,
  canWrite = true,
  onWorkflowChange,
  onActivityChange,
}: Props) {
  const [decision, setDecision] = useState<ScoutDecision>(workflow?.scout_decision ?? "undecided")
  const [priority, setPriority] = useState<number | null>(workflow?.scout_priority ?? null)
  const [reason, setReason] = useState(workflow?.decision_reason ?? "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setDecision(workflow?.scout_decision ?? "undecided")
    setPriority(workflow?.scout_priority ?? null)
    setReason(workflow?.decision_reason ?? "")
  }, [prospect.id, workflow])

  async function saveDecision() {
    if (decision === "undecided") {
      setError("Choose Scout, Watch or Pass.")
      return
    }
    if (!reason.trim()) {
      setError("Add one short reason for the decision.")
      return
    }
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      const row = await saveProspectResearch(prospect.id, {
        researchStatus: "reviewed",
        scoutDecision: decision,
        scoutPriority: decision === "priority" || decision === "watch" ? priority : null,
        decisionReason: reason.trim(),
      })
      onWorkflowChange?.(row)
      onActivityChange?.()
      setSaved(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the decision")
    } finally {
      setBusy(false)
    }
  }

  const facts = prospect.ch_financial_facts ?? {}
  const filingUrl = prospect.ch_filing_url || prospect.source_url
  const hasFiledFacts = [
    prospect.ch_turnover,
    prospect.ch_net_assets,
    prospect.ch_cash,
    prospect.ch_current_assets,
    prospect.ch_liabilities,
    prospect.ch_employees,
  ].some((value) => value != null)

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3]">Companies House · populated automatically</h3>
          {prospect.ch_data_updated_at && <span className="text-[10px] text-[#A3A3A3]">Checked {date(prospect.ch_data_updated_at)}</span>}
        </div>

        {!prospect.source_company_number ? (
          <div className="rounded-xl border border-dashed border-black/[0.12] px-4 py-5">
            <p className="text-sm font-medium text-[#525252]">No confident company match yet.</p>
            <p className="mt-1 text-xs text-[#8A8A8A]">The next Companies House enrichment run will try to match this record automatically.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-black/[0.08] bg-white">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/[0.06] px-4 py-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-[#0A0A0A]">{prospect.source_company_number}</strong>
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${prospect.ch_status === "active" ? "text-emerald-700" : "text-amber-700"}`}>{prospect.ch_status ?? "status unknown"}</span>
                  {prospect.ch_match_confidence && <span className="text-[10px] text-[#A3A3A3]">{prospect.ch_match_confidence} match</span>}
                </div>
                <p className="mt-1 text-xs text-[#737373]">Incorporated {date(prospect.ch_incorporated_date) ?? "date unavailable"}{prospect.source_sic_codes?.length ? ` · SIC ${prospect.source_sic_codes.join(", ")}` : ""}</p>
              </div>
              {prospect.source_url && <a href={prospect.source_url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-[#525252] underline decoration-black/20 underline-offset-4 hover:text-[#0A0A0A]">Company record ↗</a>}
            </div>

            <dl className="grid grid-cols-2 gap-px bg-black/[0.06] sm:grid-cols-4">
              <DataPoint label="Latest accounts" value={prospect.ch_accounts_type?.replace(/-/g, " ") ?? "Not filed"} detail={date(prospect.ch_accounts_period_end || prospect.ch_accounts_last_date)} />
              <DataPoint label="Accounts due" value={date(prospect.ch_accounts_due_date) ?? "Not available"} alert={prospect.ch_accounts_overdue === true} detail={prospect.ch_accounts_overdue ? "Overdue" : "Up to date"} />
              <DataPoint label="Confirmation due" value={date(prospect.ch_confirmation_due_date) ?? "Not available"} alert={prospect.ch_confirmation_overdue === true} detail={prospect.ch_confirmation_overdue ? "Overdue" : "Up to date"} />
              <DataPoint label="People" value={prospect.owner_name ?? "Not identified"} detail={prospect.owner_role ?? undefined} />
            </dl>
          </div>
        )}
      </section>

      {prospect.source_company_number && (
        <section>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3]">Latest filed accounts · extracted facts</h3>
            {filingUrl && <a href={filingUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-[#525252] underline decoration-black/20 underline-offset-4 hover:text-[#0A0A0A]">Open filing ↗</a>}
          </div>
          <div className="rounded-xl bg-[#F3F3F1] px-4 py-4">
            {hasFiledFacts ? (
              <dl className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
                <FiledFact label="Turnover" value={factLine(prospect.ch_turnover, facts.turnover)} unavailable="Not publicly disclosed" />
                <FiledFact label="Net assets" value={factLine(prospect.ch_net_assets, facts.net_assets)} />
                <FiledFact label="Current assets" value={factLine(prospect.ch_current_assets, facts.current_assets)} />
                <FiledFact label="Cash" value={factLine(prospect.ch_cash, facts.cash)} unavailable="Not separately disclosed" />
                <FiledFact label="Liabilities" value={factLine(prospect.ch_liabilities, facts.liabilities)} unavailable="Not separately disclosed" />
                <FiledFact label="Employees" value={prospect.ch_employees != null ? `${prospect.ch_employees}${facts.employees?.previous != null ? ` · prior ${facts.employees.previous}` : ""}` : null} unavailable="Not disclosed" />
              </dl>
            ) : (
              <p className="text-xs leading-relaxed text-[#737373]">The filing is known, but no supported machine-readable financial facts have been extracted yet. Nothing needs to be entered manually.</p>
            )}
            <p className="mt-4 border-t border-black/[0.07] pt-3 text-[11px] leading-relaxed text-[#8A8A8A]">Only figures explicitly present in the filing are shown. Micro-entity accounts commonly omit turnover and profit-and-loss information.</p>
          </div>
        </section>
      )}

      {prospect.source_company_number && (
        <FinancialReviews prospect={prospect} canWrite={canWrite} onActivityChange={onActivityChange} />
      )}

      <ProspectContacts prospect={prospect} canWrite={canWrite} onActivityChange={onActivityChange} />

      {(prospect.owner_name || prospect.owner_email || prospect.phone || prospect.associated_names?.length) && (
        <section>
          <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3]">Known people and contact routes</h3>
          <div className="rounded-xl border border-black/[0.08] bg-white px-4 py-3">
            <p className="text-sm font-semibold text-[#0A0A0A]">{prospect.owner_name ?? prospect.name}</p>
            {prospect.owner_role && <p className="mt-0.5 text-xs text-[#737373]">{prospect.owner_role} · Companies House</p>}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#737373]">
              {prospect.owner_email && <span>Owner email · enriched: {prospect.owner_email}</span>}
              {prospect.phone && <span>Business phone · Google Maps: {prospect.phone}</span>}
            </div>
            {prospect.associated_names?.length ? <p className="mt-2 text-[11px] text-[#8A8A8A]">Also listed: {prospect.associated_names.slice(0, 4).map((person) => person.name).join(", ")}</p> : null}
          </div>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3]">Your judgement</h3>
          {saved && <span className="text-[11px] font-medium text-emerald-700">Saved</span>}
        </div>
        <div className="rounded-xl border-2 border-[#0A0A0A] bg-white p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {DECISIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => { setDecision(item.value); setSaved(false) }}
                className={`rounded-lg border px-3 py-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 ${decision === item.value ? "border-[#0A0A0A] bg-[#0A0A0A] text-white" : "border-black/[0.1] hover:border-black/30"}`}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className={`mt-0.5 block text-[11px] ${decision === item.value ? "text-white/60" : "text-[#8A8A8A]"}`}>{item.copy}</span>
              </button>
            ))}
          </div>
          {(decision === "priority" || decision === "watch") && (
            <div className="mt-4">
              <span className="mb-1.5 block text-xs font-medium text-[#525252]">Priority <span className="text-[#A3A3A3] font-normal">(1 = low · 5 = urgent)</span></span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setPriority(priority === n ? null : n); setSaved(false) }}
                    className={`h-8 w-9 rounded-md border text-xs font-semibold tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 ${priority === n ? "border-[#0A0A0A] bg-[#0A0A0A] text-white" : "border-black/[0.1] text-[#525252] hover:border-black/30"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-medium text-[#525252]">Why?</span>
            <textarea value={reason} onChange={(event) => { setReason(event.target.value); setSaved(false) }} rows={3} placeholder="The one or two observations that make this worth pursuing—or not." className="w-full resize-none rounded-lg border border-black/[0.12] bg-white px-3 py-2.5 text-sm leading-relaxed text-[#0A0A0A] outline-none focus:border-black/40 focus:ring-2 focus:ring-black/[0.05]" />
          </label>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[11px] text-[#A3A3A3]">Everything above is evidence. This is the only judgement you need to add.</p>
            <button onClick={saveDecision} disabled={!canWrite || busy || decision === "undecided"} className="shrink-0 rounded-lg bg-[#0A0A0A] px-4 py-2.5 text-xs font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-[#2A2A2A] active:translate-y-px disabled:opacity-35">{busy ? "Saving…" : "Save decision"}</button>
          </div>
          {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        </div>
      </section>
    </div>
  )
}

function DataPoint({ label, value, detail, alert = false }: { label: string; value: string; detail?: string | null; alert?: boolean }) {
  return <div className="min-w-0 bg-white px-4 py-3"><dt className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#A3A3A3]">{label}</dt><dd className={`mt-1 truncate text-xs font-semibold capitalize ${alert ? "text-red-700" : "text-[#0A0A0A]"}`}>{value}</dd>{detail && <dd className={`mt-0.5 text-[10px] ${alert ? "font-semibold text-red-600" : "text-[#A3A3A3]"}`}>{detail}</dd>}</div>
}

function FiledFact({ label, value, unavailable = "Not disclosed" }: { label: string; value: string | null; unavailable?: string }) {
  return <div><dt className="text-[11px] text-[#8A8A8A]">{label}</dt><dd className={`mt-0.5 text-sm font-semibold ${value ? "text-[#0A0A0A]" : "font-normal text-[#B0B0B0]"}`}>{value ?? unavailable}</dd></div>
}

/* ----------------------------- Saved contacts ----------------------------- */

const VERIFICATION_LABEL: Record<ProspectContact["verification_status"], string> = {
  verified: "Verified",
  likely: "Likely",
  unverified: "Unverified",
  invalid: "Invalid",
}

const EMPTY_CONTACT = { name: "", role: "", email: "", phone: "", linkedin_url: "", source: "", verification_status: "unverified" as ProspectContact["verification_status"], is_primary: false }

function ProspectContacts({ prospect, canWrite, onActivityChange }: { prospect: ResearchProspect; canWrite: boolean; onActivityChange?: () => void }) {
  const [contacts, setContacts] = useState<ProspectContact[] | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProspectContact | null>(null)
  const [form, setForm] = useState(EMPTY_CONTACT)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchProspectContacts(prospect.id)
      .then((rows) => { if (!cancelled) setContacts(rows) })
      .catch(() => { if (!cancelled) setContacts([]) })
    return () => { cancelled = true }
  }, [prospect.id])

  function openNew() {
    setEditing(null)
    setForm(EMPTY_CONTACT)
    setFormOpen(true)
    setError(null)
  }

  function openEdit(c: ProspectContact) {
    setEditing(c)
    setForm({
      name: c.name, role: c.role ?? "", email: c.email ?? "", phone: c.phone ?? "",
      linkedin_url: c.linkedin_url ?? "", source: c.source ?? "",
      verification_status: c.verification_status, is_primary: c.is_primary,
    })
    setFormOpen(true)
    setError(null)
  }

  async function save() {
    if (!form.name.trim()) { setError("Name is required."); return }
    setBusy(true)
    setError(null)
    try {
      const saved = await saveProspectContact(prospect.id, {
        id: editing?.id ?? null,
        name: form.name.trim(),
        role: form.role.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        linkedin_url: form.linkedin_url.trim() || null,
        source: form.source.trim() || null,
        verification_status: form.verification_status,
        is_primary: form.is_primary,
      })
      setContacts((rows) => {
        const rest = (rows ?? []).filter((r) => r.id !== saved.id)
        return [...rest, saved].sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
      })
      setFormOpen(false)
      onActivityChange?.()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the contact")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3]">Saved contacts</h3>
        {canWrite && !formOpen && (
          <button type="button" onClick={openNew} className="text-[11px] font-semibold text-[#525252] underline decoration-black/20 underline-offset-4 hover:text-[#0A0A0A]">Add contact</button>
        )}
      </div>
      <div className="rounded-xl border border-black/[0.08] bg-white">
        {!contacts || contacts.length === 0 ? (
          <p className="px-4 py-4 text-xs text-[#8A8A8A]">{contacts === null ? "Loading…" : "No contacts saved yet. Add the person you would actually call or email."}</p>
        ) : (
          <ul className="divide-y divide-black/[0.05]">
            {contacts.map((c) => (
              <li key={c.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0A0A0A]">
                      {c.name}
                      {c.is_primary && <span className="ml-2 rounded bg-[#0A0A0A] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">Primary</span>}
                    </p>
                    {c.role && <p className="mt-0.5 text-xs text-[#737373]">{c.role}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    c.verification_status === "verified" ? "bg-emerald-50 text-emerald-700" :
                    c.verification_status === "likely" ? "bg-amber-50 text-amber-700" :
                    c.verification_status === "invalid" ? "bg-red-50 text-red-600" :
                    "bg-black/[0.04] text-[#737373]"
                  }`}>{VERIFICATION_LABEL[c.verification_status]}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#737373]">
                  {c.email && <a href={`mailto:${c.email}`} className="font-mono hover:text-[#0A0A0A]">{c.email}</a>}
                  {c.phone && <a href={`tel:${c.phone}`} className="font-mono hover:text-[#0A0A0A]">{c.phone}</a>}
                  {c.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#0A0A0A]">LinkedIn ↗</a>}
                  {c.source && <span className="text-[#A3A3A3]">via {c.source}</span>}
                  {canWrite && <button type="button" onClick={() => openEdit(c)} className="ml-auto text-[#A3A3A3] underline decoration-black/10 underline-offset-2 hover:text-[#0A0A0A]">Edit</button>}
                </div>
              </li>
            ))}
          </ul>
        )}

        {formOpen && (
          <div className="border-t border-black/[0.06] px-4 py-4">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name *" className="rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-sm text-[#0A0A0A] outline-none focus:border-black/40 placeholder:text-[#C4C4C4]" />
              <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role (e.g. Director)" className="rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-sm text-[#0A0A0A] outline-none focus:border-black/40 placeholder:text-[#C4C4C4]" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-sm text-[#0A0A0A] outline-none focus:border-black/40 placeholder:text-[#C4C4C4]" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-sm text-[#0A0A0A] outline-none focus:border-black/40 placeholder:text-[#C4C4C4]" />
              <input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="LinkedIn URL" className="rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-sm text-[#0A0A0A] outline-none focus:border-black/40 placeholder:text-[#C4C4C4]" />
              <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Source (e.g. Companies House)" className="rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-sm text-[#0A0A0A] outline-none focus:border-black/40 placeholder:text-[#C4C4C4]" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-[#525252]">
                <span className="text-[#8A8A8A]">Status</span>
                <select value={form.verification_status} onChange={(e) => setForm({ ...form, verification_status: e.target.value as ProspectContact["verification_status"] })} className="rounded-md border border-black/[0.12] bg-white px-2 py-1.5 text-xs text-[#0A0A0A] outline-none focus:border-black/40">
                  <option value="unverified">Unverified</option>
                  <option value="likely">Likely</option>
                  <option value="verified">Verified</option>
                  <option value="invalid">Invalid</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#525252]">
                <input type="checkbox" checked={form.is_primary} onChange={(e) => setForm({ ...form, is_primary: e.target.checked })} className="size-3.5 accent-[#0A0A0A]" />
                Primary contact
              </label>
              <div className="ml-auto flex items-center gap-2">
                <button type="button" onClick={() => setFormOpen(false)} className="text-xs text-[#A3A3A3] hover:text-[#525252]">Cancel</button>
                <button type="button" onClick={save} disabled={busy} className="rounded-lg bg-[#0A0A0A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2A2A2A] disabled:opacity-35">{busy ? "Saving…" : editing ? "Save changes" : "Save contact"}</button>
              </div>
            </div>
            {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------------------------- Filing reviews ----------------------------- */

const STRENGTH_LABEL: Record<ProspectFinancialReview["financial_strength"], string> = {
  strong: "Strong", adequate: "Adequate", weak: "Weak", unclear: "Unclear",
}
const TRAJECTORY_LABEL: Record<ProspectFinancialReview["trajectory"], string> = {
  improving: "Improving", stable: "Stable", declining: "Declining", unknown: "Unknown",
}

function FinancialReviews({ prospect, canWrite, onActivityChange }: { prospect: ResearchProspect; canWrite: boolean; onActivityChange?: () => void }) {
  const [reviews, setReviews] = useState<ProspectFinancialReview[] | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [strength, setStrength] = useState<ProspectFinancialReview["financial_strength"]>("unclear")
  const [trajectory, setTrajectory] = useState<ProspectFinancialReview["trajectory"]>("unknown")
  const [confidence, setConfidence] = useState<ProspectFinancialReview["confidence"]>("medium")
  const [summary, setSummary] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchFinancialReviews(prospect.id)
      .then((rows) => { if (!cancelled) setReviews(rows) })
      .catch(() => { if (!cancelled) setReviews([]) })
    return () => { cancelled = true }
  }, [prospect.id])

  async function save() {
    if (!summary.trim()) { setError("Add a short summary of what the filing shows."); return }
    setBusy(true)
    setError(null)
    try {
      const row = await logFinancialReview(prospect.id, {
        company_number: prospect.source_company_number ?? null,
        filing_date: prospect.ch_accounts_last_date ?? null,
        period_end: prospect.ch_accounts_period_end ?? null,
        accounts_type: prospect.ch_accounts_type ?? null,
        turnover: prospect.ch_turnover ?? null,
        net_assets: prospect.ch_net_assets ?? null,
        cash_or_reserves: prospect.ch_cash ?? null,
        liabilities: prospect.ch_liabilities ?? null,
        currency: "GBP",
        financial_strength: strength,
        trajectory,
        confidence,
        summary: summary.trim(),
        source_url: prospect.ch_filing_url || prospect.source_url || "",
      })
      setReviews((rows) => [row, ...(rows ?? [])])
      setFormOpen(false)
      setSummary("")
      onActivityChange?.()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the review")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3]">Filing reviews · your read of the accounts</h3>
        {canWrite && !formOpen && (
          <button type="button" onClick={() => setFormOpen(true)} className="text-[11px] font-semibold text-[#525252] underline decoration-black/20 underline-offset-4 hover:text-[#0A0A0A]">Log review</button>
        )}
      </div>
      <div className="rounded-xl border border-black/[0.08] bg-white">
        {!reviews || reviews.length === 0 ? (
          <p className="px-4 py-4 text-xs text-[#8A8A8A]">{reviews === null ? "Loading…" : "No filing reviews logged. After reading the accounts, record your read here so the next person doesn't repeat the work."}</p>
        ) : (
          <ul className="divide-y divide-black/[0.05]">
            {reviews.map((r) => (
              <li key={r.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${r.financial_strength === "strong" ? "bg-emerald-50 text-emerald-700" : r.financial_strength === "weak" ? "bg-red-50 text-red-600" : "bg-black/[0.04] text-[#525252]"}`}>{STRENGTH_LABEL[r.financial_strength]}</span>
                  <span className="text-[10px] text-[#8A8A8A]">{TRAJECTORY_LABEL[r.trajectory]} · {r.confidence} confidence</span>
                  <span className="ml-auto font-mono text-[10px] text-[#A3A3A3]">{date(r.created_at)}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[#525252]">{r.summary}</p>
                <p className="mt-1 font-mono text-[10px] text-[#A3A3A3]">
                  {r.period_end ? `Period ending ${date(r.period_end)}` : ""}{r.accounts_type ? ` · ${r.accounts_type.replace(/-/g, " ")}` : ""}
                  {r.source_url && <> · <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="underline decoration-black/20 underline-offset-2 hover:text-[#0A0A0A]">filing ↗</a></>}
                </p>
              </li>
            ))}
          </ul>
        )}

        {formOpen && (
          <div className="border-t border-black/[0.06] px-4 py-4">
            <div className="flex flex-wrap items-center gap-4">
              {([
                ["Strength", strength, setStrength, ["strong", "adequate", "weak", "unclear"]],
                ["Trajectory", trajectory, setTrajectory, ["improving", "stable", "declining", "unknown"]],
                ["Confidence", confidence, setConfidence, ["high", "medium", "low"]],
              ] as const).map(([label, value, setter, options]) => (
                <label key={label} className="flex items-center gap-2 text-xs text-[#525252]">
                  <span className="text-[#8A8A8A]">{label}</span>
                  <select value={value} onChange={(e) => setter(e.target.value as never)} className="rounded-md border border-black/[0.12] bg-white px-2 py-1.5 text-xs capitalize text-[#0A0A0A] outline-none focus:border-black/40">
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="What do the accounts actually show? e.g. steady micro-entity, ~£140k net assets, no red flags — or liabilities up 3 periods running." className="mt-3 w-full resize-none rounded-lg border border-black/[0.12] bg-white px-3 py-2.5 text-sm leading-relaxed text-[#0A0A0A] outline-none focus:border-black/40 placeholder:text-[#C4C4C4]" />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[11px] text-[#A3A3A3]">Figures attach automatically from the extracted filing above.</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setFormOpen(false)} className="text-xs text-[#A3A3A3] hover:text-[#525252]">Cancel</button>
                <button type="button" onClick={save} disabled={busy} className="rounded-lg bg-[#0A0A0A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2A2A2A] disabled:opacity-35">{busy ? "Saving…" : "Save review"}</button>
              </div>
            </div>
            {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          </div>
        )}
      </div>
    </section>
  )
}
