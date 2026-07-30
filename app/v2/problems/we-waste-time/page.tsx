import type { Metadata } from "next"
import { ProblemDetailTemplate } from "../_components/ProblemDetailTemplate"

export const metadata: Metadata = {
  title: "We Waste Time | Sorted V2",
  description: "Why repeated admin, copied updates and manual reporting are gaps that cost businesses time and money every week.",
}

export default function WeWasteTimePage() {
  return <ProblemDetailTemplate slug="we-waste-time" />
}
