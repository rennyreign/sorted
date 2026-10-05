#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Sorted Factory Orchestrator — CLI
//
// Usage:
//   factory init <mockup> <manifest> <client-slug> [--build-dir <dir>]
//   factory status [build-dir]
//   factory resume [build-dir]
//   factory next [build-dir]          (prints the next operator to run)
//   factory list-operators
//
// The orchestrator is deliberately dumb. It reads state, determines
// the next operator, and reports it. The harness (Devin) executes
// harness-mode operators. Standalone operators are run via their
// own CLIs. This CLI just manages state.
// ─────────────────────────────────────────────────────────────
import fs from 'fs';
import path from 'path';
import { readBuildState, writeBuildState, createBuildJob, statusSummary, setOperatorStatus } from './state-manager.js';
import { OPERATORS, OPERATOR_IDS, getNextOperator, getOperatorMeta } from './state.js';
// ── Args ──────────────────────────────────────────────────────
const args = process.argv.slice(2);
const command = args[0];
// ── Commands ──────────────────────────────────────────────────
function cmdInit() {
    const mockup = args[1];
    const manifest = args[2];
    const clientSlug = args[3];
    if (!mockup || !manifest || !clientSlug) {
        console.error('Usage: factory init <mockup> <manifest> <client-slug> [--build-dir <dir>]');
        process.exit(1);
    }
    // Parse --build-dir
    let buildDir = `builds/${clientSlug}`;
    for (let i = 4; i < args.length; i++) {
        if (args[i] === '--build-dir' && args[i + 1]) {
            buildDir = args[i + 1];
            i++;
        }
    }
    // Resolve mockup and manifest to absolute paths
    const mockupAbs = path.resolve(mockup);
    const manifestAbs = path.resolve(manifest);
    if (!fs.existsSync(mockupAbs)) {
        console.error(`Mockup not found: ${mockupAbs}`);
        process.exit(1);
    }
    if (!fs.existsSync(manifestAbs)) {
        console.error(`Manifest not found: ${manifestAbs}`);
        process.exit(1);
    }
    const state = createBuildJob({
        client_id: clientSlug,
        client_slug: clientSlug,
        mockup_reference: mockupAbs,
        manifest_reference: manifestAbs,
        build_dir: path.resolve(buildDir),
    });
    // Copy input artifacts into the build dir
    const inputDir = path.join(state.build_dir, 'input');
    fs.copyFileSync(mockupAbs, path.join(inputDir, 'approved-mockup.png'));
    fs.copyFileSync(manifestAbs, path.join(inputDir, 'image-manifest.json'));
    // Update state to point at the copied inputs
    state.mockup_reference = path.join(inputDir, 'approved-mockup.png');
    state.manifest_reference = path.join(inputDir, 'image-manifest.json');
    writeBuildState(state);
    console.log(`\nBuild initialised: ${state.build_id}`);
    console.log(`  Client: ${state.client_slug}`);
    console.log(`  Build dir: ${state.build_dir}`);
    console.log(`  Mockup: ${state.mockup_reference}`);
    console.log(`  Manifest: ${state.manifest_reference}`);
    console.log(`\nNext operator: ${getNextOperator(state)}`);
}
function cmdStatus() {
    const buildDir = args[1] || findBuildDir();
    if (!buildDir) {
        console.error('No build directory specified. Usage: factory status <build-dir>');
        process.exit(1);
    }
    const state = readBuildState(buildDir);
    if (!state) {
        console.error(`No build state found at ${buildDir}`);
        process.exit(1);
    }
    console.log(statusSummary(state));
}
function cmdResume() {
    const buildDir = args[1] || findBuildDir();
    if (!buildDir) {
        console.error('No build directory specified. Usage: factory resume <build-dir>');
        process.exit(1);
    }
    const state = readBuildState(buildDir);
    if (!state) {
        console.error(`No build state found at ${buildDir}`);
        process.exit(1);
    }
    const next = getNextOperator(state);
    console.log(`\nResuming build: ${state.build_id}`);
    console.log(`Last completed: ${state.last_completed_operator ?? 'none'}`);
    console.log(`Next operator: ${next ?? 'none — build complete'}`);
    if (next) {
        const meta = getOperatorMeta(next);
        console.log(`  [${meta.number}] ${meta.name}`);
        console.log(`  Execution: ${meta.execution}`);
        console.log(`  Skill: operators/skills/${meta.skillFile}`);
        console.log(`  Output: artifacts/${meta.outputArtifact}`);
    }
}
function cmdNext() {
    const buildDir = args[1] || findBuildDir();
    if (!buildDir) {
        console.error('No build directory specified. Usage: factory next <build-dir>');
        process.exit(1);
    }
    const state = readBuildState(buildDir);
    if (!state) {
        console.error(`No build state found at ${buildDir}`);
        process.exit(1);
    }
    const next = getNextOperator(state);
    if (!next) {
        console.log('Build complete — no pending operators.');
        process.exit(0);
    }
    const meta = getOperatorMeta(next);
    console.log(`Next: [${meta.number}] ${meta.name} (${meta.id})`);
    console.log(`  Execution: ${meta.execution}`);
    console.log(`  Skill: operators/skills/${meta.skillFile}`);
    console.log(`  Output: artifacts/${meta.outputArtifact}`);
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
function cmdMarkPassed() {
    // factory mark-passed <operator-id> <build-dir>
    const operatorId = args[1];
    const buildDir = args[2] || findBuildDir();
    if (!operatorId || !buildDir) {
        console.error('Usage: factory mark-passed <operator-id> <build-dir>');
        process.exit(1);
    }
    if (!OPERATOR_IDS.includes(operatorId)) {
        console.error(`Unknown operator: ${operatorId}`);
        console.error(`Valid operators: ${OPERATOR_IDS.join(', ')}`);
        process.exit(1);
    }
    const state = readBuildState(buildDir);
    if (!state) {
        console.error(`No build state found at ${buildDir}`);
        process.exit(1);
    }
    setOperatorStatus(state, operatorId, 'passed');
    const next = getNextOperator(state);
    console.log(`Marked ${operatorId} as passed.`);
    console.log(`Next: ${next ?? 'build complete'}`);
}
function cmdMarkFailed() {
    // factory mark-failed <operator-id> <build-dir> <reason>
    const operatorId = args[1];
    const buildDir = args[2] || findBuildDir();
    const reason = args[3] || 'manual failure';
    if (!operatorId || !buildDir) {
        console.error('Usage: factory mark-failed <operator-id> <build-dir> [reason]');
        process.exit(1);
    }
    const state = readBuildState(buildDir);
    if (!state) {
        console.error(`No build state found at ${buildDir}`);
        process.exit(1);
    }
    setOperatorStatus(state, operatorId, 'failed', { failureReason: reason });
    console.log(`Marked ${operatorId} as failed: ${reason}`);
}
// ── Helpers ───────────────────────────────────────────────────
function findBuildDir() {
    // Look for a builds/ directory in cwd
    const buildsDir = path.resolve('builds');
    if (fs.existsSync(buildsDir)) {
        const entries = fs.readdirSync(buildsDir, { withFileTypes: true });
        const dirs = entries.filter((e) => e.isDirectory()).map((e) => path.join(buildsDir, e.name));
        if (dirs.length === 1)
            return dirs[0];
        if (dirs.length > 1) {
            // Find the one with the most recent build-state.json
            let mostRecent = null;
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
switch (command) {
    case 'init':
        cmdInit();
        break;
    case 'status':
        cmdStatus();
        break;
    case 'resume':
        cmdResume();
        break;
    case 'next':
        cmdNext();
        break;
    case 'list-operators':
        cmdListOperators();
        break;
    case 'mark-passed':
        cmdMarkPassed();
        break;
    case 'mark-failed':
        cmdMarkFailed();
        break;
    case undefined:
    case '--help':
    case '-h':
    case 'help':
        console.log(`
Sorted Factory Orchestrator

Commands:
  init <mockup> <manifest> <client-slug> [--build-dir <dir>]
      Initialise a new manufacturing job from mockup + image manifest
  status [build-dir]
      Print current build state
  resume [build-dir]
      Show what to run next when resuming
  next [build-dir]
      Print just the next operator to run
  list-operators
      List all 16 operators in the manufacturing line
  mark-passed <operator-id> <build-dir>
      Mark an operator as passed (used by harness after completing a step)
  mark-failed <operator-id> <build-dir> [reason]
      Mark an operator as failed

The orchestrator manages state only. The harness (Devin) executes
harness-mode operators. Standalone operators run via their own CLIs.
`);
        break;
    default:
        console.error(`Unknown command: ${command}`);
        console.error('Run "factory help" for usage.');
        process.exit(1);
}
