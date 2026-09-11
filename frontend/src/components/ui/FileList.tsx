import { FileIcon, X } from 'lucide-react';
import type { UploadedFile } from '../../types';
import { fileIconColor } from '../../lib/utils';
import { Button } from './Button';

interface FileListProps {
  items: UploadedFile[];
  kind: 'pdf' | 'image' | 'word' | 'excel' | 'ppt';
  onRemove: (id: string) => void;
  footer?: React.ReactNode;
}

export function FileList({ items, kind, onRemove, footer }: FileListProps) {
  if (items.length === 0) return null;

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-surface-line bg-surface dark:border-surface-line-dark dark:bg-surface-dark">
      <div className="flex items-center justify-between border-b border-surface-line px-4 py-3 dark:border-surface-line-dark">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {items.length} file{items.length === 1 ? '' : 's'} selected
        </p>
      </div>
      <ul className="divide-y divide-surface-line dark:divide-surface-line-dark">
        {items.map((item) => (
          <li key={item.id} className="group flex items-center gap-3 px-4 py-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${fileIconColor(kind)}`}>
              <FileIcon className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{item.file.name}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{item.sizeLabel}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-60 hover:opacity-100"
              aria-label={`Remove ${item.file.name}`}
              onClick={() => onRemove(item.id)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
      {footer}
    </div>
  );
}