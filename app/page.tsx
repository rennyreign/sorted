import type { Metadata } from "next"

export { default } from "./ops/infrastructure/page"

export const metadata: Metadata = {
  title: "Sorted | AI-powered operational infrastructure",
  description:
    "Sorted builds the AI-powered operational infrastructure your business does not have time to build. One measured improvement at a time.",
  alternates: { canonical: "/" },
}
