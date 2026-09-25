import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type BadgeTone = 'neutral' | 'accent' | 'positive' | 'caution' | 'critical';

const TONE: Record<BadgeTone, string> = {
  neutral: 'border-line bg-surface-muted text-ink-muted',
  accent: 'border-accent/25 bg-accent-soft text-accent',
  positive: 'border-positive/25 bg-positive-soft text-positive',
  caution: 'border-caution/30 bg-caution-soft text-caution',
  critical: 'border-critical/25 bg-critical-soft text-critical',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-semibold uppercase',
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
