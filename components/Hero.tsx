export default function Hero() {
  return (
    <section className="min-h-[100dvh] flex flex-col justify-end pb-16 px-6 sm:px-10 lg:px-16 pt-32 max-w-[1400px] mx-auto">

      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-black/20 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[#404040] font-medium">
          Digital production
        </span>
      </div>

      <h1 className="font-sans font-extrabold text-[#0A0A0A] text-[clamp(2.5rem,10vw,9rem)] leading-[0.92] tracking-[-0.03em] mb-10 max-w-5xl">
        Whatever you need online.
        <br />
        <span className="text-[#525252]">Sorted.</span>
      </h1>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-t border-black/10 pt-8">
        <p className="text-[#525252] text-lg font-medium leading-relaxed max-w-md">
          Websites, design, ads and digital fixes for businesses – priced today, built in 48 hours.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <a
            href="#get-started"
            className="group inline-flex items-center gap-3 bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-full px-6 py-3.5 hover:bg-[#2a2a2a] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            Tell us what you need
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </a>
          <span className="text-sm text-[#A3A3A3] font-medium">
            Priced the same day
          </span>
        </div>
      </div>

    </section>
  )
}
