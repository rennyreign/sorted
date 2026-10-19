#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Sorted Factory Orchestrator — CLI
//
// Commands:
//   init-pack <pack-dir> <slug> --build-dir <dir> [--mockup <rel>]
//             [--design-ir <rel>] [--manifest <rel>]
//             [--template <dir>] [--dry-run]
//   init <mockup> <manifest> <client-slug> [--build-dir <dir>]  (legacy intake)
//   register-assets <build-dir>
//   status [build-dir]        resume [build-dir]    next [build-dir]
//   fingerprint <build-dir>
//   start <operator-id> <build-dir>
//   mark-passed <operator-id> <build-dir> [--artifact <rel>]
//                 [--human-approval --reviewer <name>]
//   mark-failed <operator-id> <build-dir> [reason]
//   mark-skipped <operator-id> <build-dir> [--reason <text>]
//   invalidate <build-dir> --from <operator-id> --reason <text>
//   authorize <build-dir> cms|deployment --by <name> --reason <text>
//   reconcile <build-dir>
//   list-operators
//
// Exit codes: 0 ok/complete · 1 error · 2 blocked (next/resume).
// The orchestrator manages state only. The harness executes
// harness-mode operators; standalone operators run their own CLIs.
// ─────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import {
  readBuildState,
  writeBuildState,
  createBuildJob,
  statusSummary,
  setOperatorStatus,
  acquireStateLock,
  reconcileBuildState,
  incrementVisualQALoop,
  setVisualQAPassed,
  artifactPath,
} from './state-manager.js';
import {
  OPERATORS,
  OPERATOR_IDS,
  OPERATOR_SEQUENCE,
  getNextAction,
  getOperatorMeta,
  isTerminalStatus,
  stateNeedsReconciliation,
  EDIT_STAGES,
  EVIDENCE_STAGES,
  SKIPPABLE_OPERATORS,
  type OperatorId,
  type BuildState,
} from './state.js';
import { fingerprintSource } from './revision.js';
import { initPack, SLUG_RE } from './pack-intake.js';
import { registerAssets } from './registry.js';
import {
  validateArtifact,
  validateWorkspaceBrief,
  currentFingerprint,
  siteRoot,
} from './artifact-checks.js';

const args = process.argv.slice(2);
const command = args[0];

// ── Small arg helpers ─────────────────────────────────────────

function flag(name: string): string | undefined {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : undefined;
}
function hasFlag(name: string): boolean {
  return args.includes(name);
}
class CliError extends Error {
  constructor(msg: string, public code = 1) { super(msg); }
}
function die(msg: string, code = 1): never {
  throw new CliError(msg, code);
}
// Flags that take no value — don't consume the following token.
const BOOLEAN_FLAGS = new Set(['--dry-run', '--human-approval', '--verbose', '--help']);
function getPositionals(): string[] {
  const out: string[] = [];
  for (let i = 1; i < args.length; i++) {
    const a = args[i]!;
    if (a.startsWith('--')) {
      if (!BOOLEAN_FLAGS.has(a)) i++; // skip flag + its value
      continue;
    }
    out.push(a);
  }
  return out;
}

// ── Shared guards ─────────────────────────────────────────────

function loadState(buildDir: string): BuildState {
  const state = readBuildState(buildDir);
  if (!state) die(`No build state found at ${buildDir}`);
  return state;
}

function requireValidOperator(id: string | undefined): OperatorId {
  if (!id || !(OPERATOR_IDS as readonly string[]).includes(id)) {
    die(`Unknown operator: ${id ?? '(missing)'}\nValid operators: ${OPERATOR_IDS.join(', ')}`);
  }
  return id as OperatorId;
}

