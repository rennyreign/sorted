const tiers = [
  {
    label: "Quick jobs",
    price: "From £99",
    description: "Small fixes, simple design work",
  },
  {
    label: "One-day jobs",
    price: "From £249",
    description: "Landing pages, ads setup, full design pieces",
    featured: true,
  },
  {
    label: "Starter pack",
    price: "£499",
    description: "One-page website + everything to get online properly",
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 px-6 sm:px-10 lg:px-16 bg-[#0A0A0A]">
      <div className="max-w-[1400px] mx-auto">

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
          <h2 className="font-sans font-extrabold text-white text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-tight max-w-lg">
            Most jobs fall into one of these.
          </h2>
          <p className="text-[#525252] text-base font-medium max-w-xs lg:text-right">
            Clear price before anything starts. No surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
          {tiers.map((tier) => (
            <div
              key={tier.label}
              className={`p-8 lg:p-10 flex flex-col gap-8 ${
                tier.featured ? "bg-white" : "bg-[#111111]"
              }`}
            >
              <span className={`font-mono text-[11px] uppercase tracking-[0.15em] font-medium ${tier.featured ? "text-[#737373]" : "text-[#737373]"}`}>
                {tier.label}
              </span>
              <div>
                <p className={`font-sans font-extrabold text-5xl tracking-tight leading-none mb-3 ${tier.featured ? "text-[#0A0A0A]" : "text-white"}`}>
                  {tier.price}
                </p>
                <p className={`text-sm leading-relaxed ${tier.featured ? "text-[#737373]" : "text-[#525252]"}`}>
                  {tier.description}
                </p>
              </div>
              <a
                href="#get-started"
                className={`mt-auto inline-flex items-center gap-2 text-xs font-semibold rounded-full px-4 py-2 w-fit transition-colors duration-200 ${
                  tier.featured
                    ? "bg-[#0A0A0A] text-white hover:bg-[#2a2a2a]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Get sorted
              </a>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
