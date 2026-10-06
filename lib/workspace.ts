import { supabase } from "@/lib/supabase"
import { trackEvent } from "@/lib/tracking"

// ─── Sorted Workspace data contract ───────────────────────────────────────────
// One workspace record per business. Prospect, project and live hub screens are
// views over the same record — driven by lifecycleState.
//
// Sources, in order of precedence:
//   1. Supabase `prospects` row (matched by review_slug)
//   2. WORKSPACE_OVERRIDES below — per-workspace config for anything the
//      prospects table does not carry yet (preview URL, Stripe payment link,
//      authored review copy, live-site/CMS/tracking links)
//   3. WORKSPACE_DEFAULTS — the fixed commercial offer

export type WorkspaceState = "prospect" | "project" | "live"

export type WorkspaceObservation = {
  title: string
  explanation: string
}

export type WorkspacePreviewVersion = {
  id: string
  label: string
  previewUrl: string
}

export type Workspace = {
  slug: string
  state: WorkspaceState
  business: {
    name: string
    domain?: string
    ownerName?: string
  }
  review: {
    headline: string
    summary: string
    observations: WorkspaceObservation[]
  }
  website: {
    /** Deployed working homepage — rendered live in the preview frame. */
    previewUrl?: string
    /** Still image of the homepage direction — used when no previewUrl exists yet. */
    previewImageUrl?: string
    /** Optional list of selectable preview builds shown as a version picker in the preview action bar. */
    previewVersions?: WorkspacePreviewVersion[]
    /** Version id shown by default; falls back to the first entry when unset/invalid. */
    defaultPreviewVersion?: string
    /** Direct video file URL of a talking-head explanation, rendered as a floating bubble over the preview. */
    walkthroughVideoUrl?: string
    liveUrl?: string
    cmsUrl?: string
    trackingUrl?: string
    status: "preview" | "building" | "review" | "live"
  }
  offer: {
    currency: "GBP"
    total: number
    deposit: number
    balance: number
    /** Hosted Stripe Payment Link for the £1,500 deposit. */
    stripePaymentUrl?: string
    bankTransferEnabled: boolean
    status?: "ready" | "pending"
  }
  links: {
    bookingUrl?: string
    questionEmail: string
    /** E.164 phone for tel:/sms: links. */
    phone?: string
    /** Human-readable form shown in copy, e.g. "07386 468085". */
    phoneDisplay?: string
    documentsUrl?: string
    googleReviewUrl?: string
  }
}

export const WORKSPACE_DEFAULTS = {
  offer: {
    currency: "GBP" as const,
    total: 3000,
    deposit: 1500,
    balance: 1500,
    // One shared Stripe Payment Link — each checkout is tagged with the
    // workspace slug via client_reference_id (set in NextStepsScreen).
    stripePaymentUrl: "https://buy.stripe.com/28E7sKbyo1SZ3QOgn8dwc00",
    bankTransferEnabled: true,
  },
  links: {
    bookingUrl: "https://cal.com/sortmydigital/15min",
    questionEmail: "hello@sortmydigital.site",
    phone: "+447386468085",
    phoneDisplay: "07386 468085",
  },
}

export const BANK_DETAILS = {
  accountName: "ADX ENGINE LTD",
  bank: "NatWest",
  sortCode: "52-30-02",
  accountNumber: "30189489",
}

// ─── Per-workspace configuration ──────────────────────────────────────────────
// Add an entry when a prospect's working homepage is deployed, when their Stripe
// deposit link is issued, or when authored review copy should replace the
// derived observations from site_weaknesses.

type WorkspaceOverride = {
  state?: WorkspaceState
  review?: Partial<Workspace["review"]>
  website?: Partial<Workspace["website"]>
  offer?: Partial<Workspace["offer"]>
  links?: Partial<Workspace["links"]>
}

