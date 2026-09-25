import { useCallback, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Upload } from 'lucide-react';
import type { PdfInfo, Tool, ToolParam, UploadedFile } from '../../types';
import { cn, downloadBlob, formatBytes } from '../../lib/utils';
import { fetchPdfInfo, uploadForm } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { Dropzone } from '../../components/ui/Dropzone';
import { FileList } from '../../components/ui/FileList';
import { ResultPanel } from '../../components/ui/ResultPanel';
import { Field, LogoField } from '../../components/ui/Field';
import { PagePreviewPanel } from '../../components/pdf/PagePreviewPanel';
import { PdfThumbnail } from '../../components/pdf/PdfThumbnail';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import {
  buildFileItem,
  useWorkspace,
  validateIncomingFile,
  type ParamValue,
} from './useWorkspace';
import { OcrWorkspace } from './OcrWorkspace';
import { SummaryWorkspace } from './SummaryWorkspace';
import { AskPdfWorkspace } from './AskPdfWorkspace';

interface WorkspaceProps {
  tool: Tool;
}

export function Workspace({ tool }: WorkspaceProps) {
  if (tool.mode === 'info') return <InfoMode tool={tool} />;
  if (tool.mode === 'metadata') return <MetadataMode tool={tool} />;
  if (tool.mode === 'ocr') return <OcrWorkspace tool={tool} />;
  if (tool.mode === 'summary') return <SummaryWorkspace tool={tool} />;
  if (tool.mode === 'ask') return <AskPdfWorkspace tool={tool} />;
  return <StandardMode tool={tool} />;
}


const ACTION_LABELS: Record<string, string> = {
  merge: 'Merge PDFs',
  split: 'Split PDF',
  rotate: 'Rotate pages',
  extract: 'Extract pages',
  'delete-pages': 'Delete pages',
  organize: 'Organize pages',
  compress: 'Compress PDF',
  watermark: 'Add watermark',
  'image-watermark': 'Add watermark',
  'page-numbers': 'Add page numbers',
  protect: 'Protect PDF',
  unlock: 'Unlock PDF',
  'word-to-pdf': 'Convert to PDF',
  'excel-to-pdf': 'Convert to PDF',
  'ppt-to-pdf': 'Convert to PDF',
  'pdf-to-word': 'Convert to Word',
  'jpg-to-pdf': 'Create PDF',
  'pdf-to-jpg': 'Convert to images',
};

const PREVIEW_HINTS: Record<string, string> = {
  'delete-pages': 'Click pages to mark them for deletion.',
  extract: 'Click the pages you want to keep.',
  rotate: 'Select the pages to rotate. Leave none selected to rotate every page.',
  organize: 'Drag pages to reorder them.',
};

function ToolDropzone({ tool, onFiles }: { tool: Tool; onFiles: (files: File[]) => void }) {
  return (
    <Dropzone
      accept={tool.accept}
      multiple={tool.multiple}
      label={`Drop your ${tool.filesLabel.toLowerCase()}`}
      sublabel="or click to browse"
      hint={`${tool.filesLabel} · ${tool.maxFiles ? `max ${tool.maxFiles} files` : 'one file at a time'} · up to 50 MB each`}
      onFiles={onFiles}
    />
  );
}

