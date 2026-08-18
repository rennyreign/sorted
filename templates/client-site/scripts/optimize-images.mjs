#!/usr/bin/env node
/**
 * Image Optimization Script — Sorted Client Sites
 *
 * Scans public/images/, converts photographic PNGs/JPGs to WebP,
 * resizes oversized images, compresses, removes orphans, and reports savings.
 *
 * Doctrine: sorted/doctrine/image-optimization.md
 * Workflow: sorted/.devin/workflows/image-optimization.md
 *
 * Usage:
 *   node scripts/optimize-images.mjs              # optimize public/images/
 *   node scripts/optimize-images.mjs public/foo   # optimize additional dirs
 *
 * Requirements: sharp (npm install --save-dev sharp)
 */

import sharp from "sharp"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// ── Config ────────────────────────────────────────────────────

const QUALITY_WEBP = 82
const QUALITY_WEBP_ALPHA = 85
const PNG_COMPRESSION = 9
const JPG_QUALITY = 82

const MAX_DIMENSIONS = {
  hero: { width: 2400, patterns: ["hero", "agoodcatch-hero"] },
  banner: { width: 1600, patterns: ["sustainability", "get10percent", "mobile", "our-story", "benefits"] },
  card: { width: 800, patterns: ["bowl", "popular", "offer", "app-mockup"] },
}

const PROJECT_ROOT = process.cwd()
const IMAGE_DIRS = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ["public/images"]
const CODE_SEARCH_DIRS = ["app", "components", "lib"]

// ── Helpers ───────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
}

function isPhotographic(filename) {
  // If it's a JPG, it's photographic. For PNGs, check if they have no alpha or are large.
  return filename.endsWith(".jpg") || filename.endsWith(".jpeg")
}

async function hasAlpha(filePath) {
  try {
    const meta = await sharp(filePath).metadata()
    return meta.hasAlpha === true
  } catch {
    return false
  }
}

function getMaxWidth(filename) {
  const base = filename.toLowerCase()
  for (const [, config] of Object.entries(MAX_DIMENSIONS)) {
    if (config.patterns.some((p) => base.includes(p))) return config.width
  }
  return 1200 // default max
}

function getReferencedImages() {
  const referenced = new Set()
  for (const dir of CODE_SEARCH_DIRS) {
    const fullDir = path.join(PROJECT_ROOT, dir)
    if (!fs.existsSync(fullDir)) continue
    try {
      const output = execSync(
        `grep -rn '/images/' ${fullDir}/ --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' 2>/dev/null || true`,
        { encoding: "utf-8", maxBuffer: 1024 * 1024 * 10 }
      )
      const matches = output.match(/\/images\/[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp|svg)/g) || []
      matches.forEach((m) => {
        referenced.add(path.basename(m))
      })
    } catch {}
  }
  return referenced
}

// ── Main ──────────────────────────────────────────────────────

async function processImage(filePath) {
  const filename = path.basename(filePath)
  const ext = path.extname(filename).toLowerCase()
  const dir = path.dirname(filePath)
  const baseName = path.basename(filename, ext)

  const originalSize = fs.statSync(filePath).size
  let meta
  try {
    meta = await sharp(filePath).metadata()
  } catch (e) {
    return { filename, status: "error", error: e.message, originalSize, newSize: originalSize }
  }

  const maxWidth = getMaxWidth(filename)
  const needsResize = (meta.width || 0) > maxWidth
  const isPng = ext === ".png"
  const isJpg = ext === ".jpg" || ext === ".jpeg"

  // Determine target format
  // - JPGs → WebP (always photographic)
  // - PNGs → WebP (WebP supports alpha and is far smaller for photographic content)
  //   Exception: very small PNGs (<10KB) are likely logos/icons — keep as PNG
  const isSmallPng = isPng && originalSize < 10240
  const convertToWebp = (isJpg || isPng) && !isSmallPng
  const targetExt = convertToWebp ? ".webp" : ext
  const targetPath = path.join(dir, baseName + targetExt)

  let pipeline = sharp(filePath)

  // Resize if needed
  if (needsResize) {
    pipeline = pipeline.resize({
      width: maxWidth,
      withoutEnlargement: true,
    })
  }

  // Apply compression
  if (convertToWebp) {
    const hasAlpha = meta.hasAlpha === true
    pipeline = pipeline.webp({
      quality: hasAlpha ? QUALITY_WEBP_ALPHA : QUALITY_WEBP,
      effort: 4,
    })
  } else if (isPng) {
    pipeline = pipeline.png({
      compressionLevel: PNG_COMPRESSION,
      palette: true,
    })
  } else if (isJpg) {
    // Fallback if we're keeping JPG (shouldn't happen, but safe)
    pipeline = pipeline.jpeg({ quality: JPG_QUALITY, mozjpeg: true })
  }

  // Write output — use temp file when target is same path as source
  const samePath = path.resolve(targetPath) === path.resolve(filePath)
  const writePath = samePath ? targetPath + ".opt-tmp" : targetPath
  await pipeline.toFile(writePath)

  if (samePath) {
    fs.unlinkSync(filePath)
    fs.renameSync(writePath, targetPath)
  } else if (targetExt !== ext && fs.existsSync(filePath)) {
    // Converted to a new format — remove the original
    fs.unlinkSync(filePath)
  }

  const newSize = fs.statSync(targetPath).size
  const savings = (((originalSize - newSize) / originalSize) * 100).toFixed(1)

  return {
    filename,
    status: "optimized",
    originalSize,
    newSize,
    savings,
    converted: convertToWebp && targetExt !== ext,
    newFilename: baseName + targetExt,
    resized: needsResize,
    originalDims: `${meta.width}x${meta.height}`,
  }
}

