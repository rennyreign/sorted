// Registry of every client-facing page on sortmydigital.site.
// This is the single source of truth for the operator Clients directory —
// add an entry here whenever a new proposal, quote, agreement, delivery,
// or invoice page is created.
//
// Convention:
//   /proposals/[slug]  — pre-sale documents (mockup reveal → Nod 1)
//   /clients/[slug]    — post-sale documents (quote, agreement, delivery, invoice)

export type ClientDocType =
  | "proposal"
  | "agreement"
  | "delivery"
  | "quote"
  | "invoice"
  | "checklist"

export type ClientDoc = {
  type: ClientDocType
  label: string
  path: string
  /** Page password, if the doc is gated. Shown only inside the operator portal. */
  password?: string
  /** True if the page has a Review & Accept signature flow. */
  signable?: boolean
  /** Slug used in the agreements table for this doc's signatures.
      Defaults to the last path segment if omitted. */
  signSlug?: string
}

export type ClientRecord = {
  /** Canonical client slug used for grouping + agreement lookups. */
  slug: string
  name: string
  /** Live client site, if delivered. */
  liveUrl?: string
  /** Prospect name in the prospects table, if it differs from `name`
      (used to pull CRM status + review page link). */
  prospectName?: string
  notes?: string
  docs: ClientDoc[]
}

export const CLIENTS: ClientRecord[] = [
  {
    slug: "advocate-better-care",
    name: "Advocate Better Care",
    docs: [
      {
        type: "quote",
        label: "Quote + Agreement",
        path: "/clients/advocate-better-care",
        password: "mark2026",
        signable: true,
      },
    ],
  },
  {
    slug: "bodysharp",
    name: "BodySharp",
    docs: [
      {
        type: "delivery",
        label: "Delivery Summary",
        path: "/clients/bodysharp",
        password: "mikey2026",
        signable: true,
      },
    ],
  },
  {
    slug: "edgbaston-tuition-centre",
    name: "Edgbaston Tuition Centre",
    liveUrl: "https://edgbastontuition.com",
    docs: [
      {
        type: "proposal",
        label: "Proposal",
        path: "/proposals/edgbaston-tuition-centre",
        password: "edgbaston2026",
        signable: true,
      },
    ],
  },
  {
    slug: "gb-halesowen",
    name: "Gracie Barra Halesowen",
    docs: [
      {
        type: "delivery",
        label: "Delivery Summary",
        path: "/clients/gb-halesowen",
        password: "gracie2026",
        signable: true,
      },
      {
        type: "delivery",
        label: "Legacy URL (redirects)",
        path: "/clients/gbhalesowen",
      },
    ],
  },
  {
    slug: "party-world",
    name: "Party World",
    docs: [
      {
        type: "proposal",
        label: "Proposal",
        path: "/proposals/party-world",
        password: "thepresidents",
        signable: true,
      },
      {
        type: "checklist",
        label: "Onboarding Checklist",
        path: "/proposals/party-world/checklist",
      },
    ],
  },
  {
    slug: "raffles-malaysian-restaurant",
    name: "Raffles Malaysian Restaurant",
    docs: [
      {
        type: "proposal",
        label: "Proposal",
        path: "/proposals/raffles-restaurant",
        password: "raffles2026",
        signable: true,
        signSlug: "raffles-restaurant",
      },
      {
        type: "invoice",
        label: "Invoice SORTED-RAFFLES-004",
        path: "/clients/raffles-malaysian-restaurant",
      },
    ],
  },
  {
    slug: "roye-abramson",
    name: "Roye Abramson",
    docs: [
      {
        type: "proposal",
        label: "Proposal",
        path: "/proposals/roye",
        signSlug: "roye",
      },
      {
        type: "agreement",
        label: "Project Agreement",
        path: "/clients/roye-abramson",
        password: "roye2026",
        signable: true,
      },
      {
        type: "checklist",
        label: "Onboarding Checklist",
        path: "/clients/roye-abramson/checklist",
      },
    ],
  },
  {
    slug: "sandra",
    name: "Sandra",
    docs: [
      {
        type: "delivery",
        label: "Delivery Summary",
        path: "/clients/sandra",
        password: "sandra2026",
        signable: true,
      },
    ],
  },
  {
    slug: "savannah-villegas",
    name: "Savannah Villegas",
    liveUrl: "https://savannahvillegas.com",
    docs: [
      {
        type: "delivery",
        label: "Delivery Summary",
        path: "/clients/savannah-villegas",
        password: "savannah2026",
        signable: true,
      },
    ],
  },
  {
    slug: "school-of-skill",
    name: "School of Skill",
    docs: [
      {
        type: "proposal",
        label: "Proposal",
        path: "/proposals/school-of-skill",
        password: "sos2026",
        signable: true,
      },
    ],
  },
  {
    slug: "sebastian-md",
    name: "Sebastian MD",
    docs: [
      {
        type: "proposal",
        label: "Proposal",
        path: "/proposals/sebastian-md",
        password: "sebastian2026",
      },
    ],
  },
  {
    slug: "shropshire-tents",
    name: "Shropshire Stretch Tents",
    docs: [
      {
        type: "proposal",
        label: "Proposal",
        path: "/proposals/shropshire-tents",
        password: "shropshire2026",
      },
    ],
  },
  {
    slug: "warwickshire-str",
    name: "Warwickshire Short Stays",
    docs: [
      {
        type: "delivery",
        label: "Delivery Summary",
        path: "/clients/warwickshire-str",
        signable: true,
      },
    ],
  },
]

/** The slug a doc's signatures are stored under in the agreements table. */
export function docSignSlug(doc: ClientDoc): string {
  if (doc.signSlug) return doc.signSlug
  const parts = doc.path.replace(/\/$/, "").split("/")
  return parts[parts.length - 1]
}
