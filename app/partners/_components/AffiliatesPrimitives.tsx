import type { ReactNode } from "react"
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
  active?: "home" | "what-you-earn" | "selling-sorted" | "enterprise" | "apply" | "login"
  showLogin?: boolean
}) {
  const links: [string, string, string][] = [
    ["home", "Home", "/partners"],
    ["what-you-earn", "What you earn", "/partners/what-you-earn"],
    ["selling-sorted", "Selling Sorted", "/partners/selling-sorted"],
    ["enterprise", "Enterprise", "/partners/enterprise"],
  ]
  const isEnterprise = active === "enterprise"
  const headerCtaHref = "/partners/apply"
  const headerCtaText = "Become a partner"

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-transparent bg-transparent px-3 py-4 transition-colors duration-200 min-[360px]:px-4 sm:px-8">
      <div className="relative mx-auto flex w-full max-w-[1220px] items-center justify-between gap-2">
        <a
          href="/partners"
          className="flex shrink-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-2"
          aria-label="Sorted Partners Portal home"
        >
          <span className="text-[29px] font-black leading-none tracking-[-0.045em] text-[#070707] sm:text-[32px]">
            Sorted<span className="text-[#cfe900]">.</span>
          </span>
          <span className="hidden text-[11px] font-black uppercase tracking-[0.12em] text-black/65 sm:inline">Partners</span>
        </a>
        <nav className="hidden items-center gap-6 text-[12px] font-extrabold tracking-[-0.02em] lg:absolute lg:left-1/2 lg:top-1/2 lg:flex lg:-translate-x-1/2 lg:-translate-y-1/2 xl:gap-8">
          {links.map(([key, label, href]) => (
            <a key={key} href={href} className="relative py-2 transition-colors hover:text-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-2">
              {label}
              {active === key ? <span className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full bg-[#dfff00]" /> : null}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <details className="relative lg:hidden">
            <summary className="inline-flex h-11 cursor-pointer list-none items-center justify-center rounded-full border border-black/15 px-2.5 text-[11px] font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <nav
              aria-label="Partner pages"
              className="fixed left-3 right-3 top-[72px] border border-black bg-[#fbfbfa] p-2 shadow-[0_18px_44px_rgba(0,0,0,0.16)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-56"
            >
              {links.map(([key, label, href]) => (
                <a
                  key={key}
                  href={href}
                  aria-current={active === key ? "page" : undefined}
                  className={`flex min-h-11 items-center justify-between px-3 text-[12px] font-black transition-colors hover:bg-[#f7f1e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black ${active === key ? "bg-[#dfff00]" : ""}`}
                >
                  {label}
                </a>
              ))}
            </nav>
          </details>
          {showLogin ? (
            <a
              href="/partners/login"
              className="hidden h-11 items-center gap-2 rounded-full border border-black/15 px-5 text-[11px] font-black transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-2 md:inline-flex"
            >
              Partner login
            </a>
          ) : null}
          <a
            href={headerCtaHref}
            data-track="cta_click"
            data-cta-text={headerCtaText}
            data-cta-location={isEnterprise ? "enterprise_header" : "header"}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#070707] px-3.5 text-[11px] font-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-2 sm:px-5"
          >
            <span className="min-[400px]:hidden">Join</span>
            <span className="hidden min-[400px]:inline">Become a partner</span>
          </a>
        </div>
      </div>
    </header>
  )
}

export function AffiliatesFooter({ variant = "default" }: { variant?: "default" | "enterprise" } = {}) {
  const isEnterprise = variant === "enterprise"
  const partnerLinks: [string, string][] = isEnterprise
    ? [
        ["Home", "/partners"],
        ["Enterprise", "/partners/enterprise"],
        ["Standard partner options", "/partners/what-you-earn"],
        ["Selling Sorted", "/partners/selling-sorted"],
        ["Partner login", "/partners/login"],
      ]
    : [
        ["Home", "/partners"],
        ["What you earn", "/partners/what-you-earn"],
        ["Selling Sorted", "/partners/selling-sorted"],
        ["Enterprise", "/partners/enterprise"],
        ["Apply", "/partners/apply"],
        ["Login", "/partners/login"],
      ]

  return (
    <footer className="bg-[#070707] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto grid max-w-[1220px] gap-8 md:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
        <div>
          <span className="text-[32px] font-black leading-none tracking-[-0.045em] text-white">
            Sorted<span className="text-[#cfe900]">.</span>
          </span>
          <p className="mt-4 max-w-[260px] text-[13px] font-semibold leading-[1.4] text-white/80">
            {isEnterprise
              ? "Website infrastructure for organisations supporting a recurring pipeline of businesses."
              : "Earn £75–£300 for every business you refer that gets a Sorted website."}
          </p>
          <p className="mt-7 text-[11px] font-medium text-white/60">© 2026 Sorted Sites.</p>
        </div>
        <FooterLinks title="Partners" links={partnerLinks} />
        <FooterLinks
          title="Sorted Sites"
          links={[
            ["Our product", "/"],
            ["Pricing", "/sites/pricing"],
            ["Examples", "/sites/examples"],
          ]}
        />
        <div>
          <p className="mb-4 text-[12px] font-black">{isEnterprise ? "Ready to partner?" : "Questions?"}</p>
          <a
            href={isEnterprise ? "/partners/apply" : "mailto:hello@sortmydigital.site"}
            data-track={isEnterprise ? "cta_click" : undefined}
            data-cta-text={isEnterprise ? "Become a partner" : undefined}
            data-cta-location={isEnterprise ? "enterprise_footer" : undefined}
            className="text-[12px] font-semibold text-white/82 transition-colors hover:text-[#dfff00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff00] focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          >
            {isEnterprise ? "Become a partner" : "hello@sortmydigital.site"}
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
      {kicker ? <p className="mb-5 text-[12px] font-black text-black/65">{kicker}</p> : null}
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
  track,
  ctaText,
  ctaLocation,
}: {
  children: ReactNode
  href?: string
  onClick?: () => void
  type?: "button" | "submit"
  className?: string
  disabled?: boolean
  track?: string
  ctaText?: string
  ctaLocation?: string
}) {
  const cls = `inline-flex items-center justify-center gap-3 rounded-full bg-[#070707] px-7 text-[12px] font-black text-white shadow-[0_18px_36px_rgba(0,0,0,0.16)] transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 h-[52px] ${className}`
  const trackProps = track
    ? { "data-track": track, "data-cta-text": ctaText, "data-cta-location": ctaLocation }
    : {}
  if (href) {
    return (
      <a href={href} className={cls} {...trackProps}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} {...trackProps}>
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
