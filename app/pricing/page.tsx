import type { Metadata } from "next"
import Image from "next/image"
import { Check, CircleDollarSign, Eye, Pencil, Rocket, ShieldCheck } from "lucide-react"
import { DarkCta, SitesFooter, SitesHeader, SitesPage, SitesTitle, Underline } from "../sites/_components/SitesPrimitives"
import { MockupButton } from "../sites/_components/SitesMockupModal"

export const metadata: Metadata = {
  title: "Pricing | Sorted",
  description: "One complete website. One fixed price: £3,000. Approve the homepage direction, pay a £1,500 deposit, then pay the remaining £1,500 when the site is ready to launch.",
  alternates: {
    canonical: "/pricing",
  },
}

const purchaseSteps = [
  [Pencil, "We build it", "We create a real homepage for your business before asking you to spend anything."],
  [Eye, "You inspect it", "See the actual website, not a proposal, moodboard or imagined deliverable."],
  [CircleDollarSign, "You confirm the direction", "Once you are happy with the homepage direction, a £1,500 deposit starts the full build."],
  [Rocket, "We finish and launch", "The remaining £1,500 is due when the completed site is ready to launch."],
] as const

const priceIncludes = [
  "Strategy",
  "Design",
  "Copy",
  "Development",
  "Content management system",
  "Analytics",
  "Launch",
] as const

const launchIncludes = [
  "The approved website design and structure",
  "Build, required setup, quality assurance and launch",
  "Content editing through SortedUpdates",
  "A tutorial, secure CMS access and factory reset",
] as const

const faqs = [
  ["Is £3,000 the whole price?", "Yes. One complete website, one fixed price. It covers strategy, design, copy, development, the content management system, analytics and launch."],
  ["When is payment due?", "Nothing is due before you approve the homepage direction. A £1,500 deposit starts the full build, then the remaining £1,500 is due when the completed site is ready to launch."],
  ["Can I keep the site up to date?", "Yes. You can update everyday content such as text, images, services, prices and contact details. We protect the design and build standard so the site stays consistent."],
] as const

