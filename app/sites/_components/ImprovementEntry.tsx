"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { RefObject } from "react"
import { ArrowLeft, ArrowRight, CalendarDays, Check, X } from "lucide-react"
import { buttonClass, MockupModal } from "./SitesMockupModal"

const DISCOVERY_URL = "https://cal.com/sortmydigital/discovery"

type Panel = "choose" | "customers" | "ops" | "unsure"

const panelHeadings: Record<Panel, string> = {
  choose: "What would you like to improve?",
  customers: "Winning customers",
  ops: "Getting work done",
  unsure: "Not sure yet",
}

export function ImprovementButton({
  label = "See what we can improve",
  variant = "primary",
  className = "",
  location = "body",
  returnFocusRef,
}: {
  label?: string
  variant?: "nav" | "primary" | "yellow" | "white"
  className?: string
  location?: string
  returnFocusRef?: RefObject<HTMLButtonElement | null>
}) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openingMockupRef = useRef(false)
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState<Panel>("choose")
  const [mockupOpen, setMockupOpen] = useState(false)

  function focusReturn() {
    ;(returnFocusRef?.current ?? triggerRef.current)?.focus()
  }

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onClose() {
      setOpen(false)
      if (openingMockupRef.current) {
        openingMockupRef.current = false
        setMockupOpen(true)
        return
      }
      document.body.style.overflow = previousOverflow
      focusReturn()
    }
    dialog.addEventListener("close", onClose)
    return () => {
      document.body.style.overflow = previousOverflow
      dialog.removeEventListener("close", onClose)
    }
  }, [open])

  function openDialog() {
    openingMockupRef.current = false
    setPanel("choose")
    setOpen(true)
  }

  function closeDialog() {
    dialogRef.current?.close()
  }

  function openWebsitePreview() {
    openingMockupRef.current = true
    dialogRef.current?.close()
  }

  function closeMockup() {
    setMockupOpen(false)
    focusReturn()
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        data-track="cta_click"
        data-cta-text={label}
        data-cta-location={location}
        className={`${buttonClass(variant)} ${className}`}
      >
        {label}
        <ArrowRight className="size-4" strokeWidth={3} />
      </button>
      {open && typeof document !== "undefined" ? createPortal(
        <dialog
          ref={dialogRef}
          aria-labelledby="improvement-dialog-title"
          className="fixed inset-0 z-[90] m-0 h-[100dvh] max-h-[100dvh] w-full max-w-none overflow-y-auto overscroll-contain bg-[#fbfbfa] p-0 text-[#070707] backdrop:bg-black/60 [-webkit-overflow-scrolling:touch]"
        >
          <button
            type="button"
            onClick={closeDialog}
            className="fixed right-4 top-4 z-[100] grid size-12 place-items-center rounded-full bg-[#070707] text-white shadow-[0_14px_34px_rgba(0,0,0,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-2 sm:right-6 sm:top-6"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={2.7} />
          </button>
          <div className="mx-auto flex min-h-[100dvh] w-full max-w-[900px] flex-col px-5 pb-12 pt-6 sm:px-8">
            <div className="flex items-center gap-4">
              {panel !== "choose" ? (
                <button
                  type="button"
                  onClick={() => setPanel("choose")}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-black/15 px-4 text-[12px] font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-2"
                >
                  <ArrowLeft className="size-4" strokeWidth={2.5} />
                  Back
                </button>
              ) : null}
            </div>
            <div className="my-auto py-10">
              <h2
                id="improvement-dialog-title"
                className="max-w-[720px] [font-family:var(--font-sites-marker)] text-[clamp(2.6rem,8vw,4.6rem)] font-normal uppercase leading-[0.95]"
              >
                {panelHeadings[panel]}
              </h2>
              <div className="mt-5 h-[4px] w-56 max-w-full rounded-full bg-[#ff73d2]" />
              {panel === "choose" ? <ChoosePanel onSelect={setPanel} /> : null}
              {panel === "customers" ? <CustomersPanel onPreview={openWebsitePreview} /> : null}
              {panel === "ops" ? <OpsPanel /> : null}
              {panel === "unsure" ? <UnsurePanel /> : null}
            </div>
          </div>
        </dialog>,
        document.querySelector(".sorted-sites-shell") ?? document.body,
      ) : null}
      {mockupOpen ? <MockupModal onClose={closeMockup} /> : null}
    </>
  )
}

