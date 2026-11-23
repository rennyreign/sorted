import type { Metadata } from "next"
import { TemplatedResultPage } from "../_components/TemplatedResultPage"

export const metadata: Metadata = {
  title: "Bodysharp Result | Sorted Ops",
  description: "A templated Sorted result page for Bodysharp.",
}

export default function BodysharpPage() {
  return <TemplatedResultPage slug="bodysharp" />
}
