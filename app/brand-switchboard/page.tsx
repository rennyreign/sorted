import type { Metadata } from "next"
import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import localFont from "next/font/local"
import { ArrowRight, Check, Clock3, Layers, Phone } from "lucide-react"

const marker = localFont({
  src: "../../public/fonts/cc-ask-for-mercy.ttf",
  variable: "--font-sorted-marker",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sorted | Business modernisation company",
  description:
    "Sorted is a business modernisation company. Operations and campaigns — start with whichever your business needs most.",
  alternates: {
    canonical: "/",
  },
}

const trustLogos = [
  { src: "/sorted/logos/graciebarralogo.png", alt: "Gracie Barra" },
  { src: "/sorted/logos/Bisk_Logo.jpg", alt: "Bisk" },
  { src: "/sorted/logos/adxengine.png", alt: "ADX Engine" },
  { src: "/sorted/logos/ArcherLogoEPS.svg", alt: "Archer" },
]

const campaignAngles = [
  { key: "A", name: "Price", dot: "bg-[#070707]" },
  { key: "B", name: "Trust", dot: "bg-[#dfff00]" },
  { key: "C", name: "Speed", dot: "bg-black/20" },
]

export default function Home() {
  return (
    <main className={`${marker.variable} min-h-screen overflow-hidden bg-[#fbfbfa] text-[#070707]`}>
      {/* Hidden form for Netlify build-time detection */}
      <form name="mockup-request" netlify-honeypot="bot-field" data-netlify="true" hidden>
        <input type="hidden" name="form-name" value="mockup-request" />
        <input name="bot-field" />
        <input name="email" type="email" />
        <input name="websiteUrl" type="text" />
        <textarea name="businessDescription" />
      </form>

      <header className="mx-auto flex w-full max-w-[1220px] items-center justify-between px-5 pb-8 pt-6 sm:px-8 lg:pb-14">
        <Link href="/" className="inline-flex min-h-11 items-center text-[33px] font-black leading-none tracking-[-0.045em] sm:text-[40px]">
          Sorted<span className="text-[#cfe900]">.</span>
        </Link>
        <nav className="flex items-center gap-3 text-[12px] font-black sm:gap-5 sm:text-[14px]">
          <Link className="hidden min-h-11 items-center transition-opacity hover:opacity-60 sm:inline-flex" href="/ops/infrastructure">
            Sorted Ops
          </Link>
          <Link className="hidden min-h-11 items-center transition-opacity hover:opacity-60 sm:inline-flex" href="/agencies">
            Sorted Campaigns
          </Link>
          <a
            href="https://wa.me/447386468085"
            className="inline-flex h-11 items-center gap-3 rounded-full bg-[#070707] px-5 text-[12px] font-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.16)] sm:h-14 sm:px-7 sm:text-[15px]"
          >
            <Phone className="size-4 sm:size-5" strokeWidth={2.8} />
            Talk to us <ArrowRight className="size-4 sm:size-5" strokeWidth={3} />
          </a>
        </nav>
      </header>

      <section className="mx-auto max-w-[1220px] px-5 pb-10 text-center sm:px-8 lg:pb-14">
        <h1 className="mx-auto max-w-[790px] text-[clamp(4rem,8.8vw,7.35rem)] font-black leading-[0.9] tracking-[-0.045em]">
          We modernise businesses.
        </h1>
        <span className="mx-auto mt-3 block h-[7px] w-[78%] max-w-[560px] rounded-full bg-[#dfff00]" />
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-5 px-5 pt-2 sm:px-8 lg:grid-cols-2 lg:gap-6">
        <OfferCard
          href="/ops/infrastructure"
          theme="dark"
          icon={<Clock3 className="size-7" strokeWidth={2.6} />}
          title={
            <>
              Sort your
              <br />
              operations.
            </>
          }
          description="AI-powered workflows for businesses without the time or expertise to build them."
          cta="Explore Sorted Ops"
        >
          <div className="absolute bottom-0 left-[4%] w-[102%] rotate-[-8deg] overflow-hidden rounded-[16px] border border-white/15 bg-[#0d0d0d] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/80">Hours recovered</p>
                <p className="mt-2 text-[36px] font-black leading-none tracking-[-0.08em] text-white">412</p>
              </div>
              <p className="mt-7 text-[13px] font-black text-[#dfff00]">+31%</p>
            </div>
            <div className="relative h-24 border-t border-white/10">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:34px_24px]" />
              <svg viewBox="0 0 360 130" className="absolute inset-0 h-full w-full" aria-hidden>
                <path d="M8 100C42 28 79 97 112 63C146 29 175 95 210 54C245 13 281 101 352 42" fill="none" stroke="#dfff00" strokeWidth="5" strokeLinecap="round" />
                <path d="M8 100C42 28 79 97 112 63C146 29 175 95 210 54C245 13 281 101 352 42V130H8Z" fill="url(#opsGlow)" opacity="0.22" />
                <defs>
                  <linearGradient id="opsGlow" x1="180" x2="180" y1="40" y2="130" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#dfff00" />
                    <stop offset="1" stopColor="#dfff00" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </OfferCard>

        <OfferCard
          href="/agencies"
          theme="campaign"
          icon={<Layers className="size-7" strokeWidth={2.6} />}
          title={
            <>
              Improve your
              <br />
              campaigns.
            </>
          }
          description="More creative angles and testing capacity for performance marketing teams."
          cta="Explore Sorted Campaigns"
        >
          <div className="absolute bottom-0 left-[6%] w-[100%] rotate-[-5deg] rounded-[14px] border border-black/10 bg-white p-3 shadow-[0_24px_60px_rgba(24,18,10,0.15)]">
            <div className="grid grid-cols-[0.8fr_1fr] gap-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-[#eee7db]">
                <Image
                  src="/workspace/baker-berte/ad-01-feed-1x1.webp"
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover object-left"
                />
              </div>
              <div className="flex flex-col justify-center gap-1.5">
                {campaignAngles.map((angle) => (
                  <div key={angle.key} className="flex items-center gap-1.5 rounded-[5px] bg-[#f4f4f1] px-1.5 py-1">
                    <span className="grid size-3.5 place-items-center rounded-[3px] bg-[#070707] text-[6px] font-black text-white">
                      {angle.key}
                    </span>
                    <span className="text-[8.5px] font-black leading-none">{angle.name}</span>
                    <span className={`ml-auto size-1.5 rounded-full ${angle.dot}`} />
                  </div>
                ))}
                <p className="mt-1 text-[7px] font-black uppercase tracking-[0.12em] text-black/35">3 angles · 9 ads</p>
              </div>
            </div>
          </div>
        </OfferCard>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-12 text-center sm:px-8 lg:py-16">
        <p className="text-[11px] font-black uppercase tracking-[0.08em] text-black/42">Trusted by businesses to get results</p>
        <div className="mx-auto mt-7 grid max-w-[820px] grid-cols-2 items-center justify-items-center gap-x-10 gap-y-6 sm:grid-cols-4 lg:gap-x-16">
          {trustLogos.map((logo) => (
            <div key={logo.src} className="relative h-9 w-[132px] opacity-[0.32] grayscale sm:h-10 sm:w-[150px]">
              <Image src={logo.src} alt={logo.alt} fill sizes="150px" className="object-contain" />
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#070707] px-5 py-9 text-white sm:px-8">
        <div className="mx-auto grid max-w-[1220px] gap-8 md:grid-cols-[1.25fr_repeat(3,1fr)] md:items-start">
          <div>
            <span className="block h-[4px] w-10 rounded-full bg-[#dfff00]" />
            <p className="mt-7 text-[28px] font-semibold leading-[1.12] tracking-[-0.025em]">
              Better systems.
              <br />
              Better results.
            </p>
            <p className="mt-10 text-[12px] font-semibold text-white/45">© 2026 Sorted. All rights reserved.</p>
            <p className="mt-2 text-[10px] font-medium leading-[1.5] text-white/35">
              Sorted is a trading name of ADX Engine Ltd · Registered in England &amp; Wales · Company number 17327041
            </p>
          </div>
          <FooterPoint title="No jargon." copy="Clear and focused on what matters." />
          <FooterPoint title="No lock-in." copy="You own your website and your systems." />
          <FooterPoint title="No wasted time." copy="We move fast and get things done." />
        </div>
      </footer>
    </main>
  )
}

function OfferCard({
  href,
  theme,
  icon,
  title,
  description,
  cta,
  children,
}: {
  href: string
  theme: "light" | "dark" | "campaign"
  icon: ReactNode
  title: ReactNode
  description: string
  cta: string
  children: ReactNode
}) {
  const surface =
    theme === "dark"
      ? "bg-[#070707] text-white"
      : theme === "campaign"
        ? "bg-[#eff4d9] text-black"
        : "bg-[#f7f1e8] text-black"

  return (
    <Link href={href} className="group block rounded-[20px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfff00]/70">
      <article
        className={`relative isolate flex min-h-[620px] flex-col overflow-hidden rounded-[20px] px-7 pt-7 pb-[92px] shadow-[0_20px_60px_rgba(18,14,10,0.08)] transition-[background-color,color,box-shadow] duration-500 ease-out group-hover:bg-[#dfff00] group-hover:text-black group-hover:shadow-[0_28px_80px_rgba(19,24,0,0.22)] sm:px-8 sm:pt-8 sm:pb-[96px] ${surface}`}
      >
        <div className="relative z-10">
          <span className="grid size-16 place-items-center rounded-full bg-[#dfff00] text-black transition-colors duration-500 group-hover:bg-[#070707] group-hover:text-[#dfff00]">{icon}</span>
          <h2 className="mt-7 text-[clamp(2rem,3.2vw,2.45rem)] font-black leading-[1.0] tracking-[-0.035em]">{title}</h2>
          <span className="mt-5 block h-[5px] w-24 rounded-full bg-[#dfff00] transition-colors duration-500 group-hover:bg-[#070707]" />
          <p
            className={`mt-6 max-w-[30ch] text-[16px] font-semibold leading-[1.4] tracking-[-0.01em] transition-colors duration-500 group-hover:text-black/78 ${
              theme === "dark" ? "text-white/80" : "text-black/72"
            }`}
          >
            {description}
          </p>
        </div>
        <div className="relative z-0 mt-auto min-h-[190px] w-full max-w-[360px] self-center">{children}</div>
        <span
          className={`absolute inset-x-6 bottom-6 z-20 inline-flex h-14 items-center justify-center gap-4 rounded-full px-5 text-[13.5px] font-black shadow-[0_16px_38px_rgba(0,0,0,0.16)] transition-[background-color,color] duration-500 ease-out group-hover:bg-[#070707] group-hover:text-[#dfff00] ${
            theme === "dark" ? "bg-white text-black" : "bg-[#070707] text-white"
          }`}
        >
          {cta} <ArrowRight className="size-4" strokeWidth={3} />
        </span>
      </article>
    </Link>
  )
}

function FooterPoint({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="border-white/10 md:border-l md:pl-9">
      <p className="flex items-center gap-4 text-[15px] font-black">
        <Check className="size-7 rounded-full border-2 border-[#dfff00] p-1 text-[#dfff00]" strokeWidth={3} />
        {title}
      </p>
      <p className="mt-4 max-w-[210px] text-[15px] font-semibold leading-[1.45] text-white/72">{copy}</p>
    </div>
  )
}
