const steps = [
  {
    number: "01",
    title: "Tell us what you need",
    body: "A sentence is enough. No brief, no calls. Plain English works fine.",
  },
  {
    number: "02",
    title: "We price it the same day",
    body: "You get a clear number before anything starts. No hidden extras.",
  },
  {
    number: "03",
    title: "Done in 24–48 hours",
    body: "You'll have something to review quickly. Rarely longer.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-start gap-16 lg:gap-0">

        <div className="lg:w-64 shrink-0">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4 block">
            How it works
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-4xl leading-tight tracking-tight">
            Three steps.<br/>That&apos;s it.
          </h2>
        </div>

        <div className="flex-1 flex flex-col gap-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-6">
            {steps.map((step) => (
              <div key={step.number}>
                <span className="block font-mono text-[11px] text-[#A3A3A3] mb-6 tabular-nums">
                  {step.number}
                </span>
                <h3 className="font-sans font-bold text-[#0A0A0A] text-xl leading-snug tracking-tight mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#737373] leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-[#0A0A0A] p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row sm:items-start gap-8">
              <div className="flex-1">
                <span className="inline-block font-mono text-[10px] uppercase tracking-[0.15em] text-[#525252] font-medium mb-4">
                  Our guarantee
                </span>
                <h3 className="font-sans font-extrabold text-white text-2xl leading-tight tracking-tight mb-3">
                  You get 3 versions. If we still can&apos;t nail it, full refund.
                </h3>
                <p className="text-[#737373] text-sm leading-relaxed max-w-xl">
                  We&apos;ll give you up to 3 rounds of the work. If after that we genuinely can&apos;t agree on something you&apos;re happy with, we&apos;ll give you your money back and part ways, no hard feelings. At these prices, we can&apos;t do open-ended revisions. But we&apos;re not in the business of taking money for work you don&apos;t want either.
                </p>
              </div>
              <div className="shrink-0 flex flex-col gap-3 sm:text-right">
                {["3 versions included", "Full refund if not right", "No questions asked"].map((point) => (
                  <div key={point} className="flex sm:justify-end items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-white/40">
                      <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-mono text-[11px] text-white/50 whitespace-nowrap">{point}</span>
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
