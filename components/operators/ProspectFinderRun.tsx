"use client"

import { useState } from "react"

type RunMode = "full" | "custom"
type RunState = "idle" | "triggering" | "triggered" | "error"

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
  const [errorMsg, setErrorMsg] = useState("")

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
      // For custom mode with multiple categories, trigger one run per category
      const categoriesToRun = mode === "custom" && selectedCategories.length > 0
        ? selectedCategories
        : [null] // null = full run (no --query flag)

      for (const category of categoriesToRun) {
        const res = await fetch("/api/operators/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workflow: "prospect-finder.yml",
            category: category ?? "",
            location: mode === "custom" ? effectiveLocation : "",
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to trigger workflow")
        }
      }

      setRunState("triggered")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error")
      setRunState("error")
    }
  }

  if (runState === "triggered") {
    return (
      <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-2xl p-8 text-center">
        <div className="w-10 h-10 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-[#059669] text-lg">✓</span>
        </div>
        <p className="font-sans font-bold text-[#065F46] text-lg mb-1">Run triggered</p>
        <p className="text-sm text-[#047857] mb-4">
          {mode === "full"
            ? "Full prospect finder is running — all 16 categories across configured locations."
            : `Searching for ${selectedCategories.join(", ")} in ${effectiveLocation}.`}
        </p>
        <p className="text-xs text-[#6EE7B7] font-mono uppercase tracking-[0.1em] mb-6">
          Results will appear in the Prospects tab as they land.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="https://github.com/rennyreign/sorted/actions/workflows/prospect-finder.yml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#047857] underline underline-offset-2 hover:text-[#065F46] transition-colors"
          >
            View run on GitHub →
          </a>
          <span className="text-[#86EFAC]">·</span>
          <button
            onClick={() => { setRunState("idle"); setSelectedCategories([]) }}
            className="text-xs text-[#047857] underline underline-offset-2 hover:text-[#065F46] transition-colors"
          >
            Run again
          </button>
        </div>
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
            "Run all categories"
          ) : (
            `Run ${selectedCategories.length} categor${selectedCategories.length === 1 ? "y" : "ies"} in ${(useCustomLocation ? customLocation : location).replace(", UK", "")}`
          )}
        </button>

        <p className="text-[10px] text-[#C4C4C4] font-mono text-center">
          Runs via GitHub Actions · ~10 min · results land in Prospects tab
        </p>
      </div>
    </div>
  )
}
