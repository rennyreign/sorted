import type { Metadata } from "next"
import type { ReactNode } from "react"
import { ArrowRight, BarChart3, Check, Search, ShieldCheck, Target, TrendingUp, UsersRound, Wrench } from "lucide-react"
import { GeoPrice } from "@/components/GeoPrice"
import { CtaBand, MarkerText, SectionTitle, V2Footer, V2Header, V2Page } from "../_components/V2Primitives"
import { RoutineFinderButton } from "../_components/RoutineFinder"

export const metadata: Metadata = {
  title: "Pricing | Sorted V2",
  description: "Two ways to work with Sorted: install one system or become an operational partner.",
}

const includes = [
  [Search, "Gap identification", "We find the gaps costing you the most."],
  [Wrench, "System installation", "We install, test and integrate the system."],
  [BarChart3, "Performance dashboard", "You see the impact in real time."],
  [UsersRound, "Team enablement", "We train your team and hand over."],
  [ShieldCheck, "Ongoing support", "We are here when you need us."],
]

export default function PricingPage() {
  return (
    <V2Page>
      <V2Header active="pricing" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-8 pt-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <h1 className="max-w-[620px] text-[clamp(4.4rem,8vw,8rem)] font-black leading-[0.9] tracking-[-0.07em]">
          Two ways
          <br />
          to work with
          <br />
          <MarkerText className="text-[clamp(4.2rem,7.6vw,7.5rem)]">Sorted.</MarkerText>
        </h1>
        <div>
          <h2 className="text-[24px] font-black tracking-[-0.04em]">Simple. Transparent. Built for results.</h2>
          <p className="mt-5 max-w-[520px] text-[16px] font-semibold leading-[1.6] tracking-[-0.03em]">
            Whether you need to solve one immediate problem or continuously improve operations across your business, we have a way of working that fits.
          </p>
          <p className="mt-9 flex items-center gap-5 text-[16px] font-black">
            <ShieldCheck className="size-12 text-[#b6d000]" strokeWidth={2.3} />
            No lock-in contracts.<br />Pause or cancel anytime.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-7 px-5 py-8 sm:px-8 lg:grid-cols-2">
        <PricingCard
          icon={Target}
          option="Option 1"
          title="Install One System"
          subtitle="Close your biggest gap."
          copy="A focused, one-off engagement to identify the gap costing you most and install the system that closes it."
          items={["A fast, targeted solution", "To see how Sorted works", "Immediate impact"]}
          price={<GeoPrice amount={2500} />}
          suffix="One-off installation"
          button="Install my first system"
        />
        <PricingCard
          icon={TrendingUp}
          option="Option 2"
          title="Operational Partner"
          subtitle="Continuously improve performance."
          copy="We continuously find and close the gaps leaking revenue, trust, and time across your business."
          items={["Ongoing operational improvement", "More systems installed over time", "Measurable performance every month", "A long-term partner in their growth"]}
          price={<GeoPrice amount={750} />}
          suffix="Per month"
          button="Become an operational partner"
          featured
        />
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-7 rounded-[18px] border border-black/10 bg-white p-7 lg:grid-cols-[0.32fr_0.68fr]">
          <SectionTitle title="Which option is right for you?" />
          <div className="grid gap-5 md:grid-cols-3">
            <Compare title="If you..." items={["Have one specific problem to solve", "Want continuous improvement across your business"]} />
            <Compare title="Choose..." items={["Install One System", "Operational Partner"]} strong />
            <Compare title="Why" items={["Focused engagement. Fast results.", "Compounding value. Greater long-term impact."]} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="rounded-[18px] bg-[#f7efe3] p-8">
          <SectionTitle title="Every engagement includes" center />
          <div className="mt-10 grid gap-6 md:grid-cols-5">
            {includes.map(([Icon, title, copy]) => {
              const RealIcon = Icon as typeof Search
              return (
                <article key={title as string} className="border-black/10 text-center md:border-r md:px-5 md:last:border-r-0">
                  <RealIcon className="mx-auto size-10" strokeWidth={2.2} />
                  <h2 className="mt-5 text-[14px] font-black tracking-[-0.035em]">{title as string}</h2>
                  <p className="mt-2 text-[12px] font-semibold leading-[1.4] text-black/65">{copy as string}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <CtaBand title="Not sure where to start?" copy="Start the diagnostic and we will recommend the best system to close the gap costing you most." />
      <V2Footer />
    </V2Page>
  )
}

function PricingCard({
  icon: Icon,
  option,
  title,
  subtitle,
  copy,
  items,
  price,
  suffix,
  button,
  featured = false,
}: {
  icon: typeof Target
  option: string
  title: string
  subtitle: string
  copy: string
  items: string[]
  price: ReactNode
  suffix: string
  button: string
  featured?: boolean
}) {
  return (
    <article className={`rounded-[20px] border border-black/12 p-8 shadow-[0_18px_45px_rgba(20,14,8,0.06)] ${featured ? "bg-[#fbffee]" : "bg-[#fffaf2]"}`}>
      <div className="grid gap-6 sm:grid-cols-[82px_1fr]">
        <span className="grid size-16 place-items-center rounded-2xl bg-[#dfff00]">
          <Icon className="size-9" strokeWidth={2.4} />
        </span>
        <div>
          <p className="text-[12px] font-black text-[#9ab200]">{option}</p>
          <h2 className="mt-2 text-[30px] font-black tracking-[-0.055em]">{title}</h2>
          <p className="mt-4 text-[17px] font-black">{subtitle}</p>
          <p className="mt-5 max-w-[480px] text-[14px] font-semibold leading-[1.55]">{copy}</p>
        </div>
      </div>
      <div className="my-8 border-t border-black/12" />
      <p className="mb-4 text-[13px] font-black">Ideal for businesses who want:</p>
      <ul className="space-y-3 text-[14px] font-semibold">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <Check className="mt-0.5 size-4 shrink-0 rounded-full bg-[#dfff00]" strokeWidth={3} />
            {item}
          </li>
        ))}
      </ul>
      <div className="my-9 border-t border-black/12" />
      <div className="flex items-end gap-6">
        <p className="text-[11px] font-black uppercase">From</p>
        <p className="text-[48px] font-black leading-none tracking-[-0.07em]">{price}</p>
      </div>
      <p className="ml-16 mt-2 text-[13px] font-semibold">{suffix}</p>
      <div className="mt-8">
        <RoutineFinderButton label={button} variant="footer" />
      </div>
      <p className="mt-5 text-center text-[12px] font-semibold">{featured ? "Cancel or pause anytime." : "Delivery in as little as 2 weeks."}</p>
    </article>
  )
}

function Compare({ title, items, strong = false }: { title: string; items: string[]; strong?: boolean }) {
  return (
    <article className="border-black/10 md:border-l md:pl-8">
      <h3 className="text-[13px] font-black">{title}</h3>
      <div className="mt-5 divide-y divide-black/10">
        {items.map((item) => (
          <p key={item} className={`py-5 text-[15px] leading-[1.35] ${strong ? "font-black" : "font-semibold"}`}>{item}</p>
        ))}
      </div>
    </article>
  )
}
