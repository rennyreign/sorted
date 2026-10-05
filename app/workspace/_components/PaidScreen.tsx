"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Check } from "lucide-react"
import { getWorkspace, workspaceEvent } from "@/lib/workspace"
import { workspacePath } from "./WorkspaceShell"

// Confirmation screen for /workspace/paid — the fixed Stripe Payment Link
// redirect target. Stripe can't pass the slug back, so the slug is handed over
// via localStorage (set in NextStepsScreen.payByCard before checkout).

export function PaidScreen() {
  const [slug, setSlug] = useState<string | null>(null)

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem("workspace_return_slug")
    } catch {
      stored = null
    }
    setSlug(stored)

    if (stored) {
      getWorkspace(stored).then((ws) => {
        if (ws) workspaceEvent(ws, "payment_return")
      })
    }
  }, [])

  return (
    <div className="grid min-h-screen place-items-center bg-[#F7F7F3] px-5">
      <div className="w-full max-w-[560px]">
        <p className="mb-8 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3]">Sorted</p>
        <div className="rounded-[14px] bg-[#070707] p-8 text-center sm:p-10">
          <div className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-full bg-[#00A64B]">
            <Check className="h-6 w-6 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-[32px]">
            Thank you, your deposit is in.
          </h1>
          <p className="mx-auto mt-4 max-w-[400px] text-[15px] font-medium leading-[1.55] text-white/70">
            We&apos;re building the rest of your site. Typical turnaround is 48-72 hours, and we&apos;ll be in touch
            the moment it&apos;s ready for your review.
          </p>
          {slug ? (
            <a
              href={`${workspacePath(slug, "next-steps")}?deposit=returned`}
              className="mt-8 inline-flex items-center gap-2 rounded-[9px] bg-[#DFFF00] px-6 py-3.5 text-[15px] font-bold text-[#070707] transition-colors hover:bg-[#d4f000]"
            >
              Open your workspace
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <p className="mt-8 text-[13px] font-medium leading-[1.5] text-white/50">
              Your workspace link is in the email we sent you, or reach us at{" "}
              <a href="mailto:hello@sortmydigital.site" className="text-white/80 underline underline-offset-2">
                hello@sortmydigital.site
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
