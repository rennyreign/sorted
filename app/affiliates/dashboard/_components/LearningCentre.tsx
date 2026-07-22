"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Heart,
  Image as ImageIcon,
  Lightbulb,
  Lock,
  MessageCircle,
  Search,
  Share2,
  Shield,
  Sparkles,
  Target,
  Users,
} from "lucide-react"

// ─── Progress tracking (localStorage) ─────────────────────────────────────────

const STORAGE_KEY = "sorted_partner_learning"
const TOTAL_MODULES = 6

type ModuleId = "welcome" | "opportunities" | "conversations" | "journey" | "faq" | "sorted-way"

const MODULE_ORDER: ModuleId[] = ["welcome", "opportunities", "conversations", "journey", "faq", "sorted-way"]

type ModuleMeta = {
  id: ModuleId
  number: number
  title: string
  subtitle: string
  duration: string
  icon: typeof BookOpen
}

const MODULES: ModuleMeta[] = [
  { id: "welcome", number: 1, title: "Welcome to Sorted", subtitle: "What we do and your role", duration: "3 min", icon: Sparkles },
  { id: "opportunities", number: 2, title: "Spot Opportunities", subtitle: "How to find good referrals", duration: "4 min", icon: Search },
  { id: "conversations", number: 3, title: "Starting Conversations", subtitle: "Confidence, not scripts", duration: "4 min", icon: MessageCircle },
  { id: "journey", number: 4, title: "The Referral Journey", subtitle: "What happens after you submit", duration: "3 min", icon: Target },
  { id: "faq", number: 5, title: "Frequently Asked Questions", subtitle: "The questions you'll get asked", duration: "5 min", icon: Lightbulb },
  { id: "sorted-way", number: 6, title: "The Sorted Way", subtitle: "How we work and what we stand for", duration: "3 min", icon: Heart },
]

function getCompleted(): Set<ModuleId> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as ModuleId[])
  } catch {
    return new Set()
  }
}

function saveCompleted(set: Set<ModuleId>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    // ignore
  }
}

export function useModuleProgress() {
  const [completed, setCompleted] = useState<Set<ModuleId>>(new Set())

  useEffect(() => {
    setCompleted(getCompleted())
  }, [])

  const markDone = useCallback((id: ModuleId) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      next.add(id)
      saveCompleted(next)
      return next
    })
  }, [])

  return { completed, markDone, total: TOTAL_MODULES, count: completed.size, allDone: completed.size >= TOTAL_MODULES }
}

// ─── Certified Badge ──────────────────────────────────────────────────────────

export function CertifiedBadge() {
  const { allDone } = useModuleProgress()
  if (!allDone) return null
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dfff00] px-3 py-1 text-[10px] font-black uppercase tracking-[0.06em] text-black">
      <Award className="size-3.5" strokeWidth={2.8} /> Certified
    </span>
  )
}

// ─── Overview widget ──────────────────────────────────────────────────────────

export function LearningProgressWidget({ onContinue }: { onContinue: () => void }) {
  const { completed, count, total, allDone } = useModuleProgress()
  const pct = Math.round((count / total) * 100)
  const nextModule = MODULE_ORDER.find((id) => !completed.has(id))

  return (
    <div className="rounded-[18px] border border-black/10 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-black tracking-[-0.03em]">Learning progress</h2>
          <p className="mt-1 text-[13px] font-semibold text-black/55">
            {allDone ? "All modules complete. You're a Certified Partner." : `${count} of ${total} modules complete`}
          </p>
        </div>
        {allDone ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dfff00] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.06em]">
            <Award className="size-3.5" strokeWidth={2.8} /> Certified
          </span>
        ) : null}
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/8">
        <div className="h-full rounded-full bg-[#dfff00] transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      {!allDone && nextModule ? (
        <button
          type="button"
          onClick={onContinue}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-[#070707] px-5 text-[11px] font-black text-white transition-transform duration-200 hover:-translate-y-0.5"
        >
          Continue learning <ArrowRight className="size-3.5" strokeWidth={3} />
        </button>
      ) : null}
    </div>
  )
}

// ─── Learning Centre (main view) ──────────────────────────────────────────────

