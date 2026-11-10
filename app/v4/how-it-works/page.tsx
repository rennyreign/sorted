import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, Check, Phone } from "lucide-react"
import { V4Cta, V4Nav } from "../_components/V4Shared"
import { v4Display, v4Hand, WHATSAPP_NUMBER } from "../fonts"
import s from "../v4.module.css"

export const metadata: Metadata = {
  title: "How It Works | Sorted",
  description: "From first enquiry to paid invoice. Three operators work inside the tools you already use.",
  alternates: { canonical: "/v4/how-it-works" },
}

const journey = [
  { num: "01", title: "Enquiry", sub: "Enquiry to booking", href: "#enquiry" },
  { num: "02", title: "Estimator", sub: "Voice note to quote", href: "#estimator" },
  { num: "03", title: "Chaser", sub: "Invoice to payment", href: "#chaser" },
]

const setup = [
  { title: "Audit", copy: "We look at how enquiries, quotes and payments reach you today, and where they slip." },
  { title: "Build", copy: "We set up your operator around your services, your rules and the way you talk to customers." },
  { title: "Connect", copy: "We link your WhatsApp, calendar and accounting software. You approve it before it goes live." },
  { title: "Run", copy: "It handles the admin. You get the summaries and keep working." },
]

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className={s.featureBullets}>
      {items.map((item) => (
        <li key={item}>
          <i className={s.tick}>
            <Check className="size-2.5" strokeWidth={4} />
          </i>
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function V4HowItWorks() {
  return (
    <main className={`${v4Display.variable} ${v4Hand.variable} ${s.page} ${s.howPage} min-h-screen`}>
      <V4Nav />

      <section className={s.pageHero}>
        <div className={s.howHeroGrid}>
          <div>
            <p className={s.kicker}>Plugged into your workflow</p>
            <h1 className={`${s.display} ${s.pageTitle}`}>
              From first enquiry to<br /> <span className={s.olive}>paid invoice.</span>
            </h1>
            <p className={s.pageSub}>Three operators work inside the tools you already use.</p>
            <div className={s.heroCtas}>
              <Link href="/v4/demo" className={s.btnPrimary}>
                Try the WhatsApp demo
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </Link>
              <Link href="/v4/pricing" className={s.btnGhost}>
                See pricing
              </Link>
            </div>
          </div>
          <div className={s.howHeroArt} aria-hidden="true">
            <Image src="/v4/how-it-works-hero.webp" alt="" width={1536} height={1024} sizes="(min-width: 840px) 44vw, 320px" priority />
          </div>
        </div>
      </section>

      <section className={s.section}>
        <nav className={s.journey} aria-label="The three operators">
          {journey.map((step, i) => (
            <div key={step.num} className={s.journeyItem}>
              <Link href={step.href} className={s.journeyStep}>
                <span className={s.stepDot}>{step.num}</span>
                <span className={s.journeyText}>
                  <span className={`${s.display} ${s.journeyTitle}`}>{step.title}</span>
                  <span className={s.journeySub}>{step.sub}</span>
                </span>
              </Link>
              {i < journey.length - 1 && <ArrowRight className={`${s.journeyArrow} size-5`} strokeWidth={2} aria-hidden="true" />}
            </div>
          ))}
        </nav>
      </section>

      <section className={s.section}>
        <div className={s.featureList}>
          <article id="enquiry" className={`${s.feature} ${s.cardCream}`}>
            <div className={s.featureCopy}>
              <p className={s.featureNum}>01 / Sorted Enquiry</p>
              <h2 className={`${s.display} ${s.featureTitle}`}>Turn enquiries<br />into bookings.</h2>
              <Bullets items={["Replies on WhatsApp", "Collects the job details", "Books a slot in your diary"]} />
            </div>
            <div className={s.demoCard} aria-hidden="true">
              <p className={s.mockHead}>WhatsApp</p>
              <p className={s.bubble}>Hi, my boiler’s stopped working. Can you help?</p>
              <p className={`${s.bubble} ${s.bubbleOut}`}>Sure — I can book a boiler visit for you. What day works best?</p>
              <p className={s.bubble}>Thursday morning would be great.</p>
              <p className={s.statusChip}>
                <Calendar className="size-4" strokeWidth={2.5} />
                Boiler visit booked · Thu 11:30
              </p>
            </div>
          </article>

          <article id="estimator" className={`${s.feature} ${s.featureFlip} ${s.cardBlue}`}>
            <div className={s.featureCopy}>
              <p className={s.featureNum}>02 / Sorted Estimator</p>
              <h2 className={`${s.display} ${s.featureTitle}`}>Talk through the job.<br />Get a draft quote.</h2>
              <Bullets items={["Record a voice note", "Your rates fill the draft", "Review and approve before sending"]} />
            </div>
            <div className={s.demoCard} aria-hidden="true">
              <p className={s.demoCardTitle}>Draft estimate</p>
              <p className={s.row}>Call-out <small>£80</small></p>
              <p className={s.row}>Replacement pump <small>£140</small></p>
              <p className={`${s.row} ${s.rowLime}`}>Total <small>£220</small></p>
              <p className={s.chip}>Awaiting your approval</p>
            </div>
          </article>

          <article id="chaser" className={`${s.feature} ${s.cardBlush}`}>
            <div className={s.featureCopy}>
              <p className={s.featureNum}>03 / Sorted Chaser</p>
              <h2 className={`${s.display} ${s.featureTitle}`}>Follow up on<br />unpaid invoices.</h2>
              <Bullets items={["See what’s due", "Send reminders on your schedule", "Stop reminders when payment is recorded"]} />
            </div>
            <div className={s.demoCard} aria-hidden="true">
              <p className={s.demoCardTitle}>Invoice #1042</p>
              <ol className={s.invoiceTimeline}>
                <li>
                  <span className={s.invDot}><Check className="size-3" strokeWidth={3.5} /></span>
                  <span className={s.invBody}><strong>Invoice sent</strong><small>Mon 10 Jun</small></span>
                </li>
                <li>
                  <span className={s.invDot}><Check className="size-3" strokeWidth={3.5} /></span>
                  <span className={s.invBody}><strong>Reminder sent</strong><small>Thu 13 Jun</small></span>
                </li>
                <li>
                  <span className={`${s.invDot} ${s.invDotLime}`}><Check className="size-3" strokeWidth={3.5} /></span>
                  <span className={s.invBody}>
                    <strong className={s.statusChip}>Payment received · £220</strong>
                    <small>Mon 17 Jun</small>
                  </span>
                </li>
              </ol>
            </div>
          </article>
        </div>
      </section>

      <section className={s.section}>
        <h2 className={`${s.display} ${s.sectionTitle}`}>
          Works with the tools you <span className={s.olive}>already use.</span>
        </h2>
        <ol className={s.timeline}>
          {setup.map((step, i) => (
            <li key={step.title} className={s.timelineStep}>
              <span className={s.stepDot}>{i + 1}</span>
              <h3 className={`${s.display} ${s.timelineTitle}`}>{step.title}</h3>
              <p className={s.timelineCopy}>{step.copy}</p>
              {i < setup.length - 1 && <ArrowRight className={s.setupConnector} aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </section>

      <V4Cta
        title={<>Find where<br /> <span className={s.lime}>jobs get held up.</span></>}
        copy="Book a 15-minute diagnostic. We’ll identify where you’re losing jobs and show you what an operator looks like inside your workflow."
        note={null}
      />
      <footer className={s.howFooter}>
        <div className={s.howFooterGrid}>
          <div><Link href="/v4" className={s.wordmark}>Sorted<i>.</i></Link><p>We make good businesses more capable.</p></div>
          <div><h3>How we help</h3><Link href="/v4#operators">Operators</Link><Link href="/v4/pricing">Pricing</Link><Link href="/v4/how-it-works">How It Works</Link><Link href="/v4/about">About</Link></div>
          <div><h3>Company</h3><Link href="/examples">Our work</Link><Link href="/websites#reviews">Reviews</Link><Link href="/partners">Partner program</Link><a href="mailto:hello@sortmydigital.site">Contact</a></div>
          <div><h3>Let’s talk</h3><a className={s.howWhatsapp} href={`https://wa.me/${WHATSAPP_NUMBER}`}><Phone size={14} />WhatsApp us</a><a href="mailto:hello@sortmydigital.site">hello@sortmydigital.site</a></div>
        </div>
        <div className={s.howLegal}><p>© 2026 Sorted. All rights reserved.</p><span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></span></div>
      </footer>
    </main>
  )
}
