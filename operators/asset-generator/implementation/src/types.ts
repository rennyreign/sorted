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

export type ExecutionMode = 'extract' | 'recreate' | 'source' | 'reuse' | 'skip' | 'human_review' | 'excluded';

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
    estimated_cost_usd?: number;
    ladder_attempts?: LadderAttempt[];
    is_human_asset?: boolean;
    real_photo_used?: string;
    ai_placeholder_human?: boolean; // AI-generated human standing in for real photography — replace when a real shoot is available
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

export type GenerationModel =
  | 'dall-e-3'
  | 'gpt-image-1'
  | 'flux-pro-1.1'
  | 'flux-pro-1.1-ultra'
  | 'flux-2-klein-4b'
  | 'flux-2-klein-9b'
  | 'flux-2-pro'
  | 'flux-2-flex'
  | 'flux-2-max';

// Rendering fidelity for gpt-image-1 — controls sampling compute, not resolution.
// Ignored by dall-e-3 (always 'hd') and Flux models (no quality tiers).
export type GenerationQuality = 'low' | 'medium' | 'high';

export interface AssetGeneratorConfig {
  mockupPath: string;
  deconstructionPath: string;
  outputDir: string;
  format: OutputFormat;
  model: GenerationModel;
  quality?: GenerationQuality;        // gpt-image-1 only; default 'high'
  priorityFilter?: AssetPriority[];   // only process these priorities; default = all
  dryRun?: boolean;
  verbose?: boolean;
  skipExisting?: boolean;
  ladder?: boolean;                   // run the cost-escalation decision tree instead of a fixed model
  similarityThreshold?: number;       // 0-100, default 75 — min score to accept a ladder rung
  realPhotosDir?: string;             // directory of client-supplied real photos, keyed by asset id or filename
  realPhotosMap?: string;             // path to a JSON file mapping asset_id -> filename in realPhotosDir
}

// ── Cost-escalation ladder ──────────────────────────────────────
// Routing:
//   crop -> classify (human vs non-human, free — reuses deconstruction `type`)
//     human:      real photo available? -> GPT edit/upscale it   (else) -> GPT generate placeholder human
//     non-human:  crop already big enough? -> extract ($0)       (else, small gap) -> sharp upscale ($0)
//                                                                 (else, or upscale insufficient) -> flux-2-flex -> flux-2-max -> human review

export type LadderRung =
  | 'upscale'            // free: direct extract or sharp upscale
  | 'gpt-human-edit'     // real client photo supplied — GPT reconstructs/upscales it
  | 'gpt-reconstruct'    // no real photo, but a mockup crop exists — GPT reconstructs from that reference
  | 'gpt-human-generate' // no real photo AND no bbox — last-resort blind text generation, flagged
  | 'flux-flex'          // non-human — first Flux attempt (image-edit from crop if available, else text)
  | 'flux-max';          // non-human — escalation if flex fails the judge

export interface LadderAttempt {
  rung: LadderRung;
  model: string;              // 'sharp-extract' / 'sharp-upscale' for the free rung, else a GenerationModel
  cost: number;
  pass: boolean;
  score?: number;             // vision-judge score, 0-100 (generation rungs only)
  reasoning?: string;
  outputPath?: string;
}

export interface LadderResult {
  finalMode: 'extract' | 'extract-upscale' | 'recreate' | 'human_review' | 'excluded';
  attempts: LadderAttempt[];
  totalCost: number;
  chosen?: LadderAttempt;
  isHumanAsset: boolean;
  realPhotoUsed?: string;
  aiPlaceholderHuman?: boolean; // true when the export is not verified real client photography (reconstructed from a mockup crop, or fully generated)
}
