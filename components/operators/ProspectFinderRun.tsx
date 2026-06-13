"use client"

import { useState, useEffect, useRef } from "react"

type RunMode = "full" | "custom"
type RunState = "idle" | "triggering" | "queued" | "in_progress" | "completed" | "failed" | "error"

type RunStatus = {
  status: string
  conclusion: string | null
  started_at: string | null
  updated_at: string | null
  url: string
  run_number: number
}

const ALL_CATEGORIES = [
  "barber shop",
  "hair salon",
  "nail salon",
  "beauty salon",
  "personal trainer",
  "gym",
  "yoga studio",
  "restaurant",
  "cafe",
  "takeaway",
  "plumber",
  "electrician",
  "cleaning service",
  "accountant",
  "solicitor",
  "estate agent",
]

const SUGGESTED_LOCATIONS = [
  "Warwickshire, UK",
  "Birmingham, UK",
  "Coventry, UK",
  "Leamington Spa, UK",
  "Stratford-upon-Avon, UK",
  "Rugby, UK",
  "Solihull, UK",
  "Worcester, UK",
]

export default function ProspectFinderRun() {
  const [mode, setMode] = useState<RunMode>("full")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [location, setLocation] = useState("Warwickshire, UK")
  const [customLocation, setCustomLocation] = useState("")
  const [useCustomLocation, setUseCustomLocation] = useState(false)
  const [runState, setRunState] = useState<RunState>("idle")
  const [runStatus, setRunStatus] = useState<RunStatus | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [errorMsg, setErrorMsg] = useState("")
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startPolling() {
    // Elapsed timer — ticks every second
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)

    // Poll GitHub Actions status every 10s
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/operators/status?workflow=prospect-finder.yml")
        if (!res.ok) return
        const data: RunStatus = await res.json()
        setRunStatus(data)

        if (data.status === "completed") {
          stopPolling()
          setRunState(data.conclusion === "success" ? "completed" : "failed")
        } else if (data.status === "in_progress") {
          setRunState("in_progress")
        } else if (data.status === "queued") {
          setRunState("queued")
        }
      } catch { /* ignore network blips */ }
    }, 10000)
  }

  function stopPolling() {
    if (pollRef.current) clearInterval(pollRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  useEffect(() => () => stopPolling(), [])

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const effectiveLocation = useCustomLocation ? customLocation : location

  async function handleRun() {
    setRunState("triggering")
    setErrorMsg("")

    try {
      // In custom mode: trigger once per selected category (or one full run if none selected)
      // Location is always passed in custom mode so it overrides config.py
      const categoriesToRun = mode === "custom" && selectedCategories.length > 0
        ? selectedCategories
        : [null] // null = no --query flag = all 16 categories

      for (const category of categoriesToRun) {
        const res = await fetch("/api/operators/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workflow: "prospect-finder.yml",
            category: category ?? "",
            location: mode === "custom" ? effectiveLocation : "", // always pass location in custom mode
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to trigger workflow")
        }
      }

      setRunState("queued")
      // Wait 3s for GitHub to register the run, then start polling
      setTimeout(() => startPolling(), 3000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error")
      setRunState("error")
    }
  }

  function formatElapsed(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  const isRunning = runState === "queued" || runState === "in_progress"

  if (isRunning || runState === "completed" || runState === "failed") {
    const isDone = runState === "completed" || runState === "failed"
    const succeeded = runState === "completed"

    return (
      <div className={`border rounded-2xl overflow-hidden ${isDone
        ? succeeded ? "bg-[#F0FDF4] border-[#86EFAC]" : "bg-[#FFF1F2] border-[#FECDD3]"
        : "bg-white border-black/[0.08]"
      }`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b ${isDone
          ? succeeded ? "border-[#86EFAC]/50" : "border-[#FECDD3]/50"
          : "border-black/[0.06]"
        } flex items-center justify-between`}>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-0.5">Operator</p>
            <p className="font-sans font-bold text-[#0A0A0A] text-sm">Prospect Finder</p>
          </div>
          <div className="flex items-center gap-2">
            {isRunning && (
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#059669]" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#059669]">
                  {runState === "queued" ? "Queued" : "Running"}
                </span>
              </span>
            )}
            {isDone && (
              <span className={`font-mono text-[10px] uppercase tracking-[0.12em] ${succeeded ? "text-[#059669]" : "text-red-500"}`}>
                {succeeded ? "✓ Completed" : "✕ Failed"}
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Animated progress bar */}
          {isRunning && (
            <div className="space-y-2">
              <div className="h-1.5 bg-black/[0.05] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${
                  runState === "queued"
                    ? "w-[8%] bg-[#A3A3A3]"
                    : "bg-[#059669] animate-progress"
                }`}
                  style={runState === "in_progress" ? {
                    backgroundImage: "linear-gradient(90deg, #059669, #34d399, #059669)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s linear infinite",
                    width: `${Math.min(90, 10 + (elapsed / 600) * 80)}%`,
                  } : undefined}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-[#737373]">
                  {runState === "queued"
                    ? "Waiting to start…"
                    : `Finding prospects — ${formatElapsed(elapsed)} elapsed`}
                </p>
                <p className="font-mono text-[10px] text-[#A3A3A3]">~10 min total</p>
              </div>
            </div>
          )}

          {/* Steps */}
          <div className="space-y-2">
            {[
              { label: "Trigger received", done: true },
              { label: "Runner queued", done: runState !== "queued" || !!runStatus },
              { label: "Searching Google Maps", done: runState === "in_progress" || isDone },
              { label: "Filtering & enriching", done: isDone || (runState === "in_progress" && elapsed > 120) },
              { label: "Writing to Supabase", done: isDone || (runState === "in_progress" && elapsed > 480) },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[9px] transition-all ${
                  step.done
                    ? "bg-[#0A0A0A] border-[#0A0A0A] text-white"
                    : "border-black/[0.15] text-transparent"
                }`}>✓</span>
                <span className={`text-xs transition-colors ${step.done ? "text-[#0A0A0A] font-medium" : "text-[#C4C4C4]"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {isDone && succeeded && (
            <p className="text-sm text-[#047857]">
              Done. New prospects are in the Prospects tab — refresh to see them.
            </p>
          )}
          {isDone && !succeeded && (
            <p className="text-sm text-red-600">
              Run failed. Check the GitHub Actions log for details.
            </p>
          )}

          {/* Footer actions */}
          <div className="flex items-center gap-4 pt-1">
            {runStatus?.url && (
              <a href={runStatus.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#737373] underline underline-offset-2 hover:text-[#0A0A0A] transition-colors">
                View on GitHub →
              </a>
            )}
            {isDone && (
              <button
                onClick={() => { stopPolling(); setRunState("idle"); setSelectedCategories([]); setRunStatus(null); setElapsed(0) }}
                className="text-xs text-[#737373] hover:text-[#0A0A0A] transition-colors"
              >
                Run again
              </button>
            )}
          </div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-black/[0.06] flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-0.5">Operator</p>
          <p className="font-sans font-bold text-[#0A0A0A] text-sm">Prospect Finder</p>
        </div>
        <div className="flex gap-1 bg-black/[0.04] rounded-lg p-1">
          <button
            onClick={() => setMode("full")}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
              mode === "full" ? "bg-white shadow-sm text-[#0A0A0A]" : "text-[#737373] hover:text-[#0A0A0A]"
            }`}
          >
            Full run
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
              mode === "custom" ? "bg-white shadow-sm text-[#0A0A0A]" : "text-[#737373] hover:text-[#0A0A0A]"
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">

        {mode === "full" ? (
          <div className="bg-black/[0.02] rounded-xl px-4 py-3.5">
            <p className="text-sm text-[#525252] leading-relaxed">
              Searches all <span className="font-semibold text-[#0A0A0A]">16 categories</span> across configured UK locations. Takes ~10 minutes. New prospects appear in the feed as they land.
            </p>
          </div>
        ) : (
          <>
            {/* Category picker */}
            <div>
              <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] block mb-2.5">
                Categories {selectedCategories.length > 0 && <span className="text-[#0A0A0A]">({selectedCategories.length} selected)</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                      selectedCategories.includes(cat)
                        ? "bg-[#0A0A0A] text-[#FAFAFA] border-[#0A0A0A]"
                        : "bg-white text-[#525252] border-black/[0.12] hover:border-black/[0.3] hover:text-[#0A0A0A]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {selectedCategories.length === 0 && (
                <p className="text-xs text-[#A3A3A3] mt-2">No categories selected — will run all 16.</p>
              )}
            </div>

            {/* Location picker */}
            <div>
              <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] block mb-2.5">
                Location
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => { setLocation(loc); setUseCustomLocation(false) }}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      !useCustomLocation && location === loc
                        ? "bg-[#0A0A0A] text-[#FAFAFA] border-[#0A0A0A]"
                        : "bg-white text-[#525252] border-black/[0.12] hover:border-black/[0.3] hover:text-[#0A0A0A]"
                    }`}
                  >
                    {loc.replace(", UK", "")}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type a custom location, e.g. Bristol, UK"
                value={customLocation}
                onChange={(e) => { setCustomLocation(e.target.value); setUseCustomLocation(true) }}
                onFocus={() => setUseCustomLocation(true)}
                className="w-full text-xs bg-white border border-black/[0.12] rounded-lg px-3.5 py-2.5 text-[#0A0A0A] placeholder:text-[#C4C4C4] outline-none focus:border-black/[0.3] transition-colors"
              />
            </div>
          </>
        )}

        {/* Error */}
        {runState === "error" && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
            {errorMsg || "Failed to trigger run. Check GITHUB_TOKEN is set."}
          </p>
        )}

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={runState === "triggering"}
          className="w-full bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm py-3 rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {runState === "triggering" ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Triggering run…
            </>
          ) : mode === "full" ? (
            "Run all categories"
          ) : selectedCategories.length === 0 ? (
            `Run all 16 categories in ${effectiveLocation.replace(", UK", "")}`
          ) : (
            `Run ${selectedCategories.length} categor${selectedCategories.length === 1 ? "y" : "ies"} in ${effectiveLocation.replace(", UK", "")}`
          )}
        </button>

        <p className="text-[10px] text-[#C4C4C4] font-mono text-center">
          Runs via GitHub Actions · ~10 min · results land in Prospects tab
        </p>
      </div>
    </div>
  )
}
