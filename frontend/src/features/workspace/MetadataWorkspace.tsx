import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Save } from 'lucide-react';
import type { PdfInfo, Tool, UploadResult } from '../../types';
import { ApiError, fetchPdfInfo, uploadForm } from '../../lib/api';
import { downloadBlob, formatBytes, pluralize } from '../../lib/utils';
import { validateFile } from '../../lib/validation';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Dropzone } from '../../components/ui/Dropzone';
import { FileList } from '../../components/ui/FileList';
import { ResultCard } from '../../components/ui/ResultCard';
import { Field } from '../../components/ui/Field';
import { useServerStatus } from '../../hooks/useServerStatus';
import { acceptedSummary } from '../../lib/validation';
import { ToolFacts } from './ToolFacts';

const FIELD_PLACEHOLDERS: Record<string, string> = {
  title: 'Document title',
  author: 'Author or team',
  subject: 'Short description',
  keywords: 'comma, separated, tags',
  creator: 'Application that authored the file',
  producer: 'Application that produced the PDF',
};

export function MetadataWorkspace({ tool }: { tool: Tool }) {
  const { capabilities } = useServerStatus();
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<PdfInfo | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const reset = useCallback(() => {
    setFile(null);
    setInfo(null);
    setFields({});
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  const load = useCallback(
    async (picked: File) => {
      setLoading(true);
      setError(null);
      setFile(picked);
      try {
        const data = await fetchPdfInfo(picked);
        setInfo(data);
        setFields(
          Object.fromEntries(
            (tool.params ?? []).map((param) => [param.name, data.metadata[param.name] ?? '']),
          ),
        );
      } catch (caught) {
        setInfo(null);
        setError(
          caught instanceof ApiError
            ? caught.message
            : 'The document properties could not be read from this PDF.',
        );
      } finally {
        setLoading(false);
      }
    },
    [tool.params],
  );

  const handleFiles = useCallback(
    (incoming: File[]) => {
      const picked = incoming[0];
      if (!picked) return;
      const problem = validateFile(tool, picked, capabilities.limits);
      if (problem) {
        setError(problem);
        setFile(null);
        return;
      }
      void load(picked);
    },
    [capabilities.limits, load, tool],
  );

  const dirty = info
    ? (tool.params ?? []).some((param) => (fields[param.name] ?? '') !== (info.metadata[param.name] ?? ''))
    : false;
  const anyValue = (tool.params ?? []).some((param) => (fields[param.name] ?? '').trim() !== '');

  const save = useCallback(async () => {
    if (!file || saving) return;
    if (!anyValue) {
      setError('Fill in at least one field before saving.');
      return;
    }
    setSaving(true);
    setError(null);
    const formData = new FormData();
    formData.append('pdf_file', file);
    for (const param of tool.params ?? []) {
      const value = (fields[param.name] ?? '').trim();
      if (value) formData.append(param.name, value);
    }
    try {
      setResult(await uploadForm(tool.endpoint, formData));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'The metadata could not be saved.');
    } finally {
      setSaving(false);
    }
  }, [anyValue, fields, file, saving, tool.endpoint, tool.params]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-10">
      <div className="min-w-0 space-y-5">
        {result ? (
          <ResultCard
            result={result}
            originalSize={file?.size}
            onDownload={() => downloadBlob(result.blob, result.filename)}
            onReset={reset}
          />
        ) : (
          <>
            {file && (
              <FileList
                items={[{ id: 'metadata-file', file, sizeLabel: formatBytes(file.size) }]}
                onRemove={reset}
                description={info ? `${pluralize(info.page_count, 'page')} · ${info.encrypted ? 'encrypted' : 'not encrypted'}` : undefined}
              />
            )}

            {!file && (
              <Dropzone
                accept={tool.accept}
                label="Choose a PDF to edit"
                hint={acceptedSummary(tool, capabilities.limits)}
                onFiles={handleFiles}
              />
            )}

            {loading && (
              <div className="panel flex items-center gap-2.5 px-4 py-4 text-sm text-ink-muted" role="status">
                <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
                Reading existing document properties…
              </div>
            )}

            {error && (
              <Alert tone="error" title="Something needs attention">
                {error}
                {file && !info && (
                  <>
                    {' '}
                    If the file is password protected,{' '}
                    <Link to="/tools/unlock" className="link">
                      unlock it first
                    </Link>
                    .
                  </>
                )}
              </Alert>
            )}

            {info && file && !loading && (
              <section className="panel" aria-labelledby="metadata-form">
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                  <div>
                    <h2 id="metadata-form" className="text-sm font-semibold text-ink">
                      Document properties
                    </h2>
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      Empty fields are cleared from the output, so remove anything you do not want to publish.
                    </p>
                  </div>
                  <span className="rounded-xs border border-line bg-surface-muted px-2 py-0.5 text-2xs font-medium text-ink-subtle">
                    {dirty ? 'Unsaved changes' : 'Saved values'}
                  </span>
                </header>

                <div className="space-y-5 p-4">
                  {(tool.params ?? []).map((param) => (
                    <Field
                      key={param.name}
                      param={{ ...param, placeholder: FIELD_PLACEHOLDERS[param.name] ?? param.placeholder }}
                      value={fields[param.name] ?? ''}
                      disabled={saving}
                      onChange={(value) => setFields((current) => ({ ...current, [param.name]: String(value) }))}
                    />
                  ))}

                  <Button
                    variant="primary"
                    size="lg"
                    full
                    loading={saving}
                    disabled={saving || !anyValue}
                    onClick={() => void save()}
                    icon={saving ? undefined : <Save className="h-4 w-4" aria-hidden="true" />}
                  >
                    {saving ? 'Saving…' : 'Save and download'}
                  </Button>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        {result && (
          <div className="panel p-4">
            <p className="text-sm font-semibold text-ink">Next steps</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
              Download the updated file above, or start again to edit a different document.
            </p>
          </div>
        )}
        <ToolFacts tool={tool} limits={capabilities.limits} dependencyAvailable={capabilities.office} />
      </aside>
    </div>
  );
}