const WORKSPACE_OVERRIDES: Record<string, WorkspaceOverride> = {
  "amp-electrical": {
    review: {
      headline: "Your electrical expertise, easier to trust and contact.",
      summary:
        "Your London customers can now see what you do and how to reach you without getting past an announcement first. Clear services and direct contact options give that first impression somewhere useful to lead.",
      observations: [
        {
          title: "Confidence from the first visit",
          explanation:
            "Customers see who you are, where you work and what you can help with straight away — without an announcement blocking the way.",
        },
        {
          title: "Services customers can recognise",
          explanation:
            "Rewires, testing, EV charging, lighting and security are explained in plain English, helping homeowners and businesses find the work they need.",
        },
        {
          title: "An easier next step",
          explanation:
            "Visitors can prepare a callback request to send by email, call you or open WhatsApp. Clear contact options make it easier to turn interest into a conversation.",
        },
      ],
    },
    website: {
      previewUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:3999"
          : undefined,
      previewImageUrl: "/amp-electrical-homepage-preview.webp",
      status: "review",
    },
    offer: {
      total: 2000,
      deposit: 1000,
      balance: 1000,
      stripePaymentUrl: undefined,
      bankTransferEnabled: true,
    },
  },
  "murray-martin": {
    review: {
      headline: "Three decades of trust, now turning into enquiries.",
      summary:
        "Murray Martin has traded since 1995 on a strong balance sheet and a hard-won reputation. Your new website puts that strength in front of every visitor — so trust becomes enquiries, and enquiries become customers.",
      observations: [
        {
          title: "Reputation made visible",
          explanation:
            "A new customer sees three decades of trading the moment they arrive — before they've read a word about services, they already know you're established.",
        },
        {
          title: "Proof where buyers look",
          explanation:
            "Your Schneider Electric, APC, SafeContractor and F-Gas credentials, and a real testimonial from DuPont, sit exactly where a careful buyer checks before calling.",
        },
        {
          title: "Trust that turns into enquiries",
          explanation:
            "Every page ends at an easy way to reach your engineers — request a callback, phone or email — so the confidence you've just earned has somewhere to go.",
        },
      ],
    },
    website: {
      // Development previews: v1 is the immutable earlier deploy, v2 is the
      // local build. In production only the existing hosted URL is shown —
      // versioned previews stay unpublished until preview deploy is approved.
      previewUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:3999"
          : "https://murraymartin-services.netlify.app",
      previewImageUrl: "/murray-martin-homepage-preview.webp",
      ...(process.env.NODE_ENV === "development"
        ? {
            previewVersions: [
              { id: "v2", label: "Version 1", previewUrl: "http://localhost:3999" },
              {
                id: "v1",
                label: "Version 2",
                previewUrl:
                  "https://6ac1b6191377cbff651147fb--murraymartin-services.netlify.app",
              },
            ],
            defaultPreviewVersion: "v2",
          }
        : {}),
      status: "review",
    },
    offer: {
      total: 1500,
      deposit: 750,
      balance: 750,
      // Explicitly clear the inherited shared £1,500 Payment Link — Murray
      // Martin's deposit is £750, so a dedicated link is needed first. Until
      // then card checkout shows "coming soon" and bank transfer works.
      stripePaymentUrl: undefined,
      bankTransferEnabled: true,
    },
  },
  "kelly-electrics-female-electricians-ltd": {
    review: {
      headline: "A trusted name, now winning work online.",
      summary:
        "Kelly Electrics has built something genuinely rare — an award-nominated, fully qualified team that customers already trust. Your new site puts that reputation in front of every visitor, so the trust you've earned turns into enquiries.",
      observations: [
        {
          title: "Reputation made visible",
          explanation:
            "Your Electric Awards nomination, NICEIC registration and Part P credentials sit where a careful customer looks first — before they've read a word, they already know you're the real thing.",
        },
        {
          title: "Proof where buyers look",
          explanation:
            "Real Google reviews from local customers run through the site, so the trust you've built household by household is doing the talking for you.",
        },
        {
          title: "Trust that turns into enquiries",
          explanation:
            "Every page ends at an easy way to reach your team — request a quote, phone or email — so the confidence a visitor has just gained has somewhere to go.",
        },
      ],
    },
    website: {
      previewUrl: "https://kelly-electrics.netlify.app",
      previewImageUrl: "/kelly-electrics-homepage-preview.webp",
      status: "review",
    },
  },
  "seem-electrical-ltd": {
    review: {
      headline: "Your electrical expertise, easier to choose.",
      summary:
        "Customers can see the electrical work you offer across London and reach you by phone or email. A clearer first impression helps them decide whether you’re right for their job.",
      observations: [
        {
          title: "Recognisable from the first visit",
          explanation:
            "Your own branding and clear service descriptions help customers understand who you are and what you do.",
        },
        {
          title: "Find the right help",
          explanation:
            "Installations, rewires, testing, repairs, commercial electrics and air conditioning are easy to find, so customers can see whether you can help.",
        },
        {
          title: "A direct route to an enquiry",
          explanation:
            "Phone and email are easy to reach. The quote request gathers useful project details; online sending still needs connecting before launch.",
        },
      ],
    },
    website: {
      previewUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:8160"
          : undefined,
      previewImageUrl: "/seem-electrical-homepage-preview.webp",
      status: "review",
    },
    offer: {
      status: "pending",
      total: 0,
      deposit: 0,
      balance: 0,
      stripePaymentUrl: undefined,
      bankTransferEnabled: false,
    },
  },
  "abcd-electrical": {
    review: {
      headline: "The local electrician, now easy to call.",
      summary:
        "ABCD Electrical already does the work Croydon homes and businesses need — from everyday jobs to urgent call-outs. Your new site makes that obvious at a glance and puts your phone number and quote request one tap away.",
      observations: [
        {
          title: "Local and established from the first glance",
          explanation:
            "Visitors see Croydon coverage and 18 years of experience immediately — the reassurance a careful homeowner looks for before inviting an electrician in.",
        },
        {
          title: "Real prices for real jobs",
          explanation:
            "Guide prices for small electrical jobs set expectations before anyone picks up the phone — so enquiries arrive better informed and easier to win.",
        },
        {
          title: "Every page ends at a next step",
          explanation:
            "Call buttons, a free-quote request and emergency contact are always within reach, so interest has somewhere to go the moment it appears.",
        },
      ],
    },
    website: {
      previewUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:8150"
          : undefined,
      previewImageUrl: "/abcd-electrical-homepage-preview.webp",
      status: "review",
    },
    offer: {
      total: 2000,
      deposit: 1000,
      balance: 1000,
      // No dedicated Stripe link yet — card checkout shows "coming soon";
      // bank transfer is the live payment path (same pattern as AMP).
      stripePaymentUrl: undefined,
      bankTransferEnabled: true,
    },
  },
  "imperial-nail-studio": {
    review: {
      headline: "Your business is stronger than your website makes it look.",
      summary:
        "We've redesigned your homepage to better show off your work, explain your services clearly and give new clients the confidence to book.",
      observations: [
        {
          title: "Lead with your work",
          explanation:
            "Your new homepage puts your best nail work front and centre, so visitors instantly see the quality you deliver.",
        },
        {
          title: "Clarify your services",
          explanation:
            "We've made it simpler to understand what you offer, from manicures to extensions, with clear information and beautiful visuals.",
        },
        {
          title: "Build recognisable trust",
          explanation:
            "We've added real proof through your work, reviews and a more professional design, so new clients feel confident booking with you.",
        },
      ],
    },
  },
}

