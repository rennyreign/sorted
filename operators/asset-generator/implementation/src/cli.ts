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
import type { AssetGeneratorConfig, GenerationModel, GenerationQuality, OutputFormat, AssetPriority } from './types.js';

const VALID_MODELS = ['gpt-image-1', 'dall-e-3', 'gemini-2.5-flash-image', 'flux-pro-1.1', 'flux-pro-1.1-ultra', 'flux-2-flex', 'flux-2-max'];
const VALID_QUALITIES = ['low', 'medium', 'high'];

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
  let model: GenerationModel = 'flux-2-flex';
  let quality: GenerationQuality | undefined;
  let priorityFilter: AssetPriority[] | undefined;
  let dryRun = false;
  let verbose = false;
  let skipExisting = false;
  let ladder = false;
  let similarityThreshold: number | undefined;
  let realPhotosDir: string | undefined;
  let realPhotosMap: string | undefined;

  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--output' || arg === '-o') {
      outputDir = args[++i] ?? 'output';
    } else if (arg === '--mockup') {
      mockupPath = args[++i] ?? '';
    } else if (arg === '--deconstruction') {
      deconstructionPath = args[++i] ?? '';
    } else if (arg === '--format' || arg === '-f') {
      const val = args[++i];
      if (!val || !['webp', 'jpg', 'png'].includes(val)) {
        die(`Invalid format: "${val}". Choose: webp | jpg | png`);
      }
      format = val as OutputFormat;
    } else if (arg === '--model' || arg === '-m') {
      const val = args[++i];
      if (!val || !VALID_MODELS.includes(val)) {
        die(`Invalid model: "${val}". Choose: ${VALID_MODELS.join(' | ')}`);
      }
      model = val as GenerationModel;
    } else if (arg === '--quality' || arg === '-q') {
      const val = args[++i];
      if (!val || !VALID_QUALITIES.includes(val)) {
        die(`Invalid quality: "${val}". Choose: low | medium | high (gpt-image-1 only)`);
      }
      quality = val as GenerationQuality;
    } else if (arg === '--priority' || arg === '-p') {
      const val = args[++i] ?? '';
      priorityFilter = val.split(',').map((p) => p.trim() as AssetPriority);
    } else if (arg === '--dry-run' || arg === '-d') {
      dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else if (arg === '--skip-existing') {
      skipExisting = true;
    } else if (arg === '--ladder') {
      ladder = true;
    } else if (arg === '--similarity-threshold') {
      const val = args[++i];
      const num = Number(val);
      if (!val || Number.isNaN(num) || num < 0 || num > 100) {
        die(`Invalid similarity threshold: "${val}". Must be a number 0-100.`);
      }
      similarityThreshold = num;
    } else if (arg === '--real-photos-dir') {
      realPhotosDir = args[++i];
    } else if (arg === '--real-photos-map') {
      realPhotosMap = args[++i];
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    } else {
      die(`Unknown argument: ${arg}`);
    }
  }

  if (positional.length < 1 && !mockupPath) die('No mockup image path provided. Use --mockup <path> or pass as first positional argument.');
  if (positional.length < 2 && !deconstructionPath) die('No deconstruction JSON path provided. Use --deconstruction <path> or pass as second positional argument.');

  // Positional args override flags if provided
  if (positional[0]) mockupPath = positional[0];
  if (positional[1]) deconstructionPath = positional[1];

  return { mockupPath, deconstructionPath, outputDir, format, model, quality, priorityFilter, dryRun, verbose, skipExisting, ladder, similarityThreshold, realPhotosDir, realPhotosMap };
}

// ── Help text ─────────────────────────────────────────────────

function printHelp(): void {
  console.log(`
Asset Generator v0.1.0 — Sorted Manufacturing Line

USAGE
  npm run assets -- <mockup.jpg> <deconstruction.json> [options]
  npm run assets -- --mockup <mockup.jpg> --deconstruction <deconstruction.json> [options]

ARGUMENTS
  <mockup.jpg>           Path to the mockup image (or use --mockup)
  <deconstruction.json>  Path to the deconstruction JSON (or use --deconstruction)

OPTIONS
  --mockup          Path to the mockup image (alternative to positional arg)
  --deconstruction  Path to the deconstruction JSON (alternative to positional arg)
  --output, -o      Output directory  (default: output/)
  --format, -f      Output image format: webp | jpg | png  (default: webp)
  --model, -m       Generation model: flux-2-flex | flux-2-max | gemini-2.5-flash-image | gpt-image-1 | dall-e-3  (default: flux-2-flex)
  --quality, -q     Rendering fidelity, gpt-image-1 only: low | medium | high  (default: high)
  --priority, -p    Only process these priorities (comma-separated): critical,high,medium,low
  --dry-run, -d     Show what would be done — no files written, prints estimated cost
  --skip-existing   Skip assets whose output folder already exists
  --ladder          Cost-escalation decision tree instead of a fixed --model. Excludes icons
                    entirely (frontend-builder supplies these). No mockup extraction — all assets
                    are generated. Classifies as human or non-human:
                      HUMAN:      real photo on file?  -> GPT reconstructs it (image reference)
                                  no real photo?        -> GPT generates from description (flagged
                                                           for replacement once real photography exists)
                      NON-HUMAN:  gemini-2.5-flash-image -> flux-2-flex -> flux-2-max -> human review
                    All reconstruction calls (human or non-human) use the same recovery-focused
                    prompt (docs: doctrine/image-reconstruction-operator.md) — minimum visual
                    change, not creative reinterpretation. Generation rungs are graded by a
                    vision-model similarity judge; only escalates on failure. Ignores --model/--quality.
  --similarity-threshold  Min judge score 0-100 to accept a ladder rung (default: 75)
  --real-photos-dir <dir>   Directory of client-supplied real photos for the human branch
  --real-photos-map <json>  { "asset_id": "filename.jpg" } mapping into --real-photos-dir
  --verbose, -v     Show detailed progress
  --help, -h        Show this help

ENVIRONMENT VARIABLES
  FLUX_API_KEY      Required for recreate mode with flux-2-flex (default) or any flux-* model
  OPENAI_API_KEY    Required for gpt-image-1 or dall-e-3; also used by --ladder for the
                    human branch and the non-human similarity judge
  GEMINI_API_KEY    Required for gemini-2.5-flash-image model and --ladder's Gemini rung

APPROX. COST PER RECREATED IMAGE (see dry-run output for exact estimate)
  flux-2-flex          $0.05/MP (~$0.07 per wide image)
  flux-2-max           $0.07/MP (~$0.10 per wide image)
  gemini-2.5-flash-image ~$0.039 per image
  gpt-image-1  low     $0.011 (square) / $0.016 (wide)
  gpt-image-1  medium  $0.042 (square) / $0.063 (wide)
  gpt-image-1  high    $0.167 (square) / $0.25  (wide)
  dall-e-3     hd      ~$0.08 (square) / ~$0.12 (wide)

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
  npm run assets -- mockup.jpg output/mockup.json --model flux-2-flex
  npm run assets -- mockup.jpg output/mockup.json --model flux-2-max
  npm run assets -- mockup.jpg output/mockup.json --model gemini-2.5-flash-image
  npm run assets -- mockup.jpg output/mockup.json --model gpt-image-1 --quality medium
  npm run assets -- mockup.jpg output/mockup.json --model dall-e-3 --format jpg
  npm run assets -- mockup.jpg output/mockup.json --output /path/to/client/assets/
  npm run assets -- mockup.jpg output/mockup.json --ladder --dry-run
  npm run assets -- mockup.jpg output/mockup.json --ladder --similarity-threshold 80
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
