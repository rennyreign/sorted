// ─────────────────────────────────────────────────────────────
// Asset Generator — Manifest + Generation Log Writer
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import type { Manifest, AssetResult, LogEntry } from './types.js';

const OPERATOR_VERSION = '0.1.0';

// ── Build manifest object ─────────────────────────────────────

export function buildManifest(
  mockupPath: string,
  deconstructionPath: string,
  assets: AssetResult[],
): Manifest {
  return {
    mockup: path.basename(mockupPath),
    deconstruction: path.basename(deconstructionPath),
    generated_at: new Date().toISOString(),
    operator_version: OPERATOR_VERSION,
    assets,
  };
}

// ── Write manifest.json ───────────────────────────────────────

export function writeManifest(manifest: Manifest, outputDir: string): string {
  const outPath = path.join(outputDir, 'manifest.json');
  ensureDir(outputDir);
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');
  return outPath;
}

// ── Write generation-log.json ─────────────────────────────────

export function writeGenerationLog(log: LogEntry[], outputDir: string): string {
  const outPath = path.join(outputDir, 'generation-log.json');
  ensureDir(outputDir);
  fs.writeFileSync(outPath, JSON.stringify(log, null, 2), 'utf-8');
  return outPath;
}

// ── Summary printer ───────────────────────────────────────────

export function printSummary(manifest: Manifest, logEntries: LogEntry[]): void {
  const ok = manifest.assets.filter((a) => a.status === 'ok').length;
  const failed = manifest.assets.filter((a) => a.status === 'failed').length;
  const skipped = manifest.assets.filter((a) => a.status === 'skipped').length;

  const byMode: Record<string, number> = {};
  for (const a of manifest.assets) {
    byMode[a.mode] = (byMode[a.mode] ?? 0) + 1;
  }

  const totalMs = logEntries.reduce((s, e) => s + e.duration_ms, 0);

  console.log(`\nAsset Generation Complete`);
  console.log('─'.repeat(40));
  console.log(`  OK       : ${ok}`);
  if (failed > 0) console.log(`  Failed   : ${failed}`);
  if (skipped > 0) console.log(`  Skipped  : ${skipped}`);
  console.log(`  Total    : ${manifest.assets.length}`);
  console.log('');
  console.log('  Modes:');
  for (const [mode, count] of Object.entries(byMode)) {
    console.log(`    ${mode.padEnd(10)} ${count}`);
  }
  console.log('');
  console.log(`  Duration : ${(totalMs / 1000).toFixed(1)}s`);
}

// ── Helpers ───────────────────────────────────────────────────

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
