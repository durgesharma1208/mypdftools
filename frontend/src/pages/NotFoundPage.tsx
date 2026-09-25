<<<<<<< HEAD
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
=======
import { FileQuestion } from 'lucide-react';
import { ButtonLink } from '../components/ui/Button';
import { POPULAR_TOOLS } from '../lib/tools';
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
<<<<<<< HEAD
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-28 text-center sm:px-6">
      {/* Icon */}
      <div className="relative">
        <div className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-500/15" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <FileQuestion className="h-10 w-10" aria-hidden="true" />
        </span>
      </div>

      {/* 404 label */}
      <p className="mt-6 rounded-full border border-surface-line bg-surface-panel px-4 py-1.5 font-mono text-sm font-semibold text-zinc-400 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-500">
        404
      </p>

      {/* Heading */}
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-sm text-lg text-zinc-500 dark:text-zinc-400">
        The page you're looking for doesn't exist or has been moved.
      </p>

      {/* CTAs */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-gradient px-7 text-[15px] font-semibold text-white shadow-sm shadow-brand-500/25 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/30"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex h-12 items-center gap-2 rounded-xl border border-surface-line bg-surface px-7 text-[15px] font-semibold text-zinc-700 transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-300 dark:border-surface-line-dark dark:bg-surface-dark dark:text-zinc-200 dark:hover:border-brand-500/50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Go back
        </button>
      </div>

      {/* Hint */}
      <p className="mt-10 text-sm text-zinc-400 dark:text-zinc-500">
        Every PDF tool lives under{' '}
        <Link to="/" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
          the tools section
        </Link>
        .
      </p>
=======
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
      <span className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface-muted text-ink-subtle">
        <FileQuestion className="h-5 w-5" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-headline font-semibold text-ink">This page does not exist</h1>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-muted text-wrap-pretty">
        The address may be mistyped, or the page may have moved. Every tool lives in the library.
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <ButtonLink to="/tools" variant="primary">
          Browse all tools
        </ButtonLink>
        <ButtonLink to="/" variant="secondary">
          Back to home
        </ButtonLink>
      </div>

      <div className="mt-10 border-t border-line pt-6">
        <p className="eyebrow">Popular tools</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {POPULAR_TOOLS.map((tool) => (
            <li key={tool.slug}>
              <Link
                to={`/tools/${tool.slug}`}
                className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                <tool.icon className="h-3.5 w-3.5 text-ink-subtle" aria-hidden="true" />
                {tool.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
    </div>
  );
}
