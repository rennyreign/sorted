import type { Metadata } from "next"
import { OperatorDeck } from "./OperatorDeck"

export const metadata: Metadata = {
  title: "More capacity. Less overhead. | Sorted",
  description: "Sorted operators meeting deck: operational infrastructure, agents vs operators.",
  robots: { index: false, follow: false },
}

export default function PresentationPage() {
  return <OperatorDeck />
}
