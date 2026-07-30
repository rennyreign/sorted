import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import localFont from "next/font/local"
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  Grid3X3,
  Layers3,
  MessageCircle,
  MonitorSmartphone,
  Palette,
  ShieldCheck,
  Star,
  Type,
  Workflow,
} from "lucide-react"
import { RoutineFinderButton } from "../_components/RoutineFinder"

const marker = localFont({
  src: "../../../public/fonts/cc-ask-for-mercy.ttf",
  variable: "--font-v2-marker",
  display: "swap",
})

const highlight = localFont({
  src: "../../../public/fonts/Sans-Andreas-Bold-Demo.ttf",
  variable: "--font-v2-highlight",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sorted Brand System",
  description: "The unified brand system for Sorted, SortedUpdates, dashboards, reports, proposals, and client delivery.",
}

const logoAssets = [
  {
    title: "Primary Wordmark",
    description: "Use on light backgrounds, headers, documents, proposal pages, and default website placements.",
    preview: "/brand/sorted-wordmark.svg",
    file: "/brand/sorted-wordmark.svg",
    dark: false,
  },
  {
    title: "Reversed Wordmark",
    description: "Use on black surfaces, dark footers, pitch decks, and report sidebars.",
    preview: "/brand/sorted-wordmark-reversed.svg",
    file: "/brand/sorted-wordmark-reversed.svg",
    dark: true,
  },
  {
    title: "Compact Mark",
    description: "Use for favicons, app icons, dashboard shortcuts, loading states, and small brand stamps.",
    preview: "/brand/sorted-mark.svg",
    file: "/brand/sorted-mark.svg",
    dark: true,
  },
  {
    title: "Compact Mark Light",
    description: "Use where the compact mark sits inside a light UI card or neutral admin surface.",
    preview: "/brand/sorted-mark-light.svg",
    file: "/brand/sorted-mark-light.svg",
    dark: false,
  },
]

const palette = [
  { name: "Ink", token: "--ink", hex: "#070707", usage: "Text, dark sections, primary buttons, dashboard sidebars" },
  { name: "Paper", token: "--paper", hex: "#fbfbfa", usage: "Main page background and calm content surfaces" },
  { name: "Acid", token: "--acid", hex: "#dfff00", usage: "Brand dot, CTAs, proof numbers, active states, underlines" },
  { name: "Card", token: "--card", hex: "#ffffff", usage: "Cards, fields, report panels, proposal containers" },
  { name: "Warm Board", token: "--warm-board", hex: "#f7efe3", usage: "Operational explainers and capacity panels" },
  { name: "Line", token: "--line", hex: "#e8e5dd", usage: "Borders, rules, quiet separators, inactive rails" },
  { name: "Rose Mark", token: "--rose-mark", hex: "#ff73d2", usage: "Small doodles and secondary emphasis only" },
  { name: "Proof Green", token: "--proof-green", hex: "#00a64b", usage: "Positive deltas, recovered value, completed status" },
]

const ecosystem = [
  {
    icon: Layers3,
    title: "Sorted.",
    copy: "The master brand. Use this name and logo across public marketing, diagnostics, proposals, reports, and client delivery.",
  },
  {
    icon: Workflow,
    title: "SortedUpdates",
    copy: "The client CMS and update layer. It sits under the Sorted brand, not as a separate visual identity.",
  },
  {
    icon: MonitorSmartphone,
    title: "Client Sites",
    copy: "Every client site may have its own local flavour, but the handoff, CMS, reset layer, and reporting stay visibly Sorted.",
  },
  {
    icon: FileText,
    title: "Reports",
    copy: "Results dashboards, example reports, and delivery pages use the same proof-first interface language.",
  },
]

const typeRows = [
  {
    name: "Display",
    sample: "Your business has gaps.",
    className: "text-[clamp(3.1rem,7vw,6.8rem)] font-black leading-[0.9] tracking-[-0.05em]",
    rule: "Use once per page. Short, direct, and useful.",
  },
  {
    name: "Highlight",
    sample: "We close them.",
    className: "[font-family:var(--font-v2-highlight)] text-[clamp(3rem,6vw,5.6rem)] font-normal leading-[0.86] tracking-[-0.02em] text-[#cfe900]",
    rule: "Use for one emotional emphasis line, never as paragraph text.",
  },
  {
    name: "Section",
    sample: "WHAT CHANGES.",
    className: "[font-family:var(--font-v2-marker)] text-[clamp(1.9rem,3.1vw,2.8rem)] font-normal leading-[1.08]",
    rule: "Use for short uppercase section titles with an acid underline.",
  },
  {
    name: "Body",
    sample: "We find the gaps that leak revenue, hurt trust, and leave money on the table, install the systems that close them, and show you exactly how much you get back.",
    className: "max-w-[58ch] text-[15px] font-semibold leading-[1.55] tracking-[-0.025em]",
    rule: "Plain English. Concrete business language. No jargon.",
  },
]

const components = [
  "Black pill CTA with acid hover or active support",
  "Acid marker underline for emphasis",
  "White cards with soft borders and restrained shadows",
  "Black proof bands for measured outcomes",
  "Warm operational panels for process explanation",
  "Round icon stamps, never decorative blobs",
  "Dashboard metrics with clear before and after states",
  "Client notes with real owner imagery and grounded copy",
]

const layouts = [
  ["Container", "Use a 1240px max-width with 20px mobile padding and 32px tablet or desktop padding."],
  ["Cards", "Use 14-18px radius. Borders first, shadows second. Do not place cards inside other cards."],
  ["Density", "Marketing pages can breathe. Dashboards should be dense but readable, with clear row rhythm."],
  ["Responsive", "Every grid collapses to one column on mobile. Key CTAs stay at least 44px tall."],
  ["Images", "Use real people, real work, dashboards, products, or generated bitmap scenes with a specific purpose."],
  ["Motion", "Use fast hover feedback, small lifts, and subtle reveal timing. Avoid theatrical motion."],
]

const voice = [
  ["Say", "time returned, missed calls, reviews recovered, revenue found, customers followed up"],
  ["Avoid", "seamless, transform, unlock potential, AI-powered platform, operational excellence"],
  ["Promise", "Make lost work visible, remove it, and show what changed."],
]

export default function SortedBrandPage() {
  return (
    <main className={`${marker.variable} ${highlight.variable} min-h-screen bg-[#fbfbfa] text-[#070707]`}>
      <BrandHeader />
      <Hero />
      <Ecosystem />
      <LogoSystem />
      <PaletteSystem />
      <TypographySystem />
      <ComponentSystem />
      <LayoutRules />
      <VoiceSystem />
      <DownloadStrip />
      <Footer />
    </main>
  )
}

function BrandHeader() {
  return (
    <header className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <Link href="/v2" className="inline-flex min-h-11 items-center text-[27px] font-extrabold leading-none tracking-[-0.06em]">
        Sorted<span className="text-[#cfe900]">.</span>
      </Link>
      <nav className="hidden items-center gap-7 text-[12px] font-extrabold tracking-[-0.02em] lg:flex">
        <a className="inline-flex min-h-11 items-center px-2" href="#logos">Logos</a>
        <a className="inline-flex min-h-11 items-center px-2" href="#colors">Colors</a>
        <a className="inline-flex min-h-11 items-center px-2" href="#type">Typography</a>
        <a className="inline-flex min-h-11 items-center px-2" href="#components">Components</a>
        <a className="inline-flex min-h-11 items-center px-2" href="#downloads">Downloads</a>
      </nav>
      <Link
        href="/v2"
        className="inline-flex h-11 shrink-0 items-center gap-3 rounded-full bg-[#070707] px-5 text-[11px] font-extrabold text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)]"
      >
        View Site
        <ArrowRight className="size-3.5" strokeWidth={3} />
      </Link>
    </header>
  )
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-[1240px] gap-8 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
      <div>
        <p className="text-[12px] font-black uppercase tracking-[0.04em] text-black/45">United Sorted ecosystem</p>
        <h1 className="mt-5 max-w-[800px] text-[clamp(4.1rem,9vw,8.4rem)] font-black leading-[0.88] tracking-[-0.06em]">
          One brand.
          <br />
          Every surface.
        </h1>
        <div className="relative mt-5 inline-block">
          <p className="[font-family:var(--font-v2-highlight)] text-[clamp(3rem,6.3vw,6rem)] leading-[0.88] tracking-[-0.02em] text-[#cfe900]">
            SORTED MEANS DONE.
          </p>
          <span className="absolute -bottom-3 left-0 h-4 w-full rounded-full bg-[#dfff00]" />
        </div>
      </div>
      <div className="rounded-[22px] bg-[#070707] p-7 text-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
        <p className="[font-family:var(--font-v2-marker)] text-[2rem] leading-[1.05]">THE BRAND IDEA.</p>
        <p className="mt-5 text-[28px] font-black leading-[1.02] tracking-[-0.06em]">
          Sorted makes hidden business drag visible, removable, and measurable.
        </p>
        <p className="mt-5 text-[14px] font-semibold leading-[1.55] text-white/75">
          The same identity now covers the public site, diagnostics, dashboards, proposals, client delivery pages, operator tools, and SortedUpdates.
        </p>
      </div>
    </section>
  )
}

