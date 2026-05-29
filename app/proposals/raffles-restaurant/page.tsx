"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"

const AUTH_KEY = "raffles_auth"
const AUTH_EXPIRY_DAYS = 30

export default function RafflesProposal() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Signature states
  const [signerName, setSignerName] = useState("")
  const [showAgreement, setShowAgreement] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const [signedAt, setSignedAt] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      try {
        const { expires } = JSON.parse(stored)
        if (new Date().getTime() < expires) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem(AUTH_KEY)
        }
      } catch {
        localStorage.removeItem(AUTH_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const saveAuth = () => {
    const expires = new Date().getTime() + (AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    localStorage.setItem(AUTH_KEY, JSON.stringify({ expires }))
  }

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.toLowerCase() === "raffles2026") {
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
          <p className="text-[#737373] text-sm mb-6">Enter the password to view this proposal.</p>
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
              View Proposal
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
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-1">May 2026</p>
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em]">Private - for Raffles Restaurant</p>
        </div>

        {/* Salutation */}
        <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl leading-tight tracking-tight mb-10">
          Raffles Team,
        </h1>

        {/* Opening letter */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            Following our conversation about Raffles Restaurant's visibility challenge in Kenilworth, I've put together a straightforward proposal to get you from where you are now to a fully functioning website that works as your digital front door.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            The goal is simple: a website that makes it immediately obvious what Raffles offers, where you are, and why someone should visit — all while giving you full control over menus, events, and content without needing technical knowledge.
          </p>
        </div>

        {/* The Opportunity */}
        <div className="mb-16 p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">The Opportunity</p>
          <p className="text-[#525252] text-base leading-relaxed mb-4">
            Raffles does not have a food problem. It has a <strong className="text-[#0A0A0A]">visibility problem</strong>.
          </p>
          <p className="text-[#525252] text-base leading-relaxed">
            Thousands of people move through Kenilworth every week. Local residents pass The Peacock Hotel daily. Visitors explore the town, castle, and surrounding attractions. Contractors and business travellers stay locally throughout the year.
          </p>
          <p className="text-[#525252] text-base leading-relaxed mt-4">
            Yet many never realise there is an established Malaysian restaurant inside. The objective is not simply to "advertise." It is to create <strong className="text-[#0A0A0A]">awareness, curiosity, and repeat visitation</strong> by positioning Raffles as a destination in its own right.
          </p>
        </div>

        {/* Concept Examples */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            Concept Direction
          </span>
          <div className="space-y-6">
            <div>
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-black/[0.08] mb-3">
                <Image
                  src="/proposals/raffles-restaurant/concept-1.png"
                  alt="Raffles Restaurant website concept"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-[#737373]">Website concept showcasing Malaysian cuisine with warm, appetising photography</p>
            </div>
            <div>
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-black/[0.08] mb-3">
                <Image
                  src="/proposals/raffles-restaurant/concept-2.png"
                  alt="Raffles social presence concept"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-[#737373]">Social media presence reflecting authentic Malaysian culture and hospitality</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Deliverables */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            What we'll deliver
          </span>
          <div className="space-y-10">
            {[
              {
                num: "01",
                title: "Website Design",
                body: "A warm, inviting restaurant website designed specifically for Raffles' Malaysian cuisine and unique position within The Peacock Hotel. This includes homepage design with clear navigation, menu presentation layout, about section highlighting Malaysian heritage, events and themed evening pages, contact and reservation pathways, and visual styling that reflects Malaysian warmth and hospitality.",
              },
              {
                num: "02",
                title: "Website Development",
                body: "The approved design converted into a working Next.js website, built for speed and search visibility. This includes responsive development (mobile, tablet, desktop), fast page loads, navigation and menu structure, contact forms and reservation enquiries, Google Maps integration with clear location marking, core pages, and performance optimisation.",
              },
              {
                num: "03",
                title: "Content Management System",
                body: "Every piece of visible content editable by you — no developer needed. This includes menu management (update dishes, prices, descriptions), event pages (create and manage themed evenings), gallery (add and replace photos), contact details (update phone, hours, location), homepage content, about section updates, and a simple admin interface through SortedUpdates.",
              },
              {
                num: "04",
                title: "Launch Setup & Testing",
                body: "Configuration and preparation for going live. This includes domain connection, Google Business Profile integration guidance, basic SEO setup, cross-device testing, reservation/contact form testing, usability review and adjustments, and SSL certificate for secure browsing.",
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

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Timeline */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            Project timeline
          </span>
          <div className="space-y-6">
            {[
              { stage: "Week 1", desc: "Design direction and homepage mockup prepared" },
              { stage: "Week 1–2", desc: "Website build and page development" },
              { stage: "Week 2", desc: "Content Management System setup and configuration" },
              { stage: "Week 3", desc: "Content entry, testing, and refinements" },
              { stage: "Final Stage", desc: "Domain connection, final testing, and launch" },
            ].map((item) => (
              <div key={item.stage} className="flex gap-8">
                <span className="font-mono text-xs text-[#525252] tabular-nums shrink-0 w-24">{item.stage}</span>
                <p className="text-[#737373] text-base">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[#737373] text-sm mt-6 leading-relaxed">
            Throughout the process, I'll share progress updates so you know what's been completed, what's currently being worked on, and what's next.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Investment */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            Investment
          </span>
          <div className="bg-[#0A0A0A] rounded-2xl p-8 sm:p-10 mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/60 mb-2">Total Project Cost</p>
            <p className="font-sans font-extrabold text-white text-5xl tracking-tight mb-6">£1,200</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-t border-white/10">
                <div>
                  <p className="text-white font-semibold">Deposit to start (50%)</p>
                  <p className="text-white/60 text-sm">Due on project commencement</p>
                </div>
                <p className="text-white font-bold text-xl">£600</p>
              </div>
              <div className="flex items-center justify-between py-4 border-t border-white/10">
                <div>
                  <p className="text-white font-semibold">Balance on completion (50%)</p>
                  <p className="text-white/60 text-sm">Due before final handover</p>
                </div>
                <p className="text-white font-bold text-xl">£600</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Payment details</p>
            <div className="space-y-2 text-sm">
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-28 shrink-0">Bank Name</span>
                <span className="text-[#0A0A0A] font-medium">Monzo</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-28 shrink-0">Account Name</span>
                <span className="text-[#0A0A0A] font-medium">Renaldo Edmondson</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-28 shrink-0">Sort Code</span>
                <span className="text-[#0A0A0A] font-medium font-mono">04-00-04</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-28 shrink-0">Account Number</span>
                <span className="text-[#0A0A0A] font-medium font-mono">6677 5330</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post-Launch */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6 block">
            After launch
          </span>
          <div className="space-y-3 text-[#737373] text-base leading-relaxed">
            <p>Once live, you'll have:</p>
            <ul className="space-y-2 ml-4">
              {[
                "A restaurant website you can update without technical knowledge",
                "The ability to change menus, prices, and content instantly",
                "A platform for promoting themed evenings and special events",
                "Professional presence that ranks better in Google searches",
                "Training on how to use the content management system",
                "Documentation on managing the site day-to-day",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-[#0A0A0A]">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Not Included */}
        <div className="mb-16 p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">Not included in this proposal</p>
          <ul className="space-y-1">
            {[
              "Professional food photography",
              "Copywriting for menu descriptions (initial content included, refinements extra)",
              "Paid advertising setup or management",
              "Advanced SEO or ongoing content marketing",
              "Third-party booking system integration (OpenTable, ResDiary, etc.)",
              "Ongoing maintenance or support retainer",
            ].map((item) => (
              <li key={item} className="text-sm text-[#737373]">{item}</li>
            ))}
          </ul>
          <p className="text-xs text-[#A3A3A3] mt-4">These can be discussed separately if required.</p>
        </div>

        {/* Why This Matters */}
        <div className="mb-16 p-6 bg-[#0A0A0A] rounded-xl">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/60 mb-4">Why This Matters</p>
          <p className="text-white/90 text-base leading-relaxed mb-4">
            The strongest opportunity for Raffles is not competing against every restaurant in Warwickshire.
          </p>
          <p className="text-white text-lg font-semibold leading-relaxed mb-4">
            It is becoming impossible to overlook within Kenilworth itself.
          </p>
          <p className="text-white/90 text-base leading-relaxed">
            The restaurant already sits beside existing demand: residents, visitors, contractors, hotel guests. The challenge is not creating demand. The challenge is creating <strong className="text-white">awareness, curiosity, and a compelling reason to visit</strong>. Once that happens consistently, the restaurant can become known not as "the restaurant inside the hotel," but as one of Kenilworth's most distinctive dining destinations.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Closing */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            The aim is a website that feels warm and genuinely inviting, easy for hungry customers to navigate, simple for you to keep fresh and current, and clear about location, cuisine, and why Raffles is worth finding.
          </p>
          <p>
            Once built, the website works for you 24/7 — helping locals discover you, tourists find you, and everyone understand exactly what makes Raffles special.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            If this looks right, reply to confirm and I'll send over the deposit invoice to get started. Any questions, just ask.
          </p>
        </div>

        {/* Client Signature Section */}
        <div className="mb-16 pt-8 border-t border-black/[0.08]">
          {!isSigned ? (
            <>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Accept This Proposal: Enter Your Name</p>
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
                  onClick={() => {
                    setShowAgreement(true)
                  }}
                  disabled={!signerName.trim()}
                  className="bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-6 py-3 hover:bg-[#2a2a2a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  Review & Accept
                </button>
              </div>
              <p className="text-xs text-[#A3A3A3] mt-3">By accepting, you agree to the terms outlined in this proposal.</p>
            </>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-green-700 mb-2">Proposal Accepted</p>
              <p className="text-green-800 text-[2rem]" style={{ fontFamily: "var(--font-signature), cursive" }}>
                {signerName}
              </p>
              <p className="text-xs text-green-600 mt-2">Signed on {signedAt}</p>
            </div>
          )}
        </div>

        {/* Agreement Modal - Portal to body to escape transform containing block */}
        {showAgreement && mounted && createPortal(
          <div 
            className="bg-black/60 flex items-center justify-center p-4"
            style={{ 
              position: "fixed",
              top: 0, 
              left: 0, 
              width: "100vw",
              height: "100vh",
              zIndex: 9999 
            }}
            onClick={() => setShowAgreement(false)}
          >
            <div 
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl flex flex-col"
              style={{ maxHeight: "calc(100vh - 2rem)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08] shrink-0">
                <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Service Agreement</h3>
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

              {/* Scrollable content */}
              <div className="px-6 py-5 overflow-y-auto flex-1">
                <div className="space-y-4 text-sm text-[#525252] leading-relaxed">
                  <p>
                    <strong className="text-[#0A0A0A]">1. Services:</strong> Sorted agrees to provide the services described in this proposal: Website Design, Website Development, Content Management System (SortedUpdates), and Launch Setup & Testing.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">2. Payment:</strong> Total project cost is £1,200. 50% deposit (£600) due on project commencement. Balance (£600) due before final handover.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">3. Timeline:</strong> Estimated 3 weeks from deposit receipt to launch, subject to timely provision of materials and feedback.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">4. Intellectual Property:</strong> Upon full payment, client owns all rights to the final website design and content. Sorted retains the right to display the work in portfolio.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">5. Revisions:</strong> Two rounds of revisions included per stage. Additional revisions may incur extra charges.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">6. Cancellation:</strong> Deposit is non-refundable once work has commenced. If project is cancelled by client, work completed to date will be billed proportionally.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">7. Limitation:</strong> Sorted is not liable for third-party service failures (hosting, domain providers) or losses beyond the project fee.
                  </p>
                </div>
              </div>

              {/* Sticky footer */}
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
                  onClick={() => {
                    setIsSigned(true)
                    setShowAgreement(false)
                    setSignedAt(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
                  }}
                  className="flex-1 bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors"
                >
                  I Accept - Sign as {signerName}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* My Signature */}
        <div className="mb-24">
          <p className="font-sans font-bold text-[#0A0A0A] text-lg">Renaldo</p>
          <p className="text-[#A3A3A3] text-sm">Sorted</p>
        </div>

        {/* Subtle footer */}
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
