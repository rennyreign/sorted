"use client"

import Link from "next/link"
import { useState } from "react"

const links = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Services", href: "/#services" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Examples", href: "/examples" },
  { label: "About", href: "/about" },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 inset-x-0 z-50 px-6 sm:px-10 lg:px-16 pt-5 flex items-center justify-between bg-white/80 backdrop-blur-md pointer-events-none">
        <Link
          href="/"
          onClick={scrollToTop}
          className="pointer-events-auto font-sans font-extrabold text-[#0A0A0A] text-xl tracking-tight leading-none"
        >
          Sorted.
        </Link>

        {/* Desktop pill */}
        <nav className="pointer-events-auto hidden md:flex items-center gap-5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.08] shadow-[0_2px_20px_rgba(0,0,0,0.06)] px-5 py-2.5">
          <div className="flex items-center gap-5 text-xs font-medium text-[#525252]">
            {links.map(({ label, href }) =>
              href === "/" ? (
                <Link key={label} href="/" onClick={scrollToTop} className="hover:text-[#0A0A0A] transition-colors duration-200">{label}</Link>
              ) : href.startsWith("/") && !href.includes("#") ? (
                <Link key={label} href={href} className="hover:text-[#0A0A0A] transition-colors duration-200">{label}</Link>
              ) : (
                <a key={label} href={href} className="hover:text-[#0A0A0A] transition-colors duration-200">{label}</a>
              )
            )}
          </div>
          <a href="/#get-started" className="text-xs font-semibold text-[#FAFAFA] bg-[#0A0A0A] rounded-full px-4 py-2 hover:bg-[#2a2a2a] transition-colors duration-200">
            Get started
          </a>
        </nav>

        {/* Mobile controls */}
        <div className="pointer-events-auto flex md:hidden items-center gap-2.5">
          <a href="/#get-started" onClick={() => setOpen(false)} className="text-xs font-semibold text-[#FAFAFA] bg-[#0A0A0A] rounded-full px-4 py-2">
            Get started
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-black/[0.08] shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
          >
            {open ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
                <path d="M0 1H14M0 4.5H14M0 8H14" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {open && (
        <div className="fixed inset-0 z-40 bg-[#FAFAFA] flex flex-col px-6 pt-24 pb-10 md:hidden">
          <nav className="flex flex-col flex-1">
            {links.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={href === "/" ? scrollToTop : () => setOpen(false)}
                className="font-sans font-extrabold text-[#0A0A0A] text-[2.25rem] leading-none tracking-tight py-4 border-b border-black/[0.06] hover:text-[#525252] transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </nav>
          <a
            href="/#get-started"
            onClick={() => setOpen(false)}
            className="mt-8 block w-full text-center font-semibold text-sm text-white bg-[#0A0A0A] rounded-full py-4 hover:bg-[#2a2a2a] transition-colors duration-200"
          >
            Get started
          </a>
        </div>
      )}
    </>
  )
}
