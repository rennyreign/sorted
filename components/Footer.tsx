export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] px-6 sm:px-10 lg:px-16 pt-24 pb-10">
      <div className="max-w-[1400px] mx-auto">

        <div className="mb-16">
          <p className="font-sans font-extrabold text-white text-[clamp(2.5rem,7vw,6rem)] leading-[0.9] tracking-tight mb-10">
            Your new website<br/>starts here.
          </p>
          <a
            href="#get-started"
            className="group inline-flex items-center gap-3 bg-white text-[#0A0A0A] font-semibold text-sm rounded-full px-6 py-3.5 hover:bg-white/90 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            Get sorted
            <span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </a>
        </div>

        <div className="border-t border-white/[0.08] pt-8 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <span className="font-sans font-extrabold text-white text-xl tracking-tight">Sorted.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-[#525252] hover:text-[#A3A3A3] transition-colors font-medium">Privacy</a>
            <a href="#" className="text-xs text-[#525252] hover:text-[#A3A3A3] transition-colors font-medium">Terms</a>
            <a href="https://wa.me/447386468085" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#525252] hover:text-[#A3A3A3] transition-colors font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              07386 468085
            </a>
            <p className="text-xs text-[#525252] font-medium">
              © {new Date().getFullYear()} <span className="font-extrabold tracking-tight">Sorted.</span>
            </p>
          </div>
        </div>
        <p className="text-xs text-[#3A3A3A] font-medium mt-4">
          Sorted Websites
        </p>

      </div>
    </footer>
  )
}
