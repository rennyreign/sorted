// ─────────────────────────────────────────────────────────────
// Asset Generator — Mode Resolver
//
// Given an asset's declared source, resolves the final execution mode.
//
//   recreate  → AI-generate a new image (always — no mockup extraction)
//   reuse     → pull from existing brand assets folder
//   source    → flag for manual stock sourcing
//   skip      → no action needed / not applicable
//
// Mockup extraction has been removed. Mockup crops are low-resolution
// samples from GPT-image mockups and are not suitable as production
// assets. All imagery is generated fresh via the configured model.
// ─────────────────────────────────────────────────────────────

import type { InputAsset, ExecutionMode } from './types.js';

export interface ModeDecision {
  mode: ExecutionMode;
  reason: string;
}

// ── Resolve execution mode for a single asset ─────────────────

export async function resolveMode(
  asset: InputAsset,
  _mockupPath: string,
  _verbose: boolean = false,
): Promise<ModeDecision> {

  // Reuse assets (logos, existing brand files) — never generate
  if (asset.source === 'reuse') {
    return { mode: 'reuse', reason: 'source=reuse — use existing brand asset' };
  }

  // Stock assets — no generation, flag for manual sourcing
  if (asset.source === 'stock') {
    return { mode: 'source', reason: 'source=stock — find stock equivalent' };
  }

  // source=generate: always recreate — no mockup extraction
  return { mode: 'recreate', reason: 'source=generate — AI generate via configured model' };
}

// ── Priority filter ───────────────────────────────────────────

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function filterAndSortAssets(
  assets: InputAsset[],
  priorityFilter?: string[],
): InputAsset[] {
  let filtered = assets;

  if (priorityFilter && priorityFilter.length > 0) {
    filtered = assets.filter((a) => priorityFilter.includes(a.priority));
  }

  return [...filtered].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99),
  );
}
