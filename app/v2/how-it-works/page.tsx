import type { Metadata } from "next"
import { BarChart3, Lightbulb, MonitorPlay, Rocket, Search } from "lucide-react"
import { CheckList, CtaBand, MarkerText, MetricBand, SectionTitle, V2Footer, V2Header, V2Page } from "../_components/V2Primitives"
import { RoutineFinderButton } from "../_components/RoutineFinder"

export const metadata: Metadata = {
  title: "How It Works | Sorted V2",
  description: "How Sorted reviews one repetitive routine, prototypes a replacement, builds it properly, and measures what changed.",
}

const process = [
  {
    icon: Search,
    title: "We review the routine.",
    copy: "You show us how the work currently happens. We map the process, identify friction, delays, and the hidden cost.",
  },
  {
    icon: Lightbulb,
    title: "We design the replacement.",
    copy: "We design a better way that is simpler for your team and better for your customers. No unnecessary tools.",
  },
  {
    icon: MonitorPlay,
    title: "We build a working prototype.",
    copy: "You see the solution in action before you commit. We test it with real scenarios to prove it works.",
  },
  {
    icon: Rocket,
    title: "We implement and hand over.",
    copy: "We configure everything, integrate with your systems, train your team, and launch the system.",
  },
  {
    icon: BarChart3,
    title: "We measure what changed.",
    copy: "You get a clear dashboard showing the capacity returned, tasks removed, and results achieved.",
  },
]

export default function HowItWorksPage() {
  return (
    <V2Page>
      <V2Header active="how" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-10 pt-8 sm:px-8 md:grid-cols-[1fr_0.95fr] md:items-center">
        <div className="min-w-0">
          <h1 className="max-w-full text-[clamp(3.25rem,13vw,6.8rem)] font-black leading-[0.9] tracking-[-0.04em] sm:max-w-[620px]">
            One routine.
            <br />
            One working replacement.
            <br />
            <MarkerText className="block text-[clamp(2.85rem,12vw,5.7rem)]">One clear result.</MarkerText>
          </h1>
          <p className="mt-7 max-w-[450px] text-[15px] font-semibold leading-[1.58] tracking-[-0.025em]">
            We begin with one repetitive routine, replace it, measure what changes, and then decide what to fix next.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <RoutineFinderButton label="Start the diagnostic" variant="primary" />
            <a href="/ops/reviews/glow-dental" className="inline-flex h-12 items-center gap-4 rounded-full border border-black/20 px-5 text-[11px] font-black">
              See an example review
            </a>
          </div>
        </div>
        <div className="min-w-0 rounded-[22px] bg-[#f7efe3] p-6 shadow-[0_22px_55px_rgba(20,14,8,0.13)] sm:p-8">
          <div className="grid grid-cols-2 gap-8">
            {[
              { label: "We find the work", icon: Search },
              { label: "We replace it", icon: Lightbulb },
              { label: "We measure", icon: BarChart3 },
              { label: "We repeat", icon: Rocket },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="mx-auto grid size-24 place-items-center rounded-full border-4 border-[#dfff00] bg-white">
                  <Icon className="size-10" strokeWidth={2.2} />
                </div>
                <p className="mt-3 [font-family:var(--font-v2-marker)] text-[1.45rem] leading-none">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-[16px] bg-[#070707] px-7 py-4 text-center text-white">
            <p className="[font-family:var(--font-v2-marker)] text-[1.65rem]">MORE CAPACITY. BETTER BUSINESS.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-5 md:grid-cols-[0.28fr_0.72fr]">
          <div>
            <SectionTitle title="Our process" />
            <p className="mt-7 text-[14px] font-semibold leading-[1.55]">A proven approach that starts small and delivers measurable impact fast.</p>
          </div>
          <div className="space-y-4">
            {process.map((step, index) => {
              const Icon = step.icon
              return (
                <article key={step.title} className="grid gap-5 rounded-[14px] border border-black/10 bg-white p-5 shadow-[0_14px_40px_rgba(0,0,0,0.035)] md:grid-cols-[80px_1fr_0.85fr] md:items-center">
                  <div className="relative">
                    <span className="absolute -left-2 -top-2 grid size-8 place-items-center rounded-full bg-[#dfff00] text-[13px] font-black">{index + 1}</span>
                    <Icon className="mx-auto size-14" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="text-[20px] font-black tracking-[-0.04em]">{step.title}</h2>
                    <p className="mt-2 text-[13px] font-semibold leading-[1.5] text-black/65">{step.copy}</p>
                  </div>
                  <div className="min-h-28 rounded-[12px] border border-black/10 bg-[#fbfbfa] p-4">
                    <div className="flex h-full items-center justify-center gap-3">
                      <span className="size-5 rounded border border-black/25" />
                      <span className="h-[2px] w-8 bg-[#dfff00]" />
                      <span className="size-5 rounded border border-black/25" />
                      <span className="h-[2px] w-8 bg-[#dfff00]" />
                      <span className="size-5 rounded border border-black/25" />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <MetricBand />

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <SectionTitle title="Why it works" />
            <p className="mt-6 text-[13px] font-semibold leading-[1.55]">We focus on what most businesses overlook: the repetitive work that drains time and creates inconsistency.</p>
          </div>
          {[
            ["Focused", "We start with one high-impact routine, not a company-wide overhaul."],
            ["Practical", "Solutions are designed around your team, your tools, and the way you actually work."],
            ["Measurable", "We measure what matters so you can see the return and make better decisions."],
          ].map(([title, copy]) => (
            <article key={title} className="border-l border-black/12 px-6">
              <p className="[font-family:var(--font-v2-marker)] text-[1.7rem]">{title}</p>
              <p className="mt-3 text-[13px] font-semibold leading-[1.5] text-black/65">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <CtaBand title="Let's find the routine stealing time in your business." copy="Tell us what is frustrating you most and we will take it from there." />
      <V2Footer />
    </V2Page>
  )
}
