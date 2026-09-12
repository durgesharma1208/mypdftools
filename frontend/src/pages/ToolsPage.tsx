import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { CATEGORIES, TOOLS, toolMatchesQuery } from '../lib/tools';
import type { CategoryKey } from '../types';
import { ToolCard } from '../components/tools/ToolCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { cn } from '../lib/utils';

function isCategoryKey(value: string | null): value is CategoryKey {
  return value !== null && CATEGORIES.some((category) => category.key === value);
}

export default function ToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const rawCategory = searchParams.get('category');
  const category = isCategoryKey(rawCategory) ? rawCategory : null;

  const update = useCallback(
    (next: { q?: string; category?: CategoryKey | null }) => {
      const params = new URLSearchParams(searchParams);
      if (next.q !== undefined) {
        if (next.q) params.set('q', next.q);
        else params.delete('q');
      }
      if (next.category !== undefined) {
        if (next.category) params.set('category', next.category);
        else params.delete('category');
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const matches = useMemo(
    () =>
      TOOLS.filter(
        (tool) => toolMatchesQuery(tool, query) && (!category || tool.category === category),
      ),
    [category, query],
  );

  const grouped = useMemo(
    () =>
      CATEGORIES.map((meta) => ({
        meta,
        tools: matches.filter((tool) => tool.category === meta.key),
      })).filter((group) => group.tools.length > 0),
    [matches],
  );

  const filtersActive = query.trim().length > 0 || category !== null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Tool library</p>
        <h1 className="mt-2 text-headline font-semibold text-ink">
          {TOOLS.length} document tools, one quiet interface
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted text-wrap-pretty">
          Every tool below is implemented end to end against the same processing engine — no placeholders, no waiting
          lists. Page-level tools render live previews locally in your browser.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
              aria-hidden="true"
            />
            <input
              id="tool-search"
              type="search"
              value={query}
              onChange={(event) => update({ q: event.target.value })}
              placeholder="Search tools, formats or tasks…"
              aria-label="Search tools"
              className="input-base h-11 pl-9 pr-9"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => update({ q: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-ink-subtle transition-colors hover:text-ink"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
          <p className="text-sm text-ink-subtle tabular sm:shrink-0" aria-live="polite">
            {matches.length} of {TOOLS.length} tools
          </p>
        </div>

        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1.5">
          <FilterPill active={category === null} onClick={() => update({ category: null })}>
            All categories
          </FilterPill>
          {CATEGORIES.map((meta) => (
            <FilterPill
              key={meta.key}
              active={category === meta.key}
              onClick={() => update({ category: category === meta.key ? null : meta.key })}
            >
              {meta.label}
              <span className="ml-1 text-ink-subtle tabular">
                {TOOLS.filter((tool) => tool.category === meta.key).length}
              </span>
            </FilterPill>
          ))}
        </div>
      </div>

      <div className="mt-10 space-y-12">
        {grouped.length === 0 ? (
          <EmptyState
            icon={Search}
            title={`No tools match “${query}”`}
            description="Try a shorter term such as merge, split, compress, watermark or convert."
            action={
              filtersActive ? (
                <Button variant="secondary" onClick={() => setSearchParams({}, { replace: true })}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          grouped.map(({ meta, tools }) => (
            <section key={meta.key} aria-labelledby={`group-${meta.key}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                <div className="flex items-center gap-2.5">
                  <meta.icon className="h-4 w-4 text-ink-subtle" aria-hidden="true" />
                  <h2 id={`group-${meta.key}`} className="text-sm font-semibold text-ink">
                    {meta.label}
                  </h2>
                </div>
                <p className="text-xs text-ink-subtle">{meta.blurb}</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool, index) => (
                  <ToolCard key={tool.slug} tool={tool} index={index} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1.5 text-sm transition-colors duration-150',
        active
          ? 'border-accent bg-accent-soft font-medium text-accent'
          : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
