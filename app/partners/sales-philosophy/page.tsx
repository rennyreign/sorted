import type { Metadata } from "next"
import type { ReactNode } from "react"
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  DoorOpen,
  Eye,
  Handshake,
  HelpCircle,
  MessageSquareText,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react"
import { AffiliatesFooter, AffiliatesHeader, AffiliatesPage, Underline } from "../_components/AffiliatesPrimitives"

export const metadata: Metadata = {
  title: "Sales Philosophy | Sorted Partners",
  description:
    "How the Sorted Partners scheme works: identify the right businesses, open useful conversations, and introduce prospects to Sorted.",
}

const anchors = [
  {
    icon: Eye,
    title: "Show first",
    copy: "The product is the proof. Let the mockup make the opportunity obvious before anyone is asked to commit.",
  },
  {
    icon: DoorOpen,
    title: "Open doors",
    copy: "Your job is the trusted introduction. Find the gap, make the connection, then let Sorted carry the build conversation.",
  },
  {
    icon: ShieldCheck,
    title: "Never criticise",
    copy: "A weak website is not a character flaw. Keep the tone respectful, specific, and focused on what better presentation could unlock.",
  },
  {
    icon: SearchCheck,
    title: "Qualify honestly",
    copy: "Not every business is a fit. Protect your time, their time, and the Sorted standard by saying no when the signal is weak.",
  },
]

const pillars = [
  ["Trust", "Make the business look as capable online as it is in real life."],
  ["Enquiries", "Give visitors a clearer reason to call, book, visit, or request a quote."],
  ["Customers", "Turn attention into action with stronger pages, clearer offers."],
]

const customerTypes = [
  "Local services",
  "Trades",
  "Clinics",
  "Beauty and wellness",
  "Food businesses",
  "Fitness studios",
  "Professional services",
  "Booking-led operators",
]

const salesMotion = [
  ["Identify", "Spot businesses with real-world quality that their current website does not show."],
  ["Review", "Check the basic fit: active business, visible offer, clear local market, obvious trust gap."],
  ["Create", "Submit the mockup request with enough context for Sorted to produce a credible first look."],
  ["Introduce", "Frame the mockup as a useful look at what better could look like, not a pressure pitch."],
  ["Conversation", "Listen for priorities, timing, decision process, and whether the website is blocking growth."],
  ["Agreement", "If the client wants the site, Sorted handles scope, payment, build, and delivery."],
]

const discoveryQuestions = [
  "Where do most new customers come from right now?",
  "What do you want someone to do when they hit the site?",
  "Does the website make the business look as good as it is?",
  "What do people need to see before they call, book, or visit?",
  "What should customers know that is hard to find online?",
  "If the site worked harder, what would you want more of?",
]

const objections = [
  {
    concern: "We already have a website.",
    response:
      "Good. The question is whether it is pulling its weight. Does it help people trust you, contact you, and choose you?",
  },
  {
    concern: "We are not looking to spend right now.",
    response:
      "That is fair. We can show you the direction first. If it is not useful, you do not need to take it further.",
  },
  {
    concern: "We get enough work already.",
    response:
      "That is a good position to be in. A stronger site can still bring in better-fit enquiries and save you answering the same questions every week.",
  },
  {
    concern: "We had a bad experience before.",
    response:
      "That is exactly why we show the work first. You see the direction before you commit to anything.",
  },
]

const standards = ["Professional", "Friendly", "Curious", "Helpful", "Honest", "Respectful of time"]

