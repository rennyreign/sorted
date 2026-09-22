import { supabase } from "@/lib/supabase"

export type Agreement = {
  id: number
  slug: string
  doc_type: string
  page_path: string
  client_name: string
  signer_name: string
  signed_at: string
  created_at: string
}

/** Fetch the most recent signature recorded for a page slug. */
export async function getLatestAgreement(slug: string): Promise<Agreement | null> {
  const { data, error } = await supabase
    .from("agreements")
    .select("*")
    .eq("slug", slug)
    .order("signed_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error("agreements fetch failed:", error.message)
    return null
  }
  return data as Agreement | null
}

/** Record a client signature. Fire-and-forget safe — failures are logged,
    never thrown, so the sign flow never breaks on a network issue. */
export async function recordAgreement(input: {
  slug: string
  docType: string
  pagePath: string
  clientName: string
  signerName: string
}): Promise<void> {
  const { error } = await supabase.from("agreements").insert({
    slug: input.slug,
    doc_type: input.docType,
    page_path: input.pagePath,
    client_name: input.clientName,
    signer_name: input.signerName,
    signed_at: new Date().toISOString(),
  })
  if (error) console.error("agreement record failed:", error.message)
}

/** Fetch every recorded signature, newest first — used by the operator
    Clients directory. */
export async function getAllAgreements(): Promise<Agreement[]> {
  const { data, error } = await supabase
    .from("agreements")
    .select("*")
    .order("signed_at", { ascending: false })
  if (error) {
    console.error("agreements list failed:", error.message)
    return []
  }
  return (data ?? []) as Agreement[]
}
