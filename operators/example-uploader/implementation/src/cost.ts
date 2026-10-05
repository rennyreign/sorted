// ─────────────────────────────────────────────────────────────
// Example Uploader — Cost Tracking
// Anthropic Claude pricing per 1M tokens (as of 2026-08).
// Used for credit reporting after each run.
// ─────────────────────────────────────────────────────────────

import type { CostRecord } from "./types.js";

export type { CostRecord };

// Per-1M-token pricing (input / output)
const ANTHROPIC_PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-5": { input: 3.0, output: 15.0 },
  "claude-opus-4-5": { input: 5.0, output: 25.0 },
  "claude-haiku-3-5": { input: 0.8, output: 4.0 },
};

const DEFAULT_MODEL = "claude-sonnet-4-5";

export function estimateClaudeCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = ANTHROPIC_PRICING[model] ?? ANTHROPIC_PRICING[DEFAULT_MODEL]!;
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

export function createCostRecord(
  model: string,
  inputTokens: number,
  outputTokens: number,
  purpose: string,
): CostRecord {
  return {
    model,
    inputTokens,
    outputTokens,
    costUsd: estimateClaudeCost(model, inputTokens, outputTokens),
    purpose,
  };
}

export function formatCostSummary(records: CostRecord[]): string {
  const total = records.reduce((sum, r) => sum + r.costUsd, 0);
  const lines = records.map(
    (r) =>
      `  ${r.purpose}: ${r.inputTokens.toLocaleString()} in / ${r.outputTokens.toLocaleString()} out → $${r.costUsd.toFixed(4)}`,
  );
  return [...lines, `  ───────────`, `  Total: $${total.toFixed(4)}`].join("\n");
}

export function totalCost(records: CostRecord[]): number {
  return records.reduce((sum, r) => sum + r.costUsd, 0);
}
