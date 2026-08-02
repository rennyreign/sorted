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
import { SitesFooter, SitesHeader, SitesPage, Underline } from "../_components/SitesPrimitives"
import { MockupButton } from "../_components/SitesMockupModal"

export const metadata: Metadata = {
  title: "How it works | Sorted",
  description:
    "See your new website before you spend a penny. Sorted designs your site first, then builds it once you approve the mockup.",
  alternates: {
    canonical: "/howitworks",
  },
}

export default function HowItWorksPage() {
  return (
    <SitesPage>
      <SitesHeader active="how" />
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
    <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-10 pt-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pt-14">
      <div>
        <h1 className="text-[clamp(3.4rem,7vw,7rem)] font-black leading-[0.92] tracking-[-0.05em]">
          See it first
          <br />
          <span className="inline-block">
            Then you{" "}
            <span className="[font-family:var(--font-sites-highlight)] text-[#d4ea00]">decide</span>
          </span>
        </h1>
        <p className="mt-6 max-w-[470px] text-[17px] font-semibold leading-[1.55] tracking-[-0.02em] text-black/75">
          The Nod Mockup System™ gives you a complete preview of your new website before you spend. Approve each stage.
          You're in control.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <MockupButton />
          <ul className="space-y-1.5 text-[14px] font-semibold text-black/70">
            <li className="flex items-center gap-2.5">
              <span className="grid size-5 place-items-center rounded-full bg-[#dfff00]">
                <Check className="size-3" strokeWidth={3.5} />
              </span>
              No card details
            </li>
            <li className="flex items-center gap-2.5">
              <span className="grid size-5 place-items-center rounded-full bg-[#dfff00]">
                <Check className="size-3" strokeWidth={3.5} />
              </span>
              No obligation
            </li>
          </ul>
        </div>
      </div>

      <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-[520px]">
        <Image
          src="/sorted-sites/howitworks/hw-laptop.png"
          alt="Sorted website mockup preview on a laptop screen."
          fill
          priority
          sizes="(min-width: 1024px) 720px, 100vw"
          className="object-contain object-center"
        />
        <div className="absolute -bottom-6 -right-2 z-10 aspect-[2/3] w-[40%] sm:-bottom-8 sm:right-0 lg:-bottom-10 lg:-right-4 lg:w-[36%]">
          <Image
            src="/sorted-sites/howitworks/hw-mobile.png"
            alt="Sorted website mockup preview on a mobile phone."
            fill
            priority
            sizes="(min-width: 1024px) 280px, 180px"
            className="object-contain object-center drop-shadow-[0_22px_55px_rgba(0,0,0,0.18)]"
          />
        </div>
      </div>
    </section>
  )
}

type ProcessStep = {
  image: string
  icon: typeof Pencil
  title: string
  description: string
  extra?: string
  nod?: string
}

const processSteps: ProcessStep[] = [
  {
    image: "/sorted-sites/howitworks/hw-design1.png",
    icon: Pencil,
    title: "We create your mockup",
    description: "We design your website, write the copy, define the angle and build your brand (or refresh it).",
    extra: "New site or redesign, we've got you.",
  },
  {
    image: "/sorted-sites/howitworks/hw-design2.png",
    icon: FileText,
    title: "You review and nod",
    description: "We send you your mockup the same day or within 24hrs.",
    extra: "You review it and give us your nod.",
    nod: "NOD 1",
  },
  {
    image: "/sorted-sites/howitworks/hw-design3.png",
    icon: Calendar,
    title: "We build your site",
    description: "Once you nod, we build your fully functional, SEO, AEO & XEO optimised website.",
    extra: "Delivered within 48-72hrs.",
    nod: "NOD 2",
  },
  {
    image: "/sorted-sites/howitworks/hw-design4.png",
    icon: Rocket,
    title: "You launch and grow",
    description: "Your site goes live, ready to attract, convert and grow your business.",
    extra: "We're here for updates, support and growth.",
    nod: "NOD 3",
  },
]

