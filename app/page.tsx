import { MarketCopy } from "@/components/MarketPricing"
import type { Metadata } from "next"
import Image from "next/image"
import { ArrowRight, ArrowUpRight, Check, Edit3, Eye, MessageSquare, Monitor, CircleDollarSign, Rocket } from "lucide-react"
import { SitesFooter, SitesHeader, SitesPage } from "./sites/_components/SitesPrimitives"
import { MockupButton } from "./sites/_components/SitesMockupModal"
import { GoogleReviews } from "./sites/_components/GoogleReviews"
import { exampleCaseStudies } from "./examples/_caseStudies"
import { getGoogleReviews } from "@/lib/googleReviews"
import s from "./home.module.css"

export const metadata: Metadata = {
  title: "Sorted | Websites for local businesses that look as good as the work",
  description:
    "Your competitors aren't better. They just look better. See a free mockup of your new website before you pay anything — one complete website, one fixed price: £3,000 in the UK or $3,500 in the US.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Sorted | Websites for local businesses",
    description:
      "See a free mockup of your new website before you spend a penny. One complete website. One fixed price.",
    url: "/",
  },
}

const portfolioSlugs = ["school-of-skill", "warwickshire-short-stays", "bodysharp-fitness"]

export default async function SortedSitesHome() {
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
            alt="Illustrative electrical services homepage on a laptop in a trades workshop"
            fill
            priority
            sizes="(min-width: 1024px) 100vw, 100vw"
          />
          <div className={s.heroShade} aria-hidden="true" />
        </div>
        <div className={s.wrap}>
          <div className={s.heroInner}>
            <div className={s.heroCopy}>
              <h1 className={s.heroTitle}>
                Your competitors
                <br />
                aren&apos;t better.
                <br />
                They just{" "}
                <span className={s.heroScript}>
                  look better.
                  <span className={s.heroScriptUnderline} aria-hidden="true" />
                </span>
              </h1>
              <p className={s.heroBody}>
                And that&apos;s a problem. Because customers judge what they see before they experience what you do.
              </p>
              <div className={s.heroCtaRow}>
                <MockupButton variant="yellow" className={s.mockupCta} />
                <span className={s.ctaNote}>
                  No payment.
                  <i aria-hidden="true" />
                  No obligation.
                </span>
              </div>
            </div>

            <div className={s.annotation} aria-hidden="true">
              <span className={s.annotationText}>
                Same trade.
                <br />
                Different website.
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

      <section className={s.proof} aria-label="What you get with Sorted">
        <div className={s.wrap}>
          <div className={s.proofGrid}>
            {[
              [Eye, "Preview first", "See the design before you pay."],
              [CircleDollarSign, "Fixed price", "One complete website. {total}."],
              [Check, "Your decision", "No payment. No obligation."],
              [Edit3, "Content control", "Edit your words and images."],
            ].map(([Icon, title, copy]) => {
              const RealIcon = Icon as typeof Eye
              return (
                <article key={title as string} className={s.proofItem}>
                  <span className={s.proofIcon}>
                    <RealIcon className="size-6" strokeWidth={2.4} />
                  </span>
                  <div>
                    <h2 className={s.proofTitle}>{title as string}</h2>
                    <p className={s.proofDetail}><MarketCopy>{copy as string}</MarketCopy></p>
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
              <h2 className={s.growthTitle}>A great website isn&apos;t a luxury.</h2>
              <span className={s.growthScript}>It&apos;s a growth engine.</span>
              <span className={s.growthUnderline} aria-hidden="true" />
              <p className={s.growthBody}>
                Your website should work as hard as you do — showcasing your expertise and making it easier to enquire and become a customer.
              </p>
              <a href="/howitworks" className={s.growthCta}>
                See how it works <ArrowRight className="size-4" strokeWidth={2.8} />
              </a>
            </div>
            <ul className={s.benefitList}>
              {[
                ["Look good.", "Make the quality of your work visible the moment someone lands on your site."],
                ["Get enquiries.", "Clear routes to call, message and book — no hunting for a way to contact you."],
                ["Turn them into customers.", "Remove the friction between interest and a decision."],
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
            <h2 className={s.sectionTitle}>Our simple process.</h2>
            <span className={s.sectionUnderline} aria-hidden="true" />
            <p className={s.sectionBody}>
              No jargon. No drawn-out process. Just a better website, built around your business.
            </p>
            <a href="/howitworks" className={s.outlineCta}>
              See the full process <ArrowRight className="size-4" strokeWidth={2.6} />
            </a>
          </div>
          <ol className={s.steps}>
            {[
              [MessageSquare, "Tell us about you", "Answer a few quick questions about your business and what the website needs to do."],
              [Monitor, "See a free preview", "We design a tailored homepage direction for your business. You review it before paying anything."],
              [Check, "Approve the direction", "Happy with what you see? A {deposit} deposit starts the build after approval."],
              [Rocket, "We build & launch", "We finish the site and connect everything. {balance} balance when ready to launch."],
            ].map(([Icon, title, copy], index) => {
              const RealIcon = Icon as typeof MessageSquare
              return (
                <li key={title as string} className={s.step}>
                  <span className={s.stepIcon}>
                    <RealIcon className="size-6" strokeWidth={2.4} />
                  </span>
                  <p className={s.stepNum}>Step {index + 1}</p>
                  <h3 className={s.stepTitle}>{title as string}</h3>
                  <p className={s.stepCopy}><MarketCopy>{copy as string}</MarketCopy></p>
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
              Better websites.
            </h2>
            <span className={s.sectionUnderline} aria-hidden="true" />
            <p className={s.sectionBody}>
              Some are live sites. Some are design previews. Look at the work, then decide what your business needs.
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
            <p className={s.pricingEyebrow}>Pricing</p>
            <h2 className={s.pricingTitle}>
              One complete launch setup.
              <br />
              One fixed price.
            </h2>
            <p className={s.pricingPrice}><MarketCopy>{"{total}"}</MarketCopy></p>
            <span className={s.pricingPriceUnderline} aria-hidden="true" />
            <p className={s.pricingTerms}>
              <MarketCopy>{"{deposit}"}</MarketCopy> deposit when you approve the direction. <MarketCopy>{"{balance}"}</MarketCopy> balance when the site is ready to launch.
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
                The same launch setup at the same fixed price, for every business. Ad spend and ongoing management stay optional.
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
            Ready to give your website
            <br />
            the upgrade it deserves?
          </h2>
          <div className={s.ctaMid}>
            <p className={s.ctaCopy}>
              See your new design before you pay.
              <br />
              No obligation. No payment.
            </p>
            <svg className={s.ctaArrow} width="52" height="40" viewBox="0 0 52 40" fill="none" aria-hidden="true">
              <path d="M4 8 C 18 20, 30 28, 44 28" stroke="#0b0b0b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M36 22 L46 28 L36 34" stroke="#0b0b0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={s.ctaAction}>
            <MockupButton variant="primary" />
          </div>
        </div>
      </section>

      <SitesFooter variant="compact" />
    </SitesPage>
  )
}
