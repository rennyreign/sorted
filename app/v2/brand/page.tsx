import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import localFont from "next/font/local"
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  Clock3,
  Code2,
  Edit3,
  Eye,
  FileText,
  Layers3,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react"

const marker = localFont({
  src: "../../../public/fonts/cc-ask-for-mercy.ttf",
  variable: "--font-brand-marker",
  display: "swap",
})

const opsHighlight = localFont({
  src: "../../../public/fonts/Sans-Andreas-Bold-Demo.ttf",
  variable: "--font-brand-ops-highlight",
  display: "swap",
})

const sitesScript = localFont({
  src: "../../../public/fonts/Fave-ScriptPro.ttf",
  variable: "--font-brand-sites-script",
  display: "swap",
})

const productLabel = localFont({
  src: "../../../public/fonts/Bakeshop-Regular.ttf",
  variable: "--font-brand-product-label",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Brand system | Sorted",
  description: "The brand architecture, identity, interface language, and downloadable assets for Sorted, Sorted Sites, and Sorted Ops.",
  alternates: { canonical: "/brand" },
}

const downloads = [
  ["Sorted Ops · light", "/brand/sorted-ops-wordmark-light.png", "PNG"],
  ["Sorted Ops · dark", "/brand/sorted-ops-wordmark-dark.png", "PNG"],
  ["Sorted Ops · transparent", "/brand/sorted-ops-wordmark-transparent.png", "PNG"],
  ["Sorted Sites · light", "/brand/sorted-sites-wordmark-light.png", "PNG"],
  ["Sorted Sites · dark", "/brand/sorted-sites-wordmark-dark.png", "PNG"],
  ["Sorted Sites · transparent", "/brand/sorted-sites-wordmark-transparent.png", "PNG"],
  ["Compact mark · dark", "/brand/sorted-mark.svg", "SVG"],
  ["Compact mark · light", "/brand/sorted-mark-light.svg", "SVG"],
  ["Brand token card", "/brand/sorted-brand-token-card.svg", "SVG"],
] as const

const colours = [
  { name: "Ink", hex: "#070707", role: "Type, dark bands, primary action", className: "bg-[#070707] text-white" },
  { name: "Paper", hex: "#FBFBFA", role: "Default page canvas", className: "bg-[#fbfbfa] text-black" },
  { name: "Acid", hex: "#DFFF00", role: "Brand punctuation and action", className: "bg-[#dfff00] text-black" },
  { name: "Warm board", hex: "#F7F1E8", role: "Explanation and process", className: "bg-[#f7f1e8] text-black" },
  { name: "Line", hex: "#E8E5DD", role: "Quiet structure and separators", className: "bg-[#e8e5dd] text-black" },
  { name: "Proof green", hex: "#00A64B", role: "Verified positive change only", className: "bg-[#00a64b] text-white" },
] as const

export default function SortedBrandPage() {
  return (
    <main className={`${marker.variable} ${opsHighlight.variable} ${sitesScript.variable} ${productLabel.variable} min-h-screen overflow-hidden bg-[#fbfbfa] text-[#070707]`}>
      <Header />
      <Hero />
      <PrinciplesBand />
      <Architecture />
      <Identity />
      <ColourSystem />
      <Typography />
      <InterfaceLanguage />
      <Voice />
      <Downloads />
      <Footer />
    </main>
  )
}

function Header() {
  return (
    <header className="border-b border-black/5 bg-[#fbfbfa]/92 px-5 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex min-h-[76px] max-w-[1220px] items-center justify-between gap-5">
        <Link href="/" aria-label="Sorted home" className="inline-flex min-h-11 items-center text-[33px] font-black leading-none tracking-[-0.045em] sm:text-[40px]">
          Sorted<span className="text-[#cfe900]">.</span>
        </Link>
        <nav aria-label="Brand page sections" className="hidden items-center gap-7 text-[12px] font-extrabold md:flex">
          <a className="transition-opacity hover:opacity-55" href="#architecture">Architecture</a>
          <a className="transition-opacity hover:opacity-55" href="#identity">Identity</a>
          <a className="transition-opacity hover:opacity-55" href="#interface">Interface</a>
          <a className="transition-opacity hover:opacity-55" href="#voice">Voice</a>
        </nav>
        <a href="#downloads" className="inline-flex h-11 shrink-0 items-center gap-3 rounded-full bg-[#070707] px-5 text-[11px] font-black text-white shadow-[0_12px_28px_rgba(0,0,0,0.14)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfff00]/70">
          Brand assets <ArrowDownToLine className="size-4" strokeWidth={2.8} />
        </a>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-12 pt-12 sm:px-8 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:pb-16 lg:pt-16">
      <div>
        <p className="mb-5 text-[12px] font-black text-black/45">The Sorted brand system</p>
        <h1 className="max-w-[650px] text-[clamp(4rem,7.8vw,7.4rem)] font-black leading-[0.87] tracking-[-0.06em] text-balance">
          One company.<br />Two clear offers.
        </h1>
        <span className="mt-7 block h-[7px] w-[72%] max-w-[390px] rounded-full bg-[#dfff00]" />
        <p className="mt-7 max-w-[560px] text-[17px] font-semibold leading-[1.58] tracking-[-0.025em] text-black/72">
          Sorted is the parent brand. Sorted Sites builds better websites. Sorted Ops improves how businesses work. The family feels related without making the offers look interchangeable.
        </p>
      </div>

      <div className="relative rounded-[22px] bg-[#070707] p-5 text-white shadow-[0_28px_70px_rgba(18,14,10,0.18)] sm:p-7">
        <div className="rounded-[16px] border border-white/15 px-6 py-7 sm:px-8">
          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-white/48">Parent brand</p>
          <p className="mt-3 text-[clamp(3rem,5vw,5rem)] font-black leading-none tracking-[-0.06em]">Sorted<span className="text-[#dfff00]">.</span></p>
          <p className="mt-4 max-w-[440px] text-[13px] font-semibold leading-[1.5] text-white/65">The promise behind every offer: clear work, finished properly, with proof of what changed.</p>
        </div>
        <div className="relative grid gap-3 pt-8 sm:grid-cols-2">
          <span className="absolute left-1/2 top-0 hidden h-8 w-px bg-white/20 sm:block" />
          <span className="absolute left-1/4 right-1/4 top-8 hidden h-px bg-white/20 sm:block" />
          <OfferLockup kind="sites" />
          <OfferLockup kind="ops" />
        </div>
      </div>
    </section>
  )
}

function OfferLockup({ kind }: { kind: "sites" | "ops" }) {
  const sites = kind === "sites"
  return (
    <Link href={sites ? "/sites" : "/ops"} className={`group relative rounded-[14px] p-6 transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfff00]/60 ${sites ? "bg-white text-black" : "border border-white/16 bg-white/[0.06] text-white"}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.08em] opacity-45">Focused offer</p>
      <p className="mt-4 text-[32px] font-black leading-none tracking-[-0.05em]">
        Sorted<span className="text-[#dfff00]">.</span><span className="[font-family:var(--font-brand-product-label)] font-normal tracking-normal text-[#cfe900]">{kind}</span>
      </p>
      <p className="mt-5 text-[13px] font-semibold leading-[1.45] opacity-65">{sites ? "Websites that earn trust and enquiries." : "Systems that return time and capacity."}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-black">View offer <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" /></span>
    </Link>
  )
}

function PrinciplesBand() {
  const items = [
    [Eye, "Obvious", "People should know what they are looking at."],
    [ShieldCheck, "Trustworthy", "Proof before polish. Specifics before claims."],
    [Zap, "Useful", "Every element helps someone decide or act."],
    [Check, "Finished", "The brand should feel like the work is already handled."],
  ] as const

  return (
    <section className="mx-auto max-w-[1220px] px-5 pb-12 sm:px-8">
      <div className="grid gap-5 rounded-[18px] bg-[#f7f1e8] px-6 py-6 md:grid-cols-4">
        {items.map(([Icon, title, copy]) => (
          <div key={title} className="grid grid-cols-[48px_1fr] gap-4 border-black/10 md:border-l md:pl-5 first:md:border-l-0 first:md:pl-0">
            <span className="grid size-12 place-items-center rounded-full border-2 border-black bg-[#e7ff1e]">
              <Icon className="size-6" strokeWidth={2.4} />
            </span>
            <div>
              <p className="text-[11px] font-black uppercase">{title}</p>
              <p className="mt-2 text-[12px] font-bold leading-[1.35] text-black/64">{copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Architecture() {
  const surfaces = [
    [Edit3, "SortedUpdates", "The editable content layer delivered with a Sorted Sites website."],
    [MonitorSmartphone, "Client portals", "Approvals, quotes, delivery, and handoff inherit the relevant offer."],
    [FileText, "Reports", "Evidence and outcomes use the Sorted Ops proof language."],
    [Workflow, "Operator tools", "Internal systems stay quiet, legible, and unmistakably Sorted."],
  ] as const

  return (
    <section id="architecture" className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
      <SectionLead number="01" title="Brand architecture" copy="Lead with the offer people are buying. Use the parent name when talking about the company, the shared standard, or the complete ecosystem." />

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.36fr_0.64fr]">
        <div className="rounded-[20px] bg-[#dfff00] p-7 sm:p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.06em]">The rule</p>
          <p className="mt-7 text-[clamp(2.3rem,4vw,4rem)] font-black leading-[0.94] tracking-[-0.055em]">One parent.<br />Two offers.<br />No blur.</p>
          <p className="mt-8 text-[14px] font-bold leading-[1.55] text-black/70">Do not present Sorted Sites, Sorted Ops, or SortedUpdates as three equal businesses. Sites and Ops are offers. SortedUpdates is a named capability inside a website delivery.</p>
        </div>
        <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
          {surfaces.map(([Icon, title, copy], index) => (
            <article key={title} className="border-t border-black/12 pt-5">
              <div className="flex items-start justify-between gap-5">
                <Icon className="size-7" strokeWidth={2.2} />
                <span className="font-mono text-[10px] font-bold text-black/35">0{index + 1}</span>
              </div>
              <h3 className="mt-6 text-[19px] font-black tracking-[-0.04em]">{title}</h3>
              <p className="mt-3 max-w-[34ch] text-[13px] font-semibold leading-[1.5] text-black/62">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Identity() {
  return (
    <section id="identity" className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
      <SectionLead number="02" title="Identity system" copy="The heavy wordmark and acid full stop hold the family together. Offer labels add character; they never compete with Sorted." />
      <div className="mt-10 overflow-hidden rounded-[20px] border border-black/10 bg-white">
        <IdentityRow label="Parent" note="Company-level communication" dark={false}>
          <p className="text-[clamp(4rem,9vw,8rem)] font-black leading-none tracking-[-0.065em]">Sorted<span className="text-[#cfe900]">.</span></p>
        </IdentityRow>
        <IdentityRow label="Websites" note="Use for the website offer" dark={false} warm>
          <p className="text-[clamp(3.3rem,7vw,6.5rem)] font-black leading-none tracking-[-0.06em]">Sorted<span className="text-[#cfe900]">.</span><span className="[font-family:var(--font-brand-product-label)] font-normal tracking-normal text-[#cfe900]">sites</span></p>
        </IdentityRow>
        <IdentityRow label="Operations" note="Use for operational improvement" dark>
          <p className="text-[clamp(3.3rem,7vw,6.5rem)] font-black leading-none tracking-[-0.06em]">Sorted<span className="text-[#dfff00]">.</span><span className="[font-family:var(--font-brand-product-label)] font-normal tracking-normal text-[#dfff00]">ops</span></p>
        </IdentityRow>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <Rule title="Keep the period" copy="The acid full stop signals completion. It stays attached to Sorted in every primary lockup." />
        <Rule title="Protect the hierarchy" copy="Sorted is always heavier and more prominent than the offer label that follows it." />
        <Rule title="Use space generously" copy="Leave at least the height of the full stop clear around a wordmark. Never crowd it into a corner." />
      </div>
    </section>
  )
}

function IdentityRow({ label, note, dark, warm = false, children }: { label: string; note: string; dark: boolean; warm?: boolean; children: ReactNode }) {
  return (
    <article className={`grid min-h-[230px] gap-8 border-b border-black/10 p-7 last:border-b-0 sm:p-9 lg:grid-cols-[170px_1fr] lg:items-center ${dark ? "bg-[#070707] text-white" : warm ? "bg-[#f7f1e8] text-black" : "bg-white text-black"}`}>
      <div>
        <p className={`text-[11px] font-black uppercase tracking-[0.06em] ${dark ? "text-white/45" : "text-black/40"}`}>{label}</p>
        <p className={`mt-3 text-[12px] font-semibold leading-[1.45] ${dark ? "text-white/62" : "text-black/58"}`}>{note}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </article>
  )
}

function ColourSystem() {
  return (
    <section className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
      <SectionLead number="03" title="Colour system" copy="Ink, paper, and acid do most of the work. Warm board explains. Green proves. Everything else should earn its place." />
      <div className="mt-10 grid overflow-hidden rounded-[20px] border border-black/10 sm:grid-cols-2 lg:grid-cols-6">
        {colours.map((colour) => (
          <article key={colour.hex} className={`flex min-h-[230px] flex-col justify-end border-black/10 p-5 sm:border-r ${colour.className}`}>
            <p className="text-[13px] font-black">{colour.name}</p>
            <p className="mt-1 font-mono text-[10px] font-bold opacity-55">{colour.hex}</p>
            <p className="mt-5 text-[11px] font-semibold leading-[1.4] opacity-62">{colour.role}</p>
          </article>
        ))}
      </div>
      <p className="mt-5 max-w-[750px] text-[12px] font-semibold leading-[1.55] text-black/52">Pink, blue, purple, and yellow may appear inside a specific client example or Ops problem illustration. They are supporting content colours, not competing brand accents.</p>
    </section>
  )
}

function Typography() {
  return (
    <section className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
      <SectionLead number="04" title="Typography" copy="A heavy system sans does the serious work. Handwritten faces are short, purposeful accents—not a default heading style." />
      <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[20px] bg-[#070707] p-7 text-white sm:p-9">
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/42">Primary voice · display</p>
          <p className="mt-8 max-w-[760px] text-[clamp(3.2rem,7vw,6.6rem)] font-black leading-[0.88] tracking-[-0.06em] text-balance">Say the useful thing first.</p>
          <p className="mt-8 max-w-[54ch] text-[15px] font-semibold leading-[1.6] text-white/68">Use compact headlines, sentence case, strong weight, and tight tracking. Body copy stays plain, specific, and comfortably readable.</p>
        </div>
        <div className="grid gap-5">
          <article className="rounded-[20px] bg-[#f7f1e8] p-7 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-black/40">Sorted Sites · expressive accent</p>
            <p className="mt-6 [font-family:var(--font-brand-sites-script)] text-[clamp(4.5rem,8vw,7.2rem)] leading-[0.75] text-[#cfe900]">Sorted.</p>
            <p className="mt-6 text-[12px] font-semibold leading-[1.5] text-black/58">Human, optimistic, and used for one decisive phrase.</p>
          </article>
          <article className="rounded-[20px] bg-[#dfff00] p-7 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-black/45">Sorted Ops · marker accent</p>
            <p className="mt-6 [font-family:var(--font-brand-ops-highlight)] text-[clamp(3rem,6vw,5.2rem)] leading-[0.84]">WE CLOSE THE GAPS.</p>
            <p className="mt-6 text-[12px] font-semibold leading-[1.5] text-black/62">Direct, energetic, and reserved for the operational promise.</p>
          </article>
        </div>
      </div>
    </section>
  )
}

function InterfaceLanguage() {
  const shared = [
    [Layers3, "1220px frame", "20px mobile and 32px wide-screen gutters."],
    [Sparkles, "Restrained surfaces", "Borders first, shadows only where depth explains hierarchy."],
    [Clock3, "Fast feedback", "200ms transitions, clear hover, press, and focus states."],
    [Code2, "Real structure", "Semantic sections, useful content, and no decorative dead weight."],
  ] as const

  return (
    <section id="interface" className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
      <SectionLead number="05" title="Interface language" copy="The offers share spacing, typography, action styles, and proof-first structure. Their section composition changes to match what each offer sells." />
      <div className="mt-10 grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
        <div className="grid gap-0 overflow-hidden rounded-[20px] border border-black/10 bg-white sm:grid-cols-2 lg:grid-cols-1">
          {shared.map(([Icon, title, copy]) => (
            <article key={title} className="grid grid-cols-[44px_1fr] gap-4 border-b border-black/10 p-5 last:border-b-0">
              <span className="grid size-11 place-items-center rounded-full bg-[#dfff00]"><Icon className="size-5" strokeWidth={2.4} /></span>
              <div>
                <h3 className="text-[14px] font-black tracking-[-0.03em]">{title}</h3>
                <p className="mt-2 text-[12px] font-semibold leading-[1.45] text-black/58">{copy}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <InterfaceSample kind="sites" />
          <InterfaceSample kind="ops" />
        </div>
      </div>
    </section>
  )
}

function InterfaceSample({ kind }: { kind: "sites" | "ops" }) {
  const sites = kind === "sites"
  return (
    <article className={`overflow-hidden rounded-[20px] ${sites ? "bg-[#f7f1e8]" : "bg-[#070707] text-white"}`}>
      <div className="p-6 sm:p-7">
        <p className={`text-[10px] font-black uppercase tracking-[0.08em] ${sites ? "text-black/40" : "text-white/42"}`}>Sorted {kind}</p>
        <h3 className="mt-5 text-[32px] font-black leading-[0.96] tracking-[-0.05em]">{sites ? "Show the outcome." : "Show what changed."}</h3>
        <p className={`mt-4 text-[13px] font-semibold leading-[1.5] ${sites ? "text-black/62" : "text-white/62"}`}>{sites ? "Visual proof, trust, clear pricing, and one low-friction next step." : "Visible gaps, measurable recovery, operational proof, and one decisive next step."}</p>
      </div>
      {sites ? (
        <div className="mx-6 mb-6 rotate-[-2deg] rounded-[12px] border border-black/10 bg-white p-5 shadow-[0_18px_45px_rgba(20,14,8,0.12)]">
          <div className="grid grid-cols-[0.8fr_1.2fr] gap-4">
            <div><span className="block h-2 w-16 rounded-full bg-black" /><span className="mt-3 block h-2 w-24 rounded-full bg-black/15" /><span className="mt-5 block h-7 w-20 rounded-full bg-[#dfff00]" /></div>
            <div className="h-24 rounded-md bg-[#e8e5dd]" />
          </div>
        </div>
      ) : (
        <div className="mx-6 mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-white/16 bg-white/16">
          {[["412", "Hours returned"], ["+31%", "Capacity gained"], ["9", "Gaps closed"], ["£18.4k", "Value created"]].map(([value, label]) => (
            <div key={label} className="bg-[#070707] p-4"><p className="text-[25px] font-black tracking-[-0.05em] text-[#dfff00]">{value}</p><p className="mt-1 text-[8px] font-black uppercase text-white/55">{label}</p></div>
          ))}
        </div>
      )}
    </article>
  )
}

function Voice() {
  return (
    <section id="voice" className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
      <div className="grid gap-9 rounded-[22px] bg-[#dfff00] p-7 sm:p-9 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.06em]">06 · Voice</p>
          <p className="mt-7 text-[clamp(2.8rem,5vw,5rem)] font-black leading-[0.91] tracking-[-0.055em]">Sound like someone who gets things done.</p>
          <span className="mt-6 block h-[5px] w-44 rounded-full bg-black" />
        </div>
        <div className="grid gap-3">
          <VoiceRow label="Say" text="website, enquiries, missed calls, time returned, work removed, proof" />
          <VoiceRow label="Avoid" text="ecosystem, seamless, transformation, next-generation, unlock potential" />
          <VoiceRow label="Write" text="Short sentences. Plain English. Real numbers. Specific outcomes." />
          <VoiceRow label="Promise" text="We show the work before asking for trust, then finish what was agreed." />
        </div>
      </div>
    </section>
  )
}

function Downloads() {
  return (
    <section id="downloads" className="mx-auto max-w-[1220px] px-5 pb-16 pt-12 sm:px-8">
      <div className="grid gap-10 rounded-[22px] border border-black/10 bg-white p-7 shadow-[0_18px_55px_rgba(20,14,8,0.05)] sm:p-9 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="text-[11px] font-black text-black/42">Brand assets</p>
          <h2 className="mt-5 text-[clamp(2.8rem,5vw,5rem)] font-black leading-[0.92] tracking-[-0.055em]">Take the right mark with you.</h2>
          <p className="mt-6 max-w-[430px] text-[14px] font-semibold leading-[1.55] text-black/62">Choose the light artwork for pale surfaces and the dark artwork for black or very dark surfaces. Transparent files are best for flexible placement.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {downloads.map(([label, file, format], index) => (
            <a key={file} href={file} download className={`group flex min-h-16 items-center justify-between gap-4 rounded-[12px] border border-black/10 bg-[#fbfbfa] px-5 text-[12px] font-black transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-black/25 hover:bg-[#dfff00] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfff00]/60 ${index === downloads.length - 1 ? "sm:col-span-2" : ""}`}>
              <span>{label}<span className="ml-2 font-mono text-[9px] text-black/38 group-hover:text-black/55">{format}</span></span>
              <ArrowDownToLine className="size-4 shrink-0" strokeWidth={2.7} />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#070707] px-5 py-9 text-white sm:px-8">
      <div className="mx-auto grid max-w-[1220px] gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <p className="text-[34px] font-black leading-none tracking-[-0.05em]">Sorted<span className="text-[#dfff00]">.</span></p>
          <p className="mt-4 max-w-[220px] text-[13px] font-semibold leading-[1.45] text-white/68">Business modernisation, split into two offers people can understand.</p>
          <p className="mt-7 text-[10px] font-medium text-white/40">© 2026 Sorted · A trading name of ADX Engine Ltd</p>
        </div>
        <FooterLinks title="Sorted Sites" links={[["Website offer", "/sites"], ["Examples", "/examples"], ["Pricing", "/pricing"]]} />
        <FooterLinks title="Sorted Ops" links={[["Operations offer", "/ops"], ["How it works", "/ops/how-it-works"], ["Results", "/ops/results"]]} />
        <div>
          <p className="mb-4 text-[12px] font-black">Need the right version?</p>
          <a href="mailto:hello@sortmydigital.site" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#dfff00] px-5 text-[12px] font-black text-black transition-transform duration-200 hover:-translate-y-0.5"><Mail className="size-4" /> Ask Sorted</a>
        </div>
      </div>
    </footer>
  )
}

function SectionLead({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.3fr_0.7fr] lg:items-end">
      <div>
        <p className="font-mono text-[10px] font-bold text-black/38">{number}</p>
        <h2 className="mt-3 text-[clamp(2.6rem,4.8vw,4.8rem)] font-black leading-[0.94] tracking-[-0.055em]">{title}</h2>
        <span className="mt-5 block h-[5px] w-32 rounded-full bg-[#dfff00]" />
      </div>
      <p className="max-w-[680px] text-[16px] font-semibold leading-[1.58] tracking-[-0.025em] text-black/65 lg:justify-self-end">{copy}</p>
    </div>
  )
}

function Rule({ title, copy }: { title: string; copy: string }) {
  return (
    <article className="border-t border-black/12 pt-5">
      <p className="text-[15px] font-black tracking-[-0.03em]">{title}</p>
      <p className="mt-3 text-[12px] font-semibold leading-[1.5] text-black/58">{copy}</p>
    </article>
  )
}

function VoiceRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="grid gap-2 rounded-[12px] bg-white/78 p-5 sm:grid-cols-[80px_1fr] sm:items-start">
      <p className="text-[10px] font-black uppercase tracking-[0.06em] text-black/45">{label}</p>
      <p className="text-[14px] font-bold leading-[1.45] tracking-[-0.025em]">{text}</p>
    </div>
  )
}

function FooterLinks({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return (
    <div>
      <p className="mb-4 text-[12px] font-black">{title}</p>
      <ul className="space-y-2 text-[12px] font-semibold text-white/68">
        {links.map(([label, href]) => <li key={href}><Link href={href} className="inline-flex min-h-8 items-center transition-colors hover:text-[#dfff00]">{label}</Link></li>)}
      </ul>
    </div>
  )
}
