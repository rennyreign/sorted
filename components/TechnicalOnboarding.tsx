"use client"

import { useState } from "react"
import type { JobType } from "@/app/api/price/route"

export type TechAnswers = Record<string, string>

interface Question {
  id: string
  label: string
  hint?: string
  type: "choice" | "text"
  options?: string[]
  optional?: boolean
}

const questionsByJobType: Record<JobType, Question[]> = {
  website: [
    {
      id: "hasDomain",
      label: "Do you have a domain name?",
      hint: "e.g. yourbusiness.com",
      type: "choice",
      options: ["Yes, I own it", "No, I need one", "Not sure"],
    },
    {
      id: "domainRegistrar",
      label: "Who is it registered with?",
      hint: "Where you bought the domain",
      type: "choice",
      options: ["GoDaddy", "Namecheap", "Google Domains", "123-reg", "Don't know", "Other"],
    },
    {
      id: "hasHosting",
      label: "Do you have existing hosting?",
      type: "choice",
      options: ["Yes", "No, sort it for me", "Not sure"],
    },
    {
      id: "hasLogo",
      label: "Do you have a logo?",
      type: "choice",
      options: ["Yes, I'll upload it", "No logo yet", "Add a logo to my order"],
    },
    {
      id: "businessEmail",
      label: "What email do you use for the business?",
      type: "choice",
      options: ["Personal Gmail", "Google Workspace", "Outlook / Microsoft", "Other"],
    },
  ],
  "landing-page": [
    {
      id: "hasDomain",
      label: "Do you have a domain name?",
      type: "choice",
      options: ["Yes, I own it", "No, I need one", "Not sure"],
    },
    {
      id: "hasLogo",
      label: "Do you have a logo?",
      type: "choice",
      options: ["Yes", "No logo yet"],
    },
    {
      id: "formAction",
      label: "What should happen when someone fills the form?",
      type: "choice",
      options: ["Email me the lead", "Just collect the data", "Redirect to a thank-you page"],
    },
  ],
  logo: [
    {
      id: "hasColours",
      label: "Do you have existing brand colours?",
      type: "choice",
      options: ["Yes, I'll share them", "No, help me choose"],
    },
    {
      id: "styleDirection",
      label: "What feel are you going for?",
      hint: "e.g. clean and modern, bold, traditional, playful",
      type: "text",
      optional: true,
    },
    {
      id: "hasReferences",
      label: "Any logos you love as a reference?",
      type: "choice",
      options: ["Yes, I'll share some", "No, I trust you"],
    },
  ],
  ads: [
    {
      id: "hasFacebookPage",
      label: "Do you have a Facebook Business Page?",
      type: "choice",
      options: ["Yes", "No, I need one set up"],
    },
    {
      id: "hasBusinessManager",
      label: "Is Meta Business Manager set up?",
      type: "choice",
      options: ["Yes", "No", "Not sure what that is"],
    },
    {
      id: "hasRunAdsBefore",
      label: "Have you run Facebook or Instagram ads before?",
      type: "choice",
      options: ["Yes", "No, this is new"],
    },
    {
      id: "hasPixel",
      label: "Do you have the Meta Pixel installed on your site?",
      type: "choice",
      options: ["Yes", "No", "Don't have a site yet"],
    },
  ],
  "google-profile": [
    {
      id: "hasClaimedProfile",
      label: "Have you claimed your Google Business Profile?",
      type: "choice",
      options: ["Yes, I have access", "No, I need to claim it", "Not sure"],
    },
    {
      id: "googleEmail",
      label: "What Google account is it linked to?",
      hint: "The email used to manage the listing",
      type: "text",
      optional: true,
    },
    {
      id: "hasPhotos",
      label: "Do you have photos of your business or work?",
      type: "choice",
      options: ["Yes, I'll share them", "No, I need help with that"],
    },
  ],
  social: [
    {
      id: "platforms",
      label: "Which platform are we creating content for?",
      type: "choice",
      options: ["Instagram", "Facebook", "TikTok", "LinkedIn", "Multiple"],
    },
    {
      id: "hasBrandKit",
      label: "Do you have a logo or brand kit?",
      type: "choice",
      options: ["Yes, I'll upload it", "No, keep it simple"],
    },
    {
      id: "hasContentDirection",
      label: "Do you have a content direction in mind?",
      type: "choice",
      options: ["Yes, I'll brief you", "No, help me figure it out"],
    },
  ],
  other: [
    {
      id: "platform",
      label: "What platform or tool does this involve?",
      hint: "e.g. WordPress, Shopify, Wix, Google, etc.",
      type: "text",
      optional: true,
    },
    {
      id: "hasLogins",
      label: "Do you have existing accounts or logins we'd need?",
      type: "choice",
      options: ["Yes, I'll share securely", "No, starting fresh"],
    },
  ],
}

