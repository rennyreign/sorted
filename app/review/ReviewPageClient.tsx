"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

type AssessmentCategory = {
  score: number
  evidence: string[]
  why_it_matters: string
  recommended_improvement: string
}

export type ModernisationAssessmentReport = {
  business_modernisation_score?: number
  categories?: Record<string, AssessmentCategory>
  why_a_new_website_solves_this?: {
    problems: string[]
    solutions: string[]
  }
  executive_summary?: string
  business_interpretation?: string
  prioritised_recommendations?: string[]
}

export type ReviewProspect = {
  place_id: string
  name: string
  category: string | null
  website: string | null
  address: string | null
  city: string | null
  site_score: number | null
  business_quality_score: number | null
  opportunity_score: number | null
  site_analysis: string | null
  review_summary: string | null
  site_weaknesses: string[] | null
  outreach_angle: string | null
  recommendation: string | null
  revshare_potential: string | null
  modernity_gap: string | null
  screenshot_url: string | null
  analysed_at: string | null
  crm_status: string
  review_slug: string | null
  mockup_url: string | null
  mockup_urls: string[] | null
  business_modernisation_score: number | null
  assessment_report: ModernisationAssessmentReport | null
  assessed_at: string | null
}

// Patterns that indicate internal operator notes — never shown to prospects
const INTERNAL_PATTERNS = [
  "sorted cannot",
  "cannot generate revenue",
  "third-party platform",
  "revshare",
  "rev-share",
  "opportunity score",
  "business quality",
]

function getScoreColour(score: number) {
  if (score >= 7) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500" }
  if (score >= 4) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", bar: "bg-amber-500" }
  return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", bar: "bg-red-500" }
}

function getModernisationScoreColour(score: number) {
  if (score >= 70) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" }
  if (score >= 45) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" }
  return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" }
}

const CATEGORY_LABELS: Record<string, string> = {
  discoverability: "Discoverability",
  infrastructure: "Infrastructure",
  trust_and_brand: "Trust & Brand",
  customer_experience: "Customer Experience",
  modernisation: "Modernisation",
}

const CATEGORY_ORDER = ["discoverability", "infrastructure", "trust_and_brand", "customer_experience", "modernisation"]

const CATEGORY_OUTCOMES: Record<string, string> = {
  discoverability: "Your business shows up more clearly in search and AI results.",
  infrastructure: "Pages load fast, work on every device, and never feel broken.",
  trust_and_brand: "Visitors see a credible, professional business they want to contact.",
  customer_experience: "People find what they need and get in touch without friction.",
  modernisation: "You can update content, track leads, and add bookings without rebuilding.",
}

const SUPERB_CLEANING_FIXTURE: ModernisationAssessmentReport = {
  business_modernisation_score: 38,
  categories: {
    discoverability: {
      score: 32,
      evidence: ["No meta description found.", "Most images lack alt text."],
      why_it_matters: "Search engines and AI assistants struggle to understand and surface the business.",
      recommended_improvement: "Add a unique title and meta description, use a single H1, fix heading hierarchy, add alt text to images, and implement relevant JSON-LD schema.",
    },
    infrastructure: {
      score: 41,
      evidence: ["Server response is slow (2.8s).", "Response is not compressed."],
      why_it_matters: "A slow, insecure, or broken site loses visitors before they convert.",
      recommended_improvement: "Move to HTTPS, fix mixed content, add security headers, compress assets, reduce page weight, and repair broken links.",
    },
    trust_and_brand: {
      score: 45,
      evidence: ["Images appear to be stock or placeholder photos.", "No awards or accreditations mentioned."],
      why_it_matters: "Trust is the difference between a visitor choosing you or a competitor.",
      recommended_improvement: "Use real business photography, add contact details and reviews, and show history or accreditations.",
    },
    customer_experience: {
      score: 38,
      evidence: ["No clear primary call-to-action above the fold.", "Contact form is hard to find."],
      why_it_matters: "Visitors leave when they cannot quickly understand what to do next.",
      recommended_improvement: "Add one obvious call-to-action, simplify navigation, and make contact details easy to tap.",
    },
    modernisation: {
      score: 34,
      evidence: ["Built on an old platform with limited analytics.", "No CRM or booking integration."],
      why_it_matters: "An outdated platform makes it hard to measure and improve marketing.",
      recommended_improvement: "Move to a modern, editable platform that supports analytics, CRM, booking and review automation.",
    },
  },
  why_a_new_website_solves_this: {
    problems: [
      "Search engines and AI assistants struggle to understand and surface the business.",
      "Slow, insecure or broken pages create friction and cause visitors to leave.",
      "The business appears less credible than modern competitors.",
    ],
    solutions: [
      "Clear metadata, headings and structured data make the business easier to find.",
      "Fast, secure hosting and clean code keep visitors engaged.",
      "Professional design, real photos and visible reviews build trust.",
    ],
  },
  business_interpretation: "The website is significantly behind current standards and is likely costing the business enquiries.",
}

