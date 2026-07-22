import type { ReactNode } from "react"
import Image from "next/image"
import localFont from "next/font/local"

// ─── Design tokens (Sorted Sites brand) ───────────────────────────────────────
// Self-contained copy of the Sorted Sites design system so the partner
// portal builds independently of the (still in-flight) app/sites surface.
// When app/sites lands on main, these can be consolidated.

export const accent = "#dfff00"
export const ink = "#070707"
export const paper = "#fbfbfa"
export const cream = "#f7f1e8"

// Fonts live in public/fonts/ (shared with Sorted Sites). localFont will
// resolve them at build time; the affiliate branch merges after the Sorted
// Sites work commits those files.
export const affMarker = localFont({
  src: "../../../public/fonts/cc-ask-for-mercy.ttf",
  variable: "--font-aff-marker",
  display: "swap",
})

export const affHighlight = localFont({
  src: "../../../public/fonts/Sans-Andreas-Bold-Demo.ttf",
  variable: "--font-aff-highlight",
  display: "swap",
})

export function AffiliatesPage({ children }: { children: ReactNode }) {
  return (
    <main
      className={`${affMarker.variable} ${affHighlight.variable} affiliates-shell min-h-screen bg-[#fbfbfa] pt-[76px] text-[#070707]`}
    >
      {children}
    </main>
  )
}

export function AffiliatesHeader({
  active,
  showLogin = true,
}: {
  active?: "about" | "how" | "rates" | "apply" | "login"
  showLogin?: boolean
}) {
  const links: [string, string, string][] = [
    ["how", "How it works", "/affiliates"],
    ["rates", "What you earn", "/affiliates#rates"],
    ["about", "About the scheme", "/affiliates#about"],
  ]
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-transparent bg-transparent px-5 py-4 transition-colors duration-200 sm:px-8">
      <div className="mx-auto flex w-full max-w-[1220px] items-center justify-between">
        <a href="/affiliates" className="flex items-center gap-3 shrink-0" aria-label="Sorted Partners Portal home">
          <Image src="/sorted-sites/sorted-sites-logo.png" alt="Sorted.sites" width={140} height={36} className="h-[28px] w-auto" priority />
          <span className="text-[11px] font-black uppercase tracking-[0.12em] text-black/55">Partners</span>
        </a>
        <nav className="hidden items-center gap-8 text-[12px] font-extrabold tracking-[-0.02em] md:flex">
          {links.map(([key, label, href]) => (
            <a key={key} href={href} className="relative py-2">
              {label}
              {active === key ? <span className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full bg-[#dfff00]" /> : null}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {showLogin ? (
            <a
              href="/affiliates/login"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-black/15 px-5 text-[11px] font-black transition-transform duration-200 hover:-translate-y-0.5"
            >
              Partner login
            </a>
          ) : null}
          <a
            href="/affiliates/apply"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#070707] px-5 text-[11px] font-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            Become a partner
          </a>
        </div>
      </div>
    </header>
  )
}

export function AffiliatesFooter() {
  return (
    <footer className="bg-[#070707] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto grid max-w-[1220px] gap-8 md:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
        <div>
          <Image src="/sorted-sites/sorted-sites-logo-white.png" alt="Sorted.sites" width={140} height={36} className="h-[28px] w-auto" />
          <p className="mt-4 max-w-[240px] text-[13px] font-semibold leading-[1.4] text-white/80">
            Earn £75–£300 for every business you refer that gets a Sorted website.
          </p>
          <p className="mt-7 text-[11px] font-medium text-white/50">© 2026 Sorted Sites.</p>
        </div>
        <FooterLinks
          title="Partners"
          links={[
            ["How it works", "/affiliates"],
            ["What you earn", "/affiliates#rates"],
            ["Apply", "/affiliates/apply"],
            ["Login", "/affiliates/login"],
          ]}
        />
        <FooterLinks
          title="Sorted Sites"
          links={[
            ["Our product", "/sites"],
            ["Pricing", "/sites/pricing"],
            ["Examples", "/sites/examples"],
          ]}
        />
        <div>
          <p className="mb-4 text-[12px] font-black">Questions?</p>
          <a href="mailto:hello@sortmydigital.site" className="text-[12px] font-semibold text-white/82 hover:text-[#dfff00]">
            hello@sortmydigital.site
          </a>
        </div>
      </div>
    </footer>
  )
}

function FooterLinks({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-4 text-[12px] font-black">{title}</p>
      <ul className="space-y-3 text-[12px] font-semibold text-white/82">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="transition-colors hover:text-[#dfff00]">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Underline({ className = "" }: { className?: string }) {
  return <span className={`block h-[5px] rounded-full bg-[#dfff00] ${className}`} />
}

export function SectionTitle({
  kicker,
  title,
  marker,
  className = "",
}: {
  kicker?: string
  title: ReactNode
  marker?: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      {kicker ? <p className="mb-5 text-[12px] font-black text-black/45">{kicker}</p> : null}
      <h2 className="text-[clamp(2.4rem,4.6vw,4.4rem)] font-black leading-[0.95] tracking-[-0.04em]">{title}</h2>
      {marker ? (
        <div className="mt-1 [font-family:var(--font-aff-highlight)] text-[clamp(2.2rem,4.2vw,4rem)] font-normal leading-[0.9] tracking-[-0.02em] text-[#d4ea00]">
          {marker}
        </div>
      ) : null}
    </div>
  )
}

// Shared button styles used across the Sorted Partners Portal.
export function PrimaryButton({
  children,
  href,
  onClick,
  type = "button",
  className = "",
  disabled,
}: {
  children: ReactNode
  href?: string
  onClick?: () => void
  type?: "button" | "submit"
  className?: string
  disabled?: boolean
}) {
  const cls = `inline-flex items-center justify-center gap-3 rounded-full bg-[#070707] px-7 text-[12px] font-black text-white shadow-[0_18px_36px_rgba(0,0,0,0.16)] transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 h-[52px] ${className}`
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  )
}

export function GhostButton({
  children,
  href,
  onClick,
  type = "button",
  className = "",
  disabled,
}: {
  children: ReactNode
  href?: string
  onClick?: () => void
  type?: "button" | "submit"
  className?: string
  disabled?: boolean
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full border border-black/15 px-5 text-[11px] font-black transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 h-11 ${className}`
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  )
}
