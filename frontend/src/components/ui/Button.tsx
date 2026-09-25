import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';

<<<<<<< HEAD
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'xs' | 'sm' | 'md' | 'lg';
=======
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  full?: boolean;
  icon?: ReactNode;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary:
<<<<<<< HEAD
    'bg-brand-gradient text-white shadow-sm shadow-brand-500/20 hover:shadow-md hover:shadow-brand-500/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none',
  secondary:
    'border border-surface-line bg-surface text-zinc-700 hover:border-brand-300/70 hover:bg-surface-panel hover:text-zinc-900 hover:-translate-y-0.5 dark:border-surface-line-dark dark:bg-surface-dark dark:text-zinc-200 dark:hover:border-brand-500/40 dark:hover:bg-surface-panel dark:hover:text-white',
  ghost:
    'text-zinc-600 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/8 dark:hover:text-white',
  danger:
    'bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-500 hover:shadow-md hover:shadow-rose-500/30 hover:-translate-y-0.5 active:translate-y-0',
};

const sizeClasses: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-[11px] gap-1 rounded-lg',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
=======
    'bg-accent text-accent-fg shadow-[0_1px_2px_rgb(16_17_20_/_0.12)] hover:bg-accent-strong active:translate-y-px',
  secondary:
    'border border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-muted active:translate-y-px',
  ghost: 'text-ink-muted hover:bg-surface-muted hover:text-ink',
  quiet: 'text-accent hover:bg-accent-soft',
  danger: 'border border-critical/30 bg-critical-soft text-critical hover:border-critical/60',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-sm px-3 text-[13px]',
  md: 'h-10 gap-2 rounded-md px-4 text-sm',
  lg: 'h-12 gap-2 rounded-md px-5 text-[15px]',
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
};

const BASE =
  'inline-flex select-none items-center justify-center whitespace-nowrap font-medium tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out';

/** Shared class builder so links and buttons stay visually identical. */
export function buttonClasses(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', className?: string): string {
  return cn(BASE, SIZE[size], VARIANT[variant], className);
}

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

/** Same visual language as <Button>, rendered as a router link. */
export function ButtonLink({ variant, size, full, icon, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, cn(full && 'w-full', className))} {...props}>
      {icon}
      {children}
    </Link>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'secondary', size = 'md', loading = false, full = false, icon, children, disabled, ...props },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={props.type ?? 'button'}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      className={cn(
<<<<<<< HEAD
        'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none disabled:shadow-none',
=======
        BASE,
        'disabled:cursor-not-allowed disabled:opacity-45',
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
        full && 'w-full',
        SIZE[size],
        VARIANT[variant],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner className="h-4 w-4" /> : icon}
      {children}
    </button>
  );
});
