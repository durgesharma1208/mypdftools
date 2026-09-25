import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Braces,
  FileLock2,
  Gauge,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { CATEGORIES, TOOLS } from '../lib/tools';
import { ToolCard } from '../components/tools/ToolCard';
import { cn } from '../lib/utils';

/* ─── Feature data ────────────────────────────────────────── */

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Private by design',
    body: 'Files are processed in isolated workspaces and permanently deleted minutes after you download. No accounts, no storage, no tracking.',
    color: 'emerald',
  },
  {
    icon: Gauge,
    title: 'Honest compression',
    body: 'Pick a lossless or balanced compression level and see exactly how much space you saved — no fake percentage tricks.',
    color: 'sky',
  },
  {
    icon: Braces,
    title: 'Native OCR Engine',
    body: 'Turn scanned documents and photos into searchable PDFs, clean text, and editable Word documents with multi-language support.',
    color: 'violet',
  },
  {
    icon: Sparkles,
    title: 'Grounded AI Intelligence',
    body: 'Summarize documents and ask questions with exact page citations. Strictly grounded in your document with zero hallucination.',
    color: 'rose',
  },
];


const FEATURE_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

/* ─── Page component ──────────────────────────────────────── */

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Wire up the header's search-focus event
  useEffect(() => {
    const focusSearch = () => searchRef.current?.focus();
    window.addEventListener('mypdftools:focus-search', focusSearch);
    return () => window.removeEventListener('mypdftools:focus-search', focusSearch);
  }, []);

  // Wire up "/" keyboard shortcut to focus search
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault();
        searchRef.current?.focus();
        document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATEGORIES.map((category) => ({
      category,
      tools: TOOLS.filter(
        (tool) =>
          tool.category === category.key &&
          (!q ||
            [tool.name, tool.short, tool.tagline, tool.description, category.label]
              .join(' ')
              .toLowerCase()
              .includes(q)),
      ),
    })).filter((group) => group.tools.length > 0);
  }, [query]);

  const visibleCount = grouped.reduce((sum, group) => sum + group.tools.length, 0);

  const setCategory = (key: string | null) => {
    if (key) setSearchParams({ category: key });
    else setSearchParams({});
  };

  const clearQuery = () => setQuery('');

  const filteredGroups = grouped.filter(
    (group) => !activeCategory || group.category.key === activeCategory,
  );

  return (
    <>
      {/* ── Hero section ─────────────────────────────────── */}
      <section className="hero-bg relative overflow-hidden">
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[minmax(0,1fr)_400px] lg:pb-28">
          {/* Left: copy */}
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/8 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Free · no sign-up · files never stored
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-[3.5rem]">
              Every PDF tool
              <br />
              <span className="gradient-text">you'll ever need.</span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
              Merge, split, compress, protect, OCR and AI-analyze PDFs — with live page previews,
              honest compression reports, and your files deleted right after processing.
            </p>


            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#tools"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-gradient px-7 text-[15px] font-semibold text-white shadow-sm shadow-brand-500/25 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/30"
              >
                Explore tools
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex h-12 items-center rounded-xl border border-surface-line bg-surface px-7 text-[15px] font-semibold text-zinc-700 transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-300 dark:border-surface-line-dark dark:bg-surface-dark dark:text-zinc-200 dark:hover:border-brand-500/50"
              >
                See features
              </a>
            </div>

            {/* Stats row */}
            <div className="mt-10 flex flex-wrap gap-6">
              {[
                { value: `${TOOLS.length}+`, label: 'PDF tools' },
                { value: 'Free', label: 'No sign-up' },
                { value: 'AES-256', label: 'Encryption' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: visual widget */}
          <HeroVisual />
        </div>
      </section>

      {/* ── Tools section ─────────────────────────────────── */}
      <section id="tools" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6">
        {/* Toolbar */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                All tools
              </h2>
              <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                {visibleCount} tool{visibleCount !== 1 ? 's' : ''} across {grouped.length} categor{grouped.length !== 1 ? 'ies' : 'y'}
              </p>
            </div>

            {/* Search input */}
            <div className="relative lg:w-80">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools…"
                aria-label="Search tools"
                className="h-11 w-full rounded-xl border border-surface-line bg-surface pl-10 pr-10 text-sm text-zinc-900 transition-all duration-150 placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 dark:border-surface-line-dark dark:bg-surface-dark dark:text-white"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearQuery}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Category filter pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            <CategoryPill active={!activeCategory} onClick={() => setCategory(null)}>
              All
            </CategoryPill>
            {CATEGORIES.map((category) => {
              const CatIcon = category.icon;
              return (
                <CategoryPill
                  key={category.key}
                  active={activeCategory === category.key}
                  onClick={() => setCategory(activeCategory === category.key ? null : category.key)}
                >
                  <CatIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {category.label}
                </CategoryPill>
              );
            })}
          </div>
        </div>

        {/* Tool grid */}
        {filteredGroups.length === 0 ? (
          <EmptySearch query={query} onClear={clearQuery} />
        ) : (
          <div className="space-y-12">
            {filteredGroups.map(({ category, tools }) => {
              const CatIcon = category.icon;
              return (
                <section key={category.key} aria-labelledby={`category-${category.key}`}>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <CatIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3
                      id={`category-${category.key}`}
                      className="text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500"
                    >
                      {category.label}
                    </h3>
                    <span className="ml-1 rounded-full bg-surface-panel px-2 py-0.5 text-xs font-medium text-zinc-400 dark:bg-surface-panel-dark dark:text-zinc-500">
                      {tools.length}
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool, index) => (
                      <ToolCard key={tool.slug} tool={tool} index={index} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Features section ──────────────────────────────── */}
      <section
        id="features"
        className="scroll-mt-20 border-y border-surface-line bg-surface dark:border-surface-line-dark dark:bg-surface-dark"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <span className="section-label">Why MyPDFTools</span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Built to respect your documents
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-zinc-500 dark:text-zinc-400">
              A focused PDF toolbox with a heavy emphasis on privacy, quality and clarity.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="animate-fade-up rounded-2xl border border-surface-line bg-surface-panel p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-card dark:border-surface-line-dark dark:bg-surface-panel-dark"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <span
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl',
                      FEATURE_COLORS[feature.color],
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-semibold text-zinc-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {feature.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Privacy assurance CTA ─────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 dark:border-emerald-400/15 dark:bg-emerald-400/5">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                Your files never leave your control
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Everything runs in memory-only workspaces that are wiped automatically after your download. Protected PDFs use AES-256 encryption, and every download is cleaned from the server immediately afterwards. When you self-host, everything runs entirely on your own machine.
              </p>
            </div>
            <a
              href="#tools"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-2 inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-emerald-500 sm:mt-0 sm:self-center"
            >
              Get started
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Sub-components ──────────────────────────────────────── */

function CategoryPill({
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
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-150',
        active
          ? 'border-brand-500/30 bg-brand-gradient text-white shadow-sm shadow-brand-500/20'
          : 'border-surface-line bg-surface text-zinc-600 hover:border-brand-300/70 hover:text-zinc-900 dark:border-surface-line-dark dark:bg-surface-dark dark:text-zinc-300 dark:hover:border-brand-500/40 dark:hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

function EmptySearch({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="animate-fade-in flex flex-col items-center rounded-2xl border border-dashed border-surface-line py-16 text-center dark:border-surface-line-dark">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/8 text-brand-500">
        <Search className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">No tools found</h3>
      <p className="mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        No tools match "{query}". Try "merge", "compress" or "protect".
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-xl border border-surface-line bg-surface px-4 text-sm font-medium text-zinc-600 transition-colors hover:border-brand-300 hover:text-brand-600 dark:border-surface-line-dark dark:bg-surface-dark dark:text-zinc-300 dark:hover:text-brand-300"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
        Clear search
      </button>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative hidden select-none lg:flex lg:items-center lg:justify-center" aria-hidden="true">
      <div className="relative mx-auto w-[340px]">
        {/* Glow blob */}
        <div className="absolute -inset-8 rounded-[3rem] bg-brand-500/15 blur-3xl" />

        {/* Main card */}
        <div className="animate-float relative rounded-2xl border border-surface-line bg-surface p-6 shadow-card dark:border-surface-line-dark dark:bg-surface-dark">
          <div className="flex items-center gap-3 border-b border-surface-line pb-4 dark:border-surface-line-dark">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-brand-500/25">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                report_final_v2.pdf
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">2.4 MB → 890 KB</p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Done
            </span>
          </div>

          {/* Fake page lines */}
          <div className="space-y-2.5 pt-5">
            {[70, 45, 90, 55, 35, 60].map((width, index) => (
              <div
                key={index}
                className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800"
                style={{ width: `${width}%`, marginLeft: index % 2 ? '8%' : '0' }}
              />
            ))}
          </div>

          {/* Compression stat */}
          <div className="mt-5 flex items-center justify-between rounded-xl bg-surface-panel px-3.5 py-3 dark:bg-surface-panel-dark">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-500/12 text-brand-600 dark:text-brand-400">
                <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              Compression level
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              −63%
            </span>
          </div>
        </div>

        {/* Pages badge */}
        <div
          className="animate-float absolute -right-6 -top-5 rounded-2xl border border-surface-line bg-surface px-4 py-3 shadow-card dark:border-surface-line-dark dark:bg-surface-dark"
          style={{ animationDelay: '-2s' }}
        >
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Pages</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">24 pages</p>
        </div>

        {/* Encryption badge */}
        <div
          className="animate-float absolute -bottom-5 -left-8 flex items-center gap-2.5 rounded-2xl border border-surface-line bg-surface px-4 py-3 shadow-card dark:border-surface-line-dark dark:bg-surface-dark"
          style={{ animationDelay: '-4s' }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
            <FileLock2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-xs font-semibold text-zinc-900 dark:text-white">AES-256 protected</p>
        </div>
      </div>
    </div>
  );
}