import type { Metadata } from "next"
import { ArrowRight, CalendarDays, Clock3, FileText, Frown, MessageCircle, Phone, Star, TrendingUp, UserRound } from "lucide-react"
import { CtaBand, MarkerText, SectionTitle, V2Footer, V2Header, V2Page } from "../_components/V2Primitives"

export const metadata: Metadata = {
  title: "Problems We Solve | Sorted V2",
  description: "Browse the operational gaps Sorted closes, from missed calls and slow replies to forgotten customers and manual admin, and the systems we install to fix them.",
}

const categories = [
  {
    title: "We lose customers.",
    href: "/ops/problems/we-lose-customers",
    color: "#ff9ad8",
    icon: Frown,
    copy: "Leads slip through the cracks. Interest disappears.",
    items: ["Missed calls", "Slow replies", "No follow up", "Quotes not chased", "Treatment plans forgotten"],
  },
  {
    title: "We waste time.",
    href: "/ops/problems/we-waste-time",
    color: "#ffe48a",
    icon: Clock3,
    copy: "Manual admin eats your day and drains your team.",
    items: ["Copying information", "Updating customers", "Answering the same questions", "Moving data between systems", "Manual reporting"],
  },
  {
    title: "We miss opportunities.",
    href: "/ops/problems/we-miss-opportunities",
    color: "#b86cff",
    icon: TrendingUp,
    copy: "Inconsistent follow up and unseen customers cost growth.",
    items: ["No review requests", "Old customers ignored", "Referrals not requested", "Renewals forgotten", "Cross-sell missed"],
  },
  {
    title: "Nobody owns it.",
    href: "/ops/problems/nobody-owns-it",
    color: "#dfff00",
    icon: UserRound,
    copy: "Work falls between people. Nothing gets done.",
    items: ["Unclear responsibility", "Routines rely on memory", "No visibility of outcomes", "Multiple people, no owner", "Work depends on key people"],
  },
]

const systems = [
  { icon: Phone, quote: "We keep missing calls.", label: "Missed Call Response System", href: "/ops/problems/we-lose-customers" },
  { icon: MessageCircle, quote: "We are terrible at following up.", label: "Enquiry Follow-up System", href: "/ops/problems/we-lose-customers" },
  { icon: Star, quote: "We only have 14 Google reviews.", label: "Review Collection System", href: "/ops/problems/we-miss-opportunities" },
  { icon: UserRound, quote: "Our old customers are just sitting there.", label: "Reactivation System", href: "/ops/problems/we-miss-opportunities" },
  { icon: CalendarDays, quote: "Customers ask the same questions all the time.", label: "Customer Response System", href: "/ops/problems/we-waste-time" },
  { icon: FileText, quote: "Reports take hours to build.", label: "Reporting System", href: "/ops/problems/nobody-owns-it" },
]

const solveSteps = [
  ["We inspect.", "We look at where gaps appear in your day: repeated work, delays, forgotten handoffs."],
  ["We diagnose.", "We show where customers wait, teams lose time, and responsibility becomes unclear."],
  ["We design the system.", "We plan a simpler way for the work to happen consistently."],
  ["We install it.", "You see the system in action before anything becomes permanent."],
  ["We improve.", "We track time returned, work removed and the results created."],
]

