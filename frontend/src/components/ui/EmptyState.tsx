import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-surface px-6 text-center',
        compact ? 'py-8' : 'py-14',
        className,
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface-muted text-ink-subtle" aria-hidden="true">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted text-wrap-pretty">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