const LOCAL_DEMO_WORKSPACES: Record<string, Workspace> = {
  "nexus-accounting": {
    slug: "nexus-accounting",
    state: "prospect",
    business: { name: "Nexus Accounting" },
    review: {
      headline: "A clearer homepage for Nexus Accounting.",
      summary:
        "This working example puts Nexus Accounting’s audiences, fixed-fee offer and consultation action up front.",
      observations: [
        {
          title: "Name the audiences",
          explanation: "The homepage makes clear Nexus works with contractors, freelancers and small businesses.",
        },
        {
          title: "Put the offer upfront",
          explanation: "The fixed-fee accounting offer and monthly starting price appear in the first screen.",
        },
        {
          title: "Make consultation easy to find",
          explanation: "The free consultation action appears in both the navigation and the homepage hero.",
        },
      ],
    },
    website: {
      previewUrl: "http://localhost:3001/",
      previewImageUrl: "/nexus-accounting-homepage-preview.webp",
      status: "preview",
    },
    offer: { ...WORKSPACE_DEFAULTS.offer },
    links: { ...WORKSPACE_DEFAULTS.links },
  },
}

// ─── Prospect → workspace mapping ─────────────────────────────────────────────

type ProspectRow = {
  id?: number
  name: string
  website: string | null
  owner_name: string | null
  review_summary: string | null
  site_analysis: string | null
  site_weaknesses: string[] | null
  mockup_url: string | null
  mockup_urls: string[] | null
  walkthrough_video_url: string | null
  screenshot_url: string | null
  crm_status: string | null
}

function domainFrom(url?: string | null) {
  if (!url) return undefined
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "")
  } catch {
    return undefined
  }
}

function titleFrom(text: string) {
  const clause = text.split(/\s+[—–-]\s+/)[0].trim()
  const words = clause.split(/\s+/)
  const title = words.slice(0, 6).join(" ")
  return title.length > 0 ? title.charAt(0).toUpperCase() + title.slice(1) : "What we found"
}

function deriveObservations(p: ProspectRow): WorkspaceObservation[] {
  const weaknesses = (p.site_weaknesses ?? []).filter(Boolean).slice(0, 4)
  return weaknesses.map((w) => ({ title: titleFrom(w), explanation: w }))
}

function stateFromCrm(crm: string | null): WorkspaceState {
  if (crm === "paid" || crm === "build") return "project"
  return "prospect"
}

function merge(ws: Workspace, o: WorkspaceOverride | undefined): Workspace {
  if (!o) return ws
  return {
    ...ws,
    state: o.state ?? ws.state,
    review: { ...ws.review, ...(o.review ?? {}) },
    website: { ...ws.website, ...(o.website ?? {}) },
    offer: { ...ws.offer, ...(o.offer ?? {}) },
    links: { ...ws.links, ...(o.links ?? {}) },
  }
}

