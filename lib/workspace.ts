import { MARKET_PRICING, resolveWorkspaceOffer, websiteLeadOffer, type WebsiteLeadOfferContext, type OfferCurrency } from "@/lib/market-pricing"
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

export type WorkspaceRebuildReason = {
  title: string
  /** The business's real strength — the thing customers already value. */
  strength?: string
  /** How the old website failed to capitalise on it. */
  gap: string
}

export type WorkspacePreviewVersion = {
  id: string
  label: string
  previewUrl: string
}

// ─── Acquisition setup model ──────────────────────────────────────────────────
// The prospect workspace presents a complete local acquisition setup: site +
// customer-offer page, ad campaign setup, automated follow-up and a proposed customer journey. Setup is part of the fixed service — ad
// spend, ongoing management and future optimisation remain separate, optional conversations.

export type WorkspaceInterest = {
  id: string
  title: string
  description: string
}

export type WorkspaceAdCreative = {
  title: string
  /** e.g. "Single image · Facebook & Instagram feed" */
  format: string
  primaryText: string
  headline: string
  cta: string
  audience?: string
  imageUrl?: string
  imageAlt?: string
  variants?: { label: string; imageUrl: string; imageAlt: string }[]
}

export type WorkspaceFollowUpEmail = {
  name: string
  subject: string
  /** e.g. "Immediately after enquiry" */
  timing: string
  purpose: string
  body?: string
  phase?: "enquiry" | "booking"
}

export type WorkspaceTrackingMetric = {
  key: string
  label: string
  description: string
  /** Where the number comes from once connected. */
  source: string
  /** False until the relevant integration is live — show an empty state. */
  connected: boolean
  value?: number
}

export type WorkspaceAcquisition = {
  /** Checklist shown before booking on Next Steps. */
  interests: WorkspaceInterest[]
  /** The single customer offer the whole setup is built around. */
  offerCard: {
    title: string
    description: string
    bullets: string[]
  }
  ads: {
    offer: string
    /** Positioning line — setup is included; spend and ongoing management are separate. */
    spendNote: string
    creatives: WorkspaceAdCreative[]
  }
  followUp: {
    emails: WorkspaceFollowUpEmail[]
    stopRules: string[]
    /** Label for booking-phase emails in the sequence list — e.g. "Booked trial", "Confirmed appointment". */
    bookingPhaseLabel?: string
  }
  tracking: {
    metrics: WorkspaceTrackingMetric[]
    /** How attendance gets confirmed — never inferred from elapsed time. */
    attendanceNote: string
    journey?: { stage: string; detail: string; owner: string; note: string }[]
    costMetrics?: string[]
    /** Illustrative figures for proposal previews, never live results. */
    example?: { period: string; adSpend: number; values: Record<string, number> }
  }
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
    /** Concrete current-site → preview → customer advantage comparisons. */
    changes?: { title: string; current: string; preview: string; advantage: string }[]
    /** What the client should compare before deciding. */
    comparisonPrompt?: string
    /** Reveal card heading — defaults to "We rebuilt your site."; use "We built your site." when the business had no website. */
    revealTitle?: string
    /** Reveal card supporting line. */
    revealBody?: string
    /** Section heading over the reasons — defaults to "Why we rebuilt it"; use "Why we built it" when there was no website. */
    reasonsHeading?: string
    /** Column header over the gap text — defaults to "Your old site"; use e.g. "Your Facebook page" when there was no website. */
    gapColumnLabel?: string
    /** Why we rebuilt it — strengths vs what the old site did with them. */
    rebuildReasons: WorkspaceRebuildReason[]
    /** What's improved — benefit-led observations about the new site. */
    observations: WorkspaceObservation[]
  }
  website: {
    /** Deployed working homepage — rendered live in the preview frame. */
    previewUrl?: string
    /** Still image of the homepage direction — used when no previewUrl exists yet. */
    previewImageUrl?: string
    offerPage?: { label: string; previewUrl?: string; previewImageUrl?: string; description: string }
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
    currency: OfferCurrency
    total: number
    deposit: number
    balance: number
    /** Hosted Stripe Payment Link matching this offer’s deposit amount and currency. */
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
  acquisition: WorkspaceAcquisition
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
  acquisition: {
    interests: [
      { id: "attract", title: "Attract more customers", description: "Advertising campaigns and reaching new audiences" },
      { id: "convert", title: "Convert more enquiries", description: "Websites, landing pages and clearer customer journeys" },
      { id: "follow-up", title: "Improve follow-up", description: "Responding to leads, reminders and automation" },
      { id: "tracking", title: "Understand what's working", description: "Tracking, reporting and campaign performance" },
    ] as WorkspaceInterest[],
    offerCard: {
      title: "A free first conversation",
      description: "A free, no-obligation conversation about what your business needs.",
      bullets: ["No obligation", "Plain English", "Focused on your goals"],
    },
    ads: {
      offer: "A dedicated offer page gives every ad somewhere specific to send people.",
      spendNote:
        "Campaign setup is included. Ad spend, ongoing management and future optimisation are separate, optional conversations. Nothing here commits you to either.",
      creatives: [] as WorkspaceAdCreative[],
    },
    followUp: {
      emails: [
        {
          name: "Thanks for your enquiry",
          subject: "Thanks for your enquiry",
          timing: "Immediately after an enquiry",
          purpose: "Confirms the enquiry landed, sets expectations and offers a clear next step.",
        },
        {
          name: "Keep the next step easy",
          subject: "Still interested?",
          timing: "2 days later, if they haven't taken the next step",
          purpose: "A short nudge with the agreed next-step link for people who enquired but haven't moved forward yet.",
        },
        {
          name: "Close the loop",
          subject: "Last call from us",
          timing: "5 days later, if still unresolved",
          purpose: "A polite close that leaves the door open without chasing further.",
        },
      ] as WorkspaceFollowUpEmail[],
      stopRules: [
        "The sequence stops the moment someone replies, takes the agreed next step, or asks not to be contacted.",
        "No email sends once the enquiry has been resolved; follow-up supports the conversation, it does not replace your team.",
      ],
    },
    tracking: {
      example: {
        period: "Example month",
        adSpend: 420,
        values: { enquiries: 42, attended: 29, quotes: 17, customers: 9 },
      },
      metrics: [
        { key: "enquiries", label: "Enquiries", description: "People who ask about your offer.", source: "Website forms + ad enquiries", connected: false },
        { key: "attended", label: "Attended conversations", description: "Conversations that happened, confirmed by your team.", source: "Attendance confirmation", connected: false },
        { key: "quotes", label: "Quotes sent", description: "Proposals shared after a conversation.", source: "Your team’s records", connected: false },
        { key: "customers", label: "Customers won", description: "Confirmed customers from those enquiries.", source: "Your team’s records", connected: false },
      ] as WorkspaceTrackingMetric[],
      journey: [
        { stage: "New enquiry", detail: "Source and request", owner: "Captured automatically", note: "From your website and ads once connected." },
        { stage: "Next step confirmed", detail: "Agreed action and timing", owner: "Your team", note: "Updated when the next step is confirmed." },
        { stage: "Conversation attended", detail: "A record that it took place", owner: "Your team", note: "Confirmed attendance, never assumed." },
        { stage: "Quote sent", detail: "Proposed support", owner: "Your team", note: "Updated when you share a proposal." },
        { stage: "Customer won", detail: "Accepted work", owner: "Your team", note: "Confirmed from your customer records." },
      ],
      costMetrics: ["Cost per enquiry", "Cost per attended conversation", "Cost per customer"],
      attendanceNote:
        "Attendance is confirmed by a real signal: a confirmed next step or a simple Attended / No-show record. It is never inferred from elapsed time.",
    },
  } as WorkspaceAcquisition,
}

/** Shared USD offer. Set only a verified $1,750 USD Stripe deposit link here. */
export const WORKSPACE_US_OFFER: Workspace["offer"] = {
  ...MARKET_PRICING.US,
  stripePaymentUrl: "",
  bankTransferEnabled: false,
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
  acquisition?: {
    interests?: WorkspaceInterest[]
    offerCard?: WorkspaceAcquisition["offerCard"]
    ads?: Partial<WorkspaceAcquisition["ads"]>
    followUp?: Partial<WorkspaceAcquisition["followUp"]>
    tracking?: Partial<WorkspaceAcquisition["tracking"]>
  }
}

