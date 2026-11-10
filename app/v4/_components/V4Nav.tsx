"use client"

import { AUTOMATION_NAV } from "@/lib/public-navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RoutineFinderButton } from "../../v2/_components/RoutineFinder"
import s from "../v4.module.css"

export function V4Nav({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname().replace(/\/$/, "").replace(/^\/v4(?=\/|$)/, "/automation")
  const active = (href: string) => pathname === href.split("#")[0]
  const links = AUTOMATION_NAV
  return (
    <header className={`${s.nav} ${overlay ? "" : s.navStatic}`}>
      <Link href="/automation" aria-label="Sorted AI automation" className={s.wordmark}>
        Sorted<i>.</i>
      </Link>
      <nav className={s.navLinks} aria-label="Primary">
        {links.map(([label, href]) => (
          <Link key={label} href={href} aria-current={active(href) ? "page" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      <div className={s.navRight}>
        <RoutineFinderButton
          label="Find Your Leaks"
          variant="secondary"
          className="!h-11 !border-2 !border-[#00271f] !bg-[#fbfbfa] !px-5 !text-[13px] !font-bold !text-[#00271f] max-sm:!hidden"
        />
        <details className={s.mobileMenu}>
          <summary>Menu</summary>
          <div className={s.mobilePanel}>
            {links.map(([label, href]) => (
              <Link key={label} href={href} aria-current={active(href) ? "page" : undefined}>
                {label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </header>
  )
}

