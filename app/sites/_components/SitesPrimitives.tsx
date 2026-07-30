import type { ReactNode } from "react"
import Image from "next/image"
import localFont from "next/font/local"
import { ArrowRight, Check, Clock3, Edit3, Eye, Phone, ShieldCheck, Star, Zap } from "lucide-react"
import { MockupButton } from "./SitesMockupModal"
import { SitesHeaderClient } from "./SitesHeaderClient"

export const sitesMarker = localFont({
  src: "../../../public/fonts/cc-ask-for-mercy.ttf",
  variable: "--font-sites-marker",
  display: "swap",
})

export const sitesHighlight = localFont({
  src: "../../../public/fonts/Sans-Andreas-Bold-Demo.ttf",
  variable: "--font-sites-highlight",
  display: "swap",
})

export const sitesFaveScript = localFont({
  src: "../../../public/fonts/Fave-ScriptPro.ttf",
  variable: "--font-sites-fave-script",
  display: "swap",
})

export const sitesBakeshop = localFont({
  src: "../../../public/fonts/Bakeshop-Regular.ttf",
  variable: "--font-sites-bakeshop",
  display: "swap",
})

export const accent = "#dfff00"

export function SitesPage({ children }: { children: ReactNode }) {
  return <main className={`${sitesMarker.variable} ${sitesHighlight.variable} ${sitesFaveScript.variable} ${sitesBakeshop.variable} sorted-sites-shell min-h-screen bg-[#fbfbfa] pt-[76px] text-[#070707]`}>{children}</main>
}

export function SitesHeader({ active }: { active?: "how" | "examples" | "pricing" | "about" | "updates" }) {
  return <SitesHeaderClient active={active} />
}

export function SitesFooter() {
  return (
    <footer className="bg-[#070707] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto grid max-w-[1220px] gap-8 md:grid-cols-[1.35fr_0.8fr_0.8fr_1fr]">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-[220px] text-[13px] font-semibold leading-[1.4] text-white/80">
            Websites that build trust, explain your services and turn visitors into enquiries.
          </p>
          <p className="mt-7 text-[11px] font-medium text-white/50">© 2026 Sorted.</p>
          <p className="mt-2 text-[10px] font-medium leading-[1.5] text-white/40">
            Sorted is a trading name of ADX Engine Ltd · Registered in England &amp; Wales · Company number 17327041
          </p>
        </div>
        <FooterLinks title="Product" links={[["How it works", "/howitworks"], ["Examples", "/examples"], ["Pricing", "/pricing"], ["Updates", "/website-updates"]]} />
        <FooterLinks title="Company" links={[["About us", "/about"], ["Our process", "/"], ["Reviews", "/examples"], ["Partner program", "/affiliates"], ["Contact", "mailto:hello@sortmydigital.site"]]} />
        <div>
          <p className="mb-4 text-[12px] font-black">Let's talk</p>
          <a href="https://wa.me/447386468085" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#dfff00] px-5 text-[12px] font-black text-black">
            <Phone className="size-4" strokeWidth={2.6} />
            WhatsApp us
          </a>
          <p className="mt-4 text-[12px] font-semibold text-white/80">hello@sortmydigital.site</p>
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-[1220px] justify-end gap-7 text-[10px] font-semibold text-white/55">
        <span>Privacy</span>
        <span>Terms</span>
      </div>
    </footer>
  )
}

