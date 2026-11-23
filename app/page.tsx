import type { Metadata } from "next"
import { ArrowRight, PhoneCall, ShieldCheck } from "lucide-react"
import { SiteMapFooter } from "@/components/SiteMapFooter"
import { AssistantsHeader } from "./assistants/_components/AssistantsHeader"
import { JobHook } from "./assistants/_components/JobHook"
import { PhoneDemo } from "./assistants/_components/PhoneDemo"
import { GoogleReviews } from "./sites/_components/GoogleReviews"
import { getGoogleReviews } from "@/lib/googleReviews"

export const metadata: Metadata = {
  title: "AI assistants that do the work | Sorted",
  description: "Sorted builds a tailored AI assistant for your business and puts it to work: enquiries, quotes, bookings and follow-ups. Tell us what you'd like yours to do.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "AI assistants that do the work | Sorted",
    description: "We'll build yours and put it to work. Tell us what you'd like your assistant to do.",
    url: "/",
  },
}

const label = "text-[12px] font-black uppercase tracking-[0.14em] text-black/55"

const jobs = [
  ["Enquiries", "Reads each message, picks out the details and asks for anything missing.", "bg-[#f6f5ec]"],
  ["Quotes", "Gets a draft quote ready using your prices. You check it first.", "bg-[#e8f3fa]"],
  ["Bookings", "Offers the times you're free and keeps your diary tidy.", "bg-[#fceeee]"],
  ["Follow-ups", "Nudges customers who haven't replied, so nothing gets forgotten.", "bg-[#f6f5ec]"],
] as const

const steps = [
  ["Meet", "Try a sample assistant and watch it do a real job."],
  ["Tailor", "We learn how your business works and set it up around you."],
  ["Put to work", "We check it works, then switch it on and look after it."],
] as const

const trust = [
  ["It says it's AI", "It tells people it's an AI assistant from the very start."],
  ["You stay in charge", "Quotes and anything important wait for your OK before they go out."],
  ["Always clear where things stand", "You can see what's drafted, approved, sent, booked and paid."],
  ["Your information stays yours", "You can see it, take it with you or have it deleted."],
] as const

