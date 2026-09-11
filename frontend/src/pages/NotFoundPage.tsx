import { FileQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
        <FileQuestion className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">Page not found</h1>
      <p className="mt-3 max-w-md text-zinc-500 dark:text-zinc-400">
        The page you are looking for does not exist or has moved. Every PDF tool lives under “Tools”.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex h-12 items-center rounded-xl bg-brand-gradient px-6 text-[15px] font-semibold text-white shadow-sm shadow-brand-500/25 transition-all hover:shadow-lg hover:shadow-brand-500/30 hover:brightness-110"
      >
        Back to all tools
      </Link>
    </div>
  );
}