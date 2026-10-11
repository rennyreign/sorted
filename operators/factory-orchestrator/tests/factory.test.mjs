// Factory orchestrator — phase A tests.
// Disposable tmpdirs only; drives the compiled CLI via node and the
// pure scheduler via dist/state.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(HERE, '..', 'dist', 'cli.js');
const stateMod = await import(path.join(HERE, '..', 'dist', 'state.js'));
const { createInitialBuildState, getNextAction, getNextOperator, OPERATOR_IDS } = stateMod;
const mgr = await import(path.join(HERE, '..', 'dist', 'state-manager.js'));

// ── fixtures ─────────────────────────────────────────────────

const PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const PNG = Buffer.from(PNG_B64, 'base64');

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'factory-test-'));
}

function runCli(argv, opts = {}) {
  const r = spawnSync('node', [CLI, ...argv], { encoding: 'utf8', ...opts });
  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function designIr(assets = [{ asset_id: 'hero-img', file: 'hero.png', required: true }]) {
  return {
    page_type: 'local-service',
    sections: [{ id: 'hero', type: 'hero', position: 1, label: 'Hero' }],
    copy: [{ section: 'hero', type: 'headline', text: 'Hello' }],
    tokens: { accent: '#123456' },
    assets,
  };
}

function makePack(dir, { mockup = 'approved-mockup.png', ir = designIr(), extra = {} } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, mockup), PNG);
  fs.writeFileSync(path.join(dir, 'design-ir.json'), JSON.stringify(ir, null, 2));
  for (const [rel, content] of Object.entries(extra)) {
    const p = path.join(dir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    if (content === 'PNG') fs.writeFileSync(p, PNG);
    else fs.writeFileSync(p, content);
  }
  return dir;
}

function readState(buildDir) {
  return JSON.parse(fs.readFileSync(path.join(buildDir, 'state', 'build-state.json'), 'utf-8'));
}

function sha(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

// fresh state via library (schema v2)
function freshState() {
  return createInitialBuildState({
    build_id: 't', client_id: 't', client_slug: 't',
    mockup_reference: '/x', manifest_reference: '/x', build_dir: '/x',
  });
}

// ── A. init-pack ─────────────────────────────────────────────

test('init-pack: happy path preserves design IR and sets supplied statuses', () => {
  const root = tmp();
  const pack = makePack(path.join(root, 'pack'), { extra: { 'hero.png': 'PNG', 'unlisted.webp': 'PNG' } });
  const build = path.join(root, 'build');
  const r = runCli(['init-pack', pack, 'acme-co', '--build-dir', build]);
  assert.equal(r.status, 0, r.stderr);

  const st = readState(build);
  assert.equal(st.input_mode, 'supplied-pack');
  assert.equal(st.schema_version, 2);
  assert.equal(st.operators['build-init'].status, 'passed');
  assert.equal(st.operators['mockup-regions'].status, 'skipped');
  assert.equal(st.operators['asset-reconstruction'].status, 'supplied');
  assert.equal(st.operators['asset-registry'].status, 'pending');

  // raw design IR preserved byte-for-byte
  assert.equal(
    fs.readFileSync(path.join(build, 'input', 'design-ir.json'), 'utf-8'),
    fs.readFileSync(path.join(pack, 'design-ir.json'), 'utf-8'),
  );

  const contract = JSON.parse(fs.readFileSync(path.join(build, 'artifacts', 'input-contract.json'), 'utf-8'));
  assert.equal(contract.schema_version, 1);
  assert.equal(contract.input_mode, 'supplied-pack');
  assert.equal(contract.producer, 'chatgpt-export');
  assert.equal(contract.conflicts.length, 0);
  assert.equal(contract.assets[0].asset_id, 'hero-img');
  assert.equal(contract.assets[0].provenance, 'supplied');
  assert.ok(contract.warnings.some(w => w.includes('unlisted.webp')));

  const init = JSON.parse(fs.readFileSync(path.join(build, 'artifacts', 'build-init.json'), 'utf-8'));
  assert.equal(init.input_contract_path, 'artifacts/input-contract.json');
});

test('init-pack: missing required asset file fails before creating output', () => {
  const root = tmp();
  const pack = makePack(path.join(root, 'pack'), {
    ir: designIr([{ asset_id: 'gone', file: 'missing.png', required: true }]),
  });
  const build = path.join(root, 'build');
  const r = runCli(['init-pack', pack, 'acme-co', '--build-dir', build]);
  assert.notEqual(r.status, 0);
  assert.equal(fs.existsSync(build), false);
});

test('init-pack: asset file escaping the pack fails', () => {
  const root = tmp();
  const pack = makePack(path.join(root, 'pack'), {
    ir: designIr([{ asset_id: 'esc', file: '../outside.png', required: true }]),
  });
  const r = runCli(['init-pack', pack, 'acme-co', '--build-dir', path.join(root, 'build')]);
  assert.notEqual(r.status, 0);
});

test('init-pack: unsafe slug rejected', () => {
  const root = tmp();
  const pack = makePack(path.join(root, 'pack'), { extra: { 'hero.png': 'PNG' } });
  const r = runCli(['init-pack', pack, 'Bad_Slug', '--build-dir', path.join(root, 'build')]);
  assert.notEqual(r.status, 0);
});

test('init-pack: ambiguous mockup fails without flag', () => {
  const root = tmp();
  const pack = path.join(root, 'pack');
  fs.mkdirSync(pack, { recursive: true });
  fs.writeFileSync(path.join(pack, 'mockup.png'), PNG);
  fs.writeFileSync(path.join(pack, 'homepage-mockup.png'), PNG);
  fs.writeFileSync(path.join(pack, 'design-ir.json'), JSON.stringify(designIr([])));
  const r = runCli(['init-pack', pack, 'acme-co', '--build-dir', path.join(root, 'build')]);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /mbiguous|--mockup/i);
});

