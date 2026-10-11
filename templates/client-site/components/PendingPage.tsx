import Link from "next/link"
import { siteConfig } from "@/lib/site"

// Shared direction-confirmation page for Stage 1 builds.
// See sorted/operators/skills/stage-1-direction-confirmation.md.
//
// Every advertised-but-unbuilt route renders this — it is an
// intentional review state, not a finished page and not approval.
//
// Customise per client:
//   - businessName
//   - workspaceNextStepsUrl: the client's workspace Next Steps URL
//     (https://sortmydigital.site/workspace/<workspace-slug>/next-steps),
//     or null when no workspace exists — falls back to a mailto.
// Do not invent a workspace slug, prices, or payment links.

interface PendingPageProps {
  pageName: string
}

const businessName = siteConfig.businessName
const workspaceNextStepsUrl = siteConfig.workspaceNextStepsUrl
const reviewEmail = siteConfig.reviewEmail

export default function PendingPage({ pageName }: PendingPageProps) {
  const confirmHref =
    workspaceNextStepsUrl ??
    `mailto:${reviewEmail}?subject=${encodeURIComponent(
      `${businessName} - design direction feedback`
    )}`

  return (
    <section className="pt-48 pb-32 px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto min-h-[70vh]">
      <span className="inline-block font-mono text-xs uppercase tracking-[0.15em] text-[#525252] font-medium mb-6">
        Homepage ready for review
      </span>
      <h1 className="font-sans font-extrabold text-[#0A0A0A] text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-tight max-w-4xl mb-8">
        We&apos;re waiting for approval of the homepage design
        before the {pageName} page opens.
      </h1>
      <p className="text-[#525252] text-lg leading-relaxed max-w-2xl mb-12">
        Once you&apos;re happy with the homepage direction, we&apos;ll carry
        this visual system through the remaining pages so the whole site
        feels consistent and unmistakably {businessName}.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <a
          href={confirmHref}
          className="inline-flex items-center gap-3 bg-[#0A0A0A] text-[#FAFAFA] font-semibold text-sm rounded-full px-6 py-3.5 hover:bg-[#2a2a2a] transition-colors duration-200"
        >
          Confirm the design direction
        </a>
        <Link
          href="/"
          className="inline-flex items-center gap-3 bg-white text-[#0A0A0A] border border-black/[0.08] font-semibold text-sm rounded-full px-6 py-3.5 hover:bg-[#F5F5F5] transition-colors duration-200"
        >
          Return to the homepage
        </Link>
      </div>

      <p className="text-[#A3A3A3] text-xs mt-6 max-w-xl">
        {workspaceNextStepsUrl
          ? "The confirmation action opens your Sorted workspace, where you can approve the direction or ask a question."
          : "The confirmation action opens an email to Sorted — it does not automatically record approval."}
      </p>
    </section>
  )
}
