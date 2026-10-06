import { chromium } from '/Users/renaldoedmondson/.nvm/versions/node/v24.11.1/lib/node_modules/playwright/index.mjs'
const BASE = 'http://localhost:3000'
const SHOTS = '/Users/renaldoedmondson/Projects/sorted/artifacts/seem-workspace'
const results = []
let failures = 0
const check = (n, ok, d = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); if (!ok) failures++ }

const SEEM_ROW = { id: 2001, name: "SEEM Electrical Ltd", website: "https://www.facebook.com/seemelectrical", owner_name: "Saimir Dollapaj", review_summary: null, site_analysis: null, site_weaknesses: [], mockup_url: null, mockup_urls: null, walkthrough_video_url: null, screenshot_url: null, crm_status: "new" }

async function stubbed(page) {
  await page.route(/supabase\.co/, (route) => {
    const url = route.request().url()
    if (url.includes('/rest/v1/prospects')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SEEM_ROW) })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
}

const browser = await chromium.launch({ executablePath: '/Users/renaldoedmondson/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell' })

for (const w of [1440, 375, 320]) {
  const p = await browser.newPage({ viewport: { width: w, height: 900 } })
  await stubbed(p)
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e)))
  await p.goto(`${BASE}/workspace/?slug=seem-electrical-ltd&route=review`, { waitUntil: 'networkidle' })
  const text = await p.locator('body').innerText()
  check(`review ${w} new headline`, text.includes('finally easy to find'))
  check(`review ${w} "We built" not "rebuilt"`, text.includes('We built your site') && !text.includes('We rebuilt your site'))
  check(`review ${w} Facebook angle`, /facebook/i.test(text))
  check(`review ${w} gap column label`, /your facebook page/i.test(text))
  check(`review ${w} no "old site" claims`, !text.includes('dated website'))
  check(`review ${w} £2,000 band`, /£2,000|2000/.test(text))
  check(`review ${w} no quote pending`, !/quote pending/i.test(text))
  check(`review ${w} no errors`, errs.length === 0, errs.join('; '))
  check(`review ${w} no overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
  if (w === 1440) await p.screenshot({ path: `${SHOTS}/review-v2-1440.png`, fullPage: true })
  await p.close()
}

// Next steps — now shows the £1,000 deposit path, no pending copy
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await stubbed(p)
await p.goto(`${BASE}/workspace/?slug=seem-electrical-ltd&route=next-steps`, { waitUntil: 'networkidle' })
const text = await p.locator('body').innerText()
check('next-steps £2,000 total', /£2,000/.test(text))
check('next-steps £1,000 deposit', /£1,000/.test(text))
check('next-steps no pending copy', !/quote pending|scope, price and deposit/i.test(text))
check('next-steps pay button', /pay £1,000 deposit/i.test(text))
check('next-steps no stripe leak', !(await p.locator('a[href*="stripe"], iframe[src*="stripe"]').count()))
check('next-steps bank transfer available', /bank/i.test(text))
await p.screenshot({ path: `${SHOTS}/next-steps-v2-1440.png`, fullPage: true })
await p.close()

await browser.close()
console.log(results.join('\n'))
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures ? 1 : 0)