export default function PricingPage() {
  return (
    <SitesPage>
      <SitesHeader active="pricing" />

      <section className="mx-auto grid max-w-[1220px] gap-12 px-5 pb-14 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-16">
        <div>
          <SitesTitle
            title={<>Built first<br />Priced second</>}
            marker={<span className="block [font-family:var(--font-sites-fave-script)] text-[clamp(4.8rem,8vw,7.6rem)] leading-[0.78] normal-case tracking-[0]">That&apos;s the<br />Sorted way</span>}
          />
          <Underline className="mt-3 w-[min(280px,72vw)]" />
          <p className="mt-8 max-w-[510px] text-[17px] font-semibold leading-[1.6] tracking-[-0.025em] text-black/78 sm:text-[18px]">
            We don&apos;t quote an imaginary website. We create your new homepage first, complete with responsive design and real content. If you want us to finish it, the complete price is £3,000. Fixed.
          </p>
          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-[13px] font-black">
            {["Free homepage mockup", "No obligation", "No awkward sales process"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-5 rounded-full border border-black/25 p-1" strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-4">
            <MockupButton />
            <span className="[font-family:var(--font-sites-highlight)] text-[23px] leading-none text-[#bdd000]">See it. Then decide.</span>
          </div>
        </div>

        <div className="relative aspect-[1.05/1] overflow-hidden rounded-[22px] bg-[#f7f1e8] shadow-[0_28px_80px_rgba(42,35,20,0.12)] sm:aspect-[1.28/1] sm:min-h-[430px] sm:rounded-[28px]">
          <Image
            src="/sorted-sites/pricing-hero.png"
            alt="A completed Sorted website displayed on a laptop and phone, ready for review."
            fill
            priority
            sizes="(min-width: 1024px) 650px, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute bottom-4 left-4 rounded-[12px] bg-[#dfff00] px-4 py-3 shadow-[0_18px_44px_rgba(0,0,0,0.14)] sm:bottom-6 sm:left-6 sm:rounded-[14px] sm:px-5 sm:py-4">
            <p className="[font-family:var(--font-sites-marker)] text-[1.25rem] uppercase leading-[0.95] sm:text-[1.55rem]">See the website.<br />Then talk price.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 pb-5 sm:px-8 sm:pb-8">
        <div className="grid overflow-hidden rounded-[24px] bg-[#0a0a0a] text-white lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-between p-8 sm:p-11 lg:min-h-[440px] lg:p-12">
            <div>
              <h2 className="max-w-[520px] text-[clamp(2.35rem,4.4vw,4rem)] font-black leading-[0.96] tracking-[-0.05em] text-balance">
                One complete website. One fixed price.
              </h2>
            </div>
            <p className="mt-10 text-[clamp(4.75rem,9vw,8rem)] font-black leading-[0.8] tracking-[-0.075em] text-[#dfff00] tabular-nums">£3,000</p>
          </div>

          <div className="border-t border-white/12 p-8 sm:p-11 lg:border-l lg:border-t-0 lg:p-12">
            <p className="max-w-[530px] text-[20px] font-bold leading-[1.45] tracking-[-0.025em] text-white/94">
              We create your new homepage before you commit. You see the quality, the thinking and the fit before making a decision.
            </p>
            <div className="mt-8 grid gap-px overflow-hidden rounded-[14px] bg-white/12 sm:grid-cols-2">
              <div className="bg-white/[0.06] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">After approval</p>
                <p className="mt-2 text-[24px] font-black tracking-[-0.04em] tabular-nums">£1,500 deposit</p>
                <p className="mt-1 text-[12px] font-semibold text-white/58">Starts the full build</p>
              </div>
              <div className="bg-white/[0.06] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">Ready to launch</p>
                <p className="mt-2 text-[24px] font-black tracking-[-0.04em] tabular-nums">£1,500 balance</p>
                <p className="mt-1 text-[12px] font-semibold text-white/58">Completes the exchange</p>
              </div>
            </div>
            <p className="mt-8 text-[12px] font-black uppercase tracking-[0.12em] text-white/48">Everything required to launch</p>
            <ul className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {priceIncludes.map((item) => (
                <li key={item} className="flex items-center gap-3 border-b border-white/10 pb-4 text-[14px] font-bold">
                  <Check className="size-5 shrink-0 rounded-full bg-[#dfff00] p-1 text-black" strokeWidth={3.5} />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-7 text-[13px] font-semibold leading-[1.5] text-white/58">No tiers. No extras menu. No invoice creep.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="max-w-[560px] text-[clamp(2.3rem,4vw,3.7rem)] font-black leading-[0.96] tracking-[-0.05em] text-balance">Buy the website. Not a promise.</h2>
          </div>
          <p className="max-w-[380px] text-[15px] font-semibold leading-[1.55] text-black/62">A clear four-step exchange, with the work made visible before you commit.</p>
        </div>

        <div className="mt-9 grid gap-px overflow-hidden rounded-[22px] bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
          {purchaseSteps.map(([Icon, title, copy], index) => {
            const RealIcon = Icon as typeof Pencil
            return (
              <article key={title} className="flex min-h-[255px] flex-col bg-[#f7f1e8] p-7 lg:p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="grid size-9 place-items-center rounded-full bg-[#0a0a0a] text-[11px] font-black text-white">0{index + 1}</span>
                  <RealIcon className="size-6 text-black/58" strokeWidth={2} />
                </div>
                <div className="mt-auto pt-12">
                  <h3 className="text-[17px] font-black tracking-[-0.025em]">{title}</h3>
                  <p className="mt-3 text-[13px] font-semibold leading-[1.55] text-black/62">{copy}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 pb-12 sm:px-8 sm:pb-16">
        <div className="grid gap-10 rounded-[24px] border border-black/10 bg-white p-7 sm:p-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14 lg:p-12">
          <div className="lg:pr-4">
            <h2 className="text-[clamp(2.2rem,3.6vw,3.45rem)] font-black leading-[0.96] tracking-[-0.05em] text-balance">A complete site, built to stay strong.</h2>
            <p className="mt-6 max-w-[480px] text-[15px] font-semibold leading-[1.6] text-black/65">
              You get a professional website you can be proud to send people to. We take it from build through to launch, so the final site is coherent, considered and ready to work for your business.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 sm:gap-0">
            <article className="sm:pr-8">
              <span className="grid size-11 place-items-center rounded-full bg-[#dfff00]"><Check className="size-5" strokeWidth={3} /></span>
              <h3 className="mt-5 text-[20px] font-black leading-[1.05] tracking-[-0.04em]">Everything you need to launch</h3>
              <ul className="mt-5 space-y-3 text-[13px] font-semibold leading-[1.5] text-black/65">
                {launchIncludes.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#789100]" strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
            <article className="border-t border-black/10 pt-8 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
              <span className="grid size-11 place-items-center rounded-full bg-black/[0.06]"><ShieldCheck className="size-5" strokeWidth={2.3} /></span>
              <h3 className="mt-5 text-[20px] font-black leading-[1.05] tracking-[-0.04em]">We protect the standard</h3>
              <p className="mt-5 text-[13px] font-semibold leading-[1.58] text-black/65">We remain responsible for the design and build, so your site stays cohesive and presents your business well long after it goes live.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 pb-12 sm:px-8 sm:pb-16">
        <div className="grid overflow-hidden rounded-[24px] bg-[#dfff00] lg:grid-cols-[1fr_0.48fr]">
          <div className="p-8 sm:p-10 lg:p-12">
            <h2 className="max-w-[700px] text-[clamp(2.2rem,4vw,3.8rem)] font-black leading-[0.96] tracking-[-0.05em] text-balance">£3,000 is the price. Not a starting point.</h2>
            <p className="mt-6 max-w-[620px] text-[15px] font-semibold leading-[1.6] text-black/72">The same complete website, at the same fixed price, for every business. You see the work first and decide without pressure.</p>
            <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-[13px] font-black">
              {["£1,500 after approval", "£1,500 when ready to launch", "No pressure to buy"].map((item) => (
                <li key={item} className="flex items-center gap-2"><Check className="size-4" strokeWidth={3.5} />{item}</li>
              ))}
            </ul>
          </div>
          <div className="flex items-center bg-[#0a0a0a] p-8 text-white sm:p-10 lg:p-12">
            <div>
              <p className="[font-family:var(--font-sites-marker)] text-[clamp(2.5rem,4.5vw,4.1rem)] leading-[0.95]">Good work should circulate.</p>
              <p className="mt-6 max-w-[280px] text-[13px] font-semibold leading-[1.55] text-white/62">Substance first. A fair exchange. Then launch.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="flex items-end justify-between gap-6 border-b border-black/12 pb-5">
          <div>
            <h2 className="text-[clamp(2.1rem,3.5vw,3.1rem)] font-black leading-none tracking-[-0.045em]">Frequently asked</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-3">
          {faqs.map(([question, answer], index) => (
            <article key={question} className="border-b border-black/10 py-7 md:border-b-0 md:border-l md:px-7 md:py-8 md:first:border-l-0 md:first:pl-0 md:last:pr-0">
              <div className="flex items-start justify-between gap-4">
                <h3 className="max-w-[270px] text-[16px] font-black leading-[1.2] tracking-[-0.02em]">{question}</h3>
                <span className="text-[11px] font-black text-black/35">0{index + 1}</span>
              </div>
              <p className="mt-4 text-[13px] font-semibold leading-[1.6] text-black/62">{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <DarkCta title="Ready to see your website?" copy="We build it first. You decide whether it belongs in the world." />
      <SitesFooter />
    </SitesPage>
  )
}
