"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { ArrowDownUp, ArrowRight, RefreshCw } from "lucide-react"

type Status = "Mockup" | "Live" | "Building" | "Approved" | "Rejected"

type MockupExample = {
  title: string
  location: string
  category: string
  status: Status
  time: string
  image: string
}

const filters = ["All", "Home services", "Health & fitness", "Hospitality", "Retail", "Professional", "Other"]

const mockups: MockupExample[] = [
  { title: "Gym", location: "Manchester", category: "Health & fitness", status: "Mockup", time: "12m ago", image: "/examples/graciebarra-halesowen.jpg" },
  { title: "Electrician", location: "Birmingham", category: "Home services", status: "Live", time: "28m ago", image: "/examples/clario.jpg" },
  { title: "Landscaping", location: "Leeds", category: "Home services", status: "Mockup", time: "45m ago", image: "/examples/palacebarns.jpg" },
  { title: "Barber Shop", location: "London", category: "Retail", status: "Building", time: "1h ago", image: "/examples/adxengine.jpg" },
  { title: "Roofing", location: "Liverpool", category: "Home services", status: "Approved", time: "1h ago", image: "/examples/kyntra.jpg" },
  { title: "Dentist", location: "Cardiff", category: "Professional", status: "Live", time: "2h ago", image: "/examples/clinic-flow.jpg" },
  { title: "Yoga Studio", location: "Bristol", category: "Health & fitness", status: "Mockup", time: "2h ago", image: "/examples/clario.jpg" },
  { title: "Plumbing", location: "Manchester", category: "Home services", status: "Live", time: "3h ago", image: "/examples/msu-healthcare.jpg" },
  { title: "Interior Design", location: "London", category: "Professional", status: "Mockup", time: "3h ago", image: "/mockups/edgmockup1.png" },
  { title: "Dog Grooming", location: "Leeds", category: "Other", status: "Rejected", time: "4h ago", image: "/examples/adxengine-ad2.jpg" },
  { title: "Car Detailing", location: "Birmingham", category: "Other", status: "Building", time: "4h ago", image: "/mockups/supersteamcarpets.png" },
  { title: "Coffee Shop", location: "Nottingham", category: "Retail", status: "Mockup", time: "5h ago", image: "/examples/adxengine-ad.jpg" },
  { title: "Physiotherapy", location: "London", category: "Professional", status: "Live", time: "5h ago", image: "/examples/msu-scm2.jpg" },
  { title: "Flooring", location: "Leeds", category: "Home services", status: "Mockup", time: "6h ago", image: "/mockups/edgmockup2.png" },
  { title: "Cleaning Services", location: "Birmingham", category: "Home services", status: "Building", time: "6h ago", image: "/proposals/sebastianmd/page-mobile-views.png" },
  { title: "Personal Trainer", location: "Manchester", category: "Health & fitness", status: "Approved", time: "7h ago", image: "/mockups/ptmock1.png" },
  { title: "Architecture", location: "London", category: "Professional", status: "Mockup", time: "7h ago", image: "/proposals/sebastianmd/homev1.png" },
  { title: "Wedding Venue", location: "Cotswolds", category: "Hospitality", status: "Live", time: "8h ago", image: "/proposals/shropshiretents/mockup1.png" },
]

const statusStyles: Record<Status, string> = {
  Mockup: "bg-[#2a2a2a] text-white before:bg-[#dfff00]",
  Live: "bg-[#152916] text-white before:bg-[#00df55]",
  Building: "bg-[#102237] text-white before:bg-[#00a3ff]",
  Approved: "bg-[#2a123e] text-white before:bg-[#ad35ff]",
  Rejected: "bg-[#3a1111] text-white before:bg-[#ff2d20]",
}

export function ExamplesGallery() {
  const [activeFilter, setActiveFilter] = useState("All")

  const filteredMockups = useMemo(() => {
    if (activeFilter === "All") return mockups
    return mockups.filter((mockup) => mockup.category === activeFilter)
  }, [activeFilter])

  return (
    <section className="bg-[#080909] px-5 py-8 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-[1220px]">
        <div className="grid gap-8 lg:grid-cols-[0.28fr_0.72fr]">
          <div>
            <p className="mb-3 text-[11px] font-black uppercase text-[#dfff00]">Latest mockups</p>
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
                  <span className="text-white/72">{filteredMockups.length === mockups.length ? "482" : filteredMockups.length} mockups</span>
                  <span className="text-[#dfff00]">+7 today</span>
                </div>
                <button type="button" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/22 px-4 text-[11px] transition-colors hover:border-white/70">
                  Newest first <ArrowDownUp className="size-3.5" strokeWidth={2.4} />
                </button>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
              {filteredMockups.map((mockup) => (
                <article key={`${mockup.title}-${mockup.location}`} className="overflow-hidden rounded-[8px] bg-white text-black shadow-[0_16px_34px_rgba(0,0,0,0.28)]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-white">
                    <Image
                      src={mockup.image}
                      alt={`${mockup.title} ${mockup.location} website mockup`}
                      fill
                      sizes="(min-width: 1280px) 150px, (min-width: 768px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 hover:scale-[1.06]"
                    />
                    <span className={`absolute left-2 top-2 inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[9px] font-black before:size-1.5 before:rounded-full ${statusStyles[mockup.status]}`}>
                      {mockup.status}
                    </span>
                  </div>
                  <div className="grid min-h-[66px] grid-cols-[1fr_auto] gap-2 p-3">
                    <div>
                      <h3 className="text-[12px] font-black leading-tight tracking-[-0.025em]">{mockup.title}</h3>
                      <p className="mt-1 text-[11px] font-semibold leading-none text-black/52">{mockup.location}</p>
                    </div>
                    <span className="self-end whitespace-nowrap text-[10px] font-bold text-black/50">{mockup.time}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button type="button" className="inline-flex h-12 items-center gap-3 rounded-full border border-white/35 px-8 text-[12px] font-black transition-colors hover:border-[#dfff00] hover:text-[#dfff00] focus:outline-none focus:ring-2 focus:ring-[#dfff00]">
                Load more mockups <RefreshCw className="size-4" strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
