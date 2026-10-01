"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, X } from "lucide-react"
import { BANK_DETAILS, workspaceEvent, type Workspace } from "@/lib/workspace"

function useEscapeAndFocus(open: boolean, onClose: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const first = ref.current?.querySelector<HTMLElement>("textarea, input, button, a")
    first?.focus()
    return () => window.removeEventListener("keydown", onKey)
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
  )}&body=${encodeURIComponent(`${question}\n\n— ${workspace.business.name} workspace (${workspace.slug})`)}`

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
            Ask us anything about the price, what&apos;s included, timing or how the build works. We reply personally — no ticket system.
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
          <p className="mt-3 text-center text-[11px] font-medium text-[#A3A3A3]">Opens your email app, addressed to {workspace.links.questionEmail}.</p>
        </div>
      </div>
    </div>
  )
}

export function BankTransferDialog({
  workspace,
  open,
  onClose,
}: {
  workspace: Workspace
  open: boolean
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEscapeAndFocus(open, onClose, ref)

  if (!open) return null

  const reference = `SORTED-${workspace.slug.replace(/[^a-z0-9]/gi, "").slice(0, 12).toUpperCase()}`

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4" role="dialog" aria-modal="true" aria-label="Pay by bank transfer">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/35" />
      <div ref={ref} className="relative w-full max-w-[520px] rounded-[14px] bg-white p-6 shadow-[0_28px_80px_rgba(7,7,7,0.25)] sm:p-7">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#73736D]">Bank transfer</p>
            <h2 className="mt-2 text-[24px] font-extrabold leading-[1.05] tracking-[-0.04em]">Pay your £1,500 deposit</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bank transfer details"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-black/10 transition-colors hover:bg-black/[0.04]"
          >
            <X className="size-4" strokeWidth={2.4} />
          </button>
        </div>

        <dl className="mt-6 divide-y divide-[#E8E5DD] rounded-[12px] border border-[#E8E5DD]">
          {[
            ["Account name", BANK_DETAILS.accountName],
            ["Bank", BANK_DETAILS.bank],
            ["Sort code", BANK_DETAILS.sortCode],
            ["Account number", BANK_DETAILS.accountNumber],
            ["Amount", "£1,500.00"],
            ["Reference", reference],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#73736D]">{label}</dt>
              <dd className="font-mono text-[13px] font-bold text-[#070707]">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 text-[13px] font-medium leading-[1.55] text-[#73736D]">
          Use the reference so we can match your payment. Once it lands we&apos;ll confirm by email and begin the full build. The remaining £1,500 is due when your site is ready to launch.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#070707] text-[13px] font-black text-white"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
