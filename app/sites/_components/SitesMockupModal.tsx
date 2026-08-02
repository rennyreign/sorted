"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Check, ExternalLink, Loader2, Mail, Sparkles, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getAttribution } from "@/lib/attribution"

type StepKey = "business" | "currentSite" | "goal" | "style" | "timeline"

type Step = {
  key: StepKey
  kicker: string
  question: string
  options: string[]
}

const steps: Step[] = [
  {
    key: "business",
    kicker: "Question 1 of 5",
    question: "What kind of business needs the website?",
    options: ["Local service business", "Health or fitness", "Hospitality", "Professional service", "Retail or ecommerce", "Something else"],
  },
  {
    key: "currentSite",
    kicker: "Question 2 of 5",
    question: "What are you working with right now?",
    options: ["No website yet", "An old website", "A site I do not like", "A DIY website", "A website that does not bring enquiries"],
  },
  {
    key: "goal",
    kicker: "Question 3 of 5",
    question: "What should the new site help you do?",
    options: ["Get more enquiries", "Look more professional", "Take bookings", "Explain services clearly", "Show proof and reviews"],
  },
  {
    key: "style",
    kicker: "Question 4 of 5",
    question: "What should it feel like?",
    options: ["Premium and trusted", "Clean and simple", "Bold and direct", "Warm and local", "Modern but not flashy"],
  },
  {
    key: "timeline",
    kicker: "Question 5 of 5",
    question: "How soon would you like to see a mockup?",
    options: ["Today if possible", "Within 24 hours", "This week", "No rush, I am exploring"],
  },
]

