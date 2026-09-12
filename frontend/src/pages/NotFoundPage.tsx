import { FileQuestion } from 'lucide-react';
import { ButtonLink } from '../components/ui/Button';
import { POPULAR_TOOLS } from '../lib/tools';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
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
    </div>
  );
}
