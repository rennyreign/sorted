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
    description: "Full marketing site for an AI services company. Hero, features, pricing, and CTA sections. Delivered in 24 hours.",
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

function ExampleCard({ ex, onClick }: { ex: Example; onClick: (ex: Example) => void }) {
  const Wrapper = ex.url
    ? ({ children }: { children: React.ReactNode }) => (
        <a
          href={ex.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-square overflow-hidden cursor-pointer"
        >
          {children}
        </a>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <button
          onClick={() => onClick(ex)}
          className="group relative block aspect-square overflow-hidden w-full cursor-pointer"
        >
          {children}
        </button>
      )

  return (
    <Wrapper>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ex.img}
        alt={ex.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <p className="font-sans font-bold text-white text-base md:text-lg text-center leading-tight tracking-tight">
          {ex.title}
        </p>
        <p className="text-white/80 text-xs md:text-sm mt-1 text-center">
          {ex.client}
        </p>
      </div>
    </Wrapper>
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
        {websites.map((ex) => (
          <ExampleCard key={ex.id} ex={ex} onClick={setSelected} />
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