test('init-pack: conflicting duplicate asset ids block init', () => {
  const root = tmp();
  const pack = makePack(path.join(root, 'pack'), {
    ir: designIr([{ asset_id: 'dup', file: 'a.png' }, { asset_id: 'dup', file: 'b.png' }]),
    extra: { 'a.png': 'PNG', 'b.png': 'PNG' },
  });
  const r = runCli(['init-pack', pack, 'acme-co', '--build-dir', path.join(root, 'build')]);
  assert.notEqual(r.status, 0);
});

test('init-pack: symlink inside pack rejected', () => {
  const root = tmp();
  const pack = makePack(path.join(root, 'pack'), { extra: { 'hero.png': 'PNG' } });
  fs.symlinkSync(path.join(pack, 'hero.png'), path.join(pack, 'link.png'));
  const r = runCli(['init-pack', pack, 'acme-co', '--build-dir', path.join(root, 'build')]);
  assert.notEqual(r.status, 0);
});

test('init-pack: existing build directory rejected', () => {
  const root = tmp();
  const pack = makePack(path.join(root, 'pack'), { extra: { 'hero.png': 'PNG' } });
  const build = path.join(root, 'build');
  fs.mkdirSync(build, { recursive: true });
  const r = runCli(['init-pack', pack, 'acme-co', '--build-dir', build]);
  assert.notEqual(r.status, 0);
});

test('init-pack: --dry-run validates and writes nothing', () => {
  const root = tmp();
  const pack = makePack(path.join(root, 'pack'), { extra: { 'hero.png': 'PNG' } });
  const build = path.join(root, 'build');
  const r = runCli(['init-pack', pack, 'acme-co', '--build-dir', build, '--dry-run']);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.existsSync(build), false);
  assert.match(r.stdout, /dry_run/);
});

// ── B. register-assets ────────────────────────────────────────

test('register-assets: webp output, real dimensions, no upscaling, source sha kept', async () => {
  const root = tmp();
  const pack = makePack(path.join(root, 'pack'), { extra: { 'hero.png': 'PNG' } });
  const build = path.join(root, 'build');
  assert.equal(runCli(['init-pack', pack, 'acme-co', '--build-dir', build]).status, 0);

  const r = runCli(['register-assets', build]);
  assert.equal(r.status, 0, r.stderr);

  const reg = JSON.parse(fs.readFileSync(path.join(build, 'artifacts', 'asset-registry.json'), 'utf-8'));
  assert.equal(reg.assets.length, 1);
  const a = reg.assets[0];
  assert.equal(a.format, 'webp');
  assert.equal(a.width, 1);          // 1x1 fixture — never upscaled to 1600
  assert.equal(a.height, 1);
  assert.equal(a.production_path, '/images/hero-img.webp');
  assert.equal(a.source_sha256, sha(path.join(build, 'input', 'hero.png')));
  assert.ok(fs.existsSync(path.join(build, 'public', 'images', 'hero-img.webp')));

  const st = readState(build);
  assert.equal(st.operators['asset-registry'].status, 'passed');
  // originals preserved
  assert.equal(fs.readFileSync(path.join(build, 'input', 'hero.png')).toString('base64'), PNG_B64);
});

