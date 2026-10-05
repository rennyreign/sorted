const { chromium } = require('/Users/renaldoedmondson/.agents/skills/playwright/node_modules/playwright-core');
const fs = require('fs');
const EXE = '/Users/renaldoedmondson/.cache/puppeteer/chrome-headless-shell/mac_arm-152.0.7977.75/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const OUT = '/Users/renaldoedmondson/Projects/sorted/artifacts/ws-website-versions';
const results = [];
const check = (n, p, d) => { results.push({ n, p, d }); console.log(p ? 'PASS' : 'FAIL', n, d ?? ''); };

const MURRAY_ROW = [{
  id: 999, name: 'Murray Martin Services Ltd',
  website: 'https://murraymartinservices.co.uk', owner_name: null,
  review_summary: null, site_analysis: null, site_weaknesses: null,
  mockup_url: null, mockup_urls: null, walkthrough_video_url: null,
  screenshot_url: null, crm_status: 'review',
}];

(async () => {
  const b = await chromium.launch({ headless: true, executablePath: EXE });
  const ctx = await b.newContext({ ignoreHTTPSErrors: true });
  await ctx.route(/supabase\.co/, r => {
    if (r.request().url().includes('/prospects')) {
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MURRAY_ROW) });
    } else {
      r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });
  await ctx.route(/6ac1b6191377cbff651147fb--murraymartin-services\.netlify\.app/, r =>
    r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><h1>V1-IMMUTABLE-MARKER</h1></body></html>' }));

  const murray = 'http://localhost:3000/workspace?slug=murray-martin&route=website';
  const p = await ctx.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto(murray, { waitUntil: 'networkidle' }).catch(() => {});
  await p.waitForTimeout(1500);
  const frame = p.frameLocator('iframe');

  // V2 heading visible by default
  const v2Heading = await frame.locator('h1').textContent().catch(() => null);
  check('v2-heading', v2Heading && v2Heading.includes('Critical power'), v2Heading);

  // Switch to V1 → marker heading visible, iframe visible, skeleton absent
  await p.click('[role="group"][aria-label="Website version"] >> button:has-text("V1")');
  await p.waitForTimeout(1200);
  const markerVisible = await frame.getByRole('heading', { name: 'V1-IMMUTABLE-MARKER' }).isVisible().catch(() => false);
  const iframeVisible = await p.evaluate(() => {
    const f = document.querySelector('iframe');
    return f && !f.classList.contains('invisible') && f.getBoundingClientRect().width > 0;
  });
  const skeletonGone = await p.evaluate(() => !document.querySelector('.animate-pulse'));
  check('v1-loaded', markerVisible && iframeVisible && skeletonGone, `marker=${markerVisible} iframe=${iframeVisible} skelGone=${skeletonGone}`);

  // Switch back to V2 → real heading returns
  await p.click('[role="group"][aria-label="Website version"] >> button:has-text("V2")');
  await p.waitForTimeout(1800);
  const back = await frame.locator('h1').textContent().catch(() => null);
  check('v2-restored', back && back.includes('Critical power'), back);
  await p.close();

  // Singleton version: no picker, but version URL still drives iframe
  const s = await ctx.newPage();
  await s.setViewportSize({ width: 1440, height: 900 });
  await s.goto('http://localhost:3000/workspace?slug=nexus-single-version&route=website', { waitUntil: 'networkidle' }).catch(() => {});
  await s.waitForTimeout(1200);
  const sv = await s.evaluate(() => ({
    picker: !!document.querySelector('[aria-label="Website version"]'),
    src: document.querySelector('iframe')?.src,
  }));
  check('singleton-no-picker', !sv.picker, JSON.stringify(sv));
  check('singleton-url', sv.src === 'http://localhost:3999/', sv.src);
  await s.close();

  await b.close();
  const pass = results.every(r => r.p);
  fs.writeFileSync(`${OUT}/qa-checks-2.json`, JSON.stringify({ pass, results }, null, 2));
  console.log('OVERALL', pass ? 'PASS' : 'FAIL');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
