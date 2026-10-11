import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { DarkCta, SitesFooter, SitesHeader, SitesPage, Underline } from "../../sites/_components/SitesPrimitives"
import { exampleCaseStudies, getExampleCaseStudy } from "../_caseStudies"
import { CaseStudyHeroPreview } from "./CaseStudyHeroPreview"
import { BeforeAfterVideo } from "../BeforeAfterVideo"

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return exampleCaseStudies.map((caseStudy) => ({ slug: caseStudy.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const caseStudy = getExampleCaseStudy(slug)

  if (!caseStudy) {
    return {
      title: "Example | Sorted",
    }
  }

  return {
    title: `${caseStudy.business} | Sorted Example`,
    description: caseStudy.description,
    alternates: {
      canonical: `/examples/${caseStudy.slug}`,
    },
  }
}

export default async function ExampleCaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const caseStudy = getExampleCaseStudy(slug)

  if (!caseStudy) notFound()

  return (
    <SitesPage>
      <SitesHeader active="examples" />

      <section className="mx-auto grid max-w-[1220px] gap-8 px-5 pb-10 pt-10 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:pb-12 lg:pt-12">
        <div>
          <a href="/examples" className="mb-9 inline-flex min-h-11 items-center gap-3 rounded-full bg-black/5 px-4 text-[13px] font-bold text-black/60 sm:mb-14 sm:bg-transparent sm:px-0">
            <ArrowLeft className="size-4" /> Back to all examples
          </a>
          <p className="mb-5 text-[12px] font-black uppercase text-black/45">{caseStudy.category}</p>
          <h1 className="max-w-[560px] text-[clamp(2.7rem,5.8vw,6rem)] font-black leading-[0.9] tracking-[-0.055em]">{caseStudy.business}</h1>
          <p className="mt-4 [font-family:var(--font-sites-fave-script)] text-[clamp(3.4rem,5.2vw,5.6rem)] leading-[0.8] tracking-[0] text-[#d4ea00]">{caseStudy.title}</p>
          <Underline className="mt-3 w-[240px]" />
          <p className="mt-7 max-w-[440px] text-[17px] font-semibold leading-[1.5] tracking-[-0.03em]">{caseStudy.description}</p>
        </div>

        <CaseStudyHeroPreview business={caseStudy.business} screenshots={caseStudy.screenshots} liveUrl={caseStudy.liveUrl} />
      </section>

      <section className="border-y border-black/10 bg-white px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-[1220px] gap-8 lg:grid-cols-[0.32fr_0.68fr] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/45">Example walkthrough</p>
            <h2 className="mt-4 max-w-[300px] text-[clamp(2.4rem,4vw,4.2rem)] font-black leading-[0.92] tracking-[-0.055em]">See how we show the work.</h2>
            <p className="mt-5 max-w-[310px] text-[15px] font-semibold leading-[1.5] text-black/64">This School of Skill walkthrough shows how we present a website for review. The project screenshots above show {caseStudy.business}.</p>
          </div>
          <BeforeAfterVideo />
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-10 border-t border-black/10 px-5 py-12 sm:px-8 lg:grid-cols-[0.35fr_0.65fr]">
        <div>
          {[
            [caseStudy.business, `${caseStudy.category} business in ${caseStudy.location}`],
            ["Their goal", caseStudy.goal],
            ["Our solution", caseStudy.solution],
          ].map(([title, copy], index) => (
            <article key={title} className="mb-8 grid grid-cols-[54px_1fr] gap-5">
              <span className="grid size-11 place-items-center rounded-full bg-[#070707] text-white">{index + 1}</span>
              <div>
                <h2 className="text-[16px] font-black tracking-[-0.04em]">{title}</h2>
                <p className="mt-2 text-[13px] font-semibold leading-[1.45] text-black/65">{copy}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="rounded-[20px] bg-[#f7f1e8] p-6 sm:p-10">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-black/45">What changed</p>
          <p className="mt-4 max-w-[720px] text-[22px] font-black leading-[1.15] tracking-[-0.035em] sm:text-[26px]">
            {caseStudy.title}
          </p>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2">
            {[
              "A clearer first impression that matches the quality of the work.",
              "Stronger structure so services and proof are easier to find.",
              "A simpler route to enquire, book or get in touch.",
              "A responsive design that holds up on every device.",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-[13px] font-semibold leading-[1.5] text-black/68">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-[#789100]" strokeWidth={2.8} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-10 sm:px-8">
        <a href="/examples" className="inline-flex min-h-12 items-center gap-3 rounded-full border border-black/12 px-6 text-[13px] font-black transition-colors hover:bg-black hover:text-white">
          View more examples <ArrowRight className="size-4" strokeWidth={2.6} />
        </a>
      </section>

      <DarkCta title="See what we can build for your business." />
      <SitesFooter />
    </SitesPage>
  )
}
