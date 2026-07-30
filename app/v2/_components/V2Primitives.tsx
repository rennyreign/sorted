import type { ReactNode } from "react"
import Link from "next/link"
import localFont from "next/font/local"
import { ArrowRight, CalendarDays, Check, Clock3, MessageCircle, Phone, Star, CheckCircle2 } from "lucide-react"
import { RoutineFinderButton } from "./RoutineFinder"

export const v2Marker = localFont({
  src: "../../../public/fonts/cc-ask-for-mercy.ttf",
  variable: "--font-v2-marker",
  display: "swap",
})

export const v2Highlight = localFont({
  src: "../../../public/fonts/Sans-Andreas-Bold-Demo.ttf",
  variable: "--font-v2-highlight",
  display: "swap",
})

export const accent = "#dfff00"

export function V2Page({ children }: { children: ReactNode }) {
  return <main className={`${v2Marker.variable} ${v2Highlight.variable} min-h-screen overflow-hidden bg-[#fbfbfa] text-[#070707]`}>{children}</main>
}

export function V2Header({ active }: { active?: "how" | "problems" | "results" | "about" | "pricing" }) {
  const links = [
    { key: "how", label: "How it works", href: "/ops/how-it-works" },
    { key: "problems", label: "Problems we solve", href: "/ops/problems-we-solve" },
    { key: "results", label: "Results", href: "/ops/results" },
    { key: "about", label: "About", href: "/ops/about" },
    { key: "pricing", label: "Pricing", href: "/ops/pricing" },
  ] as const

  return (
    <header className="mx-auto flex w-full max-w-[1220px] items-center justify-between px-5 pb-6 pt-6 sm:px-8">
      <Link href="/ops" className="inline-flex min-h-11 items-center text-[27px] font-extrabold leading-none tracking-[-0.06em]">
        Sorted<span className="text-[#cfe900]">.</span>
      </Link>
      <nav className="hidden items-center gap-8 text-[12px] font-extrabold tracking-[-0.02em] md:flex">
        {links.map((link) => (
          <Link key={link.key} href={link.href} className="relative inline-flex min-h-11 items-center py-2">
            {link.label}
            {active === link.key ? <span className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full bg-[#dfff00]" /> : null}
          </Link>
        ))}
      </nav>
      <div className="relative">
        <RoutineFinderButton label="Start the diagnostic" variant="nav" />
        <span className="absolute -right-5 -top-3 hidden h-8 w-8 rotate-12 text-[#dfff00] sm:block">
          <DoodleBurst />
        </span>
      </div>
    </header>
  )
}

export function V2Footer() {
  return (
    <footer className="bg-[#070707] px-5 py-7 text-white sm:px-8">
      <div className="mx-auto grid max-w-[1220px] gap-7 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="text-[27px] font-extrabold leading-none tracking-[-0.06em]">
            Sorted<span className="text-[#cfe900]">.</span>
          </p>
          <p className="mt-2 max-w-[180px] text-[12px] font-semibold leading-[1.35] text-white/80">
            We install systems that remove repetitive work.
          </p>
          <p className="mt-5 text-[10px] font-medium text-white/55">© 2026 Sorted. All rights reserved.</p>
        </div>
        <FooterLinks links={[["How it works", "/ops/how-it-works"], ["Problems we solve", "/ops/problems-we-solve"], ["Pricing", "/ops/pricing"]]} />
        <FooterLinks links={[["About", "/ops/about"], ["Results", "/ops/results"], ["Example dashboard", "/ops/results-dashboard"]]} />
        <div>
          <p className="mb-4 text-[12px] font-black">Ready to start?</p>
          <RoutineFinderButton label="Start the diagnostic" variant="nav" className="mb-3 h-11 border border-[#dfff00] bg-[#dfff00] !text-[#070707] shadow-none" />
          <a href="https://wa.me/447386468085" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 px-5 text-[12px] font-black text-white">
            <Phone className="size-4" strokeWidth={2.6} />
            WhatsApp us
          </a>
        </div>
      </div>
      <div className="mx-auto mt-6 flex max-w-[1220px] justify-end gap-5 text-[10px] font-semibold text-white/65">
        <span>Privacy</span>
        <span>Terms</span>
        <span>Cookies</span>
      </div>
    </footer>
  )
}

function FooterLinks({ links }: { links: [string, string][] }) {
  return (
    <ul className="space-y-3 text-[11px] font-bold text-white/85">
      {links.map(([label, href]) => (
        <li key={label}>
          <Link href={href} className="inline-flex min-h-11 min-w-11 items-center transition-colors hover:text-[#dfff00]">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function SectionTitle({ eyebrow, title, center = false, dark = false }: { eyebrow?: string; title: string; center?: boolean; dark?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      {eyebrow ? <p className={`mb-2 text-[12px] font-black ${dark ? "text-white/55" : "text-black/50"}`}>{eyebrow}</p> : null}
      <div className="relative inline-block">
        <h2 className={`[font-family:var(--font-v2-marker)] text-[clamp(2rem,3vw,2.85rem)] font-normal uppercase leading-[1.05] ${dark ? "text-white" : ""}`}>{title}</h2>
        <span className="absolute -bottom-2 left-0 h-[7px] w-[78%] rounded-full bg-[#dfff00]" />
      </div>
    </div>
  )
}

export function MarkerText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`[font-family:var(--font-v2-highlight)] font-normal leading-[0.9] tracking-[-0.02em] text-[#cfe900] ${className}`}>{children}</span>
}

export function CtaBand({ title, copy, button = "Start the diagnostic" }: { title: string; copy: string; button?: string }) {
  return (
    <section className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6">
      <div className="relative grid gap-6 overflow-hidden rounded-[17px] bg-[#e7ff1e] px-8 py-7 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div>
          <p className="[font-family:var(--font-v2-marker)] text-[clamp(2.4rem,4vw,4.1rem)] uppercase leading-[1.03]">{title}</p>
          <div className="mt-3 h-[3px] w-72 max-w-full rounded-full bg-[#ff73d2]" />
        </div>
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <p className="max-w-[360px] text-[14px] font-black leading-[1.45] tracking-[-0.03em]">{copy}</p>
          <div className="flex flex-wrap items-center gap-3">
            <RoutineFinderButton label={button} variant="band" />
            <BookDiscoveryButton />
          </div>
        </div>
        <Star className="absolute right-7 top-6 size-14 rotate-12 text-[#ff73d2]" strokeWidth={2.6} />
      </div>
    </section>
  )
}

export function BookDiscoveryButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://cal.com/sortmydigital/discovery"
      className={`inline-flex h-12 items-center justify-center gap-3 rounded-full border border-black/15 bg-white/75 px-6 text-[11px] font-black text-black shadow-[0_10px_24px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-0.5 ${className}`}
    >
      <CalendarDays className="size-4" strokeWidth={2.6} />
      Book a discovery call
    </a>
  )
}

export function MetricBand({ title = "WHAT YOU GET BACK." }: { title?: string }) {
  const metrics = [
    { icon: Clock3, value: "24.6", label: "Hours returned this month", delta: "+28%" },
    { icon: MessageCircle, value: "63", label: "Enquiries recovered this month", delta: "+31%" },
    { icon: CheckCircle2, value: "18", label: "Repetitive tasks removed", delta: "+20%" },
    { icon: Star, value: "214", label: "Reviews generated this month", delta: "+42%" },
  ]

  return (
    <section className="mx-auto max-w-[1240px] px-4 py-2 sm:px-6 md:py-3 lg:py-5">
      <div className="grid overflow-hidden rounded-[18px] bg-[#070707] text-white shadow-[0_18px_55px_rgba(0,0,0,0.18)] md:grid-cols-[1.15fr_4fr]">
        <div className="px-7 py-6 sm:px-9 lg:px-12 lg:py-10">
          <SectionTitle title={title} dark />
          <p className="mt-5 max-w-[170px] text-[12px] font-semibold leading-[1.35] text-white lg:mt-8 lg:max-w-[190px] lg:text-[15px]">Real capacity. Measurable results. From one installed system at a time.</p>
          <Link href="/ops/results-dashboard" className="mt-5 inline-flex min-h-11 items-center gap-4 rounded-xl bg-[#dfff00] px-4 text-[9px] font-black text-black transition-transform hover:-translate-y-0.5 lg:mt-8 lg:h-12 lg:gap-5 lg:px-6 lg:text-[12px]">
            See an example dashboard <ArrowRight className="size-4" strokeWidth={3} />
          </Link>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-white/25 border-t border-white/25 md:grid-cols-4 md:border-l md:border-t-0">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.label} className="px-4 py-6 text-center lg:px-8 lg:py-10">
                <Icon className="mx-auto size-7 text-white lg:size-11" strokeWidth={2.1} />
                <p className="mt-4 text-[34px] font-black leading-none tracking-[-0.07em] text-[#dfff00] lg:mt-7 lg:text-[55px]">{metric.value}</p>
                <p className="mx-auto mt-2.5 max-w-[92px] text-[7px] font-black uppercase leading-[1.25] lg:mt-4 lg:max-w-[120px] lg:text-[10px]">{metric.label}</p>
                <p className="mt-2 text-[16px] font-black leading-none text-[#dfff00] lg:mt-3 lg:text-[21px]">{metric.delta}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function DoodleBurst() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full" aria-hidden>
      <path d="M22 4L21 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 9L29 17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 23L34 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 39L29 31" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M7 16L15 21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function SketchArrow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 72" fill="none" aria-hidden>
      <path d="M8 40C30 39 54 36 79 30C90 27 101 25 112 27" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M97 14C106 18 113 24 120 33" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M98 52C106 45 113 39 121 33" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-[13px] font-bold leading-[1.35]">
          <Check className="mt-0.5 size-4 shrink-0 text-[#b9d600]" strokeWidth={4} />
          {item}
        </li>
      ))}
    </ul>
  )
}