// Detect source drift: the site source changed since the last verified
// revision while no edit stage is running. Returns a block reason or null.
function driftBlockReason(state: BuildState): string | null {
  if (!state.source_revision) return null;
  const runningEdit = OPERATOR_SEQUENCE.find(
    id => state.operators[id]?.status === 'in_progress' && EDIT_STAGES.has(id),
  );
  if (runningEdit) return null;
  let current: string;
  try {
    current = currentFingerprint(state);
  } catch (err) {
    return `cannot fingerprint source: ${(err as Error).message}`;
  }
  if (current === state.source_revision) return null;
  const stale = OPERATOR_SEQUENCE.filter(
    id => state.operators[id]?.status === 'passed' &&
      EVIDENCE_STAGES.has(id) &&
      state.operators[id].evidence?.source_revision !== current,
  );
  const firstStale = stale[0] ?? 'visual-qa';
  return (
    `source changed outside a running edit stage (verified revision ` +
    `${state.source_revision.slice(0, 12)}… ≠ current ${current.slice(0, 12)}…). ` +
    `Stale evidence: ${stale.join(', ') || 'none recorded'}. ` +
    `Run: factory invalidate ${state.build_dir} --from ${firstStale} --reason "source changed" ` +
    `and re-run QA — prior QA is not silently accepted.`
  );
}

// ── Commands ──────────────────────────────────────────────────

function cmdInitPack() {
  const pos = getPositionals();
  const packDir = pos[0];
  const slug = pos[1];
  if (!packDir || !slug) {
    die('Usage: factory init-pack <pack-dir> <slug> --build-dir <dir> [--mockup <rel>] [--design-ir <rel>] [--manifest <rel>] [--template <dir>] [--dry-run]');
  }
  const buildDir = flag('--build-dir') ?? `builds/${slug}`;
  const result = initPack({
    packDir,
    slug,
    buildDir,
    mockup: flag('--mockup'),
    designIr: flag('--design-ir'),
    manifest: flag('--manifest'),
    templateDir: flag('--template'),
    dryRun: hasFlag('--dry-run'),
  });
  if (hasFlag('--dry-run')) {
    console.log(JSON.stringify({ dry_run: true, plan: result.plan, contract: result.contract }, null, 2));
    return;
  }
  const state = result.state!;
  console.log(`\nBuild initialised from supplied pack: ${state.build_id}`);
  console.log(`  Client: ${state.client_slug}`);
  console.log(`  Build dir: ${state.build_dir}`);
  console.log(`  Mockup: ${result.contract.mockup.path}`);
  console.log(`  Design IR: ${result.contract.design_ir.path}`);
  console.log(`  Assets resolved: ${result.plan.assetCount}`);
  for (const w of result.contract.warnings) console.log(`  warning: ${w}`);
  const next = getNextAction(state);
  console.log(`\nNext: ${next.kind === 'operator' ? next.operator_id : next.kind} ${next.reason ?? ''}`);
}

function cmdInit() {
  // Legacy intake: explicit mockup + manifest files.
  const pos = getPositionals();
  const mockup = pos[0];
  const manifest = pos[1];
  const clientSlug = pos[2];

  if (!mockup || !manifest || !clientSlug) {
    die('Usage: factory init <mockup> <manifest> <client-slug> [--build-dir <dir>]');
  }
  if (!SLUG_RE.test(clientSlug)) {
    die(`Invalid client slug '${clientSlug}' — must match ${SLUG_RE}`);
  }

  const buildDir = path.resolve(flag('--build-dir') ?? `builds/${clientSlug}`);
  if (fs.existsSync(buildDir)) {
    die(`Build directory already exists: ${buildDir} — init requires a fresh directory`);
  }

  const mockupAbs = path.resolve(mockup);
  const manifestAbs = path.resolve(manifest);
  if (!fs.existsSync(mockupAbs)) die(`Mockup not found: ${mockupAbs}`);
  if (!fs.existsSync(manifestAbs)) die(`Manifest not found: ${manifestAbs}`);

  console.log('Intake mode: legacy (explicit mockup + manifest)');

  const state = createBuildJob({
    client_id: clientSlug,
    client_slug: clientSlug,
    mockup_reference: 'input/approved-mockup.png',
    manifest_reference: 'input/image-manifest.json',
    build_dir: buildDir,
    input_mode: 'legacy',
  });

  const inputDir = path.join(state.build_dir, 'input');
  fs.copyFileSync(mockupAbs, path.join(inputDir, 'approved-mockup.png'));
  fs.copyFileSync(manifestAbs, path.join(inputDir, 'image-manifest.json'));

  const sha = (p: string) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  const contract = {
    schema_version: 1,
    input_mode: 'legacy',
    client_slug: clientSlug,
    producer: 'legacy',
    mockup: { path: 'input/approved-mockup.png', sha256: sha(path.join(inputDir, 'approved-mockup.png')) },
    design_ir: { path: 'input/image-manifest.json', sha256: sha(path.join(inputDir, 'image-manifest.json')) },
    files: [
      { path: 'input/approved-mockup.png', sha256: sha(path.join(inputDir, 'approved-mockup.png')), source_path: mockupAbs },
      { path: 'input/image-manifest.json', sha256: sha(path.join(inputDir, 'image-manifest.json')), source_path: manifestAbs },
    ],
    assets: [],
    warnings: [],
    conflicts: [],
    created_at: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(state.build_dir, 'artifacts', 'input-contract.json'),
    JSON.stringify(contract, null, 2),
    'utf-8',
  );
  // source_revision is bound by the first evidence pass
  // (frontend-build), not at intake.
  writeBuildState(state);

  console.log(`\nBuild initialised: ${state.build_id}`);
  console.log(`  Client: ${state.client_slug}`);
  console.log(`  Build dir: ${state.build_dir}`);
  const next = getNextAction(state);
  console.log(`\nNext: ${next.kind === 'operator' ? next.operator_id : next.kind} ${next.reason ?? ''}`);
}

