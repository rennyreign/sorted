import type { Metadata } from "next"
import Image from "next/image"
import { Check, Edit3, Eye, Rocket } from "lucide-react"
import { DarkCta, SitesFooter, SitesHeader, SitesPage, SitesTitle, Underline } from "../_components/SitesPrimitives"
import { MockupButton } from "../_components/SitesMockupModal"
import { ExamplesGallery } from "./ExamplesGallery"

export const metadata: Metadata = {
  title: "Examples | Sorted",
  description: "Real Sorted mockups for small businesses across health, home services, hospitality, retail and professional services.",
  alternates: {
    canonical: "/examples",
  },
}

export default function ExamplesPage() {
  return (
    <SitesPage>
      <SitesHeader active="examples" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-10 pt-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SitesTitle title={<>Real websites.<br />Real businesses.</>} marker={<>Built first. Priced second.</>} />
          <Underline className="mt-2 w-[300px]" />
          <p className="mt-7 max-w-[450px] text-[17px] font-semibold leading-[1.5] tracking-[-0.03em]">
            Every website below started as a free mockup. The business owner saw it, loved it, and we built it.
          </p>
          <div className="mt-8 flex items-center gap-5">
            <MockupButton />
            <span className="[font-family:var(--font-sites-highlight)] text-[24px] leading-none text-[#d0e600]">See your business<br />here next.</span>
          </div>
        </div>
        <div className="relative min-h-[320px] overflow-hidden rounded-[20px] bg-[#f7f1e8] shadow-[0_24px_70px_rgba(0,0,0,0.1)] sm:min-h-[420px] sm:rounded-[24px]">
          <Image
            src="/sorted-sites/examples-hero.png"
            alt="Sorted example mockups arranged across desktop and mobile screens"
            fill
            priority
            sizes="(min-width: 1024px) 650px, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-[34px] font-black leading-[1] tracking-[-0.035em]">Different businesses.<br />Same process.</h2>
            <Underline className="mt-4 w-52" />
          </div>
        </div>
        <ExamplesGallery />
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-12 sm:px-8">
        <div className="grid gap-8 rounded-[18px] bg-[#dfff00] p-7 lg:grid-cols-[0.34fr_0.66fr] lg:items-center">
          <div>
            <h2 className="text-[32px] font-black leading-[1] tracking-[-0.035em]">Every example you see started the same way.</h2>
            <Underline className="mt-4 w-56" />
          </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              [Edit3, "We build a mockup", "We create a custom mockup for your business."],
              [Eye, "You review it", "See exactly what you are getting."],
              [Check, "You approve", "You love it, so we agree a fixed price."],
              [Rocket, "We build & launch", "We build your website and get you live."],
            ].map(([Icon, title, copy], index) => {
              const RealIcon = Icon as typeof Edit3
              return (
                <article key={title as string} className="text-center">
                  <span className="mx-auto grid size-10 place-items-center rounded-full bg-[#070707] text-[13px] font-black text-white">{index + 1}</span>
                  <span className="mx-auto mt-4 grid size-12 place-items-center rounded-full bg-white">
                    <RealIcon className="size-6" />
                  </span>
                  <h3 className="mt-4 text-[14px] font-black">{title as string}</h3>
                  <p className="mt-2 text-[12px] font-semibold leading-[1.45] text-black/65">{copy as string}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <DarkCta />
      <SitesFooter />
    </SitesPage>
  )
}