export function LearningCentre() {
  const { completed, markDone, count, total, allDone } = useModuleProgress()
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null)
  const pct = Math.round((count / total) * 100)

  if (activeModule) {
    return (
      <ModuleView
        moduleId={activeModule}
        onBack={() => setActiveModule(null)}
        onComplete={() => {
          markDone(activeModule)
          // Advance to next uncompleted module or go back to list
          const currentIdx = MODULE_ORDER.indexOf(activeModule)
          const nextId = MODULE_ORDER.slice(currentIdx + 1).find((id) => !completed.has(id) && id !== activeModule)
          if (nextId) {
            setActiveModule(nextId)
          } else {
            setActiveModule(null)
          }
        }}
        isCompleted={completed.has(activeModule)}
      />
    )
  }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[0.95] tracking-[-0.04em]">Learning</h1>
        <p className="mt-2 max-w-[560px] text-[14px] font-semibold text-black/55">
          Complete all modules to become a Certified Sorted Partner. Each one takes 3–5 minutes.
        </p>
      </div>

      <div className="rounded-[18px] border border-black/10 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] font-black">
            {allDone ? (
              <span className="flex items-center gap-2"><Award className="size-5 text-[#bdd900]" strokeWidth={2.4} /> All modules complete</span>
            ) : (
              <>{count} / {total} complete</>
            )}
          </p>
          {allDone ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dfff00] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.06em]">
              <Award className="size-3.5" strokeWidth={2.8} /> Certified Partner
            </span>
          ) : null}
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/8">
          <div className="h-full rounded-full bg-[#dfff00] transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ul className="grid gap-3">
        {MODULES.map((mod) => {
          const done = completed.has(mod.id)
          const Icon = mod.icon
          return (
            <li key={mod.id}>
              <button
                type="button"
                onClick={() => setActiveModule(mod.id)}
                className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-5 rounded-[16px] border px-6 py-5 text-left transition-all hover:-translate-y-0.5 ${
                  done ? "border-[#dfff00] bg-[#dfff00]/8" : "border-black/10 bg-white hover:border-black/25"
                }`}
              >
                <span className={`grid size-12 place-items-center rounded-full ${done ? "bg-[#dfff00]" : "bg-black/5"}`}>
                  {done ? <Check className="size-5" strokeWidth={3} /> : <Icon className="size-5 text-black/55" strokeWidth={2.2} />}
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-black/40">Module {mod.number} · {mod.duration}</p>
                  <p className="mt-1 text-[16px] font-black tracking-[-0.02em]">{mod.title}</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-black/55">{mod.subtitle}</p>
                </div>
                <ArrowRight className="size-5 text-black/30" strokeWidth={2.4} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ─── Module viewer ────────────────────────────────────────────────────────────

function ModuleView({
  moduleId,
  onBack,
  onComplete,
  isCompleted,
}: {
  moduleId: ModuleId
  onBack: () => void
  onComplete: () => void
  isCompleted: boolean
}) {
  const meta = MODULES.find((m) => m.id === moduleId)!
  const content = MODULE_CONTENT[moduleId]

  return (
    <div className="grid gap-6">
      <button type="button" onClick={onBack} className="inline-flex h-10 w-max items-center gap-2 rounded-full border border-black/15 px-4 text-[12px] font-black">
        <ArrowLeft className="size-4" strokeWidth={2.5} /> Back to modules
      </button>

      <div className="rounded-[18px] border border-black/10 bg-white p-6 sm:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.1em] text-black/40">Module {meta.number} of {TOTAL_MODULES} · {meta.duration}</p>
        <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-black leading-[0.95] tracking-[-0.04em]">{meta.title}</h1>
        <p className="mt-3 max-w-[600px] text-[15px] font-semibold leading-[1.6] text-black/65">{meta.subtitle}</p>
      </div>

      {content}

      <div className="flex items-center justify-between gap-4 rounded-[18px] border border-black/10 bg-[#f7f1e8] p-6 sm:p-8">
        <p className="text-[15px] font-black tracking-[-0.02em]">
          {isCompleted ? "Module complete" : "Finished reading?"}
        </p>
        <button
          type="button"
          onClick={onComplete}
          className={`inline-flex h-[48px] items-center gap-2 rounded-full px-6 text-[12px] font-black transition-transform duration-200 hover:-translate-y-0.5 ${
            isCompleted ? "bg-[#dfff00] text-black" : "bg-[#070707] text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)]"
          }`}
        >
          {isCompleted ? <><Check className="size-4" strokeWidth={3} /> Completed. Next module</> : <>Mark as complete <ArrowRight className="size-4" strokeWidth={3} /></>}
        </button>
      </div>
    </div>
  )
}

// ─── Shared building blocks ───────────────────────────────────────────────────

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[18px] border border-black/10 bg-white p-6 sm:p-8 ${className}`}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[22px] font-black tracking-[-0.03em]">{children}</h2>
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 max-w-[640px] text-[15px] font-semibold leading-[1.65] text-black/72">{children}</p>
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-5 border-l-4 border-[#dfff00] pl-5 text-[18px] font-black leading-[1.3] tracking-[-0.02em]">
      {children}
    </blockquote>
  )
}

function Principle({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#dfff00]">
        <Check className="size-3.5" strokeWidth={3.5} />
      </span>
      <span className="text-[15px] font-semibold leading-[1.5] text-black/78">{children}</span>
    </li>
  )
}

function Conversation({ speaker, line }: { speaker: "owner" | "partner"; line: string }) {
  return (
    <div className={`rounded-[14px] px-5 py-4 ${speaker === "owner" ? "bg-black/5" : "bg-[#dfff00]/20 ml-6"}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-black/45">{speaker === "owner" ? "Business owner" : "You"}</p>
      <p className="mt-1.5 text-[15px] font-semibold leading-[1.5] text-black/82">{line}</p>
    </div>
  )
}

function TimelineStep({ step, label, description, active }: { step: number; label: string; description: string; active?: boolean }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <span className={`grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-black ${active ? "bg-[#dfff00]" : "bg-black/8 text-black/55"}`}>
          {step}
        </span>
        <span className="mt-1 h-full w-px bg-black/10" />
      </div>
      <div className="pb-6">
        <p className="text-[15px] font-black tracking-[-0.02em]">{label}</p>
        <p className="mt-1 text-[13px] font-semibold leading-[1.5] text-black/60">{description}</p>
      </div>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-black/8 last:border-b-0">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 py-4 text-left">
        <span className="text-[15px] font-black tracking-[-0.02em]">{question}</span>
        <ChevronDown className={`size-5 shrink-0 text-black/40 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.4} />
      </button>
      {open ? <p className="pb-4 text-[14px] font-semibold leading-[1.6] text-black/68">{answer}</p> : null}
    </div>
  )
}

// ─── Module content ───────────────────────────────────────────────────────────

const MODULE_CONTENT: Record<ModuleId, React.ReactNode> = {
  // ── Module 1: Welcome to Sorted ────────────────────────────────────────────
  welcome: (
    <>
      <Section>
        <SectionTitle>Our mission</SectionTitle>
        <Quote>We modernise businesses.</Quote>
        <Paragraph>
          Sorted helps businesses improve the way they operate. Today, that starts with websites. Tomorrow, it may include operational improvements, digital tools, and more.
        </Paragraph>
        <Paragraph>
          We build the website first, show the business owner what their new site looks like, and only then ask if they'd like to go ahead. No commitment upfront. No pressure. Just proof.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>Your role</SectionTitle>
        <Quote>Your job isn't to sell.</Quote>
        <Paragraph>
          Your job is simply to identify businesses that would benefit from a modern website and introduce them to Sorted. We take care of everything else: the design, the build, the delivery, and the conversation with the business owner.
        </Paragraph>
        <Paragraph>
          You don't need to understand web design. You don't need to explain pricing. You just need to spot the opportunity and submit a referral.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>Key principles</SectionTitle>
        <ul className="mt-5 grid gap-3">
          <Principle>We don't pressure. A good referral speaks for itself.</Principle>
          <Principle>We don't hard sell. We show people what's possible and let them decide.</Principle>
          <Principle>We don't overcomplicate. Simple, honest conversations open every door.</Principle>
        </ul>
      </Section>
    </>
  ),

  // ── Module 2: Spot Opportunities ───────────────────────────────────────────
  opportunities: (
    <>
      <Section>
        <SectionTitle>What makes a good referral?</SectionTitle>
        <Paragraph>
          You're looking for businesses where a better website would make a real difference. You don't need to be an expert, just keep your eyes open.
        </Paragraph>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "Outdated or neglected website",
            "No website at all",
            "Facebook-only presence",
            "Poor mobile experience",
            "Slow or broken website",
            "Poor branding or presentation",
            "Recently expanded or relocated",
            "Recently opened or new business",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-[12px] border border-black/8 bg-[#fbfbfa] px-4 py-3">
              <Eye className="size-4 shrink-0 text-[#bdd900]" strokeWidth={2.4} />
              <span className="text-[14px] font-semibold text-black/78">{item}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionTitle>Where to look</SectionTitle>
        <Paragraph>
          Opportunities are everywhere once you start noticing. Here are the best places to find them.
        </Paragraph>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "High streets", icon: Search },
            { label: "Shopping centres", icon: Search },
            { label: "Google Maps", icon: Search },
            { label: "Instagram", icon: Share2 },
            { label: "Facebook", icon: Share2 },
            { label: "Networking events", icon: Users },
            { label: "Friends & family", icon: Users },
            { label: "Your existing contacts", icon: Users },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="rounded-[12px] bg-[#f7f1e8] p-4 text-center">
              <Icon className="mx-auto size-5 text-black/45" strokeWidth={2} />
              <p className="mt-2 text-[13px] font-black">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-[#f7f1e8] border-0">
        <SectionTitle>The mindset</SectionTitle>
        <Paragraph>
          You don't need to go hunting. Just start noticing. Walk down a high street, scroll through local Instagram, attend a networking event. Once you know what to look for, opportunities are everywhere.
        </Paragraph>
      </Section>
    </>
  ),

  // ── Module 3: Starting Conversations ───────────────────────────────────────
  conversations: (
    <>
      <Section>
        <SectionTitle>Confidence, not scripts</SectionTitle>
        <Paragraph>
          We're not going to give you a script. Scripts sound scripted. Instead, here's how natural conversations tend to go when a partner spots an opportunity.
        </Paragraph>
        <Paragraph>
          The key is to be relaxed, curious, and helpful. You're not selling anything. You're offering something genuinely useful.
        </Paragraph>
      </Section>

      <Section>
        <SectionTitle>Example conversation</SectionTitle>
        <div className="mt-5 grid gap-3">
          <Conversation speaker="owner" line="We've been really busy recently." />
          <Conversation speaker="partner" line="Brilliant. Out of curiosity, have you updated your website recently?" />
          <Conversation speaker="owner" line="Not really. It's been the same for years." />
          <Conversation speaker="partner" line="Funny enough, I work with a company called Sorted. They redesign websites before asking people to buy them. Would you like to see what yours could look like? It's completely free." />
          <Conversation speaker="owner" line="Free? What's the catch?" />
          <Conversation speaker="partner" line="No catch. They build a mockup of your new site and only charge if you want to go ahead. Most people are just happy to see what's possible." />
        </div>
      </Section>

      <Section>
        <SectionTitle>Guidelines</SectionTitle>
        <ul className="mt-5 grid gap-3">
          <Principle>Keep it relaxed. This is a chat, not a pitch.</Principle>
          <Principle>Be curious. Ask about their business before mentioning Sorted.</Principle>
          <Principle>Be friendly. People buy from people they like.</Principle>
          <Principle>Avoid pressure. If they're not interested, that's fine. Move on.</Principle>
          <Principle>Don't explain pricing. Let Sorted handle that part.</Principle>
        </ul>
      </Section>
    </>
  ),

  // ── Module 4: The Referral Journey ─────────────────────────────────────────
  journey: (
    <>
      <Section>
        <SectionTitle>What happens after you submit</SectionTitle>
        <Paragraph>
          Once you submit a referral, Sorted takes over. Here's exactly what happens at each stage, so you always know where things stand.
        </Paragraph>
      </Section>

      <Section>
        <div className="grid gap-0">
          <TimelineStep step={1} label="Business found" description="You spot a business that could benefit from a modern website." />
          <TimelineStep step={2} label="Referral submitted" description="You fill in the mockup request form in your portal with the business details." active />
          <TimelineStep step={3} label="Mockup in progress" description="Sorted's design team creates a custom mockup of the business's new website." />
          <TimelineStep step={4} label="Mockup delivered" description="The finished mockup is sent to the business owner for review." />
          <TimelineStep step={5} label="Customer reviewing" description="The business owner decides if they'd like to go ahead." />
          <TimelineStep step={6} label="Approved for build" description="The business says yes. Sorted begins building the full website." />
          <TimelineStep step={7} label="Website built" description="The site is complete and ready for the business owner to sign off." />
          <TimelineStep step={8} label="Purchased" description="The business pays and the website goes live." />
          <TimelineStep step={9} label="Commission paid" description="Your payout is calculated and you're notified immediately. Bank transfer follows." />
        </div>
      </Section>

      <Section className="bg-[#f7f1e8] border-0">
        <SectionTitle>You'll always know</SectionTitle>
        <Paragraph>
          Every referral in your portal shows its current stage. You'll also get a notification and an email whenever something moves forward, especially when a payout becomes due.
        </Paragraph>
      </Section>
    </>
  ),

  // ── Module 5: Frequently Asked Questions ───────────────────────────────────
  faq: (
    <>
      <Section>
        <SectionTitle>Questions you'll get asked</SectionTitle>
        <Paragraph>
          Here are the most common questions from partners and from the businesses they introduce. You don't need to memorise these, just know where to find them.
        </Paragraph>
      </Section>

      <Section>
        <FaqItem
          question="Do I need sales experience?"
          answer="No. Your role is to notice opportunities and introduce businesses to Sorted. We handle everything after that."
        />
        <FaqItem
          question="Do I build websites?"
          answer="No. Sorted does all the design and development. You simply connect us with businesses that could benefit."
        />
        <FaqItem
          question="What if someone asks me technical questions?"
          answer="Tell them Sorted will explain everything. You don't need to be a web expert. That's our job."
        />
        <FaqItem
          question="How much do the websites cost?"
          answer="Don't guess. Let Sorted recommend the correct package based on the business's needs. Prices start from £195."
        />
        <FaqItem
          question="Do customers have to buy?"
          answer="No. They see the mockup for free and decide after. There's no pressure at any stage."
        />
        <FaqItem
          question="When do I get paid?"
          answer="Once the business completes their website purchase. You'll get an email and a portal notification the moment your payout is due."
        />
        <FaqItem
          question="Can I submit multiple businesses?"
          answer="Yes. There's no limit. Submit as many referrals as you like."
        />
        <FaqItem
          question="What if a referral doesn't convert?"
          answer="That's completely normal. Not every business will go ahead. You're never penalised for referrals that don't convert."
        />
        <FaqItem
          question="How do I track my referrals?"
          answer="Everything is in your portal. The Referrals tab shows every submission and its current status."
        />
      </Section>
    </>
  ),

  // ── Module 6: The Sorted Way ───────────────────────────────────────────────
  "sorted-way": (
    <>
      <Section>
        <SectionTitle>How we work</SectionTitle>
        <Paragraph>
          This is the culture module. It's about how we represent Sorted and what makes us different from every other web company.
        </Paragraph>
      </Section>

      <Section>
        <div className="grid gap-8">
          <div>
            <Quote>We don't sell. We show.</Quote>
            <Paragraph>
              Most web companies ask for money before doing any work. We do the opposite. We build first, show the result, and let the quality speak for itself.
            </Paragraph>
          </div>

          <div>
            <Quote>Simplicity wins.</Quote>
            <Paragraph>
              Avoid technical language. Speak like a business owner, not a developer. If you wouldn't say it to a friend, don't say it to a prospect.
            </Paragraph>
          </div>

          <div>
            <Quote>Trust comes first.</Quote>
            <Paragraph>
              Businesses buy confidence before they buy websites. Your role is to be a trusted connection, someone they feel comfortable hearing from.
            </Paragraph>
          </div>

          <div>
            <Quote>Never pressure people.</Quote>
            <Paragraph>
              Helpful always beats pushy. If someone isn't interested, respect that. The best partners build trust over time, not through pressure.
            </Paragraph>
          </div>

          <div>
            <Quote>Protect the brand.</Quote>
            <Paragraph>
              Always represent Sorted professionally. Don't make promises we can't keep. Don't quote prices you're not sure about. When in doubt, let Sorted handle it.
            </Paragraph>
          </div>

          <div>
            <Quote>Every business deserves the chance to modernise.</Quote>
            <Paragraph>
              That's why we're here. Small businesses are the backbone of every community. Helping them look professional online isn't just a business. It's a mission.
            </Paragraph>
          </div>
        </div>
      </Section>
    </>
  ),
}

// ─── Resources page ───────────────────────────────────────────────────────────

type Resource = {
  title: string
  description: string
  icon: typeof FileText
  tag: string
  comingSoon?: boolean
}

const RESOURCES: Resource[] = [
  { title: "Brand Guidelines", description: "Colours, fonts, tone of voice, and logo usage rules.", icon: FileText, tag: "Brand" },
  { title: "Logos", description: "Sorted.sites logos in all formats. Dark, light, and icon.", icon: ImageIcon, tag: "Brand" },
  { title: "Sales One-Pager", description: "A single page explaining what Sorted does. Perfect for networking events.", icon: FileText, tag: "Sales" },
  { title: "Partner Handbook", description: "The complete guide to being a Sorted partner.", icon: BookOpen, tag: "Guide" },
  { title: "Example Websites", description: "Live examples of Sorted websites you can show prospects.", icon: Eye, tag: "Examples" },
  { title: "Email Templates", description: "Copy-paste email templates for introducing businesses to Sorted.", icon: MessageCircle, tag: "Templates" },
  { title: "Social Media Kit", description: "Ready-to-post graphics and captions for your social channels.", icon: Share2, tag: "Social", comingSoon: true },
  { title: "Social Templates", description: "Story and post templates branded for Sorted partners.", icon: Share2, tag: "Social", comingSoon: true },
  { title: "FAQ Reference Card", description: "Quick-reference card with answers to the most common questions.", icon: Lightbulb, tag: "Sales" },
]

export function ResourcesPage() {
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[0.95] tracking-[-0.04em]">Resources</h1>
        <p className="mt-2 max-w-[560px] text-[14px] font-semibold text-black/55">
          Brand assets, templates, and tools to help you represent Sorted and introduce businesses confidently.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RESOURCES.map((res) => {
          const Icon = res.icon
          return (
            <div
              key={res.title}
              className={`group relative rounded-[16px] border p-6 transition-all ${
                res.comingSoon ? "border-black/8 bg-black/[0.02]" : "border-black/10 bg-white hover:-translate-y-0.5 hover:border-black/25"
              }`}
            >
              {res.comingSoon ? (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/8 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-black/45">
                  <Lock className="size-3" strokeWidth={2.4} /> Coming soon
                </span>
              ) : null}
              <span className={`grid size-11 place-items-center rounded-full ${res.comingSoon ? "bg-black/5" : "bg-[#f7f1e8]"}`}>
                <Icon className={`size-5 ${res.comingSoon ? "text-black/30" : "text-black/55"}`} strokeWidth={2} />
              </span>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.1em] text-black/40">{res.tag}</p>
              <p className={`mt-1 text-[16px] font-black tracking-[-0.02em] ${res.comingSoon ? "text-black/40" : ""}`}>{res.title}</p>
              <p className={`mt-1 text-[13px] font-semibold leading-[1.5] ${res.comingSoon ? "text-black/35" : "text-black/55"}`}>{res.description}</p>
              {!res.comingSoon ? (
                <button
                  type="button"
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border border-black/15 px-4 text-[11px] font-black text-black/65 transition-colors hover:border-black/30 hover:text-black"
                >
                  <Download className="size-3.5" strokeWidth={2.4} /> Download
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
