import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sorted Updates | Website changes via WhatsApp",
  description: "Text your website updates. Get changes made without emails, tickets, or waiting weeks.",
}

export default function SortedUpdatesPage() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="pt-40 pb-20 px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
            Sorted Updates
          </span>
          <h1 className="font-sans font-extrabold text-[#0A0A0A] text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-tight max-w-5xl mb-8">
            Text your website updates.
            <br />
            <span className="text-[#525252]">Get them done.</span>
          </h1>
          <p className="text-[#525252] text-lg font-medium leading-relaxed max-w-xl">
            No emails. No tickets. No waiting weeks. Send a WhatsApp message, 
            approve the preview, and your changes go live.
          </p>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
            How it works
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-3xl leading-tight tracking-tight mb-12">
            Four steps. No friction.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Message</h3>
              <p className="text-[#525252] text-sm leading-relaxed">
                Send a WhatsApp with what you need changed. "Update the prices," 
                "Add a new team member," or "Fix the phone number."
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Process</h3>
              <p className="text-[#525252] text-sm leading-relaxed">
                Sorted understands your request, checks it against your site rules, 
                and prepares the changes with a cost estimate.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white font-bold text-lg">
                3
              </div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Preview</h3>
              <p className="text-[#525252] text-sm leading-relaxed">
                Get a private preview link. See exactly how the changes look 
                before they go anywhere near your live site.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-lg">
                4
              </div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Live</h3>
              <p className="text-[#525252] text-sm leading-relaxed">
                Reply "yes" and changes go live immediately. Reply "no" 
                or request tweaks. You're in control.
              </p>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
            What&apos;s included
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-3xl leading-tight tracking-tight mb-12">
            Most small business site needs.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A]">Content edits</h4>
              <p className="text-[#525252] text-sm">Text changes, price updates, contact details, opening hours.</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A]">New pages</h4>
              <p className="text-[#525252] text-sm">Add services, team members, locations, or landing pages.</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A]">Image swaps</h4>
              <p className="text-[#525252] text-sm">Replace photos, add new galleries, update team headshots.</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A]">Links & buttons</h4>
              <p className="text-[#525252] text-sm">Add booking links, change phone numbers, update CTAs.</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A]">Small fixes</h4>
              <p className="text-[#525252] text-sm">Typos, broken links, mobile layout issues, speed tweaks.</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A]">Advice</h4>
              <p className="text-[#525252] text-sm">"Should I add this?" "What about that?" Quick guidance included.</p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-[#FAFAFA] border border-black/[0.06] rounded-lg">
            <p className="text-[#525252] text-sm leading-relaxed">
              <span className="font-semibold text-[#0A0A0A]">Not included:</span> Complete redesigns, 
              custom functionality, e-commerce builds, or anything that needs a proper project scope. 
              Those still happen, just not via WhatsApp. We&apos;ll tell you if something needs 
              a separate conversation.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
            Pricing
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-3xl leading-tight tracking-tight mb-12">
            Simple options.
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly */}
            <div className="p-8 border border-black/[0.08] rounded-2xl bg-white">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-sans font-extrabold text-[#0A0A0A] text-4xl">£149</span>
                <span className="text-[#525252] text-sm">/month</span>
              </div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Unlimited Updates</h3>
              <p className="text-[#525252] text-sm leading-relaxed mb-6">
                For businesses that change frequently. Unlimited WhatsApp requests, 
                48-hour turnaround, priority handling.
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#525252]">Unlimited requests</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#525252]">48-hour turnaround</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#525252]">Preview before every change</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#525252]">Monthly billing, cancel anytime</span>
                </li>
              </ul>
            </div>

            {/* Per-request */}
            <div className="p-8 border border-black/[0.08] rounded-2xl bg-[#FAFAFA]">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-sans font-extrabold text-[#0A0A0A] text-4xl">£49</span>
                <span className="text-[#525252] text-sm">/request</span>
              </div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Pay As You Go</h3>
              <p className="text-[#525252] text-sm leading-relaxed mb-6">
                For businesses with occasional needs. One request at a time, 
                no commitment, same quality.
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#525252]">Per-request billing</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#525252]">72-hour turnaround</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#525252]">Preview before every change</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#525252]">No subscription</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="https://wa.me/447386468085"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-[#25D366] text-white font-semibold text-sm rounded-full px-8 py-4 hover:bg-[#128C7E] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Start on WhatsApp
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>
            <p className="text-[#525252] text-xs mt-4">
              Questions first? Message us. We&apos;ll reply within a few hours.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
