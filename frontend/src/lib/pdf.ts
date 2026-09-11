import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export { pdfjsLib };
export type { PDFDocumentProxy };

const PREVIEW_CAP = 120;

export function previewCapExceeded(pages: number): boolean {
  return pages > PREVIEW_CAP;
}

export function previewMessage(pages: number): string {
  if (!previewCapExceeded(pages)) return '';
  return `This document has ${pages} pages. For performance, only the first ${PREVIEW_CAP} pages are shown below.`;
}