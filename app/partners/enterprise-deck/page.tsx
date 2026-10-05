import type { Metadata } from "next"
import { affHighlight } from "../_components/AffiliatesPrimitives"
import EnterpriseDeck from "./EnterpriseDeck"
import styles from "./enterprise-deck.module.css"

export const metadata: Metadata = {
  title: "Enterprise Partner Briefing | Sorted",
  description: "A private briefing on Sorted's website manufacturing infrastructure for enterprise partners.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function EnterpriseDeckPage() {
  return (
    <main className={`${affHighlight.variable} ${styles.deckPage}`}>
      <EnterpriseDeck />
    </main>
  )
}
