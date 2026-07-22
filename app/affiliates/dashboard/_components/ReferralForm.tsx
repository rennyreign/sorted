"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { affiliateDb, type BusinessStage, type MockupBrief } from "@/lib/affiliateClient"
import { BUSINESS_STAGE_META } from "@/lib/affiliateClient"
import { formatGbp, payoutForStage } from "@/lib/affiliatePayouts"

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
    question: "What are they working with right now?",
    options: ["No website yet", "An old website", "A site they don't like", "A DIY website", "A website that doesn't bring enquiries"],
  },
  {
    key: "goal",
    kicker: "Question 3 of 5",
    question: "What should the new site help them do?",
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
    question: "How soon would they like to see a mockup?",
    options: ["Today if possible", "Within 24 hours", "This week", "No rush, they're exploring"],
  },
]

export function ReferralForm({
  affiliateId,
  onDone,
  onCancel,
}: {
  affiliateId: string
  onDone: (referralId: number) => void
  onCancel: () => void
}) {
  const [phase, setPhase] = useState<"questions" | "details" | "submitting" | "error">("questions")
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<Record<StepKey, string>>>({})
  const [error, setError] = useState<string | null>(null)

  // Business details captured after the 5 questions
  const [businessName, setBusinessName] = useState("")
  const [contactName, setContactName] = useState("")
  const [businessEmail, setBusinessEmail] = useState("")
  const [businessPhone, setBusinessPhone] = useState("")
  const [currentWebsite, setCurrentWebsite] = useState("")
  const [stage, setStage] = useState<BusinessStage>("new")
  const [businessDescription, setBusinessDescription] = useState("")

  const activeStep = steps[stepIndex]
  const progress = phase === "details" ? 100 : ((stepIndex + 1) / steps.length) * 100

  function choose(option: string) {
    const next = { ...answers, [activeStep.key]: option }
    setAnswers(next)
    if (stepIndex === steps.length - 1) {
      setPhase("details")
      return
    }
    setStepIndex((c) => c + 1)
  }

  function back() {
    setError(null)
    if (phase === "details") {
      setPhase("questions")
      setStepIndex(steps.length - 1)
      return
    }
    setStepIndex((c) => Math.max(0, c - 1))
  }

  async function submit() {
    setError(null)
    if (!businessName.trim()) {
      setError("Please enter the business name.")
      return
    }
    if (!businessEmail.trim() && !businessPhone.trim()) {
      setError("Please add at least an email or phone number for the business.")
      return
    }

    setPhase("submitting")
    const brief: MockupBrief = {
      business: answers.business,
      currentSite: answers.currentSite,
      goal: answers.goal,
      style: answers.style,
      timeline: answers.timeline,
      description: businessDescription.trim() || undefined,
    }

    const { data, error: dbError } = await affiliateDb
      .from("affiliate_referrals")
      .insert({
        affiliate_id: affiliateId,
        business_name: businessName.trim(),
        business_contact_name: contactName.trim() || null,
        business_email: businessEmail.trim() || null,
        business_phone: businessPhone.trim() || null,
        current_website: currentWebsite.trim() || null,
        business_stage: stage,
        mockup_brief: brief,
        status: "mockup_requested",
      })
      .select("id")
      .single()

    if (dbError || !data) {
      setError(dbError?.message ?? "Could not submit your request. Please try again.")
      setPhase("error")
      return
    }

    onDone(data.id as number)
  }

  return (
    <div className="rounded-[18px] border border-black/10 bg-white p-6 shadow-[0_18px_44px_rgba(0,0,0,0.06)] sm:p-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={back}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-black/15 px-4 text-[12px] font-black disabled:opacity-30"
          disabled={phase === "submitting" || (phase === "questions" && stepIndex === 0)}
        >
          <ArrowLeft className="size-4" strokeWidth={2.5} />
          Back
        </button>
        <div className="w-[44%] max-w-[360px]">
          <div className="h-2 overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-[#dfff00] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      {phase === "questions" ? (
        <QuestionStep step={activeStep} value={answers[activeStep.key]} onChoose={choose} />
      ) : phase === "details" ? (
        <DetailsStep
          answers={answers}
          stage={stage}
          setStage={setStage}
          businessName={businessName}
          setBusinessName={setBusinessName}
          contactName={contactName}
          setContactName={setContactName}
          businessEmail={businessEmail}
          setBusinessEmail={setBusinessEmail}
          businessPhone={businessPhone}
          setBusinessPhone={setBusinessPhone}
          currentWebsite={currentWebsite}
          setCurrentWebsite={setCurrentWebsite}
          businessDescription={businessDescription}
          setBusinessDescription={setBusinessDescription}
          error={error}
          submitting={false}
          onSubmit={submit}
          onCancel={onCancel}
        />
      ) : phase === "submitting" ? (
        <div className="py-12 text-center">
          <Loader2 className="mx-auto size-10 animate-spin text-[#bdd900]" strokeWidth={3} />
          <p className="mt-5 text-[15px] font-bold">Submitting your mockup request...</p>
        </div>
      ) : phase === "error" ? (
        <div className="py-8 text-center">
          <p className="rounded-[12px] bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setPhase("details")}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#070707] px-5 text-[12px] font-black text-white"
          >
            Try again
          </button>
        </div>
      ) : null}
    </div>
  )
}

