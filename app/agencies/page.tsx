import type { Metadata } from "next"
import Image from "next/image"
import localFont from "next/font/local"
import {
  ArrowRight,
  ChartColumn,
  ChartLine,
  ChartNoAxesCombined,
  CircleHelp,
  Eye,
  FileText,
  Image as ImageIcon,
  Lightbulb,
  Mail,
  MessagesSquare,
  Monitor,
  MonitorSmartphone,
  Settings,
  Zap,
} from "lucide-react"
import { AgencyHeader } from "./_components/AgencyHeader"
import { AgencyObservers } from "./_components/AgencyObservers"
import { ExampleWorkspaceModal } from "./_components/ExampleWorkspaceModal"
import { HeroVideo, VideoWatchButton } from "./_components/HeroVideo"

const faveScript = localFont({
  src: "../../public/fonts/Fave-ScriptPro.ttf",
  variable: "--font-agency-script",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sorted for Agencies | Campaign Angle Manufacturing",
  description:
    "We manufacture complete, message-matched campaign journeys around the different reasons customers buy, so your team can test more purchasing motivations without the production burden.",
  alternates: {
    canonical: "/agencies",
  },
  openGraph: {
    title: "Sorted for Agencies | Campaign Angle Manufacturing",
    description:
      "You run the campaigns. We manufacture the angles. Complete, message-matched campaign journeys built for real experiments.",
    url: "/agencies",
  },
}

const CAL_URL = process.env.NEXT_PUBLIC_AGENCIES_CAL_URL ?? "https://cal.com/sortmydigital/discovery?layout=month_view&hideEventTypeDetails=true"

const benefits = [
  {
    icon: Zap,
    title: "Complete campaign journeys",
    subtitle: "Ads, landing pages, follow-ups and more.",
  },
  {
    icon: Settings,
    title: "No platform adoption",
    subtitle: "We work with your existing tools.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Built for real experiments",
    subtitle: "Turn customer motivations into test-ready hypotheses.",
  },
]

const sprintCards = [
  {
    label: "A",
    title: "Angle Expansion",
    eyebrow: "FIND MORE PERFORMANCE IN EXISTING CAMPAIGNS",
    body: [
      "Explore additional buying motivations within a campaign you’re already running.",
      "We develop new messaging, ad creative, copy and matching landing-page variants to help you test more ways to improve what’s already working.",
    ],
    question:
      "What other reasons might persuade this audience to act?",
  },
  {
    label: "B",
    title: "Angle Discovery",
    eyebrow: "TEST AN ENTIRELY DIFFERENT REASON TO BUY",
    body: [
      "Go beyond refining your existing proposition.",
      "We identify a distinct purchasing motivation and manufacture a complete challenger campaign around it: from advertising and landing pages to follow-up messaging.",
    ],
    question:
      "What demand might we be missing because we haven’t tested the right proposition?",
  },
]

const angles = [
  {
    num: "01",
    name: "Focus",
    motivation: "A place to channel a child’s energy, with something to work towards week after week.",
    ads: [
      { src: "/workspace/gb-halesowen/kids-b-square-01-1x1.png", alt: "More focus. More purpose. ad" },
      { src: "/workspace/gb-halesowen/kids-a-square-01-1x1.png", alt: "Confidence, one class at a time. ad" },
    ],
  },
  {
    num: "02",
    name: "Reassurance",
    motivation: "People facing a legal problem want to know where they stand before anything else.",
    ads: [
      { src: "/workspace/tann-law/ad-02-feed-1x1.webp", alt: "Tann Law reassurance ad" },
      { src: "/workspace/tann-law/ad-01-feed-1x1.webp", alt: "Tann Law clear advice ad" },
    ],
  },
  {
    num: "03",
    name: "Peace of mind",
    motivation: "Homeowners aren’t buying a boiler service. They’re buying a winter without worry.",
    ads: [
      { src: "/workspace/adams/ad-01.webp", alt: "Adams Plumbing peace of mind ad" },
      { src: "/workspace/adams/ad-02.webp", alt: "Adams Plumbing small jobs ad" },
    ],
  },
]

const deliverables = [
  { icon: FileText, title: "Two documented angle hypotheses" },
  { icon: Eye, title: "Two visual campaign previews for approval" },
  { icon: Monitor, title: "Two responsive landing-page experiences" },
  { icon: ImageIcon, title: "Two sets of ad copy and creative assets" },
  { icon: Mail, title: "Matching follow-up messaging for each angle" },
  { icon: ChartColumn, title: "Measurement and activation handover for both experiments" },
]

const letterBlocks = [
  { type: "lead", text: "If you’ve spent any meaningful time running performance marketing, you probably don’t need another person explaining the importance of testing." },
  { type: "paragraph", text: "You know your customers don’t all buy for the same reasons. You know your best campaign probably represents only a fraction of the purchasing motivations you could explore. And you almost certainly have people on your team who have already suggested some of them." },
  { type: "emphasis", text: "Knowing what might work and having the capacity to test it properly are two very different things." },
  { type: "paragraph", text: "Another creative? Fine. Another headline? Manageable. An entirely different buying motivation, carried consistently from the advertisement through the landing page, conversion experience and follow-up? That’s a project." },
  { type: "paragraph", text: "Someone needs to develop the argument. Someone needs to write it. Someone needs to design the creative. Someone needs to build the landing page. Someone needs to coordinate the follow-up. Someone needs to make sure everything is measurable. And all those people already have jobs to do." },
  { type: "paragraph", text: "So the idea joins the queue. Or gets simplified into another advert pointing at the existing landing page. Or disappears altogether. Not because it wasn’t worth testing. Because the organisation couldn’t afford to interrupt everything else to find out." },
  { type: "heading", text: "And that costs more than production time." },
  { type: "paragraph", text: "It means you keep spending money against the purchasing motivations you’ve already discovered, while potentially better ones remain unexplored. It means campaigns can become increasingly dependent on familiar propositions, even as their performance begins to deteriorate. It means your team is asked to extract more performance from the same arguments, rather than being given the capacity to investigate new ones." },
  { type: "paragraph", text: "And eventually, it means difficult conversations. Why isn’t the pipeline stronger? Why are leads becoming harder to convert? Why does the sales team keep questioning quality? Why are acquisition costs rising? Why haven’t we found another approach?" },
  { type: "emphasis", text: "Sometimes the problem isn’t that you’ve failed to optimise the campaigns you’re running. It’s that you haven’t been able to run enough meaningfully different campaigns to understand what else could work." },
  { type: "heading", text: "Another software platform isn’t necessarily the answer." },
  { type: "paragraph", text: "Your team probably has the tools it needs. What it doesn’t necessarily have is spare capacity to operate another production process. A new AI platform might produce landing pages faster. Another might generate creative variations. Another might automate follow-up. Each can be useful." },
  { type: "paragraph", text: "But somebody still needs to bring the thinking together, preserve the message across the journey, assess the quality and coordinate the experiment. And now you’ve introduced another system to learn, another workflow to establish and another thing for somebody to own." },
  { type: "emphasis", text: "I think most marketing leaders want the work done. Properly. Without creating another operational problem." },
  { type: "heading", text: "That’s why we built Sorted." },
  { type: "paragraph", text: "I spent 15 years in marketing, including as Head of Marketing at Bisk Education. And across that time I kept seeing the same problem: campaigns running at what felt like 20% of their potential because we simply didn’t have the capacity to do everything they needed." },
  { type: "paragraph", text: "We could see the opportunities. Better landing pages, more creative variations, stronger follow-up, more testing. But every improvement needed people, time and coordination, and the work kept piling up." },
  { type: "emphasis", text: "The distance between knowing what a campaign needs and having the resources to make it happen. That’s the gap Sorted was built to close." },
  { type: "paragraph", text: "Sorted was built around a simple idea: what if manufacturing another complete campaign angle wasn’t a major undertaking? Not another random set of AI-generated advertisements. A genuine purchasing hypothesis: developed into convincing advertising, relevant creative, a dedicated landing experience, matching follow-up messaging and the measurement requirements needed to test it." },
  { type: "paragraph", text: "And rather than asking your team to coordinate all of that, we take responsibility for manufacturing the agreed assets. You keep your campaigns, your technology, your customers and your judgement. We supply the work." },
  { type: "heading", text: "Here’s where we start." },
  { type: "paragraph", text: "Give us two active products or campaigns you believe have room to improve. For one, we’ll explore an additional motivation within the existing proposition. For the other, we’ll develop an entirely different reason somebody might buy." },
  { type: "paragraph", text: "We’ll show you the proposed campaign directions before full production. Once they’re approved, we’ll build the agreed advertising assets, landing pages and follow-up narratives, with a measurement and activation handover." },
  { type: "paragraph", text: "Your team runs the experiments. You see what resonates, what attracts the right people and what deserves further investment. We don’t know in advance which angle will win. That’s why we’re testing. But we can make it more practical to find out." },
  { type: "emphasis", text: "Your next meaningful improvement might not be a better version of the campaign you’re already running. It might be a conversation with customers you’ve never properly had." },
] as const

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6E6E6A]">
      {children}
    </p>
  )
}

