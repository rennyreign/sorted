"use client"

import { formatMoney } from "@/lib/market-pricing"
import { useState } from "react"
import { ChevronRight, FileText, ArrowRight, BarChart3, CalendarCheck, Check, MailWarning, Megaphone, MessageSquare, Monitor, MousePointerClick, UserCheck } from "lucide-react"
import { workspaceEvent, type WorkspaceAdCreative, type Workspace, type WorkspaceRoute } from "@/lib/workspace"
import { WorkspaceFooter } from "./WorkspaceShell"

// ─── Shared bits ──────────────────────────────────────────────────────────────

function StatusBadge({ tone, children }: { tone: "preview" | "proposed" | "live"; children: string }) {
  const styles =
    tone === "live"
      ? "bg-[#DFFF00] text-[#070707]"
      : tone === "preview"
        ? "bg-[#070707] text-white"
        : "border border-[#070707]/20 text-[#73736D]"
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${styles}`}>
      {children}
    </span>
  )
}

function PageIntro({ eyebrow, title, body, badge }: { eyebrow: string; title: string; body: string; badge?: React.ReactNode }) {
  return (
    <section className="mb-9 max-w-[980px]">
      <div className="flex items-center gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#73736D]">{eyebrow}</p>
        {badge}
      </div>
      <h1 className="mt-3 text-balance text-[clamp(2.6rem,6vw,4.6rem)] font-extrabold leading-[0.98] tracking-[-0.05em]">{title}</h1>
      <p className="mt-4 max-w-[800px] text-[16px] font-medium leading-[1.45] text-[#73736D] sm:text-[19px]">{body}</p>
    </section>
  )
}

// ─── Overview (prospect) ──────────────────────────────────────────────────────
// Follows the "Clearer path to your next customer" mockup: package headline,
// built-around-you hero card with the real site preview, the proposed offer,
// how the four parts work together, then the complete-setup cards.

const HOW_IT_WORKS = [
  { icon: Megaphone, stage: "Get noticed", body: "Targeted local ads put your offer in front of the people most likely to need it." },
  { icon: MousePointerClick, stage: "Build trust", body: "Your new site shows who you are, what you do and how you help, in a clear and professional way." },
  { icon: CalendarCheck, stage: "Start a conversation", body: "People can respond or get in touch easily, with a clear next step and automated follow-up behind it." },
  { icon: BarChart3, stage: "See what works", body: "We track what's happening so you can see what's bringing in enquiries and where to focus next." },
]

const SETUP_CARDS: { icon: typeof Megaphone; title: string; body: string; route: WorkspaceRoute }[] = [
  { icon: Monitor, title: "Website", body: "A modern, mobile-friendly site built around your offer, services and location.", route: "website" },
  { icon: Megaphone, title: "Ads", body: "Targeted ads to reach the local customers already looking for what you do.", route: "ads" },
  { icon: MailWarning, title: "Follow-up", body: "Simple email follow-up to help turn interest into conversations.", route: "follow-up" },
  { icon: BarChart3, title: "Tracking", body: "Clear reporting so you can see what's working and where to focus next.", route: "tracking" },
]

export function ProspectOverviewScreen({
  workspace,
  onNavigate,
}: {
  workspace: Workspace
  onNavigate: (route: WorkspaceRoute) => void
}) {
  const { acquisition } = workspace
  const leadCreative = acquisition.ads.creatives[0]

  return (
    <>
      <div className="mx-auto max-w-[1200px] px-5 pb-9 pt-10 sm:px-8 sm:pt-14">
        {/* Hero */}
        <section className="mb-8 max-w-[680px]">
          <h1 className="text-[clamp(2.75rem,6.5vw,4.75rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
            A clearer path to your next customer.
          </h1>
          <p className="mt-4 max-w-[520px] text-[17px] font-medium leading-[1.4] text-[#73736D] sm:text-[20px]">
            Your website, ads and follow-up, connected around one useful customer offer.
          </p>
        </section>

        {/* Built around your business + live site preview */}
        <section className="overflow-hidden rounded-[16px] bg-[#070707] p-7 sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div>
              <h2 className="text-[28px] font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-[38px]">
                Built around your business.
              </h2>
              <p className="mt-4 max-w-[400px] text-[15px] font-medium leading-[1.55] text-white/65">
                A modern site, targeted ads and simple follow-up, all working together to help more local customers reach out to {workspace.business.name}.
              </p>
              <button
                type="button"
                onClick={() => onNavigate("website")}
                className="mt-7 inline-flex h-12 items-center gap-2.5 rounded-full bg-[#DFFF00] px-6 text-[13px] font-black text-[#070707] transition-transform duration-200 hover:-translate-y-px focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DFFF00]"
              >
                Explore your new site <ArrowRight className="size-4" strokeWidth={2.8} />
              </button>
            </div>
            <div className="relative">
              {/* Browser-framed site preview */}
              <div className="overflow-hidden rounded-[12px] border border-white/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                <div className="flex h-7 items-center gap-1.5 border-b border-[#E8E5DD] bg-[#F7F7F3] px-3">
                  <span className="size-2 rounded-full bg-[#D8D8CF]" />
                  <span className="size-2 rounded-full bg-[#D8D8CF]" />
                  <span className="size-2 rounded-full bg-[#D8D8CF]" />
                </div>
                {workspace.website.previewImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={workspace.website.previewImageUrl}
                    alt={`Working website design for ${workspace.business.name}`}
                    className="h-[330px] sm:h-[360px] w-full object-cover object-top"
                  />
                ) : workspace.website.previewUrl ? (
                  <iframe
                    src={workspace.website.previewUrl}
                    title={`Website preview for ${workspace.business.name}`}
                    className="h-[300px] w-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : null}
              </div>
              {/* Sponsored ad mini-card */}
              {leadCreative ? (
                <button
                  type="button"
                  onClick={() => onNavigate("ads")}
                  className="relative ml-auto -mt-16 right-0 w-[145px] sm:absolute sm:-bottom-4 sm:right-3 sm:mt-0 sm:w-[180px] rounded-[10px] border border-[#E8E5DD] bg-white p-3.5 text-left shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:-translate-y-0.5 lg:-right-5 lg:w-[180px]"
                >
                  <p className="text-[9px] font-bold leading-relaxed text-[#73736D]">{workspace.business.name} · Proposed ad</p>
                  {leadCreative.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={leadCreative.imageUrl} alt={leadCreative.imageAlt ?? leadCreative.headline} className="mt-2 aspect-[4/5] w-full rounded-md object-contain bg-[#070707]" />
                  ) : null}
                  <p className="mt-1.5 text-[13px] font-extrabold leading-[1.25] tracking-[-0.02em] text-[#070707]">{leadCreative.headline}</p>
                  <p className="mt-2 inline-flex items-center gap-1 rounded-[6px] bg-[#070707] px-2 py-1 text-[10px] font-black text-white">
                    {leadCreative.cta} <ArrowRight className="size-2.5" strokeWidth={3} />
                  </p>
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {/* Proposed offer */}
        <section className="mt-8 flex flex-col gap-6 rounded-[14px] bg-[#F0EBDD] p-7 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:p-8">
          <div className="flex items-start gap-5">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#DFFF00]">
              <CalendarCheck className="size-6" strokeWidth={2} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#73736D]">Proposed offer</p>
              <h2 className="mt-1.5 text-[24px] font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-[28px]">{acquisition.offerCard.title}</h2>
              <p className="mt-1.5 max-w-[420px] text-[14px] font-medium leading-[1.5] text-[#52504A]">{acquisition.offerCard.description}</p>
            </div>
          </div>
          <ul className="grid shrink-0 gap-2.5">
            {acquisition.offerCard.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2.5 text-[14px] font-bold text-[#070707]">
                <Check className="size-4.5 text-[#5C8A00]" strokeWidth={2.8} />
                {bullet}
              </li>
            ))}
          </ul>
        </section>

        {/* How it works together */}
        <section className="mt-8">
          <h2 className="text-[26px] font-extrabold tracking-[-0.04em] sm:text-[30px]">
            How it works <span className="underline decoration-[#DFFF00] decoration-[3px] underline-offset-8">together</span>
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map(({ icon: Icon, stage, body }, i) => (
              <li key={stage} className="border-t border-[#E8E5DD] pt-5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] font-bold text-[#B9B9B0] tabular-nums">0{i + 1}</span>
                  <Icon className="size-4.5 text-[#070707]" strokeWidth={2} />
                </div>
                <h3 className="mt-3 text-[16px] font-extrabold tracking-[-0.02em]">{stage}</h3>
                <p className="mt-1.5 text-[13px] font-medium leading-[1.55] text-[#73736D]">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Your complete setup */}
        <section className="mt-8">
          <h2 className="text-[26px] font-extrabold tracking-[-0.04em] sm:text-[30px]">
            Your complete <span className="underline decoration-[#DFFF00] decoration-[3px] underline-offset-8">service</span>
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SETUP_CARDS.map(({ icon: Icon, title, body, route }) => (
              <button
                key={title}
                type="button"
                onClick={() => onNavigate(route)}
                className="group relative rounded-[14px] border border-[#E8E5DD] bg-white p-5 text-left transition-colors duration-200 hover:border-[#070707]/30 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#070707]"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full bg-[#F7F7F3]">
                    <Icon className="size-5" strokeWidth={2.2} />
                  </span>
                  <ArrowRight className="size-4 text-[#B9B9B0] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#070707]" strokeWidth={2.6} />
                </div>
                <h3 className="mt-3 text-[16px] font-extrabold tracking-[-0.02em]">{title}</h3>
                <p className="mt-1.5 text-[13px] font-medium leading-[1.5] text-[#73736D]">{body}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Setup included banner */}
        <section className="mt-9 flex flex-col items-start gap-5 rounded-[14px] bg-[#F0EBDD] p-6 sm:flex-row sm:items-center sm:gap-7 sm:p-7">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#DFFF00]">
            <Check className="size-5.5" strokeWidth={2.6} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">The setup is included. Ongoing ad management is your choice.</h2>
            <p className="mt-1 text-[13px] font-medium leading-[1.5] text-[#52504A]">
              We&apos;ll prepare the website, ads and follow-up so the system is ready. Spend, management and future optimisation stay optional.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              workspaceEvent(workspace, "next_steps_opened", { from: "overview" })
              onNavigate("next-steps")
            }}
            className="inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full bg-[#070707] px-5 text-[13px] font-black text-white transition-transform duration-200 hover:-translate-y-px"
          >
            See next steps <ArrowRight className="size-4" strokeWidth={2.8} />
          </button>
        </section>
      </div>
      <WorkspaceFooter workspace={workspace} />
    </>
  )
}

function ActionBanner({ title, body, label, onClick }: { title: string; body: string; label?: string; onClick?: () => void }) {
  return <section className="mt-6 flex flex-col gap-5 rounded-[14px] bg-[#070707] p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
    <div><h2 className="text-[clamp(1.8rem,3.5vw,2.7rem)] font-extrabold leading-[1.05] tracking-[-0.045em]">{title}</h2><p className="mt-3 text-sm leading-relaxed text-white/65">{body}</p></div>
    {label && onClick ? <button type="button" onClick={onClick} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-full bg-[#DFFF00] px-6 text-sm font-extrabold text-[#070707] transition duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DFFF00]">{label}<ArrowRight className="size-4" /></button> : null}
  </section>
}

function CreativeCard({ creative }: { creative: WorkspaceAdCreative }) {
  return (
    <article className="mb-5 break-inside-avoid overflow-hidden rounded-[12px] border border-[#E8E5DD] bg-white">
      <div className="flex items-center gap-3 border-b border-[#E8E5DD] px-5 py-4">
        <Megaphone className="size-4 shrink-0" />
        <div><h2 className="text-sm font-extrabold">{creative.title}</h2><p className="mt-1 text-[10px] text-[#73736D]">{creative.format}</p></div>
      </div>
      <p className="px-5 py-4 text-sm leading-relaxed">{creative.primaryText}</p>
      {creative.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={creative.imageUrl} alt={creative.imageAlt ?? creative.headline} className="block h-auto w-full" />
      ) : (
        <div className="bg-[#F0EBDD] p-7"><p className="text-3xl font-extrabold tracking-tight">{creative.headline}</p><p className="mt-4 text-sm font-bold">Creative image to follow</p></div>
      )}
      <div className="border-t border-[#E8E5DD] bg-[#F7F7F3] px-5 py-4">
        <p className="text-sm font-extrabold">{creative.headline}</p>
        <p className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-[#73736D]">{creative.cta} <ArrowRight className="size-3.5" /></p>
      </div>
    </article>
  )
}

export function AdsScreen({ workspace, onNavigate }: { workspace: Workspace; onNavigate: (route: WorkspaceRoute) => void }) {
  const { ads } = workspace.acquisition
  return <>
    <div className="mx-auto max-w-[1200px] px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
      <PageIntro eyebrow="Proposed campaign" title="One clear offer. More ways to introduce it." body={ads.offer} badge={<StatusBadge tone="proposed">Not running</StatusBadge>} />
      {ads.creatives.length ? <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {ads.creatives.map((creative, i) => <CreativeCard key={`${creative.title}-${creative.format}-${i}`} creative={creative} />)}
      </div> : <section className="rounded-[14px] border border-[#E8E5DD] bg-white p-7"><h2 className="font-extrabold">Creatives are being drafted.</h2><p className="mt-2 text-sm text-[#73736D]">Campaign images and copy for {workspace.business.name} will appear here before anything runs.</p></section>}
      <ActionBanner title="Ready to introduce your offer." body="Creative, copy and a clear destination, prepared together." label="Explore the site and offer" onClick={() => onNavigate("website")} />
      <section className="mt-5 flex items-start gap-4 rounded-[14px] bg-[#F0EBDD] p-6"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#DFFF00]"><Megaphone className="size-5" /></span><div><h2 className="font-extrabold">Campaign preparation is included.</h2><p className="mt-1 text-sm leading-relaxed text-[#73736D]">{ads.spendNote}</p></div></section>
    </div><WorkspaceFooter workspace={workspace} />
  </>
}

function EmailBody({ body }: { body: string }) {
  return <div className="space-y-4 text-sm leading-[1.7] text-[#373732]">
    {body.split(/\n\s*\n/).map((paragraph, i) => <p key={i} className="whitespace-pre-line">{paragraph.split(/(\*\*[^*]+\*\*)/g).map((part, j) => part.startsWith("**") ? <strong key={j} className="font-bold text-[#070707]">{part.slice(2, -2)}</strong> : part)}</p>)}
  </div>
}

export function FollowUpScreen({ workspace }: { workspace: Workspace }) {
  const { followUp } = workspace.acquisition
  const [selected, setSelected] = useState(0)
  const email = followUp.emails[selected]
  return <>
    <div className="mx-auto max-w-[1200px] px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
      <PageIntro eyebrow="Proposed sequence" title="A clear next step after every enquiry." body="Helpful emails keep the conversation moving. Your team handles the questions and the personal response." badge={<StatusBadge tone="proposed">Preview</StatusBadge>} />
      {email ? <div className="grid items-start gap-7 lg:grid-cols-[0.85fr_1.15fr]">
        <ol className="relative space-y-3 before:absolute before:bottom-8 before:left-5 before:top-8 before:w-px before:bg-[#E8E5DD]">
          {followUp.emails.map((item, i) => <li key={item.name} className="relative flex items-start gap-4">
            <span className={`mt-6 grid size-10 shrink-0 place-items-center rounded-full text-sm font-extrabold ${selected === i ? "bg-[#DFFF00]" : "bg-[#F0EBDD]"}`}>{i + 1}</span>
            <button type="button" aria-pressed={selected === i} aria-controls="workspace-email-preview" onClick={() => { setSelected(i); workspaceEvent(workspace, "follow_up_previewed", { email: item.name }); if (window.matchMedia("(max-width: 1023px)").matches) document.getElementById("workspace-email-preview")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }) }} className={`min-w-0 flex-1 rounded-[12px] border p-5 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#070707] ${selected === i ? "border-[#E8E5DD] bg-white" : "border-transparent hover:bg-white/70"}`}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#73736D]">{item.timing}</p><h2 className="mt-2 flex items-center justify-between gap-3 text-xl font-extrabold leading-tight tracking-[-0.035em]">{item.name}<ChevronRight className="size-4 shrink-0" /></h2><p className="mt-2 text-sm leading-relaxed text-[#73736D]">{item.purpose}</p>
              {item.phase === "booking" ? <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-widest text-[#73736D]">Booked trial</span> : null}
            </button>
          </li>)}
        </ol>
        <div>
          <article id="workspace-email-preview" aria-label="Email preview" className="scroll-mt-32 overflow-hidden rounded-[12px] border border-[#E8E5DD] bg-white p-6 sm:p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#73736D]">Email preview</p>
            <dl className="mt-5 grid grid-cols-[55px_1fr] gap-x-3 gap-y-2 border-b border-[#E8E5DD] pb-5 text-xs sm:text-sm"><dt className="font-bold">From:</dt><dd>{workspace.business.name}</dd><dt className="font-bold">Subject:</dt><dd>{email.subject}</dd></dl>
            <div className="my-5 rounded-lg bg-[#070707] p-5 text-white"><p className="text-xl font-extrabold tracking-tight">{workspace.business.name}</p><p className="mt-1 text-xs text-white/60">{workspace.acquisition.offerCard.title}</p></div>
            <EmailBody body={email.body ?? `Hi [First name],\n\n${email.purpose}\n\nTake the next step → [next-step link]\n\nThe ${workspace.business.name} team`} />
            <p className="mt-6 border-t border-[#E8E5DD] pt-4 text-xs leading-relaxed text-[#73736D]">Draft preview. Personal details and agreed next-step links are filled before sending.</p>
          </article>
          <section className="mt-4 rounded-[12px] bg-[#F0EBDD] p-6"><h2 className="flex items-center gap-3 font-extrabold"><CalendarCheck className="size-5" />Stops when they reply or take the next step.</h2><ul className="mt-3 space-y-3 text-sm leading-relaxed text-[#73736D]">{followUp.stopRules.map(rule => <li key={rule}>{rule}</li>)}</ul></section>
        </div>
      </div> : <p className="rounded-xl bg-white p-7 text-sm text-[#73736D]">Your proposed email sequence will appear here for review.</p>}
      <section className="mt-7 grid gap-7 rounded-[14px] bg-[#070707] p-7 text-white lg:grid-cols-[1.1fr_1fr_1fr] sm:p-8"><h2 className="text-3xl font-extrabold leading-tight tracking-[-0.04em]">Automation supports the conversation<span className="text-[#DFFF00]">.</span></h2><div><h3 className="font-extrabold">Sorted connects the sequence</h3><p className="mt-3 text-sm leading-relaxed text-white/65">We connect the emails, branding and agreed next-step links, then test when each message should send.</p></div><div className="lg:border-l lg:border-white/15 lg:pl-7"><h3 className="font-extrabold">Your team takes it from there</h3><p className="mt-3 text-sm leading-relaxed text-white/65">You answer questions, welcome people and help them decide on their next step.</p></div></section>
    </div><WorkspaceFooter workspace={workspace} />
  </>
}

