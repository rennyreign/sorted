// Crop image regions from the mockup using sharp.
import fs from 'fs'
import path from 'path'
import sharp from '/Users/renaldoedmondson/Projects/sorted/node_modules/sharp/lib/index.js'

const BUILD_DIR = '/Users/renaldoedmondson/Projects/nexus-accounting'
const MOCKUP = path.join(BUILD_DIR, 'input/approved-mockup.png')
const REGIONS = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, 'artifacts/regions.json'), 'utf8'))
const OUT_DIR = path.join(BUILD_DIR, 'artifacts/regions')

const imageRegions = REGIONS.regions.filter(r => r.type === 'image')
console.log(`Cropping ${imageRegions.length} image regions...`)

for (const r of imageRegions) {
  const { x, y, w, h } = r.bbox
  const outPath = path.join(OUT_DIR, `${r.id}.png`)
  try {
    await sharp(MOCKUP)
      .extract({ left: Math.max(0, x), top: Math.max(0, y), width: Math.min(w, 863 - x), height: Math.min(h, 1823 - y) })
      .toFile(outPath)
    console.log(`  ✓ ${r.id} → ${outPath}`)
  } catch (e) {
    console.error(`  ✗ ${r.id}: ${e.message}`)
  }
}

console.log('Done.')
