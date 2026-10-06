import { chromium } from '/Users/renaldoedmondson/.nvm/versions/node/v24.11.1/lib/node_modules/playwright/index.mjs'
const BASE = 'http://localhost:3000'
const SHOTS = '/Users/renaldoedmondson/Projects/sorted/artifacts/amp-electrical-workspace'
const results = []
let failures = 0
const check = (n, ok, d = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); if (!ok) failures++ }

const AMP_ROW = {"id":1836,"name":"A.M.P Electrical","website":"http://www.ampspark.co.uk/","owner_name":"Gary Palmer","review_summary":null,"site_analysis":null,"site_weaknesses":[],"mockup_url":null,"mockup_urls":null,"walkthrough_video_url":null,"screenshot_url":null,"crm_status":"new"}
const MURRAY_ROW = {id:1,name:"Murray Martin",website:"https://murraymartin.example",owner_name:"Murray",review_summary:null,site_analysis:null,site_weaknesses:[],mockup_url:null,mockup_urls:null,walkthrough_video_url:null,screenshot_url:null,crm_status:"new"}
const OTHER_ROW = {id:2,name:"Other Co",website:"https://other.example",owner_name:"O",review_summary:null,site_analysis:null,site_weaknesses:["weak one","weak two","weak three"],mockup_url:null,mockup_urls:null,walkthrough_video_url:null,screenshot_url:null,crm_status:"new"}

