"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import {
  AffiliatesFooter,
  AffiliatesHeader,
  AffiliatesPage,
  GhostButton,
  PrimaryButton,
  Underline,
} from "../_components/AffiliatesPrimitives"
import { getCurrentAffiliate, signInAffiliate } from "@/lib/affiliateAuth"
import type { Affiliate } from "@/lib/affiliateClient"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<"form" | "submitting" | "redirecting" | "pending" | "suspended">("form")
  const [pendingName, setPendingName] = useState<string | null>(null)

  // If already signed in, jump straight to the dashboard.
  useEffect(() => {
    let active = true
    ;(async () => {
      const aff = await getCurrentAffiliate()
      if (!active || !aff) return
      if (aff.status === "active") {
        setPhase("redirecting")
        window.location.href = "/partners/dashboard"
      } else if (aff.status === "pending") {
        setPendingName(aff.display_name)
        setPhase("pending")
      } else if (aff.status === "suspended") {
        setPhase("suspended")
      }
    })()
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError("Please enter your email and password.")
      return
    }
    setPhase("submitting")
    const result = await signInAffiliate({ email: email.trim(), password })
    if (!result.ok) {
      setError(result.error)
      setPhase("form")
      return
    }

    // Check account status before redirecting.
    const aff = await getCurrentAffiliate()
    if (!aff) {
      // The trigger should have created the row; if not, treat as pending.
      setPhase("pending")
      return
    }
    if (aff.status === "active") {
      window.location.href = "/partners/dashboard"
      return
    }
    if (aff.status === "pending") {
      setPendingName(aff.display_name)
      setPhase("pending")
      return
    }
    if (aff.status === "suspended") {
      setPhase("suspended")
      return
    }
  }

  return (
    <AffiliatesPage>
      <AffiliatesHeader active="login" showLogin={false} />

      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="mb-5 text-[12px] font-black text-black/45">Sorted Partners Portal</p>
          <h1 className="text-[clamp(2.8rem,5.4vw,5.2rem)] font-black leading-[0.92] tracking-[-0.045em]">
            Welcome back.
          </h1>
          <Underline className="mt-2 w-[260px]" />
          <p className="mt-7 max-w-[420px] text-[16px] font-semibold leading-[1.5] tracking-[-0.02em] text-black/72">
            Sign in to submit mockup requests, track your referrals, and see your earnings.
          </p>
        </div>

        <div className="rounded-[18px] border border-black/10 bg-white p-6 shadow-[0_18px_44px_rgba(0,0,0,0.06)] sm:p-8">
          {phase === "redirecting" ? (
            <CenteredMessage>
              <Loader2 className="mx-auto size-8 animate-spin text-[#bdd900]" strokeWidth={3} />
              <p className="mt-5 text-[15px] font-bold">Taking you to your dashboard...</p>
            </CenteredMessage>
          ) : phase === "pending" ? (
            <CenteredMessage>
              <h2 className="text-[24px] font-black tracking-[-0.04em]">Account pending approval.</h2>
              <p className="mx-auto mt-4 max-w-[420px] text-[14px] font-semibold leading-[1.5] text-black/72">
                Hi{pendingName ? ` ${pendingName}` : ""}, your application is in. We review every partner personally and will email you within 48 hours once your account is approved.
              </p>
              <div className="mt-6">
                <GhostButton href="/partners">Back to home</GhostButton>
              </div>
            </CenteredMessage>
          ) : phase === "suspended" ? (
            <CenteredMessage>
              <h2 className="text-[24px] font-black tracking-[-0.04em]">Account suspended.</h2>
              <p className="mx-auto mt-4 max-w-[420px] text-[14px] font-semibold leading-[1.5] text-black/72">
                Your partner account has been suspended. If you believe this is a mistake, email{" "}
                <a href="mailto:hello@sortmydigital.site" className="font-black underline">
                  hello@sortmydigital.site
                </a>
                .
              </p>
            </CenteredMessage>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                  autoComplete="email"
                />
              </Field>
              <Field
                label="Password"
                right={
                  <a href="/partners/forgot-password" className="text-[11px] font-black text-black/55 underline underline-offset-2 hover:text-black">
                    Forgot password?
                  </a>
                }
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className={inputClass}
                  autoComplete="current-password"
                />
              </Field>

              {error ? (
                <p className="rounded-[12px] bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">{error}</p>
              ) : null}

              <PrimaryButton type="submit" disabled={phase === "submitting"} className="mt-1 w-full">
                {phase === "submitting" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" strokeWidth={3} /> Signing in...
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight className="size-4" strokeWidth={3} />
                  </>
                )}
              </PrimaryButton>

              <div className="mt-2 flex items-center justify-between text-[12px] font-semibold text-black/55">
                <span>New here?</span>
                <GhostButton href="/partners/apply" className="h-9 px-4 text-[11px]">
                  Apply to join
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

function Field({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between">
        <span className="text-[12px] font-black uppercase tracking-[0.06em] text-black/55">{label}</span>
        {right ? <span>{right}</span> : null}
      </span>
      {children}
    </label>
  )
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return <div className="py-6 text-center">{children}</div>
}

const inputClass =
  "h-12 rounded-xl border border-black/12 bg-white px-4 text-[14px] font-semibold text-black outline-none transition-colors placeholder:text-black/35 focus:border-black/40"
