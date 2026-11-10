"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import s from "../v4.module.css"

const WHATSAPP_NUMBER = "447386468085"

export function DemoForm() {
  const [error, setError] = useState("")

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get("firstName") || "").trim()
    const trade = String(data.get("trade") || "").trim()
    const mobile = String(data.get("mobile") || "").replace(/[^\d+]/g, "")
    if (mobile.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid mobile number.")
      return
    }
    setError("")
    const text = `Hi Sorted, I’d like to see how the Enquiry Operator handles an enquiry. I’m ${name}, ${trade}.`
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
  }

  return (
    <form className={s.demoForm} onSubmit={onSubmit}>
      <label className={s.field}>
        <span>First name</span>
        <input name="firstName" required autoComplete="given-name" placeholder="Dave" />
      </label>
      <label className={s.field}>
        <span>Trade or sector</span>
        <input name="trade" required placeholder="Electrician, personal trainer, café…" />
      </label>
      <label className={s.field}>
        <span>Mobile number</span>
        <input name="mobile" type="tel" required autoComplete="tel" inputMode="tel" placeholder="07123 456789" />
      </label>
      <label className={s.field}>
        <span>Email</span>
        <input name="email" type="email" required autoComplete="email" placeholder="you@yourbusiness.co.uk" />
      </label>
      {error ? <p className={s.formError} role="alert">{error}</p> : null}
      <button type="submit" className={s.diagCta}>
        Launch Live WhatsApp Test
        <ArrowRight className="size-4" strokeWidth={2.5} />
      </button>
      <p className={s.formNote}>Opens WhatsApp with your message ready to send. No app to install if you already use WhatsApp.</p>
    </form>
  )
}
