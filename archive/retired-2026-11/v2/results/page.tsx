import type { Metadata } from "next"
import { BriefcaseBusiness, Clock3, MessageCircle, UserRound } from "lucide-react"
import { CtaBand, V2Footer, V2Header, V2Page } from "../_components/V2Primitives"
import { ResultsGrid } from "./ResultsGrid"

export const metadata: Metadata = {
  title: "Results | Sorted Ops",
  description: "Project examples and illustrative reporting figures showing how Sorted measures operational improvement — not verified client aggregates.",
}

const impact = [
  [Clock3, "412", "Hours returned"],
  [MessageCircle, "1,146", "Manual checks removed"],
  [UserRound, "9", "Gaps closed"],
  [BriefcaseBusiness, "£18.4k", "Estimated value created"],
]

export default function ResultsIndexPage() {
  return (
    <V2Page>
      <V2Header active="results" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-8 pt-12 sm:px-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <div className="min-w-0">
          <h1 className="max-w-full text-[clamp(3.25rem,13vw,6.7rem)] font-black leading-[0.92] tracking-[-0.04em] sm:max-w-[680px]">
            The work.
            <br />
            And how we measure it.
          </h1>
          <div className="mt-5 h-[6px] w-full max-w-[430px] rounded-full bg-[#dfff00]" />
          <p className="mt-8 max-w-[540px] text-[17px] font-semibold leading-[1.55] tracking-[-0.03em]">
            We close the gaps that leak revenue, hurt trust, and hold businesses back. These project examples show the kind of reporting we produce.
          </p>
        </div>
        <aside className="min-w-0 rounded-[22px] bg-[#f7efe3] p-6 shadow-[0_22px_55px_rgba(20,14,8,0.1)] sm:p-8">
          <p className="text-[15px] font-black">Example reporting figures</p>
          <p className="mt-2 text-[12px] font-semibold leading-[1.45] text-black/60">These hardcoded example figures are not verified client totals.</p>
          <div className="mt-6 grid divide-y divide-black/15 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {impact.map(([Icon, value, label], index) => {
              const RealIcon = Icon as typeof Clock3
              return (
                <div key={label as string} className={`py-6 sm:px-7 ${index < 2 ? "sm:border-b sm:border-black/15" : ""}`}>
                  <div className="flex items-center gap-5">
                    <RealIcon className="size-10" strokeWidth={2.1} />
                    <div>
                      <p className="text-[30px] font-black tracking-[-0.055em]">{value as string}</p>
                      <p className="text-[13px] font-semibold">{label as string}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-5 text-[12px] font-semibold text-black/55">Estimated from current Sorted examples · Updated Jul 2026</p>
        </aside>
      </section>

      <ResultsGrid />

      <CtaBand title="Every business has gaps. Let's close yours." copy="We will identify the gaps costing you time, customers and revenue." />
      <V2Footer />
    </V2Page>
  )
}