async function main() {
  console.log("\n  Sorted Image Optimization")
  console.log("  ─────────────────────────\n")

  // Collect all images
  const allImages = []
  for (const imageDir of IMAGE_DIRS) {
    const fullDir = path.join(PROJECT_ROOT, imageDir)
    if (!fs.existsSync(fullDir)) {
      console.log(`  ⚠  Directory not found: ${imageDir}`)
      continue
    }
    const files = fs.readdirSync(fullDir)
    for (const file of files) {
      const ext = path.extname(file).toLowerCase()
      if ([".png", ".jpg", ".jpeg"].includes(ext)) {
        allImages.push(path.join(fullDir, file))
      }
    }
  }

  if (allImages.length === 0) {
    console.log("  No images found to optimize.\n")
    return
  }

  // Check for orphans
  const referenced = getReferencedImages()
  const orphans = allImages.filter((f) => !referenced.has(path.basename(f)))

  console.log(`  Found ${allImages.length} images`)
  console.log(`  Referenced in code: ${allImages.length - orphans.length}`)
  console.log(`  Orphaned (unreferenced): ${orphans.length}\n`)

  // Remove orphans
  if (orphans.length > 0) {
    console.log("  Removing orphaned images:")
    for (const orphan of orphans) {
      const size = fs.statSync(orphan).size
      console.log(`    ✗  ${path.basename(orphan)} (${formatBytes(size)}) — not referenced in code`)
      fs.unlinkSync(orphan)
    }
    console.log()
  }

  // Process remaining images
  const toProcess = allImages.filter((f) => !orphans.includes(f))
  const results = []
  let totalOriginal = 0
  let totalNew = 0

  console.log("  Optimizing images:\n")
  for (const filePath of toProcess) {
    process.stdout.write(`    →  ${path.basename(filePath)}... `)
    try {
      const result = await processImage(filePath)
      results.push(result)
      totalOriginal += result.originalSize
      totalNew += result.newSize

      if (result.status === "error") {
        console.log(`✗ ERROR: ${result.error}`)
      } else {
        const tags = []
        if (result.converted) tags.push(`→ ${result.newFilename.split(".").pop()}`)
        if (result.resized) tags.push(`resized from ${result.originalDims}`)
        const tagStr = tags.length > 0 ? ` [${tags.join(", ")}]` : ""
        console.log(`${formatBytes(result.originalSize)} → ${formatBytes(result.newSize)} (-${result.savings}%)${tagStr}`)
      }
    } catch (e) {
      console.log(`✗ ${e.message}`)
      results.push({ filename: path.basename(filePath), status: "error", error: e.message, originalSize: 0, newSize: 0 })
    }
  }

  // Summary
  console.log("\n  ─────────────────────────")
  console.log(`  Total before: ${formatBytes(totalOriginal)}`)
  console.log(`  Total after:  ${formatBytes(totalNew)}`)
  const totalSavings = totalOriginal > 0 ? (((totalOriginal - totalNew) / totalOriginal) * 100).toFixed(1) : 0
  console.log(`  Savings:      ${formatBytes(totalOriginal - totalNew)} (-${totalSavings}%)\n`)

  // List renamed files for code updates
  const renamed = results.filter((r) => r.converted)
  if (renamed.length > 0) {
    console.log("  ⚠  Code references to update (PNG/JPG → WebP):")
    for (const r of renamed) {
      console.log(`    ${r.filename} → ${r.newFilename}`)
    }
    console.log(`\n  Update src props in app/, components/, lib/ to use .webp extensions.\n`)
  }

  console.log("  Done.\n")
}

main().catch((err) => {
  console.error("\n  ✗ Fatal error:", err.message)
  process.exit(1)
})
