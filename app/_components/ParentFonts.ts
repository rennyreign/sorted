import localFont from "next/font/local"
import { Caveat } from "next/font/google"

// Marker / handwritten annotation face — casual marker style for playful notes
export const parentMarker = localFont({
  src: "../../public/fonts/cc-ask-for-mercy.ttf",
  variable: "--font-parent-marker",
  display: "swap",
})

// Script face for the "Sorted." wordmark flourish where needed
export const parentScript = localFont({
  src: "../../public/fonts/Fave-ScriptPro.ttf",
  variable: "--font-parent-script",
  display: "swap",
})

export const parentCaveat = Caveat({
  subsets: ["latin"],
  variable: "--font-parent-caveat",
  display: "swap",
})
