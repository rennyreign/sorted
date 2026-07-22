import type { Metadata } from "next"
import Image from "next/image"
import { Check, Eye, PoundSterling, Rocket, ShieldCheck, ThumbsUp, Zap } from "lucide-react"
import { DarkCta, SitesFooter, SitesHeader, SitesPage, SitesTitle, Underline } from "../_components/SitesPrimitives"
import { MockupButton } from "../_components/SitesMockupModal"

export const metadata: Metadata = {
  title: "About | Sorted Sites",
  description: "Sorted Sites helps small businesses win online with free website mockups, fixed prices and fast launches.",
}

export default function AboutPage() {
  return (
    <SitesPage>
      <SitesHeader active="about" />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-12 pt-12 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <SitesTitle kicker="ABOUT SORTED.SITES" title={<>We exist to help<br />small businesses<br />win online.</>} marker="Sorted." />
          <Underline className="mt-2 w-[260px]" />
          <p className="mt-7 max-w-[500px] text-[17px] font-semibold leading-[1.55] tracking-[-0.03em]">
            We build websites that look professional, earn trust and turn visitors into customers. Fast, simple and risk-free. No sales pressure. Just great websites.
          </p>
          <div className="mt-8"><MockupButton /></div>
        </div>
        <div className="relative min-h-[320px] overflow-hidden rounded-[20px] bg-[#f7f1e8] shadow-[0_24px_70px_rgba(0,0,0,0.1)] sm:min-h-[420px] sm:rounded-[24px]">
          <Image
            src="/sorted-sites/aboutHero.png"
            alt="Sorted Sites about page visual showing the build-first website process"
            fill
            priority
            sizes="(min-width: 1024px) 650px, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-10 border-t border-black/10 px-5 py-12 sm:px-8 lg:grid-cols-2">
        <StoryBlock kicker="OUR MISSION" title="Make it easy for small businesses to win online." copy={["Most small businesses know they need a better website. They just do not have the time, budget or patience for agencies, jargon and long waits.", "We do things differently. We build your website first, so you can see exactly what you are getting. If you like it, we build it. If you do not, you walk away.", "No surprises. No risk."]} />
        <StoryBlock kicker="OUR STORY" title="We started Sorted to fix the broken process." copy={["After years in digital and operations, we saw the same frustrations everywhere.", "Slow agencies. Expensive quotes. Endless back and forth. So we built a better way.", "A process that puts you in control, gives you clarity and delivers real results. That is Sorted Sites."]} />
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-6 rounded-[18px] bg-[#f7f1e8] p-7 lg:grid-cols-[0.18fr_repeat(4,1fr)]">
          <div>
            <p className="text-[12px] font-black uppercase text-[#c6de00]">The<br />Sorted values</p>
          </div>
          {[
            [PoundSterling, "Customer first", "Everything we do is designed around your success."],
            [Zap, "Move fast", "Speed matters. We work fast without cutting corners."],
            [ShieldCheck, "No risk", "Free mockup. No obligation. Complete peace of mind."],
            [Check, "Keep it simple", "Clear process. Straight answers. No hidden extras."],
          ].map(([Icon, title, copy]) => {
            const RealIcon = Icon as typeof PoundSterling
            return (
              <article key={title as string} className="border-black/10 lg:border-l lg:pl-6">
                <span className="grid size-12 place-items-center rounded-full bg-[#dfff00]"><RealIcon className="size-6" /></span>
                <h3 className="mt-4 text-[16px] font-black">{title as string}</h3>
                <p className="mt-2 text-[13px] font-semibold leading-[1.45] text-black/65">{copy as string}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.28fr_0.72fr]">
        <div>
          <p className="mb-5 text-[12px] font-black text-[#c6de00]">HOW WE ARE DIFFERENT</p>
          <h2 className="text-[36px] font-black leading-[1] tracking-[-0.035em]">We do not sell.<br />We show.</h2>
          <Underline className="mt-5 w-56" />
          <p className="mt-6 text-[14px] font-semibold leading-[1.5] text-black/65">You see your new website before you spend a penny. That changes everything.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-4">
          {[
            [Eye, "We build a mockup", "You get a custom website mockup for your business."],
            [Eye, "You review it", "Take your time. Make sure it is exactly what you want."],
            [ThumbsUp, "You approve", "Happy with the mockup? Approve it and we get to work."],
            [Rocket, "We build & launch", "We build, connect everything and launch your new website."],
          ].map(([Icon, title, copy]) => {
            const RealIcon = Icon as typeof Eye
            return (
              <article key={title as string} className="text-center">
                <RealIcon className="mx-auto size-12" strokeWidth={1.8} />
                <h3 className="mt-6 text-[15px] font-black">{title as string}</h3>
                <p className="mt-3 text-[12px] font-semibold leading-[1.45] text-black/65">{copy as string}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8">
        <div className="grid gap-6 rounded-[18px] bg-[#dfff00] p-5 sm:gap-8 sm:p-8 lg:grid-cols-[0.25fr_0.38fr_0.37fr] lg:items-center">
          <div className="relative mx-auto size-44 overflow-hidden rounded-full bg-white sm:size-52">
            <Image src="/renaldo-bw.png" alt="Renaldo Edmondson, founder of Sorted Sites" fill sizes="220px" className="object-cover" />
          </div>
          <div>
            <p className="mb-4 text-[12px] font-black uppercase text-black/55">Founded by operators</p>
            <h2 className="text-[30px] font-black leading-[1] tracking-[-0.035em] sm:text-[34px]">Built by operators.<br />For operators.</h2>
            <Underline className="mt-4 w-56" />
            <p className="mt-6 text-[14px] font-semibold leading-[1.5] text-black/65">Sorted was founded by people who love systems, process and doing things properly. We bring that mindset to every website we build.</p>
          </div>
          <blockquote className="rounded-[14px] bg-white/35 p-4 sm:bg-transparent sm:p-0">
            <p className="[font-family:var(--font-sites-marker)] text-[2rem] leading-[1.03] sm:text-[2.5rem] sm:leading-[1.05]">“We are not here to be the biggest. We are here to be the most trusted partner for small businesses serious about growth.”</p>
            <p className="mt-6 text-[12px] font-black">Renaldo Edmondson</p>
            <p className="text-[12px] font-semibold text-black/60">Founder, Sorted.</p>
          </blockquote>
        </div>
      </section>

      <DarkCta />
      <SitesFooter />
    </SitesPage>
  )
}

function StoryBlock({ kicker, title, copy }: { kicker: string; title: string; copy: string[] }) {
  return (
    <article>
      <p className="mb-5 text-[12px] font-black uppercase text-[#c6de00]">{kicker}</p>
      <h2 className="max-w-[520px] text-[34px] font-black leading-[1] tracking-[-0.035em]">{title}</h2>
      <Underline className="mt-5 w-40" />
      <div className="mt-7 space-y-4 text-[15px] font-semibold leading-[1.55] text-black/72">
        {copy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </article>
  )
}
