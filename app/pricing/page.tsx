import type { Metadata } from "next"
import { Check, CircleDollarSign, Eye, Pencil, Rocket, ShieldCheck } from "lucide-react"
import Image from "next/image"
import { DarkCta, SitesFooter, SitesHeader, SitesPage, SitesTitle, Underline } from "../sites/_components/SitesPrimitives"
import { MockupButton } from "../sites/_components/SitesMockupModal"

export const metadata: Metadata = {
  title: "Pricing | Sorted",
  description: "One complete website. One fixed price: £3,000. We create your new homepage before you commit — £3,000 covers strategy, design, copy, development, CMS, analytics and launch.",
  alternates: {
    canonical: "/pricing",
  },
}

const purchaseSteps = [
  [Pencil, "We build it", "We manufacture a website for your business before asking you to spend anything."],
  [Eye, "You inspect it", "See the actual website, not a proposal, moodboard, or imagined future deliverable."],
  [CircleDollarSign, "One fixed price", "If you want it completed, £3,000 covers everything required to finish and launch it."],
  [Rocket, "You acquire and launch", "Payment completes the exchange. We prepare the content layer, quality-check it, and take it live."],
] as const

export default function PricingPage() {
  return (
    <SitesPage>
      <SitesHeader active="pricing" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-12 pt-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SitesTitle title={<>Built first<br />Priced second</>} marker={<>That&apos;s the Sorted way</>} />
          <Underline className="mt-2 w-[280px]" />
          <p className="mt-7 max-w-[490px] text-[17px] font-semibold leading-[1.55] tracking-[-0.03em]">
            We don&apos;t quote an imaginary website. We create your new homepage first — live, responsive and with content. If you want us to complete it, the price is £3,000. Fixed.
          </p>
          <ul className="mt-8 flex flex-wrap gap-6 text-[13px] font-black">
            {["No deposit", "No obligation", "No awkward sales process"].map((item) => (
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
            alt="A Sorted website shown as a finished product ready for review."
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

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-10 rounded-[20px] bg-[#070707] p-8 text-white sm:p-10 lg:grid-cols-[0.46fr_0.54fr] lg:items-center">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.12em] text-white/50">The price</p>
            <h2 className="mt-4 text-[clamp(2.2rem,4.2vw,3.8rem)] font-black leading-[0.98] tracking-[-0.045em]">One complete website.<br />One fixed price.</h2>
            <p className="mt-6 [font-family:var(--font-sites-highlight)] text-[clamp(4.6rem,9vw,8.4rem)] leading-[0.85] text-[#dfff00]">£3,000</p>
          </div>
          <div>
            <p className="text-[16px] font-semibold leading-[1.55] tracking-[-0.02em] text-white/90">
              We create your new homepage before you commit — live, responsive and with content.
            </p>
            <p className="mt-5 text-[14px] font-semibold leading-[1.55] text-white/72">
              If you want us to complete it, £3,000 covers everything required to take it live:
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Strategy", "Design", "Copy", "Development", "Content management system", "Analytics", "Launch"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[13px] font-bold">
                  <Check className="size-4 shrink-0 rounded-full bg-[#dfff00] p-0.5 text-black" strokeWidth={3.5} />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[13px] font-semibold leading-[1.5] text-white/60">Without the usual agency ambiguity.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="rounded-[18px] bg-[#f7f1e8] p-6 sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[0.32fr_0.68fr]">
            <div>
              <h2 className="max-w-[310px] text-[36px] font-black leading-[0.96] tracking-[-0.045em]">Buy the website.<br />Not a promise.</h2>
              <Underline className="mt-5 w-52" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {purchaseSteps.map(([Icon, title, copy], index) => {
                const RealIcon = Icon as typeof Pencil
                return (
                  <article key={title} className="border-black/12 sm:border-l sm:pl-6">
                    <div className="flex items-center justify-between gap-4">
                      <span className="grid size-10 place-items-center rounded-full bg-[#070707] text-[12px] font-black text-white">{index + 1}</span>
                      <RealIcon className="size-7 text-black/72" strokeWidth={2.2} />
                    </div>
                    <h3 className="mt-6 text-[15px] font-black">{title}</h3>
                    <p className="mt-2 max-w-[260px] text-[13px] font-semibold leading-[1.5] text-black/65">{copy}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <h2 className="text-[38px] font-black leading-[0.96] tracking-[-0.045em]">A complete site.<br />Built to stay strong.</h2>
          <p className="mt-6 max-w-[480px] text-[16px] font-semibold leading-[1.55] text-black/68">
            You get a complete, professional website you can be proud to send people to. We take it from build through to launch, so the final site is coherent, considered and ready to work for your business.
          </p>
        </div>
        <div className="grid gap-5 rounded-[18px] border border-black/10 bg-white p-6 sm:grid-cols-2">
          <article>
            <span className="grid size-12 place-items-center rounded-full bg-[#dfff00]"><Check className="size-6" strokeWidth={2.8} /></span>
            <h3 className="mt-5 text-[19px] font-black tracking-[-0.04em]">Everything you need to launch</h3>
            <ul className="mt-4 space-y-2 text-[13px] font-semibold leading-[1.45] text-black/68">
              {["The approved website design and structure", "Build, required setup, QA and launch", "Content editing through SortedUpdates", "A tutorial, secure CMS access and factory reset"].map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-[#83a000]" strokeWidth={3} />{item}</li>)}
            </ul>
          </article>
          <article className="border-t border-black/10 pt-6 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <span className="grid size-12 place-items-center rounded-full bg-black/5"><ShieldCheck className="size-6" strokeWidth={2.2} /></span>
            <h3 className="mt-5 text-[19px] font-black tracking-[-0.04em]">We protect the standard</h3>
            <p className="mt-4 text-[13px] font-semibold leading-[1.5] text-black/68">We remain responsible for the design and build, so your site stays cohesive, considered and a strong representation of your business long after it goes live.</p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-8 rounded-[18px] bg-[#dfff00] p-8 lg:grid-cols-[0.44fr_0.36fr_0.2fr] lg:items-center">
          <div>
            <h2 className="text-[30px] font-black tracking-[-0.04em]">£3,000 is the price. Not a starting point.</h2>
            <p className="mt-5 max-w-[420px] text-[14px] font-semibold leading-[1.5]">No tiers, no extras menu, no invoice creep. The same complete website, at the same fixed price, for every business.</p>
          </div>
          <div className="border-black/20 lg:border-l lg:pl-8">
            <p className="text-[13px] font-black">What you can expect</p>
            <ul className="mt-4 space-y-3 text-[13px] font-semibold">
              {["A fixed price before you commit", "No pressure to buy", "A clean answer if the exchange is not right for either side"].map((item) => <li key={item} className="flex gap-3"><Check className="size-4 shrink-0" strokeWidth={3} />{item}</li>)}
            </ul>
          </div>
          <div className="rounded-[14px] bg-[#070707] p-6 text-white">
            <p className="[font-family:var(--font-sites-marker)] text-[2rem] leading-[1.05]">Good work should circulate.</p>
            <p className="mt-4 text-[12px] font-semibold leading-[1.45] text-white/72">Substance first. A fair exchange. Then launch.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
        <h2 className="text-[34px] font-black tracking-[-0.035em]">Frequently asked</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            ["Is £3,000 the whole price?", "Yes. One complete website, one fixed price. It covers strategy, design, copy, development, the content management system, analytics and launch."],
            ["What happens after I approve?", "You have seen the homepage and the price is already known. £3,000 completes the site — content setup, quality assurance and launch."],
            ["Can I keep the site up to date?", "Yes. You can update everyday content such as text, images, services, prices and contact details. We look after the design and build standard so the site stays consistent."],
          ].map(([question, answer]) => (
            <article key={question} className="border-l border-black/10 pl-6">
              <h3 className="flex items-center justify-between gap-3 text-[15px] font-black">{question}<ShieldCheck className="size-4 shrink-0" /></h3>
              <p className="mt-4 text-[13px] font-semibold leading-[1.5] text-black/65">{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <DarkCta title="Ready to see your website?" copy="We build it first. You decide whether it belongs in the world." />
      <SitesFooter />
    </SitesPage>
  )
}