function QuestionStep({ step, value, onChoose }: { step: Step; value?: string; onChoose: (o: string) => void }) {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <p className="text-[12px] font-black text-black/45">{step.kicker}</p>
        <h2 className="mt-5 max-w-[650px] [font-family:var(--font-aff-marker)] text-[clamp(2.6rem,5.6vw,5.4rem)] font-normal uppercase leading-[0.92]">
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
            className={`group grid min-h-[68px] grid-cols-[1fr_auto] items-center rounded-[16px] border bg-white px-5 text-left text-[16px] font-black tracking-[-0.03em] shadow-[0_14px_40px_rgba(0,0,0,0.035)] transition-all hover:-translate-y-0.5 hover:border-black ${
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

function DetailsStep({
  answers,
  stage,
  setStage,
  businessName,
  setBusinessName,
  contactName,
  setContactName,
  businessEmail,
  setBusinessEmail,
  businessPhone,
  setBusinessPhone,
  currentWebsite,
  setCurrentWebsite,
  businessDescription,
  setBusinessDescription,
  error,
  submitting,
  onSubmit,
  onCancel,
}: {
  answers: Partial<Record<StepKey, string>>
  stage: BusinessStage
  setStage: (s: BusinessStage) => void
  businessName: string
  setBusinessName: (s: string) => void
  contactName: string
  setContactName: (s: string) => void
  businessEmail: string
  setBusinessEmail: (s: string) => void
  businessPhone: string
  setBusinessPhone: (s: string) => void
  currentWebsite: string
  setCurrentWebsite: (s: string) => void
  businessDescription: string
  setBusinessDescription: (s: string) => void
  error: string | null
  submitting: boolean
  onSubmit: () => void
  onCancel: () => void
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <div>
        <p className="text-[12px] font-black text-black/45">Almost there. Tell us about the business</p>
        <h2 className="mt-5 [font-family:var(--font-aff-marker)] text-[clamp(2.6rem,5.4vw,5rem)] uppercase leading-[0.92]">
          Who are we designing for?
        </h2>
        <div className="mt-6 h-[4px] w-80 max-w-full rounded-full bg-[#ff73d2]" />
        <p className="mt-6 max-w-[460px] text-[15px] font-bold leading-[1.5] text-black/72">
          We'll build a free mockup from your answers. The business sees it before paying anything, and you'll see the projected payout for this stage right away.
        </p>
        <div className="mt-6 rounded-[14px] bg-[#f7f1e8] p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-black/50">Your brief so far</p>
          <ul className="mt-3 grid gap-2 text-[13px] font-semibold text-black/72">
            <li><span className="font-black text-black">Type:</span> {answers.business ?? "—"}</li>
            <li><span className="font-black text-black">Now:</span> {answers.currentSite ?? "—"}</li>
            <li><span className="font-black text-black">Goal:</span> {answers.goal ?? "—"}</li>
            <li><span className="font-black text-black">Style:</span> {answers.style ?? "—"}</li>
            <li><span className="font-black text-black">Timeline:</span> {answers.timeline ?? "—"}</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4">
        <Field label="Business name" required>
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. The Yard Training Club" className={inputClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact name">
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Owner or decision-maker" className={inputClass} />
          </Field>
          <Field label="Current website (if any)">
            <input value={currentWebsite} onChange={(e) => setCurrentWebsite(e.target.value)} placeholder="https://..." className={inputClass} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business email">
            <input type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="them@business.co.uk" className={inputClass} />
          </Field>
          <Field label="Business phone">
            <input type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="+44 ..." className={inputClass} />
          </Field>
        </div>

        <fieldset className="grid gap-3">
          <legend className="text-[12px] font-black uppercase tracking-[0.06em] text-black/55">Business stage <span className="text-[#dfff00] bg-[#070707] ml-1 px-1 rounded text-[10px]">sets your payout</span></legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["new", "growing", "established"] as const).map((s) => {
              const meta = BUSINESS_STAGE_META[s]
              const selected = stage === s
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStage(s)}
                  className={`rounded-[14px] border p-4 text-left transition-all hover:-translate-y-0.5 ${
                    selected ? "border-black bg-[#dfff00] shadow-[0_14px_30px_rgba(0,0,0,0.12)]" : "border-black/10 bg-white hover:border-black/30"
                  }`}
                >
                  <p className="text-[14px] font-black tracking-[-0.03em]">{meta.label}</p>
                  <p className="mt-1 text-[11px] font-semibold text-black/55">{meta.description}</p>
                  <p className="mt-3 text-[20px] font-black tracking-[-0.04em]">{formatGbp(payoutForStage(s))}</p>
                  <p className="text-[10px] font-black uppercase text-black/45">your payout</p>
                </button>
              )
            })}
          </div>
        </fieldset>

        <Field label="About the business" hint="What does the business do? Services, customers, location, anything that helps us design a better mockup.">
          <textarea
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            placeholder="e.g. Mobile dog grooming covering South Manchester. They do house visits, mainly working with anxious rescue dogs. Want to look professional and get bookings through the website."
            rows={4}
            className={`${inputClass} resize-none !h-auto py-3`}
          />
        </Field>

        {error ? <p className="rounded-[12px] bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">{error}</p> : null}

        <div className="mt-1 flex items-center justify-between gap-3">
          <button type="button" onClick={onCancel} className="text-[12px] font-black text-black/55 hover:text-black">
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="inline-flex h-[52px] items-center justify-center gap-3 rounded-full bg-[#070707] px-7 text-[12px] font-black text-white shadow-[0_18px_36px_rgba(0,0,0,0.16)] transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-40"
          >
            Submit mockup request <ArrowRight className="size-4" strokeWidth={3} />
          </button>
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[12px] font-black uppercase tracking-[0.06em] text-black/55">
        {label}
        {required ? <span className="text-[#dfff00] bg-[#070707] ml-1 px-1 rounded text-[10px]">required</span> : null}
      </span>
      {children}
      {hint ? <span className="text-[12px] font-semibold text-black/50">{hint}</span> : null}
    </label>
  )
}

const inputClass =
  "h-12 rounded-xl border border-black/12 bg-white px-4 text-[14px] font-semibold text-black outline-none transition-colors placeholder:text-black/35 focus:border-black/40"