function Ecosystem() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      <SectionTitle index="01" title="Brand Architecture" />
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {ecosystem.map((item) => {
          const Icon = item.icon
          return (
            <article key={item.title} className="rounded-[16px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.035)]">
              <span className="grid size-12 place-items-center rounded-full bg-[#dfff00]">
                <Icon className="size-5" strokeWidth={2.6} />
              </span>
              <h2 className="mt-6 text-[20px] font-black tracking-[-0.05em]">{item.title}</h2>
              <p className="mt-3 text-[13px] font-semibold leading-[1.5] text-black/62">{item.copy}</p>
            </article>
          )
        })}
      </div>
      <div className="mt-5 rounded-[16px] border border-black/10 bg-[#f7efe3] p-6">
        <p className="text-[13px] font-extrabold uppercase tracking-[0.03em]">Consolidation rule</p>
        <p className="mt-2 max-w-[86ch] text-[15px] font-bold leading-[1.5] tracking-[-0.025em] text-black/70">
          Do not create separate logo systems for Sorted.sites, SortedUpdates, dashboards, reports, or client portals. Use Sorted. as the master brand, then label each product surface in plain text.
        </p>
      </div>
    </section>
  )
}

function LogoSystem() {
  return (
    <section id="logos" className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      <SectionTitle index="02" title="Logo System" />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {logoAssets.map((asset) => (
          <LogoCard key={asset.file} asset={asset} />
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {[
          ["Clear space", "Keep at least one dot-width of clear space around the wordmark. More is better in dashboards and proposal headers."],
          ["Minimum size", "Wordmark should not render below 96px wide. Use the compact mark for anything smaller."],
          ["Period", "The acid period is part of the identity. Do not remove it, recolor it randomly, or replace it with a generic full stop."],
        ].map(([title, copy]) => (
          <article key={title} className="rounded-[14px] border border-black/10 bg-white p-5">
            <p className="[font-family:var(--font-v2-marker)] text-[1.5rem] leading-none">{title}</p>
            <p className="mt-3 text-[13px] font-semibold leading-[1.45] text-black/62">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function LogoCard({ asset }: { asset: (typeof logoAssets)[number] }) {
  return (
    <article className={`rounded-[16px] border p-5 ${asset.dark ? "border-black bg-[#070707]" : "border-black/10 bg-white"}`}>
      <div className="grid h-40 place-items-center rounded-[12px] bg-[#fbfbfa] p-5">
        <img src={asset.preview} alt="" className="max-h-28 w-full max-w-[230px] object-contain" />
      </div>
      <h3 className={`mt-5 text-[15px] font-black tracking-[-0.035em] ${asset.dark ? "text-white" : "text-black"}`}>{asset.title}</h3>
      <p className={`mt-2 min-h-16 text-[12px] font-semibold leading-[1.45] ${asset.dark ? "text-white/62" : "text-black/58"}`}>
        {asset.description}
      </p>
      <a
        href={asset.file}
        download
        className={`mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[12px] font-black ${
          asset.dark ? "bg-[#dfff00] text-black" : "bg-[#070707] text-white"
        }`}
      >
        <ArrowDownToLine className="size-4" strokeWidth={2.8} />
        Download SVG
      </a>
    </article>
  )
}

function PaletteSystem() {
  return (
    <section id="colors" className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      <SectionTitle index="03" title="Color System" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {palette.map((color) => (
          <article key={color.hex} className="overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_14px_40px_rgba(0,0,0,0.035)]">
            <div className="h-28" style={{ backgroundColor: color.hex }} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[16px] font-black tracking-[-0.04em]">{color.name}</h3>
                  <p className="mt-1 text-[11px] font-bold text-black/45">{color.token}</p>
                </div>
                <Copy className="size-4 text-black/35" />
              </div>
              <p className="mt-4 font-mono text-[12px] font-bold">{color.hex}</p>
              <p className="mt-3 min-h-10 text-[12px] font-semibold leading-[1.35] text-black/60">{color.usage}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function TypographySystem() {
  return (
    <section id="type" className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      <SectionTitle index="04" title="Typography" />
      <div className="mt-8 divide-y divide-black/10 overflow-hidden rounded-[18px] border border-black/10 bg-white">
        {typeRows.map((row) => (
          <article key={row.name} className="grid gap-5 p-6 lg:grid-cols-[150px_1fr_260px] lg:items-center">
            <p className="font-mono text-[12px] font-black uppercase text-black/45">{row.name}</p>
            <p className={row.className}>{row.sample}</p>
            <p className="text-[12px] font-semibold leading-[1.45] text-black/58">{row.rule}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function ComponentSystem() {
  return (
    <section id="components" className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      <SectionTitle index="05" title="Interface System" />
      <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[18px] border border-black/10 bg-white p-6">
          <p className="[font-family:var(--font-v2-marker)] text-[2rem] leading-none">BUTTONS, MARKS, PROOF.</p>
          <div className="mt-7 flex flex-wrap gap-4">
            <RoutineFinderButton label="Start the diagnostic" variant="primary" className="text-[12px]" />
            <Link className="inline-flex h-12 items-center gap-3 rounded-full border border-black/20 px-5 text-[12px] font-black" href="/v2/results-dashboard">
              View example dashboard <MonitorSmartphone className="size-4" strokeWidth={2.5} />
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 text-[13px] font-bold sm:grid-cols-2">
            {components.map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-[#b9d600]" strokeWidth={4} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <CapacitySample />
      </div>
    </section>
  )
}

function CapacitySample() {
  const metrics = [
    { icon: Clock3, value: "286", label: "Hours returned" },
    { icon: MessageCircle, value: "417", label: "Enquiries handled" },
    { icon: CheckCircle2, value: "100%", label: "Follow-up rate" },
    { icon: Star, value: "214", label: "Reviews generated" },
  ]

  return (
    <article className="rounded-[18px] bg-[#070707] p-7 text-white">
      <p className="[font-family:var(--font-v2-marker)] text-[2rem] leading-none">RESULTS BAND.</p>
      <div className="mt-7 grid grid-cols-2 rounded-[12px] border border-white/20 sm:grid-cols-4 sm:divide-x sm:divide-white/20">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="px-4 py-6 text-center">
              <Icon className="mx-auto size-7" />
              <p className="mt-4 text-[34px] font-black tracking-[-0.06em] text-[#dfff00]">{metric.value}</p>
              <p className="mx-auto mt-2 max-w-[96px] text-[8px] font-black uppercase leading-[1.25]">{metric.label}</p>
            </div>
          )
        })}
      </div>
    </article>
  )
}

function LayoutRules() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      <SectionTitle index="06" title="Layout Rules" />
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {layouts.map(([title, copy]) => (
          <article key={title} className="rounded-[14px] border border-black/10 bg-white p-6">
            <p className="[font-family:var(--font-v2-marker)] text-[1.55rem] leading-none">{title}</p>
            <p className="mt-4 text-[13px] font-semibold leading-[1.5] text-black/62">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function VoiceSystem() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      <div className="rounded-[20px] bg-[#dfff00] p-8 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <div>
          <p className="[font-family:var(--font-v2-marker)] text-[clamp(2.6rem,5vw,4.6rem)] leading-[1.02]">SAY IT LIKE A BUSINESS OWNER WOULD.</p>
          <div className="mt-4 h-[3px] w-64 max-w-full rounded-full bg-[#ff73d2]" />
        </div>
        <div className="mt-8 grid gap-4 lg:mt-0">
          {voice.map(([label, copy]) => (
            <div key={label} className="rounded-[12px] bg-white/70 p-5">
              <p className="text-[12px] font-black uppercase tracking-[0.03em]">{label}</p>
              <p className="mt-2 text-[15px] font-bold leading-[1.45] tracking-[-0.03em]">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DownloadStrip() {
  return (
    <section id="downloads" className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
      <div className="rounded-[20px] border border-black/10 bg-white p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <SectionEyebrow icon={<BookOpen className="size-4" />} label="Asset Library" />
            <h2 className="mt-4 text-[clamp(2.4rem,4vw,4.2rem)] font-black leading-[0.95] tracking-[-0.06em]">Download the core brand assets.</h2>
            <p className="mt-4 text-[14px] font-semibold leading-[1.55] text-black/62">
              These assets are safe to use across the public website, dashboards, SortedUpdates, proposals, reports, and client handoff pages.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {logoAssets.map((asset) => (
              <a
                key={asset.file}
                href={asset.file}
                download
                className="flex min-h-16 items-center justify-between gap-4 rounded-[12px] border border-black/10 bg-[#fbfbfa] px-5 text-[13px] font-black transition hover:border-black/25 hover:bg-[#dfff00]"
              >
                {asset.title}
                <ArrowDownToLine className="size-4 shrink-0" strokeWidth={2.8} />
              </a>
            ))}
            <a
              href="/brand/sorted-brand-token-card.svg"
              download
              className="flex min-h-16 items-center justify-between gap-4 rounded-[12px] border border-black/10 bg-[#fbfbfa] px-5 text-[13px] font-black transition hover:border-black/25 hover:bg-[#dfff00] sm:col-span-2"
            >
              Brand token card
              <ArrowDownToLine className="size-4 shrink-0" strokeWidth={2.8} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mt-10 bg-[#070707] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[28px] font-extrabold tracking-[-0.07em]">
            Sorted<span className="text-[#dfff00]">.</span>
          </p>
          <p className="mt-1 text-[12px] font-semibold text-white/60">The united brand system for the entire Sorted ecosystem.</p>
        </div>
        <Link href="/v2" className="inline-flex h-11 items-center gap-3 rounded-full bg-[#dfff00] px-5 text-[12px] font-black text-black">
          Back to Sorted <ArrowRight className="size-4" strokeWidth={3} />
        </Link>
      </div>
    </footer>
  )
}

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-end gap-4">
      <span className="font-mono text-[12px] font-black text-black/35">{index}</span>
      <div className="relative inline-block">
        <h2 className="[font-family:var(--font-v2-marker)] text-[clamp(2rem,3.4vw,3rem)] font-normal leading-[1.05]">{title}</h2>
        <span className="absolute -bottom-2 left-0 h-[7px] w-[78%] rounded-full bg-[#dfff00]" />
      </div>
    </div>
  )
}

function SectionEyebrow({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#fbfbfa] px-3 py-2 text-[11px] font-black uppercase tracking-[0.04em] text-black/55">
      {icon}
      {label}
    </span>
  )
}
