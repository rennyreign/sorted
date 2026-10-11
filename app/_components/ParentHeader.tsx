"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Menu, X } from "lucide-react"
import { parentMarker } from "./ParentFonts"

const links = [
  ["Sites", "/sites"],
  ["Ads", "/ads"],
  ["Work", "/examples"],
  ["About", "/about"],
] as const

export function ParentHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function updateScrolled() {
      setScrolled(window.scrollY > 12)
    }
    updateScrolled()
    window.addEventListener("scroll", updateScrolled, { passive: true })
    return () => window.removeEventListener("scroll", updateScrolled)
  }, [])

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 h-[72px] px-5 transition-colors duration-200 sm:px-8 ${
        scrolled
          ? "border-b border-black/5 bg-[#F8F7F2]/85 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between">
        <a href="/" className={`inline-block text-[27px] font-black leading-none tracking-[-0.045em] sm:text-[30px] ${parentMarker.variable}`} aria-label="Sorted home">
          Sorted<span className="text-[#96B400]">.</span>
        </a>

        <nav className="hidden items-center gap-8 text-[13px] font-bold tracking-[-0.01em] text-[#081614]/80 md:flex">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="relative py-2 transition-colors hover:text-[#081614]">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="/contact"
            className="hidden min-h-10 items-center gap-2 rounded-full bg-[#08251F] px-5 text-[13px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(8,37,31,0.25)] md:inline-flex"
          >
            Get Sorted
            <ArrowRight className="size-4" strokeWidth={2.6} />
          </a>
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-11 place-items-center rounded-full bg-[#08251F] text-white shadow-[0_10px_28px_rgba(0,0,0,0.16)] md:hidden"
          >
            {menuOpen ? <X className="size-5" strokeWidth={2.8} /> : <Menu className="size-5" strokeWidth={2.8} />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="mx-auto mt-3 max-w-[1320px] rounded-[20px] border border-black/10 bg-[#F8F7F2]/97 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.12)] backdrop-blur-xl md:hidden">
          <nav className="grid gap-1 text-[17px] font-bold tracking-[-0.02em]">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center rounded-xl px-4 text-[#081614]/80 transition-colors hover:bg-black/5"
              >
                {label}
              </a>
            ))}
            <a
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex min-h-12 items-center justify-between rounded-xl bg-[#08251F] px-4 text-white"
            >
              Get Sorted
              <ArrowRight className="size-4" strokeWidth={2.6} />
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
