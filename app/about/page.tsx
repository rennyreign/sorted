import Nav from "@/components/Nav"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About. Sorted.",
  description: "We help small businesses modernize how they attract, capture, and convert customers. Starting with their website.",
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
            <span className="text-[#525252]">Most small businesses haven&apos;t.</span>
          </h1>
        </section>

        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">

            <div>
              <p className="font-sans font-bold text-[#0A0A0A] text-2xl leading-snug tracking-tight mb-6">
                Customers now expect every business to look professional, respond quickly, and be easy to find.
              </p>
              <div className="space-y-5 text-[#525252] text-base leading-relaxed">
                <p>
                  Most small businesses know this. But between running the day-to-day and trying to keep up with websites, reviews, booking systems, ads, and follow-ups, the digital side keeps falling behind.
                </p>
                <p>
                  The result is a modernization gap. A business can be excellent at what it does and still look amateur online, lose enquiries to faster competitors, and miss repeat revenue from customers it already has.
                </p>
                <p>
                  That gap is not a design problem. It is a business problem. And it is where Sorted starts.
                </p>
              </div>
            </div>

            <div className="space-y-5 text-[#525252] text-base leading-relaxed">
              <p className="font-sans font-bold text-[#0A0A0A] text-2xl leading-snug tracking-tight mb-6">
                We modernize small businesses one step at a time.
              </p>
              <p>
                We built <span className="font-extrabold tracking-tight text-[#0A0A0A]">Sorted.</span> for businesses that know they need to improve, but do not want a six-month agency engagement or the frustration of figuring it out themselves.
              </p>
              <p>
                Every business challenge we solve sits in one of three categories: <strong>Trust</strong> (does the business look credible?), <strong>Enquiries</strong> (can customers get in touch easily?), and <strong>Customers</strong> (can the business generate more revenue from the people it already serves?).
              </p>
              <p>
                The website is the first and most visible gap. It is also the foundation for everything else. So we start there with a working mockup, built before any money changes hands.
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
                  title: "We demonstrate first",
                  body: "You see a working mockup of your new website before committing. No proposals, no guesswork.",
                },
                {
                  num: "02",
                  title: "We build the foundation",
                  body: "Once you approve, we build the site. Then we can add reviews, CRM, follow-up, booking, or whatever comes next.",
                },
                {
                  num: "03",
                  title: "We price after you see it",
                  body: "Price is agreed after the work is visible, based on what you actually need and what makes sense for your situation.",
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
                <p>Renaldo has spent 14+ years in digital and marketing, working on global brands like Gracie Barra and behind campaigns for some of the biggest universities in the US, including Michigan State and Villanova.</p>
                <p>Sorted was built to offer the kind of fast, straightforward help most small businesses genuinely need, minus the usual agency process, delays, or pricing.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row items-start gap-10 sm:gap-16">
            <div className="shrink-0">
              <img
                src="/assets/kay0headshot.png"
                alt="Kayleigh"
                width={120}
                height={120}
                className="rounded-full grayscale object-cover w-[120px] h-[120px]"
              />
            </div>
            <div className="flex-1">
              <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4">
                Director of Sales &amp; Client Relations
              </span>
              <p className="font-sans font-bold text-[#0A0A0A] text-xl leading-snug tracking-tight mb-3">
                Kayleigh Dupont-Modeste
              </p>
              <div className="space-y-4 text-[#525252] text-base leading-relaxed">
                <p>Kayleigh brings a rare combination of commercial instinct and people intelligence to Sorted. With a background spanning talent agency direction, COO of a multi-site skin clinic group, and expert-level personality assessment, she understands how businesses work from the inside out.</p>
                <p>She leads client relationships at Sorted, making sure the right work gets to the right people, expectations are clear from day one, and every client feels looked after throughout.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <div className="max-w-3xl">
            <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
              Mission
            </span>
            <h2 className="font-sans font-extrabold text-[#0A0A0A] text-[clamp(2rem,5vw,3.5rem)] leading-tight tracking-tight mb-8">
              More trust. More enquiries. More customers.
            </h2>
            <div className="space-y-5 text-[#525252] text-lg leading-relaxed">
              <p>
                Modernization means being easy to find, easy to trust, easy to contact, and easy to buy from. It also means having the systems behind the scenes, like follow-up, CRM, reviews, and booking, that turn interest into revenue.
              </p>
              <p>
                We believe every small business deserves to look professional online and operate efficiently in the background, whether they are a one-person operation or a growing team. The price should match where they are, not where an agency thinks they should be.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 sm:px-10 lg:px-16 bg-[#0A0A0A]">
          <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-10">

            <div className="max-w-2xl">
              <p className="font-sans font-extrabold text-white text-[clamp(2rem,5vw,4rem)] leading-tight tracking-tight mb-4">
                Your modernization starts here.
              </p>
              <p className="text-[#525252] text-base leading-relaxed">
                The website is the first doorway. We&apos;ll redesign it before you spend a penny. Then we can build the rest.
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
