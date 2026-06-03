"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"

const AUTH_KEY = "sebastianmd_auth"
const AUTH_EXPIRY_DAYS = 30

const mockups = [
  { src: "/proposals/sebastianmd/homev1.png", label: "Homepage Concept", desc: "Clean hero with emphasis on expertise and welcoming diverse patient representation" },
  { src: "/proposals/sebastianmd/logo-concepts.png", label: "Logo Refresh Concepts", desc: "Evolved identity directions moving toward premium physician-led positioning" },
  { src: "/proposals/sebastianmd/treatments-index.png", label: "Treatments Overview", desc: "Treatment category index with clear navigation and medical credibility" },
  { src: "/proposals/sebastianmd/treatmentsv2.png", label: "Treatments Grid - Alt 1", desc: "Alternative treatment category layout with visual hierarchy" },
  { src: "/proposals/sebastianmd/treatmentsv3.png", label: "Treatments Grid - Alt 2", desc: "Treatment presentation with focus on technology and expertise" },
  { src: "/proposals/sebastianmd/treatmentsv4.png", label: "Treatments Grid - Alt 3", desc: "Treatment showcase emphasising diverse skin tone expertise" },
  { src: "/proposals/sebastianmd/treatment-detail.png", label: "Treatment Detail Page", desc: "Individual treatment page with process, technology, and booking pathway" },
  { src: "/proposals/sebastianmd/results-storyv1.png", label: "Patient Stories - Before/After V1", desc: "Case study approach showing patient journeys and real outcomes" },
  { src: "/proposals/sebastianmd/results-storyv2.png", label: "Patient Stories - Before/After V2", desc: "Alternative patient story layout with testimonial integration" },
  { src: "/proposals/sebastianmd/results-storyv3.png", label: "Patient Stories - Before/After V3", desc: "Results gallery emphasising diverse patient representation" },
  { src: "/proposals/sebastianmd/teamv1.png", label: "Team Section - Layout 1", desc: "Medical team presentation with credentials and professional photography" },
  { src: "/proposals/sebastianmd/teamv2.png", label: "Team Section - Layout 2", desc: "Alternative team layout with founder spotlight and trust building" },
  { src: "/proposals/sebastianmd/about-story.png", label: "About / Story Page", desc: "Clinic story and mission with authentic team presence" },
]

