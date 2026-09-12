"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Image as ImageIcon, Send, BarChart3, Settings, Bell } from "lucide-react"

const navItems = [
  { href: "/ads/", label: "Campaigns", icon: LayoutGrid },
  { href: "/ads/assets/", label: "Assets", icon: ImageIcon },
  { href: "/ads/publishing/", label: "Publishing", icon: Send },
  { href: "/ads/results/", label: "Results", icon: BarChart3 },
  { href: "/ads/settings/", label: "Settings", icon: Settings },
]

export function TopNav() {
  const pathname = usePathname()
  return (
    <header className="ads-topnav">
      <div className="ads-topnav-inner">
        <div className="ads-topnav-left">
          <Link href="/ads/" className="ads-topnav-logo">
            Sorted<span>.</span>
          </Link>
          <nav className="ads-topnav-nav">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/ads/" && pathname.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`ads-topnav-link ${active ? "active" : ""}`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="ads-topnav-right">
          <button className="ads-topnav-icon" aria-label="Notifications">
            <Bell size={20} strokeWidth={1.75} />
          </button>
          <div className="ads-topnav-avatar">RE</div>
        </div>
      </div>
    </header>
  )
}
