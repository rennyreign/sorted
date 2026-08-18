// ─────────────────────────────────────────────────────────────
// Asset Generator — Cost-Escalation Decision Tree
//
//   FULL MOCKUP -> VISION DETECTOR -> bboxes -> PROGRAMMATIC CROP -> ASSET CLASSIFIER
//     ↓
//   Icon?  -> EXCLUDED (frontend-builder supplies these — Lucide, per doctrine)
//     ↓ no
//   Human face / real person?
//     YES -> Existing real client photo available?
//              YES -> GPT reconstructs it (RECONSTRUCTION_PROMPT, image reference)  -> EXPORT
//              NO, but a mockup crop exists -> GPT reconstructs FROM THAT CROP      -> EXPORT (flagged: not verified real photography)
//              NO crop at all (rare) -> GPT generates blind from text               -> EXPORT (flagged)
//     NO  -> crop already big enough?          -> extract ($0)  -> EXPORT
//            crop upscale within cap?          -> upscale ($0)  -> EXPORT
//            otherwise -> flux-2-flex (image-edit from crop if available) -> pass? -> EXPORT
//                          NO -> flux-2-max (same) -> pass? -> EXPORT
//                                                     NO -> HUMAN REVIEW
//
// Every image-conditioned reconstruction call (human or non-human) uses the
// same RECONSTRUCTION_PROMPT — recovery, not reinterpretation. Humans never
// get a from-scratch AI face when a reference (real photo or mockup crop)
// exists to reconstruct from instead.
// ─────────────────────────────────────────────────────────────

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import type { InputAsset, LadderAttempt, LadderResult, OutputFormat } from './types.js';
import { checkExtractionQuality, extractFromMockup } from './extract.js';
import { generateAsset, reconstructFromReference } from './generate.js';
import { judgeSimilarity } from './similarity.js';
import { isHumanAsset, isIconAsset } from './classify.js';
import { resolveRealPhoto } from './real-photos.js';
import { estimateAssetCost, estimateEditCost, estimateFluxEditCost, UPSCALE_COST, SIMILARITY_JUDGE_COST } from './cost.js';

const UPSCALE_SCALE_FACTOR_CAP = 2; // beyond this, sharp upscale quality degrades too much — fall through

// Minimum usable dimensions per asset type (mirrors extract.ts MIN_DIMENSIONS — the "target" size)
const MIN_DIMENSIONS: Record<string, { w: number; h: number }> = {
  person: { w: 400, h: 400 },
  avatar: { w: 100, h: 100 },
  logo: { w: 200, h: 80 },
  hero_image: { w: 800, h: 400 },
  background: { w: 1200, h: 600 },
  product: { w: 400, h: 400 },
  icon: { w: 48, h: 48 },
  illustration: { w: 400, h: 300 },
  screenshot: { w: 600, h: 400 },
  gallery_image: { w: 400, h: 300 },
  generic: { w: 200, h: 200 },
};

export interface LadderOptions {
  asset: InputAsset;
  mockupPath: string;
  assetDir: string;
  format: OutputFormat;
  styleHint: string;
  openaiApiKey: string;
  fluxApiKey: string;
  similarityThreshold?: number;
  realPhotosDir?: string;
  realPhotosMap?: string;
  verbose?: boolean;
}

// ── Free-tier check, shared by human and non-human paths ──────
// Returns a passing attempt if the crop is already usable or can be
// cheaply upscaled within the quality cap; otherwise null (fall through).
async function attemptFreeExtraction(
  asset: InputAsset,
  mockupPath: string,
  assetDir: string,
  format: OutputFormat,
  log: (msg: string) => void,
): Promise<{ attempt: LadderAttempt; finalMode: 'extract' | 'extract-upscale' } | null> {
  if (!asset.bbox) return null;

  const check = await checkExtractionQuality(mockupPath, asset.bbox, asset.type);
  const ext = `.${format}`;

  if (check.pass) {
    const outPath = path.join(assetDir, `extracted${ext}`);
    await extractFromMockup(mockupPath, asset.bbox, outPath, format);
    log(`crop ${check.width}×${check.height}px already meets minimum — direct extract, $0`);
    return { attempt: { rung: 'upscale', model: 'sharp-extract', cost: 0, pass: true, outputPath: outPath }, finalMode: 'extract' };
  }

  const mins = MIN_DIMENSIONS[asset.type] ?? MIN_DIMENSIONS.generic!;
  const scaleFactor = Math.max(mins.w / Math.max(check.width, 1), mins.h / Math.max(check.height, 1));

  if (scaleFactor <= UPSCALE_SCALE_FACTOR_CAP) {
    const rawPath = path.join(assetDir, `extracted-raw${ext}`);
    const outPath = path.join(assetDir, `extracted${ext}`);
    await extractFromMockup(mockupPath, asset.bbox, rawPath, format);

    const targetW = Math.round(check.width * scaleFactor);
    const targetH = Math.round(check.height * scaleFactor);
    await sharp(rawPath)
      .resize({ width: targetW, height: targetH, kernel: 'lanczos3', withoutEnlargement: false })
      .toFile(outPath);
    if (fs.existsSync(rawPath) && rawPath !== outPath) fs.unlinkSync(rawPath);

    log(`crop ${check.width}×${check.height}px upscaled ${scaleFactor.toFixed(2)}x to ${targetW}×${targetH}px (≤${UPSCALE_SCALE_FACTOR_CAP}x cap) — $0`);
    return { attempt: { rung: 'upscale', model: 'sharp-upscale', cost: UPSCALE_COST, pass: true, outputPath: outPath }, finalMode: 'extract-upscale' };
  }

  log(`crop ${check.width}×${check.height}px needs ${scaleFactor.toFixed(2)}x upscale, over ${UPSCALE_SCALE_FACTOR_CAP}x cap — falling through`);
  return null;
}

