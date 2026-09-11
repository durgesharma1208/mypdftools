import { CheckCircle2, Download, RefreshCcw } from 'lucide-react';
import type { UploadResult } from '../../types';
import { formatBytes } from '../../lib/utils';
import { Button } from './Button';

interface ResultPanelProps {
  result: UploadResult;
  onDownload: () => void;
  onReset: () => void;
}

export function ResultPanel({ result, onDownload, onReset }: ResultPanelProps) {
  return (
    <div className="card-surface animate-scale-in overflow-hidden">
      <div className="flex items-center gap-3 border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Your file is ready</p>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{result.filename}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {formatBytes(result.size)} · generated on demand
          </p>
        </div>

        {result.message && (
          <p className="rounded-xl bg-surface-panel px-3 py-2.5 text-xs leading-relaxed text-zinc-500 dark:bg-surface-panel dark:text-zinc-400">
            {result.message}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Button variant="primary" size="lg" onClick={onDownload}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download {result.filename}
          </Button>
          <Button variant="secondary" onClick={onReset}>
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Process another file
          </Button>
        </div>
      </div>
    </div>
  );
}