import type { Metadata } from "next"
import { ArrowRight, Check, Plus } from "lucide-react"
import { SiteMapFooter } from "@/components/SiteMapFooter"
import { AssistantsHeader } from "../_components/AssistantsHeader"

export const metadata: Metadata = {
  title: "Assistant pricing | Sorted",
  description: "£600 setup, £175 a month. One assistant, built around how your business works.",
  alternates: { canonical: "/assistants/pricing" },
  openGraph: {
    title: "Assistant pricing | Sorted",
    description: "£600 setup, £175 a month. One assistant, built around how your business works.",
    url: "/assistants/pricing",
  },
}

const label = "text-[12px] font-black uppercase tracking-[0.14em] text-black/55"

const ticks = [
  "Tailored to the jobs you give it",
  "Quotes and anything important wait for your OK",
  "We look after it each month",
]

const feeScope = [
  {
    title: "What we set up once",
    surface: "bg-[#f6f5ec]",
    items: [
      "Map how you handle the work today",
      "Set it up around your tools and rules",
      "Test a real job with you before it goes live",
    ],
  },
  {
    title: "What we look after each month",
    surface: "bg-[#e8f3fa]",
    items: [
      "Keep an eye on how it's running",
      "Fix issues as they come up",
      "Keep it working as your tools change",
    ],
  },
]

const faqs = [
  {
    q: "Do I need to install anything?",
    a: "No. We set it up around how you already work — usually texts, WhatsApp, your calendar and your invoicing tool. You just approve the access.",
  },
  {
    q: "Can it do more than one job?",
    a: "Yes. Most owners start with the one job that pays back fastest — often enquiries or quotes — then add more once the first is running smoothly.",
  },
  {
    q: "Are software and VAT included?",
    a: "The £175 covers setup and our monthly looking-after. Your own software subscriptions stay in your name and aren't included. We'll confirm VAT on your quote.",
  },
  {
    q: "Is there a minimum term?",
    a: "Setup is a one-off and the retainer runs monthly. We confirm the notice terms in writing before you commit — no surprises.",
  },
]

export default function AssistantsPricingPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#fafafa] text-[#111]">
      <AssistantsHeader />

      <section className="mx-auto max-w-[1280px] px-6 pb-14 pt-10 sm:px-10 sm:pt-14">
        <p className={label}>Fixed scope. Simple retainer.</p>
        <h1 className="mt-3 text-[clamp(2.9rem,6vw,5.6rem)] font-black uppercase leading-[0.9] tracking-[-0.06em]">Pay once to set up.<br /><span className="mt-2 inline-block bg-[#e4ff29] px-3 py-1">Then one monthly fee.</span></h1>
        <p className="mt-6 max-w-[560px] text-[clamp(1.05rem,1.4vw,1.25rem)] font-semibold leading-[1.45] text-black/65">One assistant, built around how your business already works.</p>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-10 sm:px-10 sm:py-16">
        <article className="mx-auto max-w-[640px] rounded-[22px] bg-black p-8 text-white sm:p-12">
          <p className="text-[12px] font-black uppercase tracking-[0.14em] text-white/55">Your assistant</p>
          <h2 className="mt-3 text-[clamp(1.8rem,3.4vw,2.6rem)] font-black leading-[1.05] tracking-[-0.045em]">One assistant. Built for your business.</h2>
          <p className="mt-8 flex items-baseline gap-3">
            <span className="text-[clamp(3rem,5vw,4.5rem)] font-black text-[#e4ff29] tabular-nums">£600</span>
            <span className="text-[14px] font-black uppercase tracking-[0.14em] text-white/55">setup</span>
          </p>
          <p className="mt-2 text-[clamp(1.2rem,2vw,1.5rem)] font-semibold text-white">+ £175 a month</p>
          <ul className="mt-8 space-y-4">
            {ticks.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[clamp(1rem,1.25vw,1.15rem)] font-semibold text-white/85">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-white/10 bg-[#e4ff29] text-black">
                  <Check className="size-3" strokeWidth={4} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[13px] leading-relaxed text-white/50">Your own software subscriptions and VAT confirmed on your written quote.</p>
          <a href="https://cal.com/sortmydigital/15min" data-track="cta_click" data-cta-text="Let’s talk it through" data-cta-location="pricing_card" className="mt-8 inline-flex min-h-14 items-center gap-4 rounded-full bg-[#e4ff29] px-8 text-[16px] font-black text-black transition-colors hover:bg-white">Let&apos;s talk it through<ArrowRight size={20} /></a>
        </article>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-10 sm:px-10 sm:py-16">
        <h2 className="mt-3 text-[clamp(2.6rem,5.4vw,4.6rem)] font-black leading-[0.95] tracking-[-0.055em]">What your fees cover</h2>
        <div className="mt-9 grid gap-6 md:grid-cols-2">
          {feeScope.map((panel) => (
            <div key={panel.title} className={`rounded-[22px] p-8 ${panel.surface}`}>
              <h3 className="text-[clamp(1.7rem,2.3vw,2.2rem)] font-black leading-[1] tracking-[-0.045em]">{panel.title}</h3>
              <ul className="mt-6 space-y-4">
                {panel.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[clamp(1rem,1.25vw,1.15rem)] font-semibold text-black/75">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-black text-white">
                      <Check className="size-3" strokeWidth={4} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-10 sm:px-10 sm:py-16">
        <p className={label}>Frequently asked</p>
        <h2 className="mt-3 text-[clamp(2.6rem,5.4vw,4.6rem)] font-black leading-[0.95] tracking-[-0.055em]">Questions before you book?</h2>
        <div className="mt-9 border-t border-black/15">
          {faqs.map((item) => (
            <details key={item.q} className="group border-b border-black/15 py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[clamp(1.25rem,1.8vw,1.6rem)] font-black leading-[1.1] tracking-[-0.035em] [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus className="size-6 shrink-0 transition-transform group-open:rotate-45" strokeWidth={2} aria-hidden="true" />
              </summary>
              <p className="mt-4 max-w-[720px] text-[clamp(1rem,1.25vw,1.15rem)] font-semibold leading-[1.5] text-black/65">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-14 sm:px-10 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[22px] bg-black p-8 text-white sm:p-12 md:flex-row md:items-center">
          <div>
            <h2 className="text-[clamp(2.2rem,4.2vw,3.6rem)] font-black leading-[1.05] tracking-[-0.045em]">Where should it win first?</h2>
            <p className="mt-3 max-w-[520px] text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-white/70">Bring one recent job. In 15 minutes we&apos;ll show you what it would have handled.</p>
          </div>
          <a href="https://cal.com/sortmydigital/15min" data-track="cta_click" data-cta-text="Let’s talk it through" data-cta-location="pricing_closing" className="inline-flex min-h-14 shrink-0 items-center gap-4 rounded-full bg-[#e4ff29] px-8 text-[16px] font-black text-black transition-colors hover:bg-white">Let&apos;s talk it through<ArrowRight size={20} /></a>
        </div>
      </section>

      <SiteMapFooter experience="assistants" />
    </main>
  )
}
