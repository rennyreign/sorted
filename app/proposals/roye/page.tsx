import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Proposal for Roye Abramson — Sorted.",
  description: "Artist Growth, Audience Development & Digital Presence Strategy",
  robots: "noindex",
}

export default function RoyeProposal() {
  return (
    <>
      <main className="max-w-[680px] mx-auto px-6 sm:px-10 pt-24 pb-32">

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
            After our conversation, I spent some time thinking more deeply about the opportunity in front of us and what this could realistically become over time.
          </p>
          <p>
            What stands out to me most is that this is not simply about promoting music or increasing streams. The real opportunity is to build a meaningful audience around your voice, your story, your perspective, and the music that carries it.
          </p>
          <p>
            In today&apos;s world through connection, consistency, storytelling, and identity — not just songs. People follow artists they feel something from, artists who represent something authentic and recognizable.
          </p>
          <p className="text-[#0A0A0A] font-semibold">
            That is where I believe the greatest value and long-term potential exists for you.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Why This Works */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6 block">
            Why this works
          </span>
          <div className="space-y-5 text-[#525252] text-base leading-relaxed">
            <p>One of the biggest advantages you have is authenticity. You have life experience, perspective, stories, and a grounded voice that younger artists simply cannot replicate. That creates a different type of audience connection, one built on meaning and emotional resonance rather than trends.</p>
            <p>The objective is to position you as more than &quot;someone making music&quot; — as an artist with something genuine to say and a world people want to step into.</p>
            <p className="text-[#0A0A0A] font-semibold">That combination of music, personality, perspective, and storytelling is what creates true fans. And throughout your YouTube channel I see glimpses of you doing this already, indicating this notion isn&apos;t foreign.</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* What Will Be Done */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-8 block">
            What will be done
          </span>
          <div className="space-y-10">
            {[
              {
                num: "01",
                title: "Artist Positioning & Brand Development",
                body: "Review your current artist presentation across platforms. Rewrite and refine artist bios and descriptions. Define consistent messaging and presentation style. Align your Website, Spotify, Apple Music, YouTube, and social profiles visually and structurally. Establish a clearer artist identity and public-facing direction.",
              },
              {
                num: "02",
                title: "Website Development & Digital Presence",
                body: "A website mockup will be developed through Sorted — a professional artist homepage centralizing your music, videos, and story. Booking and contact pathways built in. The website becomes the central hub that all audience activity points toward: music, videos, mailing lists, booking, upcoming releases.",
              },
              {
                num: "03",
                title: "Content & Audience Growth Strategy",
                body: "Develop a YouTube content plan. Identify video topics and audience-friendly formats. Create a posting structure and publishing schedule. Build content around music, storytelling, and artist personality. Increase consistency across YouTube and social platforms.",
              },
              {
                num: "04",
                title: "Platform Growth & Management",
                body: "Review Spotify, Apple Music, and YouTube performance monthly. Monitor audience growth and engagement trends. Adjust content direction based on performance. Improve platform consistency and optimization. Identify opportunities to increase reach and discoverability.",
              },
              {
                num: "05",
                title: "Audience Development",
                body: "Build stronger audience interaction and engagement. Develop communication pathways with listeners and fans. Create opportunities for future community growth. Position the artist brand for future performances and collaborations.",
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

        {/* Website Mockups */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-4 block">
            Website mockup
          </span>
          <p className="text-[#737373] text-base leading-relaxed mb-8">
            Here&apos;s a preview of what your artist website could look like — built through Sorted, before anything is paid for.
          </p>
          <div className="space-y-4">
            <a href="/mockups/roye-abramson/roye-mockup1.png" target="_blank" rel="noopener noreferrer" className="block group">
              <img
                src="/mockups/roye-abramson/roye-mockup1.png"
                alt="Roye website mockup — page 1"
                className="w-full rounded-xl border border-black/[0.08] group-hover:opacity-90 transition-opacity duration-200"
              />
              <p className="text-xs text-[#A3A3A3] mt-2 font-mono">View full size ↗</p>
            </a>
            <a href="/mockups/roye-abramson/roye-mockup2.png" target="_blank" rel="noopener noreferrer" className="block group mt-8">
              <img
                src="/mockups/roye-abramson/roye-mockup2.png"
                alt="Roye website mockup — page 2"
                className="w-full rounded-xl border border-black/[0.08] group-hover:opacity-90 transition-opacity duration-200"
              />
              <p className="text-xs text-[#A3A3A3] mt-2 font-mono">View full size ↗</p>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Roadmap */}
        <div className="mb-16">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6 block">
            Project roadmap
          </span>
          <div className="space-y-8">
            {[
              {
                phase: "Phase 1 — Foundation & Setup",
                items: ["Reviewing existing platforms and content", "Refining artist positioning and messaging", "Cleaning up and optimizing profiles", "Building the website mockup", "Creating the content and publishing structure", "Establishing the growth strategy"],
              },
              {
                phase: "Phase 2 — Content & Visibility Growth",
                items: ["Publishing consistency", "YouTube growth", "Short-form content opportunities", "Audience engagement", "Ongoing platform development", "Performance reviews and strategic adjustments"],
              },
              {
                phase: "Phase 3 — Audience Expansion",
                items: ["Expanding audience reach", "Increasing audience retention", "Developing community engagement", "Exploring performance and collaboration opportunities", "Continuing long-term growth and visibility"],
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
          <div className="space-y-0">
            <div className="flex items-start justify-between gap-8 py-6 border-t border-black/[0.08]">
              <div>
                <p className="font-sans font-bold text-[#0A0A0A] text-lg mb-1">Foundation & Strategy Build</p>
                <p className="text-sm text-[#737373] leading-relaxed mb-3">Review existing profiles, rewrite artist bios, website mockup via Sorted, 30-day content plan, posting schedules, and a performance dashboard combining all platforms.</p>
              </div>
              <p className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight shrink-0">$2,000</p>
            </div>
            <div className="flex items-start justify-between gap-8 py-6 border-t border-black/[0.08]">
              <div>
                <p className="font-sans font-bold text-[#0A0A0A] text-lg mb-1">Ongoing Audience Growth & Management</p>
                <p className="text-sm text-[#737373] leading-relaxed mb-3">Monthly strategy call, content calendar and data-driven publishing guidance, YouTube and short-form planning, data performance reviews, audience growth recommendations, ongoing platform optimization.</p>
              </div>
              <p className="font-sans font-extrabold text-[#0A0A0A] text-2xl tracking-tight shrink-0">$1,000<span className="text-sm font-medium text-[#A3A3A3]">/mo</span></p>
            </div>
          </div>
        </div>

        {/* Not Included */}
        <div className="mb-16 p-6 bg-black/[0.02] rounded-xl border border-black/[0.06]">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#A3A3A3] mb-4">Not included in this proposal</p>
          <ul className="space-y-1">
            {["Paid advertising budgets", "Professional video filming", "Video editing", "Music production or recording", "Professional photography", "Daily social media management"].map((item) => (
              <li key={item} className="text-sm text-[#737373]">{item}</li>
            ))}
          </ul>
          <p className="text-xs text-[#A3A3A3] mt-4">These can be added separately if required later.</p>
        </div>

        {/* Divider */}
        <div className="border-t border-black/[0.08] mb-16" />

        {/* Closing */}
        <div className="space-y-6 text-[#525252] text-lg leading-relaxed mb-16">
          <p>
            I genuinely believe there is something unique here — not because this is about chasing trends or trying to force attention, but because authenticity, perspective, and meaningful storytelling are increasingly rare online.
          </p>
          <p>
            The opportunity is to build an artist presence that feels real, grounded, and emotionally resonant, while gradually developing an audience that connects deeply with both the music and the person behind it.
          </p>
          <p>
            That kind of audience takes time to build, but it also tends to become far more loyal, valuable, and lasting over the long run.
          </p>
          <p>I&apos;m excited about the potential of what this could become.</p>
        </div>

        {/* Signature */}
        <div className="mb-24">
          <p className="font-sans font-bold text-[#0A0A0A] text-lg">Renaldo</p>
        </div>

        {/* Subtle footer */}
        <div className="border-t border-black/[0.06] pt-8">
          <p className="text-xs text-[#C4C4C4] font-mono">Sorted. — sortmydigital.site</p>
        </div>

      </main>
    </>
  )
}
