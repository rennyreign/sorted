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
      stripePaymentUrl: undefined,
      bankTransferEnabled: true,
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
        "Kelly Electrics has built something genuinely rare: an award-nominated, fully qualified team that customers already trust. Your new site puts that reputation in front of every visitor, so the trust you've earned turns into enquiries.",
      rebuildReasons: [
        {
          title: "A reputation worth more than it showed",
          strength:
            "An award-nominated, fully qualified team with NICEIC registration and Part P credentials. Exactly what careful customers check before calling.",
          gap: "Your old site didn't put that proof where visitors look first, so people comparing electricians had little reason to pick you over the next name on the list.",
        },
        {
          title: "Real reviews, hidden from view",
          strength:
            "Local customers already rate the work highly. Genuine Google reviews, built household by household.",
          gap: "None of that showed online, so new customers had to take your quality on faith instead of seeing other people vouch for you.",
        },
        {
          title: "Trust with nowhere to go",
          strength:
            "When customers do reach the team, the work gets done properly and the reviews keep coming.",
          gap: "The old site gave a visitor's confidence nowhere to land. No clear quote request on every page, so interested people drifted away instead of enquiring.",
        },
      ],
      observations: [
        {
          title: "Reputation made visible",
          explanation:
            "Your Electric Awards nomination, NICEIC registration and Part P credentials sit where a careful customer looks first. Before they've read a word, they already know you're the real thing.",
        },
        {
          title: "Proof where buyers look",
          explanation:
            "Real Google reviews from local customers run through the site, so the trust you've built household by household is doing the talking for you.",
        },
        {
          title: "Trust that turns into enquiries",
          explanation:
            "Every page ends at an easy way to reach your team, whether that's a quote request, a phone call or an email, so the confidence a visitor has just gained has somewhere to go.",
        },
      ],
    },
    website: {
      previewUrl: "https://kelly-electrics.netlify.app",
      previewImageUrl: "/kelly-electrics-homepage-preview.webp",
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
      // No dedicated Stripe link yet — card checkout shows "coming soon";
      // bank transfer is the live payment path (same pattern as AMP/ABCD).
      stripePaymentUrl: undefined,
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
      // No dedicated Stripe link yet — card checkout shows "coming soon";
      // bank transfer is the live payment path (same pattern as AMP).
      stripePaymentUrl: undefined,
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
      rebuildReasons: deriveRebuildReasons(p),
      observations: [],
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