export default function AgenciesPage() {
  return (
    <main id="top" className={`${faveScript.variable} min-h-screen bg-[#FAFAF7] font-sans text-[#0C0C0C] antialiased`}>
      <AgencyHeader />
      <AgencyObservers />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-[1180px] gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[0.52fr_0.48fr] lg:items-center lg:px-[60px] lg:pt-16">
        <div>
          <h1 className="text-[clamp(2.6rem,5.2vw,3.9rem)] font-black leading-[1.04] tracking-[-0.03em]">
            <span className="block">Are you optimizing campaigns?</span>
            <span className="block text-[#b8d900]">Or just keeping them running?</span>
          </h1>
          <p className="mt-6 max-w-[46ch] text-[15px] leading-[1.7] text-[#4a4a46]">
            Your team knows there’s more to test. But new angles mean more creative, landing pages, copy and production work nobody has time for.
          </p>
          <p className="mt-3 max-w-[46ch] text-[15px] font-semibold leading-[1.7] text-[#0C0C0C]">
            Sorted builds the experiments your team doesn’t have the capacity to produce.
          </p>
          <p className="mt-6 text-[clamp(1.15rem,2vw,1.4rem)] font-extrabold leading-[1.3] tracking-[-0.015em] text-[#0C0C0C]">
            We manufacture the angles you don’t have time for.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href="#book"
              data-track="hero_booking_cta_clicked"
              data-cta-location="hero"
              className="inline-flex items-center gap-2 rounded-full bg-[#0C0C0C] px-5 py-3 text-sm font-semibold text-[#FAFAF7] transition-all duration-200 hover:-translate-y-px hover:bg-[#2a2a2a]"
            >
              Book a campaign angle conversation
              <ArrowRight size={15} aria-hidden="true" />
            </a>
            <VideoWatchButton />
          </div>
        </div>

        <div className="relative">
          <HeroVideo />
        </div>
      </section>

      {/* ── Benefits strip ───────────────────────────────── */}
      <section className="border-t border-[#E6E6E2]">
        <div className="mx-auto grid max-w-[1180px] gap-6 px-5 py-10 sm:grid-cols-3 sm:px-8 lg:px-[60px]">
          {benefits.map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="flex items-start gap-3.5">
              <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#D4FF00]">
                <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[13.5px] font-bold leading-snug">{title}</span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-[#6E6E6A]">{subtitle}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sprint ───────────────────────────────────────── */}
      <section id="sprint" className="scroll-mt-20 border-t border-[#E6E6E2]">
        <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:px-[60px] lg:py-24">
          <h2 className="mx-auto max-w-[20ch] text-center text-[clamp(2.2rem,5vw,3.4rem)] font-black leading-[1.05] tracking-[-0.03em]">
            Test more angles. Without adding more to your team’s plate.
          </h2>
          <p className="mx-auto mt-4 max-w-[54ch] text-center text-[15px] leading-[1.7] text-[#4a4a46]">
            There’s more to test than your team has capacity for. Sorted gives you the production capacity to try new motivations, propositions and complete journeys.
          </p>
          <p className="mx-auto mt-3 max-w-[54ch] text-center text-[15px] font-semibold leading-[1.7] text-[#0C0C0C]">
            No extra hires. No new tools. No production headaches.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {sprintCards.map((card) => (
              <article
                key={card.label}
                className="rounded-2xl border border-black/[0.08] bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4FF00] text-[13px] font-black">
                    {card.label}
                  </span>
                  <h3 className="text-[1.05rem] font-extrabold tracking-tight">{card.title}</h3>
                </div>
                <p className="mt-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#6E6E6A]">
                  {card.eyebrow}
                </p>
                {card.body.map((p) => (
                  <p key={p.slice(0, 32)} className="mt-3 text-[13.5px] leading-[1.7] text-[#4a4a46]">
                    {p}
                  </p>
                ))}
                <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#F4F3EF] p-4">
                  <CircleHelp size={16} className="mt-0.5 flex-shrink-0 text-[#6E6E6A]" aria-hidden="true" />
                  <p className="text-[12.5px] leading-[1.6] text-[#3d3d39]">
                    <span className="font-bold">The question: </span>
                    {card.question}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Angles exhibit ───────────────────────────────── */}
      <section id="angles" className="border-t border-[#E6E6E2] bg-[#F4F3EF]">
        <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:px-[60px] lg:py-24">
          <h2 className="max-w-[24ch] text-[clamp(2.2rem,5vw,3.4rem)] font-black leading-[1.05] tracking-[-0.03em]">
            Different reasons people buy.
          </h2>
          <p className="mt-4 max-w-[58ch] text-[15px] leading-[1.7] text-[#4a4a46]">
            An angle isn’t a headline variation. It’s a different motivation, argued consistently from
            ad to landing page to follow-up. Real angles we’ve manufactured:
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {angles.map(({ num, name, motivation, ads }) => (
              <article
                key={num}
                className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4FF00] text-[13px] font-black">
                    {num}
                  </span>
                  <h3 className="text-[1.05rem] font-extrabold tracking-tight">{name}</h3>
                </div>
                <p className="mt-3 text-[13.5px] leading-[1.7] text-[#4a4a46]">{motivation}</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {ads.map((ad) => (
                    <div
                      key={ad.src}
                      className="relative aspect-square overflow-hidden rounded-lg border border-black/[0.06]"
                    >
                      <Image src={ad.src} alt={ad.alt} fill sizes="(min-width: 768px) 180px, 40vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <p className="mt-6 text-[12.5px] leading-[1.6] text-[#6E6E6A]">
            Real manufactured angles, shown with client permission. Each one ships with matching
            landing pages, follow-up messaging and measurement.
          </p>
        </div>
      </section>

      {/* ── Deliverables ─────────────────────────────────── */}
      <section className="border-t border-[#E6E6E2] bg-[#F4F3EF]">
        <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:px-[60px] lg:py-24">
          <p className="flex items-center justify-center gap-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a8a85]">
            <span className="h-px w-8 bg-[#c9c9c3]" aria-hidden="true" />
            LET&apos;S START WITH
            <span className="h-px w-8 bg-[#c9c9c3]" aria-hidden="true" />
          </p>
          <h2 className="mt-5 text-center text-[clamp(2.2rem,5vw,3.4rem)] font-black leading-[1.05] tracking-[-0.03em]">
            Two angles. Built to test.
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-center text-[15px] leading-[1.7] text-[#6E6E6A]">
            A complete, production-ready experiment, from strategy and creative to launch assets and measurement.
          </p>

          <div className="mt-11 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {deliverables.map(({ icon: Icon, title }) => (
              <div
                key={title}
                className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4FF00]">
                  <Icon size={18} strokeWidth={2} className="text-[#0C0C0C]" aria-hidden="true" />
                </span>
                <p className="mt-4 text-[13.5px] font-bold leading-[1.4] tracking-[-0.01em]">{title}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-black/[0.08] bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#D4FF00]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8.5L6.5 12L13 4.5" stroke="#0C0C0C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="text-[13px] leading-[1.65] text-[#6E6E6A]">
              Two angles, including actual production outputs, rather than strategy-only recommendations. Scope, number of creative variants, integration support and turnaround confirmed before payment.
            </p>
          </div>
        </div>
      </section>

      {/* ── What we do ───────────────────────────────────── */}
      <section className="border-t border-[#E6E6E2]">
        <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:px-[60px] lg:py-24">
          <div className="rounded-3xl border border-white/10 bg-[#080808] p-7 text-[#FAFAF7] sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f8f8a]">
                  WHAT WE DO
                </p>
                <h2 className="mt-4 text-[clamp(1.9rem,3.6vw,2.4rem)] font-black leading-[1.08] tracking-[-0.025em]">
                  We manufacture the angles.
                </h2>
                <p className="mt-3 text-[15px] leading-[1.7] text-white/60">
                  And everything needed to test them.
                </p>
                <div className="mt-10">
                  <p className="text-[13.5px] font-bold">Our core focus</p>
                  <p className="mt-1.5 max-w-[36ch] text-[13.5px] leading-[1.7] text-white/55">
                    Different reasons people buy, turned into complete campaign propositions.
                  </p>
                </div>
                <ExampleWorkspaceModal dark />
              </div>

              <ul className="space-y-7 self-center">
                {[
                  { icon: Lightbulb, title: "Campaign angles", sub: "Strategy, hooks, ad copy and creative", featured: true },
                  { icon: MonitorSmartphone, title: "Websites & landing pages", sub: "Complete, message-matched experiences" },
                  { icon: MessagesSquare, title: "Follow-up sequences", sub: "Email, SMS and conversion narratives" },
                  { icon: ChartLine, title: "Tracking & measurement", sub: "Events, conversion data and handover" },
                ].map(({ icon: Icon, title, sub, featured }) => (
                  <li key={title} className="flex items-start gap-4">
                    <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${featured ? "bg-[#D4FF00] text-[#0C0C0C]" : "bg-white/[0.07] text-white"}`}>
                      <Icon size={18} strokeWidth={2} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-[17px] font-extrabold leading-snug tracking-[-0.01em]">{title}</span>
                      <span className="mt-1 block text-[13.5px] leading-snug text-white/50">{sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 border-t border-white/10 pt-7">
              <p className="max-w-[72ch] text-[15px] leading-[1.7] text-white/60">
                Use the whole production chain or just what your team needs. Your agency keeps control of its campaigns, systems and clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why it works ─────────────────────────────────── */}
      <section className="border-t border-[#E6E6E2]">
        <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:px-[60px] lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.4fr_0.6fr] lg:gap-16">
            <div>
              <h2 className="text-[clamp(2.2rem,5vw,3.4rem)] font-black leading-[1.05] tracking-[-0.03em]">
                Modern production. Experienced judgment.
              </h2>
              <p className="mt-5 max-w-[42ch] text-[16px] leading-[1.7] text-[#6E6E6A]">
                Technology gives us production capacity. Marketing experience gives that production a purpose. Together, they make more meaningful experiments practical for your agency.
              </p>
            </div>

            <ol className="border-t border-[#E6E6E2]">
              {[
                {
                  n: "01",
                  title: "A production system built for speed",
                  body: "Modern production technology gives us the capacity to produce five campaign angles per hour, including landing pages, copy and ads built to a defined design system.",
                  note: "Production capacity, not a fixed delivery promise. Scope, review and activation requirements are agreed for each project.",
                },
                {
                  n: "02",
                  title: "On-brand creative, not generic output",
                  body: "Brand-guided image generation keeps creative aligned with your visual identity. Shared design specifications connect the ads and landing pages into one coherent campaign.",
                },
                {
                  n: "03",
                  title: "Commercial experience behind the work",
                  body: "Fifteen years in marketing and leadership, hands-on Facebook advertising expertise and responsibility for more than $2 million in annual ad spend inform the angles we develop.",
                },
                {
                  n: "04",
                  title: "Measurement built into the journey",
                  body: "Automated tracking and attribution infrastructure, paired with purpose-built dashboards, connect the campaign journey to the signals your team needs to evaluate each test.",
                },
                {
                  n: "05",
                  title: "A contributor, not just a production resource",
                  body: "We contribute subject-matter input and help present the thinking behind each angle, so your team can discuss the proposition, not just review the assets.",
                },
              ].map(({ n, title, body, note }: { n: string; title: string; body: string; note?: string }) => (
                <li key={n} className="flex gap-5 border-b border-[#E6E6E2] py-6 last:border-b-0 lg:py-7">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#D4FF00] text-[12px] font-black tabular-nums"
                  >
                    {n}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[19px] font-extrabold leading-snug tracking-[-0.01em]">
                      {title}
                    </span>
                    <span className="mt-2 block text-[16px] leading-[1.7] text-[#6E6E6A]">
                      {body}
                    </span>
                    {note ? (
                      <span className="mt-2.5 block text-[14px] leading-[1.6] text-[#8a8a85]">
                        {note}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── The letter ───────────────────────────────────── */}
      <section id="letter" className="scroll-mt-20 border-t border-[#E6E6E2] bg-[#F4F3EF]">
        <div className="mx-auto max-w-[720px] px-5 py-16 sm:px-8 lg:py-24">
          <Eyebrow>THE ELEPHANT IN THE ROOM</Eyebrow>
          <h2 className="mt-4 text-[clamp(2rem,4vw,2.4rem)] font-black leading-[1.08] tracking-[-0.025em]">
            <span className="block">Another campaign.</span>
            <span className="block text-[#6E6E6A]">Same conversation.</span>
          </h2>
          <p className="mt-4 text-[13.5px] italic leading-[1.7] text-[#6E6E6A]">
            An open letter to the people responsible for campaign performance.
          </p>

          <div className="mt-10">
            {letterBlocks.map((block, i) => {
              if (block.type === "lead") {
                return (
                  <p key={i} className="text-[17px] font-semibold leading-[1.7] text-[#0C0C0C]">
                    {block.text}
                  </p>
                )
              }
              if (block.type === "heading") {
                return (
                  <h3 key={i} className="mb-4 mt-10 text-[1.3rem] font-extrabold leading-[1.25] tracking-[-0.015em]">
                    {block.text}
                  </h3>
                )
              }
              if (block.type === "emphasis") {
                return (
                  <p key={i} className="my-6 border-l-[3px] border-[#D4FF00] pl-5 text-[16px] font-bold leading-[1.65] text-[#0C0C0C]">
                    {block.text}
                  </p>
                )
              }
              return (
                <p key={i} className="mt-5 text-[15px] leading-[1.8] text-[#3d3d39]">
                  {block.text}
                </p>
              )
            })}
          </div>

          <div className="mt-12">
            <p className="[font-family:var(--font-agency-script)] text-[2.4rem] leading-none text-[#0C0C0C]">
              Renaldo
            </p>
            <p className="mt-4 text-[14px] font-bold">Renaldo Edmondson</p>
            <p className="mt-0.5 text-[12.5px] text-[#6E6E6A]">Founder, Sorted</p>
          </div>
        </div>
      </section>

      {/* ── Book ─────────────────────────────────────────── */}
      <section id="book" className="scroll-mt-20 bg-[#080808] text-[#FAFAF7]">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-[60px] lg:py-24">
          <div>
            <h2 className="mt-4 text-[clamp(2rem,4vw,2.75rem)] font-black leading-[1.05] tracking-[-0.03em]">
              Book a campaign conversation.
            </h2>
            <p className="mt-5 max-w-[44ch] text-[15px] leading-[1.75] text-white/65">
              Let’s look at two campaigns and see what other opportunities might be worth testing.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-7 text-[#0C0C0C]">
            {CAL_URL ? (
              <>
                <iframe
                  src={CAL_URL}
                  title="Book a Campaign Angle Conversation"
                  className="h-[560px] w-full rounded-lg border-0"
                  loading="lazy"
                />
                <p className="mt-4 text-center text-[12px] text-[#6E6E6A]">
                  Prefer email?{" "}
                  <a href="mailto:hello@sortmydigital.site" className="font-semibold underline underline-offset-2">
                    hello@sortmydigital.site
                  </a>
                </p>
              </>
            ) : (
              <div className="flex min-h-[380px] flex-col items-center justify-center gap-4 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4FF00]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C0C0C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </span>
                <p className="text-[1.05rem] font-extrabold tracking-tight">Campaign Angle Conversation</p>
                <p className="max-w-[36ch] text-[13px] leading-[1.65] text-[#6E6E6A]">
                  The booking calendar is being connected. To book now, email us and we’ll find a time.
                </p>
                <a
                  href="mailto:hello@sortmydigital.site?subject=Campaign%20Angle%20Conversation"
                  className="mt-1 inline-flex items-center gap-2 rounded-full bg-[#0C0C0C] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-[#2a2a2a]"
                >
                  hello@sortmydigital.site
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-[#E6E6E2] bg-[#FAFAF7]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-5 py-10 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-[60px]">
          <div>
            <p className="font-sans text-xl font-black tracking-[-0.045em]">Sorted<span className="text-[#cfe900]">.</span></p>
            <p className="mt-1.5 max-w-[38ch] text-[12.5px] leading-[1.6] text-[#6E6E6A]">
              Campaign angle manufacturing for performance marketing teams.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              { label: "Top", href: "#top" },
              { label: "The Sprint", href: "#sprint" },
              { label: "The Letter", href: "#letter" },
              { label: "Book", href: "#book" },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="text-[12.5px] font-medium text-[#6E6E6A] transition-colors duration-200 hover:text-[#0C0C0C]">
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div className="border-t border-[#E6E6E2]">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-5 py-4 text-[11.5px] text-[#6E6E6A] sm:px-8 lg:px-[60px]">
            <p>© 2026 Sorted. All rights reserved.</p>
            <div className="flex gap-5">
              <a href="/privacy" className="transition-colors duration-200 hover:text-[#0C0C0C]">Privacy</a>
              <a href="/terms" className="transition-colors duration-200 hover:text-[#0C0C0C]">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
