const pillars = [
  {
    title: "Build trust",
    items: ["Website", "Reviews", "Brand"],
    description: "Look credible, professional, and easy to find.",
  },
  {
    title: "Handle enquiries",
    items: ["Forms", "CRM", "Follow-up"],
    description: "Make it simple for interested customers to get in touch.",
  },
  {
    title: "Grow customers",
    items: ["Promotions", "Referrals", "Reactivation"],
    description: "Turn existing relationships into repeat revenue.",
  },
]

export default function Services() {
  return (
    <section id="services" className="py-32 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-start gap-16 lg:gap-0">

        <div className="lg:w-64 shrink-0">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4 block">
            What every business needs now
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-4xl leading-tight tracking-tight mb-6">
            Three outcomes.<br/>One starting point.
          </h2>
          <p className="text-[#737373] text-base leading-relaxed">
            Whether you fix boilers, cut hair, serve food, or run a clinic, the decision starts the same way: do they trust you?
          </p>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white border border-black/[0.08] rounded-xl p-6"
              >
                <span className="block font-mono text-[11px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">
                  {pillar.title}
                </span>
                <ul className="space-y-2 mb-4">
                  {pillar.items.map((item) => (
                    <li key={item} className="font-sans font-semibold text-[#0A0A0A] text-base">
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-[#737373] text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-20 pt-12 border-t border-black/[0.06] max-w-2xl">
        <p className="font-sans font-extrabold text-[#0A0A0A] text-2xl leading-tight tracking-tight mb-4">
          Your website is the first doorway.
        </p>
        <p className="text-[#737373] text-base leading-relaxed">
          It is the first impression, the trust signal, and the lead capture mechanism. We redesign it first, free, so you can see what trust looks like for your business. Then we build the rest.
        </p>
      </div>
    </section>
  )
}