function StandardMode({ tool }: WorkspaceProps) {
  const w = useWorkspace(tool);
  const Icon = tool.icon;
  const busy = w.isBusy;
  const file = w.files[0]?.file;

  const actionLabel = ACTION_LABELS[tool.slug];
  const hint = PREVIEW_HINTS[tool.slug];
  const logoParam = tool.params?.find((param) => param.type === 'logo');

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* Main area */}
      <section className={cn('min-w-0 space-y-4', busy && 'pointer-events-none opacity-60 transition-opacity')}>
        {file && tool.preview === 'select' && tool.kind === 'pdf' ? (
          <PagePreviewPanel
            file={file}
            mode="select"
            accent={tool.slug === 'delete-pages' ? 'delete' : 'keep'}
            selected={w.selection}
            onChange={w.setSelection}
            hint={hint}
          />
        ) : file && tool.preview === 'order' && tool.kind === 'pdf' ? (
          <PagePreviewPanel
            file={file}
            mode="order"
            accent="order"
            selected={w.selection}
            onChange={w.setSelection}
            hint={hint}
          />
        ) : file && tool.preview === 'view' && tool.kind === 'pdf' ? (
          <PagePreviewPanel file={file} mode="view" selected={[]} onChange={() => undefined} />
        ) : w.files.length > 0 ? (
          <>
            <FileList items={w.files} kind={tool.kind} onRemove={w.removeFile} />
            {tool.multiple && (
              <AddMoreFiles tool={tool} onFiles={(incoming) => w.addFiles(incoming, w.files)} />
            )}
            {tool.slug === 'merge' && <FirstPagesPreview items={w.files} />}
          </>
        ) : (
          <ToolDropzone tool={tool} onFiles={(incoming) => w.addFiles(incoming)} />
        )}
      </section>

      {/* Sidebar */}
      <aside className="min-w-0 space-y-4">
        {busy ? (
          <ProcessingCard status={w.status} progress={w.progress} />
        ) : w.status === 'done' && w.result ? (
          <ResultPanel result={w.result} onDownload={w.download} onReset={w.reset} />
        ) : (
          <div className="card-surface overflow-hidden">
            {/* Sidebar tool header */}
            <div className="flex items-center gap-3 border-b border-surface-line px-5 py-4 dark:border-surface-line-dark">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-brand-500/20">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{tool.name}</p>
                <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">{tool.short}</p>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {/* Params */}
              {w.visibleParams.length > 0 && (
                <div className="space-y-4">
                  {w.visibleParams.map((param) => (
                    <Field
                      key={param.name}
                      param={param}
                      value={w.params[param.name] ?? ''}
                      onChange={(value: ParamValue) => w.setParam(param.name, value)}
                    />
                  ))}
                  {logoParam && <LogoField param={logoParam} onPick={w.setLogo} />}
                </div>
              )}

              {/* Submit button */}
              <Button variant="primary" size="lg" full disabled={!w.canSubmit} onClick={() => void w.submit()}>
                {actionLabel ?? `Run ${tool.name}`}
              </Button>

              {/* File count hint */}
              {w.files.length > 0 && (
                <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                  {w.maxFiles === 1
                    ? 'One file per request'
                    : `${w.files.length} of ${w.maxFiles} file${w.maxFiles === 1 ? '' : 's'} selected`}
                </p>
              )}

              {/* Error */}
              {w.status === 'error' && w.error && <Alert>{w.error}</Alert>}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function ProcessingCard({ status, progress }: { status: string; progress: number }) {
  const label =
    status === 'uploading'
      ? 'Uploading files…'
      : status === 'preparing'
        ? 'Preparing download…'
        : 'Processing PDF…';

  const subLabel =
    status === 'uploading'
      ? `${Math.round(progress * 100)}% uploaded`
      : 'This usually takes a few seconds.';

  const percent = Math.max(8, Math.round(progress * 100));

  return (
    <div className="card-surface animate-scale-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-surface-line px-5 py-4 dark:border-surface-line-dark">
        <Spinner className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{label}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{subLabel}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="p-5">
        <div className="h-2 overflow-hidden rounded-full bg-surface-panel dark:bg-surface-panel-dark">
          {status === 'uploading' ? (
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-[width] duration-200"
              style={{ width: `${percent}%` }}
            />
          ) : (
            /* Indeterminate animation for processing */
            <div className="relative h-full w-full overflow-hidden rounded-full bg-surface-panel dark:bg-surface-panel-dark">
              <div className="absolute inset-0 w-1/3 rounded-full bg-gradient-to-r from-brand-500 to-violet-500 animate-progress-indeterminate" />
            </div>
          )}
        </div>
        {status === 'uploading' && (
          <p className="mt-2 text-right text-xs font-medium text-zinc-400 dark:text-zinc-500">{percent}%</p>
        )}
      </div>
    </div>
  );
}

function AddMoreFiles({ tool, onFiles }: { tool: Tool; onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const dropped = Array.from(event.dataTransfer.files);
        if (dropped.length > 0) onFiles(dropped);
      }}
      className={cn(
        'flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-3 text-sm font-medium transition-all duration-150',
        dragging
          ? 'border-brand-500 bg-brand-500/8 text-brand-600 dark:text-brand-400'
          : 'border-zinc-200 text-zinc-500 hover:border-brand-400/60 hover:text-brand-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-brand-500/50 dark:hover:text-brand-400',
      )}
    >
      <Upload className="h-4 w-4" aria-hidden="true" />
      Add more files
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={tool.accept}
        multiple
        onChange={(event) => {
          const picked = Array.from(event.target.files ?? []);
          event.target.value = '';
          if (picked.length > 0) onFiles(picked);
        }}
      />
    </div>
  );
}

