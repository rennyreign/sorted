// ─────────────────────────────────────────────────────────────
// Asset Generator — Zod Validation Schema
// ─────────────────────────────────────────────────────────────

import { z } from 'zod';

// ── Input asset (from deconstruction JSON) ────────────────────

export const BoundingBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number().positive(),
  h: z.number().positive(),
});

export const InputAssetSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  source: z.enum(['reuse', 'generate', 'stock']),
  section: z.string().optional(),
  slot: z.string().optional(),
  aspect_ratio: z.string().optional(),
  bbox: BoundingBoxSchema.optional(),
  variants: z.array(z.string()).optional(),
  mode_hint: z.enum(['extract', 'recreate']).optional(),
  notes: z.string().optional(),
});

export const DeconstructionJSONSchema = z.object({
  page_type: z.string().optional(),
  assets: z.array(InputAssetSchema).min(1, 'Deconstruction JSON must include at least one asset'),
  build_notes: z
    .object({
      style: z.string().optional(),
      theme: z.string().optional(),
      accent_color: z.string().optional(),
      primary_font: z.string().optional(),
    })
    .optional(),
  meta: z
    .object({
      source_image: z.string().optional(),
    })
    .optional(),
});

// ── Output schemas ────────────────────────────────────────────

export const AssetFilesSchema = z.object({
  original: z.string(),
  lg: z.string().optional(),
  md: z.string().optional(),
  sm: z.string().optional(),
  xs: z.string().optional(),
});

export const AssetResultSchema = z.object({
  id: z.string(),
  mode: z.enum(['extract', 'recreate', 'source', 'reuse', 'skip']),
  status: z.enum(['ok', 'failed', 'skipped']),
  files: AssetFilesSchema.partial(),
  meta: z.object({
    format: z.enum(['webp', 'jpg', 'png']),
    aspect_ratio: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    source_model: z.string().optional(),
    prompt_used: z.string().optional(),
    extracted_from: z.string().optional(),
    error: z.string().optional(),
  }),
});

export const ManifestSchema = z.object({
  mockup: z.string(),
  deconstruction: z.string(),
  generated_at: z.string(),
  operator_version: z.string(),
  assets: z.array(AssetResultSchema),
});

// ── Validation helpers ────────────────────────────────────────

export function validateDeconstruction(data: unknown) {
  return DeconstructionJSONSchema.safeParse(data);
}

export function validateManifest(data: unknown) {
  return ManifestSchema.safeParse(data);
}

export type ValidatedDeconstruction = z.infer<typeof DeconstructionJSONSchema>;
