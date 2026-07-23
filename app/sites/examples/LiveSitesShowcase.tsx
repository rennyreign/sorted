"use client"

import Image from "next/image"
import { useState } from "react"
import { ArrowRight, ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react"

type Device = "desktop" | "tablet" | "mobile"

type BuiltSite = {
  title: string
  business: string
  location: string
  promise: string
  description: string
  stats: [string, string][]
  liveUrl?: string
  privateLabel?: string
  screenshots?: Record<Device, string>
}

const builtSites: BuiltSite[] = [
  {
    title: "Designed to earn the booking.",
    business: "Warwickshire Short Stays",
    location: "Warwickshire",
    promise: "A professional booking website for short-term stays, contractors and relocation guests.",
    description:
      "Property catalogue, accommodation pages and a booking-first enquiry journey that helps guests trust the business before they arrive.",
    stats: [
      ["5", "properties showcased"],
      ["Direct", "booking-first journey"],
    ],
    privateLabel: "Private delivery",
  },
  {
    title: "A luxury stay deserves a luxury website.",
    business: "Palace Barn & Cottage",
    location: "Shropshire",
    promise: "A refined hospitality site built around calm, trust and reservations.",
    description:
      "Editorial photography, clear accommodation routes and a booking experience that matches the quality of the retreat.",
    stats: [
      ["2", "luxury properties"],
      ["100%", "responsive redesign"],
    ],
    liveUrl: "https://palacebarns.com/",
    screenshots: {
      desktop: "/examples/live/palace-barn-cottage-desktop.png",
      tablet: "/examples/live/palace-barn-cottage-tablet.png",
      mobile: "/examples/live/palace-barn-cottage-mobile.png",
    },
  },
  {
    title: "A coaching brand built to convert.",
    business: "BodySharp Fitness",
    location: "Birmingham",
    promise: "A premium coaching website that sells energy, confidence and action.",
    description:
      "Strong positioning, clear programme pathways and a direct route into Discovery Sessions for serious prospects.",
    stats: [
      ["3", "coaching pathways"],
      ["20+", "years of expertise"],
    ],
    liveUrl: "https://bodysharpfitness.com/",
    screenshots: {
      desktop: "/examples/live/bodysharp-fitness-desktop.png",
      tablet: "/examples/live/bodysharp-fitness-tablet.png",
      mobile: "/examples/live/bodysharp-fitness-mobile.png",
    },
  },
  {
    title: "An online presence worthy of the work.",
    business: "Savannah Villegas",
    location: "Tennessee",
    promise: "A premium portfolio site for social-first video and brand films.",
    description:
      "Clean typography, cinematic presentation and a calm enquiry path that lets the creative work carry the page.",
    stats: [
      ["8", "custom pages"],
      ["Premium", "editorial system"],
    ],
    liveUrl: "https://savannahvillegas.com/",
    screenshots: {
      desktop: "/examples/live/savannah-villegas-desktop.png",
      tablet: "/examples/live/savannah-villegas-tablet.png",
      mobile: "/examples/live/savannah-villegas-mobile.png",
    },
  },
  {
    title: "A website as disciplined as the academy.",
    business: "Gracie Barra Halesowen",
    location: "Halesowen",
    promise: "A clearer academy website for beginners, children, adults and competitors.",
    description:
      "A full rebuild with stronger programme pages, sharper calls to action and a cleaner path to book an introduction.",
    stats: [
      ["5", "programme pages"],
      ["4.9/5", "Google rating"],
    ],
    liveUrl: "https://gbhalesowen.com/",
    screenshots: {
      desktop: "/examples/live/gracie-barra-halesowen-desktop.png",
      tablet: "/examples/live/gracie-barra-halesowen-tablet.png",
      mobile: "/examples/live/gracie-barra-halesowen-mobile.png",
    },
  },
]

const deviceOptions = [
  [Monitor, "desktop", "Desktop"] as const,
  [Tablet, "tablet", "Tablet"] as const,
  [Smartphone, "mobile", "Mobile"] as const,
]

export function LiveSitesShowcase() {
  const [device, setDevice] = useState<Device>("desktop")

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[520px] text-[14px] font-semibold leading-[1.45] text-black/62">
          Switch the preview size to see how the same finished websites hold up across desktop, tablet and mobile.
        </p>
        <div className="inline-grid w-full grid-cols-3 rounded-full border border-black/10 bg-black/[0.035] p-1 sm:w-auto">
          {deviceOptions.map(([Icon, value, label]) => {
            const active = device === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setDevice(value)}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-[11px] font-black transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#dfff00] ${
                  active ? "bg-black text-white shadow-[0_10px_22px_rgba(0,0,0,0.16)]" : "text-black/58 hover:text-black"
                }`}
                aria-pressed={active}
              >
                <Icon className="size-4" strokeWidth={2.4} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {builtSites.map((site) => (
          <article key={site.business} className="group overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_18px_48px_rgba(0,0,0,0.06)]">
            <div className="relative grid min-h-[230px] place-items-center overflow-hidden bg-[#090909] p-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_16%,rgba(223,255,0,0.22),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.08),transparent_45%)]" />
              {site.screenshots ? (
                <div className={`${previewShellClass(device)} relative z-10 overflow-hidden rounded-[10px] border border-white/20 bg-white shadow-[0_22px_54px_rgba(0,0,0,0.36)] transition-all duration-300`}>
                  <Image
                    src={site.screenshots[device]}
                    alt={`${site.business} ${device} website preview`}
                    fill
                    sizes="(min-width: 1280px) 220px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.035]"
                  />
                </div>
              ) : (
                <div className="relative z-10 h-[178px] w-full overflow-hidden rounded-[10px] border border-white/20 bg-[#f4f0e8] p-4 shadow-[0_22px_54px_rgba(0,0,0,0.26)]">
                  <div className="h-full rounded-[8px] border border-black/10 bg-white p-4">
                    <div className="h-2 w-16 rounded-full bg-black/18" />
                    <div className="mt-8 h-5 w-28 rounded-full bg-black" />
                    <div className="mt-2 h-5 w-20 rounded-full bg-black" />
                    <div className="mt-5 h-2 w-full rounded-full bg-[#dfff00]" />
                    <div className="mt-6 grid grid-cols-3 gap-2">
                      <div className="h-10 rounded bg-black/8" />
                      <div className="h-10 rounded bg-black/8" />
                      <div className="h-10 rounded bg-black/8" />
                    </div>
                  </div>
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-[10px] font-black text-white shadow-[0_12px_26px_rgba(0,0,0,0.28)]">
                    {site.privateLabel}
                  </span>
                </div>
              )}
              <span className="absolute left-4 top-4 z-20 rounded-full bg-[#dfff00] px-3 py-1.5 text-[10px] font-black text-black">
                {site.privateLabel ?? "Live"}
              </span>
            </div>

            <div className="p-5">
              <p className="text-[11px] font-black text-black/42">{site.business}</p>
              <h3 className="mt-3 min-h-[78px] text-[24px] font-black leading-[0.92] tracking-[-0.055em]">{site.title}</h3>
              <p className="mt-4 text-[12px] font-black leading-[1.35] text-black/75">{site.promise}</p>
              <p className="mt-3 min-h-[68px] text-[12px] font-semibold leading-[1.42] text-black/56">{site.description}</p>

              <div className="mt-5 grid grid-cols-2 gap-2 border-y border-black/10 py-3">
                {site.stats.map(([value, label]) => (
                  <div key={label}>
                    <p className="text-[18px] font-black leading-none tracking-[-0.04em] text-black">{value}</p>
                    <p className="mt-1 text-[9px] font-black uppercase leading-[1.2] text-black/42">{label}</p>
                  </div>
                ))}
              </div>

              {site.liveUrl ? (
                <a
                  href={site.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-10 items-center gap-2 text-[12px] font-black transition-colors hover:text-black/58"
                >
                  Visit website <ExternalLink className="size-4" strokeWidth={2.4} />
                </a>
              ) : (
                <span className="mt-4 inline-flex min-h-10 items-center gap-2 text-[12px] font-black text-black/42">
                  Private project <ArrowRight className="size-4" strokeWidth={2.4} />
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function previewShellClass(device: Device) {
  if (device === "mobile") return "h-[190px] w-[92px]"
  if (device === "tablet") return "h-[190px] w-[144px]"
  return "aspect-[16/10] w-full"
}
