import type { Metadata } from "next"
import { ArrowRight, BadgePoundSterling, BarChart3, Check, Clock3, HandCoins, Users } from "lucide-react"
import {
  AffiliatesFooter,
  AffiliatesHeader,
  AffiliatesPage,
  PrimaryButton,
  SectionTitle,
  Underline,
} from "./_components/AffiliatesPrimitives"


export const metadata: Metadata = {
  title: "Sorted Partners Portal | Earn £75–£300 per website you refer",
  description:
    "Refer small businesses to Sorted Sites. Submit a mockup request, track it from mockup to purchase, and get paid by bank transfer when the client buys. No upfront cost, no risk.",
}

export default function AffiliatesLanding() {
  return (
    <AffiliatesPage>
      <AffiliatesHeader active="home" />

      {/* Hero */}
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-10 pt-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-5 text-[12px] font-black text-black/45">Sorted Partners Portal</p>
          <h1 className="text-[clamp(3.4rem,6.4vw,6.8rem)] font-black leading-[0.92] tracking-[-0.045em]">
            Refer a business.
            <br />
            Get paid.
          </h1>
          <div className="mt-1 [font-family:var(--font-aff-highlight)] text-[clamp(3.2rem,6vw,6.4rem)] font-normal leading-[0.88] tracking-[-0.02em] text-[#d4ea00]">
            Sorted.
          </div>
          <Underline className="mt-2 w-[300px]" />
          <p className="mt-7 max-w-[460px] text-[17px] font-semibold leading-[1.5] tracking-[-0.03em]">
            We build world-class websites fast, with no upfront cost to the client. You find the business, we do the work, and you pocket £75–£300 every time a site sells.
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
        </div>

        <div className="relative">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatTile icon={Users} stat="Live" label="Referral tracking" copy="Submit prospects and follow each one through to payout." />
            <StatTile icon={Clock3} stat="24hrs" label="Mockup turnaround" copy="Most mockups built within a day." />
            <StatTile icon={BadgePoundSterling} stat="£300" label="Top payout per site" copy="For established business referrals." />
            <StatTile icon={Check} stat="0" label="Upfront cost to client" copy="They see the design before paying." />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto grid max-w-[1220px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.28fr_0.72fr]">
        <div>
          <SectionTitle title={<>Simple for you.<br />Simple for them.</>} />
          <Underline className="mt-5 w-60" />
        </div>
        <div className="grid gap-7 md:grid-cols-4">
          {[
            [Users, "You refer a business", "Submit a mockup request through your portal with a few details about the business."],
            [Clock3, "We design the mockup", "Sorted Sites builds a free, no-obligation mockup within 24 hours."],
            [Check, "The client decides", "They see the design first. If they like it, they approve and we build."],
            [HandCoins, "You get paid", "When the client purchases, you earn £75–£300 by bank transfer."],
          ].map(([Icon, title, copy], index) => {
            const RealIcon = Icon as typeof Users
            return (
              <article key={title as string} className="relative border-black/10 md:border-l md:pl-8 first:md:border-l-0">
                <span className="grid size-11 place-items-center rounded-full bg-[#070707] text-[14px] font-black text-white">
                  {index + 1}
                </span>
                <span className="mt-7 grid size-12 place-items-center rounded-full bg-[#dfff00]">
                  <RealIcon className="size-6" strokeWidth={2.4} />
                </span>
                <h3 className="mt-5 text-[16px] font-black tracking-[-0.04em]">{title as string}</h3>
                <p className="mt-3 text-[13px] font-semibold leading-[1.5] text-black/65">{copy as string}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* Rates */}
      <section id="rates" className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
        <div className="grid gap-6 rounded-[18px] bg-[#f7f1e8] p-8 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionTitle title={<>What you earn.</>} marker={<>Two ways to partner.</>} />
            <Underline className="mt-3 w-52" />
            <p className="mt-6 max-w-[300px] text-[14px] font-semibold leading-[1.5] text-black/68">
              Pick the path that fits your goals. Refer businesses and earn commission, or build your own website business at factory cost.
            </p>
            <PrimaryButton href="/partners/what-you-earn" className="mt-5">
              See what you earn <ArrowRight className="size-4" strokeWidth={3} />
            </PrimaryButton>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <PartnerPathCard
              icon={Users}
              title="Referral Partner"
              subtitle="Earn commission for every sale."
              bullets={[
                "You refer, we handle the rest",
                "No pricing conversations",
                "Earn up to 30% per sale",
              ]}
              footer="Earn up to 30% commission"
            />
            <PartnerPathCard
              icon={BarChart3}
              title="Factory Partner"
              subtitle="Build your own business."
              bullets={[
                "You set the price",
                "Buy at factory cost",
                "Keep 100% of your margin",
              ]}
              footer="Keep 100% of your margin"
            />
          </div>
        </div>
      </section>

      {/* About / why it works */}
      <section id="about" className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr] lg:items-center">
          <div>
            <SectionTitle title={<>Why this works.</>} />
            <Underline className="mt-5 w-60" />
            <p className="mt-6 max-w-[420px] text-[15px] font-semibold leading-[1.55] text-black/68">
              Websites are easy to sell when the client sees the finished product before paying. That is the Sorted Sites model, and it makes your job as a partner straightforward: introduce the business, then let the design do the selling.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["No upfront cost to the client", "They see a free mockup first. No risk for them, no friction for you."],
              ["You track everything", "A real portal shows every referral from mockup request to payout."],
              ["We do the work", "Design, build, hosting, CMS. All handled by Sorted Sites."],
              ["Real attribution", "Every referral is tied to you. Payouts are calculated and recorded automatically."],
            ].map(([title, copy]) => (
              <article key={title} className="rounded-[14px] border border-black/10 bg-white p-5">
                <Check className="size-6 rounded-full bg-[#dfff00] p-1" strokeWidth={3.5} />
                <h3 className="mt-4 text-[15px] font-black tracking-[-0.03em]">{title}</h3>
                <p className="mt-2 text-[13px] font-semibold leading-[1.45] text-black/65">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#070707] px-5 pt-10 text-black sm:px-8">
        <div className="mx-auto grid max-w-[1220px] gap-6 rounded-[12px] bg-white px-6 py-5 shadow-[0_18px_44px_rgba(0,0,0,0.22)] lg:grid-cols-[0.5fr_0.3fr_0.2fr] lg:items-center">
          <div>
            <h2 className="text-[28px] font-black leading-[1.05] tracking-[-0.035em]">Ready to start referring?</h2>
            <p className="mt-2 text-[14px] font-semibold leading-[1.45] text-black/70">
              Apply in two minutes. We review every application personally.
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

function PartnerPathCard({
  icon: Icon,
  title,
  subtitle,
  bullets,
  footer,
}: {
  icon: typeof Users
  title: string
  subtitle: string
  bullets: string[]
  footer: string
}) {
  return (
    <article className="rounded-[16px] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
      <span className="grid size-11 place-items-center rounded-full bg-[#dfff00]">
        <Icon className="size-5" strokeWidth={2.2} />
      </span>
      <h3 className="mt-5 text-[20px] font-black tracking-[-0.04em]">{title}</h3>
      <p className="mt-1 text-[14px] font-semibold text-black/70">{subtitle}</p>
      <ul className="mt-5 space-y-2.5">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2.5 text-[13px] font-semibold leading-[1.4] text-black/72">
            <Check className="mt-0.5 size-4 shrink-0 rounded-full bg-[#dfff00] p-0.5" strokeWidth={3} />
            {bullet}
          </li>
        ))}
      </ul>
      <div className="mt-8 border-t border-black/10 pt-5">
        <span className="text-[13px] font-black">{footer}</span>
      </div>
    </article>
  )
}

function StatTile({
  icon: Icon,
  stat,
  label,
  copy,
}: {
  icon: typeof Users
  stat: string
  label: string
  copy: string
}) {
  return (
    <article className="rounded-[14px] border border-black/10 bg-white p-5 shadow-[0_14px_40px_rgba(0,0,0,0.035)]">
      <Icon className="size-7" strokeWidth={2.2} />
      <p className="mt-4 text-[34px] font-black tracking-[-0.045em]">{stat}</p>
      <p className="text-[13px] font-black">{label}</p>
      <p className="mt-2 text-[12px] font-semibold leading-[1.45] text-black/65">{copy}</p>
    </article>
  )
}
