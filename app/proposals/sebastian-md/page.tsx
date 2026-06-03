"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"

const AUTH_KEY = "sebastianmd_auth"
const AUTH_EXPIRY_DAYS = 30

const mockups = [
  { src: "/proposals/sebastianmd/concept-hero-01.png", label: "Hero Concept A", desc: "Clean medical-focused hero" },
  { src: "/proposals/sebastianmd/concept-hero-02.png", label: "Hero Concept B", desc: "Warm welcoming hero" },
  { src: "/proposals/sebastianmd/concept-logo-direction.png", label: "Logo Direction", desc: "Premium physician-led positioning" },
  { src: "/proposals/sebastianmd/page-treatments-01.png", label: "Treatments Overview", desc: "Category grid with navigation" },
  { src: "/proposals/sebastianmd/page-treatments-02.png", label: "Treatment Detail", desc: "Process and booking CTA" },
  { src: "/proposals/sebastianmd/page-treatments-03.png", label: "Technology Page", desc: "Equipment showcase" },
  { src: "/proposals/sebastianmd/page-about-team.png", label: "Team Section", desc: "Medical team credentials" },
  { src: "/proposals/sebastianmd/page-patient-stories.png", label: "Patient Stories", desc: "Case study approach" },
  { src: "/proposals/sebastianmd/page-before-after.png", label: "Results Gallery", desc: "Before and after" },
  { src: "/proposals/sebastianmd/page-services-overview.png", label: "Services", desc: "Treatment menu" },
  { src: "/proposals/sebastianmd/component-treatment-cards.png", label: "Cards", desc: "Reusable pattern" },
  { src: "/proposals/sebastianmd/page-mobile-views.png", label: "Mobile", desc: "Responsive layouts" },
  { src: "/proposals/sebastianmd/page-clinic-experience.png", label: "Clinic", desc: "Virtual tour" },
]

