import type { Metadata } from "next"
import { ArrowRight, Check, Edit3, Eye, Rocket } from "lucide-react"
import Image from "next/image"
import { MockupButton } from "../sites/_components/SitesMockupModal"
import { ImprovementButton } from "../sites/_components/ImprovementEntry"
import { SitesFooter, SitesHeader, SitesPage, Underline } from "../sites/_components/SitesPrimitives"
import { ExamplesGallery } from "./ExamplesGallery"
import { ExamplesCaseStudyRail } from "./ExamplesCaseStudyRail"
import { fetchExamples } from "./data"

// Note: with NEXT_BUILD_STATIC=true the page is fully static. This revalidate
// value is respected by the dev/Node server, but for production the site must
// be rebuilt daily (e.g. via a scheduled GitHub Actions run) to refresh data.
export const revalidate = 86400

export const metadata: Metadata = {
  title: "Our work | Sorted",
  description: "Website case studies and delivery work — what Sorted has built, launched and explored for real businesses.",
  alternates: {
    canonical: "/examples",
  },
  openGraph: {
    title: "Our work | Sorted",
    description: "Real work. Built by the factory. Website case studies and delivery work for real businesses.",
    url: "/examples",
  },
}

const processSteps = [
  [Edit3, "We build your first page", "A free, custom first-page build made for your business."],
  [Eye, "You review it", "See exactly what you are getting."],
  [Check, "You approve", "Love it? One fixed price completes it."],
  [Rocket, "We build & launch", "We build your website and get you live."],
] as const

export default async function ExamplesPage() {
  const { mockups, metrics: exampleMetrics } = await fetchExamples()

  return (
    <SitesPage>
      <SitesHeader active="examples" />

      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-8 pt-11 sm:px-8 sm:pb-12 sm:pt-14 lg:grid-cols-[0.42fr_0.58fr] lg:items-center">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-black/45">The work speaks</p>
          <h1 className="mt-5 max-w-[610px] text-[clamp(3.2rem,6vw,5.6rem)] font-black leading-[0.9] tracking-[-0.055em]">
            We don&apos;t sell.
            <br />
            We show.
          </h1>
          <div className="mt-3 max-w-[430px] [font-family:var(--font-sites-fave-script)] text-[clamp(3.4rem,5.6vw,5.4rem)] font-normal leading-[0.78] tracking-[0] text-[#cfea00]">
            Built first.
            <br />
            Priced second.
          </div>
          <Underline className="mt-4 w-full max-w-[300px]" />
          <p className="mt-6 max-w-[420px] text-[16px] font-semibold leading-[1.5] tracking-[-0.025em] text-black/75">
            Our factory started with websites. Here&apos;s what we&apos;ve built, launched and explored for real businesses. Every project helps us improve the systems behind the work.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <ImprovementButton />
            <a href="#live-websites" className="inline-flex min-h-11 items-center gap-2 text-[13px] font-black transition-colors hover:text-black/55">
              Explore the work <ArrowRight className="size-4 rotate-90" strokeWidth={2.8} />
            </a>
          </div>
        </div>

        <FeaturedCaseStudy />
      </section>

      <section id="live-websites" className="mx-auto max-w-[1220px] scroll-mt-28 border-t border-black/10 px-5 py-7 sm:px-8">
        <ExamplesCaseStudyRail />
      </section>

      <ExamplesGallery mockups={mockups} totalCount={exampleMetrics.total} />

      <section className="bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-[1220px] gap-8 lg:grid-cols-[0.28fr_0.72fr] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-black/45">Website launch</p>
            <h2 className="mt-2 text-[34px] font-black leading-[0.95] tracking-[-0.05em]">How every website starts</h2>
            <p className="mt-4 max-w-[260px] text-[15px] font-semibold leading-[1.45] text-black/65">
              Simple, fast and built around your business.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map(([Icon, title, copy], index) => (
              <article key={title} className="relative min-h-[172px] rounded-[10px] border border-black/10 bg-white p-5 shadow-[0_14px_38px_rgba(0,0,0,0.04)]">
                <span className="grid size-8 place-items-center rounded-full bg-black text-[12px] font-black text-white">{index + 1}</span>
                <Icon className="mt-5 size-6" strokeWidth={2.1} />
                <h3 className="mt-5 text-[14px] font-black tracking-[-0.02em]">{title}</h3>
                <p className="mt-2 text-[12px] font-semibold leading-[1.45] text-black/60">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 pt-4 text-black sm:px-8">
        <div className="mx-auto grid max-w-[1060px] gap-5 rounded-[12px] bg-[#dfff00] px-5 py-5 shadow-[0_18px_44px_rgba(0,0,0,0.16)] sm:px-7 lg:grid-cols-[0.32fr_0.34fr_0.12fr_0.22fr] lg:items-center">
          <div className="grid grid-cols-[48px_1fr] items-center gap-4">
            <span className="grid size-12 place-items-center rounded-full bg-black/10">
              <Edit3 className="size-7" strokeWidth={2.2} />
            </span>
            <h2 className="text-[22px] font-black leading-[1.02] tracking-[-0.04em]">See what we can build for your business</h2>
          </div>
          <p className="text-[13px] font-black leading-[1.35]">
            We build your first page free. Decide whether to take it further.
            <span className="block font-semibold">No payment. No obligation.</span>
          </p>
          <ArrowRight className="hidden size-14 lg:block" strokeWidth={2} />
          <MockupButton variant="primary" className="justify-self-start whitespace-nowrap bg-black text-white lg:justify-self-end" />
        </div>
      </section>

      <SitesFooter />
    </SitesPage>
  )
}

function FeaturedCaseStudy() {
  return (
    <figure className="rounded-[22px] bg-[#f5f3ee] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.08)] sm:p-4">
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[14px]">
        <Image
          src="/examples/school-of-skill-hero.webp"
          alt="The School of Skill website shown across desktop and mobile screens."
          fill
          priority
          sizes="(min-width: 1024px) 660px, 100vw"
          className="object-cover"
        />
      </div>
      <figcaption className="mt-3 rounded-[14px] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-black/45">Featured case study</p>
            <h2 className="mt-1.5 text-[22px] font-black leading-none tracking-[-0.04em]">School of Skill</h2>
            <p className="mt-2 text-[12px] font-semibold text-black/55">Basketball · Birmingham</p>
          </div>
          <a href="/examples/school-of-skill" className="group inline-flex min-h-11 items-center gap-2 text-[12px] font-black transition-colors hover:text-black/55">
            View case study <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.8} />
          </a>
        </div>
        <p className="mt-3 border-t border-black/10 pt-3 text-[13px] font-semibold leading-[1.5] text-black/60">
          Bringing the programmes, people and pathways into one clear website.
        </p>
      </figcaption>
    </figure>
  )
}
