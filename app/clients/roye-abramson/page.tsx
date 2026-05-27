"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

const AUTH_KEY = "roye_abramson_auth"
const AUTH_EXPIRY_DAYS = 30

export default function RoyeAbramsonAgreement() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Signature states
  const [signerName, setSignerName] = useState("")
  const [showAgreement, setShowAgreement] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const [signedAt, setSignedAt] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  // Check localStorage on mount
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
    if (signatureData) {
      data.signature = signatureData
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(data))
  }

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
    setIsSigned(false)
    setSignerName("")
    setSignedAt(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.toLowerCase() === "roye2026") {
      setIsAuthenticated(true)
      setError(false)
      saveAuth()
    } else {
      setError(true)
    }
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
    return new Date(isoString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
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
          <h1 className="font-sans font-bold text-[#0A0A0A] text-xl mb-2">Project Agreement</h1>
          <p className="text-[#737373] text-sm mb-6">Enter the password to view your agreement.</p>
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
              View Agreement
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-[720px] mx-auto px-6 sm:px-10 pt-16 pb-24">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight">Sorted.</span>
          <span className="text-[#C4C4C4]">/</span>
          <span className="text-[#737373] text-sm">Project Agreement</span>
        </div>
        <h1 className="font-sans font-extrabold text-[#0A0A0A] text-3xl sm:text-4xl leading-tight tracking-tight mb-4">
          Roye Abramson Music
        </h1>
        <p className="text-[#737373] text-lg">
          Building a recognizable and respected artist brand.
        </p>
      </div>

      {/* Status Badge */}
      <div className="mb-12">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          isSigned 
            ? "bg-green-500/10 text-green-700" 
            : "bg-amber-500/10 text-amber-700"
        }`}>
          <div className={`w-2 h-2 rounded-full ${isSigned ? "bg-green-600" : "bg-amber-600"}`} />
          {isSigned ? "Agreement Signed" : "Awaiting Signature"}
        </div>
      </div>

      {/* Goal Section */}
      <section className="mb-12">
        <h2 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">The Goal</h2>
        <div className="bg-black/[0.02] border border-black/[0.08] rounded-xl p-6">
          <p className="text-[#525252] leading-relaxed mb-4">
            To build Roye Abramson into a recognizable and respected artist brand by growing a loyal audience around his music, personality, and story – while creating a professional digital presence that turns listeners into long-term fans and future opportunities.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#A3A3A3]">Success measured through:</span>
            <span className="font-medium text-[#0A0A0A]">listeners, subscribers, followers, bookings & licensing</span>
          </div>
        </div>
      </section>

      {/* Strategy Section */}
      <section className="mb-12">
        <h2 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">The Strategy</h2>
        <div className="bg-black/[0.02] border border-black/[0.08] rounded-xl p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-[#0A0A0A] mb-2">Purpose</h3>
            <p className="text-[#525252] leading-relaxed">
              Create clear separation between Roye and the noise of the wider artist market through strong brand positioning. His age reinforces authority, experience, and seriousness – positioning him as an established voice with substance rather than another artist competing for attention.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[#0A0A0A] mb-2">Simplified Workflow</h3>
            <ol className="space-y-2 text-[#525252]">
              <li className="flex items-start gap-3">
                <span className="font-mono text-xs text-[#A3A3A3] bg-black/[0.06] px-2 py-1 rounded">1</span>
                <span>Roye produces videos & songs → places in Google Drive</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono text-xs text-[#A3A3A3] bg-black/[0.06] px-2 py-1 rounded">2</span>
                <span>Renaldo edits & distributes onto channels</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono text-xs text-[#A3A3A3] bg-black/[0.06] px-2 py-1 rounded">3</span>
                <span>Records results in dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono text-xs text-[#A3A3A3] bg-black/[0.06] px-2 py-1 rounded">4</span>
                <span>Review and discuss progress weekly</span>
              </li>
            </ol>
          </div>
          <a 
            href="https://app.excalidraw.com/s/69n1qrGnEyw/8uS8km1OVqY" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0A0A0A] hover:text-[#525252] transition-colors"
          >
            View Strategic Outline
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-60">
              <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="mb-12">
        <h2 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Main Deliverables</h2>
        <div className="space-y-3">
          {[
            { stage: "Platform Setup", items: ["Facebook page", "Instagram account", "YouTube channel", "Spotify for Artists", "Apple Music for Artists", "YouTube Music", "Amazon Music", "TikTok account", "Content Drive setup"] },
            { stage: "Digital Presence", items: ["Artist website with CMS", "Brand identity system", "Video overlay branding", "Song cover artwork templates"] },
            { stage: "Content & Distribution", items: ["Video editing & optimization", "Multi-channel distribution", "Weekly content calendar", "Analytics dashboard setup"] },
            { stage: "Growth & Tracking", items: ["Weekly progress reviews", "Performance dashboard", "Audience growth strategy", "Booking & licensing pipeline"] },
          ].map((group) => (
            <div key={group.stage} className="bg-white border border-black/[0.08] rounded-xl p-5">
              <h3 className="font-semibold text-[#0A0A0A] mb-3 text-sm uppercase tracking-wide">{group.stage}</h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[#525252] text-sm">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5 text-[#A3A3A3]">
                      <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Link */}
      <section className="mb-12">
        <a 
          href="/clients/roye-abramson/checklist"
          className="group flex items-center justify-between bg-[#0A0A0A] text-[#FAFAFA] rounded-xl p-6 hover:bg-[#1a1a1a] transition-colors"
        >
          <div>
            <h3 className="font-semibold mb-1">View Project Timeline</h3>
            <p className="text-[#A3A3A3] text-sm">Track progress across all deliverables</p>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-60 group-hover:translate-x-1 transition-transform">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </section>

      {/* Investment */}
      <section className="mb-12">
        <h2 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Investment</h2>
        <div className="bg-black/[0.02] border border-black/[0.08] rounded-xl p-6 space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="font-sans font-extrabold text-[#0A0A0A] text-3xl">$2,000</span>
            <span className="text-[#737373]">initial setup (due on start)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-sans font-extrabold text-[#0A0A0A] text-2xl">$300</span>
            <span className="text-[#737373]">/month ongoing (starting July 1, at Roye's discretion)</span>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-12">
        <h2 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Timeline</h2>
        <div className="bg-black/[0.02] border border-black/[0.08] rounded-xl p-6">
          <p className="text-[#525252]">
            <strong className="text-[#0A0A0A]">Initial phase:</strong> June 1 – July 1, 2026<br/>
            <strong className="text-[#0A0A0A]">Ongoing:</strong> Monthly support continues at Roye's discretion
          </p>
        </div>
      </section>

      {/* Agreement Modal Trigger */}
      {!isSigned ? (
        <section className="mb-12">
          <button
            onClick={() => setShowAgreement(true)}
            className="w-full bg-[#0A0A0A] text-[#FAFAFA] font-semibold rounded-xl px-6 py-4 hover:bg-[#1a1a1a] transition-colors"
          >
            Review & Accept Agreement
          </button>
          <p className="text-center text-[#A3A3A3] text-xs mt-4">
            By accepting, you agree to the scope of work outlined above.
          </p>
        </section>
      ) : (
        <section className="mb-12 bg-green-500/10 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10L8 14L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Agreement Accepted</h3>
              <p className="text-green-700 text-sm">Signed by {signerName} on {signedAt && formatDate(signedAt)}</p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="pt-8 border-t border-black/[0.08] flex items-center justify-between">
        <p className="text-xs text-[#C4C4C4] font-mono">
          Agreement dated {new Date().toLocaleDateString('en-GB')}
        </p>
        <button 
          onClick={handleSignOut}
          className="text-xs text-[#A3A3A3] hover:text-[#525252] transition-colors font-mono"
        >
          Sign out
        </button>
      </div>

      {/* Agreement Modal */}
      {mounted && showAgreement && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <h2 className="font-sans font-bold text-[#0A0A0A] text-2xl mb-2">Service Agreement</h2>
              <p className="text-[#737373] text-sm mb-6">
                Please review and accept the terms to begin the project.
              </p>
              
              <div className="bg-black/[0.02] rounded-xl p-5 mb-6 space-y-4 text-sm text-[#525252] max-h-64 overflow-y-auto">
                <p><strong className="text-[#0A0A0A]">1. Scope</strong><br/>
                Sorted provides platform setup, digital presence, content distribution, and growth tracking as outlined in the deliverables.</p>
                
                <p><strong className="text-[#0A0A0A]">2. Timeline</strong><br/>
                Initial phase: June 1 – July 1, 2026. Ongoing monthly support continues at Roye's discretion.</p>
                
                <p><strong className="text-[#0A0A0A]">3. Content Workflow</strong><br/>
                Roye provides raw content via Google Drive. Sorted handles editing, optimization, and distribution across all channels.</p>
                
                <p><strong className="text-[#0A0A0A]">4. Payment</strong><br/>
                $2,000 initial fee due on start. $300/month ongoing from July 1, continuing at Roye's discretion.</p>
                
                <p><strong className="text-[#0A0A0A]">5. Access & Ownership</strong><br/>
                All accounts and content remain Roye's property. Sorted provides all passwords and full access upon request or termination.</p>
                
                <p><strong className="text-[#0A0A0A]">6. Termination</strong><br/>
                Roye may terminate with 10 days written notice. Upon termination, Sorted provides full access to all deliverables and transfers all licenses.</p>
                
                <p><strong className="text-[#0A0A0A]">7. Content Control</strong><br/>
                Upon written request, Sorted will immediately remove any content from social media platforms.</p>
                
                <p><strong className="text-[#0A0A0A]">8. Governing Law</strong><br/>
                Any disputes resolved in New Jersey courts.</p>
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
    </main>
  )
}
