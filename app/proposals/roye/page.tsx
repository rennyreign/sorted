import Nav from "@/components/Nav"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Proposal for Roye Abramson — Sorted.",
  description: "Artist Growth, Audience Development & Digital Presence Strategy",
  robots: "noindex",
}

const phases = [
  {
    num: "01",
    title: "Artist Identity & Positioning",
    body: "Developing a clear and compelling public identity around your story and artistic voice, messaging and tone, audience identity, emotional positioning, and visual direction. This creates a stronger reason for people to follow you beyond individual songs alone.",
  },
  {
    num: "02",
    title: "Content & Audience Growth",
    body: "Consistent visibility is one of the biggest drivers of audience growth today. YouTube content strategy, storytelling and artist-focused content, short-form clips, music promotion content, and a consistent publishing rhythm — converting listeners into long-term supporters.",
  },
  {
    num: "03",
    title: "Digital Presence & Authority",
    body: "A strong digital presence creates credibility and reinforces the seriousness of the artist brand. This includes a website mockup through Sorted — a professional home for your music, videos, and story, with booking and contact infrastructure built in.",
  },
  {
    num: "04",
    title: "Long-Term Audience Infrastructure",
    body: "Building an audience ecosystem that supports music releases, fan engagement, live performances, direct communication, and future monetization. Something that compounds in value over time rather than relying only on streaming platforms.",
  },
]

const roadmap = [
  {
    phase: "Phase 1",
    title: "Foundation & Positioning",
    items: ["Artist positioning strategy", "Audience definition", "Platform optimization", "Website mockup and brand direction", "Content strategy framework", "Initial growth infrastructure"],
  },
  {
    phase: "Phase 2",
    title: "Visibility & Audience Growth",
    items: ["Ongoing publishing strategy", "YouTube and social growth planning", "Short-form content direction", "Audience engagement development", "Consistent visibility and brand reinforcement"],
  },
  {
    phase: "Phase 3",
    title: "Audience Expansion & Influence",
    items: ["Fanbase and community growth", "Performance and event opportunities", "Collaboration opportunities", "Expanded reach and authority", "Long-term audience retention and development"],
  },
]

