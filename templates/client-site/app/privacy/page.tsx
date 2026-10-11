import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import PendingPage from "@/components/PendingPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy | Design review",
  description: "This page is awaiting design approval.",
  robots: { index: false, follow: false },
}

export default function PrivacyRoute() {
  return (
    <>
      <Nav />
      <main>
        <PendingPage pageName="Privacy" />
      </main>
      <Footer />
    </>
  )
}
