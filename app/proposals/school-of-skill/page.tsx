"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

const AUTH_KEY = "sos_auth"
const AUTH_EXPIRY_DAYS = 30

export default function SchoolOfSkillProposal() {
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

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.toLowerCase() === "sos2026") {
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

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <div className="mb-8">
            <span className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight">Sorted.</span>
          </div>
          <h1 className="font-sans font-bold text-[#0A0A0A] text-xl mb-2">Private Proposal</h1>
          <p className="text-[#737373] text-sm mb-6">Enter the password to view this engagement plan.</p>
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
              View Plan
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="max-w-[680px] mx-auto px-6 sm:px-10 pt-24 pb-32">
        {/* Date + Private Label */}
        <div className="mb-16">
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-1">August 2026</p>
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em]">Private, for Dalian, School of Skill</p>
        </div>

        {/* Header */}
        <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl leading-tight tracking-tight mb-10">
          SOS 90 Day Plan.
        </h1>

        {/* Opening */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            A short version of the 90-day plan. Four priorities, simple measures, clear costs.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            The goal: make School of Skill less dependent on Dalian personally delivering every pound of revenue.
          </p>
          <p>
            Every task this quarter must do one of four things: create revenue, protect revenue, reduce risk, or make future growth easier.
          </p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* The 4 Priorities */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            The 4 priorities this quarter
          </span>
          <div className="space-y-10">
            {[
              {
                num: "01",
                title: "School Acquisition System",
                body: "Build a repeatable way to win institutional work. One clear programme offer and price. The current PRU success written up as a case study. A prospect list of schools and PRUs, plus a simple CRM pipeline.",
                target: "At least one new paid school programme or pilot.",
              },
              {
                num: "02",
                title: "Repurpose the 1:1s",
                body: "Redesign coaching so it earns more per hour, not more hours. Limited premium 1:1 slots. Small-group development sessions. Recurring monthly programmes.",
                target: "Protect the ~£1,000/month while reducing Dalian's hours.",
              },
              {
                num: "03",
                title: "October Half-Term Camp",
                body: "Treat it as a commercial launch, not a social post. Identify the full cost, ticket price and break-even number first. Build a registration landing page on the new website and wire up the registration process. Shoot video and content for the promo. Execute ads across TikTok, Instagram and Facebook.",
                target: "Hit minimum paid bookings before committing to the cost of the event.",
              },
              {
                num: "04",
                title: "Venue & Facility",
                body: "Reduce dependency on facilities we don't control. Push for a stronger written agreement with Holly Lodge. Identify at least one credible backup venue. Assess costings for an independent basketball studio in a converted warehouse.",
                target: "Understand the economics.",
              },
            ].map((item) => (
              <div key={item.num} className="flex gap-8">
                <span className="font-mono text-[11px] text-[#C4C4C4] tabular-nums pt-1 shrink-0">{item.num}</span>
                <div>
                  <h3 className="font-sans font-bold text-[#0A0A0A] text-lg leading-snug tracking-tight mb-2">{item.title}</h3>
                  <p className="text-[#737373] text-base leading-relaxed mb-3">{item.body}</p>
                  <p className="text-sm text-[#0A0A0A] font-medium">
                    <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#A3A3A3] mr-2">Target</span>
                    {item.target}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* What We Measure */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            What we measure
          </span>
          <div className="border border-black/[0.08] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-black/[0.02] border-b border-black/[0.08]">
                  <th className="text-left font-mono text-xs uppercase tracking-[0.12em] text-[#525252] font-medium px-5 py-3">Measure</th>
                  <th className="text-left font-mono text-xs uppercase tracking-[0.12em] text-[#525252] font-medium px-5 py-3">Now</th>
                  <th className="text-left font-mono text-xs uppercase tracking-[0.12em] text-[#525252] font-medium px-5 py-3">Direction</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["SOS Monthly revenue", "~£3,500", "↑"],
                  ["Paying institutions", "1", "↑"],
                  ["Coaching revenue per hour", "To measure", "↑"],
                  ["Camp paid bookings", "0", "Break-even first"],
                  ["Venue dependency", "High", "↓"],
                  ["Cash reserve", "~£2,000", "Protect"],
                ].map(([measure, now, direction], i) => (
                  <tr key={measure} className={i % 2 === 1 ? "bg-black/[0.015]" : ""}>
                    <td className="px-5 py-3 text-[#0A0A0A] font-medium">{measure}</td>
                    <td className="px-5 py-3 text-[#737373]">{now}</td>
                    <td className="px-5 py-3 text-[#737373]">{direction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Investment */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            Investment
          </span>

          {/* Retainer */}
          <div className="bg-[#0A0A0A] rounded-2xl p-8 sm:p-10 mb-6">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/60 mb-2">Strategic Growth Retainer</p>
            <p className="font-sans font-extrabold text-white text-5xl tracking-tight mb-4">£1,000<span className="text-2xl text-white/50 font-bold"> /mo</span></p>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Covers strategy (mentorship is a natural part), tech and marketing infrastructure: offer and pricing design, sales system, CRM (where student profiles are built and will live), marketing and website direction, partnerships and facility economics.
            </p>
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-white/60 text-sm">Initial commitment</p>
                <p className="text-white font-semibold">60 days</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-white/60 text-sm">Formal review</p>
                <p className="text-white font-semibold">60 or 90 days</p>
              </div>
            </div>
          </div>

          {/* Website */}
          <div className="p-6 bg-black/[0.02] rounded-xl border border-black/[0.06] mb-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-sans font-bold text-[#0A0A0A] text-lg tracking-tight">Website</p>
                <p className="text-[#737373] text-sm mt-1">£500 with 30-day terms</p>
              </div>
              <p className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight">£500</p>
            </div>
            <p className="text-[#737373] text-sm leading-relaxed mb-4">
              £250 on commencement. The remaining £250 once new revenue has been generated. We can hold the balance for 30 days from the start of the project. Work begins immediately, but the second payment only lands after there has been time to generate new revenue and assess what the reserves can comfortably afford.
            </p>
            <p className="text-[#525252] text-sm leading-relaxed">
              The website's job is to convert: parent enquiries and bookings, school consultations, and camp registrations. Number of visits is not a success measure.
            </p>
          </div>

          {/* First 90 Milestone */}
          <div className="p-6 bg-[#F5F5F5] rounded-xl border border-black/[0.06]">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-3">First 90 milestone</p>
            <p className="text-[#0A0A0A] text-lg leading-relaxed font-medium mb-3">
              Generate the first £5,000–£10,000 of new contracted or collected revenue through the new system.
            </p>
            <p className="text-[#737373] text-sm leading-relaxed">
              At that point the retainer pays for itself, marketing becomes safer, extra coaching capacity becomes possible, and the facility conversation becomes credible.
            </p>
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Payment Terms & Schedule */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4 block">
            Payment terms & schedule
          </span>
          <p className="text-[#737373] text-base leading-relaxed mb-6">
            Recurring costs should come out of trading income, not the £2,000 reserve. So the payments are split. Nothing lands bigger than £750.
          </p>
          <div className="p-5 bg-[#0A0A0A] rounded-xl mb-6">
            <p className="text-white/70 text-sm leading-relaxed">
              <span className="font-semibold text-white">This is a payment schedule, not a performance condition.</span> The retainer is £1,000 per month. What flexes is when it is collected.
            </p>
          </div>

          <div className="border border-black/[0.08] rounded-xl overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-black/[0.02] border-b border-black/[0.08]">
                  <th className="text-left font-mono text-xs uppercase tracking-[0.12em] text-[#525252] font-medium px-5 py-3">When</th>
                  <th className="text-left font-mono text-xs uppercase tracking-[0.12em] text-[#525252] font-medium px-5 py-3">What</th>
                  <th className="text-right font-mono text-xs uppercase tracking-[0.12em] text-[#525252] font-medium px-5 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Start Month 1", "Retainer (first half) + website deposit", "£750"],
                  ["End Month 1", "Retainer (second half)", "£500"],
                  ["Day 30 – 60", "Website balance", "£250"],
                  ["Start Month 2", "Retainer (first half)", "£500"],
                  ["End Month 2", "Retainer (second half)", "£500"],
                ].map(([when, what, amount], i) => (
                  <tr key={when} className={i % 2 === 1 ? "bg-black/[0.015]" : ""}>
                    <td className="px-5 py-3 text-[#0A0A0A] font-medium whitespace-nowrap">{when}</td>
                    <td className="px-5 py-3 text-[#737373]">{what}</td>
                    <td className="px-5 py-3 text-[#0A0A0A] font-semibold text-right tabular-nums">{amount}</td>
                  </tr>
                ))}
                <tr className="bg-black/[0.03] border-t-2 border-black/[0.12]">
                  <td className="px-5 py-4 text-[#0A0A0A] font-bold" colSpan={2}>Total across the 60-day commitment</td>
                  <td className="px-5 py-4 text-[#0A0A0A] font-extrabold text-right tabular-nums text-lg">£2,500</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 text-sm text-[#737373] mb-2">
            <li className="flex gap-3"><span className="text-[#0A0A0A]">·</span>Retainer: £1,000/month, collected as 2 × £500</li>
            <li className="flex gap-3"><span className="text-[#0A0A0A]">·</span>Website: £500, collected as 2 × £250</li>
          </ul>
          <p className="text-xs text-[#A3A3A3] mt-4">An invoice will be issued at the start of the month and 7 days before the end of the month.</p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Account Details */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6 block">
            Account details
          </span>
          <div className="p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
            <div className="space-y-3 text-sm">
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
              Use the payment schedule above as your reference. An invoice will be issued at the start of the month and 7 days before the end of the month.
            </p>
          </div>
        </div>

        {/* After the Review */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6 block">
            After the review
          </span>
          <div className="space-y-4 text-[#737373] text-base leading-relaxed">
            <p>
              After 60 days we want to be able to identify direct attributable revenue from the partnership. If this is returning clear value, we will review the revenue model in 90 days.
            </p>
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Closing */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            Four priorities. Simple measures. A payment schedule built around cashflow, not ambition. The first milestone is £5,000 to £10,000 of new revenue through the system. At that point everything after becomes safer.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            If this looks right, accept below and we'll get started.
          </p>
        </div>

        {/* Agreement Modal Trigger */}
        {!isSigned ? (
          <section className="mb-16 pt-8 border-t border-black/[0.08]">
            <button
              onClick={() => setShowAgreement(true)}
              className="w-full bg-[#0A0A0A] text-[#FAFAFA] font-semibold rounded-xl px-6 py-4 hover:bg-[#1a1a1a] transition-colors"
            >
              Review & Accept Agreement
            </button>
            <p className="text-center text-[#A3A3A3] text-xs mt-4">
              Review the engagement terms, then sign to accept.
            </p>
          </section>
        ) : (
          <section className="mb-16 pt-8 border-t border-black/[0.08]">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10L8 14L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Plan Accepted</h3>
                  <p className="text-green-700 text-sm">Signed by {signerName}{signedAt ? ` on ${formatDate(signedAt)}` : ""}</p>
                </div>
              </div>
            </div>
          </section>
        )}

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
                <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Engagement Terms</h3>
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
                  Sorted agrees to provide strategic growth support across the four priorities: School Acquisition System, Repurposing the 1:1s, October Half-Term Camp launch, and Venue & Facility economics. This includes strategy, tech and marketing infrastructure, CRM, website direction, and partnerships.</p>

                  <p><strong className="text-[#0A0A0A]">2. Retainer</strong><br/>
                  £1,000 per month, collected as 2 x £500 per month. Initial commitment is 60 days, with a formal review at 60 or 90 days subject to success and cashflow.</p>

                  <p><strong className="text-[#0A0A0A]">3. Website</strong><br/>
                  £500 total. £250 on commencement, £250 balance once new revenue has been generated, held for up to 30 days from project start.</p>

                  <p><strong className="text-[#0A0A0A]">4. Payment Schedule</strong><br/>
                  Total across the 60-day commitment is £2,500, split so no single payment exceeds £750. Invoices issued at the start of the month and 7 days before the end of the month. This is a payment schedule, not a performance condition.</p>

                  <p><strong className="text-[#0A0A0A]">5. Review</strong><br/>
                  After 60 days, direct attributable revenue from the partnership will be identified. If returning clear value, the revenue model will be reviewed at 90 days.</p>

                  <p><strong className="text-[#0A0A0A]">6. Payment</strong><br/>
                  All payments to be made to ADX ENGINE LTD, Sort Code 52-30-02, Account Number 30189489.</p>

                  <p><strong className="text-[#0A0A0A]">7. Cancellation</strong><br/>
                  Either party may end the engagement at the formal review point. Work completed and costs incurred up to that point will be settled in full.</p>
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
          <p className="font-sans font-bold text-[#0A0A0A] text-lg">Renaldo</p>
          <p className="text-[#A3A3A3] text-sm">Sorted</p>
        </div>

        {/* Footer */}
        <div className="border-t border-black/[0.06] pt-8 flex items-center justify-between">
          <p className="text-xs text-[#C4C4C4] font-mono">Sorted. - sortmydigital.site</p>
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
