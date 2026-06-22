import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sorted Updates | CMS included with every site",
  description:
    "Every Sorted website ships with SortedUpdates, a Decap CMS that lets you edit text, images, and content directly. No tickets, no code.",
}

export default function SortedUpdatesPage() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="pt-40 pb-20 px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
            SortedUpdates
          </span>
          <h1 className="font-sans font-extrabold text-[#0A0A0A] text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-tight max-w-5xl mb-8">
            Your content.
            <br />
            <span className="text-[#525252]">Your control.</span>
          </h1>
          <p className="text-[#525252] text-lg font-medium leading-relaxed max-w-xl">
            Every Sorted website ships with SortedUpdates, a Decap CMS that lets you edit text, images, and content directly. No tickets, no code, no waiting on anyone.
          </p>
        </section>

        {/* What is SortedUpdates */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
            What it is
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-3xl leading-tight tracking-tight mb-12">
            A CMS built into every site.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Decap CMS</h3>
              <p className="text-[#525252] text-sm leading-relaxed">
                A clean, git-backed content editor living at{" "}
                <code className="text-xs bg-black/5 px-1.5 py-0.5 rounded">/cms/</code>{" "}
                on your site. Edit in your browser, save, and publish.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">Included</h3>
              <p className="text-[#525252] text-sm leading-relaxed">
                SortedUpdates comes with every website we build. It is part of the handoff, not an extra. You own the content from day one.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-lg">
                3
              </div>
              <h3 className="font-sans font-bold text-[#25D366] text-lg">Self-service</h3>
              <p className="text-[#525252] text-sm leading-relaxed">
                Swap words, images, prices, and service details yourself. Changes publish automatically. No need to ask Sorted for every small edit.
              </p>
            </div>
          </div>
        </section>

        {/* What you can edit */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
            What you can edit
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-3xl leading-tight tracking-tight mb-12">
            If it appears on the page, you can change it.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A]">Text and copy</h4>
              <p className="text-[#525252] text-sm">Headings, paragraphs, button labels, CTAs, and every visible word.</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A]">Images and media</h4>
              <p className="text-[#525252] text-sm">Hero photos, team headshots, gallery images, thumbnails, and video URLs.</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A]">Services and offers</h4>
              <p className="text-[#525252] text-sm">Service descriptions, prices, packages, and special offers.</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A]">Contact details</h4>
              <p className="text-[#525252] text-sm">Phone numbers, email addresses, opening hours, and location information.</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A]">FAQs and reviews</h4>
              <p className="text-[#525252] text-sm">Add or edit FAQ entries, testimonials, and case studies.</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-sans font-semibold text-[#0A0A0A]">Social links</h4>
              <p className="text-[#525252] text-sm">Instagram, Facebook, WhatsApp, and any other links in the footer or contact areas.</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
            How it works
          </span>
          <h2 className="font-sans font-extrabold text-[#0A0A0A] text-3xl leading-tight tracking-tight mb-12">
            Log in, edit, publish.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Log in",
                body: "Access your CMS at yoursite.com/cms/. We send you a secure invite via Netlify Identity. No public sign-ups.",
              },
              {
                step: "02",
                title: "Edit",
                body: "Click any section, change the text or image, and preview the result live in the CMS panel.",
              },
              {
                step: "03",
                title: "Save",
                body: "Hit save. Decap writes the change to your site repository as a commit. Your site rebuilds automatically.",
              },
              {
                step: "04",
                title: "Live",
                body: "Your updated site is live in under a minute. No deploy steps, no developer needed.",
              },
            ].map((item) => (
              <div key={item.step} className="space-y-4">
                <span className="block font-mono text-[11px] text-[#A3A3A3] tabular-nums">
                  {item.step}
                </span>
                <h3 className="font-sans font-bold text-[#0A0A0A] text-lg">{item.title}</h3>
                <p className="text-[#525252] text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security & reset */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
                Security
              </span>
              <h2 className="font-sans font-extrabold text-[#0A0A0A] text-3xl leading-tight tracking-tight mb-6">
                Invite only. You control the content. We hold the reset key.
              </h2>
              <p className="text-[#525252] text-base leading-relaxed">
                Access is locked to invite-only Netlify Identity. You decide who can edit. Sorted retains the design, the code, and the factory reset capability, so the site structure is always protected even when content changes.
              </p>
            </div>

            <div>
              <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
                Factory reset
              </span>
              <h2 className="font-sans font-extrabold text-[#0A0A0A] text-3xl leading-tight tracking-tight mb-6">
                Made a mess? We can reset it.
              </h2>
              <p className="text-[#525252] text-base leading-relaxed">
                Every site ships with a recorded handoff state. If content changes go too far off track, we can restore the site to the original approved content without touching the design or code.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 bg-[#0A0A0A]">
          <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-2xl">
              <p className="font-sans font-extrabold text-white text-[clamp(2rem,5vw,4rem)] leading-tight tracking-tight mb-4">
                Every Sorted site includes this.
              </p>
              <p className="text-[#525252] text-base leading-relaxed">
                Start with your website. Get the CMS built in. Then grow from there.
              </p>
            </div>

            <a
              href="/#get-started"
              className="group inline-flex items-center gap-3 bg-white text-[#0A0A0A] font-semibold text-sm rounded-full px-6 py-3.5 hover:bg-white/90 transition-all duration-300 shrink-0"
            >
              Get your free mockup
              <span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
