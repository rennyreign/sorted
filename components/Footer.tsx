import Logo from "@/components/Logo"

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] px-6 sm:px-10 lg:px-16 pt-24 pb-10">
      <div className="max-w-[1400px] mx-auto">

        <div className="mb-16">
          <p className="font-sans font-extrabold text-white text-[clamp(2.5rem,7vw,6rem)] leading-[0.9] tracking-tight mb-10">
            Just tell us<br/>what you need.
          </p>
          <a
            href="#get-started"
            className="group inline-flex items-center gap-3 bg-white text-[#0A0A0A] font-semibold text-sm rounded-full px-6 py-3.5 hover:bg-white/90 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            Get started
            <span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </a>
        </div>

        <div className="border-t border-white/[0.08] pt-8 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <span className="text-white"><Logo size={28} /></span>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-[#525252] hover:text-[#A3A3A3] transition-colors font-medium">Privacy</a>
            <a href="#" className="text-xs text-[#525252] hover:text-[#A3A3A3] transition-colors font-medium">Terms</a>
            <p className="text-xs text-[#525252] font-medium">
              © {new Date().getFullYear()} <span className="font-extrabold tracking-tight">Sorted.</span>
            </p>
          </div>
        </div>

      </div>
    </footer>
  )
}
