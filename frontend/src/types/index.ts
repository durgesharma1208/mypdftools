import type { LucideIcon } from 'lucide-react';

export type CategoryKey =
  | 'organization'
  | 'editing'
  | 'security'
  | 'convert'
  | 'image'
  | 'office'
  | 'utility'
  | 'ocr'
  | 'ai';

export type InputKind = 'pdf' | 'image' | 'word' | 'excel' | 'ppt';

export type OutputKind = 'pdf' | 'zip' | 'docx' | 'txt' | 'json' | 'chat' | 'summary' | 'none';


export type PreviewMode = 'none' | 'view' | 'select' | 'order' | 'first-pages' | 'info' | 'metadata';

export type ToolMode = 'standard' | 'info' | 'metadata' | 'ocr' | 'summary' | 'ask';


export interface ToolParam {
  name: string;
  label: string;
  type: 'select' | 'number' | 'text' | 'password' | 'checkbox' | 'range' | 'color' | 'logo';
  options?: { value: string; label: string; description?: string }[];
  default?: string | number | boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  required?: boolean;
  auto?: boolean;
  showWhen?: { param: string; value: string };
}

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  blurb: string;
  icon: LucideIcon;
}

export interface Tool {
  slug: string;
  name: string;
  short: string;
  tagline: string;
  description: string;
  category: CategoryKey;
  icon: LucideIcon;
  kind: InputKind;
  accept: string;
  filesLabel: string;
  multiple: boolean;
  output: OutputKind;
  endpoint: string;
  fileField: string;
  preview: PreviewMode;
  mode?: ToolMode;
  params?: ToolParam[];
  maxFiles?: number;
}

export interface UploadedFile {
  id: string;
  file: File;
  size: number;
  sizeLabel: string;
}

export interface PdfInfo {
  page_count: number;
  file_size: number;
  encrypted: boolean;
  text_layer: { text_pages: number; total_pages_checked: number };
  metadata: Record<string, string>;
  page_sizes: { page: number; width: number; height: number }[];
}

export type WorkspaceStatus =
  | 'idle'
  | 'ready'
  | 'preview'
  | 'uploading'
  | 'processing'
  | 'preparing'
  | 'done'
  | 'error';

export interface UploadResult {
  blob: Blob;
  filename: string;
  message?: string;
  size: number;
}

export interface OcrLanguage {
  code: string;
  name: string;
}

export interface OcrTextResult {
  success: boolean;
  filename: string;
  pages: number;
  text: string;
  language: string;
  message?: string;
}

export interface OcrDetectionResult {
  has_text_layer: boolean;
  text_pages: number;
  total_pages: number;
  message: string;
}

export interface AiStatus {
  configured: boolean;
  model: string;
  provider: string;
  message: string;
}

export interface AiSource {
  page: number;
  snippet: string;
}

export interface AiSummaryResult {
  success: boolean;
  summary: string;
  key_points: string[];
  topics: string[];
  action_items: string[];
  pages_processed: number;
  ocr_used: boolean;
  session_id?: string;
  notice: string;
}

export interface AiAskResult {
  success: boolean;
  answer: string;
  sources: AiSource[];
  ocr_used: boolean;
  session_id?: string;
  notice: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: AiSource[];
  timestamp: number;
}