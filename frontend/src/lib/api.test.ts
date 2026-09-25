import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  DEFAULT_LIMITS,
  NETWORK_ERROR_MESSAGE,
  isAbortError,
  messageFromPayload,
  parseCapabilities,
  parseContentDisposition,
  uploadForm,
} from './api';

describe('content disposition', () => {
  it('prefers the RFC 5987 encoded filename', () => {
    expect(parseContentDisposition("attachment; filename=\"fallback.pdf\"; filename*=UTF-8''report%20final.pdf")).toBe(
      'report final.pdf',
    );
  });

  it('handles quoted and unquoted plain filenames', () => {
    expect(parseContentDisposition('attachment; filename="merged.pdf"')).toBe('merged.pdf');
    expect(parseContentDisposition('attachment; filename=merged.pdf')).toBe('merged.pdf');
  });

  it('returns null when the header is absent or unusable', () => {
    expect(parseContentDisposition(null)).toBeNull();
    expect(parseContentDisposition('attachment')).toBeNull();
  });
});

describe('error messages', () => {
  it('uses the API error field', () => {
    expect(messageFromPayload({ error: 'That password is incorrect.', type: 'ProcessingError' }, 400)).toEqual({
      message: 'That password is incorrect.',
      type: 'ProcessingError',
    });
  });

  it('falls back to a generic message for server errors', () => {
    const { message } = messageFromPayload({}, 500);
    expect(message).toContain('could not process this file');
    expect(message).not.toContain('Traceback');
  });

  it('explains network failures without blaming the file', () => {
    expect(messageFromPayload(null, 0).message).toBe(NETWORK_ERROR_MESSAGE);
  });

  it('never leaks a raw stack trace', () => {
    const { message } = messageFromPayload({ detail: 'File "x.py", line 4, in merge' }, 400);
    expect(message).toBe('File "x.py", line 4, in merge');
  });
});

describe('capabilities', () => {
  it('reads limits and features from the health payload', () => {
    const capabilities = parseCapabilities({
      status: 'ok',
      limits: { max_file_size_mb: 25, max_files: 4 },
      features: { office: true, ghostscript: false },
    });
    expect(capabilities.limits).toEqual({ maxFileSizeMb: 25, maxFiles: 4 });
    expect(capabilities.office).toBe(true);
    expect(capabilities.ghostscript).toBe(false);
    expect(capabilities.online).toBe(true);
  });

  it('still works with an older backend that only reports dependencies', () => {
    const capabilities = parseCapabilities({
      status: 'ok',
      dependencies: [
        { label: 'libreoffice', available: false },
        { label: 'ghostscript', available: true },
      ],
    });
    expect(capabilities.office).toBe(false);
    expect(capabilities.ghostscript).toBe(true);
    expect(capabilities.limits).toEqual(DEFAULT_LIMITS);
  });

  it('reports unknown capabilities rather than guessing', () => {
    const capabilities = parseCapabilities({});
    expect(capabilities.office).toBeNull();
    expect(capabilities.ghostscript).toBeNull();
  });
});

describe('uploadForm', () => {
  class FakeXhr {
    static instances: FakeXhr[] = [];
    status = 200;
    response: unknown = new Blob(['pdf-bytes'], { type: 'application/pdf' });
    responseType = '';
    timeout = 0;
    upload = { onprogress: null as ((event: ProgressEvent) => void) | null };
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    ontimeout: (() => void) | null = null;
    onabort: (() => void) | null = null;
    private headers: Record<string, string> = {
      'Content-Disposition': "attachment; filename=\"merged.pdf\"; filename*=UTF-8''merged.pdf",
      'X-Result-Message': 'Merged 2 documents.',
    };

    constructor() {
      FakeXhr.instances.push(this);
    }

    open() {
      return undefined;
    }
    send() {
      return undefined;
    }
    abort() {
      this.onabort?.();
    }
    getResponseHeader(name: string) {
      return this.headers[name] ?? null;
    }
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    }
  }

  afterEach(() => {
    FakeXhr.instances = [];
  });

  it('resolves with the returned blob, filename and server message', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr as unknown as typeof XMLHttpRequest);
    const promise = uploadForm('/api/pdf/merge', new FormData());
    const xhr = FakeXhr.instances[0];
    expect(xhr?.responseType).toBe('blob');
    xhr?.onload?.();
    const result = await promise;
    expect(result.filename).toBe('merged.pdf');
    expect(result.message).toBe('Merged 2 documents.');
    expect(result.size).toBeGreaterThan(0);
  });

  it('rejects with an ApiError when the server responds with an error status', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr as unknown as typeof XMLHttpRequest);
    const promise = uploadForm('/api/pdf/merge', new FormData());
    const xhr = FakeXhr.instances[0];
    if (xhr) {
      xhr.status = 400;
      xhr.response = new Blob([JSON.stringify({ error: 'This PDF is password protected.', type: 'ProcessingError' })]);
      xhr.onload?.();
    }
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toThrow('This PDF is password protected.');
  });

  it('rejects with a friendly message when the network fails', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr as unknown as typeof XMLHttpRequest);
    const promise = uploadForm('/api/pdf/split', new FormData());
    FakeXhr.instances[0]?.onerror?.();
    await expect(promise).rejects.toThrow(NETWORK_ERROR_MESSAGE);
  });

  it('rejects immediately when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(uploadForm('/api/pdf/split', new FormData(), { signal: controller.signal })).rejects.toSatisfy(
      isAbortError,
    );
  });
});
