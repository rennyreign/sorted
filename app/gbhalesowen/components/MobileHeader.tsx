"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "Home", href: "/gbhalesowen" },
  { label: "Programs", href: "/gbhalesowen/programs" },
  { label: "Timetable", href: "/gbhalesowen/timetable" },
  { label: "About", href: "/gbhalesowen/about" },
  { label: "Gallery", href: "/gbhalesowen/gallery" },
  { label: "Contact", href: "/gbhalesowen#contact" },
]

function GBLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/gbhalesowen/gbhalesowen-logo.png"
        alt="Gracie Barra Halesowen"
        className="size-14 shrink-0 rounded-full border-[3px] border-[#D9DDE7] bg-white object-cover shadow-[0_12px_30px_rgba(0,47,134,0.16)]"
      />
      {!compact && (
        <div className="leading-none">
          <p className="text-[1.05rem] font-extrabold uppercase tracking-tight text-[#C8102E]">
            Gracie Barra
          </p>
          <p className="text-[0.95rem] font-extrabold uppercase tracking-[0.04em] text-[#111827]">
            Halesowen
          </p>
        </div>
      )}
    </div>
  )
}

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed left-0 right-0 top-[42px] z-40 border-b border-black/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
        <Link href="/gbhalesowen" aria-label="Gracie Barra Halesowen home">
          <GBLogo />
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-[#002F86] lg:flex">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              href={link.href} 
              className="border-b-2 border-transparent py-2 transition-colors hover:border-[#C8102E] hover:text-[#C8102E]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/gbhalesowen#contact"
            className="hidden sm:inline-flex items-center justify-center bg-[#C8102E] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#A90E27] active:translate-y-0"
          >
            Join now
          </a>
          
          {/* Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden grid size-10 place-items-center rounded-lg bg-[#002F86] text-white"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-black/10 bg-white">
          <nav className="flex flex-col px-5 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="border-b border-black/10 py-4 text-sm font-extrabold uppercase tracking-[0.06em] text-[#002F86] transition-colors hover:text-[#C8102E]"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="/gbhalesowen#contact"
              onClick={() => setIsOpen(false)}
              className="mt-4 inline-flex items-center justify-center bg-[#C8102E] px-5 py-4 text-sm font-extrabold uppercase tracking-[0.08em] text-white"
            >
              Join now
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
