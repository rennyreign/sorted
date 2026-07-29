import type { Metadata } from "next"
import { BarChart3, Check, Clock3, Flag, Layers3, Mountain, Sparkles, UsersRound } from "lucide-react"
import { CtaBand, SectionTitle, V2Footer, V2Header, V2Page } from "../_components/V2Primitives"

export const metadata: Metadata = {
  title: "About Sorted Ops",
  description: "Why Sorted Ops exists, what we believe, how we work, and why every installed system is measured.",
}

const beliefs = [
  ["Every business accumulates operational drag.", "It is a natural consequence of growth. More customers, more tools and more people create constraints nobody installed on purpose.", Layers3],
  ["The constraint decides performance.", "How a business performs is set by its weakest system — enquiry handling, follow-up, visibility.", Clock3],
  ["Better systems compound.", "One installed system will not transform a business overnight. One every month will.", Sparkles],
  ["What gets measured gets improved.", "We do not measure success by the number of systems we install. We measure what changes after they are installed.", BarChart3],
]

export default function AboutPage() {
  return (
    <V2Page>
      <V2Header active="about" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-10 pt-12 sm:px-8 lg:grid-cols-[0.9fr_1fr_1.1fr] lg:items-start">
        <div>
          <h1 className="text-[clamp(4.6rem,8.8vw,8.8rem)] font-black leading-[0.88] tracking-[-0.07em]">
            Why
            <br />
            Sorted
            <br />
            exists<span className="text-[#cfe900]">.</span>
          </h1>
          <div className="mt-8 h-[7px] w-56 rounded-full bg-[#dfff00]" />
        </div>

        <div className="text-[17px] font-semibold leading-[1.65] tracking-[-0.035em]">
          <p>Businesses do not struggle because people do not work hard.</p>
          <p className="mt-5">They struggle because <mark className="bg-[#dfff00] px-1 font-black">important work quietly stops happening.</mark></p>
          <p className="mt-8">As businesses grow, operational constraints appear everywhere. Calls are not returned. Reviews are not requested. Customers are not followed up. Information gets copied from one system to another.</p>
          <p className="mt-8">Sorted Ops inspects how a business performs, finds the constraint holding it back, and installs the system that removes it — giving the business the capacity to focus on the <strong>work only people can do.</strong></p>
        </div>

        <div className="relative overflow-hidden rounded-[22px] bg-[#070707] p-8 text-white shadow-[0_22px_55px_rgba(0,0,0,0.18)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:70px_70px]" />
          <div className="relative">
            <p className="text-[44px] font-black tracking-[-0.07em]">S<span className="text-[#dfff00]">.</span></p>
            <p className="mt-14 max-w-[320px] text-[28px] font-black uppercase leading-[1.18] tracking-[-0.04em]">
              We install better business systems so businesses perform better.
            </p>
            <div className="mt-6 h-[3px] w-16 rounded-full bg-[#dfff00]" />
            <p className="mt-8 text-[17px] font-semibold leading-[1.6] text-white/85">Less manual work.<br />More capacity.<br />Better experiences.<br />Stronger results.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-7 rounded-[22px] bg-[#f7efe3] p-7 lg:grid-cols-[0.25fr_repeat(4,1fr)]">
          <SectionTitle title="What we believe." />
          {beliefs.map(([title, copy, Icon]) => {
            const RealIcon = Icon as typeof Layers3
            return (
              <article key={title as string} className="border-black/10 lg:border-l lg:pl-7">
                <span className="grid size-14 place-items-center rounded-full bg-[#dfff00]">
                  <RealIcon className="size-8" />
                </span>
                <h2 className="mt-6 text-[18px] font-black leading-[1.2] tracking-[-0.04em]">{title as string}</h2>
                <p className="mt-5 text-[13px] font-semibold leading-[1.55] text-black/70">{copy as string}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[0.7fr_0.62fr_1.15fr]">
        <article className="rounded-[18px] bg-[#070707] p-8 text-white">
          <Flag className="size-10 text-[#dfff00]" />
          <SectionTitle title="What success looks like." dark />
          <ul className="mt-8 space-y-4 text-[14px] font-semibold leading-[1.45]">
            {["Less time maintaining the business.", "Customers receive replies sooner.", "Reviews being collected consistently.", "Opportunities no longer slipping through the cracks.", "Your team spending more time doing work only people can do."].map((item) => (
              <li key={item} className="flex gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-[#dfff00]" strokeWidth={4} />
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[18px] bg-[#dfff00] p-8">
          <Clock3 className="size-10" />
          <SectionTitle title="Why we measure everything." />
          <p className="mt-8 text-[14px] font-black leading-[1.65]">Every change should produce evidence.</p>
          <p className="mt-5 text-[14px] font-semibold leading-[1.65]">If a system we install does not return time, improve consistency or create measurable business value, then nothing meaningful has changed.</p>
          <p className="mt-5 text-[14px] font-semibold leading-[1.65]">That is why every improvement we make is tracked. Not because dashboards look impressive. Because businesses deserve proof.</p>
        </article>

        <article className="relative overflow-hidden rounded-[18px] border border-black/10 bg-white p-8">
          <UsersRound className="size-10" />
          <SectionTitle title="About Sorted." />
          <p className="mt-8 max-w-[460px] text-[14px] font-semibold leading-[1.7]">
            Sorted Ops installs modern business systems. We do not sell technology for the sake of technology. We do not install systems because software is interesting.
          </p>
          <p className="mt-5 max-w-[460px] text-[14px] font-semibold leading-[1.7]">
            Everything we do is guided by one question:
          </p>
          <p className="mt-5 inline-block rounded-lg bg-[#dfff00] px-4 py-3 text-[16px] font-black">Does this improve how the business performs?</p>
          <p className="mt-5 text-[14px] font-semibold">If the answer is no, we do not install it.</p>
          <Mountain className="absolute bottom-8 right-8 size-40 text-black/12" strokeWidth={1.4} />
        </article>
      </section>

      <CtaBand title="Every business has a constraint like this." copy="Start with a diagnostic and we will identify the system worth installing first." />
      <V2Footer />
    </V2Page>
  )
}
