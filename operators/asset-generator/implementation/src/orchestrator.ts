// ─────────────────────────────────────────────────────────────
// Asset Generator — Core Orchestrator
// Processes every asset in the deconstruction JSON:
//   1. Resolves execution mode (extract / recreate / reuse / source)
//   2. Runs the appropriate production pipeline
//   3. Produces size variants
//   4. Builds manifest + generation log
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import type {
  AssetGeneratorConfig,
  InputAsset,
  AssetResult,
  LogEntry,
  ExecutionMode,
} from './types.js';
import { validateDeconstruction } from './schema.js';
import { resolveMode, filterAndSortAssets } from './quality.js';
import { extractFromMockup } from './extract.js';
import { generateAsset } from './generate.js';
import { produceVariants, toRelativePaths } from './resize.js';
import { buildManifest, writeManifest, writeGenerationLog, printSummary } from './manifest.js';

// ── Main entry point ──────────────────────────────────────────

export async function runAssetGenerator(config: AssetGeneratorConfig): Promise<void> {
  const {
    mockupPath,
    deconstructionPath,
    outputDir,
    format,
    model,
    priorityFilter,
    dryRun = false,
    verbose = false,
    skipExisting = false,
  } = config;

  // ── 1. Validate inputs ─────────────────────────────────────
  const resolvedMockup = path.resolve(mockupPath);
  const resolvedDeconstruction = path.resolve(deconstructionPath);

  if (!fs.existsSync(resolvedMockup)) {
    throw new Error(`Mockup image not found: ${resolvedMockup}`);
  }
  if (!fs.existsSync(resolvedDeconstruction)) {
    throw new Error(`Deconstruction JSON not found: ${resolvedDeconstruction}`);
  }

  const raw = JSON.parse(fs.readFileSync(resolvedDeconstruction, 'utf-8'));
  const parsed = validateDeconstruction(raw);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join('.')} — ${i.message}`).join('\n');
    throw new Error(`Deconstruction JSON validation failed:\n${issues}`);
  }

  const deconstruction = parsed.data;
  const apiKey = process.env.OPENAI_API_KEY ?? '';

  if (!apiKey && !dryRun) {
    throw new Error('OPENAI_API_KEY is required for recreate mode. Set it in your .env file.');
  }

  const styleHint = [
    deconstruction.build_notes?.style,
    deconstruction.build_notes?.theme,
  ]
    .filter(Boolean)
    .join(', ');

  const assetsToProcess = filterAndSortAssets(deconstruction.assets, priorityFilter);

  if (verbose) {
    console.log(`\nAsset Generator v0.1.0`);
    console.log('─'.repeat(40));
    console.log(`  Mockup    : ${path.basename(resolvedMockup)}`);
    console.log(`  Assets    : ${assetsToProcess.length} to process`);
    console.log(`  Format    : ${format}`);
    console.log(`  Model     : ${model}`);
    console.log(`  Output    : ${path.resolve(outputDir)}`);
    if (dryRun) console.log(`  Mode      : DRY RUN — no files will be written`);
    console.log('');
  }

  // ── 2. Process assets ──────────────────────────────────────
  const results: AssetResult[] = [];
  const logEntries: LogEntry[] = [];

  for (const asset of assetsToProcess) {
    const start = Date.now();

    if (verbose) {
      console.log(`  [${asset.priority}] ${asset.id} (${asset.type})`);
    }

    const assetDir = path.join(path.resolve(outputDir), 'assets', asset.id);
    const result = await processAsset(
      asset,
      resolvedMockup,
      assetDir,
      format,
      model,
      apiKey,
      styleHint,
      dryRun,
      skipExisting,
      verbose,
    );

    // Store relative paths in manifest
    result.files = toRelativePaths(result.files, path.resolve(outputDir));
    results.push(result);

    const duration = Date.now() - start;
    logEntries.push({
      asset_id: asset.id,
      mode: result.mode,
      status: result.status,
      duration_ms: duration,
      model: result.meta.source_model,
      prompt: result.meta.prompt_used,
      error: result.meta.error,
      timestamp: new Date().toISOString(),
    });

    if (verbose) {
      const statusIcon = result.status === 'ok' ? '✓' : result.status === 'skipped' ? '–' : '✗';
      console.log(`    ${statusIcon} ${result.mode} → ${result.status} (${duration}ms)`);
      if (result.meta.error) console.log(`    Error: ${result.meta.error}`);
    }
  }

  // ── 3. Write manifest + log ────────────────────────────────
  if (!dryRun) {
    const manifest = buildManifest(resolvedMockup, resolvedDeconstruction, results);
    const manifestPath = writeManifest(manifest, path.resolve(outputDir));
    const logPath = writeGenerationLog(logEntries, path.resolve(outputDir));

    if (verbose) {
      console.log(`\n  manifest.json    → ${manifestPath}`);
      console.log(`  generation-log   → ${logPath}`);
    }

    printSummary(manifest, logEntries);
  } else {
    console.log('\nDry run complete — no files written.');
    for (const r of results) {
      console.log(`  ${r.id.padEnd(30)} ${r.mode.padEnd(10)} ${r.status}`);
    }
  }
}

// ── Process a single asset ────────────────────────────────────

async function processAsset(
  asset: InputAsset,
  mockupPath: string,
  assetDir: string,
  format: string,
  model: string,
  apiKey: string,
  styleHint: string,
  dryRun: boolean,
  skipExisting: boolean,
  verbose: boolean,
): Promise<AssetResult> {
  const fmt = format as import('./types.js').OutputFormat;
  const ext = `.${fmt}`;
  const originalPath = path.join(assetDir, `original${ext}`);

  // Skip if already processed
  if (skipExisting && fs.existsSync(originalPath)) {
    return {
      id: asset.id,
      mode: 'skip',
      status: 'skipped',
      files: { original: path.relative(path.dirname(assetDir), originalPath) },
      meta: { format: fmt, error: undefined },
    };
  }

  // Resolve mode
  const { mode, reason } = await resolveMode(asset, mockupPath, verbose);

  if (verbose) {
    console.log(`    mode: ${mode} — ${reason}`);
  }

  if (dryRun) {
    return {
      id: asset.id,
      mode,
      status: 'skipped',
      files: {},
      meta: { format: fmt },
    };
  }

  // Execute mode
  try {
    switch (mode) {
      case 'extract':
        return await runExtract(asset, mockupPath, assetDir, fmt);
      case 'recreate':
        return await runRegenerate(asset, assetDir, fmt, model as import('./types.js').GenerationModel, apiKey, styleHint);
      case 'reuse':
        return makeSkipResult(asset.id, 'reuse', fmt, 'Reuse — supply brand asset manually');
      case 'source':
        return makeSkipResult(asset.id, 'source', fmt, 'Stock — source manually from stock library');
      default:
        return makeSkipResult(asset.id, 'skip', fmt, 'Unknown mode');
    }
  } catch (err) {
    return {
      id: asset.id,
      mode,
      status: 'failed',
      files: {},
      meta: { format: fmt, error: (err as Error).message },
    };
  }
}

// ── Extract pipeline ──────────────────────────────────────────

async function runExtract(
  asset: InputAsset,
  mockupPath: string,
  assetDir: string,
  format: import('./types.js').OutputFormat,
): Promise<AssetResult> {
  const ext = `.${format}`;
  const rawExtractPath = path.join(assetDir, `extracted${ext}`);

  if (!asset.bbox) throw new Error(`Cannot extract ${asset.id} — no bbox provided`);

  const extracted = await extractFromMockup(mockupPath, asset.bbox, rawExtractPath, format);
  const variants = await produceVariants(extracted.outputPath, assetDir, format);

  fs.unlinkSync(rawExtractPath); // remove temp extracted file

  return {
    id: asset.id,
    mode: 'extract',
    status: 'ok',
    files: variants.files,
    meta: {
      format,
      width: variants.originalWidth,
      height: variants.originalHeight,
      extracted_from: path.basename(mockupPath),
      aspect_ratio: asset.aspect_ratio,
    },
  };
}

// ── Recreate pipeline ─────────────────────────────────────────

async function runRegenerate(
  asset: InputAsset,
  assetDir: string,
  format: import('./types.js').OutputFormat,
  model: import('./types.js').GenerationModel,
  apiKey: string,
  styleHint: string,
): Promise<AssetResult> {
  const ext = `.${format}`;
  const genPath = path.join(assetDir, `generated${ext}`);

  const genResult = await generateAsset({
    assetId: asset.id,
    description: asset.description,
    assetType: asset.type,
    aspectRatio: asset.aspect_ratio,
    style: styleHint || undefined,
    outputPath: genPath,
    format,
    model,
    apiKey,
  });

  const variants = await produceVariants(genResult.outputPath, assetDir, format);

  // Clean up temp generated file if it's not already in the right place
  if (fs.existsSync(genPath) && genPath !== variants.files.original) {
    fs.unlinkSync(genPath);
  }

  return {
    id: asset.id,
    mode: 'recreate',
    status: 'ok',
    files: variants.files,
    meta: {
      format,
      width: genResult.width,
      height: genResult.height,
      source_model: genResult.model,
      prompt_used: genResult.promptUsed,
      aspect_ratio: asset.aspect_ratio,
    },
  };
}

// ── Skip result helper ────────────────────────────────────────

function makeSkipResult(
  id: string,
  mode: ExecutionMode,
  format: import('./types.js').OutputFormat,
  error?: string,
): AssetResult {
  return {
    id,
    mode,
    status: 'skipped',
    files: {},
    meta: { format, error },
  };
}
