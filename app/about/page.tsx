import type { Metadata } from "next"
import Image from "next/image"
import { ArrowRight, Eye, Handshake, Network, Rocket, ThumbsUp } from "lucide-react"
import { SitesFooter, SitesHeader, SitesPage, Underline } from "../sites/_components/SitesPrimitives"
import { MockupButton } from "../sites/_components/SitesMockupModal"

export const metadata: Metadata = {
  title: "Why Sorted Exists | Stronger local businesses, stronger economy",
  description: "Sorted makes modern business infrastructure accessible so small and independent businesses can compete, grow and contribute to a stronger economy.",
  alternates: {
    canonical: "/about",
  },
}

const economicGrowthSteps = [
  ["01", "Make real quality visible", "A clear, credible digital presence helps customers recognise the substance that already exists."],
  ["02", "Make good businesses easier to choose", "Better information, simpler enquiries and modern convenience let quality compete without compromise."],
  ["03", "Build stronger revenue", "When more of the right customers can find and choose a business, that business has more room to grow."],
  ["04", "Create jobs and careers", "Revenue-strong businesses can employ more people and create viable careers closer to where they live."],
  ["05", "Strengthen local economies", "Money, knowledge, capability and relationships can circulate through the places where businesses operate."],
  ["06", "Compound across the country", "Repeated across towns, cities and regions, stronger businesses contribute to a stronger economy overall."],
]

