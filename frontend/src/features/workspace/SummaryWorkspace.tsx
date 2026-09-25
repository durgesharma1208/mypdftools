import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Download,
  KeyRound,
  ListChecks,
  RotateCcw,
  Tag,
} from 'lucide-react';
import type { AiStatus, AiSummaryResult, Tool, UploadedFile } from '../../types';
import { cn, downloadBlob } from '../../lib/utils';

import { fetchAiStatus, summarizePdf } from '../../services/api';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Dropzone } from '../../components/ui/Dropzone';
import { FileList } from '../../components/ui/FileList';
import { Spinner } from '../../components/ui/Spinner';
import { buildFileItem, validateIncomingFile } from './useWorkspace';

interface SummaryWorkspaceProps {
  tool: Tool;
}

export function SummaryWorkspace({ tool }: SummaryWorkspaceProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // AI configuration state
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Document state
  const [fileItem, setFileItem] = useState<UploadedFile | null>(null);

  // Options
  const [style, setStyle] = useState<'concise' | 'detailed'>('concise');
  const [includeKeyPoints, setIncludeKeyPoints] = useState(true);
  const [includeTopics, setIncludeTopics] = useState(true);
  const [includeActionItems, setIncludeActionItems] = useState(false);

  // Processing state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiSummaryResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Check AI setup status and inspect navigation state for preloaded file
  useEffect(() => {
    const checkStatus = () => {
      fetchAiStatus()
        .then((status) => setAiStatus(status))
        .catch(() => setAiStatus({ configured: false, model: '', provider: '', message: 'Could not connect to backend.' }))
        .finally(() => setCheckingStatus(false));
    };

    checkStatus();
    window.addEventListener('focus', checkStatus);

    // Check if preloaded from OCR
    const state = location.state as { preloadedFile?: File } | undefined;
    if (state?.preloadedFile) {
      setFileItem(buildFileItem(state.preloadedFile));
    }

    return () => window.removeEventListener('focus', checkStatus);
  }, [location.state]);


  const handleFiles = useCallback(
    (incoming: File[]) => {
      const picked = incoming[0];
      if (!picked) return;

      const problem = validateIncomingFile(tool, picked);
      if (problem) {
        setError(problem);
        return;
      }

      setError(null);
      setResult(null);
      setFileItem(buildFileItem(picked));
    },
    [tool],
  );

  const reset = useCallback(() => {
    setFileItem(null);
    setResult(null);
    setError(null);
  }, []);

  const handleSummarize = async () => {
    if (!fileItem) return;

    setBusy(true);
    setError(null);

    try {
      const res = await summarizePdf({
        file: fileItem.file,
        style,
        keyPoints: includeKeyPoints,
        topics: includeTopics,
        actionItems: includeActionItems,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate summary.');
    } finally {
      setBusy(false);
    }
  };

  const copySummary = () => {
    if (!result) return;
    const parts = [result.summary];
    if (result.key_points.length > 0) {
      parts.push('\nKey Points:\n' + result.key_points.map((p) => `• ${p}`).join('\n'));
    }
    if (result.topics.length > 0) {
      parts.push('\nTopics:\n' + result.topics.map((t) => `• ${t}`).join('\n'));
    }
    if (result.action_items.length > 0) {
      parts.push('\nAction Items:\n' + result.action_items.map((a) => `• ${a}`).join('\n'));
    }
    navigator.clipboard.writeText(parts.join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSummaryTxt = () => {
    if (!result) return;
    const parts = [
      `=== SUMMARY: ${fileItem?.file.name ?? 'Document'} ===\n`,
      result.summary,
    ];
    if (result.key_points.length > 0) {
      parts.push('\n\n--- KEY POINTS ---\n' + result.key_points.map((p) => `• ${p}`).join('\n'));
    }
    if (result.topics.length > 0) {
      parts.push('\n\n--- TOPICS ---\n' + result.topics.map((t) => `• ${t}`).join('\n'));
    }
    if (result.action_items.length > 0) {
      parts.push('\n\n--- ACTION ITEMS ---\n' + result.action_items.map((a) => `• ${a}`).join('\n'));
    }
    const blob = new Blob([parts.join('\n')], { type: 'text/plain;charset=utf-8' });
    const stem = fileItem?.file.name.replace(/\.[^/.]+$/, '') ?? 'summary';
    downloadBlob(blob, `${stem}_summary.txt`);
  };

  const goToAskQuestions = () => {
    if (!fileItem) return;
    navigate('/tools/ask-pdf', {
      state: {
        preloadedFile: fileItem.file,
      },
    });
  };

  const Icon = tool.icon;

  if (checkingStatus) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-brand-600 dark:text-brand-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Disabled / Unconfigured Warning State */}
      {aiStatus && !aiStatus.configured && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200 animate-fade-up">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
              <KeyRound className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">AI features are not configured yet</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                To activate PDF Summary and Ask Questions, add your server-side <code className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-xs text-amber-800 dark:text-amber-200">API_KEY</code> into the backend <code className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-xs text-amber-800 dark:text-amber-200">.env</code> file.
              </p>
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-surface-panel/80 p-3 font-mono text-xs dark:bg-surface-panel-dark/80">
                <p className="text-zinc-400"># In backend/.env:</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold">API_KEY=your_openai_or_groq_or_openrouter_api_key</p>
                <p className="text-zinc-400">AI_MODEL=gpt-4o-mini</p>
              </div>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                The key remains strictly server-side and is never exposed to the client.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main Area */}
        <section className="min-w-0 space-y-4">
          {result ? (
            /* Summary Document Result Card */
            <div className="card-surface animate-scale-in p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-line pb-4 dark:border-surface-line-dark">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Document Summary</h2>
                    {result.ocr_used && (
                      <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                        OCR Applied
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {result.pages_processed} page{result.pages_processed === 1 ? '' : 's'} analyzed · {fileItem?.file.name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={copySummary}>
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button variant="primary" size="sm" onClick={downloadSummaryTxt}>
                    <Download className="h-3.5 w-3.5" />
                    Download .txt
                  </Button>
                </div>
              </div>

              {/* Summary Text */}
              <div className="rounded-xl border border-surface-line bg-surface-panel p-5 dark:border-surface-line-dark dark:bg-surface-panel-dark">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Executive Overview
                </h3>
                <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-line">
                  {result.summary}
                </p>
              </div>

              {/* Key Points */}
              {result.key_points.length > 0 && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-500" />
                    Key Takeaways
                  </h3>
                  <div className="grid gap-2">
                    {result.key_points.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 rounded-xl border border-surface-line bg-surface p-3 text-sm text-zinc-800 dark:border-surface-line-dark dark:bg-surface-dark dark:text-zinc-200"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                        <span className="leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics */}
              {result.topics.length > 0 && (
                <div className="space-y-2">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <Tag className="h-3.5 w-3.5 text-brand-500" />
                    Primary Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.topics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="rounded-full border border-surface-line bg-surface-panel px-3 py-1 text-xs font-medium text-zinc-700 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {result.action_items.length > 0 && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <ListChecks className="h-3.5 w-3.5 text-brand-500" />
                    Action Items
                  </h3>
                  <div className="grid gap-2">
                    {result.action_items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 rounded-xl border border-surface-line bg-surface p-3 text-sm text-zinc-800 dark:border-surface-line-dark dark:bg-surface-dark dark:text-zinc-200"
                      >
                        <span className="mt-1 h-4 w-4 shrink-0 text-emerald-500">✓</span>
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interoperability to Ask Questions */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
                <div className="flex items-center gap-2.5">
                  <Bot className="h-5 w-5 text-brand-500" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">Have specific questions?</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Query this document directly with grounded page citations.
                    </p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={goToAskQuestions}>
                  <Bot className="h-3.5 w-3.5 text-brand-500" />
                  Ask Questions →
                </Button>
              </div>

              {/* Privacy notice & start over */}
              <div className="flex items-center justify-between border-t border-surface-line pt-4 text-xs text-zinc-400 dark:border-surface-line-dark dark:text-zinc-500">
                <span>{result.notice}</span>
                <Button variant="secondary" size="sm" onClick={reset}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Summarize another PDF
                </Button>
              </div>
            </div>
          ) : fileItem ? (
            <FileList items={[fileItem]} kind="pdf" onRemove={reset} />
          ) : (
            <Dropzone
              accept={tool.accept}
              multiple={false}
              label="Drop your PDF to summarize"
              sublabel="or click to browse"
              hint="PDF files · up to 50 MB"
              onFiles={handleFiles}
            />
          )}
        </section>

        {/* Sidebar Controls */}
        <aside className="min-w-0 space-y-4">
          {busy ? (
            <div className="card-surface animate-scale-in overflow-hidden">
              <div className="flex items-center gap-3 border-b border-surface-line px-5 py-4 dark:border-surface-line-dark">
                <Spinner className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">Summarizing Document</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Reading and extracting key insights…</p>
                </div>
              </div>
              <div className="p-5 space-y-2">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-panel dark:bg-surface-panel-dark">
                  <div className="absolute inset-0 w-1/3 rounded-full bg-gradient-to-r from-brand-500 to-violet-500 animate-progress-indeterminate" />
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  If the document is scanned, OCR is applied automatically first.
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

              <div className="space-y-5 p-5">
                {/* Summary Style */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Summary Length
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStyle('concise')}
                      className={cn(
                        'rounded-xl border p-2.5 text-center text-xs font-medium transition-all',
                        style === 'concise'
                          ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300 font-semibold shadow-sm'
                          : 'border-surface-line bg-surface-panel text-zinc-600 hover:border-zinc-300 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-400',
                      )}
                    >
                      Concise
                    </button>
                    <button
                      type="button"
                      onClick={() => setStyle('detailed')}
                      className={cn(
                        'rounded-xl border p-2.5 text-center text-xs font-medium transition-all',
                        style === 'detailed'
                          ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300 font-semibold shadow-sm'
                          : 'border-surface-line bg-surface-panel text-zinc-600 hover:border-zinc-300 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-400',
                      )}
                    >
                      Detailed
                    </button>
                  </div>
                </div>

                {/* Additional Sections */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Include in Summary
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeKeyPoints}
                      onChange={(e) => setIncludeKeyPoints(e.target.checked)}
                      className="rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
                    />
                    Key Points & Takeaways
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTopics}
                      onChange={(e) => setIncludeTopics(e.target.checked)}
                      className="rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
                    />
                    Main Topics & Themes
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeActionItems}
                      onChange={(e) => setIncludeActionItems(e.target.checked)}
                      className="rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
                    />
                    Action Items (if found)
                  </label>
                </div>

                {/* Submit button */}
                <Button
                  variant="primary"
                  size="lg"
                  full
                  disabled={!fileItem || busy || (aiStatus !== null && !aiStatus.configured)}
                  onClick={handleSummarize}
                >
                  Generate Summary
                </Button>

                {/* Privacy note */}
                <p className="text-center text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
                  Documents are processed in memory and never stored permanently.
                </p>

                {error && <Alert>{error}</Alert>}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
