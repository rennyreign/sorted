"use client"

import Link from "next/link"
import { useState } from "react"

const links = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Services", href: "/#services" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Updates", href: "/sorted-updates" },
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
          className="pointer-events-auto font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight leading-none"
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
          <a href="https://wa.me/447386468085" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="text-[#25D366] hover:opacity-80 transition-opacity duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
          <a href="/#get-started" className="text-xs font-semibold text-[#FAFAFA] bg-[#0A0A0A] rounded-full px-4 py-2 hover:bg-[#2a2a2a] transition-colors duration-200">
            Get sorted
          </a>
        </nav>

        {/* Mobile controls */}
        <div className="pointer-events-auto flex md:hidden items-center gap-2.5">
          <a href="/#get-started" onClick={() => setOpen(false)} className="text-xs font-semibold text-[#FAFAFA] bg-[#0A0A0A] rounded-full px-4 py-2">
            Get sorted
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
            href="https://wa.me/447386468085"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-8 flex items-center justify-center gap-2.5 w-full font-semibold text-sm text-[#25D366] bg-transparent border border-[#25D366]/30 rounded-full py-4 hover:bg-[#25D366]/5 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp us
          </a>
          <a
            href="/#get-started"
            onClick={() => setOpen(false)}
            className="mt-3 block w-full text-center font-semibold text-sm text-white bg-[#0A0A0A] rounded-full py-4 hover:bg-[#2a2a2a] transition-colors duration-200"
          >
            Get sorted
          </a>
        </div>
      )}
    </>
  )
}
