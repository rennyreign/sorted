"use client"

const testimonials = [
  {
    quote: "They built our site in 36 hours. I paid after I saw it. Simple.",
    author: "Sarah T.",
    role: "Owner, Halesowen Gym",
    rating: 5,
  },
  {
    quote: "No meetings, no briefs. Just sent my old URL and got something way better.",
    author: "Marcus L.",
    role: "Director, Palace Barns",
    rating: 5,
  },
  {
    quote: "The price was fair because they saw what I actually needed. Not guesswork.",
    author: "Priya K.",
    role: "Founder, ClinicFlow",
    rating: 5,
  },
  {
    quote: "Finally, a web team that understands small business budgets. No bloated proposals.",
    author: "James R.",
    role: "Owner, The Craft Kitchen",
    rating: 5,
  },
  {
    quote: "Our new site loads in under a second. Conversions up 40% in the first month.",
    author: "Emma W.",
    role: "Marketing Director, ADX Engine",
    rating: 5,
  },
  {
    quote: "Had a broken booking form on a Friday night. Fixed by Saturday morning.",
    author: "David K.",
    role: "Manager, ClinicFlow",
    rating: 5,
  },
]

export default function Pricing() {

  return (
    <section id="pricing" className="py-32 px-6 sm:px-10 lg:px-16 bg-[#0A0A0A]">
      <div className="max-w-[1400px] mx-auto">

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left column - content */}
          <div>
            <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#737373] font-medium mb-6">
              Pricing
            </span>
            <h2 className="font-sans font-extrabold text-white text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-tight mb-10">
              No quotes upfront.
              <br />
              <span className="text-[#525252]">Build first, price second.</span>
            </h2>

            <div className="space-y-6 text-[#A3A3A3] text-lg leading-relaxed mb-12">
              <p>
                We don&apos;t estimate. We demonstrate. In 24-48 hours, you&apos;ll have 
                a working version of your site to click through. Then we discuss 
                price based on what you actually see and what makes sense for 
                your situation.
              </p>
              <p>
                This means a complex site might be £3,000. Or £400 to a small 
                business that needs the break. The price matches the value 
                and the relationship, decided after you know what you&apos;re 
                getting, not before.
              </p>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white/[0.03] border border-white/[0.08] rounded-xl mb-12">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-sans font-semibold text-white mb-1">One month of Sorted Updates included</h4>
                <p className="text-[#737373] text-sm leading-relaxed">
                  Every new site comes with one month of SortedUpdates free. 
                  Unlimited updates via your site&apos;s portal. Change text, swap images, 
                  add pages. Type it and it&apos;s done. Then £59/mo or £19 per update.
                </p>
              </div>
            </div>

            <a
              href="/#get-started"
              className="group inline-flex items-center gap-3 bg-white text-[#0A0A0A] font-semibold text-sm rounded-full px-8 py-4 hover:bg-white/90 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              Get your demo site
              <span className="w-6 h-6 rounded-full bg-[#0A0A0A]/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>
          </div>

          {/* Right column - testimonials */}
          <div className="lg:pt-12">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
              <h3 className="font-sans font-semibold text-white text-lg mb-6">
                What clients say
              </h3>
              <div className="space-y-6">
                {testimonials.map((t, i) => (
                  <div key={i} className="border-l-2 border-white/20 pl-4">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <svg key={j} width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="text-white/60">
                          <path d="M7 0.5L8.5 5.5H13.5L9.5 8.5L11 13.5L7 10.5L3 13.5L4.5 8.5L0.5 5.5H5.5L7 0.5Z"/>
                        </svg>
                      ))}
                    </div>
                    <p className="text-[#A3A3A3] text-sm leading-relaxed mb-2">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">{t.author}</span>
                      <span className="text-[#525252] text-xs">{t.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
