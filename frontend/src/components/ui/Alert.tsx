import { CircleAlert, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

type Tone = 'error' | 'info';

export function Alert({ tone = 'error', children }: { tone?: Tone; children: React.ReactNode }) {
  const Icon = tone === 'error' ? CircleAlert : Info;
  return (
    <div
      role="alert"
      className={cn(
        'animate-fade-in flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-relaxed',
        tone === 'error'
          ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
          : 'border-brand-500/30 bg-brand-500/10 text-brand-700 dark:text-brand-300',
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}