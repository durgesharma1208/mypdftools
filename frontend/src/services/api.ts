import type { PdfInfo, UploadResult } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

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

function endpoint(path: string): string {
  return `${API_BASE}${path}`;
}

function parseFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  const encoded = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1].trim());
    } catch {
      return encoded[1].trim();
    }
  }
  const plain = contentDisposition.match(/filename="?([^";]+)"?/i);
  return plain?.[1]?.trim() ?? null;
}

interface ErrorBody {
  error?: string;
  detail?: string;
  type?: string;
}

async function readError(xhr: XMLHttpRequest): Promise<ApiError> {
  let body: ErrorBody = {};
  try {
    const text = await (xhr.response as Blob).text();
    body = text ? (JSON.parse(text) as ErrorBody) : {};
  } catch {
    body = {};
  }
  const message = body.error ?? body.detail ?? 'Something went wrong while processing your file. Please try again.';
  return new ApiError(message, xhr.status, body.type ?? 'error');
}

export function uploadForm(
  path: string,
  formData: FormData,
  onProgress?: (fraction: number) => void,
): Promise<UploadResult> {
  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint(path));
    xhr.responseType = 'blob';

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = xhr.response as Blob;
        const filename = parseFilename(xhr.getResponseHeader('Content-Disposition')) ?? 'result';
        const message = xhr.getResponseHeader('X-Result-Message') ?? undefined;
        resolve({ blob, filename, message, size: blob.size });
      } else {
        reject(readError(xhr));
      }
    };

    xhr.onerror = () => reject(new ApiError('Could not reach the server. Is the backend running?', 0));

    xhr.send(formData);
  });
}

export async function postFormJson<T>(path: string, formData: FormData): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint(path), { method: 'POST', body: formData });
  } catch {
    throw new ApiError('Could not reach the server. Is the backend running?', 0);
  }

  const data = (await response.json().catch(() => ({}))) as ErrorBody & T;
  if (!response.ok) {
    throw new ApiError(
      String(data.error ?? data.detail ?? 'Something went wrong. Please try again.'),
      response.status,
      data.type ?? 'error',
    );
  }
  return data;
}

export function fetchPdfInfo(file: File): Promise<PdfInfo> {
  const formData = new FormData();
  formData.append('pdf_file', file);
  return postFormJson<PdfInfo>('/api/pdf/info', formData);
}