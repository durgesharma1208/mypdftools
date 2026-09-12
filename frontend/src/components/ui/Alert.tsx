import type { ReactNode } from 'react';
import { CheckCircle2, CircleAlert, Info, TriangleAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

const TONE = {
  info: { icon: Info, className: 'border-line bg-surface-muted text-ink', iconClass: 'text-accent' },
  success: { icon: CheckCircle2, className: 'border-positive/30 bg-positive-soft text-ink', iconClass: 'text-positive' },
  warning: { icon: TriangleAlert, className: 'border-caution/30 bg-caution-soft text-ink', iconClass: 'text-caution' },
  error: { icon: CircleAlert, className: 'border-critical/30 bg-critical-soft text-ink', iconClass: 'text-critical' },
} as const;

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Alert({ tone = 'error', title, children, action, className }: AlertProps) {
  const { icon: Icon, className: toneClass, iconClass } = TONE[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm animate-fade-in', toneClass, className)}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconClass)} aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className="font-semibold leading-snug">{title}</p>}
        <div className="leading-relaxed text-ink-muted">{children}</div>
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
