// ─────────────────────────────────────────────────────────────
// Asset Generator — Quality Gate + Mode Resolver
//
// Given an asset's declared source hint and whether a valid bbox
// exists, resolves the final execution mode:
//
//   extract   → crop from mockup (quality gates pass)
//   recreate  → AI-generate a new image
//   reuse     → pull from existing brand assets folder
//   skip      → no action needed / not applicable
// ─────────────────────────────────────────────────────────────

import type { InputAsset, ExecutionMode } from './types.js';
import { checkExtractionQuality } from './extract.js';

export interface ModeDecision {
  mode: ExecutionMode;
  reason: string;
}

// ── Resolve execution mode for a single asset ─────────────────

export async function resolveMode(
  asset: InputAsset,
  mockupPath: string,
  verbose: boolean = false,
): Promise<ModeDecision> {

  // Reuse assets (logos, existing brand files) — never extract or regenerate
  if (asset.source === 'reuse') {
    return { mode: 'reuse', reason: 'source=reuse — use existing brand asset' };
  }

  // Stock assets — no generation, flag for manual sourcing
  if (asset.source === 'stock') {
    return { mode: 'source', reason: 'source=stock — find stock equivalent' };
  }

  // source=generate: always recreate regardless of bbox
  if (asset.source === 'generate') {
    // Unless mode_hint explicitly says extract — respect that and try it
    if (asset.mode_hint === 'extract' && asset.bbox) {
      const check = await checkExtractionQuality(mockupPath, asset.bbox, asset.type);
      if (check.pass) {
        if (verbose) console.log(`    [quality] extract passed for ${asset.id} (${check.width}×${check.height}px)`);
        return { mode: 'extract', reason: `mode_hint=extract; quality check passed (${check.width}×${check.height}px)` };
      }
      if (verbose) console.log(`    [quality] extract failed for ${asset.id}: ${check.reason} — falling back to recreate`);
      return { mode: 'recreate', reason: `mode_hint=extract but quality failed: ${check.reason}` };
    }

    return { mode: 'recreate', reason: 'source=generate — AI recreate' };
  }

  // Fallback
  return { mode: 'recreate', reason: 'default fallback — AI recreate' };
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
