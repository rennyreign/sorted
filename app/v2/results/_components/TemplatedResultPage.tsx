import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, BarChart3, CalendarDays, Check, Clock3, MapPin, MessageCircle, Quote, Star, UsersRound, X, type LucideIcon } from "lucide-react"
import { CtaBand, MarkerText, SectionTitle, V2Footer, V2Header, V2Page } from "../../_components/V2Primitives"
import { templatedResults, type TemplatedResultSlug } from "../_templateData"

const resultDetails = {
  "gracie-barra-halesowen": {
    team: "Local academy",
    timeReturned: "7 hrs / week",
    since: "Apr 2025",
    note: "What changed for the team once booking and repeated website questions stopped depending on manual replies.",
    impact:
      "By making class information easier to find and moving intro booking online, Gracie Barra Halesowen reduced repeated explanation work and gave prospective members a clearer path to start.",
    comparison: [
      ["Repeated questions", "High", "Lower", MessageCircle, "-34%"],
      ["Intro booking", "Manual", "Online", CalendarDays, "Live"],
      ["Staff interruptions", "Daily", "Reduced", Clock3, "-7 hrs"],
      ["Member feedback", "Anecdotal", "Positive", Star, "Up"],
    ],
    routineSteps: ["Prospects asked basic class questions.", "Staff replied manually when available.", "Free intro booking was not obvious enough.", "The same explanations were repeated.", "Follow-up depended on memory."],
    changedSteps: ["Class information became easier to find.", "Free intro booking moved online.", "Common answers were surfaced earlier.", "The team had fewer repeated website enquiries.", "Prospects had a clearer next step."],
  },
  "action-hero-marketing": {
    team: "Marketing team",
    timeReturned: "9 hrs / week",
    since: "May 2025",
    note: "What changed once property research stopped being a manual search-and-copy routine.",
    impact:
      "By turning repeated property research into a working tool, Action Hero Marketing reduced manual combing through listings and gave the team cleaner inputs for outreach.",
    comparison: [
      ["Research time", "Manual", "Reduced", Clock3, "-9 hrs"],
      ["Property criteria", "Repeated", "Systemised", BarChart3, "Mapped"],
      ["Outreach prep", "Slow", "Ready lists", MessageCircle, "Faster"],
      ["Extra capability", "None", "Added", Star, "Built"],
    ],
    routineSteps: ["Specific properties were searched manually.", "Criteria had to be checked repeatedly.", "Useful matches were copied into outreach prep.", "The same research pattern restarted each time.", "Marketing work waited for the list."],
    changedSteps: ["Research criteria became a tool workflow.", "Matching output was prepared faster.", "Outreach inputs became easier to use.", "Additional features improved the original process.", "The team could focus on outreach instead of combing."],
  },
  "bisk-education": {
    team: "Product team",
    timeReturned: "4 products",
    since: "2025",
    note: "What changed when stalled product delivery became a repeatable build pipeline.",
    impact:
      "By changing the underlying product development routine, Bisk moved from stalled output to shipped products with clearer revenue paths and a stronger B2B position.",
    comparison: [
      ["Products shipped", "0", "4", BarChart3, "+4"],
      ["Delivery rhythm", "Stalled", "Active", Clock3, "Live"],
      ["Revenue paths", "Blocked", "Created", MessageCircle, "Built"],
      ["B2B position", "Static", "Evolved", Star, "Shifted"],
    ],
    routineSteps: ["Product work had stalled for years.", "Delivery depended on old operating habits.", "Ideas struggled to become shipped products.", "Revenue pipeline creation was blocked by output.", "The B2B story had no new proof."],
    changedSteps: ["AI was introduced into the product pipeline.", "Four software products were deployed.", "Each product had its own revenue path.", "The delivery rhythm became more repeatable.", "The B2B position evolved with the new system."],
  },
  bodysharp: {
    team: "Fitness business",
    timeReturned: "Forecast",
    since: "Scoping",
    note: "Draft result note. Replace this with the client quote once final figures are supplied.",
    impact:
      "Bodysharp is currently shown as a templated result. The page is ready for final measured figures once the operational review is complete.",
    comparison: [
      ["Admin routines", "Unmapped", "Mapped", BarChart3, "Draft"],
      ["Follow-up rhythm", "Undefined", "Scoped", MessageCircle, "Planned"],
      ["Customer updates", "Manual", "Measured", Clock3, "Review"],
      ["Capacity forecast", "Unknown", "Ready", Star, "Draft"],
    ],
    routineSteps: ["Admin routines need mapping.", "Follow-up rhythm needs definition.", "Customer update work needs measuring.", "Repeated tasks need ownership.", "Final figures are still to be supplied."],
    changedSteps: ["First routine identified.", "Replacement system scoped.", "Capacity forecast prepared.", "Measurement categories defined.", "Final client content can be dropped in."],
  },
} satisfies Record<
  TemplatedResultSlug,
  {
    team: string
    timeReturned: string
    since: string
    note: string
    impact: string
    comparison: [string, string, string, LucideIcon, string][]
    routineSteps: string[]
    changedSteps: string[]
  }
