import Link from "next/link"
import { Phone } from "lucide-react"
import { FOOTER_GROUPS } from "@/lib/public-navigation"

type Experience = "website" | "automation" | "company"
const descriptions: Record<Experience, string> = {
  website: "Websites that do your business justice. Designed, built and launched for local businesses.",
  automation: "AI automation for enquiries, quotes and payment follow-ups. Less work slipping through the gaps.",
  company: "A better website. More useful enquiries. Less work slipping through the gaps.",
}

export function SiteMapFooter({ tone = "dark", experience = "company" }: { tone?: "light" | "dark"; experience?: Experience }) {
  const light = tone === "light"
  const home = experience === "website" ? "/websites" : experience === "automation" ? "/automation" : "/"
  return (
    <footer className={`${light ? "bg-[#fafafa] text-[#111]" : experience === "website" ? "bg-[#070707] text-white" : "bg-[#00271f] text-white"} px-6 py-12 sm:px-10`}>
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.2fr]">
        <div className="col-span-2 lg:col-span-1">
          <Link href={home} aria-label="Sorted home" className="text-[36px] font-black leading-none tracking-[-0.045em]">Sorted<span className="text-[#cfe900]">.</span></Link>
          <p className="mt-5 max-w-[250px] text-[14px] leading-relaxed opacity-65">{descriptions[experience]}</p>
        </div>
        {FOOTER_GROUPS.map(group => (
          <nav key={group.title} aria-label={`${group.title} footer`}>
            <h2 className="mb-4 text-[13px] font-bold">{group.title}</h2>
            <ul className="space-y-1">{group.links.map(([label, href]) => <li key={href}><Link href={href} className="inline-block py-1.5 text-[13px] leading-relaxed opacity-70 underline-offset-4 transition-opacity hover:underline hover:opacity-100 focus-visible:opacity-100">{label}</Link></li>)}</ul>
          </nav>
        ))}
        <div className="col-span-2 lg:col-span-1">
          <h2 className="mb-4 text-[13px] font-bold">Let’s talk</h2>
          <a href="https://wa.me/447386468085" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#e4ff29] px-4 text-[13px] font-bold text-[#111] transition-colors hover:bg-[#d7ef20]"><Phone size={15} />WhatsApp us</a>
          <a href="mailto:hello@sortmydigital.site" className="mt-4 block text-[13px] underline-offset-4 hover:underline">hello@sortmydigital.site</a>
        </div>
      </div>
      <div className={`mx-auto mt-10 flex max-w-[1280px] flex-wrap justify-between gap-5 border-t pt-6 text-[11px] leading-relaxed ${light ? "border-black/10" : "border-white/15"}`}>
        <p className="opacity-55">© 2026 Sorted. A trading name of ADX Engine Ltd.<br />Registered in England &amp; Wales · Company number 17327041</p>
        <span className="flex gap-6"><Link href="/privacy" className="opacity-65 hover:underline">Privacy</Link><Link href="/terms" className="opacity-65 hover:underline">Terms</Link></span>
      </div>
    </footer>
  )
}
