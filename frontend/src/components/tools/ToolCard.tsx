import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Tool } from '../../types';
import { cn } from '../../lib/utils';

export function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const Icon = tool.icon;

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className={cn(
        'group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-surface-line bg-surface p-5 shadow-soft',
        'transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-card dark:border-surface-line-dark dark:bg-surface-dark dark:hover:border-brand-500/50',
        'animate-fade-up',
      )}
      style={{ animationDelay: `${Math.min(index, 16) * 30}ms` }}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 transition-colors group-hover:bg-brand-gradient group-hover:text-white dark:text-brand-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <ArrowRight className="h-4 w-4 text-zinc-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand-500 dark:text-zinc-600" aria-hidden="true" />
      </div>

      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-white">{tool.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{tool.short}</p>
      </div>

      <span className="mt-auto inline-flex w-fit items-center rounded-full bg-surface-panel px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:bg-surface-panel dark:text-zinc-500">
        {tool.kind === 'pdf' ? 'PDF' : tool.kind === 'image' ? 'JPG · PNG' : tool.kind.toUpperCase()}
      </span>
    </Link>
  );
}