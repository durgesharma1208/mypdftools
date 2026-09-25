import { CheckCircle2, Download, RefreshCcw, Sparkles } from 'lucide-react';
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
      {/* Success header */}
      <div className="flex items-center gap-3 border-b border-emerald-500/15 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Your file is ready</p>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-500">Generated and ready to download</p>
        </div>
        <Sparkles className="ml-auto h-4 w-4 text-emerald-500/50" aria-hidden="true" />
      </div>

      {/* File details */}
      <div className="space-y-4 p-5">
        <div className="rounded-xl border border-surface-line bg-surface-panel px-4 py-3.5 dark:border-surface-line-dark dark:bg-surface-panel-dark">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{result.filename}</p>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            {formatBytes(result.size)} · generated on demand
          </p>
        </div>

        {result.message && (
          <p className="rounded-xl bg-surface-panel px-4 py-3 text-xs leading-relaxed text-zinc-500 dark:bg-surface-panel-dark dark:text-zinc-400">
            {result.message}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Button variant="primary" size="lg" full onClick={onDownload}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download file
          </Button>
          <Button variant="ghost" size="md" full onClick={onReset}>
            <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Process another file
          </Button>
        </div>
      </div>
    </div>
  );
}