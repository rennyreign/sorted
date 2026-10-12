"use client"

import { formatMoney } from "@/lib/market-pricing"
import { useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CreditCard,
  Landmark,
  MailWarning,
  Megaphone,
  MessageCircle,
  Monitor,
  MousePointerClick,
  SquareCheckBig,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import { DepositPaymentDialog, NotInterestedDialog, QuestionDrawer } from "./Dialogs"
import { WorkspaceFooter } from "./WorkspaceShell"
import { workspaceEvent, type Workspace, type WorkspaceRoute } from "@/lib/workspace"

const INCLUDED = [
  { icon: Monitor, title: "Complete website", description: "The remaining pages, responsive build, copy, content and required customer journeys." },
  { icon: MousePointerClick, title: "Customer offer page", description: "A dedicated page your ads send people to, built around one clear offer." },
  { icon: Megaphone, title: "Ad campaign setup", description: "Creative, copy and campaign structure for your offer. Ad spend and ongoing management are separate." },
  { icon: MailWarning, title: "Automated follow-up setup", description: "A short email sequence for enquiries that need a clear next step, stopping the moment someone replies or withdraws." },
  { icon: BarChart3, title: "Tracking", description: "Enquiries and confirmed customer actions, with the next step recorded by your team." },
]

const INTEREST_ICONS: Record<string, LucideIcon> = {
  attract: Megaphone,
  convert: MousePointerClick,
  "follow-up": MailWarning,
  tracking: TrendingUp,
}

function calLinkFrom(bookingUrl?: string): string | null {
  if (!bookingUrl) return null
  const match = bookingUrl.match(/cal\.com\/(.+)$/)
  return match ? match[1].replace(/\/+$/, "") : null
}

// ─── Embedded Cal.com booking ─────────────────────────────────────────────────
// Ports Cal.com's official embed bootstrap (window.Cal stub + embed.js loader)
// so the calendar renders inline. Falls back to an external link if the script
// can't load or the booking URL isn't a cal.com link.

const CAL_EMBED_JS = "https://app.cal.com/embed/embed.js"

/* eslint-disable @typescript-eslint/no-explicit-any */
function ensureCal(): any {
  const C = window as any
  if (!C.Cal) {
    // Official Cal.com embed bootstrap — defines the Cal() queue and lazily
    // injects embed.js on first call.
    ;(function (C: any, A: string, L: string) {
      const p = function (a: any, ar: any) {
        a.q.push(ar)
      }
      const d = C.document
      C.Cal =
        C.Cal ||
        function () {
          const cal = C.Cal
          const ar = arguments
          if (!cal.loaded) {
            cal.ns = {}
            cal.q = cal.q || []
            d.head.appendChild(d.createElement("script")).src = A
            cal.loaded = true
          }
          if (ar[0] === L) {
            const api: any = function () {
              p(api, arguments)
            }
            const namespace = ar[1]
            api.q = api.q || []
            if (typeof namespace === "string") {
              cal.ns[namespace] = cal.ns[namespace] || api
              p(cal.ns[namespace], ar)
              p(cal, ["initNamespace", namespace])
            } else p(cal, ar)
            return
          }
          p(cal, ar)
        }
    })(window, CAL_EMBED_JS, "init")
  }
  return C.Cal
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function BookingEmbed({ workspace, interests }: { workspace: Workspace; interests: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const calLink = calLinkFrom(workspace.links.bookingUrl)

  useEffect(() => {
    if (!calLink) {
      setFailed(true)
      return
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      if (!cancelled && ref.current && !ref.current.querySelector("iframe")) setFailed(true)
    }, 8000)

    try {
      const Cal = ensureCal()
      const notes = interests.length > 0 ? `Areas to explore: ${interests.join(", ")}` : undefined
      Cal("init", "workspace-booking", { origin: "https://cal.com" })
      Cal.ns["workspace-booking"]("inline", {
        elementOrSelector: ref.current,
        calLink,
        config: { theme: "light", layout: "month_view", ...(notes ? { notes } : {}) },
      })
      workspaceEvent(workspace, "call_booking_opened", { via: "inline_embed" })
    } catch {
      setFailed(true)
    }

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calLink])

  if (!calLink || failed) {
    return (
      <div className="px-6 py-8 text-center sm:px-8">
        <p className="text-[14px] font-medium text-white/70">The calendar couldn&apos;t load here.</p>
        {workspace.links.bookingUrl ? (
          <a
            href={workspace.links.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => workspaceEvent(workspace, "call_booking_opened", { via: "external_link" })}
            className="mt-4 inline-flex h-12 items-center gap-2.5 rounded-full bg-[#DFFF00] px-6 text-[13px] font-black text-[#070707]"
          >
            <Calendar className="size-4" strokeWidth={2.4} />
            Open the booking calendar <ArrowRight className="size-4" strokeWidth={2.8} />
          </a>
        ) : (
          <p className="mt-3 text-[13px] font-medium text-white/50">Booking link coming soon. Ask us and we&apos;ll arrange a time.</p>
        )}
      </div>
    )
  }

  return <div ref={ref} className="min-h-[420px] w-full bg-white [&_iframe]:w-full" aria-label="Booking calendar" />
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function NextStepsScreen({
  workspace,
  depositReturned,
  onNavigate,
}: {
  workspace: Workspace
  depositReturned: boolean
  onNavigate: (route: WorkspaceRoute) => void
}) {
  const [questionOpen, setQuestionOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paying, setPaying] = useState(false)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [declined, setDeclined] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const { offer, links } = workspace
  const { interests } = workspace.acquisition
  const offerPending = offer.status === "pending"

  useEffect(() => {
    if (depositReturned && !offerPending) workspaceEvent(workspace, "deposit_returned")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositReturned])

  function toggleInterest(id: string, title: string) {
    setSelected((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
      workspaceEvent(workspace, "interest_toggled", { interest: id, interest_title: title, selected: next.includes(id) })
      return next
    })
  }

  function startDeposit() {
    if (offerPending) return
    workspaceEvent(workspace, "payment_method_selection_opened")
    setPaymentOpen(true)
  }

  function payByCard() {
    if (offerPending || !offer.stripePaymentUrl || paying) return
    setPaying(true)
    workspaceEvent(workspace, "deposit_started", { payment_method: "card" })
    try {
      window.localStorage.setItem("workspace_return_slug", workspace.slug)
    } catch {
      // non-critical — paid screen falls back to email instructions
    }
    const url = new URL(offer.stripePaymentUrl)
    url.searchParams.set("client_reference_id", workspace.slug)
    window.location.assign(url.toString())
  }

  function openQuestion() {
    workspaceEvent(workspace, "question_started")
    setQuestionOpen(true)
  }

  if (declined) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-[560px] place-items-center px-5 py-16 text-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#73736D]">Sorted</p>
          <h1 className="mt-3 text-[34px] font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-[44px]">
            Thanks for your time.
          </h1>
          <p className="mt-4 text-[15px] font-medium leading-[1.55] text-[#73736D]">
            You&apos;ve been removed from our records and there&apos;ll be no further engagement from us. If anything changes, you know where to find us.
          </p>
        </div>
      </div>
    )
  }

  const selectedTitles = interests.filter((i) => selected.includes(i.id)).map((i) => i.title)

  return (
    <>
      <div className="mx-auto max-w-[980px] px-5 pb-9 pt-9 sm:px-8 sm:pt-13">
        {/* Returned from payment — confirm state, not a verified payment */}
        {depositReturned && !offerPending ? (
          <div className="mb-8 rounded-[12px] border border-[#00A64B]/25 bg-[#00A64B]/[0.06] p-5">
            <p className="text-[15px] font-extrabold text-[#0A7A3D]">Deposit received. We&apos;re confirming it now.</p>
            <p className="mt-1.5 text-[13px] font-medium leading-[1.5] text-[#0A7A3D]/80">
              Once confirmed, this workspace becomes your project hub and we&apos;ll start the full build. You&apos;ll hear from us shortly.
            </p>
          </div>
        ) : null}

        {/* Hero — lead with the meeting, not the deposit */}
        <section className="mb-9 max-w-[650px]">
          <h1 className="max-w-[620px] text-[clamp(2.75rem,6vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
            Interested? Book your call.
          </h1>
          <p className="mt-4 max-w-[560px] text-[17px] font-medium leading-[1.4] text-[#73736D] sm:text-[21px]">
            Pick a time and we&apos;ll walk it all through together: site, ads, follow-up and tracking. No payment needed to talk.
          </p>
        </section>

        {/* Interests + booking card */}
        <section className="mb-11 overflow-hidden rounded-[14px] bg-[#070707] p-6 sm:p-8">
          <h2 className="text-[24px] font-extrabold leading-[1.05] tracking-[-0.04em] text-white sm:text-[30px]">
            What would you like to improve?
          </h2>
          <p className="mt-2.5 text-[14px] font-medium leading-[1.5] text-white/60">
            Select the areas worth exploring. We&apos;ll use your choices to make the conversation relevant.
          </p>

          <div className="mt-6 grid gap-3">
            {interests.map((interest) => {
              const Icon = INTEREST_ICONS[interest.id] ?? SquareCheckBig
              const isSelected = selected.includes(interest.id)
              return (
                <button
                  key={interest.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => toggleInterest(interest.id, interest.title)}
                  className="flex items-center gap-4 rounded-[12px] border border-white/15 px-5 py-4 text-left transition-colors hover:border-white/35 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DFFF00] sm:px-6"
                >
                  <Icon className="size-6 shrink-0 text-white" strokeWidth={1.8} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-extrabold tracking-[-0.02em] text-white">{interest.title}</span>
                    <span className="mt-0.5 block text-[13px] font-medium leading-[1.45] text-white/55">{interest.description}</span>
                  </span>
                  <span
                    aria-hidden
                    className={`grid size-6 shrink-0 place-items-center rounded-[6px] border transition-colors ${
                      isSelected ? "border-[#DFFF00] bg-[#DFFF00]" : "border-white/30"
                    }`}
                  >
                    {isSelected ? <Check className="size-4 text-[#070707]" strokeWidth={3.2} /> : null}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-6">
            {selectedTitles.length > 0 ? (
              <p className="mb-4 text-[12px] font-semibold text-white/55">
                Exploring: {selectedTitles.join(" · ")}
              </p>
            ) : null}
            <div className="mx-auto max-w-[920px] overflow-hidden rounded-[12px] bg-white">
              <BookingEmbed workspace={workspace} interests={selectedTitles} />
            </div>
          </div>
        </section>

        {/* Price — framed as a question, not a condition */}
        <section className="mb-11 rounded-[14px] border border-[#E8E5DD] bg-white p-7 sm:p-9">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#73736D]">Good question</p>
          <h2 className="mt-2 text-[26px] font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-[32px]">
            What&apos;s the cost?
          </h2>
          {offerPending ? (
            <p className="mt-3 max-w-[560px] text-[15px] font-medium leading-[1.55] text-[#73736D]">
              We&apos;ll confirm the scope and agree a fixed price on the call. Nothing to pay until then.
            </p>
          ) : (
            <>
              <p className="mt-3 max-w-[560px] text-[15px] font-medium leading-[1.55] text-[#73736D]">
                {formatMoney(offer.total, offer.currency)} fixed. {formatMoney(offer.deposit, offer.currency)} to start, {formatMoney(offer.balance, offer.currency)} when it launches. We&apos;ll confirm the scope on the call first; nothing to pay today.
              </p>
              <p className="mt-5 text-[13px] font-medium text-[#73736D]">
                Already sure?{" "}
                <button
                  type="button"
                  onClick={startDeposit}
                  disabled={paying}
                  className="font-bold text-[#070707] underline underline-offset-4 transition-colors hover:text-[#070707]/70 disabled:opacity-45"
                >
                  {paying ? "Opening checkout…" : `Pay the ${formatMoney(offer.deposit, offer.currency)} deposit to get started`}
                </button>
              </p>
            </>
          )}
        </section>

        {/* What's included */}
        <section className="border-y border-[#E8E5DD] py-8 sm:py-9">
          <h2 className="text-base font-bold tracking-tight">What you get</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map(({ icon: Icon, title, description }) => (
              <article key={title}>
                <span className="grid size-12 place-items-center rounded-full bg-[#DFFF00]">
                  <Icon className="size-5.5" strokeWidth={2.2} />
                </span>
                <h3 className="mt-4 text-[17px] font-extrabold tracking-[-0.03em]">{title}</h3>
                <p className="mt-2 text-[13px] font-medium leading-[1.55] text-[#73736D]">{description}</p>
              </article>
            ))}
          </div>
          <p className="mt-7 flex items-start gap-3 border-t border-[#E8E5DD] pt-6 text-[13px] font-medium leading-[1.55] text-[#73736D]">
            <Landmark className="mt-0.5 size-4 shrink-0" strokeWidth={2.2} />
            The price covers the setup listed above. Ad spend, ongoing campaign management and future optimisation are separate, optional conversations.
          </p>
        </section>

        {/* Alternatives */}
        <section className="py-8 sm:py-9">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={openQuestion}
              className="inline-flex h-[50px] items-center justify-center gap-3 rounded-[9px] border border-[#070707]/15 bg-white px-5 text-[13px] font-black text-[#070707] transition-colors hover:border-[#070707]/35 sm:h-[54px]"
            >
              <MessageCircle className="size-4.5" strokeWidth={2.2} />
              Ask a question
            </button>
            {links.phone ? (
              <a
                href={`tel:${links.phone}`}
                onClick={() => workspaceEvent(workspace, "contact_clicked", { channel: "phone" })}
                className="inline-flex h-[50px] items-center justify-center gap-3 rounded-[9px] border border-[#070707]/15 bg-white px-5 text-[13px] font-black text-[#070707] transition-colors hover:border-[#070707]/35 sm:h-[54px]"
              >
                Ring or text {links.phoneDisplay ?? links.phone}
              </a>
            ) : null}
          </div>
          <p className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                workspaceEvent(workspace, "not_interested_opened")
                setDeclineOpen(true)
              }}
              className="cursor-pointer text-[12px] font-semibold text-[#B91C1C] underline-offset-4 transition-colors hover:text-[#991B1B] hover:underline"
            >
              Not interested?
            </button>
          </p>
        </section>
      </div>

      <WorkspaceFooter workspace={workspace} onNavigate={onNavigate} />

      <QuestionDrawer workspace={workspace} open={questionOpen} onClose={() => setQuestionOpen(false)} />
      {offerPending ? null : (
        <DepositPaymentDialog
          workspace={workspace}
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          onPayByCard={payByCard}
          paying={paying}
        />
      )}
      <NotInterestedDialog
        workspace={workspace}
        open={declineOpen}
        onClose={() => setDeclineOpen(false)}
        onDeclined={() => setDeclined(true)}
      />
    </>
  )
}
