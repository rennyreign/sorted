"use client"

import { useCallback, useEffect, useState } from "react"
import { trackEvent } from "@/lib/tracking"
import {
  defaultRouteFor,
  getWorkspace,
  type Workspace,
  type WorkspaceRoute,
  type WorkspaceState,
} from "@/lib/workspace"
import { WorkspaceShell, workspacePath } from "./_components/WorkspaceShell"
import { ReviewScreen } from "./_components/ReviewScreen"
import { WebsiteScreen } from "./_components/WebsiteScreen"
import { NextStepsScreen } from "./_components/NextStepsScreen"
import { DetailsScreen, ProjectScreen } from "./_components/ProjectScreen"
import { DocumentsScreen, HelpScreen, OverviewScreen } from "./_components/LiveScreens"
import { QuestionDrawer } from "./_components/Dialogs"

// A single static page served at /workspace/
// Hostinger .htaccess rewrites /workspace/* → /workspace/index.html
// Slug and route are read from window.location at runtime.
// Dev fallback: /workspace?slug=imperial-nail-studio&route=review

function parseLocation(): { slug: string | null; route: WorkspaceRoute | null; depositReturned: boolean } {
  const path = window.location.pathname.replace(/\/+$/, "")
  const parts = path.split("/").filter(Boolean)
  // /workspace/:slug/:route
  const slug = parts[0] === "workspace" ? parts[1] ?? null : null
  const route = parts[0] === "workspace" ? (parts[2] as WorkspaceRoute | undefined) ?? null : null
  const params = new URLSearchParams(window.location.search)
  return {
    slug: slug ?? params.get("slug"),
    route: route ?? (params.get("route") as WorkspaceRoute | null),
    depositReturned: params.get("deposit") === "returned" || params.get("deposit") === "success",
  }
}

function resolveRoute(state: WorkspaceState, route: WorkspaceRoute | null): WorkspaceRoute {
  const prospectRoutes: WorkspaceRoute[] = ["review", "website", "next-steps"]
  if (state === "live") {
    if (route === "overview" || route === "documents" || route === "help" || route === "website") return route
    return "overview"
  }
  if (state === "project") {
    if (route === "project" || route === "details" || route === "documents" || route === "help" || (route && prospectRoutes.includes(route))) return route
    return "project"
  }
  if (route && prospectRoutes.includes(route)) return route
  return defaultRouteFor(state)
}

export default function WorkspacePage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [route, setRoute] = useState<WorkspaceRoute>("review")
  const [depositReturned, setDepositReturned] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [questionOpen, setQuestionOpen] = useState(false)

  const navigate = useCallback(
    (next: WorkspaceRoute) => {
      if (!workspace) return
      window.history.pushState({}, "", workspacePath(workspace.slug, next))
      setRoute(next)
      window.scrollTo({ top: 0 })
      trackEvent("workspace_view", { workspace_slug: workspace.slug, route: next, workspace_state: workspace.state })
    },
    [workspace]
  )

  useEffect(() => {
    const { slug, route: initialRoute, depositReturned: returned } = parseLocation()
    setDepositReturned(returned)

    if (!slug) {
      setLoading(false)
      setNotFound(true)
      return
    }

    async function load() {
      const ws = await getWorkspace(slug ?? "")

      if (!ws) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setWorkspace(ws)
      const resolved = resolveRoute(ws.state, initialRoute)
      setRoute(resolved)
      if (initialRoute !== resolved) {
        window.history.replaceState({}, "", workspacePath(ws.slug, resolved))
      }
      trackEvent("workspace_view", { workspace_slug: ws.slug, route: resolved, workspace_state: ws.state })
      setLoading(false)
    }

    load()
  }, [])

  useEffect(() => {
    const onPop = () => {
      const { route: r } = parseLocation()
      setRoute((current) => (workspace ? resolveRoute(workspace.state, r) : current))
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [workspace])

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F7F7F3]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-black/20 border-t-black" />
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#A3A3A3]">Loading your workspace…</p>
        </div>
      </div>
    )
  }

  if (notFound || !workspace) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F7F7F3]">
        <div className="max-w-sm px-6 text-center">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">Sorted</p>
          <h1 className="mb-3 text-2xl font-extrabold tracking-[-0.03em] text-[#070707]">Workspace not found</h1>
          <p className="text-sm text-[#73736D]">This workspace link may be incorrect or no longer active.</p>
        </div>
      </div>
    )
  }

  return (
    <WorkspaceShell workspace={workspace} route={route} onNavigate={navigate}>
      {route === "review" ? <ReviewScreen workspace={workspace} onNavigate={navigate} /> : null}
      {route === "website" ? (
        <WebsiteScreen workspace={workspace} onNavigate={navigate} onAskQuestion={() => setQuestionOpen(true)} />
      ) : null}
      {route === "next-steps" ? (
        <NextStepsScreen workspace={workspace} depositReturned={depositReturned} onNavigate={navigate} />
      ) : null}
      {route === "project" ? <ProjectScreen workspace={workspace} onNavigate={navigate} /> : null}
      {route === "details" ? <DetailsScreen workspace={workspace} /> : null}
      {route === "overview" ? <OverviewScreen workspace={workspace} onNavigate={navigate} /> : null}
      {route === "documents" ? <DocumentsScreen workspace={workspace} /> : null}
      {route === "help" ? <HelpScreen workspace={workspace} /> : null}

      <QuestionDrawer workspace={workspace} open={questionOpen} onClose={() => setQuestionOpen(false)} />
    </WorkspaceShell>
  )
}
