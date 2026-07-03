import { cardPadding } from '../tokens/spacing';
import { transition } from '../tokens/transitions';
import { getColors, Theme } from '../tokens/colors';

type CardVariant = 'standard' | 'featured';

interface CardProps {
  variant?: CardVariant;
  theme?: Theme;
  hover?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Card({
  variant = 'standard',
  theme = 'light',
  hover = false,
  children,
  className = '',
}: CardProps) {
  const colors = getColors(theme);
  const padding = cardPadding[variant];
  const hoverClass = hover ? `${transition.base} hover:-translate-y-0.5 hover:shadow-lg` : '';

  return (
    <div className={`${padding} rounded-xl border border-[${colors.border}] bg-[${colors.bg}] ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}
