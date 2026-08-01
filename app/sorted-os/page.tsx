import type { Metadata } from "next"
import localFont from "next/font/local"
import SortedOSClient from "./SortedOSClient"

const sortedDisplay = localFont({
  src: "../../fonts/sf-ui-display-heavy-586470160b9e5.otf",
  variable: "--font-sorted-os-display",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sorted OS | Operating Handbook",
  description: "The operating handbook for Sorted Global: strategy, doctrine, offers, operators, and the factory system.",
  alternates: { canonical: "/sorted-os" },
}

export default function SortedOSPage() {
  return <div className={`${sortedDisplay.variable} [font-family:var(--font-sorted-os-display),ui-sans-serif,system-ui]`}><SortedOSClient /></div>
}
