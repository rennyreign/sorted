"use client"

import { useGeoPricing } from "@/hooks/useGeoPricing"

const checkIcon = (
  <svg className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

export default function UpdatesPricing() {
  const pricing = useGeoPricing()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Portal - Monthly */}
      <div className="p-8 border-2 border-[#0A0A0A] rounded-2xl bg-white relative">
        <span className="absolute -top-3 left-6 bg-[#0A0A0A] text-white text-xs font-semibold px-3 py-1 rounded-full">
          Portal access
        </span>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-sans font-extrabold text-[#0A0A0A] text-4xl">{pricing.monthlyUpdates}</span>
          <span className="text-[#525252] text-sm">/month</span>
        </div>
        <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Unlimited Updates</h3>
        <p className="text-[#525252] text-sm leading-relaxed mb-6">
          Full access to your site&apos;s SortedUpdates portal. Unlimited requests,
          safe changes in 30 seconds, chat with the agent directly.
        </p>
        <ul className="space-y-3 text-sm">
          {["Unlimited requests via portal", "Chat with the agent in real-time", "Safe changes: 30 seconds", "Cancel anytime"].map((item) => (
            <li key={item} className="flex items-start gap-3">
              {checkIcon}
              <span className="text-[#525252]">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pay As You Go */}
      <div className="p-8 border border-black/[0.08] rounded-2xl bg-[#FAFAFA]">
        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-sans font-extrabold text-[#0A0A0A] text-4xl">{pricing.perUpdate}</span>
          <span className="text-[#525252] text-sm">/update</span>
        </div>
        <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Pay As You Go</h3>
        <p className="text-[#525252] text-sm leading-relaxed mb-6">
          For occasional updates. Send an email with your request,
          the agent handles it remotely and replies when done.
        </p>
        <ul className="space-y-3 text-sm">
          {["Per-request billing", "No subscription needed", "Email-based workflow", "Done and confirmed by reply"].map((item) => (
            <li key={item} className="flex items-start gap-3">
              {checkIcon}
              <span className="text-[#525252]">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
