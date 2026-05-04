const services = [
  "Simple websites",
  "Landing pages",
  "Logo & brand design",
  "Flyers, menus, social posts",
  "Google profile setup",
  "Facebook & Instagram ads",
  "TikTok ad creative",
  "Chat agents for your site",
  "Fixes and edits",
]

export default function Services() {
  return (
    <section id="services" className="py-32 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-start gap-16 lg:gap-0">

        <div className="lg:w-64 shrink-0">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4 block">
            What we do
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-4xl leading-tight tracking-tight">
            Everything<br/>you need<br/>online.
          </h2>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <ul className="space-y-0 divide-y divide-black/[0.06]">
            {services.map((service) => (
              <li key={service} className="flex items-center justify-between py-4 group">
                <span className="font-sans font-medium text-[#0A0A0A] text-base">{service}</span>
                <svg className="w-4 h-4 text-[#D4D4D4] group-hover:text-[#0A0A0A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </li>
            ))}
          </ul>

          <div className="flex flex-col justify-center">
            <p className="font-sans font-extrabold text-[#0A0A0A] text-4xl leading-tight tracking-tight mb-6">
              Good work doesn&apos;t need to cost agency money anymore.
            </p>
            <p className="text-[#737373] text-base leading-relaxed">
              We use a faster production model to deliver professional digital work at prices that make sense for small businesses.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
