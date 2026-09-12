import type { LucideIcon } from 'lucide-react';

/** Tool grouping used by the library page, footer and home page. */
export type CategoryKey = 'organise' | 'edit' | 'convert-to' | 'convert-from' | 'security' | 'utility';

export type InputKind = 'pdf' | 'image' | 'word' | 'excel' | 'ppt';

export type OutputKind = 'pdf' | 'zip' | 'docx' | 'none';

/** Page-level preview behaviour a tool needs in its workspace. */
export type PreviewMode = 'none' | 'view' | 'select' | 'order';

/** Workspaces that need bespoke layout instead of the standard flow. */
export type WorkspaceKind = 'standard' | 'inspector' | 'metadata';

/** Server capability a tool depends on. */
export type CapabilityKey = 'office';

export interface ToolParamOption {
  value: string;
  label: string;
  description?: string;
}

export interface ToolParam {
  name: string;
  label: string;
  type: 'select' | 'number' | 'text' | 'password' | 'checkbox' | 'range' | 'color' | 'logo';
  options?: ToolParamOption[];
  default?: string | number | boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  unit?: string;
  required?: boolean;
  /** Populated from the page preview rather than typed by hand. */
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
  /** Verb-first label used on cards and in the library. */
  short: string;
  tagline: string;
  description: string;
  category: CategoryKey;
  icon: LucideIcon;
  kind: InputKind;
  accept: string;
  inputLabel: string;
  multiple: boolean;
  output: OutputKind;
  outputLabel: string;
  endpoint: string;
  fileField: string;
  preview: PreviewMode;
  workspace: WorkspaceKind;
  params?: ToolParam[];
  maxFiles?: number;
  /** Shown in the "popular" rail on the home page. */
  popular?: boolean;
  /** External binary the backend needs for this tool to work. */
  requires?: CapabilityKey;
  /** Honest limitations surfaced in the tool's details panel. */
  notes?: string[];
  /** Primary action label. */
  action: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  sizeLabel: string;
  /** Page count, once pdf.js has read the document. */
  pages?: number;
}

export interface PdfInfo {
  page_count: number;
  file_size: number;
  encrypted: boolean;
  text_layer: { text_pages: number; total_pages_checked: number };
  metadata: Record<string, string>;
  page_sizes: { page: number; width: number; height: number }[];
}

export interface UploadResult {
  blob: Blob;
  filename: string;
  message?: string;
  size: number;
}

export interface ServerCapabilities {
  /** True while the first health check is still in flight. */
  checking: boolean;
  /** Whether the API responded to the last health check. */
  online: boolean;
  /** `null` means the server did not report it (older backend or unreachable). */
  office: boolean | null;
  ghostscript: boolean | null;
  limits: { maxFileSizeMb: number; maxFiles: number };
}

/** Processing phases shown to the user, in order. */
export type WorkspacePhase = 'idle' | 'ready' | 'uploading' | 'processing' | 'preparing' | 'done' | 'error';
