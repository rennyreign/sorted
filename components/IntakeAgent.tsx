"use client"

import { useState } from "react"

type Step = 1 | 2 | 3 | 4 | 5 | 6

interface FormData {
  whatYouNeed: string
  business: string
  timeline: string
  contactMethod: "email" | "phone" | null
  contactValue: string
}

const timelines = [
  "As soon as possible",
  "Within a week",
  "Within a month",
  "No rush, just exploring",
]

// Formspree form ID - replace with your own at formspree.io
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xpwplvba"

export default function IntakeAgent() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>({ 
    whatYouNeed: "", 
    business: "", 
    timeline: "",
    contactMethod: null,
    contactValue: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canAdvance =
    (step === 1 && form.whatYouNeed.trim().length > 3) ||
    (step === 2 && form.business.trim().length > 1) ||
    step === 3 ||
    (step === 4 && form.timeline.length > 0) ||
    (step === 5 && form.contactMethod && form.contactValue.length > 3)

  async function advance() {
    if (step < 5) {
      setStep((s) => (s + 1) as Step)
    } else {
      // Final step - submit form
      setIsSubmitting(true)
      try {
        await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: JSON.stringify({
            whatYouNeed: form.whatYouNeed,
            business: form.business,
            timeline: form.timeline,
            contactMethod: form.contactMethod,
            contactValue: form.contactValue,
            _replyto: form.contactMethod === "email" ? form.contactValue : "noreply@sortmydigital.site",
          }),
        })
      } catch {
        // Silently fail - user sees confirmation either way
      }
      setStep(6)
      setIsSubmitting(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && canAdvance) {
      e.preventDefault()
      advance()
    }
  }

  if (step === 5) {
    return (
      <section id="get-started" className="py-32 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div>
            <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4">
              Almost done
            </span>
            <h2 className="font-sans font-extrabold text-[#0A0A0A] text-4xl lg:text-5xl leading-tight tracking-tight">
              How should we reach you?
            </h2>
          </div>
          <div>
            <p className="text-[#737373] text-base leading-relaxed mb-8">
              We&apos;ll review your brief and send you a proper quote. No commitment needed.
            </p>

            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, contactMethod: "email", contactValue: "" }))}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-center gap-4 ${
                  form.contactMethod === "email"
                    ? "border-[#0A0A0A] bg-[#0A0A0A] text-white"
                    : "border-black/10 text-[#0A0A0A] hover:border-black/30 bg-white"
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={form.contactMethod === "email" ? "text-white" : "text-[#A3A3A3]"}>
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span className="font-medium">Email me</span>
              </button>
              
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, contactMethod: "phone", contactValue: "" }))}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-center gap-4 ${
                  form.contactMethod === "phone"
                    ? "border-[#0A0A0A] bg-[#0A0A0A] text-white"
                    : "border-black/10 text-[#0A0A0A] hover:border-black/30 bg-white"
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={form.contactMethod === "phone" ? "text-white" : "text-[#A3A3A3]"}>
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.22 9.77a19.79 19.79 0 01-3.07-8.67A2 2 0 012.13 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-medium">Text me</span>
              </button>
            </div>

            {form.contactMethod && (
              <div className="mb-6">
                <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">
                  Your {form.contactMethod === "email" ? "email" : "mobile number"}
                </label>
                <input
                  autoFocus
                  type={form.contactMethod === "email" ? "email" : "tel"}
                  value={form.contactValue}
                  onChange={(e) => setForm((f) => ({ ...f, contactValue: e.target.value }))}
                  onKeyDown={handleKey}
                  placeholder={form.contactMethod === "email" ? "you@example.com" : "+44 7123 456789"}
                  className="w-full rounded-xl border border-black/10 bg-white text-[#0A0A0A] text-sm px-4 py-3.5 placeholder:text-[#C4C4C4] focus:outline-none focus:border-black/30 transition-colors duration-200"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="text-sm font-medium text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors duration-200"
              >
                Back
              </button>

              <button
                type="button"
                onClick={advance}
                disabled={!canAdvance || isSubmitting}
                className="group inline-flex items-center gap-3 bg-[#0A0A0A] text-white font-semibold text-sm rounded-full px-6 py-3.5 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-all duration-300"
              >
                {isSubmitting ? "Sending..." : "Send my quote"}
                {!isSubmitting && (
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 8L8 2M8 2H4M8 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (step === 6) {
    return (
      <section id="get-started" className="py-32 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
        <div className="max-w-xl">
          <div className="w-10 h-10 rounded-full bg-[#0A0A0A] flex items-center justify-center mb-8">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5L6 11.5L13 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4">
            Submitted
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-4xl lg:text-5xl leading-tight tracking-tight mb-4">
            We&apos;ll be in touch.
          </h2>
          <p className="text-[#737373] text-base leading-relaxed mb-8">
            We&apos;ve got your brief. You&apos;ll receive a quote within the next 2 minutes.
          </p>
          <a
            href="https://wa.me/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#525252] hover:text-[#0A0A0A] transition-colors duration-200"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Prefer to chat on WhatsApp?
          </a>
        </div>
      </section>
    )
  }

  return (
    <section id="get-started" className="py-32 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        <div>
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4">
            Get sorted
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-4xl lg:text-5xl leading-tight tracking-tight">
            Tell us what you need.
          </h2>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-10">
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${n <= step ? "bg-[#0A0A0A]" : "bg-black/10"}`} />
                {n < 5 && <div className="w-6 h-px bg-black/10" />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <label className="block font-sans font-bold text-[#0A0A0A] text-xl mb-2">
                What do you need?
              </label>
              <p className="text-sm text-[#A3A3A3] mb-5">
                A sentence is enough. Be as vague or specific as you like.
              </p>
              <textarea
                autoFocus
                value={form.whatYouNeed}
                onChange={(e) => setForm((f) => ({ ...f, whatYouNeed: e.target.value }))}
                onKeyDown={handleKey}
                rows={4}
                placeholder="e.g. I need a simple website for my plumbing business..."
                className="w-full rounded-xl border border-black/10 bg-white text-[#0A0A0A] text-sm px-4 py-3.5 placeholder:text-[#C4C4C4] focus:outline-none focus:border-black/30 resize-none transition-colors duration-200"
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block font-sans font-bold text-[#0A0A0A] text-xl mb-2">
                What&apos;s your business?
              </label>
              <p className="text-sm text-[#A3A3A3] mb-5">
                What do you do? Just a short description.
              </p>
              <input
                autoFocus
                type="text"
                value={form.business}
                onChange={(e) => setForm((f) => ({ ...f, business: e.target.value }))}
                onKeyDown={handleKey}
                placeholder="e.g. Plumber in Manchester, 6 years trading"
                className="w-full rounded-xl border border-black/10 bg-white text-[#0A0A0A] text-sm px-4 py-3.5 placeholder:text-[#C4C4C4] focus:outline-none focus:border-black/30 transition-colors duration-200"
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="block font-sans font-bold text-[#0A0A0A] text-xl mb-2">
                Do you have anything already?
              </label>
              <p className="text-sm text-[#A3A3A3] mb-5">
                Logo, existing site, brand colours. Anything useful. Optional.
              </p>
              <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-black/10 px-4 py-10 cursor-pointer hover:border-black/30 transition-colors duration-200 group">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#A3A3A3] group-hover:text-[#0A0A0A] transition-colors">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm text-[#A3A3A3] group-hover:text-[#0A0A0A] transition-colors">Upload files</span>
                <input type="file" multiple className="sr-only" />
              </label>
              <p className="mt-3 text-xs text-[#C4C4C4]">PNG, JPG, PDF, up to 10MB each</p>
            </div>
          )}

          {step === 4 && (
            <div>
              <label className="block font-sans font-bold text-[#0A0A0A] text-xl mb-5">
                When do you need it?
              </label>
              <div className="space-y-2">
                {timelines.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, timeline: t }))}
                    className={`w-full text-left text-sm font-medium px-4 py-3.5 rounded-xl border transition-all duration-200 ${
                      form.timeline === t
                        ? "border-transparent bg-[#0A0A0A] text-white"
                        : "border-black/10 text-[#0A0A0A] hover:border-black/30 bg-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="text-sm font-medium text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors duration-200"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={advance}
              disabled={!canAdvance}
              className="group inline-flex items-center gap-3 bg-[#0A0A0A] text-white font-semibold text-sm rounded-full px-6 py-3 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              Next
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 8L8 2M8 2H4M8 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
          </div>

          {step === 3 && (
            <button
              type="button"
              onClick={advance}
              className="mt-3 text-sm font-medium text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors duration-200"
            >
              Skip this step
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
