import type { Metadata } from "next"
import "./globals.css"

// Fonts are offline-first. Do NOT use next/font/google — it fetches
// at build time and silently fails or swaps faces when offline.
// When the supplied pack ships font files (input/*.woff2), copy them
// to public/fonts/, declare @font-face rules in globals.css that set
// --font-sans / --font-mono, and verify the rendered faces and weights
// match the mockup. Until then the theme falls back to system stacks.

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
    <html lang="en-GB">
      <body>
        <div className="scroll-progress" />
        {children}
      </body>
    </html>
  )
}
