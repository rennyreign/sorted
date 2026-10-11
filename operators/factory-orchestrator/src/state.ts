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

// ── Operator status ───────────────────────────────────────────

export type OperatorStatus =
  | 'pending'      // not yet started
  | 'in_progress'  // currently running
  | 'passed'       // completed and validated
  | 'failed'       // ran but validation failed
  | 'skipped'      // intentionally not run (e.g. no internal pages)
  | 'escalated'    // failed and requires human intervention
  | 'supplied';    // output supplied by the intake pack — only valid for
                   // asset-reconstruction on supplied-pack intake, and only
                   // when backed by an input-contract with resolved assets

// ── The 17 operators ──────────────────────────────────────────

export const OPERATOR_IDS = [
  'build-init',           // 0
  'mockup-regions',       // 1
  'asset-reconstruction', // 2  (standalone — external model calls; 'supplied' on pack intake)
  'asset-registry',       // 3  (standalone — post-processes Op 2 output / supplied assets)
  'frontend-build',       // 4
  'visual-qa',            // 5  (automated structural check)
  'human-vision-qa',      // 5b (human-in-the-loop — requires vision model)
  'pixel-correction',     // 6
  'ui-systemisation',     // 7
  'design-system',        // 8
  'core-build-qa',        // 9
  'human-assessment',     // 10 (human approval gate)
  'workspace-build',      // 11 (client workspace package)
  'internal-pages',       // 12
  'cms-integration',      // 13
  'cms-qa',               // 14
  'analytics',            // 15
  'launch-qa',            // 16
  'deployment',           // 17
] as const;

export type OperatorId = (typeof OPERATOR_IDS)[number];

// ── Execution mode ────────────────────────────────────────────

export type ExecutionMode = 'harness' | 'standalone';

// Which operators run in the harness vs standalone
export const EXECUTION_MODE: Record<OperatorId, ExecutionMode> = {
  'build-init':           'harness',
  'mockup-regions':       'harness',
  'asset-reconstruction': 'standalone',
  'asset-registry':       'standalone',
  'frontend-build':       'harness',
  'visual-qa':            'harness',
  'human-vision-qa':      'harness',  // human-in-the-loop — requires vision model switch
  'pixel-correction':     'harness',
  'ui-systemisation':     'harness',
  'design-system':        'harness',
  'core-build-qa':        'harness',
  'human-assessment':     'harness',  // human approval gate — explicit CLI approval required
  'workspace-build':      'harness',
  'internal-pages':       'harness',
  'cms-integration':      'harness',
  'cms-qa':               'harness',
  'analytics':            'harness',
  'launch-qa':            'harness',
  'deployment':           'harness',
};

// ── Operator metadata ─────────────────────────────────────────

export interface OperatorMeta {
  id: OperatorId;
  number: number;
  name: string;
  description: string;
  execution: ExecutionMode;
  skillFile: string;       // relative to operators/skills/
  outputArtifact: string;  // relative to artifacts/
}

