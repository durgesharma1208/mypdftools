import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FileCheck2,
  Gauge,
  LayoutGrid,
  ListOrdered,
  ScanEye,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES, POPULAR_TOOLS, TOOLS } from '../lib/tools';
import { ToolCard } from '../components/tools/ToolCard';
import { ServerStatusPill } from '../components/layout/ServerStatusPill';
import { ButtonLink } from '../components/ui/Button';

const BENEFITS = [
  {
    icon: ScanEye,
    title: 'See before you commit',
    body: 'Page-level tools draw real thumbnails locally with pdf.js, so you can select, reorder or check a document before anything is processed.',
  },
  {
    icon: Gauge,
    title: 'Numbers you can trust',
    body: 'Compression reports the bytes actually saved. Uploads report real progress. Nothing is dressed up with fake percentages.',
  },
  {
    icon: ShieldCheck,
    title: 'Short-lived by design',
    body: 'Files are validated, processed in an isolated temporary workspace, and deleted as soon as your download is generated. No accounts, no file history.',
  },
  {
    icon: FileCheck2,
    title: 'Careful about limits',
    body: 'When something is not possible — a missing server dependency, a scanned PDF without a text layer — the interface says so plainly.',
  },
];

const STEPS = [
  { title: 'Add your document', body: 'Drop a file or pick one. It is checked against the server’s real size and format limits before anything is sent.' },
  { title: 'Choose what happens', body: 'Set the options, select pages in the preview, or reorder the document — the workspace only shows controls that apply.' },
  { title: 'Download the result', body: 'The processed file is streamed straight back to your browser. The temporary copy on the server is removed immediately.' },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-14 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16 lg:pb-20">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
              <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {TOOLS.length} tools · no sign-up · nothing stored
            </p>

            <h1 className="mt-6 text-display font-semibold text-ink">
              Quietly powerful
              <br />
              document tools.
            </h1>

            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-muted text-wrap-pretty">
              Merge, split, organise, compress, watermark, protect, OCR and AI-summarise PDFs. Live page previews, precise output,
              and a workspace that stays out of your way.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink
                to="/tools"
                variant="primary"
                size="lg"
                icon={<LayoutGrid className="h-4 w-4" aria-hidden="true" />}
              >
                Explore tools
              </ButtonLink>
              <ButtonLink
                to="/tools/merge"
                variant="secondary"
                size="lg"
                icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                Try Merge PDF
              </ButtonLink>
            </div>

            <div className="mt-8 border-t border-line pt-5">
              <ServerStatusPill showDetails />
            </div>

            {/* Stats row */}
            <div className="mt-10 flex flex-wrap gap-6">
              {[
                { value: `${TOOLS.length}+`, label: 'PDF tools' },
                { value: 'Free', label: 'No sign-up' },
                { value: 'AES-256', label: 'Encryption' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl font-bold text-ink">{stat.value}</p>
                  <p className="text-sm text-ink-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <HeroWorkspaceVisual />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16" aria-labelledby="popular-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Most used</p>
            <h2 id="popular-heading" className="mt-2 text-headline font-semibold text-ink">
              Start with the essentials
            </h2>
          </div>
          <Link to="/tools" className="link text-sm">
            Browse all {TOOLS.length} tools
          </Link>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_TOOLS.slice(0, 4).map((tool, index) => (
            <ToolCard key={tool.slug} tool={tool} index={index} />
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface" aria-labelledby="categories-heading">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <p className="eyebrow">Categories</p>
          <h2 id="categories-heading" className="mt-2 text-headline font-semibold text-ink">
            Everything organised the way you work
          </h2>

          <ul className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => {
              const count = TOOLS.filter((tool) => tool.category === category.key).length;
              return (
                <li key={category.key} className="bg-surface">
                  <Link
                    to={`/tools?category=${category.key}`}
                    className="group flex h-full flex-col gap-2 p-5 transition-colors hover:bg-surface-muted"
                  >
                    <span className="flex items-center gap-2.5">
                      <category.icon className="h-4 w-4 text-accent" aria-hidden="true" />
                      <span className="text-sm font-semibold text-ink">{category.label}</span>
                      <span className="ml-auto text-xs text-ink-subtle tabular">{count}</span>
                    </span>
                    <span className="text-sm leading-relaxed text-ink-muted text-wrap-pretty">{category.blurb}</span>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
                      Open category
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16" aria-labelledby="benefits-heading">
        <div className="max-w-2xl">
          <p className="eyebrow">Why it feels different</p>
          <h2 id="benefits-heading" className="mt-2 text-headline font-semibold text-ink">
            Built around documents, not dashboards
          </h2>
        </div>

        <ul className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className="bg-surface p-6">
              <benefit.icon className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
              <h3 className="mt-3.5 text-[15px] font-semibold text-ink">{benefit.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted text-wrap-pretty">{benefit.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line bg-surface" aria-labelledby="steps-heading">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h2 id="steps-heading" className="mt-2 text-headline font-semibold text-ink">
              Three steps, every time
            </h2>
          </div>

          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-surface-muted font-mono text-xs font-semibold text-ink-muted">
                  {index + 1}
                </span>
                <h3 className="mt-3.5 text-[15px] font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted text-wrap-pretty">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-col items-start gap-6 rounded-lg border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-xl">
            <h2 className="text-title font-semibold text-ink">Pick a tool and get it done</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted text-wrap-pretty">
              No account, no upload queue, no watermark on your output. Just the document work you came here for.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/tools" variant="primary" size="md" icon={<LayoutGrid className="h-4 w-4" aria-hidden="true" />}>
              Explore all tools
            </ButtonLink>
            <ButtonLink to="/tools/organise" variant="secondary" size="md" icon={<ListOrdered className="h-4 w-4" aria-hidden="true" />}>
              Organise pages
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * Original hero visual: a document workspace mock built from layered sheets,
 * a page rail and status chips. Deliberately flat — borders and hairlines carry
 * the depth instead of gradients or shadows.
 */
function HeroWorkspaceVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[400px] select-none" aria-hidden="true">
      <div className="absolute -right-3 top-8 hidden h-[86%] w-full rounded-lg border border-line bg-surface-muted/60 sm:block" />
      <div className="absolute -left-3 top-4 hidden h-[92%] w-full rounded-lg border border-line bg-surface sm:block" />

      <div className="relative rounded-lg border border-line bg-surface p-4">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-line bg-surface-muted">
              <FileCheck2 className="h-3.5 w-3.5 text-ink-muted" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-ink">quarterly-report.pdf</span>
              <span className="block text-2xs text-ink-subtle tabular">6 pages · 2.4 MB</span>
            </span>
          </div>
          <span className="shrink-0 rounded-full border border-positive/25 bg-positive-soft px-2 py-0.5 text-2xs font-semibold uppercase text-positive">
            Ready
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }, (_, index) => {
            const selected = index === 1 || index === 4;
            return (
              <div
                key={index}
                className={
                  selected
                    ? 'rounded-sm border border-accent bg-accent-soft p-1.5'
                    : 'rounded-sm border border-line bg-surface-muted p-1.5'
                }
              >
                <div className="space-y-1">
                  <div className="h-0.5 w-6 rounded-full bg-line-strong" />
                  <div className="h-0.5 w-9 rounded-full bg-line-strong" />
                  <div className="h-0.5 w-7 rounded-full bg-line-strong" />
                  <div className="h-0.5 w-9 rounded-full bg-line-strong" />
                </div>
                <p className={selected ? 'mt-1.5 font-mono text-2xs text-accent' : 'mt-1.5 font-mono text-2xs text-ink-subtle'}>
                  {String(index + 1).padStart(2, '0')}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <span className="inline-flex items-center gap-1.5 text-2xs font-medium uppercase tracking-[0.08em] text-ink-subtle">
            <ListOrdered className="h-3 w-3" />
            2 pages selected
          </span>
          <span className="inline-flex items-center gap-1 rounded-sm border border-line bg-surface-muted px-2 py-1 text-2xs font-medium text-ink-muted">
            Merge PDF
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-positive" />
        <span className="text-2xs font-medium text-ink-muted">Deleted server-side after download</span>
      </div>
    </div>
  );
}
