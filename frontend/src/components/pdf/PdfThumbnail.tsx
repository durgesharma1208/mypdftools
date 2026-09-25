import { useEffect, useRef, useState } from 'react';
import { FileWarning } from 'lucide-react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { cn } from '../../lib/utils';

interface PdfThumbnailProps {
  doc: PDFDocumentProxy;
  pageNumber: number;
  /** CSS width of the thumbnail in pixels. */
  width?: number;
  selected?: boolean;
  overlay?: 'none' | 'keep' | 'delete';
  badge?: string;
  /** Degrees of rotation to preview (does not modify the document). */
  rotate?: number;
  interactive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  /** Small controls rendered under the canvas (reorder arrows). */
  footer?: React.ReactNode;
  className?: string;
}

const PLACEHOLDER_ASPECT = 4 / 3;

/**
 * Renders a single page with pdf.js. Canvases are only painted once they scroll
 * into view, which keeps large documents responsive.
 */
export function PdfThumbnail({
  doc,
  pageNumber,
  width = 132,
  selected = false,
  overlay = 'none',
  badge,
  rotate = 0,
  interactive = false,
  disabled = false,
  onClick,
  footer,
  className,
}: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [aspect, setAspect] = useState(PLACEHOLDER_ASPECT);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '320px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let task: RenderTask | null = null;

    const paint = async () => {
      try {
        const page = await doc.getPage(pageNumber);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        setAspect(base.width / base.height);

        const outputScale = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: (width * outputScale) / base.width });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const context = canvas.getContext('2d');
        if (!context) return;
        task = page.render({ canvasContext: context, viewport });
        await task.promise;
        if (!cancelled) setFailed(false);
      } catch (error) {
        const name = (error as { name?: string } | null)?.name;
        if (!cancelled && name !== 'RenderingCancelledException') setFailed(true);
      }
    };

    void paint();

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, pageNumber, visible, width]);

  const frameClasses = cn(
    'relative block w-full overflow-hidden rounded-md border bg-surface-muted transition-all duration-150 ease-out',
    selected && overlay === 'keep' && 'border-accent ring-1 ring-accent',
    selected && overlay === 'delete' && 'border-critical ring-1 ring-critical',
    !selected && 'border-line',
    interactive && !disabled && 'cursor-pointer hover:border-line-strong hover:shadow-raised',
    interactive && disabled && 'cursor-default opacity-70',
  );

  const content = (
    <>
      <span
        className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out"
        style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
      >
        {failed ? (
          <FileWarning className="h-5 w-5 text-ink-subtle" aria-hidden="true" />
        ) : (
          <canvas
            ref={canvasRef}
            className={cn('h-full w-full object-contain transition-opacity duration-200', visible ? 'opacity-100' : 'opacity-0')}
          />
        )}
      </span>

      {!visible && !failed && <span className="absolute inset-0 animate-sheen bg-line/40" aria-hidden="true" />}

      {badge && (
        <span className="absolute left-1.5 top-1.5 rounded-xs bg-ink/75 px-1.5 py-0.5 font-mono text-2xs font-semibold text-ink-inverse tabular">
          {badge}
        </span>
      )}

      {selected && overlay === 'keep' && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
      )}

      {selected && overlay === 'delete' && (
        <span className="absolute inset-0 flex items-center justify-center bg-critical/45" aria-hidden="true">
          <span className="rounded-xs bg-critical px-1.5 py-0.5 text-2xs font-bold uppercase tracking-wide text-white">
            Remove
          </span>
        </span>
      )}
    </>
  );

  return (
    <div ref={frameRef} className={cn('relative flex flex-col gap-1.5', className)} style={{ width: `${width}px` }}>
      {interactive ? (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-pressed={selected}
          aria-label={`Page ${pageNumber}${selected ? ', selected' : ''}`}
          className={frameClasses}
          style={{ aspectRatio: `${aspect}` }}
        >
          {content}
        </button>
      ) : (
        <div className={frameClasses} style={{ aspectRatio: `${aspect}` }}>
          {content}
        </div>
      )}

      {footer}
    </div>
  );
}
