"use client"

import { useEffect, useState } from "react"
import { ClientOnboardingWorkspace } from "@/app/clients/_components/ClientOnboardingWorkspace"
import { dermaBotanica } from "@/lib/client-onboarding/derma-botanica"

const AUTH_KEY = "derma_botanica_auth"
const AUTH_EXPIRY_DAYS = 30

export default function DermaBotanicaOnboarding() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      try {
        const { expires } = JSON.parse(stored)
        if (new Date().getTime() < expires) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem(AUTH_KEY)
        }
      } catch {
        localStorage.removeItem(AUTH_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.toLowerCase() === dermaBotanica.accessCode) {
      setIsAuthenticated(true)
      setError(false)
      const expires = new Date().getTime() + AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      localStorage.setItem(AUTH_KEY, JSON.stringify({ expires }))
    } else {
      setError(true)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F3]">
        <div className="size-6 animate-spin rounded-full border-2 border-black/[0.1] border-t-[#070707]" />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F3] px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <span className="font-sans text-2xl font-extrabold tracking-tight text-[#070707]">Sorted.</span>
          </div>
          <h1 className="mb-2 font-sans text-xl font-bold text-[#070707]">Private / For Derma Botanica</h1>
          <p className="mb-6 text-sm text-[#73736D]">Enter the access code to open your onboarding workspace.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Access code"
              className="w-full rounded-lg border border-black/[0.12] bg-white px-4 py-3 text-[#070707] transition-colors placeholder:text-[#A3A3A3] focus:border-black/[0.3] focus:outline-none"
            />
            {error && <p className="text-sm text-red-500">Incorrect access code. Please try again.</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#070707] px-4 py-3 text-sm font-semibold text-[#FAFAFA] transition-colors hover:bg-[#2a2a2a]"
            >
              Open workspace
            </button>
          </form>
        </div>
      </main>
    )
  }

  return <ClientOnboardingWorkspace config={dermaBotanica} />
}