test('register-assets: corrupt image rejects', () => {
  const root = tmp();
  const pack = makePack(path.join(root, 'pack'), { extra: { 'hero.png': 'not a real png' } });
  const build = path.join(root, 'build');
  assert.equal(runCli(['init-pack', pack, 'acme-co', '--build-dir', build]).status, 0);
  const r = runCli(['register-assets', build]);
  assert.notEqual(r.status, 0);
});

test('register-assets: refuses arbitrary filename collision', () => {
  const root = tmp();
  const pack = makePack(path.join(root, 'pack'), { extra: { 'hero.png': 'PNG' } });
  const build = path.join(root, 'build');
  assert.equal(runCli(['init-pack', pack, 'acme-co', '--build-dir', build]).status, 0);
  const target = path.join(build, 'public', 'images', 'hero-img.webp');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, 'foreign content');
  const r = runCli(['register-assets', build]);
  assert.notEqual(r.status, 0);
  assert.equal(fs.readFileSync(target, 'utf-8'), 'foreign content');
});

// ── C. Scheduler diagnostics (pure state) ─────────────────────

test('failed initialisation retries the same stage', () => {
  const s = freshState();
  s.operators['build-init'].status = 'failed';
  s.failure_state = 'build-init: invalid manifest';
  const a = getNextAction(s);
  assert.equal(a.kind, 'operator');
  assert.equal(a.operator_id, 'build-init');
  assert.equal(getNextOperator(s), 'build-init');
});

test('running regions blocks new dispatch', () => {
  const s = freshState();
  s.operators['build-init'].status = 'passed';
  s.operators['mockup-regions'].status = 'in_progress';
  const a = getNextAction(s);
  assert.equal(a.kind, 'blocked');
  assert.equal(getNextOperator(s), null);
});

test('out-of-order frontend pass is blocked, not hidden', () => {
  const s = freshState();
  s.operators['frontend-build'].status = 'passed';
  s.last_completed_operator = 'frontend-build';
  const a = getNextAction(s);
  assert.equal(a.kind, 'blocked');
  assert.match(a.reason, /out-of-order/);
  assert.equal(getNextOperator(s), null);
});

test('exhausted vision budget blocks for escalation', () => {
  const s = freshState();
  for (const id of ['build-init', 'mockup-regions', 'asset-reconstruction', 'asset-registry', 'frontend-build', 'visual-qa']) {
    s.operators[id].status = 'passed';
  }
  s.operators['human-vision-qa'].status = 'failed';
  s.visual_qa_loop.iteration = 3;
  const a = getNextAction(s);
  assert.equal(a.kind, 'blocked');
  assert.match(a.reason, /budget exhausted|escalat/i);
  assert.equal(getNextOperator(s), null);
});

test('accepted vision skips pixel correction and resumes at design-system', () => {
  const s = freshState();
  for (const id of ['build-init', 'mockup-regions', 'asset-reconstruction', 'asset-registry', 'frontend-build', 'visual-qa', 'human-vision-qa', 'ui-systemisation']) {
    s.operators[id].status = 'passed';
  }
  s.visual_qa_loop.passed = true;
  const a = getNextAction(s);
  assert.equal(a.kind, 'operator');
  assert.equal(a.operator_id, 'design-system');
});

test('failed vision with budget routes to pixel-correction', () => {
  const s = freshState();
  for (const id of ['build-init', 'mockup-regions', 'asset-reconstruction', 'asset-registry', 'frontend-build', 'visual-qa']) {
    s.operators[id].status = 'passed';
  }
  s.operators['human-vision-qa'].status = 'failed';
  s.visual_qa_loop.iteration = 1;
  const a = getNextAction(s);
  assert.equal(a.kind, 'operator');
  assert.equal(a.operator_id, 'pixel-correction');
});

// ── D. CLI lifecycle on a supplied build ──────────────────────

function suppliedBuild(root) {
  const pack = makePack(path.join(root, 'pack'), { extra: { 'hero.png': 'PNG' } });
  const build = path.join(root, 'build');
  assert.equal(runCli(['init-pack', pack, 'acme-co', '--build-dir', build]).status, 0);
  assert.equal(runCli(['register-assets', build]).status, 0);
  return build;
}

