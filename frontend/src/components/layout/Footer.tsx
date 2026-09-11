import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { CATEGORIES } from '../../lib/tools';

export function Footer() {
  return (
    <footer className="border-t border-surface-line bg-surface dark:border-surface-line-dark dark:bg-surface-dark">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Every PDF tool you need in one place. Fast, free and private — files never leave your machine beyond a single
              processing request and are deleted immediately after.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Categories</h3>
            <ul className="mt-4 space-y-2.5">
              {CATEGORIES.slice(0, 5).map((category) => (
                <li key={category.key}>
                  <Link to={`/#tools?category=${category.key}`} className="text-sm text-zinc-500 transition-colors hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-300">
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Product</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/about" className="text-sm text-zinc-500 transition-colors hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-300">
                  About MyPDFTools
                </Link>
              </li>
              <li>
                <a href="#tools" onClick={(event) => event.preventDefault()} className="text-sm text-zinc-500 transition-colors hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-300">
                  API documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-surface-line pt-6 text-xs text-zinc-400 sm:flex-row dark:border-surface-line-dark dark:text-zinc-500">
          <p>© {new Date().getFullYear()} MyPDFTools. All rights reserved.</p>
          <p>Built with FastAPI, React and Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}