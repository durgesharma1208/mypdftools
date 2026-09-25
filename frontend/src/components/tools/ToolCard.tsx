import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Tool } from '../../types';
import { cn } from '../../lib/utils';

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
  const Icon = tool.icon;
  const delay = Math.min(index, 18) * 28;

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className={cn(
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
          aria-hidden="true"
        />
      </div>

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

    </Link>
  );
}