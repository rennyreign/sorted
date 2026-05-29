"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

const AUTH_KEY = "warwickshire_auth"
const AUTH_EXPIRY_DAYS = 30

export default function WarwickshireQuote() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const [signerName, setSignerName] = useState("")
  const [showAgreement, setShowAgreement] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const [signedAt, setSignedAt] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

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

  const saveAuth = () => {
    const expires = new Date().getTime() + (AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    localStorage.setItem(AUTH_KEY, JSON.stringify({ expires }))
  }

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.toLowerCase() === "warwickshire2026") {
      setIsAuthenticated(true)
      setError(false)
      saveAuth()
    } else {
      setError(true)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black/[0.1] border-t-[#0A0A0A] rounded-full animate-spin" />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <div className="mb-8">
            <span className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight">Sorted.</span>
          </div>
          <h1 className="font-sans font-bold text-[#0A0A0A] text-xl mb-2">Private — For Warwickshire Short Stays</h1>
          <p className="text-[#737373] text-sm mb-6">Enter the password to view your delivery summary.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-black/[0.3] transition-colors"
            />
            {error && (
              <p className="text-red-500 text-sm">Incorrect password. Please try again.</p>
            )}
            <button
              type="submit"
              className="w-full bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors"
            >
              View Summary
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="max-w-[680px] mx-auto px-6 sm:px-10 pt-24 pb-32">

        {/* Date + Private Label */}
        <div className="mb-16">
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-1">May 2026</p>
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em]">Private — for Warwickshire Short Stays</p>
        </div>

        {/* Header */}
        <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl leading-tight tracking-tight mb-4">
          You've been Sorted.
        </h1>
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-10">Warwickshire Short Stays — Site Delivery</p>

        {/* Opening */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            Your site is live. This document is a summary of everything you've received — the site, the tools to manage it, and what we've agreed on.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            Review it, accept it, and you're good to go.
          </p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* What You Got */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            What you received
          </span>
          <div className="space-y-10">
            {[
              {
                num: "01",
                title: "Custom Website",
                body: "A fully designed and built website for Warwickshire Short Stays. Seven pages — Home, Properties, individual property detail pages, Business Stays, Family Stays, Relocation Stays, About, and Contact. Built to generate direct enquiries from contractors, relocators, families and business travellers.",
              },
              {
                num: "02",
                title: "SortedUpdates CMS",
                body: "A private content management system at your site URL /cms. Every piece of text, every image, every property listing, and every review on the site is editable without touching any code. Changes go live automatically after you hit Save.",
              },
              {
                num: "03",
                title: "Property Management",
                body: "A full property listing system. Add, edit or remove properties at any time through the CMS — name, location, bedrooms, amenities, gallery images, highlights, best-for audiences, and guest reviews. Each property gets its own detail page automatically.",
              },
              {
                num: "04",
                title: "Tutorial Walkthrough",
                body: "A video walkthrough embedded directly inside your CMS showing you exactly how to make edits. Available every time you log in.",
              },
              {
                num: "05",
                title: "Netlify Hosting",
                body: "Your site is hosted on Netlify with continuous deployment. Every time you publish a change in the CMS, the site rebuilds and goes live within minutes. No FTP. No technical knowledge required.",
              },
            ].map((item) => (
              <div key={item.num} className="flex gap-8">
                <span className="font-mono text-[11px] text-[#C4C4C4] tabular-nums pt-1 shrink-0">{item.num}</span>
                <div>
                  <h3 className="font-sans font-bold text-[#0A0A0A] text-lg leading-snug tracking-tight mb-2">{item.title}</h3>
                  <p className="text-[#737373] text-base leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Your Access */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            Your access
          </span>
          <div className="space-y-6">

            {/* What they control */}
            <div className="p-6 rounded-2xl border border-black/[0.08]">
              <p className="font-sans font-bold text-[#0A0A0A] text-base mb-1">Your domain</p>
              <p className="text-sm text-[#737373] leading-relaxed">
                Your domain is yours — registered in your name, managed through your registrar. Sorted has no ownership or control over it. If you ever want to point it somewhere else, that's entirely your call.
              </p>
              <a
                href="https://supercut.ai/share/adx-engine/IL09idvMsgUqmwsV9WW24n"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[#0A0A0A] hover:underline"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 5.5l5 2.5-5 2.5V5.5z" fill="currentColor"/>
                </svg>
                Watch: How to update your nameservers in GoDaddy
              </a>
            </div>

            <div className="p-6 rounded-2xl border border-black/[0.08]">
              <p className="font-sans font-bold text-[#0A0A0A] text-base mb-1">Your CMS</p>
              <p className="text-sm text-[#737373] leading-relaxed">
                You have a personal login to your CMS at <span className="font-mono text-[#0A0A0A]">[your-site]/cms</span>. This is your control panel — edit text, swap images, manage properties and publish changes whenever you like. No Sorted involvement needed for day-to-day content.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-black/[0.08]">
              <p className="font-sans font-bold text-[#0A0A0A] text-base mb-1">Your website files</p>
              <p className="text-sm text-[#737373] leading-relaxed">
                The site code lives in a private GitHub repository managed by Sorted. You don't receive direct file access — not as a restriction, but because it's how the system stays reliable. The CMS gives you full control over everything visible on the site. The code layer is what Sorted holds so we can guarantee resets, updates, and fixes without things breaking.
              </p>
              <p className="text-sm text-[#737373] leading-relaxed mt-3">
                If you ever part ways with Sorted, the site stays live and the domain stays yours. We can discuss a full handoff at that point.
              </p>
            </div>

          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Investment */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            Investment
          </span>
          <div className="bg-[#0A0A0A] rounded-2xl p-8 sm:p-10 mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/60 mb-2">Project Cost</p>
            <p className="font-sans font-extrabold text-white text-5xl tracking-tight mb-3">£150</p>
            <p className="text-white/40 text-sm">Due on acceptance of this delivery.</p>
          </div>
          <div className="p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-3">Ongoing costs</p>
            <div className="space-y-2 text-sm text-[#737373]">
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-36 shrink-0">Netlify hosting</span>
                <span>Free tier — no cost unless traffic scales significantly</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-36 shrink-0">Domain</span>
                <span>Managed separately — your existing domain registrar</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-36 shrink-0">CMS</span>
                <span>Free — Decap CMS is open source</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* What You Can Do */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6 block">
            What you can do
          </span>
          <ul className="space-y-2 text-[#737373] text-base leading-relaxed">
            {[
              "Edit any text on the site through the CMS",
              "Swap or update any image",
              "Add, edit or remove property listings",
              "Add guest reviews to any property",
              "Update your homepage, about page, and all audience pages",
              "Publish changes that go live within minutes",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-[#0A0A0A]">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What Requires Sorted */}
        <div className="mb-16 p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">What requires Sorted</p>
          <ul className="space-y-1">
            {[
              "Design changes (layout, typography, colours)",
              "New pages or structural changes",
              "Adding new CMS users",
              "Any code-level modifications",
              "Factory reset to original build",
            ].map((item) => (
              <li key={item} className="text-sm text-[#737373]">{item}</li>
            ))}
          </ul>
          <p className="text-xs text-[#A3A3A3] mt-4">Get in touch and we'll scope it as a new piece of work.</p>
        </div>

        <div className="border-t border-black/[0.08] mb-16" />

        {/* Payment */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6 block">
            Pay now
          </span>
          <div className="grid sm:grid-cols-2 gap-4">

            {/* Card / Revolut */}
            <div className="flex flex-col justify-between rounded-2xl border border-black/[0.08] p-6 gap-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">Pay by card</p>
                <p className="font-sans font-bold text-[#0A0A0A] text-2xl tracking-tight mb-1">£150</p>
                <p className="text-sm text-[#737373]">Instant. No account needed.</p>
              </div>
              <a
                href="https://checkout.revolut.com/payment-link/0cfdb713-af20-4340-8d08-e6527150a6e4"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-5 py-3 hover:bg-[#2a2a2a] transition-colors"
              >
                Pay £150
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            {/* Bank transfer */}
            <div className="flex flex-col justify-between rounded-2xl border border-black/[0.08] p-6 gap-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">Pay by bank transfer</p>
                <p className="font-sans font-bold text-[#0A0A0A] text-2xl tracking-tight mb-3">£150</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#A3A3A3] shrink-0">Account name</span>
                    <span className="text-[#0A0A0A] font-medium text-right">Renaldo Lee Edmondson</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#A3A3A3] shrink-0">Sort code</span>
                    <span className="text-[#0A0A0A] font-medium font-mono">23-01-20</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#A3A3A3] shrink-0">Account number</span>
                    <span className="text-[#0A0A0A] font-medium font-mono">83621039</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#A3A3A3]">Revolut Ltd, 30 South Colonnade, London E14 5HX</p>
            </div>

          </div>
        </div>

        {/* Closing */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            The site is yours to run. The CMS is your control panel. Everything you need to keep your listings current, your content fresh, and your enquiries coming in is already there.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            If anything ever breaks or you want to add something new, you know where I am.
          </p>
        </div>

        {/* Accept Section */}
        <div className="mb-16 pt-8 border-t border-black/[0.08]">
          {!isSigned ? (
            <>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Review & Accept</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="flex-1 px-4 py-3 bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-black/[0.3] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowAgreement(true)}
                  disabled={!signerName.trim()}
                  className="bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-6 py-3 hover:bg-[#2a2a2a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  Review & Accept
                </button>
              </div>
              <p className="text-xs text-[#A3A3A3] mt-3">By accepting, you confirm you've received and reviewed what's outlined here.</p>
            </>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-green-700 mb-2">Delivery Accepted</p>
              <p className="text-green-800 text-[2rem]" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                {signerName}
              </p>
              <p className="text-xs text-green-600 mt-2">Signed on {signedAt}</p>
            </div>
          )}
        </div>

        {/* Agreement Modal */}
        {showAgreement && mounted && createPortal(
          <div
            className="bg-black/60 flex items-center justify-center p-4"
            style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999 }}
            onClick={() => setShowAgreement(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl flex flex-col"
              style={{ maxHeight: "calc(100vh - 2rem)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08] shrink-0">
                <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Delivery Terms</h3>
                <button
                  type="button"
                  onClick={() => setShowAgreement(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/[0.06] transition-colors text-[#525252]"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <div className="px-6 py-5 overflow-y-auto flex-1">
                <div className="space-y-4 text-sm text-[#525252] leading-relaxed">
                  <p>
                    <strong className="text-[#0A0A0A]">1. Delivery:</strong> Sorted has delivered the website and CMS described in this document. The site is live and access has been provided.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">2. Content Ownership:</strong> The client owns all content added through the CMS. Sorted retains ownership of the design, code structure, and build system.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">3. CMS Usage:</strong> The client is responsible for content published through the CMS. Content that is defamatory, infringing, or illegal is the client's responsibility.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">4. Design Changes:</strong> Layout, structure, typography, and code changes are not included in this delivery. These can be commissioned separately.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">5. Factory Reset:</strong> Sorted retains the ability to restore content to the original handoff state. This may be used with client consent or in cases of site damage.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">6. Hosting:</strong> The site is hosted on Netlify's free tier. Sorted is not liable for downtime caused by third-party hosting services.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">7. Portfolio:</strong> Sorted retains the right to display this work in its portfolio and reference materials.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-black/[0.08] shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAgreement(false)}
                  className="flex-1 px-4 py-3 border border-black/[0.12] rounded-lg text-[#525252] font-medium text-sm hover:bg-black/[0.02] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSigned(true)
                    setShowAgreement(false)
                    setSignedAt(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }))
                  }}
                  className="flex-1 bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors"
                >
                  I Accept — Sign as {signerName}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Signature */}
        <div className="mb-24">
          <p className="font-sans font-bold text-[#0A0A0A] text-lg">Renaldo</p>
          <p className="text-[#A3A3A3] text-sm">Sorted</p>
        </div>

        {/* Footer */}
        <div className="border-t border-black/[0.06] pt-8 flex items-center justify-between">
          <p className="text-xs text-[#C4C4C4] font-mono">Sorted. — sortmydigital.com</p>
          <button
            onClick={handleSignOut}
            className="text-xs text-[#A3A3A3] hover:text-[#525252] transition-colors font-mono"
          >
            Sign out
          </button>
        </div>
      </main>
    </>
  )
}
