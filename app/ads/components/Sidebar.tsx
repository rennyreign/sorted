"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Image as ImageIcon, Send, BarChart3, Settings, Sparkles } from "lucide-react"

const navItems = [
  { href: "/ads/", label: "Campaigns", icon: LayoutGrid },
  { href: "/ads/assets/", label: "Assets", icon: ImageIcon },
  { href: "/ads/publishing/", label: "Publishing", icon: Send },
  { href: "/ads/results/", label: "Results", icon: BarChart3 },
  { href: "/ads/settings/", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="ads-sidebar">
      <div className="ads-sidebar-logo">
        Sorted<span>.</span>
      </div>
      <nav className="ads-nav">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/ads/" && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`ads-nav-item ${active ? "active" : ""}`}
            >
              <Icon size={20} strokeWidth={1.75} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="ads-sidebar-support">
        <strong>Need a hand?</strong>
        Sorted handles the ad setup for you. Get in touch for help with campaigns, creatives or publishing.
      </div>
    </aside>
  )
}
