const features = [
  {
    title: "See it first",
    description: "We build a working mockup of your site in 24 hours. You click through it before committing."
  },
  {
    title: "Pay second",
    description: "No quotes upfront. The price is decided after you see what you're getting, based on your situation."
  },
  {
    title: "Sorted Updates",
    description: "Every site includes one month of unlimited updates. Text changes, new pages, image swaps - handled fast."
  },
]

export default function Services() {
  return (
    <section id="services" className="py-32 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-start gap-16 lg:gap-0">

        <div className="lg:w-64 shrink-0">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4 block">
            How it works
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-4xl leading-tight tracking-tight">
            No risk.<br/>No upfront<br/>cost.
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <ul className="space-y-0 divide-y divide-black/[0.06]">
            {features.map((feature) => (
              <li key={feature.title} className="py-6">
                <span className="font-sans font-semibold text-[#0A0A0A] text-base block mb-1">{feature.title}</span>
                <span className="text-[#737373] text-sm">{feature.description}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col justify-center">
            <p className="font-sans font-extrabold text-[#0A0A0A] text-4xl leading-tight tracking-tight mb-6">
              A faster way to get a website that works.
            </p>
            <p className="text-[#737373] text-base leading-relaxed mb-4">
              We built infrastructure specifically for rapid website production. No meetings, no discovery phases, no bloated proposals.
            </p>
            <p className="text-[#525252] text-base leading-relaxed">
              Just send your current site (or describe what you need). We demonstrate first. You decide second.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
