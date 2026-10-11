const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';
const OUT = '/Users/renaldoedmondson/Projects/sorted/artifacts/sorted-v3';
const errors = [];

function check(name, fn) {
  try { return fn(); } catch (e) { errors.push(`${name}: ${e.message}`); }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  const badResponses = [];
  const failedRequests = [];

  await page.route('**/*', (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return route.abort();
    try {
      const host = new URL(url).hostname;
      if (host === 'localhost' || host === '127.0.0.1' || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
      return route.abort();
    } catch { return route.continue(); }
  });
  page.on('pageerror', (err) => pageErrors.push(String(err).slice(0, 200)));
  page.on('response', (res) => {
    const u = res.url();
    if (u.startsWith(BASE) && res.status() >= 400) badResponses.push(`${res.status()} ${u}`);
  });
  page.on('requestfailed', (req) => {
    const u = req.url();
    // ERR_ABORTED on media/font assets happens when navigation cancels in-flight lazy loads — not a load failure
    const isAssetAbort = req.failure()?.errorText === 'net::ERR_ABORTED' && /\.(png|jpe?g|webp|avif|gif|svg|mp4|webm|woff2?|ttf|otf)(\?|$)/.test(u);
    if (u.startsWith(BASE) && !isAssetAbort) failedRequests.push(`${u} ${req.failure()?.errorText}`);
  });

  const loadAndSettle = async (route) => {
    const res = await page.goto(`${BASE}${route}`, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(800);
    return res;
  };

  const assertImages = async (route) => {
    // local srcs only; scroll through the page so lazy images get a chance to load
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const steps = Math.min(8, Math.ceil(height / 700));
    for (let i = 0; i <= steps; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round((height * i) / steps));
      await page.waitForTimeout(250);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    const bad = await page.evaluate(() => {
      const out = [];
      for (const img of document.querySelectorAll('img')) {
        const src = img.getAttribute('src') || '';
        if (!src || src.startsWith('data:')) continue;
        if (/^https?:\/\//.test(src) && !src.includes('localhost') && !src.includes('127.0.0.1')) continue;
        if (img.getBoundingClientRect().width <= 0) continue;
        if (!(img.complete && img.naturalWidth > 0)) out.push(src.slice(0, 100));
      }
      return out;
    });
    check(`${route} images`, () => assert.deepEqual(bad, [], `broken local images: ${bad.join(', ')}`));
  };

  // 1. Route responses + first paint screenshots for new pages
  const routes = ['/', '/what-else-we-do/', '/about/', '/howitworks/', '/pricing/', '/examples/', '/examples/warwickshire-short-stays/', '/website-updates/', '/partners/', '/ops/', '/ops/about/', '/ops/how-it-works/', '/ops/results/', '/ops/results/glow-dental/', '/ops/results/gracie-barra-halesowen/', '/ops/results-dashboard/', '/ops/case-studies/glow-dental/', '/ops/reviews/glow-dental/', '/ops/industries/dental-practices/'];
  const status = {};
  for (const r of routes) {
    const res = await loadAndSettle(r);
    status[r] = res ? res.status() : 'null';
    check(`GET ${r}`, () => assert.ok(res && res.ok(), `status ${status[r]}`));
    await assertImages(r);
  }

  // 2. Overflow at required viewports
  const overflowAt = async (w) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
  for (const w of [1440, 1024, 881, 768, 375, 320]) {
    for (const r of ['/', '/what-else-we-do/']) {
      await page.setViewportSize({ width: w, height: 900 });
      await loadAndSettle(r);
      const ok = await overflowAt(w);
      check(`overflow ${r}@${w}`, () => assert.ok(ok, `scrollWidth ${'>'} clientWidth`));
    }
  }
  for (const r of ['/about/', '/howitworks/', '/pricing/', '/examples/', '/examples/warwickshire-short-stays/', '/website-updates/', '/partners/']) {
    for (const w of [375, 320]) {
      await page.setViewportSize({ width: w, height: 900 });
      await loadAndSettle(r);
      const ok = await overflowAt(w);
      check(`overflow ${r}@${w}`, () => assert.ok(ok, 'scrollWidth > clientWidth'));
    }
  }

  // 3. Iceberg geometry at 1440/375/320
  for (const w of [1440, 375, 320]) {
    await page.setViewportSize({ width: w, height: 900 });
    await loadAndSettle('/what-else-we-do/');
    const geo = await page.evaluate(() => {
      const figs = [...document.querySelectorAll('figure')];
      const fig = figs.find(f => f.querySelector('svg[aria-hidden="true"]') && f.querySelector('figcaption'));
      if (!fig) return { missing: true };
      const svg = fig.querySelector('svg');
      const sr = svg.getBoundingClientRect();
      const label = fig.querySelector('p');
      const items = [...fig.querySelectorAll('ul li')];
      const lr = label.getBoundingClientRect();
      const water = sr.top + sr.height * (130 / 360);
      return {
        missing: false,
        labelVisible: lr.width > 0 && lr.height > 0,
        labelTop: lr.top, labelBottom: lr.bottom,
        svgTop: sr.top, svgBottom: sr.bottom, svgLeft: sr.left, svgRight: sr.right,
        water,
        aboveWater: lr.top > sr.top && lr.bottom < water,
        itemsInside: items.map(li => {
          const r = li.getBoundingClientRect();
          return r.top >= sr.top - 1 && r.bottom <= sr.bottom + 1 && r.left >= sr.left - 1 && r.right <= sr.right + 1;
        }),
        itemCount: items.length,
      };
    });
    check(`iceberg ${w}`, () => {
      assert.equal(geo.missing, false, 'iceberg figure missing');
      assert.ok(geo.labelVisible, 'Website label not visible');
      assert.ok(geo.aboveWater, `label not fully above waterline: top=${Math.round(geo.labelTop)} bottom=${Math.round(geo.labelBottom)} svgTop=${Math.round(geo.svgTop)} water=${Math.round(geo.water)}`);
      assert.equal(geo.itemCount, 5, 'expected 5 below-water labels');
      assert.ok(geo.itemsInside.every(Boolean), 'below-water label outside svg bounds');
    });
    if (w === 1440) {
      const el = page.locator('figure', { has: page.locator('svg[aria-hidden="true"]') }).first();
      await el.scrollIntoViewIfNeeded();
      await el.screenshot({ path: `${OUT}/shot-what_else-iceberg.png` });
    }
  }

  // 4. Screenshots: new pages first/full at 1440, 375, 320
  for (const [route, name] of [['/', 'home'], ['/what-else-we-do/', 'what_else']]) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loadAndSettle(route);
    await page.screenshot({ path: `${OUT}/shot-${name}-1440-first.png` });
    await page.screenshot({ path: `${OUT}/shot-${name}-1440-full.png`, fullPage: true });
    for (const w of [375, 320]) {
      await page.setViewportSize({ width: w, height: 800 });
      await loadAndSettle(route);
      await page.screenshot({ path: `${OUT}/shot-${name}-${w}-first.png` });
      await page.screenshot({ path: `${OUT}/shot-${name}-${w}-full.png`, fullPage: true });
    }
  }

  // 5. Ops honest labels — case-insensitive against normalised body text + visible locator
  const opsLabels = [
    ['/ops/', [/example figures/i]],
    ['/ops/results/', [/example reporting figures/i, /draft reporting/i]],
    ['/ops/results/glow-dental/', [/illustrative example/i]],
    ['/ops/case-studies/glow-dental/', [/illustrative example/i]],
    ['/ops/reviews/glow-dental/', [/illustrative example/i]],
    ['/ops/industries/dental-practices/', [/illustrative example/i]],
    ['/ops/results/gracie-barra-halesowen/', [/project example[^]*draft reporting/i]],
    ['/ops/results-dashboard/', [/example dashboard[^]*not live client reporting/i]],
  ];
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [route, regexes] of opsLabels) {
    await loadAndSettle(route);
    const body = await page.evaluate(() => document.body.innerText);
    for (const re of regexes) {
      check(`label ${route} ${re}`, () => assert.ok(re.test(body), `body text missing ${re}`));
      const loc = page.getByText(re).first();
      const visible = await loc.isVisible().catch(() => false);
      if (!visible) await loc.scrollIntoViewIfNeeded().catch(() => {});
      const vis2 = await loc.isVisible().catch(() => false);
      check(`label visible ${route} ${re}`, () => assert.ok(vis2, 'label locator not visible'));
    }
    const nm = route.replace(/\/$/, '').split('/').pop().replace(/-/g, '_');
    await page.screenshot({ path: `${OUT}/shot-ops-${nm}-1440-first.png` });
  }

  // 6. Interactions
  await loadAndSettle('/');
  await page.click('header >> text=Get your free mockup');
  const q1 = page.getByText('Question 1 of 6').first();
  const q1vis = await q1.isVisible().catch(() => false);
  check('mockup Q1 visible', () => assert.ok(q1vis, 'Question 1 of 6 not visible'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const q1gone = await q1.isVisible().catch(() => false);
  check('mockup Escape closes', () => assert.equal(q1gone, false, 'modal still visible after Escape'));

  await page.setViewportSize({ width: 375, height: 800 });
  await loadAndSettle('/what-else-we-do/');
  await page.click('button[aria-label="Open navigation"]');
  await page.waitForTimeout(300);
  const menuLink = page.locator('header nav a:visible', { hasText: 'What else we do' }).first();
  const menuVis = await menuLink.isVisible().catch(() => false);
  check('mobile menu link visible', () => assert.ok(menuVis, 'What else we do link not visible'));
  const isActive = await menuLink.evaluate(el => el.className.includes('dfff00')).catch(() => false);
  check('mobile menu active state', () => assert.ok(isActive, 'link lacks lime active class'));
  await page.click('button[aria-label="Close navigation"]');
  await page.waitForTimeout(300);
  const menuClosed = await menuLink.isVisible().catch(() => false);
  check('mobile menu closes', () => assert.equal(menuClosed, false, 'menu still visible after close'));

  await page.setViewportSize({ width: 1440, height: 900 });
  await loadAndSettle('/pricing/#included');
  const anchor = await page.evaluate(() => {
    const el = document.getElementById('included');
    const header = document.querySelector('header');
    if (!el || !header) return null;
    return { top: el.getBoundingClientRect().top, headerBottom: header.getBoundingClientRect().bottom, vh: window.innerHeight };
  });
  check('pricing #included anchor', () => {
    assert.ok(anchor, 'anchor element missing');
    assert.ok(anchor.top >= 0 && anchor.top <= anchor.vh, `top ${Math.round(anchor.top)} outside viewport ${anchor.vh}`);
  });

  // 7. Global failure assertions
  check('page errors', () => assert.deepEqual(pageErrors, [], pageErrors.join(' | ')));
  check('local HTTP >=400', () => assert.deepEqual(badResponses, [], badResponses.join(' | ')));
  check('local request failures', () => assert.deepEqual(failedRequests, [], failedRequests.join(' | ')));

  await browser.close();
  if (errors.length) {
    console.log('FAILURES:\n' + errors.map(e => ' - ' + e).join('\n'));
    process.exit(1);
  }
  console.log('ALL ASSERTIONS PASSED');
})().catch((e) => { console.log('FATAL: ' + e.stack); process.exit(2); });
