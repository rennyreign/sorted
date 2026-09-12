"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type Tenant = {
  slug: string
  name: string
}

const KNOWN_TENANTS: Tenant[] = [
  { slug: "school-of-skill", name: "School of Skill" },
  { slug: "edgbaston-tuition", name: "Edgbaston Tuition" },
]

type TenantContextValue = {
  tenant: string
  setTenant: (slug: string) => void
  tenants: Tenant[]
}

const TenantContext = createContext<TenantContextValue>({
  tenant: "school-of-skill",
  setTenant: () => {},
  tenants: KNOWN_TENANTS,
})

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenantState] = useState("school-of-skill")

  useEffect(() => {
    const saved = localStorage.getItem("ads-tenant")
    if (saved) setTenantState(saved)
  }, [])

  const setTenant = (slug: string) => {
    setTenantState(slug)
    localStorage.setItem("ads-tenant", slug)
  }

  return (
    <TenantContext.Provider value={{ tenant, setTenant, tenants: KNOWN_TENANTS }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  return useContext(TenantContext)
}
