"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react"
import { Underline, examples } from "../../_components/SitesPrimitives"

type Device = "desktop" | "tablet" | "mobile"
type Mode = "mockup" | "website"

const liveWebsiteUrl = "https://example.com"

const deviceClasses = {
  desktop: "mx-auto w-full max-w-[720px] aspect-[16/9]",
  tablet: "mx-auto w-full max-w-[460px] aspect-[4/5]",
  mobile: "mx-auto w-full max-w-[245px] aspect-[9/16]",
} satisfies Record<Device, string>

export function ExampleHeroPreview() {
  const [mode, setMode] = useState<Mode>("website")
  const [device, setDevice] = useState<Device>("desktop")
  const example = examples[0]

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
        <HeroModeButtons mode={mode} setMode={setMode} />
      </div>

      <div className={`${deviceClasses[device]} group relative overflow-hidden rounded-[16px] border border-black/10 bg-[#080808] shadow-[0_18px_48px_rgba(0,0,0,0.12)] transition-all duration-300`}>
        <Image
          src={example.image}
          alt={`${example.title} ${mode === "website" ? "live website" : "mockup"} preview`}
          fill
          sizes="(min-width: 1024px) 720px, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
        />
        <div className={mode === "mockup" ? "absolute inset-0 bg-black/18" : "absolute inset-0 bg-white/5"} />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-[11px] font-black text-black shadow-[0_10px_26px_rgba(0,0,0,0.14)]">
          {mode === "website" ? "Live website view" : "Sorted mockup view"}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 rounded-[14px] bg-black/5 p-2 text-center text-[12px] font-bold text-black/55 sm:mt-8 sm:flex sm:flex-wrap sm:justify-center sm:gap-9 sm:bg-transparent sm:p-0 sm:text-[13px]">
        {[
          ["desktop", Monitor, "Desktop"],
          ["tablet", Tablet, "Tablet"],
          ["mobile", Smartphone, "Mobile"],
        ].map(([key, Icon, label]) => {
          const active = device === key
          const RealIcon = Icon as typeof Monitor
          return (
            <button key={key as string} type="button" onClick={() => setDevice(key as Device)} className={`min-h-12 rounded-xl transition-colors sm:min-h-0 sm:rounded-none ${active ? "bg-white text-black shadow-sm sm:bg-transparent sm:shadow-none" : "hover:text-black"}`}>
              <RealIcon className="mx-auto mb-2 size-5" />
              {label as string}
              {active ? <Underline className="mx-auto mt-2 w-14 sm:w-20" /> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function HeroModeButtons({ mode, setMode }: { mode: Mode; setMode: (mode: Mode) => void }) {
  return (
    <>
      <a
        href={liveWebsiteUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-[50px] items-center justify-center gap-3 rounded-full bg-[#070707] px-5 text-[12px] font-black text-white transition-transform hover:-translate-y-0.5 sm:h-[52px] sm:px-7"
      >
        Visit website <ExternalLink className="size-4" />
      </a>
      <button
        type="button"
        onClick={() => setMode(mode === "mockup" ? "website" : "mockup")}
        className={`inline-flex h-[50px] items-center justify-center gap-3 rounded-full px-5 text-[12px] font-black transition-transform hover:-translate-y-0.5 sm:h-[52px] sm:px-7 ${
          mode === "mockup" ? "bg-[#070707] text-white" : "border border-black/20 text-black"
        }`}
      >
        {mode === "mockup" ? "View screenshots" : "View mockup"}
      </button>
    </>
  )
}
