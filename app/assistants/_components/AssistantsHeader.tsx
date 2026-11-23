"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Phone, X } from "lucide-react"

const links = [
  ["AI assistants", "/"],
  ["Pricing", "/assistants/pricing"],
  ["About", "/assistants/about"],
  ["What else we do", "/services"],
] as const

export function AssistantsHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="mx-auto max-w-[1280px] px-6 py-6 sm:px-10">
      <div className="flex items-center justify-between gap-5">
        <Link href="/" aria-label="Sorted home" className="text-[40px] font-black leading-none tracking-[-0.045em]">Sorted<span className="text-[#cfe900]">.</span></Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 text-[14px] font-semibold sm:flex">
          <Link href="/" className="underline-offset-8 hover:underline focus-visible:underline">AI assistants</Link>
          <Link href="/assistants/pricing" className="underline-offset-8 hover:underline focus-visible:underline">Pricing</Link>
          <Link href="/assistants/about" className="underline-offset-8 hover:underline focus-visible:underline">About</Link>
          <Link href="/services" className="-rotate-1 rounded-sm bg-[#e4ff29] px-2 py-0.5 font-black underline-offset-8 transition-colors hover:bg-black hover:text-[#e4ff29]">What else we do</Link>
          <a href="https://wa.me/447386468085" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#00271f] px-4 text-[13px] transition-colors hover:bg-[#00271f] hover:text-white"><Phone size={15} />Let&apos;s talk</a>
        </nav>
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-[#070707] text-white shadow-[0_10px_28px_rgba(0,0,0,0.16)] sm:hidden"
        >
          {menuOpen ? <X className="size-5" strokeWidth={2.8} /> : <Menu className="size-5" strokeWidth={2.8} />}
        </button>
      </div>
      <div className={`mt-3 rounded-[16px] border border-black/10 bg-white/96 p-3 text-[#070707] shadow-[0_18px_44px_rgba(0,0,0,0.12)] sm:hidden ${menuOpen ? "" : "hidden"}`}>
        <nav aria-label="Mobile navigation" className="grid gap-1 text-[15px] font-black tracking-[-0.03em]">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex min-h-12 items-center rounded-xl px-4 text-black/72 transition-colors hover:bg-black/[0.05] hover:text-black"
            >
              {label}
            </Link>
          ))}
          <a href="https://wa.me/447386468085" className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-black/12 text-[12px] font-black">
            <Phone size={14} /> Let&apos;s talk
          </a>
        </nav>
      </div>
    </header>
  )
}
