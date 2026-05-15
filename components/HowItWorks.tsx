const steps = [
  {
    number: "01",
    title: "We mock up",
    body: "Give us your URL. We'll design something better. 48 hours, free. No commitment.",
  },
  {
    number: "02",
    title: "We build it",
    body: "Like the mockup? We'll build the full site. Still no payment until you approve.",
  },
  {
    number: "03",
    title: "We agree on price",
    body: "Price comes after you see it. Based on what we built, not what we guessed.",
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

        <div className="flex-1">
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
        </div>

      </div>
    </section>
  )
}
