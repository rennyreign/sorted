import type { Metadata } from "next"
import OperatorShell from "@/components/operators/OperatorShell"

export const metadata: Metadata = {
  title: "Prospect Finder — Sorted Operators",
  description: "Sorted acquisition operator dashboard. UK small business prospects sourced from Google Maps.",
}

export default function ProspectFinderPage() {
  return <OperatorShell />
}
