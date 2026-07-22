import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

const signature = localFont({
  src: "../public/fonts/Fave-ScriptPro.ttf",
  variable: "--font-signature",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://sortmydigital.site"),
  title: "Sorted | Your new website, Sorted",
  description:
    "Sorted designs websites before you spend a penny, then builds them if you love what you see.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Sorted | Your new website, Sorted",
    description:
      "See your new website first. Then decide.",
    locale: "en_GB",
    url: "https://sortmydigital.site",
    siteName: "Sorted",
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