function fingerprint(build) {
  const r = runCli(['fingerprint', build]);
  assert.equal(r.status, 0);
  return r.stdout.trim();
}

function contractSha(build) {
  return sha(path.join(build, 'artifacts', 'input-contract.json'));
}

function writeArtifact(build, name, obj) {
  fs.writeFileSync(path.join(build, 'artifacts', name), JSON.stringify(obj, null, 2));
}

function passFrontend(build) {
  const fp = fingerprint(build);
  writeArtifact(build, 'frontend-build.json', {
    site_repo_path: '.',
    build_passed: true,
    sections_generated: ['hero'],
    assets_resolved: 1,
    assets_total: 1,
    generated_at: new Date().toISOString(),
    source_revision: fp,
    input_sha256: contractSha(build),
  });
  assert.equal(runCli(['start', 'frontend-build', build]).status, 0);
  const r = runCli(['mark-passed', 'frontend-build', build]);
  assert.equal(r.status, 0, r.stderr);
  return fp;
}

function passVisualQa(build) {
  fs.writeFileSync(path.join(build, 'artifacts', 'shot-1440.png'), PNG);
  writeArtifact(build, 'visual-qa.json', {
    iteration: 0,
    mockup_path: 'input/approved-mockup.png',
    screenshot_paths: ['artifacts/shot-1440.png'],
    discrepancies: [],
    blocker_count: 0,
    warning_count: 0,
    passed: true,
    checked_at: new Date().toISOString(),
    source_revision: fingerprint(build),
    input_sha256: contractSha(build),
  });
  assert.equal(runCli(['start', 'visual-qa', build]).status, 0);
  assert.equal(runCli(['mark-passed', 'visual-qa', build]).status, 0);
}

function passVisionQa(build) {
  writeArtifact(build, 'human-vision-qa.json', {
    passed: true,
    discrepancies: [],
    checked_at: new Date().toISOString(),
    source_revision: fingerprint(build),
    input_sha256: contractSha(build),
  });
  assert.equal(runCli(['start', 'human-vision-qa', build]).status, 0);
  assert.equal(runCli(['mark-passed', 'human-vision-qa', build]).status, 0);
}

test('CLI: duplicate and in-progress start are rejected', () => {
  const root = tmp();
  const build = suppliedBuild(root);
  assert.equal(runCli(['start', 'asset-registry', build]).status, 1); // already passed via registry
  // next op is frontend-build; start it, then try to start again / another
  assert.equal(runCli(['start', 'frontend-build', build]).status, 0);
  assert.equal(runCli(['start', 'frontend-build', build]).status, 1); // duplicate
  assert.equal(runCli(['start', 'visual-qa', build]).status, 1);      // another while in progress
});

test('CLI: evidence-free and out-of-order passes are rejected', () => {
  const root = tmp();
  const build = suppliedBuild(root);
  // never started → reject
  assert.notEqual(runCli(['mark-passed', 'frontend-build', build]).status, 0);
  // start must follow the scheduler, not last_completed
  assert.notEqual(runCli(['start', 'visual-qa', build]).status, 0);
});

test('CLI: malformed/false QA artifacts are rejected', () => {
  const root = tmp();
  const build = suppliedBuild(root);
  passFrontend(build);
  assert.equal(runCli(['start', 'visual-qa', build]).status, 0);

  // empty screenshot list
  writeArtifact(build, 'visual-qa.json', { passed: true, blocker_count: 0, discrepancies: [], screenshot_paths: [], source_revision: fingerprint(build), input_sha256: contractSha(build) });
  assert.notEqual(runCli(['mark-passed', 'visual-qa', build]).status, 0);

  // false passed flag
  writeArtifact(build, 'visual-qa.json', { passed: false, blocker_count: 1, discrepancies: [{ id: 'VQ-1', severity: 'blocker', location: 'x', expected: 'a', observed: 'b', confidence: 0.9, recommended_correction: 'c' }], screenshot_paths: ['artifacts/shot-1440.png'], source_revision: fingerprint(build), input_sha256: contractSha(build) });
  fs.writeFileSync(path.join(build, 'artifacts', 'shot-1440.png'), PNG);
  assert.notEqual(runCli(['mark-passed', 'visual-qa', build]).status, 0);

  // valid now
  writeArtifact(build, 'visual-qa.json', { passed: true, blocker_count: 0, discrepancies: [], screenshot_paths: ['artifacts/shot-1440.png'], iteration: 0, mockup_path: 'input/approved-mockup.png', warning_count: 0, checked_at: new Date().toISOString(), source_revision: fingerprint(build), input_sha256: contractSha(build) });
  assert.equal(runCli(['mark-passed', 'visual-qa', build]).status, 0);
});