async function cmdRegisterAssets() {
  const buildDir = getPositionals()[0] ?? findBuildDir();
  if (!buildDir) die('Usage: factory register-assets <build-dir>');
  const release = acquireStateLock(buildDir);
  try {
    const state = loadState(buildDir);
    const why = stateNeedsReconciliation(state);
    if (why) die(`State requires reconciliation (${why}) — run: factory reconcile ${buildDir}`);
    const expected = state.updated_at;
    const result = await registerAssets(buildDir);
    const fresh = loadState(buildDir);
    fresh.operators['asset-registry'].status = 'passed';
    fresh.operators['asset-registry'].completed_at = new Date().toISOString();
    fresh.operators['asset-registry'].artifact_path = 'artifacts/asset-registry.json';
    fresh.last_completed_operator = 'asset-registry';
    writeBuildState(fresh, { expectedUpdatedAt: expected });
    console.log(`Asset registry written: ${result.registryPath}`);
    console.log(`  Assets: ${result.assets.length}`);
    for (const w of result.warnings) console.log(`  warning: ${w}`);
  } finally {
    release();
  }
}

function cmdFingerprint() {
  const buildDir = getPositionals()[0];
  if (!buildDir) die('Usage: factory fingerprint <build-dir>');
  process.stdout.write(fingerprintSource(buildDir) + '\n');
}

function cmdReconcile() {
  const buildDir = getPositionals()[0];
  if (!buildDir) die('Usage: factory reconcile <build-dir>');
  const release = acquireStateLock(buildDir);
  try {
    const res = reconcileBuildState(buildDir);
    if (!res.reconciled) {
      console.log('Nothing to reconcile — state already current.');
      return;
    }
    console.log(`Reconciled. Original preserved at ${res.preservedTo}`);
    for (const r of res.resets) console.log(`  reset: ${r}`);
    for (const n of res.notes) console.log(`  note: ${n}`);
  } finally {
    release();
  }
}

function cmdStatus() {
  const buildDir = getPositionals()[0] || findBuildDir();
  if (!buildDir) die('No build directory specified. Usage: factory status <build-dir>');
  const state = loadState(buildDir);
  console.log(statusSummary(state));
  const why = stateNeedsReconciliation(state);
  if (why) {
    console.log(`\nRECONCILIATION REQUIRED: ${why}`);
    console.log(`Run: factory reconcile ${buildDir}`);
    return;
  }
  const drift = driftBlockReason(state);
  if (drift) console.log(`\nBLOCKED: ${drift}`);
}

