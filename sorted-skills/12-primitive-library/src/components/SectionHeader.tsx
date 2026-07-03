import { labelClasses, headingClasses } from '../tokens/typography';
import { titleBlock, textMeasure } from '../tokens/spacing';
import { getColors, Theme } from '../tokens/colors';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  theme?: Theme;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  theme = 'light',
  align = 'left',
  className = '',
}: SectionHeaderProps) {
  const colors = getColors(theme);
  const alignClass = align === 'center' ? 'text-center mx-auto' : '';
  const maxW = align === 'center' ? 'max-w-3xl' : 'max-w-3xl';

  return (
    <div className={`${maxW} ${alignClass} ${titleBlock} ${className}`}>
      {eyebrow && (
        <span className={`${labelClasses} text-[${colors.textSecondary}]`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`mt-2 ${headingClasses('h2')} text-[${colors.text}]`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 md:mt-4 text-base md:text-lg leading-relaxed text-[${colors.textSecondary}] ${textMeasure.body}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
