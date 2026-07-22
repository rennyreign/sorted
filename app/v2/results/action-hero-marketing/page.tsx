import type { Metadata } from "next"
import { TemplatedResultPage } from "../_components/TemplatedResultPage"

export const metadata: Metadata = {
  title: "Action Hero Marketing Result | Sorted V2",
  description: "A templated Sorted result page for Action Hero Marketing.",
}

export default function ActionHeroMarketingPage() {
  return <TemplatedResultPage slug="action-hero-marketing" />
}
