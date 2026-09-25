import { Link, useParams } from 'react-router-dom';
<<<<<<< HEAD
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { categoryOf, getTool } from '../lib/tools';
import { Workspace } from '../features/workspace/Workspace';
=======
import { ArrowLeft } from 'lucide-react';
import { categoryOf, getTool } from '../lib/tools';
import { Workspace } from '../features/workspace/Workspace';
import { EmptyState } from '../components/ui/EmptyState';
import { ButtonLink } from '../components/ui/Button';
import { FileQuestion } from 'lucide-react';
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = getTool(slug);

  if (!tool) {
    return (
<<<<<<< HEAD
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </span>
          <h1 className="mt-5 text-2xl font-bold text-zinc-900 dark:text-white">Tool not found</h1>
          <p className="mt-2 max-w-sm text-zinc-500 dark:text-zinc-400">
            That tool could not be found. Please check the URL or browse all tools.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-gradient px-6 text-sm font-semibold text-white shadow-sm shadow-brand-500/25 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/30"
          >
            Browse all tools
          </Link>
        </div>
=======
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={FileQuestion}
          title="That tool does not exist"
          description="The link may be out of date. Every available tool is listed in the library."
          action={
            <ButtonLink to="/tools" variant="primary">
              Browse all tools
            </ButtonLink>
          }
        />
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
      </div>
    );
  }

  const category = categoryOf(tool.category);
  const Icon = tool.icon;
  const CategoryIcon = category.icon;

  return (
<<<<<<< HEAD
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm">
        <Link
          to="/"
          className="text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200"
        >
          Tools
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
        <span className="text-zinc-600 dark:text-zinc-300">{category.label}</span>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
        <span className="font-medium text-zinc-900 dark:text-white">{tool.name}</span>
      </nav>

      {/* Page header */}
      <header className="mb-8 flex flex-col gap-5 rounded-2xl border border-surface-line bg-surface p-6 shadow-soft dark:border-surface-line-dark dark:bg-surface-dark sm:flex-row sm:items-start">
        {/* Icon */}
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-md shadow-brand-500/25">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              {tool.name}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-line bg-surface-panel px-2.5 py-1 text-xs font-medium text-zinc-500 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-400">
              <CategoryIcon className="h-3 w-3" aria-hidden="true" />
              {category.label}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {tool.description}
=======
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:pb-14">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 rounded-sm px-1.5 py-1 text-ink-subtle transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          All tools
        </Link>
        <span aria-hidden="true" className="text-line-strong">
          /
        </span>
        <Link
          to={`/tools?category=${category.key}`}
          className="rounded-sm px-1.5 py-1 text-ink-subtle transition-colors hover:text-ink"
        >
          {category.label}
        </Link>
      </nav>

      <header className="mt-5 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-start sm:gap-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line bg-surface-muted text-accent">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-headline font-semibold text-ink">{tool.name}</h1>
          <p className="mt-1.5 max-w-2xl text-[15px] font-medium text-ink-muted text-wrap-pretty">{tool.tagline}</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted text-wrap-pretty">{tool.description}</p>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs font-medium uppercase tracking-[0.08em] text-ink-subtle">
            <span>{tool.inputLabel}</span>
            <span aria-hidden="true" className="text-line-strong">
              →
            </span>
            <span>{tool.outputLabel}</span>
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
          </p>
        </div>

        {/* Back link */}
        <Link
          to="/"
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-surface-line bg-surface-panel px-3 py-2 text-sm font-medium text-zinc-500 transition-all duration-150 hover:border-brand-300 hover:text-brand-600 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-400 dark:hover:border-brand-500/40 dark:hover:text-brand-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All tools
        </Link>
      </header>

<<<<<<< HEAD
      {/* Workspace */}
      <Workspace tool={tool} />
=======
      <div className="mt-6">
        <Workspace tool={tool} />
      </div>
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
    </div>
  );
}
