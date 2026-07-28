"use client"

import { useGeoPricing } from "@/hooks/useGeoPricing"

export function GeoPrice({ amount, className }: { amount: number; className?: string }) {
  const { formatPrice } = useGeoPricing()
  return <span className={className}>{formatPrice(amount)}</span>
}
