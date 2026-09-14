"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

const AUTH_KEY = "abc_auth"
const AUTH_EXPIRY_DAYS = 30
const QUOTE_AMOUNT = 750
const CLIENT_SLUG = "advocate-better-care"
const CLIENT_NAME = "Advocate Better Care"
const EDGE_FUNCTION_URL = "https://qweevancxedkkfxysnzq.supabase.co/functions/v1/quote-counter-offer"
const COUNTER_SECRET = process.env.NEXT_PUBLIC_QUOTE_COUNTER_SECRET ?? ""

// Ratio-based thresholds (relative to asking price)
const AUTO_ACCEPT_PCT = 0.80  // >= 80% of asking → auto-accept
const REVIEW_PCT = 0.50       // 50-80% → sent for review
const MAX_ATTEMPTS = 2        // client gets 2 counter attempts, then locked

const autoAcceptThreshold = Math.round(QUOTE_AMOUNT * AUTO_ACCEPT_PCT)
const reviewThreshold = Math.round(QUOTE_AMOUNT * REVIEW_PCT)

type CounterStatus = "idle" | "submitting" | "accepted" | "review" | "error"
type CounterPhase = "input" | "warning" | "locked"

export default function AdvocateBetterCareQuote() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const [signerName, setSignerName] = useState("")
  const [showAgreement, setShowAgreement] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const [signedAt, setSignedAt] = useState<string | null>(null)

  // Counter-offer state
  const [agreedAmount, setAgreedAmount] = useState<number | null>(null)
  const [showCounterInput, setShowCounterInput] = useState(false)
  const [counterValue, setCounterValue] = useState("")
  const [counterStatus, setCounterStatus] = useState<CounterStatus>("idle")
  const [counterError, setCounterError] = useState("")
  const [counterPhase, setCounterPhase] = useState<CounterPhase>("input")
  const [attempts, setAttempts] = useState(0)
  const [pendingAmount, setPendingAmount] = useState<number | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      try {
        const { expires, signature, agreed, attemptCount } = JSON.parse(stored)
        if (new Date().getTime() < expires) {
          setIsAuthenticated(true)
          if (signature) {
            setIsSigned(true)
            setSignedAt(signature.signedAt)
            setSignerName(signature.signerName)
          }
          if (agreed) {
            setAgreedAmount(agreed)
          }
          if (attemptCount) {
            setAttempts(attemptCount)
            if (attemptCount >= MAX_ATTEMPTS) {
              setCounterPhase("locked")
            }
          }
        } else {
          localStorage.removeItem(AUTH_KEY)
        }
      } catch {
        localStorage.removeItem(AUTH_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const saveAuth = (data?: { signerName?: string; signedAt?: string; agreed?: number; attemptCount?: number }) => {
    const expires = new Date().getTime() + (AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    const stored: { expires: number; signature?: { signerName: string; signedAt: string }; agreed?: number; attemptCount?: number } = { expires }
    if (data?.signerName && data?.signedAt) {
      stored.signature = { signerName: data.signerName, signedAt: data.signedAt }
    }
    if (data?.agreed) {
      stored.agreed = data.agreed
    }
    if (data?.attemptCount !== undefined) {
      stored.attemptCount = data.attemptCount
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(stored))
  }

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
    setIsSigned(false)
    setSignerName("")
    setSignedAt(null)
    setAgreedAmount(null)
    setCounterStatus("idle")
    setShowCounterInput(false)
    setCounterValue("")
    setCounterPhase("input")
    setAttempts(0)
    setPendingAmount(null)
  }

  const handleSignatureSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (signerName.trim()) {
      const now = new Date().toISOString()
      setIsSigned(true)
      setSignedAt(now)
      saveAuth({ signerName: signerName.trim(), signedAt: now, agreed: agreedAmount ?? QUOTE_AMOUNT })
      setShowAgreement(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.toLowerCase() === "mark2026") {
      setIsAuthenticated(true)
      setError(false)
      saveAuth()
    } else {
      setError(true)
    }
  }

  const handleAcceptQuote = () => {
    setAgreedAmount(QUOTE_AMOUNT)
    saveAuth({ agreed: QUOTE_AMOUNT })
    setShowAgreement(true)
  }

  // Determine the zone for a proposed amount
  const getZone = (amount: number): "auto" | "review" | "low" => {
    if (amount >= autoAcceptThreshold) return "auto"
    if (amount >= reviewThreshold) return "review"
    return "low"
  }

  // Submit a counter-offer to the edge function (for review zone)
  const submitForReview = async (amount: number) => {
    setCounterStatus("submitting")
    setCounterError("")
    try {
      const resp = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${COUNTER_SECRET}`,
        },
        body: JSON.stringify({
          client_slug: CLIENT_SLUG,
          client_name: CLIENT_NAME,
          original_amount: QUOTE_AMOUNT,
          proposed_amount: amount,
        }),
      })

      if (!resp.ok) {
        throw new Error("Submission failed")
      }

      setCounterStatus("review")
    } catch {
      setCounterStatus("error")
      setCounterError("Something went wrong. Please try again or contact Renaldo directly.")
    }
  }

  // Handle the first submission attempt
  const handleCounterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(counterValue, 10)
    if (!amount || amount < 1) {
      setCounterError("Enter a valid amount in pounds")
      return
    }

    setCounterError("")
    const zone = getZone(amount)
    const newAttemptCount = attempts + 1
    const isFinalAttempt = newAttemptCount >= MAX_ATTEMPTS

    if (zone === "auto") {
      // Auto-accept — lock immediately
      setAttempts(newAttemptCount)
      setAgreedAmount(amount)
      setCounterStatus("accepted")
      setCounterPhase("locked")
      saveAuth({ agreed: amount, attemptCount: newAttemptCount })
    } else if (zone === "review") {
      // Review zone — submit to Renaldo, lock only on final attempt
      setAttempts(newAttemptCount)
      saveAuth({ attemptCount: newAttemptCount })
      if (isFinalAttempt) setCounterPhase("locked")
      submitForReview(amount)
    } else {
      // Low zone — show warning, give second chance
      setPendingAmount(amount)
      setCounterPhase("warning")
    }
  }

  // Handle confirming a low offer (from the warning)
  const handleConfirmLow = async () => {
    const amount = pendingAmount
    if (!amount) return

    const newAttemptCount = attempts + 1
    const isFinalAttempt = newAttemptCount >= MAX_ATTEMPTS
    setAttempts(newAttemptCount)
    if (isFinalAttempt) setCounterPhase("locked")
    saveAuth({ attemptCount: newAttemptCount })
    await submitForReview(amount)
  }

  // Handle going back from warning to adjust
  const handleAdjustFromWarning = () => {
    setCounterPhase("input")
    setPendingAmount(null)
    setCounterValue("")
    setCounterError("")
  }

  // Handle revising from the review state (one last counter)
  const handleReviseFromReview = () => {
    setCounterStatus("idle")
    setCounterPhase("input")
    setShowCounterInput(true)
    setCounterValue("")
    setCounterError("")
  }

  const displayAmount = agreedAmount ?? QUOTE_AMOUNT
  const depositAmount = Math.round(displayAmount / 2)
  const balanceAmount = displayAmount - depositAmount

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black/[0.1] border-t-[#0A0A0A] rounded-full animate-spin" />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <div className="mb-8">
            <span className="inline-block text-[33px] font-black leading-none tracking-[-0.045em] text-[#070707] sm:text-[40px]">Sorted<span className="text-[#cfe900]">.</span></span>
          </div>
          <h1 className="font-sans font-bold text-[#0A0A0A] text-xl mb-2">Private — For Mark</h1>
          <p className="text-[#737373] text-sm mb-6">Enter the password to view your quote.</p>
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
              View Quote
            </button>
          </form>
        </div>
      </main>
    )
  }

  // Step state: 1 = seen site (always done), 2 = agree quote, 3 = deposit, 4 = polish, 5 = launch
  const quoteAgreed = isSigned || (agreedAmount !== null && counterStatus === "accepted")
  const currentStep = quoteAgreed ? 3 : 2

  const steps = [
    {
      num: "01",
      title: "You see and decide if you like the website",
      body: "The site has been built and is ready for you to review. You've seen it, and you like it.",
      done: true,
    },
    {
      num: "02",
      title: "We agree on a quote",
      body: "Review the quote below. Accept it as-is, or propose a different amount if the price doesn't work for you.",
      done: quoteAgreed,
      current: !quoteAgreed,
    },
    {
      num: "03",
      title: "We take a 50% deposit",
      body: `A deposit of £${depositAmount} secures your slot. On receipt, all remaining parts of the site are polished and prepared for launch.`,
      current: quoteAgreed,
    },
    {
      num: "04",
      title: "We polish and prepare for launch",
      body: "Final adjustments, content refinements, and a full QA pass. Everything gets tightened up and made production-ready.",
    },
    {
      num: "05",
      title: "We launch your site",
      body: "Your site goes live, bundled with Sorted Updates (edit your own content) and Sorted Tracking (see your visitors and conversions).",
    },
  ]

  return (
    <>
      <main className="max-w-[680px] mx-auto px-6 sm:px-10 pt-24 pb-32">
        {/* Brand Wordmark */}
        <div className="mb-16">
          <span className="inline-block text-[33px] font-black leading-none tracking-[-0.045em] text-[#070707] sm:text-[40px]">Sorted<span className="text-[#cfe900]">.</span></span>
        </div>

        {/* Date + Private Label */}
        <div className="mb-16">
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-1">September 2026</p>
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em]">Private — for Advocate Better Care</p>
        </div>

        {/* Header */}
        <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl leading-tight tracking-tight mb-4">
          Your quote.
        </h1>
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-10">Advocate Better Care — Website Build</p>

        {/* Opening */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            Glad you like the site. This page sets out what you&rsquo;re getting, what it costs, and what happens next.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            A clean, simple offer: your website, built and launched, with the tools to manage it and measure it.
          </p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* What's Included */}
        <div className="mb-16">
          <span className="inline-block font-mono text-sm uppercase tracking-[0.15em] text-[#525252] font-bold mb-8 block">
            What you&rsquo;re getting
          </span>
          <div className="space-y-10">
            {[
              {
                num: "01",
                title: "Custom Website",
                body: "A fully designed and built website for Advocate Better Care. The site you&rsquo;ve already seen — Home, Services, About, Contact, and service detail pages. Optimised for mobile and desktop. Built to present your consultancy with clarity and trust.",
              },
              {
                num: "02",
                title: "Sorted Updates",
                body: "A content management system at your site URL /cms. Every piece of text and every image is editable without touching code. Update your services, swap photos, tweak your copy — all through a simple editor. Changes go live after you hit publish. No developer needed, no waiting.",
              },
              {
                num: "03",
                title: "Sorted Tracking",
                body: "Analytics and conversion tracking set up from day one. See how many people visit your site, where they come from, and which pages lead to enquiries. The data to know what&rsquo;s working, what isn&rsquo;t, and where to focus. No guessing — just clear numbers.",
              },
            ].map((item) => (
              <div key={item.num} className="flex gap-8">
                <span className="font-mono text-[11px] text-[#C4C4C4] tabular-nums pt-1 shrink-0">{item.num}</span>
                <div>
                  <h3 className="font-sans font-bold text-[#0A0A0A] text-lg leading-snug tracking-tight mb-2">{item.title}</h3>
                  <p className="text-[#737373] text-base leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Next Steps Progression */}
        <div className="mb-16">
          <span className="inline-block font-mono text-sm uppercase tracking-[0.15em] text-[#525252] font-bold mb-8 block">
            How this works
          </span>
          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={step.num} className="flex gap-8">
                <div className="flex flex-col items-center shrink-0">
                  {step.done ? (
                    <div className="w-7 h-7 rounded-full bg-[#0A0A0A] flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ) : step.current ? (
                    <div className="w-7 h-7 rounded-full border-2 border-[#0A0A0A] flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0A0A0A]" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full border border-black/[0.15] flex items-center justify-center">
                      <span className="font-mono text-[10px] text-[#C4C4C4]">{step.num}</span>
                    </div>
                  )}
                  {i < steps.length - 1 && (
                    <div className={`w-px flex-1 mt-1 mb-1 ${step.done ? "bg-[#0A0A0A]" : "bg-black/[0.08]"}`} style={{ minHeight: "2rem" }} />
                  )}
                </div>
                <div className="pb-2">
                  <h3 className={`font-sans font-bold text-lg leading-snug tracking-tight mb-1 ${step.current ? "text-[#0A0A0A]" : step.done ? "text-[#0A0A0A]" : "text-[#A3A3A3]"}`}>
                    {step.title}
                  </h3>
                  <p className={`text-base leading-relaxed ${step.current ? "text-[#525252]" : step.done ? "text-[#737373]" : "text-[#A3A3A3]"}`}>
                    {step.body}
                  </p>
                  {step.current && (
                    <span className="inline-block mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#0A0A0A] bg-[#cfe900] px-2 py-0.5 rounded-full font-bold">
                      You are here
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Investment */}
        <div className="mb-16">
          <span className="inline-block font-mono text-sm uppercase tracking-[0.15em] text-[#525252] font-bold mb-8 block">
            Investment
          </span>
          <div className="bg-[#0A0A0A] rounded-2xl p-8 sm:p-10 mb-6">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/60 mb-2">Project Cost</p>
            <p className="font-sans font-extrabold text-white text-5xl tracking-tight mb-3">
              £{displayAmount}
              {agreedAmount && agreedAmount !== QUOTE_AMOUNT && (
                <span className="text-2xl text-white/40 font-bold ml-3 line-through">£{QUOTE_AMOUNT}</span>
              )}
            </p>
            <p className="text-white/40 text-sm">
              {agreedAmount && agreedAmount !== QUOTE_AMOUNT
                ? `Revised price — agreed at £${agreedAmount}`
                : "One-time fee — website build, Sorted Updates, and Sorted Tracking"}
            </p>
          </div>

          {/* Deposit breakdown */}
          <div className="p-6 bg-black/[0.02] rounded-xl border border-black/[0.06] mb-6">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Payment structure</p>
            <div className="space-y-3 text-sm">
              <div className="flex gap-4 items-center">
                <span className="text-[#A3A3A3] w-40 shrink-0">Deposit (50%)</span>
                <span className="text-[#0A0A0A] font-semibold font-mono">£{depositAmount}</span>
                <span className="text-[#A3A3A3] text-xs">due now to complete the build</span>
              </div>
              <div className="flex gap-4 items-center">
                <span className="text-[#A3A3A3] w-40 shrink-0">Balance (50%)</span>
                <span className="text-[#0A0A0A] font-semibold font-mono">£{balanceAmount}</span>
                <span className="text-[#A3A3A3] text-xs">due on launch</span>
              </div>
              <div className="border-t border-black/[0.06] pt-3 flex gap-4 items-center">
                <span className="text-[#525252] w-40 shrink-0 font-medium">Total</span>
                <span className="text-[#0A0A0A] font-bold font-mono text-base">£{displayAmount}</span>
              </div>
            </div>
          </div>

          {/* Account Details — only show once a price is agreed */}
          {agreedAmount && (
            <div className="p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Bank transfer details</p>
              <div className="space-y-3 text-sm">
                <div className="flex gap-4">
                  <span className="text-[#A3A3A3] w-32 shrink-0">Business Bank</span>
                  <span className="text-[#0A0A0A] font-medium">NatWest</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-[#A3A3A3] w-32 shrink-0">Account Name</span>
                  <span className="text-[#0A0A0A] font-medium">ADX ENGINE LTD</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-[#A3A3A3] w-32 shrink-0">Sort Code</span>
                  <span className="text-[#0A0A0A] font-medium font-mono">52-30-02</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-[#A3A3A3] w-32 shrink-0">Account Number</span>
                  <span className="text-[#0A0A0A] font-medium font-mono">30189489</span>
                </div>
              </div>
              <p className="text-xs text-[#A3A3A3] mt-5 leading-relaxed">
                Please use &ldquo;Advocate Better Care&rdquo; as the payment reference. An invoice will be issued on receipt.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* What you can do / What requires Sorted */}
        <div className="mb-16">
          <span className="inline-block font-mono text-sm uppercase tracking-[0.15em] text-[#525252] font-bold mb-6 block">
            After launch
          </span>
          <div className="space-y-6">
            <div>
              <p className="font-sans font-bold text-[#0A0A0A] text-base mb-3">What you can do</p>
              <ul className="space-y-2 text-[#737373] text-base leading-relaxed">
                {[
                  "Edit any text on the site through Sorted Updates",
                  "Swap or update any image",
                  "Update your services, about page, and contact details",
                  "Publish changes that go live immediately",
                  "See visitor numbers, traffic sources, and conversion data",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-[#0A0A0A] shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-3">What requires Sorted</p>
              <ul className="space-y-1">
                {[
                  "Design changes (layout, typography, colours)",
                  "New pages or structural changes",
                  "Adding new CMS users",
                  "Any code-level modifications",
                  "Factory reset to original build",
                ].map((item) => (
                  <li key={item} className="text-sm text-[#737373]">{item}</li>
                ))}
              </ul>
              <p className="text-xs text-[#A3A3A3] mt-4">Get in touch and we&rsquo;ll scope it as a new piece of work.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Closing */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            Any questions or concerns, let me know. Otherwise, accept the quote below to get things moving.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            Once the deposit lands, I&rsquo;ll polish everything and get your site launched.
          </p>
        </div>

        {/* Quote Decision Section */}
        <div className="mb-16 pt-8 border-t border-black/[0.08]">
          {/* --- LOCKED STATES (no more changes allowed) --- */}

          {counterStatus === "review" ? (
            /* Counter-offer sent for review */
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2v8M10 14v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900">Proposal sent for review</h3>
                  <p className="text-amber-700 text-sm">Your proposal of £{pendingAmount ?? counterValue} has been sent to Renaldo.</p>
                </div>
              </div>
              <p className="text-amber-800 text-sm mt-3 leading-relaxed">
                You&rsquo;ll hear back within 24 hours. If you&rsquo;d rather not wait, you can accept the original quote of £{QUOTE_AMOUNT}.
              </p>
              {counterPhase !== "locked" && (
                <button
                  type="button"
                  onClick={handleReviseFromReview}
                  className="mt-4 w-full bg-amber-900 text-white font-semibold rounded-lg px-4 py-3 hover:bg-amber-800 transition-colors"
                >
                  Revise — one last counter
                </button>
              )}
              <button
                type="button"
                onClick={handleAcceptQuote}
                className={`w-full font-semibold rounded-lg px-4 py-3 transition-colors ${counterPhase !== "locked" ? "mt-2 border border-amber-300 text-amber-900 hover:bg-amber-100" : "mt-4 bg-amber-900 text-white hover:bg-amber-800"}`}
              >
                Accept original quote — £{QUOTE_AMOUNT}
              </button>
            </div>
          ) : counterStatus === "accepted" && agreedAmount && counterPhase === "locked" ? (
            /* Counter-offer auto-accepted (locked) */
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10L8 14L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">We accept your revised price.</h3>
                    <p className="text-green-700 text-sm">Your quote is now £{agreedAmount}.</p>
                  </div>
                </div>
                <p className="text-green-800 text-sm mt-3 leading-relaxed">
                  Review and accept the terms below to proceed.
                </p>
              </div>

              {/* Accept button */}
              {!isSigned ? (
                <>
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Review & Accept</p>
                  <button
                    type="button"
                    onClick={() => setShowAgreement(true)}
                    className="w-full bg-[#0A0A0A] text-[#FAFAFA] font-semibold rounded-xl px-6 py-4 hover:bg-[#1a1a1a] transition-colors"
                  >
                    Review & Accept £{agreedAmount}
                  </button>
                  <p className="text-center text-[#A3A3A3] text-xs mt-4">
                    Review the terms, then sign to accept.
                  </p>
                </>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 10L8 14L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">Quote Accepted</h3>
                      <p className="text-green-700 text-sm">Signed by {signerName}{signedAt ? ` on ${formatDate(signedAt)}` : ""}</p>
                    </div>
                  </div>
                  <p className="text-green-800 text-sm mt-3 leading-relaxed">
                    Next step: send the £{depositAmount}&nbsp;deposit to the account details above. Once it lands, I&rsquo;ll polish the site and prepare for launch.
                  </p>
                </div>
              )}
            </>
          ) : isSigned ? (
            /* Already signed (original quote) */
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10L8 14L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Quote Accepted</h3>
                  <p className="text-green-700 text-sm">Signed by {signerName}{signedAt ? ` on ${formatDate(signedAt)}` : ""}</p>
                </div>
              </div>
              <p className="text-green-800 text-sm mt-3 leading-relaxed">
                Next step: send the £{depositAmount}&nbsp;deposit to the account details above. Once it lands, I&rsquo;ll polish the site and prepare for launch.
              </p>
            </div>
          ) : counterPhase === "warning" && pendingAmount ? (
            /* --- WARNING PHASE: low offer confirmation --- */
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L2 17h16L10 2z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M10 8v4M10 14v1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900">This is significantly below the asking price.</h3>
                  <p className="text-amber-700 text-sm">You proposed £{pendingAmount} on a quote of £{QUOTE_AMOUNT}.</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-amber-800 leading-relaxed mb-6">
                <p>
                  That&rsquo;s {Math.round((pendingAmount / QUOTE_AMOUNT) * 100)}% of the asking price.
                  Proposals like this go to Renaldo for personal review — you&rsquo;ll hear back within 24 hours.
                </p>
                <p className="font-medium">
                  You have <strong>1 attempt remaining</strong> to propose a different amount.
                  Once you confirm, your price is locked and can&rsquo;t be changed.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAdjustFromWarning}
                  className="flex-1 px-4 py-3 border border-amber-300 rounded-lg text-amber-900 font-medium hover:bg-amber-100 transition-colors"
                >
                  Adjust my offer
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLow}
                  disabled={counterStatus === "submitting"}
                  className="flex-1 bg-amber-900 text-white font-semibold rounded-lg px-4 py-3 hover:bg-amber-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {counterStatus === "submitting" ? "Submitting..." : `Confirm £${pendingAmount} for review`}
                </button>
              </div>
            </div>
          ) : !showCounterInput ? (
            /* --- INITIAL: two options --- */
            <>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Your quote</p>
              <button
                type="button"
                onClick={handleAcceptQuote}
                className="w-full bg-[#0A0A0A] text-[#FAFAFA] font-semibold rounded-xl px-6 py-4 hover:bg-[#1a1a1a] transition-colors mb-3"
              >
                Accept quote — £{QUOTE_AMOUNT}
              </button>
              <button
                type="button"
                onClick={() => setShowCounterInput(true)}
                className="w-full bg-white text-[#0A0A0A] font-semibold rounded-xl px-6 py-4 hover:bg-black/[0.02] transition-colors border border-black/[0.12]"
              >
                Propose a different amount
              </button>
            </>
          ) : (
            /* --- COUNTER-OFFER INPUT --- */
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252]">Propose a different amount</p>
                <span className="font-mono text-xs text-[#A3A3A3]">
                  Attempt {attempts + 1} of {MAX_ATTEMPTS}
                </span>
              </div>
              <form onSubmit={handleCounterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0A0A0A] mb-2">
                    Your proposed price (£)
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-[#0A0A0A]">£</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={counterValue}
                      onChange={(e) => setCounterValue(e.target.value)}
                      placeholder="Enter your price"
                      className="flex-1 px-4 py-3 bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] text-lg font-semibold placeholder:text-[#A3A3A3] placeholder:font-normal placeholder:text-base focus:outline-none focus:border-black/[0.3] transition-colors"
                      autoFocus
                    />
                  </div>
                  {counterValue && parseInt(counterValue, 10) > 0 && (() => {
                    const zone = getZone(parseInt(counterValue, 10))
                    if (zone === "auto") {
                      return <p className="text-sm text-green-600 mt-2 font-medium">✓ This will be automatically accepted</p>
                    }
                    if (zone === "review") {
                      return <p className="text-sm text-amber-600 mt-2 font-medium">This will be sent to Renaldo for review</p>
                    }
                    return <p className="text-sm text-red-500 mt-2 font-medium">This is significantly below the asking price — you&rsquo;ll be asked to confirm</p>
                  })()}
                  {counterError && (
                    <p className="text-sm text-red-500 mt-2">{counterError}</p>
                  )}
                </div>

                {/* Live preview */}
                {counterValue && parseInt(counterValue, 10) > 0 && (
                  <div className="p-4 bg-black/[0.02] rounded-xl border border-black/[0.06]">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#A3A3A3]">Your proposal</span>
                        <span className="text-[#0A0A0A] font-semibold font-mono">£{parseInt(counterValue, 10)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A3A3A3]">Deposit (50%)</span>
                        <span className="text-[#0A0A0A] font-mono">£{Math.round(parseInt(counterValue, 10) / 2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A3A3A3]">Balance (50%)</span>
                        <span className="text-[#0A0A0A] font-mono">£{parseInt(counterValue, 10) - Math.round(parseInt(counterValue, 10) / 2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCounterInput(false)
                      setCounterValue("")
                      setCounterError("")
                    }}
                    className="flex-1 px-4 py-3 border border-black/[0.12] rounded-lg text-[#525252] font-medium hover:bg-black/[0.02] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={counterStatus === "submitting" || !counterValue}
                    className="flex-1 bg-[#0A0A0A] text-[#FAFAFA] font-semibold rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {counterStatus === "submitting" ? "Submitting..." : "Submit proposal"}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Error state */}
          {counterStatus === "error" && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{counterError}</p>
              <button
                type="button"
                onClick={() => {
                  setCounterStatus("idle")
                  setCounterPhase("input")
                }}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-500 transition-colors"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Agreement Modal */}
        {showAgreement && mounted && createPortal(
          <div
            className="bg-black/60 flex items-center justify-center p-4"
            style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999 }}
            onClick={() => setShowAgreement(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl flex flex-col"
              style={{ maxHeight: "calc(100vh - 2rem)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08] shrink-0">
                <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Quote Terms</h3>
                <button
                  type="button"
                  onClick={() => setShowAgreement(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/[0.06] transition-colors text-[#525252]"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <div className="px-6 py-5 overflow-y-auto flex-1">
                <div className="bg-black/[0.02] rounded-xl p-5 mb-6 space-y-4 text-sm text-[#525252] max-h-64 overflow-y-auto">
                  <p><strong className="text-[#0A0A0A]">1. Services</strong><br/>
                  Sorted agrees to deliver a custom website for Advocate Better Care, bundled with Sorted Updates (content management system) and Sorted Tracking (analytics and conversion tracking). The website is the build Mark Easie has already reviewed and approved.</p>

                  <p><strong className="text-[#0A0A0A]">2. Fee</strong><br/>
                  £{displayAmount} total. A 50% deposit (£{depositAmount}) is due to complete the build. The remaining 50% (£{balanceAmount}) is due on launch.</p>

                  <p><strong className="text-[#0A0A0A]">3. Timeline</strong><br/>
                  Once the deposit is received, the site will be polished and prepared for launch. Launch follows once the balance is settled.</p>

                  <p><strong className="text-[#0A0A0A]">4. Content Ownership</strong><br/>
                  The client owns all content added through the CMS. Sorted retains ownership of the design, code structure, and build system.</p>

                  <p><strong className="text-[#0A0A0A]">5. CMS Usage</strong><br/>
                  The client is responsible for content published through Sorted Updates. Content that is defamatory, infringing, or illegal is the client&rsquo;s responsibility.</p>

                  <p><strong className="text-[#0A0A0A]">6. Design Changes</strong><br/>
                  Layout, structure, typography, and code changes are not included after launch. These can be commissioned separately.</p>

                  <p><strong className="text-[#0A0A0A]">7. Factory Reset</strong><br/>
                  Sorted retains the ability to restore content to the original handoff state. This may be used with client consent or in cases of site damage.</p>

                  <p><strong className="text-[#0A0A0A]">8. Payment</strong><br/>
                  All payments to be made to ADX ENGINE LTD, NatWest, Sort Code 52-30-02, Account Number 30189489. Please use &ldquo;Advocate Better Care&rdquo; as the payment reference.</p>

                  <p><strong className="text-[#0A0A0A]">9. Portfolio</strong><br/>
                  Sorted retains the right to display this work in its portfolio and reference materials.</p>
                </div>

                <form onSubmit={handleSignatureSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-2">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="Enter your name to sign"
                      className="w-full px-4 py-3 bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-black/[0.3] transition-colors"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAgreement(false)}
                      className="flex-1 px-4 py-3 border border-black/[0.12] rounded-lg text-[#525252] font-medium hover:bg-black/[0.02] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#0A0A0A] text-[#FAFAFA] font-semibold rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors"
                    >
                      Accept & Sign
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Signature */}
        <div className="mb-24">
          <p className="font-sans font-bold text-[#0A0A0A] text-lg">Renaldo Edmondson</p>
          <p className="text-[#A3A3A3] text-sm">Sorted</p>
        </div>

        {/* Footer */}
        <div className="border-t border-black/[0.06] pt-8 flex items-center justify-between">
          <span className="text-sm font-black tracking-[-0.045em] text-[#070707]">Sorted<span className="text-[#cfe900]">.</span></span>
          <button
            onClick={handleSignOut}
            className="text-xs text-[#A3A3A3] hover:text-[#525252] transition-colors font-mono"
          >
            Sign out
          </button>
        </div>
      </main>
    </>
  )
}
