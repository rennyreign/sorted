const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 877, height: 1794 });
  await page.goto('http://127.0.0.1:8777/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.screenshot({ path: '/tmp/salon108-playwright-full.png', fullPage: true });
  const height = await page.evaluate(() => document.body.scrollHeight);
  console.log('Page height:', height);
  await browser.close();
})();
