import type { Metadata } from "next"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CircleDot,
  Factory,
  Handshake,
  Layers3,
  Network,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react"
import {
  AffiliatesFooter,
  AffiliatesHeader,
  AffiliatesPage,
  PrimaryButton,
  SectionTitle,
  Underline,
} from "../_components/AffiliatesPrimitives"

export const metadata: Metadata = {
  title: "Enterprise Partners | Website infrastructure for your business pipeline | Sorted",
  description:
    "Repeatable website delivery infrastructure for agencies, chambers, incubators, business networks and investors supporting a recurring pipeline of businesses.",
}

const partnerApplicationHref = "/partners/apply"

const audiences = [
  {
    title: "Agencies & consultancies",
    copy: "Add dependable web production behind your strategy, brand or growth relationships without assembling another internal delivery team.",
  },
  {
    title: "Chambers & business networks",
    copy: "Give members a clear route from an identified website need to a managed, visible delivery process.",
  },
  {
    title: "Incubators & accelerators",
    copy: "Help recurring cohorts establish credible digital infrastructure while your programme stays focused on the wider business journey.",
  },
  {
    title: "Investors & portfolio teams",
    copy: "Create a repeatable way to strengthen digital signal across portfolio businesses when a genuine commercial gap appears.",
  },
]

const operatingSteps: { icon: LucideIcon; title: string; copy: string }[] = [
  {
    icon: SlidersHorizontal,
    title: "Align the partnership",
    copy: "Agree pipeline, ownership, commercials, qualification and handoffs before delivery begins.",
  },
  {
    icon: Layers3,
    title: "Introduce or batch opportunities",
    copy: "Bring one qualified business, a cohort or a recurring flow into a clearly defined intake.",
  },
  {
    icon: Factory,
    title: "Sorted manufactures the website",
    copy: "Discovery, design, build and infrastructure move through a defined production system with progressive proof.",
  },
  {
    icon: Rocket,
    title: "Launch, visibility, next step",
    copy: "Launch with shared visibility, then identify the next useful intervention only where a real need is visible.",
  },
]

const capabilities = [
  ["Capacity", "Repeatable web production without requiring you to build or hire an internal team."],
  ["Delivery", "Discovery, design, build, hosting, CMS and launch support configured around the engagement."],
  ["Visibility", "Defined delivery stages and a central view across active opportunities."],
  ["Commercial fit", "Referral, factory or a tailored volume structure agreed around the working model."],
  ["Relationship protection", "Clear roles, handoffs and client ownership agreed before work starts."],
  ["Expansion", "Analytics, lead flow and digital operations considered when a useful need becomes visible."],
]

const qualifications = [
  "Regular access to businesses with a genuine website need",
  "Values long-term relationships over one-off transactions",
  "Wants a repeatable delivery partner, not ad hoc freelancers",
  "Ready to agree clear ownership, qualification and handoff rules",
]

