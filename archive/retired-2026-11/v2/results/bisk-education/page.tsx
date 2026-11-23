import type { Metadata } from "next"
import { TemplatedResultPage } from "../_components/TemplatedResultPage"

export const metadata: Metadata = {
  title: "Bisk Education Result | Sorted Ops",
  description: "A templated Sorted result page for Bisk Education.",
}

export default function BiskEducationPage() {
  return <TemplatedResultPage slug="bisk-education" />
}
