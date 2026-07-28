"use client"

import { useState, useEffect } from "react"

export type PricingRegion = "GB" | "US" | "ES" | "default"

type CurrencyCode = "GBP" | "USD" | "EUR"

const CURRENCY_BY_REGION: Record<PricingRegion, CurrencyCode> = {
  GB: "GBP",
  US: "USD",
  ES: "EUR",
  default: "GBP",
}

const LOCAL_PRICES: Partial<Record<CurrencyCode, Record<number, number>>> = {
  USD: {
    495: 650,
    995: 1300,
    1995: 2600,
    2500: 3250,
    750: 1000,
  },
  EUR: {
    495: 600,
    995: 1200,
    1995: 2400,
    2500: 3000,
    750: 900,
  },
}

export interface GeoPricing {
  currency: CurrencyCode
  region: PricingRegion
  loaded: boolean
  formatPrice: (gbp: number) => string
}

export function useGeoPricing(): GeoPricing {
  const [region, setRegion] = useState<PricingRegion>("default")
  const [loaded, setLoaded] = useState(false)

  const currency = CURRENCY_BY_REGION[region]

  const formatPrice = (gbp: number) => {
    const amount = LOCAL_PRICES[currency]?.[gbp] ?? gbp
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const country = data?.country_code as string
        if (country === "US") setRegion("US")
        else if (country === "ES") setRegion("ES")
        else if (country === "GB") setRegion("GB")
        else setRegion("default")
      })
      .catch(() => setRegion("default"))
      .finally(() => setLoaded(true))
  }, [])

  return { currency, region, loaded, formatPrice }
}
