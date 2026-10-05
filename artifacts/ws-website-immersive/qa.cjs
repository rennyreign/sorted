const { chromium } = require('/Users/renaldoedmondson/.agents/skills/playwright/node_modules/playwright-core');
const fs = require('fs');
const EXE = '/Users/renaldoedmondson/.cache/puppeteer/chrome-headless-shell/mac_arm-152.0.7977.75/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const BASE = 'http://localhost:3000/workspace?slug=nexus-accounting&route=website';
const OUT = '/Users/renaldoedmondson/Projects/sorted/artifacts/ws-website-immersive';
const results = [];
const check = (n, p, d) => { results.push({ n, p, d }); console.log(p ? 'PASS' : 'FAIL', n, d ?? ''); };

(async () => {
  const b = await chromium.launch({ headless: true, executablePath: EXE });
  const ctx = await b.newContext();
  // Stub Supabase so no real workspace_events inserts leave the machine
  await ctx.route('**supabase.co**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));

  for (const [w, h, tag] of [[1440, 900, '1440'], [375, 812, '375']]) {
    const p = await ctx.newPage();
    await p.setViewportSize({ width: w, height: h });
    await p.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
    await p.waitForTimeout(1200);
    const g = await p.evaluate(() => {
      const bar = document.querySelector('main > div > div'); // action bar
      const r = bar.getBoundingClientRect();
      const iframe = document.querySelector('iframe');
      const ir = iframe ? iframe.getBoundingClientRect() : null;
      return {
        bar: { x: r.x, y: r.y, w: r.width, h: r.height },
        iframe: ir ? { w: ir.width } : null,
        hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        hasHeader: !!document.querySelector('header'),
        barText: bar.innerText.replace(/\s+/g, ' ').trim(),
      };
    });
    check(`actionbar-top-${tag}`, g.bar.x === 0 && g.bar.y === 0 && g.bar.w === w, JSON.stringify(g.bar));
    check(`no-workspace-header-${tag}`, !g.hasHeader, '');
    check(`no-hscroll-${tag}`, !g.hscroll, '');
    if (w === 1440) check(`iframe-fullwidth-${tag}`, g.iframe && g.iframe.w === w, JSON.stringify(g.iframe));
    await p.screenshot({ path: `${OUT}/website-${tag}.png` });

    if (w === 375) {
      // single-row controls: ask icon-only, complete compact
      const row = await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('main button')).filter(b => b.getBoundingClientRect().width > 0);
        const tops = btns.filter(b => b.getBoundingClientRect().y < 60).map(b => Math.round(b.getBoundingClientRect().y));
        return { tops: [...new Set(tops)], count: tops.length };
      });
      check(`mobile-single-row`, row.tops.length === 1 && row.count >= 3, JSON.stringify(row));
    } else {
      // desktop: toggle to mobile viewport → preview should cap at 390px
      await p.click('button:has-text("Mobile")');
      await p.waitForTimeout(500);
      const iw = await p.evaluate(() => document.querySelector('iframe')?.getBoundingClientRect().width);
      check(`mobile-sim-390`, iw === 390, `iframe=${iw}`);
      await p.screenshot({ path: `${OUT}/website-mobile-sim.png` });
      await p.click('button:has-text("Desktop")');
      await p.waitForTimeout(400);
    }
    await p.close();
  }

  // Back to Review → review route with workspace header restored (desktop)
  const p = await ctx.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
  await p.waitForTimeout(1000);
  await p.click('button:has-text("Back to Review")');
  await p.waitForTimeout(900);
  const rev = await p.evaluate(() => ({ url: location.pathname, header: !!document.querySelector('header'), hscroll: document.documentElement.scrollWidth > innerWidth }));
  check('back-to-review-nav', rev.url.includes('/review') && rev.header, JSON.stringify(rev));
  await p.screenshot({ path: `${OUT}/review-after-back.png` });

  // Complete → next-steps
  await p.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
  await p.waitForTimeout(1000);
  await p.click('button:has-text("Complete this site")');
  await p.waitForTimeout(900);
  const ns = await p.evaluate(() => location.pathname);
  check('complete-next-steps', ns.includes('/next-steps'), ns);
  await p.screenshot({ path: `${OUT}/next-steps.png` });

  // Ask question drawer
  await p.goto(BASE, { waitUntil: 'networkidle' }).catch(() => {});
  await p.waitForTimeout(1000);
  await p.click('button[aria-label="Ask a question"], button:has-text("Ask a question")');
  await p.waitForTimeout(600);
  const drawer = await p.evaluate(() => {
    const el = document.querySelector('[role="dialog"], [class*="drawer" i], aside');
    return el ? el.getBoundingClientRect().width > 100 : document.body.innerText.includes('question');
  });
  check('question-drawer', drawer, '');
  await p.screenshot({ path: `${OUT}/question-drawer.png` });
  await p.close();

  await b.close();
  const pass = results.every(r => r.p);
  fs.writeFileSync(`${OUT}/qa-checks.json`, JSON.stringify({ pass, results }, null, 2));
  console.log('OVERALL', pass ? 'PASS' : 'FAIL');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
