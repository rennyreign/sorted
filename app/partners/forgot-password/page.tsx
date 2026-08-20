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
import { resetPasswordForEmail } from "@/lib/affiliateAuth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [phase, setPhase] = useState<"form" | "submitting" | "done" | "error">("form")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmed = email.trim()
    if (!trimmed) {
      setError("Please enter your email address.")
      return
    }

    setPhase("submitting")
    const result = await resetPasswordForEmail({
      email: trimmed,
      // trailingSlash: true is set in next.config.mjs, so the canonical route
      // is /partners/reset-password/. The redirectTo MUST match the URL
      // registered in Supabase's Auth → URL Configuration → Redirect URLs,
      // otherwise Supabase falls back to the project Site URL.
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/partners/reset-password/`,
    })

    if (!result.ok) {
      setError(result.error)
      setPhase("error")
      return
    }

    setPhase("done")
  }

  return (
    <AffiliatesPage>
      <AffiliatesHeader active="login" showLogin={false} />

      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="mb-5 text-[12px] font-black text-black/45">Sorted Partners Portal</p>
          <h1 className="text-[clamp(2.8rem,5.4vw,5.2rem)] font-black leading-[0.92] tracking-[-0.045em]">
            Reset your password.
          </h1>
          <Underline className="mt-2 w-[260px]" />
          <p className="mt-7 max-w-[420px] text-[16px] font-semibold leading-[1.5] tracking-[-0.02em] text-black/72">
            Enter the email you signed up with and we'll send you a secure link to choose a new password.
          </p>
        </div>

        <div className="rounded-[18px] border border-black/10 bg-white p-6 shadow-[0_18px_44px_rgba(0,0,0,0.06)] sm:p-8">
          {phase === "done" ? (
            <div className="py-6 text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#dfff00]">
                <Check className="size-8" strokeWidth={3} />
              </span>
              <h2 className="mt-6 text-[24px] font-black tracking-[-0.04em]">Check your inbox.</h2>
              <p className="mx-auto mt-4 max-w-[420px] text-[15px] font-semibold leading-[1.5] text-black/72">
                If an account exists for <span className="font-black text-black">{email}</span>, you'll receive a password reset link shortly.
              </p>
              <p className="mx-auto mt-3 max-w-[420px] text-[13px] font-semibold leading-[1.5] text-black/55">
                The link expires after a while — check your spam folder if it doesn't arrive.
              </p>
              <div className="mt-7 flex justify-center">
                <GhostButton href="/partners/login">Back to login</GhostButton>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-[12px] font-black uppercase tracking-[0.06em] text-black/55">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-12 rounded-xl border border-black/12 bg-white px-4 text-[14px] font-semibold text-black outline-none transition-colors placeholder:text-black/35 focus:border-black/40"
                />
              </label>

              {error ? (
                <p className="rounded-[12px] bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">{error}</p>
              ) : null}

              <PrimaryButton type="submit" disabled={phase === "submitting"} className="mt-1 w-full">
                {phase === "submitting" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" strokeWidth={3} /> Sending link...
                  </>
                ) : (
                  <>
                    Send reset link <ArrowRight className="size-4" strokeWidth={3} />
                  </>
                )}
              </PrimaryButton>

              <div className="mt-2 flex items-center justify-center text-[12px] font-semibold text-black/55">
                <GhostButton href="/partners/login" className="h-9 px-4 text-[11px]">
                  Back to login
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
