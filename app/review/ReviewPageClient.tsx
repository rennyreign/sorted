"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

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
}

// Each entry: array of keyword triggers, then the plain-English impact copy
const WEAKNESS_MAP: { keywords: string[]; title: string; impact: string }[] = [
  {
    keywords: ["stock", "generic image", "stock photo", "stock bathroom", "stock kitchen", "not actual", "doesn't show actual"],
    title: "Your photos don't show what you actually do",
    impact: "People want to see the real work, the real team, the real place. Stock photos make you look like every other business. Customers choose who they trust, and trust comes from seeing the real thing.",
  },
  {
    keywords: ["mobile", "responsive", "phone", "small screen", "not mobile"],
    title: "Most people are finding you on their phone, and the experience is poor",
    impact: "More than half your visitors are on mobile. If your site is hard to read, slow to load, or difficult to navigate on a phone, most of them will give up and call someone else.",
  },
  {
    keywords: ["typography", "font", "spacing", "layout", "templated", "generic", "hierarchy", "visual interest", "personality"],
    title: "Your site looks like every other local business",
    impact: "When people can't tell you apart from your competitors, they default to whoever is cheapest. A distinct, professional look signals that you take your business seriously. And that you expect them to as well.",
  },
  {
    keywords: ["cta", "call to action", "call-to-action", "button", "booking", "enquiry", "contact", "next step", "what to do"],
    title: "Visitors don't know how to get in touch",
    impact: "If your phone number, contact form, or booking link isn't front and centre, people who are ready to buy will leave without doing anything. Every unclear step costs you an enquiry.",
  },
  {
    keywords: ["review", "testimonial", "trust", "social proof", "credibility", "accreditation"],
    title: "There's nothing on your site to convince a stranger to trust you",
    impact: "Most new customers have never heard of you. Without visible reviews, testimonials, or credentials, you're asking them to take a risk. Your competitors who show social proof will win that customer instead.",
  },
  {
    keywords: ["speed", "slow", "load time", "performance", "page speed"],
    title: "Your site loads slowly, and people won't wait",
    impact: "53% of mobile users leave a site that takes more than 3 seconds to load. A slow site doesn't just frustrate people. Google ranks it lower too, so fewer people find you in the first place.",
  },
  {
    keywords: ["colour", "color", "brand", "cyan", "template colour", "brand colour"],
    title: "Your site doesn't look like it belongs to your business",
    impact: "A site with off-brand colours or a template look feels borrowed, not owned. Customers notice, even if they can't explain why. A site that looks like yours builds confidence before a word is read.",
  },
  {
    keywords: ["navigation", "menu", "structure", "find", "buried", "hard to find"],
    title: "People can't find what they're looking for",
    impact: "If your services, pricing, or contact details are hard to locate, visitors give up rather than hunt around. A clear, simple structure means the right information is always one click away.",
  },
  {
    keywords: ["content", "information", "detail", "description", "thin", "vague", "explain"],
    title: "Your site doesn't give people enough information to make a decision",
    impact: "People research before they buy. If your site doesn't clearly explain what you offer, who it's for, and why you're the right choice, they'll find a competitor who does.",
  },
  {
    keywords: ["seo", "search", "google", "visibility", "rank", "found online"],
    title: "Your business is hard to find on Google",
    impact: "If people searching for your service in your area can't find you, those customers are going straight to whoever does show up. A well-built site with the right structure is the foundation of being found.",
  },
  {
    keywords: ["about", "team", "who you are", "story", "background", "people"],
    title: "People don't know who they're dealing with",
    impact: "For trades, health, and service businesses especially, people want to know who is coming to their home or handling their work. A simple, human about section builds the kind of trust that turns a visitor into a customer.",
  },
  {
    keywords: ["price", "pricing", "cost", "fees", "rates", "quote"],
    title: "Visitors leave because they can't figure out what you charge",
    impact: "Not showing any pricing information means people assume the worst or don't bother asking. Even a rough guide or a 'get a quote' prompt reassures them you're accessible and worth enquiring about.",
  },
]

function translateWeakness(raw: string): { title: string; impact: string } | null {
  const lower = raw.toLowerCase()
  const match = WEAKNESS_MAP.find(entry => entry.keywords.some(k => lower.includes(k)))
  if (match) return { title: match.title, impact: match.impact }
  return null
}

function getScoreColour(score: number) {
  if (score >= 7) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500" }
  if (score >= 4) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", bar: "bg-amber-500" }
  return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", bar: "bg-red-500" }
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

export default function ReviewPageClient({ prospect, slug }: { prospect: ReviewProspect; slug: string }) {
  const [revealed, setRevealed] = useState(false)
  const [revealing, setRevealing] = useState(false)

  const score = prospect.site_score ?? 0
  const scoreColour = getScoreColour(score)
  const projectedScore = Math.min(10, score + (10 - score) * 0.75)
  const hasScore = prospect.site_score !== null
  const hasMockup = !!prospect.mockup_url

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
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">Digital Excellence Score</p>
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

            {/* What it's costing you */}
            {prospect.site_weaknesses && prospect.site_weaknesses.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-6">What this is costing you</p>
                <div className="space-y-4">
                  {(() => {
                    const seen = new Set<string>()
                    const items: { title: string; impact: string }[] = []
                    for (const weakness of prospect.site_weaknesses) {
                      const translated = translateWeakness(weakness)
                      // Skip anything that didn't match the WEAKNESS_MAP —
                      // raw analyser text is internal and not suitable for prospects
                      if (!translated) continue
                      if (seen.has(translated.title)) continue
                      seen.add(translated.title)
                      items.push({ title: translated.title, impact: translated.impact })
                      if (items.length === 4) break
                    }
                    return items.map(({ title, impact }, i) => (
                      <div key={i} className="bg-white border border-black/[0.08] rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div>
                            <h3 className="font-sans font-bold text-[#0A0A0A] text-base mb-2 leading-snug">{title}</h3>
                            <p className="text-sm text-[#737373] leading-relaxed">{impact}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  })()}
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

            {/* Mockup */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">Your new website</p>
              <p className="text-[#737373] text-sm mb-6 leading-relaxed">
                We have already built a modernised concept for {prospect.name}. See what your business should look like.
              </p>

              {hasMockup ? (
                <div className="relative rounded-2xl overflow-hidden border border-black/[0.08] bg-black">
                  <div className={`transition-all duration-700 ${revealed ? "" : "blur-xl scale-105"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={prospect.mockup_url!} alt={`Modernised website concept for ${prospect.name}`} className="w-full" />
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
        <div className="bg-[#0A0A0A] rounded-2xl p-8 sm:p-12 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 mb-4">Next step</p>
          <h2 className="font-sans font-extrabold text-white text-2xl sm:text-3xl tracking-tight mb-3">
            Like what you see?
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-2 max-w-sm mx-auto">
            Want to see the full website in action?
          </p>
          <p className="text-white/40 text-xs leading-relaxed mb-8 max-w-xs mx-auto">
            No upfront payment. No contracts. You see the finished site before you spend a penny.
          </p>
          <a
            href={`/review-next?slug=${slug}`}
            className="inline-block bg-white text-[#0A0A0A] font-bold text-sm px-8 py-4 rounded-xl hover:bg-[#F5F5F5] transition-colors"
          >
            Show me the full website →
          </a>
        </div>

        <p className="text-center font-mono text-[10px] text-[#C4C4C4] uppercase tracking-[0.12em]">
          Sorted · Digital Excellence Review · Confidential
        </p>

      </main>
    </div>
  )
}