const choiceClass =
  "group grid min-h-[68px] w-full grid-cols-[1fr_auto] items-center rounded-[16px] border border-black/10 bg-white px-5 text-left text-[16px] font-black tracking-[-0.035em] shadow-[0_14px_40px_rgba(0,0,0,0.035)] transition-all hover:-translate-y-0.5 hover:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-2 sm:text-[18px]"

const actionClass =
  "inline-flex h-[52px] items-center justify-center gap-3 rounded-full bg-[#070707] px-7 text-[12px] font-black text-white shadow-[0_18px_36px_rgba(0,0,0,0.16)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-2"

const linkClass =
  "inline-flex min-h-11 items-center gap-2 text-[12px] font-black underline underline-offset-4 transition-colors hover:text-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-4"

function ChoosePanel({ onSelect }: { onSelect: (panel: Panel) => void }) {
  return (
    <div className="mt-8 grid gap-3 sm:max-w-[560px]">
      {(
        [
          ["customers", "Winning customers"],
          ["ops", "Getting work done"],
          ["unsure", "Not sure yet"],
        ] as const
      ).map(([key, label]) => (
        <button key={key} type="button" onClick={() => onSelect(key)} className={choiceClass}>
          <span>{label}</span>
          <span className="grid size-9 place-items-center rounded-full bg-[#070707] text-white">
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={3} />
          </span>
        </button>
      ))}
    </div>
  )
}

function CustomersPanel({ onPreview }: { onPreview: () => void }) {
  return (
    <div className="mt-8 grid max-w-[620px] gap-6">
      <div>
        <h3 className="text-[19px] font-black tracking-[-0.035em]">Start with your website</h3>
        <p className="mt-3 text-[14px] font-semibold leading-[1.6] text-black/65">
          Your website is where customers decide whether to trust you. We build your first page free. Decide
          whether to take it further.
        </p>
        <div className="mt-5">
          <button type="button" onClick={onPreview} className={actionClass}>
            Get your free site
            <ArrowRight className="size-4" strokeWidth={3} />
          </button>
        </div>
      </div>
      <div className="border-t border-black/10 pt-6">
        <p className="text-[14px] font-semibold leading-[1.6] text-black/65">
          Your website launch includes the agreed ad creative, tracking and follow-up setup. Paid advertising,
          ongoing campaign management and further acquisition work are agreed separately.
        </p>
        <div className="mt-3">
          <a href={DISCOVERY_URL} className={linkClass}>
            <CalendarDays className="size-4" strokeWidth={2.6} />
            Discuss customer acquisition
          </a>
        </div>
      </div>
    </div>
  )
}

function OpsPanel() {
  return (
    <div className="mt-8 grid max-w-[620px] gap-6">
      <p className="text-[14px] font-semibold leading-[1.6] text-black/65">
        Slow replies. Repeated manual tasks. Information copied between tools. Enquiries that go cold. These are the
        kinds of bottlenecks we look at — scoped to the problem, not a ready-made fix.
      </p>
      <ul className="grid gap-3 text-[13px] font-black">
        {["We identify the costly gap together", "Feasibility and scope agreed before work", "Scoped to the problem. Priced separately."].map(
          (item) => (
            <li key={item} className="flex items-center gap-3">
              <Check className="size-5 shrink-0 rounded-full bg-[#dfff00] p-1" strokeWidth={3.5} />
              {item}
            </li>
          ),
        )}
      </ul>
      <div>
        <a href={DISCOVERY_URL} className={linkClass}>
          <CalendarDays className="size-4" strokeWidth={2.6} />
          Discuss your operations
        </a>
      </div>
    </div>
  )
}

function UnsurePanel() {
  return (
    <div className="mt-8 grid max-w-[620px] gap-6">
      <p className="text-[19px] font-black leading-[1.3] tracking-[-0.035em]">Find one costly gap. Start there.</p>
      <p className="text-[14px] font-semibold leading-[1.6] text-black/65">
        You do not need to know exactly what to fix. A short conversation is usually enough to find the first
        improvement worth making.
      </p>
      <div>
        <a href={DISCOVERY_URL} className={linkClass}>
          <CalendarDays className="size-4" strokeWidth={2.6} />
          Talk it through
        </a>
      </div>
    </div>
  )
}
