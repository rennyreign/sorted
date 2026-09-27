"use client"

import { ArrowRight, BarChart3, FileText, Globe, MessageCircle, Settings } from "lucide-react"
import { workspacePath } from "./WorkspaceShell"
import { workspaceEvent, type Workspace, type WorkspaceRoute } from "@/lib/workspace"

const CARD_ICONS = { Globe, Settings, BarChart3, FileText } as const
type CardIcon = keyof typeof CARD_ICONS

function ToolTile({
  icon,
  title,
  description,
  href,
  external = false,
  onNavigate,
  onTrack,
}: {
  icon: CardIcon
  title: string
  description: string
  href: string | undefined
  external?: boolean
  onNavigate?: () => void
  onTrack?: () => void
}) {
  const Icon = CARD_ICONS[icon]
  const inner = (
    <>
      <span className="grid size-11 place-items-center rounded-full bg-[#F1F1EC]">
        <Icon className="size-5" strokeWidth={2.2} />
      </span>
      <h2 className="mt-5 text-[17px] font-extrabold tracking-[-0.02em]">{title}</h2>
      <p className="mt-2 flex-1 text-[13px] font-medium leading-[1.55] text-[#73736D]">{description}</p>
      <p className={`mt-6 inline-flex items-center gap-2 text-[13px] font-black ${href ? "underline underline-offset-4" : "text-[#A3A3A3]"}`}>
        {href ? (external ? "Open" : "View") : "Available soon"} {href ? <ArrowRight className="size-3.5" strokeWidth={2.8} /> : null}
      </p>
    </>
  )
  const className =
    "flex flex-col rounded-[12px] border border-[#E8E5DD] bg-white p-6 text-left transition-transform duration-150 hover:-translate-y-0.5 focus:outline-2 focus:outline-offset-4 focus:outline-[#070707] disabled:hover:translate-y-0"

  if (!href) {
    return (
      <div className={`${className} opacity-70`} aria-disabled>
        {inner}
      </div>
    )
  }
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onTrack} className={className}>
        {inner}
      </a>
    )
  }
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault()
        onTrack?.()
        onNavigate?.()
      }}
      className={className}
    >
      {inner}
    </a>
  )
}

