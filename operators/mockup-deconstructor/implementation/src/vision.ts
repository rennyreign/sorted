// ─────────────────────────────────────────────────────────────
// Mockup Deconstructor — Vision Model Client
// Supports: OpenAI GPT-4.1 / GPT-4o, Anthropic Claude, Google Gemini
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import type { ModelProvider } from './types.js';
import { SYSTEM_PROMPT, USER_PROMPT } from './prompt.js';

// ── Model defaults per provider ───────────────────────────────

export const DEFAULT_MODELS: Record<ModelProvider, string> = {
  openai: 'gpt-4.1',
  anthropic: 'claude-opus-4-5',
  gemini: 'gemini-2.5-flash',
};

// ── Image loading ─────────────────────────────────────────────

function loadImageAsBase64(imagePath: string): { base64: string; mimeType: string } {
  const resolved = path.resolve(imagePath);
  const buffer = fs.readFileSync(resolved);
  const ext = path.extname(imagePath).toLowerCase().replace('.', '');

  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  };

  const mimeType = mimeMap[ext] ?? 'image/jpeg';
  return { base64: buffer.toString('base64'), mimeType };
}

// ── OpenAI Vision ─────────────────────────────────────────────

async function callOpenAI(imagePath: string, model: string, apiKey: string): Promise<string> {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey });

  const { base64, mimeType } = loadImageAsBase64(imagePath);
  const imageUrl = `data:${mimeType};base64,${base64}`;

  const response = await client.chat.completions.create({
    model,
    max_tokens: 8192,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
          { type: 'text', text: USER_PROMPT },
        ],
      },
    ],
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty response');
  return content;
}

// ── Anthropic Claude Vision ───────────────────────────────────

async function callAnthropic(imagePath: string, model: string, apiKey: string): Promise<string> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey });

  const { base64, mimeType } = loadImageAsBase64(imagePath);

  const validMediaTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
  type ValidMediaType = (typeof validMediaTypes)[number];

  if (!validMediaTypes.includes(mimeType as ValidMediaType)) {
    throw new Error(`Unsupported image type for Anthropic: ${mimeType}`);
  }

  const response = await client.messages.create({
    model,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as ValidMediaType,
              data: base64,
            },
          },
          { type: 'text', text: USER_PROMPT },
        ],
      },
    ],
  });

  const block = response.content[0];
  if (!block || block.type !== 'text') throw new Error('Anthropic returned no text block');
  return block.text;
}

// ── Google Gemini Vision ──────────────────────────────────────

async function callGemini(imagePath: string, model: string, apiKey: string): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const client = new GoogleGenerativeAI(apiKey);
  const genModel = client.getGenerativeModel({ model });

  const { base64, mimeType } = loadImageAsBase64(imagePath);

  const result = await genModel.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: base64, mimeType } },
          { text: `${SYSTEM_PROMPT}\n\n${USER_PROMPT}` },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.1,
    },
  });

  const text = result.response.text();
  if (!text) throw new Error('Gemini returned empty response');
  return text;
}

// ── Dispatcher ────────────────────────────────────────────────

export interface VisionCallResult {
  raw: string;
  provider: ModelProvider;
  model: string;
}

export async function callVisionModel(
  provider: ModelProvider,
  model: string,
  imagePath: string,
  verbose: boolean = false,
): Promise<VisionCallResult> {
  const resolvedModel = model || DEFAULT_MODELS[provider];

  const apiKeyMap: Record<ModelProvider, string> = {
    openai: process.env.OPENAI_API_KEY ?? '',
    anthropic: process.env.ANTHROPIC_API_KEY ?? '',
    gemini: process.env.GEMINI_API_KEY ?? '',
  };

  const apiKey = apiKeyMap[provider];
  if (!apiKey) {
    throw new Error(
      `No API key found for provider "${provider}". Set ${provider.toUpperCase()}_API_KEY in your environment.`,
    );
  }

  if (verbose) {
    console.log(`  Provider : ${provider}`);
    console.log(`  Model    : ${resolvedModel}`);
    console.log(`  Image    : ${imagePath}`);
    console.log('  Calling vision model...');
  }

  let raw: string;

  switch (provider) {
    case 'openai':
      raw = await callOpenAI(imagePath, resolvedModel, apiKey);
      break;
    case 'anthropic':
      raw = await callAnthropic(imagePath, resolvedModel, apiKey);
      break;
    case 'gemini':
      raw = await callGemini(imagePath, resolvedModel, apiKey);
      break;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }

  return { raw, provider, model: resolvedModel };
}

// ── JSON extraction ───────────────────────────────────────────

export function extractJSON(raw: string): unknown {
  // Strip markdown code fences if the model wrapped the JSON
  const stripped = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Find the outermost JSON object
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in model response');
  }

  const jsonStr = stripped.slice(start, end + 1);

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`Failed to parse JSON from model response: ${(e as Error).message}`);
  }
}
