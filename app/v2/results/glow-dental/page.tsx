import type { Metadata } from "next"
import { ArrowLeft, ArrowRight, BarChart3, CalendarDays, Check, Clock3, MapPin, MessageCircle, Quote, Star, UsersRound, X } from "lucide-react"
import { CtaBand, MarkerText, SectionTitle, V2Footer, V2Header, V2Page } from "../../_components/V2Primitives"

export const metadata: Metadata = {
  title: "Results | Sorted V2",
  description: "Measured examples of gaps closed by Sorted, including time returned, enquiries recovered, and reviews generated.",
}

const comparison = [
  ["Average response time", "42 hrs", "12 hrs / week", Clock3],
  ["Reviews requested", "Never", "41", Star],
  ["Enquiries lost (est.)", "18 / month", "63 / month", MessageCircle],
  ["Gap ownership", "Nobody", "1 owner", UsersRound],
]

export default function ResultsPage() {
  return (
    <V2Page>
      <V2Header active="results" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-10 pt-8 sm:px-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <div className="min-w-0 max-w-[calc(100vw-2.5rem)] sm:max-w-none">
          <a href="/ops/results" className="mb-14 inline-flex min-h-11 items-center gap-3 text-[12px] font-black">
            <ArrowLeft className="size-4" strokeWidth={2.7} />
            Back to all results
          </a>
          <p className="text-[27px] font-semibold tracking-[-0.05em]">Glow Dental</p>
          <h1 className="mt-8 max-w-full text-[clamp(3.1rem,13vw,6.8rem)] font-black leading-[0.92] tracking-[-0.04em] sm:max-w-[680px]">
            Gap closed!
            <br />
            <MarkerText className="block text-[clamp(2.75rem,12vw,5.55rem)]">What changed?</MarkerText>
          </h1>
          <p className="mt-8 max-w-[540px] text-[18px] font-semibold leading-[1.55] tracking-[-0.035em]">
            Every enquiry arriving outside business hours sat unanswered until someone remembered to reply.
          </p>
          <div className="mt-8 flex flex-wrap gap-8 text-[13px] font-bold">
            <span className="inline-flex items-center gap-2"><MapPin className="size-5" />Manchester, UK</span>
            <span className="inline-flex items-center gap-2"><Star className="size-5" />Dental Practice</span>
            <span className="inline-flex items-center gap-2"><UsersRound className="size-5" />12 Team Members</span>
          </div>
        </div>
        <aside className="min-w-0 max-w-[calc(100vw-2.5rem)] rounded-[22px] bg-[#f7efe3] p-6 shadow-[0_22px_55px_rgba(20,14,8,0.13)] sm:max-w-none sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] font-black text-black/55">Gap closed</p>
              <h2 className="mt-5 max-w-[360px] text-[42px] font-black leading-[1.05] tracking-[-0.06em]">Manual enquiry response</h2>
            </div>
            <span className="grid size-16 place-items-center rounded-full bg-[#dfff00]">
              <Check className="size-9" strokeWidth={3} />
            </span>
          </div>
          <div className="my-8 border-t border-black/12" />
          <div className="grid gap-6 sm:grid-cols-2">
            <p className="flex gap-4 text-[13px] font-bold"><Clock3 className="size-9" /><span>Time returned <strong className="block text-[23px] tracking-[-0.04em]">12 hrs / week</strong></span></p>
            <p className="flex gap-4 text-[13px] font-bold"><CalendarDays className="size-9" /><span>Since <strong className="block text-[23px] tracking-[-0.04em]">Mar 2025</strong></span></p>
          </div>
          <blockquote className="mt-9 border-t border-black/12 pt-8">
            <p className="text-[24px] font-black leading-none">"</p>
            <p className="mt-2 text-[18px] font-semibold leading-[1.5]">We did not have a patient problem. We had a gap in our follow-up. Once that closed, everything changed.</p>
            <p className="mt-5 text-[13px] font-black">Sarah T.<span className="block font-semibold">Practice Manager</span></p>
          </blockquote>
        </aside>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-6 sm:px-8">
        <div className="grid overflow-hidden rounded-[18px] border border-black/10 bg-white lg:grid-cols-4">
          <ResultColumn icon={Clock3} label="Before" title="The impact of the gap." copy="This gap leaked time and created problems every day.">
            {comparison.map(([label, before, , Icon]) => {
              const RealIcon = Icon as typeof Clock3
              return <Metric key={label as string} icon={RealIcon} label={label as string} value={before as string} />
            })}
          </ResultColumn>
          <ResultColumn icon={MessageCircle} label="The gap" title="The gap we found." copy="A manual process that happened every day, with no system.">
            <CheckListBlock items={["Enquiries came in via website, Google and social.", "Someone had to check each inbox.", "Info was copied into the practice system.", "A reply was written and sent manually.", "Team were often busy or away."]} />
          </ResultColumn>
          <ResultColumn icon={BarChart3} label="What we changed" title="The operational capability we built." copy="We closed the gap with a reliable system.">
            <CheckListBlock items={["Enquiries are captured instantly.", "Patients get an immediate acknowledgement.", "The enquiry is routed to the right person.", "The team gets notified.", "Every enquiry is followed up consistently."]} good />
          </ResultColumn>
          <ResultColumn icon={Star} label="What changed" title="The impact after closing." copy="Real changes. Measured. Sustained.">
            {comparison.map(([label, , after, Icon], index) => {
              const RealIcon = Icon as typeof Clock3
              return <Metric key={label as string} icon={RealIcon} label={label as string} value={after as string} delta={["+38%", "+41%", "+37%", "+100%"][index]} />
            })}
          </ResultColumn>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-6 sm:px-8">
        <div className="grid gap-7 rounded-[18px] bg-[#070707] p-8 text-white lg:grid-cols-[0.42fr_1fr_4px] lg:items-center">
          <div className="flex items-center gap-6">
            <BarChart3 className="size-16 text-[#dfff00]" strokeWidth={2.4} />
            <p className="text-[31px] font-black leading-[1.05] tracking-[-0.05em]">Fewer gaps.<br />More capacity.<br />Better business.</p>
          </div>
          <p className="border-white/25 text-[16px] font-semibold leading-[1.55] text-white/90 lg:border-l lg:pl-10">
            By closing one gap, Glow Dental got back over 12 hours every week and saw more patients, more reviews and faster responses without adding headcount.
          </p>
          <span className="hidden h-24 rounded-full bg-[#dfff00] lg:block" />
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-6 sm:px-8">
        <div className="grid gap-6 rounded-[18px] border border-black/10 bg-[#f7efe3] p-7 lg:grid-cols-[0.34fr_0.66fr] lg:items-center">
          <div>
            <SectionTitle title="Client testimonial" />
            <p className="mt-7 max-w-[300px] text-[14px] font-semibold leading-[1.5] text-black/65">
              What changed for the team once the gap in manual enquiry handling was closed.
            </p>
          </div>
          <blockquote className="relative rounded-[16px] bg-white p-7 shadow-[0_14px_40px_rgba(0,0,0,0.04)]">
            <Quote className="mb-6 size-10 text-[#b6d000]" strokeWidth={2.2} />
            <p className="max-w-[760px] text-[clamp(1.65rem,3vw,3.1rem)] font-black leading-[1.08] tracking-[-0.055em]">
              Every missed enquiry now gets a response before we even see it. The team stopped chasing inboxes and started focusing on the patients in front of them.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="grid size-12 place-items-center rounded-full bg-[#dfff00] text-[16px] font-black">ST</span>
              <p className="text-[13px] font-black">
                Sarah T.
                <span className="block font-semibold text-black/55">Practice Manager, Glow Dental</span>
              </p>
            </div>
          </blockquote>
        </div>
      </section>

      <CtaBand title="Every business has gaps like this." copy="Start with a diagnostic and we will show you which gap is worth closing first." />
      <V2Footer />
    </V2Page>
  )
}

function ResultColumn({ icon: Icon, label, title, copy, children }: { icon: typeof Clock3; label: string; title: string; copy: string; children: React.ReactNode }) {
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

function Metric({ icon: Icon, label, value, delta }: { icon: typeof Clock3; label: string; value: string; delta?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-[#f7f7f3] px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="size-6" />
        <span className="text-[11px] font-semibold">{label}</span>
      </div>
      <p className="text-[18px] font-black tracking-[-0.04em]">{value} {delta ? <span className="ml-2 text-[11px] text-[#9ab200]">{delta}</span> : null}</p>
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
