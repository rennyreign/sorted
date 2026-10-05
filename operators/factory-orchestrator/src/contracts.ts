// ─────────────────────────────────────────────────────────────
// Artifact Contracts — validation schemas for every operator output
//
// Each operator produces an artifact. The orchestrator validates
// it against these schemas before marking the operator as passed.
//
// These schemas are the machine-readable contract between operators.
// ─────────────────────────────────────────────────────────────

// ── Operator 0: build-init.json ───────────────────────────────

export interface BuildInitArtifact {
  build_id: string;
  client_id: string;
  client_slug: string;
  mockup_path: string;
  manifest_path: string;
  build_dir: string;
  initialized_at: string;
}

// ── Operator 1: regions.json ──────────────────────────────────

export interface Region {
  id: string;              // e.g. "hero", "hero_image", "services", "service_image_01"
  type: string;            // "section" | "image" | "asset"
  section?: string;        // parent section if this is an image/asset region
  label?: string;
  bbox: { x: number; y: number; w: number; h: number };
  crop_path?: string;      // relative path to cropped image (for image regions)
  asset_id?: string;       // links to image-manifest entry
  notes?: string;
}

export interface RegionsArtifact {
  mockup_path: string;
  regions: Region[];
  deconstruction: {        // richer output preserved for downstream operators
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
      bbox?: { x: number; y: number; w: number; h: number };
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

// ── Operator 2: assets-raw/ (directory of raw images) ────────
// No JSON artifact — the output is the directory of images.
// Validation = check that expected asset IDs have files.

// ── Operator 3: asset-registry.json ───────────────────────────

export interface RegistryEntry {
  asset_id: string;          // matches manifest/deconstruction asset id
  production_path: string;   // e.g. "/images/home/hero-primary.webp"
  file_path: string;         // absolute or relative path to the file
  format: string;            // "webp" | "jpg" | "png" | "svg"
  variants: {
    original?: string;
    lg?: string;             // 1920px
    md?: string;             // 1024px
    sm?: string;             // 640px
    xs?: string;             // 320px
  };
  width?: number;
  height?: number;
  aspect_ratio?: string;
  source_model?: string;     // what model generated/reconstructed it
  ai_placeholder_human?: boolean;
  notes?: string;
}

export interface AssetRegistryArtifact {
  generated_at: string;
  assets: RegistryEntry[];
}

// ── Operator 4: frontend-build.json ───────────────────────────

export interface FrontendBuildArtifact {
  site_repo_path: string;
  build_passed: boolean;
  build_output?: string;     // last N lines of build output
  sections_generated: string[];
  assets_resolved: number;
  assets_total: number;
  generated_at: string;
}

// ── Operator 5: visual-qa.json ────────────────────────────────

export interface Discrepancy {
  id: string;                // e.g. "VQ-001"
  location: string;          // e.g. "hero section, headline"
  expected: string;          // what the mockup shows
  observed: string;          // what the rendered site shows
  severity: 'blocker' | 'warning' | 'note';
  confidence: number;        // 0-1
  recommended_correction: string;
  viewport?: string;         // "390px" | "768px" | "1440px"
}

export interface VisualQAArtifact {
  iteration: number;
  mockup_path: string;
  screenshot_paths: string[];  // paths to screenshots at each viewport
  discrepancies: Discrepancy[];
  blocker_count: number;
  warning_count: number;
  passed: boolean;             // true if zero blockers
  checked_at: string;
}

// ── Operator 6: pixel-correction.json ─────────────────────────

export interface PixelCorrectionArtifact {
  iteration: number;
  discrepancies_addressed: string[];   // discrepancy IDs
  files_modified: string[];
  corrections_summary: string;
  corrected_at: string;
}

// ── Operator 7: ui-systemisation.json ─────────────────────────

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

// ── Operator 8: design-system.json ────────────────────────────

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
    type_scale: Array<{ name: string; size: string; weight?: string; line_height?: string }>;
  };
  spacing: DesignToken[];
  containers: DesignToken[];
  grid?: {
    columns?: number;
    gap?: string;
    behavior?: string;
  };
  button_families: Array<{ name: string; description: string }>;
  cards: Array<{ name: string; description: string }>;
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

// ── Operator 9: core-build-qa.json ────────────────────────────

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

// ── Operator 10: internal-pages.json ──────────────────────────

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

// ── Operator 11: cms-integration.json ─────────────────────────

export interface CMSFieldMapping {
  field_name: string;
  field_type: string;       // "text" | "textarea" | "image" | "list" | etc.
  content_path: string;     // where in the site it maps
  section?: string;
}

export interface CMSIntegrationArtifact {
  cms_path: string;           // "/cms/"
  field_mappings: CMSFieldMapping[];
  auth_configured: boolean;
  baseline_committed: boolean;
  integrated_at: string;
}

// ── Operator 12: cms-qa.json ──────────────────────────────────

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

// ── Operator 13: analytics.json ───────────────────────────────

export interface AnalyticsEvent {
  event_name: string;
  trigger: string;          // "form_submit" | "phone_click" | etc.
  verified: boolean;
}

export interface AnalyticsArtifact {
  measurement_id?: string;
  gtm_container_id?: string;
  events: AnalyticsEvent[];
  all_events_verified: boolean;
  applied_at: string;
}

// ── Operator 14: launch-qa.json ───────────────────────────────
// Reuses the existing launch-qa.md skill format

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
  gates: Record<string, string>;   // gate name → "PASS" | "FAIL" | etc.
  issues: LaunchQAIssue[];
}

// ── Operator 15: deployment.json ──────────────────────────────

export interface DeploymentArtifact {
  deployment_url: string;
  deployment_commit: string;
  deployment_platform: string;   // "netlify" | "vercel" | etc.
  deployed_at: string;
  production_verified: boolean;
}
