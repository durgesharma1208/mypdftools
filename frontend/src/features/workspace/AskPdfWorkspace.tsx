import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bot,
  Check,
  Copy,
  FileText,
  KeyRound,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  User,
} from 'lucide-react';
import type { AiStatus, ChatMessage, Tool, UploadedFile } from '../../types';
import { cn, formatBytes, uniqueId } from '../../lib/utils';
import { askPdf, createAiSession, deleteAiSession, fetchAiStatus } from '../../services/api';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Dropzone } from '../../components/ui/Dropzone';
import { Spinner } from '../../components/ui/Spinner';
import { buildFileItem, validateIncomingFile } from './useWorkspace';


interface AskPdfWorkspaceProps {
  tool: Tool;
}

const QUICK_PROMPTS = [
  'What are the key takeaways of this document?',
  'Summarize the main conclusions.',
  'Are there any deadlines, dates, or numbers mentioned?',
];

export function AskPdfWorkspace({ tool }: AskPdfWorkspaceProps) {
  const location = useLocation();

  // AI configuration state
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Document & Session state
  const [fileItem, setFileItem] = useState<UploadedFile | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [ocrUsed, setOcrUsed] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Chat conversation
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, asking]);

  const handleFiles = useCallback(
    async (incoming: File[]) => {
      const picked = incoming[0];
      if (!picked) return;

      const problem = validateIncomingFile(tool, picked);
      if (problem) {
        setError(problem);
        return;
      }

      setError(null);
      setMessages([]);
      setFileItem(buildFileItem(picked));
      setSessionLoading(true);

      try {
        const sessionRes = await createAiSession(picked);
        setSessionId(sessionRes.session_id);
        setPageCount(sessionRes.page_count);
        setOcrUsed(sessionRes.ocr_used);

        // Add welcome message
        setMessages([
          {
            id: uniqueId(),
            role: 'assistant',
            content: `Hello! I've loaded "${picked.name}" (${sessionRes.page_count} page${sessionRes.page_count === 1 ? '' : 's'}${sessionRes.ocr_used ? ', OCR applied' : ''}). What would you like to know about it?`,
            timestamp: Date.now(),
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not prepare document session.');
      } finally {
        setSessionLoading(false);
      }
    },
    [tool],
  );

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

    // Check if preloaded from OCR or Summary
    const state = location.state as { preloadedFile?: File } | undefined;
    if (state?.preloadedFile) {
      handleFiles([state.preloadedFile]);
    }

    return () => window.removeEventListener('focus', checkStatus);
  }, [handleFiles, location.state]);


  const reset = useCallback(() => {
    if (sessionId) {
      deleteAiSession(sessionId);
    }
    setFileItem(null);
    setSessionId(null);
    setPageCount(null);
    setMessages([]);
    setError(null);
    setInputValue('');
  }, [sessionId]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText ?? inputValue).trim();
    if (!q || asking) return;

    if (!fileItem && !sessionId) {
      setError('Please upload a document first.');
      return;
    }

    const userMsg: ChatMessage = {
      id: uniqueId(),
      role: 'user',
      content: q,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setAsking(true);
    setError(null);

    // Format previous history for context
    const historyPayload = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await askPdf({
        question: q,
        sessionId: sessionId ?? undefined,
        file: !sessionId ? fileItem?.file : undefined,
        history: historyPayload,
      });

      if (res.session_id && !sessionId) {
        setSessionId(res.session_id);
      }

      const botMsg: ChatMessage = {
        id: uniqueId(),
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer from AI.');
    } finally {
      setAsking(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
                To activate Ask Questions with PDF, add your server-side <code className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-xs text-amber-800 dark:text-amber-200">API_KEY</code> into the backend <code className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-xs text-amber-800 dark:text-amber-200">.env</code> file.
              </p>
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-surface-panel/80 p-3 font-mono text-xs dark:bg-surface-panel-dark/80">
                <p className="text-zinc-400"># In backend/.env:</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold">API_KEY=your_openai_or_groq_or_openrouter_api_key</p>
                <p className="text-zinc-400">AI_MODEL=gpt-4o-mini</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!fileItem ? (
        /* Upload Area */
        <div className="mx-auto max-w-2xl space-y-4">
          <Dropzone
            accept={tool.accept}
            multiple={false}
            label="Drop your PDF to ask questions"
            hint="PDF documents · up to 50 MB"
            onFiles={handleFiles}
          />
          {error && <Alert>{error}</Alert>}
        </div>
      ) : (
        /* Interactive Chat Workspace */
        <div className="card-surface overflow-hidden flex flex-col h-[680px]">
          {/* Document Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-line bg-surface-panel px-5 py-3 dark:border-surface-line-dark dark:bg-surface-panel-dark">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-brand-500/20">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  {fileItem.file.name}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {pageCount ? `${pageCount} page${pageCount === 1 ? '' : 's'}` : formatBytes(fileItem.file.size)}
                  {ocrUsed && ' · OCR applied'}
                  {sessionLoading && ' · Preparing text index…'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Change Document
              </Button>
            </div>
          </div>

          {/* Chat Messages Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3 max-w-[85%]',
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
                )}
              >
                {/* Avatar */}
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-sm',
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-panel text-brand-600 dark:bg-surface-panel-dark dark:text-brand-400 border border-surface-line dark:border-surface-line-dark',
                  )}
                >
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </span>

                {/* Message Bubble */}
                <div
                  className={cn(
                    'rounded-2xl p-4 text-sm leading-relaxed space-y-2.5',
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                      : 'bg-surface-panel text-zinc-800 border border-surface-line dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-200',
                  )}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Sources Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="border-t border-surface-line/70 pt-2.5 dark:border-surface-line-dark/70 space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Sources from document
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, sIdx) => (
                          <span
                            key={sIdx}
                            title={src.snippet}
                            className="inline-flex items-center gap-1 rounded-md border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-[11px] font-semibold text-brand-700 dark:text-brand-300"
                          >
                            Page {src.page}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Copy button for assistant */}
                  {msg.role === 'assistant' && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => copyMessage(msg.id, msg.content)}
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex items-center gap-1"
                      >
                        {copiedId === msg.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {asking && (
              <div className="flex gap-3 max-w-[85%] mr-auto animate-fade-in">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-panel text-brand-600 dark:bg-surface-panel-dark dark:text-brand-400 border border-surface-line dark:border-surface-line-dark">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="rounded-2xl border border-surface-line bg-surface-panel p-4 text-sm text-zinc-500 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-400 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                  Searching document & formulating grounded answer…
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (if conversation is fresh) */}
          {messages.length <= 2 && (
            <div className="px-5 py-2 border-t border-surface-line dark:border-surface-line-dark bg-surface/50 flex flex-wrap gap-2">
              <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 flex items-center gap-1 self-center">
                <Sparkles className="h-3 w-3 text-brand-500" /> Suggestions:
              </span>
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={asking}
                  onClick={() => handleSend(prompt)}
                  className="rounded-lg border border-surface-line bg-surface-panel px-2.5 py-1 text-xs text-zinc-600 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-400 dark:hover:text-brand-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="border-t border-surface-line bg-surface p-4 dark:border-surface-line-dark dark:bg-surface-dark">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  aiStatus && !aiStatus.configured
                    ? 'AI not configured (add API_KEY in backend .env)'
                    : 'Ask anything about this PDF…'
                }
                disabled={asking || (aiStatus !== null && !aiStatus.configured)}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 rounded-xl border border-surface-line bg-surface-panel px-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 transition-colors focus:border-brand-500 focus:outline-none dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-200"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!inputValue.trim() || asking || (aiStatus !== null && !aiStatus.configured)}
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Ask</span>
              </Button>
            </form>
            <p className="mt-2 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
              Grounded answers citing page references · Documents are processed temporarily in memory.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
