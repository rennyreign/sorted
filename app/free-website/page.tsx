import type { Metadata } from "next"
import localFont from "next/font/local"
import UsFreeWebsite from "@/components/us-free-website/UsFreeWebsite"

const annotation = localFont({
  src: "../../public/fonts/Sans-Andreas-Bold-Demo.ttf",
  variable: "--font-us-annotation",
  display: "swap",
})

export const metadata: Metadata = {
  title: "See Your New Website Before You Spend a Dollar | Sorted",
  description: "See your new website before you spend a dollar. For US small businesses. See it first, then decide. Answer a few quick questions and request your free site from Sorted.",
  alternates: { canonical: "https://sortmydigital.site/free-website/" },
  openGraph: {
    title: "Your next website. See it before you spend a dollar.",
    description: "We build. You decide. See your new website before you commit. For US small businesses.",
    locale: "en_US",
    url: "https://sortmydigital.site/free-website/",
    siteName: "Sorted",
    images: [{ url: "/joshi-accounting-homepage-preview.webp", width: 1440, height: 4130, alt: "A Sorted website preview for Joshi Accounting" }],
  },
}

export default function FreeWebsitePage() {
  return <div className={annotation.variable}><UsFreeWebsite /></div>
}
