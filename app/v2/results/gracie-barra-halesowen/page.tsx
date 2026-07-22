import type { Metadata } from "next"
import { TemplatedResultPage } from "../_components/TemplatedResultPage"

export const metadata: Metadata = {
  title: "Gracie Barra Halesowen Result | Sorted V2",
  description: "A templated Sorted result page for Gracie Barra Halesowen.",
}

export default function GracieBarraHalesowenPage() {
  return <TemplatedResultPage slug="gracie-barra-halesowen" />
}
