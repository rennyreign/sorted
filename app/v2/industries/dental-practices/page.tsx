import type { Metadata } from "next"
import { CalendarDays, CheckCircle2, Clock3, MessageCircle, Phone, PoundSterling, Star, UsersRound } from "lucide-react"
import { CtaBand, MarkerText, SectionTitle, V2Footer, V2Header, V2Page } from "../../_components/V2Primitives"
import { RoutineFinderButton } from "../../_components/RoutineFinder"

export const metadata: Metadata = {
  title: "Sorted for Dental Practices",
  description: "How Sorted helps dental practices reduce missed enquiries, treatment plan chasing, review gaps, and inactive patient drift.",
}

const routines = [
  ["Missed Call Response", Phone, "Every missed call gets an instant response while you carry on with your day."],
  ["Enquiry Follow-Up", MessageCircle, "No more enquiries disappearing. Every lead is followed up at the right time."],
  ["Treatment Plan Follow-Up", CheckCircle2, "Help more patients say yes to treatment with timely, personal follow-up."],
  ["Appointment Reminders", CalendarDays, "Reduce no-shows and last-minute cancellations with smart reminders."],
  ["Review Collection", Star, "Get more 5-star reviews from happy patients without asking manually."],
  ["Inactive Patient Reactivation", UsersRound, "Bring back patients who have not been in for 6, 12, or 24 months."],
]