test('CLI: vision QA can never be skipped', () => {
  const root = tmp();
  const build = suppliedBuild(root);
  const r = runCli(['mark-skipped', 'human-vision-qa', build]);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /never be skipped/);
});

test('CLI: correction loop — start increments budget once, pass re-runs structural QA', () => {
  const root = tmp();
  const build = suppliedBuild(root);
  passFrontend(build);
  passVisualQa(build);

  // fail vision QA → scheduler routes to pixel-correction
  assert.equal(runCli(['start', 'human-vision-qa', build]).status, 0);
  assert.equal(runCli(['mark-failed', 'human-vision-qa', build, 'mismatch in hero']).status, 0);
  let next = runCli(['next', build]);
  assert.equal(next.status, 0);
  assert.match(next.stdout, /pixel-correction/);

  // starting correction consumes exactly one iteration
  assert.equal(runCli(['start', 'pixel-correction', build]).status, 0);
  assert.equal(readState(build).visual_qa_loop.iteration, 1);
  assert.notEqual(runCli(['start', 'pixel-correction', build]).status, 0); // already running, no second increment
  assert.equal(readState(build).visual_qa_loop.iteration, 1);

  // pass correction → visual-qa and vision QA reset to pending
  writeArtifact(build, 'pixel-correction.json', {
    iteration: 1,
    discrepancies_addressed: ['VQ-1'],
    files_modified: ['app/page.tsx'],
    corrections_summary: 'fixed hero',
    corrected_at: new Date().toISOString(),
    source_revision: fingerprint(build),
    input_sha256: contractSha(build),
  });
  assert.equal(runCli(['mark-passed', 'pixel-correction', build]).status, 0);
  const st = readState(build);
  assert.equal(st.operators['visual-qa'].status, 'pending');
  assert.equal(st.operators['human-vision-qa'].status, 'pending');
  // structural QA re-runs — not straight to systemisation
  next = runCli(['next', build]);
  assert.match(next.stdout, /visual-qa/);
});

test('CLI: exhausted correction budget blocks', () => {
  const root = tmp();
  const build = suppliedBuild(root);
  const st = readState(build);
  for (const id of ['frontend-build', 'visual-qa']) st.operators[id].status = 'passed';
  st.operators['human-vision-qa'].status = 'failed';
  st.visual_qa_loop.iteration = 3;
  fs.writeFileSync(path.join(build, 'state', 'build-state.json'), JSON.stringify(st, null, 2));
  const r = runCli(['next', build]);
  assert.equal(r.status, 2);
  assert.match(r.stdout + r.stderr, /budget exhausted|escalat/i);
});

test('CLI: source drift blocks resume; invalidate re-enables fresh QA', () => {
  const root = tmp();
  const build = suppliedBuild(root);
  fs.mkdirSync(path.join(build, 'app'), { recursive: true });
  fs.writeFileSync(path.join(build, 'app', 'page.tsx'), 'export default () => null;\n');
  passFrontend(build);
  passVisualQa(build);
  passVisionQa(build);

  // source change outside a running edit stage → blocked
  fs.writeFileSync(path.join(build, 'app', 'page.tsx'), 'export default () => <p>changed</p>;\n');
  const r = runCli(['next', build]);
  assert.equal(r.status, 2);
  assert.match(r.stdout + r.stderr, /source changed|invalidate/i);

  // invalidate the stale QA — edit stages already done are kept
  const inv = runCli(['invalidate', build, '--from', 'visual-qa', '--reason', 'source changed']);
  assert.equal(inv.status, 0, inv.stderr);
  const st = readState(build);
  assert.equal(st.operators['visual-qa'].status, 'pending');
  assert.equal(st.operators['human-vision-qa'].status, 'pending');
  assert.equal(st.operators['frontend-build'].status, 'passed'); // kept
  const next = runCli(['next', build]);
  assert.equal(next.status, 0);
  assert.match(next.stdout, /visual-qa/);
});

