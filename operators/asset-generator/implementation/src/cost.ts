// ─────────────────────────────────────────────────────────────
// Asset Generator — Cost Estimator
// Static per-image pricing table for each recreate-mode provider.
// Used for dry-run estimates and manifest cost reporting.
// Prices as of 2026-08 — verify against provider pricing pages
// before relying on this for budget-critical decisions.
// ─────────────────────────────────────────────────────────────

import type { GenerationModel, GenerationQuality } from './types.js';

type ShapeBucket = 'square' | 'wide'; // 'wide' covers both portrait and landscape non-square sizes

function bucketFor(aspectRatio: string | undefined): ShapeBucket {
  const ratio = aspectRatio ?? '1:1';
  const [wStr, hStr] = ratio.split(':');
  const w = parseFloat(wStr ?? '1');
  const h = parseFloat(hStr ?? '1');
  const r = w / h;
  return r > 1.2 || r < 0.8 ? 'wide' : 'square';
}

// gpt-image-1 — per-image pricing by quality tier + shape (OpenAI, Apr 2025 rate card)
const GPT_IMAGE_1: Record<GenerationQuality, Record<ShapeBucket, number>> = {
  low: { square: 0.011, wide: 0.016 },
  medium: { square: 0.042, wide: 0.063 },
  high: { square: 0.167, wide: 0.25 },
};

// dall-e-3 — hardcoded to 'hd' quality in generate.ts
const DALL_E_3: Record<ShapeBucket, number> = {
  square: 0.08,
  wide: 0.12,
};

// FLUX1.1 — flat per-image pricing regardless of aspect (Black Forest Labs)
const FLUX_FLAT: Record<string, number> = {
  'flux-pro-1.1': 0.04,
  'flux-pro-1.1-ultra': 0.06,
};

// FLUX.2 — megapixel-based pricing (Black Forest Labs, Aug 2026 rate card)
// klein tiers: flat base for the first MP, then a small per-additional-MP rate
const FLUX_2_KLEIN: Record<string, { base: number; perExtraMp: number }> = {
  'flux-2-klein-4b': { base: 0.014, perExtraMp: 0.001 },
  'flux-2-klein-9b': { base: 0.015, perExtraMp: 0.002 },
};
// pro/flex/max: pure per-MP rate (text-to-image)
const FLUX_2_PER_MP: Record<string, number> = {
  'flux-2-pro': 0.03,
  'flux-2-flex': 0.05,
  'flux-2-max': 0.07,
};

// pro/flex/max image-editing rate (input_image supplied) — slightly higher than T2I
const FLUX_2_EDIT_PER_MP: Record<string, number> = {
  'flux-2-pro': 0.045,
  'flux-2-flex': 0.10,
  'flux-2-max': 0.07,
};

export function estimateFluxEditCost(model: string, width: number, height: number): number {
  const rate = FLUX_2_EDIT_PER_MP[model];
  if (rate === undefined) return 0;
  return megapixels(width, height) * rate;
}

// Approximate pixel dimensions we generate at, per shape bucket (mirrors generate.ts aspectToSize)
const APPROX_PIXELS: Record<ShapeBucket, { width: number; height: number }> = {
  square: { width: 1024, height: 1024 },
  wide: { width: 1440, height: 1024 },
};

function megapixels(width: number, height: number): number {
  return (width * height) / 1_000_000;
}

export function estimateAssetCost(
  model: GenerationModel,
  quality: GenerationQuality | undefined,
  aspectRatio: string | undefined,
): number {
  const shape = bucketFor(aspectRatio);

  if (model === 'gpt-image-1') {
    return GPT_IMAGE_1[quality ?? 'high'][shape];
  }
  if (model === 'dall-e-3') {
    return DALL_E_3[shape];
  }
  if (model in FLUX_FLAT) {
    return FLUX_FLAT[model]!;
  }
  if (model in FLUX_2_KLEIN) {
    const { width, height } = APPROX_PIXELS[shape];
    const mp = megapixels(width, height);
    const { base, perExtraMp } = FLUX_2_KLEIN[model]!;
    return base + Math.max(0, mp - 1) * perExtraMp;
  }
  if (model in FLUX_2_PER_MP) {
    const { width, height } = APPROX_PIXELS[shape];
    return megapixels(width, height) * FLUX_2_PER_MP[model]!;
  }
  return 0;
}

// gpt-image-1 edit endpoint — same token-based pricing scheme as generate;
// approximated here with the 'high' quality generate rate.
export function estimateEditCost(aspectRatio: string | undefined): number {
  return GPT_IMAGE_1.high[bucketFor(aspectRatio)];
}

// ── Free rung: sharp-based crop + upscale ──────────────────────

export const UPSCALE_COST = 0;

// gpt-4.1-mini vision judge call — flat estimate, negligible vs. generation cost
export const SIMILARITY_JUDGE_COST = 0.002;

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(3)}`;
}
