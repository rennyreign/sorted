#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Mockup Deconstructor — CLI Entry Point
//
// Usage:
//   npm run deconstruct -- mockup.jpg
//   npm run deconstruct -- mockup.jpg --output output/site.json
//   npm run deconstruct -- mockup.jpg --provider anthropic
//   npm run deconstruct -- mockup.jpg --provider gemini --model gemini-2.5-pro
//   npm run deconstruct -- mockup.jpg --verbose
// ─────────────────────────────────────────────────────────────

import { config as loadEnv } from 'dotenv';
import path from 'path';
import { deconstruct, writeOutput, deriveOutputPath } from './deconstruct.js';
import { DEFAULT_MODELS } from './vision.js';
import type { ModelProvider, DeconstructConfig } from './types.js';

// Load .env from cwd or operator root
loadEnv({ path: path.resolve(process.cwd(), '.env') });
loadEnv({ path: path.resolve(import.meta.dirname, '..', '.env') });

// ── Argument parser ───────────────────────────────────────────

function parseArgs(argv: string[]): DeconstructConfig & { outputPath: string } {
  const args = argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  let imagePath = '';
  let provider: ModelProvider = 'openai';
  let model = '';
  let outputPath = '';
  let verbose = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--provider' || arg === '-p') {
      const val = args[++i];
      if (!val || !['openai', 'anthropic', 'gemini'].includes(val)) {
        die(`Invalid provider: "${val}". Choose: openai | anthropic | gemini`);
      }
      provider = val as ModelProvider;
    } else if (arg === '--model' || arg === '-m') {
      model = args[++i] ?? '';
    } else if (arg === '--output' || arg === '-o') {
      outputPath = args[++i] ?? '';
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else if (!arg.startsWith('-')) {
      imagePath = arg;
    } else {
      die(`Unknown argument: ${arg}`);
    }
  }

  if (!imagePath) {
    die('No image path provided. Usage: npm run deconstruct -- <image.jpg>');
  }

  const resolvedModel = model || DEFAULT_MODELS[provider];
  const resolvedOutput = outputPath || deriveOutputPath(imagePath);

  return { imagePath, provider, model: resolvedModel, outputPath: resolvedOutput, verbose };
}

// ── Help text ─────────────────────────────────────────────────

function printHelp(): void {
  console.log(`
Mockup Deconstructor v0.1.0 — Sorted Manufacturing Line

USAGE
  npm run deconstruct -- <image> [options]

ARGUMENTS
  <image>               Path to the mockup image (.jpg, .jpeg, .png, .webp)

OPTIONS
  --provider, -p        Vision model provider: openai | anthropic | gemini  (default: openai)
  --model, -m           Override model name  (default: provider default)
  --output, -o          Output JSON path  (default: output/<imagename>.json)
  --verbose, -v         Show detailed progress
  --help, -h            Show this help

ENVIRONMENT VARIABLES
  OPENAI_API_KEY        Required when provider=openai
  ANTHROPIC_API_KEY     Required when provider=anthropic
  GEMINI_API_KEY        Required when provider=gemini

DEFAULT MODELS
  openai     → ${DEFAULT_MODELS.openai}
  anthropic  → ${DEFAULT_MODELS.anthropic}
  gemini     → ${DEFAULT_MODELS.gemini}

EXAMPLES
  npm run deconstruct -- mockup.jpg
  npm run deconstruct -- mockup.jpg --verbose
  npm run deconstruct -- mockup.jpg --provider anthropic
  npm run deconstruct -- mockup.jpg --output output/fitness-site.json --verbose
  npm run deconstruct -- mockup.jpg --provider gemini --model gemini-2.5-pro
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
  const { imagePath, provider, model, outputPath, verbose } = parseArgs(process.argv);

  try {
    const config: DeconstructConfig = { imagePath, provider, model, verbose };
    const result = await deconstruct(config);
    await writeOutput(result, outputPath, verbose);

    if (!verbose) {
      // Minimal success output
      console.log(`\nDeconstruction complete.`);
      console.log(`  Sections : ${result.sections.length}`);
      console.log(`  Assets   : ${result.assets.length}`);
      console.log(`  Copy     : ${result.copy.length} blocks`);
      console.log(`  Output   : ${path.resolve(outputPath)}`);
    } else {
      console.log('\nDone.');
    }
  } catch (e) {
    const err = e as Error;
    console.error(`\nFailed: ${err.message}`);
    if (verbose && err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

main();
