"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

export default function WarwickshireQuote() {
  const [mounted, setMounted] = useState(false)

  const [signerName, setSignerName] = useState("")
  const [showAgreement, setShowAgreement] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const [signedAt, setSignedAt] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const handleSignatureSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (signerName.trim()) {
      const now = new Date().toISOString()
      setIsSigned(true)
      setSignedAt(now)
      setShowAgreement(false)
    }
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
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
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-6">Warwickshire Short Stays — Site Delivery</p>

        {/* Status badge */}
        <div className="mb-10">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            isSigned
              ? "bg-green-500/10 text-green-700"
              : "bg-amber-500/10 text-amber-700"
          }`}>
            <div className={`w-2 h-2 rounded-full ${isSigned ? "bg-green-600" : "bg-amber-600"}`} />
            {isSigned ? "Delivery Accepted" : "Awaiting Acceptance"}
          </div>
        </div>

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
                title: "SortedUpdates",
                body: "A private editing system at your site URL /cms. Every piece of text, every image, every property listing, and every review on the site is editable without touching any code. Changes go live automatically after you hit Save.",
              },
              {
                num: "03",
                title: "Property Management",
                body: "A full property listing system. Add, edit or remove properties at any time through SortedUpdates — name, location, bedrooms, amenities, gallery images, highlights, best-for audiences, and guest reviews. Each property gets its own detail page automatically.",
              },
              {
                num: "04",
                title: "Tutorial Walkthrough",
                body: "A video walkthrough embedded directly inside SortedUpdates showing you exactly how to make edits. Available every time you log in.",
              },
              {
                num: "05",
                title: "Netlify Hosting",
                body: "Your site is hosted on Netlify with continuous deployment. Every time you publish a change in SortedUpdates, the site rebuilds and goes live within minutes. No FTP. No technical knowledge required.",
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
              <p className="font-sans font-bold text-[#0A0A0A] text-base mb-1">Your SortedUpdates</p>
              <p className="text-sm text-[#737373] leading-relaxed">
                You have a personal login to SortedUpdates at <span className="font-mono text-[#0A0A0A]">[your-site]/cms</span>. This is your control panel — edit text, swap images, manage properties and publish changes whenever you like. No Sorted involvement needed for day-to-day content.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-black/[0.08]">
              <p className="font-sans font-bold text-[#0A0A0A] text-base mb-1">Your website files</p>
              <p className="text-sm text-[#737373] leading-relaxed">
                The site code lives in a private GitHub repository managed by Sorted. You don't receive direct file access — not as a restriction, but because it's how the system stays reliable. SortedUpdates gives you full control over everything visible on the site. The code layer is what Sorted holds so we can guarantee resets, updates, and fixes without things breaking.
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
                <span className="text-[#A3A3A3] w-36 shrink-0">SortedUpdates</span>
                <span>Free — SortedUpdates is built on open source software</span>
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
              "Edit any text on the site through SortedUpdates",
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
              "Adding new SortedUpdates users",
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

            {/* Bank transfer — spans both columns */}
            <div className="sm:col-span-2 flex flex-col justify-between rounded-2xl border border-black/[0.08] p-6 gap-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-2">Bank transfer</p>
                <p className="font-sans font-bold text-[#0A0A0A] text-2xl tracking-tight mb-3">£150</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#A3A3A3] shrink-0">Name</span>
                    <span className="text-[#0A0A0A] font-medium text-right">Renaldo Lee Edmondson</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#A3A3A3] shrink-0">Account number</span>
                    <span className="text-[#0A0A0A] font-medium font-mono">17897633</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#A3A3A3] shrink-0">Sort code</span>
                    <span className="text-[#0A0A0A] font-medium font-mono">23-14-70</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#A3A3A3]">Wise Payments Limited, 1st Floor, Worship Square, 65 Clifton Street, London, EC2A 4JE</p>
            </div>

          </div>
        </div>

        {/* Closing */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            The site is yours to run. SortedUpdates is your control panel. Everything you need to keep your listings current, your content fresh, and your enquiries coming in is already there.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            If anything ever breaks or you want to add something new, you know where I am.
          </p>
        </div>

        {/* Accept Section */}
        <div className="mb-16 pt-8 border-t border-black/[0.08]">
          {!isSigned ? (
            <>
              <button
                onClick={() => setShowAgreement(true)}
                className="w-full bg-[#0A0A0A] text-[#FAFAFA] font-semibold rounded-xl px-6 py-4 hover:bg-[#1a1a1a] transition-colors"
              >
                Review & Accept Delivery
              </button>
              <p className="text-center text-[#A3A3A3] text-xs mt-4">
                By accepting, you confirm you've received and reviewed what's outlined here.
              </p>
            </>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10L8 14L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Delivery Accepted</h3>
                  <p className="text-green-700 text-sm">Signed by {signerName}{signedAt ? ` on ${formatDate(signedAt)}` : ""}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Agreement Modal */}
        {mounted && showAgreement && createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-2">Delivery Terms</h2>
                <p className="text-[#737373] text-sm mb-6">
                  Please review and sign to confirm delivery.
                </p>

                <div className="bg-black/[0.02] rounded-xl p-5 mb-6 space-y-4 text-sm text-[#525252] max-h-64 overflow-y-auto">
                  <p><strong className="text-[#0A0A0A]">1. Delivery</strong><br/>
                  Sorted has delivered the website and SortedUpdates described in this document. The site is live and access has been provided.</p>

                  <p><strong className="text-[#0A0A0A]">2. Content Ownership</strong><br/>
                  The client owns all content added through SortedUpdates. Sorted retains ownership of the design, code structure, and build system.</p>

                  <p><strong className="text-[#0A0A0A]">3. SortedUpdates Usage</strong><br/>
                  The client is responsible for content published through SortedUpdates. Content that is defamatory, infringing, or illegal is the client's responsibility.</p>

                  <p><strong className="text-[#0A0A0A]">4. Design Changes</strong><br/>
                  Layout, structure, typography, and code changes are not included in this delivery. These can be commissioned separately.</p>

                  <p><strong className="text-[#0A0A0A]">5. Factory Reset</strong><br/>
                  Sorted retains the ability to restore content to the original handoff state. This may be used with client consent or in cases of site damage.</p>

                  <p><strong className="text-[#0A0A0A]">6. Hosting</strong><br/>
                  The site is hosted on Netlify's free tier. Sorted is not liable for downtime caused by third-party hosting services.</p>

                  <p><strong className="text-[#0A0A0A]">7. Portfolio</strong><br/>
                  Sorted retains the right to display this work in its portfolio and reference materials.</p>
                </div>

                <form onSubmit={handleSignatureSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-2">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="Enter your name to sign"
                      className="w-full px-4 py-3 bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-black/[0.3] transition-colors"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAgreement(false)}
                      className="flex-1 px-4 py-3 border border-black/[0.12] rounded-lg text-[#525252] font-medium hover:bg-black/[0.02] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#0A0A0A] text-[#FAFAFA] font-semibold rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors"
                    >
                      Accept & Sign
                    </button>
                  </div>
                </form>
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
        <div className="border-t border-black/[0.06] pt-8">
          <p className="text-xs text-[#C4C4C4] font-mono">Sorted. — sortmydigital.site</p>
        </div>
      </main>
    </>
  )
}
