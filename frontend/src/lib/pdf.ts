import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';

/**
 * pdf.js worker wiring. The worker is bundled by Vite (no CDN request), which
 * keeps previews offline-capable and avoids loading a third party at runtime.
 */
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export { pdfjsLib };
export type { PDFDocumentProxy };

/** Maximum number of thumbnails rendered at once, to keep previews responsive. */
export const PREVIEW_LIMIT = 120;

export function previewLimitExceeded(pages: number): boolean {
  return pages > PREVIEW_LIMIT;
}
