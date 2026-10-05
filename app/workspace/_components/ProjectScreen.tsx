"use client"

import { BarChart3, Calendar, Check, CreditCard, FileText, MessageCircle, Monitor, Settings } from "lucide-react"
import { workspacePath } from "./WorkspaceShell"
import { workspaceEvent, type Workspace, type WorkspaceRoute } from "@/lib/workspace"

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

function HelpCard({ workspace }: { workspace: Workspace }) {
  return (
    <article className="flex flex-col rounded-[12px] border border-[#E8E5DD] bg-white p-6">
      <span className="grid size-11 place-items-center rounded-full bg-[#F1F1EC]">
        <MessageCircle className="size-5" strokeWidth={2.2} />
      </span>
      <h2 className="mt-5 text-[17px] font-extrabold tracking-[-0.02em]">Need help?</h2>
      <p className="mt-2 flex-1 text-[13px] font-medium leading-[1.55] text-[#73736D]">
        Questions about the build, the price or what happens next? Ask us directly.
      </p>
      <a
        href={`mailto:${workspace.links.questionEmail}`}
        onClick={() => workspaceEvent(workspace, "question_started", { channel: "email" })}
        className="mt-6 inline-flex items-center gap-2 text-[13px] font-black underline underline-offset-4 transition-colors hover:text-[#070707]/60"
      >
        Contact Sorted
      </a>
    </article>
  )
}

function Timeline() {
  const steps = [
    { title: "Deposit received", done: true },
    { title: "We're building it", active: true },
    { title: "Review & go live", done: false },
  ]
  return (
    <div className="mx-auto mt-12 grid max-w-[860px] grid-cols-3 items-start gap-2 px-5 sm:gap-6 sm:px-8">
      {steps.map((step, i) => (
        <div key={step.title} className="relative text-center">
          {i < steps.length - 1 ? (
            <span aria-hidden className="absolute left-1/2 top-[9px] h-px w-full border-t border-dashed border-[#CFCFC6]" />
          ) : null}
          <span
            className={`relative z-10 mx-auto grid size-[18px] place-items-center rounded-full ${
              step.done ? "bg-[#070707]" : step.active ? "bg-[#DFFF00] ring-1 ring-[#070707]/15" : "bg-[#E8E5DD]"
            }`}
          >
            {step.done ? <Check className="size-3 text-white" strokeWidth={3.2} /> : null}
          </span>
          <p className={`mt-3 text-[12px] font-bold ${step.done || step.active ? "text-[#070707]" : "text-[#A3A3A3]"}`}>
            {step.title}
          </p>
        </div>
      ))}
    </div>
  )
}