export default function DentalPracticesPage() {
  return (
    <V2Page>
      <V2Header active="problems" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-10 pt-8 sm:px-8 md:grid-cols-[0.88fr_1.12fr] md:items-center">
        <div>
          <h1 className="max-w-[560px] text-[clamp(4rem,7.2vw,6.7rem)] font-black leading-[0.9] tracking-[-0.05em]">
            More patients.
            <br />
            Less chasing.
            <br />
            <MarkerText className="block text-[clamp(3.2rem,6vw,5.6rem)]">Better care.</MarkerText>
          </h1>
          <p className="mt-7 max-w-[470px] text-[17px] font-semibold leading-[1.55] tracking-[-0.03em]">
            We help dental practices stop losing enquiries, fill more appointments, and build lasting patient relationships automatically.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <RoutineFinderButton label="Start the diagnostic" variant="primary" />
            <a href="/ops/case-studies/glow-dental" className="inline-flex h-12 items-center gap-4 rounded-full px-5 text-[11px] font-black">See an example review</a>
          </div>
        </div>
        <div>
          <div className="relative grid min-h-[330px] place-items-center overflow-hidden rounded-[18px] bg-[#e9dfd2] shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
            <div className="absolute left-8 top-8 max-w-[245px] rounded-[12px] bg-white p-5 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
              <p className="[font-family:var(--font-v2-marker)] text-[1.9rem] leading-[1.1]">Most lost patients are not saying no. They just never hear from you again.</p>
            </div>
            <p className="text-[48px] font-black tracking-[-0.08em] text-white drop-shadow">DENTAL<br />PRACTICE</p>
          </div>
          <div className="-mt-10 mx-auto grid max-w-[650px] grid-cols-4 divide-x divide-white/20 rounded-[14px] bg-[#070707] p-5 text-center text-white">
            {[
              [MessageCircle, "63", "Enquiries recovered per month"],
              [Clock3, "24.6", "Hours returned per month"],
              [Star, "1,240", "Reviews potential"],
              [PoundSterling, "£8,400", "Value recovered per month"],
            ].map(([Icon, value, label]) => {
              const RealIcon = Icon as typeof MessageCircle
              return (
                <div key={value as string} className="px-4">
                  <RealIcon className="mx-auto size-8" />
                  <p className="mt-3 text-[30px] font-black text-[#dfff00]">{value as string}</p>
                  <p className="mt-2 text-[8px] font-black uppercase leading-[1.2]">{label as string}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <SectionTitle title="We close the gaps that cost dental practices every day." center />
        <div className="mt-10 grid gap-4 md:grid-cols-6">
          {routines.map(([title, Icon, copy]) => {
            const RealIcon = Icon as typeof Phone
            return (
              <a key={title as string} href="/ops/problems/we-lose-customers" className="rounded-[14px] border border-black/10 bg-white p-5 text-center shadow-[0_14px_40px_rgba(0,0,0,0.035)]">
                <span className="mx-auto grid size-14 place-items-center rounded-full border-2 border-[#dfff00] bg-[#f3ff8a]">
                  <RealIcon className="size-8" />
                </span>
                <h2 className="mt-5 text-[18px] font-black leading-[1.1] tracking-[-0.045em]">{title as string}</h2>
                <p className="mt-3 min-h-20 text-[12px] font-semibold leading-[1.4] text-black/62">{copy as string}</p>
                <p className="mt-4 text-[12px] font-black text-[#9ab200]">Learn more</p>
              </a>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-8 rounded-[18px] bg-[#070707] p-7 text-white md:grid-cols-[0.9fr_0.5fr_1.1fr] md:items-center">
          <div>
            <h2 className="text-[36px] font-black leading-[1.05] tracking-[-0.06em]">How Glow Dental recovered 63 enquiries every month.</h2>
            <p className="mt-5 text-[15px] font-semibold leading-[1.5] text-white/75">A 3-chair practice. No marketing change. Just a better system behind the scenes.</p>
            <a href="/ops/case-studies/glow-dental" className="mt-7 inline-flex h-12 items-center gap-4 rounded-full bg-[#dfff00] px-6 text-[12px] font-black text-black">Read the full case study</a>
          </div>
          <div className="space-y-5">
            <p className="text-[20px] font-black text-[#dfff00]">63 <span className="block text-[11px] text-white">enquiries recovered per month</span></p>
            <p className="text-[20px] font-black text-[#dfff00]">24.6 <span className="block text-[11px] text-white">hours returned per month</span></p>
            <p className="text-[20px] font-black text-[#dfff00]">£8,400 <span className="block text-[11px] text-white">value recovered per month</span></p>
          </div>
          <div className="relative min-h-[240px] rounded-[14px] bg-[#e9dfd2] p-6">
            <p className="absolute bottom-6 right-6 max-w-[270px] rounded-[12px] bg-white p-5 text-[15px] font-bold leading-[1.45] text-black shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
              Sorted built the system we did not know we needed. It works in the background so my team does not have to think about it.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-6 rounded-[18px] bg-[#f4f3ef] p-7 md:grid-cols-[0.28fr_0.72fr] md:items-center">
          <div>
            <h2 className="text-[36px] font-black leading-[1.05] tracking-[-0.06em]">See what a review looks like.</h2>
            <p className="mt-5 text-[14px] font-semibold leading-[1.5]">We analyse one gap, identify what it's costing you, and show you what a better version looks like.</p>
            <a href="/ops/reviews/glow-dental" className="mt-6 inline-flex h-11 items-center gap-4 rounded-full bg-[#070707] px-5 text-[11px] font-black text-white">View an example review</a>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {["Diagnostic Review", "The real cost", "Our recommendation", "Impact forecast"].map((item) => (
              <article key={item} className="min-h-44 rounded-[12px] bg-white p-5 shadow-[0_12px_35px_rgba(0,0,0,0.08)]">
                <p className="text-[11px] font-black text-[#cfe900]">0{item.length % 7}</p>
                <p className="mt-5 text-[18px] font-black tracking-[-0.04em]">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <SectionTitle title="What to expect" center />
        <div className="mt-8 grid gap-4 md:grid-cols-[repeat(5,1fr)_0.9fr]">
          {["Tell us about one frustrating gap.", "We review how it works today.", "We recommend the best fix.", "We show you a working demo.", "You decide what is worth doing."].map((step, index) => (
            <article key={step} className="relative rounded-[14px] border border-black/10 bg-white p-5">
              <span className="absolute -top-3 left-5 grid size-7 place-items-center rounded-full bg-[#dfff00] text-[12px] font-black">{index + 1}</span>
              <p className="mt-5 text-[13px] font-black leading-[1.35]">{step}</p>
            </article>
          ))}
          <aside className="rounded-[14px] bg-[#eefaa9] p-5">
            <p className="text-[17px] font-black leading-[1.25]">No obligation. No sales pitch. Just a useful review.</p>
            <RoutineFinderButton label="Start the diagnostic" variant="nav" className="mt-6" />
          </aside>
        </div>
      </section>

      <CtaBand title="Let's find the gap costing your practice patients." copy="Show us where patients are slipping through and we will show you what can change." />
      <V2Footer />
    </V2Page>
  )
}
