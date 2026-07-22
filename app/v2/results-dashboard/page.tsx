import type { Metadata } from "next"
import { ResultsDashboard } from "./ResultsDashboard"

export const metadata: Metadata = {
  title: "Results Dashboard | Sorted V2",
  description: "A reusable Sorted client results dashboard showing time returned, customers recovered, reviews generated, revenue recovered, and investment return.",
}

export default function V2ResultsDashboardPage() {
  return <ResultsDashboard />
}
