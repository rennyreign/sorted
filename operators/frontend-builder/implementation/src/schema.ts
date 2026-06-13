// ─────────────────────────────────────────────────────────────
// Frontend Builder — Zod Validation Schema
// ─────────────────────────────────────────────────────────────

import { z } from 'zod';

export const DeconstructionSectionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: z.number().int().min(1),
  label: z.string().optional(),
  layout: z.string().optional(),
  theme: z.string().optional(),
  background: z.string().optional(),
  notes: z.string().optional(),
});

export const DeconstructionAssetSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
  priority: z.string().min(1),
  source: z.string().min(1),
  section: z.string().optional(),
  slot: z.string().optional(),
  aspect_ratio: z.string().optional(),
  bbox: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }).optional(),
  mode_hint: z.string().optional(),
  notes: z.string().optional(),
});

export const CopyBlockSchema = z.object({
  section: z.string().min(1),
  type: z.string().min(1),
  text: z.string().min(1),
  notes: z.string().optional(),
});

export const ComponentSchema = z.object({
  component: z.string().min(1),
  section: z.string().optional(),
  description: z.string().optional(),
  variant: z.string().optional(),
});

export const BuildNotesSchema = z.object({
  layout: z.string().optional(),
  style: z.string().optional(),
  theme: z.string().optional(),
  accent_color: z.string().optional(),
  primary_font: z.string().optional(),
  secondary_font: z.string().optional(),
  responsive_priority: z.boolean().optional(),
  animation: z.string().optional(),
  grid: z.string().optional(),
  notes: z.array(z.string()).optional(),
});

export const DeconstructionJSONSchema = z.object({
  page_type: z.string().min(1),
  sections: z.array(DeconstructionSectionSchema).min(1),
  assets: z.array(DeconstructionAssetSchema),
  components: z.array(ComponentSchema),
  copy: z.array(CopyBlockSchema),
  build_notes: BuildNotesSchema,
  meta: z.object({
    source_image: z.string().optional(),
    model_used: z.string().optional(),
    generated_at: z.string().optional(),
    operator_version: z.string().optional(),
  }).optional(),
});

export const ManifestAssetSchema = z.object({
  id: z.string().min(1),
  mode: z.string().min(1),
  status: z.string().min(1),
  files: z.object({
    original: z.string().optional(),
    lg: z.string().optional(),
    md: z.string().optional(),
    sm: z.string().optional(),
    xs: z.string().optional(),
  }),
  meta: z.object({
    format: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    source_model: z.string().optional(),
    prompt_used: z.string().optional(),
    aspect_ratio: z.string().optional(),
    extracted_from: z.string().optional(),
    error: z.string().optional(),
  }),
});

export const AssetManifestSchema = z.object({
  mockup: z.string(),
  deconstruction: z.string(),
  generated_at: z.string(),
  operator_version: z.string(),
  assets: z.array(ManifestAssetSchema),
});

export function validateDeconstruction(data: unknown) {
  return DeconstructionJSONSchema.safeParse(data);
}

export function validateManifest(data: unknown) {
  return AssetManifestSchema.safeParse(data);
}
