// Shadow tokens

export const shadow = {
  sm:  'shadow-sm',
  md:  'shadow-md',
  lg:  'shadow-lg',
  xl:  'shadow-xl',
  none: '',
} as const;

export const hoverShadow = {
  lift: 'hover:shadow-lg hover:-translate-y-0.5',
  glow: 'hover:shadow-[0_0_0_3px_rgba(37,99,235,0.15)]',
} as const;