export default function SebastianMDProposal() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [wideLayout, setWideLayout] = useState(false)
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
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em]">Private — for Parmeet</p>
        </div>

        {/* Salutation */}
        <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl leading-tight tracking-tight mb-10">Hi Parmeet,</h1>

        {/* Opening */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>Firstly, thank you for putting together such a detailed brief. It was extremely helpful in understanding both the business and the direction you would like the brand to move towards.</p>
          <p>After reviewing your requirements, the reference website, your services, target audience, and the unique position Sebastian MD occupies within the market, I wanted to share the thinking behind the concepts and mockups I have developed.</p>
          <p className="text-[#0A0A0A] font-semibold">The goal throughout this process has not been to move away from what attracted you to the reference website, but rather to build on those strengths and create a website that feels uniquely Sebastian MD.</p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Mockup Gallery */}
        <div className="mb-20">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-2 block">Design Concepts</span>
          <p className="text-[#737373] text-sm mb-8">Click any image to view full size. Images display at full height with preserved aspect ratio.</p>

          <div className={`grid gap-4 ${wideLayout ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {mockups.map((mockup, index) => (
              <div key={index} className="group cursor-pointer" onClick={() => openLightbox(index)}>
                <div className="relative aspect-[4/3] bg-[#F5F5F5] rounded-xl overflow-hidden border border-black/[0.06] mb-3">
                  <Image src={mockup.src} alt={mockup.label} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" />
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

        {/* Understanding the Reference Website */}
        <section className="mb-16">
          <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-6">Understanding The Reference Website</h2>
          <div className="space-y-4 text-[#525252] leading-relaxed">
            <p>The reference website provides a strong starting point for understanding the style of experience you are drawn to.</p>
            <p>In particular, it does a good job of:</p>
            <ul className="space-y-2 ml-4 list-disc list-inside">
              <li>Keeping the layout clean and easy to navigate</li>
              <li>Highlighting treatment categories clearly</li>
              <li>Making booking accessible</li>
              <li>Featuring strong before-and-after imagery</li>
              <li>Creating a founder-led, personal feel</li>
            </ul>
            <p>These are all qualities that I believe are important to carry forward.</p>
            <p>However, while the reference website works well for its brand, I don&apos;t believe Sebastian MD should closely mirror its visual identity.</p>
            <p>The reason is simple: Sebastian MD offers a broader and more sophisticated treatment offering, serves a different audience, and has a unique advantage that deserves to be communicated more clearly.</p>
            <p>Rather than recreating another clinic&apos;s identity, I believe we should use the reference website as inspiration for structure and usability while building a more distinctive brand experience around Sebastian MD itself.</p>
          </div>
        </section>

        {/* The Opportunity */}
        <section className="mb-16">
          <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-6">The Opportunity For Sebastian MD</h2>
          <div className="space-y-4 text-[#525252] leading-relaxed">
            <p>One thing became very clear while reviewing your brief.</p>
            <p className="text-[#0A0A0A] font-semibold">Your greatest competitive advantage is not simply that you provide aesthetic treatments.</p>
            <p className="text-[#0A0A0A] font-semibold">It is that you are a physician-led clinic specialising in advanced aesthetic treatments for diverse and deeper skin tones while delivering highly personalised care.</p>
            <p>That is a much stronger story than simply being another aesthetics clinic.</p>
            <p>Many clinics talk about beauty.</p>
            <p>Far fewer clinics can genuinely speak about expertise, inclusivity, safety for all skin tones, advanced technology, and personalised treatment planning.</p>
            <p>Those are the areas where Sebastian MD can stand apart.</p>
            <p>The proposed direction has been built around highlighting those strengths.</p>
          </div>
        </section>

        {/* Why Logo Refresh */}
        <section className="mb-16">
          <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-6">Why I Suggested A Logo Refresh</h2>
          <div className="space-y-4 text-[#525252] leading-relaxed">
            <p>I appreciate that the current logo has history and recognition behind it.</p>
            <p>My recommendation to explore a refined logo direction is not because there is anything wrong with the existing logo, but because the business itself appears to be evolving into a more premium and medically focused position.</p>
            <p>At the moment, the logo leans more towards a beauty and salon aesthetic.</p>
            <p>The script typography and silhouette icon create a softer beauty-focused impression, whereas the website and clinic are moving towards a more elevated physician-led experience.</p>
            <p>A refined logo would help create stronger alignment between:</p>
            <ul className="space-y-2 ml-4 list-disc list-inside">
              <li>The quality of the treatments</li>
              <li>The professionalism of the clinic</li>
              <li>The technology being used</li>
              <li>The premium experience patients receive</li>
            </ul>
            <p>Importantly, the intention is not to abandon the existing identity.</p>
            <p>The goal would be to evolve it into something cleaner, more versatile, and more representative of where the brand is today.</p>
          </div>
        </section>

        {/* Why Website Feels Different */}
        <section className="mb-16">
          <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-6">Why The Website Feels Different To The Reference Site</h2>
          <div className="space-y-4 text-[#525252] leading-relaxed">
            <p>One concern I anticipated was that the mockups might feel different from the website you originally shared.</p>
            <p>That difference is intentional.</p>
            <p>The reference website feels heavily centred around skincare programs and acne treatment journeys.</p>
            <p>Sebastian MD offers:</p>
            <ul className="space-y-2 ml-4 list-disc list-inside">
              <li>Laser Hair Removal</li>
              <li>ClearLift</li>
              <li>Dye-VL</li>
              <li>Opus Plasma</li>
              <li>Botox & Filler</li>
              <li>Alma TED Hair Restoration</li>
              <li>Alma IQ Skin Analysis</li>
            </ul>
            <p>These treatments naturally require a broader, more medically credible presentation.</p>
            <p>The website therefore places greater emphasis on:</p>
            <ul className="space-y-2 ml-4 list-disc list-inside">
              <li>Expertise</li>
              <li>Technology</li>
              <li>Consultation-led treatment planning</li>
              <li>Patient journeys</li>
              <li>Real outcomes</li>
              <li>Trust building</li>
            </ul>
            <p>while still maintaining a clean, modern and approachable feel.</p>
          </div>
        </section>

        {/* Why Patient Stories */}
        <section className="mb-16">
          <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-6">Why We Focused On Real Patient Stories</h2>
          <div className="space-y-4 text-[#525252] leading-relaxed">
            <p>One part of your brief stood out more than anything else.</p>
            <p>You mentioned that patients should arrive on the website and feel seen.</p>
            <p>That idea became one of the central themes behind the proposed direction.</p>
            <p>Rather than treating before-and-after galleries as simple image collections, I believe there is a significant opportunity to present them as patient journeys and case studies.</p>
            <p>This approach allows prospective patients to see:</p>
            <ul className="space-y-2 ml-4 list-disc list-inside">
              <li>Their own concerns reflected</li>
              <li>Real treatment pathways</li>
              <li>Genuine outcomes</li>
              <li>Authentic testimonials</li>
              <li>The human side of the clinic</li>
            </ul>
            <p>This creates far stronger emotional connection and trust than displaying isolated before-and-after photographs alone.</p>
            <p>The case study approach is particularly powerful for concerns such as:</p>
            <ul className="space-y-2 ml-4 list-disc list-inside">
              <li>Acne</li>
              <li>Hyperpigmentation</li>
              <li>Melasma</li>
              <li>Hair loss</li>
              <li>Skin texture</li>
              <li>Laser hair removal</li>
            </ul>
            <p>because patients often identify themselves in those stories.</p>
          </div>
        </section>

        {/* Why Diversity Featured */}
        <section className="mb-16">
          <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-6">Why Diversity Is Prominently Featured</h2>
          <div className="space-y-4 text-[#525252] leading-relaxed">
            <p>Another major theme throughout the concepts is representation.</p>
            <p>Your brief specifically highlighted:</p>
            <ul className="space-y-2 ml-4 list-disc list-inside">
              <li>Women of colour</li>
              <li>Patients with deeper skin tones</li>
              <li>Diverse communities that are often underserved within aesthetics</li>
            </ul>
            <p>I believe this should be visible throughout the website.</p>
            <p>Not as a marketing tactic, but as a genuine reflection of who you serve.</p>
            <p>The proposed concepts intentionally feature:</p>
            <ul className="space-y-2 ml-4 list-disc list-inside">
              <li>Black patients</li>
              <li>South Asian patients</li>
              <li>Mixed ethnicity patients</li>
              <li>Lighter skin tone patients</li>
            </ul>
            <p>because the message should be clear:</p>
            <p className="text-[#0A0A0A] font-semibold">Sebastian MD is a clinic for everyone, with particular expertise in treating diverse skin safely and effectively.</p>
            <p>This becomes a meaningful differentiator while remaining authentic to your mission.</p>
          </div>
        </section>

        {/* Why Team Photography */}
        <section className="mb-16">
          <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-6">Why Team Photography Is Important</h2>
          <div className="space-y-4 text-[#525252] leading-relaxed">
            <p>The team section is another area where I believe Sebastian MD can outperform many competitors.</p>
            <p>Rather than heavily styled beauty photography, I recommend professional team photography in clinic uniforms and treatment environments.</p>
            <p>This creates:</p>
            <ul className="space-y-2 ml-4 list-disc list-inside">
              <li>Professionalism</li>
              <li>Trust</li>
              <li>Authenticity</li>
              <li>Medical credibility</li>
            </ul>
            <p>Patients are placing their confidence, appearance and health in your hands.</p>
            <p>Seeing the people behind the clinic matters.</p>
            <p>The mockups use placeholder imagery for now, but once your team photography is completed, I believe this section will become one of the strongest parts of the website.</p>
          </div>
        </section>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* What We'll Deliver */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">What we&apos;ll deliver</span>
          <div className="space-y-10">
            {[
              { num: "01", title: "Website Design", body: "A refined, medically-credible aesthetic designed specifically for Sebastian MD's positioning and target audience. Includes homepage, treatment pages, patient story galleries, about/team section, and mobile-responsive layouts with diverse representation throughout." },
              { num: "02", title: "Website Development", body: "The approved design converted into a fast Next.js website. Responsive development, SEO-friendly structure, performance optimisation, and all core pages built and tested." },
              { num: "03", title: "SortedUpdates CMS", body: "Every piece of visible content becomes editable through a secure admin panel. You can update text, images, treatment details, team profiles, and patient stories without technical knowledge or developer assistance." },
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

        {/* Addressing Concerns */}
        <section className="mb-16">
          <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-6">Addressing Potential Concerns</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-lg mb-3">&quot;We really liked the reference website.&quot;</h3>
              <div className="space-y-2 text-[#525252] leading-relaxed">
                <p>Absolutely.</p>
                <p>The structure, clarity and ease of navigation from the reference site have heavily influenced the proposed direction.</p>
                <p>What I have intentionally avoided is creating a website that feels like a variation of another clinic&apos;s brand.</p>
                <p>The goal is to preserve the strengths you liked while creating something that feels unmistakably Sebastian MD.</p>
              </div>
            </div>

            <div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-lg mb-3">&quot;Can we keep the existing logo?&quot;</h3>
              <div className="space-y-2 text-[#525252] leading-relaxed">
                <p>Yes.</p>
                <p>The website can absolutely be developed using the current logo if preferred.</p>
                <p>My recommendation is simply that a refreshed identity would better support the elevated positioning of the new website and future marketing efforts.</p>
              </div>
            </div>

            <div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-lg mb-3">&quot;We don&apos;t want the site to feel too clinical.&quot;</h3>
              <div className="space-y-2 text-[#525252] leading-relaxed">
                <p>I completely agree.</p>
                <p>The goal is not to create a hospital website.</p>
                <p className="text-[#0A0A0A] font-semibold">The balance I am aiming for is: Warm enough to feel personal. Professional enough to feel trustworthy.</p>
                <p>That is why the visual language combines elegant typography, soft neutrals, real photography and approachable messaging.</p>
              </div>
            </div>

            <div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-lg mb-3">&quot;We want the website to feel authentic.&quot;</h3>
              <div className="space-y-2 text-[#525252] leading-relaxed">
                <p>I agree entirely.</p>
                <p>The concepts are currently using placeholder imagery only to demonstrate structure and direction.</p>
                <p>The final website will become significantly stronger once we incorporate:</p>
                <ul className="space-y-1 ml-4 list-disc list-inside">
                  <li>Team photography</li>
                  <li>Founder photography</li>
                  <li>Clinic photography</li>
                  <li>Real patient results</li>
                  <li>Genuine testimonials</li>
                </ul>
                <p>Those assets will ultimately make the site feel uniquely yours.</p>
              </div>
            </div>
          </div>
        </section>

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

        {/* Not Included */}
        <div className="mb-16 p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">Not included</p>
          <ul className="space-y-1">
            {["Professional photography (team, clinic, patient before/after)", "Copywriting for treatment descriptions", "Paid advertising setup or management", "Advanced SEO or content marketing", "Ongoing maintenance or support retainer", "Custom integrations beyond standard forms"].map((item) => (
              <li key={item} className="text-sm text-[#737373]">{item}</li>
            ))}
          </ul>
          <p className="text-xs text-[#A3A3A3] mt-4">These can be discussed separately if required.</p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Final Recommendation */}
        <section className="mb-16">
          <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-6">Final Recommendation</h2>
          <div className="space-y-4 text-[#525252] leading-relaxed">
            <p>My recommendation is to use the reference website as inspiration for usability and structure, while building a more distinctive visual identity around what makes Sebastian MD special.</p>
            <p>That means leaning into:</p>
            <ul className="space-y-2 ml-4 list-disc list-inside">
              <li>Physician-led expertise</li>
              <li>Personalised treatment planning</li>
              <li>Diverse skin expertise</li>
              <li>Real patient stories</li>
              <li>Premium yet approachable design</li>
              <li>Strong before-and-after storytelling</li>
              <li>Authentic team presence</li>
            </ul>
            <p>I believe this creates a website that not only looks beautiful, but also communicates trust, expertise and credibility in a way that supports long-term growth for the business.</p>
            <p className="text-[#0A0A0A] font-semibold">If this looks right, reply to confirm and I&apos;ll send over the deposit invoice to get started. Any questions, just ask.</p>
          </div>
        </section>

        {/* Signature Block */}
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
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
