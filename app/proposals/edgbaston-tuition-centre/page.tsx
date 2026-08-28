"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

const AUTH_KEY = "etc_auth"
const AUTH_EXPIRY_DAYS = 30

export default function EdgbastonTuitionCentreProposal() {
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
    if (password.toLowerCase() === "edgbaston2026") {
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
            <span className="inline-block text-[33px] font-black leading-none tracking-[-0.045em] text-[#070707] sm:text-[40px]">Sorted<span className="text-[#cfe900]">.</span></span>
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
        {/* Brand Wordmark */}
        <div className="mb-16">
          <span className="inline-block text-[33px] font-black leading-none tracking-[-0.045em] text-[#070707] sm:text-[40px]">Sorted<span className="text-[#cfe900]">.</span></span>
        </div>

        {/* Date + Private Label */}
        <div className="mb-16">
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-1">August 2026</p>
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em]">Private, for Edgbaston Tuition Centre</p>
        </div>

        {/* Header */}
        <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl leading-tight tracking-tight mb-10">
          Digital Commercial Infrastructure Plan.
        </h1>

        {/* Service Overview */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            I will take ongoing responsibility for Edgbaston Tuition Centre&rsquo;s digital commercial infrastructure: how the centre presents itself, creates demand, converts interest, follows up with parents, and learns from the results.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            The aim is to make the centre easier to understand, easier to trust, and easier to enquire with, before adding further advertising spend.
          </p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* What the Service Includes */}
        <div className="mb-16">
          <span className="inline-block font-mono text-sm uppercase tracking-[0.15em] text-[#525252] font-bold mb-8 block">
            What the service includes
          </span>
          <div className="space-y-10">
            {[
              {
                num: "01",
                title: "Website rebuild and improvement",
                items: [
                  "Full website redesign and rebuild",
                  "Clearer presentation of the centre, programmes, results and proof",
                  "Stronger enquiry routes across forms, WhatsApp, phone and booking links",
                  "Landing pages for specific offers where useful",
                  "Ongoing website improvements based on response and results",
                ],
              },
              {
                num: "02",
                title: "Offer and customer journey",
                items: [
                  "Packaging existing services into clearer offers",
                  "Making each offer easier for parents to understand",
                  "Improving the route from interest to enquiry",
                  "Creating clearer follow-up around enquiries, free lessons and consultations",
                  "Refining offers based on what parents respond to",
                ],
              },
              {
                num: "03",
                title: "Reviews and local trust",
                items: [
                  "Simple Google review request process",
                  "Email and WhatsApp follow-up to encourage reviews from existing families",
                  "Better use of testimonials and parent proof across the website",
                  "Monitoring review volume and recency",
                  "Using stronger recent proof to improve trust and local visibility",
                ],
              },
              {
                num: "04",
                title: "Measurement",
                items: [
                  "Website and enquiry tracking",
                  "Enquiry-source tracking",
                  "Simple reporting on visits, enquiries, leads and customer outcomes",
                  "Monthly review of what happened, what worked, and what should be improved next",
                ],
              },
              {
                num: "05",
                title: "Advertising readiness",
                items: [
                  "Advertising strategy across Google, Instagram, TikTok and Facebook",
                  "Campaign planning and offer testing",
                  "Landing pages for campaigns",
                  "Reintroduction of paid ads only once the website, offers and tracking are in better condition",
                ],
              },
            ].map((section) => (
              <div key={section.num} className="flex gap-8">
                <span className="font-mono text-[11px] text-[#C4C4C4] tabular-nums pt-1 shrink-0">{section.num}</span>
                <div>
                  <h3 className="font-sans font-bold text-[#0A0A0A] text-lg leading-snug tracking-tight mb-3">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-[#737373] text-base leading-relaxed flex gap-3">
                        <span className="text-[#0A0A0A] shrink-0">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Month One Focus */}
        <div className="mb-16">
          <span className="inline-block font-mono text-sm uppercase tracking-[0.15em] text-[#525252] font-bold mb-8 block">
            Month-one focus
          </span>
          <div className="space-y-6 text-[#525252] text-base leading-relaxed mb-8">
            <p>
              The first month is focused on improving the value of the attention the centre already receives.
            </p>
            <p>
              The website can be rebuilt and improved within <strong className="text-[#0A0A0A]">5&ndash;7 days</strong>, using the existing content, offer information, parent proof and clearer enquiry routes.
            </p>
          </div>

          <div className="border border-black/[0.08] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-black/[0.02] border-b border-black/[0.08]">
                  <th className="text-left font-mono text-xs uppercase tracking-[0.12em] text-[#525252] font-medium px-5 py-3">Metric</th>
                  <th className="text-left font-mono text-xs uppercase tracking-[0.12em] text-[#525252] font-medium px-5 py-3">Now</th>
                  <th className="text-left font-mono text-xs uppercase tracking-[0.12em] text-[#525252] font-medium px-5 py-3">Target</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Website traffic / month", "400 visitors", "400 visitors"],
                  ["Enquiry conversion", "1%", "2.5%"],
                  ["Enquiries / month", "~4", "~10"],
                  ["Enquiry-to-customer conversion", "20%", "30%"],
                  ["New customers / month", "~1", "~3"],
                ].map(([metric, now, target], i) => (
                  <tr key={metric} className={i % 2 === 1 ? "bg-black/[0.015]" : ""}>
                    <td className="px-5 py-3 text-[#0A0A0A] font-medium">{metric}</td>
                    <td className="px-5 py-3 text-[#737373]">{now}</td>
                    <td className="px-5 py-3 text-[#0A0A0A] font-semibold">{target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#A3A3A3] mt-4 leading-relaxed">
            This is before adding new advertising spend. The same traffic, better converted.
          </p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Why This Matters */}
        <div className="mb-16">
          <span className="inline-block font-mono text-sm uppercase tracking-[0.15em] text-[#525252] font-bold mb-8 block">
            Why this matters
          </span>
          <div className="space-y-6 text-[#525252] text-base leading-relaxed">
            <p>
              The first job is not simply to create more traffic. It is to stop wasting the attention the centre already has.
            </p>
            <p>
              Once the website, offers, enquiry routes, follow-up and tracking are improved, advertising can be added as a new inbound channel into a stronger system.
            </p>
            <p>
              That means paid traffic is sent into a journey that can capture, follow up and measure leads properly.
            </p>
            <p className="text-[#0A0A0A] font-medium">
              The result is a more predictable and measurable stream of enquiries, where we can see:
            </p>
            <ul className="space-y-2 ml-2">
              {[
                "How many leads are created",
                "Where they came from",
                "What they cost",
                "What percentage become customers",
                "Whether spend should be increased, reduced or changed",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-[#737373]">
                  <span className="text-[#0A0A0A] shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Working Method */}
        <div className="mb-16">
          <span className="inline-block font-mono text-sm uppercase tracking-[0.15em] text-[#525252] font-bold mb-8 block">
            Working method
          </span>
          <div className="space-y-6 text-[#525252] text-base leading-relaxed mb-6">
            <p>
              The work will be handled as short, defined commercial projects rather than an endless list of marketing activities.
            </p>
            <p className="text-[#0A0A0A] font-medium">
              Each project will be defined by:
            </p>
          </div>
          <div className="bg-black/[0.02] rounded-xl border border-black/[0.06] p-6 mb-8">
            <p className="font-sans font-bold text-[#0A0A0A] text-base tracking-tight text-center">
              Problem &gt; Objective &gt; Work &gt; Measure &gt; Finish
            </p>
          </div>
          <p className="text-[#737373] text-base leading-relaxed mb-4">This keeps the work practical and accountable.</p>
          <p className="text-[#525252] text-base leading-relaxed mb-4">Examples of early projects:</p>
          <ul className="space-y-2">
            {[
              "Website rebuild",
              "Offer clarity",
              "Review generation process",
              "Enquiry follow-up",
              "Tracking and reporting",
              "First campaign landing page",
              "Paid ads reintroduction",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-[#737373] text-base">
                <span className="text-[#0A0A0A] shrink-0">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Monthly Review */}
        <div className="mb-16">
          <span className="inline-block font-mono text-sm uppercase tracking-[0.15em] text-[#525252] font-bold mb-8 block">
            Monthly review
          </span>
          <p className="text-[#525252] text-base leading-relaxed mb-6">Each month, we will review:</p>
          <ul className="space-y-2 mb-8">
            {[
              "What work was completed",
              "What happened as a result",
              "Website visits and enquiry conversion",
              "Enquiries and where they came from",
              "Offer performance",
              "New Google reviews",
              "Enquiry-to-customer conversion",
              "Advertising results, if campaigns are active",
              "The next highest-value priority",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-[#737373] text-base">
                <span className="text-[#0A0A0A] shrink-0">·</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-[#525252] text-base leading-relaxed mb-4">The review follows a simple structure:</p>
          <div className="bg-black/[0.02] rounded-xl border border-black/[0.06] p-6">
            <p className="font-sans font-bold text-[#0A0A0A] text-base tracking-tight text-center">
              What did we do? &gt; What happened? &gt; What did we learn? &gt; What do we do next?
            </p>
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Onboarding Steps */}
        <div className="mb-16">
          <span className="inline-block font-mono text-sm uppercase tracking-[0.15em] text-[#525252] font-bold mb-8 block">
            Basic onboarding steps
          </span>
          <div className="space-y-10">
            {[
              {
                step: "Step 1",
                title: "Access and materials",
                body: "The centre provides access to the existing website, Google Business Profile, booking links, enquiry routes, analytics if available, and any existing testimonials, images, programme details and pricing.",
              },
              {
                step: "Step 2",
                title: "Offer and journey review",
                body: "We review the current services, offers, free lesson process, consultation process and parent enquiry journey. The goal is to make the centre easier to understand and easier to choose.",
              },
              {
                step: "Step 3",
                title: "Website rebuild",
                body: "The website is rebuilt around the strongest proof, clearest offers and simplest enquiry routes. Target timeline: 5\u20137 days.",
              },
              {
                step: "Step 4",
                title: "Tracking and enquiry capture",
                body: "Tracking is added so visits, enquiries, sources and outcomes can be reviewed properly. Enquiry routes are tightened across website forms, WhatsApp, phone and booking links.",
              },
              {
                step: "Step 5",
                title: "Review generation",
                body: "A simple follow-up process is introduced to request Google reviews from existing families at the right moments.",
              },
              {
                step: "Step 6",
                title: "Monthly review and next priority",
                body: "At the end of the first month, we review the numbers and decide the next priority. If the foundation is working, advertising can be reintroduced as a measured inbound channel.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-8">
                <span className="font-mono text-[11px] text-[#C4C4C4] uppercase tracking-[0.1em] pt-1 shrink-0 w-16">{item.step}</span>
                <div>
                  <h3 className="font-sans font-bold text-[#0A0A0A] text-lg leading-snug tracking-tight mb-2">{item.title}</h3>
                  <p className="text-[#737373] text-base leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Monthly Retainer */}
        <div className="mb-16">
          <span className="inline-block font-mono text-sm uppercase tracking-[0.15em] text-[#525252] font-bold mb-8 block">
            Monthly retainer
          </span>
          <div className="bg-[#0A0A0A] rounded-2xl p-8 sm:p-10">
            <p className="font-sans font-extrabold text-white text-5xl tracking-tight mb-4">£750<span className="text-2xl text-white/50 font-bold"> /mo</span></p>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              Advertising spend is not included in the retainer. Any paid media budget will be agreed separately before campaigns are launched.
            </p>
            <p className="text-white/70 text-sm leading-relaxed">
              After 3 months of production, we will carry out a formal review of the engagement. Clear performance metrics, including website visits, enquiry conversion, enquiries and their sources, enquiry-to-customer conversion, new Google reviews, and advertising results where active, will be available each month so the impact of the work can be assessed continuously, and the 3-month review will use that accumulated evidence to decide whether to continue, adjust, or expand the scope.
            </p>
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Account Details */}
        <div className="mb-16">
          <span className="inline-block font-mono text-sm uppercase tracking-[0.15em] text-[#525252] font-bold mb-6 block">
            Account details
          </span>
          <div className="p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
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
              An invoice will be issued at the start of each month. Payment is due within 30 days.
            </p>
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Immediate Priorities */}
        <div className="mb-16">
          <span className="inline-block font-mono text-sm uppercase tracking-[0.15em] text-[#525252] font-bold mb-8 block">
            Immediate priorities
          </span>
          <div className="space-y-6 text-[#525252] text-base leading-relaxed mb-8">
            <p>
              The first priorities once we begin are straightforward:
            </p>
          </div>
          <div className="space-y-10">
            <div className="flex gap-8">
              <span className="font-mono text-[11px] text-[#C4C4C4] tabular-nums pt-1 shrink-0">01</span>
              <div>
                <h3 className="font-sans font-bold text-[#0A0A0A] text-lg leading-snug tracking-tight mb-2">Re-instate Meta ads</h3>
                <p className="text-[#737373] text-base leading-relaxed">
                  Get access to the centre&rsquo;s Meta Business Manager so ads can be assessed and initialised, immediately driving traffic into leads.
                </p>
              </div>
            </div>
            <div className="flex gap-8">
              <span className="font-mono text-[11px] text-[#C4C4C4] tabular-nums pt-1 shrink-0">02</span>
              <div>
                <h3 className="font-sans font-bold text-[#0A0A0A] text-lg leading-snug tracking-tight mb-2">Re-build the website, integrate tracking &amp; start Google Ads</h3>
                <p className="text-[#737373] text-base leading-relaxed">
                  Build a new, higher-converting website, set up clear performance tracking, and stand up Google Ads, all handled from the materials already available, with no active content needed from the centre at this stage.
                </p>
              </div>
            </div>
          </div>
          <p className="text-[#525252] text-base leading-relaxed mt-8">
            Detailed instructions for each priority, including what access is needed and next steps, have been sent separately for your review.
          </p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Closing */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p className="text-[#0A0A0A] font-semibold">
            If this looks right, accept below and we&rsquo;ll get started.
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
                  Sorted agrees to take ongoing responsibility for Edgbaston Tuition Centre&rsquo;s digital commercial infrastructure: website rebuild and improvement, offer and customer journey design, reviews and local trust, measurement and tracking, and advertising readiness. The work is delivered as short, defined commercial projects.</p>

                  <p><strong className="text-[#0A0A0A]">2. Retainer</strong><br/>
                  £750 per month. Advertising spend is not included. Any paid media budget will be agreed separately before campaigns are launched.</p>

                  <p><strong className="text-[#0A0A0A]">3. Website Rebuild</strong><br/>
                  Included within the retainer. Target timeline: 5&ndash;7 days from receipt of access and materials.</p>

                  <p><strong className="text-[#0A0A0A]">4. Working Method</strong><br/>
                  Work is structured as defined projects: Problem &gt; Objective &gt; Work &gt; Measure &gt; Finish. Each month includes a review of what was done, what happened, what was learned, and what to do next.</p>

                  <p><strong className="text-[#0A0A0A]">5. Performance Metrics &amp; 3-Month Review</strong><br/>
                  Clear performance metrics, including website visits, enquiry conversion, enquiries and their sources, enquiry-to-customer conversion, new Google reviews, and advertising results where active, will be available each month so the impact of the work can be assessed continuously. After 3 months of production, a formal review will use that accumulated evidence to decide whether to continue, adjust, or expand the scope of the engagement.</p>

                  <p><strong className="text-[#0A0A0A]">6. Onboarding</strong><br/>
                  The centre provides access to the existing website, Google Business Profile, booking links, enquiry routes, analytics, testimonials, images, programme details and pricing. The website rebuild begins once access and materials are received.</p>

                  <p><strong className="text-[#0A0A0A]">7. Payment</strong><br/>
                  £750 per month, invoiced at the start of each month. Payment due within 30 days. All payments to be made to ADX ENGINE LTD, NatWest, Sort Code 52-30-02, Account Number 30189489.</p>

                  <p><strong className="text-[#0A0A0A]">8. Cancellation</strong><br/>
                  Either party may end the engagement at the monthly review point. Work completed and costs incurred up to that point will be settled in full.</p>
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
