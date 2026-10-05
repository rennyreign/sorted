// ─────────────────────────────────────────────────────────────
// Example Uploader — Screenshot Module
// Captures desktop / tablet / mobile screenshots of live sites
// using Playwright headless Chromium.
// ─────────────────────────────────────────────────────────────

import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
import { VIEWPORTS, type ViewportSize } from "./types.js";

const SCREENSHOT_DIR_NAME = "public/examples/live";

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function screenshotPath(repoRoot: string, slug: string, viewport: ViewportSize): string {
  return path.join(repoRoot, SCREENSHOT_DIR_NAME, `${slug}-${viewport.name}.png`);
}

function publicPath(slug: string, viewport: ViewportSize): string {
  return `/examples/live/${slug}-${viewport.name}.png`;
}

function allScreenshotsExist(repoRoot: string, slug: string): boolean {
  return VIEWPORTS.every((vp) => fs.existsSync(screenshotPath(repoRoot, slug, vp)));
}

export type ScreenshotResult = {
  slug: string;
  paths: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  publicPaths: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  skipped: boolean;
};

export async function captureScreenshots(
  url: string,
  slug: string,
  repoRoot: string,
  opts: { force: boolean; verbose: boolean },
): Promise<ScreenshotResult> {
  const dir = path.join(repoRoot, SCREENSHOT_DIR_NAME);
  ensureDir(dir);

  if (!opts.force && allScreenshotsExist(repoRoot, slug)) {
    if (opts.verbose) {
      console.log(`  [screenshots] ${slug}: all screenshots exist, skipping (use --force-screenshots to re-capture)`);
    }
    return {
      slug,
      paths: {
        desktop: screenshotPath(repoRoot, slug, VIEWPORTS[0]!),
        tablet: screenshotPath(repoRoot, slug, VIEWPORTS[1]!),
        mobile: screenshotPath(repoRoot, slug, VIEWPORTS[2]!),
      },
      publicPaths: {
        desktop: publicPath(slug, VIEWPORTS[0]!),
        tablet: publicPath(slug, VIEWPORTS[1]!),
        mobile: publicPath(slug, VIEWPORTS[2]!),
      },
      skipped: true,
    };
  }

  if (opts.verbose) {
    console.log(`  [screenshots] ${slug}: launching Chromium for ${url}`);
  }

  const browser = await chromium.launch({ headless: true });

  try {
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 2,
      });

      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
        // Extra settle time for animations / lazy-loaded images
        await page.waitForTimeout(2500);

        const outPath = screenshotPath(repoRoot, slug, viewport);
        await page.screenshot({
          path: outPath,
          type: "png",
          fullPage: false,
        });

        if (opts.verbose) {
          console.log(`  [screenshots] ${slug} ${viewport.name}: saved to ${outPath}`);
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  return {
    slug,
    paths: {
      desktop: screenshotPath(repoRoot, slug, VIEWPORTS[0]!),
      tablet: screenshotPath(repoRoot, slug, VIEWPORTS[1]!),
      mobile: screenshotPath(repoRoot, slug, VIEWPORTS[2]!),
    },
    publicPaths: {
      desktop: publicPath(slug, VIEWPORTS[0]!),
      tablet: publicPath(slug, VIEWPORTS[1]!),
      mobile: publicPath(slug, VIEWPORTS[2]!),
    },
    skipped: false,
  };
}
