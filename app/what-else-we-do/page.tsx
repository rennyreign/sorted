import type { Metadata } from "next"
import Image from "next/image"
import { ArrowRight, BarChart3, Check, Edit3, Eye, LayoutGrid, Mail, Megaphone, Play, Radar, Settings, Users } from "lucide-react"
import { SitesFooter, SitesHeader, SitesPage, Underline } from "../sites/_components/SitesPrimitives"
import { MockupButton } from "../sites/_components/SitesMockupModal"

export const metadata: Metadata = {
  title: "What we improve | Sorted",
  description:
    "Turn website visits into useful enquiries. Clearer messages, stronger proof, easier contact and separately scoped campaign support.",
  alternates: {
    canonical: "/what-else-we-do",
  },
  openGraph: {
    title: "What we improve | Sorted",
    description: "A website visit is a start. We help make the next step clearer: what you offer, why people should trust you and how to get in touch.",
    url: "/what-else-we-do",
  },
}

export default function WhatElseWeDoPage() {
  return (
    <SitesPage>
      <SitesHeader active="whatelse" />

      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 pb-7 pt-7 sm:px-8 lg:grid-cols-5 lg:items-center lg:gap-6 lg:px-10 lg:pt-9">
          <div className="lg:col-span-2">
            <h1 className="text-[clamp(2.4rem,3.7vw,3.25rem)] font-black leading-[0.94] tracking-[-0.05em]">
              <span className="block">People are looking.</span>
              <span className="block lg:whitespace-nowrap">Let’s help them choose you.</span>
            </h1>
            <Underline className="mt-5 w-40" />
            <p className="mt-5 max-w-[470px] text-[16px] font-semibold leading-[1.55] tracking-[-0.02em] text-black/78">
              A website visit is a start. We help make the next step clearer: what you offer, why people should trust you and how to get in touch.
            </p>
            <p className="mt-4 max-w-[470px] text-[14.5px] font-semibold leading-[1.6] text-black/60">
              If people visit but don’t enquire, the answer isn’t always more traffic. Let’s look at what’s getting in their way.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-6">
              <MockupButton />
              <a href="/howitworks" className="group inline-flex min-h-11 items-center gap-3 text-[13px] font-black transition-colors hover:text-black/55">
                <span className="grid size-11 place-items-center rounded-full border border-black/20 transition-colors group-hover:border-black">
                  <Play className="size-4 fill-black" strokeWidth={0} />
                </span>
                See how we work
              </a>
            </div>
          </div>
          <HeroLaptop />
        </div>
      </section>

      <section className="bg-[#0b0b0b] px-5 py-7 text-white sm:px-8">
        <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.34fr_0.36fr_0.3fr] lg:items-center lg:px-10">
          <div>
            <h2 className="text-[clamp(2rem,3.4vw,2.75rem)] font-black leading-[0.95] tracking-[-0.05em]">
              More than a
              <br />
              first impression.
            </h2>
            <Underline className="mt-5 w-32" />
            <p className="mt-5 max-w-[340px] text-[14.5px] font-semibold leading-[1.6] text-white/70">
              A good-looking website needs a clear offer, useful proof and an easy next step beneath the surface. We help those parts work together.
            </p>
            <div className="mt-6">
              <MockupButton className="border border-white/35 !bg-transparent !text-white hover:!border-white" />
            </div>
          </div>

          <IcebergGraphic />

          <ul className="grid gap-5 border-white/15 lg:border-l lg:pl-8">
            {[
              [Eye, "Being found", "Ways to get in front of the right people, when advertising makes sense."],
              [BarChart3, "Handling enquiries", "See what is working and give every genuine enquiry a clear route in."],
              [Users, "Building confidence", "Show the work, answers and customer proof that help people choose you."],
              [Settings, "Staying in control", "One place to see the website, the plan and what happens next."],
            ].map(([Icon, title, copy]) => {
              const RealIcon = Icon as typeof Eye
              return (
                <li key={title as string} className="flex gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-[#d7ff00]">
                    <RealIcon className="size-4 text-[#d7ff00]" strokeWidth={2.4} />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-black tracking-[-0.03em]">{title as string}</h3>
                    <p className="mt-1.5 text-[12.5px] font-semibold leading-[1.5] text-white/62">{copy as string}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-7 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <h2 className="text-[clamp(1.9rem,2.9vw,2.125rem)] font-black leading-[1.02] tracking-[-0.045em]">
            What helps people choose you,
            <br />
            from first impression
            <br />
            to the first enquiry.
          </h2>
          <p className="max-w-[480px] border-black/15 text-[14px] font-semibold leading-[1.65] text-black/60 lg:border-l lg:pl-6">
            Start with the gap that matters. The website package has a defined scope. Advertising, additional content and follow-up connections are agreed and priced separately.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {capabilityCards.map(([Icon, title, copy, slug, imgW, imgH, copyNarrow]) => {
            const RealIcon = Icon as typeof LayoutGrid
            return (
              <article key={title as string} className="relative flex min-h-[220px] flex-col overflow-hidden rounded-[16px] bg-[#f5f3ee] p-4 max-lg:min-h-[230px]">
                <div className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#d7ff00]">
                    <RealIcon className="size-5" strokeWidth={2.4} />
                  </span>
                  <h3 className="text-[17px] font-black tracking-[-0.035em]">{title as string}</h3>
                </div>
                <p className={`mt-3.5 text-[12.5px] font-semibold leading-[1.55] text-black/60 ${copyNarrow ? "max-w-[58%]" : "max-w-[92%]"}`}>{copy as string}</p>
                <div className="relative mt-auto self-end" style={{ width: `${imgW}%`, height: `${imgH}px` }}>
                  <Image
                    src={`/sorted-whatelse/${slug}-trim.webp`}
                    alt={`${title} illustration`}
                    fill
                    sizes="(min-width: 1024px) 220px, (min-width: 768px) 40vw, 70vw"
                    className="object-contain object-[100%_100%]"
                  />
                </div>
              </article>
            )
          })}
        </div>
        <p className="mt-4 text-right text-[11px] font-semibold text-black/40">
          Interface and creative examples are illustrative, not live capability proof.
        </p>
      </section>

      <section className="border-t border-black/10 bg-[#f5f3ee] px-5 py-7 sm:px-8">
        <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-[0.35fr_0.65fr] lg:items-center lg:px-10">
          <div>
            <h2 className="text-[clamp(1.9rem,3vw,2.5rem)] font-black leading-[0.97] tracking-[-0.05em]">
              A clearer path
              <br />
              to becoming a customer.
            </h2>
            <Underline className="mt-4 w-32" />
            <p className="mt-5 max-w-[360px] text-[13.5px] font-semibold leading-[1.6] text-black/62">
              Your website is one part of the journey. We agree which parts need attention before doing the work. Ad spend and ongoing campaign management are separate.
            </p>
          </div>
          <ol className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0">
            {[
              [LayoutGrid, "Website", "Builds trust and gives people a place to choose you."],
              [Megaphone, "Ads", "Bring the right people to the website."],
              [Radar, "Tracking", "Shows what is working so decisions are easier."],
              [Mail, "Follow-ups", "Keep agreed contact going after the first enquiry."],
              [Users, "Enquiries", "A clear next step for people ready to talk."],
            ].map(([Icon, title, copy], index, arr) => {
              const RealIcon = Icon as typeof LayoutGrid
              return (
                <li key={title as string} className="relative lg:border-l lg:border-black/12 lg:pl-5 lg:first:border-l-0 lg:first:pl-0">
                  <span className="grid size-11 place-items-center rounded-full bg-[#d7ff00]">
                    <RealIcon className="size-5" strokeWidth={2.2} />
                  </span>
                  <h3 className="mt-3.5 text-[14px] font-black tracking-[-0.03em]">{title as string}</h3>
                  <p className="mt-1.5 text-[11.5px] font-semibold leading-[1.5] text-black/58">{copy as string}</p>
                  {index < arr.length - 1 ? <ArrowRight className="absolute -right-2.5 top-3.5 hidden size-4 text-black/35 lg:block" strokeWidth={2.5} /> : null}
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className="bg-[#070707] px-5 py-5 text-white sm:px-8">
        <div className="mx-auto grid max-w-[1280px] items-center gap-6 lg:grid-cols-[auto_1fr_auto] lg:px-10">
          <h2 className="text-[clamp(1.5rem,2.4vw,1.875rem)] font-black leading-[1.05] tracking-[-0.045em]">
            Ready to see what&rsquo;s possible
            <br />
            for your business?
          </h2>
          <ul className="flex flex-wrap items-center gap-x-7 gap-y-3 border-white/20 lg:border-l lg:pl-8">
            {["Start with your website", "Scope and price agreed first", "No obligation."].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[13px] font-bold">
                <Check className="size-4.5 shrink-0 text-[#d7ff00]" strokeWidth={3.2} />
                {item}
              </li>
            ))}
          </ul>
          <MockupButton variant="yellow" />
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-6 py-10 text-[16px] leading-relaxed"><p>Already getting enquiries, but struggling to keep up? <a href="/automation" className="font-bold underline underline-offset-4">Explore AI automation for replies, quotes and payment chasing.</a></p></section>
      <SitesFooter variant="compact" tone="light" />
    </SitesPage>
  )
}

const capabilityCards: [typeof LayoutGrid, string, string, string, number, number, boolean][] = [
  [LayoutGrid, "Website and presence", "A real design and build for your business — not a template with your logo dropped in. Part of a defined website scope.", "custom-website-design", 42, 140, true],
  [Megaphone, "Customer acquisition", "Creative, copy and campaign structure prepared for your offer when needed. Separately scoped; ad spend and ongoing management are additional.", "ad-creatives", 60, 120, true],
  [Mail, "Enquiry handling", "A clear next step after someone gets in touch. Follow-up copy and connections can be scoped separately; your team handles the replies.", "follow-up-automations", 70, 90, false],
  [BarChart3, "Tracking and visibility", "See where visitors come from and which website actions they take. Tracking setup agreed around how people enquire.", "analytics-tracking", 62, 80, false],
  [Settings, "Offers and next steps", "Make it clear what you offer, who it is for and what someone should do next. Give interest a useful place to go.", "analytics-tracking", 62, 80, false],
  [Edit3, "Content and control", "Edit everyday website content yourself through SortedUpdates after handoff.", "content-management", 50, 120, true],
]

function HeroLaptop() {
  return (
    <figure className="relative lg:col-span-3 lg:-mr-4 xl:-mr-6">
      <div className="relative aspect-[2/1] w-full lg:aspect-auto lg:h-[400px] xl:h-[420px]">
        <Image
          src="/sorted-whatelse/hero-laptop.webp"
          alt="Illustrative laptop showing a business website with booking and reporting panels — not live software."
          fill
          priority
          sizes="(min-width: 1280px) 710px, (min-width: 1024px) 550px, 100vw"
          className="object-contain object-right"
        />
      </div>
      <span className="absolute bottom-10 hidden max-w-[170px] -rotate-3 rounded-[4px] bg-[#ffef9e] px-3 py-2.5 text-left shadow-[0_8px_24px_rgba(0,0,0,0.14)] [font-family:var(--font-sites-highlight)] text-[13.5px] leading-[1.25] text-[#3a3a28] sm:block lg:right-[72px] xl:right-[96px]">
        Your website and everything that comes with it. All in one place.
        <svg className="absolute -left-9 bottom-1 h-10 w-9 -scale-x-100" viewBox="0 0 36 40" fill="none" aria-hidden="true">
          <path d="M32 6 C 20 12, 10 20, 7 33" stroke="#3a3a28" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 27 L 6 35 L 15 35" stroke="#3a3a28" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <figcaption className="mt-2 text-right text-[10.5px] font-semibold text-black/40">
        Illustrative interface, not live results or included booking software.
      </figcaption>
    </figure>
  )
}

function IcebergGraphic() {
  return (
    <figure className="relative mx-auto h-[290px] w-full max-w-[440px]">
      <div className="absolute left-0 top-0 h-full w-[65%]">
        <Image
          src="/sorted-whatelse/iceberg-focused.webp"
          alt=""
          fill
          sizes="(min-width: 1024px) 280px, 60vw"
          className="object-contain object-top"
        />
      </div>
      <p className="absolute right-[4%] top-[7%] flex items-center gap-2 text-[13px] font-black">
        Your website
        <svg className="h-9 w-12" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <path d="M44 4 C 30 10, 16 18, 8 30" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </p>
      <span className="absolute left-0 right-[6%] top-[37%] border-t border-dashed border-white/25" aria-hidden="true" />
      <ul className="absolute bottom-[4%] right-0 top-[44%] flex flex-col justify-between text-right text-[13px] font-bold text-white/85">
        {["Discovery", "Your offer", "Customer proof", "Easy contact", "Tracking"].map((label) => (
          <li key={label} className="flex items-center justify-end gap-2.5">
            <span className="h-px w-6 bg-white/30" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
      <figcaption className="sr-only">
        Your website sits above the waterline. Discovery, your offer, customer proof, easy contact and tracking sit beneath it.
      </figcaption>
    </figure>
  )
}
