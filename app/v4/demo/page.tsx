import { SiteMapFooter } from "@/components/SiteMapFooter"
import type { Metadata } from "next"
import Image from "next/image"
import { V4Nav } from "../_components/V4Shared"
import { v4Display, v4Hand } from "../fonts"
import { DemoForm } from "./DemoForm"
import s from "../v4.module.css"

export const metadata: Metadata = {
  title: "Try an Operator on WhatsApp | Sorted",
  description: "Send a test message or voice note to our live sandbox and see how an operator qualifies, quotes and follows up in real time.",
  alternates: { canonical: "/v4/demo" },
}

export default function V4Demo() {
  return (
    <main className={`${v4Display.variable} ${v4Hand.variable} ${s.page} min-h-screen`}>
      <V4Nav />

      <section className={s.demoLayout}>
        <div>
          <p className={s.kicker}>The WhatsApp sandbox</p>
          <h1 className={`${s.display} ${s.pageTitle}`}>
            Test an operator <span className={s.olive}>on your phone right now.</span>
          </h1>
          <p className={s.pageSub}>
            Send a test message or voice note to our live sandbox. See how it qualifies the enquiry, drafts the quote and follows up, in real time.
          </p>
          <div className={s.demoPanel}>
            <DemoForm />
          </div>
        </div>
        <div className={s.demoVisual}>
          <Image src="/v4/intake-phone.webp" alt="WhatsApp enquiry qualified and booked on a phone" fill sizes="(min-width: 900px) 40vw, 100vw" />
        </div>
      </section>

      <SiteMapFooter tone="light" experience="automation" />
    </main>
  )
}
