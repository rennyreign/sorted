"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

const AUTH_KEY = "sandra_auth"
const AUTH_EXPIRY_DAYS = 30

export default function SandraQuote() {
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
        const { expires, signature } = JSON.parse(stored)
        if (new Date().getTime() < expires) {
          setIsAuthenticated(true)
          if (signature) {
            setIsSigned(true)
            setSignedAt(signature.signedAt)
            setSignerName(signature.signerName)
          }
        } else {
          localStorage.removeItem(AUTH_KEY)
        }
      } catch {
        localStorage.removeItem(AUTH_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const saveAuth = (signatureData?: { signerName: string; signedAt: string }) => {
    const expires = new Date().getTime() + (AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    const data: { expires: number; signature?: { signerName: string; signedAt: string } } = { expires }
    if (signatureData) data.signature = signatureData
    localStorage.setItem(AUTH_KEY, JSON.stringify(data))
  }

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
    setIsSigned(false)
    setSignerName("")
    setSignedAt(null)
  }

  const handleSignatureSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (signerName.trim()) {
      const now = new Date().toISOString()
      setIsSigned(true)
      setSignedAt(now)
      saveAuth({ signerName: signerName.trim(), signedAt: now })
      setShowAgreement(false)
    }
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.toLowerCase() === "sandra2026") {
      setIsAuthenticated(true)
      setError(false)
      saveAuth()
    } else {
      setError(true)
    }
  }

  if (!mounted || isLoading) return null

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-5">
        <div className="w-full max-w-sm">
          <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#555]">Sorted · Private</p>
          <h1 className="mb-8 text-2xl font-semibold text-white">Sandra&apos;s delivery page</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter your access password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/25"
              autoFocus
            />
            {error && <p className="text-xs text-red-400">Incorrect password. Try again or contact Sorted.</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              View delivery
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* Agreement modal */}
      {showAgreement && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#141414] p-8">
            <button
              onClick={() => setShowAgreement(false)}
              className="absolute right-4 top-4 text-white/40 hover:text-white/70"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <p className="mb-1 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/40">Service Agreement</p>
            <h2 className="mb-6 text-lg font-semibold">Review & Accept</h2>
            <div className="mb-6 max-h-56 space-y-3 overflow-y-auto pr-2 text-sm leading-7 text-white/60">
              <p>Sorted has designed and built a website for Entre Copas y Cuerpos. The site is hosted on Netlify and includes SortedUpdates — a content management system giving Sandra full control over her site&apos;s text and images.</p>
              <p>The design, code, and technical infrastructure remain the intellectual property of Sorted (ADX Engine Ltd). The content — all text, images, and media — belongs to Sandra.</p>
              <p>Sorted retains the right to maintain, update, and reset the site to its factory state for servicing purposes. No changes will be made to live content without prior notice.</p>
              <p>Payment confirms acceptance of this arrangement and authorises Sorted to host the site on the client&apos;s behalf.</p>
              <p>Ongoing hosting via Netlify is free on the standard tier. If the site exceeds Netlify&apos;s free limits, Sorted will discuss options with the client before any charges arise.</p>
            </div>
            <form onSubmit={handleSignatureSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Type your full name to sign"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/25"
                autoFocus
              />
              <button
                type="submit"
                disabled={!signerName.trim()}
                className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-40"
              >
                I agree — sign & accept
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Header */}
      <header className="border-b border-white/8 px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white">S</div>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/40">Sorted · Delivery</span>
          </div>
          <button onClick={handleSignOut} className="text-xs text-white/30 transition hover:text-white/60">Sign out</button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-5 py-12 sm:px-8 pb-24">

        {/* Hero */}
        <div>
          <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/40">Entre Copas y Cuerpos</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">You&apos;ve been Sorted. 🎉</h1>
          <p className="mt-3 text-base leading-7 text-white/60">
            Your site is live. Here&apos;s everything you need to know — what was delivered, how to manage it, and what comes next.
          </p>
        </div>

        {/* Signed banner */}
        {isSigned && signedAt && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-5 py-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-400"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <p className="text-sm font-semibold text-emerald-400">Agreement signed</p>
              <p className="text-xs text-white/40">Signed by {signerName} on {formatDate(signedAt)}</p>
            </div>
          </div>
        )}

        {/* 1 — What was delivered */}
        <section className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8">
          <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/35">01 — What you received</p>
          <h2 className="mb-5 text-lg font-semibold">Your complete website</h2>
          <ul className="space-y-3">
            {[
              ["Live website", "entrecopasycuerpos.com — a fully custom-designed site built for Entre Copas y Cuerpos. Responsive on all devices."],
              ["5 pages", "Homepage, Talleres, About, Contact, plus Privacy and Terms pages."],
              ["Bilingual content", "Every section of the site is available in both Spanish and English, switchable by visitors."],
              ["SortedUpdates CMS", "A content management system at entrecopasycuerpos.com/cms — you can update all text, headings, and images yourself, any time."],
              ["Netlify hosting", "Your site is hosted on Netlify. Fast, global, and free on the standard tier."],
              ["Domain connected", "Your domain entrecopasycuerpos.com is connected and live."],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-4">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-white/40"><polyline points="20 6 9 17 4 12"/></svg>
                <div>
                  <span className="text-sm font-medium text-white">{title} — </span>
                  <span className="text-sm text-white/55">{desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 2 — SortedUpdates / CMS access */}
        <section className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8">
          <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/35">02 — SortedUpdates</p>
          <h2 className="mb-2 text-lg font-semibold">Your content dashboard</h2>
          <p className="mb-5 text-sm leading-7 text-white/55">
            SortedUpdates is your built-in content manager. You can update any text or image on your site without touching code. Changes go live automatically after you hit Save.
          </p>
          <div className="mb-5 rounded-xl border border-white/8 bg-[#0f0f0f] p-5">
            <p className="mb-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/35">Your CMS address</p>
            <p className="font-mono text-sm text-white">entrecopasycuerpos.com/cms</p>
          </div>
          <p className="mb-4 text-sm text-white/55">To log in, you&apos;ll need to accept the invitation email Sorted sends to your inbox. After that, your login works on any device.</p>
          <div className="space-y-2 text-sm">
            {[
              "Update any heading, paragraph, or button label in Spanish and English",
              "Swap images across the homepage, talleres page, and about page",
              "Update your WhatsApp link, email address, and location",
              "Changes go live within a minute of saving",
            ].map((item) => (
              <p key={item} className="flex gap-2.5 text-white/55">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                {item}
              </p>
            ))}
          </div>
        </section>

        {/* 3 — What you own vs don't */}
        <section className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8">
          <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/35">03 — Yours vs ours</p>
          <h2 className="mb-5 text-lg font-semibold">What you control</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-5">
              <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-emerald-400">Yours completely</p>
              <ul className="space-y-2 text-sm text-white/60">
                {[
                  "All your content — text, images, copy",
                  "Your domain name",
                  "Your WhatsApp contacts and newsletter",
                  "Your CMS login and account",
                  "The right to request your files at any time",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-emerald-400"><polyline points="20 6 9 17 4 12"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/3 p-5">
              <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/35">Sorted&apos;s responsibility</p>
              <ul className="space-y-2 text-sm text-white/40">
                {[
                  "The design and visual layout",
                  "The code and technical infrastructure",
                  "Hosting configuration on Netlify",
                  "Future design additions or changes",
                  "Factory reset capability (for servicing)",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/20" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 4 — Requesting site files */}
        <section className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8">
          <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/35">04 — Your site files</p>
          <h2 className="mb-2 text-lg font-semibold">Taking your site elsewhere</h2>
          <p className="mb-4 text-sm leading-7 text-white/55">
            If you ever want to take your site files — to host elsewhere, hand to a developer, or simply keep a copy — that&apos;s completely fine. Your files are yours.
          </p>
          <p className="text-sm leading-7 text-white/55">
            Just email{" "}
            <a href="mailto:hello@adxengine.net" className="text-white underline decoration-white/20 underline-offset-4 hover:decoration-white/60">
              hello@adxengine.net
            </a>{" "}
            with your domain name and we&apos;ll send everything over. No charge, no fuss.
          </p>
        </section>

        {/* 5 — Payment */}
        <section className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8">
          <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/35">05 — Payment</p>
          <h2 className="mb-2 text-lg font-semibold">Investment summary</h2>
          <p className="mb-6 text-sm leading-7 text-white/55">
            One-off payment to cover design, build, and SortedUpdates setup. Hosting is free on Netlify&apos;s standard tier — no monthly fees from Sorted.
          </p>

          <div className="mb-6 flex items-baseline gap-3">
            <span className="font-mono text-4xl font-bold text-white">€250</span>
            <span className="text-sm text-white/40">one-off</span>
          </div>

          <div className="mb-6 rounded-xl border border-white/8 bg-[#0f0f0f] p-5">
            <p className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/35">Bank transfer (Wise — SEPA)</p>
            <div className="space-y-3 text-sm">
              {[
                ["Account name", "Renaldo Lee Edmondson"],
                ["IBAN", "BE42 9671 7255 2454"],
                ["Swift / BIC", "TRWIBEB1XXX"],
                ["Bank", "Wise, Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium"],
                ["Reference", "Sandra — entrecopasycuerpos.com"],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[120px_1fr] gap-2">
                  <span className="text-white/35">{label}</span>
                  <span className="font-mono text-white/80">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs leading-6 text-white/30">
            If you&apos;re sending from a Spanish bank account within SEPA, use the IBAN above for a standard domestic transfer. If sending internationally, include the Swift/BIC code.
          </p>
        </section>

        {/* Sign & Accept */}
        {!isSigned ? (
          <section className="rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8">
            <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/35">Sign off</p>
            <h2 className="mb-2 text-lg font-semibold">Happy with everything?</h2>
            <p className="mb-6 text-sm leading-7 text-white/55">
              If you&apos;re happy with your site and ready to proceed, sign below to confirm you&apos;ve reviewed and accepted the delivery. This doesn&apos;t replace payment — it just confirms we&apos;re aligned.
            </p>
            <button
              onClick={() => setShowAgreement(true)}
              className="rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Review & sign
            </button>
          </section>
        ) : (
          <section className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <h2 className="font-semibold text-emerald-400">All done.</h2>
                <p className="mt-1 text-sm text-white/55">Signed by <strong className="text-white/80">{signerName}</strong> on {signedAt ? formatDate(signedAt) : ""}.</p>
                <p className="mt-3 text-sm text-white/40">
                  Send the payment when you&apos;re ready and Sorted will complete the handoff — your CMS invite will arrive shortly after.
                </p>
              </div>
            </div>
          </section>
        )}

      </main>

      <footer className="border-t border-white/8 px-5 py-8 text-center">
        <p className="text-xs text-white/25">Sorted by ADX Engine · <a href="https://sortmydigital.com" className="hover:text-white/50">sortmydigital.com</a></p>
      </footer>

    </div>
  )
}
