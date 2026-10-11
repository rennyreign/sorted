// ─────────────────────────────────────────────────────────────
// Frontend Builder — Claude Code Generation Client
//
// Each call to Claude generates one file. The section-by-section
// strategy avoids token limits, produces better-focused output,
// and gives us clear retry granularity if something fails.
// ─────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeCallOptions {
  systemPrompt: string;
  userPrompt: string;
  apiKey: string;
  model?: string;
  maxTokens?: number;
  verbose?: boolean;
  label?: string;
}

export interface ClaudeResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  /** Raw stop_reason from the API (e.g. 'end_turn', 'max_tokens'). */
  stopReason?: string;
}

// Default model — claude-sonnet-3-7 hits the best quality/cost ratio
// for structured TSX generation against a defined system prompt.
// Opus is overkill here; reserve it for open-ended reasoning tasks.
const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';

export async function callClaude(opts: ClaudeCallOptions): Promise<ClaudeResult> {
  const {
    systemPrompt,
    userPrompt,
    apiKey,
    model = DEFAULT_MODEL,
    maxTokens = 8192,
    verbose = false,
    label = 'file',
  } = opts;

  const client = new Anthropic({ apiKey });

  if (verbose) {
    console.log(`    Calling Claude (${model}) for: ${label}`);
  }

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt },
    ],
  });

  const block = response.content[0];
  if (!block || block.type !== 'text') {
    throw new Error(`Claude returned no text content for: ${label}`);
  }

  const raw = block.text;

  // Strip any markdown code fences Claude might add despite instructions
  const content = stripCodeFences(raw);

  if (verbose) {
    console.log(`    Done (${response.usage.input_tokens} in / ${response.usage.output_tokens} out)`);
  }

  return {
    content,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    model,
    stopReason: response.stop_reason ?? undefined,
  };
}

// ── Strip markdown fences if Claude wraps output ──────────────

function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();

  // Match ```tsx, ```ts, ```jsx, ```js, ```css, ``` etc.
  const fenceMatch = trimmed.match(/^```(?:tsx?|jsx?|css|html)?\s*\n([\s\S]*?)```\s*$/);
  if (fenceMatch && fenceMatch[1]) {
    return fenceMatch[1];
  }

  // If it starts with a fence but doesn't close cleanly, strip the opening fence
  if (trimmed.startsWith('```')) {
    const firstNewline = trimmed.indexOf('\n');
    if (firstNewline !== -1) {
      const withoutOpening = trimmed.slice(firstNewline + 1);
      // Strip closing fence if present
      return withoutOpening.replace(/\n```\s*$/, '');
    }
  }

  return trimmed;
}

// ── Token usage tracker ───────────────────────────────────────
// Re-exported for backwards compatibility; the implementation lives
// in tracker.ts so consumers don't have to load the SDK.

export { TokenTracker } from './tracker.js';
