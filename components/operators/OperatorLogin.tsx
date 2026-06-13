"use client"

import { useState } from "react"
import { login } from "@/lib/operatorAuth"

export default function OperatorLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(false)
    setLoading(true)
    setTimeout(() => {
      if (login("sorted", password)) {
        onSuccess()
      } else {
        setError(true)
        setLoading(false)
      }
    }, 300)
  }

  return (
    <main className="min-h-[100dvh] bg-[#FAFAFA] flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <div className="mb-8">
          <span className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight">Sorted.</span>
        </div>
        <h1 className="font-sans font-bold text-[#0A0A0A] text-xl mb-2">Operator access</h1>
        <p className="text-[#737373] text-sm mb-6">Enter the password to view the Prospect Finder dashboard.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full px-4 py-3 bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-black/[0.3] transition-colors"
          />
          {error && (
            <p className="text-red-500 text-sm">Incorrect password. Please try again.</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Checking..." : "View dashboard"}
          </button>
        </form>
      </div>
    </main>
  )
}