export default function AffiliateDoctrinePage() {
  return (
    <AffiliatesPage>
      <AffiliatesHeader active="sales-philosophy" showLogin={false} />

      <section className="mx-auto grid max-w-[1220px] gap-8 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[0.98fr_1.02fr] lg:items-end">
        <div>
          <p className="mb-5 text-[12px] font-black uppercase tracking-[0.12em] text-black/45">
            Sales Philosophy
          </p>
          <h1 className="max-w-[760px] text-[clamp(3.4rem,8vw,8.8rem)] font-black leading-[0.86] tracking-[-0.06em]">
            We don&apos;t sell.
          </h1>
          <div className="mt-2 [font-family:var(--font-aff-highlight)] text-[clamp(3.3rem,6.5vw,7rem)] font-normal leading-[0.84] tracking-[-0.02em] text-[#d4ea00]">
            We show.
          </div>
          <Underline className="mt-3 w-[min(390px,78vw)]" />
        </div>

        <aside className="border-l-[6px] border-[#dfff00] bg-[#f7f1e8] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.045)] sm:p-8">
          <p className="text-[13px] font-black uppercase tracking-[0.1em] text-black/45">The role</p>
          <p className="mt-4 text-[clamp(1.6rem,2.6vw,2.7rem)] font-black leading-[1] tracking-[-0.05em]">
            Find business owners whose current site is costing them trust, enquiries, bookings, or sales.
          </p>
          <p className="mt-5 max-w-[520px] text-[15px] font-semibold leading-[1.55] text-black/68">
            You are not a web designer, closer, or critic. You are the person who notices when a capable business is being undersold online and opens a useful door.
          </p>
        </aside>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-3 md:grid-cols-4">
          {anchors.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="border border-black/10 bg-white p-5 shadow-[0_14px_36px_rgba(0,0,0,0.035)]">
              <span className="grid size-11 place-items-center bg-[#070707] text-[#dfff00]">
                <Icon className="size-5" strokeWidth={2.4} />
              </span>
              <h2 className="mt-5 text-[18px] font-black tracking-[-0.04em]">{title}</h2>
              <p className="mt-3 text-[13px] font-semibold leading-[1.48] text-black/64">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[0.37fr_0.63fr]">
        <div className="bg-[#070707] p-6 text-white sm:p-8">
          <p className="text-[12px] font-black uppercase tracking-[0.12em] text-white/48">What Sorted improves</p>
          <h2 className="mt-4 text-[clamp(2.2rem,4.2vw,4.5rem)] font-black leading-[0.93] tracking-[-0.055em]">
            The three reasons a site matters.
          </h2>
          <p className="mt-6 max-w-[390px] text-[14px] font-semibold leading-[1.55] text-white/72">
            Keep every conversation attached to commercial usefulness. Sorted improves how a business is judged, contacted, and chosen.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {pillars.map(([title, copy], index) => (
            <article key={title} className="flex min-h-[260px] flex-col justify-between bg-[#f7f1e8] p-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-black/42">Pillar 0{index + 1}</span>
                <Sparkles className="size-5 text-black/50" strokeWidth={2.4} />
              </div>
              <div>
                <h3 className="text-[34px] font-black leading-none tracking-[-0.06em]">{title}</h3>
                <p className="mt-4 text-[13px] font-semibold leading-[1.5] text-black/66">{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.48fr_0.52fr] lg:items-start">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.12em] text-black/42">Ideal customer</p>
          <h2 className="mt-4 text-[clamp(2.4rem,5vw,5.3rem)] font-black leading-[0.9] tracking-[-0.055em]">
            Strong business. Weak website.
          </h2>
          <Underline className="mt-4 w-[270px]" />
          <p className="mt-6 max-w-[500px] text-[15px] font-semibold leading-[1.55] text-black/68">
            The best prospects already have something real: customers, reputation, expertise, footfall, reviews, referrals, or a clear service. The website is simply lagging behind.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-start gap-4">
              <Target className="mt-1 size-7 shrink-0" strokeWidth={2.3} />
              <div>
                <h3 className="text-[20px] font-black tracking-[-0.04em]">The signal</h3>
                <p className="mt-2 text-[14px] font-semibold leading-[1.55] text-black/66">
                  Their business is better than their website. If the online impression feels weaker than the real business, there is a useful conversation to open.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {customerTypes.map((type) => (
              <span key={type} className="bg-[#f7f1e8] px-4 py-3 text-[12px] font-black leading-tight tracking-[-0.02em]">
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-10 sm:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.12em] text-black/42">Sales motion</p>
            <h2 className="mt-3 text-[clamp(2.3rem,4.4vw,4.8rem)] font-black leading-[0.9] tracking-[-0.055em]">
              From first look to signed project.
            </h2>
          </div>
          <p className="max-w-[430px] text-[14px] font-semibold leading-[1.5] text-black/62">
            This is the path. Do not compress it into a pitch. Each step earns the next one.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-6">
          {salesMotion.map(([title, copy], index) => (
            <article key={title} className="relative bg-white p-5 ring-1 ring-black/10 md:min-h-[250px]">
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center bg-[#dfff00] text-[12px] font-black">{index + 1}</span>
                {index < salesMotion.length - 1 ? <ArrowRight className="hidden size-5 text-black/36 md:block" strokeWidth={2.5} /> : null}
              </div>
              <h3 className="mt-6 text-[18px] font-black tracking-[-0.04em]">{title}</h3>
              <p className="mt-3 text-[12px] font-semibold leading-[1.48] text-black/64">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-4 px-5 py-10 sm:px-8 lg:grid-cols-[0.42fr_0.58fr]">
        <div className="bg-[#f7f1e8] p-6 sm:p-8">
          <MessageSquareText className="size-8" strokeWidth={2.2} />
          <h2 className="mt-5 text-[clamp(2.2rem,4vw,4.2rem)] font-black leading-[0.9] tracking-[-0.055em]">
            Conversation toolkit.
          </h2>
          <p className="mt-5 text-[14px] font-semibold leading-[1.55] text-black/66">
            Ask questions that reveal whether the website is holding the business back. Keep the conversation practical, not theatrical.
          </p>
        </div>

        <div className="grid gap-4">
          <ManualPanel title="Discovery questions" icon={HelpCircle}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {discoveryQuestions.map((question) => (
                <li key={question} className="border-l-4 border-[#dfff00] bg-white px-4 py-3 text-[13px] font-bold leading-[1.45] text-black/72">
                  {question}
                </li>
              ))}
            </ul>
          </ManualPanel>

          <ManualPanel title="Objection responses" icon={ClipboardCheck}>
            <div className="grid gap-3">
              {objections.map(({ concern, response }) => (
                <article key={concern} className="grid gap-3 border border-black/10 bg-white p-4 sm:grid-cols-[0.34fr_0.66fr]">
                  <h4 className="text-[13px] font-black leading-[1.35] tracking-[-0.02em]">{concern}</h4>
                  <p className="text-[13px] font-semibold leading-[1.5] text-black/65">{response}</p>
                </article>
              ))}
            </div>
          </ManualPanel>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[0.62fr_0.38fr]">
        <div className="grid gap-2 sm:grid-cols-3">
          {standards.map((standard) => (
            <div key={standard} className="flex min-h-[92px] items-end justify-between bg-[#070707] p-4 text-white">
              <span className="text-[18px] font-black tracking-[-0.04em]">{standard}</span>
              <BadgeCheck className="size-5 text-[#dfff00]" strokeWidth={2.5} />
            </div>
          ))}
        </div>

        <aside className="border border-black/10 bg-white p-6 sm:p-8">
          <Users className="size-8" strokeWidth={2.2} />
          <h2 className="mt-5 text-[34px] font-black leading-[0.95] tracking-[-0.055em]">Partner standard</h2>
          <p className="mt-4 text-[14px] font-semibold leading-[1.55] text-black/66">
            Be easy to trust. Be specific. Be useful. Leave the business owner feeling respected, whether they buy or not.
          </p>
        </aside>
      </section>

      <section className="bg-[#070707] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto grid max-w-[1220px] gap-8 lg:grid-cols-[0.72fr_0.28fr] lg:items-center">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.12em] text-white/42">Closing reminder</p>
            <h2 className="mt-4 max-w-[850px] text-[clamp(2.4rem,5vw,5.4rem)] font-black leading-[0.9] tracking-[-0.055em]">
              Start with the website because it earns the trust for future modernisation.
            </h2>
          </div>
          <div className="border-l-[6px] border-[#dfff00] bg-white/8 p-6">
            <Handshake className="size-8 text-[#dfff00]" strokeWidth={2.2} />
            <p className="mt-5 text-[15px] font-semibold leading-[1.55] text-white/74">
              A website is the easiest useful proof. Once Sorted has helped the business get picked, get enquiries, and get chosen, bigger operational conversations become natural.
            </p>
          </div>
        </div>
      </section>

      <AffiliatesFooter />
    </AffiliatesPage>
  )
}

function ManualPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof HelpCircle
  children: ReactNode
}) {
  return (
    <section className="border border-black/10 bg-[#fbfbfa] p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 place-items-center bg-[#dfff00]">
          <Icon className="size-5" strokeWidth={2.5} />
        </span>
        <h3 className="text-[18px] font-black tracking-[-0.04em]">{title}</h3>
      </div>
      {children}
    </section>
  )
}