function printAction(state: BuildState) {
  const drift = driftBlockReason(state);
  if (drift) {
    console.log(`Blocked: ${drift}`);
    process.exit(2);
  }
  const action = getNextAction(state);
  if (action.kind === 'operator') {
    const meta = getOperatorMeta(action.operator_id!);
    console.log(`Next: [${meta.number}] ${meta.name} (${meta.id})`);
    console.log(`  Execution: ${meta.execution}`);
    console.log(`  Skill: operators/skills/${meta.skillFile}`);
    console.log(`  Output: artifacts/${meta.outputArtifact}`);
    process.exit(0);
  }
  if (action.kind === 'complete') {
    console.log('Build complete — all operators satisfied.');
    process.exit(0);
  }
  console.log(`Blocked: ${action.reason}`);
  process.exit(2);
}

function cmdNext() {
  const buildDir = getPositionals()[0] || findBuildDir();
  if (!buildDir) die('Usage: factory next <build-dir>');
  printAction(loadState(buildDir));
}

// Runs `pnpm install` in the build dir when node_modules is absent.
// Uses --frozen-lockfile when a pnpm lockfile exists. Fails loudly so
// a missing install never reaches the build step. Skips silently when
// deps are already installed.
function ensureDependencies(buildDir: string): void {
  if (fs.existsSync(path.join(buildDir, 'node_modules'))) return;
  const hasLockfile = fs.existsSync(path.join(buildDir, 'pnpm-lock.yaml'));
  const pnpmArgs = hasLockfile ? ['install', '--frozen-lockfile'] : ['install'];
  console.log(`frontend-build: node_modules missing — running pnpm ${pnpmArgs.join(' ')} in ${buildDir}`);
  try {
    execFileSync('pnpm', pnpmArgs, { cwd: buildDir, stdio: 'inherit' });
  } catch {
    die(`pnpm ${pnpmArgs.join(' ')} failed in ${buildDir} — resolve dependency installation before starting frontend-build`);
  }
}

function cmdResume() {
  const buildDir = getPositionals()[0] || findBuildDir();
  if (!buildDir) die('Usage: factory resume <build-dir>');
  const state = loadState(buildDir);
  console.log(`\nResuming build: ${state.build_id}`);
  console.log(`Last completed: ${state.last_completed_operator ?? 'none'}`);
  printAction(state);
}

function cmdStart() {
  const pos = getPositionals();
  const operatorId = requireValidOperator(pos[0]);
  const buildDir = pos[1] || findBuildDir();
  if (!buildDir) die('Usage: factory start <operator-id> <build-dir>');
  const release = acquireStateLock(buildDir);
  try {
    const state = loadState(buildDir);
    const expected = state.updated_at;
    const why = stateNeedsReconciliation(state);
    if (why) die(`State requires reconciliation (${why}) — run: factory reconcile ${buildDir}`);

    if (state.operators[operatorId].status === 'in_progress') {
      die(`'${operatorId}' is already in progress — duplicate start rejected`);
    }
    const drift = driftBlockReason(state);
    if (drift) die(`Blocked: ${drift}`);

    const next = getNextAction(state);
    if (next.kind !== 'operator' || next.operator_id !== operatorId) {
      die(`Cannot start '${operatorId}': scheduler says ${next.kind}${next.operator_id ? ` (${next.operator_id})` : ''} — ${next.reason ?? 'not the next operator'}`);
    }

    // Stage-specific start gates
    if (operatorId === 'workspace-build') {
      const briefErrs = validateWorkspaceBrief(buildDir, state);
      if (briefErrs.length > 0) die(`workspace-build cannot start:\n  ${briefErrs.join('\n  ')}`);
    }
    if (operatorId === 'internal-pages' &&
        state.operators['human-assessment'].status !== 'passed') {
      die('internal-pages requires human-assessment approval first');
    }
    if (operatorId === 'cms-integration' && !state.authorizations.cms) {
      die(`cms-integration is not authorised — run: factory authorize ${buildDir} cms --by <name> --reason <text>`);
    }
    if (operatorId === 'deployment' && !state.authorizations.deployment) {
      die(`deployment is not authorised — run: factory authorize ${buildDir} deployment --by <name> --reason <text>`);
    }

    // Automatic dependency gate: a frontend build cannot pass without a
    // clean `pnpm run build`, which requires installed deps. If the
    // scaffold has no node_modules yet, install before the stage starts
    // so harnesses never hit missing-dependency failures mid-build.
    if (operatorId === 'frontend-build') {
      ensureDependencies(buildDir);
    }

    setOperatorStatus(state, operatorId, 'in_progress', { expectedUpdatedAt: expected });

    // Starting a correction attempt consumes exactly one iteration.
    if (operatorId === 'pixel-correction') {
      incrementVisualQALoop(state);
    }
    console.log(`Started ${operatorId} at ${state.operators[operatorId].started_at}`);
  } finally {
    release();
  }
}

