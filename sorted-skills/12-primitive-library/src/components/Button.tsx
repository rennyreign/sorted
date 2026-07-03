import { transition } from '../tokens/transitions';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  accentColor?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm:  'px-5 py-2.5 text-sm',
  md:  'px-7 py-3.5 text-sm',
  lg:  'px-8 py-4 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  accentColor = '#2563EB',
  children,
  className = '',
  onClick,
}: ButtonProps) {
  const base = `inline-flex items-center gap-2 rounded-lg font-sans font-semibold ${sizeClasses[size]} ${transition.base}`;

  const variantClasses = {
    primary:   `bg-[${accentColor}] text-white shadow-md hover:shadow-lg`,
    secondary: `bg-transparent text-[${accentColor}] border border-[${accentColor}] hover:bg-[${accentColor}]/10`,
    ghost:     `bg-transparent text-current hover:opacity-70`,
  }[variant];

  const allClasses = `${base} ${variantClasses} ${className}`;

  if (href) {
    return <a href={href} className={allClasses}>{children}</a>;
  }

  return (
    <button onClick={onClick} className={allClasses}>
      {children}
    </button>
  );
}
