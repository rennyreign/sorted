"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Bell } from "lucide-react"
import { affiliateDb, type AffiliateNotification } from "@/lib/affiliateClient"

export function NotificationsBell({ affiliateId }: { affiliateId: string }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AffiliateNotification[]>([])
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const { data, error } = await affiliateDb
      .from("affiliate_notifications")
      .select("*")
      .eq("affiliate_id", affiliateId)
      .order("created_at", { ascending: false })
      .limit(20)

    if (!error && data) setItems(data as AffiliateNotification[])
    setLoading(false)
  }, [affiliateId])

  useEffect(() => {
    load()
    // Poll every 30s for new notifications. Lightweight, no realtime needed.
    const t = window.setInterval(load, 30_000)
    return () => window.clearInterval(t)
  }, [load])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [open])

  const unread = items.filter((n) => !n.read_at)

  async function markAllRead() {
    if (unread.length === 0) return
    const now = new Date().toISOString()
    // Optimistic update
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })))
    await affiliateDb
      .from("affiliate_notifications")
      .update({ read_at: now })
      .eq("affiliate_id", affiliateId)
      .is("read_at", null)
  }

  async function markOneRead(id: number) {
    const now = new Date().toISOString()
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: now } : n)))
    await affiliateDb.from("affiliate_notifications").update({ read_at: now }).eq("id", id)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative grid size-10 place-items-center rounded-full border border-black/10 bg-white transition-colors hover:border-black/30"
        aria-label={`Notifications${unread.length > 0 ? `, ${unread.length} unread` : ""}`}
      >
        <Bell className="size-5" strokeWidth={2.4} />
        {unread.length > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-[#dfff00] px-1 text-[10px] font-black text-black ring-2 ring-white">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_22px_55px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between border-b border-black/8 px-4 py-3">
            <p className="text-[12px] font-black uppercase tracking-[0.08em]">Notifications</p>
            {unread.length > 0 ? (
              <button type="button" onClick={markAllRead} className="text-[11px] font-black text-black/55 hover:text-black">
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-[12px] font-semibold text-black/45">Loading...</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] font-semibold text-black/45">No notifications yet.</p>
            ) : (
              <ul>
                {items.map((n) => (
                  <li key={n.id} className="border-b border-black/5 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (!n.read_at) markOneRead(n.id)
                      }}
                      className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.02] ${
                        n.read_at ? "" : "bg-[#dfff00]/15"
                      }`}
                    >
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read_at ? "bg-transparent" : "bg-[#dfff00]"}`} />
                      <span className="grid gap-1">
                        <span className="text-[13px] font-black tracking-[-0.02em]">{n.title}</span>
                        {n.body ? <span className="text-[12px] font-semibold leading-[1.4] text-black/65">{n.body}</span> : null}
                        <span className="text-[11px] font-semibold text-black/40">{formatRelative(n.created_at)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - then)
  const min = Math.floor(diff / 60_000)
  if (min < 1) return "Just now"
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}