function cmdMarkPassed() {
  const pos = getPositionals();
  const operatorId = requireValidOperator(pos[0]);
  const buildDir = pos[1] || findBuildDir();
  if (!buildDir) die('Usage: factory mark-passed <operator-id> <build-dir> [--artifact <relative>] [--human-approval --reviewer <name>]');
  const release = acquireStateLock(buildDir);
  try {
    const state = loadState(buildDir);
    const expected = state.updated_at;
    const why = stateNeedsReconciliation(state);
    if (why) die(`State requires reconciliation (${why}) — run: factory reconcile ${buildDir}`);

    const meta = getOperatorMeta(operatorId);
    const artifactRel = flag('--artifact') ?? `artifacts/${meta.outputArtifact}`;
    const artifactAbs = path.resolve(buildDir, artifactRel);
    if (!artifactAbs.startsWith(path.resolve(buildDir) + path.sep)) {
      die(`--artifact must resolve inside the build directory`);
    }
    let artifact: Record<string, unknown> | null = null;
    if (fs.existsSync(artifactAbs) && fs.statSync(artifactAbs).isFile()) {
      artifact = JSON.parse(fs.readFileSync(artifactAbs, 'utf-8')) as Record<string, unknown>;
    }

    // A pass requires a prior start — except the deterministic
    // init/registry paths which carry their own real artifacts.
    const deterministic = operatorId === 'build-init' || operatorId === 'asset-registry';
    if (!deterministic && state.operators[operatorId].status !== 'in_progress') {
      die(`Cannot mark '${operatorId}' passed — it has not been started (status: ${state.operators[operatorId].status}). Run: factory start ${operatorId} ${buildDir}`);
    }
    if (deterministic && state.operators[operatorId].status === 'passed') {
      die(`'${operatorId}' is already passed`);
    }

    // Authorisation gates
    if (operatorId === 'cms-integration' && !state.authorizations.cms) {
      die('cms-integration requires `authorize <dir> cms` first');
    }
    if (operatorId === 'deployment' && !state.authorizations.deployment) {
      die('deployment requires `authorize <dir> deployment` first');
    }
    if (operatorId === 'internal-pages' && state.operators['human-assessment'].status !== 'passed') {
      die('internal-pages requires human-assessment approval first');
    }

    const errors = validateArtifact(operatorId, {
      state,
      buildDir,
      artifact,
      artifactRel,
      flags: { humanApproval: hasFlag('--human-approval'), reviewer: flag('--reviewer') },
    });
    if (errors.length > 0) {
      die(`Artifact validation failed for ${operatorId}:\n  ${errors.join('\n  ')}`);
    }

    const evidence = artifact
      ? {
          source_revision: artifact['source_revision'] as string | undefined,
          input_sha256: artifact['input_sha256'] as string | undefined,
        }
      : undefined;

    setOperatorStatus(state, operatorId, 'passed', {
      artifactPath: artifactRel,
      evidence,
      expectedUpdatedAt: expected,
    });

    // A passing evidence artifact certifies the source it measured —
    // advance the verified revision to it.
    if (evidence?.source_revision) {
      state.source_revision = evidence.source_revision;
      state.site_repo_path = siteRoot(state);
    }

    // Loop bookkeeping
    if (operatorId === 'human-vision-qa' && artifact) {
      const disc = Array.isArray(artifact['discrepancies']) ? artifact['discrepancies'].length : 0;
      setVisualQAPassed(state, true, disc);
    }
    if (operatorId === 'visual-qa' && artifact) {
      const disc = Array.isArray(artifact['discrepancies']) ? artifact['discrepancies'].length : 0;
      state.visual_qa_loop.last_discrepancy_count = disc;
    }
    if (operatorId === 'pixel-correction') {
      // Correction applied — both QA gates must re-verify fresh.
      for (const id of ['visual-qa', 'human-vision-qa'] as OperatorId[]) {
        state.operators[id].status = 'pending';
        delete state.operators[id].completed_at;
        delete state.operators[id].evidence;
        state.operators[id].notes = 'reset after pixel-correction — requires fresh verification';
      }
      state.visual_qa_loop.passed = false;
    }
    writeBuildState(state);

    const next = getNextAction(state);
    console.log(`Marked ${operatorId} as passed.`);
    console.log(`Next: ${next.kind === 'operator' ? next.operator_id : next.kind}${next.reason ? ` — ${next.reason}` : ''}`);
  } finally {
    release();
  }
}

