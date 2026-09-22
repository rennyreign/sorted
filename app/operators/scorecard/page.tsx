import type { Metadata } from "next"
import OperatorShell from "@/components/operators/OperatorShell"

export const metadata: Metadata = {
  title: "Scorecard — Sorted Operators",
  description: "Automated weekly scorecard tracking FY27 progress.",
}

export default function ScorecardPage() {
  return <OperatorShell initialView="scorecard" />
}
