import type { Metadata } from "next"
import { Activity, ArrowRight, Calendar, Check, Edit3, Eye, Rocket, Sparkles } from "lucide-react"
import { MockupButton } from "../_components/SitesMockupModal"
import { SitesFooter, SitesHeader, SitesPage, Underline } from "../_components/SitesPrimitives"
import { ExamplesGallery } from "./ExamplesGallery"
import { LiveSitesShowcase } from "./LiveSitesShowcase"

export const metadata: Metadata = {
  title: "Examples | Sorted",
  description: "Real Sorted mockups for small businesses across health, home services, hospitality, retail and professional services.",
  alternates: {
    canonical: "/examples",
  },
}

const metrics = [
  [Activity, "482", "Mockups created this month"],
  [Sparkles, "5", "Live builds featured"],
  [Calendar, "Today", "Factory updated"],
] as const

const processSteps = [
  [Edit3, "We build a mockup", "A free, custom design made for your business."],
  [Eye, "You review it", "See exactly what you are getting."],
  [Check, "You approve", "Love it? You agree a fixed price."],
  [Rocket, "We build & launch", "We build your website and get you live."],
] as const

export default function ExamplesPage() {
  return (
    <SitesPage>
      <SitesHeader active="examples" />

      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-8 pt-11 sm:px-8 sm:pb-12 sm:pt-14 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
        <div>
          <h1 className="max-w-[610px] text-[clamp(3.55rem,7vw,7.3rem)] font-black leading-[0.86] tracking-[-0.06em]">
            Real work.
            <br />
            Real results.
          </h1>
          <div className="mt-2 max-w-[430px] [font-family:var(--font-sites-highlight)] text-[clamp(3.35rem,6.2vw,6.6rem)] font-normal leading-[0.74] tracking-[-0.02em] text-[#cfea00]">
            Built first.
            <br />
            Priced second.
          </div>
          <Underline className="mt-3 w-[330px] max-w-full" />
          <p className="mt-7 max-w-[520px] text-[17px] font-semibold leading-[1.5] tracking-[-0.025em] text-black/75">
            Every website you see here started as a free mockup. The business owner saw it, loved it, and we built it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <MockupButton />
            <span className="relative [font-family:var(--font-sites-highlight)] text-[28px] leading-[0.9] text-[#c7e800] sm:text-[32px]">
              See your business
              <br />
              here next.
              <ArrowRight className="absolute -right-14 bottom-0 hidden size-10 rotate-45 sm:block" strokeWidth={2.2} />
            </span>
          </div>
        </div>

        <aside className="rounded-[16px] border border-black/10 bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.08)] sm:p-8 lg:translate-y-4">
          <div className="grid gap-5 sm:grid-cols-3 sm:gap-0">
            {metrics.map(([Icon, value, label], index) => (
              <div key={label} className={`grid grid-cols-[24px_1fr] gap-3 sm:block ${index > 0 ? "sm:border-l sm:border-black/10 sm:pl-8" : ""}`}>
                <Icon className="mt-1 size-5 sm:mb-3 sm:mt-0" strokeWidth={2.4} />
                <div>
                  <p className="text-[27px] font-black leading-none tracking-[-0.04em]">{value}</p>
                  <p className="mt-2 max-w-[120px] text-[13px] font-semibold leading-[1.35] text-black/62">{label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="grid grid-cols-[10px_1fr] gap-3 text-[14px] font-black tracking-[-0.02em]">
              <span className="mt-1.5 size-2 rounded-full bg-[#dfff00]" />
              <span>
                Our factory never stops.
                <span className="mt-1 block font-semibold text-black/64">New designs added every day.</span>
              </span>
            </p>
          </div>
        </aside>
      </section>

      <section id="live-websites" className="mx-auto max-w-[1220px] scroll-mt-28 border-t border-black/10 px-5 py-7 sm:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="max-w-[520px] text-[31px] font-black leading-[0.95] tracking-[-0.05em] sm:text-[38px]">
              Websites we’ve built and launched.
            </h2>
          </div>
          <a href="#mockup-factory" className="inline-flex min-h-11 items-center gap-2 text-[12px] font-black transition-colors hover:text-black/58">
            See the factory <ArrowRight className="size-4" strokeWidth={2.5} />
          </a>
        </div>

        <LiveSitesShowcase />
      </section>

      <ExamplesGallery />

      <section className="bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-[1220px] gap-8 lg:grid-cols-[0.28fr_0.72fr] lg:items-center">
          <div>
            <h2 className="text-[34px] font-black leading-[0.95] tracking-[-0.05em]">How every website starts.</h2>
            <p className="mt-4 max-w-[260px] text-[15px] font-semibold leading-[1.45] text-black/65">
              Simple, fast and built around your business.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map(([Icon, title, copy], index) => (
              <article key={title} className="relative min-h-[172px] rounded-[10px] border border-black/10 bg-white p-5 shadow-[0_14px_38px_rgba(0,0,0,0.04)]">
                <span className="grid size-8 place-items-center rounded-full bg-black text-[12px] font-black text-white">{index + 1}</span>
                <Icon className="mt-5 size-6" strokeWidth={2.1} />
                <h3 className="mt-5 text-[14px] font-black tracking-[-0.02em]">{title}</h3>
                <p className="mt-2 text-[12px] font-semibold leading-[1.45] text-black/60">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 pt-4 text-black sm:px-8">
        <div className="mx-auto grid max-w-[1060px] gap-5 rounded-[12px] bg-[#dfff00] px-5 py-5 shadow-[0_18px_44px_rgba(0,0,0,0.16)] sm:px-7 lg:grid-cols-[0.32fr_0.34fr_0.12fr_0.22fr] lg:items-center">
          <div className="grid grid-cols-[48px_1fr] items-center gap-4">
            <span className="grid size-12 place-items-center rounded-full bg-black/10">
              <Edit3 className="size-7" strokeWidth={2.2} />
            </span>
            <h2 className="text-[22px] font-black leading-[1.02] tracking-[-0.04em]">See what we can build for your business.</h2>
          </div>
          <p className="text-[13px] font-black leading-[1.35]">
            Get your free mockup in 24 hours.
            <span className="block font-semibold">No obligation. No credit card.</span>
          </p>
          <ArrowRight className="hidden size-14 lg:block" strokeWidth={2} />
          <MockupButton variant="primary" className="justify-self-start whitespace-nowrap bg-black text-white lg:justify-self-end" />
        </div>
      </section>

      <SitesFooter />
    </SitesPage>
  )
}
