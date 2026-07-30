import type { Metadata } from "next"
import Link from "next/link"
import localFont from "next/font/local"
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clock3,
  Frown,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Star,
  TrendingUp,
} from "lucide-react"
import { RoutineFinderButton } from "./_components/RoutineFinder"
import { BookDiscoveryButton } from "./_components/V2Primitives"

const v2Marker = localFont({
  src: "../../public/fonts/cc-ask-for-mercy.ttf",
  variable: "--font-v2-marker",
  display: "swap",
})

const v2Highlight = localFont({
  src: "../../public/fonts/Sans-Andreas-Bold-Demo.ttf",
  variable: "--font-v2-highlight",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sorted. Your business has gaps. We close them.",
  description:
    "Sorted finds the gaps that leak revenue, hurt trust, and leave money on the table, installs the systems that close them, and shows exactly how much you get back.",
}

const accent = "#dfff00"

const problems = [
  {
    title: "We lose customers.",
    icon: Frown,
    items: ["Missed calls", "Slow replies", "No follow up"],
    href: "/ops/problems/we-lose-customers",
  },
  {
    title: "We waste time.",
    icon: Clock3,
    items: ["Copying information", "Updating customers", "Repeating the same task"],
    href: "/ops/problems/we-waste-time",
  },
  {
    title: "We miss opportunities.",
    icon: TrendingUp,
    items: ["No review requests", "Old customers forgotten", "Quotes never chased"],
    href: "/ops/problems/we-miss-opportunities",
  },
]

const steps = [
  {
    title: "We find the gap.",
    copy: "We review your business to find where revenue, trust, or time is leaking out.",
    icon: Search,
  },
  {
    title: "We install the system.",
    copy: "We install a proven system that closes the gap. No unnecessary software. No disruption.",
    icon: SettingsIcon,
  },
  {
    title: "We measure what changed.",
    copy: "You will see exactly what improved and how much you got back.",
    icon: BarChart3,
  },
  {
    title: "We improve.",
    copy: "Businesses change. New gaps appear. We keep closing them.",
    icon: RefreshCw,
  },
]

const familiar = [
  {
    quote: "We only have 14 Google reviews.",
    label: "Review System",
    icon: Star,
    splash: "bg-[#e8ff1a]",
  },
  {
    quote: "We are terrible at following people up.",
    label: "Enquiry System",
    icon: MessageCircle,
    splash: "bg-[#ff9ad8]",
  },
  {
    quote: "Customers wait too long for a reply.",
    label: "Customer Response System",
    mark: "?",
    splash: "bg-[#ffe48a]",
  },
  {
    quote: "We have got thousands of old customers and do nothing with them.",
    label: "Reactivation System",
    icon: UsersIcon,
    splash: "bg-[#b86cff]",
  },
  {
    quote: "We keep missing calls.",
    label: "Reception System",
    icon: Phone,
    splash: "bg-[#a7e6ff]",
  },
]

const results = [
  { icon: Clock3, value: "412", label: "Hours returned this year", delta: "+31%" },
  { icon: MessageCircle, value: "1,146", label: "Manual checks removed", delta: "+24%" },
  { icon: CheckCircle2, value: "9", label: "Gaps found and closed", delta: "+20%" },
  { icon: Star, value: "£18.4k", label: "Estimated value created", delta: "+27%" },
]

const testimonials = [
  {
    quote:
      "I had a fun new project that combined research of very specific real estate properties with outreach initiatives. It was a very manual and time consuming process. Renaldo got the criteria and immediately dove into the project. I was amazed by the output. I had a fully functional research tool with some additional features that I didn't even think about. It allowed me to focus on the outreach and marketing as opposed to manually combing through listings. The tool is awesome and is exactly what I needed. Highly recommend!",
    name: "Kyle Lambert",
    business: "Real Estate Professional · Action Hero Marketing",
    image: "/v2/testimonials/kyle-lambert.jpeg",
  },
  {
    quote:
      "Renaldo introduced AI into our product development pipeline and fundamentally changed the business. In six years we had shipped nothing. Within twelve months of working with him, we had four fully deployed software products, each with its own revenue pipeline, and an entirely evolved B2B position in the market. That shift didn't happen incrementally. It happened because the underlying system changed.",
    name: "Keith Woods",
    business: "Senior Director of Product Experience · Bisk Education",
    image: "/v2/testimonials/keith-woods.jpeg",
  },
  {
    quote:
      "We're really pleased with what Sorted's done for us. The website looks miles better, it's easier for people to find what they're looking for, and booking a free intro is all done online now, which has taken a job off our hands. We've had loads of positive comments from members as well. I'd definitely recommend them.",
    name: "Stuart Gwilt",
    business: "Gracie Barra Halesowen, UK",
    image: "/v2/testimonials/stuart-gwilt.png",
  },
]

export default function SortedV2Page() {
  return (
    <main className={`${v2Marker.variable} ${v2Highlight.variable} min-h-screen overflow-hidden bg-[#fbfbfa] text-[#080808]`}>
      <Header />
      <Hero />
      <Problems />
      <Process />
      <SoundFamiliar />
      <ResultsBand />
      <Testimonials />
      <FinalCta />
      <Footer />
    </main>
  )
}

function Header() {
  return (
    <header className="mx-auto flex w-full max-w-[1220px] items-center justify-between px-5 pb-5 pt-6 sm:px-8 md:pb-6">
      <Link href="/ops" className="inline-flex min-h-11 items-center text-[27px] font-extrabold leading-none tracking-[-0.06em]">
        Sorted<span className="text-[#cfe900]">.</span>
      </Link>

      <nav className="hidden items-center gap-8 text-[12px] font-extrabold tracking-[-0.02em] md:flex lg:gap-10 lg:text-[13px]">
        <Link className="inline-flex min-h-11 items-center transition-opacity hover:opacity-60" href="/ops/how-it-works">
          How it works
        </Link>
        <Link className="inline-flex min-h-11 items-center transition-opacity hover:opacity-60" href="/ops/problems-we-solve">
          Problems we solve
        </Link>
        <Link className="inline-flex min-h-11 items-center transition-opacity hover:opacity-60" href="/ops/results">
          Results
        </Link>
        <Link className="inline-flex min-h-11 items-center transition-opacity hover:opacity-60" href="/ops/about">
          About
        </Link>
        <Link className="inline-flex min-h-11 items-center transition-opacity hover:opacity-60" href="/ops/pricing">
          Pricing
        </Link>
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

function Hero() {
  return (
    <section className="mx-auto grid max-w-[1220px] items-center gap-10 px-5 pb-6 sm:px-8 md:grid-cols-[1.18fr_0.82fr] md:gap-8 md:pb-7 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14">
      <div className="relative pt-3">
        <h1 className="max-w-[650px] text-[clamp(3.35rem,6.45vw,6.75rem)] font-black leading-[0.9] tracking-[-0.05em] lg:text-[clamp(4.1rem,8.2vw,6.75rem)]">
          Your business
          <br />
          has gaps.
        </h1>
        <div className="relative mt-4 max-w-[565px]">
          <p className="whitespace-nowrap [font-family:var(--font-v2-highlight)] text-[clamp(3rem,5.6vw,5.65rem)] font-normal leading-[0.86] tracking-[-0.02em] text-[#cee700] lg:text-[clamp(3.7rem,6.8vw,5.65rem)]">
            We close them.
          </p>
          <MarkerStroke className="-bottom-3 left-0 h-4 w-[96%]" />
        </div>

        <p className="mt-6 max-w-[420px] text-[13px] font-semibold leading-[1.55] tracking-[-0.025em] text-[#111] lg:mt-12 lg:text-[17px]">
          We find the gaps that leak revenue, hurt trust, and leave money on the table, install the systems that close them, and show you exactly how much you get back.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-9 lg:gap-4">
          <RoutineFinderButton label="Start the diagnostic" variant="primary" />
          <Link
            href="/ops/reviews/glow-dental"
            className="group inline-flex h-12 items-center justify-center gap-3 rounded-full px-4 text-[11px] font-extrabold lg:h-14 lg:gap-4 lg:text-[12px]"
          >
            See an example review
            <span className="grid size-9 place-items-center rounded-full border border-black/20 transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="size-3.5" strokeWidth={3} />
            </span>
          </Link>
        </div>

        <SketchArrow className="absolute -right-7 bottom-10 hidden h-14 w-[5.5rem] md:block lg:bottom-14 lg:h-20 lg:w-28" />
      </div>

      <CapacityCard />
    </section>
  )
}

function CapacityCard() {
  const metrics = [
    { icon: Clock3, value: "412", label: "Hours returned", delta: "+31%" },
    { icon: MessageCircle, value: "1,146", label: "Manual checks removed", delta: "+24%" },
    { icon: CheckCircle2, value: "9", label: "Routines replaced", delta: "+20%" },
    { icon: Star, value: "£18.4k", label: "Estimated value created", delta: "+27%" },
  ]

  return (
    <div className="relative mx-auto w-full max-w-[350px] rotate-[2.2deg] rounded-[20px] bg-[#f7efe3] p-3.5 shadow-[0_22px_55px_rgba(20,14,8,0.16)] ring-1 ring-black/5 md:mr-1 lg:max-w-[515px] lg:rounded-[22px] lg:p-7">
      <div className="relative mb-3 inline-block lg:mb-6">
        <p className="[font-family:var(--font-v2-marker)] text-[18px] font-normal uppercase leading-[1.08] tracking-[0] lg:text-[25px]">
          Here's what changed this year.
        </p>
        <MarkerStroke className="-bottom-2 left-0 h-2.5 w-[58%]" />
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="min-h-[82px] rounded-[10px] bg-white/80 px-3 py-2.5 shadow-[0_10px_24px_rgba(30,20,10,0.06)] ring-1 ring-black/[0.03] lg:min-h-[138px] lg:rounded-xl lg:px-5 lg:py-5"
            >
              <Icon className="mb-1 size-5 lg:mb-2 lg:size-8" strokeWidth={2.3} />
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[25px] font-black leading-none tracking-[-0.07em] lg:text-[42px]">{metric.value}</p>
                  <p className="mt-1 text-[7px] font-black uppercase leading-tight tracking-[-0.03em] lg:mt-2 lg:text-[10px]">{metric.label}</p>
                </div>
                {metric.delta ? <p className="pb-1 text-[9px] font-black text-[#00a64b] lg:text-[11px]">{metric.delta}</p> : null}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 rotate-[-0.5deg] rounded-[15px] bg-[#080808] px-5 py-3 text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] lg:mt-6 lg:rounded-[18px] lg:px-8 lg:py-5">
        <p className="[font-family:var(--font-v2-marker)] text-[18px] font-normal uppercase leading-[1.08] tracking-[0] lg:text-[26px]">
          More capacity. Better business.
        </p>
        <div className="mx-auto mt-3 grid w-[82%] grid-cols-2 gap-10">
          <span className="h-[3px] rounded-full bg-[#dfff00]" />
          <span className="h-[3px] rounded-full bg-[#dfff00]" />
        </div>
      </div>
    </div>
  )
}

function Problems() {
  return (
    <section id="problems" className="mx-auto max-w-[1220px] px-5 py-5 sm:px-8 md:py-6 lg:py-12">
      <SectionTitle title="You already know where the gaps are." />
      <p className="mt-3 max-w-[560px] text-[15px] font-semibold leading-[1.45] tracking-[-0.035em] lg:mt-4 lg:text-[19px]">
        These are the gaps that leak revenue, hurt trust, and leave money on the table, while your team stays busy with work that doesn't move the business forward.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3 lg:mt-10">
        {problems.map((problem) => {
          const Icon = problem.icon
          return (
            <Link
              key={problem.title}
              href={problem.href}
              className="grid min-h-[118px] grid-cols-[52px_1fr] gap-3 rounded-[14px] border border-black/10 bg-white px-4 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.035)] transition-transform hover:-translate-y-0.5 lg:min-h-[176px] lg:grid-cols-[78px_1fr] lg:gap-5 lg:px-6 lg:py-7"
            >
              <div className="grid size-[50px] place-items-center rounded-full bg-[#080808] text-white lg:size-[72px]">
                <Icon className="size-7 lg:size-10" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="[font-family:var(--font-v2-marker)] text-[15px] font-normal uppercase leading-[1.08] tracking-[0] lg:text-[21px]">
                  {problem.title}
                </h3>
                <ul className="mt-2.5 space-y-1.5 lg:mt-5 lg:space-y-2.5">
                  {problem.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[10px] font-semibold tracking-[-0.02em] lg:gap-3 lg:text-[14px]">
                      <Check className="size-4 text-[#cfe900]" strokeWidth={4} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function Process() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1220px] px-5 py-3 sm:px-8 md:py-4 lg:py-7">
      <SectionTitle title="Here's how we work." />
      <div className="mt-5 grid gap-8 md:grid-cols-4 md:gap-5 lg:mt-7">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <article key={step.title} className="relative text-center">
              <div className="mx-auto mb-4 grid size-7 place-items-center rounded-full bg-[#dfff00] text-[13px] font-black">
                {index + 1}
              </div>
              <Icon className="mx-auto size-10 lg:size-14" strokeWidth={2.4} />
              {index < steps.length - 1 ? <SketchArrow className="absolute right-[-20%] top-[50px] hidden h-10 w-20 md:block" /> : null}
              <h3 className="mx-auto mt-3 max-w-[170px] [font-family:var(--font-v2-marker)] text-[14px] font-normal uppercase leading-[1.08] tracking-[0] lg:mt-5 lg:max-w-[220px] lg:text-[19px]">
                {step.title}
              </h3>
              <p className="mx-auto mt-2 max-w-[155px] text-[10px] font-medium leading-[1.35] tracking-[-0.02em] lg:mt-3 lg:max-w-[190px] lg:text-[13px]">{step.copy}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function SoundFamiliar() {
  return (
    <section className="mx-auto max-w-[1220px] px-5 py-5 sm:px-8 md:py-6 lg:py-12">
      <SectionTitle title="Sound familiar?" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-5">
        {familiar.map((item) => {
          const Icon = item.icon
          return (
            <article
              key={item.label}
              className="flex min-h-[145px] flex-col items-center rounded-[14px] border border-black/10 bg-white px-3 py-3.5 text-center shadow-[0_14px_40px_rgba(0,0,0,0.035)] lg:min-h-[246px] lg:px-5 lg:py-6"
            >
              <div className={`relative grid size-[50px] place-items-center rounded-[42%_58%_55%_45%] ${item.splash} lg:size-[86px]`}>
                {Icon ? <Icon className="size-8 lg:size-14" strokeWidth={2.7} /> : <span className="text-[36px] font-black leading-none lg:text-[62px]">{item.mark}</span>}
              </div>
              <p className="mt-2.5 min-h-[38px] text-[9px] font-black leading-[1.12] tracking-[-0.04em] lg:mt-5 lg:min-h-[52px] lg:text-[14px]">"{item.quote}"</p>
              <Link href="/ops/problems/we-lose-customers" className="mt-auto inline-flex min-h-11 items-center gap-2 text-[10px] font-extrabold tracking-[-0.02em] lg:gap-3 lg:text-[12px]">
                {item.label}
                <ArrowRight className="size-3.5" strokeWidth={3} />
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ResultsBand() {
  return (
    <section id="results" className="mx-auto max-w-[1240px] px-4 py-2 sm:px-6 md:py-3 lg:py-5">
      <div className="grid overflow-hidden rounded-[18px] bg-[#070707] text-white shadow-[0_18px_55px_rgba(0,0,0,0.18)] md:grid-cols-[1.15fr_4fr]">
        <div className="px-7 py-6 sm:px-9 lg:px-12 lg:py-10">
          <SectionTitle title="Here's what changed." dark />
          <p className="mt-5 max-w-[170px] text-[12px] font-semibold leading-[1.35] text-white lg:mt-8 lg:max-w-[190px] lg:text-[15px]">
            Real businesses.
            <br />
            Real numbers.
            <br />
            Measured improvements.
          </p>
          <Link
            href="/ops/results-dashboard"
            className="mt-5 inline-flex min-h-11 items-center gap-4 rounded-xl bg-[#dfff00] px-4 text-[9px] font-black text-black transition-transform hover:-translate-y-0.5 lg:mt-8 lg:h-12 lg:gap-5 lg:px-6 lg:text-[12px]"
          >
            See an example dashboard
            <ArrowRight className="size-4" strokeWidth={3} />
          </Link>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-white/25 border-t border-white/25 md:grid-cols-4 md:border-l md:border-t-0">
          {results.map((result) => {
            const Icon = result.icon
            return (
              <div key={result.label} className="px-4 py-6 text-center lg:px-8 lg:py-10">
                <Icon className="mx-auto size-7 text-white lg:size-11" strokeWidth={2.1} />
                <p className="mt-4 text-[34px] font-black leading-none tracking-[-0.07em] text-[#dfff00] lg:mt-7 lg:text-[55px]">{result.value}</p>
                <p className="mx-auto mt-2.5 max-w-[92px] text-[7px] font-black uppercase leading-[1.25] lg:mt-4 lg:max-w-[120px] lg:text-[10px]">{result.label}</p>
                <p className="mt-2 text-[16px] font-black leading-none text-[#dfff00] lg:mt-3 lg:text-[21px]">{result.delta}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section id="about" className="relative mx-auto max-w-[1220px] px-5 py-5 sm:px-8 md:py-6 lg:py-12">
      <SectionTitle title="What business owners say." />
      <div className="mt-5 grid gap-5 md:grid-cols-3 lg:mt-7">
        {testimonials.map((testimonial) => (
          <article
            key={testimonial.name}
            className="min-h-[260px] rounded-[14px] border border-black/10 bg-white px-6 py-5 shadow-[0_14px_40px_rgba(0,0,0,0.035)] lg:px-9 lg:py-7"
          >
            <div className="mb-4 flex items-center justify-between gap-4 lg:mb-6">
              <img
                src={testimonial.image}
                alt={`${testimonial.name} portrait`}
                className="size-14 shrink-0 rounded-full border border-black/10 object-cover grayscale lg:size-16"
              />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-3.5 fill-black" strokeWidth={2.5} />
                ))}
              </div>
            </div>
            <p className="text-[11px] font-semibold leading-[1.3] tracking-[-0.03em] lg:text-[16px] lg:leading-[1.45]">"{testimonial.quote}"</p>
            <p className="mt-4 text-[10px] font-black lg:mt-7 lg:text-[12px]">{testimonial.name}</p>
            <p className="mt-1 text-[10px] font-medium lg:text-[12px]">{testimonial.business}</p>
          </article>
        ))}
      </div>
      <span className="absolute -left-2 bottom-10 hidden h-14 w-10 rotate-[-18deg] text-black lg:block">
        <SideMarks />
      </span>
      <span className="absolute -right-2 bottom-4 hidden h-14 w-10 rotate-[18deg] text-black lg:block">
        <SideMarks />
      </span>
    </section>
  )
}

function FinalCta() {
  return (
    <section id="review" className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 lg:pb-4">
      <div className="relative grid gap-8 overflow-hidden rounded-[28px] bg-[#e7ff1e] px-8 py-10 shadow-[0_18px_45px_rgba(170,190,0,0.16)] md:grid-cols-[0.88fr_1.12fr] md:items-center md:px-12 lg:px-16 lg:py-14">
        <div>
          <h2 className="[font-family:var(--font-v2-marker)] text-[clamp(3.4rem,6.2vw,6.9rem)] font-normal uppercase leading-[0.92] tracking-[0]">
            YOU ALREADY KNOW
            <br />
            WHERE THE GAPS ARE.
          </h2>
          <div className="mt-6 h-[4px] w-[340px] max-w-full rounded-full bg-[#ff73d2]" />
          <p className="mt-10 text-[clamp(1.6rem,2.25vw,2.4rem)] font-black leading-none tracking-[-0.055em]">
            Let's close them.
          </p>
        </div>

        <div className="relative z-[1] grid gap-7 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div>
            <p className="text-[clamp(1.45rem,2.3vw,2.15rem)] font-black leading-[1.08] tracking-[-0.055em]">
              Start with the diagnostic. Talk if that is easier.
            </p>
            <p className="mt-4 max-w-[340px] text-[14px] font-black leading-[1.45] tracking-[-0.03em]">
              Either way, the next step is the same: find the first gap worth closing.
            </p>
            <ul className="mt-6 grid gap-2 text-[12px] font-black sm:grid-cols-3 lg:grid-cols-1">
              {["No obligation", "No jargon", "A useful first answer"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-4 text-[#849800]" strokeWidth={4} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <RoutineFinderButton label="Start the diagnostic" variant="footer" />
            <BookDiscoveryButton className="h-16 w-full bg-white text-[15px]" />
          </div>
        </div>
        <Star className="absolute right-10 top-8 size-20 rotate-12 text-[#ff73d2]" strokeWidth={2.9} />
        <ArrowRight className="absolute bottom-10 left-[43%] hidden size-16 rotate-[-8deg] text-black md:block" strokeWidth={2.2} />
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#070707] px-5 py-6 text-white sm:px-8 lg:py-7">
      <div className="mx-auto grid max-w-[1220px] gap-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-8">
        <div>
          <p className="text-[27px] font-extrabold leading-none tracking-[-0.06em]">
            Sorted<span className="text-[#cfe900]">.</span>
          </p>
          <p className="mt-2 max-w-[170px] text-[12px] font-semibold leading-[1.35] text-white/80">
            We find the gaps that cost local businesses revenue and trust, and close them.
          </p>
          <p className="mt-5 text-[10px] font-medium text-white/55">© 2026 Sorted. All rights reserved.</p>
        </div>
        <FooterLinks links={[["How it works", "/ops/how-it-works"], ["Problems we solve", "/ops/problems-we-solve"], ["Results", "/ops/results"]]} />
        <FooterLinks links={[["About", "/ops/about"], ["Pricing", "/ops/pricing"], ["Example dashboard", "/ops/results-dashboard"]]} />
        <div>
          <p className="mb-4 text-[12px] font-black">Ready to start?</p>
          <RoutineFinderButton label="Start the diagnostic" variant="nav" className="mb-3 h-11 border border-[#dfff00] bg-[#dfff00] !text-[#070707] shadow-none" />
          <a
            href="https://wa.me/447386468085"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 px-5 text-[12px] font-black text-white"
          >
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

function SectionTitle({ title, dark = false }: { title: string; dark?: boolean }) {
  return (
    <div className="relative inline-block">
      <h2
        className={`[font-family:var(--font-v2-marker)] text-[clamp(1.65rem,2.45vw,2.85rem)] font-normal uppercase leading-[1.08] tracking-[0] lg:text-[clamp(1.9rem,3vw,2.85rem)] ${
          dark ? "text-white" : "text-black"
        }`}
      >
        {title}
      </h2>
      <MarkerStroke className="-bottom-2 left-0 h-2.5 w-[78%]" />
    </div>
  )
}

function LabelInput({ label, placeholder, textarea = false }: { label: string; placeholder: string; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="mb-3 block text-[15px] font-black tracking-[-0.03em]">{label}</span>
      {textarea ? (
        <textarea
          className="min-h-[145px] w-full resize-y rounded-xl border-0 bg-white px-6 py-5 text-[15px] font-semibold text-black outline-none ring-1 ring-black/5 transition-shadow placeholder:text-black/30 focus:ring-2 focus:ring-black"
          placeholder={placeholder}
        />
      ) : (
        <input
          className="h-16 w-full rounded-xl border-0 bg-white px-6 text-[15px] font-semibold text-black outline-none ring-1 ring-black/5 transition-shadow placeholder:text-black/30 focus:ring-2 focus:ring-black"
          placeholder={placeholder}
        />
      )}
    </label>
  )
}

function MarkerStroke({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`absolute rounded-full bg-[#dfff00] ${className}`} />
}

function SketchArrow({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 72" fill="none" aria-hidden>
      <path d="M8 40C30 39 54 36 79 30C90 27 101 25 112 27" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M97 14C106 18 113 24 120 33" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M98 52C106 45 113 39 121 33" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

function DoodleBurst() {
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

function SideMarks() {
  return (
    <svg viewBox="0 0 42 64" fill="none" className="h-full w-full" aria-hidden>
      <path d="M8 7L24 21" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M5 31H28" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M11 55L27 42" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

function SettingsIcon({ className = "", strokeWidth = 2.4 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden>
      <path
        d="M27 7H37L40 16C42 17 44 18 46 20L56 18L61 27L54 34C54 36 53 39 52 41L56 50L48 57L39 52C37 53 35 54 32 54L25 61L16 56L18 46C16 44 15 42 14 40L5 36V27L14 24C15 22 16 20 18 18L17 8L26 4L27 7Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <circle cx="32" cy="32" r="9" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  )
}

function UsersIcon({ className = "", strokeWidth = 2.7 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="9" fill="currentColor" />
      <circle cx="43" cy="22" r="8" fill="currentColor" />
      <path d="M8 53C10 42 17 36 25 36C33 36 39 42 41 53H8Z" fill="currentColor" />
      <path d="M34 52C35 43 40 38 47 38C53 38 58 43 60 52H34Z" fill="currentColor" />
    </svg>
  )
}
