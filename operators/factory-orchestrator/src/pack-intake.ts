// ─────────────────────────────────────────────────────────────
// Supplied-Pack Intake (init-pack)
//
// Imports a ChatGPT-produced export pack — approved mockup, raw
// design IR, images/fonts — into a new factory job directory.
//
// Guarantees:
//   - the entire intake is validated BEFORE any output is created
//   - originals are preserved verbatim under input/ (relative names)
//   - raw design IR is never reinterpreted — it is hashed + stored
//   - no reconstruction/model calls happen here
//   - symlinks, path escapes, hidden/state/env/executable content
//     are rejected or excluded, never silently copied
//   - conflicts[] non-empty blocks init
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createBuildJob, writeBuildState } from './state-manager.js';
import { fingerprintSource } from './revision.js';

// ── Public types ──────────────────────────────────────────────

export interface InputContract {
  schema_version: 1;
  input_mode: 'supplied-pack' | 'legacy';
  client_slug: string;
  producer: 'chatgpt-export' | 'legacy';
  mockup: { path: string; sha256: string };
  design_ir: { path: string; sha256: string };
  files: Array<{ path: string; sha256: string; source_path: string }>;
  assets: Array<{
    asset_id: string;
    source_path: string;         // input/-relative path, or declared ref
    sha256: string | null;
    required: boolean;
    provenance: 'supplied' | 'unresolved';
  }>;
  warnings: string[];
  conflicts: string[];           // non-empty blocks init
  created_at: string;
}

export interface InitPackOptions {
  packDir: string;
  slug: string;
  buildDir: string;
  mockup?: string;               // pack-relative overrides
  designIr?: string;
  manifest?: string;
  templateDir?: string;
  dryRun?: boolean;
}

export interface InitPackResult {
  contract: InputContract;
  state: import('./state.js').BuildState | null; // null on dry-run
  plan: {
    filesToCopy: string[];
    mockup: string;
    designIr: string;
    assetCount: number;
    unresolvedAssets: string[];
  };
}

// ── Constants ─────────────────────────────────────────────────

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const ALLOWED_EXTENSIONS = new Set([
  '.json',
  '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.avif',
  '.woff', '.woff2', '.ttf', '.otf',
  '.md', '.txt',
]);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.avif']);
const FONT_EXTENSIONS = new Set(['.woff', '.woff2', '.ttf', '.otf']);
const EXCLUDED_DIRS = new Set(['.git', 'node_modules', 'state', 'artifacts', 'out', '.next']);
const EXECUTABLE_EXTENSIONS = new Set([
  '.sh', '.bash', '.zsh', '.exe', '.bat', '.cmd', '.com', '.bin',
  '.dll', '.so', '.dylib', '.app', '.msi',
]);
const MOCKUP_CANONICAL_STEMS = ['approved-mockup'];
const MOCKUP_FALLBACK_STEMS = ['mockup', 'homepage-mockup'];

// ── Helpers ───────────────────────────────────────────────────

function sha256File(p: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

function isHiddenName(name: string): boolean {
  return name.startsWith('.');
}

interface PackFile {
  rel: string;   // POSIX relative path inside the pack
  abs: string;
}

// Walk the pack. Symlinks and path escapes are hard failures.
// Excluded directories are skipped (never copied). Disallowed file
// types and hidden files are collected as skipped with warnings.
function walkPack(packDir: string, warnings: string[]): PackFile[] {
  const root = path.resolve(packDir);
  const files: PackFile[] = [];

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);

      if (entry.isSymbolicLink()) {
        throw new Error(`Symlink rejected in pack: ${abs}`);
      }

      if (entry.isDirectory()) {
        if (isHiddenName(entry.name) || EXCLUDED_DIRS.has(entry.name)) {
          warnings.push(`excluded directory not imported: ${path.relative(root, abs)}`);
          continue;
        }
        walk(abs);
        continue;
      }

      if (!entry.isFile()) {
        warnings.push(`non-regular file not imported: ${path.relative(root, abs)}`);
        continue;
      }

      if (isHiddenName(entry.name) || entry.name === '.env' || entry.name.startsWith('.env')) {
        warnings.push(`hidden/env file not imported: ${path.relative(root, abs)}`);
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (EXECUTABLE_EXTENSIONS.has(ext)) {
        warnings.push(`executable not imported: ${path.relative(root, abs)}`);
        continue;
      }
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        warnings.push(`unsupported file type not imported: ${path.relative(root, abs)}`);
        continue;
      }

      const rel = path.relative(root, abs).split(path.sep).join('/');
      if (rel.startsWith('..') || path.isAbsolute(rel)) {
        throw new Error(`Path escape rejected in pack: ${abs}`);
      }
      files.push({ rel, abs });
    }
  };

  walk(root);
  return files;
}

