import { supabase } from "@/lib/supabase"

export type OnboardingProgressRow = {
  id: number
  slug: string
  node_id: string
  completed_by: string
  completed_at: string
  created_at: string
}

/** Fetch the timeline nodes already ticked for a workspace. */
export async function getCompletedStages(slug: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("onboarding_progress")
    .select("node_id")
    .eq("slug", slug)
  if (error) {
    console.error("onboarding progress fetch failed:", error.message)
    return []
  }
  return (data ?? []).map((row: { node_id: string }) => row.node_id)
}

/** Record a stage tick. Forward-only — there is no un-tick path in the UI;
    corrections go through the service role. Fire-and-forget safe like
    recordAgreement: failures are logged, never thrown. */
export async function completeStage(slug: string, nodeId: string): Promise<void> {
  const { error } = await supabase.from("onboarding_progress").insert({
    slug,
    node_id: nodeId,
    completed_at: new Date().toISOString(),
  })
  // Unique(slug, node_id) makes a repeat tick a no-op rather than an error.
  if (error && error.code !== "23505") {
    console.error("onboarding progress record failed:", error.message)
  }
}
