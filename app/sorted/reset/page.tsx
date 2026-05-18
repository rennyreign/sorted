"use client"

import { demoSession } from "@/lib/sorted-updates"
import { useState } from "react"

export default function SortedResetPage() {
  const [confirmation, setConfirmation] = useState("")
  const [status, setStatus] = useState("")

  async function requestReset() {
    const response = await fetch("/api/sorted-updates/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: demoSession.client_id, confirmation }),
    })
    const payload = await response.json()
    setStatus(payload.message || payload.error || payload.status)
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-6 py-10 text-[#171411]">
      <div className="mx-auto max-w-2xl">
        <a href="/sorted/chat" className="text-sm font-bold text-[#756c5f]">Back to chat</a>
        <h1 className="mt-6 text-4xl font-black tracking-tight">Reset site</h1>
        <p className="mt-4 text-[#756c5f]">
          This restores code to the protected `sorted-handoff` tag. Conversation history remains. Uploaded post-handoff media is not retained.
        </p>
        <div className="mt-8 rounded-[2rem] border border-red-950/20 bg-white p-6">
          <label className="text-sm font-black">Type RESTORE SORTED HANDOFF to continue</label>
          <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-3 w-full rounded-2xl border border-black/10 bg-[#fffaf0] px-4 py-3 outline-none focus:border-black/30" />
          <button onClick={requestReset} className="mt-4 rounded-full bg-[#8f241f] px-5 py-3 text-sm font-black text-white">
            Plan reset
          </button>
          {status ? <p className="mt-4 text-sm text-[#756c5f]">{status}</p> : null}
        </div>
      </div>
    </main>
  )
}
