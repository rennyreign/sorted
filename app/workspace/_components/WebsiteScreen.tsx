"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, MessageCircle, Monitor, Smartphone } from "lucide-react"
import { workspaceEvent, type Workspace } from "@/lib/workspace"
import WalkthroughBubble from "./WalkthroughBubble"

type Viewport = "desktop" | "mobile"

export function WebsiteScreen({
  workspace,
  onNavigate,
  onAskQuestion,
}: {
  workspace: Workspace
  onNavigate: (route: "review" | "next-steps") => void
  onAskQuestion: () => void
}) {
  const [viewport, setViewport] = useState<Viewport>("desktop")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)")
    const updateViewport = () => setViewport(media.matches ? "mobile" : "desktop")
    updateViewport()
    media.addEventListener("change", updateViewport)
    return () => media.removeEventListener("change", updateViewport)
  }, [])

  const { previewUrl, previewImageUrl, previewVersions, defaultPreviewVersion } = workspace.website
  const versions = previewVersions ?? []
  const showVersionPicker = versions.length > 1
  const [selectedVersion, setSelectedVersion] = useState(() => {
    const d = defaultPreviewVersion
    return d && versions.some((v) => v.id === d) ? d : (versions[0]?.id ?? null)
  })
  const currentPreviewUrl = versions.length > 0
    ? (versions.find((v) => v.id === selectedVersion)?.previewUrl ?? previewUrl)
    : previewUrl
  const hasPreview = Boolean(currentPreviewUrl || previewImageUrl)

  const switchViewport = (v: Viewport) => {
    if (v === viewport) return
    setViewport(v)
    workspaceEvent(workspace, "homepage_viewport_changed", { viewport: v })
  }

  const askQuestion = () => {
    workspaceEvent(workspace, "question_started")
    onAskQuestion()
  }

  const completeSite = () => {
    workspaceEvent(workspace, "next_steps_opened")
    onNavigate("next-steps")
  }

  const backToReview = () => onNavigate("review")

  const selectVersion = (id: string) => {
    if (id === selectedVersion) return
    setLoaded(false)
    setSelectedVersion(id)
    workspaceEvent(workspace, "website_version_changed", { version: id })
  }

  const viewportToggle = (
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
          className={`inline-flex h-[26px] items-center gap-2 rounded-full px-3 text-[11px] font-bold transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#070707] ${
            viewport === value ? "bg-[#070707] text-white" : "text-[#73736D] hover:text-[#070707]"
          }`}
        >
          <Icon className="size-3.5" strokeWidth={2.2} />
          {label}
        </button>
      ))}
    </div>
  )

  const versionPicker = showVersionPicker ? (
    <>
      {/* Segmented control — tablet/desktop */}
      <div
        className="hidden h-8 shrink-0 items-center rounded-full bg-white/10 p-[3px] sm:flex"
        role="group"
        aria-label="Website version"
      >
        {versions.map((v) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={selectedVersion === v.id}
            onClick={() => selectVersion(v.id)}
            className={`inline-flex h-[26px] items-center rounded-full px-3 text-[11px] font-bold transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DFFF00] ${
              selectedVersion === v.id ? "bg-[#DFFF00] text-[#070707]" : "text-white/60 hover:text-white"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      {/* Compact select — narrow mobile */}
      <select
        aria-label="Website version"
        value={selectedVersion ?? ""}
        onChange={(e) => selectVersion(e.target.value)}
        className="h-9 shrink-0 rounded-md border-0 bg-white/10 px-1.5 text-[11px] font-bold text-white focus:outline-none focus-visible:outline-2 focus-visible:outline-[#DFFF00] sm:hidden"
      >
        {versions.map((v) => (
          <option key={v.id} value={v.id} className="text-[#070707]">
            {v.label}
          </option>
        ))}
      </select>
    </>
  ) : null

  return (
    <div className="flex h-[100dvh] min-h-0 w-full flex-col bg-[#F7F7F3]">
      {/* Action bar — single row pinned to viewport top */}
      <div className="flex h-14 shrink-0 flex-nowrap items-center gap-1.5 bg-[#070707] px-2 sm:h-16 sm:gap-4 sm:px-5">
        <button
          type="button"
          onClick={backToReview}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[12px] font-black text-white transition-colors hover:text-white/80 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DFFF00]"
        >
          <ArrowLeft className="size-4" strokeWidth={2.4} />
          Back to Review
        </button>
        {versionPicker}
        <p className="hidden min-w-0 flex-1 truncate text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/55 lg:block">
          Private working website · {workspace.business.name}
        </p>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={askQuestion}
            aria-label="Ask a question"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 text-[12px] font-bold text-white/85 transition-colors hover:text-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DFFF00]"
          >
            <MessageCircle className="size-4 shrink-0" strokeWidth={2.2} />
            <span className="hidden sm:inline">Ask a question</span>
          </button>
          <button
            type="button"
            onClick={completeSite}
            aria-label="See next steps"
            className="inline-flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-[9px] bg-[#DFFF00] px-3 text-[11px] font-black text-[#070707] transition-transform duration-150 hover:-translate-y-px focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:translate-y-0 min-[400px]:h-[42px] min-[400px]:gap-2 min-[400px]:px-5 min-[400px]:text-[12px]"
          >
            <span className="hidden min-[400px]:inline sm:hidden">Next steps</span>
            <span className="hidden sm:inline">See next steps</span>
            <ArrowRight className="size-4 shrink-0" strokeWidth={2.8} />
          </button>
        </div>
      </div>

      {/* Preview toolbar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#E8E5DD] bg-white px-4">
        <span className="text-[11px] font-semibold text-[#73736D]">Your new website</span>
        {viewportToggle}
      </div>

      {/* Preview fills remaining viewport */}
      <div className="relative min-h-0 flex-1 bg-[#F7F7F3]">
        {!hasPreview ? (
          <div className="grid h-full place-items-center px-6 text-center">
            <div>
              <p className="text-[15px] font-bold text-[#070707]">Your preview is temporarily unavailable.</p>
              <p className="mt-2 text-[13px] font-medium text-[#73736D]">Ask Sorted to restore it and we&apos;ll get it back quickly.</p>
              <button
                type="button"
                onClick={askQuestion}
                className="mt-5 inline-flex h-11 items-center gap-2.5 rounded-full bg-[#070707] px-5 text-[12px] font-black text-white"
              >
                <MessageCircle className="size-4" strokeWidth={2.2} /> Ask a question
              </button>
            </div>
          </div>
        ) : currentPreviewUrl ? (
          <div
            className={`relative mx-auto h-full bg-white transition-[width] duration-200 ease-out ${
              viewport === "mobile" ? "w-full max-w-[390px] shadow-[0_0_0_1px_#E8E5DD] sm:w-[390px]" : "w-full"
            }`}
          >
            {!loaded ? (
              <div className="absolute inset-0 grid animate-pulse place-items-center gap-4 px-8">
                <div className="w-full max-w-[560px] space-y-4">
                  <span className="block h-6 w-1/3 rounded bg-[#F1F1EC]" />
                  <span className="block h-12 w-4/5 rounded bg-[#F1F1EC]" />
                  <span className="block h-3 w-full rounded bg-[#F1F1EC]" />
                  <span className="block h-3 w-5/6 rounded bg-[#F1F1EC]" />
                  <p className="pt-2 text-center text-[12px] font-bold text-[#A3A3A3]">Loading your website…</p>
                </div>
              </div>
            ) : null}
            <iframe
              key={currentPreviewUrl}
              src={currentPreviewUrl}
              title={`Working website preview for ${workspace.business.name}`}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={() => setLoaded(true)}
              className={`h-full w-full border-0 ${loaded ? "block" : "invisible"}`}
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
              alt={`Working website design for ${workspace.business.name}`}
              className="w-full"
            />
          </div>
        )}
        {hasPreview && workspace.website.walkthroughVideoUrl ? (
          <WalkthroughBubble
            src={workspace.website.walkthroughVideoUrl}
            speakerName="Renaldo"
            onEvent={(e, p) => workspaceEvent(workspace, e, p)}
          />
        ) : null}
      </div>
    </div>
  )
}
