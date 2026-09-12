"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Image as ImageIcon, Send, BarChart3, Settings, Bell, ChevronDown, Check } from "lucide-react"
import { useTenant } from "./TenantContext"

const navItems = [
  { href: "/ads/", label: "Campaigns", icon: LayoutGrid },
  { href: "/ads/assets/", label: "Assets", icon: ImageIcon },
  { href: "/ads/publishing/", label: "Publishing", icon: Send },
  { href: "/ads/results/", label: "Results", icon: BarChart3 },
  { href: "/ads/settings/", label: "Settings", icon: Settings },
]

export function TopNav() {
  const pathname = usePathname()
  const { tenant, setTenant, tenants } = useTenant()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentTenant = tenants.find((t) => t.slug === tenant) || tenants[0]

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <header className="ads-topnav">
      <div className="ads-topnav-inner">
        <div className="ads-topnav-left">
          <Link href="/ads/" className="ads-topnav-logo">
            Sorted<span>.</span>
          </Link>

          {/* Account selector */}
          <div className="ads-account-selector" ref={dropdownRef}>
            <button className="ads-account-selector-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <span className="ads-account-selector-name">{currentTenant.name}</span>
              <ChevronDown size={14} strokeWidth={2} className={`ads-account-selector-chevron ${dropdownOpen ? "open" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="ads-account-selector-dropdown">
                {tenants.map((t) => (
                  <button
                    key={t.slug}
                    className={`ads-account-selector-item ${t.slug === tenant ? "active" : ""}`}
                    onClick={() => { setTenant(t.slug); setDropdownOpen(false) }}
                  >
                    <div className="ads-account-selector-item-info">
                      <span className="ads-account-selector-item-name">{t.name}</span>
                      <span className="ads-account-selector-item-slug">{t.slug}</span>
                    </div>
                    {t.slug === tenant && <Check size={14} strokeWidth={2} />}
                  </button>
                ))}
              </div>
            )}
          </div>

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
