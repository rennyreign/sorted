const { chromium } = require('/Users/renaldoedmondson/.agents/skills/playwright/node_modules/playwright-core');
const EXE = '/Users/renaldoedmondson/.cache/puppeteer/chrome-headless-shell/mac_arm-152.0.7977.75/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const OUT = '/Users/renaldoedmondson/Projects/sorted/artifacts/ws-review-snapshot';
const results = [];
const check = (n, p, d) => { results.push({ n, p, d }); console.log(p ? 'PASS' : 'FAIL', n, d ?? ''); };

const MURRAY_ROW = [{
  id: 999, name: 'Murray Martin Services Ltd',
  website: 'https://murraymartinservices.co.uk', owner_name: null,
  review_summary: null, site_analysis: null, site_weaknesses: null,
  mockup_url: null, mockup_urls: null, walkthrough_video_url: null,
  screenshot_url: null, crm_status: 'review',
}];

const EXPECTED = [
  'Three decades of trust, now turning into enquiries.',
  'Murray Martin has traded since 1995',
  'Reputation made visible',
  'Proof where buyers look',
  'Trust that turns into enquiries',
];
const BANNED = ['£69', 'layout', 'CTA', 'mockup', 'design direction', 'redesign'];

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

  const url = 'http://localhost:3000/workspace?slug=murray-martin&route=review';

  for (const w of [1440, 375]) {
    const p = await ctx.newPage();
    await p.setViewportSize({ width: w, height: 900 });
    await p.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
    await p.waitForTimeout(1500);
    const body = await p.evaluate(() => document.body.innerText);
    for (const t of EXPECTED) check(`copy-${w}:${t.slice(0, 30)}`, body.includes(t), '');
    for (const t of BANNED) check(`banned-${w}:${t}`, !body.includes(t), '');
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    check(`no-overflow-${w}`, !overflow, '');
    const imgOk = await p.evaluate(() => {
      const i = document.querySelector('img');
      return i && i.complete && i.naturalWidth > 0;
    });
    check(`preview-img-${w}`, imgOk === true, '');
    await p.screenshot({ path: `${OUT}/review-copy-${w}.png`, fullPage: true });
    await p.close();
  }

  await b.close();
  require('fs').writeFileSync(`${OUT}/qa-copy-checks.json`, JSON.stringify(results, null, 2));
  const fails = results.filter(r => !r.p).length;
  console.log(`\n${results.length - fails}/${results.length} PASS`);
  process.exit(fails ? 1 : 0);
})();