export async function getWorkspace(slug: string): Promise<Workspace | null> {
  if (process.env.NODE_ENV === "development" && LOCAL_DEMO_WORKSPACES[slug]) {
    return LOCAL_DEMO_WORKSPACES[slug]
  }

  const { data, error } = await supabase
    .from("prospects")
    .select(
      "id, name, website, owner_name, review_summary, site_analysis, site_weaknesses, mockup_url, mockup_urls, walkthrough_video_url, screenshot_url, crm_status"
    )
    .eq("review_slug", slug)
    .maybeSingle()

  if (error || !data) return null
  const p = data as ProspectRow
  const override = WORKSPACE_OVERRIDES[slug]

  const ws: Workspace = {
    slug,
    state: stateFromCrm(p.crm_status),
    business: {
      name: p.name,
      domain: domainFrom(p.website),
      ownerName: p.owner_name ?? undefined,
    },
    review: {
      headline: "Your business is stronger than your website makes it look.",
      summary:
        p.review_summary ??
        `We've prepared a new homepage direction for ${p.name}, built around the substance already inside the business.`,
      observations: deriveObservations(p),
    },
    website: {
      previewImageUrl: p.mockup_urls?.[0] ?? p.mockup_url ?? undefined,
      walkthroughVideoUrl: p.walkthrough_video_url ?? undefined,
      status: "preview",
    },
    offer: { ...WORKSPACE_DEFAULTS.offer },
    links: { ...WORKSPACE_DEFAULTS.links },
  }

  return merge(ws, override)
}

// ─── Navigation model ─────────────────────────────────────────────────────────

export type WorkspaceRoute =
  | "review"
  | "website"
  | "next-steps"
  | "project"
  | "details"
  | "overview"
  | "documents"
  | "help"

export type WorkspaceTab = { label: string; route: WorkspaceRoute } | { label: string; external: "website" | "updates" | "tracking" }

export function tabsFor(state: WorkspaceState): WorkspaceTab[] {
  if (state === "live") {
    return [
      { label: "Overview", route: "overview" },
      { label: "Website", external: "website" },
      { label: "Updates", external: "updates" },
      { label: "Tracking", external: "tracking" },
      { label: "Documents", route: "documents" },
      { label: "Help", route: "help" },
    ]
  }
  if (state === "project") {
    return [
      { label: "Project", route: "project" },
      { label: "Website", route: "website" },
      { label: "Details", route: "details" },
      { label: "Documents", route: "documents" },
      { label: "Help", route: "help" },
    ]
  }
  return [
    { label: "Your Review", route: "review" },
    { label: "Your New Site", route: "website" },
    { label: "Next Steps", route: "next-steps" },
  ]
}

export function defaultRouteFor(state: WorkspaceState): WorkspaceRoute {
  return state === "live" ? "overview" : state === "project" ? "project" : "review"
}

// ─── Events ───────────────────────────────────────────────────────────────────
// Every event is pushed to the dataLayer (GTM/GA4) AND inserted into the
// Supabase workspace_events table, so per-prospect activity is queryable for
// follow-up. Inserts are fire-and-forget — never block the UI on analytics.

function workspaceSessionId(): string | undefined {
  if (typeof window === "undefined") return undefined
  try {
    let id = window.sessionStorage.getItem("workspace_session_id")
    if (!id) {
      id = crypto.randomUUID()
      window.sessionStorage.setItem("workspace_session_id", id)
    }
    return id
  } catch {
    return undefined
  }
}

export function workspaceEvent(ws: Workspace, event: string, payload: Record<string, string | number | boolean | null | undefined> = {}) {
  const context = {
    workspace_slug: ws.slug,
    business_name: ws.business.name,
    lifecycle_state: ws.state,
    ...payload,
  }
  trackEvent(event, context)

  void supabase
    .from("workspace_events")
    .insert({
      workspace_slug: ws.slug,
      event,
      payload: context,
      session_id: workspaceSessionId(),
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
    })
    .then(() => undefined, () => undefined)
}

// ─── Decline / opt-out ────────────────────────────────────────────────────────
// "Not interested" on the Next Steps screen marks the backing prospect `lost`
// via a SECURITY DEFINER RPC — the static site cannot use API routes, and anon
// has no direct UPDATE grant on prospects. The RPC ignores prospects already
// in paid/build/quote so paying clients can't self-demote.

export async function markWorkspaceNotInterested(ws: Workspace): Promise<boolean> {
  workspaceEvent(ws, "not_interested_confirmed")
  const { data, error } = await supabase.rpc("mark_workspace_not_interested", { p_slug: ws.slug })
  if (error) return false
  return Boolean(data)
}
