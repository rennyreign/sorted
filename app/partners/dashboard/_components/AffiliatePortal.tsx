"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  BadgePoundSterling,
  BookOpen,
  Check,
  Clock3,
  ExternalLink,
  FolderOpen,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  Plus,
  User as UserIcon,
  Wallet,
} from "lucide-react"
import { affMarker, affHighlight } from "../../_components/AffiliatesPrimitives"
import { affiliateDb, EMPTY_STATS, type DashboardStats, type Affiliate, type AffiliateReferral } from "@/lib/affiliateClient"
import {
  BUSINESS_STAGE_META,
  PAYOUT_STATUS_META,
  REFERRAL_STATUS_META,
} from "@/lib/affiliateClient"
import { formatGbp } from "@/lib/affiliatePayouts"
import { getCurrentAffiliate, signOutAffiliate } from "@/lib/affiliateAuth"
import { NotificationsBell } from "./NotificationsBell"
import { ReferralForm } from "./ReferralForm"
import { LearningCentre, ResourcesPage, LearningProgressWidget, useModuleProgress, CertifiedBadge } from "./LearningCentre"

type View = "overview" | "referrals" | "new" | "referral" | "payouts" | "learning" | "resources" | "profile"

export default function AffiliatePortal() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null)
  const [view, setView] = useState<View>("overview")
  const [activeReferralId, setActiveReferralId] = useState<number | null>(null)
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([])
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [toast, setToast] = useState<string | null>(null)

  // Auth gate + initial load
  useEffect(() => {
    setMounted(true)
    ;(async () => {
      const aff = await getCurrentAffiliate()
      if (!aff) {
        window.location.href = "/affiliates/login"
        return
      }
      if (aff.status !== "active") {
        window.location.href = "/affiliates/login"
        return
      }
      setAffiliate(aff)
      setLoading(false)
    })()
  }, [])

  const loadReferrals = useCallback(async () => {
    if (!affiliate) return
    const { data } = await affiliateDb
      .from("affiliate_referrals")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false })
    if (data) setReferrals(data as AffiliateReferral[])
  }, [affiliate])

  const loadStats = useCallback(async () => {
    if (!affiliate) return
    const { data } = await affiliateDb.rpc("affiliate_dashboard_stats", { p_affiliate_id: affiliate.id })
    if (data) setStats(data as DashboardStats)
  }, [affiliate])

  useEffect(() => {
    if (!affiliate) return
    loadReferrals()
    loadStats()
  }, [affiliate, loadReferrals, loadStats])

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 4000)
  }

  if (!mounted || loading) {
    return (
      <main className="min-h-screen bg-[#fbfbfa] text-[#070707]">
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-7 animate-spin text-[#bdd900]" strokeWidth={3} />
        </div>
      </main>
    )
  }

  if (!affiliate) return null

  async function handleSignOut() {
    await signOutAffiliate()
    window.location.href = "/affiliates"
  }

  function openReferral(id: number) {
    setActiveReferralId(id)
    setView("referral")
  }

  function navigate(v: View) {
    if (v !== "referral") setActiveReferralId(null)
    setView(v)
  }

  const activeReferral = activeReferralId ? referrals.find((r) => r.id === activeReferralId) ?? null : null

  return (
    <main
      className={`${affMarker.variable} ${affHighlight.variable} min-h-screen bg-[#fbfbfa] text-[#070707]`}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-black/8 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1220px] items-center justify-between px-5 sm:px-8">
          <a href="/affiliates/dashboard" className="flex items-center gap-3" onClick={(e) => { e.preventDefault(); navigate("overview") }}>
            <span className="text-[28px] font-black leading-none tracking-[-0.045em] text-[#070707]">
              Sorted<span className="text-[#cfe900]">.</span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-black/45">Partner</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            <NavTab icon={LayoutDashboard} active={view === "overview"} onClick={() => navigate("overview")}>Overview</NavTab>
            <NavTab icon={ListChecks} active={view === "referrals"} onClick={() => navigate("referrals")}>Referrals</NavTab>
            <NavTab icon={Wallet} active={view === "payouts"} onClick={() => navigate("payouts")}>Payouts</NavTab>
            <NavTab icon={BookOpen} active={view === "learning"} onClick={() => navigate("learning")}>Learning</NavTab>
            <NavTab icon={FolderOpen} active={view === "resources"} onClick={() => navigate("resources")}>Resources</NavTab>
            <NavTab icon={UserIcon} active={view === "profile"} onClick={() => navigate("profile")}>Profile</NavTab>
          </nav>

          <div className="flex items-center gap-3">
            <NotificationsBell affiliateId={affiliate.id} />
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden h-10 items-center gap-2 rounded-full border border-black/10 px-4 text-[11px] font-black text-black/65 hover:border-black/30 hover:text-black sm:inline-flex"
            >
              <LogOut className="size-4" strokeWidth={2.4} /> Sign out
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex items-center gap-1 overflow-x-auto px-5 pb-2 md:hidden">
          <NavTab icon={LayoutDashboard} active={view === "overview"} onClick={() => navigate("overview")}>Overview</NavTab>
          <NavTab icon={ListChecks} active={view === "referrals"} onClick={() => navigate("referrals")}>Referrals</NavTab>
          <NavTab icon={Wallet} active={view === "payouts"} onClick={() => navigate("payouts")}>Payouts</NavTab>
          <NavTab icon={BookOpen} active={view === "learning"} onClick={() => navigate("learning")}>Learning</NavTab>
          <NavTab icon={FolderOpen} active={view === "resources"} onClick={() => navigate("resources")}>Resources</NavTab>
          <NavTab icon={UserIcon} active={view === "profile"} onClick={() => navigate("profile")}>Profile</NavTab>
        </div>
      </header>

      <div className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        {view === "overview" ? (
          <Overview affiliate={affiliate} stats={stats} referrals={referrals} onNew={() => navigate("new")} onOpenReferral={openReferral} onSeeAll={() => navigate("referrals")} onGoToLearning={() => navigate("learning")} />
        ) : null}

        {view === "referrals" ? (
          <ReferralsList referrals={referrals} onNew={() => navigate("new")} onOpenReferral={openReferral} />
        ) : null}

        {view === "new" ? (
          <div>
            <BackLink onClick={() => navigate("referrals")} label="Back to referrals" />
            <ReferralForm
              affiliateId={affiliate.id}
              onCancel={() => navigate("referrals")}
              onDone={(id) => {
                loadReferrals()
                loadStats()
                showToast("Mockup request submitted. We'll be in touch with the business shortly.")
                setActiveReferralId(id)
                setView("referral")
              }}
            />
          </div>
        ) : null}

        {view === "referral" && activeReferral ? (
          <ReferralDetail referral={activeReferral} onBack={() => navigate("referrals")} />
        ) : null}

        {view === "referral" && !activeReferral ? (
          <div className="py-16 text-center">
            <p className="text-[14px] font-semibold text-black/55">Referral not found.</p>
            <button onClick={() => navigate("referrals")} className="mt-4 text-[12px] font-black underline">Back to referrals</button>
          </div>
        ) : null}

        {view === "payouts" ? (
          <Payouts referrals={referrals} />
        ) : null}

        {view === "learning" ? (
          <LearningCentre />
        ) : null}

        {view === "resources" ? (
          <ResourcesPage />
        ) : null}

        {view === "profile" ? (
          <Profile affiliate={affiliate} onUpdated={(a) => { setAffiliate(a); showToast("Profile updated.") }} />
        ) : null}
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#070707] px-5 py-3 text-[12px] font-black text-white shadow-[0_18px_36px_rgba(0,0,0,0.3)]">
          <span className="flex items-center gap-2"><Check className="size-4 text-[#dfff00]" strokeWidth={3} /> {toast}</span>
        </div>
      ) : null}
    </main>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function NavTab({
  icon: Icon,
  active,
  onClick,
  children,
}: {
  icon: typeof LayoutDashboard
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[12px] font-black transition-colors ${
        active ? "bg-[#070707] text-white" : "text-black/65 hover:bg-black/5 hover:text-black"
      }`}
    >
      <Icon className="size-4" strokeWidth={2.4} />
      {children}
    </button>
  )
}

function BackLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="mb-5 inline-flex h-10 items-center gap-2 rounded-full border border-black/15 px-4 text-[12px] font-black">
      <ArrowLeft className="size-4" strokeWidth={2.5} /> {label}
    </button>
  )
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function Overview({
  affiliate,
  stats,
  referrals,
  onNew,
  onOpenReferral,
  onSeeAll,
  onGoToLearning,
}: {
  affiliate: Affiliate
  stats: DashboardStats
  referrals: AffiliateReferral[]
  onNew: () => void
  onOpenReferral: (id: number) => void
  onSeeAll: () => void
  onGoToLearning: () => void
}) {
  const recent = referrals.slice(0, 4)
  return (
    <div className="grid gap-8">
      <section className="grid gap-6 rounded-[18px] bg-[#070707] p-7 text-white sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.1em] text-white/55">Welcome back</p>
            <h1 className="mt-2 flex flex-wrap items-center gap-3 text-[clamp(2rem,4vw,3.2rem)] font-black leading-[0.95] tracking-[-0.04em]">{affiliate.display_name} <CertifiedBadge /></h1>
          </div>
          <button
            type="button"
            onClick={onNew}
            className="inline-flex h-[52px] items-center gap-3 rounded-full bg-[#dfff00] px-7 text-[12px] font-black text-black shadow-[0_16px_32px_rgba(190,210,0,0.22)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <Plus className="size-4" strokeWidth={3} /> New mockup request
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DarkStat label="Total referrals" value={String(stats.total_referrals)} icon={ListChecks} />
          <DarkStat label="Closed deals" value={String(stats.purchased_count)} icon={Check} />
          <DarkStat label="Total earned" value={formatGbp(stats.total_earned_gbp)} icon={BadgePoundSterling} highlight />
          <DarkStat label="Pending payout" value={formatGbp(stats.pending_payout_gbp)} icon={Clock3} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[18px] border border-black/10 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[18px] font-black tracking-[-0.03em]">Recent referrals</h2>
            {referrals.length > 0 ? (
              <button onClick={onSeeAll} className="text-[12px] font-black text-black/55 hover:text-black">See all →</button>
            ) : null}
          </div>
          {recent.length === 0 ? (
            <EmptyState
              title="No referrals yet"
              copy="Submit your first mockup request to start earning."
              cta="New mockup request"
              onCta={onNew}
            />
          ) : (
            <ul className="grid gap-2">
              {recent.map((r) => (
                <ReferralRow key={r.id} referral={r} onClick={() => onOpenReferral(r.id)} />
              ))}
            </ul>
          )}
        </div>

        <div className="grid gap-6">
          <div className="rounded-[18px] border border-black/10 bg-[#f7f1e8] p-6">
            <h2 className="text-[18px] font-black tracking-[-0.03em]">What you earn per close</h2>
            <ul className="mt-5 grid gap-3">
              {(["new", "growing", "established"] as const).map((s) => {
                const meta = BUSINESS_STAGE_META[s]
                return (
                  <li key={s} className="flex items-center justify-between rounded-[12px] bg-white px-4 py-3">
                    <div>
                      <p className="text-[14px] font-black">{meta.label}</p>
                      <p className="text-[11px] font-semibold text-black/55">{meta.description}</p>
                    </div>
                    <p className="text-[20px] font-black tracking-[-0.04em]">{formatGbp(meta.payoutGbp)}</p>
                  </li>
                )
              })}
            </ul>
            <p className="mt-5 text-[12px] font-semibold leading-[1.5] text-black/55">
              Payouts are made by bank transfer when a referred client purchases a Sorted website. You'll get an email and a portal notification the moment a payout is due.
            </p>
          </div>
          <LearningProgressWidget onContinue={onGoToLearning} />
        </div>
      </section>
    </div>
  )
}

function DarkStat({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string
  value: string
  icon: typeof ListChecks
  highlight?: boolean
}) {
  return (
    <div className={`rounded-[14px] p-5 ${highlight ? "bg-[#dfff00] text-black" : "bg-white/[0.06] text-white ring-1 ring-white/10"}`}>
      <Icon className="size-6" strokeWidth={2.2} />
      <p className="mt-4 text-[28px] font-black tracking-[-0.04em]">{value}</p>
      <p className="text-[11px] font-black uppercase tracking-[0.08em] opacity-70">{label}</p>
    </div>
  )
}

// ─── Referrals list ───────────────────────────────────────────────────────────

function ReferralsList({
  referrals,
  onNew,
  onOpenReferral,
}: {
  referrals: AffiliateReferral[]
  onNew: () => void
  onOpenReferral: (id: number) => void
}) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[0.95] tracking-[-0.04em]">Your referrals</h1>
          <p className="mt-2 text-[14px] font-semibold text-black/55">Every business you've referred, from request to payout.</p>
        </div>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex h-12 items-center gap-3 rounded-full bg-[#070707] px-6 text-[12px] font-black text-white transition-transform duration-200 hover:-translate-y-0.5"
        >
          <Plus className="size-4" strokeWidth={3} /> New mockup request
        </button>
      </div>

      {referrals.length === 0 ? (
        <div className="rounded-[18px] border border-black/10 bg-white p-10">
          <EmptyState
            title="No referrals yet"
            copy="Submit your first mockup request to start tracking a business through to payout."
            cta="New mockup request"
            onCta={onNew}
          />
        </div>
      ) : (
        <ul className="grid gap-2">
          {referrals.map((r) => (
            <ReferralRow key={r.id} referral={r} onClick={() => onOpenReferral(r.id)} />
          ))}
        </ul>
      )}
    </div>
  )
}

function ReferralRow({ referral, onClick }: { referral: AffiliateReferral; onClick: () => void }) {
  const status = REFERRAL_STATUS_META[referral.status]
  const stage = BUSINESS_STAGE_META[referral.business_stage]
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-[14px] border border-black/10 bg-white px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-black/30"
      >
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[15px] font-black tracking-[-0.02em]">{referral.business_name}</span>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.04em] ${status.badge}`}>
              {status.label}
            </span>
          </div>
          <p className="text-[12px] font-semibold text-black/55">
            {stage.label} · {formatDate(referral.created_at)}
            {referral.payout_status !== "none" && referral.payout_amount_gbp > 0 ? (
              <> · <span className="font-black text-black">Payout {formatGbp(referral.payout_amount_gbp)}</span></>
            ) : null}
          </p>
        </div>
        <ArrowRight className="size-5 text-black/40" strokeWidth={2.4} />
      </button>
    </li>
  )
}

