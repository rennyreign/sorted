import type { Metadata } from "next"
import { Plus_Jakarta_Sans, DM_Mono, Dancing_Script } from "next/font/google"
import "./globals.css"
import PageTransition from "@/components/PageTransition"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
})

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-signature",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sorted. More trust. More enquiries. More customers.",
  description:
    "We help small businesses modernize how they attract, capture, and convert customers. Starting with their website.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Sorted. More trust. More enquiries. More customers.",
    description:
      "We help small businesses modernize how they attract, capture, and convert customers. Starting with their website.",
    locale: "en_GB",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en-GB"
      className={`${plusJakarta.variable} ${dmMono.variable} ${dancingScript.variable}`}
    >
      <body>
        <div className="scroll-progress" />
        {children}
      </body>
    </html>
  )
}
