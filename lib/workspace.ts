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
  }
  links: {
    bookingUrl?: string
    questionEmail: string
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
  "murray-martin": {
    review: {
      headline: "30 years of critical power expertise, finally presented like it.",
      summary:
        "We've rebuilt your homepage to put your UPS, battery and cooling services front and centre — with your real accreditations, your Google reviews and a faster path for every enquiry.",
      observations: [
        {
          title: "Expertise front and centre",
          explanation:
            "Your three core services — Battery Services, UPS, and Cooling & InRow — now open the page with clear explanations and a direct enquiry path on each.",
        },
        {
          title: "Real trust signals",
          explanation:
            "Schneider Electric, APC, SafeContractor and F-Gas accreditations are now impossible to miss, and your Google reviews sit right where new customers look for proof.",
        },
        {
          title: "Faster callbacks",
          explanation:
            "A Request a Callback option sits in the header of every page, so facilities managers and business owners can reach your engineers in seconds.",
        },
      ],
    },
    website: {
      previewUrl: "https://murraymartin-services.netlify.app",
      status: "review",
    },
    offer: {
      total: 1500,
      deposit: 750,
      balance: 750,
      // No stripePaymentUrl yet — a dedicated £750 Payment Link is needed.
      // Until then, card checkout shows "coming soon" and bank transfer works.
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
