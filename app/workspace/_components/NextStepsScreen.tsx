"use client"

import { useEffect, useState } from "react"
import { ArrowRight, BarChart3, Calendar, CreditCard, MessageCircle, Monitor, Settings } from "lucide-react"
import { DepositPaymentDialog, NotInterestedDialog, QuestionDrawer } from "./Dialogs"
import { WorkspaceFooter } from "./WorkspaceShell"
import { workspaceEvent, type Workspace, type WorkspaceRoute } from "@/lib/workspace"

const INCLUDED = [
  {
    icon: Monitor,
    title: "Complete website",
    description: "The remaining pages, responsive build, copy, content and required customer journeys.",
  },
  {
    icon: Settings,
    title: "Sorted Updates",
    description: "A simple editor for changing text, images and business details.",
  },
  {
    icon: BarChart3,
    title: "Sorted Tracking",
    description: "Analytics and conversion tracking configured for launch.",
  },
]

const STEPS = [
  { number: 2, title: "We complete the site", body: "We build, connect and test your full website." },
  { number: 3, title: "Approve and launch", body: "You review the finished site, then we launch it live." },
]

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

  const { offer, links } = workspace

  const steps = [
    { number: 1, title: "Pay the deposit", body: `Pay £${offer.deposit.toLocaleString()} to confirm and we'll get started.` },
    ...STEPS,
  ]

  useEffect(() => {
    if (depositReturned) workspaceEvent(workspace, "deposit_returned")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositReturned])

  function startDeposit() {
    workspaceEvent(workspace, "payment_method_selection_opened")
    setPaymentOpen(true)
  }

  function payByCard() {
    if (!offer.stripePaymentUrl || paying) return
    setPaying(true)
    workspaceEvent(workspace, "deposit_started", { payment_method: "card" })
    // Stripe's redirect is fixed — hand the slug over via localStorage so the
    // /workspace/paid confirmation screen can link back into this workspace.
    try {
      window.localStorage.setItem("workspace_return_slug", workspace.slug)
    } catch {
      // non-critical — paid screen falls back to email instructions
    }
    const url = new URL(offer.stripePaymentUrl)
    // One shared Payment Link — tag the checkout session with the workspace
    // slug so payments are attributable per prospect in Stripe.
    url.searchParams.set("client_reference_id", workspace.slug)
    window.location.assign(url.toString())
  }

  function openQuestion() {
    workspaceEvent(workspace, "question_started")
    setQuestionOpen(true)
  }

  function openBooking() {
    workspaceEvent(workspace, "call_booking_opened")
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

  return (
    <>
      <div className="mx-auto max-w-[860px] px-5 pb-9 pt-9 sm:px-8 sm:pt-13">
        {/* Returned from payment — confirm state, not a verified payment */}
        {depositReturned ? (
          <div className="mb-8 rounded-[12px] border border-[#00A64B]/25 bg-[#00A64B]/[0.06] p-5">
            <p className="text-[15px] font-extrabold text-[#0A7A3D]">Deposit received. We&apos;re confirming it now.</p>
            <p className="mt-1.5 text-[13px] font-medium leading-[1.5] text-[#0A7A3D]/80">
              Once confirmed, this workspace becomes your project hub and we&apos;ll start the full build. You&apos;ll hear from us shortly.
            </p>
          </div>
        ) : null}

        {/* Offer hero */}
        <section className="mb-9 max-w-[650px]">
          <p className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#73736D]">Your completion offer</p>
          <h1 className="max-w-[620px] text-[clamp(2.75rem,6vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
            Complete your website.
          </h1>
          <p className="mt-4 max-w-[560px] text-[17px] font-medium leading-[1.4] text-[#73736D] sm:text-[21px]">
            You&apos;ve seen the direction. We&apos;ll build, connect and launch the rest.
          </p>
        </section>

        {/* Price panel */}
        <section className="mb-11 flex flex-col gap-6 rounded-[14px] bg-[#070707] p-7 sm:grid sm:min-h-[188px] sm:grid-cols-[1fr_1px_290px] sm:items-center sm:gap-9 sm:p-10">
          <div>
            <p className="text-[46px] font-extrabold leading-none tracking-[-0.055em] text-white sm:text-[64px] sm:whitespace-nowrap">
              £{offer.total.toLocaleString()} <span className="text-[0.55em] tracking-[-0.03em] text-white/85">fixed</span>
            </p>
            <p className="mt-3.5 text-[17px] font-semibold text-white/70 sm:text-[22px]">
              £{offer.deposit.toLocaleString()} deposit · £{offer.balance.toLocaleString()} on launch
            </p>
          </div>
          <div className="hidden h-24 w-px bg-white/20 sm:block" />
          <button
            type="button"
            onClick={startDeposit}
            disabled={paying}
            className="inline-flex h-[54px] w-full items-center justify-center gap-3 rounded-[10px] bg-[#DFFF00] text-[15px] font-black text-[#070707] transition-transform duration-150 hover:-translate-y-px focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DFFF00] active:translate-y-0 disabled:opacity-45 disabled:hover:translate-y-0 sm:h-[72px] sm:text-[19px]"
          >
            <CreditCard className="size-5" strokeWidth={2.4} />
            {paying ? "Opening checkout…" : `Pay £${offer.deposit.toLocaleString()} deposit`}
            <ArrowRight className="size-4" strokeWidth={2.8} />
          </button>
        </section>

        {/* What's included */}
        <section className="border-y border-[#E8E5DD] py-8 sm:py-9">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#73736D]">What&apos;s included</p>
          <div className="mt-6 grid gap-0 sm:grid-cols-3">
            {INCLUDED.map(({ icon: Icon, title, description }, i) => (
              <article
                key={title}
                className={`border-[#E8E5DD] py-6 sm:px-7 sm:py-0 ${i > 0 ? "border-t sm:border-l sm:border-t-0" : ""} ${i === 0 ? "sm:pl-0" : ""}`}
              >
                <span className="grid size-12 place-items-center rounded-full bg-[#DFFF00]">
                  <Icon className="size-5.5" strokeWidth={2.2} />
                </span>
                <h3 className="mt-4 text-[19px] font-extrabold tracking-[-0.03em]">{title}</h3>
                <p className="mt-2.5 text-[14px] font-medium leading-[1.55] text-[#73736D]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-8 sm:py-9">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#73736D]">How it works</p>
          <ol className="mt-6 grid gap-0 sm:grid-cols-3 sm:gap-7">
            {steps.map((step, i) => (
              <li key={step.number} className="relative grid grid-cols-[50px_1fr] gap-4 py-4 sm:block sm:py-0">
                {i < steps.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute left-[23px] top-12 h-[calc(100%-56px)] w-px border-l border-dashed border-[#CFCFC6] sm:left-0 sm:top-[23px] sm:h-px sm:w-[calc(100%-50px)] sm:border-l-0 sm:border-t"
                  />
                ) : null}
                <span className="relative z-10 grid size-[46px] place-items-center rounded-full bg-[#DFFF00] text-[15px] font-black">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-[17px] font-extrabold tracking-[-0.02em] sm:mt-4">{step.title}</h3>
                  <p className="mt-1.5 max-w-[260px] text-[13px] font-medium leading-[1.5] text-[#73736D] sm:text-[14px]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Decision panel */}
        <section className="mt-2 rounded-[14px] border border-[#E8E5DD] bg-white p-6 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#73736D]">Ready to get started?</p>
          <h2 className="mt-3 text-[30px] font-extrabold leading-[1] tracking-[-0.045em] sm:text-[40px]">
            Let&apos;s get your website live.
          </h2>
          <p className="mt-4 max-w-[520px] text-[15px] font-medium leading-[1.55] text-[#73736D]">
            Pay your £{offer.deposit.toLocaleString()} deposit today and we&apos;ll complete, connect and launch your website for £{offer.total.toLocaleString()}.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr]">
            <button
              type="button"
              onClick={startDeposit}
              disabled={paying}
              className="inline-flex h-[50px] items-center justify-center gap-3 rounded-[9px] bg-[#DFFF00] px-5 text-[13px] font-black text-[#070707] transition-transform duration-150 hover:-translate-y-px active:translate-y-0 disabled:opacity-45 sm:h-[54px]"
            >
              <CreditCard className="size-4.5" strokeWidth={2.4} />
              {paying ? "Opening checkout…" : `Pay £${offer.deposit.toLocaleString()} deposit`}
              <ArrowRight className="size-4" strokeWidth={2.8} />
            </button>
            <button
              type="button"
              onClick={openQuestion}
              className="inline-flex h-[50px] items-center justify-center gap-3 rounded-[9px] border border-[#070707]/15 bg-white px-5 text-[13px] font-black text-[#070707] transition-colors hover:border-[#070707]/35 sm:h-[54px]"
            >
              <MessageCircle className="size-4.5" strokeWidth={2.2} />
              Ask a question
            </button>
            {links.bookingUrl ? (
              <a
                href={links.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={openBooking}
                className="inline-flex h-[50px] items-center justify-center gap-3 rounded-[9px] border border-[#070707]/15 bg-white px-5 text-[13px] font-black text-[#070707] transition-colors hover:border-[#070707]/35 sm:h-[54px]"
              >
                <Calendar className="size-4.5" strokeWidth={2.2} />
                Book a call
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
              className="cursor-pointer text-[12px] font-semibold text-[#A3A3A3] underline-offset-4 transition-colors hover:text-[#73736D] hover:underline"
            >
              Not interested?
            </button>
          </p>
        </section>
      </div>

      <WorkspaceFooter workspace={workspace} onNavigate={onNavigate} />

      <QuestionDrawer workspace={workspace} open={questionOpen} onClose={() => setQuestionOpen(false)} />
      <DepositPaymentDialog
        workspace={workspace}
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onPayByCard={payByCard}
        paying={paying}
      />
      <NotInterestedDialog
        workspace={workspace}
        open={declineOpen}
        onClose={() => setDeclineOpen(false)}
        onDeclined={() => setDeclined(true)}
      />
    </>
  )
}
