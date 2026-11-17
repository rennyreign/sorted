import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fingerprintSource } from '../dist/revision.js';

const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const dimensions = ['layout', 'typography', 'colour', 'imagery', 'components', 'spacing'];

// Synthetic test evidence, not a visual review of any real client.
export function writeFidelityFixture(build) {
  const artifact = path.join(build, 'artifacts');
  fs.mkdirSync(artifact, { recursive: true });
  const contractBytes = fs.readFileSync(path.join(artifact, 'input-contract.json'));
  const contract = JSON.parse(contractBytes);
  const ir = JSON.parse(fs.readFileSync(path.join(build, contract.design_ir.path)));
  const write = (name, bytes) => {
    const rel = `artifacts/${name}`;
    fs.writeFileSync(path.join(build, rel), bytes);
    return { path: rel, sha256: hash(bytes) };
  };
  const captures = [1440, 768, 375, 320].map(width => {
    // Minimal PNG header fixture; production captures are real PNGs.
    const bytes = Buffer.alloc(24);
    Buffer.from('89504e470d0a1a0a', 'hex').copy(bytes);
    bytes.writeUInt32BE(width, 16);
    bytes.writeUInt32BE(900, 20);
    return { width, ...write(`test-${width}.png`, bytes) };
  });
  const envelope = { source_revision: fingerprintSource(build), input_sha256: hash(contractBytes) };
  const structural = {
    ...envelope, checks: [{ check: 'synthetic fixture', passed: true }],
    screenshot_paths: captures.map(c => c.path),
  };
  write('test-structural.json', JSON.stringify(structural));
  const report = {
    schema_version: 1, reviewer: 'synthetic test fixture',
    presented_at: '2026-01-01T00:00:00Z', reviewed_at: '2026-01-01T00:01:00Z',
    ...envelope, reference_sha256: contract.mockup.sha256,
    structural_qa_path: 'artifacts/test-structural.json',
    captures, comparison: captures[0],
    criteria: [...ir.sections.flatMap(s => dimensions.map(d => `${s.id}:${d}`)), 'page:order', 'page:rhythm']
      .map(id => ({ id, status: 'pass', expected: 'synthetic reference',
        observed: 'synthetic match', evidence: 'synthetic capture fixture' })),
  };
  write('mockup-fidelity-review.json', JSON.stringify(report));
  return report;
}
