"use client"

import { useState, useEffect } from "react"
import { isAuthenticated, logout } from "@/lib/operatorAuth"
import OperatorLogin from "./OperatorLogin"
import OperatorOverview from "./OperatorOverview"
import ProspectFeed from "./ProspectFeed"
import OutreachPanel from "./OutreachPanel"
import PipelineBoard from "./PipelineBoard"

type View = "login" | "overview" | "feed" | "outreach" | "pipeline"

export default function OperatorShell() {
  const [view, setView] = useState<View>("login")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isAuthenticated()) setView("overview")
  }, [])

  // Avoid hydration mismatch on static export
  if (!mounted) {
    return (
      <main className="min-h-[100dvh] bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black/[0.1] border-t-[#0A0A0A] rounded-full animate-spin" />
      </main>
    )
  }

  if (view === "login") {
    return <OperatorLogin onSuccess={() => setView("overview")} />
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-black/[0.06] flex items-center justify-between px-6 sm:px-10 h-14">
        <span className="font-sans font-extrabold text-[#0A0A0A] text-xl tracking-tight leading-none">
          Sorted.
        </span>

        <nav className="flex items-center gap-1">
          <NavTab active={view === "overview"} onClick={() => setView("overview")}>
            Overview
          </NavTab>
          <NavTab active={view === "feed"} onClick={() => setView("feed")}>
            Prospects
          </NavTab>
          <NavTab active={view === "pipeline"} onClick={() => setView("pipeline")}>
            Pipeline
          </NavTab>
          <NavTab active={view === "outreach"} onClick={() => setView("outreach")}>
            Outreach
          </NavTab>
          <div className="w-px h-4 bg-black/[0.08] mx-2" />
          <button
            onClick={() => { logout(); setView("login") }}
            className="text-xs text-[#A3A3A3] hover:text-[#525252] transition-colors px-2 py-1.5"
          >
            Sign out
          </button>
        </nav>
      </header>

      {view === "overview" && <OperatorOverview onViewProspects={() => setView("feed")} />}
      {view === "feed" && <ProspectFeed />}
      {view === "pipeline" && <PipelineBoard />}
      {view === "outreach" && <OutreachPanel />}
    </div>
  )
}

function NavTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
        active
          ? "bg-[#0A0A0A] text-[#FAFAFA]"
          : "text-[#525252] hover:text-[#0A0A0A] hover:bg-black/[0.05]"
      }`}
    >
      {children}
    </button>
  )
}