export const OPERATORS: OperatorMeta[] = [
  {
    id: 'build-init',
    number: 0,
    name: 'Build Initialisation',
    description: 'Turn mockup + image manifest into a valid factory job',
    execution: 'harness',
    skillFile: 'factory-operators.md',
    outputArtifact: 'build-init.json',
  },
  {
    id: 'mockup-regions',
    number: 1,
    name: 'Mockup Region Decomposition',
    description: 'Decompose mockup into reconstruction regions',
    execution: 'harness',
    skillFile: 'factory-operators.md',
    outputArtifact: 'regions.json',
  },
  {
    id: 'asset-reconstruction',
    number: 2,
    name: 'Asset Reconstruction',
    description: 'Recreate clean production imagery via image generation models',
    execution: 'standalone',
    skillFile: 'factory-operators.md',
    outputArtifact: 'assets-raw/',
  },
  {
    id: 'asset-registry',
    number: 3,
    name: 'Asset Registry',
    description: 'Turn generated images into deterministic website assets',
    execution: 'standalone',
    skillFile: 'factory-operators.md',
    outputArtifact: 'asset-registry.json',
  },
  {
    id: 'frontend-build',
    number: 4,
    name: 'Frontend Reconstruction',
    description: 'Recreate the approved mockup as functioning frontend code',
    execution: 'harness',
    skillFile: 'factory-operators.md',
    outputArtifact: 'frontend-build.json',
  },
  {
    id: 'visual-qa',
    number: 5,
    name: 'Visual QA',
    description: 'Compare rendered website against the approved mockup (automated structural check)',
    execution: 'harness',
    skillFile: 'factory-operators.md',
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
    skillFile: 'factory-operators.md',
    outputArtifact: 'pixel-correction.json',
  },
  {
    id: 'ui-systemisation',
    number: 7,
    name: 'UI Systemisation',
    description: 'Convert visually correct implementation into robust production architecture',
    execution: 'harness',
    skillFile: 'factory-operators.md',
    outputArtifact: 'ui-systemisation.json',
  },
  {
    id: 'design-system',
    number: 8,
    name: 'Design System Extraction',
    description: 'Extract reusable client-specific design grammar',
    execution: 'harness',
    skillFile: 'factory-operators.md',
    outputArtifact: 'design-system.json',
  },
  {
    id: 'core-build-qa',
    number: 9,
    name: 'Core Build QA',
    description: 'Verify the systemised core build',
    execution: 'harness',
    skillFile: 'factory-operators.md',
    outputArtifact: 'core-build-qa.json',
  },
  {
    id: 'human-assessment',
    number: 10,
    name: 'Human Assessment',
    description: 'Human approval gate for the verified core build',
    execution: 'harness',
    skillFile: 'factory-operators.md',
    outputArtifact: 'human-assessment.json',
  },
  {
    id: 'workspace-build',
    number: 11,
    name: 'Workspace Build',
    description: 'Assemble and verify the client workspace package',
    execution: 'harness',
    skillFile: 'workspace-build.md',
    outputArtifact: 'workspace-build.json',
  },
  {
    id: 'internal-pages',
    number: 12,
    name: 'Internal Page Builder',
    description: 'Manufacture remaining website pages from their mockups',
    execution: 'harness',
    skillFile: 'factory-operators.md',
    outputArtifact: 'internal-pages.json',
  },
  {
    id: 'cms-integration',
    number: 13,
    name: 'CMS Integration',
    description: 'Apply SortedUpdates CMS to the approved website',
    execution: 'harness',
    skillFile: 'factory-operators.md',
    outputArtifact: 'cms-integration.json',
  },
  {
    id: 'cms-qa',
    number: 14,
    name: 'CMS QA',
    description: 'Test actual customer editing workflows via Playwright',
    execution: 'harness',
    skillFile: 'factory-operators.md',
    outputArtifact: 'cms-qa.json',
  },
  {
    id: 'analytics',
    number: 15,
    name: 'Analytics',
    description: 'Apply measurement infrastructure',
    execution: 'harness',
    skillFile: 'factory-operators.md',
    outputArtifact: 'analytics.json',
  },
  {
    id: 'launch-qa',
    number: 16,
    name: 'Launch QA',
    description: 'Final production-readiness validation',
    execution: 'harness',
    skillFile: 'factory-operators.md',
    outputArtifact: 'launch-qa.json',
  },
  {
    id: 'deployment',
    number: 17,
    name: 'Deployment',
    description: 'Ship the validated website',
    execution: 'harness',
    skillFile: 'factory-operators.md',
    outputArtifact: 'deployment.json',
  },
];

// ── Per-operator state ────────────────────────────────────────

export interface OperatorState {
  status: OperatorStatus;
  started_at?: string;     // ISO timestamp
  completed_at?: string;   // ISO timestamp
  retry_count: number;
  failure_reason?: string;
  artifact_path?: string;  // relative to build job directory
  notes?: string;          // free-text operator notes
  // Evidence recorded at pass time for artifacts that describe mutable
  // site source. Used to detect stale QA after later source edits.
  evidence?: {
    source_revision?: string;
    input_sha256?: string;
  };
}

// ── Visual QA loop state ──────────────────────────────────────

export interface VisualQALoopState {
  iteration: number;
  max_iterations: number;
  last_discrepancy_count: number;
  passed: boolean;
}

// ── Internal pages state ──────────────────────────────────────

export interface InternalPageState {
  page_id: string;
  page_name: string;
  mockup_reference: string;
  status: OperatorStatus;
  qa_iterations: number;
}

// ── Build state ───────────────────────────────────────────────

export interface BuildState {
  // ── Schema ──
  schema_version: 2;

  // ── Identity ──
  build_id: string;
  client_id: string;
  client_slug: string;

  // ── Input mode ──
  input_mode: 'supplied-pack' | 'legacy';

  // ── Verified source revision ──
  // SHA256 fingerprint of the site source last covered by passing
  // evidence. QA passes record this; source drift blocks resume.
  source_revision: string;

  // ── Authorisations ──
  // Local permission records only — they never execute remote work.
  authorizations: {
    cms: boolean;
    deployment: boolean;
  };
  authorization_log: Array<{
    target: 'cms' | 'deployment';
    by: string;
    reason: string;
    at: string;
  }>;

