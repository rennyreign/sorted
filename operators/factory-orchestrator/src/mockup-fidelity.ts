import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fingerprintSource } from './revision.js';

const DIMENSIONS = ['layout', 'typography', 'colour', 'imagery', 'components', 'spacing'];
const STATUSES = ['pass', 'minor_fail', 'material_fail', 'unknown'];
const sha = (bytes: Buffer) => crypto.createHash('sha256').update(bytes).digest('hex');
const object = (v: unknown): v is Record<string, any> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

export interface FidelityDecision {
  metric: 'fidelity-checklist-adherence-v1';
  threshold: 98;
  score: number | null;
  passed_count: number;
  required_count: number;
  material_failures: string[];
  unknowns: string[];
  errors: string[];
  fidelity_passed: boolean;
  workspace_visual_ready: boolean;
  human_approval_granted: false;
}

// This evaluates evidence completeness and a fixed decision rule. It does not
// generate visual observations or turn a visual pass into client approval.
export function evaluateMockupFidelity(buildDir: string): FidelityDecision {
  const root = fs.realpathSync(buildDir);
  const result: FidelityDecision = {
    metric: 'fidelity-checklist-adherence-v1', threshold: 98, score: null,
    passed_count: 0, required_count: 0, material_failures: [], unknowns: [],
    errors: [], fidelity_passed: false, workspace_visual_ready: false,
    human_approval_granted: false,
  };
  const error = (message: string) => result.errors.push(message);
  function localFile(rel: unknown): string {
    if (!text(rel) || path.isAbsolute(rel)) throw new Error('Evidence path must be job-relative');
    const resolved = fs.realpathSync(path.resolve(root, rel));
    if (!resolved.startsWith(root + path.sep) || !fs.statSync(resolved).isFile()) {
      throw new Error(`Evidence escapes job or is not a file: ${rel}`);
    }
    return resolved;
  }
  const read = (rel: unknown) => fs.readFileSync(localFile(rel));
  const json = (rel: unknown) => JSON.parse(read(rel).toString('utf8'));
  const receipt = (value: unknown) => {
    if (!object(value) || !text(value.sha256) || sha(read(value.path)) !== value.sha256) {
      throw new Error('Missing or changed evidence receipt');
    }
  };
  try {
    const contractBytes = read('artifacts/input-contract.json');
    const contract = JSON.parse(contractBytes.toString('utf8'));
    const report = json('artifacts/mockup-fidelity-review.json');
    if (!object(report) || report.schema_version !== 1) throw new Error('Unsupported fidelity review schema');
    if (!text(report.reviewer)) error('Missing reviewer');
    const presented = Date.parse(report.presented_at);
    const reviewed = Date.parse(report.reviewed_at);
    if (!Number.isFinite(presented) || !Number.isFinite(reviewed) ||
        reviewed < presented || reviewed > Date.now()) error('Invalid presentation/review chronology');
    const revision = fingerprintSource(root);
    if (report.source_revision !== revision) error('Stale review source_revision');
    if (report.input_sha256 !== sha(contractBytes)) error('Changed input contract');
    if (!object(contract.mockup) || sha(read(contract.mockup.path)) !== contract.mockup.sha256 ||
        report.reference_sha256 !== contract.mockup.sha256) error('Original mockup hash mismatch');
    if (!object(contract.design_ir) || sha(read(contract.design_ir.path)) !== contract.design_ir.sha256) {
      throw new Error('Original design-IR hash mismatch');
    }
    const ir = json(contract.design_ir.path);
    if (!Array.isArray(ir.sections) || !ir.sections.length) throw new Error('No original sections');
    const ids: string[] = ir.sections.map((s: unknown) => {
      if (!object(s) || !text(s.id) || s.id === 'page' || s.id.includes(':')) {
        throw new Error('Invalid original section ID');
      }
      return s.id;
    });
    if (new Set(ids).size !== ids.length) throw new Error('Duplicate original section IDs');
    const required = new Set([...ids.flatMap(id => DIMENSIONS.map(d => `${id}:${d}`)),
      'page:order', 'page:rhythm']);
    result.required_count = required.size;
    if (!Array.isArray(report.criteria)) throw new Error('Missing criteria');
    const seen = new Set<string>();
    for (const criterion of report.criteria) {
      if (!object(criterion) || !required.has(criterion.id) || seen.has(criterion.id)) {
        error('Unknown or duplicate criterion'); continue;
      }
      seen.add(criterion.id);
      if (!STATUSES.includes(criterion.status) || !text(criterion.expected) ||
          !text(criterion.observed) || !text(criterion.evidence)) error(`Incomplete criterion ${criterion.id}`);
      if (criterion.status === 'pass') result.passed_count++;
      if (criterion.status === 'material_fail') result.material_failures.push(criterion.id);
      if (criterion.status === 'unknown') result.unknowns.push(criterion.id);
    }
    for (const id of required) if (!seen.has(id)) error(`Missing criterion ${id}`);
    result.score = 100 * result.passed_count / required.size;
    if (!Array.isArray(report.captures)) throw new Error('Missing captures');
    const widths = new Set<number>();
    for (const capture of report.captures) {
      receipt(capture);
      const bytes = read(capture.path);
      if (bytes.length < 24 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' ||
          bytes.readUInt32BE(16) !== capture.width || widths.has(capture.width)) {
        throw new Error('Invalid PNG width or duplicate capture');
      }
      widths.add(capture.width);
    }
    for (const width of [1440, 768, 375, 320]) if (!widths.has(width)) error(`Missing ${width}px capture`);
    receipt(report.comparison);
    const structural = json(report.structural_qa_path);
    if (structural.source_revision !== revision || structural.input_sha256 !== sha(contractBytes)) {
      error('Stale structural QA');
    }
    if (!Array.isArray(structural.checks) || !structural.checks.length ||
        !structural.checks.every((c: unknown) => object(c) && text(c.check) && c.passed === true)) {
      error('Structural QA missing or failing');
    }
    if (!Array.isArray(structural.screenshot_paths) || !structural.screenshot_paths.length) {
      error('Structural QA screenshots missing');
    } else {
      for (const screenshot of structural.screenshot_paths) localFile(screenshot);
    }
  } catch (e) {
    error(e instanceof Error ? e.message : String(e));
  }
  result.fidelity_passed = result.errors.length === 0 && result.score !== null &&
    result.score >= result.threshold && result.material_failures.length === 0 && result.unknowns.length === 0;
  result.workspace_visual_ready = result.fidelity_passed;
  return result;
}
