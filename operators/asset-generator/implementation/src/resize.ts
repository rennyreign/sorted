// ─────────────────────────────────────────────────────────────
// Asset Generator — Image Resizing Module
// Takes the original (extracted or generated) asset and produces
// xs / sm / md / lg variants in the target output format.
// ─────────────────────────────────────────────────────────────

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import type { SizeVariant, OutputFormat, AssetFiles } from './types.js';
import { SIZE_VARIANTS } from './types.js';

export interface ResizeResult {
  files: Partial<AssetFiles>;
  originalWidth: number;
  originalHeight: number;
}

// ── Produce all size variants for an asset ────────────────────

export async function produceVariants(
  originalPath: string,
  assetDir: string,
  format: OutputFormat,
  skipVariantsBelowWidth?: number,
): Promise<ResizeResult> {
  const meta = await sharp(originalPath).metadata();
  const origW = meta.width ?? 0;
  const origH = meta.height ?? 0;

  const ext = `.${format}`;
  const files: Partial<AssetFiles> = {
    original: path.join(assetDir, `original${ext}`),
  };

  // Copy original into the asset directory with correct extension
  await convertAndSave(sharp, originalPath, files.original!, format);

  // Produce size variants — skip any that would upscale the image
  for (const spec of SIZE_VARIANTS) {
    const minWidth = skipVariantsBelowWidth ?? 0;
    if (spec.width > origW || spec.width < minWidth) continue;

    const outPath = path.join(assetDir, `${spec.name}${ext}`);
    await resizeTo(sharp, originalPath, outPath, spec.width, format);
    files[spec.name as SizeVariant] = outPath;
  }

  return { files, originalWidth: origW, originalHeight: origH };
}

// ── Resize to target width, maintain aspect ───────────────────

async function resizeTo(
  sharpFn: typeof sharp,
  srcPath: string,
  destPath: string,
  targetWidth: number,
  format: OutputFormat,
): Promise<void> {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let pipeline = sharpFn(srcPath).resize({ width: targetWidth, withoutEnlargement: true });

  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality: 85, effort: 4 });
      break;
    case 'jpg':
      pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
      break;
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 8 });
      break;
  }

  await pipeline.toFile(destPath);
}

// ── Copy + convert format without resizing ────────────────────

async function convertAndSave(
  sharpFn: typeof sharp,
  srcPath: string,
  destPath: string,
  format: OutputFormat,
): Promise<void> {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // If src and dest are the same file (already correct format), skip
  if (path.resolve(srcPath) === path.resolve(destPath)) return;

  let pipeline = sharpFn(srcPath);

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

  await pipeline.toFile(destPath);
}

// ── Relative path helper ──────────────────────────────────────

export function toRelativePaths(
  files: Partial<AssetFiles>,
  baseDir: string,
): Partial<AssetFiles> {
  const rel: Partial<AssetFiles> = {};
  for (const [key, filePath] of Object.entries(files)) {
    if (filePath) {
      rel[key as keyof AssetFiles] = path.relative(baseDir, filePath);
    }
  }
  return rel;
}
