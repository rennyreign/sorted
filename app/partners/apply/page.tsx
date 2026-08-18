"use client"

import { useState } from "react"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import {
  AffiliatesFooter,
  AffiliatesHeader,
  AffiliatesPage,
  GhostButton,
  PrimaryButton,
  Underline,
} from "../_components/AffiliatesPrimitives"
import { signUpAffiliate } from "@/lib/affiliateAuth"

type Phase = "form" | "submitting" | "done"

export default function ApplyPage() {
  const [phase, setPhase] = useState<Phase>("form")
  const [error, setError] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [program, setProgram] = useState<"referral" | "factory" | "">("")
  const [audience, setAudience] = useState("")
  const [agree, setAgree] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!displayName.trim() || !email.trim() || !password) {
      setError("Please fill in your name, email and password.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (!program) {
      setError("Please choose the partner program that suits you.")
      return
    }
    if (!agree) {
      setError("Please agree to the partner terms to continue.")
      return
    }

    setPhase("submitting")
    const result = await signUpAffiliate({
      email: email.trim(),
      password,
      displayName: displayName.trim(),
      phone: phone.trim() || undefined,
      program: program || undefined,
    })

    if (!result.ok) {
      setError(result.error)
      setPhase("form")
      return
    }

    // Stash the optional audience context for the operator to review later.
    // (Stored only client-side for now; an operator can ask the partner
    // directly. A future iteration can write this to affiliates.metadata.)
    if (audience.trim()) {
      try {
        sessionStorage.setItem(`affiliate_apply_audience:${result.userId}`, audience.trim())
      } catch {
        // ignore, non-critical
      }
    }

    setPhase("done")
  }

  return (
    <AffiliatesPage>
      <AffiliatesHeader active="apply" />

      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="mb-5 text-[12px] font-black text-black/45">Apply to become a partner</p>
          <h1 className="text-[clamp(2.8rem,5.4vw,5.2rem)] font-black leading-[0.92] tracking-[-0.045em]">
            Two minutes.
            <br />
            That's it.
          </h1>
          <Underline className="mt-2 w-[260px]" />
          <p className="mt-7 max-w-[420px] text-[16px] font-semibold leading-[1.5] tracking-[-0.02em] text-black/72">
            Tell us who you are and how you'd reach small businesses. We review every application personally and approve within 48 hours.
          </p>
          <ul className="mt-7 grid gap-3 text-[13px] font-bold text-black/72">
            {[
              "Free to join. No fees, no minimums.",
              "Earn £75–£300 per closed website",
              "Track every referral in the Sorted Partners Portal",
              "Get paid by bank transfer when a client purchases",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Check className="size-5 rounded-full bg-[#dfff00] p-1" strokeWidth={3.5} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[18px] border border-black/10 bg-white p-6 shadow-[0_18px_44px_rgba(0,0,0,0.06)] sm:p-8">
          {phase === "done" ? (
            <ApplyDone email={email} />
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Field label="Your name" required>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className={inputClass}
                  autoComplete="name"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" required>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Phone (optional)">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 ..."
                    className={inputClass}
                    autoComplete="tel"
                  />
                </Field>
              </div>
              <Field label="Password" required hint="At least 6 characters. Used to sign in to the Sorted Partners Portal.">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className={inputClass}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Partner program" required hint="Choose the path that fits how you want to earn.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ProgramOption
                    selected={program === "referral"}
                    onSelect={() => setProgram("referral")}
                    title="Referral Partner"
                    description="You refer businesses and earn commission."
                  />
                  <ProgramOption
                    selected={program === "factory"}
                    onSelect={() => setProgram("factory")}
                    title="Factory Partner"
                    description="You set the price and keep the margin."
                  />
                </div>
              </Field>

              <Field label="How will you reach businesses? (optional)" hint="Tell us about your network: local groups, social following, trade associations, existing clients, etc.">
                <textarea
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. I run a local business networking group in Manchester with 200+ members..."
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </Field>

              <label className="flex items-start gap-3 text-[13px] font-semibold leading-[1.5] text-black/72">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 size-5 accent-[#070707]"
                />
                <span>
                  I agree to the{" "}
                  <a href="/partners/selling-sorted" className="font-black underline underline-offset-2">
                    partner terms
                  </a>{" "}
                  and confirm the information above is accurate. I understand payouts are made when a referred client purchases a Sorted website.
                </span>
              </label>

              {error ? (
                <p className="rounded-[12px] bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">{error}</p>
              ) : null}

              <PrimaryButton type="submit" disabled={phase === "submitting"} className="mt-1 w-full">
                {phase === "submitting" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" strokeWidth={3} /> Submitting...
                  </>
                ) : (
                  <>
                    Submit application <ArrowRight className="size-4" strokeWidth={3} />
                  </>
                )}
              </PrimaryButton>

              <div className="mt-2 flex items-center justify-between text-[12px] font-semibold text-black/55">
                <span>Already a partner?</span>
                <GhostButton href="/partners/login" className="h-9 px-4 text-[11px]">
                  Sign in
                </GhostButton>
              </div>
            </form>
          )}
        </div>
      </section>

      <AffiliatesFooter />
    </AffiliatesPage>
  )
}

function ApplyDone({ email }: { email: string }) {
  return (
    <div className="text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#dfff00]">
        <Check className="size-8" strokeWidth={3} />
      </span>
      <h2 className="mt-6 text-[28px] font-black tracking-[-0.04em]">Application received.</h2>
      <p className="mx-auto mt-4 max-w-[420px] text-[15px] font-semibold leading-[1.5] text-black/72">
        Thanks, your application is in. We'll review it personally and email{" "}
        <span className="font-black text-black">{email}</span> within 48 hours once your account is approved.
      </p>
      <p className="mx-auto mt-3 max-w-[420px] text-[13px] font-semibold leading-[1.5] text-black/55">
        You'll also receive a confirmation email from Supabase — please click the link in it to verify your address. Once approved, you can sign in to submit your first mockup request.
      </p>
      <div className="mt-7 flex justify-center">
        <GhostButton href="/partners/login">Go to login</GhostButton>
      </div>
    </div>
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

function ProgramOption({
  selected,
  onSelect,
  title,
  description,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
        selected
          ? "border-[#070707] bg-[#dfff00]"
          : "border-black/12 bg-white hover:border-black/25"
      }`}
    >
      <span
        className={`mt-0.5 grid size-5 place-items-center rounded-full border ${
          selected ? "border-[#070707] bg-[#070707]" : "border-black/25"
        }`}
      >
        {selected ? <span className="size-2.5 rounded-full bg-[#dfff00]" /> : null}
      </span>
      <div>
        <p className="text-[14px] font-black">{title}</p>
        <p className="text-[12px] font-semibold leading-[1.45] text-black/65">{description}</p>
      </div>
    </button>
  )
}
