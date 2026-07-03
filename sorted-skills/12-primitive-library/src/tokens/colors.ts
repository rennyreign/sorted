// Color tokens — semantic palette for light and dark themes

export const palette = {
  // Brand
  accent:       '#2563EB',
  accentHover:  '#1d4ed8',

  // Neutrals
  ink:          '#0A0A0A',
  inkDark:      '#0F172A',
  mid:          '#525252',
  midLight:     '#6B7280',
  border:       '#E5E5E5',
  borderLight:  '#F0F4F8',

  // Backgrounds
  white:        '#FFFFFF',
  offWhite:     '#F8FAFC',
  dark:         '#0F172A',
  darkAlt:      '#1E293B',

  // Text on dark
  onDark:       '#FFFFFF',
  onDarkMuted:  '#CBD5E1',
} as const;

// Semantic maps per theme
export const light = {
  bg:           palette.white,
  bgAlt:        palette.offWhite,
  text:         palette.inkDark,
  textSecondary: palette.mid,
  border:       palette.border,
  accent:       palette.accent,
  accentHover:  palette.accentHover,
} as const;

export const dark = {
  bg:           palette.dark,
  bgAlt:        palette.darkAlt,
  text:         palette.onDark,
  textSecondary: palette.onDarkMuted,
  border:       '#2D3748',
  accent:       palette.accent,
  accentHover:  palette.accentHover,
} as const;

export type Theme = 'light' | 'dark';

export function getColors(theme: Theme = 'light') {
  return theme === 'dark' ? dark : light;
}
