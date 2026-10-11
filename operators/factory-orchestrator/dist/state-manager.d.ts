import { type BuildState, type OperatorId, type OperatorStatus } from './state.js';
export declare function stateFilePath(buildDir: string): string;
export declare function lockFilePath(buildDir: string): string;
export declare function legacyStateFilePath(buildDir: string): string;
export declare function artifactsDir(buildDir: string): string;
export declare function artifactPath(buildDir: string, relativePath: string): string;
export declare function validateStateShape(raw: unknown): string[];
export declare function readBuildState(buildDir: string): BuildState | null;
export declare function writeBuildState(state: BuildState, options?: {
    expectedUpdatedAt?: string;
}): void;
export declare function acquireStateLock(buildDir: string): () => void;
export declare function createBuildJob(params: {
    client_id: string;
    client_slug: string;
    mockup_reference: string;
    manifest_reference: string;
    build_dir: string;
    input_mode?: 'supplied-pack' | 'legacy';
}): BuildState;
export declare function setOperatorStatus(state: BuildState, operatorId: OperatorId, status: OperatorStatus, options?: {
    artifactPath?: string;
    failureReason?: string;
    notes?: string;
    evidence?: {
        source_revision?: string;
        input_sha256?: string;
    };
    expectedUpdatedAt?: string;
    allowUnreconciled?: boolean;
}): BuildState;
export declare function incrementVisualQALoop(state: BuildState, expectedUpdatedAt?: string): BuildState;
export declare function setVisualQAPassed(state: BuildState, passed: boolean, discrepancyCount: number, expectedUpdatedAt?: string): BuildState;
export declare function setInternalPages(state: BuildState, pages: InternalPageStateInput[]): BuildState;
interface InternalPageStateInput {
    page_id: string;
    page_name: string;
    mockup_reference: string;
}
export declare function reconcileBuildState(buildDir: string): {
    reconciled: boolean;
    preservedTo?: string;
    resets: string[];
    notes: string[];
};
export declare function resumeBuild(buildDir: string): BuildState;
export declare function statusSummary(state: BuildState): string;
export {};