function ProcessSection() {
  return (
    <section className="mx-auto max-w-[1220px] px-5 py-16 sm:px-8">
      <div>
        <h2 className="text-[clamp(2.4rem,5vw,3.6rem)] font-black leading-[0.98] tracking-[-0.045em]">
          <span className="inline-block whitespace-nowrap">A simple process.</span>
          <br />
          <span className="inline-block whitespace-nowrap">Total clarity.</span>
          <Underline className="mt-3 h-[5px] w-24" />
        </h2>
      </div>

      <div className="relative mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {processSteps.map((step, index) => {
          const Icon = step.icon
          return (
            <article
              key={step.title}
              className="relative flex flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white p-5 shadow-[0_14px_40px_rgba(0,0,0,0.045)]"
            >
              <div className="flex flex-col items-start gap-4">
                <span className="grid size-9 place-items-center rounded-full bg-[#dfff00] text-[12px] font-black text-black">
                  {index + 1}
                </span>
                <Icon className="size-9 text-black/70" strokeWidth={1.4} />
              </div>
              <h3 className="mt-4 text-[17px] font-black tracking-[-0.04em]">{step.title}</h3>
              <div className="mt-2 flex-1">
                <p className="text-[13px] font-semibold leading-[1.55] text-black/65">{step.description}</p>
                {step.extra ? (
                  <p className="mt-3 text-[13px] font-semibold leading-[1.55] text-black/65">{step.extra}</p>
                ) : null}
              </div>
            <div className="relative mt-5 aspect-[3/2] w-full overflow-hidden rounded-[14px] bg-[#070707]">
              <Image
                src={step.image}
                alt={`${step.title} — step ${index + 1} of the Sorted process.`}
                fill
                sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
                className="object-contain object-center"
              />
            </div>
          </article>
          )
        })}

        {/* NOD badges between cards */}
        <span className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:left-[25%] lg:block">
          <NodBadge label="NOD 1" />
        </span>
        <span className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:left-[50%] lg:block">
          <NodBadge label="NOD 2" />
        </span>
        <span className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:left-[75%] lg:block">
          <NodBadge label="NOD 3" />
        </span>
      </div>
    </section>
  )
}

function NodBadge({ label }: { label: string }) {
  return (
    <span className="flex size-14 flex-col items-center justify-center rounded-full bg-[#070707] text-center text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <span className="text-[9px] font-black uppercase leading-none tracking-[0.05em]">NOD</span>
      <span className="text-[16px] font-black leading-none tracking-[-0.04em]">{label.replace("NOD ", "")}</span>
    </span>
  )
}

const includes = [
  [Search, "Modern SEO, AEO & XEO Optimised", "Built to rank in Google, AI search and across emerging platforms."],
  [Target, "Built to Drive New Customers", "Strategic structure, clear messaging and conversion-focused design."],
  [Monitor, "Robust CMS", "Easy-to-use content management so you can update your site with ease."],
  [Smartphone, "Fully Responsive & Fast", "Looks great on every device. Lightning fast for better rankings and user experience."],
  [ShieldCheck, "Secure & Reliable", "SSL, backups and best-practice security as standard."],
  [Headphones, "Ongoing Support & Updates", "We keep your site fresh, secure and performing at its best."],
] as const

function IncludesSection() {
  return (
    <section className="mx-auto max-w-[1220px] px-5 py-16 sm:px-8">
      <div>
        <h2 className="text-[clamp(2.4rem,5vw,3.6rem)] font-black leading-[0.98] tracking-[-0.045em]">
          <span className="inline-block whitespace-nowrap">Built for today.</span>
          <br />
          <span className="inline-block whitespace-nowrap">Ready for tomorrow.</span>
          <Underline className="mt-3 h-[5px] w-24" />
        </h2>
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
    time: "Same day or within 24hrs",
    title: "Mockup delivered",
    description: "You'll receive your custom mockup to review.",
  },
  {
    icon: Code2,
    time: "48-72hrs after nod",
    title: "Site built and connected",
    description: "We build your complete, fully functional website.",
  },
  {
    icon: Rocket,
    time: "Launch & grow",
    title: "Your site goes live",
    description: "Go live and start turning your website into customers.",
  },
] as const

function SpeedSection() {
  return (
    <section className="mx-auto max-w-[1220px] px-5 py-16 sm:px-8">
      <div>
        <h2 className="text-[clamp(2.4rem,5vw,3.6rem)] font-black leading-[0.98] tracking-[-0.045em]">
          <span className="inline-block whitespace-nowrap">See it today.</span>
          <br />
          <span className="inline-block whitespace-nowrap">Live in days.</span>
          <Underline className="mt-3 h-[5px] w-24" />
        </h2>
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
        <div className="relative min-h-[280px] sm:min-h-[360px]">
          <Image
            src="/sorted-sites/howitworks/hw-laptop.png"
            alt="Sorted website mockup preview on a laptop."
            fill
            sizes="(min-width: 1024px) 600px, 100vw"
            className="object-contain object-center"
          />
          <div className="absolute -bottom-4 -right-2 z-10 aspect-[2/3] w-[32%] sm:right-8 lg:-right-4">
            <Image
              src="/sorted-sites/howitworks/hw-mobile.png"
              alt="Sorted website mockup preview on a mobile phone."
              fill
              sizes="(min-width: 1024px) 200px, 140px"
              className="object-contain object-center drop-shadow-[0_22px_55px_rgba(0,0,0,0.18)]"
            />
          </div>
        </div>

        <div>
          <h2 className="max-w-[420px] text-[clamp(2.4rem,5vw,3.8rem)] font-black leading-[0.98] tracking-[-0.045em]">
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
            Get your free mockup in 24 hours. No obligation. No credit card.
          </p>
          <div className="mt-7">
            <MockupButton variant="white" />
          </div>
        </div>
      </div>
    </section>
  )
}
