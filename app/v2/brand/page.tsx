import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import localFont from "next/font/local"
import {
  ArrowDownToLine,
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
import BrandAssetDownloads from "./BrandAssetDownloads"

const heroHighlight = localFont({
  src: "../../../public/fonts/Sans-Andreas-Bold-Demo.ttf",
  variable: "--font-brand-hero-highlight",
  display: "swap",
})

const heroScript = localFont({
  src: "../../../public/fonts/Fave-ScriptPro.ttf",
  variable: "--font-brand-hero-script",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Brand system | Sorted",
  description: "The identity, typography, interface language, and downloadable assets for Sorted.",
  alternates: { canonical: "/brand" },
}

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
    <main className={`${heroHighlight.variable} ${heroScript.variable} min-h-screen overflow-hidden bg-[#fbfbfa] text-[#070707]`}>
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
          One name.<br />One clear mark.
        </h1>
        <span className="mt-7 block h-[7px] w-[72%] max-w-[390px] rounded-full bg-[#dfff00]" />
        <p className="mt-7 max-w-[560px] text-[17px] font-semibold leading-[1.58] tracking-[-0.025em] text-black/72">
          Sorted is the brand. The logo is text, set deliberately heavier and tighter than ordinary copy, with the acid full stop completing the name.
        </p>
      </div>

      <div className="relative rounded-[22px] bg-[#070707] p-5 text-white shadow-[0_28px_70px_rgba(18,14,10,0.18)] sm:p-7">
        <div className="rounded-[16px] border border-white/15 px-6 py-8 sm:px-8">
          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-white/48">Primary wordmark</p>
          <p className="mt-5 text-[clamp(4.2rem,8vw,7.5rem)] font-black leading-none tracking-[-0.045em]">Sorted<span className="text-[#dfff00]">.</span></p>
          <p className="mt-6 max-w-[440px] text-[13px] font-semibold leading-[1.5] text-white/65">System sans · 900 weight · −0.045em tracking · acid full stop</p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_0.72fr]">
          <div className="rounded-[14px] bg-white p-6 text-black">
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-black/38">On paper</p>
            <p className="mt-7 text-[40px] font-black leading-none tracking-[-0.045em]">Sorted<span className="text-[#cfe900]">.</span></p>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-end gap-4 rounded-[14px] border border-white/15 bg-white/[0.06] p-6">
            <div><p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/38">Compact</p><p className="mt-5 text-[48px] font-black leading-none tracking-[-0.045em]">S<span className="text-[#dfff00]">.</span></p></div>
            <span className="mb-1 size-3 rounded-full bg-[#dfff00]" />
          </div>
        </div>
      </div>
    </section>
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
    [Edit3, "Public website", "The clearest expression of the promise, voice, typography, and visual rhythm."],
    [MonitorSmartphone, "SortedUpdates", "The client editing experience uses the same name and identity, not a second brand."],
    [FileText, "Client delivery", "Proposals, approvals, quotes, reports, and handoff pages are visibly Sorted."],
    [Workflow, "Operator tools", "Internal systems stay quieter and denser, while keeping the same identity cues."],
  ] as const

  return (
    <section id="architecture" className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
      <SectionLead number="01" title="Brand architecture" copy="Everything belongs to Sorted. Products and tools may have descriptive names, but they do not receive separate masterbrands or logo suffixes." />

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.36fr_0.64fr]">
        <div className="rounded-[20px] bg-[#dfff00] p-7 sm:p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.06em]">The rule</p>
          <p className="mt-7 text-[clamp(2.3rem,4vw,4rem)] font-black leading-[0.94] tracking-[-0.055em]">One brand.<br />Every surface.<br />Always Sorted.</p>
          <p className="mt-8 text-[14px] font-bold leading-[1.55] text-black/70">Do not add “Sites”, “Ops”, or another suffix to the wordmark. Describe the service in copy and navigation; let the Sorted name stay singular.</p>
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
      <SectionLead number="02" title="Identity system" copy="The live website is the benchmark: a bolder text wordmark with tighter spacing and a separately coloured full stop. It does not need an icon or suffix to explain it." />
      <div className="mt-10 overflow-hidden rounded-[20px] border border-black/10 bg-white">
        <IdentityRow label="Primary" note="For white, paper, and warm surfaces" dark={false}>
          <p className="text-[clamp(4rem,9vw,8rem)] font-black leading-none tracking-[-0.045em]">Sorted<span className="text-[#cfe900]">.</span></p>
        </IdentityRow>
        <IdentityRow label="Reversed" note="For ink and photographic dark surfaces" dark>
          <p className="text-[clamp(4rem,9vw,8rem)] font-black leading-none tracking-[-0.045em]">Sorted<span className="text-[#dfff00]">.</span></p>
        </IdentityRow>
        <IdentityRow label="Compact" note="Only when the full name will not fit" dark={false}>
          <p className="text-[clamp(4rem,9vw,8rem)] font-black leading-none tracking-[-0.045em]">S<span className="text-[#cfe900]">.</span></p>
        </IdentityRow>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <Rule title="Keep the period" copy="The acid full stop signals completion. It stays attached to Sorted in every primary lockup." />
        <Rule title="Keep it heavy" copy="Use 900 weight and −0.045em tracking. Do not substitute a lighter 700 or 800 treatment." />
        <Rule title="Never add a suffix" copy="Service names belong beside the logo in navigation or copy, never attached to the wordmark." />
      </div>
    </section>
  )
}

