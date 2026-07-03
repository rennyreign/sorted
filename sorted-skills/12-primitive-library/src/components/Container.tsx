import { container } from '../tokens/spacing';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`${container} ${className}`}>
      {children}
    </div>
  );
}
