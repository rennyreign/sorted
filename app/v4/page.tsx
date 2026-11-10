import { SiteMapFooter } from "@/components/SiteMapFooter"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowDown, Check, Coins, Layers, MessageSquare } from "lucide-react"
import { V4Cta, V4Nav } from "./_components/V4Shared"
import { BOOKING_URL, v4Display, v4Hand } from "./fonts"
import s from "./v4.module.css"



export const metadata: Metadata = {
  title: "Sorted | Capture every lead",
  description:
    "Digital staff that handle your enquiries, quotes and follow-ups — so you can keep up with demand without more admin.",
  alternates: { canonical: "/v4" },
  openGraph: {
    title: "Sorted | Capture every lead",
    description:
      "Digital staff that handle your enquiries, quotes and follow-ups — so you can keep up with demand without more admin.",
    url: "/v4",
  },
}

const operators = [
  { name: "Sorted Enquiry", short: "Enquiry", description: "Never lose an enquiry.", image: "/v4/intake-phone.webp", cardClass: s.cardCream, Icon: MessageSquare },
  { name: "Sorted Estimator", short: "Estimator", description: "Never delay a quote.", image: "/v4/estimator-phone.webp", cardClass: s.cardBlue, Icon: Layers },
  { name: "Sorted Chaser", short: "Chaser", description: "Get paid without the chase.", image: "/v4/chaser-phone.webp", cardClass: s.cardBlush, Icon: Coins },
]

const results = [
  { value: "+187%", label: "more enquiries", image: "/v4/results-fitness.webp", alt: "Personal trainer in a gym" },
  { value: "3x", label: "more bookings", image: "/v4/results-hospitality.webp", alt: "Plated restaurant dish" },
  { value: "+62%", label: "more sign ups", image: "/v4/results-tuition.webp", alt: "Tutor helping a child with homework" },
]

const steps = ["Audit", "Build", "Connect", "Run"]

