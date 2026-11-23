import type { Metadata } from "next"
import { SiteMapFooter } from "@/components/SiteMapFooter"
import { sitesFaveScript, sitesMarker } from "../../sites/_components/SitesPrimitives"
import { AboutSections } from "../../about/_components/AboutSections"
import { AssistantsHeader } from "../_components/AssistantsHeader"

export const metadata: Metadata = {
  title: "About Sorted | Good at what you do? Your systems should be too.",
  description: "Why Sorted exists: practical systems for local businesses — websites that show your quality, and AI assistants that handle the work around it.",
  alternates: {
    canonical: "/assistants/about",
  },
  openGraph: {
    title: "About Sorted | Good at what you do? Your systems should be too.",
    description: "Why Sorted exists: practical systems for local businesses — websites that show your quality, and AI assistants that handle the work around it.",
    url: "/assistants/about",
  },
}

export default function AssistantsAboutPage() {
  return (
    <main className={`${sitesMarker.variable} ${sitesFaveScript.variable} min-h-screen overflow-x-clip bg-[#fafafa] text-[#111]`}>
      <AssistantsHeader />
      <AboutSections />
      <SiteMapFooter experience="assistants" />
    </main>
  )
}
