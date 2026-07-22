import { ArrowLeft, ArrowRight, X } from "lucide-react"
import { CtaBand, SectionTitle, V2Footer, V2Header, V2Page } from "../../_components/V2Primitives"
import { RoutineFinderButton } from "../../_components/RoutineFinder"
import type { ProblemSlug } from "../_data"
import { problemDetails } from "../_data"
import { GenericProblemRoutineAccordion } from "./GenericProblemRoutineAccordion"

export function ProblemDetailTemplate({ slug }: { slug: ProblemSlug }) {
  const problem = problemDetails[slug]
  const accordionRoutines = problem.routines.map(([title, cost, change], index) => ({
    title,
    cost,
    change,
    capability: problem.capabilities[index] ?? problem.capabilities[0],
  }))

  return (
    <V2Page>
      <V2Header active="problems" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-8 pt-6 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <div className="min-w-0">
          <a href="/ops/problems-we-solve" className="mb-9 inline-flex min-h-11 items-center gap-3 text-[12px] font-black">
            <ArrowLeft className="size-4" strokeWidth={2.7} />
            Back to all problems
          </a>
          <h1 className="max-w-full text-[clamp(3.15rem,13vw,6.8rem)] font-black leading-[0.9] tracking-[-0.04em] sm:max-w-[520px]">
            {problem.title.replace(".", "")}
            <span className="text-[#cfe900]">.</span>
          </h1>
          <p className="mt-6 max-w-[460px] text-[18px] font-semibold leading-[1.35] tracking-[-0.035em]">{problem.description}</p>
          <div className="mt-7 h-[5px] w-28 rounded-full bg-[#dfff00]" />
          <ul className="mt-7 space-y-3 text-[14px] font-bold">
            {problem.pain.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <X className="size-5 rounded-full bg-[#ff5eb8] p-1 text-white" strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <RoutineFinderButton label="Start the diagnostic" variant="primary" />
            <a href="#fix" className="inline-flex min-h-11 items-center gap-3 text-[12px] font-black underline decoration-[#dfff00] decoration-[3px] underline-offset-4">
              See how we fix this <ArrowRight className="size-4 rotate-90" strokeWidth={2.8} />
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="relative min-h-[430px] overflow-hidden rounded-[22px] bg-[#e7dccd] shadow-[0_22px_55px_rgba(20,14,8,0.13)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#fff8ea_0,#e7dccd_34%,#d2c2ae_100%)]" />
            <div className="absolute left-8 top-8 max-w-[340px]">
              <p className="[font-family:var(--font-v2-marker)] text-[clamp(2.8rem,5vw,5rem)] uppercase leading-[0.92]">
                {problem.title}
              </p>
              <div className="mt-5 h-[5px] w-40 rounded-full bg-[#dfff00]" />
              <p className="mt-6 max-w-[280px] text-[15px] font-black leading-[1.35] tracking-[-0.04em]">{problem.description}</p>
            </div>
            <div className="absolute bottom-8 right-4 z-10 max-w-[210px] rotate-[-2deg] rounded-[14px] bg-[#dfff00] px-4 py-4 shadow-[0_16px_35px_rgba(0,0,0,0.14)] sm:right-[-8px]">
              <p className="[font-family:var(--font-v2-marker)] text-[1.55rem] uppercase leading-[0.9] sm:text-[1.75rem]">Small routines.<br />Big cost.</p>
              <div className="mt-2.5 h-[3px] w-24 rounded-full bg-black" />
            </div>
          </div>
          <div className="relative z-20 -mt-24 ml-auto max-w-[720px] rounded-[18px] bg-[#070707] p-6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
            <p className="text-[16px] font-black uppercase">The impact <span className="ml-2 text-[13px] font-semibold normal-case text-white/70">When routines stay manual.</span></p>
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {problem.stats.map(([Icon, value, label]) => {
                const RealIcon = Icon
                return (
                  <div key={label} className="rounded-[12px] border border-white/15 p-4">
                    <RealIcon className="size-6" />
                    <p className="mt-3 text-[29px] font-black tracking-[-0.06em] text-[#dfff00]">{value}</p>
                    <p className="mt-1 text-[11px] font-semibold leading-[1.25]">{label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-6 rounded-[20px] bg-[#f7efe3] p-7 md:grid-cols-[0.27fr_repeat(4,1fr)]">
          <div>
            <SectionTitle title="Why it happens." />
            <p className="mt-6 text-[14px] font-semibold leading-[1.45]">These routines look small, but they create drag across the whole business.</p>
          </div>
          {problem.reasons.map(([Icon, title, copy]) => {
            const RealIcon = Icon
            return (
              <article key={title} className="border-black/10 md:border-l md:pl-7">
                <span className="grid size-14 place-items-center rounded-full bg-[#dfff00]">
                  <RealIcon className="size-7" strokeWidth={2.2} />
                </span>
                <h2 className="mt-5 text-[15px] font-black tracking-[-0.04em]">{title}</h2>
                <p className="mt-3 text-[12px] font-semibold leading-[1.45] text-black/65">{copy}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section id="fix" className="mx-auto grid max-w-[1220px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[0.28fr_0.72fr]">
        <div>
          <SectionTitle title="The routines that create this problem." />
          <p className="mt-7 text-[14px] font-semibold leading-[1.5]">Click a routine to see why it happens, what it costs, and how we remove it.</p>
        </div>
        <GenericProblemRoutineAccordion routines={accordionRoutines} />
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <SectionTitle title="What changes when these routines disappear." />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="rounded-[16px] border border-black/10 bg-white p-6">
            <SectionTitle title="Capabilities that fix this" />
            <div className="mt-6 space-y-3">
              {problem.capabilities.map((item) => (
                <a key={item} href="/ops/how-it-works" className="flex min-h-11 items-center justify-between rounded-xl bg-[#f7f7f3] px-4 py-3 text-[13px] font-black">
                  {item}<ArrowRight className="size-4" />
                </a>
              ))}
            </div>
          </article>
          <article className="rounded-[16px] border border-black/10 bg-white p-6">
            <SectionTitle title="Real results from real businesses" />
            <p className="mt-6 text-[13px] font-bold">{problem.resultTitle}</p>
            <p className="mt-4 text-[25px] font-black leading-[1.15] tracking-[-0.05em]">{problem.resultCopy}</p>
            <a href="/ops/results" className="mt-6 inline-flex min-h-11 items-center gap-3 text-[12px] font-black">View results <ArrowRight className="size-4" /></a>
          </article>
          <article className="rounded-[16px] border border-black/10 bg-white p-6">
            <SectionTitle title="Every capability is measured" />
            <p className="mt-6 text-[13px] font-semibold leading-[1.5]">Live visibility across every routine, so you can see what changed and where capacity came back.</p>
            <div className="mt-5 grid gap-3 rounded-xl bg-[#f7f7f3] p-4">
              {problem.stats.slice(0, 3).map(([, value, label]) => (
                <p key={label} className="rounded-lg bg-white px-3 py-2 text-[12px] font-black">{value} {label}</p>
              ))}
            </div>
          </article>
        </div>
      </section>

      <CtaBand title="Let's remove the routine behind this." copy="Start the diagnostic and we will identify the first routine worth replacing." />
      <V2Footer />
    </V2Page>
  )
}
