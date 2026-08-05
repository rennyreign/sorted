"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import {
  AffiliatesFooter,
  AffiliatesHeader,
  AffiliatesPage,
  GhostButton,
  PrimaryButton,
  Underline,
} from "../_components/AffiliatesPrimitives"
import { affiliateDb } from "@/lib/affiliateClient"
import { updateAffiliatePassword } from "@/lib/affiliateAuth"

export default function ResetPasswordPage() {
  const [phase, setPhase] = useState<"loading" | "form" | "submitting" | "done" | "error">("loading")
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const errorCode = params.get("error")
    const errorDescription = params.get("error_description")

    if (errorCode) {
      setError(errorDescription ?? `Reset link failed (${errorCode}).`)
      setPhase("error")
      return
    }

    if (!code) {
      setError("This reset link is missing a code. Please request a new one.")
      setPhase("error")
      return
    }

    affiliateDb.auth
      .exchangeCodeForSession(code)
      .then(({ error: exchangeError }) => {
        if (exchangeError) {
          setError("This reset link has expired or already been used. Please request a new one.")
          setPhase("error")
          return
        }
        setPhase("form")
      })
      .catch(() => {
        setError("Could not validate the reset link. Please request a new one.")
        setPhase("error")
      })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!password) {
      setError("Please enter a new password.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setPhase("submitting")
    const result = await updateAffiliatePassword({ password })

    if (!result.ok) {
      setError(result.error)
      setPhase("form")
      return
    }

    setPhase("done")
    window.setTimeout(() => {
      window.location.href = "/partners/dashboard"
    }, 1500)
  }

  return (
    <AffiliatesPage>
      <AffiliatesHeader active="login" showLogin={false} />

      <section className="mx-auto grid max-w-[1220px] gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="mb-5 text-[12px] font-black text-black/45">Sorted Partners Portal</p>
          <h1 className="text-[clamp(2.8rem,5.4vw,5.2rem)] font-black leading-[0.92] tracking-[-0.045em]">
            Choose a new password.
          </h1>
          <Underline className="mt-2 w-[260px]" />
          <p className="mt-7 max-w-[420px] text-[16px] font-semibold leading-[1.5] tracking-[-0.02em] text-black/72">
            Once updated, you'll be signed in automatically and taken to your dashboard.
          </p>
        </div>

        <div className="rounded-[18px] border border-black/10 bg-white p-6 shadow-[0_18px_44px_rgba(0,0,0,0.06)] sm:p-8">
          {phase === "loading" ? (
            <CenteredMessage>
              <Loader2 className="mx-auto size-8 animate-spin text-[#bdd900]" strokeWidth={3} />
              <p className="mt-5 text-[15px] font-bold">Verifying your reset link...</p>
            </CenteredMessage>
          ) : phase === "done" ? (
            <CenteredMessage>
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#dfff00]">
                <Check className="size-8" strokeWidth={3} />
              </span>
              <h2 className="mt-6 text-[24px] font-black tracking-[-0.04em]">Password updated.</h2>
              <p className="mx-auto mt-4 max-w-[420px] text-[14px] font-semibold leading-[1.5] text-black/72">
                Taking you to your dashboard...
              </p>
            </CenteredMessage>
          ) : phase === "error" ? (
            <CenteredMessage>
              <h2 className="text-[24px] font-black tracking-[-0.04em]">Reset link invalid.</h2>
              <p className="mx-auto mt-4 max-w-[420px] text-[14px] font-semibold leading-[1.5] text-black/72">
                {error}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <GhostButton href="/partners/forgot-password">Request new link</GhostButton>
                <GhostButton href="/partners/login">Back to login</GhostButton>
              </div>
            </CenteredMessage>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-[12px] font-black uppercase tracking-[0.06em] text-black/55">New password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className="h-12 rounded-xl border border-black/12 bg-white px-4 text-[14px] font-semibold text-black outline-none transition-colors placeholder:text-black/35 focus:border-black/40"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-[12px] font-black uppercase tracking-[0.06em] text-black/55">Confirm new password</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="h-12 rounded-xl border border-black/12 bg-white px-4 text-[14px] font-semibold text-black outline-none transition-colors placeholder:text-black/35 focus:border-black/40"
                />
              </label>

              {error ? (
                <p className="rounded-[12px] bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">{error}</p>
              ) : null}

              <PrimaryButton type="submit" disabled={phase === "submitting"} className="mt-1 w-full">
                {phase === "submitting" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" strokeWidth={3} /> Updating...
                  </>
                ) : (
                  <>
                    Update password <ArrowRight className="size-4" strokeWidth={3} />
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

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return <div className="py-6 text-center">{children}</div>
}