function FooterLinks({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-4 text-[12px] font-black">{title}</p>
      <ul className="space-y-1 text-[12px] font-semibold text-white/82 sm:space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="inline-flex min-h-10 items-center transition-colors hover:text-[#dfff00] sm:min-h-0">{label}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`inline-flex min-h-11 items-center text-[33px] font-black leading-none tracking-[-0.045em] sm:text-[40px] ${dark ? "text-white" : "text-[#070707]"}`}>
      Sorted<span className="text-[#cfe900]">.</span><span className="[font-family:var(--font-sites-bakeshop)] text-[#cfe900]">sites</span>
    </span>
  )
}

export function SitesTitle({ kicker, title, marker, className = "" }: { kicker?: string; title: ReactNode; marker?: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {kicker ? <p className="mb-5 text-[12px] font-black text-black/45">{kicker}</p> : null}
      <h1 className="text-[clamp(3.4rem,6.4vw,6.8rem)] font-black leading-[0.92] tracking-[-0.045em]">{title}</h1>
      {marker ? <div className="mt-1 [font-family:var(--font-sites-highlight)] text-[clamp(3.2rem,6vw,6.4rem)] font-normal leading-[0.88] tracking-[-0.02em] text-[#d4ea00]">{marker}</div> : null}
    </div>
  )
}

export function Underline({ pink = false, className = "" }: { pink?: boolean; className?: string }) {
  return <span className={`block h-[5px] rounded-full ${pink ? "bg-[#ff73d2]" : "bg-[#dfff00]"} ${className}`} />
}

export function FeatureBar() {
  const items = [
    [Clock3, "Fast", "Get your mockup in 24 hours"],
    [Zap, "Affordable", "Websites from £495"],
    [ShieldCheck, "No risk", "Free mockup. No obligation."],
    [Check, "All included", "Design, build, hosting & CMS"],
    [Edit3, "Easy to update", "Update text and images yourself"],
  ] as const

  return (
    <section className="mx-auto max-w-[1220px] px-5 py-7 sm:px-8">
      <div className="grid gap-5 rounded-[18px] bg-[#f7f1e8] px-6 py-6 md:grid-cols-5">
        {items.map(([Icon, title, copy]) => (
          <div key={title} className="grid grid-cols-[48px_1fr] gap-4 border-black/10 md:border-l md:pl-5 first:md:border-l-0 first:md:pl-0">
            <span className="grid size-12 place-items-center rounded-full border-2 border-black bg-[#e7ff1e]">
              <Icon className="size-6" strokeWidth={2.4} />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase">{title}</p>
              <p className="mt-2 text-[13px] font-bold leading-[1.35]">{copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export type SiteExample = {
  slug: string
  category: string
  title: string
  description: string
  image: string
  headline: string
  tone: "dark" | "light"
  result: string
}

export const examples: SiteExample[] = [
  {
    slug: "the-yard",
    category: "Health & fitness",
    title: "The Yard Training Club",
    description: "Private personal training studio in Manchester.",
    image: "/examples/graciebarra-halesowen.jpg",
    headline: "YOUR SPACE. YOUR STRENGTH. YOUR RESULTS.",
    tone: "dark",
    result: "3x more enquiries",
  },
  {
    slug: "clearflow",
    category: "Home services",
    title: "ClearFlow Bathrooms",
    description: "Bathroom specialists creating beautiful spaces.",
    image: "/examples/clario.jpg",
    headline: "Bathroom perfection. Built around you.",
    tone: "light",
    result: "18 hour mockup",
  },
  {
    slug: "la-pate",
    category: "Retail",
    title: "La Pâte Patisserie",
    description: "Artisan bakery delivering across London.",
    image: "/examples/adxengine-ad.jpg",
    headline: "Freshly baked. Delivered with love.",
    tone: "dark",
    result: "22 hour mockup",
  },
  {
    slug: "palace-barn",
    category: "Hospitality",
    title: "Palace Barn Cottages",
    description: "Luxury holiday cottages in the Cotswolds.",
    image: "/examples/palacebarns.jpg",
    headline: "Your countryside escape awaits.",
    tone: "dark",
    result: "21 hour mockup",
  },
  {
    slug: "nourish",
    category: "Health & wellness",
    title: "Nourish Wellness",
    description: "Private clinic focused on outcomes that matter.",
    image: "/examples/clinic-flow.jpg",
    headline: "Advanced care. Real results. Personal to you.",
    tone: "light",
    result: "19 hour mockup",
  },
  {
    slug: "voltedge",
    category: "Home services",
    title: "VoltEdge Electrical",
    description: "Trusted electricians for homes and businesses.",
    image: "/examples/msu-healthcare.jpg",
    headline: "Reliable. Local. Professional.",
    tone: "dark",
    result: "24 hour mockup",
  },
]

export function SitePreviewCard({ example = examples[0], large = false }: { example?: SiteExample; large?: boolean }) {
  const href = example.slug === "the-yard" ? "/examples/the-yard" : "/examples/the-yard"

  return (
    <article className={`overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_14px_40px_rgba(0,0,0,0.045)] ${large ? "max-w-[720px]" : ""}`}>
      <a href={href} className={`group relative block ${large ? "aspect-[16/9]" : "aspect-[5/4]"} overflow-hidden bg-[#080808]`}>
        <Image src={example.image} alt={`${example.title} website mockup`} fill sizes={large ? "720px" : "360px"} className="object-cover transition-transform duration-500 group-hover:scale-[1.055]" />
        <div className={`absolute inset-0 ${example.tone === "dark" ? "bg-black/18" : "bg-white/18"}`} />
      </a>
      {!large ? (
        <div className="p-5">
          <p className="text-[9px] font-black uppercase text-black/45">{example.category}</p>
          <h3 className="mt-3 text-[18px] font-black tracking-[-0.045em]">{example.title}</h3>
          <p className="mt-2 text-[13px] font-semibold leading-[1.4] text-black/65">{example.description}</p>
          <a href={href} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-black/5 px-4 text-[12px] font-black sm:min-h-0 sm:bg-transparent sm:px-0">
            View example <ArrowRight className="size-4" strokeWidth={2.6} />
          </a>
        </div>
      ) : null}
    </article>
  )
}

export function DarkCta({ title = "Ready for your new website?", copy = "Get your free mockup in 24 hours. No obligation. No credit card." }: { title?: string; copy?: string }) {
  return (
    <section className="bg-[#070707] px-5 pt-10 text-black sm:px-8">
      <div className="mx-auto grid max-w-[1220px] gap-5 rounded-[12px] bg-white px-5 py-5 shadow-[0_18px_44px_rgba(0,0,0,0.22)] sm:px-6 lg:grid-cols-[0.3fr_0.3fr_0.12fr_0.28fr] lg:items-center">
        <div className="grid grid-cols-[48px_1fr] items-center gap-4 sm:grid-cols-[56px_1fr]">
          <span className="grid size-12 place-items-center rounded-full bg-[#e7ff1e] sm:size-14">
            <Edit3 className="size-7 sm:size-8" strokeWidth={2.2} />
          </span>
          <h2 className="text-[22px] font-black leading-[1.05] tracking-[-0.035em] sm:text-[24px]">{title}</h2>
        </div>
        <p className="text-[14px] font-semibold leading-[1.45]">{copy}</p>
        <ArrowRight className="hidden size-16 rotate-[-8deg] lg:block" strokeWidth={1.7} />
        <MockupButton variant="primary" className="justify-self-start whitespace-nowrap lg:justify-self-end" />
      </div>
    </section>
  )
}