function cmdMarkFailed() {
  const pos = getPositionals();
  const operatorId = requireValidOperator(pos[0]);
  const buildDir = pos[1] || findBuildDir();
  if (!buildDir) die('Usage: factory mark-failed <operator-id> <build-dir> [reason]');
  const reason = flag('--reason') ?? pos[2] ?? 'manual failure';
  const release = acquireStateLock(buildDir);
  try {
    const state = loadState(buildDir);
    const expected = state.updated_at;
    const why = stateNeedsReconciliation(state);
    if (why) die(`State requires reconciliation (${why}) — run: factory reconcile ${buildDir}`);
    if (state.operators[operatorId].status !== 'in_progress') {
      die(`Cannot mark '${operatorId}' failed — it is not in progress (status: ${state.operators[operatorId].status})`);
    }
    setOperatorStatus(state, operatorId, 'failed', { failureReason: reason, expectedUpdatedAt: expected });
    console.log(`Marked ${operatorId} as failed: ${reason}`);
    const next = getNextAction(state);
    console.log(`Next: ${next.kind === 'operator' ? next.operator_id : next.kind}${next.reason ? ` — ${next.reason}` : ''}`);
  } finally {
    release();
  }
}

function cmdMarkSkipped() {
  const pos = getPositionals();
  const operatorId = requireValidOperator(pos[0]);
  const buildDir = pos[1] || findBuildDir();
  if (!buildDir) die('Usage: factory mark-skipped <operator-id> <build-dir> [--reason <text>]');
  const reason = flag('--reason') ?? 'manual skip';
  if (!SKIPPABLE_OPERATORS.has(operatorId)) {
    die(`'${operatorId}' can never be skipped — only: ${[...SKIPPABLE_OPERATORS].join(', ')}`);
  }
  const release = acquireStateLock(buildDir);
  try {
    const state = loadState(buildDir);
    const expected = state.updated_at;
    const why = stateNeedsReconciliation(state);
    if (why) die(`State requires reconciliation (${why}) — run: factory reconcile ${buildDir}`);

    if (operatorId === 'pixel-correction') {
      if (!(state.visual_qa_loop.passed === true && state.visual_qa_loop.last_discrepancy_count === 0)) {
        die('pixel-correction may only be skipped when vision QA passed with zero discrepancies');
      }
    }
    if (operatorId === 'internal-pages') {
      // Requires an explicit no-pages artifact
      const p = artifactPath(buildDir, 'internal-pages.json');
      let ok = false;
      if (fs.existsSync(p)) {
        const a = JSON.parse(fs.readFileSync(p, 'utf-8')) as Record<string, unknown>;
        ok = Array.isArray(a['pages']) && (a['pages'] as unknown[]).length === 0 && a['all_passed'] === true;
      }
      if (!ok) die('internal-pages skip requires artifacts/internal-pages.json with {pages: [], all_passed: true}');
    }
    setOperatorStatus(state, operatorId, 'skipped', { notes: reason, expectedUpdatedAt: expected });
    console.log(`Marked ${operatorId} as skipped: ${reason}`);
  } finally {
    release();
  }
}

