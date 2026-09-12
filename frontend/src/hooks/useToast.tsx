import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, CircleAlert, Info } from 'lucide-react';
import { cn, uniqueId } from '../lib/utils';

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  notify: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue>({ notify: () => undefined });

const TONE_ICON = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
} as const;

const TONE_CLASS: Record<ToastTone, string> = {
  success: 'border-positive/30 bg-surface text-ink',
  error: 'border-critical/30 bg-surface text-ink',
  info: 'border-line bg-surface text-ink',
};

const ICON_CLASS: Record<ToastTone, string> = {
  success: 'text-positive',
  error: 'text-critical',
  info: 'text-accent',
};

/**
 * Minimal, dependency-free notification system. Used for non-blocking feedback
 * (download started, link copied, file removed) — never for errors that need a
 * decision, which stay inline in the workspace.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = uniqueId();
      setToasts((current) => [...current.slice(-2), { id, tone, message }]);
      timers.current.set(id, window.setTimeout(() => dismiss(id), 4500));
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => {
          const Icon = TONE_ICON[toast.tone];
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm shadow-pop animate-rise',
                TONE_CLASS[toast.tone],
              )}
            >
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', ICON_CLASS[toast.tone])} aria-hidden="true" />
              <p className="flex-1 leading-relaxed">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="-mr-1 rounded px-1.5 py-0.5 text-xs font-medium text-ink-subtle transition-colors hover:text-ink"
              >
                Dismiss
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
