// ─────────────────────────────────────────────────────────────
// Asset Generator — Image Generation Module
// Calls OpenAI image generation (gpt-image-1 / dall-e-3) to
// recreate assets that can't be cleanly extracted from the mockup.
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import https from 'https';
import type { GenerationModel, GenerationQuality, OutputFormat } from './types.js';
import { buildReconstructionPrompt } from './prompts.js';

export interface GenerateOptions {
  assetId: string;
  description: string;
  assetType: string;
  aspectRatio?: string;
  style?: string;           // e.g. "premium fitness, dark, editorial"
  outputPath: string;
  format: OutputFormat;
  model: GenerationModel;
  quality?: GenerationQuality;  // gpt-image-1 only; ignored by other providers
  apiKey: string;
  /** Flux only — when set, uses image-to-image editing (input_image) with `prompt` as the
   * edit instruction instead of blind text-to-image generation. */
  referenceImagePath?: string;
}

export interface GenerateResult {
  outputPath: string;
  width: number;
  height: number;
  model: string;
  promptUsed: string;
  revisedPrompt?: string;
}

// ── Aspect ratio → OpenAI size mapping ───────────────────────

type DallE3Size = '1024x1024' | '1792x1024' | '1024x1792';
type GptImageSize = '1024x1024' | '1536x1024' | '1024x1536' | 'auto';

function aspectToSize(aspectRatio: string | undefined, model: GenerationModel): string {
  const ratio = aspectRatio ?? '1:1';

  const [wStr, hStr] = ratio.split(':');
  const w = parseFloat(wStr ?? '1');
  const h = parseFloat(hStr ?? '1');
  const r = w / h;

  if (model === 'dall-e-3') {
    if (r > 1.2) return '1792x1024';       // landscape
    if (r < 0.8) return '1024x1792';       // portrait
    return '1024x1024';                     // square
  }

  if (isFluxModel(model)) {
    // Flux requires width/height in multiples of 32
    if (r > 1.2) return '1440x1024';       // landscape
    if (r < 0.8) return '1024x1440';       // portrait
    return '1024x1024';                     // square
  }

  // gpt-image-1
  if (r > 1.2) return '1536x1024';
  if (r < 0.8) return '1024x1536';
  return '1024x1024';
}

// ── Size string → pixel dimensions ───────────────────────────

function sizeToPixels(size: string): { width: number; height: number } {
  const parts = size.split('x');
  return {
    width: parseInt(parts[0] ?? '1024', 10),
    height: parseInt(parts[1] ?? '1024', 10),
  };
}

// ── Build a production-grade prompt ──────────────────────────

function buildPrompt(
  description: string,
  assetType: string,
  style?: string,
): string {
  const styleClause = style ? ` Visual style: ${style}.` : '';

  // Persona / people assets: enforce no text overlays, clean background
  const typeGuide: Record<string, string> = {
    person:
      'Photorealistic. No text overlays. No watermarks. Clean professional composition. Suitable for direct use in a website hero section.',
    avatar:
      'Photorealistic headshot. Neutral or softly blurred background. Square crop. No text. Professional feel.',
    logo:
      'Clean vector-style graphic on transparent background. Flat design. No photography.',
    hero_image:
      'Photorealistic. Wide aspect. No text overlays. Premium quality. Website hero section ready.',
    background:
      'Abstract or environmental. No subjects. Suitable as full-bleed section background. No text.',
    product:
      'Clean product shot. White or neutral background. Studio lighting. No text.',
    icon:
      'Simple flat icon. Single colour or minimal palette. Transparent background. No text.',
    illustration:
      'Digital illustration. Clean linework. No text overlays.',
    gallery_image:
      'Photorealistic. Suitable for gallery grid. No text.',
    generic:
      'Photorealistic. Professional quality. Suitable for website use. No text overlays.',
  };

  const guide = typeGuide[assetType] ?? typeGuide.generic;

  return `${description}. ${guide}${styleClause}`;
}

// ── Download image from URL ───────────────────────────────────

function downloadImage(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const location = response.headers.location;
        if (!location) return reject(new Error('Redirect with no location header'));
        return downloadImage(location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download image: HTTP ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
      file.on('error', reject);
    }).on('error', reject);
  });
}

// ── Save base64 image data ────────────────────────────────────

function saveBase64Image(b64: string, destPath: string): void {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(destPath, Buffer.from(b64, 'base64'));
}

// ── Flux (Black Forest Labs) — async submit + poll ────────────
// BFL's API returns a polling_url immediately; the image itself
// isn't ready until status === 'Ready'. Result URLs expire after
// ~10 minutes, so we download immediately once ready.

const BFL_BASE_URL = 'https://api.bfl.ai/v1';
const BFL_POLL_INTERVAL_MS = 750;
const BFL_POLL_TIMEOUT_MS = 60_000;

