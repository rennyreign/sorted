// Build asset-registry.json from assets-raw/manifest.json
// Copies assets to the site's public/images/home/ directory and creates the registry.

import fs from 'fs'
import path from 'path'

const BUILD_DIR = '/Users/renaldoedmondson/Projects/nexus-accounting'
const RAW_MANIFEST = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, 'artifacts/assets-raw/manifest.json'), 'utf8'))
const DECON = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, 'artifacts/deconstruction.json'), 'utf8'))

const PUB_IMAGES = path.join(BUILD_DIR, 'public/images/home')
fs.mkdirSync(PUB_IMAGES, { recursive: true })

// Map asset_id → section from deconstruction
const sectionMap = {}
for (const a of DECON.assets) {
  sectionMap[a.id] = a.section || 'home'
}

const registry = []

for (const asset of RAW_MANIFEST.assets) {
  if (asset.status !== 'ok') continue

  const id = asset.id
  const section = sectionMap[id] || 'home'
  const prodName = id.replace(/_/g, '-')
  const prodPath = `/images/home/${prodName}.webp`

  // Copy original to public/images/home/
  const srcOriginal = path.join(BUILD_DIR, 'artifacts/assets-raw', asset.files.original)
  const destOriginal = path.join(PUB_IMAGES, `${prodName}.webp`)
  fs.copyFileSync(srcOriginal, destOriginal)

  // Also copy variants to public/images/home/variants/
  const variants = {}
  for (const [variant, relPath] of Object.entries(asset.files)) {
    const src = path.join(BUILD_DIR, 'artifacts/assets-raw', relPath)
    if (fs.existsSync(src)) {
      variants[variant] = relPath
    }
  }

  registry.push({
    asset_id: id,
    production_path: prodPath,
    file_path: destOriginal,
    format: 'webp',
    variants,
    width: asset.meta.width,
    height: asset.meta.height,
    aspect_ratio: asset.meta.aspect_ratio,
    source_model: asset.meta.source_model,
    ai_placeholder_human: false,
    section,
  })
}

const registryArtifact = {
  generated_at: new Date().toISOString(),
  assets: registry,
}

const outPath = path.join(BUILD_DIR, 'artifacts/asset-registry.json')
fs.writeFileSync(outPath, JSON.stringify(registryArtifact, null, 2))

console.log(`Wrote ${outPath}`)
console.log(`Registry entries: ${registry.length}`)
for (const r of registry) {
  console.log(`  ${r.asset_id} → ${r.production_path} (${r.width}x${r.height})`)
}
