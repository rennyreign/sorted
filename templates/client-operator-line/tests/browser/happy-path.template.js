/**
 * Client operator line — browser happy path template.
 *
 * Copy to tests/browser/happy-path.js and replace the steps with the client's
 * primary workflow. Keep it runnable: this script is both the regression test
 * and the demo rehearsal.
 *
 * Run:
 *   node <playwright skill>/run.js tests/browser/happy-path.js
 *   BASE_URL=http://localhost:3000 REPO_ROOT=$PWD node ...
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const REPO = process.env.REPO_ROOT || process.cwd();
const OUT = "/tmp/operator-line-e2e";
fs.mkdirSync(OUT, { recursive: true });

const log = (...args) => console.log("[e2e]", ...args);

async function reset(page) {
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  // Adjust to the line's reset control. Reset is destructive; always confirm.
  await page.getByRole("button", { name: /reset/i }).first().click();
  await page.getByRole("button", { name: /^(reset|confirm)$/i }).click();
  await page.waitForTimeout(1000);
  log("reset complete");
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));

  try {
    await reset(page);

    // 1. Primary intake
    // await page.getByRole("button", { name: "Add …" }).click();
    // await page.fill("#field", "value");
    // await page.getByRole("button", { name: "Save" }).click();

    // 2. Secondary intake (file / paste) — assert the preview counts
    // await page.setInputFiles('input[type="file"]', path.join(OUT, "sample.csv"));

    // 3. Core loop: state change -> action -> reply -> accept -> evidence
    // await page.getByRole("button", { name: "Advance" }).click();

    // 4. Reporting: assert scope and denominators
    // await page.goto(BASE + "/digest", { waitUntil: "networkidle" });

    await page.screenshot({ path: path.join(OUT, "final.png"), fullPage: true });
    console.log(JSON.stringify({ consoleErrors: errors }, null, 2));
    if (errors.length) process.exitCode = 1;
  } catch (error) {
    await page.screenshot({ path: path.join(OUT, "failure.png"), fullPage: true });
    console.error("E2E FAILED:", error.message, "at", page.url());
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
