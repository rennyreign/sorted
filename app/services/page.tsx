import { SiteMapFooter } from "@/components/SiteMapFooter"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Globe, MessageSquare, Phone, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "What else we do | Sorted",
  description: "A better website. More customers. Less admin. We help you put the right things in place to move your business forward.",
  alternates: { canonical: "/services" },
  openGraph: { title: "What else we do | Sorted", description: "A better website. More customers. Less admin. Let's get your business there.", url: "/services" },
}

const paths = [
  { number: "01", Icon: Globe, title: "We want to look as good as the work we do.", copy: "Show people what you do, why you're worth choosing and how to get in touch. A website you're proud to send customers to.", service: "Websites for growing businesses", cta: "Get a better website", href: "/websites", image: "/sorted-home/hero-workshop.webp", alt: "A business website shown on a laptop in a workshop", surface: "bg-[#f6f5ec]", position: "object-center" },
  { number: "02", Icon: MessageSquare, title: "We want more of the right customers.", copy: "Give people a reason to choose you. We bring your campaigns, website and follow-up together to turn more interest into paying customers.", service: "Marketing & customer acquisition", cta: "Win more customers", href: "/what-else-we-do", image: "/sorted-whatelse/hero-laptop.webp", alt: "Illustration of a website and customer enquiry tools", surface: "bg-[#e8f3fa]", position: "object-contain" },
  { number: "03", Icon: Sparkles, title: "We want to do more without taking on more admin.", copy: "Free your team to do the work that needs them. We build an AI assistant around your business and put it to work on everyday jobs, from answering enquiries to following up quotes.", service: "AI assistants that do the work", cta: "Meet your assistant", href: "/assistants", image: "/v4/how-it-works-hero.webp", alt: "Illustrative phone notification showing a received payment", surface: "bg-[#fceeee]", position: "object-contain" },
]
const logos = [["bodysharp", "BodySharp Fitness"], ["school-of-skill", "School of Skill"], ["gb-halesowen", "Gracie Barra Halesowen"], ["warwickshire-short-stays", "Warwickshire Short Stays"], ["edgbaston-tuition", "Edgbaston Tuition Centre"]]

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] text-[#111]">
      <header className="mx-auto flex max-w-[1280px] items-center justify-between gap-5 px-6 py-6 sm:px-10">
        <Link href="/" aria-label="Sorted home" className="text-[40px] font-black leading-none tracking-[-0.045em]">Sorted<span className="text-[#cfe900]">.</span></Link>
        <nav aria-label="Primary" className="flex items-center gap-5 text-[14px] font-semibold sm:gap-8">
          <Link href="/websites" className="hidden underline-offset-8 hover:underline focus-visible:underline sm:block">Websites</Link>
          <Link href="/assistants" className="hidden underline-offset-8 hover:underline focus-visible:underline sm:block">AI assistants</Link>
          <a href="https://wa.me/447386468085" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#00271f] px-4 text-[13px] transition-colors hover:bg-[#00271f] hover:text-white"><Phone size={15} />Let&apos;s talk</a>
        </nav>
      </header>
      <section className="mx-auto max-w-[1280px] px-6 pb-12 pt-10 sm:px-10 sm:pb-16 sm:pt-16">
        <h1 className="text-[clamp(3.4rem,10.5vw,9.5rem)] font-black uppercase leading-[0.9] tracking-[-0.06em]">You&rsquo;re ready<br />for more.</h1>
        <p className="mt-6 inline-block bg-[#e4ff29] px-3 py-1 text-[clamp(1.8rem,5vw,4rem)] font-black leading-[1.05] tracking-[-0.045em] sm:mt-8 sm:px-5">Let&rsquo;s get your business there.</p>
        <p className="mt-8 max-w-[640px] text-[clamp(1.1rem,1.6vw,1.35rem)] font-semibold leading-snug">A better website. More customers. Less admin.<br className="hidden sm:block" /> <span className="font-normal text-black/65">We help you put the right things in place to move your business forward.</span></p>
      </section>
      <section aria-label="Find your next step" className="mx-auto grid max-w-[1280px] gap-5 px-6 sm:px-10 lg:grid-cols-3">
        {paths.map(({ Icon, ...path }) => (
          <Link key={path.number} href={path.href} data-track="cta_click" data-cta-text={path.cta} data-cta-location="service_switchboard" className={`group flex flex-col overflow-hidden rounded-[22px] p-7 outline-offset-4 transition-colors duration-200 hover:bg-[#e4ff29] focus-visible:outline-2 focus-visible:outline-black ${path.surface}`}>
            <div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-full bg-[#e4ff29] transition-colors group-hover:bg-black group-hover:text-white"><Icon size={23} strokeWidth={1.8} /></span><span className="text-[12px] font-semibold text-black/45">{path.number}</span></div>
            <h2 className="mt-7 text-[clamp(1.7rem,2.3vw,2.1rem)] font-black leading-[1.1] tracking-[-0.04em]">&ldquo;{path.title}&rdquo;</h2>
            <p className="mb-6 mt-5 text-[16px] leading-[1.6] text-black/70">{path.copy}</p>
            <div className="relative mt-auto h-[190px] overflow-hidden rounded-xl"><Image src={path.image} alt={path.alt} fill sizes="(min-width: 1024px) 350px, 90vw" className={path.position} /></div>
            <p className="mt-6 text-[12px] font-semibold text-black/55">{path.service}</p>
            <span className="mt-3 flex min-h-12 items-center justify-between gap-3 border-t border-black/15 pt-4 text-[15px] font-bold">{path.cta}<ArrowRight size={20} className="shrink-0 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </section>
      <section className="mx-auto max-w-[1280px] px-6 py-14 sm:px-10 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[22px] bg-black p-8 text-white sm:p-12 md:flex-row md:items-center">
          <div><h2 className="text-[clamp(2rem,4vw,3.25rem)] font-black leading-[1.05] tracking-[-0.045em]">What would you like to do next?</h2><p className="mt-3 max-w-[520px] text-[17px] leading-relaxed text-white/70">Tell us where you want to take your business. We&rsquo;ll help you work out where to start.</p></div>
          <a href="https://cal.com/sortmydigital/15min" data-track="cta_click" data-cta-text="Let’s talk it through" data-cta-location="conversation_strip" className="inline-flex min-h-14 shrink-0 items-center gap-4 rounded-full bg-[#e4ff29] px-8 text-[16px] font-black text-black transition-colors hover:bg-white">Let&apos;s talk it through<ArrowRight size={20} /></a>
        </div>
        <p className="mt-14 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-black/50">Already moving: businesses across the UK and beyond</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12">{logos.map(([slug, name]) => <Image key={slug} src={`/v4/logos/${slug}.webp`} alt={name} width={160} height={65} className={`h-14 w-32 object-contain grayscale ${slug === "gb-halesowen" ? "!w-16" : ""}`} />)}</div>
      </section>
      <p className="mx-auto max-w-[1280px] px-6 pb-10 text-center text-[clamp(1.1rem,2vw,1.5rem)] font-black tracking-[-0.03em] sm:px-10">A better website. More customers. Time to get on with business.</p>
      <SiteMapFooter experience="company" />
    </main>
  )
}
