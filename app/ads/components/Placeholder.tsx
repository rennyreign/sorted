"use client"

import { Construction } from "lucide-react"

export default function PlaceholderPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="ads-content">
      <div className="ads-empty">
        <Construction size={48} strokeWidth={1} style={{ color: "var(--ads-text-subtle)", marginBottom: 16 }} />
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}
