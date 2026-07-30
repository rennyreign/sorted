import type { Metadata } from "next"
import { ProblemDetailTemplate } from "../_components/ProblemDetailTemplate"

export const metadata: Metadata = {
  title: "We Miss Opportunities | Sorted V2",
  description: "Why forgotten reviews, old customers, unchased quotes and missed referrals are gaps that cost businesses growth.",
}

export default function WeMissOpportunitiesPage() {
  return <ProblemDetailTemplate slug="we-miss-opportunities" />
}
