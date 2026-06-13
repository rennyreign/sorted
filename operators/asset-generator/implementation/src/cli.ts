#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Asset Generator — CLI Entry Point
//
// Usage:
//   npm run assets -- mockup.jpg output/mockup.json
//   npm run assets -- mockup.jpg output/mockup.json --output output/
//   npm run assets -- mockup.jpg output/mockup.json --model dall-e-3 --format jpg
//   npm run assets -- mockup.jpg output/mockup.json --priority critical,high
//   npm run assets -- mockup.jpg output/mockup.json --dry-run --verbose
// ─────────────────────────────────────────────────────────────

import { config as loadEnv } from 'dotenv';
import path from 'path';
import { runAssetGenerator } from './orchestrator.js';
import type { AssetGeneratorConfig, GenerationModel, OutputFormat, AssetPriority } from './types.js';

// Load .env
loadEnv({ path: path.resolve(process.cwd(), '.env') });
loadEnv({ path: path.resolve(import.meta.dirname, '..', '.env') });

// ── Argument parser ───────────────────────────────────────────

function parseArgs(argv: string[]): AssetGeneratorConfig {
  const args = argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  let mockupPath = '';
  let deconstructionPath = '';
  let outputDir = 'output';
  let format: OutputFormat = 'webp';
  let model: GenerationModel = 'gpt-image-1';
  let priorityFilter: AssetPriority[] | undefined;
  let dryRun = false;
  let verbose = false;
  let skipExisting = false;

  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--output' || arg === '-o') {
      outputDir = args[++i] ?? 'output';
    } else if (arg === '--format' || arg === '-f') {
      const val = args[++i];
      if (!val || !['webp', 'jpg', 'png'].includes(val)) {
        die(`Invalid format: "${val}". Choose: webp | jpg | png`);
      }
      format = val as OutputFormat;
    } else if (arg === '--model' || arg === '-m') {
      const val = args[++i];
      if (!val || !['gpt-image-1', 'dall-e-3'].includes(val)) {
        die(`Invalid model: "${val}". Choose: gpt-image-1 | dall-e-3`);
      }
      model = val as GenerationModel;
    } else if (arg === '--priority' || arg === '-p') {
      const val = args[++i] ?? '';
      priorityFilter = val.split(',').map((p) => p.trim() as AssetPriority);
    } else if (arg === '--dry-run' || arg === '-d') {
      dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else if (arg === '--skip-existing') {
      skipExisting = true;
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    } else {
      die(`Unknown argument: ${arg}`);
    }
  }

  if (positional.length < 1) die('No mockup image path provided.');
  if (positional.length < 2) die('No deconstruction JSON path provided.');

  mockupPath = positional[0]!;
  deconstructionPath = positional[1]!;

  return { mockupPath, deconstructionPath, outputDir, format, model, priorityFilter, dryRun, verbose, skipExisting };
}

// ── Help text ─────────────────────────────────────────────────

function printHelp(): void {
  console.log(`
Asset Generator v0.1.0 — Sorted Manufacturing Line

USAGE
  npm run assets -- <mockup.jpg> <mockup.json> [options]

ARGUMENTS
  <mockup.jpg>      Path to the mockup image
  <mockup.json>     Path to the Mockup Deconstructor output JSON

OPTIONS
  --output, -o      Output directory  (default: output/)
  --format, -f      Output image format: webp | jpg | png  (default: webp)
  --model, -m       Generation model: gpt-image-1 | dall-e-3  (default: gpt-image-1)
  --priority, -p    Only process these priorities (comma-separated): critical,high,medium,low
  --dry-run, -d     Show what would be done — no files written
  --skip-existing   Skip assets whose output folder already exists
  --verbose, -v     Show detailed progress
  --help, -h        Show this help

ENVIRONMENT VARIABLES
  OPENAI_API_KEY    Required for recreate mode (gpt-image-1 or dall-e-3)

OUTPUT STRUCTURE
  output/
    assets/
      <asset_id>/
        original.webp
        lg.webp
        md.webp
        sm.webp
        xs.webp
    manifest.json
    generation-log.json

EXAMPLES
  npm run assets -- mockup.jpg output/mockup.json
  npm run assets -- mockup.jpg output/mockup.json --verbose
  npm run assets -- mockup.jpg output/mockup.json --dry-run
  npm run assets -- mockup.jpg output/mockup.json --priority critical,high
  npm run assets -- mockup.jpg output/mockup.json --model dall-e-3 --format jpg
  npm run assets -- mockup.jpg output/mockup.json --output /path/to/client/assets/
`);
}

// ── Error helper ──────────────────────────────────────────────

function die(msg: string): never {
  console.error(`\nError: ${msg}\n`);
  console.error('Run with --help for usage.');
  process.exit(1);
}

// ── Main ──────────────────────────────────────────────────────

async function main(): Promise<void> {
  const config = parseArgs(process.argv);

  try {
    await runAssetGenerator(config);
  } catch (e) {
    const err = e as Error;
    console.error(`\nFailed: ${err.message}`);
    if (config.verbose && err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

main();
