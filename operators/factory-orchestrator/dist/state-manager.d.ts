import { type BuildState, type OperatorId, type OperatorStatus } from './state.js';
export declare function stateFilePath(buildDir: string): string;
export declare function artifactsDir(buildDir: string): string;
export declare function artifactPath(buildDir: string, relativePath: string): string;
export declare function readBuildState(buildDir: string): BuildState | null;
export declare function writeBuildState(state: BuildState): void;
export declare function createBuildJob(params: {
    client_id: string;
    client_slug: string;
    mockup_reference: string;
    manifest_reference: string;
    build_dir: string;
}): BuildState;
export declare function setOperatorStatus(state: BuildState, operatorId: OperatorId, status: OperatorStatus, options?: {
    artifactPath?: string;
    failureReason?: string;
    notes?: string;
}): BuildState;
export declare function incrementVisualQALoop(state: BuildState): BuildState;
export declare function setVisualQAPassed(state: BuildState, passed: boolean, discrepancyCount: number): BuildState;
export declare function setInternalPages(state: BuildState, pages: InternalPageStateInput[]): BuildState;
interface InternalPageStateInput {
    page_id: string;
    page_name: string;
    mockup_reference: string;
}
export declare function resumeBuild(buildDir: string): BuildState;
export declare function statusSummary(state: BuildState): string;
export {};
