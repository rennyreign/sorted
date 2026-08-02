"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"

// Budget thresholds
const FLOOR = 250
const TARGET = 500

function getBudgetResponse(value: number): {
  tone: "below-floor" | "stretch" | "good" | "great"
  heading: string
  body: string
  showBooking: boolean
  callOptional: boolean
} {
  if (value < FLOOR) {
    return {
      tone: "below-floor",
      heading: "We can work with that.",
      body: `Every site we build is the same full build. The budget just determines how we structure the payment. Our minimum is £${FLOOR}, and we can split that across two payments if it helps. Book a call below and we will walk you through it. No pressure.`,
      showBooking: true,
      callOptional: false,
    }
  }
  if (value < TARGET) {
    return {
      tone: "stretch",
      heading: "That works.",
      body: "You will get the exact same site regardless of where your budget sits. The build is the build. Book a call below and we can confirm the details and talk through payment.",
      showBooking: true,
      callOptional: false,
    }
  }
  if (value <= 1000) {
    return {
      tone: "good",
      heading: "Perfect.",
      body: "That covers the full build comfortably. Same site, same quality, same handoff as every client we work with. A call is not required — book one below if you would like to talk it through, or reply by email and we will get started.",
      showBooking: true,
      callOptional: true,
    }
  }
  return {
    tone: "great",
    heading: "Great.",
    body: "That gives us plenty of room to get started immediately. A call is entirely optional — book one below if useful, or reply by email and we will get moving on the build.",
    showBooking: true,
    callOptional: true,
  }
}