function StatusChip({ live }: { live?: boolean }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] ${
        live ? "bg-[#00A64B]/10 text-[#0A7A3D]" : "bg-[#DFFF00] text-[#070707]"
      }`}
    >
      {live ? "Live" : "In progress"}
    </span>
  )
}

export function OverviewScreen({
  workspace,
  onNavigate,
}: {
  workspace: Workspace
  onNavigate: (route: WorkspaceRoute) => void
}) {
  const { website, links } = workspace
  const hasDocs = Boolean(links.documentsUrl)

  return (
    <div className="mx-auto max-w-[1140px] px-5 pb-16 pt-10 sm:px-8">
      <section className="max-w-[680px]">
        <StatusChip live />
        <h1 className="mt-5 text-[clamp(2.75rem,6vw,4.25rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
          Your Sorted workspace.
        </h1>
        <p className="mt-4 max-w-[520px] text-[17px] font-medium leading-[1.5] text-[#73736D] sm:text-[19px]">
          Everything for {workspace.business.name}, in one place.
        </p>
      </section>

      <div className="mt-10 grid max-w-[860px] gap-4 sm:grid-cols-2">
        <ToolTile
          icon="Globe"
          title="Website"
          description={website.liveUrl ? "Your live website — visit it, share it, check how it looks." : "Your live website will appear here at launch."}
          href={website.liveUrl}
          external
          onTrack={() => workspaceEvent(workspace, "external_tool_opened", { tool: "website" })}
        />
        <ToolTile
          icon="Settings"
          title="Sorted Updates"
          description={website.cmsUrl ? "Change text, images and business details yourself — whenever you need." : "Your content editor will be ready once the site is live."}
          href={website.cmsUrl}
          external
          onTrack={() => workspaceEvent(workspace, "external_tool_opened", { tool: "updates" })}
        />
        <ToolTile
          icon="BarChart3"
          title="Sorted Tracking"
          description={website.trackingUrl ? "See how your site is performing — visitors, enquiries and trends." : "Tracking will appear here once reporting is connected."}
          href={website.trackingUrl}
          external
          onTrack={() => workspaceEvent(workspace, "external_tool_opened", { tool: "tracking" })}
        />
        <ToolTile
          icon="FileText"
          title="Documents"
          description={hasDocs ? "Your agreements, sitemap and delivery notes." : "Your documents will appear here as we finish the build."}
          href={workspacePath(workspace.slug, "documents")}
          onNavigate={() => onNavigate("documents")}
        />
      </div>

      <div className="mt-10 max-w-[860px]">
        <p className="text-[13px] font-semibold leading-[1.55] text-[#73736D]">
          Need a change? Sorted Updates covers most content edits — for anything else,{" "}
          <a href={`mailto:${links.questionEmail}`} className="font-bold text-[#070707] underline underline-offset-4">
            ask us directly
          </a>
          .
        </p>
      </div>

      {links.googleReviewUrl ? (
        <div className="mt-9 flex max-w-[860px] flex-col gap-4 rounded-[14px] bg-[#070707] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <h2 className="text-[19px] font-extrabold tracking-[-0.02em] text-white">Love the result? Leave a review.</h2>
            <p className="mt-1.5 text-[13px] font-medium text-white/60">A short review helps other businesses find Sorted.</p>
          </div>
          <a
            href={links.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full bg-[#DFFF00] px-6 text-[12px] font-black text-[#070707] transition-transform duration-150 hover:-translate-y-px"
          >
            Leave a review <ArrowRight className="size-4" strokeWidth={2.8} />
          </a>
        </div>
      ) : null}
    </div>
  )
}

export function DocumentsScreen({ workspace }: { workspace: Workspace }) {
  const { links } = workspace
  const docs: { label: string; url: string; note: string }[] = links.documentsUrl
    ? [{ label: "Project documents", url: links.documentsUrl, note: "Agreements, sitemap and delivery notes." }]
    : []

  return (
    <div className="mx-auto max-w-[860px] px-5 pb-16 pt-10 sm:px-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#73736D]">Documents</p>
      <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[0.97] tracking-[-0.05em]">
        Your paperwork, kept here.
      </h1>
      <p className="mt-4 max-w-[520px] text-[15px] font-medium leading-[1.55] text-[#73736D]">
        Agreements, sitemaps and delivery notes for the {workspace.business.name} website.
      </p>

      {docs.length > 0 ? (
        <ul className="mt-9 divide-y divide-[#E8E5DD] rounded-[12px] border border-[#E8E5DD] bg-white">
          {docs.map((doc) => (
            <li key={doc.url}>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#FAFAF7] focus:outline-2 focus:outline-offset-[-2px] focus:outline-[#070707]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#F1F1EC]">
                  <FileText className="size-4.5" strokeWidth={2.2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-extrabold">{doc.label}</span>
                  {doc.note ? <span className="block text-[12px] font-medium text-[#73736D]">{doc.note}</span> : null}
                </span>
                <ArrowRight className="size-4 shrink-0 text-[#73736D]" strokeWidth={2.6} />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-9 rounded-[12px] border border-[#E8E5DD] bg-white px-6 py-10 text-center">
          <FileText className="mx-auto size-6 text-[#C4C4BC]" strokeWidth={2} />
          <p className="mt-4 text-[14px] font-bold text-[#070707]">Nothing here yet.</p>
          <p className="mt-1.5 text-[13px] font-medium text-[#73736D]">Your documents will appear here as we finish the build.</p>
        </div>
      )}
    </div>
  )
}

export function HelpScreen({ workspace }: { workspace: Workspace }) {
  const { links } = workspace
  return (
    <div className="mx-auto max-w-[860px] px-5 pb-16 pt-10 sm:px-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#73736D]">Help</p>
      <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[0.97] tracking-[-0.05em]">
        Talk to a human.
      </h1>
      <p className="mt-4 max-w-[520px] text-[15px] font-medium leading-[1.55] text-[#73736D]">
        Questions about your website, updates, tracking or anything else — email us and we&apos;ll reply personally.
      </p>

      <div className="mt-9 grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${links.questionEmail}?subject=${encodeURIComponent(`Question about ${workspace.business.name}`)}`}
          onClick={() => workspaceEvent(workspace, "question_started", { channel: "email" })}
          className="flex flex-col rounded-[12px] border border-[#E8E5DD] bg-white p-6 transition-transform duration-150 hover:-translate-y-0.5 focus:outline-2 focus:outline-offset-4 focus:outline-[#070707]"
        >
          <span className="grid size-11 place-items-center rounded-full bg-[#DFFF00]">
            <MessageCircle className="size-5" strokeWidth={2.2} />
          </span>
          <h2 className="mt-5 text-[17px] font-extrabold tracking-[-0.02em]">Email Sorted</h2>
          <p className="mt-2 flex-1 text-[13px] font-medium leading-[1.55] text-[#73736D]">
            {links.questionEmail} — we reply personally, usually the same working day.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 text-[13px] font-black underline underline-offset-4">
            Send us a note <ArrowRight className="size-3.5" strokeWidth={2.8} />
          </p>
        </a>

        {links.bookingUrl ? (
          <a
            href={links.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => workspaceEvent(workspace, "call_booking_opened")}
            className="flex flex-col rounded-[12px] border border-[#E8E5DD] bg-white p-6 transition-transform duration-150 hover:-translate-y-0.5 focus:outline-2 focus:outline-offset-4 focus:outline-[#070707]"
          >
            <span className="grid size-11 place-items-center rounded-full bg-[#F1F1EC]">
              <MessageCircle className="size-5" strokeWidth={2.2} />
            </span>
            <h2 className="mt-5 text-[17px] font-extrabold tracking-[-0.02em]">Book a call</h2>
            <p className="mt-2 flex-1 text-[13px] font-medium leading-[1.55] text-[#73736D]">
              If it&apos;s easier to talk it through, grab a slot — no pitch, just answers.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 text-[13px] font-black underline underline-offset-4">
              Pick a time <ArrowRight className="size-3.5" strokeWidth={2.8} />
            </p>
          </a>
        ) : null}
      </div>
    </div>
  )
}
