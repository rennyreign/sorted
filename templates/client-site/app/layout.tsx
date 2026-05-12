import type { Metadata } from "next"
import { Plus_Jakarta_Sans, DM_Mono } from "next/font/google"
import "./globals.css"

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

export const metadata: Metadata = {
  title: "Client Site",
  description: "Update this with client-specific description.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Client Site",
    description: "Update this with client-specific description.",
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
      className={`${plusJakarta.variable} ${dmMono.variable}`}
    >
      <body>
        <div className="scroll-progress" />
        {children}
      </body>
    </html>
  )
}