export default function AboutPage() {
  return (
    <SitesPage>
      <SitesHeader active="about" />

      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-14 pt-12 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:pb-20 lg:pt-16">
        <div>
          <h1 className="text-[clamp(3.35rem,6vw,6.4rem)] font-black leading-[0.94] tracking-[-0.045em]">
            Stronger local<br />
            businesses build<br />
            a stronger<br />
            <span className="inline-block [font-family:var(--font-sites-highlight)] font-normal leading-[0.88] tracking-[-0.02em] text-[#d4ea00]">economy</span>
          </h1>
          <Underline className="mt-5 w-[min(320px,75vw)]" />
          <p className="mt-7 max-w-[540px] text-[17px] font-semibold leading-[1.55] tracking-[-0.03em] text-black/78">
            We believe economic growth is built through more capable businesses in more places. Sorted&apos;s contribution is to make modern business infrastructure accessible to small and independent businesses, starting where customers usually experience the gap first: the website.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <MockupButton />
            <a href="/partners/enterprise" className="inline-flex min-h-11 items-center gap-2 px-1 text-[12px] font-black transition-colors hover:text-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-4">
              Partner with Sorted <ArrowRight className="size-4" strokeWidth={2.8} />
            </a>
          </div>
        </div>

        <div className="relative min-h-[390px] overflow-hidden rounded-[20px] bg-[#f7f1e8] shadow-[0_24px_70px_rgba(0,0,0,0.1)] sm:min-h-[500px] sm:rounded-[24px]">
          <Image
            src="/sorted-sites/aboutHero.png"
            alt="An independent local business owner working in her shop"
            fill
            priority
            sizes="(min-width: 1024px) 650px, 100vw"
            className="object-cover object-[62%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          <blockquote className="absolute bottom-5 left-5 right-5 max-w-[470px] rounded-[14px] bg-[#070707]/95 p-5 text-white shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:bottom-7 sm:left-7 sm:p-6">
            <p className="text-[clamp(1.45rem,3vw,2.15rem)] font-black leading-[1.02] tracking-[-0.045em]">We don&apos;t see local business as a niche. We see it as the foundation.</p>
          </blockquote>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-[1220px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.35fr_0.65fr] lg:gap-20 lg:py-20">
          <div>
            <h2 className="max-w-[380px] text-[clamp(2.5rem,4.6vw,4.7rem)] font-black leading-[0.94] tracking-[-0.05em]">A good business shouldn&apos;t need the benefit of the doubt.</h2>
            <Underline className="mt-6 w-40" />
          </div>

          <div>
            <div className="max-w-[680px] space-y-5 text-[16px] font-semibold leading-[1.65] text-black/72">
              <p>A local business can have brilliant people, years of expertise and customers who genuinely value what it does, then lose the next customer because its website is unclear, booking is awkward or nobody follows up.</p>
              <p>Independent businesses no longer compete only with the business down the road. Customers compare every experience with national and global companies that have invested heavily in making trust, communication and convenience feel effortless.</p>
              <p>Buying local shouldn&apos;t require lowering your expectations. The local business should be equipped to compete on its actual quality.</p>
            </div>

            <div className="mt-10 border-t border-black">
              <div className="grid gap-3 border-b border-black/15 py-6 sm:grid-cols-[0.34fr_0.66fr] sm:gap-8">
                <h3 className="text-[13px] font-black uppercase tracking-[0.08em] text-black/45">The business in real life</h3>
                <p className="text-[20px] font-black leading-[1.2] tracking-[-0.035em]">Skilled people. Strong reputation. Proven work. Customers who come back.</p>
              </div>
              <div className="grid gap-3 border-b border-black/15 py-6 sm:grid-cols-[0.34fr_0.66fr] sm:gap-8">
                <h3 className="text-[13px] font-black uppercase tracking-[0.08em] text-black/45">The business online</h3>
                <p className="text-[20px] font-black leading-[1.2] tracking-[-0.035em]">Hard to understand. Hard to trust. Hard to contact. Too easy to overlook.</p>
              </div>
            </div>

            <p className="mt-7 inline-block bg-[#dfff00] px-4 py-3 text-[17px] font-black leading-[1.3] tracking-[-0.025em]">That is not a lack of substance. It is a capability gap.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.4fr_0.6fr] lg:gap-20 lg:py-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-4 text-[11px] font-black uppercase tracking-[0.14em] text-black/45">Our mission</p>
          <h2 className="max-w-[440px] text-[clamp(2.7rem,5vw,5.2rem)] font-black leading-[0.93] tracking-[-0.055em]">Build businesses. Strengthen places. Grow the economy.</h2>
          <Underline className="mt-6 w-48" />
          <p className="mt-7 max-w-[440px] text-[15px] font-semibold leading-[1.65] text-black/68">Local is where economic contribution becomes tangible, not where the ambition ends. More capable businesses create value in the places around them. Repeated across towns, cities and regions, that value contributes to the strength of the economy as a whole.</p>
        </div>

        <ol className="border-t border-black">
          {economicGrowthSteps.map(([number, title, copy]) => (
            <li key={number} className="grid grid-cols-[44px_1fr] gap-4 border-b border-black/15 py-6 sm:grid-cols-[58px_0.8fr_1.2fr] sm:gap-6 sm:py-7">
              <span className="text-[11px] font-black tabular-nums text-black/45">{number}</span>
              <h3 className="text-[20px] font-black leading-[1.1] tracking-[-0.04em]">{title}</h3>
              <p className="col-start-2 text-[14px] font-semibold leading-[1.55] text-black/64 sm:col-start-auto">{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-[#f7f1e8]">
        <div className="mx-auto max-w-[1220px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.42fr_0.58fr] lg:gap-20">
            <div>
              <h2 className="max-w-[470px] text-[clamp(2.7rem,5vw,5.3rem)] font-black leading-[0.93] tracking-[-0.055em]">The website is the front door. It isn&apos;t the mission.</h2>
              <Underline className="mt-6 w-48" />
            </div>

            <div>
              <p className="max-w-[660px] text-[clamp(1.45rem,2.8vw,2.35rem)] font-black leading-[1.15] tracking-[-0.045em]">Modern business capability should not be reserved for companies with large budgets.</p>
              <div className="mt-9 border-t border-black">
                <article className="grid gap-4 border-b border-black/15 py-7 sm:grid-cols-[52px_1fr] sm:gap-6">
                  <span className="grid size-11 place-items-center bg-[#070707] text-[12px] font-black text-white">01</span>
                  <div>
                    <h3 className="text-[21px] font-black tracking-[-0.04em]">Start where customers experience the gap.</h3>
                    <p className="mt-3 max-w-[600px] text-[14px] font-semibold leading-[1.6] text-black/66">A better website makes the business easier to understand, trust and choose. It is visible, commercially meaningful and immediately useful.</p>
                  </div>
                </article>
                <article className="grid gap-4 border-b border-black/15 py-7 sm:grid-cols-[52px_1fr] sm:gap-6">
                  <span className="grid size-11 place-items-center bg-[#dfff00] text-[12px] font-black">02</span>
                  <div>
                    <h3 className="text-[21px] font-black tracking-[-0.04em]">Improve what happens behind the front door.</h3>
                    <p className="mt-3 max-w-[600px] text-[14px] font-semibold leading-[1.6] text-black/66">Enquiries, follow-up, booking, customer data, reviews, reporting and repetitive work all shape the experience. We address the next costly gap only when it has earned its place.</p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.28fr_0.72fr] lg:py-24">
        <div>
          <h2 className="text-[2.45rem] font-black leading-[0.98] tracking-[-0.05em] lg:text-[2.55rem]">We don&apos;t sell.<br />We show.</h2>
          <Underline className="mt-6 w-48" />
          <p className="mt-7 max-w-[300px] text-[14px] font-semibold leading-[1.6] text-black/65">Progressive proof makes modernisation less risky. You see useful work before we ask you to believe a promise.</p>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-4 md:gap-7">
          {[
            [Eye, "We build a mockup", "A considered website direction built around the real business."],
            [Eye, "You review it", "See the quality, question the thinking and decide in your own time."],
            [ThumbsUp, "You approve", "Commit only when the work has earned your confidence."],
            [Rocket, "We build and launch", "We finish the site, connect what matters and put it to work."],
          ].map(([Icon, title, copy], index) => {
            const RealIcon = Icon as typeof Eye
            return (
              <article key={title as string} className="border-black/12 md:border-l md:pl-7 first:md:border-l-0 first:md:pl-0">
                <span className="text-[11px] font-black tabular-nums text-black/40">0{index + 1}</span>
                <RealIcon className="mt-5 size-10" strokeWidth={1.8} />
                <h3 className="mt-5 text-[16px] font-black leading-[1.15] tracking-[-0.035em]">{title as string}</h3>
                <p className="mt-3 text-[12px] font-semibold leading-[1.5] text-black/62">{copy as string}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 pb-10 sm:px-8 lg:pb-16">
        <div className="relative overflow-hidden rounded-[20px] bg-[#dfff00] p-7 sm:p-10 lg:p-14">
          <Network className="absolute -bottom-12 -right-10 size-64 text-black/10" strokeWidth={1.2} aria-hidden="true" />
          <div className="relative grid gap-9 lg:grid-cols-[0.58fr_0.42fr] lg:items-end">
            <div>
              <h2 className="max-w-[690px] text-[clamp(2.35rem,4vw,4.2rem)] font-black leading-[0.93] tracking-[-0.055em]">Close the gap for one business or a whole network.</h2>
            </div>
            <div>
              <p className="max-w-[500px] text-[15px] font-semibold leading-[1.65] text-black/72">Accountants, consultants, agencies, incubators, associations and business networks already hold trusted relationships with the businesses we exist to help. Sorted adds the manufacturing capacity to turn an identified need into visible, useful work, allowing one partnership to strengthen capability across a whole network.</p>
              <a href="/partners/enterprise" data-track="cta_click" data-cta-text="Explore enterprise partnerships" data-cta-location="about_partner_section" className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#070707] px-6 text-[12px] font-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-[#dfff00]">
                Explore enterprise partnerships <ArrowRight className="size-4" strokeWidth={2.8} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-10 sm:px-8 lg:py-16">
        <div className="grid gap-8 rounded-[18px] bg-[#f7f1e8] p-6 sm:p-8 lg:grid-cols-[0.28fr_0.34fr_0.38fr] lg:items-center lg:p-10">
          <div className="relative mx-auto size-44 overflow-hidden rounded-full bg-white sm:size-52">
            <Image src="/renaldo-bw.png" alt="Renaldo Edmondson, founder of Sorted" fill sizes="220px" className="object-cover" />
          </div>
          <div>
            <h2 className="text-[32px] font-black leading-[1] tracking-[-0.045em] sm:text-[38px]">A factory for increasing business capability.</h2>
            <Underline className="mt-5 w-48" />
            <p className="mt-6 text-[14px] font-semibold leading-[1.6] text-black/66">Sorted was founded by operators who love websites, systems and doing things properly. Our factory model turns that knowledge into faster, more affordable infrastructure without lowering the standard.</p>
          </div>
          <blockquote className="border-t border-black/15 pt-7 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
            <p className="[font-family:var(--font-sites-marker)] text-[2.15rem] leading-[1.05] sm:text-[2.7rem]">“Buying local shouldn&apos;t require lowering your expectations.”</p>
            <p className="mt-6 text-[12px] font-black">Renaldo Edmondson</p>
            <p className="text-[12px] font-semibold text-black/55">Founder, Sorted.</p>
          </blockquote>
        </div>
      </section>

      <section className="bg-[#070707] px-5 pt-10 text-white sm:px-8 lg:pt-14">
        <div className="mx-auto grid max-w-[1220px] gap-7 rounded-[16px] bg-white p-6 text-black shadow-[0_18px_44px_rgba(0,0,0,0.22)] sm:p-8 lg:grid-cols-[0.48fr_0.52fr] lg:items-center">
          <div>
            <h2 className="text-[clamp(2rem,3.8vw,3.8rem)] font-black leading-[0.96] tracking-[-0.05em]">Strengthen a business.<br />Or help us reach many.</h2>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <p className="max-w-[520px] text-[14px] font-semibold leading-[1.55] text-black/66 lg:text-right">If you run a business, see what better could look like. If you support businesses, explore what we could build through one trusted partnership.</p>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <MockupButton variant="primary" />
              <a href="/partners/enterprise" className="inline-flex min-h-11 items-center gap-2 px-3 text-[12px] font-black transition-colors hover:text-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-2">
                Explore partnerships <Handshake className="size-4" strokeWidth={2.5} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <SitesFooter />
    </SitesPage>
  )
}
