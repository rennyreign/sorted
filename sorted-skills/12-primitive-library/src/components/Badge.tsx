import { getColors, Theme } from '../tokens/colors';

interface BadgeProps {
  label: string;
  theme?: Theme;
  accentColor?: string;
  className?: string;
}

export function Badge({ label, theme = 'light', accentColor = '#2563EB', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium font-mono uppercase tracking-[0.1em] bg-[${accentColor}]/10 text-[${accentColor}] ${className}`}
    >
      {label}
    </span>
  );
}
