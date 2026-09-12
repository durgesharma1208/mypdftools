import { useEffect, useRef } from 'react';
import { CheckCircle2, Download, RotateCcw } from 'lucide-react';
import type { UploadResult } from '../../types';
import { formatBytes, pluralize } from '../../lib/utils';
import { Button } from './Button';

interface ResultCardProps {
  result: UploadResult;
  onDownload: () => void;
  onReset: () => void;
  /** Size of the original upload, used for an honest savings figure. */
  originalSize?: number;
  resetLabel?: string;
}

export function ResultCard({ result, onDownload, onReset, originalSize, resetLabel = 'Process another file' }: ResultCardProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Move focus to the result so the outcome is announced, and bring it into
  // view on small screens where the workspace is tall. Both APIs are guarded:
  // older engines can be missing scrollIntoView.
  useEffect(() => {
    headingRef.current?.focus?.({ preventScroll: true });
    const container = containerRef.current;
    if (!container || typeof container.scrollIntoView !== 'function') return;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    container.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
  }, []);

  const saved = originalSize && originalSize > result.size ? originalSize - result.size : 0;
  const savedPercent = originalSize && saved > 0 ? Math.round((saved / originalSize) * 100) : 0;

  return (
    <div ref={containerRef} className="panel animate-rise overflow-hidden" role="status" aria-live="polite">
      <div className="flex items-start gap-3 border-b border-line bg-positive-soft px-4 py-3.5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-positive" aria-hidden="true" />
        <div className="min-w-0">
          <h2 ref={headingRef} tabIndex={-1} className="text-sm font-semibold text-ink outline-none">
            Your file is ready
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Processed on the server and deleted immediately after download.
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <p className="break-all text-sm font-medium text-ink">{result.filename}</p>
          <p className="text-xs text-ink-subtle tabular">
            {formatBytes(result.size)}
            {saved > 0 && ` · ${formatBytes(saved)} saved (${savedPercent}% smaller)`}
          </p>
        </div>

        {result.message && (
          <p className="panel-inset px-3 py-2.5 text-xs leading-relaxed text-ink-muted">{result.message}</p>
        )}

        <div className="flex flex-col gap-2">
          <Button variant="primary" size="lg" full icon={<Download className="h-4 w-4" aria-hidden="true" />} onClick={onDownload}>
            Download
          </Button>
          <Button variant="secondary" size="md" full icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />} onClick={onReset}>
            {resetLabel}
          </Button>
        </div>

        <p className="text-center text-xs text-ink-subtle">
          {pluralize(1, 'result')} held in memory only — nothing is stored on disk.
        </p>
      </div>
    </div>
  );
}
