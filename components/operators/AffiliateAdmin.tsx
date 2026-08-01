"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Loader2, Users, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { OPERATOR_API_TOKEN } from "@/lib/operatorAuth"
import { BUSINESS_STAGE_META, PAYOUT_STATUS_META, REFERRAL_STATUS_META } from "@/lib/affiliateClient"
import type { AffiliateReferral, BusinessStage, ReferralStatus } from "@/lib/affiliateClient"
import { formatGbp } from "@/lib/affiliatePayouts"

type AffiliateRow = {
  id: string
  email: string
  display_name: string
  phone: string | null
  program: "referral" | "factory" | null
  status: "pending" | "active" | "suspended"
  created_at: string
  updated_at: string
  referrals_total: number
  referrals_purchased: number
  pending_payout_gbp: number
}

type ReferralRow = AffiliateReferral & {
  affiliates: { display_name: string; email: string } | null
}

type Tab = "affiliates" | "referrals" | "payouts"

const STATUS_OPTIONS: ReferralStatus[] = [
  "mockup_requested",
  "mockup_in_progress",
  "mockup_delivered",
  "client_reviewing",
  "approved_for_build",
  "build_in_progress",
  "built",
  "purchased",
  "lost",
  "cancelled",
]

export default function AffiliateAdmin() {
  const [tab, setTab] = useState<Tab>("affiliates")
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([])
  const [referrals, setReferrals] = useState<ReferralRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const loadAffiliates = useCallback(async () => {
    const { data, error } = await supabase.rpc("operator_get_affiliates", {
      p_operator_token: OPERATOR_API_TOKEN,
    })
    if (!error && data) {
      setAffiliates(data as AffiliateRow[])
    }
  }, [])

  const loadReferrals = useCallback(async () => {
    const { data, error } = await supabase.rpc("operator_get_referrals", {
      p_operator_token: OPERATOR_API_TOKEN,
    })
    if (!error && data) {
      setReferrals(data as unknown as ReferralRow[])
    }
  }, [])

  useEffect(() => {
    Promise.all([loadAffiliates(), loadReferrals()]).finally(() => setLoading(false))
  }, [loadAffiliates, loadReferrals])

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3500)
  }

  async function setAffiliateStatus(id: string, status: "active" | "suspended", declinedReason?: string) {
    setBusy(`aff:${id}`)
    await supabase.rpc("operator_set_affiliate_status", {
      p_operator_token: OPERATOR_API_TOKEN,
      p_affiliate_id: id,
      p_status: status,
      p_declined_reason: declinedReason ?? null,
    })
    await loadAffiliates()
    setBusy(null)
    showToast(status === "active" ? "Partner approved — they can now sign in." : "Partner suspended.")
  }

  async function setReferralStatus(id: number, status: ReferralStatus) {
    setBusy(`ref:${id}`)
    const { data } = await supabase.rpc("operator_set_referral_status", {
      p_operator_token: OPERATOR_API_TOKEN,
      p_referral_id: id,
      p_status: status,
    })
    const updated = (data as unknown as AffiliateReferral[] | null)?.[0]
    await loadReferrals()
    await loadAffiliates()
    setBusy(null)
    if (status === "purchased" && updated) {
      const amt = updated.payout_amount_gbp
      showToast(`Marked purchased — £${amt} payout notified to the partner.`)
    } else {
      showToast(`Referral moved to ${REFERRAL_STATUS_META[status].label}.`)
    }
  }

  const pendingAffiliates = affiliates.filter((a) => a.status === "pending")
  const payoutReferrals = referrals.filter((r) => r.payout_status === "due" || r.payout_status === "notified")

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-5 animate-spin text-[#A3A3A3]" />
      </div>
    )
  }

  return (
    <div className="px-6 py-6 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight">Sorted Partners Portal</h1>
          <p className="text-sm text-[#737373] mt-1">Approve partners and advance referrals through to payout.</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Pill label={`${pendingAffiliates.length} pending approval`} tone={pendingAffiliates.length > 0 ? "yellow" : "muted"} />
          <Pill label={`${payoutReferrals.length} payouts due`} tone={payoutReferrals.length > 0 ? "green" : "muted"} />
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="mt-6 flex items-center gap-1 border-b border-black/[0.06]">
        <SubTab active={tab === "affiliates"} onClick={() => setTab("affiliates")}>Partners ({affiliates.length})</SubTab>
        <SubTab active={tab === "referrals"} onClick={() => setTab("referrals")}>Referrals ({referrals.length})</SubTab>
        <SubTab active={tab === "payouts"} onClick={() => setTab("payouts")}>Payouts ({payoutReferrals.length})</SubTab>
      </div>

      <div className="mt-6">
        {tab === "affiliates" ? (
          <div className="grid gap-3">
            {affiliates.length === 0 ? (
              <Empty text="No partner applications yet. The apply form is at /partners/apply." />
            ) : (
              affiliates.map((a) => (
                <div key={a.id} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl border border-black/[0.08] bg-white px-5 py-4">
                  <div className="grid gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-sans font-bold text-[#0A0A0A] text-sm">{a.display_name}</span>
                      <StatusPill status={a.status} />
                    </div>
                    <p className="text-xs text-[#737373]">{a.email}{a.phone ? ` · ${a.phone}` : ""}</p>
                    <p className="text-xs text-[#A3A3A3]">
                      {a.program ? <span className="uppercase tracking-wide">{a.program}</span> : "No program"}
                      {" · "}{a.referrals_total} referral{a.referrals_total === 1 ? "" : "s"} · {a.referrals_purchased} purchased
                      {a.pending_payout_gbp > 0 ? ` · ${formatGbp(a.pending_payout_gbp)} pending payout` : ""}
                      {" · joined "}{new Date(a.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.status === "pending" ? (
                      <>
                        <button
                          onClick={() => setAffiliateStatus(a.id, "active")}
                          disabled={busy === `aff:${a.id}`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#0A0A0A] text-white text-xs font-medium px-3 py-1.5 disabled:opacity-40"
                        >
                          <Check className="size-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => setAffiliateStatus(a.id, "suspended", "Application declined")}
                          disabled={busy === `aff:${a.id}`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-black/[0.12] text-[#525252] text-xs font-medium px-3 py-1.5 disabled:opacity-40"
                        >
                          <X className="size-3.5" /> Decline
                        </button>
                      </>
                    ) : a.status === "active" ? (
                      <button
                        onClick={() => setAffiliateStatus(a.id, "suspended", "Suspended by operator")}
                        disabled={busy === `aff:${a.id}`}
                        className="rounded-md border border-black/[0.12] text-[#525252] text-xs font-medium px-3 py-1.5 disabled:opacity-40"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => setAffiliateStatus(a.id, "active")}
                        disabled={busy === `aff:${a.id}`}
                        className="rounded-md bg-[#0A0A0A] text-white text-xs font-medium px-3 py-1.5 disabled:opacity-40"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}

        {tab === "referrals" ? (
          <div className="grid gap-3">
            {referrals.length === 0 ? (
              <Empty text="No partner referrals yet." />
            ) : (
              referrals.map((r) => (
                <div key={r.id} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl border border-black/[0.08] bg-white px-5 py-4">
                  <div className="grid gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-sans font-bold text-[#0A0A0A] text-sm">{r.business_name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#A3A3A3]">
                        {BUSINESS_STAGE_META[r.business_stage as BusinessStage]?.label ?? r.business_stage}
                      </span>
                    </div>
                    <p className="text-xs text-[#737373]">
                      Referred by <span className="font-semibold text-[#525252]">{r.affiliates?.display_name ?? "—"}</span>
                      {r.business_email ? ` · ${r.business_email}` : ""}
                    </p>
                    {r.payout_status !== "none" && r.payout_amount_gbp > 0 ? (
                      <p className="text-xs">
                        <span className="font-bold text-[#0A0A0A]">Payout {formatGbp(r.payout_amount_gbp)}</span>{" "}
                        <span className="text-[#A3A3A3]">· {PAYOUT_STATUS_META[r.payout_status].label}</span>
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={r.status}
                      onChange={(e) => setReferralStatus(r.id, e.target.value as ReferralStatus)}
                      disabled={busy === `ref:${r.id}`}
                      className="rounded-md border border-black/[0.12] bg-white text-xs font-medium px-2.5 py-1.5 text-[#0A0A0A] disabled:opacity-40"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{REFERRAL_STATUS_META[s].label}</option>
                      ))}
                    </select>
                    {busy === `ref:${r.id}` ? <Loader2 className="size-4 animate-spin text-[#A3A3A3]" /> : null}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}

        {tab === "payouts" ? (
          <div className="grid gap-3">
            {payoutReferrals.length === 0 ? (
              <Empty text="No payouts due right now. Payouts appear here when a referral is marked purchased." />
            ) : (
              payoutReferrals.map((r) => (
                <div key={r.id} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl border border-black/[0.08] bg-white px-5 py-4">
                  <div className="grid gap-1">
                    <span className="font-sans font-bold text-[#0A0A0A] text-sm">{r.business_name}</span>
                    <p className="text-xs text-[#737373]">
                      Partner: <span className="font-semibold text-[#525252]">{r.affiliates?.display_name ?? "—"}</span> ({r.affiliates?.email ?? ""})
                    </p>
                    <p className="text-xs text-[#A3A3A3]">
                      {PAYOUT_STATUS_META[r.payout_status].label}
                      {r.payout_notified_at ? ` · notified ${new Date(r.payout_notified_at).toLocaleDateString("en-GB")}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#0A0A0A]">{formatGbp(r.payout_amount_gbp)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#A3A3A3]">Bank transfer pending</p>
                  </div>
                </div>
              ))
            )}
            <p className="mt-2 text-xs text-[#A3A3A3]">
              Bank transfers are executed out-of-band. Mark a payout as paid in Supabase once the transfer is confirmed (set <code className="bg-black/5 px-1 rounded">payout_status = 'paid'</code> and <code className="bg-black/5 px-1 rounded">payout_paid_at</code>).
            </p>
          </div>
        ) : null}
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#0A0A0A] text-white text-xs font-medium px-4 py-2.5 shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  )
}

function SubTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-medium px-3 py-2 border-b-2 -mb-px transition-colors ${
        active ? "border-[#0A0A0A] text-[#0A0A0A]" : "border-transparent text-[#737373] hover:text-[#0A0A0A]"
      }`}
    >
      {children}
    </button>
  )
}

function StatusPill({ status }: { status: "pending" | "active" | "suspended" }) {
  const cls =
    status === "active"
      ? "bg-[#dfff00] text-black"
      : status === "pending"
      ? "bg-[#fff3d6] text-black"
      : "bg-black/[0.06] text-[#737373]"
  return <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${cls}`}>{status}</span>
}

function Pill({ label, tone }: { label: string; tone: "yellow" | "green" | "muted" }) {
  const cls =
    tone === "yellow"
      ? "bg-[#fff3d6] text-black"
      : tone === "green"
      ? "bg-[#dfff00] text-black"
      : "bg-black/[0.05] text-[#737373]"
  return <span className={`px-2.5 py-1 rounded-full font-medium ${cls}`}>{label}</span>
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-black/[0.12] bg-white py-12 text-center">
      <Users className="mx-auto size-6 text-[#A3A3A3]" />
      <p className="mt-3 text-sm text-[#737373]">{text}</p>
    </div>
  )
}
