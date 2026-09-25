import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ScanText, ShieldAlert } from 'lucide-react';
import type { PdfInfo, Tool } from '../../types';
import { ApiError, fetchPdfInfo, isAbortError } from '../../lib/api';
import { formatBytes, formatNumber, pluralize } from '../../lib/utils';
import { validateFile } from '../../lib/validation';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Dropzone } from '../../components/ui/Dropzone';
import { FileList } from '../../components/ui/FileList';
import { PageGrid } from '../../components/pdf/PageGrid';
import { useServerStatus } from '../../hooks/useServerStatus';
import { acceptedSummary } from '../../lib/validation';
import { ToolFacts } from './ToolFacts';

const PAGE_SIZE_ROWS = 24;

const METADATA_LABELS: Record<string, string> = {
  title: 'Title',
  author: 'Author',
  subject: 'Subject',
  keywords: 'Keywords',
  creator: 'Creator',
  producer: 'Producer',
  creationDate: 'Created',
  modDate: 'Modified',
  trapped: 'Trapped',
};

function labelFor(key: string): string {
  return METADATA_LABELS[key] ?? key.replace(/^pdf:/, '').replace(/([A-Z])/g, ' $1').trim();
}

export function InspectorWorkspace({ tool }: { tool: Tool }) {
  const { capabilities } = useServerStatus();
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<PdfInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setFile(null);
    setInfo(null);
    setError(null);
    setLoading(false);
  }, []);

  const inspect = useCallback(
    async (picked: File) => {
      setError(null);
      setLoading(true);
      setFile(picked);
      const controller = new AbortController();
      controllerRef.current = controller;
      try {
        setInfo(await fetchPdfInfo(picked, { signal: controller.signal }));
      } catch (caught) {
        if (isAbortError(caught)) return;
        setInfo(null);
        setError(
          caught instanceof ApiError
            ? caught.message
            : 'This document could not be read. Check that it is a valid, unencrypted PDF.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleFiles = useCallback(
    (incoming: File[]) => {
      const picked = incoming[0];
      if (!picked) return;
      const problem = validateFile(tool, picked, capabilities.limits);
      if (problem) {
        setError(problem);
        setFile(null);
        setInfo(null);
        return;
      }
      void inspect(picked);
    },
    [capabilities.limits, inspect, tool],
  );

  const metadata = info ? Object.entries(info.metadata) : [];
  const orderedSizes = info ? [...info.page_sizes].sort((a, b) => a.height - b.height) : [];
  const sizes = orderedSizes.slice(0, PAGE_SIZE_ROWS);
  const distinctSizes = new Set(orderedSizes.map((size) => `${size.width}x${size.height}`)).size;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10">
      <div className="min-w-0 space-y-5">
        {file && <FileList items={[{ id: 'inspected', file, sizeLabel: formatBytes(file.size) }]} onRemove={reset} />}

        {!file && (
          <Dropzone
            accept={tool.accept}
            label="Choose a PDF to inspect"
            hint={acceptedSummary(tool, capabilities.limits)}
            onFiles={handleFiles}
          />
        )}

        {loading && (
          <div className="panel flex items-center gap-2.5 px-4 py-4 text-sm text-ink-muted" role="status">
            <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
            Reading document structure…
          </div>
        )}

        {error && (
          <Alert
            tone="error"
            title="Could not inspect this file"
            action={
              file ? (
                <Button size="sm" variant="secondary" onClick={() => void inspect(file)}>
                  Retry
                </Button>
              ) : undefined
            }
          >
            {error}
          </Alert>
        )}

        {info && file && !loading && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Pages" value={String(info.page_count)} />
              <Stat label="File size" value={formatBytes(info.file_size)} />
              <Stat label="Average page" value={info.page_count > 0 ? formatBytes(Math.round(info.file_size / info.page_count)) : '—'} />
              <Stat
                label="Text layer"
                value={info.text_layer.text_pages > 0 ? `Yes · ${info.text_layer.text_pages}/${info.text_layer.total_pages_checked}` : 'No'}
                tone={info.text_layer.text_pages > 0 ? 'positive' : 'caution'}
              />
              <Stat label="Encryption" value={info.encrypted ? 'Encrypted' : 'None'} tone={info.encrypted ? 'caution' : 'positive'} />
              <Stat label="Distinct page sizes" value={String(distinctSizes)} />
            </div>

            {info.encrypted && (
              <Alert tone="warning" title="This document is encrypted">
                Page text may be unreadable until you remove the protection.{' '}
                <Link to="/tools/unlock" className="link">
                  Unlock this PDF
                </Link>{' '}
                first if you own the password.
              </Alert>
            )}

            {!info.encrypted && info.text_layer.text_pages === 0 && info.page_count > 0 && (
              <Alert tone="warning" title="No text layer detected">
                This looks like a scanned document. Tools that read text — such as{' '}
                <Link to="/tools/pdf-to-word" className="link">
                  PDF to Word
                </Link>{' '}
                — will produce an empty document until it is OCR processed.
              </Alert>
            )}

            <section className="panel overflow-hidden">
              <header className="flex items-center gap-2 border-b border-line px-4 py-3">
                <ScanText className="h-4 w-4 text-ink-subtle" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-ink">Document properties</h2>
              </header>
              {metadata.length === 0 ? (
                <p className="px-4 py-4 text-sm text-ink-muted">
                  This file carries no document properties. You can add them with{' '}
                  <Link to="/tools/metadata" className="link">
                    Edit metadata
                  </Link>
                  .
                </p>
              ) : (
                <dl className="divide-y divide-line">
                  {metadata.map(([key, value]) => (
                    <div key={key} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
                      <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">{labelFor(key)}</dt>
                      <dd className="break-words text-sm text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>

            <section className="panel overflow-hidden">
              <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                <h2 className="text-sm font-semibold text-ink">Page geometry</h2>
                <span className="text-xs text-ink-subtle tabular">
                  {pluralize(info.page_sizes.length, 'page')} measured
                </span>
              </header>
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Page dimensions in PDF points (72 points = 1 inch)</caption>
                  <thead className="sticky top-0 bg-surface-muted text-xs uppercase tracking-wide text-ink-subtle">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left font-medium">
                        Page
                      </th>
                      <th scope="col" className="px-4 py-2 text-right font-medium">
                        Width
                      </th>
                      <th scope="col" className="px-4 py-2 text-right font-medium">
                        Height
                      </th>
                      <th scope="col" className="hidden px-4 py-2 text-right font-medium sm:table-cell">
                        Orientation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {sizes.map((size) => (
                      <tr key={size.page}>
                        <td className="px-4 py-2 tabular">{size.page}</td>
                        <td className="px-4 py-2 text-right tabular">{formatNumber(size.width)} pt</td>
                        <td className="px-4 py-2 text-right tabular">{formatNumber(size.height)} pt</td>
                        <td className="hidden px-4 py-2 text-right sm:table-cell">
                          {size.width > size.height ? 'Landscape' : 'Portrait'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orderedSizes.length > PAGE_SIZE_ROWS && (
                <p className="border-t border-line px-4 py-2.5 text-xs text-ink-subtle">
                  Showing {PAGE_SIZE_ROWS} of {orderedSizes.length} measured pages, shortest first.
                </p>
              )}
            </section>

            {info.page_count > 0 && info.page_count <= 60 && !info.encrypted && (
              <PageGrid
                file={file}
                mode="view"
                selection={[]}
                onChange={() => undefined}
                title="Page overview"
                hint="Rendered locally with pdf.js — nothing is uploaded for the preview."
              />
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={reset}>
                Inspect another file
              </Button>
              <Button variant="ghost" onClick={() => void inspect(file)}>
                Refresh report
              </Button>
            </div>
          </div>
        )}

        {!file && !loading && error && (
          <Alert tone="error" title="That file cannot be used">
            {error}
          </Alert>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="panel p-4">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-ink-muted">
              Inspection is read-only. Nothing is written back to your file, and the report is discarded as soon as you
              leave the page.
            </p>
          </div>
        </div>
        <ToolFacts tool={tool} limits={capabilities.limits} dependencyAvailable={capabilities.office} />
      </aside>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'positive' | 'caution' }) {
  return (
    <div className="panel px-3.5 py-3">
      <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">{label}</p>
      <p
        className={
          tone === 'positive'
            ? 'mt-1 text-[17px] font-semibold text-positive tabular'
            : tone === 'caution'
              ? 'mt-1 text-[17px] font-semibold text-caution tabular'
              : 'mt-1 text-[17px] font-semibold text-ink tabular'
        }
      >
        {value}
      </p>
    </div>
  );
}
