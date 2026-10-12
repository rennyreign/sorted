"use client"

import { MarketSelector } from "@/components/MarketPricing"
import { useEffect, useState } from "react"
import { Menu, Phone, X } from "lucide-react"
import { MockupButton } from "./SitesMockupModal"

type ActivePage = "how" | "examples" | "pricing" | "included" | "whatelse" | "about" | "updates"
export type HeaderTone = "light" | "dark"

const links = [
  ["how", "How it works", "/howitworks"],
  ["examples", "Examples", "/examples"],
  ["pricing", "Pricing", "/pricing"],
  ["whatelse", "What else we do", "/what-else-we-do"],
  ["about", "About", "/about"],
] as const

export function SitesHeaderClient({ active, tone = "light", variant = "default" }: { active?: ActivePage; tone?: HeaderTone; variant?: "default" | "home" }) {
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

  const darkAtTop = tone === "dark" && !scrolled

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 px-5 py-4 transition-colors duration-200 sm:px-8 ${
        scrolled
          ? "border-b border-black/5 bg-white/92 shadow-[0_10px_30px_rgba(0,0,0,0.035)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      } ${darkAtTop ? "text-white" : "text-[#070707]"}`}
    >
      <div className={`mx-auto flex w-full items-center justify-between ${variant === "home" ? "max-w-[1280px]" : "max-w-[1220px]"}`}>
        <a href="/" className={`inline-block min-h-11 py-2 font-black leading-none tracking-[-0.045em] ${variant === "home" ? "text-[34px] sm:text-[36px]" : "text-[33px] sm:text-[40px]"}`} aria-label="Sorted home">
          Sorted<span className={variant === "home" ? "text-[#d7ff00]" : "text-[#cfe900]"}>.</span>
        </a>
        <nav className={`hidden items-center text-[12px] font-extrabold tracking-[-0.02em] lg:flex ${variant === "home" ? "gap-3 xl:gap-6" : "gap-6"}`}>
          {links.map(([key, label, href]) => (
            <a
              key={key}
              href={href}
              className={`group relative py-2 transition-colors duration-200 ${
                active === key ? "" : darkAtTop ? "text-white/65 hover:text-white" : "text-black/55 hover:text-black"
              }`}
            >
              {label}
              <span
                aria-hidden="true"
                className={`absolute -bottom-0.5 left-1/2 h-[3px] -translate-x-1/2 rounded-full bg-[#dfff00] transition-all duration-300 ease-out ${
                  active === key ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <MarketSelector />
          <a href="https://wa.me/447386468085" aria-label="WhatsApp Sorted" className={`hidden ${variant === "home" ? "xl:block" : "lg:block"} ${variant === "home" && darkAtTop ? "text-[#d7ff00]" : "text-[#04b800]"}`}>
            <Phone className="size-6" strokeWidth={2.4} />
          </a>
          <div className="hidden sm:block">
            <MockupButton variant={darkAtTop ? "yellow" : "nav"} label="Get your free site" className={variant === "home" && darkAtTop ? "bg-[#d7ff00]!" : ""} />
          </div>
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className={`grid size-11 place-items-center rounded-full shadow-[0_10px_28px_rgba(0,0,0,0.16)] lg:hidden ${
              darkAtTop ? "bg-white text-[#070707]" : "bg-[#070707] text-white"
            }`}
          >
            {menuOpen ? <X className="size-5" strokeWidth={2.8} /> : <Menu className="size-5" strokeWidth={2.8} />}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div className="mx-auto mt-3 max-w-[1220px] rounded-[16px] border border-black/10 bg-white/96 p-3 text-[#070707] shadow-[0_18px_44px_rgba(0,0,0,0.12)] backdrop-blur-xl lg:hidden">
          <nav className="grid gap-1 text-[15px] font-black tracking-[-0.03em]">
            {links.map(([key, label, href]) => (
              <a
                key={key}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex min-h-12 items-center justify-between rounded-xl px-4 transition-colors duration-200 ${
                  active === key ? "bg-[#dfff00] text-black" : "text-black/72 hover:bg-black/[0.05] hover:text-black"
                }`}
              >
                {label}
                {active === key ? <span className="size-2 rounded-full bg-black" /> : null}
              </a>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <a href="https://wa.me/447386468085" className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/12 text-[12px] font-black">
              WhatsApp
            </a>
            <div onClick={() => setMenuOpen(false)}>
              <MockupButton variant="nav" className="w-full" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
