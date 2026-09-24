import { supabase } from "@/lib/supabase"

export type ClientProgress = {
  client_slug: string
  step: number
  deposit_amount: number | null
  deposit_paid_at: string | null
  updated_at: string
}

export async function getClientProgress(slug: string): Promise<ClientProgress | null> {
  const { data, error } = await supabase
    .from("client_progress")
    .select("*")
    .eq("client_slug", slug)
    .maybeSingle()
  if (error) {
    console.error("client_progress fetch failed:", error.message)
    return null
  }
  return (data as ClientProgress | null) ?? null
}

export async function getAllClientProgress(): Promise<Record<string, ClientProgress>> {
  const { data, error } = await supabase
    .from("client_progress")
    .select("*")
  if (error) {
    console.error("client_progress list failed:", error.message)
    return {}
  }
  const map: Record<string, ClientProgress> = {}
  for (const row of data ?? []) map[row.client_slug] = row as ClientProgress
  return map
}

export async function setClientProgress(slug: string, step: number): Promise<void> {
  const { error } = await supabase.from("client_progress").upsert({
    client_slug: slug,
    step,
    updated_at: new Date().toISOString(),
  })
  if (error) console.error("client_progress write failed:", error.message)
}

export async function setClientDeposit(slug: string, amount: number | null): Promise<void> {
  const { error } = await supabase.from("client_progress").upsert({
    client_slug: slug,
    deposit_amount: amount,
    deposit_paid_at: amount ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  })
  if (error) console.error("client_progress deposit write failed:", error.message)
}
