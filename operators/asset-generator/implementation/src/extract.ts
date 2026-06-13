// ─────────────────────────────────────────────────────────────
// Asset Generator — Image Extraction Module
// Crops assets directly from the mockup using bbox coordinates.
// Uses sharp for pixel-precise, lossless-first extraction.
// ─────────────────────────────────────────────────────────────

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import type { BoundingBox, OutputFormat } from './types.js';

export interface ExtractResult {
  outputPath: string;
  width: number;
  height: number;
}

export interface QualityCheckResult {
  pass: boolean;
  width: number;
  height: number;
  reason?: string;
}

// ── Minimum dimensions per use type ──────────────────────────

const MIN_DIMENSIONS: Record<string, { w: number; h: number }> = {
  person:        { w: 400, h: 400 },
  avatar:        { w: 100, h: 100 },
  logo:          { w: 200, h: 80  },
  hero_image:    { w: 800, h: 400 },
  background:    { w: 1200, h: 600 },
  product:       { w: 400, h: 400 },
  icon:          { w: 48,  h: 48  },
  illustration:  { w: 400, h: 300 },
  screenshot:    { w: 600, h: 400 },
  gallery_image: { w: 400, h: 300 },
  generic:       { w: 200, h: 200 },
};

// ── Quality gate — check extracted crop is usable ─────────────

export async function checkExtractionQuality(
  mockupPath: string,
  bbox: BoundingBox,
  assetType: string,
): Promise<QualityCheckResult> {
  const meta = await sharp(mockupPath).metadata();
  const imgW = meta.width ?? 0;
  const imgH = meta.height ?? 0;

  // Clamp bbox to image bounds
  const x = Math.max(0, Math.round(bbox.x));
  const y = Math.max(0, Math.round(bbox.y));
  const w = Math.min(Math.round(bbox.w), imgW - x);
  const h = Math.min(Math.round(bbox.h), imgH - y);

  if (w <= 0 || h <= 0) {
    return { pass: false, width: 0, height: 0, reason: 'Bounding box is outside image bounds' };
  }

  const mins = MIN_DIMENSIONS[assetType] ?? MIN_DIMENSIONS.generic;

  if (w < mins.w || h < mins.h) {
    return {
      pass: false,
      width: w,
      height: h,
      reason: `Crop ${w}×${h}px is below minimum ${mins.w}×${mins.h}px for type "${assetType}"`,
    };
  }

  return { pass: true, width: w, height: h };
}

// ── Extract crop from mockup ───────────────────────────────────

export async function extractFromMockup(
  mockupPath: string,
  bbox: BoundingBox,
  outputPath: string,
  format: OutputFormat,
): Promise<ExtractResult> {
  const meta = await sharp(mockupPath).metadata();
  const imgW = meta.width ?? 0;
  const imgH = meta.height ?? 0;

  // Clamp to image bounds
  const x = Math.max(0, Math.round(bbox.x));
  const y = Math.max(0, Math.round(bbox.y));
  const w = Math.min(Math.round(bbox.w), imgW - x);
  const h = Math.min(Math.round(bbox.h), imgH - y);

  if (w <= 0 || h <= 0) {
    throw new Error(`Invalid bounding box after clamping: x=${x} y=${y} w=${w} h=${h}`);
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let pipeline = sharp(mockupPath).extract({ left: x, top: y, width: w, height: h });

  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality: 90, effort: 4 });
      break;
    case 'jpg':
      pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
      break;
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 8 });
      break;
  }

  await pipeline.toFile(outputPath);

  return { outputPath, width: w, height: h };
}

// ── Get mockup dimensions ─────────────────────────────────────

export async function getMockupDimensions(
  mockupPath: string,
): Promise<{ width: number; height: number }> {
  const meta = await sharp(mockupPath).metadata();
  return { width: meta.width ?? 0, height: meta.height ?? 0 };
}
