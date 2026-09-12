import { Loader2 } from 'lucide-react';
import type { WorkspacePhase } from '../../types';
import { Button } from '../../components/ui/Button';

const LABELS: Partial<Record<WorkspacePhase, { title: string; detail: string }>> = {
  uploading: { title: 'Uploading your file', detail: 'Sending the document to the processing server.' },
  processing: { title: 'Generating the output', detail: 'The server is working on your document.' },
  preparing: { title: 'Preparing your download', detail: 'Almost there.' },
};

interface ProcessingPanelProps {
  phase: WorkspacePhase;
  progress: number;
  onCancel?: () => void;
}

/** Phase-aware progress. Shows a percentage only when it is real (upload). */
export function ProcessingPanel({ phase, progress, onCancel }: ProcessingPanelProps) {
  const info = LABELS[phase] ?? LABELS.processing;
  const percent = Math.round(progress * 100);
  const determinate = phase === 'uploading';

  return (
    <div className="panel animate-scale-in p-4" role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-accent" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{info?.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
            {determinate ? `${info?.detail} ${percent}%` : info?.detail}
          </p>
        </div>
      </div>

      <div
        className="mt-3 h-1 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={determinate ? percent : undefined}
        aria-label={info?.title}
      >
        {determinate ? (
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out"
            style={{ width: `${Math.max(4, percent)}%` }}
          />
        ) : (
          <div className="h-full w-1/3 rounded-full bg-accent animate-indeterminate" />
        )}
      </div>

      {onCancel && (
        <div className="mt-3 flex justify-end">
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
