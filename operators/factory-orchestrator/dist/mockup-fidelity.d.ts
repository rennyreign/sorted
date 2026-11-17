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
export declare function evaluateMockupFidelity(buildDir: string): FidelityDecision;
