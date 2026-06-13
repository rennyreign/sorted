// ─────────────────────────────────────────────────────────────
// Mockup Deconstructor — Core Orchestrator
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import type { DeconstructConfig, MockupDeconstruction } from './types.js';
import { validateDeconstruction, safeValidateDeconstruction } from './schema.js';
import { callVisionModel, extractJSON, DEFAULT_MODELS } from './vision.js';

const OPERATOR_VERSION = '0.1.0';

// ── Main entry ────────────────────────────────────────────────

export async function deconstruct(config: DeconstructConfig): Promise<MockupDeconstruction> {
  const { provider, model, imagePath, verbose = false } = config;

  // ── 1. Validate image file ─────────────────────────────────
  const resolvedImage = path.resolve(imagePath);
  if (!fs.existsSync(resolvedImage)) {
    throw new Error(`Image not found: ${resolvedImage}`);
  }

  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(resolvedImage).toLowerCase();
  if (!allowedExts.includes(ext)) {
    throw new Error(`Unsupported image format: ${ext}. Allowed: ${allowedExts.join(', ')}`);
  }

  const stats = fs.statSync(resolvedImage);
  const sizeMb = stats.size / (1024 * 1024);
  if (sizeMb > 20) {
    throw new Error(`Image too large: ${sizeMb.toFixed(1)}MB. Maximum is 20MB.`);
  }

  if (verbose) {
    console.log(`\nMockup Deconstructor v${OPERATOR_VERSION}`);
    console.log('─'.repeat(40));
    console.log(`  Image    : ${path.basename(resolvedImage)} (${sizeMb.toFixed(2)}MB)`);
  }

  // ── 2. Call vision model ───────────────────────────────────
  const resolvedModel = model || DEFAULT_MODELS[provider];

  const { raw } = await callVisionModel(provider, resolvedModel, resolvedImage, verbose);

  if (verbose) {
    console.log('  Response : received, extracting JSON...');
  }

  // ── 3. Extract and parse JSON ──────────────────────────────
  let parsed: unknown;
  try {
    parsed = extractJSON(raw);
  } catch (e) {
    if (verbose) {
      console.error('\nRaw model response:');
      console.error(raw);
    }
    throw new Error(`JSON extraction failed: ${(e as Error).message}`);
  }

  // ── 4. Inject meta if missing ──────────────────────────────
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    obj.meta = {
      generated_at: new Date().toISOString(),
      source_image: path.basename(resolvedImage),
      model_used: `${provider}/${resolvedModel}`,
      operator_version: OPERATOR_VERSION,
      ...(obj.meta && typeof obj.meta === 'object' ? obj.meta : {}),
    };
  }

  // ── 5. Validate against schema ─────────────────────────────
  const result = safeValidateDeconstruction(parsed);

  if (!result.success) {
    if (verbose) {
      console.warn('\nValidation issues:');
      result.error.issues.forEach((issue) => {
        console.warn(`  ${issue.path.join('.')} — ${issue.message}`);
      });
      console.warn('\nAttempting to return partial result...');
    }
    // Return the parsed data even if validation fails — downstream can handle gaps
    // but throw if it's fundamentally broken
    if (!parsed || typeof parsed !== 'object' || !('sections' in (parsed as object))) {
      throw new Error(`Schema validation failed and output is unusable: ${result.error.message}`);
    }
    return parsed as MockupDeconstruction;
  }

  if (verbose) {
    const d = result.data;
    console.log('  Validated: OK');
    console.log(`  Sections : ${d.sections.length}`);
    console.log(`  Assets   : ${d.assets.length}`);
    console.log(`  Copy     : ${d.copy.length} blocks`);
    console.log(`  Components: ${d.components.length}`);
  }

  return result.data as MockupDeconstruction;
}

// ── Output writer ─────────────────────────────────────────────

export async function writeOutput(
  result: MockupDeconstruction,
  outputPath: string,
  verbose: boolean = false,
): Promise<string> {
  const resolvedOut = path.resolve(outputPath);
  const dir = path.dirname(resolvedOut);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const json = JSON.stringify(result, null, 2);
  fs.writeFileSync(resolvedOut, json, 'utf-8');

  if (verbose) {
    console.log(`\nOutput written: ${resolvedOut}`);
  }

  return resolvedOut;
}

// ── Derive default output path ────────────────────────────────

export function deriveOutputPath(imagePath: string): string {
  const baseName = path.basename(imagePath, path.extname(imagePath));
  return path.join('output', `${baseName}.json`);
}
