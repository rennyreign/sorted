import { MARKET_PRICING, resolveWorkspaceOffer, parseMarket, type OfferCurrency } from "@/lib/market-pricing"
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
      previewUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:4317"
          : undefined,
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
          : undefined,
      previewImageUrl: "/workspace/baker-berte/baker-berte-v2-homepage-preview.webp",
      previewVersions:
        process.env.NODE_ENV === "development"
          ? [
              { id: "v1", label: "Version 1", previewUrl: "http://localhost:4318" },
              { id: "v2", label: "Version 2", previewUrl: "http://localhost:4319" },
            ]
          : undefined,
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
      previewUrl:
        process.env.NODE_ENV === "development"
          ? "http://localhost:4319"
          : undefined,
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
      total: 1500,
      deposit: 750,
      balance: 750,
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
          : "https://sweeneys-martial-arts.netlify.app",
      previewImageUrl: "/sweeneys-homepage-preview.webp",
      offerPage: {
        label: "Trial page",
        description: "A focused page for the class someone is interested in, with participant details and one clear route to request a trial. This page is planned and is not yet built.",
      },
      status: "review",
    },
    offer: {
      total: 500,
      deposit: 250,
      balance: 250,
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
  lead_answers: { market?: string; currency?: string } | null
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
      parseMarket(p.lead_answers?.currency ?? p.lead_answers?.market) === "US" ? WORKSPACE_US_OFFER : undefined),
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
