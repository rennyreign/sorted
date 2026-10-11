import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import PendingPage from "@/components/PendingPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms | Design review",
  description: "This page is awaiting design approval.",
  robots: { index: false, follow: false },
}

export default function TermsRoute() {
  return (
    <>
      <Nav />
      <main>
        <PendingPage pageName="Terms" />
      </main>
      <Footer />
    </>
  )
}
