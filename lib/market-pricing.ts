export type Market = "UK" | "US"
export type OfferCurrency = "GBP" | "USD"

export const MARKET_PRICING = {
  UK: { currency: "GBP", total: 3000, deposit: 1500, balance: 1500 },
  US: { currency: "USD", total: 3500, deposit: 1750, balance: 1750 },
} as const

export function parseMarket(value: string | null | undefined): Market | null {
  if (value === "US" || value === "USD") return "US"
  if (value === "UK" || value === "GB" || value === "GBP") return "UK"
  return null
}

export function formatMoney(amount: number, currency: OfferCurrency, decimals = false): string {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(amount)
}

/** Explicit tokens prevent changing historic prices, results or client quotes. */
export function marketCopy(text: string, market: Market): string {
  const offer = MARKET_PRICING[market]
  return text.replace(/\{(total|deposit|balance)\}/g, (_, key: "total" | "deposit" | "balance") =>
    formatMoney(offer[key], offer.currency)
  )
}

type Offer = {
  currency: OfferCurrency
  total: number
  deposit: number
  balance: number
  stripePaymentUrl?: string
  bankTransferEnabled: boolean
  status?: "ready" | "pending"
}

/** Changing currency starts from that currency's offer, never another currency's checkout. */
export function resolveWorkspaceOffer(defaults: Offer, override?: Partial<Offer>): Offer {
  const currency = override?.currency ?? defaults.currency
  const base = currency === defaults.currency ? defaults : {
    ...MARKET_PRICING[currency === "USD" ? "US" : "UK"],
    stripePaymentUrl: "",
    bankTransferEnabled: false,
  }
  return { ...base, ...override, currency }
}

/** US friend/referral landing-page offer; other market prices and agreed quotes stay unchanged. */
export const US_REFERRAL_WEBSITE_OFFER = {
  currency: "USD",
  total: 2000,
  deposit: 1000,
  balance: 1000,
  stripePaymentUrl: "",
  bankTransferEnabled: false,
} as const

export type WebsiteLeadOfferContext = { market?: string; currency?: string; landing_page?: string }

export function websiteLeadOffer(answers: WebsiteLeadOfferContext | null): Partial<Offer> | undefined {
  if (parseMarket(answers?.currency ?? answers?.market) !== "US") return undefined
  if (answers?.landing_page === "us_free_website") return US_REFERRAL_WEBSITE_OFFER
  return { ...MARKET_PRICING.US, stripePaymentUrl: "", bankTransferEnabled: false }
}
