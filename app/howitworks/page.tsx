import { MarketCopy } from "@/components/MarketPricing"
import type { Metadata } from "next"
import Image from "next/image"
import {
  Calendar,
  Check,
  Clock3,
  Code2,
  FileText,
  Headphones,
  Monitor,
  Pencil,
  Rocket,
  Search,
  ShieldCheck,
  Smartphone,
  Target,
} from "lucide-react"
import { SitesFooter, SitesHeader, SitesPage, Underline } from "../sites/_components/SitesPrimitives"
import { MockupButton } from "../sites/_components/SitesMockupModal"

export const metadata: Metadata = {
  title: "How we work | Sorted",
  description:
    "Websites built proof-first: we build your first page free, then agree the scope and price of the complete build before continuing.",
  alternates: {
    canonical: "/howitworks",
  },
  openGraph: {
    title: "How we work | Sorted",
    description:
      "Websites built proof-first: we build your first page free, then agree the scope and price of the complete build before continuing.",
    url: "/howitworks",
  },
}

export default function HowItWorksPage() {
  return (
    <SitesPage>
      <SitesHeader active="how" cta="website" />
      <HeroSection />
      <ProcessSection />
      <IncludesSection />
      <SpeedSection />
      <BottomCta />
      <SitesFooter />
    </SitesPage>
  )
}

function HeroSection() {
  return (
    <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-10 pt-10 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pt-14">
      <div>
        <h1 className="text-[clamp(3.4rem,7vw,7rem)] font-black leading-[0.92] tracking-[-0.05em]">
          <span className="block lg:whitespace-nowrap">See it first.</span>
          <span className="inline-block">
            Then you{" "}
            <span className="inline-block [font-family:var(--font-sites-fave-script)] text-[1.2em] font-normal leading-[0.7] tracking-[0] text-[#d4ea00]">decide</span>
          </span>
        </h1>
        <p className="mt-6 max-w-[470px] text-[17px] font-semibold leading-[1.55] tracking-[-0.02em] text-black/75">
          We build your first page free. Decide whether to take it further. If you want the complete build, we
          agree the scope and price before continuing.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <MockupButton />
          <ul className="space-y-1.5 text-[14px] font-semibold text-black/70">
            <li className="flex items-center gap-2.5">
              <span className="grid size-5 place-items-center rounded-full bg-[#dfff00]">
                <Check className="size-3" strokeWidth={3.5} />
              </span>
              Clear scope
            </li>
            <li className="flex items-center gap-2.5">
              <span className="grid size-5 place-items-center rounded-full bg-[#dfff00]">
                <Check className="size-3" strokeWidth={3.5} />
              </span>
              Your decision
            </li>
          </ul>
        </div>
      </div>

      <div className="relative aspect-[4/3] min-h-[200px] sm:min-h-[420px] lg:min-h-[400px]">
        <Image
          src="/sorted-sites/howitworks-v2/hero-showcase.webp"
          alt="Sorted website designs shown across desktop and mobile screens."
          fill
          priority
          sizes="(min-width: 1024px) 720px, 100vw"
          className="object-contain object-center"
        />
      </div>
    </section>
  )
}

type ProcessStep = {
  image: string
  imageAlt: string
  icon: typeof Pencil
  title: string
  description: string
  extra?: string
}

