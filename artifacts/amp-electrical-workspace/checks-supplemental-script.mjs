import { chromium } from '/Users/renaldoedmondson/.nvm/versions/node/v24.11.1/lib/node_modules/playwright/index.mjs'
const BASE = 'http://localhost:3000'
const SHOTS = '/Users/renaldoedmondson/Projects/sorted/artifacts/amp-electrical-workspace'
const results = []
let failures = 0
const check = (n, ok, d = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); if (!ok) failures++ }
const AMP_ROW = {"id":1836,"name":"A.M.P Electrical","website":"http://www.ampspark.co.uk/","owner_name":"Gary Palmer","review_summary":null,"site_analysis":null,"site_weaknesses":[],"mockup_url":null,"mockup_urls":null,"walkthrough_video_url":null,"screenshot_url":null,"crm_status":"new"}
async function stub(page) {
  await page.route(/supabase\.co/, async (route) => {
    const url = route.request().url()
    if (url.includes('/rest/v1/prospects')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(AMP_ROW) })
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
  await page.route(/buy\.stripe\.com|cal\.com|stripe\.js/, (route) => route.abort())
}
const browser = await chromium.launch({ executablePath: '/Users/renaldoedmondson/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell' })

// ── Website screen at all widths ───────────────────────────────
for (const w of [1440, 768, 375, 320]) {
  const p = await browser.newPage({ viewport: { width: w, height: 900 } })
  await stub(p)
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e)))
  await p.goto(`${BASE}/workspace/?slug=amp-electrical&route=website`, { waitUntil: 'networkidle' })
  const frame = p.locator('iframe')
  const src = await frame.getAttribute('src')
  check(`website ${w} iframe→AMP3999`, (src || '').startsWith('http://localhost:3999'), src || '')
  const fb = await frame.boundingBox()
  check(`website ${w} iframe full-bleed width`, fb && fb.width >= w - 8, `w=${fb?.width}`)
  check(`website ${w} no overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
  // black action bar present, single row, no wrap/overflow
  const bar = p.locator('button:has-text("Back to Review")').locator('..')
  const barBox = (await bar.count()) > 0 ? await bar.boundingBox() : null
  check(`website ${w} action bar present single-row`, barBox && barBox.height <= 70 && barBox.width <= w + 1, JSON.stringify(barBox))
  // desktop/mobile preview toggle where available (>=640)
  const vp = p.locator('select, [role="group"][aria-label="Preview viewport"]').first()
  const hasToggle = (await vp.count()) > 0 && await vp.isVisible()
  check(`website ${w} viewport toggle ${w >= 640 ? 'present' : 'absent-ok'}`, w >= 640 ? hasToggle : true, `visible=${hasToggle}`)
  // iframe renders AMP
  const f = p.frameLocator('iframe')
  check(`website ${w} iframe AMP h1`, ((await f.locator('h1').textContent()) || '').includes('London electricians.'))
  check(`website ${w} no page errors`, errs.length === 0, errs.join(';').slice(0, 150))
  await p.screenshot({ path: `${SHOTS}/website-${w}.png`, fullPage: true })
  await p.close()
}

// ── Next steps at all widths + payment dialog + question drawer ─
for (const w of [1440, 768, 375, 320]) {
  const p = await browser.newPage({ viewport: { width: w, height: 900 } })
  await stub(p)
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e)))
  await p.goto(`${BASE}/workspace/?slug=amp-electrical&route=next-steps`, { waitUntil: 'networkidle' })
  const body = await p.locator('body').textContent()
  check(`next ${w} £2,000/£1,000/£1,000`, /£2,000|2000/.test(body) && /£1,000|1000/.test(body) && !/£3,000/.test(body))
  check(`next ${w} no overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))

  const payBtn = p.locator('button:has-text("Pay"), button:has-text("deposit"), a:has-text("Pay"), a:has-text("deposit")').first()
  await payBtn.click()
  await p.waitForTimeout(350)
  const dlg = p.locator('[role="dialog"], dialog, [class*="modal"]').first()
  const dt = await p.locator('body').textContent()
  check(`next ${w} payment dialog opens`, /coming soon|bank transfer|payment options/i.test(dt))
  check(`next ${w} card option coming soon`, /coming soon/i.test(dt))
  check(`next ${w} no stripe URL`, (await p.locator('a[href*="stripe.com"]').count()) === 0)
  // open the bank transfer pane for details
  await p.locator('button:has-text("Pay by bank transfer")').click()
  await p.waitForTimeout(300)
  const bt = await p.locator('body').textContent()
  check(`next ${w} bank details visible`, /52-30-02/.test(bt) && /30189489/.test(bt) && /NatWest/.test(bt))
  check(`next ${w} bank amount £1,000.00`, /1,000\.00/.test(bt))
  check(`next ${w} reference uses slug`, /amp[- ]electrical/i.test(bt))
  check(`next ${w} dialog no overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
  await p.screenshot({ path: `${SHOTS}/payment-dialog-${w}.png` })
  // Escape closes; if not, try X button
  await p.keyboard.press('Escape')
  await p.waitForTimeout(300)
  let still = /52-30-02/.test(await p.locator('body').textContent())
  if (still) {
    const x = p.locator('[role="dialog"] button[aria-label*="lose" i], button:has-text("×"), [role="dialog"] button:has(svg)').first()
    if ((await x.count()) > 0) await x.click()
    await p.waitForTimeout(250)
    still = /52-30-02/.test(await p.locator('body').textContent())
    check(`next ${w} dialog closes (X)`, !still)
  } else {
    check(`next ${w} dialog closes (Escape)`, true)
  }

  // question drawer open/close, no send
  const q = p.locator('button:has-text("Question"), a:has-text("Question")').first()
  await q.click()
  await p.waitForTimeout(300)
  check(`next ${w} question drawer opens`, /hello@sortmydigital\.site/.test(await p.locator('body').textContent()))
  await p.keyboard.press('Escape')
  await p.waitForTimeout(250)
  check(`next ${w} no page errors`, errs.length === 0, errs.join(';').slice(0, 150))
  await p.screenshot({ path: `${SHOTS}/next-steps-${w}.png`, fullPage: true })
  await p.close()
}

console.log(results.join('\n'))
console.log(`\n${results.length - failures}/${results.length} checks passed`)
await browser.close()
process.exit(failures ? 1 : 0)