function FirstPagesPreview({ items }: { items: UploadedFile[] }) {
  const visible = items.slice(0, 12);
  return (
    <div className="card-surface p-5">
      <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        <CheckCircle2 className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
        Page previews
      </h4>
      <div className="grid grid-cols-[repeat(auto-fill,112px)] gap-3">
        {visible.map((item) => (
          <FirstPageCard key={item.id} file={item.file} label={item.file.name} />
        ))}
      </div>
      {items.length > 12 && (
        <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
          +{items.length - 12} more file{items.length - 12 === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}

function FirstPageCard({ file, label }: { file: File; label: string }) {
  const { doc, error } = usePdfDocument(file);
  if (!doc && !error) {
    return (
      <div className="space-y-1.5">
        <div className="aspect-[3/4] animate-pulse rounded-xl bg-surface-panel dark:bg-surface-panel-dark shimmer" />
        <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">{label}</p>
      </div>
    );
  }
  if (error || !doc) {
    return (
      <div className="space-y-1.5">
        <div className="aspect-[3/4] rounded-xl border border-rose-500/20 bg-rose-500/8 flex items-center justify-center">
          <span className="text-xs text-rose-500/70">Error</span>
        </div>
        <p className="truncate text-xs text-rose-600 dark:text-rose-400">{label}</p>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <PdfThumbnail doc={doc} pageNumber={1} width={112} disabled />
      <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">{label}</p>
    </div>
  );
}

/* ------------------------------- Info mode ------------------------------- */

interface DisplayEntry {
  key: string;
  value: string;
}

function InfoMode({ tool }: WorkspaceProps) {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<PdfInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (incoming: File[]) => {
      const picked = incoming[0];
      setError(null);
      setInfo(null);
      if (!picked) return;
      const problem = validateIncomingFile(tool, picked);
      if (problem) {
        setFile(null);
        setError(problem);
        return;
      }
      setFile(buildFileItem(picked));
      setLoading(true);
      void fetchPdfInfo(picked)
        .then((data) => setInfo(data))
        .catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not read this PDF.'))
        .finally(() => setLoading(false));
    },
    [tool],
  );

  const reset = useCallback(() => {
    setFile(null);
    setInfo(null);
    setError(null);
  }, []);

  const metadataEntries: DisplayEntry[] = info
    ? Object.entries(info.metadata).map(([key, value]) => ({ key: keyToLabel(key), value }))
    : [];

  const pageSizeEntries: DisplayEntry[] = info
    ? info.page_sizes.map((size) => ({
        key: `Page ${size.page}`,
        value: `${formatNumber(size.width)} × ${formatNumber(size.height)} pt`,
      }))
    : [];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0 space-y-4">
        {info && file ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Pages" value={String(info.page_count)} />
              <StatCard
                label="Text layer"
                value={info.text_layer.text_pages > 0 ? `Yes (${info.text_layer.text_pages})` : 'No'}
                tone={info.text_layer.text_pages > 0 ? 'ok' : 'warn'}
              />
              <StatCard label="Encrypted" value={info.encrypted ? 'Yes' : 'No'} tone={info.encrypted ? 'warn' : 'ok'} />
              <StatCard label="File size" value={formatBytes(info.file_size)} />
              <StatCard label="Metadata fields" value={String(metadataEntries.length)} />
              <StatCard label="Scanned pages" value={String(info.text_layer.total_pages_checked)} />
            </div>
            <MetadataTable title="Document metadata" entries={metadataEntries} />
            <MetadataTable title="Page sizes" entries={pageSizeEntries} max={60} />
          </div>
        ) : (
          <ToolDropzone tool={tool} onFiles={handleFiles} />
        )}
        {loading && (
          <div className="flex items-center gap-2 px-1 text-sm text-zinc-500 dark:text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin text-brand-500" aria-hidden="true" />
            Reading PDF…
          </div>
        )}
      </section>

      <aside className="min-w-0 space-y-4">
        <div className="card-surface p-5">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{tool.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{tool.description}</p>
        </div>
        {file && (
          <FileList items={[file]} kind="pdf" onRemove={reset} />
        )}
        {error && <Alert>{error}</Alert>}
      </aside>
    </div>
  );
}

/* ----------------------------- Metadata mode ----------------------------- */

const METADATA_FIELDS: { name: string; label: string; placeholder: string }[] = [
  { name: 'title', label: 'Title', placeholder: 'Document title' },
  { name: 'author', label: 'Author', placeholder: 'Author name' },
  { name: 'subject', label: 'Subject', placeholder: 'Short description' },
  { name: 'keywords', label: 'Keywords', placeholder: 'comma, separated, tags' },
  { name: 'creator', label: 'Creator', placeholder: 'App that created the file' },
];

function MetadataMode({ tool }: WorkspaceProps) {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<PdfInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Awaited<ReturnType<typeof uploadForm>> | null>(null);

  const handleFiles = useCallback(
    (incoming: File[]) => {
      const picked = incoming[0];
      setError(null);
      setResult(null);
      if (!picked) return;
      const problem = validateIncomingFile(tool, picked);
      if (problem) {
        setFile(null);
        setError(problem);
        return;
      }
      setFile(buildFileItem(picked));
      void fetchPdfInfo(picked).then((data) => {
        setInfo(data);
        setFields({
          title: data.metadata.title ?? '',
          author: data.metadata.author ?? '',
          subject: data.metadata.subject ?? '',
          keywords: data.metadata.keywords ?? '',
          creator: data.metadata.creator ?? '',
        });
      });
    },
    [tool],
  );

  const reset = useCallback(() => {
    setFile(null);
    setInfo(null);
    setError(null);
    setResult(null);
    setFields({});
  }, []);

  const save = useCallback(async () => {
    if (!file || busy) return;
    setError(null);
    setBusy(true);
    const formData = new FormData();
    formData.append('pdf_file', file.file);
    for (const { name } of METADATA_FIELDS) {
      const value = fields[name]?.trim();
      if (value) formData.append(name, value);
    }
    try {
      setResult(await uploadForm(tool.endpoint, formData));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save metadata.');
    } finally {
      setBusy(false);
    }
  }, [file, fields, busy, tool.endpoint]);

  const editableParams: ToolParam[] = METADATA_FIELDS.map((field) => ({
    name: field.name,
    label: field.label,
    type: 'text',
    placeholder: field.placeholder,
  }));

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0 space-y-4">
        {result ? (
          <ResultPanel
            result={result}
            onDownload={() => downloadBlob(result.blob, result.filename)}
            onReset={reset}
          />
        ) : info && file ? (
          <div className="card-surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-surface-line px-5 py-4 dark:border-surface-line-dark">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Edit metadata</h3>
              <span className="rounded-full border border-surface-line bg-surface-panel px-2.5 py-1 text-xs text-zinc-500 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-400">
                {info.page_count} page{info.page_count === 1 ? '' : 's'}
              </span>
            </div>
            <div className="space-y-4 p-5">
              {editableParams.map((param) => (
                <Field
                  key={param.name}
                  param={param}
                  value={fields[param.name] ?? ''}
                  onChange={(value: ParamValue) =>
                    setFields((current) => ({ ...current, [param.name]: String(value) }))
                  }
                />
              ))}
              <Button variant="primary" size="lg" full disabled={busy} onClick={() => void save()}>
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  'Save and download'
                )}
              </Button>
              {error && <Alert>{error}</Alert>}
            </div>
          </div>
        ) : (
          <ToolDropzone tool={tool} onFiles={handleFiles} />
        )}
      </section>

      <aside className="min-w-0 space-y-4">
        <div className="card-surface p-5">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">{tool.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{tool.description}</p>
        </div>
        {file && <FileList items={[file]} kind="pdf" onRemove={reset} />}
      </aside>
    </div>
  );
}

