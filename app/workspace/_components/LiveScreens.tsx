"use client"

import { useEffect, useState } from "react"
import { ArrowRight, BarChart3, CalendarDays, FileText, Link2, MessageCircle, Pencil, Phone } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { workspaceEvent, type Workspace } from "@/lib/workspace"

const CARD_ICONS = { Link2, Pencil, BarChart3, FileText } as const
type CardIcon = keyof typeof CARD_ICONS

function ToolCard({
  workspace,
  icon,
  title,
  description,
  href,
  event,
}: {
  workspace: Workspace
  icon: CardIcon
  title: string
  description: string
  href?: string
  event: string
}) {
  const Icon: LucideIcon = CARD_ICONS[icon]
  const content = (
    <>
      <span className="grid size-[52px] shrink-0 place-items-center rounded-full bg-[#DFFF00]">
        <Icon className="size-6" strokeWidth={2.1} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[19px] font-extrabold tracking-[-0.035em] sm:text-[21px]">{title}</span>
        <span className="mt-1.5 block max-w-[420px] text-[14px] font-medium leading-[1.5] text-[#73736D]">{description}</span>
        {!href ? <span className="mt-2 block text-[10px] font-black uppercase tracking-[0.12em] text-[#A3A3A3]">Available soon</span> : null}
      </span>
      {href ? (
        <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[#070707] text-white transition-transform duration-150 group-hover:translate-x-0.5">
          <ArrowRight className="size-5" strokeWidth={2.6} />
        </span>
      ) : null}
    </>
  )
  const className = "group flex min-h-[144px] items-center gap-4 rounded-[12px] border border-[#E8E5DD] bg-white p-5 transition-[border-color,transform] duration-150 hover:border-[#CFCFC6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#070707] sm:gap-[18px] sm:px-7 sm:py-6"

  if (!href) {
    return <div className={`${className} cursor-not-allowed opacity-75`} aria-disabled="true">{content}</div>
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => workspaceEvent(workspace, event)}
      className={className}
    >
      {content}
    </a>
  )
}