  // ── Input contract ──
  mockup_reference: string;       // path to approved-mockup.png
  manifest_reference: string;     // path to image-manifest.json

  // ── Build directory ──
  build_dir: string;              // root directory for this build job

  // ── Operator states ──
  operators: Record<OperatorId, OperatorState>;

  // ── Visual QA loop ──
  visual_qa_loop: VisualQALoopState;

  // ── Internal pages ──
  internal_pages: InternalPageState[];

  // ── Overall state ──
  current_operator: OperatorId | null;
  last_completed_operator: OperatorId | null;
  failure_state: string | null;
  retry_count: number;

  // ── Output ──
  site_repo_path: string | null;     // path to the generated site repo
  deployment_url: string | null;
  deployment_commit: string | null;

  // ── Timestamps ──
  created_at: string;
  updated_at: string;
}

// ── Build state factory ───────────────────────────────────────

export function createInitialBuildState(params: {
  build_id: string;
  client_id: string;
  client_slug: string;
  mockup_reference: string;
  manifest_reference: string;
  build_dir: string;
  input_mode?: 'supplied-pack' | 'legacy';
}): BuildState {
  const now = new Date().toISOString();

  const operators = {} as Record<OperatorId, OperatorState>;
  for (const id of OPERATOR_IDS) {
    operators[id] = {
      status: 'pending',
      retry_count: 0,
    };
  }

  return {
    schema_version: 2,
    build_id: params.build_id,
    client_id: params.client_id,
    client_slug: params.client_slug,
    input_mode: params.input_mode ?? 'legacy',
    source_revision: '',
    authorizations: { cms: false, deployment: false },
    authorization_log: [],
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

export const OPERATOR_SEQUENCE: OperatorId[] = [...OPERATOR_IDS];

const TERMINAL_STATUSES: ReadonlySet<string> = new Set(['passed', 'skipped', 'supplied']);
export const KNOWN_STATUSES: ReadonlySet<string> = new Set([
  'pending', 'in_progress', 'passed', 'failed', 'skipped', 'escalated', 'supplied',
]);

export function isTerminalStatus(status: string): boolean {
  return TERMINAL_STATUSES.has(status);
}

// Operators that legitimately mutate site source while running — a source
// fingerprint change is expected while one of these is in_progress.
export const EDIT_STAGES: ReadonlySet<OperatorId> = new Set([
  'frontend-build',
  'pixel-correction',
  'ui-systemisation',
  'internal-pages',
  'cms-integration',
  'analytics',
]);

// Operators whose pass evidence binds to the current source revision and
// input contract hash.
export const EVIDENCE_STAGES: ReadonlySet<OperatorId> = new Set([
  'frontend-build',
  'visual-qa',
  'human-vision-qa',
  'pixel-correction',
  'ui-systemisation',
  'design-system',
  'core-build-qa',
  'human-assessment',
  'workspace-build',
  'internal-pages',
  'cms-integration',
  'cms-qa',
  'analytics',
  'launch-qa',
  'deployment',
]);

// mark-skipped is only ever legal for these stages.
export const SKIPPABLE_OPERATORS: ReadonlySet<OperatorId> = new Set([
  'mockup-regions',   // supplied pack consumed the layout directly
  'pixel-correction', // vision QA reported zero discrepancies
  'internal-pages',   // explicit no-pages artifact
]);

// ── Legacy / reconciliation detection ───────────────────────

// A state needs reconciliation when it is not schema v2, lacks new
// operators, or carries statuses this runtime does not understand
// (e.g. historical 'completed'). Reads of such states must never
// silently convert anything; mutations refuse until `reconcile` runs.
export function stateNeedsReconciliation(state: BuildState): string | null {
  if (state.schema_version !== 2) {
    return 'state predates schema_version 2';
  }
  for (const id of OPERATOR_IDS) {
    const op = state.operators?.[id];
    if (!op) return `missing operator entry: ${id}`;
    if (!KNOWN_STATUSES.has(op.status)) {
      return `unsupported status '${op.status}' on ${id}`;
    }
  }
  for (const id of OPERATOR_IDS) {
    const op = state.operators[id];
    if (op.status === 'supplied' && id !== 'asset-reconstruction') {
      return `'supplied' status is only valid on asset-reconstruction (${id})`;
    }
  }
  if (state.operators['asset-reconstruction']?.status === 'supplied' &&
      state.input_mode !== 'supplied-pack') {
    return `'supplied' status requires supplied-pack input mode`;
  }
  return null;
}

// ── Next-action scheduling ──────────────────────────────────
// Schedules strictly by prerequisites and status — never by
// last_completed_operator alone.

export interface NextAction {
  kind: 'operator' | 'blocked' | 'complete';
  operator_id?: OperatorId;
  reason?: string;
}

// pixel-correction is only required when the vision loop produced
// discrepancies. A passed vision loop with zero discrepancies satisfies it.
function pixelCorrectionSatisfied(state: BuildState): boolean {
  const st = state.operators['pixel-correction'].status;
  if (isTerminalStatus(st)) return true;
  if (st !== 'pending') return false;
  return state.visual_qa_loop.passed === true &&
         state.visual_qa_loop.last_discrepancy_count === 0;
}

function opSatisfied(state: BuildState, id: OperatorId): boolean {
  if (id === 'pixel-correction') return pixelCorrectionSatisfied(state);
  return isTerminalStatus(state.operators[id].status);
}

export function getNextAction(state: BuildState): NextAction {
  // ── Reconciliation gate ────────────────────────────────────
  const legacyReason = stateNeedsReconciliation(state);
  if (legacyReason) {
    return {
      kind: 'blocked',
      reason: `state requires reconciliation (${legacyReason}) — run: factory reconcile <build-dir>`,
    };
  }

  const ops = state.operators;

  // ── Out-of-order detection ─────────────────────────────────
  // A terminal status with non-terminal predecessors means evidence was
  // recorded out of order. That is a reconciliation problem, not a schedule.
  const seen: OperatorId[] = [];
  for (const id of OPERATOR_SEQUENCE) {
    // Only a real terminal status can be "out of order" — the
    // pixel-correction satisfied-pseudo-state is not a completion.
    if (isTerminalStatus(ops[id].status)) {
      const missing = seen.filter(prev => !opSatisfied(state, prev));
      if (missing.length > 0) {
        return {
          kind: 'blocked',
          reason: `out-of-order completion: '${id}' is ${ops[id].status} while prerequisite(s) ${missing.join(', ')} are not complete — reconcile or invalidate`,
        };
      }
    }
    seen.push(id);
  }

  // ── Hard blocks ────────────────────────────────────────────
  const escalated = OPERATOR_SEQUENCE.find(id => ops[id].status === 'escalated');
  if (escalated) {
    return { kind: 'blocked', reason: `operator '${escalated}' is escalated — human intervention required` };
  }

  const running = OPERATOR_SEQUENCE.find(id => ops[id].status === 'in_progress');
  if (running) {
    return { kind: 'blocked', operator_id: running, reason: `operator '${running}' is already in progress` };
  }

  // ── Vision correction loop ─────────────────────────────────
  // visual-qa or human-vision-qa failed → pixel-correction while budget
  // remains. Budget exhausted → blocked for escalation; never loop again.
  const vqa = ops['visual-qa'].status;
  const hvqa = ops['human-vision-qa'].status;
  if (vqa === 'failed' || hvqa === 'failed') {
    const failedOp = vqa === 'failed' ? 'visual-qa' : 'human-vision-qa';
    if (state.visual_qa_loop.iteration >= state.visual_qa_loop.max_iterations) {
      return {
        kind: 'blocked',
        operator_id: failedOp,
        reason: `vision correction budget exhausted (${state.visual_qa_loop.iteration}/${state.visual_qa_loop.max_iterations}) after '${failedOp}' failure — escalate to a human`,
      };
    }
    const pixel = ops['pixel-correction'].status;
    if (pixel === 'pending' || pixel === 'failed') {
      return { kind: 'operator', operator_id: 'pixel-correction' };
    }
    return { kind: 'blocked', reason: `pixel-correction is '${pixel}' while '${failedOp}' has failed — inconsistent state` };
  }

  // ── Linear prerequisite scheduling ─────────────────────────
  for (const id of OPERATOR_SEQUENCE) {
    const st = ops[id].status;
    if (opSatisfied(state, id)) continue;
    if (st === 'pending' || st === 'failed') {
      // failed normal stage → retry the same stage
      return { kind: 'operator', operator_id: id };
    }
    // supplied/in_progress/escalated already handled or impossible here
    return { kind: 'blocked', operator_id: id, reason: `operator '${id}' has unschedulable status '${st}'` };
  }

  return { kind: 'complete' };
}

// Compatibility shim: returns the operator id only when the next action is
// a dispatchable operator; null for blocked and complete alike. Callers that
// need to distinguish must use getNextAction.
export function getNextOperator(state: BuildState): OperatorId | null {
  const action = getNextAction(state);
  return action.kind === 'operator' ? (action.operator_id ?? null) : null;
}

export function getOperatorMeta(id: OperatorId): OperatorMeta {
  const meta = OPERATORS.find(o => o.id === id);
  if (!meta) throw new Error(`Unknown operator: ${id}`);
  return meta;
}
