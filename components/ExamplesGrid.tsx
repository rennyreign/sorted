"use client"

import { useState, useEffect, useCallback } from "react"

interface Example {
  id: number
  title: string
  client: string
  type: string
  img: string
  description: string
}

const examples: Example[] = [
  {
    id: 1,
    title: "Local plumber website",
    client: "Bradshaw Plumbing",
    type: "Website",
    img: "https://picsum.photos/seed/sorted01/800/560",
    description: "One-page site with contact form, service list, and Google Maps embed. Done in 36 hours.",
  },
  {
    id: 2,
    title: "Restaurant landing page",
    client: "The Yard Kitchen",
    type: "Landing page",
    img: "https://picsum.photos/seed/sorted02/800/560",
    description: "Menu showcase, booking link, and Instagram feed integration. Clean and mobile-first.",
  },
  {
    id: 3,
    title: "Hair salon rebrand",
    client: "Studio Noire",
    type: "Logo & brand",
    img: "https://picsum.photos/seed/sorted03/800/560",
    description: "New logo, colour palette, and social media template set. Delivered same day.",
  },
  {
    id: 4,
    title: "Facebook ad campaign",
    client: "Midlands Fencing Co.",
    type: "Social ads",
    img: "https://picsum.photos/seed/sorted04/800/560",
    description: "3 ad variants for a local fencing company. Targeted 25-mile radius, 4x ROAS.",
  },
  {
    id: 5,
    title: "Electrician Google profile",
    client: "Spark & Sons",
    type: "Google profile",
    img: "https://picsum.photos/seed/sorted05/800/560",
    description: "Optimised Google Business profile, photos, and review strategy. 3x more calls in 2 weeks.",
  },
  {
    id: 6,
    title: "Gym membership page",
    client: "Ironworks Leeds",
    type: "Landing page",
    img: "https://picsum.photos/seed/sorted06/800/560",
    description: "High-converting sign-up page with pricing table, FAQs, and payment integration.",
  },
  {
    id: 7,
    title: "Florist Instagram pack",
    client: "Bloom & Co.",
    type: "Social ads",
    img: "https://picsum.photos/seed/sorted07/800/560",
    description: "10-post content pack, story templates, and highlight covers. Ready to post.",
  },
  {
    id: 8,
    title: "Accountancy firm website",
    client: "Heaton & Partners",
    type: "Website",
    img: "https://picsum.photos/seed/sorted08/800/560",
    description: "Professional 4-page site with services, team profiles, and contact. Built in 48 hours.",
  },
  {
    id: 9,
    title: "Estate agent logo",
    client: "Harrow & Green",
    type: "Logo & brand",
    img: "https://picsum.photos/seed/sorted09/800/560",
    description: "Mark, wordmark, and business card design. Clean and timeless.",
  },
  {
    id: 10,
    title: "Café menu flyer",
    client: "The Morning Press",
    type: "Print & flyer",
    img: "https://picsum.photos/seed/sorted10/800/560",
    description: "Double-sided A5 menu flyer, print-ready PDF. Turnaround: same day.",
  },
  {
    id: 11,
    title: "TikTok ad creative",
    client: "Skin by Layla",
    type: "Social ads",
    img: "https://picsum.photos/seed/sorted11/800/560",
    description: "Short-form video script, captions, and still creative for a skincare brand launch.",
  },
  {
    id: 12,
    title: "Cleaning company site",
    client: "Bright & Tidy",
    type: "Website",
    img: "https://picsum.photos/seed/sorted12/800/560",
    description: "Quote request form, before/after gallery, and local SEO setup. Live in 48 hours.",
  },
]

const typeColour: Record<string, string> = {
  "Website": "bg-blue-50 text-blue-700",
  "Landing page": "bg-violet-50 text-violet-700",
  "Logo & brand": "bg-amber-50 text-amber-700",
  "Social ads": "bg-green-50 text-green-700",
  "Google profile": "bg-orange-50 text-orange-700",
  "Print & flyer": "bg-rose-50 text-rose-700",
}

export default function ExamplesGrid() {
  const [selected, setSelected] = useState<Example | null>(null)

  const close = useCallback(() => setSelected(null), [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close()
    }
    if (selected) {
      document.addEventListener("keydown", onKey)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [selected, close])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {examples.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setSelected(ex)}
            className="group text-left rounded-2xl overflow-hidden border border-black/[0.06] bg-white hover:border-black/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            <div className="relative overflow-hidden aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ex.img}
                alt={ex.title}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className={`font-mono text-[10px] uppercase tracking-[0.15em] font-medium px-2 py-0.5 rounded-full ${typeColour[ex.type] ?? "bg-black/5 text-black/60"}`}>
                  {ex.type}
                </span>
                <svg className="w-4 h-4 text-[#C4C4C4] group-hover:text-[#0A0A0A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="font-sans font-bold text-[#0A0A0A] text-base leading-snug tracking-tight">{ex.title}</p>
              <p className="font-sans text-xs text-[#A3A3A3] mt-0.5">{ex.client}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-black/60 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors duration-200"
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            <div className="aspect-[16/10] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.img} alt={selected.title} className="w-full h-full object-cover" />
            </div>

            <div className="p-6 sm:p-8">
              <span className={`inline-block font-mono text-[10px] uppercase tracking-[0.15em] font-medium px-2 py-0.5 rounded-full mb-4 ${typeColour[selected.type] ?? "bg-black/5 text-black/60"}`}>
                {selected.type}
              </span>
              <h3 className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight leading-tight mb-1">
                {selected.title}
              </h3>
              <p className="font-sans text-sm text-[#A3A3A3] mb-4">{selected.client}</p>
              <p className="font-sans text-base text-[#525252] leading-relaxed mb-6">
                {selected.description}
              </p>
              <a
                href="/#get-started"
                onClick={close}
                className="group inline-flex items-center gap-3 bg-[#0A0A0A] text-white font-semibold text-sm rounded-full px-6 py-3 hover:bg-[#2a2a2a] transition-all duration-300"
              >
                Get something like this
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 8L8 2M8 2H4M8 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
