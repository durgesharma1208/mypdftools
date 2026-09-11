import { useEffect, useRef, useState } from 'react';
import { FileWarning } from 'lucide-react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { cn } from '../../lib/utils';

interface PdfThumbnailProps {
  doc: PDFDocumentProxy;
  pageNumber: number;
  width?: number;
  selected?: boolean;
  disabled?: boolean;
  overlay?: 'none' | 'keep' | 'delete';
  badge?: string;
  onClick?: () => void;
}

const RENDER_SCALE = 2;

export function PdfThumbnail({ doc, pageNumber, width = 132, selected, disabled, overlay = 'none', badge, onClick }: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let task: RenderTask | null = null;

    const render = async () => {
      try {
        const page = await doc.getPage(pageNumber);
        const base = page.getViewport({ scale: 1 });
        const scale = (width * RENDER_SCALE) / base.width;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = width * RENDER_SCALE;
        canvas.height = viewport.height * (width * RENDER_SCALE) / base.width;
        const context = canvas.getContext('2d');
        if (!context) return;
        task = page.render({ canvasContext: context, viewport });
        await task.promise;
        if (!cancelled) setFailed(false);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    void render();

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, pageNumber, width]);

  const clickable = Boolean(onClick) && !disabled;

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={onClick}
      aria-label={badge ? `Page ${badge}${selected ? ', selected' : ''}` : `Page ${pageNumber}`}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-slate-100 transition-all duration-150 dark:bg-slate-800',
        width === 132 ? 'w-[132px]' : 'w-full',
        'shadow-sm',
        clickable && 'cursor-pointer',
        clickable && !selected && 'hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md',
        selected && overlay === 'keep' && 'border-brand-500 ring-2 ring-brand-500',
        selected && overlay === 'delete' && 'border-rose-500 ring-2 ring-rose-500',
        disabled && 'opacity-50',
      )}
    >
      {failed ? (
        <span className="flex aspect-[3/4] w-full items-center justify-center text-zinc-400">
          <FileWarning className="h-6 w-6" aria-hidden="true" />
        </span>
      ) : (
        <canvas ref={canvasRef} className="block aspect-auto w-full" style={{ height: 'auto' }} />
      )}

      {badge && (
        <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white backdrop-blur-sm">
          {badge}
        </span>
      )}

      {selected && overlay === 'keep' && (
        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
          <span className="text-[11px] font-bold">✓</span>
        </span>
      )}

      {selected && overlay === 'delete' && (
        <span className="absolute inset-0 flex items-center justify-center bg-rose-600/60">
          <span className="rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Delete</span>
        </span>
      )}
    </button>
  );
}