const WORKSPACE_OVERRIDES: Record<string, WorkspaceOverride> = {
  "jp-plumbing-gas-heating-limited": {
    review: {
      headline: "A proper local plumbing and heating business, shown like one.",
      summary:
        "JP Plumbing & Gas Heating already has the credentials — Gas Safe registration and Worcester Bosch accreditation across Warwickshire. The new site puts that proof in front of every homeowner and landlord the moment the page opens, with one clear way to request a callback.",
      rebuildReasons: [
        {
          title: "Credentials that deserved more prominence",
          strength:
            "Gas Safe registered (186424) and a Worcester Bosch accredited installer — the qualifications homeowners look for before they call.",
          gap: "The old site buried that proof, so a first-time visitor had to hunt for the trust signals that should have greeted them.",
        },
        {
          title: "Real services, hard to scan",
          strength:
            "Boiler repairs, servicing, new boilers and general plumbing cover most of what a Warwickshire home actually needs.",
          gap: "Services weren't presented as clear, recognisable choices, so visitors couldn't quickly confirm JP handled their job.",
        },
        {
          title: "Interest with no simple next step",
          strength:
            "People with a boiler fault or a landlord's gas safety deadline want a quick way to ask for help.",
          gap: "Without an obvious callback route, visitors either phoned at awkward times or left without making contact.",
        },
      ],
      observations: [
        {
          title: "Trust in the first five seconds",
          explanation:
            "The hero leads with a professional visual and the credentials strip — Gas Safe and Worcester Bosch accreditation — sits directly beneath it.",
        },
        {
          title: "Services homeowners recognise",
          explanation:
            "Boiler repairs, servicing, new boilers and plumbing each get a clear card, so a visitor can see at a glance that you handle their job.",
        },
        {
          title: "One obvious next step",
          explanation:
            "Request a callback appears in the header, hero, services and footer — someone can ask for help in seconds and hear back from a real person.",
        },
      ],
    },
    website: {
      previewUrl: "https://sortmydigital.site/preview/jp-plumbing-gas-heating-limited/",
      previewImageUrl: "/workspace/jp-plumbing/homepage-preview.webp",
      status: "review",
    },
    offer: {
      total: 3000,
      deposit: 1500,
      balance: 1500,
      stripePaymentUrl: "https://buy.stripe.com/28E7sKbyo1SZ3QOgn8dwc00",
      bankTransferEnabled: true,
    },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more customers", description: "Reaching homeowners and landlords in Warwick, Leamington Spa and surrounding Warwickshire" },
        { id: "convert", title: "Convert more enquiries", description: "A site and offer that turn interest into callback requests" },
        { id: "follow-up", title: "Improve follow-up", description: "Confirmations, detail chasing and appointment reminders that run themselves" },
        { id: "tracking", title: "Understand what's working", description: "See callback requests, confirmed appointments, attended visits and jobs won" },
      ],
      offerCard: {
        title: "Request a callback",
        description: "Tell JP Plumbing & Gas Heating what needs attention and the team calls you back to discuss the job.",
        bullets: ["Boilers, heating & plumbing", "Warwick, Leamington & surrounding villages", "01926 497950"],
      },
      ads: {
        offer:
          "A campaign kit built around one clear action: request a callback from JP Plumbing & Gas Heating.",
        // No approved ad creatives supplied — they remain explicitly proposed.
      },
      followUp: {
        // Standard sequence applies; no client-approved email copy supplied yet.
      },
      tracking: {
        journey: [
          { stage: "New enquiry", detail: "Callback request or call", owner: "Captured automatically", note: "From your website and ads once connected." },
          { stage: "Visit arranged", detail: "Callback made and job discussed", owner: "Your team", note: "Recorded when the visit is confirmed." },
          { stage: "Visit attended", detail: "A record that the visit took place", owner: "Your team", note: "Confirmed attendance, never assumed." },
          { stage: "Job won", detail: "Work accepted and scheduled", owner: "Your team", note: "Confirmed from your job records." },
        ],
        costMetrics: ["Cost per enquiry", "Cost per booked visit", "Cost per job won"],
      },
    },
  },
  "m-carter-heating-and-plumbing-ltd": {
    review: {
      headline: "A proper local trades business, finally shown like one.",
      summary:
        "Matt Carter already has the reputation — a 5.0 rating across 90 reviews, Gas Safe registration and 20 years of experience around Warwick. The new site puts that credibility in front of every homeowner the moment the page opens, with a free boiler survey offer and one clear way to request a quote.",
      rebuildReasons: [
        {
          title: "A strong reputation behind a dated page",
          strength:
            "Five-star rated across 90 reviews, Gas Safe registered and family-run for over 20 years — the trust is already there.",
          gap: "The old site presented that track record inside clunky grey blocks and dated typography that made the business look less polished than it is.",
        },
        {
          title: "Real work, nowhere to show it",
          strength:
            "Boiler installs, bathrooms, cylinders and servicing are the kind of work homeowners want to see before they call.",
          gap: "No imagery or gallery meant visitors couldn't see the quality of workmanship — they had to take it on faith.",
        },
        {
          title: "Interest with no easy next step",
          strength:
            "People needing a boiler, bathroom or plumbing job want a simple way to ask for a quote.",
          gap: "A generic contact button and no quote process meant visitors either phoned at awkward times or left without making contact.",
        },
      ],
      observations: [
        {
          title: "Trust in the first five seconds",
          explanation:
            "The hero leads with a warm, professional visual and your credentials — years of experience, Gas Safe registration and a workmanship guarantee — sit directly beneath it.",
        },
        {
          title: "Services homeowners recognise",
          explanation:
            "Boilers & heating, plumbing & bathrooms, and servicing & safety each get a clear card, so a visitor can see at a glance that you handle their job.",
        },
        {
          title: "One obvious next step",
          explanation:
            "Request a quote appears in the header, hero, survey band and footer — and a free boiler survey offer gives people a low-pressure way to start.",
        },
      ],
    },
    website: {
      previewUrl: "https://sortmydigital.site/preview/m-carter-heating-and-plumbing-ltd/",
      previewImageUrl: "/matt-carter-homepage-preview.webp",
      status: "review",
    },
    offer: {
      total: 3000,
      deposit: 1500,
      balance: 1500,
      stripePaymentUrl: "https://buy.stripe.com/28E7sKbyo1SZ3QOgn8dwc00",
      bankTransferEnabled: true,
    },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more customers", description: "Reaching homeowners in Warwick and the surrounding areas" },
        { id: "convert", title: "Convert more enquiries", description: "A site and free boiler survey offer that turn interest into quote requests" },
        { id: "follow-up", title: "Improve follow-up", description: "Confirmations, reminders and gentle nudges that run themselves" },
        { id: "tracking", title: "Understand what's working", description: "See quote requests, survey bookings, attended visits and jobs won" },
      ],
      offerCard: {
        title: "Free boiler survey",
        description: "A free, no-obligation boiler survey and quotation — the natural first step for homeowners planning heating work.",
        bullets: ["No obligation", "Warwick & surrounding areas", "07460 571082"],
      },
      ads: {
        offer:
          "A campaign kit built around one clear action: request a free boiler survey or quote from Matt Carter Heating & Plumbing.",
        // No approved ad creatives supplied yet — they remain explicitly proposed.
      },
      followUp: {
        // Standard sequence applies; no client-approved email copy supplied yet.
      },
      tracking: {
        journey: [
          { stage: "New enquiry", detail: "Quote request or call", owner: "Captured automatically", note: "From your website and ads once connected." },
          { stage: "Survey booked", detail: "Free boiler survey arranged", owner: "Your team", note: "Recorded when the visit is confirmed." },
          { stage: "Survey attended", detail: "A record that the visit took place", owner: "Your team", note: "Confirmed attendance, never assumed." },
          { stage: "Quote sent", detail: "Written quotation shared", owner: "Your team", note: "Updated when the quote goes out." },
          { stage: "Job won", detail: "Work accepted and scheduled", owner: "Your team", note: "Confirmed from your job records." },
        ],
        costMetrics: ["Cost per enquiry", "Cost per booked survey", "Cost per job won"],
      },
    },
  },
  "adams-plumbing-and-heating-maintenance-ltd": {
    review: {
      headline: "Trusted local plumbing, now with a site that shows it.",
      summary:
        "Adams already has the work and the reputation around Leamington Spa. Your new site puts boiler servicing, repairs and a simple request-a-callback route in front of every homeowner who finds you, instead of asking them to hunt for it.",
      rebuildReasons: [
        {
          title: "A full service list, nowhere to show it",
          strength:
            "Boiler servicing, heating repairs, plumbing, MagnaCleanse and system upgrades cover most of what a local home actually needs.",
          gap: "Your old site gave that range little room, so customers couldn't quickly see whether you handled their job.",
        },
        {
          title: "Trust signals that stayed quiet",
          strength:
            "A recognised local name with real reviews and a clear service area around Leamington Spa and Warwickshire.",
          gap: "That proof sat off the beaten path, so a first-time visitor had to take your reputation on faith.",
        },
        {
          title: "Interest without an easy next step",
          strength:
            "People looking for a plumber usually want a quick answer, not a form-filling exercise.",
          gap: "Without a clear callback option, visitors either called at awkward times or left without making contact.",
        },
      ],
      observations: [
        {
          title: "Services people can recognise",
          explanation:
            "Boiler servicing, repairs and plumbing each get their own card with a real image, so homeowners see the job they need without guessing.",
        },
        {
          title: "Trust doing the talking",
          explanation:
            "Reviews and the local story sit on the homepage, so the reputation you've earned carries a visitor toward getting in touch.",
        },
        {
          title: "One obvious next step",
          explanation:
            "Request a callback appears in the header, hero, services and footer. Someone can ask for help in seconds and hear back from a real person.",
        },
      ],
    },
    website: {
      previewUrl: "https://sortmydigital.site/preview/adams-plumbing-and-heating-maintenance-ltd/",
      previewImageUrl: "/adams-plumbing-homepage-preview.webp",
      status: "review",
    },
    offer: {
      total: 3000,
      deposit: 1500,
      balance: 1500,
      stripePaymentUrl: "https://buy.stripe.com/28E7sKbyo1SZ3QOgn8dwc00",
      bankTransferEnabled: true,
    },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more customers", description: "Reaching homeowners in Leamington Spa and surrounding Warwickshire" },
        { id: "convert", title: "Convert more enquiries", description: "A site and offer that turn interest into callback requests" },
        { id: "follow-up", title: "Improve follow-up", description: "Confirmations, detail chasing and appointment reminders that run themselves" },
        { id: "tracking", title: "Understand what's working", description: "See callback requests, confirmed appointments, attended visits and jobs won" },
      ],
      offerCard: {
        title: "Request a callback",
        description: "Tell Adams what needs attention and the team calls you back to arrange the visit.",
        bullets: ["Boiler servicing and repairs", "Leamington Spa & Warwickshire", "07305 820920"],
      },
      ads: {
        offer:
          "A campaign kit built around one clear action: request a callback from Adams Plumbing & Heating.",
        creatives: [
          {
            title: "Keep the warmth",
            format: "Facebook & Instagram feed · 1x1",
            audience: "Homeowners in Leamington Spa and surrounding Warwickshire.",
            headline: "Local boiler servicing",
            cta: "Request a callback",
            primaryText:
              "Keep your home comfortable with boiler servicing from Adams Plumbing & Heating. Serving Leamington Spa and surrounding Warwickshire. Request a callback to discuss your boiler service.",
            imageUrl: "/workspace/adams/ad-01.webp",
            imageAlt: "Adams Plumbing & Heating creative: Keep the warmth. Lose the worry. Local boiler servicing.",
          },
          {
            title: "Small leak. Big nuisance.",
            format: "Facebook & Instagram feed · 1x1",
            audience: "Homeowners in Leamington Spa and surrounding Warwickshire.",
            headline: "Let's get that leak sorted",
            cta: "Request a callback",
            primaryText:
              "A dripping tap or troublesome leak? Get straightforward plumbing help from Adams Plumbing & Heating in Leamington Spa and surrounding Warwickshire. Request a callback and tell us what needs attention.",
            imageUrl: "/workspace/adams/ad-02.webp",
            imageAlt: "Adams Plumbing & Heating creative: Small leak. Big nuisance. Let's get it sorted.",
          },
          {
            title: "Keep the warmth",
            format: "Facebook & Instagram feed · 3x4",
            audience: "Homeowners in Leamington Spa and surrounding Warwickshire.",
            headline: "Local boiler servicing",
            cta: "Request a callback",
            primaryText:
              "Keep your home comfortable with boiler servicing from Adams Plumbing & Heating. Serving Leamington Spa and surrounding Warwickshire. Request a callback to discuss your boiler service.",
            imageUrl: "/workspace/adams/ad-03.webp",
            imageAlt: "Adams Plumbing & Heating creative: Keep the warmth. Lose the worry. Local boiler servicing.",
          },
          {
            title: "Small leak. Big nuisance.",
            format: "Facebook & Instagram feed · 3x4",
            audience: "Homeowners in Leamington Spa and surrounding Warwickshire.",
            headline: "Let's get that leak sorted",
            cta: "Request a callback",
            primaryText:
              "A dripping tap or troublesome leak? Get straightforward plumbing help from Adams Plumbing & Heating in Leamington Spa and surrounding Warwickshire. Request a callback and tell us what needs attention.",
            imageUrl: "/workspace/adams/ad-04.webp",
            imageAlt: "Adams Plumbing & Heating creative: Small leak. Big nuisance. Let's get it sorted.",
          },
          {
            title: "Keep the warmth",
            format: "Facebook & Instagram story · 9x16",
            audience: "Homeowners in Leamington Spa and surrounding Warwickshire.",
            headline: "Local boiler servicing",
            cta: "Request a callback",
            primaryText:
              "Keep your home comfortable with boiler servicing from Adams Plumbing & Heating. Serving Leamington Spa and surrounding Warwickshire.",
            imageUrl: "/workspace/adams/ad-05.webp",
            imageAlt: "Adams Plumbing & Heating story creative: Keep the warmth. Lose the worry.",
          },
          {
            title: "Small leak. Big nuisance.",
            format: "Facebook & Instagram story · 9x16",
            audience: "Homeowners in Leamington Spa and surrounding Warwickshire.",
            headline: "Let's get that leak sorted",
            cta: "Request a callback",
            primaryText:
              "A dripping tap or troublesome leak? Get straightforward plumbing help from Adams Plumbing & Heating in Leamington Spa and surrounding Warwickshire.",
            imageUrl: "/workspace/adams/ad-06.webp",
            imageAlt: "Adams Plumbing & Heating story creative: Small leak. Big nuisance. Let's get it sorted.",
          },
        ],
      },
      followUp: {
        emails: [
          {
            name: "Request received",
            subject: "We've received your callback request",
            timing: "Immediately after a callback request",
            purpose: "Confirms the request landed and sets expectations — the callback is pending, not yet a confirmed appointment.",
            phase: "enquiry",
            body: "Hi [First name],\n\nThanks for getting in touch with Adams Plumbing & Heating. We've received your callback request about [service requested].\n\nOur team will contact you using the details you provided to discuss what you need and agree the next step. Your request does not yet confirm an appointment.\n\nIf there's anything else we should know, reply to this email with a short description of the issue.\n\nThanks,\nThe Adams Plumbing & Heating team\n07305 820920",
          },
          {
            name: "Missing details",
            subject: "A quick detail about your request",
            timing: "Next business day, only when customer action is needed",
            purpose: "Asks for the specific missing details needed to arrange the visit.",
            phase: "enquiry",
            body: "Hi [First name],\n\nTo take the next step with your request, we need: [missing details].\n\nPlease reply with these details, and we'll continue arranging your plumbing or heating help. Your appointment is still awaiting confirmation.\n\nThanks,\nThe Adams Plumbing & Heating team\n07305 820920",
          },
          {
            name: "Close the loop",
            subject: "Would you still like help?",
            timing: "Three business days after the request, still awaiting details",
            purpose: "A polite final check that leaves the door open without chasing further.",
            phase: "enquiry",
            body: "Hi [First name],\n\nA quick check-in about your request for [service requested]. We're still waiting for [missing details] so we can take the next step.\n\nIf you'd like to continue, just reply with those details. If you no longer need help, let us know and we'll close the request. There's no confirmed appointment at this stage.\n\nThanks,\nThe Adams Plumbing & Heating team\n07305 820920",
          },
          {
            name: "Appointment confirmed",
            subject: "Your Adams appointment is confirmed",
            timing: "When the appointment is confirmed by the team",
            purpose: "Service, date, arrival window, address, agreed scope and preparation in one place.",
            phase: "booking",
            body: "Hi [First name],\n\nYour appointment with Adams Plumbing & Heating is confirmed.\n\nService: [service requested]\nDate: [appointment date]\nTime / arrival window: [arrival window]\nTimezone: Europe/London\nAddress: [service address]\nAgreed scope and price: [agreed scope and price]\nPreparation: [preparation notes]\n\nPlease check these details. Reply to this email or call 07305 820920 if anything needs changing.\n\nThanks,\nThe Adams Plumbing & Heating team\n07305 820920",
          },
          {
            name: "Day-before reminder",
            subject: "A reminder about your Adams appointment",
            timing: "24 hours before the appointment",
            purpose: "Useful reminder with preparation notes and a route to reschedule.",
            phase: "booking",
            body: "Hi [First name],\n\nA quick reminder about your appointment with Adams Plumbing & Heating.\n\nDate: [appointment date]\nTime / arrival window: [arrival window]\nAddress: [service address]\nPreparation: [preparation notes]\n\nPlease make sure we can access the area that needs attention. If your plans change, reply to this email or call 07305 820920.\n\nThanks,\nThe Adams Plumbing & Heating team\n07305 820920",
          },
          {
            name: "Two-hour reminder",
            subject: "Your Adams appointment is coming up",
            timing: "2 hours before the appointment",
            purpose: "Short reminder of the agreed visit and arrival window.",
            phase: "booking",
            body: "Hi [First name],\n\nYour Adams Plumbing & Heating appointment is coming up.\n\nTime / arrival window: [arrival window]\nAddress: [service address]\n\nIf your plans have changed, please reply or call 07305 820920.\n\nThanks,\nThe Adams Plumbing & Heating team\n07305 820920",
          },
          {
            name: "Rearrange a missed visit",
            subject: "Would you like to arrange another time?",
            timing: "After a missed appointment",
            purpose: "Offers a simple route to rearrange without pressure.",
            phase: "booking",
            body: "Hi [First name],\n\nIt looks like we weren't able to go ahead with your appointment. If you'd still like our help with [service requested], reply with a convenient time to reach you and we'll discuss arranging another visit.\n\nYou can also call us on 07305 820920.\n\nThanks,\nThe Adams Plumbing & Heating team\n07305 820920",
          },
        ],
        stopRules: [
          "Enquiry follow-ups pause as soon as someone replies, books, cancels or asks not to be contacted.",
          "Confirmation and reminder emails belong to the booked-appointment journey. They do not restart the enquiry sequence.",
          "If the team owes the next action, chasing pauses until a person resolves it — the sequence never chases a customer for something we owe them.",
          "Appointment details and reply addresses are filled from the confirmed booking before anything sends. Raw placeholders never reach a customer.",
        ],
      },
      tracking: {
        metrics: [
          { key: "enquiries", label: "Callback requests", description: "People asking Adams to call them back.", source: "Website callback form + ad enquiries", connected: false },
          { key: "attended", label: "Appointments attended", description: "Visits that took place, confirmed by the team.", source: "Adams attendance confirmation", connected: false },
          { key: "quotes", label: "Quotes sent", description: "Prices shared after a visit or conversation.", source: "Adams team", connected: false },
          { key: "customers", label: "Jobs won", description: "Confirmed work from those enquiries.", source: "Adams job records", connected: false },
        ],
        journey: [
          { stage: "New callback request", detail: "Source and service needed", owner: "Captured automatically", note: "From your website and ads once connected." },
          { stage: "Appointment confirmed", detail: "Agreed date and arrival window", owner: "Adams team", note: "Set when the team confirms the booking." },
          { stage: "Visit attended", detail: "A record that the work happened", owner: "Adams team", note: "Confirmed attendance, never assumed." },
          { stage: "Quote sent", detail: "Price proposed for further work", owner: "Adams team", note: "Recorded when a quote goes out." },
          { stage: "Job won", detail: "Confirmed work", owner: "Adams team", note: "Updated from your job records." },
        ],
        costMetrics: ["Cost per callback request", "Cost per attended visit", "Cost per job won"],
        attendanceNote:
          "Appointments and jobs are confirmed by the Adams team or connected records. A callback request alone never counts as an attended visit or a won job.",
      },
    },
  },
  "baker-berte": {
    review: {
      headline: "Two directions for Baker & Berte — pick the one that feels right.",
      summary:
        "Baker & Berte has the work and the van on the road around Leamington Spa, but no website to send people to. We've built two homepage directions: Version 1 is a warm, editorial take; Version 2 is bolder, navy and gold with the quote form built into the page. Compare both and tell us which direction to carry through the rest of the site.",
      revealTitle: "See both versions of your new site.",
      revealBody:
        "Switch between Version 1 and Version 2 below. Whichever you prefer becomes the direction for the rest of the site.",
      rebuildReasons: [
        {
          title: "A real business with nowhere to send people",
          strength:
            "A working flooring company covering carpet and luxury vinyl across Leamington Spa, with a branded van on the road.",
          gap: "There's no website behind any of it, so someone who hears the name has nowhere to check the work or ask for a quote.",
        },
        {
          title: "Enquiries with no route in",
          strength:
            "The kind of local job people want to talk through — the room, the flooring, the budget.",
          gap: "Without a site there's no easy way to start that conversation, so warm interest has nowhere to land.",
        },
      ],
      observations: [
        {
          title: "Two directions, one decision",
          explanation:
            "Version 1 leads with a softer, editorial style. Version 2 leads with bold type, navy and gold. Same content — pick the direction that feels like Baker & Berte.",
        },
        {
          title: "A quote request, not a chore",
          explanation:
            "Both versions make asking for a quote the obvious next step — a short form that captures the flooring type, the rooms and a postcode.",
        },
        {
          title: "Local and straightforward",
          explanation:
            "Leamington Spa is named up front and the language stays plain: tell us about your room, we talk through the options.",
        },
      ],
    },
    website: {
      previewUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:4319"
          : "https://baker-berte-v2.netlify.app",
      previewImageUrl: "/workspace/baker-berte/baker-berte-v2-homepage-preview.webp",
      previewVersions: [
        {
          id: "v1",
          label: "Version 1",
          previewUrl:
            process.env.NODE_ENV === "development"
              ? "http://localhost:4318"
              : "https://baker-berte-v1.netlify.app",
        },
        {
          id: "v2",
          label: "Version 2",
          previewUrl:
            process.env.NODE_ENV === "development"
              ? "http://localhost:4319"
              : "https://baker-berte-v2.netlify.app",
        },
      ],
      defaultPreviewVersion: "v2",
      status: "review",
    },
    offer: {
      total: 3000,
      deposit: 1500,
      balance: 1500,
      // Shared £1,500 deposit link — client_reference_id carries the slug.
      stripePaymentUrl: "https://buy.stripe.com/28E7sKbyo1SZ3QOgn8dwc00",
      bankTransferEnabled: true,
    },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more customers", description: "Reaching homeowners in Leamington Spa planning new flooring" },
        { id: "convert", title: "Convert more enquiries", description: "A site and offer that turn interest into quote requests" },
        { id: "follow-up", title: "Improve follow-up", description: "Confirmations, detail chasing and appointment reminders that run themselves" },
        { id: "tracking", title: "Understand what's working", description: "See quote requests, conversations, appointments and jobs won" },
      ],
      offerCard: {
        title: "Request a quote",
        description: "Tell Baker & Berte about your room and the flooring you have in mind, and the team talks through the options.",
        bullets: ["Carpet, luxury vinyl and vinyl flooring", "Leamington Spa and surrounding area", "An enquiry is not a confirmed appointment"],
      },
      ads: {
        offer:
          "A campaign kit built around one clear action: request a flooring quote from Baker & Berte.",
        creatives: [
          {
            title: "New flooring. A proper finish.",
            format: "Facebook & Instagram feed · 1x1",
            audience: "Homeowners in Leamington Spa planning new flooring.",
            headline: "New flooring. A proper finish.",
            cta: "Request a quote",
            primaryText:
              "Planning a new floor for your Leamington Spa home? Tell Baker & Berte about your room and the finish you have in mind. Request a quote to start the conversation.",
            imageUrl: "/workspace/baker-berte/ad-01-feed-1x1.webp",
            imageAlt: "Baker & Berte creative: New flooring. A proper finish. Carpet and vinyl flooring in Leamington Spa.",
          },
          {
            title: "A new floor for your home?",
            format: "Facebook & Instagram feed · 1x1",
            audience: "Homeowners in Leamington Spa planning new flooring.",
            headline: "Let's talk flooring.",
            cta: "Request a quote",
            primaryText:
              "Planning a new floor for your Leamington Spa home? Tell Baker & Berte about your room and the finish you have in mind. Request a quote to start the conversation.",
            imageUrl: "/workspace/baker-berte/ad-02-feed-1x1.webp",
            imageAlt: "Baker & Berte creative: A new floor for your home? Let's talk through the options.",
          },
          {
            title: "New flooring. A proper finish.",
            format: "Facebook & Instagram feed · 4x5",
            audience: "Homeowners in Leamington Spa planning new flooring.",
            headline: "New flooring. A proper finish.",
            cta: "Request a quote",
            primaryText:
              "Planning a new floor for your Leamington Spa home? Tell Baker & Berte about your room and the finish you have in mind. Request a quote to start the conversation.",
            imageUrl: "/workspace/baker-berte/ad-03-feed-4x5.webp",
            imageAlt: "Baker & Berte creative: New flooring. A proper finish. Carpet and vinyl flooring in Leamington Spa.",
          },
          {
            title: "A new floor for your home?",
            format: "Facebook & Instagram feed · 4x5",
            audience: "Homeowners in Leamington Spa planning new flooring.",
            headline: "Let's talk flooring.",
            cta: "Request a quote",
            primaryText:
              "Planning a new floor for your Leamington Spa home? Tell Baker & Berte about your room and the finish you have in mind. Request a quote to start the conversation.",
            imageUrl: "/workspace/baker-berte/ad-04-feed-4x5.webp",
            imageAlt: "Baker & Berte creative: A new floor for your home? Let's talk through the options.",
          },
          {
            title: "New flooring. A proper finish.",
            format: "Facebook & Instagram story · 9x16",
            audience: "Homeowners in Leamington Spa planning new flooring.",
            headline: "New flooring. A proper finish.",
            cta: "Request a quote",
            primaryText:
              "Planning a new floor for your Leamington Spa home? Tell Baker & Berte about your room and the finish you have in mind. Request a quote to start the conversation.",
            imageUrl: "/workspace/baker-berte/ad-05-story-9x16.webp",
            imageAlt: "Baker & Berte story creative: New flooring. A proper finish.",
          },
          {
            title: "A new floor for your home?",
            format: "Facebook & Instagram story · 9x16",
            audience: "Homeowners in Leamington Spa planning new flooring.",
            headline: "Let's talk flooring.",
            cta: "Request a quote",
            primaryText:
              "Planning a new floor for your Leamington Spa home? Tell Baker & Berte about your room and the finish you have in mind. Request a quote to start the conversation.",
            imageUrl: "/workspace/baker-berte/ad-06-story-9x16.webp",
            imageAlt: "Baker & Berte story creative: A new floor for your home? Let's talk through the options.",
          },
        ],
      },
      followUp: {
        emails: [
          {
            name: "Enquiry received",
            subject: "We've received your flooring enquiry",
            timing: "Immediately after a quote request",
            purpose: "Confirms the enquiry landed and asks for room, postcode and flooring ideas — the appointment is pending, not confirmed.",
            phase: "enquiry",
            body: "Hi [First name],\n\nThanks for getting in touch about your flooring. We've received your request and will be in touch to discuss the next step. An appointment hasn't been confirmed yet.\n\nIf you haven't already, reply with the room you're updating, your postcode and any flooring ideas you have. Photos are welcome too.\n\nIf anything in your request needs changing, just let us know.\n\nBaker & Berte\nFlooring Solutions",
          },
          {
            name: "Missing details",
            subject: "A quick detail about your flooring enquiry",
            timing: "Next business day, only when customer action is needed",
            purpose: "Asks for the specific missing detail needed to move the enquiry forward.",
            phase: "enquiry",
            body: "Hi [First name],\n\nTo move your flooring enquiry forward, we still need [missing detail].\n\nCould you reply with that when you have a moment? If you're still deciding on the flooring, that's fine — tell us about the room and the look you have in mind.\n\nBaker & Berte\nFlooring Solutions",
          },
          {
            name: "Close the loop",
            subject: "Would you still like to discuss your flooring?",
            timing: "Three business days after the request, still awaiting details",
            purpose: "A polite final check that leaves the door open without chasing further.",
            phase: "enquiry",
            body: "Hi [First name],\n\nJust checking whether you'd still like to discuss your flooring project. We're still waiting for [missing detail] before we can take the next step.\n\nIf you'd like to continue, reply with the detail or any questions. If your plans have changed, let us know and we'll close the enquiry.\n\nBaker & Berte\nFlooring Solutions",
          },
          {
            name: "Appointment confirmed",
            subject: "Your flooring appointment is confirmed",
            timing: "When the appointment is confirmed by the team",
            purpose: "Date, time, location and purpose in one place, with a route to change arrangements.",
            phase: "booking",
            body: "Hi [First name],\n\nYour appointment with Baker & Berte is confirmed.\n\nDate: [appointment date]\nTime: [appointment time] (Europe/London)\nLocation: [appointment location]\nAppointment: [appointment purpose]\n\nPlease have any flooring ideas, room photos or questions handy.\n\nNeed to change the arrangements? Reply to this email.\n\nBaker & Berte\nFlooring Solutions",
          },
          {
            name: "Day-before reminder",
            subject: "A reminder of your flooring appointment tomorrow",
            timing: "24 hours before the appointment",
            purpose: "Useful reminder with the details and a route to rearrange.",
            phase: "booking",
            body: "Hi [First name],\n\nA quick reminder of your Baker & Berte appointment tomorrow.\n\n[appointment date] at [appointment time] (Europe/London)\n[appointment location]\n\nHave any flooring ideas or questions handy. If your plans have changed, please reply so we can rearrange.\n\nBaker & Berte\nFlooring Solutions",
          },
          {
            name: "Two-hour reminder",
            subject: "Your flooring appointment is coming up",
            timing: "2 hours before the appointment",
            purpose: "Short reminder of the agreed visit.",
            phase: "booking",
            body: "Hi [First name],\n\nYour Baker & Berte appointment is today at [appointment time] (Europe/London).\n\nLocation: [appointment location]\n\nNeed to let us know about a change? Just reply.\n\nBaker & Berte\nFlooring Solutions",
          },
          {
            name: "Rearrange a missed visit",
            subject: "Would you like to rearrange your flooring appointment?",
            timing: "Next business day after a missed appointment",
            purpose: "Offers a simple route to rearrange without pressure.",
            phase: "booking",
            body: "Hi [First name],\n\nWe weren't able to connect for your flooring appointment. If you'd like to rearrange, reply with a couple of days and times that could work for you.\n\nIf your plans have changed, that's fine — just let us know.\n\nBaker & Berte\nFlooring Solutions",
          },
        ],
        stopRules: [
          "Enquiry follow-ups pause as soon as someone replies, books, cancels or asks not to be contacted.",
          "Confirmation and reminder emails belong to the booked-appointment journey. They do not restart the enquiry sequence.",
          "If the team owes the next action, chasing pauses until a person resolves it — the sequence never chases a customer for something we owe them.",
          "Appointment details and reply addresses are filled from the confirmed booking before anything sends. Raw placeholders never reach a customer.",
        ],
      },
      tracking: {
        metrics: [
          { key: "enquiries", label: "Quote requests", description: "People asking Baker & Berte for a flooring quote.", source: "Website quote form + ad enquiries", connected: false },
          { key: "conversations", label: "Conversations started", description: "Enquiries that turned into a real exchange about the job.", source: "Baker & Berte team", connected: false },
          { key: "attended", label: "Appointments attended", description: "Visits or calls that took place, confirmed by the team.", source: "Baker & Berte attendance confirmation", connected: false },
          { key: "customers", label: "Jobs won", description: "Confirmed flooring work from those enquiries.", source: "Baker & Berte job records", connected: false },
        ],
        journey: [
          { stage: "New quote request", detail: "Flooring type, rooms and postcode", owner: "Captured automatically", note: "From your website and ads once connected." },
          { stage: "Conversation started", detail: "The team discusses the options", owner: "Baker & Berte team", note: "Recorded when a real exchange begins." },
          { stage: "Appointment confirmed", detail: "Agreed date, time and location", owner: "Baker & Berte team", note: "Set when the team confirms the booking." },
          { stage: "Visit attended", detail: "A record that the appointment happened", owner: "Baker & Berte team", note: "Confirmed attendance, never assumed." },
          { stage: "Job won", detail: "Confirmed flooring work", owner: "Baker & Berte team", note: "Recorded when the job is agreed." },
        ],
        costMetrics: ["Cost per quote request", "Cost per attended appointment", "Cost per job won"],
        attendanceNote:
          "Appointments and jobs are confirmed by the Baker & Berte team or connected records. A quote request alone never counts as an attended appointment or a won job.",
      },
    },
  },
  "amp-electrical": {
    review: {
      headline: "Your electrical expertise, easier to trust and contact.",
      summary:
        "Your London customers can now see what you do and how to reach you without getting past an announcement first. Clear services and direct contact options give that first impression somewhere useful to lead.",
      rebuildReasons: [
        {
          title: "A working business behind a blocked door",
          strength:
            "Domestic and commercial electrical work across London, run from Gipsy Hill.",
          gap: "Your old site opened on a stale announcement covering the page, so customers saw a popup before they saw your business.",
        },
        {
          title: "Services customers could not find",
          strength:
            "Rewires, testing, EV charging, lighting and security cover most of what a home or business actually needs.",
          gap: "None of that range was on show, so visitors had to call just to find out whether you could help.",
        },
        {
          title: "Enquiries lost to a hard-to-use site",
          strength:
            "When customers reach you, the work gets done properly.",
          gap: "A dated site with no clear contact route meant callers gave up or rang at awkward times, with no way to request a callback when it suited them.",
        },
      ],
      observations: [
        {
          title: "Confidence from the first visit",
          explanation:
            "Customers see who you are, where you work and what you can help with straight away, without an announcement blocking the way.",
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
          : "https://amp-electrical.netlify.app",
      previewImageUrl: "/amp-electrical-homepage-preview.webp",
      status: "review",
    },
    offer: {
      total: 2000,
      deposit: 1000,
      balance: 1000,
      // Shared £1,000 deposit link (Sorted Website Payments product) —
      // checkout is tagged with the workspace slug via client_reference_id.
      stripePaymentUrl: "https://buy.stripe.com/3cIaEW1XOfJP3QO2widwc02",
      bankTransferEnabled: true,
    },
  },
  "mccolm-cardew": {
    review: {
      headline: "A clearer first step into McColm Cardew.",
      summary:
        "Your current site already carries a lot of useful substance: your free first meeting, plain-English promise, accountancy services and deep business resources.\n\nWe’ve built a new version that keeps that substance and gives it a calmer opening, so prospective clients can understand who you help, what you offer and how to take the next step.",
      revealTitle: "See what we’ve built for McColm Cardew.",
      revealBody: "Explore the preview and compare it with your current site.",
      changes: [
        {
          title: "Make the opening easier to take in",
          current: "Your current homepage opens with the practice introduction alongside many navigation choices, tools and news items.",
          preview: "The new opening gives your personal accountancy message, Rugby base and free first meeting one clear place to land.",
          advantage: "A prospective client can understand the practice and its offer before deciding where to explore next.",
        },
        {
          title: "Give trust a stronger first impression",
          current: "Your current pages contain useful information, but the opening is busy and the professional identity sits inside a long list of options.",
          preview: "The preview pairs the McColm Cardew name with Chartered Certified Accountants, plain-English advice and a more polished professional presentation.",
          advantage: "Someone choosing an accountant gets the reassurance and personality of the practice sooner.",
        },
        {
          title: "Keep the next step close",
          current: "Your free consultation, callback request and contact options appear among many competing links on the current homepage.",
          preview: "The preview keeps Book a free meeting and your phone number visible in the header, hero and closing section.",
          advantage: "Visitors who feel ready to talk have a clearer route to arrange it.",
        },
      ],
      comparisonPrompt: "Compare the two openings: how quickly can you understand the practice, recognise what makes it personal and find a way to arrange your free meeting?",
      rebuildReasons: [],
      observations: [],
    },
    website: {
      previewUrl: "https://sortmydigital.site/preview/mccolm-cardew/",
      previewImageUrl: "/mccolm-cardew-homepage-preview.webp",
      status: "review",
    },
    offer: {
      total: 0,
      deposit: 0,
      balance: 0,
      stripePaymentUrl: "",
      bankTransferEnabled: false,
      status: "pending",
    },
  },
  "murray-martin": {
    review: {
      headline: "Three decades of trust, now turning into enquiries.",
      summary:
        "Murray Martin has traded since 1995 on a strong balance sheet and a hard-won reputation. Your new website puts that strength in front of every visitor, so trust becomes enquiries, and enquiries become customers.",
      rebuildReasons: [
        {
          title: "Three decades of trading, easy to miss",
          strength:
            "Established in 1995 with a strong balance sheet and a hard-won reputation. Exactly the track record commercial buyers look for before shortlisting a contractor.",
          gap: "Your old site didn't put that history up front, so a first-time visitor couldn't tell Murray Martin from a firm that started last year.",
        },
        {
          title: "Credentials buyers check, buried",
          strength:
            "Schneider Electric and APC partnerships, SafeContractor approval and F-Gas certification, plus real testimonials from clients like DuPont.",
          gap: "The proof existed but sat where nobody looked for it, so careful buyers couldn't verify what existing customers already know.",
        },
        {
          title: "Enquiries with no clear route in",
          strength:
            "Engineers who respond properly when customers do get through. It's the reason clients stay for years.",
          gap: "The old site made getting in touch harder than it should be, so the confidence you'd just earned had no easy next step.",
        },
      ],
      observations: [
        {
          title: "Reputation made visible",
          explanation:
            "A new customer sees three decades of trading the moment they arrive. Before they've read a word about services, they already know you're established.",
        },
        {
          title: "Proof where buyers look",
          explanation:
            "Your Schneider Electric, APC, SafeContractor and F-Gas credentials, and a real testimonial from DuPont, sit exactly where a careful buyer checks before calling.",
        },
        {
          title: "Trust that turns into enquiries",
          explanation:
            "Every page ends at an easy way to reach your engineers, whether that's a callback request, a phone call or an email, so the confidence you've just earned has somewhere to go.",
        },
      ],
    },
    website: {
      // Version 1 is the current approved direction (the newer build, kept as
      // an immutable deploy URL). Version 2 is the earlier build on the main
      // site URL. In development, Version 1 resolves to the local preview.
      previewUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:3999"
          : "https://6ac60a0765930000c7877435--murraymartin-services.netlify.app",
      previewImageUrl: "/murray-martin-homepage-preview.webp",
      previewVersions: [
        {
          id: "v2",
          label: "Version 1",
          previewUrl:
            process.env.NODE_ENV === "development"
              ? "http://localhost:3999"
              : "https://6ac60a0765930000c7877435--murraymartin-services.netlify.app",
        },
        {
          id: "v1",
          label: "Version 2",
          previewUrl: "https://murraymartin-services.netlify.app",
        },
      ],
      defaultPreviewVersion: "v2",
      status: "review",
    },
    offer: {
      total: 3000,
      deposit: 750,
      balance: 2250,
      // £750 deposit payment link (Sorted Website Payments product) —
      // checkout is tagged with the workspace slug via client_reference_id.
      stripePaymentUrl: "https://buy.stripe.com/dRm9ASdGwbtz2MK5Iudwc03",
      bankTransferEnabled: true,
    },
  },
  "kelly-electrics-female-electricians-ltd": {
    review: {
      headline: "A clearer way to choose Kelly Electrics.",
      summary:
        "Your current site already gives customers reasons to trust you: a recognisable face, your award recognition and a clear identity as female electricians.\n\nWe’ve built a new version that keeps that character and puts more attention on what a prospective customer needs next: understand your services, get to know the team and make an enquiry.",
      revealTitle: "See what we’ve built for Kelly Electrics.",
      revealBody: "Explore the preview and compare it with your current site.",
      changes: [
        {
          title: "Start with the customer’s job",
          current: "Your current homepage gives a lot of space to the welcome graphic, followed by your blog, media centre and safety advice.",
          preview: "The new opening introduces your electrical work and gives visitors a direct route to Our Services.",
          advantage: "Someone arriving with a job in mind has a clearer starting point.",
        },
        {
          title: "Make your difference the opening message",
          current: "“Female electricians” is already part of your branding.",
          preview: "We’ve made it the main headline and paired it with an image of a team member at work.",
          advantage: "Customers can immediately see what distinguishes Kelly Electrics and put a face to the business they may invite into their home.",
        },
        {
          title: "Put the next step within easy reach",
          current: "Your current homepage displays phone and email details near the bottom.",
          preview: "The preview adds Get a Quote to the header and opening section.",
          advantage: "Visitors can move from considering your team to making an enquiry without first finding the contact section.",
        },
      ],
      comparisonPrompt: "Compare the two openings: how quickly can you understand the offer, get a feel for the team and find your next step?",
      rebuildReasons: [],
      observations: [],
    },
    website: {
      previewUrl: "https://kelly-electrics.netlify.app",
      previewImageUrl: "/kelly-electrics-homepage-preview.webp",
      status: "review",
    },
    offer: {
      total: 1500,
      deposit: 750,
      balance: 750,
      // £750 deposit payment link (Sorted Website Payments product) —
      // checkout is tagged with the workspace slug via client_reference_id.
      stripePaymentUrl: "https://buy.stripe.com/dRm9ASdGwbtz2MK5Iudwc03",
      bankTransferEnabled: true,
    },
  },
  "seem-electrical-ltd": {
    review: {
      headline: "Your electrical expertise, finally easy to find.",
      summary:
        "Until now, finding SEEM online meant a Facebook page. No site, no proof, no easy way to ask for a quote. Your new site puts your work, credentials and contact options where customers actually look.",
      revealTitle: "We built your site.",
      revealBody:
        "Your first real website, built around the substance already inside your business.",
      reasonsHeading: "Why we built it",
      gapColumnLabel: "Your Facebook page",
      rebuildReasons: [
        {
          title: "Real experience, kept quiet",
          strength:
            "Two decades of domestic and commercial electrical work across London, with NAPIT approval behind it.",
          gap: "None of it showed online. A Facebook page alone can't carry twenty years of experience to someone searching for an electrician.",
        },
        {
          title: "Happy customers, no proof",
          strength:
            "Customers who've had careful, reliable work done are happy to say so.",
          gap: "No website and no reviews on show, so new customers had to take your quality on faith instead of seeing other people vouch for you.",
        },
        {
          title: "Enquiries that fit your day",
          strength:
            "When customers reach you, the work gets done properly.",
          gap: "Phone calls and Facebook messages meant missed callers and mid-job interruptions, with no quick way for customers to send a quote request when it suited them.",
        },
      ],
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
          : "https://seem-electrical.netlify.app",
      previewImageUrl: "/seem-electrical-homepage-preview.webp",
      status: "review",
    },
    offer: {
      total: 2000,
      deposit: 1000,
      balance: 1000,
      // Shared £1,000 deposit link (Sorted Website Payments product) —
      // checkout is tagged with the workspace slug via client_reference_id.
      stripePaymentUrl: "https://buy.stripe.com/3cIaEW1XOfJP3QO2widwc02",
      bankTransferEnabled: true,
    },
  },
  "abcd-electrical": {
    review: {
      headline: "The local electrician, now easy to call.",
      summary:
        "ABCD Electrical already does the work Croydon homes and businesses need, from everyday jobs to urgent call-outs. Your new site makes that obvious at a glance and puts your phone number and quote request one tap away.",
      rebuildReasons: [
        {
          title: "18 years of local trust, hard to see",
          strength:
            "Nearly two decades of domestic and commercial electrical work across Croydon and South London.",
          gap: "That experience wasn't doing its job online. Customers comparing electricians had little to go on before deciding who to call.",
        },
        {
          title: "Everyday work with no clear offer",
          strength:
            "Small jobs, repairs, rewires and emergency call-outs are exactly what local homes and businesses need most.",
          gap: "With no guide prices or service detail on show, customers had to phone just to find out whether a job was worth booking.",
        },
        {
          title: "Urgent calls that could be missed",
          strength:
            "When the phone rings, the work gets done properly, day or night.",
          gap: "A phone number alone meant missed callers and no way to send a quote request when it suited the customer.",
        },
      ],
      observations: [
        {
          title: "Local and established from the first glance",
          explanation:
            "Visitors see Croydon coverage and 18 years of experience immediately, the reassurance a careful homeowner looks for before inviting an electrician in.",
        },
        {
          title: "Real prices for real jobs",
          explanation:
            "Guide prices for small electrical jobs set expectations before anyone picks up the phone, so enquiries arrive better informed and easier to win.",
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
          : "https://abcd-electrical.netlify.app",
      previewImageUrl: "/abcd-electrical-homepage-preview.webp",
      status: "review",
    },
    offer: {
      total: 2000,
      deposit: 1000,
      balance: 1000,
      // Shared £1,000 deposit link (Sorted Website Payments product) —
      // checkout is tagged with the workspace slug via client_reference_id.
      stripePaymentUrl: "https://buy.stripe.com/3cIaEW1XOfJP3QO2widwc02",
      bankTransferEnabled: true,
    },
  },
  "switched-on-south-londons-electricians": {
    review: {
      headline: "South London's electrician, finally easy to find.",
      summary:
        "Until now, finding Switched On online meant a Facebook page. No site, no services list, no easy way to ask for a call back. Your new site puts your work, your patch and your contact options where customers actually look.",
      revealTitle: "We built your site.",
      revealBody:
        "Your first real website, built around the work you already do across South London.",
      reasonsHeading: "Why we built it",
      gapColumnLabel: "Your Facebook page",
      rebuildReasons: [
        {
          title: "A real patch, kept quiet",
          strength:
            "You cover Tooting, Balham, Clapham, Wimbledon, Wandsworth and Merton Park, the areas local customers actually search for by name.",
          gap: "A Facebook page alone can't put that coverage in front of someone searching for a local electrician.",
        },
        {
          title: "Happy customers, no proof",
          strength:
            "52 Google reviews from local customers who would recommend your work.",
          gap: "With no website, that proof sat on Google instead of doing the talking on a site you control.",
        },
        {
          title: "Enquiries that fit your day",
          strength:
            "When customers reach you, the work gets done properly.",
          gap: "Phone calls and Facebook messages meant missed callers and mid-job interruptions, with no quick way for customers to request a call back when it suited them.",
        },
      ],
      observations: [
        {
          title: "A proper first impression",
          explanation:
            "Visitors see a real local electrician straight away: your name, your patch and the work you cover, presented with confidence.",
        },
        {
          title: "Proof where customers look",
          explanation:
            "Your Google review count sits front and centre, and approved review excerpts can run through the site once supplied.",
        },
        {
          title: "A call back in a few taps",
          explanation:
            "The request a call back panel gathers a name, number and the job in one step. Requests prepare an email for now; a direct connection still needs wiring before launch.",
        },
      ],
    },
    website: {
      previewUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:8123"
          : "https://switched-on-south-london.netlify.app",
      previewImageUrl: "/switched-on-homepage-preview.webp",
      status: "review",
    },
    offer: {
      total: 2000,
      deposit: 1000,
      balance: 1000,
      // Dedicated Stripe Payment Link for the £1,000 deposit (Sorted
      // Website Payments product); checkout is tagged with the slug via
      // client_reference_id. Bank transfer remains available.
      stripePaymentUrl: "https://buy.stripe.com/3cIaEW1XOfJP3QO2widwc02",
      bankTransferEnabled: true,
    },
  },
  "sweeneys-martial-arts": {
    review: {
      headline: "Five star reviews, and now a site to match.",
      summary:
        "Families already rate you five stars on Google. Until now that praise only reached people who found your listing. Your new site puts your classes, your academy and those reviews where anyone looking for martial arts in Leamington Spa will actually see them.",
      revealTitle: "We built your site.",
      revealBody:
        "Your first proper website, built around the reputation your students have already earned.",
      reasonsHeading: "Why we built it",
      gapColumnLabel: "Your Google listing",
      rebuildReasons: [
        {
          title: "Twenty two five star reviews, working quietly",
          strength:
            "Every Google review gives you five stars. Parents and students already recommend you.",
          gap: "That proof only reaches people who already found your listing. On its own, Google cannot show what a class feels like or who it is for.",
        },
        {
          title: "Classes for everyone, hard to picture",
          strength:
            "Children, juniors, women and adults all train here, and beginners are welcome.",
          gap: "Without a site, a parent deciding between activities has nothing to see. No photos, no class breakdown, no sense of the room.",
        },
        {
          title: "Interest with nowhere to land",
          strength:
            "A real academy on Crown Way with a community that keeps people coming back.",
          gap: "Someone interested tonight has to find your listing, then call or message. No clear next step means quiet interest never becomes a first class.",
        },
      ],
      observations: [
        {
          title: "Reputation made visible",
          explanation:
            "Your five star Google reviews sit right on the homepage, so the trust your members have earned is doing the talking before a visitor reads anything else.",
        },
        {
          title: "Classes people can picture",
          explanation:
            "Children's classes, women's classes and adult training each have their own space with real photos, so families can quickly see where they would fit.",
        },
        {
          title: "A simple first step",
          explanation:
            "Find your class and Ask about classes give every visitor an obvious next step, so interest turns into a message instead of a closed tab.",
        },
      ],
    },
    website: {
      previewUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:4180"
          : "https://sortmydigital.site/preview/sweeneys-martial-arts/",
      previewImageUrl: "/sweeneys-homepage-preview.webp",
      offerPage: {
        label: "Trial page",
        description: "A focused page for the class someone is interested in, with participant details and one clear route to request a trial. This page is planned and is not yet built.",
      },
      status: "review",
    },
    offer: {
      total: 750,
      deposit: 250,
      balance: 500,
      // Dedicated Stripe Payment Link for the £250 deposit (Sorted
      // Website Payments product); checkout is tagged with the slug via
      // client_reference_id. Bank transfer remains available.
      stripePaymentUrl: "https://buy.stripe.com/28E9ASgSIdBH7300oadwc01",
      bankTransferEnabled: true,
    },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more members", description: "Reaching families and beginners looking for martial arts in Leamington Spa" },
        { id: "convert", title: "Convert more enquiries", description: "A site and offer page that turn interest into a first class" },
        { id: "follow-up", title: "Improve follow-up", description: "Responding to enquiries and reminders that run themselves" },
        { id: "tracking", title: "Understand what's working", description: "See enquiries, booked trials, attendance and new members" },
      ],
      offerCard: {
        title: "Book a trial at Sweeney’s",
        description: "Meet the team, experience the training and find the right starting point for you or your child.",
        bullets: ["Beginners welcome", "Children’s and women’s classes", "Leamington Spa"],
      },
      ads: {
        offer: "A campaign kit built around one clear invitation: book a trial at Sweeney’s in Leamington Spa.",
        creatives: [
  {
    "title": "Children’s confidence",
    "format": "Facebook & Instagram · Image concepts",
    "audience": "For parents looking for a welcoming first class for their child.",
    "headline": "Confidence starts here.",
    "cta": "Book a trial",
    "primaryText": "Looking for children’s martial arts in Leamington Spa? Meet the team at Sweeney’s, experience a class and see how it feels for your child. Not sure where to start? Ask us to help you find the right class.",
    "imageUrl": "/workspace/sweeneys/children-confidence.webp",
    "imageAlt": "Sweeney’s children’s martial arts creative: Confidence starts here. Book a trial."
  },
  {
    "title": "Strong foundations",
    "format": "Facebook & Instagram · Image concepts",
    "audience": "For parents looking for a welcoming first class for their child.",
    "headline": "Small steps. Strong foundations.",
    "cta": "Book a trial",
    "primaryText": "Looking for children’s martial arts in Leamington Spa? Meet the team at Sweeney’s, experience a class and see how it feels for your child. Not sure where to start? Ask us to help you find the right class.",
    "imageUrl": "/workspace/sweeneys/children-foundations.webp",
    "imageAlt": "Children’s martial arts creative: Small steps. Strong foundations."
  },
  {
    "title": "First day",
    "format": "Facebook & Instagram · Image concepts",
    "audience": "For parents looking for a welcoming first class for their child.",
    "headline": "Every black belt had a first day.",
    "cta": "Book a trial",
    "primaryText": "Looking for children’s martial arts in Leamington Spa? Meet the team at Sweeney’s, experience a class and see how it feels for your child. Not sure where to start? Ask us to help you find the right class.",
    "imageUrl": "/workspace/sweeneys/children-first-day.webp",
    "imageAlt": "Children’s martial arts creative: Every black belt had a first day."
  },
  {
    "title": "After school",
    "format": "Facebook & Instagram · Image concepts",
    "audience": "For parents looking for a welcoming first class for their child.",
    "headline": "The after-school activity they look forward to.",
    "cta": "Book a trial",
    "primaryText": "Looking for children’s martial arts in Leamington Spa? Meet the team at Sweeney’s, experience a class and see how it feels for your child. Not sure where to start? Ask us to help you find the right class.",
    "imageUrl": "/workspace/sweeneys/children-after-school.webp",
    "imageAlt": "Children’s martial arts creative: The after-school activity they look forward to."
  },
  {
    "title": "Women’s strength",
    "format": "Facebook & Instagram · Image concepts",
    "audience": "For women making time to try martial arts locally.",
    "headline": "Make time for your strength.",
    "cta": "Book a trial",
    "primaryText": "Make time for yourself with women’s martial arts at Sweeney’s in Leamington Spa. A trial is a chance to meet the team, experience the training and see how it feels. Get in touch and we’ll help you find your starting point.",
    "imageUrl": "/workspace/sweeneys/women-strength.webp",
    "imageAlt": "Sweeney’s women’s martial arts creative: Make time for your strength."
  },
  {
    "title": "Showing up",
    "format": "Facebook & Instagram · Image concepts",
    "audience": "For women making time to try martial arts locally.",
    "headline": "Strong starts with showing up.",
    "cta": "Book a trial",
    "primaryText": "Make time for yourself with women’s martial arts at Sweeney’s in Leamington Spa. A trial is a chance to meet the team, experience the training and see how it feels. Get in touch and we’ll help you find your starting point.",
    "imageUrl": "/workspace/sweeneys/women-showing-up.webp",
    "imageAlt": "Women’s martial arts creative: Strong starts with showing up."
  },
  {
    "title": "Explore martial arts",
    "format": "Facebook & Instagram · Image concepts",
    "audience": "For women making time to try martial arts locally.",
    "headline": "Make time for your strength.",
    "cta": "Book a trial",
    "primaryText": "Make time for yourself with women’s martial arts at Sweeney’s in Leamington Spa. A trial is a chance to meet the team, experience the training and see how it feels. Get in touch and we’ll help you find your starting point.",
    "imageUrl": "/workspace/sweeneys/women-explore.webp",
    "imageAlt": "Women’s martial arts creative: Make time for your strength. Explore women’s martial arts."
  }
],
      },
      followUp: {
        emails: [
          {
                    "name": "Thanks for your enquiry",
                    "subject": "Your trial at Sweeney’s",
                    "timing": "Immediately after an enquiry",
                    "purpose": "A friendly confirmation and a simple next step.",
                    "phase": "enquiry",
                    "body": "Hi [First name],\n\nThanks for getting in touch with Sweeney’s.\n\nA trial class is a chance to meet the team, experience the training and see how it feels, for you or your child.\n\n**Book a trial → [booking link]**\n\nNot sure which class to choose? Reply with who the trial is for and their age, and we’ll help you find the right starting point.\n\nThe Sweeney’s team"
          },
          {
                    "name": "Help them book",
                    "subject": "Questions about your first class?",
                    "timing": "2 days later, if unbooked",
                    "purpose": "Answer the questions that can hold a first booking back.",
                    "phase": "enquiry",
                    "body": "Hi [First name],\n\nTrying something new can come with a few questions.\n\nWhich class is right? What happens in the first session? What should you bring?\n\nJust reply, we’re happy to help. If you’re ready to give it a try, you can choose your trial below.\n\n**Book a trial → [booking link]**\n\nWe look forward to welcoming you.\n\nThe Sweeney’s team"
          },
          {
                    "name": "Close the loop",
                    "subject": "We’ll leave it with you",
                    "timing": "5 days later, if still unbooked",
                    "purpose": "A final check-in that leaves the door open.",
                    "phase": "enquiry",
                    "body": "Hi [First name],\n\nA final message in case your enquiry got buried in a busy week.\n\nIf you’re still interested in training at Sweeney’s, you can choose a trial here:\n\n**Book a trial → [booking link]**\n\nIf now isn’t the right time, no problem. Get in touch whenever you’re ready.\n\nThe Sweeney’s team"
          },
          {
                    "name": "Confirm their trial",
                    "subject": "Your Sweeney’s trial is confirmed",
                    "timing": "When a trial is booked",
                    "purpose": "Class, time, location and arrival details in one place.",
                    "phase": "booking",
                    "body": "Hi [First name],\n\nWe’re looking forward to welcoming [participant name] to Sweeney’s.\n\nYour trial is confirmed:\n\n**Class:** [class name]  \n**When:** [date and time]  \n**Where:** [academy address]\n\n**What to wear and bring:** [class-specific instructions]  \n**When you arrive:** [arrival instructions]\n\nQuestions before the session? Just reply here.\n\n**Manage your booking → [manage booking link]**\n\nSee you on the mat!\n\nThe Sweeney’s team"
          },
          {
                    "name": "Send a reminder",
                    "subject": "Your trial is tomorrow",
                    "timing": "The day before their trial",
                    "purpose": "A useful reminder with a route to change the booking.",
                    "phase": "booking",
                    "body": "Hi [First name],\n\nA quick reminder that [participant name]’s trial is tomorrow.\n\n**[Class name] · [time]**  \n[Academy address]\n\nPlease remember: [what to wear and bring].\n\nWhen you arrive, [check-in instructions].\n\nHave a question? Reply here. Need another date? You can change your booking below.\n\n**Manage your booking → [manage booking link]**\n\nWe’re looking forward to meeting you.\n\nThe Sweeney’s team"
          }
],
        stopRules: [
          "Enquiry follow-ups pause as soon as someone books, replies or asks not to be contacted.",
          "Booking confirmation and the pre-class reminder belong to the booked-trial journey. They do not restart the enquiry sequence.",
          "Cancelled or rescheduled trials must update reminders. Class details and booking links are filled from the confirmed booking before anything sends.",
        ],
      },
      tracking: {
        metrics: [
          { key: "enquiries", label: "Trial enquiries", description: "People asking about a first class.", source: "Website forms + ad enquiries", connected: false },
          { key: "attended", label: "Trials attended", description: "Confirmed attendance at the academy.", source: "Sweeney’s attendance confirmation", connected: false },
          { key: "quotes", label: "Membership offers", description: "Membership options shared after a trial.", source: "Sweeney’s team", connected: false },
          { key: "customers", label: "New members", description: "People who join after their trial.", source: "Sweeney’s membership records", connected: false },
        ],
        journey: [
          { stage: "New enquiry", detail: "Source and class interest", owner: "Captured automatically", note: "From your website and ads once connected." },
          { stage: "Trial booked", detail: "Confirmed class, participant and time", owner: "Booking system", note: "Updated when a trial is confirmed." },
          { stage: "Trial attended", detail: "A record that the class took place", owner: "Sweeney’s team", note: "Attendance confirmed by your team." },
          { stage: "Membership offered", detail: "The membership options shared", owner: "Sweeney’s team", note: "Recorded after the trial conversation." },
          { stage: "Member joined", detail: "A confirmed new membership", owner: "Sweeney’s team", note: "Updated from your membership records." },
        ],
        costMetrics: ["Cost per enquiry", "Cost per attended trial", "Cost per new member"],
        attendanceNote: "Attendance and membership are confirmed by your team or connected records. A booking alone never counts as an attended trial or a new member.",
      },
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
  "rsp-services-plumbing-heating": {
    review: {
      headline: "A proper first website for RSP Services.",
      summary:
        "RSP Services covers plumbing, heating, bathrooms and tiling — but right now all of that lives on a Facebook page. Your new homepage gives each service its own clear space, shows the kind of work you take on, and gives customers a direct way to request a quote.",
      rebuildReasons: [
        {
          title: "Everything rides on Facebook",
          strength:
            "RSP Services already does the work — plumbing, heating, bathrooms and tiling — and the Facebook page shows a real trading business.",
          gap: "Facebook is the whole presence. Customers who search Google for a local plumber never find it, and the page can't be organised around the services people actually want.",
        },
        {
          title: "No way to ask for a quote",
          strength:
            "The trade covers the jobs homeowners most need a reliable name for — boilers, bathrooms, repairs.",
          gap: "There's no quote or enquiry route at all, so anyone interested has to message a social post and hope it's seen.",
        },
        {
          title: "Proof that can't be shown properly",
          strength:
            "The work — bathrooms, tiling, boiler installs — photographs well and sells itself when shown properly.",
          gap: "A Facebook feed can't present finished projects as a portfolio, so the quality of the work stays invisible to new customers.",
        },
      ],
      observations: [
        {
          title: "Services laid out plainly",
          explanation:
            "Plumbing & heating, bathroom installations and tiling each get a named card with real imagery, so a visitor sees the job they need without digging.",
        },
        {
          title: "Work shown like work",
          explanation:
            "A gallery section presents project photography the way a portfolio should — clearly labelled as illustrative until your own project photos replace it.",
        },
        {
          title: "A direct request-a-quote route",
          explanation:
            "The quote form runs through the header, hero and footer, so asking for a price takes seconds instead of a Facebook message.",
        },
      ],
    },
    website: {
      previewUrl: "https://sortmydigital.site/preview/rsp-services-plumbing-heating/",
      previewImageUrl: "/rsp-services-homepage-preview.webp",
      status: "review",
    },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more customers", description: "Reaching homeowners searching Google for a local plumber or bathroom fitter" },
        { id: "convert", title: "Convert more enquiries", description: "A first real website that turns interest into quote requests" },
        { id: "follow-up", title: "Improve follow-up", description: "Confirmations and reminders so no enquiry gets missed" },
        { id: "tracking", title: "Understand what's working", description: "See quote requests, booked visits and jobs won" },
      ],
      offerCard: {
        title: "Request a free quote",
        description:
          "Tell RSP Services what needs doing — bathroom, boiler, plumbing or tiling — and get a clear, no-obligation quote.",
        bullets: ["Plumbing, heating, bathrooms & tiling", "Free, no-obligation quote", "A real first website, not just Facebook"],
      },
      ads: {
        offer:
          "A campaign kit built around one clear action: request a free quote from RSP Services.",
        creatives: [
          {
            title: "A bathroom worth showing",
            format: "Facebook & Instagram feed · 1x1",
            audience: "Homeowners considering a bathroom upgrade.",
            headline: "Better bathrooms, done properly",
            cta: "Request a free quote",
            primaryText:
              "Planning a new bathroom? RSP Services handles plumbing, heating, bathrooms and tiling. Request a free, no-obligation quote to talk through your project.",
            imageUrl: "/workspace/rsp-services/ad-01.webp",
            imageAlt: "RSP Services creative: bathroom renovation preview image.",
          },
          {
            title: "Reliable heating",
            format: "Facebook & Instagram feed · 1x1",
            audience: "Homeowners needing boiler or heating work.",
            headline: "Reliable heating. Sorted.",
            cta: "Request a free quote",
            primaryText:
              "Boiler replacement or heating upgrade on the list? Talk to RSP Services — your local plumbing and heating specialist. Request a free quote.",
            imageUrl: "/workspace/rsp-services/ad-02.webp",
            imageAlt: "RSP Services creative: boiler installation preview image.",
          },
          {
            title: "A home that works",
            format: "Facebook & Instagram feed · 1x1",
            audience: "Local homeowners with plumbing or repair jobs.",
            headline: "A home that works",
            cta: "Request a free quote",
            primaryText:
              "From leaks to full bathroom renovations, RSP Services covers plumbing, heating and tiling. Request a free, no-obligation quote.",
            imageUrl: "/workspace/rsp-services/ad-03.webp",
            imageAlt: "RSP Services creative: bathroom and tiling preview image.",
          },
        ],
      },
      tracking: {
        metrics: [
          { key: "enquiries", label: "Quote requests", description: "People asking RSP for a quote.", source: "Website quote form + ad enquiries", connected: false },
          { key: "attended", label: "Site visits attended", description: "Visits that took place, confirmed by the team.", source: "RSP attendance confirmation", connected: false },
          { key: "quotes", label: "Quotes sent", description: "Quotes shared after an enquiry.", source: "RSP records", connected: false },
          { key: "customers", label: "Jobs won", description: "Confirmed jobs from those enquiries.", source: "RSP records", connected: false },
        ],
      },
    },
  },
  "gdc-plumbing-and-gas-ltd": {
    review: {
      headline: "A proper local trade business, shown like one.",
      summary:
        "GDC Plumbing and Gas already has the trust — a 5.0 rating across 103 Google reviews and Gas Safe registered engineers covering Rugby. The current site is template-era: a van photo with no headline, no reviews on show and no way to request a booking. The new homepage puts the credibility and the booking action up front.",
      rebuildReasons: [
        {
          title: "Reputation that never reaches the page",
          strength:
            "A 5.0 rating across 103 Google reviews and Gas Safe registered gas work — the proof customers look for already exists.",
          gap:
            "None of it appeared on the old site: no testimonials, no accreditations, no reason to choose GDC over the next result.",
        },
        {
          title: "A hero with no next step",
          strength:
            "The branding and van photography are professional and recognisable around Rugby.",
          gap:
            "The old homepage opened on an image with no headline or call to action — visitors had to work out what to do themselves.",
        },
        {
          title: "No booking pathway",
          strength:
            "People with boiler breakdowns and urgent repairs want a fast, obvious way to get help.",
          gap:
            "Only a phone number was offered — no booking request, no service detail and a layout that struggled on mobile.",
        },
      ],
      observations: [
        {
          title: "Trust in the first five seconds",
          explanation:
            "The hero leads with the GDC van and a clear promise — 'Plumbing problems? Let's get it sorted.' — with Gas Safe registration, insurance and domestic & commercial cover directly beneath.",
        },
        {
          title: "Services people actually search for",
          explanation:
            "Boilers & heating, plumbing & repairs and gas services each get a clear card, so visitors can see at a glance that GDC handles their job.",
        },
        {
          title: "One obvious next step",
          explanation:
            "Request a booking and call now appear in the header, hero, urgent repair band and contact section — plus a booking request form for people who'd rather not phone.",
        },
      ],
    },
    website: {
      previewUrl: "https://sortmydigital.site/preview/gdc-plumbing-and-gas-ltd/",
      previewImageUrl: "/gdc-plumbing-and-gas-homepage-preview.webp",
      status: "review",
    },
    offer: { ...WORKSPACE_DEFAULTS.offer },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more customers", description: "Reaching homeowners and businesses in Rugby and surrounding areas" },
        { id: "convert", title: "Convert more enquiries", description: "A site that turns urgent plumbing, heating and gas searches into booking requests and calls" },
        { id: "follow-up", title: "Improve follow-up", description: "Confirmations, reminders and gentle nudges that run themselves" },
        { id: "tracking", title: "Understand what's working", description: "See booking requests, calls and jobs won" },
      ],
      offerCard: {
        title: "Free, no-obligation estimate",
        description: "A free estimate on plumbing, heating or gas work — the natural first step before booking a job.",
        bullets: ["No obligation", "Rugby & surrounding areas", "07964 840 635"],
      },
      tracking: {
        metrics: [
          { key: "enquiries", label: "Booking requests", description: "People who request a booking or call.", source: "Website form + phone calls", connected: false },
          { key: "attended", label: "Attended jobs", description: "Site visits that took place, confirmed by GDC.", source: "GDC's records", connected: false },
          { key: "quotes", label: "Quotes sent", description: "Estimates shared after a conversation.", source: "GDC's records", connected: false },
          { key: "customers", label: "Jobs won", description: "Confirmed work from those enquiries.", source: "GDC's records", connected: false },
        ],
      },
    },
  },
  "spa-plumbing": {
    review: {
      headline: "Forty years of boiler work, finally shown properly.",
      summary:
        "Spa Plumbing has been keeping Leamington Spa homes warm since 1982 — Worcester Bosch repairs, servicing and installations, Gas Safe registered. That history deserved a proper modern site, so we built one: clear services, the coverage you actually serve and a direct way to request a callback.",
      revealTitle: "We built your site.",
      revealBody:
        "A working homepage for Spa Plumbing — not a template, but a site built around your name, your services and your patch.",
      reasonsHeading: "Why we built it",
      gapColumnLabel: "Before the site",
      rebuildReasons: [
        {
          title: "A reputation that predates the internet",
          strength:
            "Established in 1982 and still trading — a depth of local experience most competitors cannot claim.",
          gap:
            "Decades of trust live in word of mouth. People searching for boiler help in Leamington Spa had nothing that showed it.",
        },
        {
          title: "Genuine specialism, unseen",
          strength:
            "Worcester Bosch boiler specialists with Gas Safe registration — exactly what homeowners with a boiler problem look for.",
          gap:
            "Without a site, that expertise had nowhere to be presented. A searcher could not tell a specialist from any other plumber.",
        },
        {
          title: "Coverage people could not check",
          strength:
            "The team already works across Leamington, Warwick, Kenilworth, Whitnash, Southam and the surrounding villages.",
          gap:
            "Anyone wondering whether you cover their town had to call first. One more question between them and the work.",
        },
      ],
      observations: [
        {
          title: "Experience leads the page",
          explanation:
            "The homepage opens on the engineers and the promise — A warmer home. In experienced hands. — with the 1982 heritage right behind it.",
        },
        {
          title: "Three services, three clear cards",
          explanation:
            "Boiler repairs, servicing and new boilers each get their own card and route, so a visitor finds their job in seconds.",
        },
        {
          title: "An obvious way back to a human",
          explanation:
            "Call or request a callback appears in the header, hero and contact section — the next step is always one tap away.",
        },
      ],
    },
    website: {
      previewUrl: "https://sortmydigital.site/preview/spa-plumbing/",
      previewImageUrl: "/spa-plumbing-homepage-preview.webp",
      offerPage: {
        label: "Callback page",
        description:
          "A focused request-a-callback page for homeowners who would rather be phoned than call themselves. Planned, not yet built — the homepage contact section covers this today.",
      },
      status: "review",
    },
    offer: { ...WORKSPACE_DEFAULTS.offer },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more customers", description: "Reaching homeowners across Leamington Spa and Warwickshire searching for boiler help" },
        { id: "convert", title: "Convert more enquiries", description: "A site that turns boiler breakdowns and service searches into calls and callbacks" },
        { id: "follow-up", title: "Improve follow-up", description: "Confirmations and reminders so no callback request goes cold" },
        { id: "tracking", title: "Understand what's working", description: "See callback requests, confirmed visits and jobs won" },
      ],
      offerCard: {
        title: "Request a callback",
        description:
          "A free, no-obligation callback on any boiler work — repairs, annual servicing or a new installation.",
        bullets: ["No obligation", "Leamington Spa & Warwickshire", "Established 1982 · Gas Safe registered"],
      },
      ads: {
        offer:
          "A campaign kit built around one clear action: request a callback from a Gas Safe boiler specialist.",
        // No ad artwork supplied for this client yet — honest proposed state.
        creatives: [],
      },
      tracking: {
        metrics: [
          { key: "enquiries", label: "Callback requests", description: "People asking Spa Plumbing to call them back.", source: "Website callback form + phone calls", connected: false },
          { key: "attended", label: "Visits attended", description: "Booked visits that took place, confirmed by the team.", source: "Spa Plumbing's records", connected: false },
          { key: "quotes", label: "Quotes sent", description: "Prices shared after an enquiry or visit.", source: "Spa Plumbing's records", connected: false },
          { key: "customers", label: "Jobs won", description: "Confirmed work from those enquiries.", source: "Spa Plumbing's records", connected: false },
        ],
      },
    },
  },
  "accounts-tax-management-ltd": {
    review: {
      headline: "A clearer accountancy offer is being prepared.",
      summary:
        "Accounts & Tax Management already has the substance clients look for — accounting, tax and payroll support from an established Warwickshire firm. The current website makes that harder to see than it should, so this workspace is ready while the new homepage direction is prepared.",
      revealTitle: "Your workspace is ready.",
      revealBody:
        "The acquisition workspace is configured. A new homepage preview has not been supplied yet, so the website screen will show its unavailable state until a real build is added.",
      rebuildReasons: [
        {
          title: "Useful services, little distinction",
          strength:
            "Accounting, tax and payroll support cover the recurring needs small businesses bring to an accountant.",
          gap: "The current site says the firm is reliable and trustworthy, but gives visitors little proof or positioning that separates it from every other local practice.",
        },
        {
          title: "Professional trust, thinly shown",
          strength:
            "An established practice has real experience clients could recognise and trust.",
          gap: "There are no prominent testimonials, case studies, team detail or client outcomes to make that experience feel concrete before a consultation.",
        },
        {
          title: "Consultation interest, no clear journey",
          strength:
            "Business owners comparing accountants need an easy first step into a conversation.",
          gap: "The current navigation and calls to action do not guide someone toward a clear consultation offer or explain what happens next.",
        },
      ],
      observations: [
        {
          title: "Lead with client confidence",
          explanation:
            "The new direction should show who the firm helps, the outcomes clients care about and why this practice is worth a conversation.",
        },
        {
          title: "Make services easier to choose",
          explanation:
            "Accounting, tax and payroll support need clear descriptions written around the client's problem, not just service labels.",
        },
        {
          title: "Keep the next step obvious",
          explanation:
            "A consultation offer should stay visible from the first screen through to the closing section, so interest has somewhere to go.",
        },
      ],
    },
    website: {
      status: "preview",
      offerPage: {
        label: "Consultation page",
        description:
          "A focused free-consultation page is planned as the destination for advertising and referral traffic. It has not been built yet; the website preview remains unavailable until a real page is supplied.",
      },
    },
    offer: { ...WORKSPACE_DEFAULTS.offer },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more clients", description: "Reaching small business owners in Warwickshire who need accounting, tax or payroll support" },
        { id: "convert", title: "Convert more enquiries", description: "A clearer accountancy offer that turns research into consultation requests" },
        { id: "follow-up", title: "Improve follow-up", description: "Confirmations and reminders so consultation requests do not go cold" },
        { id: "tracking", title: "Understand what's working", description: "See enquiries, consultations, proposals and clients won" },
      ],
      offerCard: {
        title: "Book a consultation",
        description:
          "A straightforward first conversation for business owners who want practical help with accounts, tax or payroll.",
        bullets: ["Accounting, tax & payroll", "Warwickshire practice", "A consultation is a conversation, not a commitment"],
      },
      ads: {
        offer:
          "A campaign kit built around one clear action: book a consultation with Accounts & Tax Management.",
        creatives: [],
      },
      tracking: {
        metrics: [
          { key: "enquiries", label: "Consultation requests", description: "People asking to arrange a conversation.", source: "Website form + phone calls", connected: false },
          { key: "attended", label: "Consultations attended", description: "Meetings that took place, confirmed by the team.", source: "Accounts & Tax Management records", connected: false },
          { key: "quotes", label: "Proposals sent", description: "Service proposals shared after a conversation.", source: "Accounts & Tax Management records", connected: false },
          { key: "customers", label: "Clients won", description: "Confirmed new client engagements.", source: "Accounts & Tax Management records", connected: false },
        ],
        journey: [
          { stage: "New enquiry", detail: "Service needed and source", owner: "Captured automatically", note: "From your website and ads once connected." },
          { stage: "Consultation arranged", detail: "Agreed time and format", owner: "Your team", note: "Recorded when the consultation is confirmed." },
          { stage: "Consultation attended", detail: "A record that it took place", owner: "Your team", note: "Confirmed attendance, never assumed." },
          { stage: "Proposal sent", detail: "Recommended support shared", owner: "Your team", note: "Updated when the proposal goes out." },
          { stage: "Client won", detail: "New engagement confirmed", owner: "Your team", note: "Updated from your client records." },
        ],
        costMetrics: ["Cost per enquiry", "Cost per attended consultation", "Cost per client won"],
      },
    },
  },
  "joshi-accounting-services": {
    review: {
      headline: "A calmer, more personal Joshi Accounting.",
      summary:
        "Joshi Accounting already has a clear position: big enough to cope, small enough to care. The new homepage gives that promise a more polished, local presentation, with practical services, a simple process and a direct route into a conversation.",
      rebuildReasons: [
        {
          title: "A personal firm behind generic presentation",
          strength:
            "Established in 2008, based in Rugby and supporting UK small businesses — a credible local practice with a human offer.",
          gap: "The old site relied on generic stock imagery and accountancy language, so visitors could not see who they would actually work with or why Joshi was different.",
        },
        {
          title: "Practical help that was hard to choose",
          strength:
            "Accounting, tax, payroll, bookkeeping, management accounts and business support cover the jobs small firms need most.",
          gap: "The services were not presented as clear choices, so a visitor had to work out which conversation to start.",
        },
        {
          title: "No easy first conversation",
          strength:
            "Small business owners often need reassurance before they switch accountant or ask for help.",
          gap: "The old site did not make the first step feel simple, personal or obviously local.",
        },
      ],
      observations: [
        {
          title: "A warmer first impression",
          explanation:
            "The homepage leads with 'Your business. Our expertise. Less to worry about.' and a calmer visual direction that feels more like a real advisory practice.",
        },
        {
          title: "Six services, plainly organised",
          explanation:
            "Core support is laid out as recognisable choices, so owners can see the kind of help they need without decoding accountancy language.",
        },
        {
          title: "A direct conversation route",
          explanation:
            "The primary action stays focused on starting a conversation, with Joshi's Rugby base and phone number supporting the local trust signal.",
        },
      ],
    },
    website: {
      previewUrl: "https://sortmydigital.site/preview/joshi-accounting-services/",
      previewImageUrl: "/joshi-accounting-homepage-preview.webp",
      status: "review",
    },
    offer: { ...WORKSPACE_DEFAULTS.offer },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more clients", description: "Reaching small business owners in Rugby and across the UK" },
        { id: "convert", title: "Convert more enquiries", description: "A clearer accountancy offer that turns research into conversations" },
        { id: "follow-up", title: "Improve follow-up", description: "Confirmations and reminders so enquiries do not go cold" },
        { id: "tracking", title: "Understand what's working", description: "See enquiries, consultations, proposals and clients won" },
      ],
      offerCard: {
        title: "Talk about your business",
        description:
          "A practical first conversation for owners who want clearer accounting, tax or payroll support.",
        bullets: ["Established 2008", "Rugby-based · UK small businesses", "01788 312272"],
      },
      ads: {
        offer:
          "A campaign kit built around one clear action: start a conversation with Joshi Accounting Services.",
        creatives: [],
      },
      tracking: {
        metrics: [
          { key: "enquiries", label: "Conversation requests", description: "People asking to talk about their business.", source: "Website contact routes + phone calls", connected: false },
          { key: "attended", label: "Conversations attended", description: "Meetings that took place, confirmed by the team.", source: "Joshi records", connected: false },
          { key: "quotes", label: "Proposals sent", description: "Service proposals shared after a conversation.", source: "Joshi records", connected: false },
          { key: "customers", label: "Clients won", description: "Confirmed new client engagements.", source: "Joshi records", connected: false },
        ],
        journey: [
          { stage: "New enquiry", detail: "Service needed and source", owner: "Captured automatically", note: "From your website and ads once connected." },
          { stage: "Conversation arranged", detail: "Agreed time and format", owner: "Joshi team", note: "Recorded when the discussion is confirmed." },
          { stage: "Conversation attended", detail: "A record that it took place", owner: "Joshi team", note: "Confirmed attendance, never assumed." },
          { stage: "Proposal sent", detail: "Recommended support shared", owner: "Joshi team", note: "Updated when the proposal goes out." },
          { stage: "Client won", detail: "New engagement confirmed", owner: "Joshi team", note: "Updated from client records." },
        ],
        costMetrics: ["Cost per enquiry", "Cost per attended conversation", "Cost per client won"],
      },
    },
  },
  "diligent-electrical-contractors": {
    review: {
      headline: "A clearer, more trustworthy Diligent Electrical.",
      summary:
        "Diligent already presents itself as a NICEIC-approved London contractor. The new homepage turns that claim into a clearer customer experience: recognisable services, a stronger trust section, London coverage and one obvious quote action.",
      rebuildReasons: [
        {
          title: "Trust claimed but not shown",
          strength:
            "NICEIC approval and a 5.0 Google rating across 61 reviews are strong reasons to call.",
          gap: "The old site led with generic trust language and scattered calls to action, so the proof did not carry a visitor toward an enquiry.",
        },
        {
          title: "Services without a clear choice",
          strength:
            "Installations, repairs, testing and lighting cover the electrical jobs London homes and businesses need.",
          gap: "The old layout interrupted the reading flow with a dated sidebar and generic content, making the useful service range harder to scan.",
        },
        {
          title: "A quote process with too much work",
          strength:
            "People planning electrical work want a clear way to ask for a price and understand what happens next.",
          gap: "Calls to action competed rather than forming one simple route, leaving the visitor to decide how to proceed.",
        },
      ],
      observations: [
        {
          title: "A stronger opening promise",
          explanation:
            "'Good work. Safe homes. Reliable power.' gives the page a simple, concrete message before the visitor reaches the details.",
        },
        {
          title: "The jobs people recognise",
          explanation:
            "Installations, repairs, testing and lighting are presented as clear service cards for homeowners and businesses.",
        },
        {
          title: "London trust and coverage",
          explanation:
            "The reassurance strip, review area and coverage section make the business feel established and local before the closing quote action.",
        },
      ],
    },
    website: {
      previewUrl: "https://sortmydigital.site/preview/diligent-electrical-contractors/",
      previewImageUrl: "/diligent-electrical-homepage-preview.webp",
      status: "review",
    },
    offer: { ...WORKSPACE_DEFAULTS.offer },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more customers", description: "Reaching London homeowners and businesses planning electrical work" },
        { id: "convert", title: "Convert more enquiries", description: "A site that turns service searches into quote requests and calls" },
        { id: "follow-up", title: "Improve follow-up", description: "Confirmations and reminders so enquiries do not go cold" },
        { id: "tracking", title: "Understand what's working", description: "See quote requests, site visits, quotes and jobs won" },
      ],
      offerCard: {
        title: "Request a quote",
        description:
          "Tell Diligent about the electrical work you need and the team can talk through the job and next step.",
        bullets: ["Installations, repairs, testing & lighting", "London homes and businesses", "NICEIC-approved contractor"],
      },
      ads: {
        offer:
          "A campaign kit built around one clear action: request a quote from Diligent Electrical Contractors.",
        creatives: [],
      },
      tracking: {
        metrics: [
          { key: "enquiries", label: "Quote requests", description: "People asking Diligent for a quote.", source: "Website quote routes + phone calls", connected: false },
          { key: "attended", label: "Site visits attended", description: "Visits that took place, confirmed by the team.", source: "Diligent records", connected: false },
          { key: "quotes", label: "Quotes sent", description: "Prices shared after a visit or conversation.", source: "Diligent records", connected: false },
          { key: "customers", label: "Jobs won", description: "Confirmed work from those enquiries.", source: "Diligent records", connected: false },
        ],
        journey: [
          { stage: "New enquiry", detail: "Work needed and source", owner: "Captured automatically", note: "From your website and ads once connected." },
          { stage: "Visit arranged", detail: "Agreed time and scope", owner: "Diligent team", note: "Recorded when the visit is confirmed." },
          { stage: "Visit attended", detail: "A record that it took place", owner: "Diligent team", note: "Confirmed attendance, never assumed." },
          { stage: "Quote sent", detail: "Price proposed for the work", owner: "Diligent team", note: "Updated when the quote goes out." },
          { stage: "Job won", detail: "Work accepted and scheduled", owner: "Diligent team", note: "Updated from job records." },
        ],
        costMetrics: ["Cost per enquiry", "Cost per attended visit", "Cost per job won"],
      },
    },
  },
  "p-s-c-electrical-london-ltd": {
    review: {
      headline: "A stronger PSC Electrical, built on twenty-two years of trust.",
      summary:
        "PSC already has the substance — a long-running Croydon business, hundreds of reviews and a clear domestic and commercial offer. The new homepage gives that credibility a cleaner presentation, with recognisable services, work examples and a simple quote action.",
      rebuildReasons: [
        {
          title: "A proven business looking cheaper than it is",
          strength:
            "More than two decades trading and a 4.7 rating across 133 Google reviews give PSC real credibility.",
          gap: "The old site's dated template, cluttered header and copy inconsistencies undercut the confidence customers already have in the work.",
        },
        {
          title: "Real services behind a generic grid",
          strength:
            "Domestic repairs, installations, upgrades and commercial electrical work cover the jobs local customers actually search for.",
          gap: "The services were shown as a generic icon grid, with little sense of workmanship, scale or the right next step.",
        },
        {
          title: "A good quote idea, hard to trust",
          strength:
            "The postcode quote concept suits a local electrical business and keeps the next step practical.",
          gap: "The surrounding page made visitors work through clutter, while typos and mixed branding chipped away at trust.",
        },
      ],
      observations: [
        {
          title: "Local and established from the start",
          explanation:
            "The homepage names Croydon and South East London and presents PSC as a local team customers can trust.",
        },
        {
          title: "Services customers can recognise",
          explanation:
            "Six service cards organise the domestic and commercial work into clear routes, so a visitor can find their job quickly.",
        },
        {
          title: "One clear quote action",
          explanation:
            "Request a quote appears consistently and opens a simple call-focused dialog, matching how this business actually takes enquiries.",
        },
      ],
    },
    website: {
      previewUrl: "https://sortmydigital.site/preview/p-s-c-electrical-london-ltd/",
      previewImageUrl: "/psc-electrical-homepage-preview.webp",
      status: "review",
    },
    offer: { ...WORKSPACE_DEFAULTS.offer },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more customers", description: "Reaching homeowners, landlords and businesses across Croydon and South East London" },
        { id: "convert", title: "Convert more enquiries", description: "A site that turns electrical searches into quote requests and calls" },
        { id: "follow-up", title: "Improve follow-up", description: "Confirmations and reminders so enquiries do not go cold" },
        { id: "tracking", title: "Understand what's working", description: "See quote requests, site visits, quotes and jobs won" },
      ],
      offerCard: {
        title: "Request a quote",
        description:
          "Tell PSC about the electrical work you need and the team can talk through the job and next step.",
        bullets: ["Domestic & commercial electrical work", "Croydon & South East London", "0203 857 4796"],
      },
      ads: {
        offer:
          "A campaign kit built around one clear action: request a quote from PSC Electrical.",
        creatives: [],
      },
      tracking: {
        metrics: [
          { key: "enquiries", label: "Quote requests", description: "People asking PSC for a quote.", source: "Website quote action + phone calls", connected: false },
          { key: "attended", label: "Site visits attended", description: "Visits that took place, confirmed by the team.", source: "PSC records", connected: false },
          { key: "quotes", label: "Quotes sent", description: "Prices shared after a visit or conversation.", source: "PSC records", connected: false },
          { key: "customers", label: "Jobs won", description: "Confirmed work from those enquiries.", source: "PSC records", connected: false },
        ],
        journey: [
          { stage: "New enquiry", detail: "Work needed and source", owner: "Captured automatically", note: "From your website and ads once connected." },
          { stage: "Visit arranged", detail: "Agreed time and scope", owner: "PSC team", note: "Recorded when the visit is confirmed." },
          { stage: "Visit attended", detail: "A record that it took place", owner: "PSC team", note: "Confirmed attendance, never assumed." },
          { stage: "Quote sent", detail: "Price proposed for the work", owner: "PSC team", note: "Updated when the quote goes out." },
          { stage: "Job won", detail: "Work accepted and scheduled", owner: "PSC team", note: "Updated from job records." },
        ],
        costMetrics: ["Cost per enquiry", "Cost per attended visit", "Cost per job won"],
      },
    },
  },
  "gems-accounting-services": {
    review: {
      headline: "Accountancy people actually want to talk to.",
      summary:
        "Gems Accounting Services already has the personal, practical approach clients value — a named Kenilworth team covering accounts, tax, VAT, payroll and company secretarial work. The new site leads with that warmth and gives self-employed visitors and growing businesses one clear way to start a conversation.",
      rebuildReasons: [
        {
          title: "A real team behind a thin web presence",
          strength:
            "Five named team members — Karen, Gemma, Tammy, Tammy and Sophie — with broad small-business cover.",
          gap: "The existing presence gave visitors little sense of who they'd be dealing with or what Gems actually handles.",
        },
        {
          title: "A full service list worth scanning",
          strength:
            "Accounts & bookkeeping, personal & business tax, VAT, payroll & CIS, management accounts and company secretarial — most of what a self-employed person or growing company needs in one place.",
          gap: "The range wasn't presented as recognisable choices, so a visitor couldn't quickly confirm Gems covered their situation.",
        },
        {
          title: "Interest without an obvious first step",
          strength:
            "People who need an accountant usually want a conversation, not a commitment.",
          gap: "With no clear enquiry route, visitors had to phone at office hours or leave without making contact.",
        },
      ],
      observations: [
        {
          title: "A human first impression",
          explanation:
            "The hero leads with real people and 'More clarity. Less paperwork.' — the promise a busy business owner actually cares about, above the fold.",
        },
        {
          title: "Services at a glance",
          explanation:
            "Six clear service cards and an indigo ribbon of the core trio let a visitor confirm in seconds that Gems handles their job.",
        },
        {
          title: "One easy way to start",
          explanation:
            "Let's talk about your business appears in the header, hero and contact panel — an enquiry, not a commitment, answered by the Kenilworth team.",
        },
      ],
    },
    website: {
      previewImageUrl: "/workspace/gems-accounting-services/homepage-preview.webp",
      status: "review",
    },
    offer: {
      total: 3000,
      deposit: 1500,
      balance: 1500,
      stripePaymentUrl: "https://buy.stripe.com/28E7sKbyo1SZ3QOgn8dwc00",
      bankTransferEnabled: true,
    },
    links: {
      questionEmail: "info@gems-accounting.co.uk",
      phone: "+441926268330",
      phoneDisplay: "01926 268330",
    },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more clients", description: "Reaching self-employed people and growing businesses in Kenilworth and Warwickshire" },
        { id: "convert", title: "Convert more enquiries", description: "A site built around one action — starting a conversation with the Gems team" },
        { id: "follow-up", title: "Improve follow-up", description: "Enquiry confirmations, detail chasing and appointment reminders that run themselves" },
        { id: "tracking", title: "Understand what's working", description: "See enquiries, confirmed appointments, attended conversations and clients won" },
      ],
      offerCard: {
        title: "Let's talk about your business",
        description: "A free, no-obligation conversation with the Gems team about the accountancy support you need.",
        bullets: ["No obligation", "Kenilworth & Warwickshire", "01926 268330"],
      },
      ads: {
        offer:
          "A campaign kit built around one clear action: tell Gems Accounting Services what you need.",
        // Supplied creatives awaiting final ad approval — no destination URL bound yet.
        creatives: [
          {
            title: "More clarity. Less paperwork.",
            format: "Facebook & Instagram feed · 1x1",
            audience: "Self-employed people and growing small businesses in Kenilworth and Warwickshire.",
            headline: "More clarity. Less paperwork.",
            cta: "Let\u2019s talk about your business",
            primaryText: "Accountancy and bookkeeping support for the self-employed and growing businesses. Talk to Gems Accounting Services in Kenilworth about what you need.",
            imageUrl: "/workspace/gems-accounting-services/ad-01.webp",
            imageAlt: "Gems Accounting Services creative: Gems Accounting Services; KENILWORTH; More clarity.; Less paperwork.",
          },
          {
            title: "Good accountancy starts with a conversation.",
            format: "Facebook & Instagram feed · 1x1",
            audience: "Self-employed people and growing small businesses in Kenilworth and Warwickshire.",
            headline: "Good accountancy starts with a conversation.",
            cta: "Let\u2019s talk about your business",
            primaryText: "Not sure which accountancy support you need? Tell the Gems team about your business and talk through the services that fit.",
            imageUrl: "/workspace/gems-accounting-services/ad-02.webp",
            imageAlt: "Gems Accounting Services creative: Gems Accounting Services; ACCOUNTANTS IN KENILWORTH; Good accountancy starts with a conversation.; Tell us what you need.",
          },
        ],
      },
      followUp: {
        // Supplied draft sequence — staff-owned confirmations; nothing sends until connected.
        emails: [
          {
            name: "We\u2019ve received your enquiry",
            subject: "We\u2019ve received your enquiry",
            timing: "immediate",
            purpose: "Confirms the enquiry landed and sets expectations \u2014 no appointment is implied until staff confirm one.",
            body: "Hi {{ first_name }},\n\nThank you for contacting Gems Accounting Services about {{ requested_service }}. We\u2019ve received your enquiry.\n\nThe team will review what you need and reply to discuss the next step. If you\u2019ve asked for a meeting, a time has not yet been confirmed.\n\nIf there\u2019s anything you\u2019d like to add or correct, just reply to this email. Please don\u2019t email passwords, bank details or identity documents.\n\nKind regards,\nThe Gems team",
            phase: "enquiry",
          },
          {
            name: "A quick question about your enquiry",
            subject: "A quick question about your enquiry",
            timing: "next business day after request",
            purpose: "Chases one specific missing detail the customer owns, so staff can move the enquiry forward.",
            body: "Hi {{ first_name }},\n\nThank you for your enquiry about {{ requested_service }}. To take the next step, we just need {{ missing_detail }}.\n\nReply with that information and we can continue discussing the support you need. Please keep any sensitive financial information out of email; we can agree a secure way to share it if needed.\n\nIf your circumstances have changed, let us know.\n\nKind regards,\nThe Gems team",
            phase: "enquiry",
          },
          {
            name: "Would you still like help with your enquiry?",
            subject: "Would you still like help with your enquiry?",
            timing: "three business days after request",
            purpose: "A polite close that leaves the door open without chasing further.",
            body: "Hi {{ first_name }},\n\nWe\u2019re checking once more whether you\u2019d like to continue your enquiry about {{ requested_service }}. The next step is to reply with {{ missing_detail }}.\n\nIf now isn\u2019t the right time, that\u2019s fine\u2014reply and let us know. If you still need support, we\u2019ll be happy to pick up the conversation.\n\nWe won\u2019t keep sending reminders about this missing detail. This email does not cancel any existing appointment.\n\nKind regards,\nThe Gems team",
            phase: "enquiry",
          },
          {
            name: "Your appointment with Gems is confirmed",
            subject: "Your appointment with Gems is confirmed",
            timing: "on explicit confirmed appointment event",
            purpose: "Confirms an appointment only after staff have actually agreed a slot.",
            body: "Hi {{ first_name }},\n\nYour appointment with Gems Accounting Services is confirmed.\n\nService: {{ requested_service }}\nDate: {{ appointment_date }}\nTime: {{ appointment_time }} ({{ appointment_timezone }})\nWhere: {{ appointment_location }}\n\n{{ preparation_instructions }}\n\nUse the link below to view your appointment or request a change. If you need any help, reply to this email or call 01926 268330.\n\nWe look forward to speaking with you.\n\nKind regards,\nThe Gems team",
            phase: "booking",
          },
          {
            name: "A reminder of your appointment with Gems",
            subject: "A reminder of your appointment with Gems",
            timing: "24 hours before appointment",
            purpose: "Reminder 24 hours before a confirmed appointment.",
            body: "Hi {{ first_name }},\n\nA reminder of your appointment with Gems Accounting Services tomorrow.\n\nService: {{ requested_service }}\nDate: {{ appointment_date }}\nTime: {{ appointment_time }} ({{ appointment_timezone }})\nWhere: {{ appointment_location }}\n\n{{ preparation_instructions }}\n\nIf your plans have changed, use the link below to request a different time. You can also reply or call 01926 268330.\n\nKind regards,\nThe Gems team",
            phase: "booking",
          },
          {
            name: "Your Gems appointment is coming up",
            subject: "Your Gems appointment is coming up",
            timing: "2 hours before appointment",
            purpose: "Reminder 2 hours before a confirmed appointment.",
            body: "Hi {{ first_name }},\n\nYour appointment with Gems Accounting Services is coming up.\n\nDate: {{ appointment_date }}\nTime: {{ appointment_time }} ({{ appointment_timezone }})\nWhere: {{ appointment_location }}\n\nIf you need to make a change, use the link below or call 01926 268330.\n\nKind regards,\nThe Gems team",
            phase: "booking",
          },
          {
            name: "Would you like to arrange another time?",
            subject: "Would you like to arrange another time?",
            timing: "next business day after explicit no-show event",
            purpose: "Re-offers the next step the next business day after an explicit no-show.",
            body: "Hi {{ first_name }},\n\nIt looks like we weren\u2019t able to connect for your appointment about {{ requested_service }}. We know plans can change.\n\nIf you\u2019d still like to talk, use the link below to request another time, or reply and tell us what works for you.\n\nIf you no longer need the appointment, just let us know.\n\nKind regards,\nThe Gems team",
            phase: "booking",
          },
        ],
        stopRules: [
          "The sequence stops the moment someone replies, an appointment is confirmed, or they ask not to be contacted.",
          "Appointment confirmations and reminders only send after staff have actually agreed a slot — never inferred from elapsed time.",
        ],
      },
      tracking: {
        journey: [
          { stage: "New enquiry", detail: "Service needed and source", owner: "Captured automatically", note: "From your website and ads once connected." },
          { stage: "Conversation arranged", detail: "Call or meeting agreed", owner: "Gems team", note: "Recorded when the slot is confirmed." },
          { stage: "Conversation attended", detail: "A record that it took place", owner: "Gems team", note: "Confirmed attendance, never assumed." },
          { stage: "Support agreed", detail: "Services and fees proposed", owner: "Gems team", note: "Updated when a proposal goes out." },
          { stage: "Client won", detail: "Engagement accepted", owner: "Gems team", note: "Confirmed from your client records." },
        ],
        costMetrics: ["Cost per enquiry", "Cost per attended conversation", "Cost per client won"],
      },
    },
  },
  "tann-law": {
    review: {
      headline: "A modern practice, finally presented like one.",
      summary:
        "Tann Law advises individuals, families and businesses across Rugby and Warwickshire on personal, business and immigration matters. The new site says that clearly in the first five seconds and gives every visitor one obvious next step: request a consultation.",
      rebuildReasons: [
        {
          title: "Real legal breadth, hard to see",
          strength:
            "Personal law, business law and immigration support under one roof covers most of what local clients actually need a solicitor for.",
          gap: "The current site does not present those services as clear, recognisable choices, so a visitor cannot quickly confirm Tann Law handles their matter.",
        },
        {
          title: "Trust that arrives too late",
          strength:
            "A local practice working by appointment, giving each matter proper attention rather than processing volume.",
          gap: "Nothing on the current page communicates that care early, so cautious first-time clients have little reason to choose Tann Law over a louder competitor.",
        },
        {
          title: "Interest with no simple next step",
          strength:
            "People facing a legal question want a calm, clear way to ask for advice.",
          gap: "Without an obvious consultation route, visitors either call at awkward times or leave without making contact.",
        },
      ],
      observations: [
        {
          title: "Calm authority in the first five seconds",
          explanation:
            "The hero leads with a clear promise — clear advice, confident next steps — and the practice areas sit immediately beneath it.",
        },
        {
          title: "Services clients recognise",
          explanation:
            "Personal law, business law and immigration each get a clear section, so a visitor can see at a glance that you handle their matter.",
        },
        {
          title: "One obvious next step",
          explanation:
            "Request a consultation appears in the header, hero and footer — someone can ask for advice in seconds and hear back from the team.",
        },
      ],
    },
    website: {
      previewUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:4446"
          : "https://sortmydigital.site/preview/tann-law/",
      previewImageUrl: "/workspace/tann-law/homepage-preview.webp",
      offerPage: {
        label: "Consultation page",
        description: "A focused page where a visitor describes their matter and requests a consultation, confirmed by the team. This page is planned and is not yet built.",
      },
      status: "review",
    },
    offer: {
      total: 3000,
      deposit: 1500,
      balance: 1500,
      // No client-specific Stripe deposit link issued yet — cleared so the
      // shared default link cannot charge the wrong amount.
      stripePaymentUrl: "",
      bankTransferEnabled: true,
      status: "pending",
    },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more clients", description: "Reaching people and businesses needing legal advice in Rugby and Warwickshire" },
        { id: "convert", title: "Convert more enquiries", description: "A site and consultation request that turn interest into booked appointments" },
        { id: "follow-up", title: "Improve follow-up", description: "Confirmations, detail chasing and appointment reminders that run themselves" },
        { id: "tracking", title: "Understand what's working", description: "See consultation requests, confirmed appointments, attended meetings and new clients" },
      ],
      offerCard: {
        title: "Request a consultation",
        description: "Tell Tann Law Solicitors about your matter and the team arranges a consultation to discuss your options.",
        bullets: ["Personal, business & immigration law", "Rugby & surrounding Warwickshire", "By appointment only"],
      },
      ads: {
        offer:
          "A campaign kit built around one clear action: request a consultation with Tann Law Solicitors.",
        creatives: [
          {
            title: "Clear advice",
            format: "Single image · Facebook & Instagram feed",
            audience: "Individuals, families and business owners in Rugby and surrounding Warwickshire.",
            headline: "Clear advice. Confident next steps.",
            cta: "Request a consultation",
            primaryText:
              "Practical legal support for your family, your future and your business. Tell Tann Law Solicitors what you need and request a consultation. Appointments are arranged by the team.",
            imageUrl: "/workspace/tann-law/ad-01-feed-1x1.webp",
            imageAlt: "Tann Law Solicitors advert: Clear advice. Confident next steps. Personal, business and immigration law. Request a consultation.",
          },
          {
            title: "Know where you stand",
            format: "Single image · Facebook & Instagram feed",
            audience: "Individuals, families and business owners in Rugby and surrounding Warwickshire.",
            headline: "Know where you stand.",
            cta: "Request a consultation",
            primaryText:
              "Not sure what to do next? Tell Tann Law Solicitors about your situation, understand your options and discuss the next step. Request a consultation. By appointment only.",
            imageUrl: "/workspace/tann-law/ad-02-feed-1x1.webp",
            imageAlt: "Tann Law Solicitors advert: Know where you stand. Tell us what you need, understand your options, take the next step.",
          },
        ],
      },
      followUp: {
        emails: [
          {
            name: "Request received",
            subject: "We\u2019ve received your consultation request",
            timing: "Immediately after an enquiry",
            purpose: "Confirms the request landed and sets the honest expectation that no appointment is confirmed yet.",
            phase: "enquiry",
            body: "Hello {{ first_name }},\n\nThank you for contacting Tann Law Solicitors about {{ service_name }}. We\u2019ve received your request.\n\nYour appointment is not yet confirmed. Our team will review your enquiry and contact you to discuss the next step.\n\nIf anything in your request needs correcting, simply reply to this email. Please avoid sending sensitive documents until our team confirms how to share them.\n\nKind regards,\nTann Law Solicitors",
          },
          {
            name: "Chase the missing detail",
            subject: "A next step for your Tann Law enquiry",
            timing: "When a detail is needed to progress the request",
            purpose: "Asks for the one outstanding detail without pressure.",
            phase: "enquiry",
            body: "Hello {{ first_name }},\n\nTo help us progress your consultation request, we still need the following from you:\n\n{{ customer_action_text }}\n\nYou can reply to this email with the details. If your circumstances have changed, let us know and we\u2019ll update your enquiry.\n\nKind regards,\nTann Law Solicitors",
          },
          {
            name: "Continue or close",
            subject: "Would you still like help with your enquiry?",
            timing: "Later, if the enquiry is still unresolved",
            purpose: "A polite check that either restarts the request or closes it without assumptions.",
            phase: "enquiry",
            body: "Hello {{ first_name }},\n\nWould you still like us to help with your consultation request? To continue, please reply with:\n\n{{ customer_action_text }}\n\nIf you no longer need help, reply and let us know. We won\u2019t assume your request is cancelled just because you haven\u2019t replied.\n\nKind regards,\nTann Law Solicitors",
          },
          {
            name: "Appointment confirmed",
            subject: "Your Tann Law appointment is confirmed",
            timing: "When the team confirms a slot",
            purpose: "Service, date, time, meeting details and preparation in one place.",
            phase: "booking",
            body: "Hello {{ first_name }},\n\nYour appointment with Tann Law Solicitors is confirmed.\n\nService: {{ service_name }}\nDate: {{ appointment_date }}\nTime: {{ appointment_time }} ({{ appointment_timezone }})\nWhere: {{ meeting_details }}\n\nPreparation: {{ preparation_text }}\n\nIf you need to change or cancel, reply to this email and our team will help.\n\nKind regards,\nTann Law Solicitors",
          },
          {
            name: "Reminder, 24 hours",
            subject: "A reminder of your Tann Law appointment",
            timing: "The day before the appointment",
            purpose: "A useful reminder with a route to change or cancel.",
            phase: "booking",
            body: "Hello {{ first_name }},\n\nA reminder of your appointment with Tann Law Solicitors:\n\nService: {{ service_name }}\nDate: {{ appointment_date }}\nTime: {{ appointment_time }} ({{ appointment_timezone }})\nWhere: {{ meeting_details }}\n\nPreparation: {{ preparation_text }}\n\nIf you can no longer attend or need to change the time, please reply so our team can help.\n\nKind regards,\nTann Law Solicitors",
          },
          {
            name: "Reminder, 2 hours",
            subject: "Your Tann Law appointment is coming up",
            timing: "Two hours before the appointment",
            purpose: "A short reminder with the meeting details.",
            phase: "booking",
            body: "Hello {{ first_name }},\n\nYour appointment with Tann Law Solicitors is coming up.\n\nDate: {{ appointment_date }}\nTime: {{ appointment_time }} ({{ appointment_timezone }})\nWhere: {{ meeting_details }}\n\nIf you need help with the meeting details or your plans have changed, reply to this email.\n\nKind regards,\nTann Law Solicitors",
          },
          {
            name: "After a missed appointment",
            subject: "Would you like to arrange another appointment?",
            timing: "After an explicit no-show",
            purpose: "Offers a new time without pressure or assumptions.",
            phase: "booking",
            body: "Hello {{ first_name }},\n\nWe weren\u2019t able to meet for your appointment on {{ appointment_date }}.\n\nIf you\u2019d like to arrange another time, reply to this email and our team will help. If you no longer need an appointment, just let us know.\n\nKind regards,\nTann Law Solicitors",
          },
        ],
        stopRules: [
          "The sequence stops the moment someone replies, an appointment is confirmed, or they ask not to be contacted.",
          "Appointment confirmations and reminders only send after the team has actually agreed a slot — never inferred from elapsed time.",
          "info@tannlaw.co.uk appears in the source material, but sender identity, a monitored reply route and the practice calendar must be configured before anything sends.",
        ],
        bookingPhaseLabel: "Confirmed appointment",
      },
      tracking: {
        metrics: [
          { key: "enquiries", label: "Consultation requests", description: "People asking for legal advice.", source: "Website forms + ad enquiries", connected: false },
          { key: "attended", label: "Consultations attended", description: "Appointments that took place, confirmed by the team.", source: "Tann Law attendance confirmation", connected: false },
          { key: "quotes", label: "Scopes of work proposed", description: "Advice and fee proposals shared after a consultation.", source: "Tann Law team", connected: false },
          { key: "customers", label: "New clients", description: "People who instruct Tann Law after their consultation.", source: "Tann Law client records", connected: false },
        ],
        journey: [
          { stage: "New enquiry", detail: "Source and matter type", owner: "Captured automatically", note: "From your website and ads once connected." },
          { stage: "Appointment confirmed", detail: "Agreed date, time and location", owner: "Tann Law team", note: "Appointments are arranged by your team, never auto-booked." },
          { stage: "Consultation attended", detail: "A record that the meeting took place", owner: "Tann Law team", note: "Confirmed attendance, never assumed." },
          { stage: "Scope of work proposed", detail: "Advice and fees shared", owner: "Tann Law team", note: "Recorded when a proposal goes out." },
          { stage: "Client instructed", detail: "Engagement accepted", owner: "Tann Law team", note: "Confirmed from your client records." },
        ],
        costMetrics: ["Cost per enquiry", "Cost per attended consultation", "Cost per new client"],
        attendanceNote:
          "Consultation attendance is confirmed by the team or connected records. A request or a booked slot alone never counts as an attended consultation or a new client.",
      },
    },
  },
  "j-smith-tree-surgery": {
    review: {
      headline: "Real tree and garden work, finally front and centre.",
      summary:
        "J Smith already does the work — tree surgery, landscaping and garden clearance across Birmingham — but the current site gives that proof very little room and offers no clear way to request a quote. Your new site leads with the work itself, lays out each service plainly and gives every visitor one obvious next step: request a free quote.",
      rebuildReasons: [
        {
          title: "Real work, barely visible",
          strength:
            "Tree surgery, landscaping and garden clearance carried out across Birmingham — the kind of local work homeowners want to see before they pick up the phone.",
          gap: "The current site gives that proof very little room, so a visitor cannot quickly confirm the standard of work they'd be paying for.",
        },
        {
          title: "Services hidden instead of listed",
          strength:
            "A clear service range — tree surgery, landscaping, stump removal and site clearance — that covers most of what local gardens need.",
          gap: "Visitors have to work to understand what's on offer, so many leave before realising you cover their job.",
        },
        {
          title: "Interest with no easy next step",
          strength:
            "People planning tree or garden work want a simple way to describe the job and hear back with a price.",
          gap: "Without an obvious quote request route, interested visitors either call at awkward times or leave without making contact.",
        },
      ],
      observations: [
        {
          title: "The work sells itself in the first five seconds",
          explanation:
            "The hero leads with a real climbing shot and a clear promise — healthy trees, beautiful landscapes — with Get a Free Quote right beside it.",
        },
        {
          title: "A gallery of real jobs",
          explanation:
            "Fourteen of your own site photos — patios, turfing, hedge work and felled trees — show exactly what customers can expect, with filters for each service.",
        },
        {
          title: "One obvious next step",
          explanation:
            "Get a Free Quote appears in the header, hero, about section and footer, and the form itself asks only what you need to price the work.",
        },
      ],
    },
    website: {
      previewUrl:
        process.env.NODE_ENV === "development" ? "http://localhost:4462" : undefined,
      previewImageUrl: "/j-smith-homepage-preview.webp",
      offerPage: {
        label: "Quote request form",
        description:
          "Built into the homepage — a visitor describes the work and requests a free quote. The form is designed but not yet connected to an inbox; we wire that up at launch.",
      },
      status: "review",
    },
    offer: {
      total: 3000,
      deposit: 1500,
      balance: 1500,
      bankTransferEnabled: true,
      status: "pending",
    },
    acquisition: {
      interests: [
        { id: "attract", title: "Attract more customers", description: "Reaching Birmingham homeowners planning tree or garden work" },
        { id: "convert", title: "Convert more enquiries", description: "A site and quote request that turn interest into priced jobs" },
        { id: "follow-up", title: "Improve follow-up", description: "Enquiry acknowledgements, detail chasing and appointment reminders that run themselves" },
        { id: "tracking", title: "Understand what's working", description: "See quote requests, confirmed visits, attended appointments and jobs won" },
      ],
      offerCard: {
        title: "Request a free quote",
        description:
          "Tell J Smith Tree Surgery & Landscaping about the work you have in mind and get a free quote — no obligation.",
        bullets: ["Tree surgery, landscaping & clearance", "Birmingham & surrounding areas", "Free, no-obligation quote"],
      },
      ads: {
        offer:
          "A campaign kit built around one clear action: request a free quote from J Smith Tree Surgery & Landscaping.",
        creatives: [
          {
            title: "Tree care. Taken care of.",
            format: "Single image · Facebook & Instagram feed · 1:1",
            audience: "Homeowners in Birmingham and surrounding areas with trees needing attention.",
            headline: "Tree care. Taken care of.",
            cta: "Get a Free Quote",
            primaryText:
              "Need help with a tree, pruning or garden clearance? Tell J Smith Tree Surgery & Landscaping about the work you have in mind. Serving Birmingham and surrounding areas. Request a free quote.",
            imageUrl: "/workspace/j-smith/concept-a-square.webp",
            imageAlt:
              "J Smith Tree Surgery & Landscaping advert: Tree care. Taken care of. Tree surgery, pruning & garden clearance. Get a Free Quote.",
          },
          {
            title: "Tree care. Taken care of. — portrait",
            format: "Single image · Facebook & Instagram feed · 3:4",
            audience: "Homeowners in Birmingham and surrounding areas with trees needing attention.",
            headline: "Tree care. Taken care of.",
            cta: "Get a Free Quote",
            primaryText:
              "Need help with a tree, pruning or garden clearance? Tell J Smith Tree Surgery & Landscaping about the work you have in mind. Serving Birmingham and surrounding areas. Request a free quote.",
            imageUrl: "/workspace/j-smith/concept-a-portrait.webp",
            imageAlt:
              "J Smith Tree Surgery & Landscaping portrait advert: Tree care. Taken care of. Tree surgery, pruning & garden clearance.",
          },
          {
            title: "Tree care. Taken care of. — story",
            format: "Single image · Stories · 9:16",
            audience: "Homeowners in Birmingham and surrounding areas with trees needing attention.",
            headline: "Tree care. Taken care of.",
            cta: "Get a Free Quote",
            primaryText:
              "Need help with a tree, pruning or garden clearance? Tell J Smith Tree Surgery & Landscaping about the work you have in mind. Serving Birmingham and surrounding areas. Request a free quote.",
            imageUrl: "/workspace/j-smith/concept-a-story.webp",
            imageAlt:
              "J Smith Tree Surgery & Landscaping story advert: Tree care. Taken care of. Tree surgery, pruning & garden clearance.",
          },
          {
            title: "A fresh start for your garden.",
            format: "Single image · Facebook & Instagram feed · 1:1",
            audience: "Homeowners in Birmingham and surrounding areas planning landscaping or garden improvements.",
            headline: "A fresh start for your garden.",
            cta: "Get a Free Quote",
            primaryText:
              "Planning a change to your garden? From landscaping and turfing to garden care, tell J Smith Tree Surgery & Landscaping what you have in mind. Serving Birmingham and surrounding areas. Request a free quote.",
            imageUrl: "/workspace/j-smith/concept-b-square.webp",
            imageAlt:
              "J Smith Tree Surgery & Landscaping advert: A fresh start for your garden. Landscaping, turfing & garden care. Get a Free Quote.",
          },
          {
            title: "A fresh start for your garden. — portrait",
            format: "Single image · Facebook & Instagram feed · 3:4",
            audience: "Homeowners in Birmingham and surrounding areas planning landscaping or garden improvements.",
            headline: "A fresh start for your garden.",
            cta: "Get a Free Quote",
            primaryText:
              "Planning a change to your garden? From landscaping and turfing to garden care, tell J Smith Tree Surgery & Landscaping what you have in mind. Serving Birmingham and surrounding areas. Request a free quote.",
            imageUrl: "/workspace/j-smith/concept-b-portrait.webp",
            imageAlt:
              "J Smith Tree Surgery & Landscaping portrait advert: A fresh start for your garden. Landscaping, turfing & garden care.",
          },
          {
            title: "A fresh start for your garden. — story",
            format: "Single image · Stories · 9:16",
            audience: "Homeowners in Birmingham and surrounding areas planning landscaping or garden improvements.",
            headline: "A fresh start for your garden.",
            cta: "Get a Free Quote",
            primaryText:
              "Planning a change to your garden? From landscaping and turfing to garden care, tell J Smith Tree Surgery & Landscaping what you have in mind. Serving Birmingham and surrounding areas. Request a free quote.",
            imageUrl: "/workspace/j-smith/concept-b-story.webp",
            imageAlt:
              "J Smith Tree Surgery & Landscaping story advert: A fresh start for your garden. Landscaping, turfing & garden care.",
          },
        ],
      },
      followUp: {
        emails: [
          {
            name: "Request received",
            subject: "We\u2019ve received your quote request",
            timing: "Immediately after an enquiry",
            purpose: "Confirms the request landed and sets the honest expectation that no appointment is confirmed yet.",
            phase: "enquiry",
            body: "Hi {{ first_name }},\n\nThanks for getting in touch about {{ requested_service }}. We\u2019ve received your request.\n\nThis is an acknowledgement, not a confirmed appointment. We\u2019ll review the details and get back to you about the next step.\n\nIf you have a location, useful photos or anything else to add, reply to this email.\n\nReply with details: {{ reply_url }}\n\nJ Smith Tree Surgery & Landscaping",
          },
          {
            name: "Chase the missing details",
            subject: "A few details for your quote request",
            timing: "Next business day, if details are needed",
            purpose: "Asks for the outstanding details needed to progress the quote.",
            phase: "enquiry",
            body: "Hi {{ first_name }},\n\nThanks for your enquiry about {{ requested_service }}. To help us take the next step, could you send us {{ missing_details }}?\n\nYou can reply directly with the details and any useful photos. If you\u2019re waiting for us to confirm something, there\u2019s no need to chase \u2014 we\u2019ll pick that up.\n\nReply with details: {{ reply_url }}\n\nJ Smith Tree Surgery & Landscaping",
          },
          {
            name: "Continue or close",
            subject: "Would you still like to discuss the work?",
            timing: "Later, if the enquiry is still unresolved",
            purpose: "A polite check that either restarts the request or closes it without assumptions.",
            phase: "enquiry",
            body: "Hi {{ first_name }},\n\nJust checking whether you\u2019d still like to discuss {{ requested_service }}. We\u2019re still waiting for {{ missing_details }} before we can move forward.\n\nReply when you\u2019re ready, or let us know if your plans have changed. There\u2019s no pressure, and this message doesn\u2019t automatically cancel your request.\n\nReply to your request: {{ reply_url }}\n\nJ Smith Tree Surgery & Landscaping",
          },
          {
            name: "Appointment confirmed",
            subject: "Your appointment is confirmed",
            timing: "When the team confirms a visit",
            purpose: "Date, time, location and preparation in one place.",
            phase: "booking",
            body: "Hi {{ first_name }},\n\nYour {{ requested_service }} appointment is confirmed.\n\nDate: {{ appointment_date }}\nTime: {{ appointment_time }} ({{ timezone_label }})\nLocation: {{ appointment_location }}\n\n{{ preparation_notes }}\n\nIf you need to make a change, use the link below or reply to this email.\n\nManage your appointment: {{ manage_booking_url }}\n\nJ Smith Tree Surgery & Landscaping",
          },
          {
            name: "Reminder, 24 hours",
            subject: "A reminder about your appointment tomorrow",
            timing: "The day before the appointment",
            purpose: "A useful reminder with a route to change plans.",
            phase: "booking",
            body: "Hi {{ first_name }},\n\nA reminder about your {{ requested_service }} appointment.\n\nDate: {{ appointment_date }}\nTime: {{ appointment_time }} ({{ timezone_label }})\nLocation: {{ appointment_location }}\n\n{{ preparation_notes }}\n\nIf your plans have changed, please use the link below.\n\nManage your appointment: {{ manage_booking_url }}\n\nJ Smith Tree Surgery & Landscaping",
          },
          {
            name: "Reminder, 2 hours",
            subject: "Your appointment is coming up",
            timing: "Two hours before the appointment",
            purpose: "A short reminder with the time and location.",
            phase: "booking",
            body: "Hi {{ first_name }},\n\nYour {{ requested_service }} appointment is coming up.\n\nToday at {{ appointment_time }} ({{ timezone_label }})\nLocation: {{ appointment_location }}\n\nNeed to change something? Use the link below or reply to this email.\n\nManage your appointment: {{ manage_booking_url }}\n\nJ Smith Tree Surgery & Landscaping",
          },
          {
            name: "After a missed appointment",
            subject: "Would you like to arrange another time?",
            timing: "After an explicit no-show",
            purpose: "Offers a new time without pressure or assumptions.",
            phase: "booking",
            body: "Hi {{ first_name }},\n\nIt looks like we didn\u2019t manage to connect for your {{ requested_service }} appointment. If you\u2019d still like to discuss the work, you can arrange another time using the link below.\n\nIf your plans have changed, just reply and let us know.\n\nArrange another time: {{ manage_booking_url }}\n\nJ Smith Tree Surgery & Landscaping",
          },
        ],
        stopRules: [
          "The sequence stops the moment someone replies, an appointment is confirmed, or they ask not to be contacted.",
          "Appointment confirmations and reminders only send after the team has actually agreed a slot — never inferred from elapsed time.",
          "Sender email, reply route and the business calendar are unresolved — all messages are drafts until a monitored sender and reply queue are configured.",
        ],
      },
      tracking: {
        metrics: [
          { key: "enquiries", label: "Quote requests", description: "People asking for a free quote.", source: "Website form + ad enquiries", connected: false },
          { key: "attended", label: "Appointments attended", description: "Site visits and consultations that took place, confirmed by the team.", source: "J Smith attendance confirmation", connected: false },
          { key: "quotes", label: "Quotes delivered", description: "Priced quotes sent after reviewing the work.", source: "J Smith records", connected: false },
          { key: "customers", label: "Jobs won", description: "Confirmed work booked from those enquiries.", source: "J Smith records", connected: false },
        ],
        journey: [
          { stage: "New enquiry", detail: "Source and service requested", owner: "Captured automatically", note: "From your website and ads once connected." },
          { stage: "Visit agreed", detail: "Agreed date and time", owner: "J Smith team", note: "Appointments are arranged by your team, never auto-booked." },
          { stage: "Visit attended", detail: "A record that the appointment took place", owner: "J Smith team", note: "Confirmed attendance, never assumed." },
          { stage: "Quote delivered", detail: "Priced work sent to the customer", owner: "J Smith team", note: "Recorded when the quote goes out." },
          { stage: "Job won", detail: "Work accepted", owner: "J Smith team", note: "Confirmed from your job records." },
        ],
        costMetrics: ["Cost per quote request", "Cost per attended visit", "Cost per job won"],
        attendanceNote:
          "Appointment attendance is confirmed by the team or connected records. A request or agreed slot alone never counts as an attended visit or a job won.",
      },
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
      rebuildReasons: [],
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
    acquisition: WORKSPACE_DEFAULTS.acquisition,
  },
}