export default function SebastianMDProposal() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [signerName, setSignerName] = useState("")
  const [showAgreement, setShowAgreement] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const [signedAt, setSignedAt] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

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
    if (password.toLowerCase() === "parmeet2026") {
      setIsAuthenticated(true)
      setError(false)
      saveAuth()
    } else {
      setError(true)
    }
  }

  const openLightbox = (index: number) => {
    setCurrentImage(index)
    setLightboxOpen(true)
    document.body.style.overflow = "hidden"
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = "auto"
  }

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % mockups.length)
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + mockups.length) % mockups.length)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowRight") nextImage()
      if (e.key === "ArrowLeft") prevImage()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxOpen])

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
            {error && <p className="text-red-500 text-sm">Incorrect password.</p>}
            <button type="submit" className="w-full bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors">
              View Proposal
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="max-w-[720px] mx-auto px-6 sm:px-10 pt-24 pb-32">
        <div className="mb-16">
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-1">June 2026</p>
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em]">Private — for Parmeet</p>
        </div>

        <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl leading-tight tracking-tight mb-10">Parmeet,</h1>

        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>Thank you for the detailed brief. It was extremely helpful in understanding both the business and the direction you would like the brand to move towards.</p>
          <p className="text-[#0A0A0A] font-semibold">The goal is not to move away from what attracted you to the reference website, but rather to build on those strengths and create a website that feels uniquely Sebastian MD.</p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Mockup Gallery */}
        <div className="mb-20">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-2 block">Design Concepts</span>
          <p className="text-[#737373] text-sm mb-8">Click any image to view full size. Use arrow keys or buttons to navigate.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockups.map((mockup, index) => (
              <div key={index} className="group cursor-pointer" onClick={() => openLightbox(index)}>
                <div className="relative aspect-[4/3] bg-[#F5F5F5] rounded-xl overflow-hidden border border-black/[0.06] mb-3">
                  <Image src={mockup.src} alt={mockup.label} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, 50vw" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors" />
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                </div>
                <p className="font-sans font-semibold text-[#0A0A0A] text-sm">{mockup.label}</p>
                <p className="text-[#737373] text-xs">{mockup.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Deliverables */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">What we&apos;ll deliver</span>
          <div className="space-y-10">
            {[
              { num: "01", title: "Website Design", body: "A refined, medically-credible aesthetic designed for Sebastian MD's positioning. Includes homepage, treatment pages, before/after gallery, about/team section, and mobile-responsive layouts with diverse representation throughout." },
              { num: "02", title: "Website Development", body: "The approved design converted into a fast Next.js website. Responsive development, SEO-friendly structure, performance optimisation, and all core pages built and tested." },
              { num: "03", title: "SortedUpdates CMS", body: "Every piece of visible content becomes editable. You can update text, images, treatment details, team profiles, and patient stories without technical knowledge or developer assistance." },
              { num: "04", title: "Setup & Launch", body: "Netlify hosting with global CDN, SSL certificate, cross-device testing, form testing, and final launch preparation. A tested, secure, launch-ready website." },
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

        {/* Timeline */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">Project timeline</span>
          <div className="space-y-6">
            {[
              { stage: "Week 1", desc: "Design refinement based on your mockup feedback" },
              { stage: "Week 1–2", desc: "Website build and page development" },
              { stage: "Week 2–3", desc: "SortedUpdates CMS setup and content population" },
              { stage: "Final", desc: "Testing, revisions, and launch" },
            ].map((item) => (
              <div key={item.stage} className="flex gap-8">
                <span className="font-mono text-xs text-[#525252] tabular-nums shrink-0 w-24">{item.stage}</span>
                <p className="text-[#737373] text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Investment */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">Investment</span>
          <div className="bg-[#0A0A0A] rounded-2xl p-8 sm:p-10 mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/60 mb-2">Total Project Cost</p>
            <p className="font-sans font-extrabold text-white text-5xl tracking-tight mb-6">£3,500</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-t border-white/10">
                <div><p className="text-white font-semibold">Deposit to start (50%)</p><p className="text-white/60 text-sm">Due on project commencement</p></div>
                <p className="text-white font-bold text-xl">£1,750</p>
              </div>
              <div className="flex items-center justify-between py-4 border-t border-white/10">
                <div><p className="text-white font-semibold">Balance on completion (50%)</p><p className="text-white/60 text-sm">Due before final handover</p></div>
                <p className="text-white font-bold text-xl">£1,750</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Payment details</p>
            <div className="space-y-2 text-sm">
              <div className="flex gap-4"><span className="text-[#A3A3A3] w-28 shrink-0">Bank</span><span className="text-[#0A0A0A] font-medium">Wise</span></div>
              <div className="flex gap-4"><span className="text-[#A3A3A3] w-28 shrink-0">Name</span><span className="text-[#0A0A0A] font-medium">Renaldo Lee Edmondson</span></div>
              <div className="flex gap-4"><span className="text-[#A3A3A3] w-28 shrink-0">Sort Code</span><span className="text-[#0A0A0A] font-medium font-mono">23-14-70</span></div>
              <div className="flex gap-4"><span className="text-[#A3A3A3] w-28 shrink-0">Account</span><span className="text-[#0A0A0A] font-medium font-mono">18037629</span></div>
            </div>
          </div>
        </div>

        {/* Design Notes */}
        <div className="mb-16 p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Design Direction Notes</p>
          <div className="space-y-4 text-sm text-[#525252]">
            <p><strong className="text-[#0A0A0A]">Why this feels different:</strong> The reference website works well for skincare-focused clinics. Sebastian MD offers physician-led medical expertise, advanced technology, and specialisation in diverse skin tones. The direction balances warmth with medical credibility.</p>
            <p><strong className="text-[#0A0A0A]">Logo positioning:</strong> The website can use your current logo or an evolved identity. A refined logo would better align with the premium, physician-led positioning.</p>
            <p><strong className="text-[#0A0A0A]">Patient stories:</strong> Rather than simple before/after galleries, the design presents patient journeys as case studies for stronger emotional connection.</p>
          </div>
        </div>

        {/* Not Included */}
        <div className="mb-16 p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">Not included</p>
          <ul className="space-y-1">
            {["Professional photography", "Paid advertising", "Advanced SEO", "Ongoing retainer", "Custom integrations"].map((item) => (
              <li key={item} className="text-sm text-[#737373]">{item}</li>
            ))}
          </ul>
          <p className="text-xs text-[#A3A3A3] mt-4">These can be discussed separately.</p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Closing */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>The aim is a website that feels warm enough to feel personal, professional enough to feel trustworthy, and distinctive enough to stand apart.</p>
          <p className="text-[#0A0A0A] font-semibold">If this looks right, reply to confirm and I&apos;ll send over the deposit invoice to get started.</p>
        </div>

        {/* Signature */}
        <div className="mb-16 pt-8 border-t border-black/[0.08]">
          {!isSigned ? (
            <>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Accept This Proposal</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input type="text" value={signerName} onChange={(e) => setSignerName(e.target.value)} placeholder="Enter your full name" className="flex-1 px-4 py-3 bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-black/[0.3] transition-colors" />
                <button type="button" onClick={() => setShowAgreement(true)} disabled={!signerName.trim()} className="bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-6 py-3 hover:bg-[#2a2a2a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0">Review & Accept</button>
              </div>
            </>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-green-700 mb-2">Proposal Accepted</p>
              <p className="text-green-800 text-[2rem]" style={{ fontFamily: "cursive" }}>{signerName}</p>
              <p className="text-xs text-green-600 mt-2">Signed on {signedAt}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-black/[0.06] pt-8 flex items-center justify-between">
          <p className="text-xs text-[#C4C4C4] font-mono">Sorted. — sortmydigital.netlify.app</p>
          <button onClick={handleSignOut} className="text-xs text-[#A3A3A3] hover:text-[#525252] transition-colors font-mono">Sign out</button>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxOpen && mounted && createPortal(
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999]" onClick={closeLightbox}>
          <div className="absolute top-4 left-4 text-white/60 font-mono text-xs">{currentImage + 1} / {mockups.length}</div>
          <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={closeLightbox} className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <div className="max-w-5xl max-h-[85vh] px-20" onClick={(e) => e.stopPropagation()}>
            <Image src={mockups[currentImage].src} alt={mockups[currentImage].label} width={1200} height={900} className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg" />
            <div className="text-center mt-4">
              <p className="text-white font-semibold">{mockups[currentImage].label}</p>
              <p className="text-white/60 text-sm">{mockups[currentImage].desc}</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Agreement Modal */}
      {showAgreement && mounted && createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]" onClick={() => setShowAgreement(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[calc(100vh-2rem)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08] shrink-0">
              <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Service Agreement</h3>
              <button onClick={() => setShowAgreement(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/[0.06] transition-colors text-[#525252]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <div className="space-y-4 text-sm text-[#525252] leading-relaxed">
                <p><strong className="text-[#0A0A0A]">1. Services:</strong> Sorted agrees to provide the services described: Website Design, Development, SortedUpdates CMS, and Launch.</p>
                <p><strong className="text-[#0A0A0A]">2. Payment:</strong> Total project cost is £3,500. 50% deposit (£1,750) due on commencement. Balance (£1,750) due before handover.</p>
                <p><strong className="text-[#0A0A0A]">3. Timeline:</strong> Estimated 2-3 weeks from deposit receipt, subject to timely feedback.</p>
                <p><strong className="text-[#0A0A0A]">4. IP:</strong> Upon full payment, client owns all rights to final design and content. Sorted retains portfolio rights.</p>
                <p><strong className="text-[#0A0A0A]">5. Revisions:</strong> Two rounds of revisions included per stage.</p>
                <p><strong className="text-[#0A0A0A]">6. Cancellation:</strong> Deposit is non-refundable once work commences.</p>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-black/[0.08] shrink-0">
              <button onClick={() => setShowAgreement(false)} className="flex-1 px-4 py-3 border border-black/[0.12] rounded-lg text-[#525252] font-medium text-sm hover:bg-black/[0.02] transition-colors">Cancel</button>
              <button onClick={() => { setIsSigned(true); setShowAgreement(false); setSignedAt(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })); }} className="flex-1 bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors">I Accept — Sign as {signerName}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
