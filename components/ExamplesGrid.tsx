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
}

const examples: Example[] = [
  {
    id: 1,
    title: "AI services company website",
    client: "ADX Engine",
    type: "Website",
    img: "/examples/adxengine.jpg",
    description: "Full marketing site for an AI services company. Hero, features, pricing, and CTA sections. Delivered in 48 hours.",
  },
  {
    id: 2,
    title: "Facebook ad campaign",
    client: "ADX Engine",
    type: "Social ads",
    img: "/examples/adxengine-ad.jpg",
    description: "High-converting ad creative for paid social. Bold visuals, clear value prop, direct CTA.",
  },
  {
    id: 3,
    title: "Healthcare ad campaign",
    client: "Michigan State University",
    type: "Social ads",
    img: "/examples/msu-healthcare.jpg",
    description: "Digital ad for a university healthcare programme. Clean layout, strong CTA, professional tone.",
  },
  {
    id: 5,
    title: "Healthcare clinic flow",
    client: "Clinic Flow",
    type: "Website",
    img: "/examples/clinic-flow.jpg",
    description: "Patient booking system with service pages, doctor profiles, and integrated scheduling.",
  },
  {
    id: 6,
    title: "Children's capability tracking platform",
    client: "Capability Tracker",
    type: "Platform",
    img: "/examples/capabaility-tracker.jpg",
    description: "Platform for tracking children's capabilities and developmental milestones. Clean, intuitive dashboard.",
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
    id: 8,
    title: "University advertising campaign",
    client: "Emory University",
    type: "Social ads",
    img: "/examples/emory-university.jpg",
    description: "Recruitment ad creative for a top university. Eye-catching visuals with clear enrolment CTA.",
  },
  {
    id: 9,
    title: "Personality type platform",
    client: "Kyntra",
    type: "Website",
    img: "/examples/kyntra.jpg",
    description: "Interactive personality type platform with quiz flow, results pages, and sharing. Mobile-first.",
  },
  {
    id: 10,
    title: "University advertising campaign",
    client: "Michigan State University",
    type: "Social ads",
    img: "/examples/msu-scm1.jpg",
    description: "Recruitment ad for a supply chain management programme. Bold visuals, clear value prop.",
  },
  {
    id: 11,
    title: "Property portfolio website",
    client: "Palace & Barns",
    type: "Website",
    img: "/examples/palacebarns.jpg",
    description: "Luxury property portfolio site with listings, gallery, and enquiry form. Elegant and fast.",
  },
  {
    id: 12,
    title: "University ad creative",
    client: "University of South Florida",
    type: "Social ads",
    img: "/examples/usf-ad.jpg",
    description: "Digital ad for university recruitment campaign. Eye-catching design with clear enrolment CTA.",
  },
  {
    id: 13,
    title: "BJJ gym website",
    client: "Gracie Barra Halesowen",
    type: "Website",
    img: "/examples/graciebarra-halesowen.jpg",
    description: "Full website for a Brazilian Jiu-Jitsu gym. Timetable, programmes, gallery, and sign-up flow.",
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
