"use client"

import { useState } from "react"
import type { Metadata } from "next"

export default function PartyWorldProposal() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)
  
  // Signature states
  const [signerName, setSignerName] = useState("")
  const [showAgreement, setShowAgreement] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const [signedAt, setSignedAt] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.toLowerCase() === "thepresidents") {
      setIsAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <div className="mb-8">
            <span className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight">Sorted.</span>
          </div>
          <h1 className="font-sans font-bold text-[#0A0A0A] text-xl mb-2">Private Proposal</h1>
          <p className="text-[#737373] text-sm mb-6">Enter the password to view this proposal.</p>
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
              View Proposal
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
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em]">Private - for Natasha and Hemans</p>
        </div>

        {/* Salutation */}
        <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl leading-tight tracking-tight mb-10">
          Your Online Store
        </h1>

        {/* Opening letter */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            Following our conversation about your new online store, I've put together a straightforward proposal to get you from where you are now to a fully functioning Shopify store, ready for customers to browse and buy.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            The goal is simple: a clean, modern ecommerce site that showcases your products properly, works smoothly on mobile and desktop, and doesn't require technical knowledge to manage day-to-day.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Deliverables */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            What we'll deliver
          </span>
          <div className="space-y-10">
            {[
              {
                num: "01",
                title: "Store Design",
                body: "A modern ecommerce layout designed specifically for your product range and brand. This includes homepage design, product collection and category layouts, individual product detail pages, mobile-responsive layouts, shopping flow and checkout experience, visual styling and image presentation.",
              },
              {
                num: "02",
                title: "Shopify Development",
                body: "The approved design converted into a working Shopify store. This includes theme setup, responsive development, navigation and menu structure, product filtering and category organisation, cart and checkout functionality, contact and enquiry forms, and performance optimisation.",
              },
              {
                num: "03",
                title: "Store Setup & Testing",
                body: "Configuration and preparation for launch. This includes Shopify settings, currency and regional configuration, shipping structure and rates, basic SEO setup, cross-device testing, checkout and cart flow testing, and general usability review.",
              },
              {
                num: "04",
                title: "Product Catalogue Setup",
                body: "Your product range organised and loaded into the store. This includes product imports and uploads, product categorisation and collections, product image placement and ordering, and product options/variations setup where needed.",
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

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Timeline */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            Project timeline
          </span>
          <div className="space-y-6">
            {[
              { stage: "Week 1", desc: "Design direction and storefront layouts prepared" },
              { stage: "Week 1–2", desc: "Shopify build and page development" },
              { stage: "Week 2", desc: "Product catalogue setup and organisation" },
              { stage: "Final Stage", desc: "Testing, revisions and launch preparation" },
            ].map((item) => (
              <div key={item.stage} className="flex gap-8">
                <span className="font-mono text-xs text-[#525252] tabular-nums shrink-0 w-24">{item.stage}</span>
                <p className="text-[#737373] text-base">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[#737373] text-sm mt-6 leading-relaxed">
            Throughout the process, I'll share progress updates so you know what's been completed, what's currently being worked on, and what's next.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Investment */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            Investment
          </span>
          <div className="bg-[#0A0A0A] rounded-2xl p-8 sm:p-10 mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/60 mb-2">Total Project Cost</p>
            <p className="font-sans font-extrabold text-white text-5xl tracking-tight mb-6">€2,000</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-t border-white/10">
                <div>
                  <p className="text-white font-semibold">Deposit to start (50%)</p>
                  <p className="text-white/60 text-sm">Due on project commencement</p>
                </div>
                <p className="text-white font-bold text-xl">€1,000</p>
              </div>
              <div className="flex items-center justify-between py-4 border-t border-white/10">
                <div>
                  <p className="text-white font-semibold">Balance on completion (50%)</p>
                  <p className="text-white/60 text-sm">Due before final handover</p>
                </div>
                <p className="text-white font-bold text-xl">€1,000</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Payment details</p>
            <div className="space-y-2 text-sm">
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-28 shrink-0">Bank Name</span>
                <span className="text-[#0A0A0A] font-medium">Wise</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-28 shrink-0">Account Name</span>
                <span className="text-[#0A0A0A] font-medium">Renaldo Lee Edmondson</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-28 shrink-0">IBAN</span>
                <span className="text-[#0A0A0A] font-medium font-mono">BE42 9671 7255 2454</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-28 shrink-0">Bank Address</span>
                <span className="text-[#0A0A0A]">Wise, Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post-Launch */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6 block">
            After launch
          </span>
          <div className="space-y-3 text-[#737373] text-base leading-relaxed">
            <p>Once live, you'll have:</p>
            <ul className="space-y-2 ml-4">
              {[
                "A Shopify store you can manage without technical knowledge",
                "Training on how to add/edit products (if needed)",
                "Documentation on managing orders and basic store operations",
                "A structure that allows future expansion (new products, categories, promotions)",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-[#0A0A0A]">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Not Included */}
        <div className="mb-16 p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">Not included in this proposal</p>
          <ul className="space-y-1">
            {[
              "Professional product photography",
              "Paid advertising setup or management",
              "Advanced SEO or content marketing",
              "Ongoing maintenance or support retainer",
              "Custom app development",
            ].map((item) => (
              <li key={item} className="text-sm text-[#737373]">{item}</li>
            ))}
          </ul>
          <p className="text-xs text-[#A3A3A3] mt-4">These can be discussed separately if required.</p>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Closing */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            The aim is a store that feels modern and visually clean, easy for customers to navigate, simple for you to manage, and ready to grow as your business grows.
          </p>
          <p>
            Shopify handles the technical side (hosting, security, payment processing) so you can focus on running the business.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            If this looks right, reply to confirm and I'll send over the deposit invoice to get started. Any questions, just ask.
          </p>
        </div>

        {/* Client Signature Section */}
        <div className="mb-16 pt-8 border-t border-black/[0.08]">
          {!isSigned ? (
            <>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Accept this proposal</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="flex-1 px-4 py-3 bg-white border border-black/[0.12] rounded-lg text-[#0A0A0A] placeholder:text-[#A3A3A3] focus:outline-none focus:border-black/[0.3] transition-colors"
                />
                <button
                  onClick={() => setShowAgreement(true)}
                  disabled={!signerName.trim()}
                  className="bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-6 py-3 hover:bg-[#2a2a2a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Review & Accept
                </button>
              </div>
              <p className="text-xs text-[#A3A3A3] mt-3">By accepting, you agree to the terms outlined in this proposal.</p>
            </>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-green-700 mb-2">Proposal Accepted</p>
              <p className="text-green-800 text-[2rem]" style={{ fontFamily: "var(--font-signature), cursive" }}>
                {signerName}
              </p>
              <p className="text-xs text-green-600 mt-2">Signed on {signedAt}</p>
            </div>
          )}
        </div>

        {/* Agreement Modal */}
        {showAgreement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowAgreement(false)}>
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-6">Service Agreement</h3>
                
                <div className="space-y-4 text-sm text-[#525252] leading-relaxed mb-8">
                  <p>
                    <strong className="text-[#0A0A0A]">1. Services:</strong> Sorted agrees to provide the services described in this proposal: Store Design, Shopify Development, Store Setup & Testing, and Product Catalogue Setup.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">2. Payment:</strong> Total project cost is €2,000. 50% deposit (€1,000) due on project commencement. Balance (€1,000) due before final handover.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">3. Timeline:</strong> Estimated 2-3 weeks from deposit receipt to launch, subject to timely provision of materials and feedback.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">4. Intellectual Property:</strong> Upon full payment, client owns all rights to the final website design and content. Sorted retains the right to display the work in portfolio.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">5. Revisions:</strong> Two rounds of revisions included per stage. Additional revisions may incur extra charges.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">6. Cancellation:</strong> Deposit is non-refundable once work has commenced. If project is cancelled by client, work completed to date will be billed proportionally.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">7. Limitation:</strong> Sorted is not liable for third-party service failures (Shopify, payment processors) or losses beyond the project fee.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAgreement(false)}
                    className="flex-1 px-4 py-3 border border-black/[0.12] rounded-lg text-[#525252] font-medium text-sm hover:bg-black/[0.02] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsSigned(true)
                      setShowAgreement(false)
                      setSignedAt(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
                    }}
                    className="flex-1 bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors"
                  >
                    I Accept - Sign as {signerName}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Signature */}
        <div className="mb-24">
          <p className="font-sans font-bold text-[#0A0A0A] text-lg">Renaldo</p>
          <p className="text-[#A3A3A3] text-sm">Sorted</p>
        </div>

        {/* Subtle footer */}
        <div className="border-t border-black/[0.06] pt-8">
          <p className="text-xs text-[#C4C4C4] font-mono">Sorted. — sortmydigital.netlify.app</p>
        </div>
      </main>
    </>
  )
}
