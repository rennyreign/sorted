import type { Metadata } from "next"
import {
  Facebook,
  Instagram,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import Link from "next/link"

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
    <div className="min-h-[100dvh] overflow-x-hidden bg-white text-[#111827]">
      {/* Top contact bar */}
      <div className="bg-[#003384] text-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-2.5 text-xs font-bold sm:px-8 lg:px-12">
          <span>Gracie Barra Halesowen</span>
          <div className="flex items-center gap-4">
            <a href="tel:01212854555" className="hidden items-center gap-2 transition-opacity hover:opacity-80 sm:flex">
              <Phone className="size-4" strokeWidth={2.2} />
              0121 285 4555
            </a>
            <span className="hidden h-4 w-px bg-white/30 sm:block" />
            <span className="flex items-center gap-2" aria-label="Social links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                <Facebook className="size-4" strokeWidth={2.2} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                <Instagram className="size-4" strokeWidth={2.2} />
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/gbhalesowen" aria-label="Gracie Barra Halesowen home">
            <GBLogo />
          </Link>
          <nav className="hidden items-center gap-8 text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-[#002F86] lg:flex">
            {navLinks.map((link) => (
              <Link 
                key={link.label} 
                href={link.href} 
                className="border-b-2 border-transparent py-2 transition-colors hover:border-[#C8102E] hover:text-[#C8102E]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <a
            href="/gbhalesowen#contact"
            className="inline-flex items-center justify-center bg-[#C8102E] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#A90E27] active:translate-y-0"
          >
            Join now
          </a>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-[#002766] text-white">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-10 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr_1fr] lg:px-12">
          <div>
            <GBLogo compact />
            <p className="mt-5 max-w-xs text-sm font-semibold leading-6 text-white/72">
              Jiu-Jitsu for everyone. Classes for beginners, kids, women, competitors and families in Halesowen.
            </p>
            {/* Live Map */}
            <div className="mt-5 aspect-video w-full max-w-[280px] overflow-hidden rounded-lg border border-white/20">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2431.788768483836!2d-2.050832923465558!3d52.45081337204049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4870989a5c8c3c2f%3A0x5d2e2a33c5b2e1a0!2sGracie%20Barra%20Halesowen!5e0!3m2!1sen!2suk!4v1704067200000!5m2!1sen!2suk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Gracie Barra Halesowen Location"
              />
            </div>
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
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="grid size-10 place-items-center rounded-full bg-white text-[#002766] transition-transform hover:scale-110" 
                aria-label="Facebook"
              >
                <Facebook className="size-5" strokeWidth={2.1} />
              </a>
              <a 
                href="https://instagram.com" 
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
