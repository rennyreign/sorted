"use client"

import { useSyncExternalStore } from "react"
import { MARKET_PRICING, marketCopy, parseMarket, type Market } from "@/lib/market-pricing"

const PREFERENCE_KEY = "sorted-market"
const DETECTED_KEY = "sorted-detected-market"
let current: Market = "UK"
let started = false
let revision = 0
const listeners = new Set<() => void>()

function readStorage(storage: "localStorage" | "sessionStorage", key: string): Market | null {
  try { return parseMarket(window[storage].getItem(key)) } catch { return null }
}

function writeStorage(storage: "localStorage" | "sessionStorage", key: string, value: Market) {
  try { window[storage].setItem(key, value) } catch { /* Selection still works without storage. */ }
}

function publish(market: Market) {
  current = market
  for (const listener of listeners) listener()
}

async function initialise() {
  const explicit = parseMarket(new URLSearchParams(window.location.search).get("market"))
  const saved = readStorage("localStorage", PREFERENCE_KEY)
  // A deliberately shared market link applies on arrival; later manual selection wins.
  if (explicit) {
    writeStorage("localStorage", PREFERENCE_KEY, explicit)
    publish(explicit)
    return
  }
  if (saved) { publish(saved); return }
  const cached = readStorage("sessionStorage", DETECTED_KEY)
  if (cached) { publish(cached); return }
  const requestRevision = revision
  try {
    // Country-only IP lookup. No browser location permission, cookies or referrer.
    const response = await fetch("https://api.country.is/", {
      signal: AbortSignal.timeout(3000), credentials: "omit", referrerPolicy: "no-referrer",
    })
    if (!response.ok) return
    const data = await response.json()
    if (typeof data.country !== "string" || !/^[A-Z]{2}$/.test(data.country)) return
    const detected: Market = data.country === "US" ? "US" : "UK"
    writeStorage("sessionStorage", DETECTED_KEY, detected)
    if (revision === requestRevision && !readStorage("localStorage", PREFERENCE_KEY)) publish(detected)
  } catch { /* UK fallback; the selector always remains available. */ }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!started) {
    started = true
    void initialise()
    window.addEventListener("storage", (event) => {
      if (event.key === PREFERENCE_KEY) {
        revision++
        publish(parseMarket(event.newValue) ?? "UK")
      }
    })
  }
  return () => { listeners.delete(listener) }
}

export function useMarket() {
  return useSyncExternalStore(subscribe, () => current, () => "UK" as Market)
}

export function useMarketOffer() {
  return MARKET_PRICING[useMarket()]
}

export function MarketCopy({ children }: { children: string }) {
  return marketCopy(children, useMarket())
}

export function MarketSelector({ className = "" }: { className?: string }) {
  const market = useMarket()
  return (
    <select
      aria-label="Pricing region"
      value={market}
      onChange={(event) => {
        const next = parseMarket(event.target.value)
        if (!next) return
        revision++
        writeStorage("localStorage", PREFERENCE_KEY, next)
        // Avoid a stale outreach query undoing the choice on refresh.
        const url = new URL(window.location.href)
        url.searchParams.delete("market")
        window.history.replaceState(window.history.state, "", url)
        publish(next)
      }}
      className={`min-h-11 rounded-full border border-current/20 bg-transparent px-3 text-[12px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}
    >
      <option value="UK" className="bg-white text-black">UK · £ GBP</option>
      <option value="US" className="bg-white text-black">US · $ USD</option>
    </select>
  )
}
