import Nav from "@/components/Nav"
import Footer from "@/components/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About | Client Site",
  description: "About this business. Update with client details.",
}

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="pt-40 pb-20 px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
            About
          </span>
          <h1 className="font-sans font-extrabold text-[#0A0A0A] text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-tight max-w-5xl">
            About the client.
          </h1>
        </section>

        <section className="py-20 px-6 sm:px-10 lg:px-16 border-t border-black/[0.06] max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
            <div>
              <p className="font-sans font-bold text-[#0A0A0A] text-2xl leading-snug tracking-tight mb-6">
                Customize this section with the client&apos;s story.
              </p>
              <div className="space-y-5 text-[#525252] text-base leading-relaxed">
                <p>
                  Add the client&apos;s background, mission, and what makes them unique.
                </p>
                <p>
                  Reference the <code className="font-mono text-sm bg-black/5 px-1.5 py-0.5 rounded">client/brief.md</code> file 
                  for the key points to highlight.
                </p>
              </div>
            </div>

            <div className="space-y-5 text-[#525252] text-base leading-relaxed">
              <p className="font-sans font-bold text-[#0A0A0A] text-2xl leading-snug tracking-tight mb-6">
                Why they do what they do.
              </p>
              <p>
                This section should communicate the client&apos;s values and approach.
              </p>
              <p>
                Update with actual client content from the discovery call or brief.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
