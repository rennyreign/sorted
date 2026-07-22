import type { Metadata } from "next"
import { ArrowLeft, CalendarDays, Star, TrendingUp, UserPlus } from "lucide-react"
import { DarkCta, SitesFooter, SitesHeader, SitesPage, Underline } from "../../_components/SitesPrimitives"
import { ExampleHeroPreview } from "./ExampleHeroPreview"

export const metadata: Metadata = {
  title: "The Yard Training Club | Sorted Sites Example",
  description: "A Sorted Sites example for a personal training studio, including testimonial, reviews and measured results.",
}

export default function TheYardExamplePage() {
  return (
    <SitesPage>
      <SitesHeader active="examples" />
      <section className="mx-auto grid max-w-[1220px] gap-8 px-5 pb-10 pt-10 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:pb-12 lg:pt-12">
        <div>
          <a href="/sites/examples" className="mb-9 inline-flex min-h-11 items-center gap-3 rounded-full bg-black/5 px-4 text-[13px] font-bold text-black/60 sm:mb-14 sm:bg-transparent sm:px-0">
            <ArrowLeft className="size-4" /> Back to all examples
          </a>
          <p className="mb-5 text-[12px] font-black uppercase text-black/45">Health & Fitness</p>
          <h1 className="max-w-[520px] text-[clamp(3.8rem,6vw,6.2rem)] font-black leading-[0.9] tracking-[-0.045em]">The Yard<br />Training Club</h1>
          <p className="mt-3 [font-family:var(--font-sites-highlight)] text-[clamp(3.1rem,5vw,5.6rem)] leading-[0.88] tracking-[-0.02em] text-[#d4ea00]">Built first. Priced second.</p>
          <Underline className="mt-2 w-[220px]" />
          <p className="mt-7 max-w-[430px] text-[17px] font-semibold leading-[1.5] tracking-[-0.03em]">
            A private personal training studio in Manchester looking for a website that matched the quality of their coaching.
          </p>
          <p className="mt-9 inline-flex items-center gap-3 text-[13px] font-bold">
            <span className="grid size-7 place-items-center rounded-full bg-[#dfff00]">✓</span>
            Delivered in 24 hours
          </p>
        </div>
        <div>
          <ExampleHeroPreview />
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-10 border-t border-black/10 px-5 py-12 sm:px-8 lg:grid-cols-[0.35fr_0.65fr]">
        <div>
          <p className="mb-8 text-[12px] font-black uppercase text-black/45">About the client</p>
          {[
            ["The Yard Training Club", "Private personal training studio in Manchester, UK"],
            ["Their goal", "Get more enquiries and new members with a professional online presence that builds trust."],
            ["Our solution", "A high-impact, modern website built to showcase their space, coaching and results."],
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
        <blockquote className="rounded-[20px] bg-[#f7f1e8] p-6 sm:p-10">
          <p className="mb-6 text-[12px] font-black uppercase tracking-[0.08em] text-black/55">Client testimonial</p>
          <p className="max-w-[720px] text-[28px] font-black leading-[1.05] tracking-[-0.035em] sm:text-[34px]">
            “The whole process was ridiculously simple. The mockup blew me away. It felt like you actually got our brand.”
          </p>
          <p className="mt-8 max-w-[620px] text-[16px] font-semibold leading-[1.5] text-black/72">
            We had it live within days and the difference in enquiries has been unreal. Best decision we made.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-full bg-[#070707] text-[18px] font-black text-white">JC</span>
            <p className="text-[13px] font-semibold"><strong className="block text-[15px] text-black">James Carter</strong>Owner & Head Coach<br />The Yard Training Club</p>
          </div>
        </blockquote>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-8 border-t border-black/10 px-5 py-12 sm:px-8 lg:grid-cols-[0.25fr_0.75fr]">
        <div>
          <p className="mb-5 text-[12px] font-black uppercase text-black/45">Google review</p>
          <p className="text-[72px] font-black tracking-[-0.07em]">4.9</p>
          <p className="text-[#ffd400]">★★★★★</p>
          <p className="mt-3 text-[15px] font-semibold">Based on 28 reviews</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {["Incredible service from start to finish. The mockup was spot on.", "Super fast, super easy and the end result is better than we imagined.", "Professional, friendly and they just get it. Our new website has taken us to another level."].map((quote, index) => (
            <article key={quote} className="rounded-[16px] border border-black/10 bg-white p-6">
              <p className="text-[#ffd400]">★★★★★</p>
              <p className="mt-4 text-[13px] font-semibold leading-[1.5] text-black/70">{quote}</p>
              <p className="mt-6 text-[12px] font-black">{["Liam Harrison", "Sophie Reynolds", "Marcus T."][index]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
          <div className="grid grid-cols-2 gap-5 rounded-[18px] bg-[#f7f1e8] p-5 sm:p-8 md:grid-cols-4">
          {[
            [TrendingUp, "3x", "More enquiries in the first 30 days"],
            [CalendarDays, "24hrs", "From brief to live website"],
            [UserPlus, "17", "New members in the first month"],
            [Star, "4.9/5", "Average review rating"],
          ].map(([Icon, value, label]) => {
            const RealIcon = Icon as typeof TrendingUp
            return (
              <article key={value as string} className="border-black/10 md:border-l md:pl-8 first:md:border-l-0">
                <RealIcon className="size-8" />
                <p className="mt-4 text-[34px] font-black tracking-[-0.045em] sm:text-[38px]">{value as string}</p>
                <p className="max-w-[150px] text-[13px] font-bold leading-[1.35]">{label as string}</p>
              </article>
            )
          })}
        </div>
      </section>

      <DarkCta title="See what we can build for your business." />
      <SitesFooter />
    </SitesPage>
  )
}