export default function EnterprisePartnersPage() {
  return (
    <AffiliatesPage>
      <AffiliatesHeader active="enterprise" showLogin={false} />

      <section className="mx-auto grid max-w-[1220px] gap-12 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-16">
        <div>
          <h1 className="max-w-[720px] text-[2.45rem] font-black leading-[0.89] tracking-[-0.055em] min-[360px]:text-[clamp(2.7rem,6.3vw,6.8rem)]">
            Your pipeline.
            <br />
            Our website
            <br />
            infrastructure.
          </h1>
          <Underline className="mt-5 w-[min(360px,76vw)]" />
          <p className="mt-7 max-w-[590px] text-[clamp(1rem,1.45vw,1.18rem)] font-semibold leading-[1.55] tracking-[-0.025em] text-black/76">
            For organisations already trusted by businesses, Sorted adds dependable website manufacturing capacity without requiring you to build an internal web team.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <PrimaryButton
              href={partnerApplicationHref}
              track="cta_click"
              ctaText="Become a partner"
              ctaLocation="enterprise_hero"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-2"
            >
              Become a partner <ArrowRight className="size-4" strokeWidth={3} />
            </PrimaryButton>
          </div>
          <p className="mt-6 border-l-4 border-[#dfff00] pl-4 text-[12px] font-bold leading-[1.45] text-black/65">
            Built around your pipeline, volume and relationship model.
          </p>
        </div>

        <PipelineRail />
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-[1220px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.38fr_0.62fr] lg:gap-20 lg:py-24">
          <div>
            <h2 className="text-[clamp(2.5rem,4.7vw,4.8rem)] font-black leading-[0.94] tracking-[-0.045em]">
              Built for organisations already close to business.
            </h2>
            <Underline className="mt-6 w-36" />
          </div>

          <ol className="border-t border-black">
            {audiences.map(({ title, copy }, index) => (
              <li key={title} className="grid gap-3 border-b border-black/16 py-6 sm:grid-cols-[54px_0.8fr_1.2fr] sm:gap-5 sm:py-7">
                <span className="text-[11px] font-black tabular-nums text-black/65">0{index + 1}</span>
                <h3 className="text-[clamp(1.2rem,2vw,1.65rem)] font-black leading-[1.05] tracking-[-0.035em]">{title}</h3>
                <p className="max-w-[520px] text-[14px] font-semibold leading-[1.55] text-black/64">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="model" className="mx-auto max-w-[1220px] px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-7 lg:grid-cols-[0.58fr_0.42fr] lg:items-end">
          <SectionTitle title={<>One relationship in.<br />A repeatable delivery system out.</>} />
          <p className="max-w-[500px] text-[15px] font-semibold leading-[1.6] text-black/66 lg:justify-self-end">
            Each stage creates enough visibility and proof to earn the next decision. The system is designed to protect the trust that brought the opportunity in.
          </p>
        </div>

        <ol className="relative mt-12 grid gap-0 border-t border-black lg:grid-cols-4">
          {operatingSteps.map(({ icon: Icon, title, copy }, index) => (
            <li
              key={title}
              className="relative grid grid-cols-[56px_1fr] gap-4 border-b border-black/14 py-7 lg:block lg:min-h-[330px] lg:border-b-0 lg:border-r lg:px-6 lg:pb-8 lg:pt-10 last:lg:border-r-0"
            >
              <span className="grid size-11 place-items-center bg-[#070707] text-[13px] font-black text-white lg:size-12">
                0{index + 1}
              </span>
              <div>
                <Icon className="size-6 text-black lg:mt-12" strokeWidth={2.2} aria-hidden="true" />
                <h3 className="mt-4 max-w-[220px] text-[18px] font-black leading-[1.08] tracking-[-0.035em] lg:text-[20px]">{title}</h3>
                <p className="mt-3 max-w-[255px] text-[13px] font-semibold leading-[1.55] text-black/62">{copy}</p>
              </div>
              {index < operatingSteps.length - 1 ? (
                <span className="absolute -right-2 top-[44px] z-10 hidden size-4 rounded-full border-[5px] border-[#fbfbfa] bg-[#dfff00] lg:block" />
              ) : null}
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-3 border-t-[5px] border-[#dfff00] bg-[#f7f1e8] px-5 py-4 sm:px-6">
          <ShieldCheck className="size-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
          <p className="text-[12px] font-black uppercase tracking-[0.08em]">Progressive proof. Defined handoffs. Partner trust preserved.</p>
        </div>
      </section>

      <section className="bg-[#070707] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1220px]">
          <div className="grid gap-8 border-b border-white/20 pb-10 lg:grid-cols-[0.62fr_0.38fr] lg:items-end">
            <div>
              <h2 className="max-w-[820px] text-[clamp(2.7rem,5.3vw,5.6rem)] font-black leading-[0.92] tracking-[-0.05em]">
                What the partnership can include.
              </h2>
            </div>
            <div className="lg:justify-self-end">
              <p className="[font-family:var(--font-aff-highlight)] text-[clamp(2rem,3.6vw,3.5rem)] font-normal leading-[0.9] tracking-[-0.02em] text-[#d4ea00]">
                Built around the relationship.
              </p>
              <p className="mt-4 max-w-[420px] text-[13px] font-semibold leading-[1.55] text-white/64">
                The final shape is agreed around the partner. These are configurable capabilities, not a universal fixed package.
              </p>
            </div>
          </div>

          <dl>
            {capabilities.map(([term, description], index) => (
              <div key={term} className="grid gap-3 border-b border-white/16 py-6 sm:grid-cols-[64px_0.35fr_0.65fr] sm:items-start sm:gap-5 sm:py-7">
                <dt className="contents">
                  <span className="text-[10px] font-black tabular-nums text-[#dfff00]">0{index + 1}</span>
                  <span className="text-[18px] font-black tracking-[-0.035em] sm:text-[20px]">{term}</span>
                </dt>
                <dd className="max-w-[610px] text-[14px] font-semibold leading-[1.55] text-white/68">{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-[#f7f1e8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-[1220px] gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:gap-20">
          <div>
            <h2 className="text-[clamp(2.65rem,4.8vw,4.9rem)] font-black leading-[0.93] tracking-[-0.05em]">
              Infrastructure that starts with proof.
            </h2>
            <Underline className="mt-6 w-44" />
            <p className="mt-6 max-w-[390px] text-[14px] font-semibold leading-[1.58] text-black/65">
              The difference is the order of operations: make useful substance visible, then let commitment grow alongside evidence.
            </p>
          </div>

          <div className="border border-black bg-white">
            <div className="grid grid-cols-2 border-b border-black bg-[#070707] px-4 py-4 text-white sm:px-7">
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/58">Conventional outsourcing</p>
              <p className="border-l border-white/20 pl-4 text-[11px] font-black uppercase tracking-[0.1em] text-[#dfff00] sm:pl-7">Sorted infrastructure</p>
            </div>
            {[
              ["Sell the proposed outcome first", "Manufacture useful proof early"],
              ["Handoffs shaped project by project", "Defined production and handoff stages"],
              ["Capacity expands mainly with headcount", "Repeatable capability moves into the system"],
              ["Relationship context can fragment", "Roles and relationship ownership align upfront"],
            ].map(([conventional, sorted]) => (
              <div key={conventional} className="grid grid-cols-2 border-b border-black/12 last:border-b-0">
                <p className="p-4 text-[13px] font-semibold leading-[1.5] text-black/65 sm:p-7">{conventional}</p>
                <p className="border-l border-black/12 p-4 text-[13px] font-black leading-[1.5] text-black/86 sm:p-7">{sorted}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid overflow-hidden border border-black lg:grid-cols-[0.4fr_0.6fr]">
          <div className="flex flex-col justify-between bg-[#dfff00] p-7 sm:p-10 lg:min-h-[430px]">
            <div>
              <h2 className="max-w-[410px] text-[clamp(2.5rem,4.4vw,4.6rem)] font-black leading-[0.92] tracking-[-0.05em]">
                Start small. Prove the working model.
              </h2>
            </div>
            <p className="mt-10 max-w-[390px] text-[14px] font-bold leading-[1.55] text-black/68">
              A focused pilot gives both sides evidence before either builds a larger operating commitment around the partnership.
            </p>
          </div>
          <div className="bg-white p-7 sm:p-10 lg:p-12">
            <ul className="border-t border-black">
              {qualifications.map((qualification) => (
                <li key={qualification} className="flex items-start gap-4 border-b border-black/14 py-5 text-[15px] font-black leading-[1.4] tracking-[-0.02em]">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center bg-[#070707] text-[#dfff00]">
                    <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {qualification}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-black bg-white px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-[1220px] gap-8 lg:grid-cols-[0.68fr_0.32fr] lg:items-end">
          <div>
            <h2 className="max-w-[900px] text-[clamp(2.8rem,5.7vw,6rem)] font-black leading-[0.91] tracking-[-0.055em]">
              Start with one pipeline, one cohort or one portfolio.
            </h2>
            <p className="mt-6 max-w-[690px] text-[16px] font-semibold leading-[1.55] text-black/66">
              Begin with a focused conversation and a small, evidence-backed pilot rather than a large commitment.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <PrimaryButton
              href={partnerApplicationHref}
              track="cta_click"
              ctaText="Become a partner"
              ctaLocation="enterprise_final_cta"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-2"
            >
              Become a partner <ArrowRight className="size-4" strokeWidth={3} />
            </PrimaryButton>
            <a
              href="/partners/what-you-earn"
              className="inline-flex min-h-11 items-center gap-2 text-[12px] font-black underline decoration-2 decoration-[#dfff00] underline-offset-4 transition-colors hover:text-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
            >
              Explore standard partner options <ArrowRight className="size-4" strokeWidth={2.7} />
            </a>
          </div>
        </div>
      </section>

      <AffiliatesFooter variant="enterprise" />
    </AffiliatesPage>
  )
}

function PipelineRail() {
  const stages: { icon: LucideIcon; title: string; copy: string }[] = [
    {
      icon: Network,
      title: "Trusted access",
      copy: "Your network, cohort or portfolio brings a qualified need into view.",
    },
    {
      icon: Factory,
      title: "Manufacture",
      copy: "We scope, design, build and prepare the website infrastructure.",
    },
    {
      icon: Building2,
      title: "Launch",
      copy: "The business moves forward with a credible website foundation.",
    },
    {
      icon: Handshake,
      title: "Relationship retained",
      copy: "You keep the relationship. Delivery returns with visibility and proof.",
    },
  ]

  return (
    <figure aria-labelledby="pipeline-title" className="relative border border-black bg-white shadow-[14px_14px_0_#f7f1e8] sm:shadow-[18px_18px_0_#f7f1e8]">
      <div className="flex items-center justify-between border-b border-black px-5 py-4">
        <div>
          <h2 id="pipeline-title" className="text-[15px] font-black tracking-[-0.03em]">Relationship-preserving pipeline</h2>
        </div>
        <CircleDot className="size-5 text-[#bfd500]" strokeWidth={2.5} aria-hidden="true" />
      </div>

      <ol className="relative grid px-5 py-6 before:absolute before:bottom-10 before:left-[42px] before:top-10 before:w-px before:bg-[#dfff00] sm:grid-cols-4 sm:gap-3 sm:px-6 sm:py-10 sm:before:bottom-auto sm:before:left-[12.5%] sm:before:right-[12.5%] sm:before:top-[60px] sm:before:h-[3px] sm:before:w-auto">
        {stages.map(({ icon: Icon, title, copy }, index) => (
          <li key={title} className="relative grid grid-cols-[44px_1fr] gap-4 py-4 first:pt-0 last:pb-0 sm:block sm:px-1 sm:py-0">
            <span className={`relative z-10 grid size-9 place-items-center border-2 border-black sm:mx-auto sm:size-11 ${index === 1 ? "bg-[#070707] text-[#dfff00]" : index === 3 ? "bg-[#dfff00] text-black" : "bg-white text-black"}`}>
              <Icon className="size-4 sm:size-5" strokeWidth={2.4} aria-hidden="true" />
            </span>
            <div className="sm:mt-5 sm:text-center">
              <h3 className="text-[14px] font-black leading-[1.08] tracking-[-0.03em]">{title}</h3>
              <p className="mt-2 text-[11px] font-semibold leading-[1.45] text-black/65">{copy}</p>
            </div>
          </li>
        ))}
      </ol>

      <figcaption className="grid gap-4 border-t border-black bg-[#070707] px-5 py-5 text-white sm:grid-cols-[auto_1fr] sm:items-center">
        <span className="grid size-10 place-items-center bg-[#dfff00] text-black">
          <BadgeCheck className="size-5" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <div>
          <p className="text-[13px] font-bold leading-[1.4] text-white/82">Sorted supplies the manufacturing engine. You retain the relationship and the context around it.</p>
        </div>
      </figcaption>
    </figure>
  )
}
