// Capture screenshots at 390px, 768px, 1440px using Playwright
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BUILD_DIR = '/Users/renaldoedmondson/Projects/nexus-accounting'
const OUT_DIR = path.join(BUILD_DIR, 'artifacts/regions/screenshots')
fs.mkdirSync(OUT_DIR, { recursive: true })

const viewports = [
  { width: 390, height: 844, name: 'screenshot-390.png' },
  { width: 768, height: 1024, name: 'screenshot-768.png' },
  { width: 1440, height: 900, name: 'screenshot-1440.png' },
]

const browser = await chromium.launch()

for (const vp of viewports) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
  })

  await page.goto('http://localhost:3999/', { waitUntil: 'networkidle' })

  // Scroll to bottom to trigger lazy-loaded images
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let total = 0
      const step = () => {
        window.scrollBy(0, 300)
        total += 300
        if (total >= document.body.scrollHeight) {
          window.scrollTo(0, 0)
          resolve(null)
        } else {
          setTimeout(step, 50)
        }
      }
      step()
    })
  })
  await page.waitForTimeout(1000)

  // Full page screenshot
  await page.screenshot({
    path: path.join(OUT_DIR, vp.name),
    fullPage: true,
  })

  // Check for horizontal scroll
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth
  })

  // Check that all images loaded
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'))
    return imgs.filter(img => img.naturalWidth === 0).map(img => img.src)
  })

  // Check section presence
  const sections = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('section[id]')).map(s => s.id)
  })

  // Check CTAs
  const ctaCount = await page.evaluate(() => {
    return document.querySelectorAll('a[href="#contact"], a[href*="tel:"], a[href*="mailto:"]').length
  })

  console.log(`\n${vp.name} (${vp.width}px):`)
  console.log(`  Horizontal scroll: ${hasHorizontalScroll ? 'YES (issue!)' : 'No'}`)
  console.log(`  Broken images: ${brokenImages.length}`)
  if (brokenImages.length > 0) brokenImages.forEach(src => console.log(`    - ${src}`))
  console.log(`  Sections found: ${sections.join(', ')}`)
  console.log(`  CTA/contact links: ${ctaCount}`)

  await page.close()
}

await browser.close()
console.log('\nDone.')
