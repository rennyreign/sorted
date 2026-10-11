const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';
const OUT = '/Users/renaldoedmondson/Projects/sorted/artifacts/sorted-v3';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const report = { pageErrors: {}, overflow: {}, notes: [] };

  await page.route('**/*', (route) => {
    const url = route.request().url();
    try {
      const host = new URL(url).hostname;
      if (host === 'localhost' || host === '127.0.0.1' || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
      return route.abort();
    } catch { return route.continue(); }
  });
  page.on('pageerror', (err) => report.notes.push('pageerror: ' + String(err).slice(0, 200)));

  // 1. Homepage hero height + new first/full shots
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  const hero = await page.evaluate(() => {
    const header = document.querySelector('header');
    const heroSection = document.querySelector('section');
    const r = heroSection.getBoundingClientRect();
    return { heroTop: Math.round(r.top), heroBottom: Math.round(r.bottom), heroHeight: Math.round(r.height), viewport: window.innerHeight };
  });
  report.notes.push('hero@1440: ' + JSON.stringify(hero));
  await page.screenshot({ path: `${OUT}/shot-home-1440-first.png` });
  await page.screenshot({ path: `${OUT}/shot-home-1440-full.png`, fullPage: true });
  await page.screenshot({ path: `${OUT}/shot-home-1440-results.png`, fullPage: false });

  // 2. what-else-we-do shots incl. iceberg region
  await page.goto(`${BASE}/what-else-we-do/`, { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/shot-what_else-1440-first.png` });
  await page.screenshot({ path: `${OUT}/shot-what_else-1440-full.png`, fullPage: true });
  const iceberg = await page.evaluate(() => {
    const svg = [...document.querySelectorAll('svg')].find(s => s.getAttribute('aria-hidden') === 'true' && s.querySelector('polygon'));
    const ul = document.evaluate('//ul[li[text()="Advertising"]]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (!svg || !ul) return 'missing';
    const sr = svg.getBoundingClientRect(), ur = ul.getBoundingClientRect();
    return { svgBottom: Math.round(sr.bottom), labelsBottom: Math.round(ur.bottom), inside: ur.bottom <= sr.bottom + 4 };
  });
  report.notes.push('iceberg labels inside svg: ' + JSON.stringify(iceberg));
  const iceEl = await page.$('figure:has(svg polygon)');
  if (iceEl) await iceEl.screenshot({ path: `${OUT}/shot-what_else-iceberg.png` });

  // 3. mobile shots new pages 375 + 320
  for (const [route, name] of [['/', 'home'], ['/what-else-we-do/', 'what_else']]) {
    for (const w of [375, 320]) {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto(`${BASE}${route}`, { waitUntil: 'load' });
      await page.waitForTimeout(1300);
      const ov = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ? `${document.documentElement.scrollWidth}>${document.documentElement.clientWidth}` : 'ok');
      report.overflow[`${route}@${w}`] = ov;
      await page.screenshot({ path: `${OUT}/shot-${name}-${w}-first.png` });
      await page.screenshot({ path: `${OUT}/shot-${name}-${w}-full.png`, fullPage: true });
    }
  }

  // 4. changed supporting routes at 375/320 for overflow
  const support = ['/about/', '/howitworks/', '/pricing/', '/examples/', '/examples/warwickshire-short-stays/', '/website-updates/', '/partners/'];
  for (const route of support) {
    for (const w of [375, 320]) {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto(`${BASE}${route}`, { waitUntil: 'load' });
      await page.waitForTimeout(1200);
      const ov = await page.evaluate(() => {
        const el = document.documentElement;
        let widest = null, wv = 0;
        if (el.scrollWidth > el.clientWidth + 1) {
          for (const node of document.querySelectorAll('body *')) {
            const r = node.getBoundingClientRect();
            if (r.right > el.clientWidth + 1 && r.width > wv && r.width < 2000) { wv = r.width; widest = node.tagName + '.' + (node.className && node.className.baseVal === undefined ? String(node.className).slice(0, 60) : 'svg'); }
          }
        }
        return { overflow: el.scrollWidth > el.clientWidth + 1 ? `${el.scrollWidth}>${el.clientWidth}` : 'ok', widest };
      });
      report.overflow[`${route}@${w}`] = ov;
    }
  }

  // 5. ops results surfaces at 1440 — check honest labels visible
  const opsRoutes = ['/ops/', '/ops/results/', '/ops/results/glow-dental/', '/ops/results/gracie-barra-halesowen/', '/ops/results-dashboard/', '/ops/case-studies/glow-dental/', '/ops/reviews/glow-dental/', '/ops/industries/dental-practices/'];
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of opsRoutes) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'load' });
    await page.waitForTimeout(1300);
    const text = await page.evaluate(() => document.body.innerText);
    const labels = ['Example figures', 'Example reporting figures', 'illustrative', 'draft reporting', 'Example dashboard', 'Illustrative example'].filter(l => text.includes(l));
    report.notes.push(`${route} labels: ${JSON.stringify(labels)} status ok`);
    const nm = route.replace(/\/$/, '').split('/').pop().replace(/-/g, '_');
    await page.screenshot({ path: `${OUT}/shot-ops-${nm}-1440-first.png` });
  }

  // 6. interactions retest
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.click('header >> text=Get your free mockup');
  await page.waitForTimeout(500);
  const q1 = await page.evaluate(() => document.body.innerText.includes('Question 1 of 6'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const closed = await page.evaluate(() => !document.body.innerText.includes('Question 1 of 6'));
  report.notes.push(`modal Q1=${q1} escape=${closed}`);
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(`${BASE}/what-else-we-do/`, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  await page.click('button[aria-label="Open navigation"]');
  await page.waitForTimeout(300);
  const active = await page.evaluate(() => [...document.querySelectorAll('header nav a')].filter(a => a.className.includes('dfff00')).map(a => a.textContent.trim()));
  report.notes.push('mobile active: ' + JSON.stringify(active));
  await page.click('button[aria-label="Close navigation"]');
  await page.goto(`${BASE}/pricing/#included`, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  report.notes.push('anchor: ' + await page.evaluate(() => { const el = document.getElementById('included'); return el ? 'top=' + Math.round(el.getBoundingClientRect().top) : 'missing'; }));

  console.log(JSON.stringify(report, null, 1));
  await browser.close();
})();
