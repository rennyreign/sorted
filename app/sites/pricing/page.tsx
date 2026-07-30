import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Check, HelpCircle, Rocket, ShieldCheck, Sparkles, Sprout, Trophy, Zap } from "lucide-react"
import Image from "next/image"
import { GeoPrice } from "@/components/GeoPrice"
import { DarkCta, SitesFooter, SitesHeader, SitesPage, SitesTitle, Underline } from "../_components/SitesPrimitives"
import { MockupButton } from "../_components/SitesMockupModal"

export const metadata: Metadata = {
  title: "Pricing | Sorted",
  description: "Sorted builds your website mockup first, then agrees a fixed price before any work begins.",
  alternates: {
    canonical: "/pricing",
  },
}

export default function PricingPage() {
  return (
    <SitesPage>
      <SitesHeader active="pricing" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-12 pt-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SitesTitle title={<>Built first<br />Priced second</>} marker={<>That's the Sorted way</>} />
          <Underline className="mt-2 w-[280px]" />
          <p className="mt-7 max-w-[450px] text-[17px] font-semibold leading-[1.55] tracking-[-0.03em]">
            Great design should not only belong to businesses with agency budgets. We build first, then price according to the stage you are at and the value the site can reasonably create.
          </p>
          <ul className="mt-8 flex flex-wrap gap-6 text-[13px] font-black">
            {["No obligation", "No credit card", "No pressure"].map((item) => (
              <li key={item} className="flex items-center gap-2"><Check className="size-5 rounded-full border border-black/30 p-1" />{item}</li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-5">
            <MockupButton />
            <span className="[font-family:var(--font-sites-highlight)] text-[23px] leading-none text-[#d0e600]">See it. Then decide.</span>
          </div>
        </div>
        <div className="relative min-h-[330px] overflow-hidden rounded-[20px] bg-[#f7f1e8] shadow-[0_24px_70px_rgba(0,0,0,0.1)] sm:min-h-[430px] sm:rounded-[24px]">
          <Image
            src="/sorted-sites/pricing-hero.png"
            alt="Sorted pricing and website value shown as a visual mockup"
            fill
            priority
            sizes="(min-width: 1024px) 650px, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute bottom-4 left-4 rounded-[12px] bg-[#dfff00] px-4 py-3 shadow-[0_18px_44px_rgba(0,0,0,0.14)] sm:bottom-6 sm:left-6 sm:rounded-[14px] sm:px-5 sm:py-4">
            <p className="[font-family:var(--font-sites-marker)] text-[1.25rem] uppercase leading-[0.95] sm:text-[1.55rem]">Priced by<br />business stage.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-5 rounded-[18px] bg-[#f7f1e8] p-5 sm:p-8 lg:grid-cols-[0.34fr_repeat(3,1fr)] lg:items-stretch">
          <div>
            <h2 className="max-w-[330px] text-[36px] font-black leading-[0.96] tracking-[-0.045em]">
              We charge according to the stage you're at.
            </h2>
            <Underline className="mt-3 w-52" />
            <p className="mt-6 max-w-[290px] text-[14px] font-semibold leading-[1.5] text-black/68">
              A new business needs access. An established business gets more commercial value from the same design work. The price should reflect that.
            </p>
          </div>
          <StagePriceCard icon={Sprout} stage="New business" years="Less than 1 year trading" price={<GeoPrice amount={495} />} note="For founders who need to look credible quickly without betting money they do not have yet." />
          <StagePriceCard icon={Rocket} stage="Growing business" years="1 to 3 years trading" price={<GeoPrice amount={995} />} note="For businesses with proof, customers and momentum who need a stronger site to convert demand." featured />
          <StagePriceCard icon={Trophy} stage="Established business" years="3+ years trading" price={<GeoPrice amount={1995} />} note="For businesses where better design has a clearer revenue impact and the site needs more depth." />
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-6 rounded-[18px] border border-black/10 bg-white p-7 md:grid-cols-4">
          {[
            [Zap, "Fast", "Most mockups in 24 hours."],
            [ShieldCheck, "Low risk", "Free mockup. No obligation."],
            [Check, "Fixed price", "Clear price before we build."],
            [Sparkles, "All included", "Design, build, hosting & CMS."],
          ].map(([Icon, title, copy]) => {
            const RealIcon = Icon as typeof Zap
            return (
              <article key={title as string} className="border-black/10 md:border-l md:pl-6 first:md:border-l-0 first:md:pl-0">
                <span className="grid size-12 place-items-center rounded-full bg-[#dfff00]"><RealIcon className="size-6" /></span>
                <h3 className="mt-4 text-[14px] font-black">{title as string}</h3>
                <p className="mt-2 text-[12px] font-semibold leading-[1.45] text-black/65">{copy as string}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
        <h2 className="text-[38px] font-black tracking-[-0.035em]">Why we are different</h2>
        <p className="mt-3 text-[17px] font-semibold text-black/65">We have removed everything that slows you down.</p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_90px_1fr] lg:items-center">
          <ProcessBox title="The traditional agency process" items={[["Discovery meeting", "Time consuming"], ["Proposal & strategy", "Lots of back and forth"], ["Quote", "Often unclear"], ["Deposit", "Before you have seen anything"], ["Design & revisions", "Weeks of waiting"], ["Development", "More waiting"], ["Launch", "Hope it works"]]} />
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#dfff00] text-[28px] font-black">VS</div>
          <ProcessBox sorted title="The Sorted process" items={[["Free mockup", "We build it first"], ["You approve", "You know exactly what you are getting"], ["Fixed price", "Clear price before any work begins"], ["Launch", "Fast, smooth, done"]]} />
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-8 rounded-[18px] bg-[#dfff00] p-8 lg:grid-cols-[0.46fr_0.34fr_0.2fr] lg:items-center">
          <div>
            <h2 className="text-[28px] font-black tracking-[-0.035em]">What you are actually paying for</h2>
            <p className="mt-5 text-[14px] font-black">Most agencies charge for:</p>
            <div className="mt-4 grid gap-2 text-[13px] font-semibold sm:grid-cols-2">
              {["Meetings", "Proposals", "Discovery workshops", "Revisions", "Project management", "Lengthy design phases", "Estimates", "Uncertainty"].map((item) => (
                <p key={item}>× {item}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[14px] font-black">Sorted charges for:</p>
            <p className="mt-5 flex items-center gap-4 text-[24px] font-black tracking-[-0.035em]"><Check className="size-9 rounded-full bg-white p-2" />Building your website.</p>
            <p className="mt-4 text-[15px] font-semibold">That is it.</p>
          </div>
          <div className="rounded-[14px] bg-[#070707] p-7 text-white">
            <p className="[font-family:var(--font-sites-marker)] text-[2.4rem] leading-[1.05]">Don't buy a promise.</p>
            <p className="mt-5 [font-family:var(--font-sites-highlight)] text-[2.3rem] leading-none text-[#dfff00]">Buy the website.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
        <h2 className="text-[34px] font-black tracking-[-0.035em]">Frequently asked</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            ["Why price by business stage?", "Because the same website creates different value depending on where the business is. We want great design to be accessible without pretending every business is in the same position."],
            ["How fast will I get my mockup?", "Most mockups are delivered within 24 hours. Sometimes even faster."],
            ["What happens after I approve?", "We confirm the right stage, agree a fixed price and timeline, then build and launch your website."],
          ].map(([question, answer]) => (
            <article key={question} className="border-l border-black/10 pl-6">
              <h3 className="flex items-center justify-between text-[15px] font-black">{question}<HelpCircle className="size-4" /></h3>
              <p className="mt-4 text-[13px] font-semibold leading-[1.5] text-black/65">{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <DarkCta />
      <SitesFooter />
    </SitesPage>
  )
}

function StagePriceCard({
  icon: Icon,
  stage,
  years,
  price,
  note,
  featured = false,
}: {
  icon: typeof Sprout
  stage: string
  years: string
  price: ReactNode
  note: string
  featured?: boolean
}) {
  return (
    <article className={`flex min-h-[310px] flex-col rounded-[16px] border p-6 ${featured ? "border-black bg-[#dfff00] shadow-[0_18px_44px_rgba(0,0,0,0.1)]" : "border-black/10 bg-white"}`}>
      <span className={`grid size-12 place-items-center rounded-full ${featured ? "bg-[#070707] text-[#dfff00]" : "bg-[#dfff00] text-black"}`}>
        <Icon className="size-6" strokeWidth={2.4} />
      </span>
      <h3 className="mt-5 text-[22px] font-black tracking-[-0.045em]">{stage}</h3>
      <p className="mt-2 text-[12px] font-black uppercase text-black/50">{years}</p>
      <p className="mt-7 text-[15px] font-black uppercase text-black/55">From</p>
      <p className="text-[60px] font-black leading-none tracking-[-0.08em]">{price}</p>
      <p className="mt-5 text-[13px] font-semibold leading-[1.45] text-black/68">{note}</p>
    </article>
  )
}

function ProcessBox({ title, items, sorted = false }: { title: string; items: [string, string][]; sorted?: boolean }) {
  return (
    <article className={`rounded-[16px] border bg-white p-6 ${sorted ? "border-[#dfff00]" : "border-black/10"}`}>
      <h3 className="mb-5 text-[17px] font-black tracking-[-0.04em]">{title}</h3>
      <div className="space-y-1">
        {items.map(([label, note], index) => (
          <div key={label} className="grid grid-cols-[34px_1fr_auto] items-center gap-3 border-t border-black/10 py-3 first:border-t-0">
            <span className={`grid size-8 place-items-center rounded-full ${sorted ? "bg-[#070707] text-[#dfff00]" : "bg-black/5"}`}>{index + 1}</span>
            <span className="text-[13px] font-black">{label}</span>
            <span className="text-right text-[12px] font-semibold text-black/55">{note}</span>
          </div>
        ))}
      </div>
    </article>
  )
}