const processSteps: ProcessStep[] = [
  {
    image: "/sorted-sites/howitworks-v2/card-edgbaston-tuition-centre.webp",
    imageAlt: "Edgbaston Tuition Centre website first-page design.",
    icon: Pencil,
    title: "Tell us about the business",
    description: "Answer a few quick questions about what you do and what the website needs to do.",
    extra: "New site or redesign, we've got you.",
  },
  {
    image: "/sorted-sites/howitworks-v2/card-gracie-barra-jiu-jitsu.webp",
    imageAlt: "Gracie Barra Jiu-Jitsu website first-page design.",
    icon: FileText,
    title: "See your first page build",
    description: "We build a tailored first page — the design, the copy and the structure — and send it to you to review.",
    extra: "Free. No payment. No obligation.",
  },
  {
    image: "/sorted-sites/howitworks-v2/card-basketball-coach.webp",
    imageAlt: "School of Skill basketball coaching website first-page design.",
    icon: Calendar,
    title: "Approve the direction",
    description: "Happy with the first page? A {deposit} deposit starts the full build.",
    extra: "If not, walk away. It costs you nothing.",
  },
  {
    image: "/sorted-sites/howitworks-v2/card-kelly-electrics.webp",
    imageAlt: "Kelly Electrics website first-page design.",
    icon: Rocket,
    title: "We finish and launch",
    description: "We complete the site, connect everything and get it ready to launch.",
    extra: "The remaining {balance} is due when it is ready to go live.",
  },
]

function ProcessSection() {
  return (
    <section className="mx-auto max-w-[1220px] px-5 py-16 sm:px-8">
      <div>
        <h2 className="text-[clamp(2.4rem,5vw,3.6rem)] font-black leading-[0.98] tracking-[-0.045em]">
          <span className="inline-block">Your website launch.</span>
          <Underline className="mt-3 h-[5px] w-24" />
        </h2>
        <p className="mt-5 max-w-[560px] text-[15px] font-semibold leading-[1.55] text-black/62">
          Our established website journey: a free first-page build, then a fixed-price complete build when you approve it.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {processSteps.map((step, index) => {
          const Icon = step.icon
          return (
            <article
              key={step.title}
              className="relative flex flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white p-5 shadow-[0_14px_40px_rgba(0,0,0,0.045)]"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#dfff00] text-[11px] font-black text-black">
                  {index + 1}
                </span>
                <Icon className="size-8 text-black/70" strokeWidth={1.4} />
              </div>
              <h3 className="mt-3 text-[17px] font-black tracking-[-0.04em]">{step.title}</h3>
              <div className="mt-2 flex-1">
                <p className="text-[13px] font-semibold leading-[1.55] text-black/65"><MarketCopy>{step.description}</MarketCopy></p>
                {step.extra ? (
                  <p className="mt-3 text-[13px] font-semibold leading-[1.55] text-black/65"><MarketCopy>{step.extra}</MarketCopy></p>
                ) : null}
              </div>
            <div className="relative mt-5 aspect-[3/2] w-full overflow-hidden rounded-[14px] bg-[#070707]">
              <Image
                src={step.image}
                alt={step.imageAlt}
                fill
                sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
                className="object-cover object-top"
              />
            </div>
          </article>
          )
        })}

        {/* NOD badges between cards */}
      </div>
    </section>
  )
}

const includes = [
  [Search, "Strategy & structure", "A clear site structure and messaging built around how your customers actually choose."],
  [Target, "Built to earn enquiries", "Clear routes to call, message and book, with conversion-focused design throughout."],
  [Monitor, "Edit your own content", "Update everyday words, images, services and prices yourself."],
  [Smartphone, "Fully responsive & fast", "Looks great and loads quickly on every device."],
  [ShieldCheck, "Quality checked before launch", "We check the agreed pages, contact routes and responsive layouts before handoff."],
  [Headphones, "Support after launch", "Ongoing support beyond handoff is agreed separately, so you know exactly what is covered."],
] as const

