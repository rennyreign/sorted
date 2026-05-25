"use client"

import { useState, useEffect } from "react"

const AUTH_KEY = "partyworld_auth"
const AUTH_EXPIRY_DAYS = 30

interface ChecklistItem {
  id: string
  stage: string
  task: string
  status: "pending" | "in-progress" | "completed"
}

const initialChecklist: ChecklistItem[] = [
  { id: "1", stage: "Kickoff", task: "Deposit received (50%)", status: "pending" },
  { id: "2", stage: "Kickoff", task: "Project access and credentials shared", status: "pending" },
  { id: "3", stage: "Design", task: "Store design direction confirmed", status: "pending" },
  { id: "4", stage: "Design", task: "Homepage layout approved", status: "pending" },
  { id: "5", stage: "Design", task: "Product page layouts approved", status: "pending" },
  { id: "6", stage: "Build", task: "Shopify theme development started", status: "pending" },
  { id: "7", stage: "Build", task: "Navigation and menu structure complete", status: "pending" },
  { id: "8", stage: "Build", task: "Cart and checkout functionality working", status: "pending" },
  { id: "9", stage: "Build", task: "Mobile responsive testing complete", status: "pending" },
  { id: "10", stage: "Content", task: "Product images received", status: "pending" },
  { id: "11", stage: "Content", task: "Product descriptions and copy added", status: "pending" },
  { id: "12", stage: "Content", task: "Product catalogue uploaded and organised", status: "pending" },
  { id: "13", stage: "Setup", task: "Shipping rates configured", status: "pending" },
  { id: "14", stage: "Setup", task: "Payment gateway connected", status: "pending" },
  { id: "15", stage: "Setup", task: "Domain connected", status: "pending" },
  { id: "16", stage: "Launch", task: "Final testing complete", status: "pending" },
  { id: "17", stage: "Launch", task: "Balance payment received (50%)", status: "pending" },
  { id: "18", stage: "Launch", task: "Store launched and live", status: "pending" },
  { id: "19", stage: "Handover", task: "Training and documentation provided", status: "pending" },
]

const stageColors: Record<string, string> = {
  "Kickoff": "bg-blue-500/10 text-blue-600",
  "Design": "bg-purple-500/10 text-purple-600",
  "Build": "bg-amber-500/10 text-amber-600",
  "Content": "bg-pink-500/10 text-pink-600",
  "Setup": "bg-cyan-500/10 text-cyan-600",
  "Launch": "bg-green-500/10 text-green-600",
  "Handover": "bg-slate-500/10 text-slate-600",
}