>

export function TemplatedResultPage({ slug }: { slug: TemplatedResultSlug }) {
  const result = templatedResults[slug]
  const details = resultDetails[slug]

  return (
    <V2Page>
      <V2Header active="results" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-10 pt-8 sm:px-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <div className="min-w-0 max-w-[calc(100vw-2.5rem)] sm:max-w-none">
          <Link href="/ops/results" className="mb-14 inline-flex min-h-11 items-center gap-3 text-[12px] font-black">
            <ArrowLeft className="size-4" strokeWidth={2.7} />
            Back to all results
          </Link>
          <p className="text-[27px] font-semibold tracking-[-0.05em]">{result.name}</p>
          <h1 className="mt-8 max-w-full text-[clamp(3.1rem,13vw,6.8rem)] font-black leading-[0.92] tracking-[-0.04em] sm:max-w-[680px]">
            Repetitive work removed!
            <br />
            <MarkerText className="block text-[clamp(2.75rem,12vw,5.55rem)]">What changed?</MarkerText>
          </h1>
          <p className="mt-8 max-w-[540px] text-[18px] font-semibold leading-[1.55] tracking-[-0.035em]">{result.summary}</p>
          <div className="mt-8 flex flex-wrap gap-8 text-[13px] font-bold">
            <span className="inline-flex items-center gap-2"><MapPin className="size-5" />{result.location}</span>
            <span className="inline-flex items-center gap-2"><Star className="size-5" />{result.category}</span>
            <span className="inline-flex items-center gap-2"><UsersRound className="size-5" />{details.team}</span>
          </div>
        </div>
        <aside className="min-w-0 max-w-[calc(100vw-2.5rem)] rounded-[22px] bg-[#f7efe3] p-6 shadow-[0_22px_55px_rgba(20,14,8,0.13)] sm:max-w-none sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] font-black text-black/55">Routine removed</p>
              <h2 className="mt-5 max-w-[360px] text-[42px] font-black leading-[1.05] tracking-[-0.06em]">{result.routine}</h2>
            </div>
            <span className="grid size-16 place-items-center rounded-full bg-[#dfff00]">
              <Check className="size-9" strokeWidth={3} />
            </span>
          </div>
          <div className="my-8 border-t border-black/12" />
          <div className="grid gap-6 sm:grid-cols-2">
            <p className="flex gap-4 text-[13px] font-bold">
              <Clock3 className="size-9" />
              <span>Primary result <strong className="block text-[23px] tracking-[-0.04em]">{details.timeReturned}</strong></span>
            </p>
            <p className="flex gap-4 text-[13px] font-bold">
              <CalendarDays className="size-9" />
              <span>Since <strong className="block text-[23px] tracking-[-0.04em]">{details.since}</strong></span>
            </p>
          </div>
          <blockquote className="mt-9 border-t border-black/12 pt-8">
            <p className="text-[24px] font-black leading-none">"</p>
            <p className="mt-2 text-[18px] font-semibold leading-[1.5]">{result.quote}</p>
            <p className="mt-5 text-[13px] font-black">{result.person}<span className="block font-semibold">{result.role}</span></p>
          </blockquote>
        </aside>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-6 sm:px-8">
        <div className="grid overflow-hidden rounded-[18px] border border-black/10 bg-white lg:grid-cols-4">
          <ResultColumn icon={Clock3} label="Before" title="The impact of the routine." copy="This routine stole time and created friction before it was replaced.">
            {details.comparison.map(([label, before, , Icon]) => (
              <Metric key={label} icon={Icon} label={label} value={before} />
            ))}
          </ResultColumn>
          <ResultColumn icon={MessageCircle} label="The routine" title="The repetitive work we found." copy="A repeatable process that kept needing human attention.">
            <CheckListBlock items={details.routineSteps} />
          </ResultColumn>
          <ResultColumn icon={BarChart3} label="What we changed" title="The operational capability we built." copy="The routine was replaced with a cleaner operating rhythm.">
            <CheckListBlock items={details.changedSteps} good />
          </ResultColumn>
          <ResultColumn icon={Star} label="What changed" title="The impact after removal." copy="The result became easier to see, repeat and improve.">
            {details.comparison.map(([label, , after, Icon, delta]) => (
              <Metric key={label} icon={Icon} label={label} value={after} delta={delta} />
            ))}
          </ResultColumn>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-6 sm:px-8">
        <div className="grid gap-7 rounded-[18px] bg-[#070707] p-8 text-white lg:grid-cols-[0.42fr_1fr_4px] lg:items-center">
          <div className="flex items-center gap-6">
            <BarChart3 className="size-16 text-[#dfff00]" strokeWidth={2.4} />
            <p className="text-[31px] font-black leading-[1.05] tracking-[-0.05em]">
              Less repetitive work.
              <br />
              More capacity.
              <br />
              Better business.
            </p>
          </div>
          <p className="border-white/25 text-[16px] font-semibold leading-[1.55] text-white/90 lg:border-l lg:pl-10">{details.impact}</p>
          <span className="hidden h-24 rounded-full bg-[#dfff00] lg:block" />
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-6 sm:px-8">
        <div className="grid gap-6 rounded-[18px] border border-black/10 bg-[#f7efe3] p-7 lg:grid-cols-[0.34fr_0.66fr] lg:items-center">
          <div>
            <SectionTitle title="Client testimonial" />
            <p className="mt-7 max-w-[300px] text-[14px] font-semibold leading-[1.5] text-black/65">{details.note}</p>
          </div>
          <blockquote className="relative rounded-[16px] bg-white p-7 shadow-[0_14px_40px_rgba(0,0,0,0.04)]">
            <Quote className="mb-6 size-10 text-[#b6d000]" strokeWidth={2.2} />
            <p className="max-w-[760px] text-[clamp(1.65rem,3vw,3.1rem)] font-black leading-[1.08] tracking-[-0.055em]">{result.quote}</p>
            <div className="mt-8 flex items-center gap-4">
              {"image" in result ? (
                <img
                  src={result.image}
                  alt={`${result.person} portrait`}
                  className="size-14 shrink-0 rounded-full border border-black/10 object-cover grayscale"
                />
              ) : null}
              <p className="text-[13px] font-black">
                {result.person}
                <span className="block font-semibold text-black/55">{result.role}</span>
              </p>
            </div>
          </blockquote>
        </div>
      </section>

      <CtaBand title="Every business has routines like this." copy="Start with a diagnostic and we will show you which routine is worth removing first." />
      <V2Footer />
    </V2Page>
  )
}

