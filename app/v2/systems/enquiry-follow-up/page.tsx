import type { Metadata } from "next"
import { CheckCircle2, Clock3, Eye, Mail, MessageCircle, Settings2, UserRound, Workflow, X } from "lucide-react"
import { CheckList, CtaBand, MarkerText, SectionTitle, V2Footer, V2Header, V2Page } from "../../_components/V2Primitives"
import { RoutineFinderButton } from "../../_components/RoutineFinder"

export const metadata: Metadata = {
  title: "Follow — Never lose another enquiry | Sorted Ops",
  description: "Follow is the enquiry system from Sorted Ops. It captures every enquiry, responds immediately, reminds your team, and automates follow-up until it is answered, booked, or closed.",
}

const features = [
  ["Responds instantly", "Acknowledges every enquiry immediately so your business looks responsive."],
  ["Follows up automatically", "Sends the right messages at the right time across email, SMS, or WhatsApp."],
  ["Stops when they reply", "Pauses as soon as a prospect responds so you never double up."],
  ["Alerts your team", "Notifies the right person when a human response is needed."],
  ["Keeps everything recorded", "Every action is logged so you always know what happened."],
  ["Shows what is working", "Live dashboard shows response, conversations, and conversions."],
  ["Easy to tailor", "Messages, timing, and rules are customised to your business."],
  ["Works with your tools", "Connects to your CRM, forms, calendars, and other systems."],
]

