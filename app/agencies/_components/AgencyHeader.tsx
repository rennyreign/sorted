"use client"

import { useState } from "react"

const links = [
  { label: "Home", href: "#top" },
  { label: "The Sprint", href: "#sprint" },
  { label: "The Letter", href: "#letter" },
  { label: "Book", href: "#book" },
]

export function AgencyHeader() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 inset-x-0 z-50 bg-[#FAFAF7]/85 backdrop-blur-md border-b border-[#E6E6E2]">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 sm:px-8 lg:px-[60px]">
          <a
            href="#top"
            className="font-sans text-2xl font-extrabold leading-none tracking-tight text-[#0C0C0C]"
            aria-label="Sorted — back to top"
          >
            Sorted.
          </a>

          <nav aria-label="Page sections" className="hidden items-center gap-7 md:flex">
            {links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[13px] font-medium text-[#6E6E6A] transition-colors duration-200 hover:text-[#0C0C0C]"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <a
              href="#book"
              data-track="hero_booking_cta_clicked"
              data-cta-location="header"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0C0C0C] px-4 py-2 text-[13px] font-semibold text-[#FAFAF7] transition-colors duration-200 hover:bg-[#2a2a2a]"
            >
              Book a conversation
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E6E6E2] bg-white md:hidden"
            >
              {open ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M1 1L11 11M11 1L1 11" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="14" height="9" viewBox="0 0 14 9" fill="none" aria-hidden="true">
                  <path d="M0 1H14M0 4.5H14M0 8H14" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-[#FAFAF7] px-6 pb-10 pt-24 md:hidden">
          <nav className="flex flex-1 flex-col" aria-label="Page sections">
            {links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="border-b border-black/[0.06] py-4 font-sans text-[2rem] font-extrabold leading-none tracking-tight text-[#0C0C0C] transition-colors duration-200 hover:text-[#6E6E6A]"
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            href="#book"
            onClick={() => setOpen(false)}
            className="mt-8 block w-full rounded-full bg-[#0C0C0C] py-4 text-center text-sm font-semibold text-[#FAFAF7]"
          >
            Book a conversation
          </a>
        </div>
      )}
    </>
  )
}
