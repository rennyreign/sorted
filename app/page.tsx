import { MarketCopy } from "@/components/MarketPricing"
import type { Metadata } from "next"
import Image from "next/image"
import { ArrowRight, ArrowUpRight, Check, Edit3, Eye, MessageSquare, Monitor, Search, Rocket } from "lucide-react"
import { SitesFooter, SitesHeader, SitesPage } from "./sites/_components/SitesPrimitives"
import { MockupButton } from "./sites/_components/SitesMockupModal"
import { ImprovementButton } from "./sites/_components/ImprovementEntry"
import { GoogleReviews } from "./sites/_components/GoogleReviews"
import { exampleCaseStudies } from "./examples/_caseStudies"
import { getGoogleReviews } from "@/lib/googleReviews"
import s from "./home.module.css"

export const metadata: Metadata = {
  title: "Sorted | We make good businesses more capable",
  description:
    "We modernise how local businesses win customers and get work done. Better digital systems. Less unnecessary work. More capacity to grow.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Sorted | We make good businesses more capable",
    description:
      "We modernise how local businesses win customers and get work done. Better digital systems. Less unnecessary work. More capacity to grow.",
    url: "/",
  },
}

const portfolioSlugs = ["school-of-skill", "warwickshire-short-stays", "bodysharp-fitness"]

