import type { Metadata } from "next"
import {
  ArrowRight,
  BadgePoundSterling,
  BarChart3,
  Clock3,
  Check,
  HandCoins,
  PoundSterling,
  TrendingUp,
  Users,
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
  title: "What you earn | Sorted Partners",
  description:
    "Choose your way to earn with Sorted. Refer businesses and earn commission, or build your own website business at factory cost.",
}

export default function WhatYouEarnPage() {
  return (
    <AffiliatesPage>
      <AffiliatesHeader active="what-you-earn" />

      {/* Hero */}
      <section className="mx-auto grid max-w-[1220px] gap-8 px-5 pb-12 pt-12 sm:px-8 lg:grid-cols-[0.95fr_0.85fr] lg:items-start">
        <div>
          <p className="mb-5 text-[12px] font-black text-black/45">Sorted Partners Program</p>
          <h1 className="text-[clamp(3.2rem,6.2vw,6.8rem)] font-black leading-[0.92] tracking-[-0.045em]">
            Choose your
            <br />
            way to earn.
          </h1>
          <div className="mt-1 [font-family:var(--font-aff-highlight)] text-[clamp(3.2rem,6vw,6.4rem)] font-normal leading-[0.88] tracking-[-0.02em] text-[#d4ea00]">
            Grow with Sorted.
          </div>
          <Underline className="mt-2 w-[300px]" />
          <p className="mt-7 max-w-[460px] text-[17px] font-semibold leading-[1.5] tracking-[-0.03em]">
            Refer businesses or build your own website business. You choose the path that suits you. We handle the work, you earn more.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <PrimaryButton href="/partners/apply">
              Become a partner <ArrowRight className="size-4" strokeWidth={3} />
            </PrimaryButton>
            <span className="[font-family:var(--font-aff-highlight)] text-[23px] leading-none text-[#d0e600]">
              Free to join.
              <br />
              No minimums.
            </span>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FeatureTile icon={BadgePoundSterling} title="Earn up to £300" copy="Per qualified website sale." />
            <FeatureTile icon={Clock3} title="24hr mockup turnaround" copy="Most mockups built within a day." />
            <FeatureTile icon={Check} title="Zero upfront cost" copy="You never pay to join." />
            <FeatureTile icon={TrendingUp} title="Real-time tracking" copy="Track your referrals and earnings." />
          </div>
        </div>

        <PartnerDashboardMockup />
      </section>

      {/* Two ways to partner */}
      <section className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
        <p className="text-center text-[12px] font-black uppercase tracking-[0.12em] text-black/45">Two ways to partner</p>
        <h2 className="mt-3 text-center text-[clamp(2.2rem,4vw,4.2rem)] font-black leading-[0.95] tracking-[-0.04em]">
          Pick the path that fits your goals.
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
          <PathCard
            icon={Users}
            title="Referral Partner"
            subtitle="Earn commission for every sale."
            bullets={[
              "You refer, we handle the rest",
              "No pricing conversations",
              "Perfect for consultants, influencers and service providers",
              "Earn up to 30% per sale",
            ]}
            footerLabel="Earn up to 30% commission"
            featured={false}
          />

          <div className="flex items-center justify-center">
            <span className="grid size-12 place-items-center rounded-full bg-[#070707] text-[11px] font-black text-white md:size-14">
              OR
            </span>
          </div>

          <PathCard
            icon={BarChart3}
            title="Factory Partner"
            subtitle="Build your own business."
            bullets={[
              "You set the price",
              "Buy at factory cost, keep the margin",
              "Perfect for agencies, freelancers and sales pros",
              "Volume tiers unlock better pricing",
            ]}
            footerLabel="Keep 100% of your margin"
            featured
          />
        </div>
      </section>

      {/* What you earn tables */}
      <section className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
        <SectionTitle title={<>What you earn.</>} />
        <Underline className="mt-3 w-52" />
        <p className="mt-6 max-w-[540px] text-[15px] font-semibold leading-[1.55] text-black/68">
          The more you sell, the more you earn. All payouts are per website sale.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <EarningsTable
            icon={Users}
            title="Referral Partner"
            subtitle="Commission on sale price"
            rows={[
              ["1 – 5", "20%"],
              ["6 – 10", "25%"],
              ["11 – 20", "30%"],
              ["20+", "Custom"],
            ]}
            leftHeader="Websites sold / month"
            rightHeader="Your commission"
          />
          <EarningsTable
            icon={BarChart3}
            title="Factory Partner"
            subtitle="Your factory cost per website"
            rows={[
              ["1 – 5", "£400"],
              ["6 – 10", "£350"],
              ["11 – 20", "£300"],
              ["20+", "Custom"],
            ]}
            leftHeader="Websites sold / month"
            rightHeader="Factory cost"
          />
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-[18px] border border-black/10 bg-white p-6 shadow-[0_14px_36px_rgba(0,0,0,0.035)] sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span className="grid size-11 place-items-center rounded-full bg-[#dfff00] shrink-0">
              <TrendingUp className="size-5" strokeWidth={2.4} />
            </span>
            <div>
              <p className="text-[15px] font-black tracking-[-0.03em]">Tier upgrades happen automatically every month.</p>
              <p className="mt-1 text-[13px] font-semibold text-black/65">Hit the next tier and your rate improves.</p>
            </div>
          </div>
          <a
            href="/partners/selling-sorted"
            className="inline-flex items-center gap-2 text-[12px] font-black underline underline-offset-4"
          >
            View full terms <ArrowRight className="size-4" strokeWidth={3} />
          </a>
        </div>
      </section>

      {/* Why partners choose Sorted */}
      <section className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr] lg:items-start">
          <div>
            <SectionTitle title={<>Why partners<br />choose Sorted.</>} />
            <Underline className="mt-5 w-60" />
            <p className="mt-6 max-w-[420px] text-[15px] font-semibold leading-[1.55] text-black/68">
              We remove the friction so you can focus on building relationships and earning more.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ReasonCard
              icon={HandCoins}
              title="No upfront cost"
              copy="You never pay to join or to refer."
            />
            <ReasonCard
              icon={Clock3}
              title="We do the work"
              copy="Design, build, host and support."
            />
            <ReasonCard
              icon={BarChart3}
              title="Real attribution"
              copy="Every referral is tracked and recorded."
            />
            <ReasonCard
              icon={PoundSterling}
              title="On-time payouts"
              copy="Get paid by bank transfer."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#070707] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto grid max-w-[1220px] gap-6 rounded-[12px] bg-white px-6 py-5 text-black shadow-[0_18px_44px_rgba(0,0,0,0.22)] lg:grid-cols-[0.5fr_0.3fr_0.2fr] lg:items-center">
          <div>
            <p className="[font-family:var(--font-aff-highlight)] text-[clamp(1.8rem,3vw,2.6rem)] font-normal leading-[1.1] tracking-[-0.02em] text-[#d4ea00]">
              Ready to start earning?
            </p>
            <p className="mt-2 text-[14px] font-semibold leading-[1.45] text-black/70">
              Join in minutes. It&apos;s free to sign up.
            </p>
          </div>
          <ArrowRight className="hidden size-16 rotate-[-8deg] lg:block" strokeWidth={1.7} />
          <PrimaryButton href="/partners/apply" className="justify-self-start whitespace-nowrap lg:justify-self-end">
            Apply now <ArrowRight className="size-4" strokeWidth={3} />
          </PrimaryButton>
        </div>
      </section>

      <AffiliatesFooter />
    </AffiliatesPage>
  )
}

