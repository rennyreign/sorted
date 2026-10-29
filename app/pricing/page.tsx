import { MarketCopy } from "@/components/MarketPricing"
import type { Metadata } from "next"
import { Check } from "lucide-react"
import { SitesFooter, SitesHeader, SitesPage, Underline } from "../sites/_components/SitesPrimitives"
import { MockupButton } from "../sites/_components/SitesMockupModal"


export const metadata: Metadata = {
  title: "Pricing | Sorted",
  description:
    "A complete website launch at one fixed price — £1,500 in the UK or $1,750 in the US — covering strategy, design, copy, build, CMS, analytics and launch.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing | Sorted",
    description:
      "A complete website launch at one fixed price — £1,500 in the UK or $1,750 in the US.",
    url: "/pricing",
  },
}

const exchangeSteps = [
  ["We design", "Your tailored first page."],
  ["You review", "See the work before deciding."],
  ["You approve", "{deposit} starts the complete build."],
  ["We launch", "{balance} when ready to launch."],
] as const

const websiteIncludes = [
  "Strategy, design and copy",
  "Build, content editing and launch",
  "Agreed ad creative and follow-up setup",
  "Analytics and handover",
] as const

const faqs = [
  ["Is {total} the whole website price?", "Yes, for the agreed website launch scope. It includes the website, content editing, analytics, agreed ad creative and follow-up setup, and launch. Ad spend, ongoing management, paid third-party services and additional integrations are agreed separately."],
  ["What do I see before paying?", "A tailored first page to review, designed around your business. You can review the work before committing to the complete website build."],
  ["When do I pay for the website?", "A {deposit} deposit starts the complete build after you approve the first version. The remaining {balance} is due when the site is ready to launch."],
  ["What if I already have a website?", "We can rebuild it. The process is the same — you see the new direction first, then decide whether to take it further."],
  ["Do I need to pay monthly?", "No. The website launch is one fixed price. Ongoing support can be agreed for a site that needs maintaining or improving, but it is not a requirement."],
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
          One fixed website launch price. Everything your new website needs to go live.
        </p>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 pb-14 sm:px-8 sm:pb-16">
        <div className="grid gap-6">
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
