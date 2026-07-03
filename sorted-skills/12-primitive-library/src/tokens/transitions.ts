// Transition tokens — standard timing from design-composer.md

export const transition = {
  base:    'transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
  slow:    'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
  color:   'transition-colors duration-200',
  opacity: 'transition-opacity duration-200',
  shadow:  'transition-shadow duration-200',
  lift:    'transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-lg',
} as const;
