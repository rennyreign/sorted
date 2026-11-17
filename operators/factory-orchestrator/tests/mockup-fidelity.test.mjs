import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { evaluateMockupFidelity } from '../dist/mockup-fidelity.js';
import { writeFidelityFixture } from './mockup-fixture.mjs';

const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mockup-gate-'));
  fs.mkdirSync(path.join(root, 'artifacts'));
  fs.mkdirSync(path.join(root, 'input'));
  const mockup = Buffer.from('synthetic reference');
  const ir = Buffer.from(JSON.stringify({ sections: Array.from({ length: 8 }, (_, i) => ({ id: `section-${i}` })) }));
  fs.writeFileSync(path.join(root, 'input', 'mockup.png'), mockup);
  fs.writeFileSync(path.join(root, 'input', 'design-ir.json'), ir);
  fs.writeFileSync(path.join(root, 'artifacts', 'input-contract.json'), JSON.stringify({
    mockup: { path: 'input/mockup.png', sha256: hash(mockup) },
    design_ir: { path: 'input/design-ir.json', sha256: hash(ir) },
  }));
  return { root, report: writeFidelityFixture(root) };
}
function save(root, report) {
  fs.writeFileSync(path.join(root, 'artifacts', 'mockup-fidelity-review.json'), JSON.stringify(report));
}

test('complete 100% evidence passes but never grants human approval', () => {
  const { root } = fixture();
  const result = evaluateMockupFidelity(root);
  assert.equal(result.score, 100);
  assert.equal(result.required_count, 50);
  assert.equal(result.fidelity_passed, true, result.errors.join('\n'));
  assert.equal(result.human_approval_granted, false);
});
test('98% passes only with a minor miss; 96% fails', () => {
  const { root, report } = fixture();
  report.criteria[0].status = 'minor_fail';
  save(root, report);
  assert.equal(evaluateMockupFidelity(root).score, 98);
  assert.equal(evaluateMockupFidelity(root).fidelity_passed, true);
  report.criteria[1].status = 'minor_fail';
  save(root, report);
  assert.equal(evaluateMockupFidelity(root).score, 96);
  assert.equal(evaluateMockupFidelity(root).fidelity_passed, false);
});
for (const status of ['material_fail', 'unknown']) {
  test(`98% cannot conceal ${status}`, () => {
    const { root, report } = fixture();
    report.criteria[0].status = status;
    save(root, report);
    assert.equal(evaluateMockupFidelity(root).score, 98);
    assert.equal(evaluateMockupFidelity(root).fidelity_passed, false);
  });
}
for (const [label, mutate] of [
  ['omitted criterion', r => r.criteria.pop()],
  ['duplicate criterion', r => r.criteria.push(r.criteria[0])],
  ['unknown criterion', r => { r.criteria[0].id = 'made-up'; }],
  ['empty evidence', r => { r.criteria[0].evidence = ''; }],
  ['stale source', r => { r.source_revision = 'stale'; }],
  ['wrong input', r => { r.input_sha256 = 'stale'; }],
  ['wrong reference', r => { r.reference_sha256 = 'stale'; }],
  ['changed capture receipt', r => { r.captures[0].sha256 = 'stale'; }],
  ['wrong capture width', r => { r.captures[0].width = 1441; }],
  ['missing mobile capture', r => r.captures.pop()],
  ['reversed chronology', r => { r.presented_at = '2026-01-02T00:00:00Z'; }],
  ['missing comparison', r => { delete r.comparison; }],
]) {
  test(`${label} fails closed`, () => {
    const { root, report } = fixture();
    mutate(report);
    save(root, report);
    assert.equal(evaluateMockupFidelity(root).fidelity_passed, false);
  });
}
test('source or original bytes changed after review invalidates evidence', () => {
  const { root } = fixture();
  fs.writeFileSync(path.join(root, 'package.json'), '{}');
  assert.equal(evaluateMockupFidelity(root).fidelity_passed, false);
  fs.writeFileSync(path.join(root, 'input', 'mockup.png'), 'changed reference');
  assert.ok(evaluateMockupFidelity(root).errors.includes('Original mockup hash mismatch'));
});
test('structural failure cannot be averaged away', () => {
  const { root } = fixture();
  const file = path.join(root, 'artifacts', 'test-structural.json');
  const qa = JSON.parse(fs.readFileSync(file));
  qa.checks[0].passed = false;
  fs.writeFileSync(file, JSON.stringify(qa));
  const decision = evaluateMockupFidelity(root);
  assert.equal(decision.score, 100);
  assert.equal(decision.fidelity_passed, false);
});
test('missing report and malformed JSON block rather than throw', () => {
  const { root } = fixture();
  fs.writeFileSync(path.join(root, 'artifacts', 'mockup-fidelity-review.json'), '{');
  assert.equal(evaluateMockupFidelity(root).fidelity_passed, false);
});
test('symlink escape in evidence is rejected', () => {
  const { root, report } = fixture();
  const outside = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'outside-')), 'qa.json');
  fs.writeFileSync(outside, '{}');
  fs.symlinkSync(outside, path.join(root, 'artifacts', 'escape.json'));
  report.structural_qa_path = 'artifacts/escape.json';
  save(root, report);
  assert.equal(evaluateMockupFidelity(root).fidelity_passed, false);
});
