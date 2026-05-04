import Nav from "@/components/Nav"
import ExamplesGrid from "@/components/ExamplesGrid"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Examples. Sorted.",
  description: "Recent work from Sorted. Websites, landing pages, ads, logos, and more.",
}

export default function ExamplesPage() {
  return (
    <>
      <Nav />
      <main className="pt-32 pb-24 px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">

        <div className="mb-14">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4">
            Recent work
          </span>
          <h1 className="font-sans font-extrabold text-[#0A0A0A] text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-tight mb-5 max-w-2xl">
            What we&apos;ve been building.
          </h1>
          <p className="text-[#737373] text-lg font-medium max-w-lg">
            A selection of recent jobs: websites, ads, brand work, and quick fixes for UK businesses.
          </p>
        </div>

        <ExamplesGrid />

        <div className="mt-20 pt-16 border-t border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight mb-1">
              Need something similar?
            </p>
            <p className="text-[#737373] text-sm">
              Tell us what you need. We&apos;ll price it the same day.
            </p>
          </div>
          <a
            href="/#get-started"
            className="group inline-flex items-center gap-3 bg-[#0A0A0A] text-white font-semibold text-sm rounded-full px-6 py-3.5 hover:bg-[#2a2a2a] transition-all duration-300 shrink-0"
          >
            Get started
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </a>
        </div>

      </main>
    </>
  )
}
