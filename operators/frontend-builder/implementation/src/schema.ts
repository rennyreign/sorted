// ─────────────────────────────────────────────────────────────
// Frontend Builder — Zod Validation Schema
// ─────────────────────────────────────────────────────────────

import { z } from 'zod';

export const DeconstructionSectionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  position: z.number().int().min(1),
  label: z.string().optional(),
  archetype: z.string().optional(),
  assembly_id: z.string().optional(),
  layout: z.string().optional(),
  theme: z.string().optional(),
  background: z.string().optional(),
  intensity: z.enum(['massive', 'large', 'medium', 'compressed', 'proof', 'decision', 'navigation', 'footer']).optional(),
  narrative_role: z.string().optional(),
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

export const ContactSchema = z.object({
  phone: z.string().optional(),
  phone_display: z.string().optional(),
  email: z.string().optional(),
  whatsapp: z.string().optional(),
  location: z.string().optional(),
  hours: z.string().optional(),
  address: z.string().optional(),
});

export const SourceSchema = z.object({
  type: z.string().optional(),
  business_name: z.string().optional(),
  business_category: z.string().optional(),
  website_url: z.string().optional(),
  analysis_summary: z.string().optional(),
});

export const CTAHierarchySchema = z.object({
  primary: z.object({
    action: z.string().optional(),
    label: z.string().optional(),
    href: z.string().optional(),
    placement: z.array(z.string()).optional(),
  }).optional(),
  secondary: z.object({
    action: z.string().optional(),
    label: z.string().optional(),
    href: z.string().optional(),
    placement: z.array(z.string()).optional(),
  }).optional(),
  tertiary: z.object({
    action: z.string().optional(),
    label: z.string().optional(),
    href: z.string().optional(),
    placement: z.array(z.string()).optional(),
  }).optional(),
});

export const StyleSlotsSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  density: z.enum(['default', 'compressed', 'airy']).optional(),
  typography: z.enum(['utility', 'editorial']).optional(),
  photography: z.enum(['documentary', 'editorial', 'none']).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const AssemblySelectionSchema = z.object({
  reason: z.string().min(1),
  assemblies: z.record(z.string(), z.string().min(1)),
  style_slots: StyleSlotsSchema.optional(),
});

export const MetadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

export const DeconstructionJSONSchema = z.object({
  page_type: z.string().min(1),
  sections: z.array(DeconstructionSectionSchema).min(1),
  assets: z.array(DeconstructionAssetSchema),
  components: z.array(ComponentSchema),
  copy: z.array(CopyBlockSchema),
  build_notes: BuildNotesSchema,
  assembly_selection: AssemblySelectionSchema.optional(),
  contact: ContactSchema.optional(),
  source: SourceSchema.optional(),
  cta_hierarchy: CTAHierarchySchema.optional(),
  metadata: MetadataSchema.optional(),
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
