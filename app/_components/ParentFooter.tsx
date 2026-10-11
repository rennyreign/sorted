import { ArrowRight } from "lucide-react"
import { parentMarker } from "./ParentFonts"

export function ParentFooter() {
  return (
    <footer className={`bg-[#08251F] px-5 py-10 text-white sm:px-8 lg:py-12 ${parentMarker.variable}`}>
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-9 md:grid-cols-4 lg:gap-12">
          <div>
            <span className="inline-block text-[32px] font-black leading-none tracking-[-0.045em]">
              Sorted<span className="text-[#D8FF18]">.</span>
            </span>
            <p className="mt-5 max-w-[240px] text-[15px] font-medium leading-[1.5] text-white/70">
              We sort the digital side of local businesses.
            </p>
            <p className="mt-8 [font-family:var(--font-parent-marker)] text-[18px] leading-none text-[#D8FF18]">
              LOCAL BUSINESSES. BRIGHTER FUTURES.
            </p>
          </div>

          <FooterColumn
            title="Services"
            links={[
              ["Sorted Sites", "/sites"],
              ["Sorted Ads", "/ads"],
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              ["About", "/about"],
              ["Our work", "/examples"],
              ["Contact", "/contact"],
            ]}
          />
          <div>
            <p className="mb-5 text-[13px] font-bold uppercase tracking-[0.14em] text-white/50">Let&rsquo;s talk</p>
            <a
              href="/contact"
              className="inline-flex h-[52px] items-center gap-2 rounded-full bg-[#D8FF18] px-7 text-[15px] font-bold text-[#081614] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(216,255,24,0.25)]"
            >
              Book a call
              <ArrowRight className="size-4" strokeWidth={2.6} />
            </a>
            <p className="mt-6 text-[14px] font-medium text-white/70">hello@sortmydigital.site</p>
            <div className="mt-5 flex gap-3 text-[13px] font-bold text-white/60">
              <span className="rounded-full border border-white/15 px-4 py-2">LinkedIn</span>
              <span className="rounded-full border border-white/15 px-4 py-2">Instagram</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-[12px] font-medium text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Sorted. All rights reserved.</p>
          <div className="flex gap-7">
            <a href="/privacy" className="transition-colors hover:text-white">Privacy</a>
            <a href="/terms" className="transition-colors hover:text-white">Terms</a>
            <span>Cookies</span>
          </div>
          <p className="text-[12px] text-white/35">
            Sorted is a trading name of ADX Engine Ltd · Company number 17327041
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-5 text-[13px] font-bold uppercase tracking-[0.14em] text-white/50">{title}</p>
      <ul className="space-y-3 text-[15px] font-medium text-white/80">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="transition-colors hover:text-[#D8FF18]">{label}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
