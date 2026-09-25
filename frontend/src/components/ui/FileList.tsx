import { ArrowDown, ArrowUp, FileText, Trash2 } from 'lucide-react';
import type { UploadedFile } from '../../types';
import { cn, fileTypeLabel } from '../../lib/utils';
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
  kind?: string;
  footer?: React.ReactNode;
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
              className="shrink-0 px-2 text-ink-subtle hover:text-critical"
              aria-label={`Remove ${item.file.name}`}
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
