"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, X } from "lucide-react"

/**
 * "See an example" — opens the example Sprint workspace overlay.
 * The full example workspace content is being assembled; this dialog
 * is the hook it will slot into.
 */
export function ExampleWorkspaceModal({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    dialogRef.current?.focus()
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-7 inline-flex items-center gap-2 rounded-full border bg-transparent px-5 py-2.5 text-[13.5px] font-semibold transition-all duration-200 ${
          dark
            ? "border-white/25 text-white hover:border-white hover:bg-white hover:text-[#0C0C0C]"
            : "border-black/[0.14] text-[#0C0C0C] hover:border-[#0C0C0C] hover:bg-[#0C0C0C] hover:text-[#FAFAF7]"
        }`}
      >
        See an example
        <ArrowRight size={14} aria-hidden="true" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Example Sprint workspace"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-[880px] flex-col overflow-hidden rounded-t-2xl bg-[#FAFAF7] outline-none sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#E6E6E2] px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D4FF00] text-[11px] font-black">
                  Ex
                </span>
                <p className="text-[14px] font-extrabold tracking-tight">Example Sprint workspace</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E6E6E2] bg-white transition-colors duration-200 hover:bg-[#F4F3EF]"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>

            <div className="grid flex-1 gap-px overflow-y-auto bg-[#E6E6E2] sm:grid-cols-3">
              {[
                {
                  label: "Angle A — Expansion",
                  desc: "Visual campaign preview, ad concepts and the message-matched landing-page variant for an existing proposition.",
                },
                {
                  label: "Angle B — Discovery",
                  desc: "A distinct buying hypothesis with its own creative, dedicated landing experience and follow-up narrative.",
                },
                {
                  label: "Handover",
                  desc: "Measurement setup, activation notes and the files your team needs to launch and judge both experiments.",
                },
              ].map((col) => (
                <div key={col.label} className="bg-white p-6">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#6E6E6A]">
                    {col.label}
                  </p>
                  <p className="mt-2.5 text-[13px] leading-[1.65] text-[#4a4a46]">{col.desc}</p>
                  <div className="mt-5 flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-black/[0.14] bg-[#F4F3EF]">
                    <p className="px-4 text-center text-[11.5px] font-medium text-[#8a8a85]">
                      Example assets being assembled
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E6E6E2] px-6 py-4">
              <p className="text-[12px] leading-[1.6] text-[#6E6E6A]">
                This is the view an agency gets during a sprint — both angles side by side, with
                everything needed to run the experiments. The full worked example is being put together.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
