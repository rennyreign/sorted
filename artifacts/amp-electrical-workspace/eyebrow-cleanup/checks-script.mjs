import { chromium } from '/Users/renaldoedmondson/.nvm/versions/node/v24.11.1/lib/node_modules/playwright/index.mjs'
const BASE = 'http://localhost:3000'
const SHOTS = '/Users/renaldoedmondson/Projects/sorted/artifacts/amp-electrical-workspace/eyebrow-cleanup'
const results = []
let failures = 0
const check = (n, ok, d = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); if (!ok) failures++ }
const AMP_ROW = JSON.parse('{"id":1836,"name":"A.M.P Electrical","website":"http://www.ampspark.co.uk/","owner_name":"Gary Palmer","review_summary":null,"site_analysis":null,"site_weaknesses":[],"mockup_url":null,"mockup_urls":null,"walkthrough_video_url":null,"screenshot_url":null,"crm_status":"new"}')
async function stub(p) {
  await p.route(/supabase\.co/, (r) => {
    if (r.request().url().includes('/rest/v1/prospects')) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(AMP_ROW) })
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
  await p.route(/buy\.stripe\.com|cal\.com|stripe\.js/, (r) => r.abort())
}
const browser = await chromium.launch({ executablePath: '/Users/renaldoedmondson/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell' })

for (const w of [1440, 375, 320]) {
  const p = await browser.newPage({ viewport: { width: w, height: 900 } })
  await stub(p)
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e)))
  await p.goto(`${BASE}/workspace/?slug=amp-electrical&route=review`, { waitUntil: 'networkidle' })
  const body = await p.locator('body').textContent()
  check(`review ${w} 'Prepared for' absent`, !body.includes('Prepared for'))
  check(`review ${w} client name in header`, /A\.M\.P Electrical/.test(await p.locator('header').textContent()))
  check(`review ${w} headline remains`, body.includes('Your electrical expertise, easier to trust and contact.'))
  check(`review ${w} summary remains`, body.includes('announcement first'))
  check(`review ${w} reveal image loaded`, (await p.locator('img[src*="amp-electrical-homepage-preview"]').count()) === 1 && await p.locator('img[src*="amp-electrical-homepage-preview"]').evaluate((i) => i.complete && i.naturalWidth > 0))
  check(`review ${w} no overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
  await p.screenshot({ path: `${SHOTS}/review-${w}.png`, fullPage: true })

  // navigate to website preview and back
  await p.locator('button:has-text("Explore your new site")').click()
  await p.waitForTimeout(400)
  check(`review ${w} explore→website iframe`, await p.locator('iframe').evaluate((f) => (f.src || '').startsWith('http://localhost:3999')))
  await p.locator('button:has-text("Back to Review")').click()
  await p.waitForTimeout(400)
  check(`review ${w} back returns headline`, (await p.locator('body').textContent()).includes('easier to trust and contact'))

  // next steps
  await p.locator('button:has-text("See next steps")').click()
  await p.waitForTimeout(400)
  const nb = await p.locator('body').textContent()
  check(`next ${w} 'Your completion offer' absent`, !nb.includes('Your completion offer'))
  check(`next ${w} 'Ready to get started?' absent`, !nb.includes('Ready to get started?'))
  check(`next ${w} h1 is page heading`, (await p.locator('h1').textContent()).includes('Complete your website.'))
  const h2s = await p.locator('h2').allTextContents()
  check(`next ${w} useful h2s present`, h2s.some((t) => t.includes("What's included")) && h2s.some((t) => t.includes('How it works')), JSON.stringify(h2s.map((t) => t.trim())))
  check(`next ${w} £2,000/£1,000/£1,000`, /£2,000/.test(nb) && /£1,000/.test(nb) && !/£3,000/.test(nb))
  check(`next ${w} no overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
  // payment dialog: coming-soon preserved, Escape closes
  await p.locator('button:has-text("Pay £1,000 deposit")').first().click()
  await p.waitForTimeout(350)
  check(`next ${w} payment dialog coming soon`, /coming soon/i.test(await p.locator('body').textContent()))
  await p.keyboard.press('Escape')
  await p.waitForTimeout(250)
  check(`next ${w} dialog closed`, !/Choose a deposit payment method|Payment options/.test(await p.locator('[role="dialog"]').textContent().catch(() => '')))
  await p.screenshot({ path: `${SHOTS}/next-steps-${w}.png`, fullPage: true })
  check(`next ${w} no page errors`, errs.length === 0, errs.join(';').slice(0, 150))
  await p.close()
}

console.log(results.join('\n'))
console.log(`\n${results.length - failures}/${results.length} checks passed`)
await browser.close()
process.exit(failures ? 1 : 0)
