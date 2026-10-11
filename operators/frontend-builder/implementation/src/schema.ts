// ─────────────────────────────────────────────────────────────
// Frontend Builder — Input Validation
//
// Dependency-free validators (zod removed — it is not installed in
// this implementation's environment). Returns a safeParse-shaped
// result: { success: true, data } | { success: false, error }.
// ─────────────────────────────────────────────────────────────

import type { DeconstructionJSON, AssetManifest } from './types.js';

export interface ValidationError {
  format: () => Record<string, unknown>;
}

type Result<T> = { success: true; data: T } | { success: false; error: ValidationError };

function fail(issues: string[]): { success: false; error: ValidationError } {
  return {
    success: false,
    error: { format: () => ({ issues }) },
  };
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isStr(v: unknown, min = 1): boolean {
  return typeof v === 'string' && v.length >= min;
}

function isNum(v: unknown): boolean {
  return typeof v === 'number' && Number.isFinite(v);
}

function checkStr(o: Record<string, unknown>, key: string, path: string, issues: string[], required = true): void {
  const v = o[key];
  if (v === undefined) {
    if (required) issues.push(`${path}.${key}: required string missing`);
    return;
  }
  if (!isStr(v, required ? 1 : 0)) issues.push(`${path}.${key}: invalid string`);
}

function checkArr(v: unknown, path: string, issues: string[], minLen = 0): v is unknown[] {
  if (!Array.isArray(v)) {
    issues.push(`${path}: must be an array`);
    return false;
  }
  if (v.length < minLen) {
    issues.push(`${path}: must contain at least ${minLen} item(s)`);
    return false;
  }
  return true;
}

export function validateDeconstruction(data: unknown): Result<DeconstructionJSON> {
  const issues: string[] = [];
  if (!isObj(data)) return fail(['root: must be an object']);

  checkStr(data, 'page_type', 'root', issues);
  if (checkArr(data['sections'], 'sections', issues, 1)) {
    (data['sections'] as unknown[]).forEach((s, i) => {
      if (!isObj(s)) { issues.push(`sections[${i}]: must be an object`); return; }
      checkStr(s, 'id', `sections[${i}]`, issues);
      checkStr(s, 'type', `sections[${i}]`, issues);
      if (!isNum(s['position']) || !Number.isInteger(s['position']) || (s['position'] as number) < 1) {
        issues.push(`sections[${i}].position: must be an integer >= 1`);
      }
    });
  }
  if (checkArr(data['assets'], 'assets', issues)) {
    (data['assets'] as unknown[]).forEach((a, i) => {
      if (!isObj(a)) { issues.push(`assets[${i}]: must be an object`); return; }
      for (const k of ['id', 'type', 'description', 'priority', 'source']) {
        checkStr(a, k, `assets[${i}]`, issues);
      }
    });
  }
  if (checkArr(data['components'], 'components', issues)) {
    (data['components'] as unknown[]).forEach((c, i) => {
      if (!isObj(c)) { issues.push(`components[${i}]: must be an object`); return; }
      checkStr(c, 'component', `components[${i}]`, issues);
    });
  }
  if (checkArr(data['copy'], 'copy', issues)) {
    (data['copy'] as unknown[]).forEach((c, i) => {
      if (!isObj(c)) { issues.push(`copy[${i}]: must be an object`); return; }
      for (const k of ['section', 'type', 'text']) {
        checkStr(c, k, `copy[${i}]`, issues);
      }
    });
  }
  if (!isObj(data['build_notes'])) issues.push('build_notes: must be an object');

  if (issues.length > 0) return fail(issues);
  return { success: true, data: data as unknown as DeconstructionJSON };
}

export function validateManifest(data: unknown): Result<AssetManifest> {
  const issues: string[] = [];
  if (!isObj(data)) return fail(['root: must be an object']);

  checkStr(data, 'mockup', 'root', issues);
  checkStr(data, 'deconstruction', 'root', issues);
  checkStr(data, 'generated_at', 'root', issues);
  checkStr(data, 'operator_version', 'root', issues);

  if (checkArr(data['assets'], 'assets', issues)) {
    (data['assets'] as unknown[]).forEach((a, i) => {
      if (!isObj(a)) { issues.push(`assets[${i}]: must be an object`); return; }
      for (const k of ['id', 'mode', 'status']) {
        checkStr(a, k, `assets[${i}]`, issues);
      }
      if (!isObj(a['files'])) issues.push(`assets[${i}].files: must be an object`);
      if (!isObj(a['meta'])) issues.push(`assets[${i}].meta: must be an object`);
    });
  }

  if (issues.length > 0) return fail(issues);
  return { success: true, data: data as unknown as AssetManifest };
}