// ─── Referral detail ──────────────────────────────────────────────────────────

function ReferralDetail({ referral, onBack }: { referral: AffiliateReferral; onBack: () => void }) {
  const status = REFERRAL_STATUS_META[referral.status]
  const stage = BUSINESS_STAGE_META[referral.business_stage]
  const payout = PAYOUT_STATUS_META[referral.payout_status]
  const brief = referral.mockup_brief ?? {}

  return (
    <div className="grid gap-6">
      <BackLink onClick={onBack} label="Back to referrals" />

      <div className="grid gap-6 rounded-[18px] border border-black/10 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.1em] text-black/45">Referral #{referral.id}</p>
            <h1 className="mt-2 text-[clamp(1.8rem,3.6vw,2.8rem)] font-black leading-[0.95] tracking-[-0.04em]">{referral.business_name}</h1>
            <p className="mt-2 text-[14px] font-semibold text-black/55">Submitted {formatDate(referral.created_at)}</p>
          </div>
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.04em] ${status.badge}`}>
            {status.label}
          </span>
        </div>

        <p className="max-w-[640px] text-[15px] font-semibold leading-[1.5] text-black/72">{status.description}</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailTile label="Business stage" value={stage.label} sub={stage.description} />
          <DetailTile label="Projected payout" value={formatGbp(stage.payoutGbp)} sub="Paid when the client purchases" />
          <DetailTile
            label="Payout status"
            value={payout.label}
            sub={referral.payout_notified_at ? `Notified ${formatDate(referral.payout_notified_at)}` : "—"}
            badgeClass={payout.badge}
          />
          <DetailTile
            label="Purchased"
            value={referral.purchased_at ? formatDate(referral.purchased_at) : "—"}
            sub={referral.purchased_at ? "Client has paid" : "Awaiting client decision"}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[18px] border border-black/10 bg-white p-6">
          <h2 className="text-[16px] font-black tracking-[-0.03em]">Business details</h2>
          <dl className="mt-4 grid gap-3 text-[13px]">
            <DetailRow label="Contact" value={referral.business_contact_name ?? "—"} />
            <DetailRow label="Email" value={referral.business_email ?? "—"} />
            <DetailRow label="Phone" value={referral.business_phone ?? "—"} />
            <DetailRow
              label="Website"
              value={
                referral.current_website ? (
                  <a href={referral.current_website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-black text-black underline">
                    {referral.current_website.replace(/^https?:\/\//, "")} <ExternalLink className="size-3" />
                  </a>
                ) : "—"
              }
            />
            {referral.mockup_url ? (
              <DetailRow
                label="Mockup"
                value={
                  <a href={referral.mockup_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-black text-black underline">
                    View mockup <ExternalLink className="size-3" />
                  </a>
                }
              />
            ) : null}
          </dl>
        </div>

        <div className="rounded-[18px] border border-black/10 bg-[#f7f1e8] p-6">
          <h2 className="text-[16px] font-black tracking-[-0.03em]">Mockup brief</h2>
          <dl className="mt-4 grid gap-3 text-[13px]">
            <DetailRow label="Business type" value={brief.business ?? "—"} />
            <DetailRow label="Current site" value={brief.currentSite ?? "—"} />
            <DetailRow label="Goal" value={brief.goal ?? "—"} />
            <DetailRow label="Style" value={brief.style ?? "—"} />
            <DetailRow label="Timeline" value={brief.timeline ?? "—"} />
          </dl>
          {referral.notes ? (
            <div className="mt-5 rounded-[12px] bg-white p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.08em] text-black/45">Notes from Sorted</p>
              <p className="mt-2 text-[13px] font-semibold leading-[1.5] text-black/72">{referral.notes}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Pipeline tracker */}
      <div className="rounded-[18px] border border-black/10 bg-white p-6 sm:p-8">
        <h2 className="text-[16px] font-black tracking-[-0.03em]">Pipeline</h2>
        <p className="mt-1 text-[13px] font-semibold text-black/55">We'll move your referral along as it progresses. You'll get a notification at each step.</p>
        <PipelineTracker current={referral.status} />
      </div>
    </div>
  )
}

function DetailTile({ label, value, sub, badgeClass }: { label: string; value: string; sub?: string; badgeClass?: string }) {
  return (
    <div className="rounded-[12px] border border-black/10 bg-[#fbfbfa] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.08em] text-black/45">{label}</p>
      <p className={`mt-2 text-[16px] font-black tracking-[-0.02em] ${badgeClass ? `inline-flex rounded-full border px-2.5 py-0.5 text-[12px] ${badgeClass}` : ""}`}>
        {value}
      </p>
      {sub ? <p className="mt-1 text-[11px] font-semibold text-black/55">{sub}</p> : null}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-black/5 pb-2 last:border-b-0">
      <dt className="text-[11px] font-black uppercase tracking-[0.06em] text-black/45">{label}</dt>
      <dd className="font-semibold text-black/82">{value}</dd>
    </div>
  )
}

function PipelineTracker({ current }: { current: AffiliateReferral["status"] }) {
  const order: AffiliateReferral["status"][] = [
    "mockup_requested",
    "mockup_in_progress",
    "mockup_delivered",
    "client_reviewing",
    "approved_for_build",
    "build_in_progress",
    "built",
    "purchased",
  ]
  const currentOrder = REFERRAL_STATUS_META[current].order
  return (
    <ol className="mt-5 grid gap-2 sm:grid-cols-4 lg:grid-cols-8">
      {order.map((s) => {
        const meta = REFERRAL_STATUS_META[s]
        const done = meta.order < currentOrder
        const activeNow = s === current
        const isLost = current === "lost" || current === "cancelled"
        return (
          <li
            key={s}
            className={`rounded-[10px] border p-3 text-[11px] font-black leading-tight ${
              activeNow
                ? "border-black bg-[#dfff00]"
                : done && !isLost
                ? "border-black/10 bg-[#070707] text-white"
                : "border-black/10 bg-white text-black/45"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {done && !activeNow && !isLost ? <Check className="size-3" strokeWidth={3} /> : null}
              {meta.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

// ─── Payouts ──────────────────────────────────────────────────────────────────

function Payouts({ referrals }: { referrals: AffiliateReferral[] }) {
  const payoutReferrals = referrals.filter((r) => r.payout_status !== "none")
  const due = payoutReferrals.filter((r) => r.payout_status === "due" || r.payout_status === "notified")
  const paid = payoutReferrals.filter((r) => r.payout_status === "paid")
  const dueTotal = due.reduce((sum, r) => sum + r.payout_amount_gbp, 0)
  const paidTotal = paid.reduce((sum, r) => sum + r.payout_amount_gbp, 0)

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[0.95] tracking-[-0.04em]">Payouts</h1>
        <p className="mt-2 text-[14px] font-semibold text-black/55">Tracked up to the point of bank transfer. You'll be emailed the moment a payout is due.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[18px] bg-[#dfff00] p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-black/55">Pending payout</p>
          <p className="mt-3 text-[44px] font-black tracking-[-0.05em]">{formatGbp(dueTotal)}</p>
          <p className="mt-2 text-[13px] font-semibold text-black/65">{due.length} payout{due.length === 1 ? "" : "s"} awaiting bank transfer</p>
        </div>
        <div className="rounded-[18px] bg-[#070707] p-6 text-white">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/55">Paid out</p>
          <p className="mt-3 text-[44px] font-black tracking-[-0.05em]">{formatGbp(paidTotal)}</p>
          <p className="mt-2 text-[13px] font-semibold text-white/65">{paid.length} payout{paid.length === 1 ? "" : "s"} completed</p>
        </div>
      </div>

      <div className="rounded-[18px] border border-black/10 bg-white p-6">
        <h2 className="text-[16px] font-black tracking-[-0.03em]">Payout history</h2>
        {payoutReferrals.length === 0 ? (
          <p className="mt-4 text-[14px] font-semibold text-black/55">No payouts yet. Payouts appear here the moment a referred client purchases.</p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {payoutReferrals.map((r) => {
              const p = PAYOUT_STATUS_META[r.payout_status]
              return (
                <li key={r.id} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-[12px] border border-black/8 px-4 py-3">
                  <div>
                    <p className="text-[14px] font-black">{r.business_name}</p>
                    <p className="text-[12px] font-semibold text-black/55">
                      {r.payout_status === "paid" && r.payout_paid_at ? `Paid ${formatDate(r.payout_paid_at)}` : r.payout_status === "notified" && r.payout_notified_at ? `Notified ${formatDate(r.payout_notified_at)}` : "Due for bank transfer"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[18px] font-black tracking-[-0.03em]">{formatGbp(r.payout_amount_gbp)}</span>
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${p.badge}`}>{p.label}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

// ─── Profile ──────────────────────────────────────────────────────────────────

function Profile({ affiliate, onUpdated }: { affiliate: Affiliate; onUpdated: (a: Affiliate) => void }) {
  const [displayName, setDisplayName] = useState(affiliate.display_name)
  const [phone, setPhone] = useState(affiliate.phone ?? "")
  const [bankRef, setBankRef] = useState(affiliate.bank_account_ref ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const { data, error: dbError } = await affiliateDb
      .from("affiliates")
      .update({
        display_name: displayName.trim() || affiliate.display_name,
        phone: phone.trim() || null,
        bank_account_ref: bankRef.trim() || null,
      })
      .eq("id", affiliate.id)
      .select("*")
      .single()

    setSaving(false)
    if (dbError || !data) {
      setError(dbError?.message ?? "Could not save. Please try again.")
      return
    }
    onUpdated(data as Affiliate)
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[0.95] tracking-[-0.04em]">Profile</h1>
        <p className="mt-2 text-[14px] font-semibold text-black/55">How we'll contact you and where we'll send payouts.</p>
      </div>

      <form onSubmit={save} className="grid gap-6 rounded-[18px] border border-black/10 bg-white p-6 sm:p-8 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-4">
          <Field label="Display name">
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Email" hint="Email is locked from your sign-up. Contact Sorted to change it.">
            <input value={affiliate.email} disabled className={`${inputClass} bg-black/5 text-black/55`} />
          </Field>
          <Field label="Phone">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44 ..." className={inputClass} />
          </Field>
        </div>
        <div className="grid gap-4">
          <Field
            label="Bank account reference"
            hint="A label to help us route your payout (e.g. 'Wise, J. Smith'). Never store full account numbers here. We'll collect those securely when arranging a transfer."
          >
            <input value={bankRef} onChange={(e) => setBankRef(e.target.value)} placeholder="e.g. Wise, J. Smith" className={inputClass} />
          </Field>
          <div className="rounded-[12px] bg-[#f7f1e8] p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-black/45">Account status</p>
            <p className="mt-2 inline-flex items-center gap-2 text-[14px] font-black">
              <span className="size-2 rounded-full bg-[#dfff00]" /> {affiliate.status === "active" ? "Active" : affiliate.status}
            </p>
            <p className="mt-2 text-[12px] font-semibold text-black/55">Joined {formatDate(affiliate.created_at)}</p>
          </div>
        </div>

        {error ? <p className="rounded-[12px] bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700 lg:col-span-2">{error}</p> : null}

        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-[52px] items-center gap-3 rounded-full bg-[#070707] px-7 text-[12px] font-black text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-40"
          >
            {saving ? <Loader2 className="size-4 animate-spin" strokeWidth={3} /> : <Check className="size-4" strokeWidth={3} />}
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[12px] font-black uppercase tracking-[0.06em] text-black/55">{label}</span>
      {children}
      {hint ? <span className="text-[12px] font-semibold text-black/50">{hint}</span> : null}
    </label>
  )
}

function EmptyState({ title, copy, cta, onCta }: { title: string; copy: string; cta: string; onCta: () => void }) {
  return (
    <div className="py-8 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#f7f1e8]">
        <ListChecks className="size-7 text-black/45" strokeWidth={2.2} />
      </span>
      <h3 className="mt-5 text-[18px] font-black tracking-[-0.03em]">{title}</h3>
      <p className="mx-auto mt-2 max-w-[360px] text-[13px] font-semibold text-black/55">{copy}</p>
      <button
        type="button"
        onClick={onCta}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#070707] px-5 text-[11px] font-black text-white"
      >
        <Plus className="size-4" strokeWidth={3} /> {cta}
      </button>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

const inputClass =
  "h-12 rounded-xl border border-black/12 bg-white px-4 text-[14px] font-semibold text-black outline-none transition-colors placeholder:text-black/35 focus:border-black/40"
