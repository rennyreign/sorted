import type { Metadata } from "next"
import {
  Facebook,
  Instagram,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import Link from "next/link"
import { MobileHeader } from "./components/MobileHeader"

const navy = "#002F86"
const deepNavy = "#001D58"
const red = "#C8102E"

export const metadata: Metadata = {
  title: "Gracie Barra Halesowen | Brazilian Jiu-Jitsu Classes",
  description:
    "Brazilian Jiu-Jitsu classes for beginners, kids, women and competitors in Halesowen. Book a free intro class with Gracie Barra Halesowen.",
  icons: {
    icon: "/gbhalesowen/gbhalesowen-logo.png",
    shortcut: "/gbhalesowen/gbhalesowen-logo.png",
    apple: "/gbhalesowen/gbhalesowen-logo.png",
  },
  openGraph: {
    title: "Gracie Barra Halesowen",
    description:
      "Supportive Brazilian Jiu-Jitsu classes for confidence, fitness, self-defence and community in Halesowen.",
    locale: "en_GB",
  },
}

const navLinks = [
  { label: "Home", href: "/gbhalesowen" },
  { label: "Programs", href: "/gbhalesowen/programs" },
  { label: "Timetable", href: "/gbhalesowen/timetable" },
  { label: "About", href: "/gbhalesowen/about" },
  { label: "Gallery", href: "/gbhalesowen/gallery" },
  { label: "Contact", href: "/gbhalesowen#contact" },
]

function GBLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/gbhalesowen/gbhalesowen-logo.png"
        alt="Gracie Barra Halesowen"
        className="size-14 shrink-0 rounded-full border-[3px] border-[#D9DDE7] bg-white object-cover shadow-[0_12px_30px_rgba(0,47,134,0.16)]"
      />
      {!compact && (
        <div className="leading-none">
          <p className="text-[1.05rem] font-extrabold uppercase tracking-tight text-[#C8102E]">
            Gracie Barra
          </p>
          <p className="text-[0.95rem] font-extrabold uppercase tracking-[0.04em] text-[#111827]">
            Halesowen
          </p>
        </div>
      )}
    </div>
  )
}

export default function GBLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] bg-white text-[#111827]">
      {/* Fixed Contact Bar */}
      <div className="fixed left-0 right-0 top-0 z-50 bg-[#003384] text-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-2.5 text-xs font-bold sm:px-8 lg:px-12">
          <span>Gracie Barra Halesowen</span>
          <div className="flex items-center gap-4">
            <a href="tel:01212854555" className="hidden items-center gap-2 transition-opacity hover:opacity-80 sm:flex">
              <Phone className="size-4" strokeWidth={2.2} />
              0121 285 4555
            </a>
            <span className="hidden h-4 w-px bg-white/30 sm:block" />
            <span className="flex items-center gap-2" aria-label="Social links">
              <a href="https://www.facebook.com/GracieBarraHalesowen/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                <Facebook className="size-4" strokeWidth={2.2} />
              </a>
              <a href="https://www.instagram.com/graciebarrahalesowen/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                <Instagram className="size-4" strokeWidth={2.2} />
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* Fixed Navigation */}
      <MobileHeader />

      {/* Main content - padded for both fixed bars */}
      <main className="animate-fade-in pt-[114px]">{children}</main>

      {/* Footer */}
      <footer className="bg-[#002766] text-white">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-10 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr_1fr] lg:px-12">
          <div>
            <GBLogo compact />
            <p className="mt-5 max-w-xs text-sm font-semibold leading-6 text-white/72">
              Jiu-Jitsu for everyone. Classes for beginners, kids, women, competitors and families in Halesowen.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/58">Quick links</h3>
            <div className="mt-4 grid gap-2 text-sm font-semibold text-white/78">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/58">Programs</h3>
            <div className="mt-4 grid gap-2 text-sm font-semibold text-white/78">
              <Link href="/gbhalesowen/programs/fundamentals" className="transition-colors hover:text-white">Fundamentals</Link>
              <Link href="/gbhalesowen/programs/advanced" className="transition-colors hover:text-white">Advanced</Link>
              <Link href="/gbhalesowen/programs/kids" className="transition-colors hover:text-white">Kids Classes</Link>
              <Link href="/gbhalesowen/programs/female" className="transition-colors hover:text-white">Female Training</Link>
              <Link href="/gbhalesowen/programs/fitness" className="transition-colors hover:text-white">Barbell / Fitness</Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/58">Stay connected</h3>
            <p className="mt-4 text-sm font-semibold leading-6 text-white/76">
              Follow for updates, tips and academy news.
            </p>
            <div className="mt-5 flex gap-3">
              <a 
                href="https://www.facebook.com/GracieBarraHalesowen/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="grid size-10 place-items-center rounded-full bg-white text-[#002766] transition-transform hover:scale-110" 
                aria-label="Facebook"
              >
                <Facebook className="size-5" strokeWidth={2.1} />
              </a>
              <a 
                href="https://www.instagram.com/graciebarrahalesowen/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="grid size-10 place-items-center rounded-full bg-white text-[#002766] transition-transform hover:scale-110" 
                aria-label="Instagram"
              >
                <Instagram className="size-5" strokeWidth={2.1} />
              </a>
            </div>
            <div className="mt-5 text-sm">
              <p className="font-semibold">0121 285 4555</p>
              <p className="text-white/60">info@graciebarrahalesowen.com</p>
            </div>
          </div>
        </div>
        <div className="bg-[#C8102E] px-5 py-4 text-xs font-semibold text-white/88 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; 2026 Gracie Barra Halesowen. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/gbhalesowen/terms" className="hover:text-white">Terms & Conditions</Link>
              <Link href="/gbhalesowen/privacy" className="hover:text-white">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
