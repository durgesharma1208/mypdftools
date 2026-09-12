import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentLoadingTask } from 'pdfjs-dist';
import { readFileBytes } from '../lib/files';
import type { PDFDocumentProxy } from '../lib/pdf';

interface PdfDocumentState {
  doc: PDFDocumentProxy | null;
  pages: number;
  loading: boolean;
  error: string | null;
}

const INITIAL: PdfDocumentState = { doc: null, pages: 0, loading: false, error: null };

function describeFailure(error: unknown): string {
  const name = (error as { name?: string } | null)?.name;
  if (name === 'PasswordException') {
    return 'This PDF is password protected, so pages cannot be previewed. You can still process it with a password-aware tool.';
  }
  if (name === 'InvalidPDFException') {
    return 'This file could not be read as a PDF.';
  }
  return 'The page preview could not be generated for this file.';
}

/**
 * Opens a PDF with pdf.js for client-side previews. The document is destroyed
 * when the file changes or the component unmounts, so large files do not leak.
 */
export function usePdfDocument(file: File | null | undefined): PdfDocumentState {
  const [state, setState] = useState<PdfDocumentState>(INITIAL);
  const docRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    let cancelled = false;

    const release = () => {
      if (docRef.current) {
        void docRef.current.destroy();
        docRef.current = null;
      }
    };

    if (!file) {
      release();
      setState(INITIAL);
      return;
    }

    setState({ doc: null, pages: 0, loading: true, error: null });

    let task: PDFDocumentLoadingTask | null = null;

    readFileBytes(file)
      .then(async (buffer) => {
        if (cancelled) return null;
        // Imported on demand: pdf.js is only downloaded when a tool actually
        // needs a page preview.
        const { pdfjsLib } = await import('../lib/pdf');
        if (cancelled) return null;
        task = pdfjsLib.getDocument({ data: buffer });
        return task.promise;
      })
      .then((document) => {
        if (!document) return;
        if (cancelled) {
          void document.destroy();
          return;
        }
        release();
        docRef.current = document;
        setState({ doc: document, pages: document.numPages, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ doc: null, pages: 0, loading: false, error: describeFailure(error) });
        }
      });

    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [file]);

  useEffect(() => () => {
    if (docRef.current) {
      void docRef.current.destroy();
      docRef.current = null;
    }
  }, []);

  return state;
}
