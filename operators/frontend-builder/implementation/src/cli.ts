#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Frontend Builder — CLI Entry Point
//
// Usage:
//   node dist/cli.js <deconstruction.json> <manifest.json> <assets-dir> [options]
//
// Options:
//   --output <dir>      Output directory (default: ./output/<client-slug>)
//   --template <dir>    Client site template dir (default: auto-detect)
//   --slug <name>       Client slug (default: derived from output dir name)
//   --tier <tier>       standard | premium (default: standard)
//   --dry-run           Plan without generating files
//   --no-build          Skip npm install + next build step
//   --verbose           Detailed output
//   --help              Show this help
// ─────────────────────────────────────────────────────────────

import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { build } from './orchestrator.js';
import type { BuildConfig } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CLI arg parsing ───────────────────────────────────────────

function parseArgs(argv: string[]): {
  deconstructionPath: string;
  manifestPath: string;
  assetsDir: string;
  output?: string;
  template?: string;
  slug?: string;
  tier?: 'standard' | 'premium';
  dryRun: boolean;
  noBuild: boolean;
  verbose: boolean;
  help: boolean;
} {
  const args = argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    return {
      deconstructionPath: '',
      manifestPath: '',
      assetsDir: '',
      dryRun: false,
      noBuild: false,
      verbose: false,
      help: true,
    };
  }

  const positional = args.filter(a => !a.startsWith('--'));
  const get = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };
  const has = (flag: string) => args.includes(flag);

  return {
    deconstructionPath: positional[0] ?? '',
    manifestPath: positional[1] ?? '',
    assetsDir: positional[2] ?? '',
    output: get('--output'),
    template: get('--template'),
    slug: get('--slug'),
    tier: (get('--tier') as 'standard' | 'premium') ?? 'standard',
    dryRun: has('--dry-run'),
    noBuild: has('--no-build'),
    verbose: has('--verbose'),
    help: false,
  };
}

function printHelp() {
  console.log(`
Frontend Builder v0.1.0 — Sorted Website Manufacturing Line
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Takes a Mockup Deconstructor JSON + Asset Generator manifest
and produces a ready-to-deploy Next.js client site.

Usage:
  node dist/cli.js <deconstruction.json> <manifest.json> <assets-dir> [options]

Arguments:
  deconstruction.json   Output from Mockup Deconstructor operator
  manifest.json         Output from Asset Generator operator
  assets-dir            Directory containing generated asset files

Options:
  --output <dir>        Output repo directory (default: ./output/<slug>)
  --template <dir>      Client site template directory (auto-detected if omitted)
  --slug <name>         Client slug for output naming (default: derived from path)
  --tier standard|premium  Build tier (default: standard)
  --dry-run             Show generation plan without calling Claude or writing files
  --no-build            Skip npm install + next build verification
  --verbose             Detailed progress output
  --help                Show this help

Environment:
  ANTHROPIC_API_KEY     Required — your Anthropic API key

Examples:
  # Full run — Raffles restaurant
  node dist/cli.js \\
    ../../mockup-deconstructor/implementation/output/raffles.json \\
    ../../asset-generator/implementation/output/raffles/manifest.json \\
    ../../asset-generator/implementation/output/raffles/assets \\
    --slug raffles --output ./output/raffles-site

  # Dry run to preview plan
  node dist/cli.js raffles.json manifest.json assets/ --dry-run --verbose

  # Premium tier build
  node dist/cli.js raffles.json manifest.json assets/ --tier premium --slug raffles
`);
}

// ── Auto-detect template directory ────────────────────────────

function findTemplateDir(cliDir: string): string {
  // Walk up from the CLI directory to find sorted/templates/client-site
  const candidates = [
    path.resolve(cliDir, '..', '..', '..', '..', 'templates', 'client-site'),
    path.resolve(cliDir, '..', '..', '..', 'templates', 'client-site'),
    path.resolve(process.cwd(), 'templates', 'client-site'),
    path.resolve(process.cwd(), '..', 'templates', 'client-site'),
    path.resolve(process.cwd(), '..', '..', 'templates', 'client-site'),
    path.resolve(process.cwd(), '..', '..', '..', 'templates', 'client-site'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
  }

  throw new Error(
    `Could not auto-detect the client-site template directory.\n` +
    `Use --template <path> to specify it manually.\n` +
    `Expected to find: sorted/templates/client-site/package.json`,
  );
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  const parsed = parseArgs(process.argv);

  if (parsed.help) {
    printHelp();
    process.exit(0);
  }

  if (!parsed.deconstructionPath) {
    console.error('Error: deconstruction.json path is required');
    printHelp();
    process.exit(1);
  }

  if (!parsed.manifestPath) {
    console.error('Error: manifest.json path is required');
    printHelp();
    process.exit(1);
  }

  if (!parsed.assetsDir) {
    console.error('Error: assets directory path is required');
    printHelp();
    process.exit(1);
  }

  if (!process.env['ANTHROPIC_API_KEY'] && !parsed.dryRun) {
    console.error('Error: ANTHROPIC_API_KEY environment variable not set');
    console.error('Add it to .env or export it before running');
    process.exit(1);
  }

  // Resolve template directory
  const templateDir = parsed.template ?? findTemplateDir(__dirname);

  // Derive client slug
  const slug = parsed.slug
    ?? path.basename(parsed.deconstructionPath, '.json')
    ?? 'client';

  // Resolve output directory
  const outputDir = parsed.output ?? path.join(process.cwd(), 'output', slug);

  const config: BuildConfig = {
    deconstructionPath: parsed.deconstructionPath,
    manifestPath: parsed.manifestPath,
    assetsDir: parsed.assetsDir,
    outputDir,
    templateDir,
    clientSlug: slug,
    verbose: parsed.verbose,
    dryRun: parsed.dryRun,
    tier: parsed.tier ?? 'standard',
  };

  // ── Print header ──────────────────────────────────────────

  console.log(`
Frontend Builder v0.1.0
────────────────────────────────────────
  Deconstruction : ${parsed.deconstructionPath}
  Manifest       : ${parsed.manifestPath}
  Assets         : ${parsed.assetsDir}
  Template       : ${templateDir}
  Output         : ${outputDir}
  Slug           : ${slug}
  Tier           : ${config.tier}
  Mode           : ${config.dryRun ? 'DRY RUN — no files will be written' : 'LIVE'}
  Build verify   : ${parsed.noBuild ? 'skipped' : 'enabled'}
`);

  try {
    const result = await build(config);

    const failed = result.files.filter(f => f.status === 'failed');
    if (failed.length > 0) {
      console.log(`\nFailed files:`);
      for (const f of failed) {
        console.log(`  ✗ ${path.relative(outputDir, f.outputPath)}: ${f.error}`);
      }
      process.exit(1);
    }

    process.exit(0);
  } catch (err) {
    console.error(`\nFatal error: ${(err as Error).message}`);
    if (parsed.verbose) {
      console.error((err as Error).stack);
    }
    process.exit(1);
  }
}

main();
