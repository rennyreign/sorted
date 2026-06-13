// ─────────────────────────────────────────────────────────────
// Frontend Builder — Type Definitions
// ─────────────────────────────────────────────────────────────

// ── Deconstruction input (from Mockup Deconstructor) ─────────

export interface DeconstructionSection {
  id: string;
  type: string;
  position: number;
  label?: string;
  layout?: string;
  theme?: string;
  background?: string;
  notes?: string;
}

export interface DeconstructionAsset {
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
  notes?: string;
}

export interface DeconstructionCopyBlock {
  section: string;
  type: string;
  text: string;
  notes?: string;
}

export interface DeconstructionComponent {
  component: string;
  section?: string;
  description?: string;
  variant?: string;
}

export interface DeconstructionBuildNotes {
  layout?: string;
  style?: string;
  theme?: string;
  accent_color?: string;
  primary_font?: string;
  secondary_font?: string;
  responsive_priority?: boolean;
  animation?: string;
  grid?: string;
  notes?: string[];
}

export interface DeconstructionJSON {
  page_type: string;
  sections: DeconstructionSection[];
  assets: DeconstructionAsset[];
  components: DeconstructionComponent[];
  copy: DeconstructionCopyBlock[];
  build_notes: DeconstructionBuildNotes;
  meta?: {
    source_image?: string;
    model_used?: string;
    generated_at?: string;
    operator_version?: string;
  };
}

// ── Asset manifest (from Asset Generator) ────────────────────

export interface ManifestAssetFiles {
  original?: string;
  lg?: string;
  md?: string;
  sm?: string;
  xs?: string;
}

export interface ManifestAsset {
  id: string;
  mode: string;
  status: string;
  files: ManifestAssetFiles;
  meta: {
    format?: string;
    width?: number;
    height?: number;
    source_model?: string;
    prompt_used?: string;
    aspect_ratio?: string;
    extracted_from?: string;
    error?: string;
  };
}

export interface AssetManifest {
  mockup: string;
  deconstruction: string;
  generated_at: string;
  operator_version: string;
  assets: ManifestAsset[];
}

// ── Build config ──────────────────────────────────────────────

export interface BuildConfig {
  deconstructionPath: string;
  manifestPath: string;
  assetsDir: string;
  outputDir: string;
  templateDir: string;
  clientSlug: string;
  verbose?: boolean;
  dryRun?: boolean;
  tier?: 'standard' | 'premium';
}

// ── Per-section generation plan ───────────────────────────────

export type GenerationTarget =
  | 'page'           // app/page.tsx — homepage assembler
  | 'layout'         // app/layout.tsx — metadata + fonts
  | 'nav'            // components/Nav.tsx
  | 'footer'         // components/Footer.tsx
  | 'globals'        // app/globals.css — colour variables
  | 'section';       // individual section component

export interface SectionPlan {
  target: GenerationTarget;
  sectionId?: string;
  componentName?: string;
  outputPath: string;
  sections: DeconstructionSection[];   // sections relevant to this file
  copy: DeconstructionCopyBlock[];     // copy relevant to this file
  assets: ResolvedAsset[];             // assets relevant to this file
  notes: string;
}

// ── Resolved asset (deconstruction + manifest merged) ────────

export interface ResolvedAsset {
  id: string;
  type: string;
  description: string;
  priority: string;
  slot?: string;
  aspect_ratio?: string;
  files: ManifestAssetFiles;
  status: string;
}

// ── Build result ──────────────────────────────────────────────

export interface FileResult {
  outputPath: string;
  target: GenerationTarget;
  status: 'ok' | 'failed' | 'skipped' | 'copied';
  duration_ms: number;
  error?: string;
}

export interface BuildResult {
  clientSlug: string;
  outputDir: string;
  tier: 'standard' | 'premium';
  files: FileResult[];
  generatedAt: string;
}
