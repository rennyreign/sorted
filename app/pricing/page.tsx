import { MarketCopy } from "@/components/MarketPricing"
import type { Metadata } from "next"
import { Check } from "lucide-react"
import { SitesFooter, SitesHeader, SitesPage, Underline } from "../sites/_components/SitesPrimitives"
import { MockupButton } from "../sites/_components/SitesMockupModal"


export const metadata: Metadata = {
  title: "Pricing | Sorted",
  description:
    "A small-business website for £999 in the UK or $3,500 in the US. Up to five pages, one revision round, content editing and basic analytics.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing | Sorted",
    description:
      "A fixed-scope website, with a first-page preview before you commit. Campaigns and AI automation are separate services.",
    url: "/pricing",
  },
}

const exchangeSteps = [
  ["We build", "Your first page, free."],
  ["You review", "See the work before deciding."],
  ["You approve", "{deposit} starts the complete build."],
  ["We launch", "{balance} when ready to launch."],
] as const

const websiteIncludes = [
  "Up to five pages with design and draft copy",
  "One consolidated revision round",
  "Build, content editing and launch",
  "Contact route and basic on-page SEO",
  "Analytics and handover",
] as const

const faqs = [
  ["Is {total} the whole website price?", "Yes, for the agreed website launch scope. It includes up to five pages, design and draft copy, one consolidated revision round, content editing, basic analytics and launch. Campaign creative, ad spend, follow-up automation, ongoing management, extra pages and paid third-party services are quoted separately."],
  ["What is free?", "We build your first page free. You can review the work without committing to the complete website build."],
  ["When do I pay for the website?", "A {deposit} deposit starts the complete build after you approve the first version. The remaining {balance} is due when the site is ready to launch."],
  ["Are advertising and AI automation included?", "No. The website package is a defined website build. Advertising, follow-up connections and AI operators are separate services, with scope and price agreed before work begins."],
  ["Do I need a retainer?", "No. Ongoing support can be agreed for a system that needs maintaining or improving, but it is not a requirement of the project."],
  ["Can I keep the website up to date?", "Yes. You can edit everyday content such as text, images, services, prices and contact details while the design stays protected."],
] as const

export default function PricingPage() {
  return (
    <SitesPage>
      <SitesHeader active="pricing" cta="website" />

      <section className="mx-auto max-w-[1220px] px-5 pb-8 pt-14 sm:px-8 sm:pt-20">
        <p className="text-[12px] font-black uppercase tracking-[0.16em] text-black/45">Pricing</p>
        <h1 className="mt-4 max-w-[720px] text-[clamp(3rem,4.8vw,4.8rem)] font-black leading-[0.94] tracking-[-0.05em]">
          Clear prices. Clear scope.
        </h1>
        <Underline className="mt-5 w-[min(280px,72vw)]" />
        <p className="mt-6 max-w-[540px] text-[16px] font-semibold leading-[1.6] tracking-[-0.02em] text-black/72">
          Your website, with a clear scope and one fixed price. See the first page before you decide.
        </p>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 pb-14 sm:px-8 sm:pb-16">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <article id="included" className="flex scroll-mt-24 flex-col overflow-hidden rounded-[24px] bg-[#0a0a0a] p-6 text-white sm:p-8">
            <p className="text-[12px] font-black uppercase tracking-[0.16em] text-white/45">Website</p>
            <h2 className="mt-4 max-w-[460px] text-[clamp(1.9rem,2.6vw,2.6rem)] font-black leading-[0.98] tracking-[-0.045em]">
              Your website, built and launched.
            </h2>
            <p className="mt-6 text-[clamp(3rem,5vw,4.5rem)] font-black leading-[0.85] tracking-[-0.06em] text-[#dfff00] tabular-nums"><MarketCopy>{"{total}"}</MarketCopy></p>
            <p className="mt-5 max-w-[420px] text-[14px] font-semibold leading-[1.55] text-white/78">
              We build your first page free. Decide whether to take it further.
            </p>

            <div className="mt-8 grid gap-px overflow-hidden rounded-[14px] bg-white/12 sm:grid-cols-2">
              {exchangeSteps.map(([title, copy], index) => (
                <div key={title} className="flex items-start gap-3 bg-white/[0.06] p-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#dfff00] text-[12px] font-black text-black">{index + 1}</span>
                  <div>
                    <h3 className="text-[14px] font-black tracking-[-0.02em]">{title}</h3>
                    <p className="mt-1 text-[14px] font-semibold leading-[1.45] text-white/62"><MarketCopy>{copy}</MarketCopy></p>
                  </div>
                </div>
              ))}
            </div>

            <ul className="mt-7 grid gap-3">
              {websiteIncludes.map((item) => (
                <li key={item} className="flex items-center gap-3 border-b border-white/10 pb-3 text-[14px] font-bold">
                  <Check className="size-5 shrink-0 rounded-full bg-[#dfff00] p-1 text-black" strokeWidth={3.5} />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[14px] font-semibold leading-[1.55] text-white/58">
              Ad spend, ongoing management and additional services are agreed separately.
            </p>
            <div className="mt-auto pt-7">
              <MockupButton variant="yellow" className="w-full" />
            </div>
          </article>

          <article className="flex flex-col rounded-[24px] bg-[#f7f1e8] p-6 sm:p-8">
            <p className="text-[12px] font-black uppercase tracking-[0.16em] text-black/45">Keep the scope clear</p>
            <h2 className="mt-4 text-[clamp(1.9rem,2.6vw,2.6rem)] font-black leading-tight tracking-[-0.04em]">A website first.<br />The next step when you need it.</h2>
            <p className="mt-6 text-[16px] leading-relaxed">The fixed package is for a small-business website. Online shops, customer logins, bespoke integrations, additional pages and extra revision rounds need a separate quote.</p>
            <p className="mt-5 text-[16px] leading-relaxed">We confirm any hosting, domain, software and tax charges in your written quote before you commit.</p>
            <div className="mt-8 space-y-5 text-[16px]"><a href="/what-else-we-do" className="block font-bold underline underline-offset-4">People visit, but don’t enquire? See what we improve.</a><a href="/v4" className="block font-bold underline underline-offset-4">Enquiries piling up? Explore AI automation.</a></div>
            <p className="mt-auto pt-8 text-[14px] leading-relaxed text-black/60">Existing client agreements and individual quotes retain their agreed scope and price.</p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="flex items-end justify-between gap-6 border-b border-black/12 pb-5">
          <h2 className="text-[clamp(2.1rem,3.5vw,3.1rem)] font-black leading-none tracking-[-0.045em]">Frequently asked</h2>
        </div>
        <div className="grid md:grid-cols-2">
          {faqs.map(([question, answer], index) => (
            <article key={question} className="border-b border-black/10 py-7 md:border-l md:px-7 md:odd:border-l-0 md:odd:pl-0 md:last:pr-0">
              <div className="flex items-start justify-between gap-4">
                <h3 className="max-w-[380px] text-[16px] font-black leading-[1.2] tracking-[-0.02em]"><MarketCopy>{question}</MarketCopy></h3>
                <span className="text-[12px] font-black text-black/35">0{index + 1}</span>
              </div>
              <p className="mt-4 max-w-[560px] text-[14px] font-semibold leading-[1.6] text-black/62"><MarketCopy>{answer}</MarketCopy></p>
            </article>
          ))}
        </div>
      </section>

      <SitesFooter />
    </SitesPage>
  )
}
