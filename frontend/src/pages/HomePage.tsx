import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Braces, FileLock2, Gauge, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { CATEGORIES, TOOLS } from '../lib/tools';
import { ToolCard } from '../components/tools/ToolCard';
import { cn } from '../lib/utils';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Private by design',
    body: 'Files are processed in isolated workspaces and permanently deleted minutes after you download your result. No accounts, no storage, no tracking.',
  },
  {
    icon: Gauge,
    title: 'Honest compression',
    body: 'Pick a lossless or balanced compression level and see exactly how much space you saved — no fake percentage tricks.',
  },
  {
    icon: Braces,
    title: 'Precise previews',
    body: 'See thumbnails of every page before you commit. Select, reorder and inspect what the output will look like.',
  },
  {
    icon: FileLock2,
    title: 'Ship-ready output',
    body: 'Standard-compliant PDFs, modern AES-256 encryption, and clean file names preserved through every conversion.',
  },
];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusSearch = () => searchRef.current?.focus();
    window.addEventListener('mypdftools:focus-search', focusSearch);
    return () => window.removeEventListener('mypdftools:focus-search', focusSearch);
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

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-radial" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_380px] lg:pb-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Free · no sign-up · files never stored
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              Every PDF tool you need.
              <span className="block bg-gradient-to-r from-brand-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent dark:from-brand-400 dark:via-violet-400 dark:to-fuchsia-400">
                In one place.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
              Merge, split, compress, protect and convert PDFs — with live page previews, honest compression, and your files deleted seconds after processing.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#tools"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-gradient px-6 text-[15px] font-semibold text-white shadow-sm shadow-brand-500/25 transition-all hover:shadow-lg hover:shadow-brand-500/30 hover:brightness-110"
              >
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#features"
                className="inline-flex h-12 items-center rounded-xl border border-surface-line bg-surface px-6 text-[15px] font-semibold text-zinc-700 transition-colors hover:bg-surface-panel dark:border-surface-line-dark dark:bg-surface-dark dark:text-zinc-200 dark:hover:bg-surface-panel"
              >
                See features
              </a>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6">
        <div className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                All tools
              </h2>
              <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                {visibleCount} tools across {grouped.length} categories
              </p>
            </div>
            <div className="relative lg:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools…"
                aria-label="Search tools"
                className="h-11 w-full rounded-xl border border-surface-line bg-surface pl-10 pr-4 text-sm text-zinc-900 shadow-none transition-colors placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none dark:border-surface-line-dark dark:bg-surface-dark dark:text-white"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <CategoryPill active={!activeCategory} onClick={() => setCategory(null)}>
              All
            </CategoryPill>
            {CATEGORIES.map((category) => (
              <CategoryPill
                key={category.key}
                active={activeCategory === category.key}
                onClick={() => setCategory(activeCategory === category.key ? null : category.key)}
              >
                {category.label}
              </CategoryPill>
            ))}
          </div>
        </div>

        {grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-line p-12 text-center dark:border-surface-line-dark">
            <p className="text-zinc-500 dark:text-zinc-400">No tools match “{query}”. Try “merge”, “compress” or “protect”.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped
              .filter((group) => !activeCategory || group.category.key === activeCategory)
              .map(({ category, tools }) => (
                <section key={category.key} aria-labelledby={`category-${category.key}`}>
                  <div className="mb-4 flex items-baseline gap-3">
                    <h3 id={`category-${category.key}`} className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {category.label}
                    </h3>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">{tools.length}</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool, index) => (
                      <ToolCard key={tool.slug} tool={tool} index={index} />
                    ))}
                  </div>
                </section>
              ))}
          </div>
        )}
      </section>

      <section id="features" className="scroll-mt-20 border-y border-surface-line bg-surface dark:border-surface-line-dark dark:bg-surface-dark">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Built to respect your documents
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-zinc-500 dark:text-zinc-400">
            A focused PDF toolbox with a heavy emphasis on privacy, quality and clarity.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-surface-line bg-surface-panel p-5 dark:border-surface-line-dark dark:bg-surface-panel">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Your files never leave your control</h3>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Everything runs on your own machine when you self-host, or in memory-only workspaces that are wiped automatically. Protected PDFs use AES-256 encryption, and every download is cleaned from the server afterwards.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

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
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-brand-500 bg-brand-gradient text-white shadow-sm'
          : 'border-surface-line bg-surface text-zinc-600 hover:border-brand-300 hover:text-zinc-900 dark:border-surface-line-dark dark:bg-surface-dark dark:text-zinc-300 dark:hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

function HeroVisual() {
  return (
    <div className="relative hidden select-none lg:block" aria-hidden="true">
      <div className="relative mx-auto w-80">
        <div className="absolute -inset-6 rounded-[2rem] bg-brand-500/20 blur-2xl" />

        <div className="animate-float relative rounded-2xl border border-surface-line bg-surface p-5 shadow-card dark:border-surface-line-dark dark:bg-surface-dark">
          <div className="flex items-center gap-3 border-b border-surface-line pb-4 dark:border-surface-line-dark">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">report_final_v2.pdf</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">2.4 MB → 890 KB</p>
            </div>
            <span className="ml-auto rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Done
            </span>
          </div>

          <div className="space-y-2.5 pt-4">
            {[18, 30, 24, 28, 16].map((width, index) => (
              <div key={index} className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700" style={{ width: `${width}%`, marginLeft: index % 2 ? '12%' : '0' }} />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-surface-panel px-3 py-2.5 dark:bg-surface-panel">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-300">
                <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              Compression level
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              −63%
            </span>
          </div>
        </div>

        <div className="animate-float absolute -right-6 -top-6 rounded-2xl border border-surface-line bg-surface px-4 py-3 shadow-card dark:border-surface-line-dark dark:bg-surface-dark" style={{ animationDelay: '-2s' }}>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Pages</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">24 pages</p>
        </div>

        <div className="animate-float absolute -bottom-5 -left-8 flex items-center gap-2.5 rounded-2xl border border-surface-line bg-surface px-4 py-3 shadow-card dark:border-surface-line-dark dark:bg-surface-dark" style={{ animationDelay: '-4s' }}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <FileLock2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-xs font-semibold text-zinc-900 dark:text-white">AES-256 protected</p>
        </div>
      </div>
    </div>
  );
}