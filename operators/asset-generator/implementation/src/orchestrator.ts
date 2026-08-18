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
import { extractFromMockup, checkExtractionQuality } from './extract.js';
import { generateAsset, isFluxModel } from './generate.js';
import { produceVariants, toRelativePaths } from './resize.js';
import { buildManifest, writeManifest, writeGenerationLog, printSummary } from './manifest.js';
import { estimateAssetCost, formatUsd } from './cost.js';
import { runLadder } from './ladder.js';
import { isHumanAsset, isIconAsset } from './classify.js';
import { resolveRealPhoto } from './real-photos.js';

// ── Main entry point ──────────────────────────────────────────

export async function runAssetGenerator(config: AssetGeneratorConfig): Promise<void> {
  const {
    mockupPath,
    deconstructionPath,
    outputDir,
    format,
    model,
    quality,
    priorityFilter,
    dryRun = false,
    verbose = false,
    skipExisting = false,
    ladder = false,
    similarityThreshold,
    realPhotosDir,
    realPhotosMap,
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
  const openaiApiKey = process.env.OPENAI_API_KEY ?? '';
  const fluxApiKey = process.env.FLUX_API_KEY ?? '';

  // Ladder mode walks multiple providers per asset, so it needs both keys
  // (missing keys just skip that rung rather than hard-failing).
  const apiKey = isFluxModel(model) ? fluxApiKey : openaiApiKey;
  const requiredKeyName = isFluxModel(model) ? 'FLUX_API_KEY' : 'OPENAI_API_KEY';

  if (!ladder && !apiKey && !dryRun) {
    throw new Error(`${requiredKeyName} is required for recreate mode with model "${model}". Set it in your .env file.`);
  }
  if (ladder && !openaiApiKey && !dryRun) {
    throw new Error('OPENAI_API_KEY is required in ladder mode (used for the entire human branch and the non-human similarity judge). Set it in your .env file.');
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
    const result = ladder
      ? await processAssetLadder(asset, resolvedMockup, assetDir, format, openaiApiKey, fluxApiKey, styleHint, similarityThreshold, realPhotosDir, realPhotosMap, dryRun, skipExisting, verbose)
      : await processAsset(
          asset,
          resolvedMockup,
          assetDir,
          format,
          model,
          quality,
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
  } else if (ladder) {
    console.log('\nDry run complete — no files written (ladder mode: exact cost depends on which rung wins per asset).');
    for (const r of results) {
      console.log(`  ${r.id.padEnd(30)} ${(r.meta.error ?? '').slice(0, 70)}`);
    }
    console.log('');
    console.log('  Re-run with --real to walk the ladder for real and see actual cost per asset.');
  } else {
    console.log('\nDry run complete — no files written.');
    let totalCost = 0;
    let recreateCount = 0;
    for (let i = 0; i < results.length; i++) {
      const r = results[i]!;
      const asset = assetsToProcess[i]!;
      let costLabel = '';
      if (r.mode === 'recreate') {
        const cost = estimateAssetCost(model, quality, asset.aspect_ratio);
        totalCost += cost;
        recreateCount++;
        costLabel = `~${formatUsd(cost)}`;
      }
      console.log(`  ${r.id.padEnd(30)} ${r.mode.padEnd(10)} ${r.status.padEnd(10)} ${costLabel}`);
    }
    console.log('');
    console.log(`  Model            : ${model}${model === 'gpt-image-1' ? ` (quality: ${quality ?? 'high'})` : ''}`);
    console.log(`  Recreate assets  : ${recreateCount}`);
    console.log(`  Estimated cost   : ~${formatUsd(totalCost)}`);
  }
}

// ── Process a single asset ────────────────────────────────────

async function processAsset(
  asset: InputAsset,
  mockupPath: string,
  assetDir: string,
  format: string,
  model: string,
  quality: import('./types.js').GenerationQuality | undefined,
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
        return await runRegenerate(asset, assetDir, fmt, model as import('./types.js').GenerationModel, quality, apiKey, styleHint);
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

// ── Process a single asset — cost-escalation ladder mode ──────

async function processAssetLadder(
  asset: InputAsset,
  mockupPath: string,
  assetDir: string,
  format: string,
  openaiApiKey: string,
  fluxApiKey: string,
  styleHint: string,
  similarityThreshold: number | undefined,
  realPhotosDir: string | undefined,
  realPhotosMap: string | undefined,
  dryRun: boolean,
  skipExisting: boolean,
  verbose: boolean,
): Promise<AssetResult> {
  const fmt = format as import('./types.js').OutputFormat;
  const ext = `.${fmt}`;
  const originalPath = path.join(assetDir, `original${ext}`);

  if (skipExisting && fs.existsSync(originalPath)) {
    return {
      id: asset.id,
      mode: 'skip',
      status: 'skipped',
      files: { original: path.relative(path.dirname(assetDir), originalPath) },
      meta: { format: fmt },
    };
  }

  // reuse/stock assets never enter the ladder — same as fixed-model mode
  if (asset.source === 'reuse') return makeSkipResult(asset.id, 'reuse', fmt, 'Reuse — supply brand asset manually');
  if (asset.source === 'stock') return makeSkipResult(asset.id, 'source', fmt, 'Stock — source manually from stock library');

  // Icons are excluded entirely — frontend-builder supplies these itself (Lucide)
  if (isIconAsset(asset)) {
    return { id: asset.id, mode: 'excluded', status: 'skipped', files: {}, meta: { format: fmt, error: 'Icon — supplied by frontend-builder (Lucide), not extracted or generated' } };
  }

  if (dryRun) {
    // Dry run can't know which rung will win without spending money — report the
    // classification + decision point only, so cost stays at $0.
    const humanAsset = isHumanAsset(asset);
    let note: string;
    if (humanAsset) {
      const realPhotoPath = resolveRealPhoto(asset.id, realPhotosDir, realPhotosMap);
      if (realPhotoPath) {
        note = `HUMAN — real photo on file (${path.basename(realPhotoPath)}), would GPT-reconstruct it`;
      } else if (asset.bbox) {
        note = 'HUMAN — no real photo, would GPT-reconstruct from the mockup crop (flagged for replacement)';
      } else {
        note = 'HUMAN — no real photo and no bbox, would blind-generate (flagged for replacement)';
      }
    } else if (asset.bbox) {
      const check = await checkExtractionQuality(mockupPath, asset.bbox, asset.type);
      note = check.pass ? 'crop already meets minimum — would extract at $0' : 'would attempt upscale, else escalate flux-2-flex -> flux-2-max (image-edit from crop)';
    } else {
      note = 'no bbox — would start at flux-2-flex (blind text)';
    }
    return { id: asset.id, mode: 'skip', status: 'skipped', files: {}, meta: { format: fmt, is_human_asset: humanAsset, error: note } };
  }

  if (!fs.existsSync(assetDir)) fs.mkdirSync(assetDir, { recursive: true });

  const ladderResult = await runLadder({
    asset,
    mockupPath,
    assetDir,
    format: fmt,
    styleHint,
    openaiApiKey,
    fluxApiKey,
    similarityThreshold,
    realPhotosDir,
    realPhotosMap,
    verbose,
  });

  if (ladderResult.finalMode === 'human_review' || !ladderResult.chosen) {
    return {
      id: asset.id,
      mode: 'human_review',
      status: 'skipped',
      files: {},
      meta: {
        format: fmt,
        estimated_cost_usd: ladderResult.totalCost,
        ladder_attempts: ladderResult.attempts,
        is_human_asset: ladderResult.isHumanAsset,
        error: 'All ladder rungs failed similarity/quality checks — needs manual sourcing',
      },
    };
  }

  const variants = await produceVariants(ladderResult.chosen.outputPath!, assetDir, fmt);

  // Clean up the winning rung's raw temp file if resize wrote a distinct original
  const rawPath = ladderResult.chosen.outputPath!;
  if (fs.existsSync(rawPath) && rawPath !== variants.files.original) {
    fs.unlinkSync(rawPath);
  }

  const executionMode: import('./types.js').ExecutionMode =
    ladderResult.finalMode === 'extract' || ladderResult.finalMode === 'extract-upscale' ? 'extract' : 'recreate';

  return {
    id: asset.id,
    mode: executionMode,
    status: 'ok',
    files: variants.files,
    meta: {
      format: fmt,
      width: variants.originalWidth,
      height: variants.originalHeight,
      source_model: ladderResult.chosen.model,
      aspect_ratio: asset.aspect_ratio,
      estimated_cost_usd: ladderResult.totalCost,
      ladder_attempts: ladderResult.attempts,
      is_human_asset: ladderResult.isHumanAsset,
      real_photo_used: ladderResult.realPhotoUsed,
      ai_placeholder_human: ladderResult.aiPlaceholderHuman,
    },
  };
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
  quality: import('./types.js').GenerationQuality | undefined,
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
    quality,
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
      estimated_cost_usd: estimateAssetCost(model, quality, asset.aspect_ratio),
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