export default function V4Home() {
  return (
    <main className={`${v4Display.variable} ${v4Hand.variable} ${s.page} min-h-screen`}>
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="v4-hero-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.36,0 L1,0 L1,1 L0.1,1 C0.14,0.86 0,0.72 0,0.52 C0,0.3 0.2,0.3 0.28,0.15 C0.32,0.08 0.34,0.04 0.36,0 Z" />
          </clipPath>
        </defs>
      </svg>

      <section className={s.hero}>
        <V4Nav overlay />

        <div className={s.heroCopy}>
          <p className={s.kicker}>AI automation for local businesses</p>
          <h1 className={`${s.display} ${s.heroTitle}`}>
            Capture every <span className={s.olive}>lead.</span>
            <br />
            Never delay a <span className={s.olive}>quote.</span>
            <br />
            Get <span className={s.olive}>paid</span> on time.
          </h1>
          <p className={s.heroSub}>
            Digital staff that handle your enquiries, quotes and follow-ups — so you can keep up with demand without more admin.
          </p>
          <div className={s.heroCtas}>
            <a href="#operators" className={s.btnPrimary}>
              See The Operators
              <ArrowDown className="size-4" strokeWidth={2.5} />
            </a>
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={s.btnGhost}>
              Book a 15-Min Diagnostic
              <ArrowRight className="size-4" strokeWidth={2.5} />
            </a>
          </div>
          <div className={s.heroProof}>
            {["Works with WhatsApp & Xero", "No new software to learn", "For UK local businesses"].map((item) => (
              <span key={item}>
                <i className={s.tick}>
                  <Check className="size-2.5" strokeWidth={4} />
                </i>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className={s.heroVisual}>
        <div className={s.heroMedia}>
          <Image
            src="/v4/hero-tradesperson.webp"
            alt="Smiling tradesperson in work overalls with arms crossed in front of a work van"
            fill
            priority
            sizes="(min-width: 1024px) 51vw, 100vw"
          />
        </div>
        <p className={`${s.hand} ${s.heroQuote}`}>
          “We haven’t worked a Sunday evening since week one.”
          <span className={s.underline} />
        </p>
        <svg className={`${s.heroArrow} max-lg:hidden`} viewBox="0 0 56 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M52 4C34 4 14 12 6 32M6 32l1-12M6 32l12-4" />
        </svg>
        </div>
      </section>

      <section id="operators" className={s.section}>
        <p className={s.kicker}>Digital Staff for Local Businesses</p>
        <h2 className={`${s.display} ${s.sectionTitle}`}>
          Three operators. <span className={s.olive}>Zero pipeline leaks.</span>
        </h2>
        <p className={s.sectionSub}>Choose the operational bottleneck that’s holding you back today, or install the full stack.</p>
        <div className={s.operatorGrid}>
          {operators.map(({ name, short, description, image, cardClass, Icon }) => (
            <article key={name} className={`${s.card} ${cardClass}`}>
              <span className={s.cardIcon}>
                <Icon className="size-[46%]" strokeWidth={2} />
              </span>
              <h3 className={`${s.display} ${s.cardTitle}`}>{name}</h3>
              <p className={s.cardDesc}>{description}</p>
              <div className={s.cardMedia}>
                <Image src={image} alt={`${name} phone preview`} fill sizes="(min-width: 840px) 30vw, 100vw" />
              </div>
              <a href="/v4/how-it-works" className={s.cardCta}>
                Explore {short}
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <div className={s.resultsLayout}>
          <div>
            <h2 className={`${s.display} ${s.resultsTitle}`}>Local businesses keep more of the demand they generate.</h2>
            <Link href="/examples" className={s.resultsLink}>
              See all results
              <ArrowRight className="size-4" strokeWidth={2.5} />
            </Link>
          </div>
          <div className={s.resultGrid}>
            {results.map((r) => (
              <div key={r.label} className={s.resultTile}>
                <div className={s.resultMedia}>
                  <Image src={r.image} alt={r.alt} fill sizes="(min-width: 900px) 20vw, 33vw" />
                </div>
                <div className={s.resultText}>
                  <p className={`${s.display} ${s.resultValue}`}>{r.value}</p>
                  <p className={s.resultLabel}>{r.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${s.section} ${s.trust}`}>
        <p className={s.trustLabel}>Trusted by businesses across the UK and beyond</p>
        <div className={s.logoRow}>
          {[
            ["bodysharp", "BodySharp Fitness"],
            ["school-of-skill", "School of Skill"],
            ["gb-halesowen", "Gracie Barra Halesowen"],
            ["warwickshire-short-stays", "Warwickshire Short Stays"],
            ["edgbaston-tuition", "Edgbaston Tuition Centre"],
          ].map(([slug, name]) => (
            <div key={slug} className={`${s.clientLogo} ${slug === "gb-halesowen" ? s.clientLogoSquare : ""}`}>
              <Image src={`/v4/logos/${slug}.webp`} alt={name} width={240} height={100} />
            </div>
          ))}
          <span className={s.logoMore}>
            And many more
            <br />
            local businesses
          </span>
        </div>
      </section>

      <section className={s.section} style={{ paddingTop: 28 }}>
        <div className={s.setup}>
          <h2 className={`${s.display} ${s.setupTitle}`}>A simple setup.</h2>
          <ol className={s.steps}>
            {steps.map((step, i) => (
              <li key={step} className="contents">
                <span className={s.step}>
                  <span className={s.stepDot}>{i + 1}</span>
                  {step}
                </span>
                {i < steps.length - 1 ? <ArrowRight className={`${s.stepArrow} size-4`} strokeWidth={2} aria-hidden="true" /> : null}
              </li>
            ))}
          </ol>
          <p className={`${s.hand} ${s.setupNote}`}>
            <span>
              Live in days,
              <br />
              not months.
              <i className={s.underline} />
            </span>
          </p>
        </div>
      </section>

      <V4Cta />

      <SiteMapFooter tone="light" experience="automation" />
    </main>
  )
}
