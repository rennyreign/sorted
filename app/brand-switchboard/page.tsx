import type { Metadata } from "next"
import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import localFont from "next/font/local"
import { ArrowRight, Check, Clock3, Phone, TrendingUp } from "lucide-react"

const marker = localFont({
  src: "../../public/fonts/cc-ask-for-mercy.ttf",
  variable: "--font-sorted-marker",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sorted Brand Switchboard",
  description:
    "Archived Sorted switchboard page retained for internal reference.",
  robots: {
    index: false,
    follow: false,
  },
}

const trustLogos = [
  { src: "/sorted/logos/graciebarralogo.png", alt: "Gracie Barra" },
  { src: "/sorted/logos/Bisk_Logo.jpg", alt: "Bisk" },
  { src: "/sorted/logos/adxengine.png", alt: "ADX Engine" },
  { src: "/sorted/logos/ArcherLogoEPS.svg", alt: "Archer" },
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
        <nav className="flex items-center gap-5 text-[12px] font-black sm:gap-8 sm:text-[14px]">
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
        <p className="mx-auto mt-7 max-w-[560px] text-[22px] font-semibold leading-[1.25] tracking-[-0.025em] text-black/62 sm:text-[30px]">
          Choose where you’d like to start.
        </p>
      </section>

      <section className="mx-auto grid max-w-[1120px] gap-5 px-5 sm:px-8 lg:grid-cols-2 lg:gap-7">
        <OfferCard
          href="/sites"
          theme="light"
          icon={<TrendingUp className="size-9" strokeWidth={2.8} />}
          title={
            <>
              Get a better
              <br />
              website.
            </>
          }
          lines={["Show what you do clearly.", "Build trust faster.", "Turn visitors into enquiries."]}
          cta="Explore Sorted Sites"
        >
          <div className="absolute -bottom-5 left-[18%] z-0 w-[96%] rotate-[-8deg] overflow-hidden rounded-[10px] border border-black/10 bg-white shadow-[0_28px_70px_rgba(24,18,10,0.15)] sm:bottom-4 sm:left-[22%] sm:w-[86%]">
            <div className="grid aspect-[1.62] grid-cols-[0.9fr_1fr] gap-5 p-5">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.22em]">Lumen</p>
                <p className="mt-10 font-serif text-[24px] leading-[1.05] tracking-[-0.03em] text-black/88">
                  Built for
                  <br />
                  what matters.
                </p>
                <span className="mt-5 inline-flex h-8 items-center gap-2 rounded-full bg-black px-4 text-[9px] font-black text-white">
                  View the work <ArrowRight className="size-3" />
                </span>
              </div>
              <div className="relative overflow-hidden rounded-[4px] bg-[#eee7db]">
                <Image src="/sorted-sites/aboutHero.png" alt="" fill sizes="260px" className="object-cover opacity-80" />
              </div>
            </div>
          </div>
        </OfferCard>

        <OfferCard
          href="/ops"
          theme="dark"
          icon={<Clock3 className="size-10" strokeWidth={2.6} />}
          title={
            <>
              Run your
              <br />
              business better.
            </>
          }
          lines={["Remove repetitive work.", "Recover time.", "Improve operations."]}
          cta="Explore Sorted Ops"
        >
          <div className="absolute -bottom-8 left-[8%] z-0 w-[94%] rotate-[-9deg] overflow-hidden rounded-[18px] border border-white/15 bg-[#0d0d0d] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.42)] sm:bottom-4 sm:left-[13%] sm:w-[86%]">
            <div className="mb-7 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/80">Hours recovered</p>
                <p className="mt-3 text-[52px] font-black leading-none tracking-[-0.08em] text-white">412</p>
              </div>
              <p className="mt-10 text-[16px] font-black text-[#dfff00]">+31%</p>
            </div>
            <div className="relative h-32 border-t border-white/10">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:42px_32px]" />
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
            <p className="mt-10 text-[12px] font-semibold text-white/45">© 2025 Sorted. All rights reserved.</p>
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
  lines,
  cta,
  children,
}: {
  href: string
  theme: "light" | "dark"
  icon: ReactNode
  title: ReactNode
  lines: string[]
  cta: string
  children: ReactNode
}) {
  const dark = theme === "dark"

  return (
    <Link href={href} className="group block rounded-[20px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dfff00]/70">
      <article
        className={`relative isolate min-h-[660px] overflow-hidden rounded-[20px] p-8 shadow-[0_20px_60px_rgba(18,14,10,0.08)] transition-[background-color,color,box-shadow] duration-500 ease-out group-hover:bg-[#dfff00] group-hover:text-black group-hover:shadow-[0_28px_80px_rgba(19,24,0,0.22)] sm:min-h-[735px] sm:p-11 ${
        dark ? "bg-[#070707] text-white" : "bg-[#f7f1e8] text-black"
      }`}
      >
        <div className="relative z-10">
          <span className="grid size-20 place-items-center rounded-full bg-[#dfff00] text-black transition-colors duration-500 group-hover:bg-[#070707] group-hover:text-[#dfff00]">{icon}</span>
          <h2 className="mt-9 text-[42px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[54px]">{title}</h2>
          <span className="mt-6 block h-[5px] w-32 rounded-full bg-[#dfff00] transition-colors duration-500 group-hover:bg-[#070707]" />
          <div className={`mt-8 space-y-2 text-[21px] font-semibold leading-[1.24] tracking-[-0.02em] transition-colors duration-500 group-hover:text-black/78 ${dark ? "text-white/86" : "text-black/78"}`}>
            {lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
        <div>
          {children}
        </div>
        <span
          className={`absolute inset-x-7 bottom-7 z-20 inline-flex h-16 items-center justify-center gap-5 rounded-full px-6 text-[15px] font-black shadow-[0_16px_38px_rgba(0,0,0,0.16)] transition-[background-color,color] duration-500 ease-out group-hover:bg-[#070707] group-hover:text-[#dfff00] sm:inset-x-9 sm:bottom-9 sm:h-[72px] sm:text-[18px] ${
            dark ? "bg-white text-black" : "bg-[#070707] text-white"
          }`}
        >
          {cta} <ArrowRight className="size-5" strokeWidth={3} />
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
