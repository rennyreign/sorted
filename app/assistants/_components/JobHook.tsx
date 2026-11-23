"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getAttribution } from "@/lib/attribution"

const examples = [
  "answer new enquiries",
  "prepare my quotes",
  "chase unpaid invoices",
  "book my jobs",
  "follow up open quotes",
] as const

const inputClass =
  "min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-[17px] font-semibold outline-none transition-colors placeholder:text-black/40 focus:border-black focus-visible:ring-2 focus-visible:ring-[#e4ff29]"

const pillButton =
  "inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-black px-7 text-[14px] font-black text-white transition-colors hover:bg-[#00271f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e4ff29] focus-visible:ring-offset-2"

function isValidContact(value: string) {
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return true
  return (value.match(/\d/g) ?? []).length >= 7
}

export function JobHook() {
  const [job, setJob] = useState("")
  const [business, setBusiness] = useState("")
  const [contact, setContact] = useState("")
  const [consent, setConsent] = useState(false)
  const [honey, setHoney] = useState("")
  const [step, setStep] = useState<1 | 2>(1)
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle")
  const [error, setError] = useState("")
  const [placeholder, setPlaceholder] = useState("")
  const typingRef = useRef(true)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaceholder(examples[0])
      return
    }
    let example = 0
    let char = 0
    let deleting = false
    const tick = () => {
      if (!typingRef.current) return
      const target = examples[example]
      char += deleting ? -1 : 1
      setPlaceholder(target.slice(0, char))
      let delay = deleting ? 30 : 55
      if (!deleting && char === target.length) {
        deleting = true
        delay = 1600
      } else if (deleting && char === 0) {
        deleting = false
        example = (example + 1) % examples.length
        delay = 350
      }
      timer = window.setTimeout(tick, delay)
    }
    let timer = window.setTimeout(tick, 400)
    return () => window.clearTimeout(timer)
  }, [])

  function stopTyping() {
    typingRef.current = false
    setPlaceholder(examples[0])
  }

  function openStep2() {
    if (!job.trim()) return
    setStep(2)
  }

  async function submit() {
    const cleanJob = job.trim()
    const cleanBusiness = business.trim()
    const cleanContact = contact.trim()
    if (!cleanJob || !cleanBusiness || !cleanContact || !consent) return
    if (!isValidContact(cleanContact)) {
      setError("Add a valid email address or a phone number we can call.")
      return
    }
    setError("")
    setStatus("sending")
    if (honey) {
      setStatus("done")
      return
    }
    const attribution = getAttribution()
    const { error: rpcError } = await supabase.rpc("submit_assistant_job", {
      p_job: cleanJob,
      p_business: cleanBusiness,
      p_contact: cleanContact,
      p_consent: true,
      p_utm_source: attribution.utm_source,
      p_utm_medium: attribution.utm_medium,
      p_utm_campaign: attribution.utm_campaign,
    })
    if (rpcError) {
      setStatus("error")
      return
    }
    setStatus("done")
  }

  if (status === "done") {
    return (
      <div className="rounded-[22px] border border-black/10 bg-white p-7 shadow-[0_14px_38px_rgba(0,0,0,0.05)]" aria-live="polite">
        <p className="text-[13px] font-black uppercase tracking-[0.12em] text-black/45">Got it. Here&apos;s your job:</p>
        <p className="mt-4 text-[clamp(1.3rem,2.4vw,1.8rem)] font-black leading-[1.2] tracking-[-0.03em]">&ldquo;{job.trim()}&rdquo;</p>
        <p className="mt-4 text-[17px] font-semibold leading-[1.55] text-black/65">We&apos;ll be in touch to set up an assistant for it.</p>
        <a href="/assistants/demo/" className="mt-6 inline-flex min-h-11 items-center gap-2 text-[13px] font-black underline underline-offset-4 transition-colors hover:text-black/60">
          See a job in action <ArrowRight className="size-4" strokeWidth={2.8} />
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-[22px] border border-black/10 bg-white p-6 shadow-[0_14px_38px_rgba(0,0,0,0.05)] sm:p-7">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (step === 1) openStep2()
            else void submit()
          }}
        >
          <input
            type="text"
            name="company_website"
            value={honey}
            onChange={(e) => setHoney(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
          />
          <label htmlFor="job-hook" className="block text-[13px] font-black uppercase tracking-[0.12em] text-black/55">
            I&apos;d love an assistant to
          </label>
          <input
            id="job-hook"
            type="text"
            required
            maxLength={280}
            value={job}
            placeholder={placeholder}
            onFocus={stopTyping}
            onChange={(e) => {
              stopTyping()
              setJob(e.target.value)
            }}
            className={`${inputClass} mt-3`}
          />
          {step === 1 ? (
            <button
              type="submit"
              data-track="cta_click"
              data-cta-text="Put it to work"
              data-cta-location="assistants_hook"
              className={`${pillButton} mt-4 w-full sm:w-auto`}
            >
              Put it to work <ArrowRight className="size-4 text-[#e4ff29]" strokeWidth={3} />
            </button>
          ) : (
            <div className="mt-5 grid gap-4 border-t border-black/10 pt-5">
              <div>
                <label htmlFor="job-business" className="block text-[12px] font-black text-black/55">Business name</label>
                <input
                  id="job-business"
                  type="text"
                  required
                  maxLength={120}
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  className={`${inputClass} mt-2`}
                />
              </div>
              <div>
                <label htmlFor="job-contact" className="block text-[12px] font-black text-black/55">Mobile number or email</label>
                <input
                  id="job-contact"
                  type="text"
                  required
                  maxLength={160}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className={`${inputClass} mt-2`}
                />
              </div>
              <label htmlFor="job-consent" className="flex min-h-11 cursor-pointer items-start gap-3 text-[15px] font-semibold leading-[1.45] text-black/70">
                <input
                  id="job-consent"
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 size-5 shrink-0 accent-black"
                />
                Sorted can contact me about this. I understand the example shown is made up.
              </label>
              <div aria-live="polite">
                {error ? <p className="text-[13px] font-semibold text-[#b00020]">{error}</p> : null}
                {status === "error" ? (
                  <p className="text-[13px] font-semibold text-[#b00020]">
                    Something went wrong sending your job.{" "}
                    <a href="https://wa.me/447386468085" className="underline underline-offset-4">Message us on WhatsApp instead</a>.
                  </p>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                data-track="cta_click"
                data-cta-text="Send my job"
                data-cta-location="assistants_hook"
                className={`${pillButton} w-full disabled:opacity-60 sm:w-auto`}
              >
                {status === "sending" ? "Sending…" : "Send my job"} <ArrowRight className="size-4 text-[#e4ff29]" strokeWidth={3} />
              </button>
            </div>
          )}
        </form>
      </div>
      <p className="mt-4 text-[15px] font-semibold text-black/65">We set it up around how you already work.</p>
    </div>
  )
}
