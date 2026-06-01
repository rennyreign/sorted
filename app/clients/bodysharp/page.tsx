"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

const AUTH_KEY = "bodysharp_auth"
const AUTH_EXPIRY_DAYS = 30

export default function BodysharpRetainer() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const [signerName, setSignerName] = useState("")
  const [showAgreement, setShowAgreement] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const [signedAt, setSignedAt] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      try {
        const { expires, signature } = JSON.parse(stored)
        if (new Date().getTime() < expires) {
          setIsAuthenticated(true)
          if (signature) {
            setIsSigned(true)
            setSignedAt(signature.signedAt)
            setSignerName(signature.signerName)
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

  const saveAuth = (signatureData?: { signerName: string; signedAt: string }) => {
    const expires = new Date().getTime() + (AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    const data: { expires: number; signature?: { signerName: string; signedAt: string } } = { expires }
    if (signatureData) data.signature = signatureData
    localStorage.setItem(AUTH_KEY, JSON.stringify(data))
  }

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
    setIsSigned(false)
    setSignerName("")
    setSignedAt(null)
  }

  const handleSignatureSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (signerName.trim()) {
      const now = new Date().toISOString()
      setIsSigned(true)
      setSignedAt(now)
      saveAuth({ signerName: signerName.trim(), signedAt: now })
      setShowAgreement(false)
    }
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.toLowerCase() === "mikey2026") {
      setIsAuthenticated(true)
      setError(false)
      saveAuth()
    } else {
      setError(true)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-black/[0.1] border-t-[#0A0A0A] rounded-full animate-spin" />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-white">
        <div className="max-w-sm w-full">
          <div className="mb-8">
            <span className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight">Sorted.</span>
          </div>
          <h1 className="font-sans font-bold text-[#0A0A0A] text-xl mb-2">Private — For Michael Edmeads</h1>
          <p className="text-[#737373] text-sm mb-6">Enter the password to view your marketing retainer agreement.</p>
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
              View Agreement
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="max-w-[720px] mx-auto px-6 sm:px-10 pt-24 pb-32 bg-white">

        {/* Date + Private Label */}
        <div className="mb-16">
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-1">June 2026</p>
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em]">Private — for Michael Edmeads</p>
        </div>

        {/* Header */}
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-3">Bodysharp Fitness · Marketing Retainer</p>
          <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl leading-tight tracking-tight mb-4">
            Lifting energy. Building momentum.
          </h1>
        </div>

        {/* Mission Statement */}
        <div className="mb-16 p-6 bg-[#F5F5F5] rounded-xl border-l-4 border-[#0A0A0A]">
          <p className="text-[#525252] text-base leading-relaxed italic">
            "Michael's core mission is to help lift people's energy — transforming not just bodies, but mindsets, confidence, and daily vitality. This retainer exists to build the marketing infrastructure that gets that energy in front of the people who need it most."
          </p>
        </div>

        {/* Opening */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            This document outlines our month-to-month marketing partnership. We're building a complete revenue pipeline ecosystem — from lead capture to conversion, with landing pages, targeted campaigns, and operators speaking directly to your ideal customer profiles.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            Review it, accept it, and we get to work.
          </p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* What You Get */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            Monthly services
          </span>
          <div className="space-y-10">
            {[
              {
                num: "01",
                title: "Marketing Strategy & Execution",
                body: "Full management of your marketing month-to-month. Campaign planning, audience targeting, creative direction, and performance optimisation with the goal of turning every campaign into positive revenue.",
              },
              {
                num: "02",
                title: "Revenue Pipeline Ecosystem",
                body: "Building the complete lead-to-revenue flow: lead capture systems, nurture sequences, conversion funnels, and automated follow-ups. Every touchpoint designed to move prospects toward transformation.",
              },
              {
                num: "03",
                title: "Landing Pages & Campaign Assets",
                body: "Custom landing pages for specific events, offers, and challenges. Each page optimised for conversion and matched to the energy of your brand — no templates, no generic fitness noise.",
              },
              {
                num: "04",
                title: "ICP-Specific Operators",
                body: "Dedicated marketing operators speaking directly to your Ideal Customer Profiles — whether that's busy professionals, transformation seekers, or retreat attendees. Messaging tailored to what lifts each group.",
              },
              {
                num: "05",
                title: "Brand & Creative Development",
                body: "Building out the full Bodysharp brand system: visual identity refinement, content calendars, social assets, and creative that reflects Mikey's energy and the transformation you deliver.",
              },
              {
                num: "06",
                title: "Reporting & Optimisation",
                body: "Regular performance reports showing what's working, where leads are coming from, and how revenue is tracking. Continuous iteration based on real data, not guesses.",
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

        {/* Investment */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            Investment
          </span>
          <div className="bg-[#0A0A0A] rounded-2xl p-8 sm:p-10 mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/60 mb-2">Monthly Retainer</p>
            <p className="font-sans font-extrabold text-white text-5xl tracking-tight mb-3">£400</p>
            <p className="text-white/40 text-sm">per month, rolling 30-day agreement</p>
          </div>
          <div className="p-6 bg-black/[0.02] rounded-xl border border-black/[0.06] mb-6">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-3">What's included</p>
            <div className="space-y-2 text-sm text-[#737373]">
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-32 shrink-0">Strategy</span>
                <span>Full marketing strategy & execution</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-32 shrink-0">Creative</span>
                <span>Landing pages, assets, campaign builds</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-32 shrink-0">Systems</span>
                <span>Lead capture, nurture flows, automation</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-32 shrink-0">Reporting</span>
                <span>Performance tracking & optimisation</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#F5F5F5] rounded-xl border border-black/[0.06]">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Payment details</p>
            <div className="space-y-3 text-sm">
              {[
                ["Currency", "British Pound (GBP)"],
                ["Beneficiary", "Renaldo Lee Edmondson"],
                ["Sort code", "23-01-20"],
                ["Account number", "83621039"],
                ["Bank", "Revolut Ltd, 30 South Colonnade, E14 5HX, London, United Kingdom"],
                ["Reference", "Bodysharp Retainer"],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-[#A3A3A3]">{label}</span>
                  <span className="font-mono text-[#0A0A0A]">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#A3A3A3] mt-4">Standard UK bank transfer. Please use the reference above so we can match your payment.</p>
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* How We Work Together */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6 block">
            How we work together
          </span>
          <ul className="space-y-3 text-[#737373] text-base leading-relaxed">
            {[
              "Monthly strategy calls to align on priorities",
              "Weekly updates on campaign performance",
              "Direct Slack/WhatsApp access for quick decisions",
              "All creative approved by you before going live",
              "30-day rolling terms — adjust or pause with notice",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-[#0A0A0A]">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What Requires Additional Scope */}
        <div className="mb-16 p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">Outside monthly retainer</p>
          <ul className="space-y-1">
            {[
              "Major website rebuilds or new platform builds",
              "Paid media spend (budget managed separately)",
              "Photography/videography production",
              "Event management & logistics",
            ].map((item) => (
              <li key={item} className="text-sm text-[#737373]">{item}</li>
            ))}
          </ul>
          <p className="text-xs text-[#A3A3A3] mt-4">These can be discussed and scoped separately as needed.</p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Closing */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            The goal is simple: build a marketing machine that lifts your energy into the world and turns that momentum into revenue. Every campaign, every landing page, every touchpoint designed to bring the right people into your transformation ecosystem.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            Ready to get started?
          </p>
        </div>

        {/* Accept Section */}
        <div className="mb-16 pt-8 border-t border-black/[0.08]">
          {!isSigned ? (
            <>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Review & Accept</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="flex-1 px-4 py-3 bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-black/[0.3] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowAgreement(true)}
                  disabled={!signerName.trim()}
                  className="bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-6 py-3 hover:bg-[#2a2a2a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  Review & Accept
                </button>
              </div>
              <p className="text-xs text-[#A3A3A3] mt-3">By accepting, you agree to the retainer terms outlined in this document.</p>
            </>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-green-700 mb-2">Retainer Accepted</p>
              <p className="text-green-800 text-[2rem]" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                {signerName}
              </p>
              <p className="text-xs text-green-600 mt-2">Signed on {signedAt ? formatDate(signedAt) : ""}</p>
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
                <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Retainer Terms</h3>
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
                <div className="space-y-4 text-sm text-[#525252] leading-relaxed">
                  <p>
                    <strong className="text-[#0A0A0A]">1. Retainer Agreement:</strong> Sorted will provide the monthly marketing services described in this document to Bodysharp Fitness, managed by Michael Edmeads.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">2. Term:</strong> This is a rolling 30-day agreement. Either party may give 14 days' notice to pause or terminate. No long-term lock-in.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">3. Payment:</strong> £400 per month, due at the start of each month. First payment confirms commencement of work.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">4. Scope:</strong> Services include marketing strategy, campaign execution, landing page builds, lead capture systems, and reporting. Additional services can be scoped separately.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">5. Creative Ownership:</strong> All creative assets produced remain the property of Bodysharp Fitness. Sorted may request permission to showcase work in portfolio.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">6. Performance:</strong> While every effort is made to generate positive revenue, results depend on market conditions, offer strength, and external factors. Sorted commits to transparency and continuous optimisation.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">7. Communication:</strong> Regular touchpoints via agreed channels (calls, Slack, WhatsApp) with response times within 24 hours on business days.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-black/[0.08] shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAgreement(false)}
                  className="flex-1 px-4 py-3 border border-black/[0.12] rounded-lg text-[#525252] font-medium text-sm hover:bg-black/[0.02] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSignatureSubmit}
                  className="flex-1 bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors"
                >
                  I Accept — Sign as {signerName}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Signature */}
        <div className="mb-24">
          <p className="font-sans font-bold text-[#0A0A0A] text-lg">Renaldo</p>
          <p className="text-[#A3A3A3] text-sm">Sorted · ADX Engine</p>
        </div>

        {/* Footer */}
        <div className="border-t border-black/[0.06] pt-8 flex items-center justify-between">
          <p className="text-xs text-[#C4C4C4] font-mono">Sorted. — sortmydigital.netlify.app</p>
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
