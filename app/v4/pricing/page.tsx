import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, Phone, Plus } from "lucide-react"
import { V4Nav } from "../_components/V4Shared"
import { BOOKING_URL, v4Display, v4Hand, WHATSAPP_NUMBER } from "../fonts"
import s from "../v4.module.css"

export const metadata: Metadata = {
  title: "Pricing | Sorted",
  description: "Pay once to set up. Then one monthly fee. Choose where you need help: enquiries, quotes or getting paid.",
  alternates: { canonical: "/v4/pricing" },
}

const tiers = [
  {
    name: "Single Operator",
    reason: "One part of the job keeps slipping.",
    badge: null as string | null,
    featured: false,
    setup: "£950",
    monthly: "+ £175 a month",
    coverage: "Choose Enquiry, Estimator or Chaser.",
  },
  {
    name: "Dual Pipeline",
    reason: "Enquiries and quotes both get held up.",
    badge: "Enquiry to quote",
    featured: true,
    setup: "£1,850",
    monthly: "+ £295 a month",
    coverage: "Enquiry + Estimator",
  },
  {
    name: "Full Operations Stack",
    reason: "You also spend time chasing invoices.",
    badge: null as string | null,
    featured: false,
    setup: "£2,500",
    monthly: "+ £395 a month",
    coverage: "Enquiry + Estimator + Chaser",
  },
]

const feeScope = [
  {
    title: "What we set up once",
    surface: s.cardCream,
    items: [
      "Map how you handle the work today",
      "Configure your rules and connect the relevant tools",
      "Test a typical job with you before launch",
    ],
  },
  {
    title: "What we look after each month",
    surface: s.cardBlue,
    items: [
      "Monitor the connected workflows",
      "Investigate issues when they come up",
      "Maintain the operator as your tools change",
    ],
  },
]

const faqs = [
  {
    q: "Which tools do I need to connect?",
    a: "WhatsApp, your calendar (Google Calendar or Microsoft Outlook) and your accounting software (Xero or QuickBooks). We do the connecting during setup — you just approve the access.",
  },
  {
    q: "Can I start with one operator and add another?",
    a: "Yes. Most people start with the one that fixes the biggest headache, then add the next once the first is running smoothly. The setup work carries over, so adding later is quicker and cheaper than starting again.",
  },
  {
    q: "Are VAT and software fees included?",
    a: "The figures above cover the Sorted setup and monthly retainer. Your own software subscriptions — like Xero or your WhatsApp Business line — stay in your name and aren’t included. We’ll confirm VAT treatment on your quote.",
  },
  {
    q: "Is there a minimum commitment?",
    a: "The setup is a one-off and the retainer runs monthly. We’ll confirm the notice terms in writing before you sign anything — no surprises.",
  },
]

export default function V4Pricing() {
  return (
    <main className={`${v4Display.variable} ${v4Hand.variable} ${s.page} ${s.pricingPage} min-h-screen`}>
      <V4Nav />

      <section className={s.pageHero}>
        <p className={s.kicker}>Fixed scope. Simple retainer.</p>
        <h1 className={`${s.display} ${s.pageTitle}`}>
          Pay once to set up. <span className={s.olive}>Then one monthly fee.</span>
        </h1>
        <p className={s.pageSub}>Choose where you need help: enquiries, quotes or getting paid.</p>
      </section>

      <section className={s.section}>
        <div className={s.priceGrid}>
          {tiers.map((tier) => (
            <article key={tier.name} className={`${s.priceCard} ${tier.featured ? s.priceCardFeatured : ""}`}>
              {tier.badge && <span className={s.priceBadge}>{tier.badge}</span>}
              <h2 className={`${s.display} ${s.priceName}`}>{tier.name}</h2>
              <p className={s.priceReason}>{tier.reason}</p>
              <p className={s.priceRow}>
                <span className={`${s.display} ${s.priceSetup}`}>{tier.setup}</span>
                <span className={s.priceSetupLabel}>setup</span>
              </p>
              <p className={s.priceMonthly}>{tier.monthly}</p>
              <p className={s.priceCoverage}>
                <i className={s.tick}>
                  <Check className="size-2.5" strokeWidth={4} />
                </i>
                {tier.coverage}
              </p>
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={`${s.priceCta} ${tier.featured ? s.priceCtaLime : ""}`}>
                Book a diagnostic
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <h2 className={`${s.display} ${s.pricingHeading}`}>What your fees cover</h2>
        <div className={s.feeGrid}>
          {feeScope.map((panel) => (
            <div key={panel.title} className={`${s.feePanel} ${panel.surface}`}>
              <h3 className={`${s.display} ${s.feeTitle}`}>{panel.title}</h3>
              <ul className={s.featureBullets}>
                {panel.items.map((item) => (
                  <li key={item}>
                    <i className={s.tick}>
                      <Check className="size-2.5" strokeWidth={4} />
                    </i>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <h2 className={`${s.display} ${s.pricingHeading}`}>Questions before you book?</h2>
        <div className={s.faq}>
          {faqs.map((item) => (
            <details key={item.q} className={s.faqRow}>
              <summary>
                {item.q}
                <Plus className="size-5" strokeWidth={2} aria-hidden="true" />
              </summary>
              <p className={s.faqAnswer}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <div className={s.priceDiag}>
          <div>
            <h2 className={`${s.display} ${s.diagTitle}`}>
              Which operator<br />should you <span className={s.lime}>start with?</span>
            </h2>
            <p className={s.diagCopy}>
              Bring one recent job that got held up. In 15 minutes, we’ll walk through it and tell you where we’d start.
            </p>
          </div>
          <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={s.diagCta}>
            Book a diagnostic
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </a>
        </div>
      </section>

      <footer className={s.howFooter}>
        <div className={s.howFooterGrid}>
          <div>
            <Link href="/v4" className={s.wordmark}>Sorted<i>.</i></Link>
            <p>We make good businesses more capable.</p>
            <p>Business modernisation for local businesses.</p>
          </div>
          <div>
            <h3>How we help</h3>
            <Link href="/v4">Websites</Link>
            <Link href="/v4#operators">Operations</Link>
            <Link href="/v4/pricing">Pricing</Link>
            <Link href="/v4">SortedUpdates</Link>
          </div>
          <div>
            <h3>Company</h3>
            <Link href="/v4/how-it-works">How we work</Link>
            <Link href="/examples">Our work</Link>
            <Link href="/v4/about">About us</Link>
            <Link href="/websites#reviews">Reviews</Link>
            <Link href="/partners">Partner program</Link>
            <a href="mailto:hello@sortmydigital.site">Contact</a>
          </div>
          <div>
            <h3>Let’s talk</h3>
            <a className={s.howWhatsapp} href={`https://wa.me/${WHATSAPP_NUMBER}`}><Phone size={14} />WhatsApp us</a>
            <a href="mailto:hello@sortmydigital.site">hello@sortmydigital.site</a>
          </div>
        </div>
        <div className={s.howLegal}>
          <p>© 2026 Sorted. Sorted is a trading name of ADX Engine Ltd · Registered in England &amp; Wales · Company number 17327041</p>
          <span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></span>
        </div>
      </footer>
    </main>
  )
}
