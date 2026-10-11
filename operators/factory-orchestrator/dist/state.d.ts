export type OperatorStatus = 'pending' | 'in_progress' | 'passed' | 'failed' | 'skipped' | 'escalated' | 'supplied';
export declare const OPERATOR_IDS: readonly ["build-init", "mockup-regions", "asset-reconstruction", "asset-registry", "frontend-build", "visual-qa", "human-vision-qa", "pixel-correction", "ui-systemisation", "design-system", "core-build-qa", "human-assessment", "workspace-build", "internal-pages", "cms-integration", "cms-qa", "analytics", "launch-qa", "deployment"];
export type OperatorId = (typeof OPERATOR_IDS)[number];
export type ExecutionMode = 'harness' | 'standalone';
export declare const EXECUTION_MODE: Record<OperatorId, ExecutionMode>;
export interface OperatorMeta {
    id: OperatorId;
    number: number;
    name: string;
    description: string;
    execution: ExecutionMode;
    skillFile: string;
    outputArtifact: string;
}
export declare const OPERATORS: OperatorMeta[];
export interface OperatorState {
    status: OperatorStatus;
    started_at?: string;
    completed_at?: string;
    retry_count: number;
    failure_reason?: string;
    artifact_path?: string;
    notes?: string;
    evidence?: {
        source_revision?: string;
        input_sha256?: string;
    };
}
export interface VisualQALoopState {
    iteration: number;
    max_iterations: number;
    last_discrepancy_count: number;
    passed: boolean;
}
export interface InternalPageState {
    page_id: string;
    page_name: string;
    mockup_reference: string;
    status: OperatorStatus;
    qa_iterations: number;
}
export interface BuildState {
    schema_version: 2;
    build_id: string;
    client_id: string;
    client_slug: string;
    input_mode: 'supplied-pack' | 'legacy';
    source_revision: string;
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
    mockup_reference: string;
    manifest_reference: string;
    build_dir: string;
    operators: Record<OperatorId, OperatorState>;
    visual_qa_loop: VisualQALoopState;
    internal_pages: InternalPageState[];
    current_operator: OperatorId | null;
    last_completed_operator: OperatorId | null;
    failure_state: string | null;
    retry_count: number;
    site_repo_path: string | null;
    deployment_url: string | null;
    deployment_commit: string | null;
    created_at: string;
    updated_at: string;
}
export declare function createInitialBuildState(params: {
    build_id: string;
    client_id: string;
    client_slug: string;
    mockup_reference: string;
    manifest_reference: string;
    build_dir: string;
    input_mode?: 'supplied-pack' | 'legacy';
}): BuildState;
export declare const OPERATOR_SEQUENCE: OperatorId[];
export declare const KNOWN_STATUSES: ReadonlySet<string>;
export declare function isTerminalStatus(status: string): boolean;
export declare const EDIT_STAGES: ReadonlySet<OperatorId>;
export declare const EVIDENCE_STAGES: ReadonlySet<OperatorId>;
export declare const SKIPPABLE_OPERATORS: ReadonlySet<OperatorId>;
export declare function stateNeedsReconciliation(state: BuildState): string | null;
export interface NextAction {
    kind: 'operator' | 'blocked' | 'complete';
    operator_id?: OperatorId;
    reason?: string;
}
export declare function getNextAction(state: BuildState): NextAction;
export declare function getNextOperator(state: BuildState): OperatorId | null;
export declare function getOperatorMeta(id: OperatorId): OperatorMeta;