const BFL_ENDPOINTS: Record<string, string> = {
  'flux-pro-1.1': '/flux-pro-1.1',
  'flux-pro-1.1-ultra': '/flux-pro-1.1-ultra',
  'flux-2-klein-4b': '/flux-2-klein-4b',
  'flux-2-klein-9b': '/flux-2-klein-9b',
  'flux-2-pro': '/flux-2-pro',
  'flux-2-flex': '/flux-2-flex',
  'flux-2-max': '/flux-2-max',
};

export function isFluxModel(model: string): boolean {
  return model in BFL_ENDPOINTS;
}

async function bflRequest(endpoint: string, apiKey: string, body: unknown): Promise<any> {
  const res = await fetch(`${BFL_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'x-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Flux request failed: HTTP ${res.status} — ${await res.text()}`);
  }
  return res.json();
}

async function bflPoll(pollingUrl: string, apiKey: string): Promise<string> {
  const deadline = Date.now() + BFL_POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, BFL_POLL_INTERVAL_MS));
    const res = await fetch(pollingUrl, { headers: { accept: 'application/json', 'x-key': apiKey } });
    const result = (await res.json()) as any;
    if (result.status === 'Ready') {
      const sample = result.result?.sample;
      if (!sample) throw new Error('Flux returned Ready with no result.sample URL');
      return sample as string;
    }
    if (['Error', 'Failed', 'Request Moderated', 'Content Moderated'].includes(result.status)) {
      throw new Error(`Flux generation failed: ${result.status}`);
    }
  }
  throw new Error(`Flux generation timed out after ${BFL_POLL_TIMEOUT_MS}ms`);
}

// Flux requires explicit width/height in multiples of 32. For reference-edit calls we
// derive them from the actual crop (scaled up, capped) rather than a generic bucket size,
// so the edited output keeps the crop's real aspect ratio instead of being reframed.
async function referenceDimensions(referenceImagePath: string): Promise<{ width: number; height: number }> {
  const { default: sharpDefault } = await import('sharp');
  const meta = await sharpDefault(referenceImagePath).metadata();
  const origW = meta.width ?? 1024;
  const origH = meta.height ?? 1024;

  const MAX_MP = 1.5; // keep editing cost/latency reasonable
  const roundTo32 = (n: number) => Math.max(32, Math.round(n / 32) * 32);

  let scale = Math.max(1, Math.sqrt((MAX_MP * 1_000_000) / (origW * origH)));
  let width = roundTo32(origW * scale);
  let height = roundTo32(origH * scale);

  // If still over budget after rounding, scale back down slightly
  while (width * height > MAX_MP * 1_000_000 * 1.1 && scale > 1) {
    scale -= 0.1;
    width = roundTo32(origW * scale);
    height = roundTo32(origH * scale);
  }

  return { width, height };
}

async function generateFluxAsset(opts: GenerateOptions, prompt: string, size: string, tmpPath: string): Promise<GenerateResult> {
  const endpoint = BFL_ENDPOINTS[opts.model];
  if (!endpoint) throw new Error(`Unknown Flux model: ${opts.model}`);

  const pixels = opts.referenceImagePath ? await referenceDimensions(opts.referenceImagePath) : sizeToPixels(size);

  const body: Record<string, unknown> = {
    prompt,
    width: pixels.width,
    height: pixels.height,
  };

  // FLUX.2 (pro/flex/max) supports image-to-image editing via input_image —
  // used for non-human reconstruction from an actual mockup crop.
  if (opts.referenceImagePath) {
    body.input_image = fs.readFileSync(opts.referenceImagePath).toString('base64');
  }

  const submitted = await bflRequest(endpoint, opts.apiKey, body);
  const pollingUrl = submitted.polling_url;
  if (!pollingUrl) throw new Error('Flux request returned no polling_url');

  const imageUrl = await bflPoll(pollingUrl, opts.apiKey);
  await downloadImage(imageUrl, tmpPath);

  const { default: sharpDefault } = await import('sharp');
  await convertFormat(sharpDefault, tmpPath, opts.outputPath, opts.format);
  fs.unlinkSync(tmpPath);

  return {
    outputPath: opts.outputPath,
    width: pixels.width,
    height: pixels.height,
    model: opts.model,
    promptUsed: prompt,
  };
}

// ── Main generation call ──────────────────────────────────────

