import type { Metadata } from "next"
import { SitesFooter, SitesHeader, SitesPage } from "../sites/_components/SitesPrimitives"
import { AboutSections } from "./_components/AboutSections"

export const metadata: Metadata = {
  title: "About Sorted | Good at what you do? Your systems should be too.",
  description: "Why Sorted exists: practical systems for local businesses — websites that show your quality, and AI assistants that handle the work around it.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Sorted | Good at what you do? Your systems should be too.",
    description: "Why Sorted exists: practical systems for local businesses — websites that show your quality, and AI assistants that handle the work around it.",
    url: "/about",
  },
}

export default function AboutPage() {
  return (
    <SitesPage>
      <SitesHeader active="about" />
      <AboutSections />
      <SitesFooter />
    </SitesPage>
  )
}
