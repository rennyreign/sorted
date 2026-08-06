"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { exampleCaseStudies } from "./_caseStudies"

export function ExamplesCaseStudyRail() {
  const railRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  function updateScrollState() {
    const rail = railRef.current
    if (!rail) return

    setCanScrollLeft(rail.scrollLeft > 4)
    setCanScrollRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4)
  }

  function scrollRail(direction: "left" | "right") {
    const rail = railRef.current
    if (!rail) return

    rail.scrollBy({
      left: direction === "left" ? -rail.clientWidth : rail.clientWidth,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    updateScrollState()
    rail.addEventListener("scroll", updateScrollState, { passive: true })
    window.addEventListener("resize", updateScrollState)

    return () => {
      rail.removeEventListener("scroll", updateScrollState)
      window.removeEventListener("resize", updateScrollState)
    }
  }, [])

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="max-w-[520px] text-[31px] font-black leading-[0.95] tracking-[-0.05em] sm:text-[38px]">
            Websites we’ve built and launched.
          </h2>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <a href="#mockup-factory" className="inline-flex min-h-11 items-center gap-2 text-[12px] font-black transition-colors hover:text-black/58">
            See the factory <ArrowRight className="size-4" strokeWidth={2.5} />
          </a>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollRail("left")}
              disabled={!canScrollLeft}
              className="grid size-11 place-items-center rounded-full border border-black/10 bg-white text-black shadow-[0_10px_24px_rgba(0,0,0,0.06)] transition-all hover:-translate-x-0.5 hover:bg-[#dfff00] disabled:pointer-events-none disabled:opacity-35"
              aria-label="Scroll examples left"
            >
              <ChevronLeft className="size-5" strokeWidth={2.6} />
            </button>
            <button
              type="button"
              onClick={() => scrollRail("right")}
              disabled={!canScrollRight}
              className="grid size-11 place-items-center rounded-full border border-black/10 bg-white text-black shadow-[0_10px_24px_rgba(0,0,0,0.06)] transition-all hover:translate-x-0.5 hover:bg-[#dfff00] disabled:pointer-events-none disabled:opacity-35"
              aria-label="Scroll examples right"
            >
              <ChevronRight className="size-5" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={railRef}
        className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {exampleCaseStudies.map((site) => (
          <article key={site.title} className="min-w-0 shrink-0 basis-[82vw] snap-start overflow-hidden rounded-[10px] border border-black/12 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.045)] sm:basis-[calc((100%_-_16px)/2)] lg:basis-[calc((100%_-_48px)/4)]">
            <a href={`/examples/${site.slug}`} className="group relative block aspect-[16/10] overflow-hidden bg-[#080808]">
              <Image src={site.image} alt={`${site.business} website`} fill sizes="(min-width: 1024px) 290px, (min-width: 640px) 50vw, 100vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.055]" />
            </a>
            <div className="p-5">
              <h3 className="text-[16px] font-black leading-tight tracking-[-0.035em]">{site.business}</h3>
              <div className="mt-3 flex min-h-[42px] flex-wrap items-start gap-2">
                <span className="inline-flex h-7 items-center rounded-full bg-[#dfff00] px-3 text-[10px] font-black text-black">{site.category}</span>
                <span className="inline-flex h-7 items-center rounded-full bg-black/5 px-3 text-[10px] font-black text-black/58">{site.location}</span>
              </div>
              <a href={`/examples/${site.slug}`} className="mt-4 inline-flex min-h-10 items-center gap-2 text-[12px] font-black">
                View case study <ArrowRight className="size-4" strokeWidth={2.5} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
