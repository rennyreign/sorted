export interface BuildInitArtifact {
    build_id: string;
    client_id: string;
    client_slug: string;
    mockup_path: string;
    manifest_path: string;
    build_dir: string;
    initialized_at: string;
}
export interface Region {
    id: string;
    type: string;
    section?: string;
    label?: string;
    bbox: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    crop_path?: string;
    asset_id?: string;
    notes?: string;
}
export interface RegionsArtifact {
    mockup_path: string;
    regions: Region[];
    deconstruction: {
        page_type?: string;
        sections: Array<{
            id: string;
            type: string;
            position: number;
            label?: string;
            layout?: string;
            theme?: string;
            background?: string;
        }>;
        assets: Array<{
            id: string;
            type: string;
            description: string;
            priority: string;
            source: string;
            section?: string;
            slot?: string;
            aspect_ratio?: string;
            bbox?: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            mode_hint?: string;
        }>;
        copy: Array<{
            section: string;
            type: string;
            text: string;
        }>;
        components: Array<{
            component: string;
            section?: string;
        }>;
        build_notes: {
            layout?: string;
            style?: string;
            theme?: string;
            accent_color?: string;
            primary_font?: string;
            secondary_font?: string;
            animation?: string;
            grid?: string;
            notes?: string[];
        };
    };
    meta: {
        generated_at: string;
        source_image: string;
        model_used: string;
    };
}
export interface RegistryEntry {
    asset_id: string;
    production_path: string;
    file_path: string;
    format: string;
    variants: {
        original?: string;
        lg?: string;
        md?: string;
        sm?: string;
        xs?: string;
    };
    width?: number;
    height?: number;
    aspect_ratio?: string;
    source_model?: string;
    ai_placeholder_human?: boolean;
    notes?: string;
}
export interface AssetRegistryArtifact {
    generated_at: string;
    assets: RegistryEntry[];
}
export interface FrontendBuildArtifact {
    site_repo_path: string;
    build_passed: boolean;
    build_output?: string;
    sections_generated: string[];
    assets_resolved: number;
    assets_total: number;
    generated_at: string;
}
export interface Discrepancy {
    id: string;
    location: string;
    expected: string;
    observed: string;
    severity: 'blocker' | 'warning' | 'note';
    confidence: number;
    recommended_correction: string;
    viewport?: string;
}
export interface VisualQAArtifact {
    iteration: number;
    mockup_path: string;
    screenshot_paths: string[];
    discrepancies: Discrepancy[];
    blocker_count: number;
    warning_count: number;
    passed: boolean;
    checked_at: string;
}
export interface PixelCorrectionArtifact {
    iteration: number;
    discrepancies_addressed: string[];
    files_modified: string[];
    corrections_summary: string;
    corrected_at: string;
}
export interface SystemisationChange {
    file: string;
    change: string;
    reason: string;
}
export interface UISystemisationArtifact {
    changes: SystemisationChange[];
    components_introduced: string[];
    duplication_removed: number;
    visual_fidelity_preserved: boolean;
    systemised_at: string;
}
export interface DesignToken {
    name: string;
    value: string;
    usage?: string;
}
export interface DesignSystemArtifact {
    client_slug: string;
    color_tokens: DesignToken[];
    typography: {
        primary_font?: string;
        secondary_font?: string;
        type_scale: Array<{
            name: string;
            size: string;
            weight?: string;
            line_height?: string;
        }>;
    };
    spacing: DesignToken[];
    containers: DesignToken[];
    grid?: {
        columns?: number;
        gap?: string;
        behavior?: string;
    };
    button_families: Array<{
        name: string;
        description: string;
    }>;
    cards: Array<{
        name: string;
        description: string;
    }>;
    image_treatments: string[];
    borders: DesignToken[];
    radius: DesignToken[];
    shadows: DesignToken[];
    navigation_patterns: string[];
    section_patterns: string[];
    cta_treatments: string[];
    interaction_behavior: string[];
    responsive_rules: string[];
    extracted_at: string;
}
export interface CoreBuildQACheck {
    check: string;
    passed: boolean;
    details?: string;
}
export interface CoreBuildQAArtifact {
    checks: CoreBuildQACheck[];
    overall_passed: boolean;
    build_output?: string;
    checked_at: string;
}
export interface InternalPageResult {
    page_id: string;
    page_name: string;
    status: 'passed' | 'failed' | 'skipped';
    qa_iterations: number;
    path: string;
}
export interface InternalPagesArtifact {
    pages: InternalPageResult[];
    all_passed: boolean;
    completed_at: string;
}
export interface CMSFieldMapping {
    field_name: string;
    field_type: string;
    content_path: string;
    section?: string;
}
export interface CMSIntegrationArtifact {
    cms_path: string;
    field_mappings: CMSFieldMapping[];
    auth_configured: boolean;
    baseline_committed: boolean;
    integrated_at: string;
}
export interface CMSQATest {
    test: string;
    passed: boolean;
    details?: string;
}
export interface CMSQAArtifact {
    tests: CMSQATest[];
    overall_passed: boolean;
    tested_at: string;
}
export interface AnalyticsEvent {
    event_name: string;
    trigger: string;
    verified: boolean;
}
export interface AnalyticsArtifact {
    measurement_id?: string;
    gtm_container_id?: string;
    events: AnalyticsEvent[];
    all_events_verified: boolean;
    applied_at: string;
}
export interface LaunchQAGate {
    gate: string;
    status: 'PASS' | 'FAIL' | 'WARNING' | 'SKIP';
    details?: string;
}
export interface LaunchQAIssue {
    id: string;
    severity: 'BLOCKER' | 'WARNING' | 'NOTE';
    gate: string;
    page?: string;
    expected: string;
    actual: string;
    owner: string;
    evidence?: string;
}
export interface LaunchQAArtifact {
    client: string;
    status: 'PASS' | 'FAIL' | 'PASS_WITH_WARNINGS';
    tested_url: string;
    canonical_domain?: string;
    checked_at: string;
    branch?: string;
    commit?: string;
    gates: Record<string, string>;
    issues: LaunchQAIssue[];
}
export interface DeploymentArtifact {
    deployment_url: string;
    deployment_commit: string;
    deployment_platform: string;
    deployed_at: string;
    production_verified: boolean;
}
