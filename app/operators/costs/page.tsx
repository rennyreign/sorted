import type { Metadata } from "next"
import OperatorShell from "@/components/operators/OperatorShell"

export const metadata: Metadata = {
  title: "Cost Dashboard — Sorted Operators",
  description: "Supplier balances and cost-per-nod pipeline metrics for Sorted.",
}

export default function CostsPage() {
  return <OperatorShell initialView="costs" />
}