// Local-only USD fixture for checking workspace pricing without changing a client offer.
LOCAL_DEMO_WORKSPACES["nexus-accounting-us"] = {
  ...LOCAL_DEMO_WORKSPACES["nexus-accounting"],
  slug: "nexus-accounting-us",
  business: { name: "Nexus Accounting US demo" },
  offer: resolveWorkspaceOffer(WORKSPACE_DEFAULTS.offer, WORKSPACE_US_OFFER),
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
  lead_answers: WebsiteLeadOfferContext | null
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

function deriveRebuildReasons(p: ProspectRow): WorkspaceRebuildReason[] {
  const weaknesses = (p.site_weaknesses ?? []).filter(Boolean).slice(0, 4)
  return weaknesses.map((w) => ({ title: titleFrom(w), gap: w }))
}

function stateFromCrm(crm: string | null): WorkspaceState {
  if (crm === "paid" || crm === "build") return "project"
  return "prospect"
}

function merge(ws: Workspace, o: WorkspaceOverride | undefined): Workspace {
  if (!o) return ws
  const a = o.acquisition
  return {
    ...ws,
    state: o.state ?? ws.state,
    review: { ...ws.review, ...(o.review ?? {}) },
    website: { ...ws.website, ...(o.website ?? {}) },
    // Existing authored offers predate currency selection and were agreed in GBP.
    offer: resolveWorkspaceOffer(ws.offer, o.offer ? { currency: "GBP", ...o.offer } : undefined),
    links: { ...ws.links, ...(o.links ?? {}) },
    acquisition: a
      ? {
          interests: a.interests ?? ws.acquisition.interests,
          offerCard: a.offerCard ?? ws.acquisition.offerCard,
          ads: { ...ws.acquisition.ads, ...(a.ads ?? {}) },
          followUp: { ...ws.acquisition.followUp, ...(a.followUp ?? {}) },
          tracking: { ...ws.acquisition.tracking, ...(a.tracking ?? {}) },
        }
      : ws.acquisition,
  }
}

export async function getWorkspace(slug: string): Promise<Workspace | null> {
  if (process.env.NODE_ENV === "development" && LOCAL_DEMO_WORKSPACES[slug]) {
    return LOCAL_DEMO_WORKSPACES[slug]
  }

  const fields = "id, name, website, owner_name, review_summary, site_analysis, site_weaknesses, mockup_url, mockup_urls, walkthrough_video_url, screenshot_url, crm_status"
  let { data, error } = await supabase
    .from("prospects")
    .select(`${fields}, lead_answers`)
    .eq("review_slug", slug)
    .maybeSingle()

  // Older installations may not yet have the optional lead_answers migration.
  // Keep their established UK workspaces available without changing the schema.
  if (error && ["42703", "PGRST204"].includes(error.code)) {
    const fallback = await supabase.from("prospects").select(fields).eq("review_slug", slug).maybeSingle()
    data = fallback.data ? { ...fallback.data, lead_answers: null } : null
    error = fallback.error
  }

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
      rebuildReasons: deriveRebuildReasons(p),
      observations: [],
    },
    website: {
      previewImageUrl: p.mockup_urls?.[0] ?? p.mockup_url ?? undefined,
      walkthroughVideoUrl: p.walkthrough_video_url ?? undefined,
      status: "preview",
    },
    offer: resolveWorkspaceOffer(WORKSPACE_DEFAULTS.offer,
      websiteLeadOffer(p.lead_answers)),
    links: { ...WORKSPACE_DEFAULTS.links },
    acquisition: WORKSPACE_DEFAULTS.acquisition,
  }

  return merge(ws, override)
}

