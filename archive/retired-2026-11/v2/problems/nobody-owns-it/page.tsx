import type { Metadata } from "next"
import { ProblemDetailTemplate } from "../_components/ProblemDetailTemplate"

export const metadata: Metadata = {
  title: "Nobody Owns It | Sorted Ops",
  description: "Why unclear ownership, memory-based routines and invisible handoffs are gaps that create operational drag.",
}

export default function NobodyOwnsItPage() {
  return <ProblemDetailTemplate slug="nobody-owns-it" />
}
