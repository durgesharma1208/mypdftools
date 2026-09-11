import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { categoryOf, getTool } from '../lib/tools';
import { Workspace } from '../features/workspace/Workspace';
import { Alert } from '../components/ui/Alert';

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? getTool(slug) : undefined;

  if (!tool) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Alert>That tool could not be found.</Alert>
        <div className="mt-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to all tools
          </Link>
        </div>
      </div>
    );
  }

  const category = categoryOf(tool.category);
  const Icon = tool.icon;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All tools
      </Link>

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-sm shadow-brand-500/25">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">{tool.name}</h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-surface-line bg-surface-panel px-2.5 py-1 text-xs font-medium text-zinc-500 dark:border-surface-line-dark dark:bg-surface-panel dark:text-zinc-400">
              <LayoutGrid className="h-3 w-3" aria-hidden="true" />
              {category.label}
            </span>
          </div>
          <p className="mt-1.5 max-w-2xl text-zinc-500 dark:text-zinc-400">{tool.description}</p>
        </div>
      </header>

      <div className="mt-8">
        <Workspace tool={tool} />
      </div>
    </div>
  );
}