// ─── Navigation model ─────────────────────────────────────────────────────────

export type WorkspaceRoute =
  | "review"
  | "website"
  | "ads"
  | "follow-up"
  | "tracking"
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
    { label: "Overview", route: "overview" },
    { label: "Your New Site", route: "website" },
    { label: "Your Ads", route: "ads" },
    { label: "Follow-up", route: "follow-up" },
    { label: "Tracking", route: "tracking" },
    { label: "Next Steps", route: "next-steps" },
  ]
}

export function defaultRouteFor(state: WorkspaceState): WorkspaceRoute {
  return state === "live" ? "overview" : state === "project" ? "project" : "overview"
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
    currency: ws.offer.currency,
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

// ─── Ask a question ───────────────────────────────────────────────────────────
// Inserts into sorted_messages via a SECURITY DEFINER RPC — anon has no direct
// INSERT grant on sorted_messages, and the static site has no API routes. The
// RPC validates the slug against prospects and tags the row with
// source="workspace_question".

export async function submitWorkspaceQuestion(ws: Workspace, question: string): Promise<boolean> {
  workspaceEvent(ws, "question_submitted", { channel: "workspace" })
  const { data, error } = await supabase.rpc("submit_workspace_question", {
    p_slug: ws.slug,
    p_question: question,
  })
  if (error) return false
  return Boolean(data)
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