export async function generateAsset(opts: GenerateOptions): Promise<GenerateResult> {
  const prompt = opts.referenceImagePath
    ? buildReconstructionPrompt({ assetType: opts.assetType, description: opts.description })
    : buildPrompt(opts.description, opts.assetType, opts.style);
  const size = aspectToSize(opts.aspectRatio, opts.model);
  const pixels = sizeToPixels(size);

  // Temp path for the raw generated image (PNG from API)
  const tmpPath = opts.outputPath.replace(/\.[^.]+$/, '.tmp.png');

  if (isFluxModel(opts.model)) {
    return generateFluxAsset(opts, prompt, size, tmpPath);
  }

  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: opts.apiKey });

  if (opts.model === 'dall-e-3') {
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: size as DallE3Size,
      quality: 'hd',
      response_format: 'url',
    });

    const imageUrl = response.data?.[0]?.url;
    const revisedPrompt = response.data?.[0]?.revised_prompt;

    if (!imageUrl) throw new Error('dall-e-3 returned no image URL');

    await downloadImage(imageUrl, tmpPath);

    // Convert to target format via sharp
    const { default: sharpDefault } = await import('sharp');
    await convertFormat(sharpDefault, tmpPath, opts.outputPath, opts.format);
    fs.unlinkSync(tmpPath);

    return {
      outputPath: opts.outputPath,
      width: pixels.width,
      height: pixels.height,
      model: 'dall-e-3',
      promptUsed: prompt,
      revisedPrompt,
    };
  }

  // gpt-image-1 — returns base64
  const response = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    n: 1,
    size: size as GptImageSize,
    quality: opts.quality ?? 'high',
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error('gpt-image-1 returned no image data');

  saveBase64Image(b64, tmpPath);

  const { default: sharpDefault } = await import('sharp');
  await convertFormat(sharpDefault, tmpPath, opts.outputPath, opts.format);
  fs.unlinkSync(tmpPath);

  return {
    outputPath: opts.outputPath,
    width: pixels.width,
    height: pixels.height,
    model: 'gpt-image-1',
    promptUsed: prompt,
  };
}

// ── GPT reconstruction — recover a reference image at higher res ──
// Used for human assets: either a real client-supplied photo, or
// (when no real photo exists) the actual mockup crop itself, fed
// through the shared RECONSTRUCTION_PROMPT so the model recovers
// resolution/removes UI overlays without reinterpreting the photo.
// gpt-image-1's edit endpoint always returns base64.

export interface ReconstructOptions {
  referenceImagePath: string;
  description: string;
  assetType: string;
  aspectRatio?: string;
  outputPath: string;
  format: OutputFormat;
  quality?: GenerationQuality;
  apiKey: string;
}

export async function reconstructFromReference(opts: ReconstructOptions): Promise<GenerateResult> {
  const { default: OpenAI } = await import('openai');
  const { toFile } = await import('openai/uploads');
  const client = new OpenAI({ apiKey: opts.apiKey });

  const prompt = buildReconstructionPrompt({ assetType: opts.assetType, description: opts.description });

  const tmpPath = opts.outputPath.replace(/\.[^.]+$/, '.tmp.png');

  // Trim uniform-colour borders (e.g. letterbox bars from a video screenshot)
  // before handing the photo to GPT — otherwise they get baked into the reconstruction.
  const trimmedPath = opts.outputPath.replace(/\.[^.]+$/, '.trimmed.png');
  const { default: sharpDefault } = await import('sharp');
  await sharpDefault(opts.referenceImagePath).trim({ threshold: 15 }).png().toFile(trimmedPath);

  // fs.createReadStream doesn't reliably set a MIME type the API will accept —
  // wrap it with toFile() so the upload is explicitly tagged image/png.
  const uploadFile = await toFile(fs.createReadStream(trimmedPath), 'reference.png', { type: 'image/png' });

  // 'auto' lets gpt-image-1 preserve the reference's own aspect ratio rather than
  // forcing it into one of the three fixed buckets — required by the "do not
  // reframe/reposition" constraint in the reconstruction prompt.
  const response = await client.images.edit({
    model: 'gpt-image-1',
    image: uploadFile,
    prompt,
    size: 'auto',
    quality: opts.quality ?? 'high',
  });
  fs.unlinkSync(trimmedPath);

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error('gpt-image-1 edit returned no image data');

  saveBase64Image(b64, tmpPath);

  await convertFormat(sharpDefault, tmpPath, opts.outputPath, opts.format);
  fs.unlinkSync(tmpPath);

  const outMeta = await sharpDefault(opts.outputPath).metadata();

  return {
    outputPath: opts.outputPath,
    width: outMeta.width ?? 0,
    height: outMeta.height ?? 0,
    model: 'gpt-image-1-edit',
    promptUsed: prompt,
  };
}

// ── Format conversion helper ──────────────────────────────────

async function convertFormat(
  sharpFn: (input: string) => import('sharp').Sharp,
  srcPath: string,
  destPath: string,
  format: OutputFormat,
): Promise<void> {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

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
