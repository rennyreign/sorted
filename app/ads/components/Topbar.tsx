"use client"

import { Bell, Search } from "lucide-react"

export function Topbar() {
  return (
    <header className="ads-topbar">
      <div className="ads-topbar-left">
        <button className="ads-workspace-selector">
          School of Skill
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
      <div className="ads-topbar-right">
        <button className="ads-icon-btn" aria-label="Search">
          <Search size={20} strokeWidth={1.75} />
        </button>
        <button className="ads-icon-btn" aria-label="Notifications">
          <Bell size={20} strokeWidth={1.75} />
        </button>
        <div className="ads-avatar">RE</div>
      </div>
    </header>
  )
}
