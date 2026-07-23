"use client"

import Image from "next/image"
import { useState } from "react"
import { ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react"
import { Underline } from "../../_components/SitesPrimitives"

type Device = "desktop" | "tablet" | "mobile"

const deviceClasses = {
  desktop: "mx-auto w-full max-w-[720px] aspect-[16/10]",
  tablet: "mx-auto w-full max-w-[450px] aspect-[4/5]",
  mobile: "mx-auto w-full max-w-[245px] aspect-[9/16]",
} satisfies Record<Device, string>

const devices = [
  ["desktop", Monitor, "Desktop"],
  ["tablet", Tablet, "Tablet"],
  ["mobile", Smartphone, "Mobile"],
] as const

export function CaseStudyHeroPreview({ business, image, liveUrl }: { business: string; image: string; liveUrl?: string }) {
  const [device, setDevice] = useState<Device>("desktop")

  return (
    <div>
      {liveUrl ? (
        <div className="mb-6 flex justify-center sm:mb-8">
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[50px] items-center justify-center gap-3 rounded-full bg-[#070707] px-5 text-[12px] font-black text-white transition-transform hover:-translate-y-0.5 sm:h-[52px] sm:px-7"
          >
            Visit website <ExternalLink className="size-4" />
          </a>
        </div>
      ) : null}

      <div className={`${deviceClasses[device]} group relative overflow-hidden rounded-[16px] border border-black/10 bg-[#080808] shadow-[0_18px_48px_rgba(0,0,0,0.12)] transition-all duration-300`}>
        <Image
          src={image}
          alt={`${business} website preview`}
          fill
          sizes="(min-width: 1024px) 720px, 100vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.035]"
          priority
        />
        <div className="absolute inset-0 bg-white/5" />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-[11px] font-black text-black shadow-[0_10px_26px_rgba(0,0,0,0.14)]">
          Live website view
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 rounded-[14px] bg-black/5 p-2 text-center text-[12px] font-bold text-black/55 sm:mt-8 sm:flex sm:flex-wrap sm:justify-center sm:gap-9 sm:bg-transparent sm:p-0 sm:text-[13px]">
        {devices.map(([key, Icon, label]) => {
          const active = device === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setDevice(key)}
              className={`min-h-12 rounded-xl transition-colors sm:min-h-0 sm:rounded-none ${active ? "bg-white text-black shadow-sm sm:bg-transparent sm:shadow-none" : "hover:text-black"}`}
            >
              <Icon className="mx-auto mb-2 size-5" />
              {label}
              {active ? <Underline className="mx-auto mt-2 w-14 sm:w-20" /> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
