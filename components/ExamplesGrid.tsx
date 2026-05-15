"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"

interface Example {
  id: number
  title: string
  client: string
  type: string
  img: string
  description: string
  url?: string
}

// Websites with outbound links
const websites: Example[] = [
  {
    id: 11,
    title: "Property portfolio website",
    client: "Palace & Barns",
    type: "Website",
    img: "/examples/palacebarns.jpg",
    description: "Luxury property portfolio site with listings, gallery, and enquiry form. Elegant and fast.",
    url: "https://palacebarns.com",
  },
  {
    id: 13,
    title: "BJJ gym website",
    client: "Gracie Barra Halesowen",
    type: "Website",
    img: "/examples/graciebarra-halesowen.jpg",
    description: "Full website for a Brazilian Jiu-Jitsu gym. Timetable, programmes, gallery, and sign-up flow.",
    url: "https://gbhalesowen.com",
  },
  {
    id: 1,
    title: "AI services company website",
    client: "ADX Engine",
    type: "Website",
    img: "/examples/adxengine.jpg",
    description: "Full marketing site for an AI services company. Hero, features, pricing, and CTA sections. Delivered in 48 hours.",
    url: "https://adxengine.net",
  },
  {
    id: 5,
    title: "Healthcare clinic flow",
    client: "Clinic Flow",
    type: "Website",
    img: "/examples/clinic-flow.jpg",
    description: "Patient booking system with service pages, doctor profiles, and integrated scheduling.",
    url: "https://clinicflow.agency",
  },
  {
    id: 7,
    title: "Health & wellness platform",
    client: "Clario",
    type: "Website",
    img: "/examples/clario.jpg",
    description: "Multi-page site for a clinical research platform. Professional, trustworthy, conversion-focused.",
  },
  {
    id: 9,
    title: "Personality type platform",
    client: "Kyntra",
    type: "Website",
    img: "/examples/kyntra.jpg",
    description: "Interactive personality type platform with quiz flow, results pages, and sharing. Mobile-first.",
  },
]

// Ad creative (no outbound links, opens modal)
const adCreative: Example[] = [
  {
    id: 2,
    title: "Facebook ad campaign",
    client: "ADX Engine",
    type: "Social ads",
    img: "/examples/adxengine-ad.jpg",
    description: "High-converting ad creative for paid social. Bold visuals, clear value prop, direct CTA.",
  },
]

const typeColour: Record<string, string> = {
  "Website": "bg-blue-50 text-blue-700",
  "Landing page": "bg-violet-50 text-violet-700",
  "Logo & brand": "bg-amber-50 text-amber-700",
  "Social ads": "bg-green-50 text-green-700",
  "Platform": "bg-teal-50 text-teal-700",
  "Google profile": "bg-orange-50 text-orange-700",
  "Print & flyer": "bg-rose-50 text-rose-700",
}

function ExampleCard({ ex, onClick }: { ex: Example; onClick: (ex: Example) => void }) {
  const CardWrapper = ex.url 
    ? ({ children }: { children: React.ReactNode }) => (
        <a
          href={ex.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group text-left rounded-2xl overflow-hidden border border-black/[0.06] bg-white hover:border-black/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] block"
        >
          {children}
        </a>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <button
          onClick={() => onClick(ex)}
          className="group text-left rounded-2xl overflow-hidden border border-black/[0.06] bg-white hover:border-black/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] block w-full"
        >
          {children}
        </button>
      )

  return (
    <CardWrapper>
      <div className="relative overflow-hidden aspect-[4/5]">
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
          {ex.url ? (
            <svg className="w-4 h-4 text-[#C4C4C4] group-hover:text-[#0A0A0A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0" viewBox="0 0 16 16" fill="none">
              <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 text-[#C4C4C4] group-hover:text-[#0A0A0A] transition-all duration-200 shrink-0" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="4" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
            </svg>
          )}
        </div>
        <p className="font-sans font-bold text-[#0A0A0A] text-base leading-snug tracking-tight">{ex.title}</p>
        <p className="font-sans text-xs text-[#A3A3A3] mt-0.5">{ex.client}</p>
      </div>
    </CardWrapper>
  )
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
      {/* Websites Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-6">Websites</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {websites.map((ex) => (
            <ExampleCard key={ex.id} ex={ex} onClick={setSelected} />
          ))}
        </div>
      </div>

      {/* Ad Creative Section */}
      <div>
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-6">Ad Creative</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {adCreative.map((ex) => (
            <ExampleCard key={ex.id} ex={ex} onClick={setSelected} />
          ))}
        </div>
      </div>

      {selected && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm cursor-pointer"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors duration-200"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M1 1L11 11M11 1L1 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected.img}
            alt={selected.title}
            className="max-w-full max-h-[90vh] rounded-xl shadow-[0_32px_80px_rgba(0,0,0,0.4)] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  )
}
