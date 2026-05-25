import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Proposal - Sorted",
  description: "Private project proposal",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
}

export default function ProposalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