function ResultColumn({ icon: Icon, label, title, copy, children }: { icon: LucideIcon; label: string; title: string; copy: string; children: ReactNode }) {
  return (
    <article className="border-black/10 p-7 lg:border-r lg:last:border-r-0">
      <span className="grid size-10 place-items-center rounded-xl bg-[#070707] text-white">
        <Icon className="size-5" strokeWidth={2.4} />
      </span>
      <p className="mt-5 text-[12px] font-black">{label}</p>
      <h2 className="mt-6 text-[24px] font-black leading-[1.12] tracking-[-0.045em]">{title}</h2>
      <p className="mt-4 text-[13px] font-semibold leading-[1.45]">{copy}</p>
      <div className="mt-7 space-y-3">{children}</div>
    </article>
  )
}

function Metric({ icon: Icon, label, value, delta }: { icon: LucideIcon; label: string; value: string; delta?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-[#f7f7f3] px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="size-6" />
        <span className="text-[11px] font-semibold">{label}</span>
      </div>
      <p className="text-[18px] font-black tracking-[-0.04em]">
        {value} {delta ? <span className="ml-2 text-[11px] text-[#9ab200]">{delta}</span> : null}
      </p>
    </div>
  )
}

function CheckListBlock({ items, good = false }: { items: string[]; good?: boolean }) {
  return (
    <ul className={`space-y-5 rounded-[14px] p-5 ${good ? "bg-[#efffed]" : "bg-[#fffbe2]"}`}>
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[12px] font-semibold leading-[1.45]">
            {good ? <Check className="mt-0.5 size-4 shrink-0 text-[#9ab200]" strokeWidth={4} /> : <X className="mt-0.5 size-4 shrink-0 text-[#9ab200]" strokeWidth={3} />}
            {item}
          </li>
        ))}
      </ul>
  )
}
