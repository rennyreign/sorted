import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

const signature = localFont({
  src: "../public/fonts/Fave-ScriptPro.ttf",
  variable: "--font-signature",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sorted. We modernise businesses.",
  description:
    "Sorted helps businesses modernise through websites that win more customers and operational systems that remove repetitive work.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Sorted. We modernise businesses.",
    description:
      "Choose Sorted Sites for better websites or Sorted Ops for better operations.",
    locale: "en_GB",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB" className={signature.variable}>
      <body>
        <div className="scroll-progress" />
        {children}
      </body>
    </html>
  )
}
