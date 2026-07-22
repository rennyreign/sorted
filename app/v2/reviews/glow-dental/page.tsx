import type { Metadata } from "next"
import { ArrowRight, CalendarDays, Check, Clock3, FileText, MessageCircle, PoundSterling, Star, UserRound, X } from "lucide-react"
import { CheckList, SectionTitle, V2Page } from "../../_components/V2Primitives"

export const metadata: Metadata = {
  title: "Example Diagnostic Review | Glow Dental",
  description: "An example Sorted diagnostic review showing the routine reviewed, real cost, recommendation, proposed system, and impact forecast.",
}

const contents = ["Executive Summary", "The Routine We Reviewed", "What We Found", "The Real Cost", "Our Recommendation", "Proposed System", "Prototype Preview", "Implementation Outline", "Impact Forecast", "What Happens Next"]

export default function DiagnosticReviewPage() {
  return (
    <V2Page>
      <div className="grid min-h-screen lg:grid-cols-[235px_1fr]">
        <aside className="hidden border-r border-black/10 bg-[#fbfbfa] px-7 py-8 lg:block">
          <a href="/ops" className="inline-flex min-h-11 items-center text-[27px] font-extrabold tracking-[-0.06em]">Sorted<span className="text-[#cfe900]">.</span></a>
          <p className="mt-14 text-[12px] font-black uppercase">Diagnostic review</p>
          <p className="mt-3 text-[16px] font-bold">Glow Dental</p>
          <p className="mt-14 text-[12px] font-black uppercase">Contents</p>
          <nav className="mt-5 space-y-2">
            {contents.map((item, index) => (
              <a key={item} href={`#section-${index + 1}`} className={`flex gap-4 rounded-lg px-3 py-3 text-[11px] font-bold ${index === 1 ? "bg-[#e7ff1e]" : ""}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item}
              </a>
            ))}
          </nav>
          <div className="mt-16 rounded-[14px] border border-black/10 bg-white p-5">
            <p className="text-[12px] font-black uppercase">Questions about this review?</p>
            <p className="mt-4 text-[12px] font-semibold leading-[1.45] text-black/60">We are here to help you understand it.</p>
            <p className="mt-5 text-[12px] font-black">WhatsApp us</p>
            <p className="mt-3 text-[12px] font-black">hello@sorted.ai</p>
          </div>
        </aside>

        <main>
          <header className="flex items-start justify-between border-b border-black/10 px-6 py-8 sm:px-10">
            <div>
              <p className="text-[12px] font-black">Example review <span className="ml-3 rounded bg-[#dfff00] px-2 py-1">Sample report</span></p>
              <h1 className="mt-5 max-w-[620px] text-[clamp(3.2rem,6vw,5.7rem)] font-black leading-[0.92] tracking-[-0.055em]">Diagnostic Review<br />Glow Dental</h1>
              <div className="mt-5 h-[6px] w-48 rounded-full bg-[#dfff00]" />
              <p className="mt-8 text-[12px] font-black">DATE: <span className="ml-8">12 May 2025</span></p>
              <p className="mt-3 text-[12px] font-black">PREPARED BY: <span className="ml-8">Sorted.</span></p>
            </div>
            <a href="/ops" className="inline-flex min-h-11 items-center text-[27px] font-extrabold tracking-[-0.06em]">Sorted<span className="text-[#cfe900]">.</span></a>
          </header>

          <section className="grid gap-5 border-b border-black/10 px-6 py-8 sm:px-10 lg:grid-cols-[0.5fr_0.9fr_0.9fr_0.8fr]">
            <div />
            <article className="rounded-[12px] border border-black/10 bg-[#dfff00] p-7">
              <h2 className="[font-family:var(--font-v2-marker)] text-[2rem] uppercase leading-none">Capacity report not available yet.</h2>
              <p className="mt-5 text-[13px] font-black leading-[1.5]">
                This is currently an example diagnostic report. The full capacity report format will be established once the reporting product is ready.
              </p>
            </article>
            <article className="rounded-[12px] bg-[#f4efe7] p-7">
              <h2 className="text-[18px] font-black tracking-[-0.04em]">Executive summary</h2>
              <p className="mt-5 text-[13px] font-semibold leading-[1.55]">We reviewed the routine around treatment plan follow-up after consultation. The biggest opportunity is to ensure every interested patient receives timely follow-up, appropriate communication, and a clear path to booking.</p>
            </article>
            <article className="rounded-[12px] bg-[#070707] p-6 text-white">
              {[
                [Clock3, "24.6", "hours returned per month"],
                [MessageCircle, "63", "enquiries recovered / month"],
                [Star, "1,240", "reviews potential"],
                [PoundSterling, "£8,400", "value recovered per month"],
              ].map(([Icon, value, label]) => {
                const RealIcon = Icon as typeof Clock3
                return (
                  <div key={value as string} className="flex items-center gap-4 border-b border-white/15 py-3 last:border-0">
                    <RealIcon className="size-8" />
                    <p className="min-w-24 text-[28px] font-black text-[#dfff00]">{value as string}</p>
                    <p className="text-[10px] font-black uppercase leading-[1.2]">{label as string}</p>
                  </div>
                )
              })}
            </article>
          </section>

          <ReportSection number="02" title="The routine we reviewed">
            <p className="font-bold">Treatment plan follow-up after consultation.</p>
            <Flow labels={["Consultation completed", "Treatment plan presented", "Patient leaves", "No consistent follow-up", "Interested patients lost"]} lastBad />
          </ReportSection>

          <div className="grid border-b border-black/10 lg:grid-cols-2">
            <ReportBlock number="03" title="What we found">
              <CheckList items={["No clear owner for follow-up.", "No standard timing.", "Life gets busy.", "Interested patients slip through the gaps."]} />
            </ReportBlock>
            <ReportBlock number="04" title="The real cost" pink>
              <ul className="space-y-4 text-[14px] font-bold">
                {["Patients delay or go elsewhere.", "Treatment value not booked.", "Team spends time chasing manually.", "Capacity is lost every month."].map((item) => (
                  <li key={item} className="flex gap-3"><ArrowRight className="size-4 text-[#ff73d2]" />{item}</li>
                ))}
              </ul>
            </ReportBlock>
          </div>

          <ReportSection number="05" title="Our recommendation">
            <p className="mb-5 max-w-[300px] font-bold">Install the Treatment Follow-Up System.</p>
            <Flow labels={["Instant acknowledgement", "Timed follow-up sequence", "Patient engaged", "Team alerted when needed", "Appointment booked"]} />
            <p className="mt-5 inline-block rounded bg-[#efffb7] px-4 py-2 text-[13px] font-black">Every patient gets the right follow-up, at the right time, every time.</p>
          </ReportSection>

          <ReportSection number="06" title="Proposed system">
            <div className="grid gap-5 md:grid-cols-[0.5fr_1fr_0.5fr]">
              <Stack items={["Website enquiry", "Phone call", "Walk-in", "Other sources"]} />
              <div className="rounded-[14px] border border-[#cfe900] bg-white p-6">
                <h3 className="text-[22px] font-black tracking-[-0.05em] text-[#a9c600]">Sorted Enquiry Follow-Up System</h3>
                <CheckList items={["Instant response", "Follow-up sequence", "Stops when replied", "Alerts when needed", "Logs every interaction"]} />
              </div>
              <Stack items={["Patient books", "Patient responds", "Team takes over", "No further action"]} />
            </div>
          </ReportSection>

          <div className="grid border-b border-black/10 lg:grid-cols-2">
            <ReportBlock number="07" title="Prototype preview">
              <div className="rounded-[12px] border border-black/10 bg-white p-4">
                <div className="grid grid-cols-5 gap-2 text-[10px] font-bold text-black/55"><span>Patient</span><span>Stage</span><span>Next action</span><span>Status</span><span /></div>
                {["Sarah T.", "James L.", "Priya M.", "Tom R."].map((name) => (
                  <div key={name} className="grid grid-cols-5 gap-2 border-t border-black/10 py-3 text-[11px] font-bold"><span>{name}</span><span>Follow-up</span><span>SMS</span><span className="text-[#00a64b]">Active</span><span /></div>
                ))}
              </div>
            </ReportBlock>
            <ReportBlock number="08" title="Implementation outline">
              <Flow labels={["Confirm & plan", "Build & configure", "Test & refine", "Go live", "Measure & optimise"]} />
            </ReportBlock>
          </div>

          <div className="grid border-b border-black/10 lg:grid-cols-2">
            <ReportBlock number="09" title="Impact forecast (first 12 months)">
              <div className="grid grid-cols-4 gap-5 text-center">
                {["295 Hours returned", "756 Enquiries recovered", "1,240 Reviews potential", "£100,800 Value recovered"].map((item) => (
                  <p key={item} className="text-[20px] font-black leading-[1.1] tracking-[-0.04em]">{item}</p>
                ))}
              </div>
            </ReportBlock>
            <ReportBlock number="10" title="What happens next?">
              <CheckList items={["We walk you through this review.", "Answer any questions you have.", "If it makes sense, we finalise the plan and build it.", "You start seeing results."]} />
            </ReportBlock>
          </div>

          <footer className="m-8 rounded-[10px] bg-[#070707] px-6 py-4 text-[12px] font-semibold text-white">
            This review is an example. Your review will be created specifically for your business.
          </footer>
        </main>
      </div>
    </V2Page>
  )
}

function ReportSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section id={`section-${Number(number)}`} className="border-b border-black/10 px-6 py-8 sm:px-10">
      <div className="mb-6 flex items-center gap-5">
        <span className="rounded bg-[#dfff00] px-2 py-1 text-[13px] font-black">{number}</span>
        <h2 className="text-[24px] font-black tracking-[-0.045em]">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function ReportBlock({ number, title, children, pink = false }: { number: string; title: string; children: React.ReactNode; pink?: boolean }) {
  return (
    <section className={`px-6 py-8 sm:px-10 ${pink ? "bg-[#fff0f6]" : ""}`}>
      <div className="mb-6 flex items-center gap-5">
        <span className="rounded bg-[#dfff00] px-2 py-1 text-[13px] font-black">{number}</span>
        <h2 className="text-[24px] font-black tracking-[-0.045em]">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Flow({ labels, lastBad = false }: { labels: string[]; lastBad?: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      {labels.map((label, index) => (
        <div key={label} className="text-center">
          {lastBad && index === labels.length - 1 ? <X className="mx-auto size-9 rounded-full bg-[#ff9ad8] p-2" /> : <FileText className="mx-auto size-9" />}
          <p className="mt-3 text-[12px] font-black leading-[1.25]">{label}</p>
        </div>
      ))}
    </div>
  )
}

function Stack({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => <p key={item} className="rounded-[10px] border border-black/10 bg-white px-4 py-3 text-[12px] font-bold">{item}</p>)}
    </div>
  )
}