export default function RoyeProposal() {
  return (
    <>
      <Nav />
      <main>

        {/* Hero */}
        <section className="pt-40 pb-20 px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
            Prepared for Roye Abramson
          </span>
          <h1 className="font-sans font-extrabold text-[#0A0A0A] text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-tight max-w-5xl mb-8">
            Artist Growth &<br />
            <span className="text-[#525252]">Digital Presence.</span>
          </h1>
          <p className="text-[#525252] text-lg font-medium leading-relaxed max-w-xl">
            A strategy built around your voice, your story, and the audience that's waiting for both.
          </p>
        </section>

        {/* Opening */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
            <div>
              <p className="font-sans font-bold text-[#0A0A0A] text-2xl leading-snug tracking-tight mb-6">
                This isn't simply about promoting music or increasing streams.
              </p>
              <div className="space-y-5 text-[#525252] text-base leading-relaxed">
                <p>
                  The real opportunity is to build a meaningful audience around your voice, your story, your perspective, and the music that carries it.
                </p>
                <p>
                  In today's world, artists grow not only through songs themselves, but through connection, consistency, storytelling, and identity. People follow artists they feel something from — artists who represent something authentic and recognizable.
                </p>
                <p>
                  That is where the greatest value and long-term potential exists for you.
                </p>
              </div>
            </div>
            <div className="space-y-5 text-[#525252] text-base leading-relaxed">
              <p className="font-sans font-bold text-[#0A0A0A] text-2xl leading-snug tracking-tight mb-6">
                Your biggest advantage is authenticity.
              </p>
              <p>
                You have life experience, perspective, stories, and a grounded voice that younger artists simply cannot replicate. That creates a different type of audience connection — one built on meaning and emotional resonance rather than trends alone.
              </p>
              <p>
                The objective is to position you not just as "someone making music," but as an artist with something genuine to say and a world people want to step into.
              </p>
              <p className="font-semibold text-[#0A0A0A]">
                That combination of music, personality, perspective, and storytelling is what creates true fans.
              </p>
            </div>
          </div>
        </section>

        {/* Strategy */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-start gap-16 lg:gap-0">
            <div className="lg:w-64 shrink-0">
              <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4 block">
                The strategy
              </span>
              <h2 className="font-sans font-extrabold text-[#0A0A0A] text-4xl leading-tight tracking-tight">
                Four areas.<br />One direction.
              </h2>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-10">
              {phases.map((item) => (
                <div key={item.num}>
                  <span className="block font-mono text-[11px] text-[#A3A3A3] mb-4 tabular-nums">{item.num}</span>
                  <h3 className="font-sans font-bold text-[#0A0A0A] text-lg leading-snug tracking-tight mb-3">{item.title}</h3>
                  <p className="text-sm text-[#737373] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-10 block">
            Roadmap
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {roadmap.map((item) => (
              <div key={item.phase}>
                <span className="block font-mono text-[11px] text-[#A3A3A3] mb-3 uppercase tracking-widest">{item.phase}</span>
                <h3 className="font-sans font-bold text-[#0A0A0A] text-lg leading-snug tracking-tight mb-5">{item.title}</h3>
                <ul className="space-y-0 divide-y divide-black/[0.06]">
                  {item.items.map((point) => (
                    <li key={point} className="flex items-start gap-3 py-3">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5 text-[#0A0A0A]">
                        <path d="M3 8.5L6 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm text-[#525252] leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Investment */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-10 block">
            Investment
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl">
            <div className="p-8 border border-black/[0.08] rounded-2xl">
              <span className="block font-mono text-[11px] text-[#A3A3A3] mb-4 uppercase tracking-widest">Foundation</span>
              <p className="font-sans font-extrabold text-[#0A0A0A] text-4xl tracking-tight mb-4">$5,000</p>
              <p className="text-sm text-[#737373] leading-relaxed mb-6">One-time</p>
              <ul className="space-y-2 text-sm text-[#525252]">
                {["Artist positioning", "Brand direction", "Website mockup via Sorted", "Platform optimization", "Content and audience strategy", "Growth infrastructure setup"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#0A0A0A]">
                      <path d="M3 8.5L6 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 border border-black/[0.08] rounded-2xl bg-[#0A0A0A]">
              <span className="block font-mono text-[11px] text-[#737373] mb-4 uppercase tracking-widest">Ongoing</span>
              <p className="font-sans font-extrabold text-white text-4xl tracking-tight mb-4">$2,000<span className="text-xl font-medium text-[#737373]">/mo</span></p>
              <p className="text-sm text-[#737373] leading-relaxed mb-6">Monthly retainer</p>
              <ul className="space-y-2 text-sm text-[#737373]">
                {["Monthly strategy and planning", "Content direction", "Audience growth support", "Platform management oversight", "Performance review and refinement", "Ongoing visibility and brand development"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 text-white">
                      <path d="M3 8.5L6 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 bg-[#0A0A0A]">
          <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-2xl">
              <p className="font-sans font-extrabold text-white text-[clamp(2rem,5vw,4rem)] leading-tight tracking-tight mb-6">
                Authenticity and meaningful storytelling are increasingly rare online.
              </p>
              <p className="text-[#525252] text-base leading-relaxed mb-4">
                The opportunity is to build an artist presence that feels real, grounded, and emotionally resonant — while gradually developing an audience that connects deeply with both the music and the person behind it.
              </p>
              <p className="text-[#737373] text-base leading-relaxed">
                That kind of audience takes time to build, but it also tends to become far more loyal, valuable, and lasting over the long run.
              </p>
              <p className="text-white font-semibold mt-8">— Renaldo</p>
            </div>
            <a
              href="mailto:renaldo@sortmydigital.site?subject=Roye Music Proposal"
              className="group inline-flex items-center gap-3 bg-white text-[#0A0A0A] font-semibold text-sm rounded-full px-6 py-3.5 hover:bg-white/90 transition-all duration-300 shrink-0"
            >
              Let&apos;s talk
              <span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>
          </div>
        </section>

      </main>
    </>
  )
}