test('stale writer is rejected by optimistic updated_at check', () => {
  const root = tmp();
  const build = suppliedBuild(root);
  const st = mgr.readBuildState(build);
  const expected = st.updated_at;
  // simulate another writer landing first
  st.operators['asset-registry'].notes = 'someone else wrote';
  mgr.writeBuildState(st);
  const stale = mgr.readBuildState(build);
  stale.operators['asset-registry'].notes = 'stale write attempt';
  assert.throws(
    () => mgr.writeBuildState(stale, { expectedUpdatedAt: expected }),
    /Stale writer rejected/,
  );
});

test('state lock refuses a second writer', () => {
  const root = tmp();
  const build = suppliedBuild(root);
  const release = mgr.acquireStateLock(build);
  try {
    const r = runCli(['start', 'frontend-build', build]);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /locked/i);
  } finally {
    release();
  }
});

test('legacy state: unsupported status stays blocked until reconcile', () => {
  const root = tmp();
  const build = suppliedBuild(root);
  const st = readState(build);
  delete st.schema_version;
  delete st.input_mode;
  delete st.source_revision;
  delete st.authorizations;
  delete st.authorization_log;
  delete st.operators['human-assessment'];
  delete st.operators['workspace-build'];
  st.operators['frontend-build'].status = 'completed'; // unsupported legacy status
  fs.writeFileSync(path.join(build, 'state', 'build-state.json'), JSON.stringify(st, null, 2));

  // status reports reconciliation need; next is blocked; mutation refused
  const status = runCli(['status', build]);
  assert.match(status.stdout, /RECONCIL/i);
  const next = runCli(['next', build]);
  assert.equal(next.status, 2);
  assert.match(next.stdout + next.stderr, /reconcil/i);
  assert.notEqual(runCli(['start', 'build-init', build]).status, 0);

  // reconcile preserves original, inserts missing stages, resets 'completed'
  const rec = runCli(['reconcile', build]);
  assert.equal(rec.status, 0, rec.stderr);
  assert.ok(fs.existsSync(path.join(build, 'state', 'build-state.legacy.json')));
  const after = readState(build);
  assert.equal(after.schema_version, 2);
  assert.equal(after.operators['human-assessment'].status, 'pending');
  assert.equal(after.operators['frontend-build'].status, 'pending'); // never inferred passed
  assert.ok((after.operators['frontend-build'].notes ?? '').includes('reconcile'));

  // second reconcile is a no-op
  const rec2 = runCli(['reconcile', build]);
  assert.equal(rec2.status, 0);
  assert.match(rec2.stdout, /Nothing to reconcile/);
});

// ── Human / CMS / deploy / workspace guards ───────────────────

function stateThrough(build, throughId) {
  const st = readState(build);
  const seq = OPERATOR_IDS;
  for (const id of seq) {
    st.operators[id].status = 'passed';
    if (id === throughId) break;
  }
  fs.writeFileSync(path.join(build, 'state', 'build-state.json'), JSON.stringify(st, null, 2));
  return st;
}

test('human-assessment requires explicit human approval flags', () => {
  const root = tmp();
  const build = suppliedBuild(root);
  fs.mkdirSync(path.join(build, 'app'), { recursive: true });
  fs.writeFileSync(path.join(build, 'app', 'page.tsx'), 'x');
  stateThrough(build, 'core-build-qa');
  // make state's recorded revision current so drift does not block
  const st = readState(build);
  st.source_revision = fingerprint(build);
  fs.writeFileSync(path.join(build, 'state', 'build-state.json'), JSON.stringify(st, null, 2));

  assert.equal(runCli(['start', 'human-assessment', build]).status, 0);
  writeArtifact(build, 'human-assessment.json', {
    decision: 'approved', reviewer: 'ren', reviewed_at: new Date().toISOString(),
    source_revision: fingerprint(build), input_sha256: contractSha(build),
  });
  // without flags → reject
  assert.notEqual(runCli(['mark-passed', 'human-assessment', build]).status, 0);
  // with flags → pass
  const ok = runCli(['mark-passed', 'human-assessment', build, '--human-approval', '--reviewer', 'ren']);
  assert.equal(ok.status, 0, ok.stderr);
});

