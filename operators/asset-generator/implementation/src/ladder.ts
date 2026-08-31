// ─────────────────────────────────────────────────────────────
// Asset Generator — Cost-Escalation Decision Tree
//
//   ASSET CLASSIFIER
//     ↓
//   Icon?  -> EXCLUDED (frontend-builder supplies these — Lucide, per doctrine)
//     ↓ no
//   Human face / real person?
//     YES -> Existing real client photo available?
//              YES -> GPT reconstructs it (RECONSTRUCTION_PROMPT, image reference)  -> EXPORT
//              NO  -> GPT generates from description (flagged for replacement)       -> EXPORT
//     NO  -> gemini-2.5-flash-image -> flux-2-flex -> flux-2-max -> human review
//
// No mockup extraction. All assets are generated fresh.
// Mockup crops are low-resolution samples unsuitable for production.
//
// Every image-conditioned reconstruction call (human or non-human) uses the
// same RECONSTRUCTION_PROMPT — recovery, not reinterpretation. Humans never
// get a from-scratch AI face when a reference (real photo) exists to
// reconstruct from instead.
// ─────────────────────────────────────────────────────────────

import path from 'path';
import type { InputAsset, LadderAttempt, LadderResult, OutputFormat } from './types.js';
import { generateAsset, reconstructFromReference } from './generate.js';
import { judgeSimilarity } from './similarity.js';
import { isHumanAsset, isIconAsset } from './classify.js';
import { resolveRealPhoto } from './real-photos.js';
import { estimateAssetCost, estimateEditCost, SIMILARITY_JUDGE_COST } from './cost.js';

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

export async function runLadder(opts: LadderOptions): Promise<LadderResult> {
  const { asset, assetDir, format, styleHint, openaiApiKey, fluxApiKey, verbose } = opts;
  const attempts: LadderAttempt[] = [];
  const log = (msg: string) => { if (verbose) console.log(`      [ladder] ${msg}`); };

  // ── Icons are excluded entirely — frontend-builder supplies these ──
  if (isIconAsset(asset)) {
    log('icon — excluded, frontend-builder supplies this (Lucide)');
    return { finalMode: 'excluded', attempts: [], totalCost: 0, isHumanAsset: false };
  }

  const humanAsset = isHumanAsset(asset);
  log(`classified as ${humanAsset ? 'HUMAN' : 'non-human'} (type: ${asset.type})`);

  // ── Human branch — reconstruct from a real photo if available, otherwise generate from description ──
  if (humanAsset) {
    if (!openaiApiKey) {
      return { finalMode: 'human_review', attempts: [{ rung: 'gpt-human-generate', model: 'gpt-image-1', cost: 0, pass: false, reasoning: 'No OPENAI_API_KEY configured' }], totalCost: 0, isHumanAsset: true };
    }

    const realPhotoPath = resolveRealPhoto(asset.id, opts.realPhotosDir, opts.realPhotosMap);
    const ext = `.${format}`;

    // Reference priority: real client photo > nothing (generate from description)
    if (realPhotoPath) {
      log(`real photo found: ${realPhotoPath} — reconstructing from it`);
      const outPath = path.join(assetDir, `edited-real-photo${ext}`);
      const cost = estimateEditCost(asset.aspect_ratio);
      try {
        await reconstructFromReference({
          referenceImagePath: realPhotoPath,
          description: asset.description,
          assetType: asset.type,
          aspectRatio: asset.aspect_ratio,
          outputPath: outPath,
          format,
          quality: 'high',
          apiKey: openaiApiKey,
        });
        const attempt: LadderAttempt = {
          rung: 'gpt-human-edit',
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
          realPhotoUsed: realPhotoPath,
          aiPlaceholderHuman: false,
        };
      } catch (err) {
        attempts.push({ rung: 'gpt-human-edit', model: 'gpt-image-1-edit', cost: 0, pass: false, reasoning: `Reconstruction failed: ${(err as Error).message}` });
        // fall through to blind generate rather than hard-failing the asset
      }
    } else {
      log('no real photo on file — generating from description (flagged for replacement)');
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

  // ── Non-human branch — generate via Gemini → Flux ladder ──────
  // No mockup extraction. All assets are generated fresh from the manifest
  // description. Judged by vision similarity.

  log(`text-only generation from manifest description`);

  const threshold = opts.similarityThreshold;
  const geminiApiKey = process.env.GEMINI_API_KEY ?? '';
  let totalCost = attempts.reduce((s, a) => s + a.cost, 0);

  // Rung 2: Gemini 2.5 Flash Image (cheapest paid rung)
  if (geminiApiKey) {
    const ext = `.${format}`;
    const outPath = path.join(assetDir, `generated-gemini${ext}`);
    const genCost = 0.039; // Gemini 2.5 Flash Image approximate cost per image
    log(`trying gemini-2.5-flash-image (~$${genCost.toFixed(3)})...`);
    try {
      await generateAsset({
        assetId: asset.id,
        description: asset.description,
        assetType: asset.type,
        aspectRatio: asset.aspect_ratio,
        style: styleHint || undefined,
        outputPath: outPath,
        format,
        model: 'gemini-2.5-flash-image',
        apiKey: geminiApiKey,
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
        rung: 'gemini-image',
        model: 'gemini-2.5-flash-image',
        cost,
        pass: judgment.pass,
        score: judgment.score,
        reasoning: judgment.reasoning,
        outputPath: outPath,
      };
      attempts.push(attempt);
      log(`gemini-2.5-flash-image -> score ${judgment.score}/100, ${judgment.pass ? 'PASS' : 'FAIL'} — ${judgment.reasoning}`);

      if (judgment.pass) {
        return { finalMode: 'recreate', attempts, totalCost, chosen: attempt, isHumanAsset: false };
      }
    } catch (err) {
      attempts.push({ rung: 'gemini-image', model: 'gemini-2.5-flash-image', cost: 0, pass: false, reasoning: `Generation failed: ${(err as Error).message}` });
    }
  } else {
    log('skipping gemini-2.5-flash-image — no GEMINI_API_KEY configured');
    attempts.push({ rung: 'gemini-image', model: 'gemini-2.5-flash-image', cost: 0, pass: false, reasoning: 'No GEMINI_API_KEY configured' });
  }

  // Rungs 3-4: flux-2-flex -> flux-2-max
  const rungs: Array<{ rung: LadderAttempt['rung']; model: 'flux-2-flex' | 'flux-2-max' }> = [
    { rung: 'flux-flex', model: 'flux-2-flex' },
    { rung: 'flux-max', model: 'flux-2-max' },
  ];

  for (const { rung, model } of rungs) {
    if (!fluxApiKey) {
      log(`skipping ${model} — no FLUX_API_KEY configured`);
      attempts.push({ rung, model, cost: 0, pass: false, reasoning: 'No FLUX_API_KEY configured' });
      continue;
    }

    const ext = `.${format}`;
    const outPath = path.join(assetDir, `generated-${rung}${ext}`);
    const genCost = estimateAssetCost(model, undefined, asset.aspect_ratio);

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
