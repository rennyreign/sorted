// Typography tokens — maps to design-composer.md heading scale

// Tailwind class strings (used directly in assembly components)
export const fontSize = {
  h1:    'text-[clamp(3rem,8vw,7rem)]',    // Hero — bold only
  h2:    'text-[clamp(2rem,4vw,3rem)]',    // Section headings
  h3:    'text-lg md:text-xl',             // Card headings
  h4:    'text-base',                      // Step / item headings
  body:  'text-base',
  label: 'text-xs',
} as const;

export const fontWeight = {
  h1:    'font-bold',
  h2:    'font-bold',
  h3:    'font-semibold',
  h4:    'font-semibold',
  label: 'font-medium',
  body:  'font-normal',
} as const;

export const lineHeight = {
  h1:   'leading-[0.95]',
  h2:   'leading-tight',
  h3:   'leading-snug',
  body: 'leading-relaxed',
} as const;

export const tracking = {
  label: 'tracking-[0.15em]',
  tight: 'tracking-tight',
  normal: '',
} as const;

// Utility: build a full heading class string
export function headingClasses(level: 'h1' | 'h2' | 'h3' | 'h4'): string {
  const parts: string[] = [
    'font-sans',
    fontSize[level],
    fontWeight[level],
  ];
  if (lineHeight[level as keyof typeof lineHeight]) parts.push(lineHeight[level as keyof typeof lineHeight]);
  if (level === 'h1' || level === 'h2') parts.push(tracking.tight);
  return parts.join(' ');
}

// Utility: eyebrow/label classes
export const labelClasses = `font-mono ${fontSize.label} ${fontWeight.label} uppercase ${tracking.label}`;
