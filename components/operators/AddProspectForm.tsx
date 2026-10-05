"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { finderAction, saveProspectContact } from "@/lib/operatorDb"
import type { ProspectWorkflow } from "@/lib/finderModel"

// Shared "add a CRM record" form — creates a manual prospects row and optionally
// shortlists it to the pipeline, saves a named contact (prospect_contacts) and
// an opening note (prospect_activity). Used by Finder and PipelineBoard.
type FormState = {
  name: string
  website: string
  email: string
  phone: string
  category: string
  city: string
  postcode: string
  contactName: string
  contactRole: string
  note: string
  toPipeline: boolean
}

const EMPTY: FormState = {
  name: "", website: "", email: "", phone: "", category: "", city: "",
  postcode: "", contactName: "", contactRole: "", note: "", toPipeline: true,
}

export type AddedProspect = { id: number; place_id: string; name: string } & Record<string, unknown>

export default function AddProspectForm({
  onAdded,
  onClose,
}: {
  onAdded?: (prospect: AddedProspect, workflow: ProspectWorkflow | null) => void
  onClose?: () => void
}) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  async function save() {
    if (!form.name.trim()) { setError("Name is required."); return }
    setSaving(true)
    setError(null)
    try {
      const { data, error: insertError } = await supabase
        .from("prospects")
        .insert({
          place_id: `manual_${Date.now()}`,
          name: form.name.trim(),
          website: form.website.trim() || null,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          category: form.category.trim() || null,
          city: form.city.trim() || null,
          postcode: form.postcode.trim() || null,
          website_exists: !!form.website.trim(),
          email_exists: !!form.email.trim(),
          status: "prospect",
          crm_status: "new",
        })
        .select("*")
        .single()
      if (insertError) throw new Error(insertError.message)
      const record = data as AddedProspect

      let workflow: ProspectWorkflow | null = null
      const warnings: string[] = []

      if (form.toPipeline) {
        try {
          workflow = await finderAction(record.id, "shortlist")
        } catch (e) {
          warnings.push(`shortlist failed: ${e instanceof Error ? e.message : "unknown"}`)
        }
      }
      if (form.contactName.trim()) {
        try {
          await saveProspectContact(record.id, {
            id: null,
            name: form.contactName.trim(),
            role: form.contactRole.trim() || null,
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            linkedin_url: null,
            source: "manual entry",
            verification_status: "unverified",
            is_primary: true,
          })
        } catch (e) {
          warnings.push(`contact save failed: ${e instanceof Error ? e.message : "unknown"}`)
        }
      }
      if (form.note.trim()) {
        try {
          workflow = await finderAction(record.id, "note", { note: form.note.trim() })
        } catch (e) {
          warnings.push(`note failed: ${e instanceof Error ? e.message : "unknown"}`)
        }
      }

      onAdded?.(record, workflow)
      if (warnings.length) {
        setError(`Record added — ${warnings.join("; ")}`)
      } else {
        setForm(EMPTY)
        onClose?.()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add record. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-3">New CRM record</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Business name *" value={form.name} onChange={(v) => set("name", v)} onEnter={save} placeholder="Business name" />
        <Field label="Category" value={form.category} onChange={(v) => set("category", v)} onEnter={save} placeholder="e.g. Plumber" />
        <Field label="City" value={form.city} onChange={(v) => set("city", v)} onEnter={save} placeholder="e.g. Birmingham" />
        <Field label="Postcode" value={form.postcode} onChange={(v) => set("postcode", v)} onEnter={save} placeholder="e.g. B13 8AA" />
        <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} onEnter={save} placeholder="0121…" />
        <Field label="Email" value={form.email} onChange={(v) => set("email", v)} onEnter={save} placeholder="contact@…" />
        <Field label="Website" value={form.website} onChange={(v) => set("website", v)} onEnter={save} placeholder="https://…" className="col-span-2" />
        <Field label="Contact name" value={form.contactName} onChange={(v) => set("contactName", v)} onEnter={save} placeholder="Person you know there" />
        <Field label="Contact role" value={form.contactRole} onChange={(v) => set("contactRole", v)} onEnter={save} placeholder="e.g. Owner" />
        <div className="col-span-2 flex flex-col gap-1">
          <label className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#A3A3A3]">Opening note</label>
          <input
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="How you found them, context worth keeping…"
            className="w-full bg-white border border-black/[0.1] rounded-lg px-3 py-2 text-sm text-[#0A0A0A] placeholder:text-[#C4C4C4] focus:outline-none focus:ring-1 focus:ring-black/20"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-[#525252] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.toPipeline}
            onChange={(e) => set("toPipeline", e.target.checked)}
            className="size-3.5 accent-[#0A0A0A]"
          />
          Shortlist to pipeline
        </label>
        <div className="ml-auto flex items-center gap-2">
          {onClose && (
            <button type="button" onClick={onClose} className="px-3 py-2 text-[#A3A3A3] text-xs hover:text-[#525252] transition-colors">
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving || !form.name.trim()}
            className="px-4 py-2 bg-[#0A0A0A] text-white text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-[#1A1A1A] transition-colors"
          >
            {saving ? "Adding…" : "Add record"}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function Field({
  label, value, onChange, onEnter, placeholder, className = "",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onEnter?: () => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#A3A3A3]">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onEnter?.() }}
        placeholder={placeholder}
        className="bg-white border border-black/[0.1] rounded-lg px-3 py-2 text-sm text-[#0A0A0A] placeholder:text-[#C4C4C4] focus:outline-none focus:ring-1 focus:ring-black/20"
      />
    </div>
  )
}
