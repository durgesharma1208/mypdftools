import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bot,
  Check,
  Copy,
  Download,
  Languages,
  Loader2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type { OcrDetectionResult, OcrLanguage, OcrTextResult, Tool, UploadResult, UploadedFile } from '../../types';
import { downloadBlob, formatBytes } from '../../lib/utils';

import { detectPdfTextLayer, fetchOcrLanguages, performOcrFile, performOcrText } from '../../services/api';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Dropzone } from '../../components/ui/Dropzone';
import { FileList } from '../../components/ui/FileList';
import { Spinner } from '../../components/ui/Spinner';
import { buildFileItem, validateIncomingFile } from './useWorkspace';

interface OcrWorkspaceProps {
  tool: Tool;
}

export function OcrWorkspace({ tool }: OcrWorkspaceProps) {
  const navigate = useNavigate();
  const [fileItem, setFileItem] = useState<UploadedFile | null>(null);
  const [languages, setLanguages] = useState<OcrLanguage[]>([
    { code: 'eng', name: 'English' },
    { code: 'hin', name: 'Hindi' },
  ]);
  const [selectedLang, setSelectedLang] = useState('eng');
  const [detection, setDetection] = useState<OcrDetectionResult | null>(null);
  const [detecting, setDetecting] = useState(false);

  // Processing state
  const [status, setStatus] = useState<'idle' | 'ready' | 'processing' | 'done' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Results
  const [textResult, setTextResult] = useState<OcrTextResult | null>(null);
  const [fileResult, setFileResult] = useState<UploadResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch available languages
  useEffect(() => {
    fetchOcrLanguages().then((langs) => {
      if (langs && langs.length > 0) setLanguages(langs);
    });
  }, []);

  const handleFiles = useCallback(
    async (incoming: File[]) => {
      const picked = incoming[0];
      if (!picked) return;

      const problem = validateIncomingFile(tool, picked);
      if (problem) {
        setError(problem);
        setStatus('error');
        return;
      }

      setError(null);
      setTextResult(null);
      setFileResult(null);
      setDetection(null);
      setFileItem(buildFileItem(picked));
      setStatus('ready');

      // If PDF, run quick pre-check for existing text layer
      if (picked.name.toLowerCase().endsWith('.pdf') || picked.type === 'application/pdf') {
        setDetecting(true);
        try {
          const det = await detectPdfTextLayer(picked);
          setDetection(det);
        } catch {
          // Non-blocking detection failure
        } finally {
          setDetecting(false);
        }
      }
    },
    [tool],
  );

  const reset = useCallback(() => {
    setFileItem(null);
    setTextResult(null);
    setFileResult(null);
    setDetection(null);
    setStatus('idle');
    setError(null);
  }, []);

  const handleStartOcr = async () => {
    if (!fileItem) return;

    setStatus('processing');
    setError(null);

    try {
      if (tool.slug === 'ocr-to-text') {
        setStatusMessage('Extracting recognized text via OCR…');
        const res = await performOcrText(fileItem.file, selectedLang);
        setTextResult(res);
        setStatus('done');
      } else {
        setStatusMessage(
          tool.slug === 'ocr-to-pdf'
            ? 'Creating searchable PDF with invisible text layer…'
            : 'Generating formatted Word (.docx) document via OCR…',
        );
        const res = await performOcrFile(tool.endpoint, fileItem.file, selectedLang);
        setFileResult(res);
        setStatus('done');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'OCR processing failed. Please try again.');
    }
  };

  const copyToClipboard = () => {
    if (!textResult) return;
    navigator.clipboard.writeText(textResult.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    if (!textResult) return;
    const blob = new Blob([textResult.text], { type: 'text/plain;charset=utf-8' });
    const stem = fileItem?.file.name.replace(/\.[^/.]+$/, '') ?? 'extracted_text';
    downloadBlob(blob, `${stem}_ocr.txt`);
  };

  const analyzeWithAi = (targetTool: 'summary' | 'ask') => {
    if (!fileItem) return;
    const path = targetTool === 'summary' ? '/tools/pdf-summary' : '/tools/ask-pdf';
    navigate(path, {
      state: {
        preloadedFile: fileItem.file,
        preloadedText: textResult?.text,
      },
    });
  };

  const Icon = tool.icon;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* Main Area */}
      <section className="min-w-0 space-y-4">
        {status === 'done' && textResult ? (
          /* OCR to Text Result Preview */
          <div className="card-surface animate-scale-in overflow-hidden p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-line pb-4 dark:border-surface-line-dark">
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Extracted Text Preview</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {textResult.pages} page{textResult.pages === 1 ? '' : 's'} · {textResult.text.length.toLocaleString()} characters · {selectedLang.toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </Button>
                <Button variant="primary" size="sm" onClick={downloadText}>
                  <Download className="h-3.5 w-3.5" />
                  Download .txt
                </Button>
              </div>
            </div>

            {/* Interoperability "Analyze with AI" banner */}
            <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">Analyze with AI</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Summarize this text or ask questions without re-uploading.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="secondary" size="sm" onClick={() => analyzeWithAi('summary')}>
                  <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                  Summarize
                </Button>
                <Button variant="secondary" size="sm" onClick={() => analyzeWithAi('ask')}>
                  <Bot className="h-3.5 w-3.5 text-brand-500" />
                  Ask Questions
                </Button>
              </div>
            </div>

            {/* Recognized text box */}
            <div className="relative">
              <textarea
                readOnly
                value={textResult.text}
                rows={16}
                className="w-full resize-y rounded-xl border border-surface-line bg-surface-panel p-4 font-mono text-sm leading-relaxed text-zinc-800 focus:outline-none dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-200"
              />
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Start over
              </Button>
            </div>
          </div>
        ) : status === 'done' && fileResult ? (
          /* Searchable PDF / Word result */
          <div className="card-surface animate-scale-in p-6 space-y-6">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Check className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">OCR Completed Successfully</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {fileResult.filename} ({formatBytes(fileResult.size)})
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => downloadBlob(fileResult.blob, fileResult.filename)}
              >
                <Download className="h-4 w-4" />
                Download {tool.output.toUpperCase()}
              </Button>
              <Button variant="secondary" size="lg" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                Convert another file
              </Button>
            </div>

            {/* Interoperability "Analyze with AI" banner */}
            <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">Continue to AI Analysis</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Use your newly recognized document in AI Summarizer or Ask Questions.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="secondary" size="sm" onClick={() => analyzeWithAi('summary')}>
                  <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                  Summarize
                </Button>
                <Button variant="secondary" size="sm" onClick={() => analyzeWithAi('ask')}>
                  <Bot className="h-3.5 w-3.5 text-brand-500" />
                  Ask Questions
                </Button>
              </div>
            </div>
          </div>
        ) : fileItem ? (
          /* File ready for OCR */
          <div className="space-y-4">
            <FileList items={[fileItem]} kind={tool.kind} onRemove={reset} />

            {/* Text Layer Detection Notification */}
            {detecting && (
              <div className="flex items-center gap-2 px-1 text-xs text-zinc-500 dark:text-zinc-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-500" />
                Checking for existing text layer…
              </div>
            )}
            {detection?.has_text_layer && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold">Selectable text already detected</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                    This PDF already contains digital text on {detection.text_pages} page(s). OCR may not be necessary, but you can proceed if you want to rebuild the text layer.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Dropzone
            accept={tool.accept}
            multiple={false}
            label="Drop your scanned PDF or image"
            sublabel="or click to browse"
            hint="Supports PDF, JPG, and PNG files · up to 50 MB"
            onFiles={handleFiles}
          />
        )}
      </section>

      {/* Sidebar Controls */}
      <aside className="min-w-0 space-y-4">
        {status === 'processing' ? (
          <div className="card-surface animate-scale-in overflow-hidden">
            <div className="flex items-center gap-3 border-b border-surface-line px-5 py-4 dark:border-surface-line-dark">
              <Spinner className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Running OCR</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">{statusMessage}</p>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-panel dark:bg-surface-panel-dark">
                <div className="absolute inset-0 w-1/3 rounded-full bg-gradient-to-r from-brand-500 to-violet-500 animate-progress-indeterminate" />
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Processing character recognition. High-resolution pages may take a few seconds.
              </p>
            </div>
          </div>
        ) : (
          <div className="card-surface overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-surface-line px-5 py-4 dark:border-surface-line-dark">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-brand-500/20">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{tool.name}</p>
                <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">{tool.short}</p>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {/* Language Selector */}
              <div>
                <label
                  htmlFor="ocr-language"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  <Languages className="h-3.5 w-3.5 text-brand-500" />
                  Recognition Language
                </label>
                <select
                  id="ocr-language"
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="w-full rounded-xl border border-surface-line bg-surface-panel px-3 py-2 text-sm font-medium text-zinc-800 transition-colors focus:border-brand-500 focus:outline-none dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-200"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.code})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                  Select the primary language of the document for optimal recognition.
                </p>
              </div>

              {/* Start OCR Button */}
              <Button
                variant="primary"
                size="lg"
                full
                disabled={!fileItem}
                onClick={handleStartOcr}

              >
                Start {tool.name}
              </Button>

              {fileItem && (
                <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                  1 file selected ({formatBytes(fileItem.size)})
                </p>
              )}

              {error && <Alert>{error}</Alert>}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