function resolveInside(root: string, rel: string, what: string): string {
  const abs = path.resolve(root, rel);
  if (!abs.startsWith(root + path.sep) && abs !== root) {
    throw new Error(`${what} escapes the pack directory: ${rel}`);
  }
  return abs;
}

function stem(p: string): string {
  return path.basename(p, path.extname(p)).toLowerCase();
}

// ── Mockup resolution ─────────────────────────────────────────

function resolveMockup(files: PackFile[], flag: string | undefined, packDir: string): PackFile {
  if (flag) {
    const abs = resolveInside(path.resolve(packDir), flag, '--mockup');
    const found = files.find(f => f.abs === abs);
    if (!found) throw new Error(`--mockup file not found or not importable in pack: ${flag}`);
    if (!IMAGE_EXTENSIONS.has(path.extname(found.rel).toLowerCase())) {
      throw new Error(`--mockup must be an image file: ${flag}`);
    }
    return found;
  }

  const images = files.filter(f => IMAGE_EXTENSIONS.has(path.extname(f.rel).toLowerCase()));
  const canonical = images.filter(f => MOCKUP_CANONICAL_STEMS.includes(stem(f.rel)));
  if (canonical.length === 1) return canonical[0]!;
  if (canonical.length > 1) {
    throw new Error(`Ambiguous mockup — multiple approved-mockup files found: ${canonical.map(f => f.rel).join(', ')}. Pass --mockup <relative>.`);
  }
  const fallback = images.filter(f => MOCKUP_FALLBACK_STEMS.includes(stem(f.rel)));
  if (fallback.length === 1) return fallback[0]!;
  if (fallback.length > 1) {
    throw new Error(`Ambiguous mockup — multiple mockup files found: ${fallback.map(f => f.rel).join(', ')}. Pass --mockup <relative>.`);
  }
  throw new Error('No mockup found in pack — expected approved-mockup.{png,jpg,jpeg,webp} or a unique mockup/homepage-mockup file, or pass --mockup <relative>.');
}

// ── Design IR resolution ──────────────────────────────────────

function readJson(abs: string, what: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(abs, 'utf-8'));
  } catch (err) {
    throw new Error(`${what} is not valid JSON: ${abs} — ${(err as Error).message}`);
  }
}

function resolveDesignIr(
  files: PackFile[],
  flag: string | undefined,
  packDir: string,
): { file: PackFile; json: unknown } {
  if (flag) {
    const abs = resolveInside(path.resolve(packDir), flag, '--design-ir');
    const found = files.find(f => f.abs === abs);
    if (!found) throw new Error(`--design-ir file not found or not importable in pack: ${flag}`);
    return { file: found, json: readJson(found.abs, '--design-ir') };
  }

  const named = files.filter(f => path.basename(f.rel).toLowerCase() === 'design-ir.json');
  if (named.length === 1) return { file: named[0]!, json: readJson(named[0]!.abs, 'design-ir.json') };
  if (named.length > 1) {
    throw new Error(`Ambiguous design IR — multiple design-ir.json files: ${named.map(f => f.rel).join(', ')}. Pass --design-ir <relative>.`);
  }

  // Fallback: image-manifest.json carrying a non-empty sections array
  const manifests = files.filter(f => path.basename(f.rel).toLowerCase() === 'image-manifest.json');
  const withSections = manifests.filter(f => {
    const j = readJson(f.abs, 'image-manifest.json');
    return typeof j === 'object' && j !== null &&
      Array.isArray((j as Record<string, unknown>)['sections']) &&
      ((j as Record<string, unknown>)['sections'] as unknown[]).length > 0;
  });
  if (withSections.length === 1) return { file: withSections[0]!, json: readJson(withSections[0]!.abs, 'image-manifest.json') };
  if (withSections.length > 1) {
    throw new Error(`Ambiguous design IR — multiple image-manifest.json files with sections. Pass --design-ir <relative>.`);
  }
  throw new Error('No design IR found in pack — expected design-ir.json, or image-manifest.json with a non-empty sections array, or pass --design-ir <relative>.');
}

