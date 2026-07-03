// Section padding — maps to design-composer.md spacing table
export const sectionPadding = {
  massive:    'py-20 sm:py-24 lg:py-32',   // Hero, final CTA
  large:      'py-16 sm:py-20 lg:py-24',   // Work proof, featured
  medium:     'py-16 sm:py-20 lg:py-24',   // Services, about
  compressed: 'py-10 sm:py-12 lg:py-16',   // Trust strip, process
} as const;

// Content container — every section uses the same one
export const container = 'max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16';

// Grid gaps
export const gridGap = {
  cards:  'gap-6 md:gap-8',
  split:  'gap-8 lg:gap-12',
  icons:  'gap-6 lg:gap-8',
} as const;

// Card padding
export const cardPadding = {
  standard: 'p-6',
  featured:  'p-6 sm:p-8',
} as const;

// Section title block margin-bottom
export const titleBlock = 'mb-10 md:mb-12';

// Text measure
export const textMeasure = {
  body:        'max-w-[60ch]',
  description: 'max-w-[55ch]',
  caption:     'max-w-[65ch]',
} as const;

// Density overrides — applied to sectionPadding when density slot is set
export const densityPadding: Record<string, Partial<typeof sectionPadding>> = {
  compressed: {
    massive:    'py-16 sm:py-20 lg:py-24',
    large:      'py-12 sm:py-16 lg:py-20',
    medium:     'py-12 sm:py-16 lg:py-20',
    compressed: 'py-8 sm:py-10 lg:py-12',
  },
  default: {},
  airy: {
    massive:    'py-24 sm:py-28 lg:py-40',
    large:      'py-20 sm:py-24 lg:py-32',
    medium:     'py-20 sm:py-24 lg:py-32',
    compressed: 'py-14 sm:py-16 lg:py-20',
  },
};

export function getPadding(
  intensity: keyof typeof sectionPadding,
  density: 'default' | 'compressed' | 'airy' = 'default',
): string {
  return densityPadding[density]?.[intensity] ?? sectionPadding[intensity];
}
