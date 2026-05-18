"use client"

import { useState, useEffect } from "react"

export type PricingRegion = "GB" | "US" | "ES" | "default"

export interface GeoPricing {
  currency: string
  symbol: string
  monthlyUpdates: string
  perUpdate: string
  siteFrom: string
  siteTo: string
  region: PricingRegion
  loaded: boolean
}

const PRICING: Record<PricingRegion, Omit<GeoPricing, "region" | "loaded">> = {
  GB: {
    currency: "GBP",
    symbol: "£",
    monthlyUpdates: "£39",
    perUpdate: "£19",
    siteFrom: "£400",
    siteTo: "£3,000",
  },
  US: {
    currency: "USD",
    symbol: "$",
    monthlyUpdates: "$49",
    perUpdate: "$25",
    siteFrom: "$500",
    siteTo: "$4,000",
  },
  ES: {
    currency: "EUR",
    symbol: "€",
    monthlyUpdates: "€39",
    perUpdate: "€19",
    siteFrom: "€400",
    siteTo: "€3,000",
  },
  default: {
    currency: "GBP",
    symbol: "£",
    monthlyUpdates: "£39",
    perUpdate: "£19",
    siteFrom: "£400",
    siteTo: "£3,000",
  },
}

export function useGeoPricing(): GeoPricing {
  const [region, setRegion] = useState<PricingRegion>("default")
  const [loaded, setLoaded] = useState(false)

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

  return { ...PRICING[region], region, loaded }
}