async function stubbed(page, slug) {
  const blocked = []
  await page.route(/supabase\.co/, async (route) => {
    const url = route.request().url()
    if (url.includes('/rest/v1/prospects')) {
      const row = slug === 'amp-electrical' ? AMP_ROW : slug === 'murray-martin' ? MURRAY_ROW : slug === 'other-co' ? OTHER_ROW : null
      if (row) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(row) })
      return route.fulfill({ status: 406, contentType: 'application/json', body: JSON.stringify({ message: 'no rows' }) })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
  await page.route(/buy\.stripe\.com|cal\.com|stripe\.js/, (route) => { blocked.push(route.request().url()); route.abort() })
  page.__blocked = blocked
}

const browser = await chromium.launch({ executablePath: '/Users/renaldoedmondson/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell' })

// ── Review screen ──────────────────────────────────────────────
for (const w of [1440, 768, 375, 320]) {
  const p = await browser.newPage({ viewport: { width: w, height: 900 } })
  await stubbed(p, 'amp-electrical')
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e)))
  await p.goto(`${BASE}/workspace/?slug=amp-electrical&route=review`, { waitUntil: 'networkidle' })
  check(`review ${w} business name`, (await p.locator('text=A.M.P Electrical').count()) > 0)
  check(`review ${w} authored headline`, (await p.locator('text=Your electrical expertise, easier to trust and contact.').count()) > 0)
  check(`review ${w} no overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
  if (w === 1440) {
    const img = p.locator('img[src*="amp-electrical-homepage-preview"]')
    check('preview image present', (await img.count()) > 0)
    if ((await img.count()) > 0) check('preview image loaded', await img.evaluate((i) => i.complete && i.naturalWidth > 0))
    check('review shows £2,000 not £3,000', (await p.locator('text=/£2,000|2000/').count()) > 0 && (await p.locator('text=/£3,000|3000/').count()) === 0)
    await p.screenshot({ path: `${SHOTS}/review-1440.png`, fullPage: true })
  }
  if (w === 375) await p.screenshot({ path: `${SHOTS}/review-375.png`, fullPage: true })
  check(`review ${w} no page errors`, errs.length === 0, errs.join(';').slice(0, 200))
  await p.close()
}

// ── Website screen: iframe → AMP 3999, h1, modal, no version picker ─
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await stubbed(p, 'amp-electrical')
  await p.goto(`${BASE}/workspace/?slug=amp-electrical&route=website`, { waitUntil: 'networkidle' })
  const frame = p.locator('iframe')
  const src = (await frame.count()) > 0 ? await frame.getAttribute('src') : null
  check('iframe points to AMP :3999', (src || '').startsWith('http://localhost:3999') && !(src || '').includes('murraymartin'), src || 'no iframe')
  if (src) {
    const f = p.frameLocator('iframe')
    const h1 = await f.locator('h1').textContent()
    check('iframe renders AMP h1', (h1 || '').includes('London electricians.'), h1 || '')
    await f.locator('header button[aria-haspopup="dialog"]').click()
    check('iframe callback modal opens', await f.locator('dialog[aria-labelledby="callback-title"]').evaluate((d) => d.open))
  }
  check('no version selector', (await p.locator('text=/Version 1|Version 2/').count()) === 0)
  await p.screenshot({ path: `${SHOTS}/website-1440.png`, fullPage: true })
  // mobile viewport: no overflow, still one preview
  await p.setViewportSize({ width: 375, height: 800 })
  await p.waitForTimeout(300)
  check('website 375 no overflow', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
  await p.screenshot({ path: `${SHOTS}/website-375.png`, fullPage: true })
  await p.close()
}

// ── Next steps + payment dialog ────────────────────────────────
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await stubbed(p, 'amp-electrical')
  await p.goto(`${BASE}/workspace/?slug=amp-electrical&route=next-steps`, { waitUntil: 'networkidle' })
  const body = await p.locator('body').textContent()
  check('next steps £2,000/£1,000/£1,000', /£2,000|2000/.test(body) && /£1,000|1000/.test(body) && !/£3,000|3000/.test(body))
  const ctaTexts = await p.locator('a,button').allTextContents()
  check('CTAs say next steps not a price', ctaTexts.some((t) => /next steps/i.test(t)) && !ctaTexts.some((t) => /£/.test(t) && /next steps/i.test(t)))
  // payment dialog
  const payBtn = p.locator('button:has-text("Pay"), a:has-text("Pay"), button:has-text("deposit"), a:has-text("deposit")').first()
  check('pay/deposit trigger present', (await payBtn.count()) > 0)
  if ((await payBtn.count()) > 0) await payBtn.click()
  await p.waitForTimeout(400)
  const dlgText = await p.locator('body').textContent()
  const stripeInDom = await p.locator('a[href*="stripe.com"]').count()
  check('no inherited stripe URL in DOM', stripeInDom === 0)
  check('card option shows coming soon/pending', /coming soon|available soon|card payment.*soon|soon/i.test(dlgText))
  check('bank transfer amount £1,000', /£1,000|1,000/.test(dlgText))
  check('bank ref uses workspace slug', /amp-electrical|AMP/i.test(dlgText))
  await p.screenshot({ path: `${SHOTS}/payment-dialog.png` })
  await p.keyboard.press('Escape')
  await p.waitForTimeout(300)
  await p.screenshot({ path: `${SHOTS}/next-steps-1440.png`, fullPage: true })
  // questions drawer recipient (open + inspect, no send)
  const q = p.locator('button:has-text("Question"), a:has-text("Question")').first()
  if ((await q.count()) > 0) {
    await q.click()
    await p.waitForTimeout(300)
    check('questions drawer has hello@sortmydigital.site', /hello@sortmydigital\.site/.test(await p.locator('body').textContent()))
    await p.keyboard.press('Escape')
  }
  // decline: open + cancel only
  const d = p.locator('text=/not interested/i').first()
  if ((await d.count()) > 0) {
    await d.click()
    await p.waitForTimeout(300)
    const cancel = p.locator('button:has-text("Cancel"), button:has-text("Keep"), button:has-text("Back")').first()
    check('decline confirm cancellable', (await cancel.count()) > 0)
    if ((await cancel.count()) > 0) await cancel.click()
  }
  await p.close()
}

// ── Isolation: murray override, default fixture, unknown slug ──
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await stubbed(p, 'murray-martin')
  await p.goto(`${BASE}/workspace/?slug=murray-martin&route=next-steps`, { waitUntil: 'networkidle' })
  const m = await p.locator('body').textContent()
  check('murray still £1,500/£750', /£1,500|1500/.test(m) && /£750|750/.test(m) && !/£2,000/.test(m))
  await p.close()

  const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await stubbed(p2, 'other-co')
  await p2.goto(`${BASE}/workspace/?slug=other-co&route=next-steps`, { waitUntil: 'networkidle' })
  const o = await p2.locator('body').textContent()
  check('default still £3,000/£1,500', /£3,000|3000/.test(o) && /£1,500|1500/.test(o) && !/£2,000/.test(o))
  await p2.close()

  const p3 = await browser.newPage()
  await stubbed(p3, 'unknown-slug')
  await p3.goto(`${BASE}/workspace/?slug=unknown-slug`, { waitUntil: 'networkidle' })
  check('unknown slug not found', /not found|couldn.t find|no workspace/i.test(await p3.locator('body').textContent()))
  await p3.close()
}

console.log(results.join('\n'))
console.log(`\n${results.length - failures}/${results.length} checks passed`)
await browser.close()
process.exit(failures ? 1 : 0)
