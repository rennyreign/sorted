
export default function Pricing() {
  return (
    <section id="pricing" className="py-32 px-6 sm:px-10 lg:px-16 bg-[#0A0A0A]">
      <div className="max-w-[1400px] mx-auto">

        <div className="max-w-3xl">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#737373] font-medium mb-6">
            Pricing
          </span>
          <h2 className="font-sans font-extrabold text-white text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-tight mb-10">
            No quotes upfront.
            <br />
            <span className="text-[#525252]">Build first, price second.</span>
          </h2>

          <div className="space-y-6 text-[#A3A3A3] text-lg leading-relaxed max-w-2xl mb-12">
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

          <div className="flex items-start gap-4 p-6 bg-white/[0.03] border border-white/[0.08] rounded-xl max-w-2xl mb-12">
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

      </div>
    </section>
  )
}
