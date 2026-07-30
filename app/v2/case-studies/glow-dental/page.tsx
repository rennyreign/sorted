import type { Metadata } from "next"
import { CalendarDays, Check, Clock3, MessageCircle, PoundSterling, Rocket, Settings, Star, UsersRound } from "lucide-react"
import { CheckList, CtaBand, SectionTitle, V2Footer, V2Header, V2Page } from "../../_components/V2Primitives"

export const metadata: Metadata = {
  title: "Glow Dental Case Study | Sorted V2",
  description: "How Glow Dental recovered 63 enquiries every month by closing the gap in their follow-up.",
}

export default function GlowDentalCaseStudyPage() {
  return (
    <V2Page>
      <div className="grid lg:grid-cols-[220px_1fr]">
        <aside className="hidden border-r border-black/10 px-7 py-8 lg:block">
          <a href="/ops" className="inline-flex min-h-11 items-center text-[33px] font-black leading-none tracking-[-0.045em] sm:text-[40px]">Sorted<span className="text-[#cfe900]">.</span><span className="[font-family:var(--font-v2-bakeshop)] text-[#cfe900]">ops</span></a>
          <nav className="mt-14 space-y-3 text-[12px] font-bold">
            {["Overview", "The challenge", "The diagnosis", "The solution", "The results", "What they say", "Details"].map((item, index) => (
              <a key={item} href={`#case-${index + 1}`} className={`flex gap-4 rounded-lg px-3 py-3 ${index === 0 ? "bg-[#e7ff1e]" : ""}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>{item}
              </a>
            ))}
          </nav>
          <div className="mt-12 rounded-[14px] border border-black/10 bg-white p-5">
            <p className="text-[12px] font-black">Business</p>
            <p className="mt-1 text-[13px] font-bold">Glow Dental</p>
            <p className="mt-4 text-[12px] font-black">System</p>
            <p className="mt-1 text-[13px] font-bold">Enquiry Follow-Up System</p>
            <p className="mt-4 text-[12px] font-black">Live date</p>
            <p className="mt-1 text-[13px] font-bold">March 2025</p>
          </div>
        </aside>

        <main>
          <V2Header active="results" />
          <section id="case-1" className="mx-auto grid max-w-[1120px] gap-8 px-5 py-8 sm:px-8 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h1 className="text-[clamp(3.2rem,6vw,5.6rem)] font-black leading-[0.92] tracking-[-0.055em]">How Glow Dental Recovered 63 Enquiries Every Month</h1>
              <div className="mt-5 h-[5px] w-56 rounded-full bg-[#dfff00]" />
              <p className="mt-7 max-w-[520px] text-[17px] font-semibold leading-[1.55] tracking-[-0.03em]">
                By replacing a broken follow-up process with a simple system, Glow Dental now responds to every enquiry faster and books more treatment as a result.
              </p>
              <div className="mt-10 grid gap-5 sm:grid-cols-3">
                <Meta icon={CalendarDays} label="Project length" value="4 weeks" />
                <Meta icon={Settings} label="System" value="Enquiry Follow-Up System" />
                <Meta icon={Rocket} label="Live date" value="March 2025" />
              </div>
            </div>
            <div>
              <div className="grid min-h-[270px] place-items-center rounded-[18px] bg-[#e9dfd2] text-center shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
                <p className="text-[48px] font-black tracking-[-0.08em] text-white drop-shadow">GLOW<br />DENTAL</p>
              </div>
              <div className="-mt-9 grid grid-cols-4 divide-x divide-white/20 rounded-[14px] bg-[#070707] p-5 text-center text-white">
                {[
                  [Clock3, "24.6", "Hours returned per month"],
                  [MessageCircle, "63", "Enquiries recovered per month"],
                  [Star, "1,240", "Reviews potential"],
                  [PoundSterling, "£8,400", "Value recovered per month"],
                ].map(([Icon, value, label]) => {
                  const RealIcon = Icon as typeof Clock3
                  return (
                    <div key={value as string} className="px-4">
                      <RealIcon className="mx-auto size-8" />
                      <p className="mt-3 text-[32px] font-black text-[#dfff00]">{value as string}</p>
                      <p className="mt-2 text-[8px] font-black uppercase leading-[1.2]">{label as string}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <CaseSection id="case-2" number="02" title="The challenge">
            <div className="grid gap-6 md:grid-cols-[0.35fr_0.65fr] md:items-center">
              <p className="text-[14px] font-semibold leading-[1.55]">Treatment plans were being presented, but follow-up was inconsistent and relied on memory.</p>
              <Flow labels={["Consultation completed", "Treatment plan presented", "Patient leaves", "No consistent follow-up", "Interested patients lost"]} />
            </div>
          </CaseSection>

          <CaseSection id="case-3" number="03" title="The diagnosis">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ["No clear owner", "Follow-up depended on who remembered."],
                ["No standard timing", "Some patients were chased quickly, others not at all."],
                ["Life gets busy", "The day takes over and follow-ups get pushed aside."],
                ["Gaps become losses", "Interested patients slip through and go elsewhere."],
              ].map(([title, copy]) => (
                <article key={title} className="rounded-[12px] bg-[#f8f5df] p-5">
                  <h3 className="text-[16px] font-black tracking-[-0.04em]">{title}</h3>
                  <p className="mt-3 text-[13px] font-semibold leading-[1.45] text-black/62">{copy}</p>
                </article>
              ))}
            </div>
          </CaseSection>

          <CaseSection id="case-4" number="04" title="The solution">
            <div className="grid gap-7 md:grid-cols-[0.3fr_0.7fr]">
              <div>
                <p className="text-[18px] font-black tracking-[-0.04em]">We installed the Enquiry Follow-Up System.</p>
                <div className="mt-5"><CheckList items={["Every enquiry gets an instant response", "Automated, timely follow-up sequence", "Alerts when human conversation is needed", "All activity logged and visible", "Stops when the patient replies or books"]} /></div>
              </div>
              <Flow labels={["Instant acknowledgement", "Timed follow-up sequence", "Patient engages", "Team alerted", "Appointment booked"]} />
            </div>
          </CaseSection>

          <CaseSection id="case-5" number="05" title="The results">
            <div className="grid gap-8 md:grid-cols-[0.5fr_0.5fr]">
              <div className="space-y-4">
                {[
                  ["Enquiries responded to", "61%", "94%"],
                  ["Average response time", "7.2 hrs", "28 mins"],
                  ["Enquiries recovered", "-", "63 per month"],
                  ["Appointments booked", "19", "42"],
                  ["Value recovered", "-", "£8,400 per month"],
                ].map(([label, before, after]) => (
                  <div key={label} className="grid grid-cols-[1.2fr_0.7fr_0.8fr] items-center gap-4 text-[12px] font-bold">
                    <span>{label}</span><span className="rounded bg-black/10 px-2 py-1">{before}</span><span className="rounded bg-[#dfff00] px-2 py-1">{after}</span>
                  </div>
                ))}
              </div>
              <blockquote className="rounded-[16px] bg-white p-7 shadow-[0_14px_40px_rgba(0,0,0,0.04)]">
                <p className="text-[24px] font-black leading-[1.18] tracking-[-0.045em]">We had no idea how many patients we were losing just through delay. Sorted showed us the gaps and built a system that fixed it.</p>
                <p className="mt-6 text-[12px] font-bold">Practice Owner, Glow Dental</p>
              </blockquote>
            </div>
          </CaseSection>

          <CaseSection id="case-6" number="06" title="What they say">
            <div className="grid gap-5 md:grid-cols-4">
              {["Less chasing", "Happier patients", "Visible results", "Clear ownership"].map((item) => (
                <article key={item} className="text-center">
                  <Check className="mx-auto size-9" />
                  <h3 className="mt-4 text-[15px] font-black">{item}</h3>
                  <p className="mt-2 text-[12px] font-semibold leading-[1.4] text-black/60">The system closes the gap so the team can focus on care.</p>
                </article>
              ))}
            </div>
          </CaseSection>

          <CaseSection id="case-7" number="07" title="Project details">
            <div className="grid gap-5 md:grid-cols-5">
              {["Scope: enquiry follow-up from website, phone and walk-ins", "Integrations: practice software, email, SMS", "Implementation: 4 weeks from review to go live", "Prototype shown before implementation", "Ongoing: Sorted manages and optimises"].map((item) => (
                <p key={item} className="rounded-[12px] border border-black/10 bg-white p-4 text-[12px] font-bold leading-[1.4]">{item}</p>
              ))}
            </div>
          </CaseSection>

          <CtaBand title="What could we recover in your business?" copy="Show us one gap that is frustrating you and we will show you what could change." />
          <V2Footer />
        </main>
      </div>
    </V2Page>
  )
}

function Meta({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="size-8" />
      <div><p className="text-[11px] font-bold text-black/50">{label}</p><p className="text-[12px] font-black">{value}</p></div>
    </div>
  )
}

function CaseSection({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-[1120px] border-t border-black/10 px-5 py-9 sm:px-8">
      <div className="mb-6 flex items-center gap-4">
        <span className="rounded bg-[#dfff00] px-2 py-1 text-[13px] font-black">{number}</span>
        <SectionTitle title={title} />
      </div>
      {children}
    </section>
  )
}

function Flow({ labels }: { labels: string[] }) {
  return (
    <div className="grid gap-4 rounded-[14px] border border-black/10 bg-white p-5 md:grid-cols-5">
      {labels.map((label) => (
        <div key={label} className="text-center">
          <UsersRound className="mx-auto size-9" />
          <p className="mt-3 text-[11px] font-black leading-[1.25]">{label}</p>
        </div>
      ))}
    </div>
  )
}
