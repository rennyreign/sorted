// Run this locally to add known live Sorted websites to the examples table.
// Requires SUPABASE_SERVICE_KEY in your environment.
//
// Usage:
//   npx tsx scripts/add-live-examples.ts

import { createServiceClient } from "../lib/supabase"

const liveSites = [
  {
    business_name: "Palace & Barns",
    image_url: "/examples/palacebarns.jpg",
    live_url: "https://palacebarns.com",
    category: "Property",
  },
  {
    business_name: "Gracie Barra Halesowen",
    image_url: "/examples/graciebarra-halesowen.jpg",
    live_url: "https://gbhalesowen.com",
    category: "Fitness",
  },
  {
    business_name: "ADX Engine",
    image_url: "/examples/adxengine.jpg",
    live_url: "https://adxengine.net",
    category: "AI Services",
  },
  {
    business_name: "Clinic Flow",
    image_url: "/examples/clinic-flow.jpg",
    live_url: "https://clinicflow.agency",
    category: "Healthcare",
  },
]

async function main() {
  const supabase = createServiceClient()

  const { data: existing, error: fetchError } = await supabase
    .from("examples")
    .select("live_url")
    .eq("type", "live")

  if (fetchError) {
    console.error("Failed to fetch existing live examples:", fetchError.message)
    process.exit(1)
  }

  const existingUrls = new Set((existing ?? []).map((e) => e.live_url))

  const newRows = liveSites
    .filter((site) => !existingUrls.has(site.live_url))
    .map((site) => ({
      ...site,
      type: "live" as const,
      storage_path: null,
      prospect_id: null,
    }))

  if (newRows.length === 0) {
    console.log("All live website examples already exist.")
    return
  }

  const { error } = await supabase.from("examples").insert(newRows)

  if (error) {
    console.error("Failed to add live examples:", error.message)
    process.exit(1)
  }

  console.log(`Added ${newRows.length} live website examples.`)
}

main()