function cmdInvalidate() {
  const pos = getPositionals();
  const buildDir = pos[0] || findBuildDir();
  if (!buildDir) die('Usage: factory invalidate <build-dir> --from <operator-id> --reason <text>');
  const from = requireValidOperator(flag('--from'));
  const reason = flag('--reason');
  if (!reason) die('invalidate requires --reason <text>');
  const release = acquireStateLock(buildDir);
  try {
    const state = loadState(buildDir);
    const expected = state.updated_at;
    const why = stateNeedsReconciliation(state);
    if (why) die(`State requires reconciliation (${why}) — run: factory reconcile ${buildDir}`);

    const fromIdx = OPERATOR_SEQUENCE.indexOf(from);
    const cleared: string[] = [];
    for (let i = fromIdx; i < OPERATOR_SEQUENCE.length; i++) {
      const id = OPERATOR_SEQUENCE[i]!;
      const op = state.operators[id];
      if (op.status === 'passed' || op.status === 'skipped') {
        op.status = 'pending';
        delete op.completed_at;
        delete op.evidence;
        delete op.artifact_path;
        op.notes = `invalidated (${reason}) — artifact files preserved on disk`;
        cleared.push(id);
      }
    }
    // Invalidating into the QA loop clears the recorded pass so
    // pixel-correction is not treated as satisfied by stale evidence.
    if (cleared.includes('visual-qa') || cleared.includes('human-vision-qa')) {
      state.visual_qa_loop.passed = false;
      state.visual_qa_loop.last_discrepancy_count = 0;
    }
    // Approvals are part of the cleared range's evidence
    if (OPERATOR_SEQUENCE.indexOf('human-assessment') >= fromIdx &&
        cleared.includes('human-assessment')) {
      state.authorizations = { cms: false, deployment: false };
      state.authorization_log.push({
        target: 'cms',
        by: 'system',
        reason: `authorisations cleared by invalidate --from ${from}: ${reason}`,
        at: new Date().toISOString(),
      });
    }
    // The current source becomes the baseline that fresh evidence must
    // match — invalidation acknowledges the changed files; it does NOT
    // mark anything passed.
    try {
      state.source_revision = fingerprintSource(siteRoot(state));
    } catch {
      state.source_revision = '';
    }
    state.last_completed_operator = null;
    for (let i = OPERATOR_SEQUENCE.length - 1; i >= 0; i--) {
      if (isTerminalStatus(state.operators[OPERATOR_IDS[i]!].status)) {
        state.last_completed_operator = OPERATOR_IDS[i]!;
        break;
      }
    }
    state.failure_state = null;
    writeBuildState(state, { expectedUpdatedAt: expected });
    console.log(`Invalidated from '${from}': reset ${cleared.length ? cleared.join(', ') : 'nothing (no passes downstream)'}`);
  } finally {
    release();
  }
}

function cmdAuthorize() {
  const pos = getPositionals();
  const buildDir = pos[0] || findBuildDir();
  const target = flag('--target') ?? pos[1];
  if (!buildDir || !target || !['cms', 'deployment'].includes(target)) {
    die('Usage: factory authorize <build-dir> cms|deployment --by <name> --reason <text>');
  }
  const by = flag('--by');
  const reason = flag('--reason');
  if (!by || !reason) die('authorize requires --by <name> and --reason <text>');
  const release = acquireStateLock(buildDir);
  try {
    const state = loadState(buildDir);
    const expected = state.updated_at;
    const why = stateNeedsReconciliation(state);
    if (why) die(`State requires reconciliation (${why}) — run: factory reconcile ${buildDir}`);
    if (state.operators['human-assessment'].status !== 'passed') {
      die('authorisation requires human-assessment approval first');
    }
    state.authorizations[target as 'cms' | 'deployment'] = true;
    state.authorization_log.push({
      target: target as 'cms' | 'deployment',
      by,
      reason,
      at: new Date().toISOString(),
    });
    writeBuildState(state, { expectedUpdatedAt: expected });
    console.log(`Authorised ${target} for ${state.build_id} by ${by}: ${reason}`);
    console.log('(local permission record only — no remote action executed)');
  } finally {
    release();
  }
}

