import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sorted Updates | Instant website changes",
  description: "Update your website in seconds. No tickets, no waiting, just type and it's done.",
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
            Update your site.
            <br />
            <span className="text-[#525252]">Sorted in seconds.</span>
          </h1>
          <p className="text-[#525252] text-lg font-medium leading-relaxed max-w-xl">
            No tickets, no waiting. Type what you need changed, get a preview instantly, 
            and go live when you&apos;re ready. Safe changes apply in 30 seconds. Complex ones 
            get a preview first. You&apos;re always in control.
          </p>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
            How it works
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-3xl leading-tight tracking-tight mb-12">
            Three steps. Seconds, not days.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Ask</h3>
              <p className="text-[#525252] text-sm leading-relaxed">
                Open your site&apos;s update portal. Type what you need: 
                &quot;Update prices,&quot; &quot;Add a team member,&quot; or &quot;Change the hero image.&quot; 
                Attach files if needed.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Choose</h3>
              <p className="text-[#525252] text-sm leading-relaxed">
                Safe changes: apply instantly. Complex changes: preview first. 
                You decide. See status in real time. No guessing.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white font-bold text-lg">
                3
              </div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Live</h3>
              <p className="text-[#525252] text-sm leading-relaxed">
                Changes deploy in 30 seconds. Get a confirmation with the live link. 
                Mistake? Send another request. We fix it just as fast.
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
              <h4 className="font-sans font-semibold text-[#0A0A0A]">New pages & listings</h4>
              <p className="text-[#525252] text-sm">Add services, team members, locations, property listings, or landing pages.</p>
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
              Those still happen, just not via the update portal. We&apos;ll tell you if something needs 
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
            <div className="p-8 border-2 border-[#0A0A0A] rounded-2xl bg-white relative">
              <span className="absolute -top-3 left-6 bg-[#0A0A0A] text-white text-xs font-semibold px-3 py-1 rounded-full">
                Best value
              </span>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-sans font-extrabold text-[#0A0A0A] text-4xl">£59</span>
                <span className="text-[#525252] text-sm">/month</span>
              </div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Unlimited Updates</h3>
              <p className="text-[#525252] text-sm leading-relaxed mb-6">
                For businesses that update regularly. Unlimited requests via your 
                site&apos;s update portal. Safe changes in 30 seconds. Priority handling.
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
                  <span className="text-[#525252]">Safe changes: 30 seconds</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#525252]">Images, video, text. All in one place.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#525252]">Apply now or preview first: you choose</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#525252]">Cancel anytime</span>
                </li>
              </ul>
            </div>

            {/* Per-request */}
            <div className="p-8 border border-black/[0.08] rounded-2xl bg-[#FAFAFA]">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-sans font-extrabold text-[#0A0A0A] text-4xl">£19</span>
                <span className="text-[#525252] text-sm">/request</span>
              </div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-xl mb-4">Pay As You Go</h3>
              <p className="text-[#525252] text-sm leading-relaxed mb-6">
                For occasional needs. One request at a time, no commitment, 
                same speed. Perfect for trying it out.
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
                  <span className="text-[#525252]">Safe changes: 30 seconds</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#525252]">Images, video, text. All in one place.</span>
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
              href="/#get-started"
              className="group inline-flex items-center gap-3 bg-[#0A0A0A] text-white font-semibold text-sm rounded-full px-8 py-4 hover:bg-[#2a2a2a] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              Get Sorted Updates
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>
            <p className="text-[#525252] text-xs mt-4">
              Questions? Message us. We&apos;ll reply within a few hours.
            </p>
          </div>
        </section>

        {/* Mini FAQ */}
        <section className="py-16 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
            Quick answers
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-2xl leading-tight tracking-tight mb-8">
            How media works.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A] text-sm">Can I upload images?</h4>
              <p className="text-[#525252] text-sm leading-relaxed">
                Yes. Drag and drop or select files directly in the update portal. 
                We&apos;ll optimize them for web and place them where you need. 
                Works for team photos, product shots, or gallery updates.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A] text-sm">What about video?</h4>
              <p className="text-[#525252] text-sm leading-relaxed">
                Short clips work great. Upload them in the portal. 
                We&apos;ll compress for web, handle hosting, and embed them properly. 
                For long-form video, we may suggest YouTube/Vimeo embedding instead.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A] text-sm">Do I need to describe exactly where things go?</h4>
              <p className="text-[#525252] text-sm leading-relaxed">
                No. Say "add this photo to the team page" or "replace the hero image." 
                We understand context. If unclear, we&apos;ll ask before doing anything.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A] text-sm">What if I upload the wrong file?</h4>
              <p className="text-[#525252] text-sm leading-relaxed">
                Just send a new request with the correct file. Safe changes apply instantly 
                so you can fix mistakes just as fast. For previews, nothing goes live 
                until you click apply.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A] text-sm">Can I upload multiple images at once?</h4>
              <p className="text-[#525252] text-sm leading-relaxed">
                Absolutely. Select multiple files with a message like &quot;add these to the gallery&quot; 
                or &quot;these are the new team photos.&quot; We&apos;ll handle them as one request.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A] text-sm">What about documents or PDFs?</h4>
              <p className="text-[#525252] text-sm leading-relaxed">
                PDF menus, price lists, or schedules can be uploaded and linked. 
                For complex document-heavy sites, we may suggest a different approach. 
                We&apos;ll tell you if something is better handled outside the portal.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