// ── Asset declaration extraction ──────────────────────────────

interface DeclaredAsset {
  asset_id: string;
  fileRef: string | null;
  required: boolean;
}

function extractAssetArray(doc: unknown): unknown[] {
  if (Array.isArray(doc)) return doc;
  if (typeof doc !== 'object' || doc === null) return [];
  const obj = doc as Record<string, unknown>;
  if (Array.isArray(obj['assets'])) return obj['assets'];
  const am = obj['asset_manifest'];
  if (Array.isArray(am)) return am;
  if (typeof am === 'object' && am !== null &&
      Array.isArray((am as Record<string, unknown>)['assets'])) {
    return (am as Record<string, unknown>)['assets'] as unknown[];
  }
  return [];
}

function normaliseAssetEntry(entry: unknown): DeclaredAsset | null {
  if (typeof entry !== 'object' || entry === null) return null;
  const e = entry as Record<string, unknown>;
  const id = (e['asset_id'] ?? e['id']) as unknown;
  if (typeof id !== 'string' || id.length === 0) return null;
  const files = e['files'] as Record<string, unknown> | undefined;
  const fileRef = (e['file'] ?? e['path'] ?? e['filename'] ?? e['source_file'] ??
    (files && typeof files === 'object' ? files['original'] : undefined)) as unknown;
  return {
    asset_id: id,
    fileRef: typeof fileRef === 'string' && fileRef.length > 0 ? fileRef : null,
    required: e['required'] !== false,
  };
}

// ── Template scaffold (mirrors start-build.sh behaviour) ──────

function scaffoldTemplate(templateDir: string, buildDir: string): void {
  const src = path.resolve(templateDir);
  if (!fs.existsSync(src)) {
    throw new Error(`Template directory not found: ${src}`);
  }
  const copy = (from: string, to: string) => {
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      if (['node_modules', '.next', 'out', '.git'].includes(entry.name)) continue;
      const s = path.join(from, entry.name);
      const d = path.join(to, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`Symlink in template is not allowed: ${s}`);
      }
      if (entry.isDirectory()) {
        fs.mkdirSync(d, { recursive: true });
        copy(s, d);
      } else if (entry.isFile()) {
        fs.copyFileSync(s, d);
      }
    }
  };
  fs.mkdirSync(buildDir, { recursive: true });
  copy(src, buildDir);
  // Template-specific delivery stub is not part of the site
  const stub = path.join(buildDir, 'client-delivery-quote.tsx.template');
  if (fs.existsSync(stub)) fs.unlinkSync(stub);
}

// ── Main entry ────────────────────────────────────────────────

