// ─────────────────────────────────────────────────────────────
// Pass Evidence Validation
//
// Runtime validation for operator artifacts at mark-passed time.
// No operator may be marked passed without its artifact meeting
// the existing contract interface — required collections must be
// non-empty where relevant, success fields must be genuinely true,
// referenced files must exist under the job, and mutable-site
// artifacts must carry evidence {source_revision, input_sha256}
// matching the current fingerprint and input contract bytes.
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { BuildState, OperatorId } from './state.js';
import { EVIDENCE_STAGES } from './state.js';
import { fingerprintSource } from './revision.js';
import type { InputContract } from './pack-intake.js';

export interface PassContext {
  state: BuildState;
  buildDir: string;
  artifact: Record<string, unknown> | null;
  artifactRel: string;
  flags: { humanApproval: boolean; reviewer?: string };
}

function err(errors: string[], msg: string) {
  errors.push(msg);
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function nonemptyArray(v: unknown): v is unknown[] {
  return Array.isArray(v) && v.length > 0;
}

function fileExistsUnder(buildDir: string, rel: unknown): boolean {
  if (typeof rel !== 'string' || rel.length === 0) return false;
  const abs = path.resolve(buildDir, rel);
  if (!abs.startsWith(path.resolve(buildDir) + path.sep)) return false;
  return fs.existsSync(abs);
}

export function inputContractSha(buildDir: string): string | null {
  const p = path.join(buildDir, 'artifacts', 'input-contract.json');
  if (!fs.existsSync(p)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

export function loadInputContract(buildDir: string): InputContract | null {
  const p = path.join(buildDir, 'artifacts', 'input-contract.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as InputContract;
}

export function siteRoot(state: BuildState): string {
  const p = state.site_repo_path;
  if (typeof p === 'string' && p.length > 0 && fs.existsSync(p)) return path.resolve(p);
  return path.resolve(state.build_dir);
}

export function currentFingerprint(state: BuildState): string {
  return fingerprintSource(siteRoot(state));
}

// ── Shared evidence check ─────────────────────────────────────

function checkEvidence(op: OperatorId, ctx: PassContext, errors: string[]): void {
  const a = ctx.artifact;
  if (!EVIDENCE_STAGES.has(op) || !isObj(a)) return;
  const expected = currentFingerprint(ctx.state);
  if (typeof a['source_revision'] !== 'string' || a['source_revision'] !== expected) {
    err(errors, `artifact source_revision '${a['source_revision']}' does not match current source fingerprint '${expected}'`);
  }
  const contractSha = inputContractSha(ctx.buildDir);
  if (contractSha !== null && a['input_sha256'] !== contractSha) {
    err(errors, `artifact input_sha256 '${a['input_sha256']}' does not match input-contract bytes`);
  }
}

// ── Workspace brief validation ────────────────────────────────

export function validateWorkspaceBrief(buildDir: string, state: BuildState): string[] {
  const errors: string[] = [];
  const briefPath = path.join(buildDir, 'artifacts', 'workspace-brief.json');
  if (!fs.existsSync(briefPath)) {
    return ['workspace-brief.json missing — workspace-build cannot start without an approved brief'];
  }
  const brief = JSON.parse(fs.readFileSync(briefPath, 'utf-8')) as Record<string, unknown>;
  if (!isObj(brief)) return ['workspace-brief.json is not an object'];

  if (brief['client_slug'] !== state.client_slug) {
    err(errors, `workspace brief client_slug '${brief['client_slug']}' does not match build '${state.client_slug}'`);
  }
  const expectedRev = currentFingerprint(state);
  if (brief['website_revision'] !== expectedRev) {
    err(errors, `workspace brief website_revision '${brief['website_revision']}' does not match current source fingerprint '${expectedRev}'`);
  }
  if (typeof brief['approved_by'] !== 'string' || brief['approved_by'] === '') {
    err(errors, 'workspace brief missing approved_by');
  }
  if (typeof brief['approved_at'] !== 'string' || brief['approved_at'] === '') {
    err(errors, 'workspace brief missing approved_at');
  }

  const offer = brief['offer'];
  if (!isObj(offer)) {
    err(errors, 'workspace brief offer missing/not an object');
  } else {
    const nums = ['currency', 'total', 'deposit', 'balance'];
    if (typeof offer['currency'] !== 'string' || offer['currency'] === '') {
      err(errors, 'offer.currency missing');
    }
    for (const k of nums.slice(1)) {
      const v = offer[k];
      if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) {
        err(errors, `offer.${k} must be a finite non-negative number`);
      }
    }
    if (typeof offer['total'] === 'number' && typeof offer['deposit'] === 'number' &&
        typeof offer['balance'] === 'number' &&
        offer['total'] !== (offer['deposit'] as number) + (offer['balance'] as number)) {
      err(errors, `offer.total (${offer['total']}) must equal deposit + balance (${(offer['deposit'] as number) + (offer['balance'] as number)})`);
    }
    if (typeof offer['stripePaymentUrl'] !== 'string' || offer['stripePaymentUrl'] === '') {
      err(errors, 'offer.stripePaymentUrl missing — payment link is required');
    }
  }

  if (!Array.isArray(brief['interests'])) err(errors, 'interests must be an array (empty allowed — proposed)');
  if (!Array.isArray(brief['creatives'])) err(errors, 'creatives must be an array (empty allowed — proposed)');
  if (!Array.isArray(brief['follow_up'])) err(errors, 'follow_up must be an array (empty allowed — proposed)');

  const tracking = brief['tracking'];
  if (!isObj(tracking) || !['illustrative', 'connected'].includes(tracking['mode'] as string)) {
    err(errors, "tracking.mode must be 'illustrative' or 'connected'");
  }
  if (!['local', 'screenshot', 'authorised-hosted'].includes(brief['review_surface'] as string)) {
    err(errors, "review_surface must be 'local' | 'screenshot' | 'authorised-hosted'");
  }
  return errors;
}

// ── Per-operator artifact validation ──────────────────────────

export function validateArtifact(operatorId: OperatorId, ctx: PassContext): string[] {
  const errors: string[] = [];
  const op = operatorId;
  const dir = ctx.buildDir;
  const raw = ctx.artifact;
  if (raw !== null && !isObj(raw)) {
    err(errors, `artifact at ${ctx.artifactRel} is not a JSON object`);
  }
  const A: Record<string, unknown> | null = isObj(raw) ? raw : null;
  const missing = `missing/invalid artifact at ${ctx.artifactRel}`;

  switch (op) {
    case 'build-init': {
      if (!A) { err(errors, missing); break; }
      for (const k of ['build_id', 'client_slug', 'mockup_path', 'manifest_path']) {
        if (typeof A[k] !== 'string' || A[k] === '') err(errors, `build-init missing ${k}`);
      }
      if (!fileExistsUnder(dir, A['mockup_path'])) err(errors, 'mockup_path not found under job');
      break;
    }
    case 'mockup-regions': {
      if (!A) { err(errors, missing); break; }
      if (!nonemptyArray(A['regions'])) err(errors, 'regions must be a non-empty array');
      break;
    }
    case 'asset-reconstruction': {
      // legacy standalone: output is a non-empty assets-raw/ directory
      const rawDir = path.join(dir, 'artifacts', 'assets-raw');
      if (!fs.existsSync(rawDir) || fs.readdirSync(rawDir).filter(f => !f.startsWith('.')).length === 0) {
        err(errors, 'artifacts/assets-raw/ is empty — no reconstructed assets present');
      }
      break;
    }
    case 'asset-registry': {
      if (!A) { err(errors, missing); break; }
      if (!nonemptyArray(A['assets'])) { err(errors, 'asset-registry assets must be non-empty'); break; }
      for (const entry of A['assets'] as unknown[]) {
        if (!isObj(entry) || typeof entry['asset_id'] !== 'string') {
          err(errors, 'registry entry missing asset_id');
          continue;
        }
        if (!fileExistsUnder(dir, entry['file_path'])) {
          err(errors, `registry entry '${entry['asset_id']}' file missing: ${entry['file_path']}`);
        }
      }
      break;
    }
    case 'frontend-build': {
      if (!A) { err(errors, missing); break; }
      if (A['build_passed'] !== true) err(errors, 'frontend-build build_passed must be true (null/false rejects)');
      if (!nonemptyArray(A['sections_generated'])) err(errors, 'sections_generated must be non-empty');
      const repo = A['site_repo_path'];
      const repoAbs = typeof repo === 'string' ? path.resolve(dir, repo) : null;
      if (!repoAbs || !fs.existsSync(repoAbs)) err(errors, 'site_repo_path does not exist');
      break;
    }
    case 'visual-qa': {
      if (!A) { err(errors, missing); break; }
      if (A['passed'] !== true) err(errors, 'visual-qa passed must be true');
      if (A['blocker_count'] !== 0) err(errors, 'visual-qa blocker_count must be 0');
      const shots = A['screenshot_paths'];
      if (!nonemptyArray(shots)) {
        err(errors, 'visual-qa screenshot_paths must be non-empty');
      } else {
        for (const s of shots) {
          if (!fileExistsUnder(dir, s)) err(errors, `screenshot missing: ${s}`);
        }
      }
      const disc = A['discrepancies'];
      if (Array.isArray(disc)) {
        for (const d of disc) {
          if (isObj(d) && d['severity'] === 'blocker') {
            err(errors, `blocking discrepancy present: ${d['id'] ?? '?'}`);
          }
        }
      }
      break;
    }
    case 'human-vision-qa': {
      if (!A) { err(errors, missing); break; }
      if (A['passed'] !== true) err(errors, 'human-vision-qa passed must be true — vision gate cannot be waived');
      break;
    }
    case 'pixel-correction': {
      if (!A) { err(errors, missing); break; }
      if (!nonemptyArray(A['files_modified'])) err(errors, 'pixel-correction files_modified must be non-empty');
      break;
    }
    case 'ui-systemisation': {
      if (!A) { err(errors, missing); break; }
      if (A['visual_fidelity_preserved'] !== true) err(errors, 'ui-systemisation must preserve visual fidelity');
      break;
    }
    case 'design-system': {
      if (!A) { err(errors, missing); break; }
      if (A['client_slug'] !== ctx.state.client_slug) err(errors, 'design-system client_slug mismatch');
      break;
    }
    case 'core-build-qa': {
      if (!A) { err(errors, missing); break; }
      if (A['overall_passed'] !== true) err(errors, 'core-build-qa overall_passed must be true');
      const checks = A['checks'];
      if (!nonemptyArray(checks)) {
        err(errors, 'core-build-qa checks must be non-empty');
      } else {
        for (const c of checks) {
          if (isObj(c) && c['passed'] !== true) err(errors, `core-build-qa check failed: ${c['check']}`);
        }
      }
      break;
    }
    case 'human-assessment': {
      if (!ctx.flags.humanApproval) {
        err(errors, 'human-assessment requires --human-approval and --reviewer <name>');
        break;
      }
      if (!ctx.flags.reviewer) err(errors, 'human-assessment requires --reviewer <name>');
      if (!A) { err(errors, missing); break; }
      if (A['decision'] !== 'approved') err(errors, "human-assessment decision must be 'approved'");
      if (A['reviewer'] !== ctx.flags.reviewer) err(errors, 'artifact reviewer does not match --reviewer');
      if (typeof A['reviewed_at'] !== 'string' || A['reviewed_at'] === '') err(errors, 'missing reviewed_at');
      break;
    }
    case 'workspace-build': {
      errors.push(...validateWorkspaceBrief(dir, ctx.state).map(e => `brief: ${e}`));
      if (!A) { err(errors, missing); break; }
      if (A['overall_passed'] !== true) err(errors, 'workspace-build overall_passed must be true');
      const checks = A['checks'];
      if (!nonemptyArray(checks)) {
        err(errors, 'workspace-build checks must be non-empty');
      } else {
        for (const c of checks) {
          if (isObj(c) && c['passed'] !== true) err(errors, `workspace check failed: ${c['check']}`);
        }
      }
      // config may live outside the job ONLY at the known shared
      // Sorted path (lib/workspace.ts) — verify actual hash either way
      const cfg = A['config_path'];
      if (typeof cfg !== 'string' || cfg === '') {
        err(errors, 'workspace-build config_path missing');
      } else {
        const cfgAbs = path.isAbsolute(cfg) ? cfg : path.resolve(dir, cfg);
        const allowedOutside = cfgAbs.endsWith(path.join('lib', 'workspace.ts'));
        if (!cfgAbs.startsWith(path.resolve(dir) + path.sep) && !allowedOutside) {
          err(errors, `config_path outside job is only permitted for shared lib/workspace.ts: ${cfg}`);
        } else if (!fs.existsSync(cfgAbs)) {
          err(errors, `config_path does not exist: ${cfg}`);
        } else if (typeof A['config_sha256'] === 'string') {
          const actual = crypto.createHash('sha256').update(fs.readFileSync(cfgAbs)).digest('hex');
          if (actual !== A['config_sha256']) err(errors, 'config_sha256 does not match actual config file');
        } else {
          err(errors, 'config_sha256 missing');
        }
      }
      const preview = A['preview_image_path'];
      if (typeof preview !== 'string' || preview === '' || !fs.existsSync(path.isAbsolute(preview) ? preview : path.resolve(dir, preview))) {
        err(errors, 'preview_image_path must point to an existing screenshot file');
      }
      break;
    }
    case 'internal-pages': {
      if (!A) { err(errors, missing); break; }
      const pages = A['pages'];
      if (!nonemptyArray(pages)) {
        err(errors, 'internal-pages claiming completion with zero pages rejects — use mark-skipped with a no-pages artifact');
      } else {
        for (const p of pages) {
          if (isObj(p) && p['status'] !== 'passed') err(errors, `internal page not passed: ${p['page_id']}`);
        }
      }
      if (A['all_passed'] !== true) err(errors, 'internal-pages all_passed must be true');
      break;
    }
    case 'cms-integration': {
      if (!A) { err(errors, missing); break; }
      if (A['auth_configured'] !== true) err(errors, 'cms auth_configured must be true');
      if (A['baseline_committed'] !== true) err(errors, 'cms baseline_committed must be true');
      if (!nonemptyArray(A['field_mappings'])) err(errors, 'field_mappings must be non-empty');
      break;
    }
    case 'cms-qa': {
      if (!A) { err(errors, missing); break; }
      if (A['overall_passed'] !== true) err(errors, 'cms-qa overall_passed must be true');
      const tests = A['tests'];
      if (!nonemptyArray(tests)) {
        err(errors, 'cms-qa tests must be non-empty');
      } else {
        for (const t of tests) {
          if (isObj(t) && t['passed'] !== true) err(errors, `cms-qa test failed: ${t['test']}`);
        }
      }
      break;
    }
    case 'analytics': {
      if (!A) { err(errors, missing); break; }
      if (A['all_events_verified'] !== true) err(errors, 'analytics all_events_verified must be true');
      if (!nonemptyArray(A['events'])) err(errors, 'analytics events must be non-empty');
      break;
    }
    case 'launch-qa': {
      if (!A) { err(errors, missing); break; }
      if (!['PASS', 'PASS_WITH_WARNINGS'].includes(A['status'] as string)) {
        err(errors, `launch-qa status must be PASS or PASS_WITH_WARNINGS (got '${A['status']}')`);
      }
      const gates = A['gates'];
      if (isObj(gates)) {
        for (const [g, v] of Object.entries(gates)) {
          if (v === 'FAIL') err(errors, `launch-qa gate FAIL: ${g}`);
        }
      }
      const issues = A['issues'];
      if (Array.isArray(issues)) {
        for (const i of issues) {
          if (isObj(i) && i['severity'] === 'BLOCKER') err(errors, `launch-qa blocker: ${i['id']}`);
        }
      }
      break;
    }
    case 'deployment': {
      if (!A) { err(errors, missing); break; }
      if (typeof A['deployment_url'] !== 'string' || A['deployment_url'] === '') err(errors, 'deployment_url missing');
      if (A['production_verified'] !== true) err(errors, 'production_verified must be true');
      break;
    }
    default:
      err(errors, `no validator for operator '${op}'`);
  }

  checkEvidence(op, { ...ctx, artifact: A }, errors);
  return errors;
}
