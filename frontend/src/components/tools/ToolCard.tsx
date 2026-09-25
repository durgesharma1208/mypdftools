import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Tool } from '../../types';
import { cn } from '../../lib/utils';

<<<<<<< HEAD
const kindLabel: Record<string, string> = {
  pdf: 'PDF',
  image: 'Image',
  word: 'Word',
  excel: 'Excel',
  ppt: 'PowerPoint',
};

const kindColors: Record<string, string> = {
  pdf: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  image: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  word: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  excel: 'bg-green-600/10 text-green-700 dark:text-green-400',
  ppt: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
};

export function ToolCard({ tool, index }: { tool: Tool; index: number }) {
=======
interface ToolCardProps {
  tool: Tool;
  /** Adds an index-based stagger to the entry animation of a grid. */
  index?: number;
  compact?: boolean;
}

export function ToolCard({ tool, index = 0, compact = false }: ToolCardProps) {
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
  const Icon = tool.icon;
  const delay = Math.min(index, 18) * 28;

  return (
    <Link
      to={`/tools/${tool.slug}`}
      aria-label={`${tool.name} — ${tool.short}`}
      style={{ animationDelay: `${Math.min(index, 12) * 24}ms` }}
      className={cn(
<<<<<<< HEAD
        'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-surface-line bg-surface p-5',
        'shadow-soft transition-all duration-200',
        'hover:-translate-y-1 hover:border-brand-300/70 hover:shadow-card',
        'dark:border-surface-line-dark dark:bg-surface-dark dark:hover:border-brand-500/40',
        'animate-fade-up',
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-brand-gradient-subtle opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />

      {/* Header row */}
      <div className="relative flex items-start justify-between">
        <span
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200',
            'bg-brand-500/8 text-brand-600 dark:text-brand-400',
            'group-hover:bg-brand-gradient group-hover:text-white group-hover:shadow-sm group-hover:shadow-brand-500/25',
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>

        <ArrowRight
          className="h-4 w-4 text-zinc-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-brand-500 dark:text-zinc-600"
=======
        'group panel animate-rise relative flex flex-col gap-3 p-4 transition-colors duration-150 ease-out',
        'hover:border-line-strong hover:bg-surface',
        compact && 'gap-2 p-3.5',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'flex items-center justify-center rounded-md border border-line bg-surface-muted text-ink-muted transition-colors duration-150',
            'group-hover:border-accent/40 group-hover:bg-accent-soft group-hover:text-accent',
            compact ? 'h-8 w-8' : 'h-9 w-9',
          )}
          aria-hidden="true"
        >
          <Icon className={compact ? 'h-4 w-4' : 'h-4.5 w-4.5'} />
        </span>
        <ArrowRight
          className="mt-1 h-4 w-4 shrink-0 text-line-strong transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-accent"
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
          aria-hidden="true"
        />
      </div>

<<<<<<< HEAD
      {/* Body */}
      <div className="relative flex-1">
        <h3 className="font-semibold text-zinc-900 transition-colors duration-150 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
          {tool.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {tool.tagline}
        </p>
      </div>

      {/* Footer badge */}
      <div className="relative flex items-center justify-between">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
            tool.category === 'ai'
              ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold'
              : tool.category === 'ocr'
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
              : kindColors[tool.kind],
          )}
        >
          {tool.category === 'ai'
            ? 'AI Powered'
            : tool.category === 'ocr'
            ? 'OCR Engine'
            : kindLabel[tool.kind] ?? tool.kind.toUpperCase()}
        </span>
      </div>

=======
      <div className="min-w-0">
        <h3 className={cn('font-semibold tracking-[-0.01em] text-ink', compact ? 'text-sm' : 'text-[15px]')}>{tool.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted text-wrap-pretty">{tool.short}</p>
      </div>

      {!compact && (
        <p className="mt-auto flex items-center gap-1.5 text-2xs font-medium uppercase tracking-[0.08em] text-ink-subtle">
          <span>{tool.inputLabel}</span>
          <span aria-hidden="true" className="text-line-strong">
            →
          </span>
          <span>{tool.outputLabel}</span>
        </p>
      )}
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
    </Link>
  );
}