export function MockupButton({
  label = "Get your free mockup",
  variant = "primary",
  className = "",
}: {
  label?: string
  variant?: "nav" | "primary" | "yellow" | "white"
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${buttonClass(variant)} ${className}`}>
        {label}
        <ArrowRight className="size-4" strokeWidth={3} />
      </button>
      {open ? <MockupModal onClose={() => setOpen(false)} /> : null}
    </>
  )
}

function buttonClass(variant: "nav" | "primary" | "yellow" | "white") {
  const base = "inline-flex items-center justify-center gap-4 rounded-full font-black transition-transform duration-200 hover:-translate-y-0.5"
  const styles = {
    nav: "h-11 bg-[#070707] px-5 text-[11px] text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)]",
    primary: "h-[52px] bg-[#070707] px-7 text-[12px] text-white shadow-[0_18px_36px_rgba(0,0,0,0.16)]",
    yellow: "h-[52px] bg-[#dfff00] px-8 text-[12px] text-black shadow-[0_16px_32px_rgba(190,210,0,0.22)]",
    white: "h-12 bg-white px-6 text-[12px] text-black",
  }

  return `${base} ${styles[variant]}`
}

function MockupModal({ onClose }: { onClose: () => void }) {
  const [answers, setAnswers] = useState<Partial<Record<StepKey, string>>>({})
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<"questions" | "loading" | "result">("questions")
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.scrollTop = 0
    }
  }, [phase, stepIndex])

  const activeStep = steps[stepIndex]
  const progress = phase === "result" ? 100 : ((stepIndex + 1) / steps.length) * 100
  const summary = useMemo(() => getSummary(answers), [answers])

  function choose(option: string) {
    const nextAnswers = { ...answers, [activeStep.key]: option }
    setAnswers(nextAnswers)

    if (stepIndex === steps.length - 1) {
      setPhase("loading")
      window.setTimeout(() => setPhase("result"), 760)
      return
    }

    setStepIndex((current) => current + 1)
  }

  function back() {
    if (phase === "result") {
      setPhase("questions")
      setStepIndex(steps.length - 1)
      return
    }

    setStepIndex((current) => Math.max(0, current - 1))
  }

  return (
    <div ref={dialogRef} className="fixed inset-0 z-[90] h-[100dvh] overflow-y-auto overscroll-contain bg-[#fbfbfa] text-[#070707] [-webkit-overflow-scrolling:touch]" role="dialog" aria-modal="true" aria-label="Free website mockup">
      <button
        type="button"
        onClick={onClose}
        className="fixed right-4 top-4 z-[100] grid size-12 place-items-center rounded-full bg-[#070707] text-white shadow-[0_14px_34px_rgba(0,0,0,0.22)] sm:right-6 sm:top-6"
        aria-label="Close mockup request"
      >
        <X className="size-5" strokeWidth={2.7} />
      </button>
      <div className="flex min-h-[100dvh] flex-col">
        <header className="sticky top-0 z-[95] mx-auto flex w-full max-w-[1220px] items-center justify-between gap-5 bg-[#fbfbfa]/92 px-5 py-5 pr-20 backdrop-blur-xl sm:px-8 sm:pr-24">
          <button type="button" onClick={back} className="inline-flex h-11 items-center gap-2 rounded-full border border-black/15 px-4 text-[12px] font-black disabled:opacity-30" disabled={phase === "questions" && stepIndex === 0}>
            <ArrowLeft className="size-4" strokeWidth={2.5} />
            Back
          </button>
          <div className="w-[44%] max-w-[360px]">
            <div className="h-2 overflow-hidden rounded-full bg-black/10">
              <div className="h-full rounded-full bg-[#dfff00] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-[1220px] flex-1 items-start px-5 pb-12 pt-5 sm:px-8 sm:pb-16 lg:items-center">
          {phase === "questions" ? <QuestionStep step={activeStep} value={answers[activeStep.key]} onChoose={choose} /> : null}
          {phase === "loading" ? <LoadingStep answers={answers} /> : null}
          {phase === "result" ? <ResultStep answers={answers} summary={summary} /> : null}
        </div>
      </div>
    </div>
  )
}

function QuestionStep({ step, value, onChoose }: { step: Step; value?: string; onChoose: (option: string) => void }) {
  return (
    <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-center">
      <div>
        <p className="text-[12px] font-black text-black/45">{step.kicker}</p>
        <h2 className="mt-5 max-w-[650px] [font-family:var(--font-sites-marker)] text-[clamp(3.15rem,13vw,7.1rem)] font-normal uppercase leading-[0.92] sm:text-[clamp(4.6rem,8.2vw,7.1rem)] xl:text-[clamp(4.9rem,6.5vw,7.1rem)]">
          {step.question}
        </h2>
        <div className="mt-6 h-[4px] w-80 max-w-full rounded-full bg-[#ff73d2]" />
      </div>

      <div className="relative z-10 grid gap-3 rounded-[20px] bg-[#fbfbfa] pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-none sm:bg-transparent sm:pb-0">
        {step.options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => onChoose(option)}
            className={`group grid min-h-[72px] grid-cols-[1fr_auto] items-center rounded-[16px] border bg-white px-5 text-left text-[17px] font-black tracking-[-0.04em] shadow-[0_14px_40px_rgba(0,0,0,0.035)] transition-all hover:-translate-y-0.5 hover:border-black ${
              value === option ? "border-black ring-4 ring-[#dfff00]" : "border-black/10"
            }`}
          >
            <span>{option}</span>
            <span className="grid size-9 place-items-center rounded-full bg-[#070707] text-white">
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={3} />
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function LoadingStep({ answers }: { answers: Partial<Record<StepKey, string>> }) {
  return (
    <section className="mx-auto max-w-[760px] text-center">
      <Loader2 className="mx-auto size-12 animate-spin text-[#bdd900]" strokeWidth={3} />
      <h2 className="mt-8 [font-family:var(--font-sites-marker)] text-[clamp(3.4rem,6vw,6.2rem)] uppercase leading-[0.9]">
        Building your mockup brief
      </h2>
      <p className="mx-auto mt-5 max-w-[520px] text-[16px] font-bold leading-[1.5]">
        We are turning {answers.business?.toLowerCase() ?? "your business"} into a practical website direction.
      </p>
    </section>
  )
}

function ResultStep({ answers, summary }: { answers: Partial<Record<StepKey, string>>; summary: string }) {
  const [businessName, setBusinessName] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [email, setEmail] = useState("")
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [submitError, setSubmitError] = useState("")
  const [successDetails, setSuccessDetails] = useState<{ email: string; reviewUrl: string | null } | null>(null)

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitState("submitting")
    setSubmitError("")

    try {
      const cleanBusinessName = businessName.trim()
      const cleanEmail = email.trim().toLowerCase()

      if (!cleanBusinessName) {
        throw new Error("Please add your business name.")
      }
      if (!isValidEmail(cleanEmail)) {
        throw new Error("Please add a valid email address.")
      }

      const attribution = getAttribution()
      const { data: leadId, error } = await supabase.rpc("submit_website_lead", {
        p_business_name: cleanBusinessName,
        p_website_url: websiteUrl.trim() || null,
        p_email: cleanEmail,
        p_answers: answers,
        p_summary: summary,
        p_utm_source: attribution.utm_source,
        p_utm_medium: attribution.utm_medium,
        p_utm_campaign: attribution.utm_campaign,
        p_utm_content: attribution.utm_content,
        p_utm_term: attribution.utm_term,
      })

      if (error) {
        throw new Error("Could not submit your mockup brief")
      }

      let reviewUrl: string | null = null
      let reviewSlug: string | null = null
      if (leadId) {
        const { data: lead } = await supabase
          .from("prospects")
          .select("review_slug")
          .eq("id", leadId)
          .single()

        if (lead?.review_slug && typeof window !== "undefined") {
          reviewSlug = lead.review_slug
          reviewUrl = `${window.location.origin}/review/?slug=${lead.review_slug}`
        }
      }

      setSuccessDetails({ email: cleanEmail, reviewUrl })
      setSubmitState("success")

      // Notify the Sorted operator (fire-and-forget — customer success state is already shown)
      if (reviewSlug) {
        fetch("/api/operators/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "website_lead",
            businessName: cleanBusinessName,
            email: cleanEmail,
            websiteUrl: websiteUrl.trim() || undefined,
            reviewSlug,
            summary,
            answers,
          }),
        }).catch((error) => {
          console.error("[SitesMockupModal] Operator notification failed:", error)
        })
      }
    } catch (error) {
      setSubmitState("error")
      setSubmitError(error instanceof Error ? error.message : "Could not submit your mockup brief")
    }
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div>
        <p className="text-[12px] font-black text-black/45">Your free mockup direction</p>
        <h2 className="mt-5 [font-family:var(--font-sites-marker)] text-[clamp(3.5rem,7vw,7.2rem)] uppercase leading-[0.92]">
          We can build this first
        </h2>
        <div className="mt-6 h-[4px] w-80 max-w-full rounded-full bg-[#ff73d2]" />
        <p className="mt-7 max-w-[520px] text-[17px] font-bold leading-[1.5]">{summary}</p>
      </div>

      <div className="rounded-[22px] bg-[#f7efe3] p-5 shadow-[0_22px_55px_rgba(20,14,8,0.13)] sm:p-7">
        {submitState === "success" && successDetails ? (
          <div className="grid min-h-[430px] content-center rounded-[18px] bg-[#070707] p-6 text-white sm:p-8">
            <span className="grid size-14 place-items-center rounded-full bg-[#dfff00] text-black">
              <Check className="size-7" strokeWidth={3.4} />
            </span>
            <p className="mt-7 text-[13px] font-black text-[#dfff00]">Mockup brief received</p>
            <h3 className="mt-3 max-w-[560px] text-[clamp(2.1rem,4vw,4.1rem)] font-black leading-[0.95] tracking-[-0.055em]">
              Your private mockup page is being prepared.
            </h3>
            <p className="mt-5 max-w-[520px] text-[15px] font-bold leading-[1.5] text-white/72">
              We’ll use your answers to prepare the first direction, then send the review link to{" "}
              <span className="text-white">{successDetails.email}</span>. When the mockup is revealed, your stage updates in the Sorted pipeline automatically.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {successDetails.reviewUrl ? (
                <a
                  href={successDetails.reviewUrl}
                  className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-white px-5 text-[12px] font-black text-black transition-transform hover:-translate-y-0.5"
                >
                  Open review page <ExternalLink className="size-4" strokeWidth={2.8} />
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex h-12 items-center justify-center gap-3 rounded-full border border-white/20 px-5 text-[12px] font-black text-white transition-colors hover:border-[#dfff00] hover:text-[#dfff00]"
              >
                Request another mockup <Sparkles className="size-4" strokeWidth={2.8} />
              </button>
            </div>
            <div className="mt-7 grid gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-4 text-[12px] font-bold text-white/62 sm:grid-cols-[24px_1fr]">
              <Mail className="size-5 text-[#dfff00]" strokeWidth={2.5} />
              <p>Email delivery is handled by Sorted. If nothing arrives, WhatsApp us and we’ll send the review link manually.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-[16px] bg-white p-5">
              <p className="text-[12px] font-black text-black/45">What we will focus on</p>
              <h3 className="mt-3 text-[28px] font-black tracking-[-0.045em]">{answers.goal ?? "A website that gets enquiries"}</h3>
              <ul className="mt-5 grid gap-3 text-[13px] font-black">
                {["A homepage that says what you do clearly", "Proof that makes people trust you", "A direct path to enquire or book", "Simple content you can update yourself"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="size-5 rounded-full bg-[#dfff00] p-1" strokeWidth={3.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <form onSubmit={submitLead} className="mt-4 grid gap-3 rounded-[16px] bg-[#070707] p-5 text-white">
              <p className="text-[13px] font-black">Where should we send it?</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="h-12 rounded-xl border-0 bg-white px-4 text-[12px] font-bold text-black outline-none placeholder:text-black/35"
                  placeholder="Business name"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  required
                />
                <input
                  className="h-12 rounded-xl border-0 bg-white px-4 text-[12px] font-bold text-black outline-none placeholder:text-black/35"
                  placeholder="Your website, if you have one"
                  value={websiteUrl}
                  onChange={(event) => setWebsiteUrl(event.target.value)}
                />
              </div>
              <input
                className="h-12 rounded-xl border-0 bg-white px-4 text-[12px] font-bold text-black outline-none placeholder:text-black/35"
                placeholder="Email address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <button type="submit" disabled={submitState === "submitting"} className="mt-1 inline-flex h-11 items-center justify-center gap-3 rounded-full bg-[#dfff00] px-5 text-[11px] font-black text-black transition-opacity disabled:opacity-70">
                {submitState === "submitting" ? "Sending..." : "Send my mockup brief"}
                {submitState === "submitting" ? <Loader2 className="size-4 animate-spin" strokeWidth={3} /> : <ArrowRight className="size-4" strokeWidth={3} />}
              </button>
              {submitState === "error" ? (
                <p className="text-[12px] font-bold text-[#ff9acb]">{submitError}</p>
              ) : null}
            </form>
          </>
        )}
      </div>
    </section>
  )
}

function getSummary(answers: Partial<Record<StepKey, string>>) {
  const business = answers.business?.toLowerCase() ?? "business"
  const site = answers.currentSite?.toLowerCase() ?? "current website"
  const goal = answers.goal?.toLowerCase() ?? "get more enquiries"

  if (site === "no website yet") {
    return `For a ${business}, we'd create a website that builds trust, clearly explains your services, and helps turn more visitors into enquiries.`
  }

  return `For a ${business}, we would turn ${site} into a sharper website with a clearer first impression, stronger proof, and a simple route to ${goal}.`
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