// Crop the bbox region to a temp file for use as a reconstruction reference.
async function cropReference(asset: InputAsset, mockupPath: string, assetDir: string, format: OutputFormat): Promise<string | null> {
  if (!asset.bbox) return null;
  const refPath = path.join(assetDir, `crop-reference.${format}`);
  await extractFromMockup(mockupPath, asset.bbox, refPath, format);
  return refPath;
}

export async function runLadder(opts: LadderOptions): Promise<LadderResult> {
  const { asset, mockupPath, assetDir, format, styleHint, openaiApiKey, fluxApiKey, verbose } = opts;
  const attempts: LadderAttempt[] = [];
  const log = (msg: string) => { if (verbose) console.log(`      [ladder] ${msg}`); };

  // ── Icons are excluded entirely — frontend-builder supplies these ──
  if (isIconAsset(asset)) {
    log('icon — excluded, frontend-builder supplies this (Lucide)');
    return { finalMode: 'excluded', attempts: [], totalCost: 0, isHumanAsset: false };
  }

  const humanAsset = isHumanAsset(asset);
  log(`classified as ${humanAsset ? 'HUMAN' : 'non-human'} (type: ${asset.type})`);

  // ── Human branch — reconstruct from a reference, never fabricate from scratch when one exists ──
  if (humanAsset) {
    if (!openaiApiKey) {
      return { finalMode: 'human_review', attempts: [{ rung: 'gpt-human-generate', model: 'gpt-image-1', cost: 0, pass: false, reasoning: 'No OPENAI_API_KEY configured' }], totalCost: 0, isHumanAsset: true };
    }

    const realPhotoPath = resolveRealPhoto(asset.id, opts.realPhotosDir, opts.realPhotosMap);
    const ext = `.${format}`;

    // Reference priority: real client photo > the mockup's own crop > nothing (blind generate)
    let referencePath: string | null = realPhotoPath;
    let referenceIsRealPhoto = Boolean(realPhotoPath);
    if (!referencePath) {
      referencePath = await cropReference(asset, mockupPath, assetDir, format);
      if (referencePath) log(`no real photo on file — reconstructing from the mockup's own crop (flagged for replacement)`);
    } else {
      log(`real photo found: ${realPhotoPath} — reconstructing from it`);
    }

    if (referencePath) {
      const outPath = path.join(assetDir, `${referenceIsRealPhoto ? 'edited-real-photo' : 'reconstructed'}${ext}`);
      const cost = estimateEditCost(asset.aspect_ratio);
      try {
        await reconstructFromReference({
          referenceImagePath: referencePath,
          description: asset.description,
          assetType: asset.type,
          aspectRatio: asset.aspect_ratio,
          outputPath: outPath,
          format,
          quality: 'high',
          apiKey: openaiApiKey,
        });
        const attempt: LadderAttempt = {
          rung: referenceIsRealPhoto ? 'gpt-human-edit' : 'gpt-reconstruct',
          model: 'gpt-image-1-edit',
          cost,
          pass: true,
          outputPath: outPath,
        };
        attempts.push(attempt);
        return {
          finalMode: 'recreate',
          attempts,
          totalCost: cost,
          chosen: attempt,
          isHumanAsset: true,
          realPhotoUsed: referenceIsRealPhoto ? realPhotoPath! : undefined,
          aiPlaceholderHuman: !referenceIsRealPhoto,
        };
      } catch (err) {
        attempts.push({ rung: referenceIsRealPhoto ? 'gpt-human-edit' : 'gpt-reconstruct', model: 'gpt-image-1-edit', cost: 0, pass: false, reasoning: `Reconstruction failed: ${(err as Error).message}` });
        // fall through to blind generate rather than hard-failing the asset
      }
    } else {
      log('no real photo and no bbox to crop — falling back to blind text generation');
    }

    const outPath = path.join(assetDir, `generated-human${ext}`);
    const cost = estimateAssetCost('gpt-image-1', 'high', asset.aspect_ratio);
    try {
      await generateAsset({
        assetId: asset.id,
        description: asset.description,
        assetType: asset.type,
        aspectRatio: asset.aspect_ratio,
        style: styleHint || undefined,
        outputPath: outPath,
        format,
        model: 'gpt-image-1',
        quality: 'high',
        apiKey: openaiApiKey,
      });
      const attempt: LadderAttempt = { rung: 'gpt-human-generate', model: 'gpt-image-1', cost, pass: true, outputPath: outPath };
      attempts.push(attempt);
      return { finalMode: 'recreate', attempts, totalCost: attempts.reduce((s, a) => s + a.cost, 0), chosen: attempt, isHumanAsset: true, aiPlaceholderHuman: true };
    } catch (err) {
      attempts.push({ rung: 'gpt-human-generate', model: 'gpt-image-1', cost: 0, pass: false, reasoning: `Generation failed: ${(err as Error).message}` });
      return { finalMode: 'human_review', attempts, totalCost: 0, isHumanAsset: true };
    }
  }

  // ── Non-human branch ──────────────────────────────────────────

  const free = await attemptFreeExtraction(asset, mockupPath, assetDir, format, log);
  if (free) {
    attempts.push(free.attempt);
    return { finalMode: free.finalMode, attempts, totalCost: 0, chosen: free.attempt, isHumanAsset: false };
  }
  if (asset.bbox) {
    attempts.push({ rung: 'upscale', model: 'sharp-upscale', cost: 0, pass: false, reasoning: 'Required scale factor exceeds the free-upscale cap' });
  } else {
    log('no bbox on this asset — starting at flux-2-flex');
  }

  // Rungs 2-3: flux-2-flex -> flux-2-max, image-edited from the mockup crop when available, judged by vision similarity
  const referenceImagePath = await cropReference(asset, mockupPath, assetDir, format);
  if (referenceImagePath) log(`reconstructing from mockup crop via Flux image-edit`);

  const threshold = opts.similarityThreshold;
  const rungs: Array<{ rung: LadderAttempt['rung']; model: 'flux-2-flex' | 'flux-2-max' }> = [
    { rung: 'flux-flex', model: 'flux-2-flex' },
    { rung: 'flux-max', model: 'flux-2-max' },
  ];

  let totalCost = attempts.reduce((s, a) => s + a.cost, 0);

  for (const { rung, model } of rungs) {
    if (!fluxApiKey) {
      log(`skipping ${model} — no FLUX_API_KEY configured`);
      attempts.push({ rung, model, cost: 0, pass: false, reasoning: 'No FLUX_API_KEY configured' });
      continue;
    }

    const ext = `.${format}`;
    const outPath = path.join(assetDir, `generated-${rung}${ext}`);
    const genCost = referenceImagePath
      ? estimateFluxEditCost(model, ...(await referenceApproxDims(referenceImagePath)))
      : estimateAssetCost(model, undefined, asset.aspect_ratio);

    log(`trying ${model} (~$${genCost.toFixed(3)})...`);
    try {
      await generateAsset({
        assetId: asset.id,
        description: asset.description,
        assetType: asset.type,
        aspectRatio: asset.aspect_ratio,
        style: styleHint || undefined,
        outputPath: outPath,
        format,
        model,
        apiKey: fluxApiKey,
        referenceImagePath: referenceImagePath ?? undefined,
      });

      const judgment = await judgeSimilarity({
        candidatePath: outPath,
        description: asset.description,
        assetType: asset.type,
        styleHint,
        apiKey: openaiApiKey,
        threshold,
      });

      const cost = genCost + SIMILARITY_JUDGE_COST;
      totalCost += cost;
      const attempt: LadderAttempt = {
        rung,
        model,
        cost,
        pass: judgment.pass,
        score: judgment.score,
        reasoning: judgment.reasoning,
        outputPath: outPath,
      };
      attempts.push(attempt);
      log(`${model} -> score ${judgment.score}/100, ${judgment.pass ? 'PASS' : 'FAIL'} — ${judgment.reasoning}`);

      if (judgment.pass) {
        return { finalMode: 'recreate', attempts, totalCost, chosen: attempt, isHumanAsset: false };
      }
    } catch (err) {
      attempts.push({ rung, model, cost: 0, pass: false, reasoning: `Generation failed: ${(err as Error).message}` });
    }
  }

  log('all rungs failed or unavailable — flagging for human review');
  return { finalMode: 'human_review', attempts, totalCost, isHumanAsset: false };
}

async function referenceApproxDims(referenceImagePath: string): Promise<[number, number]> {
  const meta = await sharp(referenceImagePath).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;
  const maxMp = 1.5;
  const scale = Math.max(1, Math.sqrt((maxMp * 1_000_000) / (w * h)));
  return [Math.round(w * scale), Math.round(h * scale)];
}
