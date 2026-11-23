import Link from "next/link"
import { Phone } from "lucide-react"

export function AssistantsHeader() {
  return (
    <header className="mx-auto flex max-w-[1280px] items-center justify-between gap-5 px-6 py-6 sm:px-10">
      <Link href="/" aria-label="Sorted home" className="text-[40px] font-black leading-none tracking-[-0.045em]">Sorted<span className="text-[#cfe900]">.</span></Link>
      <nav aria-label="Primary" className="flex items-center gap-5 text-[14px] font-semibold sm:gap-8">
        <Link href="/" className="hidden underline-offset-8 hover:underline focus-visible:underline sm:block">AI assistants</Link>
        <Link href="/assistants/pricing" className="hidden underline-offset-8 hover:underline focus-visible:underline sm:block">Pricing</Link>
        <Link href="/assistants/about" className="hidden underline-offset-8 hover:underline focus-visible:underline sm:block">About</Link>
        <Link href="/services" className="hidden -rotate-1 rounded-sm bg-[#e4ff29] px-2 py-0.5 font-black underline-offset-8 transition-colors hover:bg-black hover:text-[#e4ff29] sm:block">What else we do</Link>
        <a href="https://wa.me/447386468085" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#00271f] px-4 text-[13px] transition-colors hover:bg-[#00271f] hover:text-white"><Phone size={15} />Let&apos;s talk</a>
      </nav>
    </header>
  )
}