function IdentityRow({ label, note, dark, children }: { label: string; note: string; dark: boolean; children: ReactNode }) {
  return (
    <article className={`grid min-h-[230px] gap-8 border-b border-black/10 p-7 last:border-b-0 sm:p-9 lg:grid-cols-[170px_1fr] lg:items-center ${dark ? "bg-[#070707] text-white" : "bg-white text-black"}`}>
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
      <p className="mt-5 max-w-[750px] text-[12px] font-semibold leading-[1.55] text-black/52">Pink, blue, purple, and yellow may appear inside specific examples or illustrations. They are supporting content colours, not competing brand accents.</p>
    </section>
  )
}

function Typography() {
  return (
    <section className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
      <SectionLead number="04" title="Typography" copy="A heavy system sans does the serious work. The live hero uses two expressive faces for short emphasis; neither one replaces the text logo." />
      <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[20px] bg-[#070707] p-7 text-white sm:p-9">
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/42">Primary voice · display</p>
          <p className="mt-8 max-w-[760px] text-[clamp(3.2rem,7vw,6.6rem)] font-black leading-[0.88] tracking-[-0.06em] text-balance">Say the useful thing first.</p>
          <p className="mt-8 max-w-[54ch] text-[15px] font-semibold leading-[1.6] text-white/68">Use compact headlines, sentence case, strong weight, and tight tracking. Body copy stays plain, specific, and comfortably readable.</p>
        </div>
        <div className="grid gap-5">
          <article className="rounded-[20px] bg-[#f7f1e8] p-7 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-black/40">Hero script · Fave Script Pro</p>
            <p className="mt-6 [font-family:var(--font-brand-hero-script)] text-[clamp(4.5rem,8vw,7.2rem)] leading-[0.75] text-[#cfe900]">Sorted.</p>
            <p className="mt-6 text-[12px] font-semibold leading-[1.5] text-black/58">Fluid and human. Used as hero copy, never as the navigation logo.</p>
          </article>
          <article className="rounded-[20px] bg-[#dfff00] p-7 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-black/45">Hero highlight · Sans Andreas Bold</p>
            <p className="mt-6 whitespace-nowrap [font-family:var(--font-brand-hero-highlight)] text-[clamp(2.6rem,5vw,4.7rem)] font-normal leading-[0.86] tracking-[-0.02em]">We close them.</p>
            <p className="mt-6 text-[12px] font-semibold leading-[1.5] text-black/62">Rounded, direct, and always set in sentence case like the live hero.</p>
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
      <SectionLead number="05" title="Interface language" copy="One visual system stretches from public marketing to results and delivery. The density can change, but the type, spacing, actions, and proof-first structure stay recognisably Sorted." />
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
          <InterfaceSample kind="marketing" />
          <InterfaceSample kind="proof" />
        </div>
      </div>
    </section>
  )
}

function InterfaceSample({ kind }: { kind: "marketing" | "proof" }) {
  const marketing = kind === "marketing"
  return (
    <article className={`overflow-hidden rounded-[20px] ${marketing ? "bg-[#f7f1e8]" : "bg-[#070707] text-white"}`}>
      <div className="p-6 sm:p-7">
        <p className={`text-[10px] font-black uppercase tracking-[0.08em] ${marketing ? "text-black/40" : "text-white/42"}`}>{marketing ? "Marketing surface" : "Proof surface"}</p>
        <h3 className="mt-5 text-[32px] font-black leading-[0.96] tracking-[-0.05em]">{marketing ? "Show the outcome." : "Show what changed."}</h3>
        <p className={`mt-4 text-[13px] font-semibold leading-[1.5] ${marketing ? "text-black/62" : "text-white/62"}`}>{marketing ? "Visual proof, trust, clear pricing, and one low-friction next step." : "Visible movement, measured recovery, and evidence someone can understand."}</p>
      </div>
      {marketing ? (
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
          <p className="mt-6 max-w-[430px] text-[14px] font-semibold leading-[1.55] text-black/62">These SVGs reproduce the live text logo at 900 weight and −0.045em tracking. Choose the version named for the surface it will sit on.</p>
        </div>
        <BrandAssetDownloads />
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
          <p className="mt-4 max-w-[220px] text-[13px] font-semibold leading-[1.45] text-white/68">One clear name across the website, client delivery, updates, and internal tools.</p>
          <p className="mt-7 text-[10px] font-medium text-white/40">© 2026 Sorted · A trading name of ADX Engine Ltd</p>
        </div>
        <FooterLinks title="Explore" links={[["Home", "/"], ["Examples", "/examples"], ["Pricing", "/pricing"]]} />
        <FooterLinks title="Company" links={[["About", "/about"], ["How it works", "/howitworks"], ["SortedUpdates", "/website-updates"]]} />
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
