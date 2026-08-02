"use client"

import { useEffect, useState } from "react"
import { LogOut, Menu, Phone, X } from "lucide-react"
import { MockupButton } from "./SitesMockupModal"

type ActivePage = "how" | "examples" | "pricing" | "about" | "updates"

const links = [
  ["how", "How it works", "/howitworks"],
  ["examples", "Examples", "/examples"],
  ["pricing", "Pricing", "/pricing"],
  ["about", "About", "/about"],
  ["updates", "SortedUpdates", "/website-updates"],
] as const

export function SitesHeaderClient({ active }: { active?: ActivePage }) {
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
      className={`fixed left-0 right-0 top-0 z-50 px-5 py-4 transition-colors duration-200 sm:px-8 ${
        scrolled ? "border-b border-black/5 bg-white/82 shadow-[0_10px_30px_rgba(0,0,0,0.035)] backdrop-blur-xl" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1220px] items-center justify-between">
        <a href="/sites" className="inline-block min-h-11 py-2 text-[33px] font-black leading-none tracking-[-0.045em] sm:text-[40px]" aria-label="Sorted Sites home">
          Sorted<span className="text-[#cfe900]">.</span><span className="[font-family:var(--font-sites-bakeshop)] translate-y-[-0.06em] text-[#cfe900]">sites</span>
        </a>
        <nav className="hidden items-center gap-8 text-[12px] font-extrabold tracking-[-0.02em] md:flex">
          {links.map(([key, label, href]) => (
            <a key={key} href={href} className="relative py-2">
              {label}
              {active === key ? <span className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full bg-[#dfff00]" /> : null}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <a
            href="/"
            aria-label="Back to Sorted homepage"
            className="hidden rounded-full border border-black/10 p-2 text-black/70 transition-colors hover:bg-black/5 md:block"
          >
            <LogOut className="size-5" strokeWidth={2.4} />
          </a>
          <a href="https://wa.me/447386468085" aria-label="WhatsApp Sorted" className="hidden text-[#04b800] md:block">
            <Phone className="size-6" strokeWidth={2.4} />
          </a>
          <div className="hidden sm:block">
            <MockupButton variant="nav" />
          </div>
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-11 place-items-center rounded-full bg-[#070707] text-white shadow-[0_10px_28px_rgba(0,0,0,0.16)] md:hidden"
          >
            {menuOpen ? <X className="size-5" strokeWidth={2.8} /> : <Menu className="size-5" strokeWidth={2.8} />}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div className="mx-auto mt-3 max-w-[1220px] rounded-[16px] border border-black/10 bg-white/96 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.12)] backdrop-blur-xl md:hidden">
          <nav className="grid gap-1 text-[15px] font-black tracking-[-0.03em]">
            {links.map(([key, label, href]) => (
              <a
                key={key}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex min-h-12 items-center justify-between rounded-xl px-4 ${
                  active === key ? "bg-[#dfff00] text-black" : "text-black/72"
                }`}
              >
                {label}
                {active === key ? <span className="size-2 rounded-full bg-black" /> : null}
              </a>
            ))}
          </nav>
          <a
            href="/"
            onClick={() => setMenuOpen(false)}
            className="mt-3 flex min-h-12 items-center justify-between rounded-xl border border-black/10 px-4 text-[15px] font-black text-black/72"
          >
            Back to Sorted
            <LogOut className="size-4" strokeWidth={2.4} />
          </a>
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
