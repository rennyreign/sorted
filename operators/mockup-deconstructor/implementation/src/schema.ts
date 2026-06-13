// ─────────────────────────────────────────────────────────────
// Mockup Deconstructor — Zod Validation Schema
// ─────────────────────────────────────────────────────────────

import { z } from 'zod';

// ── Section ──────────────────────────────────────────────────

export const SectionTypeSchema = z.enum([
  'hero',
  'features',
  'services',
  'process',
  'statistics',
  'testimonials',
  'pricing',
  'gallery',
  'cta',
  'footer',
  'nav',
  'about',
  'contact',
  'trust_bar',
  'custom',
]);

export const SectionSchema = z.object({
  id: z.string().min(1),
  type: SectionTypeSchema,
  position: z.number().int().min(1),
  label: z.string().optional(),
  layout: z.string().optional(),
  theme: z.enum(['light', 'dark', 'accent']).optional(),
  background: z.string().optional(),
  notes: z.string().optional(),
});

// ── Asset ─────────────────────────────────────────────────────

export const AssetTypeSchema = z.enum([
  'person',
  'avatar',
  'logo',
  'hero_image',
  'background',
  'product',
  'icon',
  'illustration',
  'screenshot',
  'gallery_image',
  'generic',
]);

export const AssetSourceSchema = z.enum(['reuse', 'generate', 'stock']);
export const AssetPrioritySchema = z.enum(['critical', 'high', 'medium', 'low']);

export const BoundingBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number().positive(),
  h: z.number().positive(),
});

export const AssetSchema = z.object({
  id: z.string().min(1),
  type: AssetTypeSchema,
  description: z.string().min(1),
  priority: AssetPrioritySchema,
  source: AssetSourceSchema,
  section: z.string().optional(),
  slot: z.string().optional(),
  aspect_ratio: z.string().optional(),
  bbox: BoundingBoxSchema.optional(),
  variants: z.array(z.string()).optional(),
  mode_hint: z.enum(['extract', 'recreate']).optional(),
  notes: z.string().optional(),
});

// ── Copy ──────────────────────────────────────────────────────

export const CopyTypeSchema = z.enum([
  'headline',
  'subheadline',
  'body',
  'cta',
  'label',
  'caption',
  'stat',
  'nav_item',
  'footer_text',
  'testimonial_quote',
  'testimonial_attribution',
  'badge',
  'price',
  'other',
]);

export const CopyBlockSchema = z.object({
  section: z.string().min(1),
  type: CopyTypeSchema,
  text: z.string().min(1),
  notes: z.string().optional(),
});

// ── Component ─────────────────────────────────────────────────

export const ComponentSchema = z.object({
  component: z.string().min(1),
  section: z.string().optional(),
  description: z.string().optional(),
  variant: z.string().optional(),
});

// ── Build Notes ───────────────────────────────────────────────

export const BuildNotesSchema = z.object({
  layout: z.string().optional(),
  style: z.string().optional(),
  theme: z.enum(['light', 'dark', 'mixed']).optional(),
  accent_color: z.string().optional(),
  primary_font: z.string().optional(),
  secondary_font: z.string().optional(),
  responsive_priority: z.boolean().optional(),
  animation: z.enum(['none', 'standard', 'premium']).optional(),
  grid: z.string().optional(),
  notes: z.array(z.string()).optional(),
});

// ── Root Schema ───────────────────────────────────────────────

export const PageTypeSchema = z.enum([
  'homepage',
  'service_page',
  'landing_page',
  'booking_page',
  'portfolio',
  'about',
  'contact',
  'ecommerce',
  'unknown',
]);

export const MetaSchema = z.object({
  generated_at: z.string(),
  source_image: z.string(),
  model_used: z.string(),
  operator_version: z.string(),
});

export const MockupDeconstructionSchema = z.object({
  page_type: PageTypeSchema,
  sections: z.array(SectionSchema).min(1),
  assets: z.array(AssetSchema),
  components: z.array(ComponentSchema),
  copy: z.array(CopyBlockSchema),
  build_notes: BuildNotesSchema,
  meta: MetaSchema,
});

export type MockupDeconstructionOutput = z.infer<typeof MockupDeconstructionSchema>;

// ── Validation helper ─────────────────────────────────────────

export function validateDeconstruction(data: unknown): MockupDeconstructionOutput {
  return MockupDeconstructionSchema.parse(data);
}

export function safeValidateDeconstruction(data: unknown) {
  return MockupDeconstructionSchema.safeParse(data);
}
