// ─────────────────────────────────────────────────────────────
// Mockup Deconstructor — Type Definitions
// ─────────────────────────────────────────────────────────────

// ── Section ──────────────────────────────────────────────────

export type SectionType =
  | 'hero'
  | 'features'
  | 'services'
  | 'process'
  | 'statistics'
  | 'testimonials'
  | 'pricing'
  | 'gallery'
  | 'cta'
  | 'footer'
  | 'nav'
  | 'about'
  | 'contact'
  | 'trust_bar'
  | 'custom';

export interface Section {
  id: string;
  type: SectionType;
  position: number;
  label?: string;
  layout?: string;
  theme?: 'light' | 'dark' | 'accent';
  background?: string;
  notes?: string;
}

// ── Asset ─────────────────────────────────────────────────────

export type AssetType =
  | 'person'
  | 'avatar'
  | 'logo'
  | 'hero_image'
  | 'background'
  | 'product'
  | 'icon'
  | 'illustration'
  | 'screenshot'
  | 'gallery_image'
  | 'generic';

export type AssetSource = 'reuse' | 'generate' | 'stock';
export type AssetPriority = 'critical' | 'high' | 'medium' | 'low';

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Asset {
  id: string;
  type: AssetType;
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

// ── Copy ──────────────────────────────────────────────────────

export type CopyType =
  | 'headline'
  | 'subheadline'
  | 'body'
  | 'cta'
  | 'label'
  | 'caption'
  | 'stat'
  | 'nav_item'
  | 'footer_text'
  | 'testimonial_quote'
  | 'testimonial_attribution'
  | 'badge'
  | 'price'
  | 'other';

export interface CopyBlock {
  section: string;
  type: CopyType;
  text: string;
  notes?: string;
}

// ── Component ─────────────────────────────────────────────────

export interface Component {
  component: string;
  section?: string;
  description?: string;
  variant?: string;
}

// ── Build Notes ───────────────────────────────────────────────

export interface BuildNotes {
  layout?: string;
  style?: string;
  theme?: 'light' | 'dark' | 'mixed';
  accent_color?: string;
  primary_font?: string;
  secondary_font?: string;
  responsive_priority?: boolean;
  animation?: 'none' | 'standard' | 'premium';
  grid?: string;
  notes?: string[];
}

// ── Root Schema ───────────────────────────────────────────────

export type PageType =
  | 'homepage'
  | 'service_page'
  | 'landing_page'
  | 'booking_page'
  | 'portfolio'
  | 'about'
  | 'contact'
  | 'ecommerce'
  | 'unknown';

export interface MockupDeconstruction {
  page_type: PageType;
  sections: Section[];
  assets: Asset[];
  components: Component[];
  copy: CopyBlock[];
  build_notes: BuildNotes;
  meta: {
    generated_at: string;
    source_image: string;
    model_used: string;
    operator_version: string;
  };
}

// ── Config ────────────────────────────────────────────────────

export type ModelProvider = 'openai' | 'anthropic' | 'gemini';

export interface DeconstructConfig {
  provider: ModelProvider;
  model: string;
  imagePath: string;
  outputPath?: string;
  verbose?: boolean;
}
