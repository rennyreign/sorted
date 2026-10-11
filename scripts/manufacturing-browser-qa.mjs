import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import { createRequire } from "node:module"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex")
const args = process.argv.slice(2)
const flag = (name) => { const i = args.indexOf(`--${name}`); return i < 0 ? undefined : args[i + 1] }

async function main() {
  const jobDir = fs.realpathSync(path.resolve(args[0] ?? ""))
  const url = new URL(flag("url") ?? "")
  if (url.protocol !== "http:" || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new Error("QA accepts only an explicitly supplied local static-preview URL")
  }
  const profilePath = path.resolve(jobDir, flag("profile") ?? "client/qa-profile.json")
  const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"))
  if (!Array.isArray(profile.routes) || !profile.routes.length) throw new Error("QA profile requires explicit routes")
  for (const route of profile.routes) {
    if (typeof route.path !== "string" || !route.path.startsWith("/") || route.path.startsWith("//") ||
        new URL(route.path, url).origin !== url.origin || !["built", "pending"].includes(route.state)) {
      throw new Error("Each QA route needs a local path and built/pending state")
    }
  }
  const widths = [1440, 768, 375, 320]
  if (profile.reference_width !== undefined) {
    if (!Number.isInteger(profile.reference_width) || profile.reference_width < 320 || profile.reference_width > 3840) {
      throw new Error("Invalid reference width")
    }
    if (!widths.includes(profile.reference_width)) widths.push(profile.reference_width)
  }
  const { fingerprintSource } = await import(pathToFileURL(path.join(root, "operators/factory-orchestrator/dist/revision.js")).href)
  const sourceRevision = fingerprintSource(jobDir)
  const inputSha = hash(fs.readFileSync(path.join(jobDir, "artifacts/input-contract.json")))
  const require = createRequire(import.meta.url)
  const playwrightPath = flag("playwright")
  let playwright
  if (playwrightPath) {
    playwright = require(path.resolve(playwrightPath))
  } else {
    try { playwright = require("playwright") } catch {
      throw new Error("Playwright is not installed locally; provide --playwright <existing module path>. No auto-install.")
    }
  }
  const output = path.join(jobDir, "artifacts/browser-qa", new Date().toISOString().replaceAll(":", "-"))
  fs.mkdirSync(output, { recursive: true })
  const checks = []
  const screenshots = []
  const typography = []
  const blocked = []
  const check = (name, passed, details = "") => checks.push({ check: name, passed: Boolean(passed), details })
  const browser = await playwright.chromium.launch({ headless: args.includes("--headless") })
  const context = await browser.newContext({ reducedMotion: "reduce" })
  // No integration writes or external requests, even if a fixture's client code attempts them.
  await context.route("**/*", async (route) => {
    const request = route.request()
    const target = new URL(request.url())
    if (["data:", "blob:"].includes(target.protocol)) return route.continue()
    // Cross-origin traffic and non-read methods are blocked. Same-origin
    // GET/HEAD (incl. framework link prefetches) only reads static files
    // on a static export — it is not an external side effect.
    if (target.origin !== url.origin || !["GET", "HEAD"].includes(request.method())) {
      blocked.push({ url: request.url(), method: request.method(), type: request.resourceType() })
      return route.abort()
    }
    return route.continue()
  })
  if (context.routeWebSocket) {
    await context.routeWebSocket("**/*", (socket) => {
      blocked.push({ url: socket.url(), method: "WEBSOCKET", type: "websocket" })
      socket.close()
    })
  }
  try {
    for (const route of profile.routes) {
      for (const width of widths) {
        const page = await context.newPage()
        const errors = []
        page.on("pageerror", (error) => errors.push(error.message))
        await page.setViewportSize({ width, height: 900 })
        const label = `${route.path}@${width}`
        try {
          const response = await page.goto(new URL(route.path, url).href, { waitUntil: "domcontentloaded", timeout: 15000 })
          check(`${label}: route`, response?.status() === 200, String(response?.status()))
          const settled = await page.evaluate(async () => {
            const bounded = (promise) => Promise.race([promise.then(() => true, () => false), new Promise((resolve) => setTimeout(() => resolve(false), 3000))])
            const fonts = await bounded(document.fonts.ready)
            let positions = 0
            for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(innerHeight - 100, 1)) {
              if (++positions > 100) return { fonts, images: false, reason: "Page exceeds bounded capture scroll" }
              scrollTo(0, y)
              await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
            }
            const visible = [...document.images].filter((img) => img.getBoundingClientRect().width > 0 && img.getBoundingClientRect().height > 0)
            const images = (await Promise.all(visible.map((img) => bounded(img.decode())))).every(Boolean)
            scrollTo(0, 0)
            return { fonts, images, reason: "" }
          })
          check(`${label}: fonts settled`, settled.fonts)
          check(`${label}: visible images decoded`, settled.images, settled.reason)
          const facts = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            h1s: document.querySelectorAll("h1").length,
            main: document.querySelectorAll("main").length,
            title: document.title,
            invalidLinks: [...document.querySelectorAll("a")].filter((a) => !a.getAttribute("href") || a.getAttribute("href") === "#").length,
            brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute("href")).filter((href) => {
              if (!href || href === "#") return true
              try { return !document.getElementById(decodeURIComponent(href.slice(1))) } catch { return true }
            }),
            robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "",
          }))
          check(`${label}: no overflow`, !facts.overflow)
          check(`${label}: one h1 and main`, facts.h1s === 1 && facts.main === 1)
          check(`${label}: title`, Boolean(facts.title?.trim()))
          check(`${label}: no empty links`, facts.invalidLinks === 0)
          check(`${label}: in-page anchors`, facts.brokenAnchors.length === 0, JSON.stringify(facts.brokenAnchors))
          if (route.state === "pending") check(`${label}: pending noindex`, facts.robots.includes("noindex"))
          if (route.heading) check(`${label}: expected heading`, (await page.locator("h1").textContent())?.trim() === route.heading)
          const internal = await page.locator("a[href]").evaluateAll((links) => links.map((a) => a.getAttribute("href")).filter((href) => href?.startsWith("/") && !href.startsWith("//")))
          for (const href of new Set(internal)) {
            const target = new URL(href, url)
            if (target.origin !== url.origin || target.pathname.startsWith("/api/")) {
              check(`${label}: internal ${href}`, false, "Unsafe target; no request sent")
              continue
            }
            const result = await page.request.get(target.href, { timeout: 10000, maxRedirects: 0 })
            // Redirects need explicit review; don't follow one into a live external service.
            check(`${label}: internal ${href}`, result.status() === 200, String(result.status()))
          }
          for (const interaction of profile.interactions ?? []) {
            if (interaction.route !== route.path) continue
            if (interaction.widths && !interaction.widths.includes(width)) continue
            if (!["click", "press"].includes(interaction.action) || !interaction.selector || !interaction.assert) throw new Error("Invalid interaction profile")
            const target = page.locator(interaction.selector)
            if (interaction.action === "click") await target.click({ timeout: 5000 })
            else await target.press(interaction.key, { timeout: 5000 })
            const waitVisible = async (sel, want) => {
              try { await page.locator(sel).waitFor({ state: want ? "visible" : "hidden", timeout: 3000 }); return true } catch { return false }
            }
            if (interaction.assert.visible) check(`${label}: visible ${interaction.assert.visible}`, await waitVisible(interaction.assert.visible, true))
            if (interaction.assert.hidden) check(`${label}: hidden ${interaction.assert.hidden}`, await waitVisible(interaction.assert.hidden, false))
            if (interaction.assert.focused) check(`${label}: focus ${interaction.assert.focused}`, await page.locator(interaction.assert.focused).evaluate((el) => el === document.activeElement))
          }
          const session = await context.newCDPSession(page)
          await session.send("DOM.enable")
          await session.send("CSS.enable")
          const { root: dom } = await session.send("DOM.getDocument")
          const { nodeId } = await session.send("DOM.querySelector", { nodeId: dom.nodeId, selector: "h1" })
          const fonts = nodeId ? await session.send("CSS.getPlatformFontsForNode", { nodeId }) : { fonts: [] }
          typography.push({ route: route.path, width, rendered_h1_fonts: fonts.fonts })
          await session.detach()
          await page.keyboard.press("Tab")
          check(`${label}: keyboard focus exists`, await page.evaluate(() => document.activeElement !== document.body))
          check(`${label}: no page errors`, errors.length === 0, JSON.stringify(errors))
          const filename = `${route.path.replaceAll(/[^a-z0-9]/gi, "-") || "home"}-${width}.png`
          const screenshot = path.join(output, filename)
          await page.screenshot({ path: screenshot, fullPage: true, timeout: 15000 })
          screenshots.push(path.relative(jobDir, screenshot))
        } catch (error) {
          check(`${label}: execution`, false, error.message)
        } finally {
          await page.close()
        }
      }
    }
    check("No blocked external/integration requests attempted", blocked.length === 0, JSON.stringify(blocked))
    check("Source did not change during QA", fingerprintSource(jobDir) === sourceRevision)
    const report = {
      iteration: JSON.parse(fs.readFileSync(path.join(jobDir, "state/build-state.json"), "utf8")).visual_qa_loop.iteration,
      mockup_path: JSON.parse(fs.readFileSync(path.join(jobDir, "artifacts/input-contract.json"), "utf8")).mockup.path,
      source_revision: sourceRevision, input_sha256: inputSha, screenshot_paths: screenshots,
      discrepancies: checks.filter((c) => !c.passed).map((c, i) => ({
        id: `STRUCT-${i + 1}`, location: c.check, expected: "Required structural check passes",
        observed: c.details || "Check failed", severity: "blocker", confidence: 1,
        recommended_correction: "Fix the named failure and re-run current-revision QA",
      })),
      blocker_count: checks.filter((c) => !c.passed).length, warning_count: 0,
      passed: checks.length > 0 && checks.every((c) => c.passed), checks, typography,
      checked_at: new Date().toISOString(), environment: { url: url.href, browser: browser.version(), widths, reduced_motion: true },
      notes: ["Structural checks only; independent visual QA and human approval remain separate."],
    }
    const reportPath = path.join(output, "visual-qa.json")
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n")
    console.log(reportPath)
    console.log(`Structural checks: ${checks.filter((c) => c.passed).length}/${checks.length}; independent visual acceptance not assessed`)
    if (!report.passed) process.exitCode = 1
  } finally {
    await context.close()
    await browser.close()
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1 })