export default function OnboardingChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>(initialChecklist)
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      try {
        const { expires } = JSON.parse(stored)
        if (new Date().getTime() < expires) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem(AUTH_KEY)
        }
      } catch {
        localStorage.removeItem(AUTH_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const saveAuth = () => {
    const expires = new Date().getTime() + (AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    localStorage.setItem(AUTH_KEY, JSON.stringify({ expires }))
  }

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.toLowerCase() === "thepresidents") {
      setIsAuthenticated(true)
      setError(false)
      saveAuth()
    } else {
      setError(true)
    }
  }
  
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black/[0.1] border-t-[#0A0A0A] rounded-full animate-spin" />
      </main>
    )
  }

  const toggleStatus = (id: string) => {
    setItems(items.map(item => {
      if (item.id !== id) return item
      const statuses: ChecklistItem["status"][] = ["pending", "in-progress", "completed"]
      const currentIndex = statuses.indexOf(item.status)
      const nextStatus = statuses[(currentIndex + 1) % statuses.length]
      return { ...item, status: nextStatus }
    }))
  }

  const completedCount = items.filter(i => i.status === "completed").length
  const progress = Math.round((completedCount / items.length) * 100)

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <div className="mb-8">
            <span className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight">Sorted.</span>
          </div>
          <h1 className="font-sans font-bold text-[#0A0A0A] text-xl mb-2">Project Checklist</h1>
          <p className="text-[#737373] text-sm mb-6">Enter the password to view the onboarding checklist.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-black/[0.3] transition-colors"
            />
            {error && (
              <p className="text-red-500 text-sm">Incorrect password. Please try again.</p>
            )}
            <button
              type="submit"
              className="w-full bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors"
            >
              View Checklist
            </button>
          </form>
        </div>
      </main>
    )
  }

  const stages = Array.from(new Set(items.map(item => item.stage)))

  return (
    <main className="max-w-[720px] mx-auto px-6 sm:px-10 pt-16 pb-24">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-4">
          Onboarding Checklist
        </p>
        <h1 className="font-sans font-extrabold text-[#0A0A0A] text-3xl sm:text-4xl leading-tight tracking-tight mb-4">
          Project Timeline
        </h1>
        <p className="text-[#737373] text-base">
          Natasha and Hemans - Track progress from deposit to launch.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs text-[#525252] uppercase tracking-[0.1em]">
            Progress
          </span>
          <span className="font-mono text-xs text-[#0A0A0A] font-semibold">
            {completedCount}/{items.length} complete
          </span>
        </div>
        <div className="h-2 bg-black/[0.06] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#0A0A0A] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist by Stage */}
      <div className="space-y-10">
        {stages.map(stage => {
          const stageItems = items.filter(item => item.stage === stage)
          const stageCompleted = stageItems.filter(i => i.status === "completed").length
          
          return (
            <div key={stage} className="">
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.05em] ${stageColors[stage]}`}>
                  {stage}
                </span>
                <span className="text-xs text-[#A3A3A3]">
                  {stageCompleted}/{stageItems.length}
                </span>
              </div>
              
              <div className="space-y-2">
                {stageItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleStatus(item.id)}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left group ${
                      item.status === "completed" 
                        ? "bg-black/[0.02] border-black/[0.06]" 
                        : item.status === "in-progress"
                        ? "bg-white border-black/[0.15]"
                        : "bg-white border-black/[0.08] hover:border-black/[0.15]"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      item.status === "completed"
                        ? "bg-[#0A0A0A] border-[#0A0A0A]"
                        : item.status === "in-progress"
                        ? "border-[#0A0A0A] bg-[#0A0A0A]/5"
                        : "border-black/[0.2]"
                    }`}>
                      {item.status === "completed" && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {item.status === "in-progress" && (
                        <div className="w-2 h-2 rounded-full bg-[#0A0A0A]" />
                      )}
                    </div>
                    
                    {/* Task text */}
                    <span className={`text-sm leading-relaxed ${
                      item.status === "completed" 
                        ? "text-[#A3A3A3] line-through" 
                        : "text-[#0A0A0A]"
                    }`}>
                      {item.task}
                    </span>
                    
                    {/* Status label */}
                    <span className={`ml-auto shrink-0 text-[10px] uppercase tracking-[0.1em] font-medium ${
                      item.status === "completed"
                        ? "text-green-600"
                        : item.status === "in-progress"
                        ? "text-[#0A0A0A]"
                        : "text-[#C4C4C4]"
                    }`}>
                      {item.status === "pending" ? "To do" : item.status === "in-progress" ? "In progress" : "Done"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-16 pt-8 border-t border-black/[0.08]">
        <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-4">Status Guide</p>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-black/[0.2]" />
            <span className="text-[#737373]">To do</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-[#0A0A0A] bg-[#0A0A0A]/5 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />
            </div>
            <span className="text-[#737373]">In progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#0A0A0A] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[#737373]">Done</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-black/[0.06] flex items-center justify-between">
        <p className="text-xs text-[#C4C4C4] font-mono">
          Click any item to update status. Last updated: {new Date().toLocaleDateString('en-GB')}
        </p>
        <button 
          onClick={handleSignOut}
          className="text-xs text-[#A3A3A3] hover:text-[#525252] transition-colors font-mono"
        >
          Sign out
        </button>
      </div>
    </main>
  )
}
