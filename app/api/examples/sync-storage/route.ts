import { createServiceClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

// POST /api/examples/sync-storage
// Lists all images in the Supabase Storage "mockups" bucket and inserts them
// into the examples table as mockups. Idempotent via storage_path.
export async function POST() {
  try {
    const supabase = createServiceClient()

    const { data: files, error: listError } = await supabase.storage
      .from("Mockups")
      .list("", { limit: 1000 })

    if (listError) {
      return NextResponse.json(
        { error: "Failed to list mockups bucket", details: listError.message },
        { status: 500 }
      )
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ synced: 0, message: "No files found in mockups bucket" })
    }

    // Filter to image files only
    const imageFiles = files.filter((f) =>
      /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name)
    )

    const rows = imageFiles.map((f) => {
      const { data } = supabase.storage.from("Mockups").getPublicUrl(f.name)
      const publicUrl = data.publicUrl

      // Derive a business name from the filename: replace hyphens/underscores with spaces,
      // remove extension, and title-case each word.
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
      return NextResponse.json(
        { error: "Failed to upsert examples", details: upsertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      synced: rows.length,
      message: `${rows.length} mockup images synced from storage to examples.`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
