import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-gradient text-white shadow-sm shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/30 hover:brightness-110 active:brightness-95',
  secondary:
    'border border-surface-line bg-surface text-zinc-700 hover:bg-surface-panel hover:text-zinc-900 dark:border-surface-line-dark dark:bg-surface-dark dark:text-zinc-200 dark:hover:bg-surface-panel dark:hover:text-white',
  ghost: 'text-zinc-600 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white',
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', loading, disabled, children, full, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        full && 'w-full',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';