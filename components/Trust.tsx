const points = [
  "No contracts",
  "Price agreed before work starts",
  "No calls unless you want them",
  "Real people throughout",
]

export default function Trust() {
  return (
    <section className="py-32 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

        <div>
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4">
            How we work
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-4xl leading-tight tracking-tight mb-10">
            No contracts.<br/>No surprises.
          </h2>
          <ul className="space-y-0 divide-y divide-black/[0.06]">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-4 py-5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#0A0A0A]">
                  <path d="M3 8.5L6 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-sans font-medium text-[#0A0A0A] text-base">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium">
            Prefer to talk?
          </span>
          <p className="font-sans font-bold text-[#0A0A0A] text-3xl leading-tight tracking-tight">
            Not a fan of forms? <br className="hidden sm:block"/>We get it.
          </p>
          <div className="flex gap-3 pt-2">
            <a
              href="https://wa.me/"
              className="group flex items-center gap-3 font-semibold text-sm text-[#0A0A0A] border border-black/10 rounded-full px-5 py-3 hover:bg-[#0A0A0A] hover:text-white hover:border-transparent transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              WhatsApp us
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
