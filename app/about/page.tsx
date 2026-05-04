import Nav from "@/components/Nav"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About. Sorted.",
  description: "Why Sorted exists. Good online work, without agency prices.",
}

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main>

        <section className="pt-40 pb-20 px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
            About <span className="font-extrabold tracking-tight text-[#0A0A0A]">Sorted.</span>
          </span>
          <h1 className="font-sans font-extrabold text-[#0A0A0A] text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-tight max-w-5xl">
            The internet changed.
            <br />
            <span className="text-[#525252]">Agency prices didn&apos;t.</span>
          </h1>
        </section>

        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">

            <div>
              <p className="font-sans font-bold text-[#0A0A0A] text-2xl leading-snug tracking-tight mb-6">
                What&apos;s actually possible online has been completely transformed. What agencies charge hasn&apos;t.
              </p>
              <div className="space-y-5 text-[#525252] text-base leading-relaxed">
                <p>
                  Tools that once cost thousands are free. Templates that agencies charged five figures for can be built in a day. AI has compressed timelines that used to take weeks into hours.
                </p>
                <p>
                  And yet most agencies still charge like it's 2010. You're paying for account managers, pitch decks, project kick-off calls, and an office in a city centre. Not the actual work.
                </p>
                <p>
                  Meanwhile, DIY website builders promise simplicity and deliver frustration. They're fine if you have time to learn them. Most people don't.
                </p>
              </div>
            </div>

            <div className="space-y-5 text-[#525252] text-base leading-relaxed">
              <p className="font-sans font-bold text-[#0A0A0A] text-2xl leading-snug tracking-tight mb-6">
                There&apos;s a gap. We exist to fill it.
              </p>
              <p>
                We built <span className="font-extrabold tracking-tight text-[#0A0A0A]">Sorted.</span> for the businesses that know they need a decent online presence, but don&apos;t want to spend thousands on an agency and don&apos;t have hours to waste on DIY tools.
              </p>
              <p>
                The plumber who needs a clean website. The café that wants proper social ads. The startup that needs a landing page, not a six-month engagement. The shop that just needs their Google profile sorted.
              </p>
              <p>
                These are real needs. They don&apos;t require a creative director and three discovery sessions. They require someone who knows what they&apos;re doing, does it quickly, and charges a fair price.
              </p>
              <p className="font-semibold text-[#0A0A0A]">
                That&apos;s <span className="font-extrabold tracking-tight text-[#0A0A0A]">Sorted.</span>
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-start gap-16 lg:gap-0">

            <div className="lg:w-64 shrink-0">
              <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4 block">
                How we work
              </span>
              <h2 className="font-sans font-extrabold text-[#0A0A0A] text-4xl leading-tight tracking-tight">
                Fast.<br/>Fair.<br/>No fluff.
              </h2>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-10">
              {[
                {
                  num: "01",
                  title: "We tell you the price upfront",
                  body: "Before a single pixel is moved, you know exactly what it costs. No discovery phase, no estimate ranges, no surprise invoices.",
                },
                {
                  num: "02",
                  title: "We do the work quickly",
                  body: "Most jobs are done in 24–48 hours. We don't drag things out. Speed is part of the product.",
                },
                {
                  num: "03",
                  title: "We don't overcomplicate it",
                  body: "No unnecessary meetings. No jargon. No upselling you into a retainer you don't need. Just the work, done properly.",
                },
              ].map((item) => (
                <div key={item.num}>
                  <span className="block font-mono text-[11px] text-[#A3A3A3] mb-5 tabular-nums">{item.num}</span>
                  <h3 className="font-sans font-bold text-[#0A0A0A] text-lg leading-snug tracking-tight mb-3">{item.title}</h3>
                  <p className="text-sm text-[#737373] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        <section className="py-20 px-6 sm:px-10 lg:px-16 bg-[#0A0A0A]">
          <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-10">

            <div className="max-w-2xl">
              <p className="font-sans font-extrabold text-white text-[clamp(2rem,5vw,4rem)] leading-tight tracking-tight mb-4">
                Excellent work is available for the price of a few dinners out.
              </p>
              <p className="text-[#525252] text-base leading-relaxed">
                The internet made this possible. Someone just needs to build it. We&apos;re those people.
              </p>
            </div>

            <a
              href="/#get-started"
              className="group inline-flex items-center gap-3 bg-white text-[#0A0A0A] font-semibold text-sm rounded-full px-6 py-3.5 hover:bg-white/90 transition-all duration-300 shrink-0"
            >
              Get started
              <span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>

          </div>
        </section>

      </main>
    </>
  )
}
