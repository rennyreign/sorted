import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import PageTransition from "@/components/PageTransition"

export default function HomePage() {
  return (
    <PageTransition>
      <Nav />
      <main>
        {/* Hero Section */}
        <section className="min-h-[100dvh] flex flex-col justify-end pb-16 px-6 sm:px-10 lg:px-16 pt-32 max-w-[1400px] mx-auto">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/20 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[#404040] font-medium">
              Client Tagline
            </span>
          </div>

          <h1 className="font-sans font-extrabold text-[#0A0A0A] text-[clamp(3.5rem,10vw,9rem)] leading-[0.92] tracking-[-0.03em] mb-10 max-w-5xl">
            Main headline
            <br />
            <span className="text-[#525252]">for this client.</span>
          </h1>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-t border-black/10 pt-8">
            <p className="text-[#525252] text-lg font-medium leading-relaxed max-w-md">
              Update this subheadline with the client&apos;s value proposition.
            </p>

            <a
              href="#contact"
              className="group inline-flex items-center gap-3 bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-full px-6 py-3.5 hover:bg-[#2a2a2a] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              Call to action
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>
          </div>
        </section>

        {/* Starter Section */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <div className="max-w-2xl">
            <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
              Section Label
            </span>
            <h2 className="font-sans font-extrabold text-[#0A0A0A] text-4xl leading-tight tracking-tight mb-6">
              Add client-specific sections here.
            </h2>
            <p className="text-[#525252] text-base leading-relaxed">
              This is a starter template. Customize it by updating the client brief 
              in <code className="font-mono text-sm bg-black/5 px-1.5 py-0.5 rounded">client/brief.md</code> and 
              building out the specific pages and components this client needs.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  )
}
