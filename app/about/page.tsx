import Nav from "@/components/Nav"
import Image from "next/image"
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

        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row items-start gap-10 sm:gap-16">
            <div className="shrink-0">
              <Image
                src="/renaldo-bw.png"
                alt="Renaldo Edmondson"
                width={120}
                height={120}
                className="rounded-full grayscale object-cover"
              />
            </div>
            <div className="flex-1">
              <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4">
                The founder
              </span>
              <p className="font-sans font-bold text-[#0A0A0A] text-xl leading-snug tracking-tight mb-3">
                Renaldo Edmondson
              </p>
              <div className="space-y-4 text-[#525252] text-base leading-relaxed">
                <p>Renaldo has spent 14+ years in digital and marketing — working on global brands like Gracie Barra and behind campaigns for some of the biggest universities in the US, including Michigan State and Villanova.</p>
                <p>Sorted was built to offer the kind of fast, straightforward help most small businesses genuinely need, minus the usual agency process, delays, or pricing.</p>
              </div>
              <a
                href="https://wa.me/447386468085"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-[#0A0A0A] hover:text-[#525252] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp: 07386 468085
              </a>
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
              Get sorted
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