export function TrackingScreen({ workspace }: { workspace: Workspace }) {
  const { tracking } = workspace.acquisition
  const example = tracking.metrics.every(metric => !metric.connected) ? tracking.example : undefined
  const costFor = (label: string) => {
    if (!example) return "—"
    const key = /member|customer/i.test(label) ? "customers" : /attended/i.test(label) ? "attended" : /booking/i.test(label) ? "bookings" : "enquiries"
    const count = example.values[key]
    return count > 0 ? formatMoney(example.adSpend / count, workspace.offer.currency, true) : "—"
  }
  const icons = { attention: Megaphone, enquiries: MessageSquare, bookings: CalendarCheck, attended: UserCheck, quotes: FileText, customers: UserCheck } as const
  const journey = tracking.journey ?? [
    { stage: "New enquiry", detail: "Source and request", owner: "Captured automatically", note: "From your website and ads once connected." },
    { stage: "Appointment booked", detail: "Confirmed time", owner: "Booking system", note: "Updated when a booking is confirmed." },
    { stage: "Conversation attended", detail: "A record that it took place", owner: "Your team", note: "Confirmed attendance, never assumed." },
  ]
  return <>
    <div className="mx-auto max-w-[1200px] px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
      <PageIntro eyebrow="Your tracking" title="Know where interest leads." body="Follow the journey from an enquiry to a real conversation and the next step your team records." badge={<StatusBadge tone="proposed">{example ? "Illustrative example · Not live data" : "Preview · Not connected yet"}</StatusBadge>} />
      {example ? <div className="mb-5 flex flex-col gap-2 rounded-[12px] bg-[#F0EBDD] px-6 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-extrabold">{example.period} · {formatMoney(example.adSpend, workspace.offer.currency)} illustrative ad spend</p><p className="max-w-[540px] text-xs leading-relaxed text-[#73736D]">Sample figures to show how your reporting could look. These are not your results, a forecast or a performance promise.</p></div> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{tracking.metrics.map(metric => {
        const Icon = icons[metric.key as keyof typeof icons] ?? BarChart3
        return <article key={metric.key} className="rounded-[10px] border border-[#E8E5DD] bg-white p-6"><div className="flex items-center justify-between"><p className="text-4xl font-extrabold tracking-tight tabular-nums">{metric.connected && metric.value !== undefined ? metric.value.toLocaleString("en-GB") : example?.values[metric.key]?.toLocaleString("en-GB") ?? "—"}</p><span className="grid size-10 place-items-center rounded-full bg-[#F0EBDD]"><Icon className="size-5" /></span></div><h2 className="mt-3 text-sm font-extrabold">{metric.label}</h2><p className="mt-2 text-xs leading-relaxed text-[#73736D]">{metric.description}</p><p className="mt-4 border-t border-[#E8E5DD] pt-3 text-[10px] font-bold text-[#73736D]">{example ? "Example figure" : metric.connected ? "Connected" : "Not connected"} · {metric.source}</p></article>
      })}</div>
      <section className="mt-9"><h2 className="text-3xl font-extrabold tracking-[-0.04em]">Your customer journey</h2><div className="mt-3 h-1 w-12 bg-[#DFFF00]" />
        <div className="mt-5 overflow-hidden rounded-[12px] border border-[#E8E5DD] bg-white"><div className="hidden grid-cols-[1fr_1.2fr_1.1fr] gap-6 border-b border-[#E8E5DD] px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#73736D] sm:grid"><p>Stage</p><p>What you will see</p><p>Who updates it</p></div><ol>{journey.map((row, i) => <li key={row.stage} className={`grid gap-3 px-6 py-5 sm:grid-cols-[1fr_1.2fr_1.1fr] sm:items-center sm:gap-6 ${i ? "border-t border-[#E8E5DD]" : ""}`}><div className="flex items-center gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#DFFF00] text-xs font-extrabold tabular-nums">{String(i + 1).padStart(2, "0")}</span><h3 className="text-sm font-extrabold">{row.stage}</h3></div><p className="text-sm font-semibold">{row.detail}</p><div><p className="text-sm font-bold">{row.owner}</p><p className="mt-1 text-xs leading-relaxed text-[#73736D]">{row.note}</p></div></li>)}</ol></div>
      </section>
      <section className="mt-5 grid gap-5 rounded-[14px] bg-[#070707] p-7 text-white lg:grid-cols-[1.2fr_2fr]"><div><h2 className="text-4xl font-extrabold leading-[1.05] tracking-[-0.045em]">Measure more than clicks<span className="text-[#DFFF00]">.</span></h2><p className="mt-3 text-sm leading-relaxed text-white/65">See what it costs to bring in an enquiry and an attended conversation once spend and outcomes are connected.</p></div><div className="grid gap-3 sm:grid-cols-3">{(tracking.costMetrics ?? ["Cost per enquiry", "Cost per booking", "Cost per attended conversation"]).map(label => <article key={label} className="rounded-[10px] border border-white/15 p-5"><p className="text-3xl font-extrabold tabular-nums">{costFor(label)}</p><h3 className="mt-3 text-sm font-extrabold">{label}</h3><p className="mt-3 text-xs leading-relaxed text-white/60">{example ? "Calculated from this example month’s ad spend and outcomes." : "Available when spend and confirmed outcomes are connected."}</p></article>)}</div></section>
      <section className="mt-5 rounded-[12px] bg-[#F0EBDD] p-6"><h2 className="font-extrabold">Your tracking is connected and tested before launch.</h2><p className="mt-2 text-sm leading-relaxed text-[#73736D]">{tracking.attendanceNote}</p></section>
    </div><WorkspaceFooter workspace={workspace} />
  </>
}
