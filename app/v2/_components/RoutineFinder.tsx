"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import localFont from "next/font/local"
import { ArrowLeft, ArrowRight, Check, Loader2, MessageCircle, RotateCcw, Search, X } from "lucide-react"

type StepKey = "industry" | "frustration" | "owner" | "time" | "software"

type Step = {
  key: StepKey
  kicker: string
  question: string
  options: string[]
}

const routineMarker = localFont({
  src: "../../../public/fonts/cc-ask-for-mercy.ttf",
  variable: "--font-v2-marker",
  display: "swap",
})

const routineHighlight = localFont({
  src: "../../../public/fonts/Sans-Andreas-Bold-Demo.ttf",
  variable: "--font-v2-highlight",
  display: "swap",
})

const steps: Step[] = [
  {
    key: "industry",
    kicker: "Question 1 of 5",
    question: "What type of business do you run?",
    options: ["Dental practice", "Trades", "Gym or fitness", "Restaurant", "Professional services", "Something else"],
  },
  {
    key: "frustration",
    kicker: "Question 2 of 5",
    question: "Which sounds most familiar?",
    options: [
      "We keep missing enquiries.",
      "We spend too much time on admin.",
      "Customers disappear after first contact.",
      "We answer the same questions all day.",
      "We never ask for reviews.",
    ],
  },
  {
    key: "owner",
    kicker: "Question 3 of 5",
    question: "Who currently handles this?",
    options: ["Me", "Reception or admin", "Several people", "Nobody consistently"],
  },
  {
    key: "time",
    kicker: "Question 4 of 5",
    question: "Roughly how much time disappears into this each week?",
    options: ["Under an hour", "1-5 hours", "5-10 hours", "More than 10 hours"],
  },
  {
    key: "software",
    kicker: "Question 5 of 5",
    question: "Does your current software already handle this well?",
    options: ["Not really", "Partly", "Yes, but nobody uses it properly", "I am not sure"],
  },
]

const recommendations = {
  enquiry: {
    label: "Follow — the enquiry system",
    summary: "Nobody consistently owns what happens after an enquiry arrives.",
    impact: ["Faster replies", "Less chasing", "Clearer ownership", "More enquiries converted"],
    href: "/ops/systems/enquiry-follow-up",
  },
  admin: {
    label: "An admin system",
    summary: "The first opportunity is the internal work that keeps pulling people away from customers.",
    impact: ["Fewer copied updates", "Cleaner handoffs", "Less duplicated work", "More time returned"],
    href: "/ops/how-it-works",
  },
  reviews: {
    label: "Reviews — the trust system",
    summary: "You already have happy customers, but the request is not happening consistently enough.",
    impact: ["More review requests", "Better timing", "Less manual asking", "Stronger local proof"],
    href: "/ops/problems-we-solve",
  },
  response: {
    label: "A customer response system",
    summary: "The same questions are being answered manually when the first response could be systemised.",
    impact: ["Quicker answers", "Less interruption", "More consistent replies", "Better customer experience"],
    href: "/ops/problems/we-lose-customers",
  },
}

type RecommendationKey = keyof typeof recommendations

export function RoutineFinderButton({
  label = "Start the diagnostic",
  variant = "primary",
  className = "",
}: {
  label?: string
  variant?: "nav" | "primary" | "secondary" | "band" | "footer"
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    const openFinder = () => setOpen(true)
    button.addEventListener("click", openFinder)

    return () => {
      button.removeEventListener("click", openFinder)
    }
  }, [])

  return (
    <>
      <button ref={buttonRef} type="button" onClick={() => setOpen(true)} className={`${buttonClass(variant)} ${className}`}>
        {label}
        <ArrowRight className={variant === "footer" ? "size-6" : "size-4"} strokeWidth={3} />
      </button>
      {open && typeof document !== "undefined" ? createPortal(<RoutineFinderModal onClose={() => setOpen(false)} />, document.body) : null}
    </>
  )
}

