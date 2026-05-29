"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"

const AUTH_KEY = "raffles_auth"
const AUTH_EXPIRY_DAYS = 30

export default function RafflesProposal() {
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
    if (password.toLowerCase() === "raffles2026") {
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
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em]">Private - for Raffles Restaurant</p>
        </div>

        {/* Salutation */}
        <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl leading-tight tracking-tight mb-10">
          Raffles Team,
        </h1>

        {/* Full Strategy Document */}
        <div className="space-y-12 text-[#525252] text-base leading-relaxed mb-16">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="font-sans font-extrabold text-[#0A0A0A] text-3xl mb-2">Raffles Restaurant</h2>
            <p className="font-mono text-sm text-[#737373] uppercase tracking-[0.15em]">Customer Growth & Local Awareness Strategy</p>
            <p className="text-[#737373] text-sm mt-2 italic">Turning Kenilworth's Hidden Gem into a Destination</p>
          </div>

          {/* Concept Images - Full Size */}
          <div className="space-y-8">
            <div>
              <div className="relative w-full rounded-xl overflow-hidden border border-black/[0.08] mb-3" style={{ aspectRatio: 'auto' }}>
                <Image
                  src="/proposals/raffles-restaurant/concept-1.png"
                  alt="Raffles Restaurant website concept"
                  width={1200}
                  height={675}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-[#737373] text-center">Ad concept showcasing Malaysian cuisine with warm, appetising photography</p>
            </div>
            <div>
              <div className="relative w-full rounded-xl overflow-hidden border border-black/[0.08] mb-3" style={{ aspectRatio: 'auto' }}>
                <Image
                  src="/proposals/raffles-restaurant/concept-2.png"
                  alt="Raffles social presence concept"
                  width={1200}
                  height={675}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-[#737373] text-center">Social media presence reflecting authentic Malaysian culture and hospitality</p>
            </div>
          </div>

          {/* Introduction */}
          <div>
            <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Introduction</h3>
            <p className="mb-4">
              After reviewing Raffles Restaurant, its location, online presence, and the unique challenge of operating from within The Peacock Hotel, one thing became immediately clear:
            </p>
            <p className="text-[#0A0A0A] font-semibold mb-4">
              The restaurant does not have a food problem. It has a visibility problem.
            </p>
            <p className="mb-4">
              Raffles is currently hidden in plain sight.
            </p>
            <p className="mb-4">
              Thousands of people move through Kenilworth every week. Local residents pass the building daily. Visitors come to explore the town, castle, and surrounding attractions. Contractors and business travellers stay locally throughout the year.
            </p>
            <p className="mb-4">
              Yet many never realise there is an established Malaysian restaurant inside.
            </p>
            <p className="mb-4">
              The objective therefore is not simply to "advertise."
            </p>
            <p>
              The objective is to create awareness, curiosity, and repeat visitation by positioning Raffles as a destination in its own right.
            </p>
          </div>

          {/* The Opportunity */}
          <div className="p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
            <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">The Opportunity</h3>
            <p className="mb-4">
              Kenilworth presents a highly favourable environment for growth:
            </p>
            <ul className="space-y-2 ml-6 mb-4">
              <li>• Approximately 12,000 local residents</li>
              <li>• Significant daily visitor traffic</li>
              <li>• Tourism driven by Kenilworth Castle and surrounding attractions</li>
              <li>• Business travellers and contractors staying locally</li>
              <li>• Limited competition offering authentic Malaysian cuisine</li>
            </ul>
            <p className="mb-4">
              The target is modest and highly achievable:
            </p>
            <p className="text-[#0A0A0A] font-semibold mb-2">Growth Objective</p>
            <p className="text-[#0A0A0A] font-bold text-lg mb-4">
              15–20 additional customers per day
            </p>
            <p className="mb-2">Equivalent to:</p>
            <ul className="space-y-1 ml-6">
              <li>• 450–600 additional covers per month</li>
              <li>• Approximately 4–6 additional tables per evening</li>
            </ul>
            <p className="mt-4">
              This can be achieved without requiring large-scale advertising budgets.
            </p>
          </div>

          {/* Strategic Framework */}
          <div>
            <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Strategic Framework</h3>
            <p className="mb-4">
              The growth strategy is built around three core audiences:
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-black/[0.06]">
                <p className="font-semibold text-[#0A0A0A] mb-2">Audience 1 — Visitors & Tourists</p>
                <p>People visiting Kenilworth for leisure, history, tourism, and events.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-black/[0.06]">
                <p className="font-semibold text-[#0A0A0A] mb-2">Audience 2 — Local Residents</p>
                <p>People who know the building exists but have never visited the restaurant.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-black/[0.06]">
                <p className="font-semibold text-[#0A0A0A] mb-2">Audience 3 — Business Travellers & Contractors</p>
                <p>Professionals staying or working in the area who require reliable evening dining options.</p>
              </div>
            </div>
          </div>

          {/* Phase 1 */}
          <div>
            <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Phase 1 — Visibility & Discovery</h3>
            <p className="font-semibold text-[#0A0A0A] mb-2">Google Presence Optimisation</p>
            <p className="mb-4">
              Raffles should become highly visible when people search:
            </p>
            <ul className="space-y-1 ml-6 mb-4">
              <li>• Restaurants in Kenilworth</li>
              <li>• Places to eat near Kenilworth Castle</li>
              <li>• Best restaurant in Kenilworth</li>
              <li>• Dinner in Kenilworth</li>
              <li>• Malaysian restaurant Warwickshire</li>
            </ul>
            <p className="font-semibold text-[#0A0A0A] mb-2">Actions:</p>
            <ul className="space-y-1 ml-6 mb-6">
              <li>• Google Business Profile optimisation</li>
              <li>• Updated photography</li>
              <li>• Ongoing review generation</li>
              <li>• Enhanced menu presentation</li>
              <li>• Weekly updates and offers</li>
            </ul>
            <p className="font-semibold text-[#0A0A0A] mb-2">Local Search Advertising</p>
            <p className="mb-4">
              A focused Google Ads campaign targeting:
            </p>
            <ul className="space-y-1 ml-6">
              <li>• Visitors already searching for restaurants</li>
              <li>• Tourists researching Kenilworth</li>
              <li>• People seeking dining options nearby</li>
            </ul>
            <p className="mt-4">
              Rather than broad advertising, this targets individuals already intending to dine.
            </p>
          </div>

          {/* Phase 2 */}
          <div>
            <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Phase 2 — Give People A Reason To Visit</h3>
            <p className="mb-4">
              Most restaurants advertise food. Very few advertise experiences.
            </p>
            <p className="mb-6">
              Raffles should become known for themed evenings and memorable events that create conversation throughout the town.
            </p>
            <p className="font-semibold text-[#0A0A0A] mb-2">History & Dining Evenings</p>
            <p className="mb-4">
              Partner with local historians and tour guides.
            </p>
            <p className="font-semibold text-[#0A0A0A] mb-2">Examples:</p>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-white rounded-lg border border-black/[0.06]">
                <p className="font-semibold text-[#0A0A0A] mb-2">The Secrets of Kenilworth Castle</p>
                <p>A hosted evening featuring:</p>
                <ul className="space-y-1 ml-6">
                  <li>• Short presentation</li>
                  <li>• Local stories</li>
                  <li>• Malaysian dining experience</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-lg border border-black/[0.06]">
                <p className="font-semibold text-[#0A0A0A] mb-2">Tudor Kenilworth</p>
                <p>Historical dining evenings tied to local heritage.</p>
              </div>
            </div>
            <p className="mb-6">
              These create a unique experience unavailable elsewhere in the area.
            </p>
            <p className="font-semibold text-[#0A0A0A] mb-2">Journey Through Malaysia</p>
            <p className="mb-4">
              Monthly themed dining events exploring different regions.
            </p>
            <p className="font-semibold text-[#0A0A0A] mb-2">Examples:</p>
            <ul className="space-y-1 ml-6 mb-4">
              <li>• Penang Night</li>
              <li>• Kuala Lumpur Night</li>
              <li>• Borneo Night</li>
              <li>• Malacca Night</li>
            </ul>
            <p className="font-semibold text-[#0A0A0A] mb-2">Featuring:</p>
            <ul className="space-y-1 ml-6 mb-6">
              <li>• Special menus</li>
              <li>• Cultural stories</li>
              <li>• Regional dishes</li>
              <li>• Authentic experiences</li>
            </ul>
            <p className="font-semibold text-[#0A0A0A] mb-2">Live Acoustic Sessions</p>
            <p className="mb-4">
              Small-scale performances suited to the intimate restaurant atmosphere.
            </p>
            <p className="font-semibold text-[#0A0A0A] mb-2">Focus on:</p>
            <ul className="space-y-1 ml-6 mb-4">
              <li>• Acoustic artists</li>
              <li>• Jazz</li>
              <li>• Folk</li>
              <li>• Relaxed evening entertainment</li>
            </ul>
            <p className="mb-6">
              Rather than becoming a music venue, the music enhances the dining experience.
            </p>
            <p className="font-semibold text-[#0A0A0A] mb-2">Malaysian Street Food Nights</p>
            <p className="mb-4">
              More casual evenings introducing people to Malaysian cuisine.
            </p>
            <p className="font-semibold text-[#0A0A0A] mb-2">Designed specifically for:</p>
            <ul className="space-y-1 ml-6">
              <li>• First-time visitors</li>
              <li>• Younger audiences</li>
              <li>• Local residents</li>
            </ul>
            <p className="mt-4">
              Lower commitment and highly shareable on social media.
            </p>
          </div>

          {/* Phase 3 */}
          <div>
            <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Phase 3 — Community Integration</h3>
            <p className="mb-6">
              The goal is to become part of the town's regular rhythm.
            </p>
            <p className="font-semibold text-[#0A0A0A] mb-2">Raffles Passport</p>
            <p className="mb-4">
              A simple loyalty programme.
            </p>
            <p className="font-semibold text-[#0A0A0A] mb-2">Examples:</p>
            <ul className="space-y-1 ml-6 mb-4">
              <li>• Visit 5 times</li>
              <li>• Receive complimentary dishes</li>
              <li>• Priority booking access</li>
              <li>• Exclusive event invitations</li>
            </ul>
            <p className="mb-6">
              The objective is repeat visits rather than constant new customer acquisition.
            </p>
            <p className="font-semibold text-[#0A0A0A] mb-2">Resident Nights</p>
            <p className="mb-4">
              Special evenings designed exclusively for local residents.
            </p>
            <p className="font-semibold text-[#0A0A0A] mb-2">Examples:</p>
            <ul className="space-y-1 ml-6 mb-4">
              <li>• Neighbour Night</li>
              <li>• Midweek Dining Club</li>
              <li>• Two-Course Thursday</li>
            </ul>
            <p className="mb-4">
              The messaging becomes:
            </p>
            <p className="text-[#0A0A0A] font-semibold italic mb-2">"Your local restaurant."</p>
            <p className="mb-6">
              rather than:
            </p>
            <p className="text-[#737373] italic mb-6">"The restaurant inside the hotel."</p>
            <p className="font-semibold text-[#0A0A0A] mb-2">Business & Contractor Programme</p>
            <p className="mb-4">
              Many contractors and travelling professionals require evening dining.
            </p>
            <p className="font-semibold text-[#0A0A0A] mb-2">Offer:</p>
            <ul className="space-y-1 ml-6">
              <li>• Contractor discount</li>
              <li>• Business dining specials</li>
              <li>• Hotel guest promotions</li>
              <li>• Corporate group bookings</li>
            </ul>
            <p className="mt-4">
              This audience often generates repeat visits throughout the year.
            </p>
          </div>

          {/* Phase 4 */}
          <div>
            <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Phase 4 — Partnerships</h3>
            <p className="mb-4">
              A significant opportunity exists through local partnerships.
            </p>
            <p className="font-semibold text-[#0A0A0A] mb-2">Potential partners include:</p>
            <ul className="space-y-1 ml-6 mb-4">
              <li>• Kenilworth Castle</li>
              <li>• Local tour operators</li>
              <li>• Walking tour groups</li>
              <li>• Hotels</li>
              <li>• Guest houses</li>
              <li>• Golf clubs</li>
              <li>• Networking organisations</li>
              <li>• Business associations</li>
            </ul>
            <p>
              The objective is to establish Raffles as a recommended dining destination for visitors entering the town.
            </p>
          </div>

          {/* Content & Social Strategy */}
          <div>
            <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Content & Social Strategy</h3>
            <p className="mb-6">
              Rather than posting endless food photography, content should focus on stories.
            </p>
            <p className="font-semibold text-[#0A0A0A] mb-2">Themes</p>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-black/[0.06]">
                <p className="font-semibold text-[#0A0A0A] mb-2">Hidden Gem</p>
                <p>Highlight the fact that many people walk past without realising what is inside.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-black/[0.06]">
                <p className="font-semibold text-[#0A0A0A] mb-2">Malaysian Culture</p>
                <p>Tell the stories behind dishes and ingredients.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-black/[0.06]">
                <p className="font-semibold text-[#0A0A0A] mb-2">Kenilworth Connections</p>
                <p>Celebrate local history and community.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-black/[0.06]">
                <p className="font-semibold text-[#0A0A0A] mb-2">Event Promotion</p>
                <p>Build anticipation around upcoming themed evenings.</p>
              </div>
            </div>
            <p className="mt-6">
              The goal is to create familiarity before someone ever walks through the door.
            </p>
          </div>

          {/* Recommended Rollout */}
          <div>
            <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Recommended Rollout</h3>
            <div className="space-y-6">
              <div className="p-4 bg-white rounded-lg border border-black/[0.06]">
                <p className="font-semibold text-[#0A0A0A] mb-2">Phase 1 — Foundation & Awareness (Months 1–2)</p>
                <ul className="space-y-1 ml-6">
                  <li>• Google optimisation</li>
                  <li>• Website improvements</li>
                  <li>• Photography refresh</li>
                  <li>• Review generation programme</li>
                  <li>• Local search campaign</li>
                  <li>• Social media campaign</li>
                  <li>• Resident offers</li>
                  <li>• Loyalty programme</li>
                  <li>• Contractor programme</li>
                  <li>• Partnership outreach</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-lg border border-black/[0.06]">
                <p className="font-semibold text-[#0A0A0A] mb-2">Phase 2 — Event Engine (Month 2 onwards)</p>
                <ul className="space-y-1 ml-6">
                  <li>• History nights</li>
                  <li>• Malaysian cultural evenings</li>
                  <li>• Acoustic sessions</li>
                  <li>• Seasonal events</li>
                  <li>• Community collaborations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Investment */}
          <div>
            <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Investment</h3>
            <div className="bg-[#0A0A0A] rounded-2xl p-8 sm:p-10 mb-8">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/60 mb-2">Initial Marketing Foundation</p>
              <p className="font-sans font-extrabold text-white text-5xl tracking-tight mb-6">£1,200</p>
              <p className="text-white/90 mb-4">Includes:</p>
              <ul className="space-y-2 text-white/80">
                <li>• Strategy development</li>
                <li>• Website improvements</li>
                <li>• Google optimisation</li>
                <li>• Campaign setup</li>
                <li>• Creative assets</li>
                <li>• Launch implementation</li>
              </ul>
            </div>
            <div className="p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-2">Ongoing Growth Management</p>
              <p className="font-sans font-extrabold text-[#0A0A0A] text-3xl tracking-tight mb-4">£550/month</p>
              <p className="mb-4">Includes:</p>
              <ul className="space-y-2">
                <li>• Campaign management</li>
                <li>• Event promotion</li>
                <li>• Partnership development</li>
                <li>• Social media guidance</li>
                <li>• Performance monitoring</li>
                <li>• Monthly optimisation</li>
              </ul>
            </div>
          </div>

          {/* Reasonable Scenario */}
          <div className="p-6 bg-[#0A0A0A] rounded-xl">
            <h3 className="font-sans font-bold text-white text-xl mb-4">Reasonable Scenario</h3>
            <p className="text-white/90 mb-6">
              What does the path to 15–20 customers per day look like? Here's a conservative projection of how the target builds over time through visibility initiatives and repeat business programmes.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/80">Month 1 — Foundation (early gains from Google + website)</span>
                <span className="text-white font-semibold">+3–5 new/day</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/80">Month 2 — Awareness building (social + partnerships)</span>
                <span className="text-white font-semibold">+7–10 new/day</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/80">Month 3 — Events + loyalty kicking in</span>
                <span className="text-white font-semibold">+12–15 new/day</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/80">Month 6 — Target achieved (new + repeat combined)</span>
                <span className="text-white font-bold text-xl">15–20 total/day</span>
              </div>
            </div>
            <p className="text-white/70 text-sm mb-6">
              Growth compounds as initiatives take effect: Google visibility brings new customers, partnerships drive tourist traffic, themed evenings create conversation, and the loyalty programme converts one-time visitors into regulars. Contractor programme provides steady repeat business. The target is the total customers per day — growth is the natural outcome of these initiatives.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/80">Target customers per day (Month 6)</span>
                <span className="text-white font-bold text-xl">15–20</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/80">Target covers per month</span>
                <span className="text-white font-semibold">450–600</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/80">Average spend per person (conservative)</span>
                <span className="text-white font-semibold">£25</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/80">Projected monthly revenue at target</span>
                <span className="text-white font-bold text-xl">£11,250–£15,000</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/80">Ongoing investment</span>
                <span className="text-white font-semibold">£550/month</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-white/80">Investment as % of projected revenue</span>
                <span className="text-green-400 font-bold text-xl">3.7–4.9%</span>
              </div>
            </div>
            <p className="text-white/70 text-sm mt-6">
              At the target of 15–20 customers per day, the investment represents less than 5% of projected revenue. The customer mix is roughly 50/50 between new customers (tourists, visitors, new locals) and repeat business (loyalty programme, contractors, themed evenings).
            </p>
          </div>

          {/* Closing Thoughts */}
          <div className="p-6 bg-[#0A0A0A] rounded-xl">
            <h3 className="font-sans font-bold text-white text-xl mb-4">Closing Thoughts</h3>
            <p className="text-white/90 mb-4">
              The strongest opportunity for Raffles is not competing against every restaurant in Warwickshire.
            </p>
            <p className="text-white text-lg font-semibold mb-4">
              It is becoming impossible to overlook within Kenilworth itself.
            </p>
            <p className="text-white/90 mb-4">
              The restaurant already sits beside existing demand:
            </p>
            <ul className="space-y-1 ml-6 mb-4 text-white/90">
              <li>• Residents</li>
              <li>• Visitors</li>
              <li>• Contractors</li>
              <li>• Hotel guests</li>
            </ul>
            <p className="text-white/90 mb-4">
              The challenge is not creating demand.
            </p>
            <p className="text-white/90 mb-4">
              The challenge is creating awareness, curiosity, and a compelling reason to visit.
            </p>
            <p className="text-white/90">
              Once that happens consistently, the restaurant can become known not as the restaurant inside the hotel, but as one of Kenilworth's most distinctive dining destinations.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Payment Details */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            Payment details
          </span>
          <div className="p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
            <div className="space-y-2 text-sm">
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-28 shrink-0">Bank Name</span>
                <span className="text-[#0A0A0A] font-medium">Revolut</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-28 shrink-0">Account Name</span>
                <span className="text-[#0A0A0A] font-medium">Renaldo Lee Edmondson</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-28 shrink-0">Sort Code</span>
                <span className="text-[#0A0A0A] font-medium font-mono">23-01-20</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A3A3A3] w-28 shrink-0">Account Number</span>
                <span className="text-[#0A0A0A] font-medium font-mono">83621039</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Closing */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p className="text-[#0A0A0A] font-semibold">
            If this looks right, reply to confirm and I'll send over the deposit invoice to get started. Any questions, just ask.
          </p>
        </div>

        {/* Client Signature Section */}
        <div className="mb-16 pt-8 border-t border-black/[0.08]">
          {!isSigned ? (
            <>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#525252] mb-4">Accept This Proposal: Enter Your Name</p>
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
                  onClick={() => {
                    setShowAgreement(true)
                  }}
                  disabled={!signerName.trim()}
                  className="bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-6 py-3 hover:bg-[#2a2a2a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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

        {/* Agreement Modal - Portal to body to escape transform containing block */}
        {showAgreement && mounted && createPortal(
          <div 
            className="bg-black/60 flex items-center justify-center p-4"
            style={{ 
              position: "fixed",
              top: 0, 
              left: 0, 
              width: "100vw",
              height: "100vh",
              zIndex: 9999 
            }}
            onClick={() => setShowAgreement(false)}
          >
            <div 
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl flex flex-col"
              style={{ maxHeight: "calc(100vh - 2rem)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08] shrink-0">
                <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Service Agreement</h3>
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

              {/* Scrollable content */}
              <div className="px-6 py-5 overflow-y-auto flex-1">
                <div className="space-y-4 text-sm text-[#525252] leading-relaxed">
                  <p>
                    <strong className="text-[#0A0A0A]">1. Services:</strong> Sorted agrees to provide the services described in this proposal: Website Design, Website Development, Content Management System (SortedUpdates), and Launch Setup & Testing.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">2. Payment:</strong> Total project cost is £1,200. 50% deposit (£600) due on project commencement. Balance (£600) due before final handover.
                  </p>
                  <p>
                    <strong className="text-[#0A0A0A]">3. Timeline:</strong> Estimated 3 weeks from deposit receipt to launch, subject to timely provision of materials and feedback.
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
                    <strong className="text-[#0A0A0A]">7. Limitation:</strong> Sorted is not liable for third-party service failures (hosting, domain providers) or losses beyond the project fee.
                  </p>
                </div>
              </div>

              {/* Sticky footer */}
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
                    setSignedAt(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
                  }}
                  className="flex-1 bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-lg px-4 py-3 hover:bg-[#2a2a2a] transition-colors"
                >
                  I Accept - Sign as {signerName}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* My Signature */}
        <div className="mb-24">
          <p className="font-sans font-bold text-[#0A0A0A] text-lg">Renaldo</p>
          <p className="text-[#A3A3A3] text-sm">Sorted</p>
        </div>

        {/* Subtle footer */}
        <div className="border-t border-black/[0.06] pt-8 flex items-center justify-between">
          <p className="text-xs text-[#C4C4C4] font-mono">Sorted. — sortmydigital.netlify.app</p>
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
