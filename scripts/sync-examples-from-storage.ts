// Run this locally to copy mockup images from Supabase Storage into the examples table.
// Requires SUPABASE_SERVICE_KEY in your environment.
//
// Usage:
//   npx tsx scripts/sync-examples-from-storage.ts

import { createServiceClient } from "../lib/supabase"

async function main() {
  const supabase = createServiceClient()

  const { data: files, error: listError } = await supabase.storage
    .from("mockups")
    .list("", { limit: 1000 })

  if (listError) {
    console.error("Failed to list mockups bucket:", listError.message)
    process.exit(1)
  }

  if (!files || files.length === 0) {
    console.log("No files found in mockups bucket.")
    return
  }

  const imageFiles = files.filter((f) =>
    /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name)
  )

  const rows = imageFiles.map((f) => {
    const { data } = supabase.storage.from("mockups").getPublicUrl(f.name)
    const publicUrl = data.publicUrl

    const nameFromFile = f.name
      .replace(/\.(jpg|jpeg|png|webp|gif)$/i, "")
      .replace(/[-_]+/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")

    return {
      storage_path: f.name,
      business_name: nameFromFile,
      image_url: publicUrl,
      type: "mockup",
      live_url: null,
      category: null,
    }
  })

  const { error: upsertError } = await supabase
    .from("examples")
    .upsert(rows, {
      onConflict: "storage_path",
      ignoreDuplicates: false,
    })

  if (upsertError) {
    console.error("Failed to upsert examples:", upsertError.message)
    process.exit(1)
  }

  console.log(`Synced ${rows.length} mockup images into examples.`)
}

main()
