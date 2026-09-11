import { cn } from '../../lib/utils';

type Tone = 'default' | 'success' | 'warning' | 'danger' | 'info';

const toneClasses: Record<Tone, string> = {
  default: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  info: 'bg-brand-500/10 text-brand-600 dark:text-brand-300',
};

export function Badge({ children, tone = 'default', className }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', toneClasses[tone], className)}>
      {children}
    </span>
  );
}