interface Props {
  jobType: JobType
  onComplete: (answers: TechAnswers) => void
}

export default function TechnicalOnboarding({ jobType, onComplete }: Props) {
  const questions = questionsByJobType[jobType] ?? questionsByJobType.other
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<TechAnswers>({})
  const [textValue, setTextValue] = useState("")

  const current = questions[qIndex]
  const isLast = qIndex === questions.length - 1
  const answered = answers[current.id] !== undefined || (current.type === "text" && textValue.trim().length > 0)
  const canSkip = current.optional

  function choose(option: string) {
    const next = { ...answers, [current.id]: option }
    setAnswers(next)
    if (isLast) {
      onComplete(next)
    } else {
      setQIndex((i) => i + 1)
    }
  }

  function submitText() {
    const val = textValue.trim()
    const next = { ...answers, [current.id]: val || "(skipped)" }
    setAnswers(next)
    setTextValue("")
    if (isLast) {
      onComplete(next)
    } else {
      setQIndex((i) => i + 1)
    }
  }

  function skip() {
    const next = { ...answers, [current.id]: "(skipped)" }
    setAnswers(next)
    setTextValue("")
    if (isLast) {
      onComplete(next)
    } else {
      setQIndex((i) => i + 1)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-8">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
              i < qIndex ? "bg-[#0A0A0A]" : i === qIndex ? "bg-[#0A0A0A]/40" : "bg-black/10"
            }`}
          />
        ))}
      </div>

      <div key={current.id}>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#A3A3A3] mb-3 block">
          {qIndex + 1} of {questions.length}
        </span>
        <label className="block font-sans font-bold text-[#0A0A0A] text-xl leading-snug mb-1">
          {current.label}
        </label>
        {current.hint && (
          <p className="text-sm text-[#A3A3A3] mb-5">{current.hint}</p>
        )}
        {!current.hint && <div className="mb-5" />}

        {current.type === "choice" && (
          <div className="space-y-2">
            {current.options!.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => choose(opt)}
                className="w-full text-left text-sm font-medium px-4 py-3.5 rounded-xl border border-black/10 text-[#0A0A0A] hover:border-black/30 hover:bg-black/[0.02] bg-white transition-all duration-200"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {current.type === "text" && (
          <div>
            <input
              autoFocus
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitText()
              }}
              placeholder="Type your answer..."
              className="w-full rounded-xl border border-black/10 bg-white text-[#0A0A0A] text-sm px-4 py-3.5 placeholder:text-[#C4C4C4] focus:outline-none focus:border-black/30 transition-colors duration-200 mb-4"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={submitText}
                className="group inline-flex items-center gap-3 bg-[#0A0A0A] text-white font-semibold text-sm rounded-full px-6 py-3 hover:bg-[#2a2a2a] transition-all duration-300"
              >
                {isLast ? "Finish" : "Next"}
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 8L8 2M8 2H4M8 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
              {canSkip && (
                <button
                  type="button"
                  onClick={skip}
                  className="text-sm font-medium text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors duration-200"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        )}

        {current.type === "choice" && canSkip && (
          <button
            type="button"
            onClick={skip}
            className="mt-3 text-sm font-medium text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors duration-200"
          >
            Skip this one
          </button>
        )}
      </div>
    </div>
  )
}
