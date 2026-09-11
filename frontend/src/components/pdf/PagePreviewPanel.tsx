import { useState } from 'react';
import { GripVertical, Loader2, TriangleAlert } from 'lucide-react';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import { pdfjsLib } from '../../lib/pdf';
import { previewMessage } from '../../lib/pdf';
import { PdfThumbnail } from './PdfThumbnail';
import { cn } from '../../lib/utils';

const THUMBNAIL_CAP = 120;

export type PreviewMode = 'view' | 'select' | 'order';

interface PagePreviewPanelProps {
  file: File;
  mode: PreviewMode;
  selected: number[];
  onChange: (pages: number[]) => void;
  accent?: 'keep' | 'delete' | 'order';
  hint?: string;
}

export function PagePreviewPanel({ file, mode, selected, onChange, accent = 'keep', hint }: PagePreviewPanelProps) {
  const { doc, pages, error, loading } = usePdfDocument(file);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const visiblePages = Math.min(pages, THUMBNAIL_CAP);
  const isSelectionMode = mode === 'select';
  const isOrderMode = mode === 'order';
  const thumbOverlay: 'none' | 'keep' | 'delete' = isOrderMode || accent === 'order' ? 'none' : (accent ?? 'none');

  const togglePage = (page: number) => {
    if (!isSelectionMode) return;
    if (selected.includes(page)) {
      onChange(selected.filter((value) => value !== page));
    } else {
      onChange([...selected, page].sort((a, b) => a - b));
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (dragFrom === null || dragFrom === targetIndex) return;
    const next = [...selected];
    const moved = next.splice(dragFrom, 1)[0];
    if (moved === undefined) return;
    next.splice(targetIndex, 0, moved);
    onChange(next);
    setDragFrom(null);
    setDragOver(null);
  };

  return (
    <div className="card-surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-line px-4 py-3.5 dark:border-surface-line-dark">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-300">
            <TriangleAlert className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {file.name}
              <span className="ml-2 rounded-md bg-surface-panel px-1.5 py-0.5 text-xs text-zinc-400 dark:bg-surface-panel dark:text-zinc-500">
                {pages} page{pages === 1 ? '' : 's'}
              </span>
            </p>
            {hint && <p className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>}
          </div>
        </div>

        {isSelectionMode && pages > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-zinc-500 dark:text-zinc-400">
              {selected.length} of {pages} selected
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="rounded-lg px-2 py-1 font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => onChange(Array.from({ length: pages }, (_, index) => index + 1))}
              className="rounded-lg px-2 py-1 font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300"
            >
              Select all
            </button>
          </div>
        )}

        {isOrderMode && pages > 0 && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Drag pages to reorder</p>
        )}
      </div>

      <div className="p-4">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Rendering preview…
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-rose-500">{error}</div>
        )}

        {!loading && !error && doc && (
          <>
            {visiblePages === 0 ? (
              <p className="py-16 text-center text-sm text-zinc-400">This document has no pages to preview.</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,112px)] justify-center gap-3 sm:justify-start">
                {Array.from({ length: visiblePages }, (_, index) => index + 1).map((page) => {
                  const isSelected = selected.includes(page);
                  const originalIndex = selected.indexOf(page);
                  return (
                    <div key={page} className="relative">
                      {isOrderMode && (
                        <button
                          type="button"
                          aria-label={`Move page ${page}`}
                          draggable
                          onDragStart={() => setDragFrom(originalIndex)}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setDragOver(originalIndex);
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            handleDrop(originalIndex);
                          }}
                          onDragEnd={() => {
                            setDragFrom(null);
                            setDragOver(null);
                          }}
                          className={cn(
                            'absolute -top-2 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border bg-surface text-zinc-400 shadow-sm transition-all hover:text-brand-600 dark:bg-surface-dark dark:text-zinc-500',
                            dragOver === originalIndex && dragFrom !== null && 'scale-110 text-brand-600 ring-2 ring-brand-500',
                          )}
                          title="Drag to reorder"
                        >
                          <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                      <PdfThumbnail
                        doc={doc}
                        pageNumber={page}
                        badge={String(page)}
                        selected={isSelected}
                        overlay={thumbOverlay}
                        onClick={isSelectionMode ? () => togglePage(page) : undefined}
                        disabled={isOrderMode}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {previewMessage(pages) && (
              <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                {previewMessage(pages)}
              </p>
            )}
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">Preview rendered with pdf.js ({pdfjsLib.version})</p>
          </>
        )}
      </div>
    </div>
  );
}