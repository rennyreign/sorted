import type { ReactNode } from "react"
import { ArrowLeft, Check } from "lucide-react"
import { SitesFooter, SitesHeader, SitesPage, Underline } from "../sites/_components/SitesPrimitives"

export type LegalSection = {
  title: string
  body: ReactNode
  points?: string[]
}

export function LegalDocument({
  eyebrow,
  title,
  intro,
  updated,
  sections,
}: {
  eyebrow: string
  title: string
  intro: string
  updated: string
  sections: LegalSection[]
}) {
  return (
    <SitesPage>
      <SitesHeader />

      <section className="mx-auto max-w-[1220px] px-5 pb-14 pt-12 sm:px-8 sm:pt-16 lg:pb-18">
        <a href="/" className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.12em] text-black/55 transition-colors hover:text-black">
          <ArrowLeft className="size-4" strokeWidth={2.8} />
          Back to Sorted
        </a>
        <p className="mt-8 text-[12px] font-black uppercase tracking-[0.16em] text-black/45">{eyebrow}</p>
        <h1 className="mt-5 max-w-[820px] text-[clamp(3rem,6.5vw,6.2rem)] font-black leading-[0.92] tracking-[-0.05em]">
          {title}
        </h1>
        <Underline className="mt-6 w-52" />
        <p className="mt-7 max-w-[720px] text-[17px] font-semibold leading-[1.6] tracking-[-0.02em] text-black/72">{intro}</p>
        <p className="mt-4 text-[12px] font-black uppercase tracking-[0.12em] text-black/45">Last updated: {updated}</p>
      </section>

      <section className="border-t border-black/10 bg-white px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-[980px] gap-5">
          {sections.map((section, index) => (
            <article key={section.title} className="rounded-[18px] border border-black/10 bg-[#fbfbfa] p-6 sm:p-8">
              <div className="flex items-start gap-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#dfff00] text-[11px] font-black tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h2 className="text-[22px] font-black leading-[1.08] tracking-[-0.035em]">{section.title}</h2>
                  <div className="mt-4 text-[14px] font-semibold leading-[1.65] text-black/65">{section.body}</div>
                  {section.points?.length ? (
                    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                      {section.points.map((point) => (
                        <li key={point} className="flex gap-3 text-[13px] font-bold leading-[1.5] text-black/68">
                          <Check className="mt-0.5 size-4 shrink-0 text-[#789100]" strokeWidth={3} />
                          {point}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SitesFooter />
    </SitesPage>
  )
}