/* ------------------------------ Sub components ---------------------------- */

function StatCard({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'warn' }) {
  return (
    <div className="card-surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{label}</p>
      <p
        className={cn(
          'mt-1.5 text-xl font-bold',
          tone === 'ok' && 'text-emerald-600 dark:text-emerald-400',
          tone === 'warn' && 'text-amber-600 dark:text-amber-400',
          !tone && 'text-zinc-900 dark:text-white',
        )}
      >
        {value}
      </p>
    </div>
  );
}

function MetadataTable({ title, entries, max }: { title: string; entries: DisplayEntry[]; max?: number }) {
  const safeMax = max ?? entries.length;
  return (
    <div className="card-surface overflow-hidden">
      <div className="border-b border-surface-line px-5 py-3.5 dark:border-surface-line-dark">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
      </div>
      <ul className="divide-y divide-surface-line dark:divide-surface-line-dark">
        {entries.length === 0 && (
          <li className="px-5 py-3.5 text-sm text-zinc-400 dark:text-zinc-500">Nothing found.</li>
        )}
        {entries.slice(0, safeMax).map((entry) => (
          <li key={entry.key} className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 px-5 py-2.5 text-sm transition-colors hover:bg-surface-panel/60 dark:hover:bg-surface-panel-dark/40">
            <span className="truncate font-medium text-zinc-500 dark:text-zinc-400">{entry.key}</span>
            <span className="break-words text-zinc-900 dark:text-zinc-200">{entry.value}</span>
          </li>
        ))}
        {entries.length > safeMax && (
          <li className="px-5 py-2.5 text-xs text-zinc-400 dark:text-zinc-500">
            …and {entries.length - safeMax} more.
          </li>
        )}
      </ul>
    </div>
  );
}

function keyToLabel(key: string): string {
  const map: Record<string, string> = {
    title: 'Title',
    author: 'Author',
    creator: 'Creator',
    producer: 'Producer',
    subject: 'Subject',
    keywords: 'Keywords',
    creationDate: 'Created',
    modDate: 'Modified',
  };
  return map[key] ?? key.replace(/^pdf:/, '').replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`);
}

function formatNumber(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(2);
}