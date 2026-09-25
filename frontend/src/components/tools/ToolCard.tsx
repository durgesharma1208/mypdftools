import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Tool } from '../../types';
import { cn } from '../../lib/utils';

interface ToolCardProps {
  tool: Tool;
  /** Adds an index-based stagger to the entry animation of a grid. */
  index?: number;
  compact?: boolean;
}

export function ToolCard({ tool, index = 0, compact = false }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <Link
      to={`/tools/${tool.slug}`}
      aria-label={`${tool.name} — ${tool.short}`}
      style={{ animationDelay: `${Math.min(index, 12) * 24}ms` }}
      className={cn(
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
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn('font-semibold tracking-[-0.01em] text-ink', compact ? 'text-sm' : 'text-[15px]')}>{tool.name}</h3>
          {(tool.category === 'ai' || tool.category === 'ocr') && (
            <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-2xs font-semibold text-accent uppercase">
              {tool.category === 'ai' ? 'AI' : 'OCR'}
            </span>
          )}
        </div>
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
    </Link>
  );
}