function IncludesSection() {
  return (
    <section className="mx-auto max-w-[1220px] px-5 py-16 sm:px-8">
      <div>
        <h2 className="text-[clamp(2.4rem,5vw,3.6rem)] font-black leading-[0.98] tracking-[-0.045em]">
          <span className="inline-block">Built for today.</span>
          <br />
          <span className="inline-block">Ready for tomorrow.</span>
          <Underline className="mt-3 h-[5px] w-24" />
        </h2>
        <p className="mt-5 max-w-[560px] text-[15px] font-semibold leading-[1.55] text-black/62">
          What your website launch includes.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {includes.map(([Icon, title, copy]) => {
          const RealIcon = Icon as typeof Search
          return (
            <article key={title} className="rounded-[20px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.045)]">
              <span className="grid size-12 place-items-center rounded-full bg-[#dfff00]">
                <RealIcon className="size-6" strokeWidth={2.2} />
              </span>
              <h3 className="mt-5 text-[16px] font-black tracking-[-0.04em]">{title}</h3>
              <p className="mt-2 text-[13px] font-semibold leading-[1.55] text-black/65">{copy}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

const timeline = [
  {
    icon: Clock3,
    time: "First, your first page",
    title: "Free first-page build",
    description: "We build a tailored first page and send it for you to review.",
  },
  {
    icon: Code2,
    time: "Then, the build",
    title: "Site built and connected",
    description: "Once you approve the direction and pay the deposit, we build your complete website.",
  },
  {
    icon: Rocket,
    time: "Finally, launch",
    title: "Your site goes live",
    description: "The balance is due when the finished site is ready to launch.",
  },
] as const

function SpeedSection() {
  return (
    <section className="mx-auto max-w-[1220px] px-5 py-16 sm:px-8">
      <div>
        <h2 className="text-[clamp(2.4rem,5vw,3.6rem)] font-black leading-[0.98] tracking-[-0.045em]">
          <span className="inline-block">A short process.</span>
          <br />
          <span className="inline-block">Not a rushed website.</span>
          <Underline className="mt-3 h-[5px] w-24" />
        </h2>
        <p className="mt-5 max-w-[560px] text-[15px] font-semibold leading-[1.55] text-black/62">
          We confirm timing with you after reviewing the scope of your site — so the date we give you is one we can keep.
        </p>
      </div>

      <div className="mt-10 rounded-[20px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.045)] sm:p-8">
        <div className="hidden items-center gap-4 md:flex">
          {timeline.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex flex-1 items-center">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#dfff00]">
                  <Icon className="size-6" strokeWidth={2.2} />
                </span>
                {index < timeline.length - 1 ? (
                  <span className="mx-4 h-0 flex-1 border-t-2 border-dashed border-black/15" />
                ) : null}
              </div>
            )
          })}
        </div>
        <div className="mt-0 grid gap-6 md:mt-5 md:grid-cols-3 md:gap-8">
          {timeline.map((item) => (
            <div key={item.title} className="flex items-start gap-4 md:block md:px-6 md:first:pl-0 md:last:pr-0">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#dfff00] md:hidden">
                <item.icon className="size-6" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-[14px] font-black leading-[1.2] tracking-[-0.03em]">{item.time}</p>
                <h3 className="mt-1 text-[18px] font-black tracking-[-0.04em]">{item.title}</h3>
                <p className="mt-1 text-[13px] font-semibold leading-[1.55] text-black/65">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BottomCta() {
  return (
    <section className="bg-[#070707] px-5 py-14 text-white sm:px-8">
      <div className="mx-auto grid max-w-[1220px] items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <div className="relative aspect-[4/3] min-h-[200px] sm:min-h-[360px]">
          <Image
            src="/sorted-sites/howitworks-v2/footer-showcase.webp"
            alt="Sorted website designs shown across desktop and mobile screens."
            fill
            sizes="(min-width: 1024px) 600px, 100vw"
            className="object-contain object-center"
          />
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/45">Your website</p>
          <h2 className="mt-3 max-w-[420px] text-[clamp(2.4rem,5vw,3.8rem)] font-black leading-[0.98] tracking-[-0.045em]">
            Ready to see your new website?
          </h2>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-semibold">
            {["No payment required", "No pushy sales", "Just a great website, built for your business."].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-4 text-[#dfff00]" strokeWidth={3.5} />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-[420px] text-[15px] font-semibold leading-[1.55] text-white/75">
            We build your first page free. Decide whether to take it further. No payment. No obligation.
          </p>
          <div className="mt-7">
            <MockupButton variant="white" />
          </div>
        </div>
      </div>
    </section>
  )
}