function FeatureTile({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof Users
  title: string
  copy: string
}) {
  return (
    <article className="rounded-[14px] border border-black/10 bg-white p-5 shadow-[0_14px_40px_rgba(0,0,0,0.035)]">
      <span className="grid size-10 place-items-center rounded-full bg-[#dfff00]">
        <Icon className="size-5" strokeWidth={2.2} />
      </span>
      <p className="mt-4 text-[15px] font-black tracking-[-0.03em]">{title}</p>
      <p className="mt-1 text-[12px] font-semibold leading-[1.45] text-black/65">{copy}</p>
    </article>
  )
}

function PartnerDashboardMockup() {
  return (
    <div className="relative">
      <div className="rounded-[22px] border border-black/10 bg-white p-4 shadow-[0_22px_55px_rgba(0,0,0,0.1)] sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[16px] font-black">Partner Dashboard</p>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#dfff00] px-2.5 py-0.5 text-[10px] font-black">
              <span className="size-1.5 rounded-full bg-[#070707]" />
              Live
            </span>
          </div>
          <span className="rounded-lg border border-black/10 px-3 py-1.5 text-[11px] font-black text-black/70">This month</span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <MockupStat label="Referrals" value="18" delta="+6" />
          <MockupStat label="Mockups sent" value="12" delta="+4" />
          <MockupStat label="Sites sold" value="7" delta="+2" />
        </div>

        <div className="mt-5 rounded-[16px] bg-[#070707] p-5 text-white">
          <p className="text-[12px] font-semibold text-white/60">Earnings</p>
          <p className="mt-1 text-[clamp(2rem,5vw,3rem)] font-black leading-none tracking-[-0.05em]">£1,350</p>
          <p className="mt-1 text-[12px] font-semibold text-[#dfff00]">+£420 this month</p>
        </div>

        <div className="mt-5">
          <p className="text-[13px] font-black">Recent activity</p>
          <div className="mt-3 space-y-2">
            {[
              ["Mockup sent to", "Clean Cuts Barbers"],
              ["Website sold", "Apex Plumbing"],
              ["Mockup sent to", "Luxe Aesthetics"],
            ].map(([action, business]) => (
              <div key={business} className="flex items-center justify-between rounded-lg border border-black/8 bg-[#f7f7f3] px-3 py-2.5">
                <div>
                  <p className="text-[11px] font-semibold text-black/55">{action}</p>
                  <p className="text-[13px] font-black">{business}</p>
                </div>
                <span className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-black shadow-sm">View</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-black text-black/55">
            <span>View all activity</span>
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MockupStat({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-[14px] border border-black/10 p-4">
      <p className="text-[11px] font-semibold text-black/55">{label}</p>
      <p className="mt-1 text-[28px] font-black leading-none tracking-[-0.05em]">{value}</p>
      <p className="mt-1 text-[11px] font-black text-[#dfff00]">{delta} this month</p>
    </div>
  )
}

function PathCard({
  icon: Icon,
  title,
  subtitle,
  bullets,
  footerLabel,
  featured,
}: {
  icon: typeof Users
  title: string
  subtitle: string
  bullets: string[]
  footerLabel: string
  featured: boolean
}) {
  return (
    <article
      className={`relative rounded-[18px] border p-6 ${
        featured
          ? "border-black bg-[#f7f1e8]"
          : "border-black/10 bg-white shadow-[0_14px_40px_rgba(0,0,0,0.035)]"
      }`}
    >
      <span className={`grid size-12 place-items-center rounded-full ${featured ? "bg-[#dfff00] text-black" : "bg-[#dfff00] text-black"}`}>
        <Icon className="size-6" strokeWidth={2.2} />
      </span>
      <h3 className="mt-5 text-[22px] font-black tracking-[-0.04em]">{title}</h3>
      <p className="mt-1 text-[14px] font-semibold text-black/70">{subtitle}</p>
      <ul className="mt-5 space-y-2.5">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2.5 text-[13px] font-semibold leading-[1.4] text-black/72">
            <Check className="mt-0.5 size-4 shrink-0 rounded-full bg-[#dfff00] p-0.5" strokeWidth={3} />
            {bullet}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-5">
        <span className="text-[13px] font-black">{footerLabel}</span>
      </div>
    </article>
  )
}

function EarningsTable({
  icon: Icon,
  title,
  subtitle,
  rows,
  leftHeader,
  rightHeader,
}: {
  icon: typeof Users
  title: string
  subtitle: string
  rows: [string, string][]
  leftHeader: string
  rightHeader: string
}) {
  return (
    <div className="rounded-[18px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.035)]">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-[#dfff00]">
          <Icon className="size-5" strokeWidth={2.2} />
        </span>
        <div>
          <h3 className="text-[18px] font-black tracking-[-0.04em]">{title}</h3>
          <p className="text-[12px] font-semibold text-black/55">{subtitle}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_auto] gap-y-2 text-[13px] font-semibold">
        <div className="border-b border-black/10 pb-2 font-black text-black/55">{leftHeader}</div>
        <div className="border-b border-black/10 pb-2 pl-8 font-black text-black/55">{rightHeader}</div>
        {rows.map(([left, right]) => (
          <div key={left} className="contents">
            <div className="border-b border-black/8 py-3 text-black/85">{left}</div>
            <div className="border-b border-black/8 py-3 pl-8 text-right font-black">{right}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReasonCard({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof Users
  title: string
  copy: string
}) {
  return (
    <article className="rounded-[14px] border border-black/10 bg-white p-5">
      <span className="grid size-10 place-items-center rounded-full bg-[#dfff00]">
        <Icon className="size-5" strokeWidth={2.2} />
      </span>
      <h3 className="mt-4 text-[16px] font-black tracking-[-0.03em]">{title}</h3>
      <p className="mt-2 text-[13px] font-semibold leading-[1.45] text-black/65">{copy}</p>
    </article>
  )
}
