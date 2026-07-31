import type { Metadata } from "next"
import AffiliatePortal from "./_components/AffiliatePortal"

export const metadata: Metadata = {
  title: "Sorted Partners Portal | Sorted Sites",
  description: "Submit mockup requests, track referrals, and view your earnings.",
}

export default function DashboardPage() {
  return <AffiliatePortal />
}
