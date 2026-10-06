"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, CreditCard, Landmark, X } from "lucide-react"
import { BANK_DETAILS, markWorkspaceNotInterested, workspaceEvent, type Workspace } from "@/lib/workspace"

function useEscapeAndFocus(open: boolean, onClose: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const first = ref.current?.querySelector<HTMLElement>("textarea, input, button, a")
    first?.focus()
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose, ref])
}

export function QuestionDrawer({
  workspace,
  open,
  onClose,
}: {
  workspace: Workspace
  open: boolean
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [question, setQuestion] = useState("")
  useEscapeAndFocus(open, onClose, ref)

  if (!open) return null

  const mailto = `mailto:${workspace.links.questionEmail}?subject=${encodeURIComponent(
    `Question about the ${workspace.business.name} website`
  )}&body=${encodeURIComponent(`${question}\n\n${workspace.business.name} workspace (${workspace.slug})`)}`

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Ask a question">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/35" />
      <div
        ref={ref}
        className="absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-[-24px_0_60px_rgba(7,7,7,0.18)] sm:w-[420px]"
      >
        <div className="flex items-center justify-between border-b border-[#E8E5DD] px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#73736D]">Ask a question</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close question panel"
            className="grid size-9 place-items-center rounded-full border border-black/10 transition-colors hover:bg-black/[0.04]"
          >
            <X className="size-4" strokeWidth={2.4} />
          </button>
        </div>
        <div className="flex flex-1 flex-col px-6 py-6">
          <h2 className="text-[24px] font-extrabold leading-[1.05] tracking-[-0.04em]">Anything unclear?</h2>
          <p className="mt-3 text-[14px] font-medium leading-[1.55] text-[#73736D]">
            Ask us anything about the price, what&apos;s included, timing or how the build works. We reply personally, no ticket system.
          </p>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={7}
            placeholder="e.g. Can the site take bookings, or just enquiries?"
            className="mt-6 w-full resize-none rounded-[12px] border border-[#E8E5DD] bg-[#F7F7F3] px-4 py-3.5 text-[14px] font-medium text-[#070707] outline-none transition-colors placeholder:text-[#B9B9B0] focus:border-[#070707]/40"
          />
          <a
            href={mailto}
            onClick={() => workspaceEvent(workspace, "question_started", { channel: "email" })}
            className={`mt-5 inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#070707] px-6 text-[13px] font-black text-white transition-transform duration-150 hover:-translate-y-px ${
              question.trim().length < 2 ? "pointer-events-none opacity-40" : ""
            }`}
            aria-disabled={question.trim().length < 2}
          >
            Send question <ArrowRight className="size-4" strokeWidth={2.8} />
          </a>
          <p className="mt-3 text-center text-[11px] font-medium text-[#A3A3A3]">
            Opens your email app, addressed to {workspace.links.questionEmail}.
            {workspace.links.phone ? (
              <>
                {" "}Or{" "}
                <a href={`tel:${workspace.links.phone}`} className="font-bold text-[#73736D] underline underline-offset-4">
                  ring or text us on {workspace.links.phoneDisplay ?? workspace.links.phone}
                </a>
                .
              </>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  )
}

export function NotInterestedDialog({
  workspace,
  open,
  onClose,
  onDeclined,
}: {
  workspace: Workspace
  open: boolean
  onClose: () => void
  onDeclined: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<"confirm" | "working" | "done">("confirm")
  useEscapeAndFocus(open, onClose, ref)

  useEffect(() => {
    if (open) setPhase("confirm")
  }, [open])

  if (!open) return null

  async function confirm() {
    if (phase !== "confirm") return
    setPhase("working")
    await markWorkspaceNotInterested(workspace)
    setPhase("done")
  }

  function close() {
    if (phase === "done") {
      onDeclined()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto px-4 py-6" role="dialog" aria-modal="true" aria-label="Not interested">
      <button type="button" aria-label="Close" onClick={close} className="fixed inset-0 bg-black/35" />
      <div ref={ref} className="relative my-auto w-full max-w-[440px] rounded-[14px] bg-white p-6 shadow-[0_28px_80px_rgba(7,7,7,0.25)] sm:p-7">
        <div className="flex items-start justify-between gap-6">
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#73736D]">
            {phase === "done" ? "All done" : "Not interested"}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-black/10 transition-colors hover:bg-black/[0.04]"
          >
            <X className="size-4" strokeWidth={2.4} />
          </button>
        </div>

        {phase === "done" ? (
          <>
            <h2 className="mt-2 text-[24px] font-extrabold leading-[1.05] tracking-[-0.04em]">No problem, you&apos;re all set.</h2>
            <p className="mt-3 text-[14px] font-medium leading-[1.55] text-[#73736D]">
              We&apos;ve noted that {workspace.business.name} isn&apos;t interested, and you won&apos;t hear from us about this again. Thanks for taking a look.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#070707] text-[13px] font-black text-white"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <h2 className="mt-2 text-[24px] font-extrabold leading-[1.05] tracking-[-0.04em]">Decline this offer?</h2>
            <p className="mt-3 text-[14px] font-medium leading-[1.55] text-[#73736D]">
              Selecting this will remove you from our records and any further engagement.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#070707]/15 bg-white text-[13px] font-black text-[#070707] transition-colors hover:border-[#070707]/35"
              >
                Keep my workspace
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={phase === "working"}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#070707] text-[13px] font-black text-white transition-opacity disabled:opacity-50"
              >
                {phase === "working" ? "Removing…" : "Yes, not interested"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function DepositPaymentDialog({
  workspace,
  open,
  onClose,
  onPayByCard,
  paying,
}: {
  workspace: Workspace
  open: boolean
  onClose: () => void
  onPayByCard: () => void
  paying: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [showCardPending, setShowCardPending] = useState(false)
  const cardCheckoutAvailable = Boolean(workspace.offer.stripePaymentUrl)
  useEscapeAndFocus(open, onClose, ref)

  useEffect(() => {
    if (open) {
      setShowBankDetails(false)
      setShowCardPending(false)
    }
  }, [open])

  if (!open) return null

  const reference = `SORTED-${workspace.slug.replace(/[^a-z0-9]/gi, "").slice(0, 12).toUpperCase()}`
  const depositAmount = `£${workspace.offer.deposit.toLocaleString()}`

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto px-4 py-6" role="dialog" aria-modal="true" aria-label="Choose a deposit payment method">
      <button type="button" aria-label="Close" onClick={onClose} className="fixed inset-0 bg-black/35" />
      <div ref={ref} className="relative my-auto w-full max-w-[520px] rounded-[14px] bg-white p-6 shadow-[0_28px_80px_rgba(7,7,7,0.25)] sm:p-7">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-3">
            {showBankDetails || showCardPending ? (
              <button
                type="button"
                onClick={() => {
                  setShowBankDetails(false)
                  setShowCardPending(false)
                }}
                aria-label="Back to payment options"
                className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-black/10 transition-colors hover:bg-black/[0.04]"
              >
                <ArrowLeft className="size-4" strokeWidth={2.4} />
              </button>
            ) : null}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#73736D]">
                {showBankDetails ? "Bank transfer" : showCardPending ? "Card payment" : "Payment options"}
              </p>
              <h2 className="mt-2 text-[24px] font-extrabold leading-[1.05] tracking-[-0.04em]">
                {showBankDetails
                  ? "Pay by bank transfer"
                  : showCardPending
                    ? "Stripe checkout is coming soon"
                    : `Pay your ${depositAmount} deposit`}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment options"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-black/10 transition-colors hover:bg-black/[0.04]"
          >
            <X className="size-4" strokeWidth={2.4} />
          </button>
        </div>

        {showCardPending ? (
          <div className="mt-6 rounded-[12px] bg-[#F7F7F3] p-5">
            <p className="text-[14px] font-bold text-[#070707]">The Stripe Checkout link is pending.</p>
            <p className="mt-2 text-[13px] font-medium leading-[1.55] text-[#73736D]">
              No card payment has been taken. Once the link is configured, this option will open secure Stripe Checkout.
            </p>
          </div>
        ) : showBankDetails ? (
          <>
            <dl className="mt-6 divide-y divide-[#E8E5DD] rounded-[12px] border border-[#E8E5DD]">
              {[
                ["Account name", BANK_DETAILS.accountName],
                ["Bank", BANK_DETAILS.bank],
                ["Sort code", BANK_DETAILS.sortCode],
                ["Account number", BANK_DETAILS.accountNumber],
                ["Amount", `${depositAmount}.00`],
                ["Reference", reference],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                  <dt className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#73736D]">{label}</dt>
                  <dd className="font-mono text-[13px] font-bold text-[#070707]">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[13px] font-medium leading-[1.55] text-[#73736D]">
              Use the reference so we can match your payment. We&apos;ll confirm when it arrives; your remaining £{workspace.offer.balance.toLocaleString()} is due when the site is ready to launch.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#070707] text-[13px] font-black text-white"
            >
              Got it
            </button>
          </>
        ) : (
          <>
            <p className="mt-3 text-[14px] font-medium leading-[1.55] text-[#73736D]">
              Choose how you&apos;d like to pay the deposit. Your website price remains £{workspace.offer.total.toLocaleString()} fixed.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => (cardCheckoutAvailable ? onPayByCard() : setShowCardPending(true))}
                disabled={paying}
                className="flex min-h-[116px] flex-col items-start rounded-[12px] bg-[#DFFF00] p-5 text-left transition-transform duration-150 hover:-translate-y-px focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#070707] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <span className="flex items-center gap-2 text-[15px] font-black text-[#070707]">
                  <CreditCard className="size-5" strokeWidth={2.3} />
                  {paying ? "Opening Stripe…" : "Pay by card"}
                </span>
                <span className="mt-2 text-[12px] font-semibold leading-[1.45] text-[#070707]/70">
                  {cardCheckoutAvailable ? "Secure checkout with Stripe." : "Stripe Checkout link coming soon."}
                </span>
              </button>
              {workspace.offer.bankTransferEnabled ? (
                <button
                  type="button"
                  onClick={() => {
                    workspaceEvent(workspace, "bank_transfer_requested")
                    setShowBankDetails(true)
                  }}
                  className="flex min-h-[116px] flex-col items-start rounded-[12px] border border-[#E8E5DD] bg-white p-5 text-left transition-colors hover:border-[#070707]/35 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#070707]"
                >
                  <span className="flex items-center gap-2 text-[15px] font-black text-[#070707]">
                    <Landmark className="size-5" strokeWidth={2.2} />
                    Pay by bank transfer
                  </span>
                  <span className="mt-2 text-[12px] font-semibold leading-[1.45] text-[#73736D]">
                    View the account details and your payment reference.
                  </span>
                </button>
              ) : null}
            </div>

          </>
        )}
      </div>
    </div>
  )
}