function cmdListOperators() {
  console.log('\nSorted Website Manufacturing Line — Operators\n');
  for (const op of OPERATORS) {
    const num = op.number.toString().padStart(2, '0');
    const exec = op.execution === 'standalone' ? '[standalone]' : '[harness]';
    console.log(`  ${num}  ${op.name.padEnd(28)} ${exec.padEnd(13)} ${op.description}`);
  }
  console.log('');
}

// ── Helpers ───────────────────────────────────────────────────

function findBuildDir(): string | null {
  const buildsDir = path.resolve('builds');
  if (fs.existsSync(buildsDir)) {
    const entries = fs.readdirSync(buildsDir, { withFileTypes: true });
    const dirs = entries.filter((e: fs.Dirent) => e.isDirectory()).map((e: fs.Dirent) => path.join(buildsDir, e.name));
    if (dirs.length === 1) return dirs[0];
    if (dirs.length > 1) {
      let mostRecent: string | null = null;
      let mostRecentTime = 0;
      for (const d of dirs) {
        const sf = path.join(d, 'state', 'build-state.json');
        if (fs.existsSync(sf)) {
          const stat = fs.statSync(sf);
          if (stat.mtimeMs > mostRecentTime) {
            mostRecentTime = stat.mtimeMs;
            mostRecent = d;
          }
        }
      }
      return mostRecent;
    }
  }
  return null;
}

// ── Dispatch ──────────────────────────────────────────────────

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

async function main() {
  switch (command) {
    case 'init-pack': cmdInitPack(); break;
    case 'init': cmdInit(); break;
    case 'register-assets': await cmdRegisterAssets(); break;
    case 'fingerprint': cmdFingerprint(); break;
    case 'reconcile': cmdReconcile(); break;
    case 'status': cmdStatus(); break;
    case 'resume': cmdResume(); break;
    case 'next': cmdNext(); break;
    case 'start': cmdStart(); break;
    case 'mark-passed': cmdMarkPassed(); break;
    case 'mark-failed': cmdMarkFailed(); break;
    case 'mark-skipped': cmdMarkSkipped(); break;
    case 'invalidate': cmdInvalidate(); break;
    case 'authorize': cmdAuthorize(); break;
    case 'list-operators': cmdListOperators(); break;
    case undefined:
    case '--help':
    case '-h':
    case 'help':
      console.log(`
Sorted Factory Orchestrator

Intake:
  init-pack <pack-dir> <slug> --build-dir <dir> [options]
      Initialise a job from a supplied pack (approved mockup + raw
      design IR + assets). --dry-run validates without writing.
  init <mockup> <manifest> <client-slug> [--build-dir <dir>]
      Legacy intake — explicit mockup + image manifest files.

Inspection:
  status|resume|next [build-dir]   (next/resume exit 2 when blocked)
  fingerprint <build-dir>          print source fingerprint only
  list-operators

Execution state:
  start <op> <dir>                      begin an operator (stamps time)
  mark-passed <op> <dir> [--artifact <rel>] [--human-approval --reviewer <n>]
  mark-failed <op> <dir> [reason]
  mark-skipped <op> <dir> [--reason]    mockup-regions / pixel-correction /
                                      internal-pages only
  invalidate <dir> --from <op> --reason <t>
  authorize <dir> cms|deployment --by <n> --reason <t>
  reconcile <dir>                       one-way legacy state migration
  register-assets <dir>                 deterministic supplied-asset registry

The orchestrator manages state only; it never calls models or remotes.
`);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "factory help" for usage.');
      process.exit(1);
  }
}

if (isMain !== false) {
  main().catch(err => {
    console.error(`ERROR: ${(err as Error).message}`);
    process.exit(err instanceof CliError ? err.code : 1);
  });
}
