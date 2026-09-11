import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from '../lib/pdf';
import { pdfjsLib } from '../lib/pdf';

interface PdfDocState {
  doc: PDFDocumentProxy | null;
  pages: number;
  error: string | null;
  loading: boolean;
}

export function usePdfDocument(file: File | null): PdfDocState {
  const [state, setState] = useState<PdfDocState>({ doc: null, pages: 0, error: null, loading: false });
  const docRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!file) {
      if (docRef.current) {
        docRef.current.destroy();
        docRef.current = null;
      }
      setState({ doc: null, pages: 0, error: null, loading: false });
      return;
    }

    setState((previous) => ({ ...previous, loading: true, error: null }));

    file
      .arrayBuffer()
      .then((buffer) => pdfjsLib.getDocument({ data: buffer }).promise)
      .then((document: PDFDocumentProxy) => {
        if (cancelled) {
          document.destroy();
          return;
        }
        if (docRef.current) {
          docRef.current.destroy();
        }
        docRef.current = document;
        setState({ doc: document, pages: document.numPages, error: null, loading: false });
      })
      .catch(() => {
        if (!cancelled) {
          setState((previous) => ({ ...previous, loading: false, error: 'This file could not be opened for preview.' }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(
    () => () => {
      if (docRef.current) {
        docRef.current.destroy();
        docRef.current = null;
      }
    },
    [],
  );

  return state;
}