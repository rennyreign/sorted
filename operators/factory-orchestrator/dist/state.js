// ─────────────────────────────────────────────────────────────
// Sorted Website Manufacturing Line — Build State
//
// The single source of truth for where a manufacturing job is.
// Written to disk as build-state.json. Read at session start.
// Updated after each operator completes.
//
// The harness (Devin) is the orchestrator at current volume.
// This file tracks state so any session can resume.
// ─────────────────────────────────────────────────────────────
// ── The 17 operators ──────────────────────────────────────────
export const OPERATOR_IDS = [
    'build-init', // 0
    'mockup-regions', // 1
    'asset-reconstruction', // 2  (standalone — external model calls)
    'asset-registry', // 3  (standalone — post-processes Op 2 output)
    'frontend-build', // 4
    'visual-qa', // 5  (automated structural check)
    'human-vision-qa', // 5b (human-in-the-loop — requires vision model)
    'pixel-correction', // 6
    'ui-systemisation', // 7
    'design-system', // 8
    'core-build-qa', // 9
    'internal-pages', // 10
    'cms-integration', // 11
    'cms-qa', // 12
    'analytics', // 13
    'launch-qa', // 14
    'deployment', // 15
];
// Which operators run in the harness vs standalone
export const EXECUTION_MODE = {
    'build-init': 'harness',
    'mockup-regions': 'harness',
    'asset-reconstruction': 'standalone',
    'asset-registry': 'standalone',
    'frontend-build': 'harness',
    'visual-qa': 'harness',
    'human-vision-qa': 'harness', // human-in-the-loop — requires vision model switch
    'pixel-correction': 'harness',
    'ui-systemisation': 'harness',
    'design-system': 'harness',
    'core-build-qa': 'harness',
    'internal-pages': 'harness',
    'cms-integration': 'harness',
    'cms-qa': 'harness',
    'analytics': 'harness',
    'launch-qa': 'harness',
    'deployment': 'harness',
};
export const OPERATORS = [
    {
        id: 'build-init',
        number: 0,
        name: 'Build Initialisation',
        description: 'Turn mockup + image manifest into a valid factory job',
        execution: 'harness',
        skillFile: 'op-00-build-init.md',
        outputArtifact: 'build-init.json',
    },
    {
        id: 'mockup-regions',
        number: 1,
        name: 'Mockup Region Decomposition',
        description: 'Decompose mockup into reconstruction regions',
        execution: 'harness',
        skillFile: 'op-01-mockup-regions.md',
        outputArtifact: 'regions.json',
    },
    {
        id: 'asset-reconstruction',
        number: 2,
        name: 'Asset Reconstruction',
        description: 'Recreate clean production imagery via image generation models',
        execution: 'standalone',
        skillFile: 'op-02-asset-reconstruction.md',
        outputArtifact: 'assets-raw/',
    },
    {
        id: 'asset-registry',
        number: 3,
        name: 'Asset Registry',
        description: 'Turn generated images into deterministic website assets',
        execution: 'standalone',
        skillFile: 'op-03-asset-registry.md',
        outputArtifact: 'asset-registry.json',
    },
    {
        id: 'frontend-build',
        number: 4,
        name: 'Frontend Reconstruction',
        description: 'Recreate the approved mockup as functioning frontend code',
        execution: 'harness',
        skillFile: 'op-04-frontend-build.md',
        outputArtifact: 'frontend-build.json',
    },
    {
        id: 'visual-qa',
        number: 5,
        name: 'Visual QA',
        description: 'Compare rendered website against the approved mockup (automated structural check)',
        execution: 'harness',
        skillFile: 'op-05-visual-qa.md',
        outputArtifact: 'visual-qa.json',
    },
    {
        id: 'human-vision-qa',
        number: 5.5,
        name: 'Human Vision QA',
        description: 'Human-in-the-loop visual review against mockup — requires vision-capable model',
        execution: 'harness',
        skillFile: 'op-05b-human-vision-qa.md',
        outputArtifact: 'human-vision-qa.json',
    },
    {
        id: 'pixel-correction',
        number: 6,
        name: 'Pixel Correction',
        description: 'Correct discrepancies identified by Visual QA',
        execution: 'harness',
        skillFile: 'op-06-pixel-correction.md',
        outputArtifact: 'pixel-correction.json',
    },
    {
        id: 'ui-systemisation',
        number: 7,
        name: 'UI Systemisation',
        description: 'Convert visually correct implementation into robust production architecture',
        execution: 'harness',
        skillFile: 'op-07-ui-systemisation.md',
        outputArtifact: 'ui-systemisation.json',
    },
    {
        id: 'design-system',
        number: 8,
        name: 'Design System Extraction',
        description: 'Extract reusable client-specific design grammar',
        execution: 'harness',
        skillFile: 'op-08-design-system.md',
        outputArtifact: 'design-system.json',
    },
    {
        id: 'core-build-qa',
        number: 9,
        name: 'Core Build QA',
        description: 'Verify the systemised core build',
        execution: 'harness',
        skillFile: 'op-09-core-build-qa.md',
        outputArtifact: 'core-build-qa.json',
    },
    {
        id: 'internal-pages',
        number: 10,
        name: 'Internal Page Builder',
        description: 'Manufacture remaining website pages from their mockups',
        execution: 'harness',
        skillFile: 'op-10-internal-pages.md',
        outputArtifact: 'internal-pages.json',
    },
    {
        id: 'cms-integration',
        number: 11,
        name: 'CMS Integration',
        description: 'Apply SortedUpdates CMS to the approved website',
        execution: 'harness',
        skillFile: 'op-11-cms-integration.md',
        outputArtifact: 'cms-integration.json',
    },
    {
        id: 'cms-qa',
        number: 12,
        name: 'CMS QA',
        description: 'Test actual customer editing workflows via Playwright',
        execution: 'harness',
        skillFile: 'op-12-cms-qa.md',
        outputArtifact: 'cms-qa.json',
    },
    {
        id: 'analytics',
        number: 13,
        name: 'Analytics',
        description: 'Apply measurement infrastructure',
        execution: 'harness',
        skillFile: 'op-13-analytics.md',
        outputArtifact: 'analytics.json',
    },
    {
        id: 'launch-qa',
        number: 14,
        name: 'Launch QA',
        description: 'Final production-readiness validation',
        execution: 'harness',
        skillFile: 'op-14-launch-qa.md',
        outputArtifact: 'launch-qa.json',
    },
    {
        id: 'deployment',
        number: 15,
        name: 'Deployment',
        description: 'Ship the validated website',
        execution: 'harness',
        skillFile: 'op-15-deployment.md',
        outputArtifact: 'deployment.json',
    },
];
// ── Build state factory ───────────────────────────────────────
export function createInitialBuildState(params) {
    const now = new Date().toISOString();
    const operators = {};
    for (const id of OPERATOR_IDS) {
        operators[id] = {
            status: 'pending',
            retry_count: 0,
        };
    }
    return {
        build_id: params.build_id,
        client_id: params.client_id,
        client_slug: params.client_slug,
        mockup_reference: params.mockup_reference,
        manifest_reference: params.manifest_reference,
        build_dir: params.build_dir,
        operators,
        visual_qa_loop: {
            iteration: 0,
            max_iterations: 3,
            last_discrepancy_count: 0,
            passed: false,
        },
        internal_pages: [],
        current_operator: null,
        last_completed_operator: null,
        failure_state: null,
        retry_count: 0,
        site_repo_path: null,
        deployment_url: null,
        deployment_commit: null,
        created_at: now,
        updated_at: now,
    };
}
// ── Operator sequencing ───────────────────────────────────────
// The linear sequence. The orchestrator follows this order.
// Exceptions: visual-qa ↔ pixel-correction loop, internal-pages sub-loop.
export const OPERATOR_SEQUENCE = [...OPERATOR_IDS];
export function getNextOperator(state) {
    // ── Visual QA → Human Vision QA → Pixel Correction loop ────
    // The loop has specific routing rules that override the linear sequence.
    //
    // Flow:
    //   visual-qa (automated) → human-vision-qa (vision model)
    //   human-vision-qa passed/skipped → ui-systemisation
    //   human-vision-qa failed → pixel-correction
    //   pixel-correction passed → human-vision-qa (re-verify)
    // 1. Pixel correction just passed → route back to human-vision-qa for re-verification
    if (state.operators['pixel-correction'].status === 'passed' &&
        state.last_completed_operator === 'pixel-correction') {
        return 'human-vision-qa';
    }
    // 2. Visual QA (automated) just passed → route to human-vision-qa (the vision gate)
    if (state.operators['visual-qa'].status === 'passed' &&
        state.last_completed_operator === 'visual-qa') {
        return 'human-vision-qa';
    }
    // 3. Human vision QA just passed or was skipped → proceed to ui-systemisation
    if ((state.operators['human-vision-qa'].status === 'passed' ||
        state.operators['human-vision-qa'].status === 'skipped') &&
        state.last_completed_operator === 'human-vision-qa' &&
        state.operators['ui-systemisation'].status === 'pending') {
        return 'ui-systemisation';
    }
    // 4. Human vision QA failed and iterations remain → route to pixel correction
    if (state.operators['human-vision-qa'].status === 'failed' &&
        state.visual_qa_loop.iteration < state.visual_qa_loop.max_iterations) {
        return 'pixel-correction';
    }
    // 5. Visual QA failed (automated check found structural issues) → pixel correction
    if (state.operators['visual-qa'].status === 'failed' &&
        state.visual_qa_loop.iteration < state.visual_qa_loop.max_iterations) {
        return 'pixel-correction';
    }
    // ── Default: linear sequence ───────────────────────────────
    // Find the next pending operator in sequence after the last completed
    const lastCompletedIdx = state.last_completed_operator
        ? OPERATOR_SEQUENCE.indexOf(state.last_completed_operator)
        : -1;
    for (let i = lastCompletedIdx + 1; i < OPERATOR_SEQUENCE.length; i++) {
        const opId = OPERATOR_SEQUENCE[i];
        if (state.operators[opId].status === 'pending') {
            return opId;
        }
    }
    return null; // all done
}
export function getOperatorMeta(id) {
    const meta = OPERATORS.find(o => o.id === id);
    if (!meta)
        throw new Error(`Unknown operator: ${id}`);
    return meta;
}
