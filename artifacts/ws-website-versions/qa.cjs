const { chromium } = require('/Users/renaldoedmondson/.agents/skills/playwright/node_modules/playwright-core');
const fs = require('fs');
const EXE = '/Users/renaldoedmondson/.cache/puppeteer/chrome-headless-shell/mac_arm-152.0.7977.75/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const OUT = '/Users/renaldoedmondson/Projects/sorted/artifacts/ws-website-versions';
const V1 = 'https://6ac1b6191377cbff651147fb--murraymartin-services.netlify.app/';
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
  // Stub Supabase (prospects lookup + all event inserts)
  await ctx.route(/supabase\.co/, r => {
    if (r.request().url().includes('/prospects')) {
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MURRAY_ROW) });
    } else {
      r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });
  // Intercept immutable v1 deploy → known marker HTML (never hits network)
  await ctx.route(/6ac1b6191377cbff651147fb--murraymartin-services\.netlify\.app/, r =>
    r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><h1>V1-IMMUTABLE-MARKER</h1></body></html>' }));

  const murray = 'http://localhost:3000/workspace?slug=murray-martin&route=website';

  // ── Murray v2 default, selector mechanics (desktop 1440) ──
  const p = await ctx.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto(murray, { waitUntil: 'networkidle' }).catch(() => {});
  await p.waitForTimeout(1500);
  let src = await p.evaluate(() => document.querySelector('iframe')?.src);
  check('default-v2', src === 'http://localhost:3999/', src);
  const picker = await p.evaluate(() => {
    const g = document.querySelector('[role="group"][aria-label="Website version"]');
    if (!g) return null;
    return Array.from(g.querySelectorAll('button')).map(b => ({ t: b.textContent, pressed: b.getAttribute('aria-pressed') }));
  });
  check('picker-v1-v2', picker && picker.length === 2 && picker[1].pressed === 'true', JSON.stringify(picker));
  await p.screenshot({ path: `${OUT}/mm-v2-default-1440.png` });

  // click active V2 → no reload (src unchanged, still loaded)
  await p.click('[role="group"][aria-label="Website version"] >> button:has-text("V2")');
  await p.waitForTimeout(400);
  check('active-no-reload', (await p.evaluate(() => document.querySelector('iframe').src)) === 'http://localhost:3999/', '');

  // switch to V1 → iframe src changes, reloads marker content
  await p.click('[role="group"][aria-label="Website version"] >> button:has-text("V1")');
  await p.waitForTimeout(1200);
  src = await p.evaluate(() => document.querySelector('iframe').src);
  check('switch-v1-src', src === V1, src);
  const marker = await p.frameLocator('iframe').getByRole('heading', { name: 'V1-IMMUTABLE-MARKER' }).isVisible().catch(() => false);
  check('v1-loaded', marker === true, `marker=${marker}`);
  await p.screenshot({ path: `${OUT}/mm-v1-switched-1440.png` });

  // mobile viewport preserved across version switch
  await p.click('button:has-text("Mobile")');
  await p.waitForTimeout(500);
  const wBefore = await p.evaluate(() => document.querySelector('iframe').getBoundingClientRect().width);
  await p.click('[role="group"][aria-label="Website version"] >> button:has-text("V2")');
  await p.waitForTimeout(1500);
  const wAfter = await p.evaluate(() => document.querySelector('iframe').getBoundingClientRect().width);
  check('viewport-preserved', wBefore === 390 && wAfter === 390, `${wBefore}->${wAfter}`);
  await p.click('button:has-text("Desktop")');
  await p.close();

  // ── Single-row bar @375 and @320 ──
  for (const w of [375, 320]) {
    const m = await ctx.newPage();
    await m.setViewportSize({ width: w, height: 812 });
    await m.goto(murray, { waitUntil: 'networkidle' }).catch(() => {});
    await m.waitForTimeout(1200);
    const row = await m.evaluate(() => {
      const els = Array.from(document.querySelectorAll('main button, main select')).filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().y < 60);
      const bar = els[0]?.closest('div');
      return {
        tops: [...new Set(els.map(e => Math.round(e.getBoundingClientRect().y)))],
        centers: [...new Set(els.map(e => Math.round(e.getBoundingClientRect().y + e.getBoundingClientRect().height / 2)))],
        count: els.length,
        sel: !!document.querySelector('select[aria-label="Website version"]'),
        back: els.some(e => e.textContent.includes('Back to Review')),
        askLabel: !!document.querySelector('button[aria-label="Ask a question"]'),
        compAria: document.querySelector('button[aria-label^="Complete this site"]')?.getAttribute('aria-label'),
        hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        barOverflow: bar ? bar.scrollWidth > bar.clientWidth : false,
      };
    });
    check(`single-row-${w}`, row.centers.length === 1 && row.count >= 4, JSON.stringify(row.centers) + ' n=' + row.count);
    check(`controls-${w}`, row.sel && row.back && row.askLabel && row.compAria.includes('£'), JSON.stringify(row.compAria));
    check(`no-overflow-${w}`, !row.hscroll && !row.barOverflow, '');
    await m.screenshot({ path: `${OUT}/mm-bar-${w}.png` });
    await m.close();
  }

  // ── Keyboard: V1 button focusable/operable ──
  const k = await ctx.newPage();
  await k.setViewportSize({ width: 1440, height: 900 });
  await k.goto(murray, { waitUntil: 'networkidle' }).catch(() => {});
  await k.waitForTimeout(1200);
  await k.focus('[role="group"][aria-label="Website version"] >> button:has-text("V1")');
  await k.keyboard.press('Enter');
  await k.waitForTimeout(900);
  check('keyboard-switch', (await k.evaluate(() => document.querySelector('iframe').src)) === V1, '');
  await k.close();

  // ── No-selector fallback: nexus demo has no versions ──
  const n = await ctx.newPage();
  await n.setViewportSize({ width: 1440, height: 900 });
  await n.goto('http://localhost:3000/workspace?slug=nexus-accounting&route=website', { waitUntil: 'networkidle' }).catch(() => {});
  await n.waitForTimeout(1000);
  const np = await n.evaluate(() => ({
    picker: !!document.querySelector('[aria-label="Website version"]'),
    iframe: document.querySelector('iframe')?.src,
  }));
  check('no-picker-no-versions', !np.picker && !!np.iframe, JSON.stringify(np));
  await n.close();

  await b.close();
  const pass = results.every(r => r.p);
  fs.writeFileSync(`${OUT}/qa-checks.json`, JSON.stringify({ pass, results }, null, 2));
  console.log('OVERALL', pass ? 'PASS' : 'FAIL');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
