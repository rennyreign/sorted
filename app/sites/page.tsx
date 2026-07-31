import type { Metadata } from "next"
import Image from "next/image"
import { ArrowRight, Check, Clock3, Edit3, Eye, Phone, ShieldCheck, Star, Zap } from "lucide-react"
import { FeatureBar, Logo, SitesHeader, SitesPage, SitesTitle, Underline } from "./_components/SitesPrimitives"
import { MockupButton } from "./_components/SitesMockupModal"
import { exampleCaseStudies } from "./examples/_caseStudies"

export const metadata: Metadata = {
  title: "Sorted | Your new website, Sorted",
  description: "Sorted builds free website mockups first, then prices the build once you have seen what you are getting.",
  alternates: {
    canonical: "/",
  },
}

export default function SortedSitesHome() {
  return (
    <SitesPage>
      <SitesHeader />
      <section className="mx-auto grid max-w-[1220px] gap-8 px-5 pb-8 pt-10 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:pt-12">
        <div>
          <SitesTitle
            title={<>Your new<br />website,</>}
            marker={<span className="[font-family:var(--font-sites-fave-script)] text-[clamp(6rem,11vw,11.5rem)] normal-case tracking-[0]">Sorted.</span>}
          />
          <Underline className="mt-2 w-[300px]" />
          <div className="mt-8">
            <h2 className="text-[clamp(1.85rem,2.75vw,2.85rem)] font-black leading-[0.98] tracking-[-0.045em] md:whitespace-nowrap">
              <span className="inline-block">
                See it first
                <Underline className="mt-1 h-[5px] w-full" />
              </span>{" "}
              Then decide
            </h2>
          </div>
          <p className="mt-5 max-w-[470px] text-[17px] font-semibold leading-[1.5] tracking-[-0.03em]">
            We design your website before you spend a penny. If you love it, we build it. If you do not, walk away. No obligation.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <MockupButton />
            <span className="[font-family:var(--font-sites-highlight)] text-[23px] leading-none text-[#d0e600]">No card details<br />No obligation.</span>
          </div>
        </div>

        <div className="relative min-h-[300px] sm:min-h-[390px] lg:min-h-[500px]">
          <Image
            src="/sorted-sites/home-herobg.png"
            alt="Sorted website mockups displayed around a laptop website preview."
            fill
            priority
            sizes="(min-width: 1024px) 690px, 100vw"
            className="object-contain object-center"
          />
        </div>
      </section>

      <FeatureBar />

      <section className="mx-auto grid max-w-[1220px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.28fr_0.72fr]">
        <div>
          <h2 className="text-[36px] font-black leading-[0.98] tracking-[-0.035em]">Simple process<br />Serious results</h2>
          <Underline className="mt-5 w-60" />
        </div>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-7">
          {[
            [Edit3, "Tell us about you", "Answer a few quick questions about your business and goals."],
            [Eye, "We design your site", "We create a custom mockup tailored to your business. You review it."],
            [Check, "You decide", "Happy with the mockup? Approve it and we get to work."],
            [Zap, "We build & launch", "We build, connect everything and launch your new website."],
          ].map(([Icon, title, copy], index) => {
            const RealIcon = Icon as typeof Edit3
            return (
              <article key={title as string} className="relative border-black/10 md:border-l md:pl-8 first:md:border-l-0">
                <span className="grid size-10 place-items-center rounded-full bg-[#070707] text-[13px] font-black text-white sm:size-11 sm:text-[14px]">{index + 1}</span>
                <span className="mt-5 grid size-11 place-items-center rounded-full bg-[#dfff00] sm:mt-7 sm:size-12">
                  <RealIcon className="size-6" strokeWidth={2.4} />
                </span>
                <h3 className="mt-4 text-[15px] font-black tracking-[-0.04em] sm:mt-5 sm:text-[16px]">{title as string}</h3>
                <p className="mt-3 text-[13px] font-semibold leading-[1.5] text-black/65">{copy as string}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[0.28fr_0.72fr]">
        <div>
          <h2 className="text-[36px] font-black leading-[1] tracking-[-0.035em]">Websites that<br />drive real growth</h2>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            [Edit3, "3x", "More enquiries", "On average within the first 60 days"],
            [Star, "CMS", "Easy content updates", "Text, images and services you can edit yourself"],
            [Clock3, "24hrs", "Mockup delivery", "Most mockups delivered in 24 hours"],
            [ShieldCheck, "0%", "Risk before approval", "No payment is needed before you see the mockup"],
          ].map(([Icon, stat, label, copy]) => {
            const RealIcon = Icon as typeof Edit3
            return (
              <article key={stat as string} className="border-black/10 md:border-l md:pl-8">
                <RealIcon className="size-7" strokeWidth={2.2} />
                <p className="mt-4 text-[34px] font-black tracking-[-0.045em] sm:mt-5 sm:text-[38px]">{stat as string}</p>
                <p className="text-[14px] font-black">{label as string}</p>
                <p className="mt-2 text-[13px] font-semibold leading-[1.45] text-black/65">{copy as string}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-7 px-5 py-12 sm:px-8 lg:grid-cols-[0.32fr_repeat(3,1fr)]">
        <div>
          <h2 className="text-[34px] font-black leading-[1] tracking-[-0.035em]">Real businesses<br />Real mockups<br />Real results</h2>
          <a href="/examples" className="mt-7 inline-flex h-12 items-center gap-3 whitespace-nowrap rounded-full border border-black/20 px-5 text-[12px] font-black">
            View more examples <ArrowRight className="size-4" strokeWidth={2.5} />
          </a>
        </div>
        {exampleCaseStudies.slice(0, 3).map((example) => (
          <article key={example.slug} className="overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_14px_40px_rgba(0,0,0,0.045)]">
            <a href={`/examples/${example.slug}`} className="group relative block aspect-[5/4] overflow-hidden bg-[#080808]">
              <Image src={example.image} alt={`${example.business} website`} fill sizes="360px" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.055]" />
            </a>
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex h-7 items-center rounded-full bg-[#dfff00] px-3 text-[10px] font-black text-black">{example.category}</span>
                <span className="inline-flex h-7 items-center rounded-full bg-black/5 px-3 text-[10px] font-black text-black/58">{example.location}</span>
              </div>
              <h3 className="mt-4 text-[18px] font-black tracking-[-0.045em]">{example.business}</h3>
              <a href={`/examples/${example.slug}`} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-black/5 px-4 text-[12px] font-black sm:min-h-0 sm:bg-transparent sm:px-0">
                View case study <ArrowRight className="size-4" strokeWidth={2.6} />
              </a>
            </div>
          </article>
        ))}
      </section>

      <HomeBottom />
    </SitesPage>
  )
}

function HomeBottom() {
  const testimonials = [
    ["The mockup was spot on. They nailed our brand and goals. We went live within a week.", "Stuart Gwilt", "Gracie Barra"],
    ["Incredible service. Fast, professional and the results speak for themselves.", "Savannah Villegas", "Freelancer"],
    ["No sales pitch, just great work. Exactly what we needed.", "Michael Edmeads", "Bodysharp"],
  ]

  return (
    <section className="bg-[#070707] px-5 pb-8 pt-12 text-white sm:px-8">
      <div className="mx-auto max-w-[1220px]">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1fr] lg:items-start">
          <div>
            <h2 className="max-w-[480px] text-[clamp(2.8rem,5vw,5rem)] font-black leading-[0.95] tracking-[-0.045em]">
              You see it first
              <br />
              Then you decide
            </h2>
            <Underline className="mt-5 w-60" />
            <p className="mt-6 max-w-[450px] text-[15px] font-semibold leading-[1.5] text-white/82">
              We believe in earning your trust before asking for your money. That is why every website starts with a free mockup.
            </p>
            <div className="mt-7 grid max-w-[520px] gap-5 text-[14px] font-semibold sm:grid-cols-2">
              <ul className="space-y-3">
                {["No payment required", "No pushy sales"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="size-4 text-[#dfff00]" strokeWidth={4} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="border-white/25 text-white/88 sm:border-l sm:pl-8">Just a great website, built for your business.</p>
            </div>
          </div>

          <div>
            <div className="rounded-[15px] bg-white/[0.055] p-7 shadow-[0_22px_55px_rgba(0,0,0,0.22)] ring-1 ring-white/8">
              <p className="mb-6 text-[15px] font-black">What business owners say</p>
              <div className="grid gap-6 md:grid-cols-3">
                {testimonials.map(([quote, name, business]) => (
                  <blockquote key={name} className="border-white/15 md:border-l md:pl-6 first:md:border-l-0 first:md:pl-0">
                    <p className="text-[#dfff00]">★★★★★</p>
                    <p className="mt-3 text-[13px] font-semibold leading-[1.5] text-white/82">"{quote}"</p>
                    <p className="mt-5 text-[12px] font-black">{name}</p>
                    <p className="mt-1 text-[12px] font-semibold text-white/55">{business}</p>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 rounded-[12px] bg-white px-6 py-5 text-black shadow-[0_18px_44px_rgba(0,0,0,0.22)] lg:grid-cols-[0.3fr_0.3fr_0.12fr_0.28fr] lg:items-center">
          <div className="grid grid-cols-[56px_1fr] items-center gap-4">
            <span className="grid size-14 place-items-center rounded-full bg-[#e7ff1e]">
              <Edit3 className="size-8" strokeWidth={2.2} />
            </span>
            <p className="text-[24px] font-black leading-[1.05] tracking-[-0.035em]">Ready for your<br />new website?</p>
          </div>
          <p className="text-[14px] font-semibold leading-[1.45]">Get your free mockup in 24 hours<br />No obligation. No credit card.</p>
          <ArrowRight className="hidden size-16 rotate-[-8deg] lg:block" strokeWidth={1.7} />
          <MockupButton variant="primary" className="justify-self-start whitespace-nowrap lg:justify-self-end" />
        </div>

        <footer className="mt-9 grid gap-8 md:grid-cols-[1.35fr_0.8fr_0.8fr_1fr]">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-[220px] text-[13px] font-semibold leading-[1.4] text-white/80">
              Websites that build trust, explain your services and turn visitors into enquiries.
            </p>
            <p className="mt-7 text-[11px] font-medium text-white/50">© 2026 Sorted.</p>
            <p className="mt-2 text-[10px] font-medium leading-[1.5] text-white/40">
              Sorted is a trading name of ADX Engine Ltd · Registered in England &amp; Wales · Company number 17327041
            </p>
          </div>
          <HomeFooterLinks title="Product" links={[["How it works", "/"], ["Examples", "/examples"], ["Pricing", "/pricing"], ["Updates", "/website-updates"]]} />
          <HomeFooterLinks title="Company" links={[["About us", "/about"], ["Our process", "/"], ["Reviews", "/examples"], ["Partner program", "/partners"], ["Contact", "mailto:hello@sortmydigital.site"]]} />
          <div>
            <p className="mb-4 text-[12px] font-black">Let's talk</p>
            <a href="https://wa.me/447386468085" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#dfff00] px-5 text-[12px] font-black text-black">
              <Phone className="size-4" strokeWidth={2.6} />
              WhatsApp us
            </a>
            <p className="mt-4 text-[12px] font-semibold text-white/80">hello@sortmydigital.site</p>
          </div>
        </footer>
      </div>
    </section>
  )
}

function HomeFooterLinks({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-4 text-[12px] font-black">{title}</p>
      <ul className="space-y-1 text-[12px] font-semibold text-white/82 sm:space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="inline-flex min-h-10 items-center transition-colors hover:text-[#dfff00] sm:min-h-0">{label}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
