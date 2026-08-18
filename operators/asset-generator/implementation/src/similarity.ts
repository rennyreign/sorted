// ─────────────────────────────────────────────────────────────
// Asset Generator — Visual Similarity Judge
// Used by the cost-escalation ladder to decide whether a
// generated candidate is good enough to export, or whether to
// escalate to the next (more expensive) rung.
//
// Uses a cheap vision model (gpt-4.1-mini) to score how well a
// generated image matches the asset's description/intent — there
// is no pixel ground-truth once we're generating from text, so a
// semantic judge is used instead of a perceptual-hash comparison.
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';

export interface SimilarityJudgeOptions {
  candidatePath: string;
  description: string;
  assetType: string;
  styleHint?: string;
  apiKey: string;
  threshold?: number; // 0-100, default 75
  model?: string;      // default gpt-4.1-mini
}

export interface SimilarityJudgeResult {
  pass: boolean;
  score: number;
  reasoning: string;
}

const DEFAULT_THRESHOLD = 75;
const DEFAULT_JUDGE_MODEL = 'gpt-4.1-mini';

function loadImageAsDataUrl(imagePath: string): string {
  const buffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase().replace('.', '');
  const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  const mimeType = mimeMap[ext] ?? 'image/png';
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

export async function judgeSimilarity(opts: SimilarityJudgeOptions): Promise<SimilarityJudgeResult> {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: opts.apiKey });

  const imageUrl = loadImageAsDataUrl(opts.candidatePath);
  const styleClause = opts.styleHint ? ` Intended visual style: ${opts.styleHint}.` : '';

  const prompt = `You are a QA judge for AI-generated website assets. Score how well the attached image
fulfils the following brief as a usable production asset for a website.

Asset type: ${opts.assetType}
Brief: ${opts.description}${styleClause}

Score strictly on:
- Does it depict the described subject/content correctly?
- Is it free of obvious AI artifacts (extra limbs, garbled text, broken objects)?
- Is it usable as-is on a real client website without embarrassment?

Respond with ONLY a JSON object, no markdown fences:
{"score": <0-100 integer>, "pass": <true|false>, "reasoning": "<one sentence>"}
A "pass" should require score >= ${opts.threshold ?? DEFAULT_THRESHOLD}.`;

  const response = await client.chat.completions.create({
    model: opts.model ?? DEFAULT_JUDGE_MODEL,
    max_tokens: 300,
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
          { type: 'text', text: prompt },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? '';
  const stripped = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    const parsed = JSON.parse(stripped);
    const score = Number(parsed.score ?? 0);
    const threshold = opts.threshold ?? DEFAULT_THRESHOLD;
    return {
      score,
      pass: Boolean(parsed.pass) && score >= threshold,
      reasoning: String(parsed.reasoning ?? ''),
    };
  } catch {
    return { score: 0, pass: false, reasoning: `Judge returned unparseable response: ${raw.slice(0, 200)}` };
  }
}
