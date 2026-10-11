// Frontend-builder phase A hardening tests.
// All dependencies stubbed — no network, no real npm, tmpdirs only.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(HERE, '..', 'dist');
const CLI = path.join(DIST, 'cli.js');
const { build } = await import(path.join(DIST, 'orchestrator.js'));

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'fb-test-'));
}

const DECONSTRUCTION = {
  page_type: 'local-service',
  sections: [
    { id: 'hero', type: 'hero', position: 1, label: 'Hero' },
    { id: 'services', type: 'services', position: 2, label: 'Services' },
  ],
  assets: [{ id: 'hero-img', type: 'image', description: 'hero', priority: 'high', source: 'generated' }],
  components: [{ component: 'Nav' }],
  copy: [{ section: 'hero', type: 'headline', text: 'Hello' }],
  build_notes: {},
};

const MANIFEST = {
  mockup: 'mockup.png',
  deconstruction: 'decon.json',
  generated_at: '2026-01-01',
  operator_version: '0.1.0',
  assets: [
    { id: 'hero-img', mode: 'generate', status: 'ok', files: { original: 'assets/hero-img/original.webp' }, meta: {} },
  ],
};

function fixtures(root) {
  const deconPath = path.join(root, 'decon.json');
  const manPath = path.join(root, 'manifest.json');
  fs.writeFileSync(deconPath, JSON.stringify(DECONSTRUCTION));
  fs.writeFileSync(manPath, JSON.stringify(MANIFEST));
  const assetsDir = path.join(root, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  const templateDir = path.join(root, 'template');
  fs.mkdirSync(path.join(templateDir, 'app'), { recursive: true });
  fs.writeFileSync(path.join(templateDir, 'package.json'), '{"name":"t","scripts":{"build":"next build"}}');
  fs.writeFileSync(path.join(templateDir, 'app', 'page.tsx'), 'export default () => null;');
  const outputDir = path.join(root, 'out-site');
  return {
    deconstructionPath: deconPath,
    manifestPath: manPath,
    assetsDir,
    templateDir,
    outputDir,
  };
}

function baseConfig(root, over = {}) {
  return {
    ...fixtures(root),
    clientSlug: 'test-client',
    ...over,
  };
}

const okModel = async () => ({
  content: 'export default function Section() { return null; }',
  inputTokens: 10,
  outputTokens: 20,
  model: 'stub',
  stopReason: 'end_turn',
});

// ── Keyless dry run: succeeds, writes nothing ─────────────────

test('dry-run without API key succeeds and writes nothing', async () => {
  const root = tmp();
  const prev = process.env['ANTHROPIC_API_KEY'];
  delete process.env['ANTHROPIC_API_KEY'];
  try {
    const result = await build(baseConfig(root, { dryRun: true }));
    assert.equal(result.buildPassed, null);
    assert.ok(result.files.length > 0);
    assert.ok(result.files.every(f => f.status === 'skipped'));
    assert.equal(fs.existsSync(path.join(root, 'out-site')), false);
  } finally {
    if (prev) process.env['ANTHROPIC_API_KEY'] = prev;
  }
});

test('CLI dry-run without API key exits 0 and writes nothing', () => {
  const root = tmp();
  const fx = fixtures(root);
  const env = { ...process.env };
  delete env['ANTHROPIC_API_KEY'];
  const r = spawnSync('node', [CLI, fx.deconstructionPath, fx.manifestPath, fx.assetsDir,
    '--output', fx.outputDir, '--template', fx.templateDir, '--slug', 't', '--dry-run'],
    { encoding: 'utf8', env });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.existsSync(fx.outputDir), false);
});

// ── Existing output refused, never deleted ────────────────────

test('existing non-empty output dir is refused, contents intact', async () => {
  const root = tmp();
  const cfg = baseConfig(root, { callModel: okModel, noBuild: true });
  fs.mkdirSync(cfg.outputDir, { recursive: true });
  fs.writeFileSync(path.join(cfg.outputDir, 'KEEP.txt'), 'precious');
  await assert.rejects(() => build(cfg), /refusing to overwrite/i);
  assert.equal(fs.readFileSync(path.join(cfg.outputDir, 'KEEP.txt'), 'utf-8'), 'precious');
});

// ── Injected model: files written, no install/build when opted out ──

test('stubbed model writes files; --no-build performs no install/build', async () => {
  const root = tmp();
  let calls = 0;
  const cfg = baseConfig(root, {
    callModel: async () => { calls++; return okModel(); },
    noBuild: true,
  });
  const result = await build(cfg);
  assert.ok(calls > 0);
  assert.equal(result.buildPassed, null);            // skipped ≠ verified
  assert.ok(result.files.every(f => f.status === 'ok'));
  assert.equal(fs.existsSync(path.join(cfg.outputDir, 'node_modules')), false);
  assert.ok(result.files.some(f => f.outputPath.endsWith('page.tsx')));
});

// ── Truncated model response is never written ─────────────────

test('max_tokens truncation rejects before file write', async () => {
  const root = tmp();
  const cfg = baseConfig(root, {
    callModel: async () => ({
      content: 'export default function Partial() { return <',
      inputTokens: 10, outputTokens: 8192, model: 'stub', stopReason: 'max_tokens',
    }),
    noBuild: true,
  });
  const result = await build(cfg);
  assert.ok(result.files.every(f => f.status === 'failed'));
  assert.ok(result.files.every(f => /truncated|max_tokens/i.test(f.error ?? '')));
  // no partial content landed — file absent or still the template original
  for (const f of result.files) {
    if (fs.existsSync(f.outputPath)) {
      assert.ok(!fs.readFileSync(f.outputPath, 'utf-8').includes('Partial'));
    }
  }
});

// ── Failed build is nonzero and not reported verified ─────────

test('failed npm build yields buildPassed=false (install never runs by default)', async () => {
  const root = tmp();
  // fake npm: logs invocations, always fails `run build`
  const binDir = path.join(root, 'bin');
  fs.mkdirSync(binDir);
  const npmLog = path.join(root, 'npm.log');
  fs.writeFileSync(path.join(binDir, 'npm'),
    `#!/bin/sh\necho "$@" >> ${npmLog}\nexit 1\n`);
  fs.chmodSync(path.join(binDir, 'npm'), 0o755);

  const prevPath = process.env.PATH;
  process.env.PATH = `${binDir}:${prevPath}`;
  try {
    const result = await build(baseConfig(root, { callModel: okModel }));
    assert.equal(result.buildPassed, false);
    const log = fs.existsSync(npmLog) ? fs.readFileSync(npmLog, 'utf-8') : '';
    assert.ok(!log.includes('install'), 'npm install must not run by default');
    assert.match(log, /run build/);
  } finally {
    process.env.PATH = prevPath;
  }
});

// ── Schema validators (dependency-free) ───────────────────────

test('dependency-free validators reject malformed input', async () => {
  const { validateDeconstruction, validateManifest } = await import(path.join(DIST, 'schema.js'));
  assert.equal(validateDeconstruction({}).success, false);
  assert.equal(validateDeconstruction(DECONSTRUCTION).success, true);
  assert.equal(validateManifest({}).success, false);
  assert.equal(validateManifest(MANIFEST).success, true);
});
