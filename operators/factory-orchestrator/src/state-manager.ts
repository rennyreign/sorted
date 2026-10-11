// ─────────────────────────────────────────────────────────────
// Build State Manager — disk persistence
//
// Reads and writes build-state.json. All updates go through here
// so the state file is always consistent:
//   - runtime shape validation on read
//   - atomic temp-file + rename writes
//   - exclusive lock file for read-modify-write cycles
//   - optimistic updated_at check rejecting stale writers
//   - legacy states are read-only until `reconcile` runs
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import {
  type BuildState,
  type OperatorId,
  type OperatorStatus,
  createInitialBuildState,
  stateNeedsReconciliation,
  OPERATOR_IDS,
  KNOWN_STATUSES,
} from './state.js';
import { fingerprintSource } from './revision.js';

// ── Path helpers ──────────────────────────────────────────────

export function stateFilePath(buildDir: string): string {
  return path.join(buildDir, 'state', 'build-state.json');
}

export function lockFilePath(buildDir: string): string {
  return path.join(buildDir, 'state', 'build-state.lock');
}

export function legacyStateFilePath(buildDir: string): string {
  return path.join(buildDir, 'state', 'build-state.legacy.json');
}

export function artifactsDir(buildDir: string): string {
  return path.join(buildDir, 'artifacts');
}

export function artifactPath(buildDir: string, relativePath: string): string {
  return path.join(artifactsDir(buildDir), relativePath);
}

// ── Runtime validation ────────────────────────────────────────

export function validateStateShape(raw: unknown): string[] {
  const errors: string[] = [];
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return ['state file is not a JSON object'];
  }
  const s = raw as Record<string, unknown>;
  for (const key of ['build_id', 'client_id', 'client_slug', 'build_dir', 'created_at', 'updated_at']) {
    if (typeof s[key] !== 'string') errors.push(`missing/invalid field: ${key}`);
  }
  if (typeof s['operators'] !== 'object' || s['operators'] === null) {
    errors.push('missing/invalid field: operators');
  } else {
    const ops = s['operators'] as Record<string, unknown>;
    for (const id of Object.keys(ops)) {
      const op = ops[id] as Record<string, unknown> | null;
      if (typeof op !== 'object' || op === null) {
        errors.push(`operator '${id}' is not an object`);
        continue;
      }
      if (typeof op['status'] !== 'string') {
        errors.push(`operator '${id}' missing status`);
      }
      if (op['retry_count'] !== undefined && typeof op['retry_count'] !== 'number') {
        errors.push(`operator '${id}' invalid retry_count`);
      }
    }
  }
  const loop = s['visual_qa_loop'] as Record<string, unknown> | undefined;
  if (typeof loop !== 'object' || loop === null ||
      typeof loop['iteration'] !== 'number' ||
      typeof loop['max_iterations'] !== 'number') {
    errors.push('missing/invalid field: visual_qa_loop');
  }
  return errors;
}

// ── Read ──────────────────────────────────────────────────────

export function readBuildState(buildDir: string): BuildState | null {
  const sf = stateFilePath(buildDir);
  if (!fs.existsSync(sf)) return null;
  const raw = JSON.parse(fs.readFileSync(sf, 'utf-8')) as unknown;
  const errors = validateStateShape(raw);
  if (errors.length > 0) {
    throw new Error(`Corrupt build state at ${sf}:\n  ${errors.join('\n  ')}`);
  }
  return raw as BuildState;
}

// ── Write (atomic, optimistic) ────────────────────────────────

