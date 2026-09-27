"use client"

import { useState } from "react"
import { ArrowRight, MessageCircle, Monitor, Smartphone } from "lucide-react"
import { workspaceEvent, type Workspace } from "@/lib/workspace"

type Viewport = "desktop" | "mobile"

export function WebsiteScreen({
  workspace,
  onNavigate,
  onAskQuestion,
}: {
  workspace: Workspace
  onNavigate: (route: "next-steps") => void
  onAskQuestion: () => void
}) {
  const [viewport, setViewport] = useState<Viewport>("desktop")
  const [loaded, setLoaded] = useState(false)

  const { previewUrl, previewImageUrl } = workspace.website
  const hasPreview = Boolean(previewUrl || previewImageUrl)

  const switchViewport = (v: Viewport) => {
    if (v === viewport) return
    setViewport(v)
    workspaceEvent(workspace, "homepage_viewport_changed", { viewport: v })
  }

  return (
    <div className="mx-auto max-w-[1240px] px-3 pb-10 pt-3 sm:px-6 sm:pt-5 lg:px-8">
      {/* Decision bar */}
      <div className="mb-3 grid grid-cols-1 gap-3 rounded-[12px] bg-[#070707] p-3.5 sm:mb-4 sm:h-[58px] sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-5 sm:px-5 sm:py-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/70">Private working homepage</p>
        <p className="hidden text-[12px] font-semibold text-white/50 sm:block">Built for {workspace.business.name}</p>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <button
            type="button"
            onClick={() => {
              workspaceEvent(workspace, "question_started")
              onAskQuestion()
            }}
            className="inline-flex min-h-11 items-center gap-2.5 text-[12px] font-bold text-white/85 transition-colors hover:text-white focus:outline-2 focus:outline-offset-4 focus:outline-[#DFFF00]"
          >
            <MessageCircle className="size-4" strokeWidth={2.2} />
            Ask a question
          </button>
          <button
            type="button"
            onClick={() => {
              workspaceEvent(workspace, "next_steps_opened")
              onNavigate("next-steps")
            }}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2.5 rounded-[9px] bg-[#DFFF00] px-5 text-[12px] font-black text-[#070707] transition-transform duration-150 hover:-translate-y-px focus:outline-2 focus:outline-offset-4 focus:outline-white active:translate-y-0 sm:h-[42px] sm:flex-none"
          >
            Complete this site · £3,000 <ArrowRight className="size-4" strokeWidth={2.8} />
          </button>
        </div>
      </div>

      {/* Preview frame */}
      <div className="overflow-hidden rounded-[14px] border border-[#E8E5DD] bg-white shadow-[0_14px_45px_rgba(7,7,7,0.08)]">
        <div className="flex h-11 items-center justify-between border-b border-[#E8E5DD] px-4">
          <div className="hidden items-center gap-1.5 sm:flex" aria-hidden>
            <span className="size-[9px] rounded-full bg-[#FF5F57]" />
            <span className="size-[9px] rounded-full bg-[#FEBC2E]" />
            <span className="size-[9px] rounded-full bg-[#28C840]" />
          </div>
          <span className="text-[11px] font-semibold text-[#73736D] sm:hidden">Your new homepage</span>
          <div className="hidden h-8 items-center rounded-full bg-[#F1F1EC] p-[3px] sm:flex" role="group" aria-label="Preview viewport">
            {(
              [
                ["desktop", "Desktop", Monitor],
                ["mobile", "Mobile", Smartphone],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                aria-pressed={viewport === value}
                onClick={() => switchViewport(value)}
                className={`inline-flex h-[26px] items-center gap-2 rounded-full px-3 text-[11px] font-bold transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-[#070707] ${
                  viewport === value ? "bg-[#070707] text-white" : "text-[#73736D] hover:text-[#070707]"
                }`}
              >
                <Icon className="size-3.5" strokeWidth={2.2} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[calc(100dvh-240px)] min-h-[520px] bg-[#F7F7F3] sm:h-[calc(100dvh-206px)] sm:min-h-[680px]">
          {!hasPreview ? (
            <div className="grid h-full place-items-center px-6 text-center">
              <div>
                <p className="text-[15px] font-bold text-[#070707]">Your preview is temporarily unavailable.</p>
                <p className="mt-2 text-[13px] font-medium text-[#73736D]">Ask Sorted to restore it — we&apos;ll get it back quickly.</p>
                <button
                  type="button"
                  onClick={onAskQuestion}
                  className="mt-5 inline-flex h-11 items-center gap-2.5 rounded-full bg-[#070707] px-5 text-[12px] font-black text-white"
                >
                  <MessageCircle className="size-4" strokeWidth={2.2} /> Ask a question
                </button>
              </div>
            </div>
          ) : previewUrl ? (
            <div
              className={`mx-auto h-full bg-white transition-[width] duration-200 ease-out ${
                viewport === "mobile" ? "w-full max-w-[390px] shadow-[0_0_0_1px_#E8E5DD] sm:w-[390px]" : "w-full"
              }`}
            >
              {!loaded ? (
                <div className="grid h-full animate-pulse place-items-center">
                  <p className="text-[12px] font-bold text-[#A3A3A3]">Loading your homepage…</p>
                </div>
              ) : null}
              <iframe
                src={previewUrl}
                title={`Working homepage preview for ${workspace.business.name}`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setLoaded(true)}
                className={`h-full w-full border-0 ${loaded ? "block" : "absolute h-0"}`}
              />
            </div>
          ) : (
            <div
              className={`mx-auto h-full overflow-auto bg-white transition-[width] duration-200 ease-out ${
                viewport === "mobile" ? "w-full max-w-[390px] shadow-[0_0_0_1px_#E8E5DD] sm:w-[390px]" : "w-full"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageUrl}
                alt={`Working homepage design for ${workspace.business.name}`}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      {previewUrl ? null : hasPreview ? (
        <p className="mt-3 text-center text-[11px] font-semibold text-[#73736D]">
          This is the design direction for your homepage — the working version is prepared next.
        </p>
      ) : null}
    </div>
  )
}
