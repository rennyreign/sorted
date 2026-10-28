import type { OfferCurrency } from "@/lib/market-pricing"

export type Owner = "Client" | "Sorted" | "Together"

export type Step = {
  id: string
  title: string
  detail: string
  owner: Owner
  /** Client-owned steps can be marked ready in the workspace without claiming Sorted has verified them. */
  clientCheck?: boolean
}

export type Stage = {
  id: string
  title: string
  description: string
  steps: Step[]
}

export type TimelineNode = {
  id: string
  title: string
  detail?: string
  state: "done" | "current" | "todo"
  payment?: { amount: number | null; label: string }
  /** Client-owned nodes get a checkbox the client can tick to mark ready/done. */
  clientCheck?: boolean
}

export type Player = {
  name: string
  goal: string
  contributes: string
  decides: string
}

/** A broad presentation phase that aggregates several underlying timeline nodes. */
export type JourneyPhase = {
  title: string
  description: string
  timelineIds: string[]
}

export type OnboardingPresentation = {
  eyebrow?: string
  heroHeading?: string
  heroDescription?: string
  outcomes?: { title: string; description: string }[]
  implementationIncludes?: { title: string; items: string[]; note: string }
}

export type ValueLine = {
  id: string
  title: string
  pillar: "Trust" | "Enquiries" | "Customers" | "Operations"
  basis: string
  assumptions: string[]
  calculation: string
  amount: number | null
  cadence: "one-off" | "monthly"
}

export type ValueAlternative = {
  title: string
  /** null => shown as "Varies" (e.g. an internal build costed in team time). */
  indicative: number | null
  cadence: "one-off" | "monthly"
  note: string
}

export type ClientOnboardingConfig = {
  slug: string
  clientName: string
  shortName: string
  line: string
  accessCode: string
  currency: OfferCurrency
  processReplaced: string
  observableImprovement: string
  players: Player[]
  timeline: TimelineNode[]
  /** Broad phases aggregating the timeline for presentation; the stored stages are unchanged. */
  journey?: JourneyPhase[]
  presentation?: OnboardingPresentation
  value: {
    lines: ValueLine[]
    charge: number
    chargeLabel: string
    chargeBasis: string
    alternatives: ValueAlternative[]
  }
  links: {
    hubPreview?: string
    hubOverview?: string
    hubDevelopment?: string
    documents?: string
  }
  /** Compact scope paragraph shown in the agreement section; includes the payment plan from timeline payment nodes. */
  agreementScope: string
  /** Bank details shown beneath the agreement block for the starting payment. Rows render only for fields provided. */
  paymentDetails?: {
    bankName?: string
    accountName?: string
    sortCode?: string
    accountNumber?: string
    reference?: string
  }
  /** Absent => "Walkthrough coming soon" slot, no fake play button. */
  walkthroughVideo?: { src: string; captions: string }
}

/** Sum of each line's amount (monthly lines * 12), skipping null amounts. */
export function firstYearValue(lines: ValueLine[]): number {
  return lines.reduce((total, line) => {
    if (line.amount === null) return total
    return total + (line.cadence === "monthly" ? line.amount * 12 : line.amount)
  }, 0)
}