test('cms and deployment require authorisation; internal pages need approval', () => {
  const root = tmp();
  const build = suppliedBuild(root);
  fs.mkdirSync(path.join(build, 'app'), { recursive: true });
  fs.writeFileSync(path.join(build, 'app', 'page.tsx'), 'x');
  stateThrough(build, 'core-build-qa');
  let st = readState(build);
  st.source_revision = fingerprint(build);
  fs.writeFileSync(path.join(build, 'state', 'build-state.json'), JSON.stringify(st, null, 2));

  // authorize before human approval → reject
  assert.notEqual(runCli(['authorize', build, 'cms', '--by', 'ren', '--reason', 'approved']).status, 0);

  // approve human-assessment properly
  assert.equal(runCli(['start', 'human-assessment', build]).status, 0);
  writeArtifact(build, 'human-assessment.json', {
    decision: 'approved', reviewer: 'ren', reviewed_at: new Date().toISOString(),
    source_revision: fingerprint(build), input_sha256: contractSha(build),
  });
  assert.equal(runCli(['mark-passed', 'human-assessment', build, '--human-approval', '--reviewer', 'ren']).status, 0);

  // authorize cms now works (records permission only)
  assert.equal(runCli(['authorize', build, 'cms', '--by', 'ren', '--reason', 'approved']).status, 0);
  st = readState(build);
  assert.equal(st.authorizations.cms, true);
  assert.equal(st.authorizations.deployment, false);
});

test('workspace brief validation: wrong client/revision/price/missing link reject; empty proposed services allowed', () => {
  const root = tmp();
  const build = suppliedBuild(root);
  fs.mkdirSync(path.join(build, 'app'), { recursive: true });
  fs.writeFileSync(path.join(build, 'app', 'page.tsx'), 'x');
  stateThrough(build, 'human-assessment');
  let st = readState(build);
  st.source_revision = fingerprint(build);
  st.authorizations = { cms: false, deployment: false };
  fs.writeFileSync(path.join(build, 'state', 'build-state.json'), JSON.stringify(st, null, 2));

  const fp = fingerprint(build);
  const goodBrief = {
    client_slug: 'acme-co',
    website_revision: fp,
    approved_by: 'ren',
    approved_at: new Date().toISOString(),
    offer: { currency: 'GBP', total: 1000, deposit: 500, balance: 500, stripePaymentUrl: 'https://buy.stripe.com/x' },
    interests: [], creatives: [], follow_up: [],
    tracking: { mode: 'illustrative' },
    review_surface: 'local',
  };
  const briefPath = path.join(build, 'artifacts', 'workspace-brief.json');

  // no brief at all → cannot start
  assert.notEqual(runCli(['start', 'workspace-build', build]).status, 0);

  for (const [name, mutate] of [
    ['wrong client', b => { b.client_slug = 'other'; }],
    ['wrong revision', b => { b.website_revision = 'deadbeef'; }],
    ['price mismatch', b => { b.offer.balance = 999; }],
    ['missing payment link', b => { delete b.offer.stripePaymentUrl; }],
  ]) {
    const brief = JSON.parse(JSON.stringify(goodBrief));
    mutate(brief);
    fs.writeFileSync(briefPath, JSON.stringify(brief, null, 2));
    const r = runCli(['start', 'workspace-build', build]);
    assert.notEqual(r.status, 0, `${name} should reject`);
  }

  // valid brief, empty proposed services allowed
  fs.writeFileSync(briefPath, JSON.stringify(goodBrief, null, 2));
  assert.equal(runCli(['start', 'workspace-build', build]).status, 0);
});

test('internal-pages claiming completion with zero pages rejects', () => {
  const root = tmp();
  const build = suppliedBuild(root);
  fs.mkdirSync(path.join(build, 'app'), { recursive: true });
  fs.writeFileSync(path.join(build, 'app', 'page.tsx'), 'x');
  stateThrough(build, 'workspace-build');
  let st = readState(build);
  st.source_revision = fingerprint(build);
  fs.writeFileSync(path.join(build, 'state', 'build-state.json'), JSON.stringify(st, null, 2));

  assert.equal(runCli(['start', 'internal-pages', build]).status, 0);
  writeArtifact(build, 'internal-pages.json', {
    pages: [], all_passed: true, completed_at: new Date().toISOString(),
    source_revision: fingerprint(build), input_sha256: contractSha(build),
  });
  assert.notEqual(runCli(['mark-passed', 'internal-pages', build]).status, 0);
});

test('supplied status cannot be set on other operators', () => {
  const s = freshState();
  assert.throws(
    () => mgr.setOperatorStatus(s, 'frontend-build', 'supplied', { allowUnreconciled: true }),
    /only valid on asset-reconstruction/,
  );
});
