import { chromium } from '/Users/renaldoedmondson/.nvm/versions/node/v24.11.1/lib/node_modules/playwright/index.mjs'
const BASE = 'http://localhost:3000'
const SHOTS = '/Users/renaldoedmondson/Projects/sorted/artifacts/seem-workspace'
const results = []
let failures = 0
const check = (n, ok, d = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); if (!ok) failures++ }

const SEEM_ROW = { id: 2001, name: "SEEM Electrical Ltd", website: "https://sitelift.site/seemelectricalltd/", owner_name: "Saimir Dollapaj", review_summary: null, site_analysis: null, site_weaknesses: [], mockup_url: null, mockup_urls: null, walkthrough_video_url: null, screenshot_url: null, crm_status: "new" }

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

for (const w of [1440, 768, 375, 320]) {
  const p = await browser.newPage({ viewport: { width: w, height: 900 } })
  await stubbed(p)
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e)))
  await p.goto(`${BASE}/workspace/?slug=seem-electrical-ltd&route=review`, { waitUntil: 'networkidle' })
  const text = await p.locator('body').innerText()
  check(`review ${w} heading 1`, text.includes('Why we rebuilt it'))
  check(`review ${w} heading 2`, text.includes('improved'))
  check(`review ${w} strength copy`, text.includes('Two decades of domestic and commercial electrical work'))
  check(`review ${w} dated-design gap`, text.includes('dated website'))
  check(`review ${w} reviews gap`, text.includes('No reviews on show'))
  check(`review ${w} phone-only gap`, text.includes('missed callers'))
  check(`review ${w} improvement copy`, text.includes('Recognisable from the first visit'))
  check(`review ${w} no page errors`, errs.length === 0, errs.join('; '))
  check(`review ${w} no overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
  if (w === 1440) {
    check('column labels', text.includes('Your business') && text.includes('Your old site'))
    await p.screenshot({ path: `${SHOTS}/review-split-1440.png`, fullPage: true })
  }
  if (w === 375) await p.screenshot({ path: `${SHOTS}/review-split-375.png`, fullPage: true })
  await p.close()
}

// Fallback: prospect with weaknesses but no authored reasons → single-column gap list, no "improved" section
const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await p2.route(/supabase\.co/, (route) => {
  const url = route.request().url()
  if (url.includes('/rest/v1/prospects')) {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...SEEM_ROW, name: 'Fallback Co', review_slug: 'fallback-co', website: 'https://fb.example' }) })
  }
  return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
})
await p2.goto(`${BASE}/workspace/?slug=fallback-co&route=review`, { waitUntil: 'networkidle' })
const t2 = await p2.locator('body').innerText()
check('fallback renders review', t2.includes('Fallback Co'))
check('fallback no improved section', !t2.includes("improved"))
await p2.close()

await browser.close()
console.log(results.join('\n'))
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures ? 1 : 0)
