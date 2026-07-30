import type { Metadata } from "next"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Bell, Clock3, MessageCircle, PoundSterling, UserRound, X } from "lucide-react"
import { CtaBand, SectionTitle, V2Footer, V2Header, V2Page } from "../../_components/V2Primitives"
import { RoutineFinderButton } from "../../_components/RoutineFinder"
import { ProblemRoutineAccordion } from "./ProblemRoutineAccordion"

export const metadata: Metadata = {
  title: "We Lose Customers | Sorted V2",
  description: "Why slow replies, missed calls, and inconsistent follow-up are gaps that cost businesses customers, trust, and revenue.",
}

export default function ProblemDetailPage() {
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
            We lose customers<span className="text-[#cfe900]">.</span>
          </h1>
          <p className="mt-6 max-w-[430px] text-[18px] font-semibold leading-[1.35] tracking-[-0.035em]">
            Slow replies, forgotten follow-ups and missed opportunities mean customers choose someone else.
          </p>
          <div className="mt-7 h-[5px] w-28 rounded-full bg-[#dfff00]" />
          <ul className="mt-7 space-y-3 text-[14px] font-bold">
            {["Enquiries go unanswered", "Follow-ups do not happen", "Customers lose confidence", "Revenue walks out the door"].map((item) => (
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
            <Image
              src="/v2/lose-customers-bg.png"
              alt="A phone showing a missed opportunity notification after another business replied first."
              fill
              priority
              sizes="(min-width: 1024px) 720px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_58%,rgba(0,0,0,0.08)_100%)]" />
            <div className="absolute right-4 top-[56%] z-10 max-w-[210px] rotate-[-2deg] rounded-[14px] bg-[#dfff00] px-4 py-4 shadow-[0_16px_35px_rgba(0,0,0,0.14)] sm:right-[-8px]">
              <p className="[font-family:var(--font-v2-marker)] text-[1.55rem] uppercase leading-[0.9] sm:text-[1.75rem]">Small gaps.<br />Big loss.</p>
              <div className="mt-2.5 h-[3px] w-24 rounded-full bg-black" />
            </div>
          </div>
          <div className="relative z-20 -mt-24 ml-auto max-w-[720px] rounded-[18px] bg-[#070707] p-6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
            <p className="text-[16px] font-black uppercase">The impact <span className="ml-2 text-[13px] font-semibold normal-case text-white/70">When enquiries slip through the cracks.</span></p>
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                [MessageCircle, "23%", "of enquiries go unanswered"],
                [Clock3, "42 hrs", "average time to respond"],
                [UserRound, "1 in 4", "customers choose a competitor"],
                [PoundSterling, "High", "revenue lost every month"],
              ].map(([Icon, value, label]) => {
                const RealIcon = Icon as typeof MessageCircle
                return (
                  <div key={value as string} className="rounded-[12px] border border-white/15 p-4">
                    <RealIcon className="size-6" />
                    <p className="mt-3 text-[29px] font-black tracking-[-0.06em] text-[#dfff00]">{value as string}</p>
                    <p className="mt-1 text-[11px] font-semibold leading-[1.25]">{label as string}</p>
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
            <p className="mt-6 text-[14px] font-semibold leading-[1.45]">These gaps look small, but they cost you customers, trust, and revenue.</p>
          </div>
          {[
            [Bell, "No instant alerts", "New enquiries arrive, but no one knows right away."],
            [UserRound, "No clear ownership", "Everyone assumes someone else will reply."],
            [Clock3, "Too many manual steps", "Finding info, writing replies and chasing takes too long."],
            [X, "It falls through the cracks", "Busy days mean urgent work always wins."],
          ].map(([Icon, title, copy]) => {
            const RealIcon = Icon as typeof Bell
            return (
              <article key={title as string} className="border-black/10 md:border-l md:pl-7">
                <span className="grid size-14 place-items-center rounded-full bg-[#dfff00]">
                  <RealIcon className="size-7" strokeWidth={2.2} />
                </span>
                <h2 className="mt-5 text-[15px] font-black tracking-[-0.04em]">{title as string}</h2>
                <p className="mt-3 text-[12px] font-semibold leading-[1.45] text-black/65">{copy as string}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section id="fix" className="mx-auto grid max-w-[1220px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[0.28fr_0.72fr]">
        <div>
          <SectionTitle title="The gaps that cost your customers." />
          <p className="mt-7 text-[14px] font-semibold leading-[1.5]">Click a gap to see why it happens, what it costs, and how we close it.</p>
        </div>
        <ProblemRoutineAccordion />
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <SectionTitle title="What changes when these gaps close." />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="rounded-[16px] border border-black/10 bg-white p-6">
            <SectionTitle title="Capabilities that fix this" />
            <div className="mt-6 space-y-3">
              {["Enquiry Follow-up", "Customer Response", "Missed Call Recovery", "Appointment Reminder", "Review Collection"].map((item) => (
                <a key={item} href="/ops/how-it-works" className="flex min-h-11 items-center justify-between rounded-xl bg-[#f7f7f3] px-4 py-3 text-[13px] font-black">
                  {item}<ArrowRight className="size-4" />
                </a>
              ))}
            </div>
          </article>
          <article className="rounded-[16px] border border-black/10 bg-white p-6">
            <SectionTitle title="Real results from real businesses" />
            <p className="mt-6 text-[13px] font-bold">Glow Dental, London</p>
            <p className="mt-4 text-[18px] font-black leading-[1.25]">Follow-up depended on memory. Enquiries were not being replied to consistently.</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {["82% response rate", "41% enquiry conversion", "£8,400 recovered / month"].map((item) => (
                <p key={item} className="rounded-xl bg-[#efffb7] p-4 text-[15px] font-black leading-tight">{item}</p>
              ))}
            </div>
            <a href="/ops/results" className="mt-6 inline-flex min-h-11 items-center gap-3 text-[12px] font-black">View more results <ArrowRight className="size-4" /></a>
          </article>
          <article className="rounded-[16px] border border-black/10 bg-white p-6">
            <SectionTitle title="Every capability is measured" />
            <p className="mt-6 text-[13px] font-semibold leading-[1.5]">Live visibility across every gap, so you can see what changed and where you got it back.</p>
            <div className="mt-5 grid gap-3 rounded-xl bg-[#f7f7f3] p-4">
              {["31s average response time", "127 opportunities recovered", "34% source uplift"].map((item) => (
                <p key={item} className="rounded-lg bg-white px-3 py-2 text-[12px] font-black">{item}</p>
              ))}
            </div>
          </article>
        </div>
      </section>

      <CtaBand title="Let's stop losing customers." copy="We will review your business and find the gaps costing you customers right now." />
      <V2Footer />
    </V2Page>
  )
}