export default function ProblemsPage() {
  return (
    <V2Page>
      <V2Header active="problems" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-10 pt-8 sm:px-8 md:grid-cols-[1fr_0.92fr] md:items-center">
        <div>
          <h1 className="max-w-[620px] text-[clamp(4rem,7.2vw,6.7rem)] font-black leading-[0.9] tracking-[-0.05em]">
            Every business has gaps.
            <br />
            <MarkerText className="block text-[clamp(3.2rem,6vw,5.55rem)]">These are the ones that cost you.</MarkerText>
          </h1>
          <p className="mt-7 max-w-[510px] text-[15px] font-semibold leading-[1.6] tracking-[-0.025em]">
            We focus on the operational gaps that slow your team down, frustrate customers, and make you miss opportunities, then install the systems that close them.
          </p>
        </div>
        <div className="rounded-[22px] bg-[#f7efe3] p-7 shadow-[0_22px_55px_rgba(20,14,8,0.13)]">
          <SectionTitle title="Gaps create hidden costs." />
          <div className="mt-8 grid grid-cols-3 divide-x divide-black/15 text-center">
            {[
              [Frown, "Customers get frustrated."],
              [Clock3, "Time gets wasted."],
              [TrendingUp, "Opportunities are missed."],
            ].map(([Icon, label]) => {
              const RealIcon = Icon as typeof Frown
              return (
                <div key={label as string} className="px-4">
                  <RealIcon className="mx-auto size-14" strokeWidth={2.1} />
                  <p className="mx-auto mt-4 max-w-[110px] [font-family:var(--font-v2-marker)] text-[1.45rem] leading-[1.05]">{label as string}</p>
                </div>
              )
            })}
          </div>
          <div className="mx-auto mt-8 max-w-[360px] rounded-[16px] bg-[#070707] px-8 py-4 text-center text-white">
            <p className="[font-family:var(--font-v2-marker)] text-[2rem]">WE CLOSE IT.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="mb-8 grid gap-4 md:grid-cols-[1fr_1fr] md:items-end">
          <SectionTitle title="Browse problems by category" />
          <p className="max-w-[340px] text-[13px] font-semibold leading-[1.5] text-black/65">Click any problem to see how we replace it with a simple, proven system.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <article key={category.title} className="rounded-[16px] border border-black/10 bg-white p-5 shadow-[0_14px_40px_rgba(0,0,0,0.035)]">
                <div className="flex items-center gap-4">
                  <span className="grid size-14 place-items-center rounded-full" style={{ backgroundColor: category.color }}>
                    <Icon className="size-8" strokeWidth={2.2} />
                  </span>
                  <h2 className="[font-family:var(--font-v2-marker)] text-[1.5rem] leading-none">{category.title}</h2>
                </div>
                <p className="mt-4 min-h-10 text-[13px] font-semibold leading-[1.45]">{category.copy}</p>
                <ul className="mt-5 divide-y divide-black/10 border-y border-black/10">
                  {category.items.map((item) => (
                    <li key={item}>
                      <a href={category.href} className="flex min-h-11 items-center justify-between py-3 text-[12px] font-semibold">
                        {item}
                        <ArrowRight className="size-4" strokeWidth={2.4} style={{ color: category.color }} />
                      </a>
                    </li>
                  ))}
                </ul>
                <a href={category.href} className="mt-4 inline-flex min-h-11 items-center gap-3 text-[12px] font-black">
                  See what's causing this <ArrowRight className="size-4" />
                </a>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="rounded-[18px] bg-[#f4f3ef] p-7">
          <div className="grid gap-8 md:grid-cols-[0.26fr_0.74fr] md:items-center">
            <SectionTitle title="How we close the gaps" />
            <div className="grid gap-5 md:grid-cols-5">
              {solveSteps.map(([step, copy], index) => (
                <div key={step} className="text-center">
                  <span className="mx-auto grid size-8 place-items-center rounded-full bg-[#dfff00] text-[13px] font-black">{index + 1}</span>
                  <p className="mt-4 [font-family:var(--font-v2-marker)] text-[1.25rem] leading-[1.05]">{step}</p>
                  <p className="mt-2 text-[11px] font-semibold leading-[1.35] text-black/60">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <SectionTitle title="Common problems we see" />
          <a href="/ops/problems-we-solve" className="hidden h-10 items-center gap-3 rounded-full border border-black/20 px-5 text-[12px] font-black md:inline-flex">
            See what is causing this <ArrowRight className="size-4" />
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-6">
          {systems.map((system) => {
            const Icon = system.icon
            return (
              <a key={system.label} href={system.href} className="rounded-[14px] border border-black/10 bg-white p-5 text-center shadow-[0_14px_40px_rgba(0,0,0,0.035)]">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e7ff1e]">
                  <Icon className="size-9" strokeWidth={2.1} />
                </span>
                <p className="mt-5 min-h-10 text-[12px] font-black leading-[1.15]">"{system.quote}"</p>
                <p className="mt-5 text-[11px] font-black">{system.label}</p>
              </a>
            )
          })}
        </div>
      </section>

      <CtaBand title="Let's find the gap that's costing you." copy="Tell us what is frustrating you most and we will take it from there." />
      <V2Footer />
    </V2Page>
  )
}
