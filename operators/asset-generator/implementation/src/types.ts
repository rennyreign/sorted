// ─────────────────────────────────────────────────────────────
// Asset Generator — Type Definitions
// ─────────────────────────────────────────────────────────────

// ── Input types (from Mockup Deconstructor output) ────────────

export type AssetSource = 'reuse' | 'generate' | 'stock';
export type AssetPriority = 'critical' | 'high' | 'medium' | 'low';

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface InputAsset {
  id: string;
  type: string;
  description: string;
  priority: AssetPriority;
  source: AssetSource;
  section?: string;
  slot?: string;
  aspect_ratio?: string;
  bbox?: BoundingBox;
  variants?: string[];
  mode_hint?: 'extract' | 'recreate';
  notes?: string;
}

export interface DeconstructionJSON {
  page_type?: string;
  assets: InputAsset[];
  build_notes?: {
    style?: string;
    theme?: string;
    accent_color?: string;
    primary_font?: string;
  };
  meta?: {
    source_image?: string;
  };
}

// ── Execution modes ───────────────────────────────────────────

export type ExecutionMode = 'extract' | 'recreate' | 'source' | 'reuse' | 'skip';

// ── Output size variants ──────────────────────────────────────

export type SizeVariant = 'original' | 'lg' | 'md' | 'sm' | 'xs';

export interface SizeSpec {
  name: SizeVariant;
  width: number;
  height?: number;   // if omitted, maintains aspect ratio
}

export const SIZE_VARIANTS: SizeSpec[] = [
  { name: 'lg',   width: 1920 },
  { name: 'md',   width: 1024 },
  { name: 'sm',   width: 640  },
  { name: 'xs',   width: 320  },
];

// ── Output format ─────────────────────────────────────────────

export type OutputFormat = 'webp' | 'jpg' | 'png';

// ── Per-asset result ──────────────────────────────────────────

export interface AssetFiles {
  original: string;
  lg?: string;
  md?: string;
  sm?: string;
  xs?: string;
}

export interface AssetResult {
  id: string;
  mode: ExecutionMode;
  status: 'ok' | 'failed' | 'skipped';
  files: Partial<AssetFiles>;
  meta: {
    format: OutputFormat;
    aspect_ratio?: string;
    width?: number;
    height?: number;
    source_model?: string;
    prompt_used?: string;
    extracted_from?: string;
    error?: string;
  };
}

// ── Manifest ──────────────────────────────────────────────────

export interface Manifest {
  mockup: string;
  deconstruction: string;
  generated_at: string;
  operator_version: string;
  assets: AssetResult[];
}

// ── Generation log entry ──────────────────────────────────────

export interface LogEntry {
  asset_id: string;
  mode: ExecutionMode;
  status: 'ok' | 'failed' | 'skipped';
  duration_ms: number;
  model?: string;
  prompt?: string;
  error?: string;
  timestamp: string;
}

// ── Config ────────────────────────────────────────────────────

export type GenerationModel = 'dall-e-3' | 'gpt-image-1';

export interface AssetGeneratorConfig {
  mockupPath: string;
  deconstructionPath: string;
  outputDir: string;
  format: OutputFormat;
  model: GenerationModel;
  priorityFilter?: AssetPriority[];   // only process these priorities; default = all
  dryRun?: boolean;
  verbose?: boolean;
  skipExisting?: boolean;
}
