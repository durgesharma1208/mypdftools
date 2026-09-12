import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { categoryOf, getTool } from '../lib/tools';
import { Workspace } from '../features/workspace/Workspace';
import { EmptyState } from '../components/ui/EmptyState';
import { ButtonLink } from '../components/ui/Button';
import { FileQuestion } from 'lucide-react';

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = getTool(slug);

  if (!tool) {
    return (
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
      </div>
    );
  }

  const category = categoryOf(tool.category);
  const Icon = tool.icon;

  return (
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
          </p>
        </div>
      </header>

      <div className="mt-6">
        <Workspace tool={tool} />
      </div>
    </div>
  );
}
