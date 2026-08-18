"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"

type RunMode = "quick" | "custom"
type RunState = "idle" | "triggering" | "queued" | "in_progress" | "completed" | "failed" | "error"

type RunStatus = {
  status: string
  conclusion: string | null
  started_at: string | null
  updated_at: string | null
  url: string
  run_number: number
}

type RunStats = {
  run_id: string
  started_at: string
  records_returned: number
  records_rejected: number
  duplicates_found: number
  prospects_created: number
  prospects_updated: number
  errors: number
}

const WINDOW_OPTIONS = [
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
]

const MAX_OPTIONS = [50, 100, 250, 500]

export default function NewBusinessFinderRun() {
  const [mode, setMode] = useState<RunMode>("quick")
  const [daysBack, setDaysBack] = useState("7")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [location, setLocation] = useState("")
  const [maxResults, setMaxResults] = useState(100)
  const [runState, setRunState] = useState<RunState>("idle")
  const [runStatus, setRunStatus] = useState<RunStatus | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [errorMsg, setErrorMsg] = useState("")
  const [lastRun, setLastRun] = useState<RunStats | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchLastRun()
  }, [])

  async function fetchLastRun() {
    const { data } = await supabase
      .from("prospect_runs")
      .select("run_id, started_at, records_returned, records_rejected, duplicates_found, prospects_created, prospects_updated, errors")
      .eq("operator", "companies_house")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) setLastRun(data as RunStats)
  }

  function startPolling() {
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/operators/status?workflow=new-business-finder.yml")
        if (!res.ok) return
        const data: RunStatus = await res.json()
        setRunStatus(data)

        if (data.status === "completed") {
          stopPolling()
          setRunState(data.conclusion === "success" ? "completed" : "failed")
          fetchLastRun()
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

  function formatElapsed(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  async function handleRun() {
    setRunState("triggering")
    setErrorMsg("")

    const inputs: Record<string, string> = {
      max_results: String(maxResults),
    }

    if (mode === "quick") {
      inputs.days_back = daysBack
    } else {
      if (fromDate) inputs.from_date = fromDate
      if (toDate) inputs.to_date = toDate
    }

    if (location.trim()) {
      inputs.location = location.trim()
    }

    try {
      const res = await fetch("/api/operators/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflow: "new-business-finder.yml",
          ...inputs,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to trigger workflow")
      }

      setRunState("queued")
      setTimeout(() => startPolling(), 3000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error")
      setRunState("error")
    }
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
        <div className={`px-6 py-5 border-b ${isDone
          ? succeeded ? "border-[#86EFAC]/50" : "border-[#FECDD3]/50"
          : "border-black/[0.06]"
        } flex items-center justify-between`}>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-0.5">Operator</p>
            <p className="font-sans font-bold text-[#0A0A0A] text-sm">New Business Finder</p>
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
                    : `Finding new businesses — ${formatElapsed(elapsed)} elapsed`}
                </p>
                <p className="font-mono text-[10px] text-[#A3A3A3]">~2 min total</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {[
              { label: "Trigger received", done: true },
              { label: "Runner queued", done: runState !== "queued" || !!runStatus },
              { label: "Searching Companies House", done: runState === "in_progress" || isDone },
              { label: "Filtering & deduplicating", done: isDone || (runState === "in_progress" && elapsed > 60) },
              { label: "Writing to Prospect Finder CRM", done: isDone || (runState === "in_progress" && elapsed > 90) },
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
              Done. New businesses are in the Prospects tab — refresh to see them.
            </p>
          )}
          {isDone && !succeeded && (
            <p className="text-sm text-red-600">
              Run failed. Check the GitHub Actions log for details.
            </p>
          )}

          <div className="flex items-center gap-4 pt-1">
            {runStatus?.url && (
              <a href={runStatus.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#737373] underline underline-offset-2 hover:text-[#0A0A0A] transition-colors">
                View on GitHub →
              </a>
            )}
            {isDone && (
              <button
                onClick={() => { stopPolling(); setRunState("idle"); setRunStatus(null); setElapsed(0) }}
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
      <div className="px-6 py-5 border-b border-black/[0.06] flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-0.5">Operator</p>
          <p className="font-sans font-bold text-[#0A0A0A] text-sm">New Business Finder</p>
        </div>
        <div className="flex gap-1 bg-black/[0.04] rounded-lg p-1">
          <button
            onClick={() => setMode("quick")}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
              mode === "quick" ? "bg-white shadow-sm text-[#0A0A0A]" : "text-[#737373] hover:text-[#0A0A0A]"
            }`}
          >
            Quick
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
        <div className="bg-black/[0.02] rounded-xl px-4 py-3.5">
          <p className="text-sm text-[#525252] leading-relaxed">
            Searches Companies House for newly incorporated UK companies, filters by active status and target SIC codes, removes duplicates, and adds suitable businesses to the Prospect Finder CRM.
          </p>
        </div>

        {mode === "quick" ? (
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] block mb-2.5">
              Incorporation window
            </label>
            <div className="flex flex-wrap gap-2">
              {WINDOW_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDaysBack(opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    daysBack === opt.value
                      ? "bg-[#0A0A0A] text-[#FAFAFA] border-[#0A0A0A]"
                      : "bg-white text-[#525252] border-black/[0.12] hover:border-black/[0.3] hover:text-[#0A0A0A]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] block mb-2">From date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full text-xs bg-white border border-black/[0.12] rounded-lg px-3 py-2 text-[#0A0A0A] outline-none focus:border-black/[0.3]"
              />
            </div>
            <div>
              <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] block mb-2">To date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full text-xs bg-white border border-black/[0.12] rounded-lg px-3 py-2 text-[#0A0A0A] outline-none focus:border-black/[0.3]"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] block mb-2">Max results</label>
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="w-full text-xs bg-white border border-black/[0.12] rounded-lg px-3 py-2 text-[#0A0A0A] outline-none focus:border-black/[0.3]"
            >
              {MAX_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] block mb-2">Location (optional)</label>
            <input
              type="text"
              placeholder="e.g. Coventry"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs bg-white border border-black/[0.12] rounded-lg px-3 py-2 text-[#0A0A0A] placeholder:text-[#C4C4C4] outline-none focus:border-black/[0.3]"
            />
          </div>
        </div>

        {lastRun && (
          <div className="bg-black/[0.02] rounded-xl px-4 py-3.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-2">Last run #{lastRun.run_id.slice(0, 8)}</p>
            <p className="text-xs text-[#525252]">
              {lastRun.records_returned} examined → {lastRun.records_returned - lastRun.records_rejected} passed filters → {lastRun.duplicates_found} duplicates → {lastRun.prospects_created} created, {lastRun.prospects_updated} updated.
            </p>
          </div>
        )}

        {runState === "error" && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
            {errorMsg || "Failed to trigger run. Check GITHUB_TOKEN is set."}
          </p>
        )}

        <button
          onClick={handleRun}
          disabled={runState === "triggering"}
          className="w-full bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm py-3 rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {runState === "triggering" ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Triggering…
            </>
          ) : (
            "Find new businesses"
          )}
        </button>

        <p className="text-[10px] text-[#C4C4C4] font-mono text-center">
          Runs via GitHub Actions · ~2 min · results land in Prospects tab
        </p>
      </div>
    </div>
  )
}
