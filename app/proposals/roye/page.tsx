import Nav from "@/components/Nav"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Proposal for Roye Abramson — Sorted.",
  description: "Artist Growth, Audience Development & Digital Presence Strategy",
  robots: "noindex",
}

export default function RoyeProposal() {
  return (
    <>
      <Nav />
      <main className="max-w-[680px] mx-auto px-6 sm:px-10 pt-40 pb-32">

        {/* Date + Address */}
        <div className="mb-16">
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em] mb-1">May 2026</p>
          <p className="font-mono text-xs text-[#A3A3A3] uppercase tracking-[0.15em]">Private — for Roye Abramson</p>
        </div>

        {/* Salutation */}
        <h1 className="font-sans font-extrabold text-[#0A0A0A] text-4xl sm:text-5xl leading-tight tracking-tight mb-10">
          Roye,
        </h1>

        {/* Opening letter */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            After our conversation, I spent some time thinking more carefully about what the opportunity in front of you actually is — and I want to be honest with you about what I see.
          </p>
          <p>
            This isn&apos;t simply about promoting music or increasing streams. The real opportunity is to build a meaningful audience around your voice, your story, your perspective, and the music that carries it.
          </p>
          <p>
            One of the biggest advantages you have is authenticity. You have life experience, perspective, and a grounded voice that younger artists simply cannot replicate. That creates a different type of connection — one built on meaning and emotional resonance rather than trends alone.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            The goal isn&apos;t to make you go viral. It&apos;s to build something that lasts.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* What I'm proposing */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6 block">
            What I&apos;m proposing
          </span>
          <div className="space-y-10">
            {[
              {
                num: "01",
                title: "Artist Identity & Positioning",
                body: "Before anything else, we get clear on who you are as an artist in public — your story, your tone, your audience, your visual direction. This is the foundation everything else is built on.",
              },
              {
                num: "02",
                title: "Content & Audience Growth",
                body: "Consistent visibility is what drives discovery. We build a content rhythm around you — YouTube, short-form, storytelling — that gradually converts listeners into people who genuinely follow your journey.",
              },
              {
                num: "03",
                title: "Digital Presence via Sorted",
                body: "Through my brand Sorted, I'll build a proper artist website — a professional home for your music, your story, booking, and contact. I'll show you a mockup first, before anything is paid for.",
              },
              {
                num: "04",
                title: "Long-Term Audience Infrastructure",
                body: "The long game is an audience that doesn't depend entirely on algorithms. We build the infrastructure — email, community, direct communication — so you own the relationship with your fans.",
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

        {/* Roadmap */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6 block">
            How it unfolds
          </span>
          <div className="space-y-8">
            {[
              {
                phase: "Phase 1 — Foundation",
                items: ["Artist positioning and audience definition", "Platform optimization", "Website mockup and brand direction", "Content strategy framework"],
              },
              {
                phase: "Phase 2 — Visibility",
                items: ["Ongoing publishing strategy", "YouTube and social growth", "Short-form content direction", "Audience engagement development"],
              },
              {
                phase: "Phase 3 — Growth",
                items: ["Fanbase and community building", "Performance and event opportunities", "Expanded reach and authority", "Long-term audience retention"],
              },
            ].map((item) => (
              <div key={item.phase} className="flex gap-8">
                <div className="w-2 shrink-0 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />
                </div>
                <div>
                  <p className="font-sans font-semibold text-[#0A0A0A] text-base mb-3">{item.phase}</p>
                  <ul className="space-y-1">
                    {item.items.map((point) => (
                      <li key={point} className="text-sm text-[#737373] leading-relaxed">{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Investment */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            Investment
          </span>
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-8 py-6 border-t border-black/[0.08]">
              <div>
                <p className="font-sans font-bold text-[#0A0A0A] text-lg mb-1">Foundation & Strategy Build</p>
                <p className="text-sm text-[#737373] leading-relaxed">Artist positioning, brand direction, website mockup via Sorted, platform optimization, content and audience strategy, growth infrastructure setup.</p>
              </div>
              <p className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight shrink-0">$5,000</p>
            </div>
            <div className="flex items-start justify-between gap-8 py-6 border-t border-black/[0.08]">
              <div>
                <p className="font-sans font-bold text-[#0A0A0A] text-lg mb-1">Ongoing Audience Growth</p>
                <p className="text-sm text-[#737373] leading-relaxed">Monthly strategy, content direction, audience growth support, platform oversight, performance review, ongoing visibility and brand development.</p>
              </div>
              <p className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight shrink-0">$2,000<span className="text-sm font-medium text-[#A3A3A3]">/mo</span></p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Closing letter */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            I genuinely believe there is something unique here — not because this is about chasing trends, but because authenticity and meaningful storytelling are increasingly rare online.
          </p>
          <p>
            That kind of audience takes time to build. But it also tends to become far more loyal, valuable, and lasting than anything built on short-term attention.
          </p>
          <p>
            I&apos;m excited about the potential of what this could become.
          </p>
        </div>

        {/* Signature */}
        <div className="mb-16">
          <p className="font-sans font-bold text-[#0A0A0A] text-lg">Renaldo Edmondson</p>
          <p className="text-sm text-[#A3A3A3] mt-1">Sorted. — sortmydigital.site</p>
        </div>

        {/* CTA */}
        <div className="border-t border-black/[0.08] pt-12">
          <p className="text-sm text-[#A3A3A3] mb-6">Ready to move forward, or have questions?</p>
          <a
            href="mailto:renaldo@sortmydigital.site?subject=Re: Roye Music Proposal"
            className="group inline-flex items-center gap-3 bg-[#0A0A0A] text-white font-semibold text-sm rounded-full px-6 py-3.5 hover:bg-[#2a2a2a] transition-all duration-300"
          >
            Reply to this proposal
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 8L8 2M8 2H4M8 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </a>
        </div>

      </main>
    </>
  )
}
