// ─────────────────────────────────────────────────────────────
// Build State Manager — disk persistence
//
// Reads and writes build-state.json. All updates go through here
// so the state file is always consistent.
// ─────────────────────────────────────────────────────────────
import fs from 'fs';
import path from 'path';
import { createInitialBuildState, OPERATOR_IDS, } from './state.js';
// ── Path helpers ──────────────────────────────────────────────
export function stateFilePath(buildDir) {
    return path.join(buildDir, 'state', 'build-state.json');
}
export function artifactsDir(buildDir) {
    return path.join(buildDir, 'artifacts');
}
export function artifactPath(buildDir, relativePath) {
    return path.join(artifactsDir(buildDir), relativePath);
}
// ── Read ──────────────────────────────────────────────────────
export function readBuildState(buildDir) {
    const sf = stateFilePath(buildDir);
    if (!fs.existsSync(sf))
        return null;
    const raw = fs.readFileSync(sf, 'utf-8');
    return JSON.parse(raw);
}
// ── Write ─────────────────────────────────────────────────────
export function writeBuildState(state) {
    state.updated_at = new Date().toISOString();
    const sf = stateFilePath(state.build_dir);
    const dir = path.dirname(sf);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(sf, JSON.stringify(state, null, 2), 'utf-8');
}
// ── Create new build job ──────────────────────────────────────
export function createBuildJob(params) {
    const build_id = generateBuildId(params.client_slug);
    const state = createInitialBuildState({
        build_id,
        client_id: params.client_id,
        client_slug: params.client_slug,
        mockup_reference: params.mockup_reference,
        manifest_reference: params.manifest_reference,
        build_dir: params.build_dir,
    });
    // Create directory structure
    const dirs = [
        params.build_dir,
        path.join(params.build_dir, 'input'),
        path.join(params.build_dir, 'artifacts'),
        path.join(params.build_dir, 'artifacts', 'regions'),
        path.join(params.build_dir, 'artifacts', 'assets-raw'),
        path.join(params.build_dir, 'state'),
    ];
    for (const d of dirs) {
        if (!fs.existsSync(d))
            fs.mkdirSync(d, { recursive: true });
    }
    writeBuildState(state);
    return state;
}
// ── Update operator state ─────────────────────────────────────
export function setOperatorStatus(state, operatorId, status, options) {
    if (!OPERATOR_IDS.includes(operatorId)) {
        throw new Error(`Unknown operator: ${operatorId}`);
    }
    const op = state.operators[operatorId];
    const now = new Date().toISOString();
    op.status = status;
    if (status === 'in_progress' && !op.started_at) {
        op.started_at = now;
    }
    if (status === 'passed' || status === 'failed' || status === 'skipped' || status === 'escalated') {
        op.completed_at = now;
    }
    if (options?.artifactPath)
        op.artifact_path = options.artifactPath;
    if (options?.failureReason)
        op.failure_reason = options.failureReason;
    if (options?.notes)
        op.notes = options.notes;
    if (status === 'failed')
        op.retry_count++;
    // Update overall state
    if (status === 'passed') {
        state.last_completed_operator = operatorId;
        state.current_operator = null;
        state.failure_state = null;
    }
    else if (status === 'in_progress') {
        state.current_operator = operatorId;
    }
    else if (status === 'failed' || status === 'escalated') {
        state.current_operator = operatorId;
        state.failure_state = `${operatorId}: ${options?.failureReason ?? 'failed'}`;
    }
    writeBuildState(state);
    return state;
}
// ── Visual QA loop helpers ────────────────────────────────────
export function incrementVisualQALoop(state) {
    state.visual_qa_loop.iteration++;
    writeBuildState(state);
    return state;
}
export function setVisualQAPassed(state, passed, discrepancyCount) {
    state.visual_qa_loop.passed = passed;
    state.visual_qa_loop.last_discrepancy_count = discrepancyCount;
    writeBuildState(state);
    return state;
}
// ── Internal pages helpers ────────────────────────────────────
export function setInternalPages(state, pages) {
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
// ── Resume ────────────────────────────────────────────────────
export function resumeBuild(buildDir) {
    const state = readBuildState(buildDir);
    if (!state) {
        throw new Error(`No build state found at ${stateFilePath(buildDir)}`);
    }
    return state;
}
// ── Status summary ────────────────────────────────────────────
export function statusSummary(state) {
    const lines = [];
    lines.push(`Build: ${state.build_id}`);
    lines.push(`Client: ${state.client_slug}`);
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
        const icon = op.status === 'passed' ? '✓' :
            op.status === 'failed' ? '✗' :
                op.status === 'in_progress' ? '→' :
                    op.status === 'skipped' ? '–' :
                        op.status === 'escalated' ? '!' :
                            '·';
        const num = OPERATOR_IDS.indexOf(id).toString().padStart(2, '0');
        lines.push(`  ${icon} [${num}] ${id.padEnd(24)} ${op.status}`);
        if (op.failure_reason)
            lines.push(`      └ ${op.failure_reason}`);
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
function generateBuildId(clientSlug) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).slice(2, 6);
    return `${clientSlug}-${date}-${rand}`;
}
