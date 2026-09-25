<<<<<<< HEAD
import { FileIcon, GripVertical, X } from 'lucide-react';
import type { UploadedFile } from '../../types';
import { fileIconColor, cn } from '../../lib/utils';
=======
import { ArrowDown, ArrowUp, FileText, Trash2 } from 'lucide-react';
import type { UploadedFile } from '../../types';
import { cn, fileTypeLabel } from '../../lib/utils';
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
import { Button } from './Button';

interface FileListProps {
  items: UploadedFile[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  onReorder?: (id: string, direction: 'up' | 'down') => void;
  title?: string;
  description?: string;
  /** Page count per file id, when a preview has already read the document. */
  pageCounts?: Record<string, number>;
  className?: string;
}

function metaFor(item: UploadedFile, pages: number | undefined): string {
  const parts = [fileTypeLabel(item.file.name), item.sizeLabel];
  if (pages && pages > 0) parts.push(`${pages} page${pages === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

export function FileList({
  items,
  onRemove,
  onClearAll,
  onReorder,
  title,
  description,
  pageCounts,
  className,
}: FileListProps) {
  if (items.length === 0) return null;

  return (
<<<<<<< HEAD
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-surface-line bg-surface dark:border-surface-line-dark dark:bg-surface-dark">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-line px-4 py-3 dark:border-surface-line-dark">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {items.length} file{items.length !== 1 ? 's' : ''} selected
        </p>
        {items.length > 1 && (
          <span className="rounded-full bg-brand-500/8 px-2 py-0.5 text-[11px] font-medium text-brand-600 dark:text-brand-400">
            Ready to process
          </span>
        )}
      </div>

      {/* File items */}
      <ul className="divide-y divide-surface-line dark:divide-surface-line-dark">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              'group flex items-center gap-3 px-4 py-3',
              'transition-colors duration-100 hover:bg-surface-panel/60 dark:hover:bg-surface-panel-dark/40',
            )}
          >
            {items.length > 1 && (
              <GripVertical className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
            )}
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${fileIconColor(kind)}`}>
              <FileIcon className="h-4 w-4" aria-hidden="true" />
=======
    <section className={cn('panel overflow-hidden', className)} aria-label={title ?? 'Selected files'}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink">
            {title ?? `${items.length} file${items.length === 1 ? '' : 's'} selected`}
          </h3>
          {description && <p className="mt-0.5 text-xs text-ink-subtle">{description}</p>}
        </div>
        {items.length > 1 && onClearAll && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-ink-subtle hover:text-critical">
            Clear all
          </Button>
        )}
      </header>

      <ul className="divide-y divide-line">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center gap-3 px-4 py-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-line bg-surface-muted text-ink-subtle"
              aria-hidden="true"
            >
              <FileText className="h-4 w-4" />
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink" title={item.file.name}>
                {item.file.name}
              </p>
              <p className="mt-0.5 text-xs text-ink-subtle tabular">{metaFor(item, pageCounts?.[item.id])}</p>
            </div>

            {onReorder && (
              <div className="flex shrink-0 items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-1.5"
                  disabled={index === 0}
                  aria-label={`Move ${item.file.name} up`}
                  onClick={() => onReorder(item.id, 'up')}
                >
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-1.5"
                  disabled={index === items.length - 1}
                  aria-label={`Move ${item.file.name} down`}
                  onClick={() => onReorder(item.id, 'down')}
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
<<<<<<< HEAD
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label={`Remove ${item.file.name}`}
              onClick={() => onRemove(item.id)}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
=======
              className="shrink-0 px-2 text-ink-subtle hover:text-critical"
              aria-label={`Remove ${item.file.name}`}
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
            </Button>
          </li>
        ))}
      </ul>
<<<<<<< HEAD

      {footer}
    </div>
=======
    </section>
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
  );
}
