#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Example Uploader — CLI Entry Point
// Takes built sites and mockups, enriches with AI-generated
// case studies, screenshots live sites, and publishes to the
// examples page.
//
// Usage:
//   npm run upload                              # full run
//   npm run upload -- --dry-run                 # preview only
//   npm run upload -- --source live             # live sites only
//   npm run upload -- --source case-studies     # generate case studies only
//   npm run upload -- --business "School"       # specific business
//   npm run upload -- --force-screenshots       # re-capture screenshots
//   npm run upload -- --verbose                 # detailed output
// ─────────────────────────────────────────────────────────────

import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

import { ingestLiveSites } from "./ingest.js";
import { captureScreenshots } from "./screenshot.js";
import { generateCaseStudy } from "./generate.js";
import { publishCaseStudies, publishToSupabase } from "./publish.js";
import { formatCostSummary, totalCost } from "./cost.js";
import type { CostRecord, GeneratedCaseStudy, RunConfig, SiteSource } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Repo root is 4 levels up from dist/cli.js
// dist/ → implementation/ → example-uploader/ → operators/ → sorted/
const DEFAULT_REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

function parseArgs(argv: string[]): RunConfig {
  const config: RunConfig = {
    dryRun: false,
    source: "all",
    forceScreenshots: false,
    verbose: false,
  };

  for (const arg of argv.slice(2)) {
    if (arg === "--dry-run") config.dryRun = true;
    else if (arg === "--verbose" || arg === "-v") config.verbose = true;
    else if (arg === "--force-screenshots") config.forceScreenshots = true;
    else if (arg.startsWith("--source=")) {
      const val = arg.slice("--source=".length) as RunConfig["source"];
      config.source = val;
    } else if (arg.startsWith("--business=")) {
      config.business = arg.slice("--business=".length);
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return config;
}

function printHelp(): void {
  console.log(`
Sorted Example Uploader

Usage:
  npm run upload                              Full run — all sources
  npm run upload -- --dry-run                 Preview only, no writes
  npm run upload -- --source live             Live sites only
  npm run upload -- --source case-studies     Generate case studies only
  npm run upload -- --source mockups          Mockups only (from Supabase)
  npm run upload -- --business "School"       Filter to specific business
  npm run upload -- --force-screenshots       Re-capture all screenshots
  npm run upload -- --verbose                 Detailed output

Environment:
  ANTHROPIC_API_KEY     Required for AI blurb/case study generation
  SUPABASE_SERVICE_KEY  Required for Supabase examples table upsert
  SORTED_REPO_ROOT      Override repo root path (defaults to ../../..)
`);
}

async function main() {
  const config = parseArgs(process.argv);
  const repoRoot = process.env.SORTED_REPO_ROOT
    ? path.resolve(process.env.SORTED_REPO_ROOT)
    : DEFAULT_REPO_ROOT;

  console.log("═".repeat(60));
  console.log("  Sorted Example Uploader");
  console.log("═".repeat(60));
  console.log(`  Mode:     ${config.dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`  Source:   ${config.source}`);
  console.log(`  Repo:     ${repoRoot}`);
  if (config.business) console.log(`  Business: ${config.business}`);
  console.log();

  // ── Ingest ──────────────────────────────────────────────
  console.log("▸ Ingesting sites...");

  const sites = ingestLiveSites(repoRoot, config.business);

  if (sites.length === 0) {
    console.log("  No sites found. Exiting.");
    return;
  }

  for (const site of sites) {
    const status = site.isClaimed ? "LIVE" : "UNCLAIMED";
    console.log(`  • ${site.businessName} (${site.slug}) — ${site.category} · ${status}`);
  }
  console.log();

  // Filter by source type
  let sitesToProcess = sites;
  if (config.source === "live" || config.source === "case-studies") {
    sitesToProcess = sites.filter((s) => s.isLive);
  } else if (config.source === "mockups") {
    // Mockups come from Supabase, not from local sites
    console.log("  Mockup sync from Supabase Storage — use scripts/sync-examples-from-storage.ts");
    console.log("  This operator handles live sites and case studies only.");
    return;
  }

  if (sitesToProcess.length === 0) {
    console.log("  No live sites to process. Exiting.");
    return;
  }

  // ── Screenshot ──────────────────────────────────────────
  console.log("▸ Capturing screenshots...");

  const allCosts: CostRecord[] = [];
  const caseStudies: GeneratedCaseStudy[] = [];
  const blurbs = new Map<string, string>();

  for (const site of sitesToProcess) {
    if (!site.liveUrl) {
      if (config.verbose) console.log(`  [skip] ${site.slug}: no live URL`);
      continue;
    }

    console.log(`\n  📸 ${site.businessName}`);

    try {
      const screenshotResult = await captureScreenshots(site.liveUrl, site.slug, repoRoot, {
        force: config.forceScreenshots,
        verbose: config.verbose,
      });

      if (screenshotResult.skipped) {
        console.log(`     Screenshots: already exist (skipped)`);
      } else {
        console.log(`     Screenshots: captured desktop / tablet / mobile`);
      }

      // ── Generate case study ─────────────────────────────
      if (config.source === "all" || config.source === "case-studies" || config.source === "live") {
        console.log(`     Generating case study via Claude...`);

        if (config.dryRun) {
          console.log(`     DRY RUN — would generate case study and blurb`);
          continue;
        }

        const { caseStudy, blurb, costs } = await generateCaseStudy(
          site,
          screenshotResult.publicPaths,
          repoRoot,
        );

        caseStudies.push(caseStudy);
        blurbs.set(site.slug, blurb);
        allCosts.push(...costs);

        console.log(`     Case study: "${caseStudy.title}"`);
        console.log(`     Blurb: "${blurb}"`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`     ERROR: ${msg}`);
      // Continue to next site
    }
  }

  // ── Publish ─────────────────────────────────────────────
  console.log("\n▸ Publishing...");

  if (caseStudies.length > 0) {
    publishCaseStudies(repoRoot, caseStudies, config.dryRun, config.verbose);
  }

  publishToSupabase(sitesToProcess, blurbs, config.dryRun, config.verbose);

  // ── Cost summary ────────────────────────────────────────
  if (allCosts.length > 0) {
    console.log("\n▸ API Credits Used:");
    console.log(formatCostSummary(allCosts));
  }

  // ── Summary ─────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log(`  Done.`);
  console.log(`  Sites processed: ${sitesToProcess.length}`);
  console.log(`  Case studies:    ${caseStudies.length}`);
  console.log(`  Total cost:      $${totalCost(allCosts).toFixed(4)}`);
  if (config.dryRun) {
    console.log(`  (DRY RUN — no files were written)`);
  }
  console.log("═".repeat(60));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
