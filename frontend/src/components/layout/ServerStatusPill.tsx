import { useServerStatus } from '../../hooks/useServerStatus';
import { cn } from '../../lib/utils';

/**
 * Honest, low-noise server status. Reports what the API told us rather than
 * assuming anything: unknown while checking, offline when unreachable.
 */
export function ServerStatusPill({ className, showDetails = false }: { className?: string; showDetails?: boolean }) {
  const { capabilities, refresh } = useServerStatus();
  const { checking, online, office } = capabilities;

  const tone = checking ? 'checking' : online ? 'online' : 'offline';
  const label = checking ? 'Checking server…' : online ? 'Processing server online' : 'Processing server unreachable';

  const detail = office === null ? null : office ? 'Office conversion available' : 'Office conversion unavailable';

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle', className)}>
      <button
        type="button"
        onClick={refresh}
        title={tone === 'offline' ? 'Retry the health check' : 'Re-check server status'}
        className="inline-flex items-center gap-1.5 rounded-sm transition-colors hover:text-ink"
      >
        <span
          aria-hidden="true"
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            tone === 'online' && 'bg-positive',
            tone === 'offline' && 'bg-critical',
            tone === 'checking' && 'bg-caution animate-sheen',
          )}
        />
        <span>{label}</span>
      </button>
      {showDetails && detail && (
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="text-line-strong">•</span>
          {detail}
        </span>
      )}
    </div>
  );
}