export default function EnquiryFollowUpPage() {
  return (
    <V2Page>
      <V2Header active="problems" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-10 pt-8 sm:px-8 md:grid-cols-[1fr_1fr] md:items-center">
        <div>
          <p className="mb-5 inline-flex items-center rounded-full bg-[#dfff00] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.1em]">
            A Sorted Ops system
          </p>
          <h1 className="max-w-[620px] text-[clamp(4rem,7.2vw,6.7rem)] font-black leading-[0.9] tracking-[-0.05em]">
            Follow.
            <br />
            <MarkerText className="block text-[clamp(3.1rem,5.7vw,5.55rem)]">Never lose another enquiry.</MarkerText>
          </h1>
          <p className="mt-7 max-w-[510px] text-[15px] font-semibold leading-[1.6] tracking-[-0.025em]">
            Follow is the enquiry system for your business. It captures every enquiry, responds immediately, reminds your team, and keeps following up until it is answered, booked, or closed.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <RoutineFinderButton label="See what this would look like in your business" variant="primary" />
            <a href="/ops/reviews/glow-dental" className="inline-flex h-12 items-center rounded-full border border-black/20 px-5 text-[11px] font-black">
              See an example review
            </a>
          </div>
        </div>
        <div className="rounded-[22px] bg-[#f7efe3] p-7 shadow-[0_22px_55px_rgba(20,14,8,0.13)]">
          <SectionTitle title="This system recovers opportunity." />
          <div className="mt-8 grid grid-cols-4 divide-x divide-black/15 text-center">
            {[
              [MessageCircle, "63%", "more enquiries responded to"],
              [Clock3, "2.4x", "faster average response time"],
              [UserRound, "41%", "more enquiries converted"],
              [CheckCircle2, "3.8x", "more reviews from leads"],
            ].map(([Icon, value, label]) => {
              const RealIcon = Icon as typeof MessageCircle
              return (
                <div key={value as string} className="px-4">
                  <RealIcon className="mx-auto size-10" strokeWidth={2.1} />
                  <p className="mt-4 text-[30px] font-black tracking-[-0.06em]">{value as string}</p>
                  <p className="mt-2 text-[10px] font-black leading-[1.25] text-black/65">{label as string}</p>
                </div>
              )
            })}
          </div>
          <div className="mx-auto mt-8 max-w-[430px] rounded-[16px] bg-[#070707] px-8 py-4 text-center text-white">
            <p className="[font-family:var(--font-v2-marker)] text-[1.8rem]">MORE CONVERSATIONS. MORE CUSTOMERS.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-5 px-5 py-8 sm:px-8 md:grid-cols-2">
        <WorkflowCard
          title="What happens now"
          tone="pink"
          icons={[Mail, Eye, Clock3, Settings2, X]}
          labels={["Enquiry comes in", "Someone sees it", "Intend to reply", "Day gets busy", "Enquiry disappears"]}
          note="No clear owner. No reminders. Life gets in the way. Interested customers move on."
        />
        <WorkflowCard
          title="What Follow does"
          tone="green"
          icons={[Mail, CheckCircle2, Workflow, MessageCircle, UserRound, CheckCircle2]}
          labels={["Enquiry comes in", "Instant acknowledgement", "Follow-up sequence", "Human takes over", "Right time", "Converted"]}
          note="Every enquiry gets a timely, personalised follow-up until it is answered, booked, or closed."
        />
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-8 px-5 py-8 sm:px-8 md:grid-cols-[1.15fr_0.85fr]">
        <div>
          <SectionTitle title="What Follow does for you" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([title, copy]) => (
              <article key={title}>
                <MessageCircle className="mb-4 size-8" strokeWidth={2.1} />
                <h2 className="text-[15px] font-black tracking-[-0.035em]">{title}</h2>
                <p className="mt-2 text-[12px] font-semibold leading-[1.45] text-black/62">{copy}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="rounded-[18px] bg-[#f4f3ef] p-7">
          <SectionTitle title="What your team still does" />
          <div className="mt-7">
            <CheckList items={["Have real conversations", "Answer questions that need judgement", "Build relationships and trust", "Close and deliver the service"]} />
          </div>
          <div className="my-7 border-t border-black/12" />
          <SectionTitle title="What you receive" />
          <div className="mt-7">
            <CheckList items={["Configured follow-up system", "Message templates approved for your brand", "Integrations and data connections", "Testing and quality assurance", "Dashboard and reporting", "Training and handover", "Ongoing support optional"]} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-5 rounded-[18px] bg-[#070707] p-7 text-white md:grid-cols-[0.24fr_0.76fr] md:items-center">
          <div>
            <SectionTitle title="See it in action" />
            <p className="mt-7 text-[13px] font-semibold leading-[1.5] text-white/75">Here is an example of how an enquiry flows through the system.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {["New enquiry", "Instant reply sent", "Follow-up 1", "Replied", "Converted"].map((title, index) => (
              <article key={title} className="min-h-36 rounded-[12px] bg-white p-4 text-black">
                <p className="text-[12px] font-black">{title}</p>
                <p className="mt-5 text-[11px] font-semibold leading-[1.35] text-black/62">{["Name: Sarah T.", "Thanks Sarah, we received your enquiry.", "Checking you saw our info.", "Yes, I would like to book.", "Booked in."][index]}</p>
                <p className="mt-4 inline-flex rounded-full bg-[#dfff00] px-2 py-1 text-[9px] font-black">{index < 2 ? "NEW" : "OK"}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-8 px-5 py-8 sm:px-8 md:grid-cols-[0.9fr_1.1fr_0.55fr]">
        <div>
          <SectionTitle title="Real result" />
          <div className="mt-7 rounded-[14px] border border-black/10 bg-white p-5">
            <p className="text-[22px] font-black tracking-[-0.05em]">Glow Dental</p>
            <p className="mt-1 text-[12px] font-semibold text-black/55">Dental Practice, 3 chairs</p>
            <CheckList items={["Before: 38% enquiries never responded to", "After: 82% enquiries responded to", "Enquiries converted: +41%", "Monthly treatment value recovered: £8,400"]} />
            <a href="/ops/case-studies/glow-dental" className="mt-5 inline-flex min-h-11 items-center gap-3 text-[12px] font-black">View full case study</a>
          </div>
        </div>
        <div>
          <SectionTitle title="Common questions" />
          <div className="mt-7 divide-y divide-black/10 rounded-[14px] border border-black/10 bg-white">
            {["Can this work with our current form or website?", "How do you know when to stop following up?", "Can the messages be customised?", "What if we already use a CRM?", "How long does it take to set up?"].map((q) => (
              <div key={q} className="flex items-center justify-between px-5 py-4 text-[13px] font-black">
                {q}
                <span>+</span>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-[14px] border border-black/10 bg-white p-6">
          <SectionTitle title="Is Follow right for you?" />
          <p className="mt-6 text-[13px] font-semibold leading-[1.5] text-black/65">If you get enquiries but are not sure every one of them gets the follow-up they deserve, this system is for you.</p>
        </aside>
      </section>

      <CtaBand title="Let's make sure no enquiry falls through the cracks." copy="Tell us how your enquiries come in and we will take it from there." />
      <V2Footer />
    </V2Page>
  )
}

function WorkflowCard({ title, tone, icons, labels, note }: { title: string; tone: "pink" | "green"; icons: typeof Mail[]; labels: string[]; note: string }) {
  return (
    <article className="rounded-[18px] bg-[#f4f3ef] p-7">
      <SectionTitle title={title} />
      <div className="mt-8 grid grid-cols-5 gap-3 text-center">
        {icons.slice(0, 5).map((Icon, index) => (
          <div key={`${title}-${labels[index]}`}>
            <Icon className="mx-auto size-8" strokeWidth={2.1} />
            <p className="mt-3 text-[10px] font-black leading-[1.2]">{labels[index]}</p>
          </div>
        ))}
      </div>
      <div className={`mt-7 rounded-[12px] p-4 text-[13px] font-bold leading-[1.4] ${tone === "pink" ? "bg-[#ffd9eb]" : "bg-[#efffb7]"}`}>{note}</div>
    </article>
  )
}
