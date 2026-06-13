// ─────────────────────────────────────────────────────────────
// Asset Generator — Image Generation Module
// Calls OpenAI image generation (gpt-image-1 / dall-e-3) to
// recreate assets that can't be cleanly extracted from the mockup.
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import https from 'https';
import type { GenerationModel, OutputFormat } from './types.js';

export interface GenerateOptions {
  assetId: string;
  description: string;
  assetType: string;
  aspectRatio?: string;
  style?: string;           // e.g. "premium fitness, dark, editorial"
  outputPath: string;
  format: OutputFormat;
  model: GenerationModel;
  apiKey: string;
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

// ── Main generation call ──────────────────────────────────────

export async function generateAsset(opts: GenerateOptions): Promise<GenerateResult> {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: opts.apiKey });

  const prompt = buildPrompt(opts.description, opts.assetType, opts.style);
  const size = aspectToSize(opts.aspectRatio, opts.model);
  const pixels = sizeToPixels(size);

  // Temp path for the raw generated image (PNG from API)
  const tmpPath = opts.outputPath.replace(/\.[^.]+$/, '.tmp.png');

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
    quality: 'high',
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
