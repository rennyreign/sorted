import { supabase } from "@/lib/supabase"

export type ClientProgress = {
  client_slug: string
  step: number
  updated_at: string
}

export async function getClientProgress(slug: string): Promise<number | null> {
  const { data, error } = await supabase
    .from("client_progress")
    .select("step")
    .eq("client_slug", slug)
    .maybeSingle()
  if (error) {
    console.error("client_progress fetch failed:", error.message)
    return null
  }
  return data?.step ?? null
}

export async function getAllClientProgress(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("client_progress")
    .select("client_slug, step")
  if (error) {
    console.error("client_progress list failed:", error.message)
    return {}
  }
  const map: Record<string, number> = {}
  for (const row of data ?? []) map[row.client_slug] = row.step
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