export function ProjectScreen({
  workspace,
  onNavigate,
}: {
  workspace: Workspace
  onNavigate: (route: WorkspaceRoute) => void
}) {
  const domain = workspace.website.liveUrl?.replace(/^https?:\/\//, "").replace(/\/$/, "")

  return (
    <div className="mx-auto max-w-[1140px] px-5 pb-16 pt-10 sm:px-8">
      <section className="max-w-[680px]">
        <StatusChip />
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#73736D]">
          Project for {workspace.business.name}
        </p>
        <h1 className="mt-3 text-[clamp(2.75rem,6vw,4.25rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
          We&apos;re building your website.
        </h1>
        <p className="mt-4 max-w-[560px] text-[17px] font-medium leading-[1.5] text-[#73736D] sm:text-[19px]">
          Your deposit is in. Now we&apos;re completing the full site, and this workspace stays as your home for the project.
        </p>
      </section>

      <div className="mt-9 max-w-[860px] rounded-[12px] bg-[#F7F2E8] px-6 py-5 sm:px-8">
        <p className="text-[14px] font-bold text-[#070707]">
          Everything is confirmed. You&apos;ll hear from us soon, and if anything feels urgent, contact Sorted directly.
        </p>
      </div>

      <div className="mt-9 grid max-w-[860px] gap-4 sm:grid-cols-3">
        <article className="flex flex-col rounded-[12px] border border-[#E8E5DD] bg-white p-6">
          <span className="grid size-11 place-items-center rounded-full bg-[#F1F1EC]">
            <Calendar className="size-5" strokeWidth={2.2} />
          </span>
          <h2 className="mt-5 text-[17px] font-extrabold tracking-[-0.02em]">Getting ready</h2>
          <p className="mt-2 flex-1 text-[13px] font-medium leading-[1.55] text-[#73736D]">
            {domain ? `${domain} - site in preparation.` : "Your website is being prepared."} We&apos;ll share the live link here when it&apos;s ready for review.
          </p>
        </article>
        <article className="flex flex-col rounded-[12px] border border-[#E8E5DD] bg-white p-6">
          <span className="grid size-11 place-items-center rounded-full bg-[#F1F1EC]">
            <FileText className="size-5" strokeWidth={2.2} />
          </span>
          <h2 className="mt-5 text-[17px] font-extrabold tracking-[-0.02em]">Documents</h2>
          <p className="mt-2 flex-1 text-[13px] font-medium leading-[1.55] text-[#73736D]">
            Agreements, sitemap and delivery notes live here as the project progresses.
          </p>
          <a
            href={workspacePath(workspace.slug, "documents")}
            onClick={(e) => {
              e.preventDefault()
              onNavigate("documents")
            }}
            className="mt-6 inline-flex items-center gap-2 text-[13px] font-black underline underline-offset-4 transition-colors hover:text-[#070707]/60"
          >
            View documents
          </a>
        </article>
        <HelpCard workspace={workspace} />
      </div>

      <Timeline />
    </div>
  )
}

const INCLUDED = [
  { icon: Monitor, title: "Complete website", description: "All pages, copy, responsive build and customer journeys." },
  { icon: Settings, title: "Sorted Updates", description: "A simple editor for changing text, images and details yourself." },
  { icon: BarChart3, title: "Sorted Tracking", description: "Analytics and conversion tracking configured at launch." },
]

export function DetailsScreen({ workspace }: { workspace: Workspace }) {
  const { offer, links } = workspace
  return (
    <div className="mx-auto max-w-[860px] px-5 pb-16 pt-10 sm:px-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#73736D]">Details</p>
      <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[0.97] tracking-[-0.05em]">
        What you&apos;re getting.
      </h1>
      <p className="mt-4 max-w-[520px] text-[15px] font-medium leading-[1.55] text-[#73736D]">
        The complete {workspace.business.name} website, for one fixed price.
      </p>

      <div className="mt-9 rounded-[14px] bg-[#070707] p-7 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[46px] font-extrabold leading-none tracking-[-0.055em] text-white">
              £{offer.total.toLocaleString()} <span className="text-[0.55em] text-white/85">fixed</span>
            </p>
            <p className="mt-3 text-[16px] font-semibold text-white/70">
              £{offer.deposit.toLocaleString()} deposit paid · £{offer.balance.toLocaleString()} on launch
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#DFFF00] px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#070707]">
            <Check className="size-3.5" strokeWidth={3} /> Deposit received
          </span>
        </div>
      </div>

      <div className="mt-9 grid gap-0 sm:grid-cols-3">
        {INCLUDED.map(({ icon: Icon, title, description }, i) => (
          <article
            key={title}
            className={`border-[#E8E5DD] py-6 sm:px-7 sm:py-0 ${i > 0 ? "border-t sm:border-l sm:border-t-0" : ""} ${i === 0 ? "sm:pl-0" : ""}`}
          >
            <span className="grid size-12 place-items-center rounded-full bg-[#DFFF00]">
              <Icon className="size-5" strokeWidth={2.2} />
            </span>
            <h3 className="mt-4 text-[17px] font-extrabold tracking-[-0.02em]">{title}</h3>
            <p className="mt-2 text-[13px] font-medium leading-[1.55] text-[#73736D]">{description}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-[12px] border border-[#E8E5DD] bg-white p-6">
        <p className="flex items-center gap-2.5 text-[13px] font-bold text-[#070707]">
          <CreditCard className="size-4" strokeWidth={2.2} />
          Balance of £{offer.balance.toLocaleString()} is due when your site is ready to launch.
        </p>
        <p className="mt-2 text-[13px] font-medium text-[#73736D]">
          Questions about payment?{" "}
          <a href={`mailto:${links.questionEmail}`} className="font-bold text-[#070707] underline underline-offset-4">
            Ask us directly
          </a>
          .
        </p>
      </div>
    </div>
  )
}
