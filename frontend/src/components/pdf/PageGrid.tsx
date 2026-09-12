import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, GripVertical, Loader2, RotateCcw, Shuffle } from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PdfThumbnail } from './PdfThumbnail';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import { Button } from '../ui/Button';
import { cn, formatBytes, pluralize } from '../../lib/utils';

export type PageGridMode = 'view' | 'select' | 'order';

interface PageGridProps {
  file: File;
  mode: PageGridMode;
  /** Selected page numbers (select mode) or the page order (order mode). */
  selection: number[];
  onChange: (next: number[]) => void;
  onPageCount?: (count: number) => void;
  onDocumentReady?: (doc: PDFDocumentProxy) => void;
  accent?: 'keep' | 'delete';
  hint?: string;
  /** Rotation preview applied to selected thumbnails, in degrees. */
  rotatePreview?: number;
  title?: string;
}

const THUMBNAIL_LIMIT = 120;

/**
 * The page surface shared by every page-level tool. Handles rendering, page
 * counts, selection and reordering (drag and drop plus keyboard controls).
 */
export function PageGrid({
  file,
  mode,
  selection,
  onChange,
  onPageCount,
  onDocumentReady,
  accent = 'keep',
  hint,
  rotatePreview = 0,
  title,
}: PageGridProps) {
  const { doc, pages, loading, error } = usePdfDocument(file);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const initialisedFor = useRef<string | null>(null);

  useEffect(() => {
    if (pages > 0) onPageCount?.(pages);
  }, [pages, onPageCount]);

  useEffect(() => {
    if (doc) onDocumentReady?.(doc);
  }, [doc, onDocumentReady]);

  // Order mode needs a complete starting order (1..n) once the document loads.
  useEffect(() => {
    if (mode !== 'order' || pages === 0) return;
    const key = `${file.name}:${file.size}:${pages}`;
    if (initialisedFor.current === key) return;
    initialisedFor.current = key;
    if (selection.length !== pages) {
      onChange(Array.from({ length: pages }, (_, index) => index + 1));
    }
  }, [file, mode, onChange, pages, selection.length]);

  const toggle = useCallback(
    (page: number) => {
      if (mode !== 'select') return;
      if (selection.includes(page)) {
        onChange(selection.filter((value) => value !== page));
      } else {
        onChange([...selection, page].sort((a, b) => a - b));
      }
    },
    [mode, onChange, selection],
  );

  const move = useCallback(
    (from: number, to: number) => {
      if (from === to || from < 0 || to < 0 || from >= selection.length || to >= selection.length) return;
      const next = [...selection];
      const [moved] = next.splice(from, 1);
      if (moved === undefined) return;
      next.splice(to, 0, moved);
      onChange(next);
    },
    [onChange, selection],
  );

  const visible = Math.min(pages, THUMBNAIL_LIMIT);
  const overlay = mode === 'select' ? accent : 'none';
  const rotateFor = (page: number) => (rotatePreview && selection.includes(page) ? rotatePreview : 0);

  if (error) {
    return (
      <div className="panel px-4 py-6">
        <p className="text-sm font-medium text-ink">Page preview unavailable</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{error}</p>
      </div>
    );
  }

  return (
    <section className="panel overflow-hidden" aria-label="Page preview">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <span className="truncate" title={file.name}>
              {title ?? file.name}
            </span>
            {pages > 0 && (
              <span className="shrink-0 rounded-xs border border-line bg-surface-muted px-1.5 py-0.5 text-2xs font-medium text-ink-subtle tabular">
                {pluralize(pages, 'page')}
              </span>
            )}
          </h2>
          <p className="mt-0.5 text-xs text-ink-subtle">
            {hint ?? `${formatBytes(file.size)} · preview rendered locally`}
          </p>
        </div>

        {mode === 'select' && pages > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-ink-muted tabular" aria-live="polite">
              {selection.length} of {pages} selected
            </span>
            <Button size="sm" variant="ghost" onClick={() => onChange([])} disabled={selection.length === 0}>
              Clear
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange(Array.from({ length: pages }, (_, index) => index + 1))}
              disabled={selection.length === pages}
            >
              Select all
            </Button>
          </div>
        )}

        {mode === 'order' && pages > 0 && (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              icon={<Shuffle className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => onChange([...selection].reverse())}
            >
              Reverse
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => onChange(Array.from({ length: pages }, (_, index) => index + 1))}
            >
              Reset
            </Button>
          </div>
        )}
      </header>

      <div className="p-4">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Rendering thumbnails…
          </div>
        )}

        {!loading && doc && (
          <>
            {visible === 0 ? (
              <p className="py-12 text-center text-sm text-ink-muted">This document has no pages to preview.</p>
            ) : (
              <ul className="flex flex-wrap justify-center gap-3 sm:justify-start">
                {Array.from({ length: visible }, (_, index) => {
                  const page =
                    mode === 'order' ? (selection[index] ?? index + 1) : index + 1;
                  const position = mode === 'order' ? index : index + 1;
                  const isSelected = mode === 'select' ? selection.includes(page) : false;

                  return (
                    <li
                      key={`${position}-${page}`}
                      draggable={mode === 'order'}
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(event) => {
                        if (mode !== 'order') return;
                        event.preventDefault();
                        setDragOverIndex(index);
                      }}
                      onDrop={(event) => {
                        if (mode !== 'order') return;
                        event.preventDefault();
                        if (dragIndex !== null) move(dragIndex, index);
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={cn(
                        'relative rounded-md transition-transform duration-150 ease-out',
                        mode === 'order' && 'cursor-grab active:cursor-grabbing',
                        dragOverIndex === index && dragIndex !== null && dragIndex !== index && 'ring-1 ring-accent',
                      )}
                    >
                      <PdfThumbnail
                        doc={doc}
                        pageNumber={page}
                        interactive={mode === 'select'}
                        selected={isSelected}
                        overlay={overlay}
                        rotate={rotateFor(page)}
                        badge={mode === 'order' ? String(position) : String(page)}
                        onClick={mode === 'select' ? () => toggle(page) : undefined}
                        footer={
                          mode === 'order' ? (
                            <div className="flex items-center justify-between gap-1 px-0.5">
                              <span className="inline-flex items-center gap-1 text-2xs text-ink-subtle">
                                <GripVertical className="h-3 w-3" aria-hidden="true" />
                                source p{page}
                              </span>
                              <span className="flex items-center">
                                <button
                                  type="button"
                                  aria-label={`Move page ${page} earlier`}
                                  disabled={index === 0}
                                  onClick={() => move(index, index - 1)}
                                  className="rounded-xs p-1 text-ink-subtle transition-colors hover:text-ink disabled:opacity-30"
                                >
                                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Move page ${page} later`}
                                  disabled={index === selection.length - 1}
                                  onClick={() => move(index, index + 1)}
                                  className="rounded-xs p-1 text-ink-subtle transition-colors hover:text-ink disabled:opacity-30"
                                >
                                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                              </span>
                            </div>
                          ) : undefined
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            )}

            {pages > THUMBNAIL_LIMIT && (
              <p className="mt-4 rounded-md border border-caution/30 bg-caution-soft px-3 py-2 text-xs text-ink-muted">
                Showing the first {THUMBNAIL_LIMIT} of {pages} pages to keep previews fast. Tools still apply to the whole
                document.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
