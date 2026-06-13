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

export class TokenTracker {
  private inputTotal = 0;
  private outputTotal = 0;
  private calls = 0;

  record(result: ClaudeResult): void {
    this.inputTotal += result.inputTokens;
    this.outputTotal += result.outputTokens;
    this.calls++;
  }

  summary(): string {
    const totalTokens = this.inputTotal + this.outputTotal;
    // Rough cost estimate: claude-sonnet-3-7 at ~$3/$15 per MTok in/out
    const estimatedCostUSD =
      (this.inputTotal / 1_000_000) * 3 +
      (this.outputTotal / 1_000_000) * 15;
    return [
      `  Calls    : ${this.calls}`,
      `  Tokens   : ${totalTokens.toLocaleString()} (${this.inputTotal.toLocaleString()} in / ${this.outputTotal.toLocaleString()} out)`,
      `  Est. cost: ~$${estimatedCostUSD.toFixed(3)}`,
    ].join('\n');
  }
}
