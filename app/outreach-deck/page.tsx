import type { Metadata } from "next"
import OutreachDeck from "./OutreachDeck"
import styles from "./outreach-deck.module.css"

export const metadata: Metadata = {
  title: "The Sorted Outreach System | Sorted",
  description: "How Sorted finds prospects, manufactures proof, and gets to a clear yes or no.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function OutreachDeckPage() {
  return (
    <main className={styles.deckPage}>
      <OutreachDeck />
    </main>
  )
}