export function writeBuildState(
  state: BuildState,
  options?: { expectedUpdatedAt?: string },
): void {
  const sf = stateFilePath(state.build_dir);

  if (options?.expectedUpdatedAt !== undefined && fs.existsSync(sf)) {
    const onDisk = JSON.parse(fs.readFileSync(sf, 'utf-8')) as { updated_at?: string };
    if (onDisk.updated_at !== options.expectedUpdatedAt) {
      throw new Error(
        `Stale writer rejected: build state changed since read ` +
        `(expected updated_at ${options.expectedUpdatedAt}, found ${onDisk.updated_at}). ` +
        `Re-read state and retry.`,
      );
    }
  }

  state.updated_at = new Date().toISOString();
  const dir = path.dirname(sf);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const tmp = `${sf}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf-8');
  fs.renameSync(tmp, sf);
}

// ── Exclusive lock ────────────────────────────────────────────
// Lock-exists fails loudly — never steal another writer's lock.

export function acquireStateLock(buildDir: string): () => void {
  const lf = lockFilePath(buildDir);
  fs.mkdirSync(path.dirname(lf), { recursive: true });
  let fd: number;
  try {
    fd = fs.openSync(lf, 'wx');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new Error(`Build state is locked: ${lf} exists — another writer holds it`);
    }
    throw err;
  }
  fs.writeFileSync(fd, `${process.pid} ${new Date().toISOString()}\n`);
  fs.closeSync(fd);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    try { fs.unlinkSync(lf); } catch { /* already gone */ }
  };
}

// ── Create new build job ──────────────────────────────────────

export function createBuildJob(params: {
  client_id: string;
  client_slug: string;
  mockup_reference: string;
  manifest_reference: string;
  build_dir: string;
  input_mode?: 'supplied-pack' | 'legacy';
}): BuildState {
  const build_id = generateBuildId(params.client_slug);
  const state = createInitialBuildState({
    build_id,
    client_id: params.client_id,
    client_slug: params.client_slug,
    mockup_reference: params.mockup_reference,
    manifest_reference: params.manifest_reference,
    build_dir: params.build_dir,
    input_mode: params.input_mode,
  });

  const dirs = [
    params.build_dir,
    path.join(params.build_dir, 'input'),
    path.join(params.build_dir, 'artifacts'),
    path.join(params.build_dir, 'artifacts', 'regions'),
    path.join(params.build_dir, 'artifacts', 'assets-raw'),
    path.join(params.build_dir, 'state'),
  ];
  for (const d of dirs) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }

  writeBuildState(state);
  return state;
}

// ── Update operator state ─────────────────────────────────────

export function setOperatorStatus(
  state: BuildState,
  operatorId: OperatorId,
  status: OperatorStatus,
  options?: {
    artifactPath?: string;
    failureReason?: string;
    notes?: string;
    evidence?: { source_revision?: string; input_sha256?: string };
    expectedUpdatedAt?: string;
    allowUnreconciled?: boolean; // internal use only (reconcile itself)
  },
): BuildState {
  if (!OPERATOR_IDS.includes(operatorId)) {
    throw new Error(`Unknown operator: ${operatorId}`);
  }
  if (!options?.allowUnreconciled) {
    const reason = stateNeedsReconciliation(state);
    if (reason) {
      throw new Error(
        `Refusing to mutate unreconciled state (${reason}). ` +
        `Run: factory reconcile ${state.build_dir}`,
      );
    }
  }
  if (status === 'supplied' && operatorId !== 'asset-reconstruction') {
    throw new Error(`'supplied' status is only valid on asset-reconstruction`);
  }

  const op = state.operators[operatorId];
  const now = new Date().toISOString();

  op.status = status;
  if (status === 'in_progress' && !op.started_at) {
    op.started_at = now;
  }
  if (status === 'passed' || status === 'failed' || status === 'skipped' ||
      status === 'escalated' || status === 'supplied') {
    op.completed_at = now;
  }
  if (options?.artifactPath) op.artifact_path = options.artifactPath;
  if (options?.failureReason) op.failure_reason = options.failureReason;
  if (options?.notes) op.notes = options.notes;
  if (options?.evidence) op.evidence = { ...op.evidence, ...options.evidence };
  if (status === 'failed') op.retry_count++;

  // Update overall state
  if (status === 'passed' || status === 'supplied' || status === 'skipped') {
    state.last_completed_operator = operatorId;
    state.current_operator = null;
    state.failure_state = null;
  } else if (status === 'in_progress') {
    state.current_operator = operatorId;
  } else if (status === 'failed' || status === 'escalated') {
    state.current_operator = operatorId;
    state.failure_state = `${operatorId}: ${options?.failureReason ?? 'failed'}`;
  }

  writeBuildState(state, { expectedUpdatedAt: options?.expectedUpdatedAt });
  return state;
}

// ── Visual QA loop helpers ────────────────────────────────────

export function incrementVisualQALoop(state: BuildState, expectedUpdatedAt?: string): BuildState {
  state.visual_qa_loop.iteration++;
  writeBuildState(state, { expectedUpdatedAt });
  return state;
}

export function setVisualQAPassed(
  state: BuildState,
  passed: boolean,
  discrepancyCount: number,
  expectedUpdatedAt?: string,
): BuildState {
  state.visual_qa_loop.passed = passed;
  state.visual_qa_loop.last_discrepancy_count = discrepancyCount;
  writeBuildState(state, { expectedUpdatedAt });
  return state;
}

// ── Internal pages helpers ────────────────────────────────────

export function setInternalPages(state: BuildState, pages: InternalPageStateInput[]): BuildState {
  state.internal_pages = pages.map(p => ({
    page_id: p.page_id,
    page_name: p.page_name,
    mockup_reference: p.mockup_reference,
    status: 'pending',
    qa_iterations: 0,
  }));
  writeBuildState(state);
  return state;
}

interface InternalPageStateInput {
  page_id: string;
  page_name: string;
  mockup_reference: string;
}

// ── Reconcile ─────────────────────────────────────────────────
// Explicit one-way migration for legacy build states. Validates the
// shape, preserves the original verbatim as build-state.legacy.json
// (never overwrites it), inserts missing new stages as pending, and
// resets unsupported or evidence-free statuses to pending with notes.
// It NEVER marks historical work passed by inference.

export function reconcileBuildState(buildDir: string): {
  reconciled: boolean;
  preservedTo?: string;
  resets: string[];
  notes: string[];
} {
  const sf = stateFilePath(buildDir);
  if (!fs.existsSync(sf)) {
    throw new Error(`No build state found at ${sf}`);
  }
  const raw = JSON.parse(fs.readFileSync(sf, 'utf-8')) as unknown;
  const errors = validateStateShape(raw);
  if (errors.length > 0) {
    throw new Error(`Cannot reconcile corrupt state:\n  ${errors.join('\n  ')}`);
  }
  const state = raw as BuildState;

  const why = stateNeedsReconciliation(state);
  if (!why) {
    return { reconciled: false, resets: [], notes: ['state already current — nothing to reconcile'] };
  }

  const legacyPath = legacyStateFilePath(buildDir);
  if (fs.existsSync(legacyPath)) {
    throw new Error(`Legacy state already preserved at ${legacyPath} — refusing to overwrite`);
  }

  const resets: string[] = [];
  const notes: string[] = [];
  const now = new Date().toISOString();

  // Insert any missing operator entries as pending
  for (const id of OPERATOR_IDS) {
    if (!state.operators[id]) {
      state.operators[id] = {
        status: 'pending',
        retry_count: 0,
        notes: `inserted by reconcile ${now}`,
      };
      notes.push(`inserted missing stage '${id}' as pending`);
    }
  }

  // Reset unsupported or evidence-free statuses. 'supplied' outside its
  // single legal use is treated as unsupported.
  for (const id of OPERATOR_IDS) {
    const op = state.operators[id];
    const legalSupplied = op.status === 'supplied' &&
      id === 'asset-reconstruction' &&
      (state.input_mode === 'supplied-pack');

    if (!KNOWN_STATUSES.has(op.status) || (op.status === 'supplied' && !legalSupplied)) {
      resets.push(`${id}: '${op.status}' → pending (unsupported status)`);
      op.status = 'pending';
      op.notes = `reset by reconcile ${now}: unsupported status`;
      delete op.completed_at;
      continue;
    }
    if (op.status === 'passed' || op.status === 'skipped') {
      const artifactRel = op.artifact_path;
      const artifactOk = typeof artifactRel === 'string' &&
        fs.existsSync(path.join(buildDir, artifactRel));
      if (!artifactOk) {
        resets.push(`${id}: '${op.status}' → pending (no artifact evidence)`);
        op.status = 'pending';
        op.notes = `reset by reconcile ${now}: ${op.status} without artifact evidence`;
        delete op.completed_at;
      }
    }
  }

  // Top-level v2 fields
  state.schema_version = 2;
  if (state.input_mode !== 'supplied-pack' && state.input_mode !== 'legacy') {
    state.input_mode = 'legacy';
    notes.push('input_mode unset — recorded as legacy');
  }
  if (typeof state.authorizations !== 'object' || state.authorizations === null) {
    state.authorizations = { cms: false, deployment: false };
  } else {
    state.authorizations = {
      cms: state.authorizations.cms === true,
      deployment: state.authorizations.deployment === true,
    };
  }
  if (!Array.isArray(state.authorization_log)) state.authorization_log = [];
  if (!Array.isArray(state.internal_pages)) state.internal_pages = [];

  // Source revision: fingerprint what exists now; empty string when the
  // build dir has no covered source yet.
  try {
    state.source_revision = fingerprintSource(buildDir);
  } catch {
    state.source_revision = '';
  }

  // Recompute overall pointers conservatively
  state.current_operator = null;
  state.last_completed_operator = null;
  for (let i = OPERATOR_IDS.length - 1; i >= 0; i--) {
    const st = state.operators[OPERATOR_IDS[i]!].status;
    if (st === 'passed' || st === 'skipped' || st === 'supplied') {
      state.last_completed_operator = OPERATOR_IDS[i]!;
      break;
    }
  }
  state.failure_state = null;

  // Preserve the original BEFORE writing the reconciled state
  fs.copyFileSync(sf, legacyPath);
  writeBuildState(state);

  return { reconciled: true, preservedTo: legacyPath, resets, notes };
}

// ── Resume ────────────────────────────────────────────────────

export function resumeBuild(buildDir: string): BuildState {
  const state = readBuildState(buildDir);
  if (!state) {
    throw new Error(`No build state found at ${stateFilePath(buildDir)}`);
  }
  return state;
}

// ── Status summary ────────────────────────────────────────────

export function statusSummary(state: BuildState): string {
  const lines: string[] = [];
  lines.push(`Build: ${state.build_id}`);
  lines.push(`Client: ${state.client_slug}`);
  lines.push(`Input mode: ${state.input_mode ?? 'legacy (pre-v2)'}`);
  lines.push(`Schema: v${state.schema_version ?? 1}`);
  lines.push(`Source revision: ${state.source_revision || '(none recorded)'}`);
  lines.push(`Authorisations: cms=${state.authorizations?.cms === true} deployment=${state.authorizations?.deployment === true}`);
  lines.push(`Created: ${state.created_at}`);
  lines.push(`Updated: ${state.updated_at}`);
  lines.push('');

  if (state.failure_state) {
    lines.push(`FAILURE: ${state.failure_state}`);
    lines.push('');
  }

  lines.push('Operators:');
  for (const id of OPERATOR_IDS) {
    const op = state.operators[id];
    if (!op) {
      lines.push(`  ? [--] ${id.padEnd(24)} (missing — reconcile needed)`);
      continue;
    }
    const icon =
      op.status === 'passed' ? '✓' :
      op.status === 'failed' ? '✗' :
      op.status === 'in_progress' ? '→' :
      op.status === 'skipped' ? '–' :
      op.status === 'supplied' ? '≈' :
      op.status === 'escalated' ? '!' :
      '·';
    const num = OPERATOR_IDS.indexOf(id).toString().padStart(2, '0');
    lines.push(`  ${icon} [${num}] ${id.padEnd(24)} ${op.status}`);
    if (op.failure_reason) lines.push(`      └ ${op.failure_reason}`);
    if (op.notes) lines.push(`      └ ${op.notes}`);
  }

  if (state.visual_qa_loop.iteration > 0) {
    lines.push('');
    lines.push(`Visual QA loop: iteration ${state.visual_qa_loop.iteration}/${state.visual_qa_loop.max_iterations}, ${state.visual_qa_loop.passed ? 'PASSED' : 'in progress'}`);
  }

  if (state.internal_pages.length > 0) {
    lines.push('');
    lines.push(`Internal pages: ${state.internal_pages.length}`);
    for (const p of state.internal_pages) {
      lines.push(`  ${p.page_id.padEnd(20)} ${p.status}`);
    }
  }

  if (state.deployment_url) {
    lines.push('');
    lines.push(`Deployed: ${state.deployment_url}`);
  }

  return lines.join('\n');
}

// ── Build ID generator ────────────────────────────────────────

function generateBuildId(clientSlug: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6);
  return `${clientSlug}-${date}-${rand}`;
}
