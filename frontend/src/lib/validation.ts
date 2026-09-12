import type { Tool, ToolParam } from '../types';
import { DEFAULT_LIMITS } from './api';
import { fileExtension } from './utils';

export type ParamValue = string | number | boolean;
export type ParamMap = Record<string, ParamValue>;

export interface UploadLimits {
  maxFileSizeMb: number;
  maxFiles: number;
}

export const FALLBACK_LIMITS: UploadLimits = { ...DEFAULT_LIMITS };

/** Extensions the backend's magic-byte validator actually accepts per input kind. */
const ACCEPTED_EXTENSIONS: Record<Tool['kind'], string[]> = {
  pdf: ['pdf'],
  image: ['jpg', 'jpeg', 'png'],
  word: ['doc', 'docx'],
  excel: ['xls', 'xlsx'],
  ppt: ['ppt', 'pptx'],
};

const KIND_LABEL: Record<Tool['kind'], string> = {
  pdf: 'PDF',
  image: 'JPG or PNG',
  word: 'Word (.doc, .docx)',
  excel: 'Excel (.xls, .xlsx)',
  ppt: 'PowerPoint (.ppt, .pptx)',
};

export function acceptedExtensions(tool: Tool): string[] {
  return ACCEPTED_EXTENSIONS[tool.kind];
}

export function maxFilesFor(tool: Tool, limits: UploadLimits = FALLBACK_LIMITS): number {
  if (!tool.multiple) return 1;
  return Math.min(tool.maxFiles ?? limits.maxFiles, limits.maxFiles);
}

export function acceptedSummary(tool: Tool, limits: UploadLimits = FALLBACK_LIMITS): string {
  const files = tool.multiple
    ? `1–${maxFilesFor(tool, limits)} files`
    : '1 file';
  return `${KIND_LABEL[tool.kind]} · ${files} · up to ${limits.maxFileSizeMb} MB each`;
}

/** Client-side gate that mirrors backend/app/utils/validation.py. */
export function validateFile(tool: Tool, file: File, limits: UploadLimits = FALLBACK_LIMITS): string | null {
  const extension = fileExtension(file.name);
  if (!ACCEPTED_EXTENSIONS[tool.kind].includes(extension)) {
    return `“${file.name}” is not a supported file. Expected ${KIND_LABEL[tool.kind]}.`;
  }
  if (file.size === 0) {
    return `“${file.name}” is empty.`;
  }
  if (file.size > limits.maxFileSizeMb * 1024 * 1024) {
    return `“${file.name}” is larger than the ${limits.maxFileSizeMb} MB limit.`;
  }
  return null;
}

/** Validates a whole batch, returning the first problem plus the accepted files. */
export function partitionFiles(
  tool: Tool,
  incoming: File[],
  existingCount: number,
  limits: UploadLimits = FALLBACK_LIMITS,
): { accepted: File[]; error: string | null } {
  const max = maxFilesFor(tool, limits);
  const accepted: File[] = [];

  for (const file of incoming) {
    const problem = validateFile(tool, file, limits);
    if (problem) return { accepted: [], error: problem };
    if (existingCount + accepted.length >= max) {
      return {
        accepted: [],
        error:
          max === 1
            ? 'This tool processes one file at a time. Remove the current file first.'
            : `You can process up to ${max} files at a time.`,
      };
    }
    accepted.push(file);
  }

  return { accepted, error: null };
}

const RANGES_PATTERN = /^\d+(\s*-\s*\d+)?(\s*,\s*\d+(\s*-\s*\d+)?)*$/;

export function isValidRangeExpression(value: string): boolean {
  return RANGES_PATTERN.test(value.trim());
}

const AUTO_PARAMS = new Set(['pages', 'order']);

export interface SubmissionInput {
  files: File[];
  params: ParamMap;
  selection: number[];
  logo: File | null;
  pageCount: number | null;
}

/**
 * Pre-flight validation for a submit attempt. Returns a human readable message
 * or `null` when the request is ready to be sent. Mirrors the constraints the
 * FastAPI routes enforce so users get instant, specific feedback.
 */
export function validateSubmission(tool: Tool, input: SubmissionInput): string | null {
  if (input.files.length === 0) {
    return 'Choose a file to process first.';
  }
  if (input.files.length > 1 && !tool.multiple) {
    return 'This tool processes one file at a time.';
  }

  for (const param of tool.params ?? []) {
    if (AUTO_PARAMS.has(param.name)) continue;
    if (param.type === 'logo') {
      if (param.required && !input.logo) return 'Choose a logo image to place on the pages.';
      continue;
    }
    // Parameters hidden by a `showWhen` rule are not part of this request.
    if (!isParamVisible(param, input.params)) continue;
    if (!param.required) continue;

    const value = input.params[param.name];
    const isBlank = value === undefined || value === null || String(value).trim() === '';
    if (isBlank) return `${param.label} is required.`;
  }

  if (tool.slug === 'split') {
    if (input.params.mode === 'ranges') {
      const ranges = String(input.params.ranges ?? '').trim();
      if (!ranges) return 'Enter at least one page range, for example 1-3, 5.';
      if (!isValidRangeExpression(ranges)) {
        return 'Ranges must look like 1-3, 5, 7-9 — numbers separated by commas or dashes.';
      }
    }
    if (input.params.mode === 'page') {
      const page = Number(input.params.page);
      if (!Number.isFinite(page) || page < 1) return 'Enter the page number to extract.';
      if (input.pageCount !== null && page > input.pageCount) {
        return `This document has ${input.pageCount} page${input.pageCount === 1 ? '' : 's'} — page ${page} does not exist.`;
      }
    }
  }

  if (tool.slug === 'rotate' && input.selection.length === 0) {
    // The backend rotates every page when no list is supplied; nothing to check.
    return null;
  }

  if (tool.slug === 'extract' && input.selection.length === 0) {
    return 'Select at least one page to extract.';
  }

  if (tool.slug === 'delete-pages') {
    if (input.selection.length === 0) return 'Select at least one page to delete.';
    if (input.pageCount !== null && input.selection.length >= input.pageCount) {
      return 'At least one page has to remain in the document.';
    }
  }

  if (tool.slug === 'organise') {
    const order = String(input.params.order ?? '').trim();
    if (!order) return 'Waiting for the page preview to finish loading.';
    if (input.pageCount !== null && order.split(',').filter(Boolean).length !== input.pageCount) {
      return 'Every page must appear exactly once in the new order.';
    }
  }

  if (tool.slug === 'protect') {
    const password = String(input.params.user_password ?? '');
    if (password.length < 4) return 'Use a password of at least 4 characters.';
  }

  if (tool.slug === 'metadata') {
    const filled = (tool.params ?? []).some((param) => String(input.params[param.name] ?? '').trim() !== '');
    if (!filled) return 'Fill in at least one metadata field.';
  }

  return null;
}

/** Initial parameter map for a tool, from the catalog defaults. */
export function defaultParams(tool: Tool): ParamMap {
  const values: ParamMap = {};
  for (const param of tool.params ?? []) {
    if (param.type === 'logo') continue;
    values[param.name] = (param.default ?? (param.type === 'checkbox' ? false : '')) as ParamValue;
  }
  return values;
}

export function isParamVisible(param: ToolParam, params: ParamMap): boolean {
  if (param.type === 'logo' || param.auto) return false;
  if (!param.showWhen) return true;
  return String(params[param.showWhen.param] ?? '') === param.showWhen.value;
}

export function visibleParams(tool: Tool, params: ParamMap): ToolParam[] {
  return (tool.params ?? []).filter((param) => isParamVisible(param, params));
}
