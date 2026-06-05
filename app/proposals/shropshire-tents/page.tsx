"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"

const AUTH_KEY = "shropshiretents_auth"
const AUTH_EXPIRY_DAYS = 30

const mockups = [
  { src: "/proposals/shropshiretents/mockup1.png", label: "Homepage Concept", desc: "Hero-focused design showcasing stretch tent atmosphere and premium event presentation" },
  { src: "/proposals/shropshiretents/mockup2.png", label: "Services & Gallery", desc: "Services overview with enquiry-focused layout and real event showcase" },
]

export default function ShropshireTentsProposal() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [wideLayout, setWideLayout] = useState(false)

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

    if (password.toLowerCase() === "shropshire2026") {
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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-black/[0.3] transition-colors" />
            {error && <p className="text-red-500 text-sm">Incorrect password.</p>}
            <button type="submit" className="w-full bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors">View Proposal</button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className={`${wideLayout ? 'max-w-[1100px]' : 'max-w-[720px]'} mx-auto px-6 sm:px-10 pt-24 pb-32 transition-all duration-300`}>
        {/* Layout Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <button onClick={() => setWideLayout(!wideLayout)} className="bg-white/90 backdrop-blur shadow-sm border border-black/[0.08] rounded-lg px-3 py-2 text-xs font-medium text-[#525252] hover:text-[#0A0A0A] transition-colors">
            {wideLayout ? 'Narrow View' : 'Wide View'}
          </button>
        </div>

        {/* Date */}
        <div className="mb-16">
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-1">June 2026</p>
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em]">Private — for Shropshire Stretch Tents</p>
        </div>

        {/* Salutation */}
        <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl leading-tight tracking-tight mb-10">Hello,</h1>

        {/* Opening */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>Thank you for the opportunity to review the Shropshire Stretch Tents website. After examining your current online presence, I wanted to share my thinking on how we can better reflect the quality of your service through a redesigned website.</p>
          <p>The business itself appears professional, established, and offers a visually appealing product. However, the current website does not fully communicate that quality to potential customers.</p>
          <p className="text-[#0A0A0A] font-semibold">The goal is to create a website that inspires visitors immediately, builds trust faster, and makes it significantly easier for potential customers to enquire.</p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Mockup Gallery */}
        <div className="mb-20">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-2 block">Design Concepts</span>
          <p className="text-[#737373] text-sm mb-8">Click any image to view full size. Images display at full height with preserved aspect ratio.</p>

          <div className={`grid gap-4 ${wideLayout ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {mockups.map((mockup, index) => (
              <div key={index} className="group">
                <a href={mockup.src} target="_blank" rel="noopener noreferrer" download className="block relative aspect-[4/3] bg-[#F5F5F5] rounded-xl overflow-hidden border border-black/[0.06] mb-3 cursor-pointer" onClick={(e) => { e.preventDefault(); openLightbox(index); }}>
                  <Image src={mockup.src} alt={mockup.label} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors" />
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                </a>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans font-semibold text-[#0A0A0A] text-sm">{mockup.label}</p>
                    <p className="text-[#737373] text-xs">{mockup.desc}</p>
                  </div>
                  <a href={mockup.src} download className="text-xs text-[#525252] hover:text-[#0A0A0A] font-medium underline">Download</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Current Website Assessment */}
        <section className="mb-16">
          <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-6">The Current Website Challenge</h2>
          <div className="space-y-4 text-[#525252] leading-relaxed">
            <p>We reviewed your existing site with a focus on how effectively it builds trust, showcases your service, and converts visitors into enquiries.</p>
            <p>While the site contains the necessary information, much of it is presented in a way that requires visitors to work hard to understand your offering. As a result, potential customers may leave before making an enquiry, particularly when comparing multiple providers.</p>
            
            <p className="text-[#0A0A0A] font-semibold mt-6 mb-2">Key observations:</p>
            <ul className="space-y-2 ml-4 list-disc list-inside">
              <li><strong>The product is stronger than the website.</strong> Stretch tents are naturally visual products. Customers buy based on atmosphere and presentation. The current site relies heavily on text and small imagery, meaning one of your biggest strengths is not being fully utilised.</li>
              <li><strong>The enquiry journey is too passive.</strong> The enquiry form sits low on the page and competes with a large amount of content. Modern visitors often make decisions within seconds.</li>
              <li><strong>Trust signals are underused.</strong> Customer reviews, testimonials, event success stories, and service guarantees are limited — yet these are often the deciding factors when comparing suppliers.</li>
              <li><strong>The presentation feels dated.</strong> Large blocks of text, limited visual hierarchy, and weak emphasis on key information can unintentionally make an excellent business appear smaller or less established than it actually is.</li>
            </ul>
          </div>
        </section>

        {/* Proposed Direction */}
        <section className="mb-16">
          <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-6">Proposed Direction</h2>
          <div className="space-y-4 text-[#525252] leading-relaxed">
            <p>The redesign focuses on creating a stronger emotional response while making it easier for visitors to enquire.</p>
            
            <p className="text-[#0A0A0A] font-semibold mt-6 mb-2">Lead with the experience</p>
            <p>Rather than beginning with a product description, the redesign starts with the experience. Large hero photography immediately showcases evening events, atmosphere, lighting, premium presentation, and real-world use cases. This helps visitors visualise their own event before reading a single line of text.</p>
            
            <p className="text-[#0A0A0A] font-semibold mt-6 mb-2">Create multiple conversion opportunities</p>
            <p>The redesigned structure introduces clear calls-to-action throughout the page — Enquire Now, Check Availability, Request A Quote, Call Directly — positioned strategically so visitors can take action whenever they are ready.</p>
            
            <p className="text-[#0A0A0A] font-semibold mt-6 mb-2">Build trust earlier</p>
            <p>The new layout brings trust signals much higher up the page through Google Reviews, customer testimonials, service highlights, local business positioning, and experience indicators.</p>
            
            <p className="text-[#0A0A0A] font-semibold mt-6 mb-2">Showcase real events</p>
            <p>One of your strongest assets is photography from previous events. The redesign places greater emphasis on weddings, garden parties, corporate events, evening setups, and styled event spaces — allowing potential customers to see the versatility of the tents and understand the quality of the finished result.</p>
            
            <p className="text-[#0A0A0A] font-semibold mt-6 mb-2">Position as a premium local provider</p>
            <p>The proposed visual direction is designed to make Shropshire Stretch Tents feel professional, established, trusted, premium, and locally focused. The darker colour palette, stronger imagery, improved spacing, and clearer content hierarchy all contribute to a more confident presentation.</p>
          </div>
        </section>

        {/* Expected Benefits */}
        <section className="mb-16">
          <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-6">Expected Benefits</h2>
          <div className="space-y-4 text-[#525252] leading-relaxed">
            <p>The redesign is intended to help achieve:</p>
            <ul className="space-y-2 ml-4 list-disc list-inside">
              <li>More enquiries from existing traffic</li>
              <li>Higher visitor trust</li>
              <li>Better engagement on mobile devices</li>
              <li>Improved perception of service quality</li>
              <li>Greater differentiation from competitors</li>
              <li>Stronger showcase of previous work</li>
            </ul>
            <p className="mt-4">Most importantly, it ensures that your online presentation better reflects the quality of the service being delivered in the real world.</p>
          </div>
        </section>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* What We'll Deliver */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">What we&apos;ll deliver</span>
          <div className="space-y-10">
            {[
              { num: "01", title: "Website Design", body: "A premium, experience-focused design that leads with atmosphere and visual storytelling. Includes hero imagery treatment, services presentation, enquiry-focused CTAs, trust signals, gallery showcase, and mobile-responsive layouts throughout." },
              { num: "02", title: "Website Development", body: "The approved design converted into a fast Next.js website. Responsive development, SEO-friendly structure, performance optimisation, enquiry forms, and all core pages built and tested." },
              { num: "03", title: "SortedUpdates CMS", body: "Every piece of visible content becomes editable through a secure admin panel. You can update text, images, service details, gallery photos, testimonials, and contact information without technical knowledge or developer assistance." },
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

        {/* Closing */}
        <section className="mb-16">
          <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-6">Next Steps</h2>
          <div className="space-y-4 text-[#525252] leading-relaxed">
            <p>Shropshire Stretch Tents already has the foundations of a strong business. The opportunity is not to change the service itself, but to present it in a way that better communicates its value.</p>
            <p>The proposed redesign focuses on creating a stronger first impression, building trust faster, showcasing the product more effectively, and making it easier for potential customers to enquire.</p>
            <p className="text-[#0A0A0A] font-semibold">The result is a website that feels more aligned with the quality, professionalism, and atmosphere that customers experience when working with you.</p>
            <p className="mt-6">I&apos;m happy to discuss this proposal in more detail. Any questions, just ask.</p>
          </div>
        </section>

        {/* Closing */}
        <div className="mb-16 pt-8 border-t border-black/[0.08]">
          <p className="text-[#525252]">Looking forward to hearing from you.</p>
        </div>

        {/* Signature */}
        <div className="mb-16">
          <p className="font-sans font-bold text-[#0A0A0A] text-lg">Renaldo</p>
          <p className="text-[#A3A3A3] text-sm">Sorted</p>
        </div>

        {/* Footer */}
        <div className="border-t border-black/[0.06] pt-8 flex items-center justify-between">
          <p className="text-xs text-[#C4C4C4] font-mono">Sorted. — sortmydigital.site</p>
          <button onClick={handleSignOut} className="text-xs text-[#A3A3A3] hover:text-[#525252] transition-colors font-mono">Sign out</button>
        </div>
      </main>

      {/* Lightbox with full height aspect ratio preservation */}
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
          <div className="w-full h-full px-20 py-16 flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-full flex items-center justify-center">
              <Image 
                src={mockups[currentImage].src} 
                alt={mockups[currentImage].label} 
                width={1600} 
                height={1200} 
                className="max-w-full max-h-full w-auto h-auto object-contain" 
                style={{ maxHeight: 'calc(100vh - 140px)' }}
              />
            </div>
            <div className="text-center mt-4 bg-black/50 px-6 py-3 rounded-lg">
              <p className="text-white font-semibold">{mockups[currentImage].label}</p>
              <p className="text-white/60 text-sm">{mockups[currentImage].desc}</p>
              <a href={mockups[currentImage].src} download className="inline-block mt-2 text-xs text-white/80 hover:text-white underline">Download image</a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
