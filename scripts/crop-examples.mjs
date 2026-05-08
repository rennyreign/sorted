/**
 * Crops images from assets/imagedb/ to 4:5 aspect ratio (top-center crop),
 * resizes to 800x1000px, and saves as optimized JPEGs in public/examples/.
 *
 * Usage: node scripts/crop-examples.mjs
 * Requires: sharp (npm install sharp --save-dev)
 */

import sharp from "sharp"
import { readdir, mkdir } from "node:fs/promises"
import { join, parse } from "node:path"
import { existsSync } from "node:fs"

const INPUT_DIR = new URL("../assets/imagedb", import.meta.url).pathname
const OUTPUT_DIR = new URL("../public/examples", import.meta.url).pathname

const TARGET_WIDTH = 800
const TARGET_HEIGHT = 1000 // 4:5 ratio (width:height)

const ALLOWED_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"])

async function cropImage(inputPath, outputPath) {
  const metadata = await sharp(inputPath).metadata()
  const { width, height } = metadata

  // Calculate the largest 4:5 (w:h) crop that fits within the source
  const targetRatio = TARGET_WIDTH / TARGET_HEIGHT // 0.8
  const sourceRatio = width / height

  let cropWidth, cropHeight, left, top

  if (sourceRatio > targetRatio) {
    // Source is wider than 4:5 — crop sides, keep full height
    cropHeight = height
    cropWidth = Math.round(height * targetRatio)
    left = Math.round((width - cropWidth) / 2)
    top = 0
  } else {
    // Source is taller than 4:5 — crop bottom, keep full width
    cropWidth = width
    cropHeight = Math.round(width / targetRatio)
    left = 0
    top = 0 // crop from top
  }

  await sharp(inputPath)
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: "fill" })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(outputPath)

  const inputSize = (await sharp(inputPath).metadata()).size || 0
  console.log(`✓ ${parse(inputPath).base} → ${parse(outputPath).base}`)
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }

  const files = await readdir(INPUT_DIR)
  const images = files.filter((f) => ALLOWED_EXTS.has(parse(f).ext.toLowerCase()))

  console.log(`Found ${images.length} images to process...\n`)

  for (const file of images) {
    const inputPath = join(INPUT_DIR, file)
    const slug = parse(file).name.toLowerCase().replace(/\s+/g, "-")
    const outputPath = join(OUTPUT_DIR, `${slug}.jpg`)

    try {
      await cropImage(inputPath, outputPath)
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`)
    }
  }

  console.log("\nDone! Cropped images saved to public/examples/")
}

main()
