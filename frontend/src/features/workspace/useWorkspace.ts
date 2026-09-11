import { useCallback, useMemo, useState } from 'react';
import type { Tool, UploadedFile, UploadResult, WorkspaceStatus } from '../../types';
import { downloadBlob, formatBytes, uniqueId } from '../../lib/utils';
import { pdfjsLib } from '../../lib/pdf';
import { uploadForm } from '../../services/api';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const MAX_UPLOAD_LABEL = '50 MB';

export type ParamValue = string | number | boolean;

type ParamMap = Record<string, ParamValue>;

export function acceptsFile(tool: Tool, file: File): boolean {
  const name = file.name.toLowerCase();
  switch (tool.kind) {
    case 'pdf':
      return name.endsWith('.pdf') || file.type === 'application/pdf';
    case 'image':
      return /\.(jpe?g|png)$/.test(name) || file.type.startsWith('image/');
    case 'word':
      return /\.(doc|docx)$/.test(name);
    case 'excel':
      return /\.(xls|xlsx|ods|csv)$/.test(name);
    case 'ppt':
      return /\.(ppt|pptx|odp)$/.test(name);
  }
}

export function buildFileItem(file: File): UploadedFile {
  return { id: uniqueId(), file, size: file.size, sizeLabel: formatBytes(file.size) };
}

export function validateIncomingFile(tool: Tool, file: File): string | null {
  if (!acceptsFile(tool, file)) {
    return `"${file.name}" isn't supported. Please upload ${tool.filesLabel.toLowerCase()} only.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `"${file.name}" exceeds the maximum supported size of ${MAX_UPLOAD_LABEL}.`;
  }
  return null;
}

function defaultParams(tool: Tool): ParamMap {
  const params: ParamMap = {};
  for (const param of tool.params ?? []) {
    params[param.name] = param.default ?? (param.type === 'checkbox' ? false : '');
  }
  return params;
}

async function initializeSelection(
  file: File,
  tool: Tool,
  setSelection: (pages: number[]) => void,
): Promise<void> {
  try {
    const buffer = await file.arrayBuffer();
    const document = await pdfjsLib.getDocument({ data: buffer }).promise;
    const count = document.numPages;
    document.destroy();
    if (tool.preview === 'order' && count > 0) {
      setSelection(Array.from({ length: count }, (_, index) => index + 1));
    }
  } catch {
    return;
  }
}

export function useWorkspace(tool: Tool) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [params, setParams] = useState<ParamMap>(() => defaultParams(tool));
  const [logo, setLogo] = useState<File | null>(null);
  const [selection, setSelection] = useState<number[]>([]);
  const [status, setStatus] = useState<WorkspaceStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const maxFiles = tool.maxFiles ?? (tool.multiple ? 10 : 1);
  const isBusy = status === 'uploading' || status === 'processing' || status === 'preparing';

  const addFiles = useCallback(
    (incoming: File[], existing: UploadedFile[] = []) => {
      const combined = [...existing, ...incoming];
      const exceeded = combined.length > maxFiles;

      for (const file of incoming) {
        const problem = validateIncomingFile(tool, file);
        if (problem) {
          setError(problem);
          setFiles([]);
          setStatus('error');
          return;
        }
      }

      if (exceeded) {
        setError(`Maximum ${maxFiles} file${maxFiles === 1 ? '' : 's'} allowed per request.`);
        setFiles([]);
        setStatus('error');
        return;
      }

      const items = combined.map((item) => {
        if ('file' in item) return item;
        return buildFileItem(item);
      });

      const firstNew = incoming[0] ?? existing[0]?.file;
      setFiles(items);
      setError(null);
      setResult(null);
      setSelection([]);
      setStatus('ready');

      if ((tool.preview === 'select' || tool.preview === 'order') && tool.kind === 'pdf' && firstNew) {
        void initializeSelection(firstNew, tool, setSelection);
      }
    },
    [tool, maxFiles],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((current) => current.filter((item) => item.id !== id));
    setSelection([]);
    setStatus('idle');
    setError(null);
  }, []);

  const setParam = useCallback((name: string, value: ParamValue) => {
    setParams((current) => ({ ...current, [name]: value }));
  }, []);

  const reset = useCallback(() => {
    setFiles([]);
    setParams(defaultParams(tool));
    setLogo(null);
    setSelection([]);
    setResult(null);
    setError(null);
    setProgress(0);
    setStatus('idle');
  }, [tool]);

  const canSubmit = files.length > 0 && !isBusy && status !== 'done';

  const submit = useCallback(async () => {
    if (files.length === 0 || isBusy) return;

    if (tool.slug === 'image-watermark' && !logo) {
      setError('Please choose a logo image.');
      setStatus('error');
      return;
    }

    setError(null);
    setResult(null);
    setStatus('uploading');
    setProgress(0);

    const formData = new FormData();

    files.forEach((item) => formData.append(tool.fileField, item.file));

    for (const param of tool.params ?? []) {
      if (param.auto) {
        if (selection.length > 0) formData.append(param.name, selection.join(','));
      } else if (params[param.name] !== undefined && params[param.name] !== '') {
        formData.append(param.name, String(params[param.name]));
      }
    }

    if (logo) formData.append('logo', logo);

    try {
      const upload = await uploadForm(tool.endpoint, formData, (fraction) => {
        setProgress(fraction);
        setStatus(fraction >= 1 ? 'processing' : 'uploading');
      });
      setStatus('preparing');
      await new Promise((resolve) => setTimeout(resolve, 150));
      setResult(upload);
      setStatus('done');
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Something went wrong while processing your file. Please try again.';
      setError(message);
      setStatus('error');
    }
  }, [files, logo, params, selection, isBusy, tool]);

  const download = useCallback(() => {
    if (result) downloadBlob(result.blob, result.filename);
  }, [result]);

  const visibleParams = useMemo(
    () =>
      (tool.params ?? []).filter(
        (param) =>
          !param.auto &&
          (!param.showWhen || params[param.showWhen.param] === param.showWhen.value) &&
          param.type !== 'logo',
      ),
    [tool, params],
  );

  return {
    files,
    params,
    logo,
    selection,
    maxFiles,
    setParam,
    setSelection,
    setLogo,
    addFiles,
    removeFile,
    reset,
    submit,
    download,
    status,
    progress,
    result,
    error,
    canSubmit,
    visibleParams,
    isBusy,
  };
}