function ScoreBar({ score, max = 10 }: { score: number; max?: number }) {
  const pct = Math.round((score / max) * 100)
  const c = getScoreColour(score)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-black/[0.06] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${c.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`font-mono text-sm font-bold tabular-nums ${c.text}`}>{score}/10</span>
    </div>
  )
}

function resolveAssessment(prospect: ReviewProspect): { report: ModernisationAssessmentReport | null; score: number | null } {
  if (prospect.business_modernisation_score !== null && prospect.assessment_report) {
    return { report: prospect.assessment_report, score: prospect.business_modernisation_score }
  }
  if (process.env.NODE_ENV === "development" && prospect.review_slug === "superb-cleaning-services") {
    return { report: SUPERB_CLEANING_FIXTURE, score: SUPERB_CLEANING_FIXTURE.business_modernisation_score ?? null }
  }
  return { report: null, score: null }
}

function ModernisationAssessment({ report, score }: { report: ModernisationAssessmentReport; score: number }) {
  const colours = getModernisationScoreColour(score)
  const categories = report.categories || {}
  const ordered = CATEGORY_ORDER
    .filter((key) => categories[key])
    .map((key) => ({ key, label: CATEGORY_LABELS[key] ?? key, ...categories[key] }))
    .sort((a, b) => a.score - b.score)
  const blockers = ordered.slice(0, 3)
  const solutions =
    report.why_a_new_website_solves_this?.solutions?.slice(0, 3) ??
    blockers.map((c) => CATEGORY_OUTCOMES[c.key] ?? `Improve ${c.label.toLowerCase()} to win more enquiries.`)
  const verdict = report.business_interpretation ??
    (score >= 70
      ? "The website is reasonably modern but has room to sharpen conversion and future-proof the platform."
      : score >= 45
      ? "The website is holding the business back in several visible ways and would benefit from a redesign."
      : "The website is significantly behind current standards and is likely costing the business enquiries.")

  return (
    <div className="bg-white rounded-2xl border border-black/[0.08] p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">Business modernisation assessment</p>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F5F5F4] border border-black/[0.06]">
          <span className={`w-1.5 h-1.5 rounded-full ${colours.dot}`} />
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#737373]">Evidence-led</span>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-2">
        <div className="flex items-baseline gap-2">
          <span className={`font-sans font-extrabold text-6xl sm:text-7xl tabular-nums leading-none ${colours.text}`}>{score}</span>
          <span className="text-[#A3A3A3] text-xl font-light">/100</span>
        </div>
        <div className="sm:pb-2">
          <p className="font-sans font-bold text-[#0A0A0A] text-base leading-snug">{verdict}</p>
          <p className="text-[#A3A3A3] text-sm mt-0.5">Based on your live website</p>
        </div>
      </div>

      <div className="mt-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">The three biggest blockers</p>
        <ol className="space-y-4">
          {blockers.map((cat, i) => {
            const catColours = getModernisationScoreColour(cat.score)
            return (
              <li key={cat.key} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-black/[0.06] text-[#525252] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-sans font-bold text-[#0A0A0A] text-sm">{cat.label}</h3>
                    <span className={`font-mono text-xs font-bold tabular-nums ${catColours.text}`}>{cat.score}/100</span>
                  </div>
                  <p className="text-sm text-[#737373] leading-relaxed">{cat.why_it_matters}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {solutions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-black/[0.08]">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">What a modern site changes</p>
          <ul className="space-y-3">
            {solutions.map((solution, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#525252] leading-relaxed">
                <span className="text-emerald-600 shrink-0 mt-0.5">✓</span>
                <span>{solution}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="mt-8 group">
        <summary className="flex items-center justify-between cursor-pointer list-none py-3 -mx-3 px-3 rounded-xl hover:bg-black/[0.02] transition-colors">
          <span className="font-sans font-bold text-[#0A0A0A] text-sm">See supporting assessment</span>
          <span className="text-[#A3A3A3] group-open:rotate-180 transition-transform duration-200">▼</span>
        </summary>
        <div className="pt-4 space-y-4">
          {ordered.map((cat) => {
            const catColours = getModernisationScoreColour(cat.score)
            const evidence = cat.evidence[0] ?? "No summary available."
            return (
              <div key={cat.key} className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h4 className="font-sans font-bold text-[#0A0A0A] text-sm">{cat.label}</h4>
                    <span className={`font-mono text-xs font-bold tabular-nums ${catColours.text}`}>{cat.score}/100</span>
                  </div>
                  <p className="text-sm text-[#737373] leading-relaxed">{evidence}</p>
                </div>
              </div>
            )
          })}
        </div>
      </details>
    </div>
  )
}

export default function ReviewPageClient({ prospect, slug }: { prospect: ReviewProspect; slug: string }) {
  // Normalise: prefer mockup_urls array, fall back to single mockup_url
  const mockupScreens: string[] = (
    prospect.mockup_urls && prospect.mockup_urls.length > 0
      ? prospect.mockup_urls
      : prospect.mockup_url
      ? [prospect.mockup_url]
      : []
  )

  const [revealed, setRevealed] = useState(false)
  const [revealing, setRevealing] = useState(false)

  const score = prospect.site_score ?? 0
  const scoreColour = getScoreColour(score)
  const projectedScore = Math.min(10, score + (10 - score) * 0.75)
  const hasScore = prospect.site_score !== null
  const hasMockup = mockupScreens.length > 0

  const { report: assessmentReport, score: modScore } = resolveAssessment(prospect)
  const hasAssessment = assessmentReport !== null && modScore !== null

  async function handleReveal() {
    if (revealed || revealing) return
    setRevealing(true)
    try {
      await supabase
        .from("prospects")
        .update({ crm_status: "mockup_revealed" })
        .eq("review_slug", slug)
        .neq("crm_status", "mockup_revealed")
    } catch { /* fire and forget */ }
    setRevealed(true)
    setRevealing(false)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">

      {/* Top bar */}
      <header className="border-b border-black/[0.06] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[720px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">Sorted</p>
            <p className="font-sans font-bold text-[#0A0A0A] text-sm leading-tight">Digital Excellence Review</p>
          </div>
          <a href="https://sortmydigital.site" className="text-xs text-[#737373] hover:text-[#0A0A0A] transition-colors">
            sortmydigital.site
          </a>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-6 pt-12 pb-32 space-y-16">

        {/* Business identity */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-3">Prepared for</p>
          <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl tracking-tight leading-tight mb-2">
            {prospect.name}
          </h1>
          {prospect.city && (
            <p className="text-[#737373] text-base">{prospect.city}{prospect.category ? ` · ${prospect.category}` : ""}</p>
          )}
          {prospect.website && (
            <a href={prospect.website} target="_blank" rel="noopener noreferrer"
              className="text-sm text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors font-mono mt-1 block">
              {prospect.website.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          )}
        </div>

        {hasScore ? (
          <>
            {/* Score card */}
            <div className={`rounded-2xl border p-8 ${scoreColour.bg} ${scoreColour.border}`}>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">Trust Score</p>
              <div className="flex items-end gap-4 mb-6">
                <span className={`font-sans font-extrabold text-7xl tabular-nums leading-none ${scoreColour.text}`}>
                  {Math.round(score * 10)}
                </span>
                <span className="text-[#A3A3A3] text-2xl font-light mb-2">/100</span>
              </div>
              <ScoreBar score={score} />
              <p className="text-sm text-[#737373] mt-4 leading-relaxed">
                {score <= 4
                  ? "Your digital presence has significant gaps that are costing you enquiries every day."
                  : score <= 6
                  ? "Your website has a foundation, but key friction points are reducing your conversion rate."
                  : "Your site performs reasonably well. Targeted improvements could push results significantly further."}
              </p>
              <div className="mt-6 pt-6 border-t border-black/[0.08] grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-1">Current</p>
                  <p className={`font-bold text-xl tabular-nums ${scoreColour.text}`}>{Math.round(score * 10)}</p>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-[#C4C4C4] text-lg">→</span>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] mb-1">After Sorted</p>
                  <p className="font-bold text-xl tabular-nums text-emerald-600">{Math.round(projectedScore * 10)}</p>
                </div>
              </div>
            </div>

            {/* Business modernisation assessment */}
            {hasAssessment && assessmentReport && modScore !== null && (
              <ModernisationAssessment report={assessmentReport} score={modScore} />
            )}

            {/* What it's costing you */}
            {prospect.site_weaknesses && prospect.site_weaknesses.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-6">What this is costing you</p>
                <div className="space-y-4">
                  {prospect.site_weaknesses
                    .filter(w => !INTERNAL_PATTERNS.some(p => w.toLowerCase().includes(p)))
                    .slice(0, 4)
                    .map((weakness, i) => {
                      // Split on " — " or " - " to get a short title + detail
                      const dashIdx = weakness.search(/ [—–-] /)
                      const title = dashIdx > -1
                        ? weakness.slice(0, dashIdx).replace(/\.$/, "")
                        : weakness.replace(/\.$/, "")
                      const detail = dashIdx > -1
                        ? weakness.slice(dashIdx).replace(/^ [—–-] /, "")
                        : null
                      return (
                        <div key={i} className="bg-white border border-black/[0.08] rounded-xl p-6">
                          <div className="flex items-start gap-4">
                            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <div>
                              <h3 className="font-sans font-bold text-[#0A0A0A] text-base mb-2 leading-snug">{title}</h3>
                              {detail && <p className="text-sm text-[#737373] leading-relaxed">{detail}</p>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Assessment */}
            {prospect.review_summary && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">Our assessment</p>
                <p className="text-[#525252] text-base leading-relaxed">{prospect.review_summary}</p>
              </div>
            )}

            {/* Mockup screens */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">Your new website</p>
              <p className="text-[#737373] text-sm mb-6 leading-relaxed">
                We have already built a modernised concept for {prospect.name}. See what your business should look like.
              </p>

              {hasMockup ? (
                <div className="space-y-4">
                  {/* First screen — gated reveal */}
                  <div className="relative rounded-2xl overflow-hidden border border-black/[0.08] bg-black">
                    <div className={`transition-all duration-700 ${revealed ? "" : "blur-xl scale-105"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mockupScreens[0]} alt={`Modernised website concept for ${prospect.name}`} className="w-full" />
                    </div>
                    {!revealed && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                        <p className="font-sans font-bold text-white text-xl mb-2 text-center px-6">Your new website is ready</p>
                        <p className="text-white/70 text-sm mb-8 text-center px-8">
                          We built a modernised concept for {prospect.name}. Click to reveal it.
                        </p>
                        <button
                          onClick={handleReveal}
                          disabled={revealing}
                          className="bg-white text-[#0A0A0A] font-bold text-sm px-8 py-4 rounded-xl hover:bg-[#F5F5F5] transition-colors disabled:opacity-70 flex items-center gap-2 shadow-xl"
                        >
                          {revealing ? (
                            <><span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />Revealing…</>
                          ) : "Reveal your new website →"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Additional screens — shown once revealed */}
                  {revealed && mockupScreens.slice(1).map((url, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-black/[0.08] bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`${prospect.name} website screen ${i + 2}`} className="w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-black/[0.15] bg-black/[0.02] p-16 text-center">
                  <p className="text-[#A3A3A3] text-sm">Your website concept is being prepared.</p>
                  <p className="text-[#C4C4C4] text-xs mt-1 font-mono">Check back shortly.</p>
                </div>
              )}
            </div>

            {/* Current site screenshot */}
            {prospect.screenshot_url && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">Your site today</p>
                <div className="rounded-xl overflow-hidden border border-black/[0.08] opacity-60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={prospect.screenshot_url} alt="Current website screenshot" className="w-full" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-black/[0.02] border border-black/[0.06] rounded-2xl p-12 text-center">
            <p className="font-sans font-bold text-[#0A0A0A] text-lg mb-2">Your review is being prepared</p>
            <p className="text-[#737373] text-sm">We are analysing your digital presence. Check back in 24 hours.</p>
          </div>
        )}

        {/* CTA */}
        <div className="bg-[#0A0A0A] rounded-2xl p-8 sm:p-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 mb-4 text-center">The full build</p>
          <h2 className="font-sans font-extrabold text-white text-2xl sm:text-3xl tracking-tight mb-8 text-center">
            There is a full website waiting for you.
          </h2>

          {/* What's included */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.06] rounded-xl overflow-hidden mb-8">
            {[
              { label: "Every page", detail: "Home, services, about, contact. Built and ready." },
              { label: "Works on mobile", detail: "See exactly how it looks on every screen size." },
              { label: "Copy written for you", detail: "Real words for your business. Not placeholder text." },
            ].map(({ label, detail }) => (
              <div key={label} className="bg-[#111] px-5 py-5">
                <p className="font-sans font-bold text-white text-sm mb-1">{label}</p>
                <p className="text-white/40 text-xs leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-white/30 text-xs mb-6">
              No upfront payment. No contracts. You see the finished site before you spend anything.
            </p>
            <a
              href={`/review-next?slug=${slug}`}
              className="inline-block bg-white text-[#0A0A0A] font-bold text-sm px-8 py-4 rounded-xl hover:bg-[#F5F5F5] transition-colors"
            >
              Show me the full website →
            </a>
          </div>
        </div>

        <p className="text-center font-mono text-[10px] text-[#C4C4C4] uppercase tracking-[0.12em]">
          Sorted · Digital Excellence Review · Confidential
        </p>

      </main>
    </div>
  )
}
