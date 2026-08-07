"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowDownUp, ArrowRight, Maximize2, RefreshCw, X } from "lucide-react"
import type { ExampleMockup } from "./data"

type Status = "Mockup" | "Approved" | "Building"

export type MockupExample = ExampleMockup

const filters = ["All", "Home services", "Health & fitness", "Hospitality", "Retail", "Professional", "Other"]

const statusStyles: Record<Status, string> = {
  Mockup: "bg-[#252525] text-white before:bg-[#dfff00]",
  Approved: "bg-[#252525] text-white before:bg-[#6ee700]",
  Building: "bg-[#252525] text-white before:bg-[#ffb000]",
}

const initialVisibleCount = 10
const visibleIncrement = 10

export function ExamplesGallery({ mockups, totalCount }: { mockups: MockupExample[]; totalCount: number }) {
  const [activeFilter, setActiveFilter] = useState("All")
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount)
  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [selectedMockup, setSelectedMockup] = useState<MockupExample | null>(null)

  useEffect(() => {
    setShuffleSeed(Date.now() + Math.floor(Math.random() * 10000))
  }, [])

  const shuffledMockups = useMemo(() => seededShuffle(mockups, shuffleSeed), [mockups, shuffleSeed])

  const filteredMockups = useMemo(() => {
    if (activeFilter === "All") return shuffledMockups
    return shuffledMockups.filter((mockup) => mockup.category === activeFilter)
  }, [activeFilter, shuffledMockups])

  const visibleMockups = useMemo(() => filteredMockups.slice(0, visibleCount), [filteredMockups, visibleCount])
  const hasMoreMockups = visibleCount < filteredMockups.length

  useEffect(() => {
    setVisibleCount(initialVisibleCount)
  }, [activeFilter])

  useEffect(() => {
    if (!selectedMockup) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedMockup(null)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [selectedMockup])

  return (
    <>
      <section id="mockup-factory" className="scroll-mt-28 bg-[#080909] px-5 py-8 text-white sm:px-8 sm:py-10">
        <div className="mx-auto max-w-[1220px]">
          <div className="grid gap-8 lg:grid-cols-[0.28fr_0.72fr]">
            <div>
              <h2 className="max-w-[260px] text-[35px] font-black leading-[0.95] tracking-[-0.05em] sm:text-[42px]">
                Fresh from the factory.
              </h2>
              <p className="mt-4 max-w-[270px] text-[14px] font-semibold leading-[1.45] text-white/74">
                Every design below started as a free mockup. Scroll to see what’s being built right now.
              </p>
              <ArrowRight className="mt-7 hidden size-12 -rotate-45 text-[#dfff00] lg:block" strokeWidth={1.8} />
            </div>

            <div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap gap-3">
                  {filters.map((filter) => {
                    const active = filter === activeFilter
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setActiveFilter(filter)}
                        className={`h-10 rounded-full border px-5 text-[11px] font-black transition-all focus:outline-none focus:ring-2 focus:ring-[#dfff00] focus:ring-offset-2 focus:ring-offset-[#080909] ${
                          active ? "border-white bg-white text-black" : "border-white/28 bg-transparent text-white hover:border-white/70"
                        }`}
                      >
                        {filter}
                      </button>
                    )
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 text-[12px] font-black">
                  <div className="flex items-center gap-5">
                    <span className="text-white/72">{filteredMockups.length} mockups shown</span>
                    <span className="text-[#dfff00]">{totalCount} in the factory</span>
                  </div>
                  <button type="button" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/22 px-4 text-[11px] transition-colors hover:border-white/70">
                    Newest first <ArrowDownUp className="size-3.5" strokeWidth={2.4} />
                  </button>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                {visibleMockups.map((mockup) => (
                  <article key={mockup.id} className="overflow-hidden rounded-[8px] bg-white text-black shadow-[0_16px_34px_rgba(0,0,0,0.28)]">
                    <button
                      type="button"
                      onClick={() => setSelectedMockup(mockup)}
                      className="group relative block aspect-[4/3] w-full overflow-hidden bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#dfff00] focus:ring-offset-2 focus:ring-offset-[#080909]"
                      aria-label={`Open ${mockup.title} ${mockup.location} mockup preview`}
                    >
                      <img
                        src={mockup.image}
                        alt={`${mockup.title} ${mockup.location} website mockup`}
                        loading="eager"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
                      />
                      <span className={`absolute left-2 top-2 inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[9px] font-black before:size-1.5 before:rounded-full ${statusStyles[mockup.status]}`}>
                        {mockup.status}
                      </span>
                      <span className="absolute bottom-2 right-2 grid size-8 translate-y-2 place-items-center rounded-full bg-black/82 text-white opacity-0 shadow-[0_12px_24px_rgba(0,0,0,0.22)] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                        <Maximize2 className="size-4" strokeWidth={2.4} />
                      </span>
                    </button>
                    <div className="grid min-h-[66px] grid-cols-[1fr_auto] gap-2 p-3">
                      <div>
                        <h3 className="text-[12px] font-black leading-tight tracking-[-0.025em]">{mockup.title}</h3>
                        {mockup.location ? <p className="mt-1 text-[11px] font-semibold leading-none text-black/52">{mockup.location}</p> : null}
                      </div>
                      <span className="self-end whitespace-nowrap text-[10px] font-bold text-black/50">{formatFactoryTime(mockup.createdAt)}</span>
                    </div>
                  </article>
                ))}
              </div>

              {hasMoreMockups ? (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => Math.min(count + visibleIncrement, filteredMockups.length))}
                    className="inline-flex h-12 items-center gap-3 rounded-full border border-white/35 px-8 text-[12px] font-black transition-colors hover:border-[#dfff00] hover:text-[#dfff00] focus:outline-none focus:ring-2 focus:ring-[#dfff00]"
                  >
                    Load more mockups <RefreshCw className="size-4" strokeWidth={2.4} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {selectedMockup ? (
        <div
          className="fixed inset-0 z-[120] grid place-items-center bg-black/82 px-4 py-6 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedMockup.title} mockup preview`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedMockup(null)
          }}
        >
          <div className="relative grid max-h-[92dvh] w-full max-w-[1120px] grid-rows-[auto_1fr] overflow-hidden rounded-[14px] bg-[#f7f7f3] shadow-[0_34px_90px_rgba(0,0,0,0.45)] animate-in zoom-in-95 duration-200">
            <header className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-black/10 bg-white px-4 py-3 sm:px-5">
              <div>
                <h3 className="text-[18px] font-black leading-tight tracking-[-0.035em] text-black">{selectedMockup.title}</h3>
                <p className="mt-1 text-[12px] font-bold text-black/50">
                  {selectedMockup.location ? `${selectedMockup.location} · ` : null}{selectedMockup.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMockup(null)}
                className="grid size-11 place-items-center rounded-full bg-[#070707] text-white transition-transform duration-200 hover:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-[#dfff00] focus:ring-offset-2"
                aria-label="Close mockup preview"
              >
                <X className="size-5" strokeWidth={2.6} />
              </button>
            </header>
            <div className="overflow-auto bg-[#efeee9] p-3 sm:p-5">
              <img
                src={selectedMockup.image}
                alt={`${selectedMockup.title} ${selectedMockup.location} enlarged website mockup`}
                className="mx-auto block max-h-none w-full max-w-[980px] rounded-[10px] bg-white shadow-[0_18px_54px_rgba(0,0,0,0.18)]"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function seededShuffle<T>(items: T[], seed: number) {
  const result = [...items]
  let currentSeed = seed || 1

  function random() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280
    return currentSeed / 233280
  }

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = result[index]
    result[index] = result[swapIndex]
    result[swapIndex] = current
  }

  return result
}

function formatFactoryTime(value: string) {
  const createdAt = new Date(value)
  const now = new Date()
  const createdDay = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "2-digit", month: "2-digit", year: "numeric" }).format(createdAt)
  const today = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "2-digit", month: "2-digit", year: "numeric" }).format(now)
  const yesterday = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(now.getTime() - 86400000))
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hour12: false }).format(createdAt)

  if (createdDay === today) return `Today ${time}`
  if (createdDay === yesterday) return `Yesterday ${time}`

  return new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short" }).format(createdAt)
}