export default async function AssistantsPage() {
  const googleReviews = await getGoogleReviews()
  return (
    <main className="min-h-screen overflow-x-clip bg-[#fafafa] text-[#111]">
      <AssistantsHeader />

      <section className="mx-auto grid max-w-[1280px] gap-10 px-6 pb-14 pt-10 sm:px-10 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_560px] lg:items-stretch">
        <div>
          <h1 className="text-[clamp(2.9rem,6vw,5.6rem)] font-black uppercase leading-[0.9] tracking-[-0.06em]">AI assistants<br />that do the work.</h1>
          <p className="mt-6 inline-block bg-[#e4ff29] px-3 py-1 text-[clamp(1.35rem,3.4vw,2.6rem)] font-black leading-[1.05] tracking-[-0.045em] sm:px-5">Tell us what you&apos;d like yours to do.</p>
          <div className="mt-8">
            <JobHook />
          </div>
          <div className="mt-7">
            <GoogleReviews data={googleReviews} variant="pill" />
          </div>
        </div>
        <div className="mt-8 flex justify-center lg:mt-0 lg:justify-start">
          <PhoneDemo />
        </div>
      </section>

      <section id="try" className="mx-auto grid max-w-[1280px] scroll-mt-10 gap-10 px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-[0.36fr_0.64fr]">
        <div>
          <p className={label}>One job, one result</p>
          <h2 className="mt-3 text-[clamp(2.6rem,5.4vw,4.6rem)] font-black leading-[0.95] tracking-[-0.055em]">How a job gets done.</h2>
          <div className="relative mt-10 hidden max-w-[360px] lg:block">
            <img
              src="/assistants/photos/cafe-owner.webp"
              alt="A cafe owner texting on her phone at the coffee machine"
              width={880}
              height={1100}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full rounded-[22px] object-cover"
            />
            <span className="absolute -bottom-4 left-4 rounded-full bg-[#e4ff29] px-4 py-1.5 text-[15px] font-black tracking-[-0.02em]">Text it. Done.</span>
          </div>
        </div>
        <div className="border-t border-black/15">
          {[
            ["01", "Text it what you'd like handled", "In your own words, just like messaging a person."],
            ["02", "It gets on with it", "It reads the message, asks about anything that's missing and gets the next step ready."],
            ["03", "You say yes, then it sends", "Nothing goes out to a customer until you've OK'd it."],
          ].map(([n, t, c]) => (
            <div key={n} className="grid grid-cols-[44px_1fr] gap-4 border-b border-black/15 py-8 sm:grid-cols-[3rem_1.1fr_0.9fr] sm:gap-6 sm:py-9">
              <span className="text-[14px] font-black tabular-nums text-black/45">{n}</span>
              <h3 className="text-[clamp(1.7rem,2.8vw,2.2rem)] font-black leading-[1] tracking-[-0.045em]">{t}</h3>
              <p className="col-start-2 text-[clamp(1.05rem,1.4vw,1.25rem)] font-semibold leading-[1.45] text-black/65 sm:col-start-auto">{c}</p>
            </div>
          ))}
        </div>
        <img
          src="/assistants/photos/cafe-owner.webp"
          alt="A cafe owner texting on her phone at the coffee machine"
          width={880}
          height={1100}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full rounded-[22px] object-cover object-[50%_15%] lg:hidden"
        />
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-10 sm:px-10 sm:py-16">
        <h2 className="mt-3 text-[clamp(2.6rem,5.4vw,4.6rem)] font-black leading-[0.95] tracking-[-0.055em]">Real work, not another tool.</h2>
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {jobs.map(([t, c, surface], i) => (
            <article key={t} className={`rounded-[22px] p-7 ${surface}`}>
              <h3 className="text-[clamp(1.7rem,2.3vw,2.2rem)] font-black leading-[1] tracking-[-0.045em]">{t}</h3>
              <p className="mt-4 text-[clamp(1rem,1.25vw,1.15rem)] font-semibold leading-[1.45] text-black/65">{c}</p>
              <img
                src={`/assistants/photos/${["card-enquiries", "card-quotes", "card-bookings", "card-followups"][i]}.webp`}
                alt={["A phone showing a “New enquiry, details captured” notification", "A phone showing a “Quote ready, check and approve” notification", "A phone showing a “Booking confirmed, Thu 2:30pm” notification", "A phone showing a “Follow-up sent, quote reminder” notification"][i]}
                width={1100}
                height={825}
                loading="lazy"
                decoding="async"
                className="mt-6 aspect-[4/3] w-full rounded-[16px] object-cover object-center"
              />
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-[1280px] scroll-mt-10 px-6 py-10 sm:px-10 sm:py-16">
        <h2 className="mt-3 text-[clamp(2.6rem,5.4vw,4.6rem)] font-black leading-[0.95] tracking-[-0.055em]">Meet. Tailor. Put to work.</h2>
        <div className="mt-9 grid gap-6 md:grid-cols-3">
          {steps.map(([t, c], index) => (
            <article key={t} className="rounded-[22px] border border-black/10 bg-white p-8 shadow-[0_14px_38px_rgba(0,0,0,0.04)]">
              <span className="grid size-11 place-items-center rounded-full bg-black text-[15px] font-black text-white">{index + 1}</span>
              <h3 className="mt-6 text-[clamp(1.8rem,2.6vw,2.4rem)] font-black leading-[1] tracking-[-0.045em]">{t}</h3>
              <p className="mt-4 text-[clamp(1rem,1.25vw,1.15rem)] font-semibold leading-[1.45] text-black/65">{c}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 flex items-center gap-2 text-[clamp(1rem,1.25vw,1.15rem)] font-semibold text-black/60">
          <PhoneCall className="size-5" /> Prefer to talk it through? It can offer to call you, only if you say yes, and it remembers what you&apos;ve already told it.
        </p>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-10 sm:px-10 sm:py-16">
        <h2 className="mt-3 flex items-center gap-3 text-[clamp(2.6rem,5.4vw,4.6rem)] font-black leading-[0.95] tracking-[-0.055em]">
          <ShieldCheck className="size-9" strokeWidth={2.2} /> Clear rules.
        </h2>
        <div className="mt-9 grid items-stretch gap-6 lg:grid-cols-[1fr_0.55fr]">
          <div className="relative order-first aspect-[4/3] w-full overflow-hidden rounded-[22px] lg:order-last lg:aspect-auto lg:min-h-[320px]">
            <img
              src="/assistants/photos/trust-laptop.webp"
              alt="A man working at a laptop at a desk"
              width={1000}
              height={795}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[55%_35%]"
            />
          </div>
          <div className="grid content-start gap-6 sm:grid-cols-2">
            {trust.map(([t, c]) => (
              <article key={t} className="rounded-[22px] border border-black/10 bg-white p-7">
                <h3 className="text-[clamp(1.4rem,2vw,1.8rem)] font-black leading-[1.05] tracking-[-0.04em]">{t}</h3>
                <p className="mt-3 text-[clamp(1rem,1.25vw,1.15rem)] font-semibold leading-[1.45] text-black/65">{c}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-14 sm:px-10 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[22px] bg-black p-8 text-white sm:p-12 md:flex-row md:items-center">
          <div>
            <h2 className="text-[clamp(2.2rem,4.2vw,3.6rem)] font-black leading-[1.05] tracking-[-0.045em]">Tell us what you&apos;d like your assistant to do.</h2>
            <p className="mt-3 max-w-[520px] text-[clamp(1.05rem,1.4vw,1.25rem)] leading-relaxed text-white/70">Then book a walkthrough once you&apos;ve seen what it can do.</p>
          </div>
          <a href="https://cal.com/sortmydigital/15min" data-track="cta_click" data-cta-text="Let’s talk it through" data-cta-location="conversation_strip" className="inline-flex min-h-14 shrink-0 items-center gap-4 rounded-full bg-[#e4ff29] px-8 text-[16px] font-black text-black transition-colors hover:bg-white">Let&apos;s talk it through<ArrowRight size={20} /></a>
        </div>
      </section>

      <SiteMapFooter experience="assistants" />
    </main>
  )
}
