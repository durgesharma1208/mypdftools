import type {
  AiAskResult,
  AiStatus,
  AiSummaryResult,
  OcrDetectionResult,
  OcrLanguage,
  OcrTextResult,
  PdfInfo,
  UploadResult,
} from '../types';


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

export async function getJson<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint(path));
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

/* ─── OCR Services ────────────────────────────────────────── */

export async function fetchOcrLanguages(): Promise<OcrLanguage[]> {
  try {
    const data = await getJson<{ languages: OcrLanguage[] }>('/api/ocr/languages');
    return data.languages;
  } catch {
    return [
      { code: 'eng', name: 'English' },
      { code: 'hin', name: 'Hindi' },
    ];
  }
}

export function detectPdfTextLayer(file: File): Promise<OcrDetectionResult> {
  const formData = new FormData();
  formData.append('pdf_file', file);
  return postFormJson<OcrDetectionResult>('/api/ocr/detect', formData);
}

export function performOcrText(file: File, language = 'eng'): Promise<OcrTextResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  return postFormJson<OcrTextResult>('/api/ocr/text', formData);
}

export function performOcrFile(
  path: string,
  file: File,
  language = 'eng',
  onProgress?: (fraction: number) => void,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  return uploadForm(path, formData, onProgress);
}

/* ─── AI Services ─────────────────────────────────────────── */

export function fetchAiStatus(): Promise<AiStatus> {
  return getJson<AiStatus>('/api/ai/status');
}

export function createAiSession(file: File): Promise<{
  session_id: string;
  filename: string;
  page_count: number;
  ocr_used: boolean;
  preview_text: string;
}> {
  const formData = new FormData();
  formData.append('pdf_file', file);
  return postFormJson('/api/ai/session', formData);
}

export async function deleteAiSession(sessionId: string): Promise<void> {
  try {
    await fetch(endpoint(`/api/ai/session/${sessionId}`), { method: 'DELETE' });
  } catch {
    // Ignore deletion failures
  }
}

export function summarizePdf(params: {
  file?: File;
  sessionId?: string;
  style?: 'concise' | 'detailed';
  keyPoints?: boolean;
  topics?: boolean;
  actionItems?: boolean;
}): Promise<AiSummaryResult> {
  const formData = new FormData();
  if (params.file) formData.append('pdf_file', params.file);
  if (params.sessionId) formData.append('session_id', params.sessionId);
  if (params.style) formData.append('style', params.style);
  formData.append('include_key_points', String(params.keyPoints ?? true));
  formData.append('include_topics', String(params.topics ?? true));
  formData.append('include_action_items', String(params.actionItems ?? false));
  return postFormJson<AiSummaryResult>('/api/ai/summary', formData);
}

export function askPdf(params: {
  question: string;
  file?: File;
  sessionId?: string;
  history?: { role: string; content: string }[];
}): Promise<AiAskResult> {
  const formData = new FormData();
  formData.append('question', params.question);
  if (params.file) formData.append('pdf_file', params.file);
  if (params.sessionId) formData.append('session_id', params.sessionId);
  if (params.history && params.history.length > 0) {
    formData.append('history', JSON.stringify(params.history));
  }
  return postFormJson<AiAskResult>('/api/ai/ask', formData);
}