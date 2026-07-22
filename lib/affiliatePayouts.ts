// Affiliate payout rates — single source of truth.
//
// Mirrors the CHECK constraint and trigger logic in the migration.
// Kept in code so the portal can show projected earnings before a purchase
// without a round trip to the database.

import type { BusinessStage } from "./affiliateClient"

export const STAGE_PAYOUTS_GBP: Record<BusinessStage, number> = {
  new: 75,
  growing: 150,
  established: 300,
}

export function payoutForStage(stage: BusinessStage): number {
  return STAGE_PAYOUTS_GBP[stage]
}

export function formatGbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