function LiveFooter({ workspace }: { workspace: Workspace }) {
  const businessHref = workspace.website.liveUrl ?? (workspace.business.domain ? `https://${workspace.business.domain}` : undefined)
  return (
    <footer className="mx-auto flex max-w-[1240px] flex-col gap-3 border-t border-[#E8E5DD] px-5 py-5 text-[12px] font-semibold text-[#73736D] sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <a href="/" className="w-fit text-[22px] font-black leading-none tracking-[-0.045em] text-[#070707]">
        Sorted<span className="text-[#DFFF00]">.</span>
      </a>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {workspace.links.phone ? (
          <a href={`tel:${workspace.links.phone}`} className="underline underline-offset-4 transition-colors hover:text-[#070707]">
            Ring or text {workspace.links.phoneDisplay ?? workspace.links.phone}
          </a>
        ) : null}
        <a href={`mailto:${workspace.links.questionEmail}`} className="underline underline-offset-4 transition-colors hover:text-[#070707]">
          {workspace.links.questionEmail}
        </a>
        {businessHref ? (
          <a href={businessHref} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 transition-colors hover:text-[#070707]">
            Back to {workspace.business.domain ?? "your website"}
          </a>
        ) : null}
      </div>
    </footer>
  )
}

export function OverviewScreen({ workspace }: { workspace: Workspace }) {
  const { website, links } = workspace
  const [reviewDismissed, setReviewDismissed] = useState(true)
  const isLive = workspace.state === "live"
  const statusUrl = isLive ? website.liveUrl : website.previewUrl

  useEffect(() => {
    setReviewDismissed(window.localStorage.getItem(`workspace-review-dismissed:${workspace.slug}`) === "true")
  }, [workspace.slug])

  function dismissReview() {
    window.localStorage.setItem(`workspace-review-dismissed:${workspace.slug}`, "true")
    setReviewDismissed(true)
  }

  return (
    <>
      <div className="mx-auto max-w-[1240px] px-5 pb-8 pt-5 sm:px-8 sm:pt-7">
        <section className="mb-[22px] grid overflow-hidden rounded-[14px] bg-[#070707] text-white md:min-h-[280px] md:grid-cols-[60%_40%] lg:grid-cols-[65%_35%]">
          <div className="px-6 py-7 sm:px-10 sm:py-9 lg:px-[52px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">Your website</p>
            <h1 className="mt-3 max-w-[700px] text-[clamp(2.5rem,5.2vw,3.625rem)] font-extrabold leading-[0.98] tracking-[-0.05em]">
              Everything about your website, in one place.
            </h1>
            <p className="mt-4 max-w-[620px] text-[15px] font-medium leading-[1.55] text-white/72 sm:mt-5 sm:text-[16px]">
              This is your permanent link to the tools and documents for your website: editing, reporting, your paperwork and help.
            </p>
          </div>

          <div className="flex flex-col justify-center border-t border-white/15 px-6 py-6 sm:px-10 md:border-l md:border-t-0 lg:px-11">
            <p className="flex items-center gap-2.5 text-[12px] font-black uppercase tracking-[0.12em] text-white">
              <span className={`size-3.5 rounded-full ${isLive ? "bg-[#DFFF00]" : "bg-[#A3A3A3]"}`} />
              {isLive ? "Live" : "In progress"}
            </p>
            <div className="my-5 h-px w-full bg-white/15" />
            <p className="max-w-[310px] text-[15px] font-medium leading-[1.55] text-white/75">
              {isLive
                ? `Your ${workspace.business.name} website is live and available for customers to visit.`
                : `Your ${workspace.business.name} website is being prepared. We’ll share it here when it is ready.`}
            </p>
            {statusUrl ? (
              <a
                href={statusUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => workspaceEvent(workspace, isLive ? "live_site_opened" : "homepage_preview_opened")}
                className="mt-5 inline-flex h-11 w-fit items-center gap-3 rounded-full bg-white px-5 text-[12px] font-black text-[#070707] transition-transform duration-150 hover:-translate-y-px"
              >
                {isLive ? "Visit your website" : "View your website"} <ArrowRight className="size-4" strokeWidth={2.7} />
              </a>
            ) : null}
          </div>
        </section>

        <section aria-label="Website tools" className="mb-5 grid gap-4 md:grid-cols-2">
          <ToolCard
            workspace={workspace}
            icon="Link2"
            title="Visit your website"
            description="See your live website exactly as your customers see it."
            href={website.liveUrl}
            event="live_site_opened"
          />
          <ToolCard
            workspace={workspace}
            icon="Pencil"
            title="Make updates"
            description="Change text, images and business details through Sorted Updates."
            href={website.cmsUrl}
            event="cms_opened"
          />
          <ToolCard
            workspace={workspace}
            icon="BarChart3"
            title="View tracking"
            description="See visits, enquiries and the pages helping customers take action."
            href={website.trackingUrl}
            event="tracking_opened"
          />
          <ToolCard
            workspace={workspace}
            icon="FileText"
            title="Documents"
            description="Find your quote, agreement, invoices and important website information."
            href={links.documentsUrl}
            event="documents_opened"
          />
        </section>

        <section className="mb-3 grid gap-5 rounded-[12px] bg-[#F7F2E8] px-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8 sm:px-7">
          <div>
            <h2 className="text-[28px] font-extrabold leading-none tracking-[-0.045em] sm:text-[34px]">Questions? Just ask.</h2>
            <span className="mt-2 block h-[3px] w-14 rounded-full bg-[#DFFF00]" />
            <p className="mt-3 max-w-[560px] text-[14px] font-medium leading-[1.5] text-[#73736D]">
              If anything on this page does not work, or you are not sure where to start, message us and we’ll point you in the right direction.
            </p>
          </div>
          <div className="grid gap-3 sm:flex sm:items-center">
            <a
              href={`mailto:${links.questionEmail}?subject=${encodeURIComponent(`Help with ${workspace.business.name} website`)}`}
              onClick={() => workspaceEvent(workspace, "support_started", { channel: "email" })}
              className="inline-flex h-12 items-center justify-center gap-3 rounded-[9px] bg-[#070707] px-5 text-[13px] font-black text-white transition-transform duration-150 hover:-translate-y-px"
            >
              <MessageCircle className="size-4.5" strokeWidth={2.2} /> Message Sorted <ArrowRight className="size-4" strokeWidth={2.7} />
            </a>
            {links.bookingUrl ? (
              <a
                href={links.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => workspaceEvent(workspace, "call_booking_opened")}
                className="inline-flex h-12 items-center justify-center gap-3 rounded-[9px] border border-[#070707]/30 px-5 text-[13px] font-black text-[#070707] transition-colors hover:bg-white/60"
              >
                <CalendarDays className="size-4.5" strokeWidth={2.2} /> Book a call <ArrowRight className="size-4" strokeWidth={2.7} />
              </a>
            ) : null}
          </div>
        </section>

        {links.googleReviewUrl && !reviewDismissed ? (
          <section className="grid gap-3 border-y border-[#E8E5DD] px-1 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-5 sm:px-7">
            <div>
              <h2 className="text-[20px] font-extrabold tracking-[-0.035em]">Happy with how it went?</h2>
              <p className="mt-1 text-[13px] font-medium text-[#73736D]">Leave a quick Google review. It helps other small businesses find us.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={links.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  workspaceEvent(workspace, "review_opened")
                  dismissReview()
                }}
                className="inline-flex h-10 items-center gap-2.5 rounded-[9px] bg-[#DFFF00] px-4 text-[12px] font-black text-[#070707] transition-transform duration-150 hover:-translate-y-px"
              >
                Leave a Google review <ArrowRight className="size-4" strokeWidth={2.6} />
              </a>
              <button type="button" onClick={dismissReview} className="min-h-10 text-[12px] font-bold text-[#73736D] underline underline-offset-4 hover:text-[#070707]">
                Dismiss
              </button>
            </div>
          </section>
        ) : null}
      </div>
      <LiveFooter workspace={workspace} />
    </>
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
                onClick={() => workspaceEvent(workspace, "documents_opened")}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#FAFAF7] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#070707]"
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
        Questions about your website, updates, tracking or anything else? Ring, text or email us and we&apos;ll reply personally.
      </p>

      <div className="mt-9 grid gap-4 sm:grid-cols-3">
        {links.phone ? (
          <a
            href={`tel:${links.phone}`}
            onClick={() => workspaceEvent(workspace, "contact_clicked", { channel: "phone" })}
            className="flex flex-col rounded-[12px] border border-[#E8E5DD] bg-white p-6 transition-transform duration-150 hover:-translate-y-0.5 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#070707]"
          >
            <span className="grid size-11 place-items-center rounded-full bg-[#DFFF00]">
              <Phone className="size-5" strokeWidth={2.2} />
            </span>
            <h2 className="mt-5 text-[17px] font-extrabold tracking-[-0.02em]">Ring or text</h2>
            <p className="mt-2 flex-1 text-[13px] font-medium leading-[1.55] text-[#73736D]">{links.phoneDisplay ?? links.phone} is the quickest way to reach us, no booking needed.</p>
            <p className="mt-6 inline-flex items-center gap-2 text-[13px] font-black underline underline-offset-4">
              Call now <ArrowRight className="size-3.5" strokeWidth={2.8} />
            </p>
          </a>
        ) : null}

        <a
          href={`mailto:${links.questionEmail}?subject=${encodeURIComponent(`Question about ${workspace.business.name}`)}`}
          onClick={() => workspaceEvent(workspace, "support_started", { channel: "email" })}
          className="flex flex-col rounded-[12px] border border-[#E8E5DD] bg-white p-6 transition-transform duration-150 hover:-translate-y-0.5 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#070707]"
        >
          <span className="grid size-11 place-items-center rounded-full bg-[#DFFF00]">
            <MessageCircle className="size-5" strokeWidth={2.2} />
          </span>
          <h2 className="mt-5 text-[17px] font-extrabold tracking-[-0.02em]">Email Sorted</h2>
          <p className="mt-2 flex-1 text-[13px] font-medium leading-[1.55] text-[#73736D]">{links.questionEmail}</p>
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
            className="flex flex-col rounded-[12px] border border-[#E8E5DD] bg-white p-6 transition-transform duration-150 hover:-translate-y-0.5 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#070707]"
          >
            <span className="grid size-11 place-items-center rounded-full bg-[#F1F1EC]">
              <CalendarDays className="size-5" strokeWidth={2.2} />
            </span>
            <h2 className="mt-5 text-[17px] font-extrabold tracking-[-0.02em]">Book a call</h2>
            <p className="mt-2 flex-1 text-[13px] font-medium leading-[1.55] text-[#73736D]">If it&apos;s easier to talk it through, grab a slot. No pitch, just answers.</p>
            <p className="mt-6 inline-flex items-center gap-2 text-[13px] font-black underline underline-offset-4">
              Pick a time <ArrowRight className="size-3.5" strokeWidth={2.8} />
            </p>
          </a>
        ) : null}
      </div>
    </div>
  )
}
