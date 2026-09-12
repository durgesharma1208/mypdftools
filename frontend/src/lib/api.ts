import type { PdfInfo, ServerCapabilities, UploadResult } from '../types';

/**
 * Base URL for the API.
 *
 * An empty value (the default) means "same origin": the Vite dev proxy, the
 * docker nginx container and any reverse proxy all forward `/api` to FastAPI.
 * Set `VITE_API_URL` when the API lives on a different host.
 */
const RAW_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
export const API_BASE = RAW_BASE.replace(/\/+$/, '');

export const DEFAULT_LIMITS = { maxFileSizeMb: 50, maxFiles: 10 } as const;

export const NETWORK_ERROR_MESSAGE =
  'Could not reach the processing server. Check that the backend is running, then try again.';

export class ApiError extends Error {
  readonly status: number;
  readonly type: string;

  constructor(message: string, status: number, type = 'error') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.type = type;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException ? error.name === 'AbortError' : false;
}

function endpoint(path: string): string {
  return `${API_BASE}${path}`;
}

interface ErrorBody {
  error?: string;
  detail?: string;
  type?: string;
}

/** Backend errors are `{ error, detail, type }`; never surface raw server text. */
export function messageFromPayload(payload: unknown, status: number): { message: string; type: string } {
  const body = (payload ?? {}) as ErrorBody;
  const candidate = typeof body.error === 'string' ? body.error : typeof body.detail === 'string' ? body.detail : '';
  const fallback =
    status === 0
      ? NETWORK_ERROR_MESSAGE
      : status >= 500
        ? 'The server could not process this file. Please try again in a moment.'
        : 'That request could not be completed. Please check the file and options, then try again.';
  return { message: candidate.trim() || fallback, type: body.type ?? 'error' };
}

/** `filename*=UTF-8''…` first, then the plain `filename="…"` form. */
export function parseContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1].trim());
    } catch {
      return encoded[1].trim();
    }
  }
  const plain = header.match(/filename="?([^";]+)"?/i);
  return plain?.[1]?.trim() ?? null;
}

function readBlobText(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') return blob.text();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Could not read the error response.'));
    reader.readAsText(blob);
  });
}

async function errorFromXhr(xhr: XMLHttpRequest): Promise<ApiError> {
  let payload: unknown = null;
  try {
    const response = xhr.response;
    const text =
      typeof response === 'string'
        ? response
        : response instanceof Blob
          ? await readBlobText(response)
          : '';
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }
  const { message, type } = messageFromPayload(payload, xhr.status);
  return new ApiError(message, xhr.status, type);
}

async function errorFromResponse(response: Response): Promise<ApiError> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  const { message, type } = messageFromPayload(payload, response.status);
  return new ApiError(message, response.status, type);
}

export interface RequestOptions {
  /** Called with a 0–1 fraction while the browser uploads the body. */
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

/**
 * Uploads a multipart form and resolves with the returned binary file.
 * XMLHttpRequest is used (rather than fetch) so real upload progress is
 * available for large documents.
 */
export function uploadForm(path: string, formData: FormData, options: RequestOptions = {}): Promise<UploadResult> {
  const { onProgress, signal } = options;

  return new Promise<UploadResult>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint(path));
    xhr.responseType = 'blob';
    xhr.timeout = 10 * 60 * 1000;

    const abort = () => xhr.abort();
    signal?.addEventListener('abort', abort, { once: true });

    const cleanup = () => signal?.removeEventListener('abort', abort);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.min(1, event.loaded / event.total));
      }
    };

    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = xhr.response as Blob;
        resolve({
          blob,
          filename: parseContentDisposition(xhr.getResponseHeader('Content-Disposition')) ?? 'result.pdf',
          message: xhr.getResponseHeader('X-Result-Message') ?? undefined,
          size: blob.size,
        });
        return;
      }
      void errorFromXhr(xhr).then(reject);
    };

    xhr.onerror = () => {
      cleanup();
      reject(new ApiError(NETWORK_ERROR_MESSAGE, 0, 'network_error'));
    };
    xhr.ontimeout = () => {
      cleanup();
      reject(new ApiError('The server took too long to respond. Try a smaller file or lower the resolution.', 0, 'timeout'));
    };
    xhr.onabort = () => {
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };

    xhr.send(formData);
  });
}

/** Multipart POST that returns JSON (used by the inspector). */
export async function postFormJson<T>(path: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint(path), { method: 'POST', body: formData, signal: options.signal });
  } catch (caught) {
    if (isAbortError(caught)) throw caught;
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0, 'network_error');
  }
  if (!response.ok) throw await errorFromResponse(response);
  return (await response.json()) as T;
}

export function fetchPdfInfo(file: File, options: RequestOptions = {}): Promise<PdfInfo> {
  const formData = new FormData();
  formData.append('pdf_file', file);
  return postFormJson<PdfInfo>('/api/pdf/info', formData, options);
}

interface HealthDependency {
  label?: string;
  available?: boolean;
}

interface HealthPayload {
  status?: string;
  limits?: { max_file_size_mb?: number; max_files?: number };
  features?: Record<string, boolean>;
  dependencies?: HealthDependency[];
}

function dependencyAvailable(payload: HealthPayload, needle: string): boolean | null {
  const match = payload.dependencies?.find((item) => item.label?.toLowerCase().includes(needle));
  return typeof match?.available === 'boolean' ? match.available : null;
}

/**
 * Reads the server's advertised limits and optional binaries. Tolerates older
 * backends: when `features` is missing the dependency list is used instead.
 */
export function parseCapabilities(payload: HealthPayload): ServerCapabilities {
  const office =
    typeof payload.features?.office === 'boolean' ? payload.features.office : dependencyAvailable(payload, 'libreoffice');
  const ghostscript =
    typeof payload.features?.ghostscript === 'boolean'
      ? payload.features.ghostscript
      : dependencyAvailable(payload, 'ghostscript');

  return {
    checking: false,
    online: payload.status === 'ok' || payload.status === undefined,
    office,
    ghostscript,
    limits: {
      maxFileSizeMb: payload.limits?.max_file_size_mb ?? DEFAULT_LIMITS.maxFileSizeMb,
      maxFiles: payload.limits?.max_files ?? DEFAULT_LIMITS.maxFiles,
    },
  };
}

export const UNKNOWN_CAPABILITIES: ServerCapabilities = {
  checking: true,
  online: false,
  office: null,
  ghostscript: null,
  limits: { ...DEFAULT_LIMITS },
};

export async function fetchCapabilities(signal?: AbortSignal): Promise<ServerCapabilities> {
  try {
    const response = await fetch(endpoint('/api/health'), { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return parseCapabilities((await response.json()) as HealthPayload);
  } catch (caught) {
    if (isAbortError(caught)) throw caught;
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0, 'network_error');
  }
}
