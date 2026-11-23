import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BOOKING_URL } from "../fonts"
import s from "../v4.module.css"

export { V4Nav } from "./V4Nav"

export function V4Cta({
  title = (
    <>
      Ready to
      <br />
      <span className={s.lime}>pull ahead?</span>
    </>
  ),
  copy = "Book a 15-minute call. We’ll show you where you could be winning more work and what an operator looks like inside your workflow.",
  note = "No pressure. No technical jargon. Just clear numbers.",
}: {
  title?: React.ReactNode
  copy?: string
  note?: string | null
}) {
  return (
    <div className={s.diagnosticWrap} id="diagnostic">
      <div className={s.diagnostic}>
        <h2 className={`${s.display} ${s.diagTitle}`}>{title}</h2>
        <span className={s.diagDivider} />
        <p className={s.diagCopy}>{copy}</p>
        <div className={s.diagAction}>
          <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={s.diagCta}>
            See Your Advantage
            <ArrowRight className="size-4" strokeWidth={2.5} />
          </a>
          {note && <p className={s.diagNote}>{note}</p>}
        </div>
      </div>
    </div>
  )
}
