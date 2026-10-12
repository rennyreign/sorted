"use client"

import { createContext, useState, type ReactNode } from "react"
import { ArrowRight, Lock } from "lucide-react"
import { defaultRouteFor, tabsFor, type Workspace, type WorkspaceRoute } from "@/lib/workspace"

export const PreviewControlsTarget = createContext<HTMLDivElement | null>(null)

export function workspacePath(slug: string, route: WorkspaceRoute) {
  return `/workspace/${slug}/${route}`
}

function externalHref(ws: Workspace, key: "website" | "updates" | "tracking") {
  if (key === "website") return ws.website.liveUrl
  if (key === "updates") return ws.website.cmsUrl
  return ws.website.trackingUrl
}

function Wordmark({ href, onNavigate }: { href: string; onNavigate?: () => void }) {
  return (
    <a
      href={href}
      onClick={
        onNavigate
          ? (e) => {
              e.preventDefault()
              onNavigate()
            }
          : undefined
      }
      className="text-[26px] font-black leading-none tracking-[-0.045em] text-[#070707] sm:text-[30px]"
      aria-label="Back to your workspace"
    >
      Sorted<span className="text-[#DFFF00]">.</span>
    </a>
  )
}

function TabLink({
  label,
  active,
  href,
  external = false,
  onNavigate,
}: {
  label: string
  active: boolean
  href: string
  external?: boolean
  onNavigate?: () => void
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={
        onNavigate
          ? (e) => {
              e.preventDefault()
              onNavigate()
            }
          : undefined
      }
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex min-h-11 items-center whitespace-nowrap px-1 text-[12px] font-bold transition-opacity focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#070707] focus-visible:rounded-sm ${
        active ? "text-[#070707]" : "text-[#070707]/55 hover:text-[#070707]/80"
      }`}
    >
      {label}
      {active ? <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-[#DFFF00]" /> : null}
    </a>
  )
}

export function WorkspaceShell({
  workspace,
  route,
  onNavigate,
  children,
}: {
  workspace: Workspace
  route: WorkspaceRoute
  onNavigate: (route: WorkspaceRoute) => void
  children: ReactNode
}) {
  const [previewControlsTarget, setPreviewControlsTarget] = useState<HTMLDivElement | null>(null)
  const tabs = tabsFor(workspace.state).filter(tab => !(workspace.state === "prospect" && "route" in tab && tab.route === "next-steps"))
  const liveUrl = workspace.website.liveUrl
  const homeRoute = defaultRouteFor(workspace.state)
  const goHome = () => onNavigate(homeRoute)

  const nextStepsCta = workspace.state === "prospect" ? (
    <button
      type="button"
      onClick={() => onNavigate("next-steps")}
      className="inline-flex h-11 items-center gap-2.5 rounded-full bg-[#070707] px-5 text-[12px] font-black text-white transition-transform duration-200 hover:-translate-y-px"
    >
      Next steps <ArrowRight className="size-4" strokeWidth={2.6} />
    </button>
  ) : null

  const tabRow = (
    <nav aria-label="Workspace" className="flex items-center gap-6 overflow-x-auto sm:gap-8">
      {tabs.map((tab) => {
        if ("external" in tab) {
          const href = externalHref(workspace, tab.external)
          if (!href) {
            return (
              <span key={tab.label} className="inline-flex min-h-11 items-center px-1 text-[12px] font-bold text-[#070707]/30">
                {tab.label}
              </span>
            )
          }
          return <TabLink key={tab.label} label={tab.label} active={false} href={href} external />
        }
        return (
          <TabLink
            key={tab.route}
            label={tab.label}
            active={route === tab.route}
            href={workspacePath(workspace.slug, tab.route)}
            onNavigate={() => onNavigate(tab.route)}
          />
        )
      })}
    </nav>
  )

  const header = (
    <header className="sticky top-0 z-40 border-b border-[#E8E5DD] bg-[#F7F7F3]/95 backdrop-blur-sm">
        {/* Desktop / tablet header */}
        <div className="mx-auto hidden h-[76px] max-w-[1440px] items-center gap-6 px-8 lg:flex">
          <div className="flex min-w-0 items-baseline gap-3">
            <Wordmark href={workspacePath(workspace.slug, homeRoute)} onNavigate={goHome} />
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-[#73736D]">
              For {workspace.business.name}
            </p>
          </div>
          {tabRow}
          <div className="ml-auto flex shrink-0 items-center justify-end gap-4">
            {workspace.state === "live" && liveUrl ? (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2.5 rounded-full bg-[#070707] px-5 text-[12px] font-black text-white transition-transform duration-200 hover:-translate-y-px"
              >
                Visit your website <ArrowRight className="size-4" strokeWidth={2.6} />
              </a>
            ) : (
              nextStepsCta ? <><p className="hidden items-center gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#73736D] xl:flex"><Lock className="size-3" /> Private workspace</p>{nextStepsCta}</> : (
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#73736D]">
                  <Lock className="size-3.5" strokeWidth={2.4} />
                  Private workspace
                </p>
              )
            )}
          </div>
        </div>

        {/* Mobile: brand row + scrollable tabs */}
        <div className="lg:hidden">
          <div className="flex h-14 items-center justify-between gap-4 px-5">
            <div className="flex min-w-0 items-baseline gap-2.5">
              <Wordmark href={workspacePath(workspace.slug, homeRoute)} onNavigate={goHome} />
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-[#73736D]">
                For {workspace.business.name}
              </p>
            </div>
            {workspace.state === "live" && liveUrl ? (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-[#070707] px-4 text-[11px] font-black text-white"
              >
                Visit site <ArrowRight className="size-3.5" strokeWidth={2.6} />
              </a>
            ) : nextStepsCta ? (
              <button
                type="button"
                onClick={() => onNavigate("next-steps")}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-[#070707] px-4 text-[11px] font-black text-white"
              >
                Next steps <ArrowRight className="size-3.5" strokeWidth={2.6} />
              </button>
            ) : (
              <Lock className="size-4 shrink-0 text-[#73736D]" strokeWidth={2.4} />
            )}
          </div>
          <div className="border-t border-[#E8E5DD] px-5">{tabRow}</div>
        </div>
      </header>
  )

  if (route === "website") {
    return (
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#F7F7F3] text-[#070707]">
        <a href="#workspace-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[#DFFF00] focus:p-3">Skip to website</a>
        {header}
        <div className="shrink-0 border-b border-[#E8E5DD] bg-white">
          <div
            ref={setPreviewControlsTarget}
            className="mx-auto flex min-h-11 w-full max-w-[1440px] flex-wrap items-center gap-x-3 gap-y-2 px-5 py-2 sm:px-8"
          />
        </div>
        <PreviewControlsTarget.Provider value={previewControlsTarget}>
          <main id="workspace-content" className="flex min-h-0 flex-1 flex-col">{children}</main>
        </PreviewControlsTarget.Provider>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F3] text-[#070707]">
      <a href="#workspace-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[#DFFF00] focus:p-3">Skip to content</a>
      {header}
      <main id="workspace-content" className="flex-1">{children}</main>
    </div>
  )
}

export function WorkspaceFooter({ workspace, onNavigate }: { workspace: Workspace; onNavigate?: (route: WorkspaceRoute) => void }) {
  return (
    <footer className="border-t border-[#E8E5DD]">
      <div className="mx-auto flex max-w-[860px] flex-col gap-3 px-5 py-6 text-[12px] font-semibold text-[#73736D] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>This page is for {workspace.business.name}, looked after by Sorted.</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {workspace.links.phone ? (
            <a href={`tel:${workspace.links.phone}`} className="underline underline-offset-4 transition-colors hover:text-[#070707]">
              Ring or text {workspace.links.phoneDisplay ?? workspace.links.phone}
            </a>
          ) : null}
          <a href={`mailto:${workspace.links.questionEmail}`} className="underline underline-offset-4 transition-colors hover:text-[#070707]">
            {workspace.links.questionEmail}
          </a>
          {onNavigate ? (
            <a
              href={workspacePath(workspace.slug, "website")}
              onClick={(e) => {
                e.preventDefault()
                onNavigate("website")
              }}
              className="inline-flex items-center gap-1.5 underline underline-offset-4 transition-colors hover:text-[#070707]"
            >
              Back to your new site <ArrowRight className="size-3.5" strokeWidth={2.6} />
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
