import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

/** Health payload the app sees in tests; individual tests can override it. */
export const HEALTH_PAYLOAD = {
  status: 'ok',
  service: 'mypdftools-api',
  limits: { max_file_size_mb: 50, max_files: 10 },
  features: { office: false, ghostscript: false, pdf_engine: true },
};

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => HEALTH_PAYLOAD,
    })) as unknown as typeof fetch,
  );

  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }));

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {
        return undefined;
      }
      unobserve() {
        return undefined;
      }
      disconnect() {
        return undefined;
      }
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = '';
      thresholds = [];
    },
  );

  // jsdom does not implement scrolling; the app only uses it for navigation polish.
  vi.stubGlobal('scrollTo', () => undefined);
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'scrollTo', { value: () => undefined, writable: true, configurable: true });
  }

  if (typeof File.prototype.arrayBuffer !== 'function') {
    Object.defineProperty(File.prototype, 'arrayBuffer', {
      value(this: File) {
        return new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(new Error('read failed'));
          reader.readAsArrayBuffer(this);
        });
      },
      writable: true,
    });
  }

  if (!('createObjectURL' in URL)) {
    Object.defineProperty(URL, 'createObjectURL', { value: () => 'blob:mock', writable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: () => undefined, writable: true });
  }
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});
