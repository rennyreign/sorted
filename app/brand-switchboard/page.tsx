import { SiteMapFooter } from "@/components/SiteMapFooter"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Globe, MessageSquare, Phone, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Sorted | Where’s your business getting stuck?",
  description: "A better website, more useful enquiries or less admin. Start with what your business needs and we’ll help you find the next step.",
  alternates: { canonical: "/" },
  openGraph: { title: "Sorted | Where’s your business getting stuck?", description: "A better website, more useful enquiries or less admin. Find your next step with Sorted.", url: "/" },
}

const paths = [
  { number: "01", Icon: Globe, title: "We need more people finding us.", copy: "Your work’s good. Your website should make that obvious. Give people a clearer picture of your business and an easy way to get in touch.", service: "Websites for local businesses", cta: "Help us get noticed", href: "/websites", image: "/sorted-home/hero-workshop.webp", alt: "A business website shown on a laptop in a workshop", surface: "bg-[#f6f5ec]", position: "object-center" },
  { number: "02", Icon: MessageSquare, title: "People look, but don’t get in touch.", copy: "Let’s look at what happens between finding you and choosing you: the message, the offer, the proof and the next step.", service: "Customer acquisition & conversion", cta: "Help us turn interest into enquiries", href: "/what-else-we-do", image: "/sorted-whatelse/hero-laptop.webp", alt: "Illustration of a website and customer enquiry tools", surface: "bg-[#e8f3fa]", position: "object-contain" },
  { number: "03", Icon: Sparkles, title: "We get enquiries. Keeping up is the problem.", copy: "Enquiries waiting for replies. Quotes still unwritten. Invoices that need chasing. Put AI automation to work inside the tools you already use.", service: "AI automation services", cta: "Help us stop things slipping", href: "/v4", image: "/v4/how-it-works-hero.webp", alt: "Illustrative phone notification showing a received payment", surface: "bg-[#fceeee]", position: "object-contain" },
]
const logos = [["bodysharp", "BodySharp Fitness"], ["school-of-skill", "School of Skill"], ["gb-halesowen", "Gracie Barra Halesowen"], ["warwickshire-short-stays", "Warwickshire Short Stays"], ["edgbaston-tuition", "Edgbaston Tuition Centre"]]

export default function SortedStart() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-[#111]">
      <header className="mx-auto flex max-w-[1280px] items-center justify-between gap-5 px-6 py-6 sm:px-10">
        <Link href="/" aria-label="Sorted home" className="text-[40px] font-black leading-none tracking-[-0.045em]">Sorted<span className="text-[#cfe900]">.</span></Link>
        <nav aria-label="Primary" className="flex items-center gap-5 text-[14px] font-semibold sm:gap-8">
          <Link href="/websites" className="hidden underline-offset-8 hover:underline focus-visible:underline sm:block">Websites</Link>
          <Link href="/v4" className="hidden underline-offset-8 hover:underline focus-visible:underline sm:block">AI automation</Link>
          <a href="https://wa.me/447386468085" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#00271f] px-4 text-[13px] transition-colors hover:bg-[#00271f] hover:text-white"><Phone size={15} />Let’s talk</a>
        </nav>
      </header>
      <section className="mx-auto max-w-[1280px] px-6 pb-10 pt-12 sm:px-10 sm:pb-14 sm:pt-16">
        <h1 className="max-w-[1000px] text-[clamp(2.9rem,6.3vw,5.7rem)] font-black leading-[1.02] tracking-[-0.055em]">Where’s your business<br className="hidden sm:block" /> getting stuck?</h1>
        <p className="mt-6 max-w-[620px] text-[18px] leading-relaxed text-black/65">You don’t need to know which service you need.<br className="hidden sm:block" /> Start with what you’d like to improve.</p>
      </section>
      <section aria-label="Find your next step" className="mx-auto grid max-w-[1280px] gap-5 px-6 sm:px-10 lg:grid-cols-3">
        {paths.map(({ Icon, ...path }) => (
          <Link key={path.number} href={path.href} data-track="cta_click" data-cta-text={path.cta} data-cta-location="service_switchboard" className={`group flex flex-col overflow-hidden rounded-[22px] p-7 outline-offset-4 transition-colors duration-200 hover:bg-[#e4ff29] focus-visible:outline-2 focus-visible:outline-black ${path.surface}`}>
            <div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-full bg-[#e4ff29] transition-colors group-hover:bg-black group-hover:text-white"><Icon size={23} strokeWidth={1.8} /></span><span className="text-[12px] font-semibold text-black/45">{path.number}</span></div>
            <h2 className="mt-7 text-[clamp(1.7rem,2.3vw,2.1rem)] font-black leading-[1.1] tracking-[-0.04em]">“{path.title}”</h2>
            <p className="mb-6 mt-5 text-[16px] leading-[1.6] text-black/70">{path.copy}</p>
            <div className="relative mt-auto h-[190px] overflow-hidden rounded-xl"><Image src={path.image} alt={path.alt} fill sizes="(min-width: 1024px) 350px, 90vw" className={path.position} /></div>
            <p className="mt-6 text-[12px] font-semibold text-black/55">{path.service}</p>
            <span className="mt-3 flex min-h-12 items-center justify-between gap-3 border-t border-black/15 pt-4 text-[15px] font-bold">{path.cta}<ArrowRight size={20} className="shrink-0 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </section>
      <section className="mx-auto max-w-[1280px] px-6 py-14 sm:px-10 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-6 border-y border-black/10 py-8 md:flex-row md:items-center">
          <div><h2 className="text-[25px] font-black tracking-[-0.03em]">Not sure where the problem starts?</h2><p className="mt-2 text-[16px] leading-relaxed text-black/65">Let’s look at it together. We’ll help you find a useful first step.</p></div>
          <a href="https://cal.com/sortmydigital/15min" className="inline-flex min-h-12 shrink-0 items-center gap-4 rounded-full bg-[#00271f] px-6 text-[14px] font-bold text-white transition-colors hover:bg-black">Let’s talk it through<ArrowRight size={18} /></a>
        </div>
        <p className="mt-14 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-black/50">Trusted by businesses across the UK and beyond</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12">{logos.map(([slug, name]) => <Image key={slug} src={`/v4/logos/${slug}.webp`} alt={name} width={160} height={65} className={`h-14 w-32 object-contain grayscale ${slug === "gb-halesowen" ? "!w-16" : ""}`} />)}</div>
      </section>
      <SiteMapFooter experience="company" />
    </main>
  )
}