function buttonClass(variant: "nav" | "primary" | "secondary" | "band" | "footer") {
  const base = "group inline-flex items-center justify-center font-black transition-transform duration-200 hover:-translate-y-0.5"
  const styles = {
    nav: "relative h-11 gap-3 rounded-full bg-[#070707] px-5 text-[11px] text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)]",
    primary: "h-12 gap-4 rounded-full bg-[#070707] px-6 text-[11px] text-white shadow-[0_18px_36px_rgba(0,0,0,0.16)] lg:h-14 lg:px-7 lg:text-[12px]",
    secondary: "h-12 gap-3 rounded-full border border-black/20 px-5 text-[11px] text-black lg:h-14 lg:text-[12px]",
    band: "h-12 gap-5 rounded-full bg-[#070707] px-8 text-[11px] text-white shadow-[0_15px_30px_rgba(0,0,0,0.16)]",
    footer: "h-16 w-full gap-6 rounded-full bg-[#070707] px-8 text-[15px] text-white shadow-[0_18px_36px_rgba(0,0,0,0.18)]",
  }

  return `${base} ${styles[variant]}`
}

function RoutineFinderModal({ onClose }: { onClose: () => void }) {
  const [answers, setAnswers] = useState<Partial<Record<StepKey, string>>>({})
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<"questions" | "loading" | "result">("questions")

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const activeStep = steps[stepIndex]
  const recommendation = useMemo(() => getRecommendation(answers), [answers])
  const progress = phase === "result" ? 100 : ((stepIndex + 1) / steps.length) * 100

  function choose(option: string) {
    const nextAnswers = { ...answers, [activeStep.key]: option }
    setAnswers(nextAnswers)

    if (stepIndex === steps.length - 1) {
      setPhase("loading")
      window.setTimeout(() => setPhase("result"), 820)
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

  function restart() {
    setAnswers({})
    setStepIndex(0)
    setPhase("questions")
  }

  return (
    <div className={`${routineMarker.variable} ${routineHighlight.variable} fixed inset-0 z-[80] bg-[#fbfbfa] text-[#070707]`} role="dialog" aria-modal="true" aria-label="Sorted Diagnostic">
      <div className="flex min-h-screen flex-col">
        <header className="mx-auto flex w-full max-w-[1220px] items-center justify-between px-5 py-5 sm:px-8">
          <button type="button" onClick={back} className="inline-flex h-11 items-center gap-2 rounded-full border border-black/15 px-4 text-[12px] font-black disabled:opacity-30" disabled={phase === "questions" && stepIndex === 0}>
            <ArrowLeft className="size-4" strokeWidth={2.5} />
            Back
          </button>
          <div className="w-[44%] max-w-[360px]">
            <div className="h-2 overflow-hidden rounded-full bg-black/10">
              <div className="h-full rounded-full bg-[#dfff00] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full bg-[#070707] text-white" aria-label="Close diagnostic">
            <X className="size-5" strokeWidth={2.7} />
          </button>
        </header>

        <div className="mx-auto grid w-full max-w-[1220px] flex-1 items-center px-5 py-6 sm:px-8">
          {phase === "questions" ? <QuestionStep step={activeStep} value={answers[activeStep.key]} onChoose={choose} /> : null}
          {phase === "loading" ? <LoadingStep answers={answers} /> : null}
          {phase === "result" ? <ResultStep recommendation={recommendation} answers={answers} onRestart={restart} /> : null}
        </div>
      </div>
    </div>
  )
}

function QuestionStep({ step, value, onChoose }: { step: Step; value?: string; onChoose: (option: string) => void }) {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <p className="text-[12px] font-black text-black/45">{step.kicker}</p>
        <h2 className="mt-5 max-w-[640px] [font-family:var(--font-v2-marker)] text-[clamp(3.3rem,7.2vw,7.6rem)] font-normal uppercase leading-[0.92] tracking-[0]">
          {step.question}
        </h2>
        <div className="mt-6 h-[4px] w-80 max-w-full rounded-full bg-[#ff73d2]" />
      </div>

      <div className="grid gap-3">
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
  const observations = [
    answers.industry ? `${answers.industry} businesses usually lose time in handoffs.` : "Looking at the business type.",
    answers.frustration ? answers.frustration : "Checking the routine pattern.",
    answers.owner === "Nobody consistently" ? "Ownership looks like the first weak point." : "Checking who owns the routine.",
  ]

  return (
    <section className="mx-auto max-w-[760px] text-center">
      <Loader2 className="mx-auto size-12 animate-spin text-[#acc500]" strokeWidth={2.6} />
      <h2 className="mt-7 [font-family:var(--font-v2-marker)] text-[clamp(3.2rem,7vw,6.8rem)] uppercase leading-[0.92]">Looking for routines...</h2>
      <div className="mx-auto mt-8 grid max-w-[560px] gap-3">
        {observations.map((item) => (
          <p key={item} className="rounded-full bg-white px-5 py-3 text-[13px] font-black shadow-[0_12px_32px_rgba(0,0,0,0.05)]">
            {item}
          </p>
        ))}
      </div>
    </section>
  )
}

function ResultStep({
  recommendation,
  answers,
  onRestart,
}: {
  recommendation: (typeof recommendations)[RecommendationKey]
  answers: Partial<Record<StepKey, string>>
  onRestart: () => void
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
      <div>
        <p className="text-[12px] font-black text-black/45">Diagnosis</p>
        <h2 className="mt-5 [font-family:var(--font-v2-marker)] text-[clamp(3.4rem,7vw,7.4rem)] font-normal uppercase leading-[0.92] tracking-[0]">
          We would start here.
        </h2>
        <div className="mt-6 h-[4px] w-80 max-w-full rounded-full bg-[#ff73d2]" />
        <p className="mt-7 max-w-[520px] text-[16px] font-bold leading-[1.55] tracking-[-0.03em]">
          Based on what you told us, the first system worth installing is probably <span className="bg-[#dfff00] px-1 font-black">{recommendation.label}</span>.
        </p>
      </div>

      <div className="rounded-[20px] bg-[#f7efe3] p-5 shadow-[0_22px_55px_rgba(20,14,8,0.13)] sm:p-7">
        <div className="rounded-[16px] bg-white p-5">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#070707] text-white">
              <Search className="size-6" strokeWidth={2.4} />
            </span>
            <div>
              <p className="[font-family:var(--font-v2-marker)] text-[2rem] uppercase leading-none">{recommendation.label}</p>
              <p className="mt-3 text-[13px] font-bold leading-[1.5] text-black/65">{recommendation.summary}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {recommendation.impact.map((item) => (
              <p key={item} className="flex gap-2 text-[12px] font-black">
                <Check className="mt-0.5 size-4 shrink-0 text-[#a8c000]" strokeWidth={4} />
                {item}
              </p>
            ))}
          </div>
        </div>

        <form className="mt-4 grid gap-3 rounded-[16px] bg-[#070707] p-5 text-white">
          <p className="[font-family:var(--font-v2-marker)] text-[1.9rem] uppercase leading-none">Send us what you found.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <input className="h-12 rounded-xl border-0 bg-white px-4 text-[12px] font-bold text-black outline-none placeholder:text-black/35" placeholder="Business name" />
            <input className="h-12 rounded-xl border-0 bg-white px-4 text-[12px] font-bold text-black outline-none placeholder:text-black/35" placeholder="Website" />
            <input className="h-12 rounded-xl border-0 bg-white px-4 text-[12px] font-bold text-black outline-none placeholder:text-black/35" placeholder="Email" />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href={recommendation.href} className="inline-flex h-11 items-center gap-3 rounded-full bg-[#dfff00] px-5 text-[11px] font-black text-black">
              See what we would build first
              <ArrowRight className="size-4" strokeWidth={3} />
            </a>
            <button type="button" onClick={onRestart} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-[11px] font-black">
              <RotateCcw className="size-4" strokeWidth={2.6} />
              Start again
            </button>
          </div>
        </form>

        <p className="mt-4 flex items-center gap-2 text-[11px] font-black text-black/55">
          <MessageCircle className="size-4" strokeWidth={2.5} />
          No obligation. No jargon. Just the right first system.
        </p>
      </div>
    </section>
  )
}

function getRecommendation(answers: Partial<Record<StepKey, string>>): (typeof recommendations)[RecommendationKey] {
  const frustration = answers.frustration || ""

  if (frustration.includes("reviews")) return recommendations.reviews
  if (frustration.includes("admin")) return recommendations.admin
  if (frustration.includes("same questions")) return recommendations.response
  return recommendations.enquiry
}
