"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { supabase } from "@/lib/supabase"

export type Example = {
  id: string
  business_name: string
  image_url: string
  type: "mockup" | "live"
  live_url: string | null
  category: string | null
  created_at: string
}

// Fallback examples shown until the Supabase examples table is populated.
const fallbackExamples: Example[] = [
  {
    id: "palace-barns",
    business_name: "Palace & Barns",
    image_url: "/examples/palacebarns.jpg",
    type: "live",
    live_url: "https://palacebarns.com",
    category: "Property",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "gbhalesowen",
    business_name: "Gracie Barra Halesowen",
    image_url: "/examples/graciebarra-halesowen.jpg",
    type: "live",
    live_url: "https://gbhalesowen.com",
    category: "Fitness",
    created_at: "2026-01-02T00:00:00Z",
  },
  {
    id: "adxengine",
    business_name: "ADX Engine",
    image_url: "/examples/adxengine.jpg",
    type: "live",
    live_url: "https://adxengine.net",
    category: "AI Services",
    created_at: "2026-01-03T00:00:00Z",
  },
  {
    id: "clinic-flow",
    business_name: "Clinic Flow",
    image_url: "/examples/clinic-flow.jpg",
    type: "live",
    live_url: "https://clinicflow.agency",
    category: "Healthcare",
    created_at: "2026-01-04T00:00:00Z",
  },
  {
    id: "clario",
    business_name: "Clario",
    image_url: "/examples/clario.jpg",
    type: "mockup",
    live_url: null,
    category: "Health & Wellness",
    created_at: "2026-01-05T00:00:00Z",
  },
  {
    id: "kyntra",
    business_name: "Kyntra",
    image_url: "/examples/kyntra.jpg",
    type: "mockup",
    live_url: null,
    category: "Platform",
    created_at: "2026-01-06T00:00:00Z",
  },
]

function ExampleCard({
  ex,
  onClick,
}: {
  ex: Example
  onClick: (ex: Example) => void
}) {
  const Wrapper = ex.live_url
    ? ({ children }: { children: React.ReactNode }) => (
        <a
          href={ex.live_url!}
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
        src={ex.image_url}
        alt={ex.business_name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {ex.type === "live" && (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
            Live
          </span>
        )}
        <p className="font-sans font-bold text-white text-base md:text-lg text-center leading-tight tracking-tight">
          {ex.business_name}
        </p>
        {ex.category && (
          <p className="text-white/70 text-xs md:text-sm mt-1 text-center">
            {ex.category}
          </p>
        )}
      </div>
    </Wrapper>
  )
}

function ExampleSection({
  title,
  examples,
  onClick,
}: {
  title: string
  examples: Example[]
  onClick: (ex: Example) => void
}) {
  if (examples.length === 0) return null

  return (
    <div className="mb-16">
      <div className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto mb-6">
        <h2 className="text-2xl font-bold text-[#0A0A0A]">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
        {examples.map((ex) => (
          <ExampleCard key={ex.id} ex={ex} onClick={onClick} />
        ))}
      </div>
    </div>
  )
}

export default function ExamplesGrid() {
  const [examples, setExamples] = useState<Example[] | null>(null)
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState<Example | null>(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("examples")
        .select("id, business_name, image_url, type, live_url, category, created_at")
        .order("created_at", { ascending: false })

      if (error || !data || data.length === 0) {
        setExamples(fallbackExamples)
        return
      }
      setExamples(data as Example[])
    }
    load()
  }, [])

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

  if (error) {
    return (
      <div className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto py-20 text-center">
        <p className="text-[#737373]">Could not load examples. Please try again later.</p>
      </div>
    )
  }

  if (examples === null) {
    return (
      <div className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto py-20 text-center">
        <p className="text-[#A3A3A3]">Loading examples…</p>
      </div>
    )
  }

  const live = examples.filter((ex) => ex.type === "live")
  const mockups = examples.filter((ex) => ex.type === "mockup")

  return (
    <>
      <ExampleSection title="Live websites" examples={live} onClick={setSelected} />
      <ExampleSection title="Recent mockups" examples={mockups} onClick={setSelected} />

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
            src={selected.image_url}
            alt={selected.business_name}
            className="max-w-full max-h-[90vh] rounded-xl shadow-[0_32px_80px_rgba(0,0,0,0.4)] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  )
}
