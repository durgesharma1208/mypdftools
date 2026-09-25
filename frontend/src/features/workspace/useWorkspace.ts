import { useCallback, useMemo, useRef, useState } from 'react';
import type { Tool, UploadResult, UploadedFile, WorkspacePhase } from '../../types';
import { ApiError, isAbortError, uploadForm } from '../../lib/api';
import { downloadBlob, formatBytes, uniqueId } from '../../lib/utils';
import {
  defaultParams,
  partitionFiles,
  validateSubmission,
  visibleParams,
  type ParamMap,
  type ParamValue,
  type UploadLimits,
} from '../../lib/validation';

interface UseWorkspaceOptions {
  tool: Tool;
  limits: UploadLimits;
  onFilesChanged?: () => void;
}

export function buildFileItem(file: File): UploadedFile {
  return { id: uniqueId(), file, sizeLabel: formatBytes(file.size) };
}

export function validateIncomingFile(tool: Tool, file: File): string | null {
  const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
  const acceptList = tool.accept.split(',').map((item) => item.trim().toLowerCase());
  const allowed = acceptList.some((pattern) => {
    if (pattern.startsWith('.')) return ext === pattern;
    if (pattern.includes('*')) {
      const [typePrefix] = pattern.split('*');
      return Boolean(typePrefix && file.type.toLowerCase().startsWith(typePrefix));
    }
    return file.type.toLowerCase() === pattern;
  });
  if (!allowed) {
    return `File format not supported. Accepted formats: ${tool.accept}`;
  }
  const maxBytes = 50 * 1024 * 1024;
  if (file.size > maxBytes) {
    return 'File exceeds maximum limit of 50 MB.';
  }
  return null;
}

function toFileItems(files: File[]): UploadedFile[] {
  return files.map((file) => buildFileItem(file));
}


/**
 * State machine behind every tool workspace: file selection, client-side
 * validation, the upload/generate/download lifecycle and reset behaviour.
 */
export function useWorkspace({ tool, limits, onFilesChanged }: UseWorkspaceOptions) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [params, setParams] = useState<ParamMap>(() => defaultParams(tool));
  const [logo, setLogo] = useState<File | null>(null);
  const [selection, setSelection] = useState<number[]>([]);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [phase, setPhase] = useState<WorkspacePhase>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  const busy = phase === 'uploading' || phase === 'processing' || phase === 'preparing';
  const maxFiles = tool.multiple ? Math.min(tool.maxFiles ?? limits.maxFiles, limits.maxFiles) : 1;

  const addFiles = useCallback(
    (incoming: File[]) => {
      const { accepted, error: problem } = partitionFiles(tool, incoming, files.length, limits);
      if (problem) {
        setError(problem);
        setPhase('error');
        return;
      }
      if (accepted.length === 0) return;

      const items = toFileItems(accepted);
      setFiles((current) => [...current, ...items]);
      setSelection([]);
      setPageCount(null);
      setResult(null);
      setError(null);
      setPhase('ready');
      setOriginalSize(0);
      onFilesChanged?.();
    },
    [files.length, limits, onFilesChanged, tool],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((current) => current.filter((item) => item.id !== id));
    setSelection([]);
    setPageCount(null);
    setResult(null);
    setError(null);
    setPhase('idle');
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setSelection([]);
    setPageCount(null);
    setResult(null);
    setError(null);
    setPhase('idle');
  }, []);

  const reorderFile = useCallback((id: string, direction: 'up' | 'down') => {
    setFiles((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index === -1) return current;
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(index, 1);
      const anchor = next[target];
      if (!moved || !anchor) return current;
      next.splice(target, 0, moved);
      return next;
    });
  }, []);

  const setParam = useCallback((name: string, value: ParamValue) => {
    setParams((current) => ({ ...current, [name]: value }));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setFiles([]);
    setParams(defaultParams(tool));
    setLogo(null);
    setSelection([]);
    setPageCount(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setOriginalSize(0);
    setPhase('idle');
  }, [tool]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setProgress(0);
    setPhase('ready');
    setError(null);
  }, []);

  const buildFormData = useCallback(
    (selectionSnapshot: number[]) => {
      const formData = new FormData();
      for (const item of files) formData.append(tool.fileField, item.file);

      for (const param of tool.params ?? []) {
        if (param.type === 'logo') continue;
        if (param.auto) {
          if (selectionSnapshot.length > 0) formData.append(param.name, selectionSnapshot.join(','));
          continue;
        }
        const value = params[param.name];
        if (value === undefined || value === null || value === '') continue;
        formData.append(param.name, typeof value === 'boolean' ? String(value) : String(value));
      }

      if (tool.params?.some((param) => param.type === 'logo') && logo) {
        formData.append('logo', logo);
      }

      return formData;
    },
    [files, logo, params, tool],
  );

  const submit = useCallback(async () => {
    if (busy) return;

    const problem = validateSubmission(tool, {
      files: files.map((item) => item.file),
      params,
      selection,
      logo,
      pageCount,
    });
    if (problem) {
      setError(problem);
      setPhase('error');
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setResult(null);
    setPhase('uploading');
    setProgress(0);
    setOriginalSize(files.reduce((total, item) => total + item.file.size, 0));

    try {
      const upload = await uploadForm(tool.endpoint, buildFormData(selection), {
        signal: controller.signal,
        onProgress: (fraction) => {
          setProgress(fraction);
          setPhase(fraction >= 1 ? 'processing' : 'uploading');
        },
      });
      setPhase('preparing');
      setResult(upload);
      setPhase('done');
    } catch (caught) {
      if (isAbortError(caught)) {
        setPhase('ready');
        return;
      }
      const message =
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'Something went wrong while processing your file. Please try again.';
      setError(message);
      setPhase('error');
    } finally {
      abortRef.current = null;
    }
  }, [buildFormData, busy, files, logo, pageCount, params, selection, tool]);

  const download = useCallback(() => {
    if (result) downloadBlob(result.blob, result.filename);
  }, [result]);

  const visible = useMemo(() => visibleParams(tool, params), [params, tool]);
  const canSubmit = files.length > 0 && !busy && phase !== 'done';

  return {
    files,
    maxFiles,
    params,
    visibleParams: visible,
    logo,
    selection,
    pageCount,
    phase,
    progress,
    result,
    error,
    originalSize,
    busy,
    canSubmit,
    addFiles,
    removeFile,
    clearFiles,
    reorderFile,
    setParam,
    setLogo,
    setSelection,
    setPageCount,
    submit,
    cancel,
    reset,
    download,
  };
}

export type WorkspaceController = ReturnType<typeof useWorkspace>;