export function initPack(opts: InitPackOptions): InitPackResult {
  const warnings: string[] = [];
  const conflicts: string[] = [];

  // ── Validate arguments before touching anything ────────────
  if (!SLUG_RE.test(opts.slug)) {
    throw new Error(`Invalid client slug '${opts.slug}' — must match ${SLUG_RE}`);
  }
  const packDir = path.resolve(opts.packDir);
  if (!fs.existsSync(packDir) || !fs.statSync(packDir).isDirectory()) {
    throw new Error(`Pack directory not found: ${packDir}`);
  }
  const buildDir = path.resolve(opts.buildDir);
  if (fs.existsSync(buildDir)) {
    throw new Error(`Build directory already exists: ${buildDir} — init requires a fresh directory`);
  }
  if (opts.templateDir && !fs.existsSync(path.resolve(opts.templateDir))) {
    throw new Error(`Template directory not found: ${opts.templateDir}`);
  }

  // ── Scan pack (symlinks/escapes throw here) ────────────────
  const files = walkPack(packDir, warnings);
  if (files.length === 0) {
    throw new Error(`Pack contains no importable files: ${packDir}`);
  }

  const mockup = resolveMockup(files, opts.mockup, packDir);
  const designIr = resolveDesignIr(files, opts.designIr, packDir);

  // ── Collect asset declarations ─────────────────────────────
  // Sources: --manifest file, the design IR itself (top-level assets /
  // asset_manifest), plus dedicated image-manifest.json /
  // asset-manifest.json files when present.
  const declared: DeclaredAsset[] = [];
  const manifestSources: PackFile[] = [];
  if (opts.manifest) {
    const abs = resolveInside(packDir, opts.manifest, '--manifest');
    const found = files.find(f => f.abs === abs);
    if (!found) throw new Error(`--manifest file not found or not importable in pack: ${opts.manifest}`);
    manifestSources.push(found);
  }
  for (const name of ['image-manifest.json', 'asset-manifest.json']) {
    for (const f of files.filter(f => path.basename(f.rel).toLowerCase() === name)) {
      if (!manifestSources.includes(f)) manifestSources.push(f);
    }
  }
  for (const f of manifestSources) {
    const doc = readJson(f.abs, f.rel);
    for (const raw of extractAssetArray(doc)) {
      const a = normaliseAssetEntry(raw);
      if (a) declared.push(a);
    }
  }
  // Design IR's own asset declarations
  for (const raw of extractAssetArray(designIr.json)) {
    const a = normaliseAssetEntry(raw);
    if (a) declared.push(a);
  }

  // Merge declarations: same id + same file merges; any other
  // duplicate id is a conflict that blocks init.
  const byId = new Map<string, DeclaredAsset>();
  for (const a of declared) {
    const existing = byId.get(a.asset_id);
    if (!existing) {
      byId.set(a.asset_id, a);
      continue;
    }
    if (existing.fileRef === a.fileRef) {
      existing.required = existing.required || a.required;
      continue; // same id, same file — merge
    }
    conflicts.push(
      `asset '${a.asset_id}' declared with conflicting files ` +
      `('${existing.fileRef ?? 'none'}' vs '${a.fileRef ?? 'none'}')`,
    );
  }

  // ── Resolve declared asset files inside the pack ───────────
  const assets: InputContract['assets'] = [];
  const referencedFiles = new Set<string>();
  for (const a of byId.values()) {
    if (!a.fileRef) {
      if (a.required) {
        conflicts.push(`required asset '${a.asset_id}' declares no file`);
      } else {
        assets.push({ asset_id: a.asset_id, source_path: '', sha256: null, required: false, provenance: 'unresolved' });
      }
      continue;
    }
    // Asset file refs are resolved against the pack root first, then the
    // design IR's own directory — export layouts differ (some nests the
    // website payload under a subdirectory like `website/`).
    let abs = path.resolve(packDir, a.fileRef);
    const irDir = path.dirname(path.resolve(packDir, designIr.file.rel));
    if (!fs.existsSync(abs)) {
      const alt = path.resolve(irDir, a.fileRef);
      if (alt.startsWith(packDir + path.sep) && fs.existsSync(alt)) abs = alt;
    }
    if (!abs.startsWith(packDir + path.sep) && abs !== packDir) {
      conflicts.push(`asset '${a.asset_id}' file escapes the pack: ${a.fileRef}`);
      continue;
    }
    const found = files.find(f => f.abs === abs);
    if (!found || !fs.existsSync(abs)) {
      if (a.required) {
        conflicts.push(`required asset '${a.asset_id}' file missing from pack: ${a.fileRef}`);
      } else {
        assets.push({ asset_id: a.asset_id, source_path: a.fileRef, sha256: null, required: false, provenance: 'unresolved' });
        warnings.push(`optional asset '${a.asset_id}' file unresolved: ${a.fileRef}`);
      }
      continue;
    }
    referencedFiles.add(found.rel);
    assets.push({
      asset_id: a.asset_id,
      source_path: `input/${found.rel}`,
      sha256: sha256File(found.abs),
      required: a.required,
      provenance: 'supplied',
    });
  }

  // Unlisted image/font files are preserved with a warning
  for (const f of files) {
    const ext = path.extname(f.rel).toLowerCase();
    if ((IMAGE_EXTENSIONS.has(ext) || FONT_EXTENSIONS.has(ext)) &&
        !referencedFiles.has(f.rel) &&
        f.rel !== mockup.rel) {
      warnings.push(`unlisted ${IMAGE_EXTENSIONS.has(ext) ? 'image' : 'font'} preserved without asset id: ${f.rel}`);
    }
  }

  // ── Conflicts block init ───────────────────────────────────
  const contract: InputContract = {
    schema_version: 1,
    input_mode: 'supplied-pack',
    client_slug: opts.slug,
    producer: 'chatgpt-export',
    mockup: { path: `input/${mockup.rel}`, sha256: sha256File(mockup.abs) },
    design_ir: { path: `input/${designIr.file.rel}`, sha256: sha256File(designIr.file.abs) },
    files: files
      .slice()
      .sort((a, b) => a.rel.localeCompare(b.rel))
      .map(f => ({ path: `input/${f.rel}`, sha256: sha256File(f.abs), source_path: f.abs })),
    assets,
    warnings,
    conflicts,
    created_at: new Date().toISOString(),
  };

  const result: InitPackResult = {
    contract,
    state: null,
    plan: {
      filesToCopy: files.map(f => f.rel),
      mockup: mockup.rel,
      designIr: designIr.file.rel,
      assetCount: assets.filter(a => a.provenance === 'supplied').length,
      unresolvedAssets: assets.filter(a => a.provenance === 'unresolved').map(a => a.asset_id),
    },
  };

  if (conflicts.length > 0) {
    throw new Error(`Intake conflicts block init:\n  ${conflicts.join('\n  ')}`);
  }
  if (opts.dryRun) {
    return result; // read-only — nothing created
  }

  // ── Create build dir (template scaffold first if given) ────
  if (opts.templateDir) {
    scaffoldTemplate(opts.templateDir, buildDir);
  } else {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  const inputDir = path.join(buildDir, 'input');
  for (const f of files) {
    const dest = path.join(inputDir, f.rel);
    if (!path.resolve(dest).startsWith(path.resolve(inputDir) + path.sep)) {
      throw new Error(`Refusing to write outside input/: ${f.rel}`);
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(f.abs, dest);
  }

  // ── Job state ──────────────────────────────────────────────
  const state = createBuildJob({
    client_id: opts.slug,
    client_slug: opts.slug,
    mockup_reference: contract.mockup.path,
    manifest_reference: contract.design_ir.path,
    build_dir: buildDir,
    input_mode: 'supplied-pack',
  });
  // source_revision stays empty until the first evidence pass
  // (frontend-build) binds it — init/registry legitimately create
  // covered source files between now and then.

  // Contract artifact
  const artifactsDirPath = path.join(buildDir, 'artifacts');
  fs.mkdirSync(artifactsDirPath, { recursive: true });
  fs.writeFileSync(
    path.join(artifactsDirPath, 'input-contract.json'),
    JSON.stringify(contract, null, 2),
    'utf-8',
  );

  // build-init artifact — existing interface plus input_contract_path
  const buildInit = {
    build_id: state.build_id,
    client_id: state.client_id,
    client_slug: state.client_slug,
    mockup_path: contract.mockup.path,
    manifest_path: contract.design_ir.path,
    build_dir: buildDir,
    initialized_at: new Date().toISOString(),
    input_contract_path: 'artifacts/input-contract.json',
  };
  fs.writeFileSync(
    path.join(artifactsDirPath, 'build-init.json'),
    JSON.stringify(buildInit, null, 2),
    'utf-8',
  );

  // Deterministic intake transitions — supplied pack means:
  //   build-init            passed  (its real artifact exists)
  //   mockup-regions        skipped (supplied layout/approved mockup is
  //                          consumed directly; still callable manually)
  //   asset-reconstruction  supplied (backed by input contract; never
  //                          counted as local generation work)
  //   asset-registry        pending (deterministic register-assets run)
  const now = new Date().toISOString();
  state.operators['build-init'].status = 'passed';
  state.operators['build-init'].completed_at = now;
  state.operators['build-init'].artifact_path = 'artifacts/build-init.json';
  state.operators['build-init'].evidence = {
    input_sha256: crypto.createHash('sha256')
      .update(fs.readFileSync(path.join(artifactsDirPath, 'input-contract.json')))
      .digest('hex'),
  };
  state.operators['mockup-regions'].status = 'skipped';
  state.operators['mockup-regions'].completed_at = now;
  state.operators['mockup-regions'].notes =
    'supplied pack: approved mockup + design IR consumed directly — region decomposition not required';
  state.operators['asset-reconstruction'].status = 'supplied';
  state.operators['asset-reconstruction'].completed_at = now;
  state.operators['asset-reconstruction'].notes =
    'assets supplied by intake pack — no local reconstruction performed';
  state.last_completed_operator = 'asset-reconstruction';
  writeBuildState(state);

  result.state = state;
  return result;
}