export default async function SortedHome() {
  const googleReviews = await getGoogleReviews()
  const portfolio = portfolioSlugs
    .map((slug) => exampleCaseStudies.find((example) => example.slug === slug))
    .filter((example): example is (typeof exampleCaseStudies)[number] => Boolean(example))

  return (
    <SitesPage>
      <SitesHeader tone="dark" variant="home" />

      <section className={s.hero}>
        <div className={s.heroMedia}>
          <Image
            src="/sorted-home/hero-workshop.webp"
            alt="Illustrative electrical services website first page on a laptop in a trades workshop"
            fill
            priority
            sizes="(min-width: 1024px) 100vw, 100vw"
          />
          <div className={s.heroShade} aria-hidden="true" />
        </div>
        <div className={s.wrap}>
          <div className={s.heroInner}>
            <div className={s.heroCopy}>
              <p className={s.heroKicker}>Business Modernisation</p>
              <h1 className={s.heroTitle}>
                We make good{" "}
                <br />
                businesses{" "}
                <br />
                <span className={s.heroScript}>
                  more capable.
                  <span className={s.heroScriptUnderline} aria-hidden="true" />
                </span>
              </h1>
              <p className={s.heroBody}>
                We modernise how local businesses win customers and get work done.
              </p>
              <p className={s.heroSub}>
                Better digital systems. Less unnecessary work. More capacity to grow.
              </p>
              <div className={s.heroCtaRow}>
                <ImprovementButton variant="yellow" className={s.mockupCta} />
                <span className={s.ctaNote}>
                  No pressure.
                  <i aria-hidden="true" />
                  No obligation.
                </span>
              </div>
            </div>

            <div className={s.annotation} aria-hidden="true">
              <span className={s.annotationText}>
                Good business.
                <br />
                Better equipped.
              </span>
              <svg className={s.annotationArrow} width="76" height="52" viewBox="0 0 76 52" fill="none" aria-hidden="true">
                <path d="M5 5 C 22 28, 44 40, 66 41" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M58 34 L68 42 L55 46" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className={s.conceptTag}>Illustrative website concept</span>
          </div>
        </div>
      </section>

      <section className={s.proof} aria-label="How Sorted works with your business">
        <div className={s.wrap}>
          <div className={s.proofGrid}>
            {[
              [Eye, "Understand the problem", "We look for the gap that is costing you most."],
              [Search, "Show the improvement", "You see what better could look like first."],
              [Check, "Build the solution", "We deliver the agreed change, not a promise."],
              [Edit3, "Keep you in control", "Clear scope, clear price, your decision throughout."],
            ].map(([Icon, title, copy]) => {
              const RealIcon = Icon as typeof Eye
              return (
                <article key={title as string} className={s.proofItem}>
                  <span className={s.proofIcon}>
                    <RealIcon className="size-6" strokeWidth={2.4} />
                  </span>
                  <div>
                    <h2 className={s.proofTitle}>{title as string}</h2>
                    <p className={s.proofDetail}>{copy as string}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className={s.growth}>
        <div className={s.wrap}>
          <div className={s.growthInner}>
            <div>
              <h2 className={s.growthTitle}>Good businesses deserve better systems.</h2>
              <span className={s.growthScript}>Not more hassle.</span>
              <span className={s.growthUnderline} aria-hidden="true" />
              <p className={s.growthBody}>
                A good business needs more than a good first impression. We improve how customers find, trust and contact you — and how the work gets done behind the scenes.
              </p>
              <a href="/howitworks" className={s.growthCta}>
                See how we work <ArrowRight className="size-4" strokeWidth={2.8} />
              </a>
            </div>
            <ul className={s.benefitList}>
              {[
                ["Get noticed.", "Make the quality of your work easier to find and easier to trust."],
                ["Win customers.", "Clearer routes to enquire, book and buy — less friction between interest and a decision."],
                ["Get work done.", "Fewer repeated manual tasks and less chasing, so the day has more room in it."],
              ].map(([title, copy]) => (
                <li key={title} className={s.benefitItem}>
                  <span className={s.benefitRing}>
                    <Check className="size-4" strokeWidth={3} color="#dfff00" />
                  </span>
                  <div>
                    <h3 className={s.benefitTitle}>{title}</h3>
                    <p className={s.benefitCopy}>{copy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={s.growthMedia}>
          <Image
            src="/sorted-home/branded-van.webp"
            alt="A Sorted sign-written van on an autumn street — brand concept"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
          <div className={s.growthFade} aria-hidden="true" />
        </div>
      </section>

      <section className={s.process}>
        <div className={`${s.wrap} ${s.processInner}`}>
          <div>
            <h2 className={s.sectionTitle}>How we modernise businesses.</h2>
            <span className={s.sectionUnderline} aria-hidden="true" />
            <p className={s.sectionBody}>
              No jargon. No drawn-out process. One improvement at a time, agreed with you before work starts.
            </p>
            <a href="/howitworks" className={s.outlineCta}>
              See how we work <ArrowRight className="size-4" strokeWidth={2.6} />
            </a>
          </div>
          <ol className={s.steps}>
            {[
              [Search, "Identify a costly gap", "We look at how you win customers and how work gets done, then find the gap worth fixing first."],
              [Monitor, "Make the improvement visible", "You see what better could look like for your business before committing to anything."],
              [MessageSquare, "Agree scope and price", "We agree exactly what changes, what it costs and how we will know it worked."],
              [Rocket, "Deliver and review", "We build the agreed improvement, then review what changed together."],
            ].map(([Icon, title, copy], index) => {
              const RealIcon = Icon as typeof MessageSquare
              return (
                <li key={title as string} className={s.step}>
                  <span className={s.stepIcon}>
                    <RealIcon className="size-6" strokeWidth={2.4} />
                  </span>
                  <p className={s.stepNum}>Step {index + 1}</p>
                  <h3 className={s.stepTitle}>{title as string}</h3>
                  <p className={s.stepCopy}>{copy as string}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className={s.portfolio}>
        <div className={`${s.wrap} ${s.portfolioInner}`}>
          <div>
            <h2 className={s.sectionTitle}>
              Real businesses.
              <br />
              Real change.
            </h2>
            <span className={s.sectionUnderline} aria-hidden="true" />
            <p className={s.sectionBody}>
              Our factory started with websites. Explore launched sites and design previews for real businesses — and see the quality of the work for yourself.
            </p>
            <a href="/examples" className={s.outlineCta}>
              View all examples <ArrowRight className="size-4" strokeWidth={2.6} />
            </a>
          </div>
          <div className={s.caseGrid}>
            {portfolio.map((example) => (
              <article key={example.slug} className={s.caseCard}>
                <a href={`/examples/${example.slug}`} className={s.caseImg}>
                  <Image src={example.image} alt={`${example.business} website`} fill sizes="(min-width: 1024px) 400px, 100vw" />
                </a>
                <div className={s.caseBody}>
                  <div className={s.caseTags}>
                    <span className={s.caseTag}>{example.category}</span>
                    <span className={`${s.caseTag} ${s.caseTagMuted}`}>{example.location}</span>
                  </div>
                  <h3 className={s.caseName}>{example.business}</h3>
                  <a href={`/examples/${example.slug}`} className={s.caseLink}>
                    View case study <ArrowRight className="size-4" strokeWidth={2.6} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={s.pricing}>
        <span className={`${s.pricingCorner} ${s.pricingCornerA}`} aria-hidden="true" />
        <span className={`${s.pricingCorner} ${s.pricingCornerB}`} aria-hidden="true" />
        <div className={`${s.wrap} ${s.pricingInner}`}>
          <div>
            <p className={s.pricingEyebrow}>Your website</p>
            <h2 className={s.pricingTitle}>
              One clear place to start:
              <br />
              your website launch.
            </h2>
            <p className={s.pricingPrice}><MarketCopy>{"{total}"}</MarketCopy></p>
            <span className={s.pricingPriceUnderline} aria-hidden="true" />
            <p className={s.pricingTerms}>
              Fixed scope, fixed price. <MarketCopy>{"{deposit}"}</MarketCopy> deposit when you approve the direction. <MarketCopy>{"{balance}"}</MarketCopy> balance when the site is ready to launch.
            </p>
          </div>
          <div className={s.pricingIncludes}>
            <ul className={s.pricingList}>
              {["Strategy", "Design", "Copy", "Development", "Content management system (CMS)", "Analytics", "Ad creative setup", "Follow-up setup", "Launch"].map((item) => (
                <li key={item}>
                  <Check className="size-5" strokeWidth={3.2} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={s.pricingRight}>
            <div>
              <p className={s.pricingNoHidden}>
                No hidden costs.
                <br />
                No surprises.
              </p>
              <p className={s.pricingRightCopy}>
                Your complete website launch has one agreed scope and one fixed price. Ad spend, ongoing management and additional work are only charged if separately agreed.
              </p>
              <a href="/pricing#included" className={s.pricingLink}>
                What the price covers <ArrowUpRight className="size-4" strokeWidth={2.6} />
              </a>
            </div>
            <MockupButton variant="yellow" className={s.mockupCta} />
          </div>
        </div>
      </section>

      <section id="reviews" className={s.reviews}>
        <div className={`${s.wrap} ${s.reviewsInner}`}>
          <div>
            <h2 className={s.sectionTitle}>
              Trusted by
              <br />
              local businesses.
            </h2>
            <span className={s.sectionUnderline} aria-hidden="true" />
            <p className={s.sectionBody}>
              Verified Google reviews from the businesses we have worked with.
            </p>
          </div>
          <GoogleReviews data={googleReviews} variant="cards" />
        </div>
      </section>

      <section className={s.cta}>
        <div className={`${s.wrap} ${s.ctaInner}`}>
          <h2 className={s.ctaTitle}>
            Ready to make your business
            <br />
            more capable?
          </h2>
          <div className={s.ctaMid}>
            <p className={s.ctaCopy}>
              Tell us what is slowing you down.
              <br />
              We will help you find the first gap worth fixing.
            </p>
            <svg className={s.ctaArrow} width="52" height="40" viewBox="0 0 52 40" fill="none" aria-hidden="true">
              <path d="M4 8 C 18 20, 30 28, 44 28" stroke="#0b0b0b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M36 22 L46 28 L36 34" stroke="#0b0b0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={s.ctaAction}>
            <ImprovementButton variant="primary" />
          </div>
        </div>
      </section>

      <SitesFooter variant="compact" />
    </SitesPage>
  )
}
