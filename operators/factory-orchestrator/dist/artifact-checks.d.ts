import type { BuildState, OperatorId } from './state.js';
import type { InputContract } from './pack-intake.js';
export interface PassContext {
    state: BuildState;
    buildDir: string;
    artifact: Record<string, unknown> | null;
    artifactRel: string;
    flags: {
        humanApproval: boolean;
        reviewer?: string;
    };
}
export declare function inputContractSha(buildDir: string): string | null;
export declare function loadInputContract(buildDir: string): InputContract | null;
export declare function siteRoot(state: BuildState): string;
export declare function currentFingerprint(state: BuildState): string;
export declare function validateWorkspaceBrief(buildDir: string, state: BuildState): string[];
export declare function validateArtifact(operatorId: OperatorId, ctx: PassContext): string[];