function Countdown({ targetMs }: { targetMs: number }) {
  const [remaining, setRemaining] = useState(Math.max(0, targetMs - Date.now()))

  useEffect(() => {
    const t = setInterval(() => {
      setRemaining(r => Math.max(0, r - 1000))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const hours = Math.floor(remaining / 3_600_000)
  const mins = Math.floor((remaining % 3_600_000) / 60_000)
  const secs = Math.floor((remaining % 60_000) / 1_000)

  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <div className="flex items-center justify-center gap-3 my-6">
      {[
        { value: pad(hours), label: "hours" },
        { value: pad(mins), label: "minutes" },
        { value: pad(secs), label: "seconds" },
      ].map(({ value, label }, i) => (
        <div key={label} className="flex items-center gap-3">
          {i > 0 && <span className="text-[#A3A3A3] font-mono text-2xl font-bold -mt-4">:</span>}
          <div className="text-center">
            <div className="bg-[#0A0A0A] text-white font-mono font-bold text-3xl sm:text-4xl tabular-nums rounded-xl px-4 py-3 min-w-[64px]">
              {value}
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#A3A3A3] mt-2">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function NextPageClient({ slug, prospectName }: { slug: string; prospectName: string }) {
  const [budgetRaw, setBudgetRaw] = useState("")
  const [budgetValue, setBudgetValue] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const bookingRef = useRef<HTMLDivElement>(null)

  // 48hr deadline from first visit — stored in localStorage per slug
  const storageKey = `sorted_next_deadline_${slug}`
  const [deadlineMs] = useState<number>(() => {
    if (typeof window === "undefined") return Date.now() + 48 * 3_600_000
    const stored = localStorage.getItem(storageKey)
    if (stored) return parseInt(stored, 10)
    const deadline = Date.now() + 48 * 3_600_000
    localStorage.setItem(storageKey, String(deadline))
    return deadline
  })

  // Mark crm_status as 'build' when they land here
  useEffect(() => {
    supabase.rpc("review_mark_build", { p_slug: slug }).then(({ error }) => {
      if (error) {
        console.error("[review-next] Failed to update crm_status to build:", error.message)
      }
    })
  }, [slug])

  function handleBudgetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "")
    setBudgetRaw(raw)
    const n = parseInt(raw, 10)
    setBudgetValue(isNaN(n) ? null : n)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!budgetValue || saving) return
    setSaving(true)
    await supabase
      .from("prospects")
      .update({ budget_indicated: budgetValue })
      .eq("review_slug", slug)
    setSaving(false)
    setSubmitted(true)
    setTimeout(() => {
      bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 300)
  }

  const response = submitted && budgetValue !== null ? getBudgetResponse(budgetValue) : null

  return (
    <div className="min-h-screen bg-[#FAFAF9]">

      {/* Header */}
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

      <main className="max-w-[720px] mx-auto px-6 pt-12 pb-32 space-y-12">

        {/* Hero */}
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">Your site is in progress</p>
          <h1 className="font-sans font-extrabold text-[#0A0A0A] text-3xl sm:text-4xl tracking-tight mb-4">
            We are building your new website now.
          </h1>
          <p className="text-[#737373] text-base leading-relaxed max-w-md mx-auto">
            Your modernised site for {prospectName} will be ready within 48 hours. You will see the full working version before you are asked to spend anything.
          </p>
        </div>

        {/* Countdown */}
        <div className="bg-white border border-black/[0.08] rounded-2xl p-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">Ready in</p>
          <Countdown targetMs={deadlineMs} />
          <p className="text-xs text-[#A3A3A3] mt-2">Your site will be shared with you directly once complete.</p>
        </div>

        {/* What to expect */}
        <div className="space-y-3">
          {[
            { n: "1", title: "You see the finished site first", body: "We build it, you review it. No commitment until you have seen it." },
            { n: "2", title: "You edit your own content", body: "Every site ships with a simple editor. Change your text, photos, and details yourself. No web designer needed." },
            { n: "3", title: "No upfront payment", body: "You approve the site, then we agree a price. Simple." },
          ].map(({ n, title, body }) => (
            <div key={n} className="bg-white border border-black/[0.08] rounded-xl p-5 flex gap-4">
              <span className="w-7 h-7 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {n}
              </span>
              <div>
                <h3 className="font-bold text-[#0A0A0A] text-sm mb-1">{title}</h3>
                <p className="text-sm text-[#737373] leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Budget */}
        <div className="bg-white border border-black/[0.08] rounded-2xl p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">One quick question</p>
          <h2 className="font-sans font-bold text-[#0A0A0A] text-xl mb-2">What budget do you have in mind?</h2>
          <p className="text-sm text-[#737373] mb-6 leading-relaxed">
            Be honest. There is no wrong answer. Everyone gets the same full build. This just helps us talk about payment in a way that works for you.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex gap-3 items-start">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] font-mono text-sm font-bold">£</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={budgetRaw}
                  onChange={handleBudgetChange}
                  placeholder="e.g. 500"
                  className="w-full pl-8 pr-4 py-3 border border-black/[0.12] rounded-xl font-mono text-sm text-[#0A0A0A] bg-white focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-[#C4C4C4]"
                />
              </div>
              <button
                type="submit"
                disabled={!budgetValue || saving}
                className="bg-[#0A0A0A] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#1A1A1A] transition-colors disabled:opacity-40 shrink-0"
              >
                {saving ? "Saving…" : "Continue"}
              </button>
            </form>
          ) : (
            <div className={`rounded-xl p-5 ${
              response?.tone === "below-floor" ? "bg-amber-50 border border-amber-200" :
              response?.tone === "stretch" ? "bg-blue-50 border border-blue-200" :
              "bg-emerald-50 border border-emerald-200"
            }`}>
              <h3 className={`font-bold text-base mb-2 ${
                response?.tone === "below-floor" ? "text-amber-800" :
                response?.tone === "stretch" ? "text-blue-800" :
                "text-emerald-800"
              }`}>
                {response?.heading}
              </h3>
              <p className={`text-sm leading-relaxed ${
                response?.tone === "below-floor" ? "text-amber-700" :
                response?.tone === "stretch" ? "text-blue-700" :
                "text-emerald-700"
              }`}>
                {response?.body}
              </p>
            </div>
          )}
        </div>

        {/* Booking */}
        <div ref={bookingRef} className={`transition-all duration-500 ${submitted ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
          <div className="bg-white border border-black/[0.08] rounded-2xl p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">
              {response?.callOptional ? "Book a call (optional)" : "Book a call"}
            </p>
            <h2 className="font-sans font-bold text-[#0A0A0A] text-xl mb-2">Book a 15-minute chat</h2>
            <p className="text-sm text-[#737373] mb-6 leading-relaxed">
              15 minutes. We confirm the brief, answer your questions, and get the build started. No hard sell.
            </p>
            <div className="rounded-xl overflow-hidden border border-black/[0.06]" style={{ height: 700 }}>
              <iframe
                src="https://cal.com/sortmydigital/15min?embed=true&theme=light"
                width="100%"
                height="100%"
                frameBorder="0"
                title="Book a 15-minute call with Sorted"
              />
            </div>
            {response?.callOptional && (
              <div className="mt-6 pt-6 border-t border-black/[0.06] text-center">
                <p className="text-sm text-[#737373] mb-3">Prefer to skip the call?</p>
                <a
                  href={`mailto:hello@sortmydigital.site?subject=${encodeURIComponent(`Ready to proceed — ${prospectName}`)}&body=${encodeURIComponent(`Hi,\n\nMy budget of £${budgetValue ?? ""} covers the full build. I'd like to skip the call and get started.\n\nReview link: https://sortmydigital.site/review-next/?slug=${slug}\n\nThanks,`)}`}
                  className="inline-block bg-white border border-black/[0.12] text-[#0A0A0A] font-bold text-sm px-6 py-3 rounded-xl hover:bg-black/[0.02] transition-colors"
                >
                  Email us to get started →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Mission */}
        <div className="border-t border-black/[0.06] pt-12 text-center max-w-md mx-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#C4C4C4] mb-5">Why we do this</p>
          <p className="font-sans font-bold text-[#0A0A0A] text-lg leading-snug mb-4">
            Small businesses deserve to look as good as the work they do.
          </p>
          <p className="text-sm text-[#737373] leading-relaxed mb-4">
            Our mission is simple. We want every small business to be digitally excellent. Not because it looks nice, but because a strong digital presence means more customers, more trust, and a better business.
          </p>
          <p className="text-sm text-[#737373] leading-relaxed">
            Small businesses are the backbone of every thriving economy. This is our contribution to that.
          </p>
          <p className="font-mono text-xs text-[#A3A3A3] mt-6 font-bold tracking-wide">Sorted.</p>
        </div>

        <p className="text-center font-mono text-[10px] text-[#C4C4C4] uppercase tracking-[0.12em]">
          Sorted · Digital Excellence Review · Confidential
        </p>

      </main>
    </div>
  )
}
