"use client"

import { useState } from "react"

interface FormData {
  websiteUrl: string
  businessDescription: string
  email: string
  hasWebsite: boolean
}

// Formspree form ID - replace with your own at formspree.io
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xpwplvba"

export default function IntakeAgent() {
  const [form, setForm] = useState<FormData>({
    websiteUrl: "",
    businessDescription: "",
    email: "",
    hasWebsite: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const canSubmit =
    form.email.length > 5 &&
    form.email.includes("@") &&
    (form.hasWebsite
      ? form.websiteUrl.length > 4
      : form.businessDescription.length > 10)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: JSON.stringify({
          websiteUrl: form.hasWebsite ? form.websiteUrl : "(no website)",
          businessDescription: form.businessDescription || "(none provided)",
          email: form.email,
          _replyto: form.email,
        }),
      })
    } catch {
      // Silently fail - user sees confirmation either way
    }
    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  if (isSubmitted) {
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
            Expect your mockup within 48 hours. If you have questions in the meantime, just reply to the confirmation email.
          </p>
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
            Everything starts with your website.
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Toggle */}
          <div className="flex gap-2 p-1 bg-black/5 rounded-xl">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, hasWebsite: true }))}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                form.hasWebsite
                  ? "bg-white text-[#0A0A0A] shadow-sm"
                  : "text-[#737373] hover:text-[#0A0A0A]"
              }`}
            >
              I have a website
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, hasWebsite: false }))}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                !form.hasWebsite
                  ? "bg-white text-[#0A0A0A] shadow-sm"
                  : "text-[#737373] hover:text-[#0A0A0A]"
              }`}
            >
              No website yet
            </button>
          </div>

          {/* Primary Input - URL or Business Description */}
          <div>
            <label className="block font-sans font-semibold text-[#0A0A0A] text-lg mb-2">
              {form.hasWebsite ? "Your website URL" : "Tell us about your business"}
            </label>
            <p className="text-sm text-[#A3A3A3] mb-4">
              {form.hasWebsite
                ? "We'll mock up something better. 48 hours, free."
                : "What do you do? We'll design from scratch."}
            </p>
            {form.hasWebsite ? (
              <input
                type="url"
                value={form.websiteUrl}
                onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))}
                placeholder="https://yourwebsite.com"
                className="w-full rounded-xl border border-black/10 bg-white text-[#0A0A0A] text-sm px-4 py-3.5 placeholder:text-[#C4C4C4] focus:outline-none focus:border-black/30 transition-colors duration-200"
              />
            ) : (
              <textarea
                value={form.businessDescription}
                onChange={(e) => setForm((f) => ({ ...f, businessDescription: e.target.value }))}
                rows={4}
                placeholder="e.g. Plumber in Manchester, 6 years trading. Need a simple site with contact form and service list."
                className="w-full rounded-xl border border-black/10 bg-white text-[#0A0A0A] text-sm px-4 py-3.5 placeholder:text-[#C4C4C4] focus:outline-none focus:border-black/30 resize-none transition-colors duration-200"
              />
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">
              Your email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-black/10 bg-white text-[#0A0A0A] text-sm px-4 py-3.5 placeholder:text-[#C4C4C4] focus:outline-none focus:border-black/30 transition-colors duration-200"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="group w-full inline-flex items-center justify-center gap-3 bg-[#0A0A0A] text-white font-semibold text-sm rounded-full px-6 py-3.5 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-all duration-300"
          >
            {isSubmitting ? "Sending..." : "Get my free mockup"}
            {!isSubmitting && (
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 8L8 2M8 2H4M8 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </button>

          <p className="text-xs text-[#A3A3A3] text-center">
            No commitment. We&apos;ll send a mockup within 48 hours. Once your site is sorted, we can handle everything else. Logos, ads, social, the lot.
          </p>
        </form>
      </div>
    </section>
  )
}
