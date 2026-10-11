"use client"

import { useContext, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { MessageCircle, Monitor, Smartphone } from "lucide-react"
import { workspaceEvent, type Workspace, type WorkspaceRoute } from "@/lib/workspace"
import WalkthroughBubble from "./WalkthroughBubble"
import { PreviewControlsTarget } from "./WorkspaceShell"

type Viewport = "desktop" | "mobile"

export function WebsiteScreen({
  workspace,
  onAskQuestion,
}: {
  workspace: Workspace
  onNavigate: (route: WorkspaceRoute) => void
  onAskQuestion: () => void
}) {
  const [viewport, setViewport] = useState<Viewport>("desktop")
  const controlsTarget = useContext(PreviewControlsTarget)
  const [page, setPage] = useState<"home" | "offer">("home")
  const [loaded, setLoaded] = useState(false)
  const [iframeFailed, setIframeFailed] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)")
    const updateViewport = () => setViewport(media.matches ? "mobile" : "desktop")
    updateViewport()
    media.addEventListener("change", updateViewport)
    return () => media.removeEventListener("change", updateViewport)
  }, [])

  const { previewUrl, previewVersions, defaultPreviewVersion, offerPage } = workspace.website
  const previewImageUrl = page === "offer" ? offerPage?.previewImageUrl : workspace.website.previewImageUrl
  const versions = previewVersions ?? []
  const showVersionPicker = versions.length > 1
  const [selectedVersion, setSelectedVersion] = useState(() => {
    const d = defaultPreviewVersion
    return d && versions.some((v) => v.id === d) ? d : (versions[0]?.id ?? null)
  })
  const homepageUrl = versions.length > 0
    ? (versions.find((v) => v.id === selectedVersion)?.previewUrl ?? previewUrl)
    : previewUrl
  const currentPreviewUrl = page === "offer" ? offerPage?.previewUrl : homepageUrl
  const hasPreview = Boolean(currentPreviewUrl || previewImageUrl)

  // If the live preview iframe never loads (e.g. a local preview that isn't
  // running, or a refused connection), fall back to the still image — or the
  // unavailable state when there isn't one.
  useEffect(() => {
    if (!currentPreviewUrl || loaded) return
    const timer = window.setTimeout(() => setIframeFailed(true), 12000)
    return () => window.clearTimeout(timer)
  }, [currentPreviewUrl, loaded])

  const selectPage = (next: "home" | "offer") => {
    if (page === next) return
    setPage(next)
    setLoaded(false)
    setIframeFailed(false)
    workspaceEvent(workspace, "website_page_changed", { page: next })
  }

  const switchViewport = (v: Viewport) => {
    if (v === viewport) return
    setViewport(v)
    workspaceEvent(workspace, "homepage_viewport_changed", { viewport: v })
  }

  const askQuestion = () => {
    workspaceEvent(workspace, "question_started")
    onAskQuestion()
  }

  const selectVersion = (id: string) => {
    if (id === selectedVersion) return
    setLoaded(false)
    setIframeFailed(false)
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
        className="hidden h-8 shrink-0 items-center rounded-full bg-[#F1F1EC] p-[3px] sm:flex"
        role="group"
        aria-label="Website version"
      >
        {versions.map((v) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={selectedVersion === v.id}
            onClick={() => selectVersion(v.id)}
            className={`inline-flex h-[26px] items-center rounded-full px-3 text-[11px] font-bold transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#070707] ${
              selectedVersion === v.id ? "bg-[#070707] text-white" : "text-[#73736D] hover:text-[#070707]"
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
        className="h-9 shrink-0 rounded-md border border-[#E8E5DD] bg-white px-1.5 text-[11px] font-bold text-[#070707] focus:outline-none focus-visible:outline-2 focus-visible:outline-[#070707] sm:hidden"
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
    <div className="flex min-h-0 w-full flex-1 flex-col bg-[#F7F7F3]">
      {controlsTarget ? createPortal(
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#E8E5DD] pt-4">
        <div className="flex rounded-lg border border-[#E8E5DD] bg-white p-1" role="group" aria-label="Preview page">
          {(["home", ...(offerPage ? ["offer"] : [])] as ("home" | "offer")[]).map(value => <button key={value} type="button" aria-pressed={page === value} onClick={() => selectPage(value)} className={`min-h-10 rounded-md px-4 text-xs font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#070707] ${page === value ? "bg-[#070707] text-white" : "text-[#73736D] hover:bg-[#F0EBDD]"}`}>{value === "home" ? "Homepage" : offerPage?.label}</button>)}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {versionPicker}
          {viewportToggle}
        </div>
      </div>, controlsTarget) : null}

      {/* Preview fills remaining viewport */}
      <div className="relative min-h-0 flex-1 bg-[#F7F7F3]">
        {page === "offer" && !hasPreview ? (
          <div className="grid h-full place-items-center bg-[#F0EBDD] px-6 text-center">
            <div className="max-w-[500px]"><p className="text-[10px] font-bold uppercase tracking-widest text-[#73736D]">Proposed destination · Not yet built</p><h2 className="mt-4 text-3xl font-extrabold tracking-tight">{workspace.acquisition.offerCard.title}</h2><p className="mt-4 text-sm leading-relaxed text-[#73736D]">{offerPage?.description}</p><button type="button" onClick={askQuestion} className="mt-6 min-h-11 rounded-full bg-[#070707] px-5 text-xs font-bold text-white">Discuss the trial page</button></div>
          </div>
        ) : !hasPreview || (iframeFailed && !previewImageUrl) ? (
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
        ) : currentPreviewUrl && !iframeFailed ? (
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
